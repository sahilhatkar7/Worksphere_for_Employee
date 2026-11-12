
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { projects } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/guards";

const projectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Project name must contain at least 3 characters")
    .max(150),
  description: z.string().trim().max(1000).optional().nullable(),
  status: z.enum([
    "planning",
    "active",
    "on_hold",
    "completed",
    "cancelled",
  ]),
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

function validateId(id) {
  const parsedId = Number(id);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    return null;
  }

  return parsedId;
}

export async function PATCH(request, { params }) {
  try {
    const { response } = await checkAdminAccess();

    if (response) return response;

    const { id } = await params;
    const projectId = validateId(id);

    if (!projectId) {
      return NextResponse.json(
        { success: false, message: "Invalid project ID." },
        { status: 400 }
      );
    }

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

    const [updatedProject] = await db
      .update(projects)
      .set({
        name,
        description: description || null,
        status,
        startDate: startDate || null,
        dueDate: dueDate || null,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId))
      .returning();

    if (!updatedProject) {
      return NextResponse.json(
        { success: false, message: "Project not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Project updated successfully.",
      project: updatedProject,
    });
  } catch (error) {
    console.error("PATCH project error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to update project." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { response } = await checkAdminAccess();

    if (response) return response;

    const { id } = await params;
    const projectId = validateId(id);

    if (!projectId) {
      return NextResponse.json(
        { success: false, message: "Invalid project ID." },
        { status: 400 }
      );
    }

    const [deletedProject] = await db
      .delete(projects)
      .where(eq(projects.id, projectId))
      .returning({
        id: projects.id,
        name: projects.name,
      });

    if (!deletedProject) {
      return NextResponse.json(
        { success: false, message: "Project not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully.",
      project: deletedProject,
    });
  } catch (error) {
    console.error("DELETE project error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to delete project." },
      { status: 500 }
    );
  }
}
