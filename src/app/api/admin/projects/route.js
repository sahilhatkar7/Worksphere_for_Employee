
import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { projects, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/guards";

const projectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Project name must contain at least 3 characters")
    .max(150),
  description: z.string().trim().max(1000).optional().nullable(),
  status: z
    .enum(["planning", "active", "on_hold", "completed", "cancelled"])
    .optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid start date")
    .optional()
    .nullable(),
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
    console.log("Admin access check:", response ? "Failed" : "Passed");

    if (response) return response;

    console.log("Fetching projects from database...");
    const allProjects = await db
      .select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        status: projects.status,
        startDate: projects.startDate,
        dueDate: projects.dueDate,
        createdBy: projects.createdBy,
        createdByName: users.fullName,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
      })
      .from(projects)
      .leftJoin(users, eq(projects.createdBy, users.id))
      .orderBy(desc(projects.createdAt));
      console.log("Projects fetched:", allProjects.length);

    return NextResponse.json({
      success: true,
      projects: allProjects,
    });
  } catch (error) {
    console.error("GET projects error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to fetch projects." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { admin, response } = await checkAdminAccess();

    if (response) return response;

    const body = await request.json();
    const validation = projectSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            validation.error.issues[0]?.message ||
            "Invalid project details.",
        },
        { status: 400 }
      );
    }

    const {
      name,
      description,
      status,
      startDate,
      dueDate,
    } = validation.data;

    if (startDate && dueDate && dueDate < startDate) {
      return NextResponse.json(
        {
          success: false,
          message: "Due date cannot be earlier than the start date.",
        },
        { status: 400 }
      );
    }

    const [newProject] = await db
      .insert(projects)
      .values({
        name,
        description: description || null,
        status: status || "planning",
        startDate: startDate || null,
        dueDate: dueDate || null,
        createdBy: admin.id,
      })
      .returning({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        status: projects.status,
        startDate: projects.startDate,
        dueDate: projects.dueDate,
        createdBy: projects.createdBy,
        createdAt: projects.createdAt,
      });

    return NextResponse.json(
      {
        success: true,
        message: "Project created successfully.",
        project: newProject,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST project error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to create project." },
      { status: 500 }
    );
  }
}
