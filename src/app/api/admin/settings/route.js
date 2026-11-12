
import { NextResponse } from "next/server";
import { eq, and, ne } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/guards";
import {
  hashPassword,
  verifyPassword,
} from "@/lib/auth/password";

const profileSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(3, "Name must contain at least 3 characters.")
      .max(100, "Name cannot exceed 100 characters."),

    email: z
      .string()
      .trim()
      .email("Enter a valid email address.")
      .max(255, "Email is too long."),

    currentPassword: z
      .string()
      .min(1, "Current password is required.")
      .max(128, "Invalid current password."),

    newPassword: z
      .string()
      .max(128, "Password cannot exceed 128 characters.")
      .refine(
        (value) => value === "" || value.length >= 8,
        "New password must contain at least 8 characters."
      ),

    confirmPassword: z.string(),
  })
  .refine(
    (data) =>
      data.newPassword === "" ||
      data.newPassword === data.confirmPassword,
    {
      message: "New passwords do not match.",
      path: ["confirmPassword"],
    }
  );

async function authorizeAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      error: NextResponse.json(
        { success: false, message: "Please log in first." },
        { status: 401 }
      ),
    };
  }

  if (
    user.roleName !== "Admin" ||
    user.approvalStatus !== "approved" ||
    !user.isActive
  ) {
    return {
      error: NextResponse.json(
        { success: false, message: "Admin access required." },
        { status: 403 }
      ),
    };
  }

  return { user };
}

// GET: Fetch Admin profile.
export async function GET() {
  try {
    const { user, error } = await authorizeAdmin();

    if (error) return error;

    return NextResponse.json({
      success: true,
      profile: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        roleName: user.roleName,
      },
    });
  } catch (error) {
    console.error("Admin settings GET error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load profile." },
      { status: 500 }
    );
  }
}

// PATCH: Update Admin profile and password.
export async function PATCH(request) {
  try {
    const { user, error } = await authorizeAdmin();

    if (error) return error;

    const body = await request.json();
    const validation = profileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Please check your profile details.",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      fullName,
      email,
      currentPassword,
      newPassword,
    } = validation.data;

    const normalizedEmail = email.toLowerCase();

    // Fetch the current password hash.
    const existingUsers = await db
      .select({
        passwordHash: users.passwordHash,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    const existingUser = existingUsers[0];

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "Admin account not found." },
        { status: 404 }
      );
    }

    // Verify current password.
    const passwordIsValid = await verifyPassword(
      existingUser.passwordHash,
      currentPassword
    );

    if (!passwordIsValid) {
      return NextResponse.json(
        { success: false, message: "Current password is incorrect." },
        { status: 401 }
      );
    }

    // Check whether another account uses this email.
    const duplicateEmail = await db
      .select({ id: users.id })
      .from(users)
      .where(
        and(
          eq(users.email, normalizedEmail),
          ne(users.id, user.id)
        )
      )
      .limit(1);

    if (duplicateEmail.length > 0) {
      return NextResponse.json(
        { success: false, message: "This email is already registered." },
        { status: 409 }
      );
    }

    const updateData = {
      fullName,
      email: normalizedEmail,
      updatedAt: new Date(),
    };

    // Hash the new password when provided.
    if (newPassword) {
      updateData.passwordHash = await hashPassword(newPassword);
    }

    const updatedUsers = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, user.id))
      .returning({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
      });

    return NextResponse.json({
      success: true,
      message: "Admin profile updated successfully.",
      profile: updatedUsers[0],
    });
  } catch (error) {
    console.error("Admin settings PATCH error:", error);

    if (error.code === "23505") {
      return NextResponse.json(
        { success: false, message: "This email is already registered." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Unable to update Admin profile." },
      { status: 500 }
    );
  }
}
