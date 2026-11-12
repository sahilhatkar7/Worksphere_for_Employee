
import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";

import { db } from "@/db";
import { tasks, projects } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/guards";

export async function GET() {
  try {
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

    if (currentUser.roleName?.trim().toLowerCase() !== "tester") {
      return NextResponse.json(
        {
          success: false,
          message: "You are not authorized to access this dashboard.",
        },
        { status: 403 }
      );
    }

    const testerTasks = await db
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
      totalTasks: testerTasks.length,
      todo: testerTasks.filter(
        (task) => task.status === "todo"
      ).length,
      inProgress: testerTasks.filter(
        (task) => task.status === "in_progress"
      ).length,
      inReview: testerTasks.filter(
        (task) => task.status === "in_review"
      ).length,
      completed: testerTasks.filter(
        (task) => task.status === "completed"
      ).length,
    };

    return NextResponse.json(
      {
        success: true,
        user: {
          id: currentUser.id,
          fullName: currentUser.fullName,
          email: currentUser.email,
          roleName: currentUser.roleName,
        },
        stats,
        tasks: testerTasks,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Tester dashboard API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load Tester dashboard.",
      },
      { status: 500 }
    );
  }
}
