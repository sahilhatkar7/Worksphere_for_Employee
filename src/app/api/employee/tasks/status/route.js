
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { tasks } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/guards";

const statusSchema = z.object({
  taskId: z.number().int().positive(),
  status: z.enum(["in_progress", "in_review", "completed"]),
});

const allowedTransitions = {
  todo: ["in_progress"],
  in_progress: ["in_review"],
  in_review: ["completed"],
  completed: [],
};

export async function PATCH(request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    if (currentUser.roleName?.trim().toLowerCase() !== "employee") {
      return NextResponse.json(
        { success: false, message: "Access denied." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = statusSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid task information.",
          errors: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { taskId, status } = validation.data;

    const [existingTask] = await db
      .select({
        id: tasks.id,
        status: tasks.status,
      })
      .from(tasks)
      .where(
        and(
          eq(tasks.id, taskId),
          eq(tasks.assignedTo, currentUser.id)
        )
      )
      .limit(1);

    if (!existingTask) {
      return NextResponse.json(
        {
          success: false,
          message: "Task not found or not assigned to you.",
        },
        { status: 404 }
      );
    }

    const nextStatuses = allowedTransitions[existingTask.status] || [];

    if (!nextStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: `You cannot change the task from ${existingTask.status} to ${status}.`,
        },
        { status: 400 }
      );
    }

    const [updatedTask] = await db
      .update(tasks)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(tasks.id, taskId),
          eq(tasks.assignedTo, currentUser.id)
        )
      )
      .returning({
        id: tasks.id,
        title: tasks.title,
        status: tasks.status,
        updatedAt: tasks.updatedAt,
      });

    return NextResponse.json({
      success: true,
      message: "Task status updated successfully.",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Employee Task Status Update Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update task status.",
      },
      { status: 500 }
    );
  }
}
