
import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { tasks, projects } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/guards";

export async function GET() {
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

    const assignedTasks = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        projectId: tasks.projectId,
        projectName: projects.name,
        status: tasks.status,
        priority: tasks.priority,
        dueDate: tasks.dueDate,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
      })
      .from(tasks)
      .innerJoin(projects, eq(tasks.projectId, projects.id))
      .where(eq(tasks.assignedTo, currentUser.id))
      .orderBy(desc(tasks.createdAt));

    const stats = {
      totalTasks: assignedTasks.length,
      todo: assignedTasks.filter(
        (task) => task.status === "todo"
      ).length,
      inProgress: assignedTasks.filter(
        (task) => task.status === "in_progress"
      ).length,
      inReview: assignedTasks.filter(
        (task) => task.status === "in_review"
      ).length,
      completed: assignedTasks.filter(
        (task) => task.status === "completed"
      ).length,
    };

    return NextResponse.json({
      success: true,
      user: {
        id: currentUser.id,
        fullName: currentUser.fullName,
        email: currentUser.email,
        roleName: currentUser.roleName,
      },
      stats,
      tasks: assignedTasks,
    });
  } catch (error) {
    console.error("Employee Dashboard Error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load employee dashboard." },
      { status: 500 }
    );
  }
}
