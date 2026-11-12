
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { users, roles, notifications } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/guards";

const approveSchema = z.object({
  userId: z.number().int().positive(),
});

const allowedRoles = [
  "Developer",
  "Designer",
  "Tester",
  "Project Manager",
  "HR Manager",
];

export async function POST(request) {
  try {
    // Check Admin authentication.
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required.",
        },
        { status: 401 }
      );
    }

    // Only Admin can approve registrations.
    if (currentUser.roleName !== "Admin") {
      return NextResponse.json(
        {
          success: false,
          message: "You are not authorized to perform this action.",
        },
        { status: 403 }
      );
    }

    // Validate request body.
    const body = await request.json();
    const validation = approveSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user ID.",
        },
        { status: 400 }
      );
    }

    const { userId } = validation.data;

    const result = await db.transaction(async (tx) => {
      // Find the pending registration.
      const [pendingUser] = await tx
        .select({
          id: users.id,
          fullName: users.fullName,
          requestedRoleId: users.requestedRoleId,
        })
        .from(users)
        .where(
          and(
            eq(users.id, userId),
            eq(users.approvalStatus, "pending")
          )
        )
        .limit(1);

      if (!pendingUser || !pendingUser.requestedRoleId) {
        return { status: "not_found" };
      }

      // Verify that the requested role is allowed.
      const [requestedRole] = await tx
        .select({
          id: roles.id,
          name: roles.name,
        })
        .from(roles)
        .where(eq(roles.id, pendingUser.requestedRoleId))
        .limit(1);

      if (
        !requestedRole ||
        !allowedRoles.includes(requestedRole.name)
      ) {
        return { status: "invalid_role" };
      }

      // Assign the requested role and approve the account.
      const updatedUsers = await tx
        .update(users)
        .set({
          roleId: requestedRole.id,
          approvalStatus: "approved",
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(users.id, userId),
            eq(users.approvalStatus, "pending")
          )
        )
        .returning({
          id: users.id,
          fullName: users.fullName,
          email: users.email,
        });

      if (updatedUsers.length === 0) {
        return { status: "not_found" };
      }

      const approvedUser = updatedUsers[0];

      // Notify the approved user.
      await tx.insert(notifications).values({
        userId: approvedUser.id,
        type: "account_approved",
        title: "Account Approved",
        message: `Congratulations ${approvedUser.fullName}! Your WorkSphere account has been approved. You can now log in.`,
        link: "/dashboard",
      });

      return {
        status: "approved",
        user: approvedUser,
        roleName: requestedRole.name,
      };
    });

    if (result.status === "not_found") {
      return NextResponse.json(
        {
          success: false,
          message: "Pending registration request not found.",
        },
        { status: 404 }
      );
    }

    if (result.status === "invalid_role") {
      return NextResponse.json(
        {
          success: false,
          message: "The requested role is not valid.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Registration approved successfully.",
        user: {
          ...result.user,
          roleName: result.roleName,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Approve registration API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to approve registration.",
      },
      { status: 500 }
    );
  }
}
