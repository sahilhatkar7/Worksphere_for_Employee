
import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { projects, tasks, users } from "@/db/schema";
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

    if (currentUser.roleName?.trim().toLowerCase() !== "project manager") {
      return NextResponse.json(
        { success: false, message: "Access denied." },
        { status: 403 }
      );
    }

    const allProjects = await db
      .select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        status: projects.status,
        startDate: projects.startDate,
        dueDate: projects.dueDate,
        createdAt: projects.createdAt,
        createdByName: users.fullName,
      })
      .from(projects)
      .leftJoin(users, eq(projects.createdBy, users.id))
      .orderBy(desc(projects.createdAt));

    const allTasks = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        projectId: tasks.projectId,
        projectName: projects.name,
        assignedTo: tasks.assignedTo,
        assignedToName: users.fullName,
        status: tasks.status,
        priority: tasks.priority,
        dueDate: tasks.dueDate,
        createdAt: tasks.createdAt,
      })
      .from(tasks)
      .innerJoin(projects, eq(tasks.projectId, projects.id))
      .innerJoin(users, eq(tasks.assignedTo, users.id))
      .orderBy(desc(tasks.createdAt));

    const stats = {
      totalProjects: allProjects.length,
      activeProjects: allProjects.filter(
        (project) => project.status === "active"
      ).length,
      completedProjects: allProjects.filter(
        (project) => project.status === "completed"
      ).length,
      onHoldProjects: allProjects.filter(
        (project) => project.status === "on_hold"
      ).length,
      totalTasks: allTasks.length,
      todo: allTasks.filter((task) => task.status === "todo").length,
      inProgress: allTasks.filter(
        (task) => task.status === "in_progress"
      ).length,
      inReview: allTasks.filter(
        (task) => task.status === "in_review"
      ).length,
      completedTasks: allTasks.filter(
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
      projects: allProjects,
      tasks: allTasks.slice(0, 20),
    });
  } catch (error) {
    console.error("Project Manager Dashboard Error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load dashboard data." },
      { status: 500 }
    );
  }
}
