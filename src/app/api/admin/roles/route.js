
import { NextResponse } from "next/server";
import { ne, asc } from "drizzle-orm";

import { db } from "@/db";
import { roles } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/guards";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    if (currentUser.roleName !== "Admin") {
      return NextResponse.json(
        { success: false, message: "Access denied. Admin only." },
        { status: 403 }
      );
    }

    const availableRoles = await db
      .select({
        id: roles.id,
        name: roles.name,
      })
      .from(roles)
      .where(ne(roles.name, "Admin"))
      .orderBy(asc(roles.name));

    return NextResponse.json({
      success: true,
      roles: availableRoles,
    });
  } catch (error) {
    console.error("Fetch roles error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to fetch roles." },
      { status: 500 }
    );
  }
}
