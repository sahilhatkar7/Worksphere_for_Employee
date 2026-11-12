
import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

import { db } from "@/db";
import { users, roles, notifications } from "@/db/schema";
import { hashPassword } from "@/lib/auth/password";
import { registerSchema } from "@/lib/validations/auth";

// Roles that users are allowed to request publicly.
const ALLOWED_REQUESTED_ROLES = [
  "Developer",
  "Designer",
  "Tester",
  "Project Manager",
  "HR Manager",
];

export async function POST(request) {
  try {
    const body = await request.json();

    // Validate registration data.
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Please check your registration details.",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { fullName, email, password, requestedRoleId } =
      validation.data;

    const normalizedEmail = email.toLowerCase();

    // Check whether the email is already registered.
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    // Verify the requested role.
    const requestedRole = await db
      .select()
      .from(roles)
      .where(eq(roles.id, requestedRoleId))
      .limit(1);

    if (
      requestedRole.length === 0 ||
      !ALLOWED_REQUESTED_ROLES.includes(requestedRole[0].name)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please select a valid registration role.",
        },
        { status: 400 }
      );
    }

    // Find the internal Employee role.
    const employeeRole = await db
      .select({ id: roles.id })
      .from(roles)
      .where(eq(roles.name, "Employee"))
      .limit(1);

    if (employeeRole.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Default Employee role is not configured.",
        },
        { status: 500 }
      );
    }

    // Securely hash the password.
    const passwordHash = await hashPassword(password);

    // Create the pending user and notify Admin accounts.
    await db.transaction(async (tx) => {
      const [newUser] = await tx
        .insert(users)
        .values({
          fullName,
          email: normalizedEmail,
          passwordHash,
          roleId: employeeRole[0].id,
          requestedRoleId,
          approvalStatus: "pending",
          isActive: true,
        })
        .returning({ id: users.id });

      // Find all active and approved Admin accounts.
      const adminAccounts = await tx
        .select({ id: users.id })
        .from(users)
        .innerJoin(roles, eq(users.roleId, roles.id))
        .where(
          and(
            eq(roles.name, "Admin"),
            eq(users.approvalStatus, "approved"),
            eq(users.isActive, true)
          )
        );

      // Create a notification for each Admin.
      if (adminAccounts.length > 0) {
        await tx.insert(notifications).values(
          adminAccounts.map((admin) => ({
            userId: admin.id,
            type: "registration",
            title: "New Registration Request",
            message: `${fullName} has registered and is waiting for Admin approval.`,
            link: "/admin",
          }))
        );
      }

      return newUser;
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Registration successful. Your account is waiting for Admin approval.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    // Handle duplicate email in case of simultaneous registrations.
    if (error.code === "23505") {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong during registration.",
      },
      { status: 500 }
    );
  }
}
