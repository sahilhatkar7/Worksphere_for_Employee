
import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { chatMessages, users, roles } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/guards";

const messageSchema = z.object({
  message: z.string().trim().min(1).max(2000),
});

// Check whether the user can access Global Chat.
async function authorizeChat() {
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
    String(user.approvalStatus).toLowerCase() !== "approved" ||
    !user.isActive
  ) {
    return {
      error: NextResponse.json(
        { success: false, message: "You are not authorized to use chat." },
        { status: 403 }
      ),
    };
  }

  return { user };
}

// GET: Fetch the latest 50 chat messages.
export async function GET() {
  try {
    const { user, error } = await authorizeChat();

    if (error) return error;

    const messages = await db
      .select({
        id: chatMessages.id,
        senderId: chatMessages.senderId,
        message: chatMessages.message,
        createdAt: chatMessages.createdAt,
        senderName: users.fullName,
        senderRole: roles.name,
      })
      .from(chatMessages)
      .innerJoin(users, eq(chatMessages.senderId, users.id))
      .innerJoin(roles, eq(users.roleId, roles.id))
      .orderBy(desc(chatMessages.createdAt), desc(chatMessages.id))
      .limit(50);

    return NextResponse.json({
      success: true,
      currentUserId: user.id,
      messages: messages.reverse(),
    });
  } catch (error) {
    console.error("GET /api/chat/messages error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch chat messages." },
      { status: 500 }
    );
  }
}

// POST: Send a new chat message.
export async function POST(request) {
  try {
    const { user, error } = await authorizeChat();

    if (error) return error;

    const body = await request.json();
    const validation = messageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Message must contain between 1 and 2000 characters.",
        },
        { status: 400 }
      );
    }

    const [newMessage] = await db
      .insert(chatMessages)
      .values({
        senderId: user.id,
        message: validation.data.message,
      })
      .returning({
        id: chatMessages.id,
      });

    const [savedMessage] = await db
      .select({
        id: chatMessages.id,
        senderId: chatMessages.senderId,
        message: chatMessages.message,
        createdAt: chatMessages.createdAt,
        senderName: users.fullName,
        senderRole: roles.name,
      })
      .from(chatMessages)
      .innerJoin(users, eq(chatMessages.senderId, users.id))
      .innerJoin(roles, eq(users.roleId, roles.id))
      .where(eq(chatMessages.id, newMessage.id));

    return NextResponse.json(
      {
        success: true,
        message: "Message sent successfully.",
        data: savedMessage,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/chat/messages error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to send message." },
      { status: 500 }
    );
  }
}
