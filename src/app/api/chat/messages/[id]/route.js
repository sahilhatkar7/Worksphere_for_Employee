
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { chatMessages } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/guards";

export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Please log in first." },
        { status: 401 }
      );
    }

    if (
      String(user.approvalStatus).toLowerCase() !== "approved" ||
      !user.isActive
    ) {
      return NextResponse.json(
        { success: false, message: "You are not authorized." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const messageId = Number(id);

    if (!Number.isInteger(messageId) || messageId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid message ID." },
        { status: 400 }
      );
    }

    const deletedMessage = await db
      .delete(chatMessages)
      .where(
        and(
          eq(chatMessages.id, messageId),
          eq(chatMessages.senderId, user.id)
        )
      )
      .returning({ id: chatMessages.id });

    if (deletedMessage.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Message not found or you cannot delete this message.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Message deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE /api/chat/messages error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete message." },
      { status: 500 }
    );
  }
}
