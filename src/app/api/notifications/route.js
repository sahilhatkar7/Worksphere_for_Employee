
import { NextResponse } from "next/server";
import { and, desc, eq, count } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { notifications as notificationsTable } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/guards";

const markReadSchema = z
  .object({
    notificationId: z.number().int().positive().optional(),
    markAll: z.boolean().optional(),
  })
  .refine(
    (data) =>
      (data.notificationId !== undefined && data.markAll !== true) ||
      (data.notificationId === undefined && data.markAll === true),
    {
      message: "Provide either notificationId or markAll: true",
    }
  );

// GET: Fetch logged-in user's notifications
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const userNotifications = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.userId, user.id))
      .orderBy(desc(notificationsTable.createdAt))
      .limit(20);

    const [unreadResult] = await db
      .select({ total: count() })
      .from(notificationsTable)
      .where(
        and(
          eq(notificationsTable.userId, user.id),
          eq(notificationsTable.isRead, false)
        )
      );

    return NextResponse.json({
      success: true,
      notifications: userNotifications,
      unreadCount: unreadResult.total,
    });
  } catch (error) {
    console.error("Fetch notifications error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch notifications",
      },
      { status: 500 }
    );
  }
}

// PATCH: Mark one notification or all notifications as read
export async function PATCH(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = markReadSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request data",
          errors: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { notificationId, markAll } = validation.data;

    if (markAll) {
      const updated = await db
        .update(notificationsTable)
        .set({
          isRead: true,
          readAt: new Date(),
        })
        .where(
          and(
            eq(notificationsTable.userId, user.id),
            eq(notificationsTable.isRead, false)
          )
        )
        .returning({ id: notificationsTable.id });

      return NextResponse.json({
        success: true,
        message: "All notifications marked as read",
        updatedCount: updated.length,
      });
    }

    const [updated] = await db
      .update(notificationsTable)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(
        and(
          eq(notificationsTable.id, notificationId),
          eq(notificationsTable.userId, user.id)
        )
      )
      .returning({ id: notificationsTable.id });

    if (!updated) {
      return NextResponse.json(
        {
          success: false,
          message: "Notification not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Update notification error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update notification",
      },
      { status: 500 }
    );
  }
}
