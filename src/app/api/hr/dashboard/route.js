
import { NextResponse } from "next/server";
import { and, count, desc, eq, ne } from "drizzle-orm";

import { db } from "@/db";
import { users, roles } from "@/db/schema";
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

    if (currentUser.roleName?.trim().toLowerCase() !== "hr manager") {
      return NextResponse.json(
        { success: false, message: "Access denied." },
        { status: 403 }
      );
    }

    const employeeConditions = ne(roles.name, "Admin");

    const [totalResult] = await db
      .select({ total: count() })
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
      .where(
        and(
          employeeConditions,
          eq(users.approvalStatus, "approved")
        )
      );

    const [activeResult] = await db
      .select({ total: count() })
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
      .where(
        and(
          employeeConditions,
          eq(users.approvalStatus, "approved"),
          eq(users.isActive, true)
        )
      );

    const [inactiveResult] = await db
      .select({ total: count() })
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
      .where(
        and(
          employeeConditions,
          eq(users.approvalStatus, "approved"),
          eq(users.isActive, false)
        )
      );

    const [pendingResult] = await db
      .select({ total: count() })
      .from(users)
      .where(eq(users.approvalStatus, "pending"));

    const employeeList = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        roleId: users.roleId,
        roleName: roles.name,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
      .where(
        and(
          employeeConditions,
          eq(users.approvalStatus, "approved")
        )
      )
      .orderBy(desc(users.createdAt));

    const roleCounts = await db
      .select({
        roleName: roles.name,
        total: count(),
      })
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
      .where(
        and(
          employeeConditions,
          eq(users.approvalStatus, "approved")
        )
      )
      .groupBy(roles.name)
      .orderBy(desc(count()));

    return NextResponse.json({
      success: true,
      user: {
        id: currentUser.id,
        fullName: currentUser.fullName,
        email: currentUser.email,
        roleName: currentUser.roleName,
      },
      stats: {
        totalEmployees: totalResult.total,
        activeEmployees: activeResult.total,
        inactiveEmployees: inactiveResult.total,
        pendingApprovals: pendingResult.total,
      },
      roleCounts,
      employees: employeeList,
    });
  } catch (error) {
    console.error("HR Dashboard Error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load HR dashboard." },
      { status: 500 }
    );
  }
}
