
import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { tasks, projects, users, roles } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/guards";

const taskSchema = z.object({
  title: z.string().trim().min(3, "Task title must contain at least 3 characters").max(150),
  description: z.string().trim().max(1000).optional().nullable(),
  projectId: z.number().int().positive("Please select a valid project"),
  assignedTo: z.number().int().positive("Please select an employee"),
  status: z.enum(["todo", "in_progress", "in_review", "completed"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid due date").optional().nullable(),
});

async function checkAdminAccess() {
  const admin = await getCurrentUser();

  if (!admin) {
    return {
      admin: null,
      response: NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      ),
    };
  }

  if (admin.roleName !== "Admin") {
    return {
      admin: null,
      response: NextResponse.json(
        { success: false, message: "Admin access required." },
        { status: 403 }
      ),
    };
  }

  return { admin, response: null };
}

export async function GET() {
  try {
    const { response } = await checkAdminAccess();

    if (response) return response;

    const allTasks = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        projectId: tasks.projectId,
        projectName: projects.name,
        assignedTo: tasks.assignedTo,
        assignedToName: users.fullName,
        assignedToEmail: users.email,
        createdBy: tasks.createdBy,
        status: tasks.status,
        priority: tasks.priority,
        dueDate: tasks.dueDate,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
      })
      .from(tasks)
      .innerJoin(projects, eq(tasks.projectId, projects.id))
      .innerJoin(users, eq(tasks.assignedTo, users.id))
      .orderBy(desc(tasks.createdAt));

    return NextResponse.json({
      success: true,
      tasks: allTasks,
    });
  } catch (error) {
    console.error("GET tasks error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to fetch tasks." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { admin, response } = await checkAdminAccess();

    if (response) return response;

    const body = await request.json();
    const validation = taskSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: validation.error.issues[0]?.message || "Invalid task details.",
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

    const [newTask] = await db
      .insert(tasks)
      .values({
        title,
        description: description || null,
        projectId,
        assignedTo,
        createdBy: admin.id,
        status: status || "todo",
        priority: priority || "medium",
        dueDate: dueDate || null,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: "Task created successfully.",
        task: newTask,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST task error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to create task." },
      { status: 500 }
    );
  }
}
