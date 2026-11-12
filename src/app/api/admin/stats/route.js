
import { NextResponse } from "next/server";
import { eq, and, ne, count } from "drizzle-orm";

import { db } from "@/db";
import { users, roles, projects, tasks } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/guards";

export async function GET() {
  try {
    // Check Admin authentication
    const admin = await getCurrentUser();

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    if (admin.roleName !== "Admin") {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    // Count approved and active employees (excluding Admin)
    const [employeeResult] = await db
      .select({ total: count() })
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
      .where(
        and(
          eq(users.approvalStatus, "approved"),
          eq(users.isActive, true),
          ne(roles.name, "Admin")
        )
      );

    // Count registrations awaiting approval
    const [approvalResult] = await db
      .select({ total: count() })
      .from(users)
      .where(eq(users.approvalStatus, "pending"));

    // Count active projects
    const [projectResult] = await db
      .select({ total: count() })
      .from(projects)
      .where(eq(projects.status, "active"));

    // Count all tasks
    const [taskResult] = await db
      .select({ total: count() })
      .from(tasks);

    return NextResponse.json({
      success: true,
      stats: {
        totalEmployees: employeeResult.total,
        pendingApprovals: approvalResult.total,
        activeProjects: projectResult.total,
        totalTasks: taskResult.total,
      },
    });
  } catch (error) {
    console.error("Admin dashboard stats error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch dashboard statistics",
      },
      { status: 500 }
    );
  }
}
