
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { users, notifications } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/guards";

const rejectSchema = z.object({
  userId: z.number().int().positive(),
});

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

    // Only Admin can reject registrations.
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
    const validation = rejectSchema.safeParse(body);

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

    // Reject the registration and create notification together.
    const result = await db.transaction(async (tx) => {
      const rejectedUsers = await tx
        .update(users)
        .set({
          approvalStatus: "rejected",
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

      if (rejectedUsers.length === 0) {
        return null;
      }

      const rejectedUser = rejectedUsers[0];

      // Notify the rejected applicant.
      await tx.insert(notifications).values({
        userId: rejectedUser.id,
        type: "account_rejected",
        title: "Registration Update",
        message: `Hello ${rejectedUser.fullName}, your WorkSphere registration request was not approved. Please contact your administrator if you need more information.`,
        link: "/login",
      });

      return rejectedUser;
    });

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          message: "Pending registration request not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Registration rejected successfully.",
        user: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reject registration API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to reject registration.",
      },
      { status: 500 }
    );
  }
}
