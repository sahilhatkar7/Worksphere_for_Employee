
import { NextResponse } from "next/server";
import { asc, inArray } from "drizzle-orm";

import { db } from "@/db";
import { roles } from "@/db/schema";

const ALLOWED_ROLES = [
  "Developer",
  "Designer",
  "Tester",
  "Project Manager",
  "HR Manager",
];

export async function GET() {
  try {
    const availableRoles = await db
      .select({
        id: roles.id,
        name: roles.name,
        description: roles.description,
      })
      .from(roles)
      .where(inArray(roles.name, ALLOWED_ROLES))
      .orderBy(asc(roles.name));

    return NextResponse.json(
      {
        success: true,
        roles: availableRoles,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Registration roles error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve registration roles.",
      },
      { status: 500 }
    );
  }
}
