
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validations/auth";

export async function POST(request) {
  try {
    const body = await request.json();

    // Validate login details.
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter valid login details.",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    const normalizedEmail = email.toLowerCase();

    // Find the user by email.
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    const user = result[0];

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    // Verify the password.
    const passwordIsValid = await verifyPassword(
      user.passwordHash,
      password
    );

    if (!passwordIsValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    // Prevent inactive accounts from logging in.
    if (!user.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "Your account is inactive. Contact Admin.",
        },
        { status: 403 }
      );
    }

    // Prevent pending accounts from logging in.
    if (user.approvalStatus !== "approved") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your account is waiting for Admin approval.",
        },
        { status: 403 }
      );
    }

    // Create a secure session.
    await createSession(user.id);

    return NextResponse.json(
      {
        success: true,
        message: "Login successful.",
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong during login.",
      },
      { status: 500 }
    );
  }
}
