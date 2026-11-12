
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { users, roles, sessions } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/guards";

const statusSchema = z.object({
  userId: z.number().int().positive(),
  isActive: z.boolean(),
});

export async function PATCH(request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    if (currentUser.roleName !== "Admin") {
      return NextResponse.json(
        { success: false, message: "Access denied. Admin only." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = statusSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: "Invalid status information." },
        { status: 400 }
      );
    }

    const { userId, isActive } = validation.data;

    const employee = await db
      .select({
        id: users.id,
        roleName: roles.name,
        approvalStatus: users.approvalStatus,
      })
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
      .where(eq(users.id, userId))
      .limit(1);

    if (
      employee.length === 0 ||
      employee[0].roleName === "Admin" ||
      employee[0].approvalStatus !== "approved"
    ) {
      return NextResponse.json(
        { success: false, message: "Employee not found." },
        { status: 404 }
      );
    }

    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({
          isActive,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      if (!isActive) {
        await tx
          .delete(sessions)
          .where(eq(sessions.userId, userId));
      }
    });

    return NextResponse.json({
      success: true,
      message: isActive
        ? "Employee account activated successfully."
        : "Employee account deactivated successfully.",
    });
  } catch (error) {
    console.error("Update employee status error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update employee status.",
      },
      { status: 500 }
    );
  }
}
