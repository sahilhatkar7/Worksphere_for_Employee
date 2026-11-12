
import { NextResponse } from "next/server";
import { and, desc, eq, ne } from "drizzle-orm";

import { db } from "@/db";
import { users, roles } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/guards";
import { z } from "zod";

export async function GET() {
  try {
    // Check Admin authentication
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    if (currentUser.roleName !== "Admin") {
      return NextResponse.json(
        { success: false, message: "Access denied. Admin only." },
        { status: 403 }
      );
    }

    // Fetch all approved employees except Admin accounts
    const employeeList = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        roleId: users.roleId,
        roleName: roles.name,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
      .where(
        and(
          eq(users.approvalStatus, "approved"),
          ne(roles.name, "Admin")
        )
      )
      .orderBy(desc(users.createdAt));

    return NextResponse.json({
      success: true,
      count: employeeList.length,
      employees: employeeList,
    });
  } catch (error) {
    console.error("Fetch employees error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch employees.",
      },
      { status: 500 }
    );
  }
}

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

    const schema = z.object({
      userId: z.number().int().positive(),
      fullName: z.string().trim().min(3).max(100),
      email: z.string().trim().email().max(255),
      roleId: z.number().int().positive(),
    });

    const body = await request.json();
    const validation = schema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid employee information.",
          errors: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { userId, fullName, email, roleId } = validation.data;

    // Check whether the employee exists
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

    // Check that the selected role exists and is not Admin
    const selectedRole = await db
      .select()
      .from(roles)
      .where(eq(roles.id, roleId))
      .limit(1);

    if (
      selectedRole.length === 0 ||
      selectedRole[0].name === "Admin"
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid employee role." },
        { status: 400 }
      );
    }

    // Check duplicate email
    const existingEmail = await db
      .select({ id: users.id })
      .from(users)
      .where(
        and(
          eq(users.email, email),
          ne(users.id, userId)
        )
      )
      .limit(1);

    if (existingEmail.length > 0) {
      return NextResponse.json(
        { success: false, message: "Email already exists." },
        { status: 409 }
      );
    }

    // Update employee
    await db
      .update(users)
      .set({
        fullName,
        email,
        roleId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return NextResponse.json({
      success: true,
      message: "Employee updated successfully.",
    });
  } catch (error) {
    console.error("Update employee error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update employee.",
      },
      { status: 500 }
    );
  }
}

