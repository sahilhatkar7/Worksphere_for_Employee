
import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { db } from "@/db";
import { users, roles } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/guards";

// GET: Retrieve all pending registration requests.
export async function GET() {
  try {
    // Check whether the user is logged in.
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

    // Only Admin can access pending approvals.
    if (currentUser.roleName !== "Admin") {
      return NextResponse.json(
        {
          success: false,
          message: "You are not authorized to access this resource.",
        },
        { status: 403 }
      );
    }

    // Create an alias because we need to join the roles table
    // using requestedRoleId.
    const requestedRoles = alias(roles, "requested_roles");

    // Fetch pending users and their requested roles.
    const pendingUsers = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        requestedRoleId: users.requestedRoleId,
        requestedRoleName: requestedRoles.name,
        approvalStatus: users.approvalStatus,
        createdAt: users.createdAt,
      })
      .from(users)
      .leftJoin(
        requestedRoles,
        eq(users.requestedRoleId, requestedRoles.id)
      )
      .where(eq(users.approvalStatus, "pending"))
      .orderBy(desc(users.createdAt));

    return NextResponse.json(
      {
        success: true,
        count: pendingUsers.length,
        users: pendingUsers,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Pending approvals API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve pending approvals.",
      },
      { status: 500 }
    );
  }
}
