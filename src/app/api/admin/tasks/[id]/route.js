
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { tasks, projects, users, roles } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/guards";

const taskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Task title must contain at least 3 characters")
    .max(150),
  description: z.string().trim().max(1000).optional().nullable(),
  projectId: z.number().int().positive(),
  assignedTo: z.number().int().positive(),
  status: z.enum(["todo", "in_progress", "in_review", "completed"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid due date")
    .optional()
    .nullable(),
});

async function checkAdminAccess() {
  const admin = await getCurrentUser();

  if (!admin) {
    return {
      response: NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      ),
    };
  }

  if (admin.roleName !== "Admin") {
    return {
      response: NextResponse.json(
        { success: false, message: "Admin access required." },
        { status: 403 }
      ),
    };
  }

  return { response: null };
}

function validateId(id) {
  const parsedId = Number(id);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    return null;
  }

  return parsedId;
}

export async function PATCH(request, { params }) {
  try {
    const { response } = await checkAdminAccess();

    if (response) return response;

    const { id } = await params;
    const taskId = validateId(id);

    if (!taskId) {
      return NextResponse.json(
        { success: false, message: "Invalid task ID." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = taskSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            validation.error.issues[0]?.message || "Invalid task details.",
        },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      projectId,
      assignedTo,
      status,
      priority,
      dueDate,
    } = validation.data;

    const [project] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!project) {
      return NextResponse.json(
        { success: false, message: "Selected project does not exist." },
        { status: 404 }
      );
    }

    const [employee] = await db
      .select({
        id: users.id,
        roleName: roles.name,
      })
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
      .where(
        and(
          eq(users.id, assignedTo),
          eq(users.approvalStatus, "approved"),
          eq(users.isActive, true)
        )
      )
      .limit(1);

    if (!employee || employee.roleName === "Admin") {
      return NextResponse.json(
        { success: false, message: "Selected employee is unavailable." },
        { status: 400 }
      );
    }

    const [updatedTask] = await db
      .update(tasks)
      .set({
        title,
        description: description || null,
        projectId,
        assignedTo,
        status,
        priority,
        dueDate: dueDate || null,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, taskId))
      .returning();

    if (!updatedTask) {
      return NextResponse.json(
        { success: false, message: "Task not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Task updated successfully.",
      task: updatedTask,
    });
  } catch (error) {
    console.error("PATCH task error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to update task." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { response } = await checkAdminAccess();

    if (response) return response;

    const { id } = await params;
    const taskId = validateId(id);

    if (!taskId) {
      return NextResponse.json(
        { success: false, message: "Invalid task ID." },
        { status: 400 }
      );
    }

    const [deletedTask] = await db
      .delete(tasks)
      .where(eq(tasks.id, taskId))
      .returning({
        id: tasks.id,
        title: tasks.title,
      });

    if (!deletedTask) {
      return NextResponse.json(
        { success: false, message: "Task not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Task deleted successfully.",
      task: deletedTask,
    });
  } catch (error) {
    console.error("DELETE task error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to delete task." },
      { status: 500 }
    );
  }
}
