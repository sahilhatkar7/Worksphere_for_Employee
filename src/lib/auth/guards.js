
import "server-only";

import { redirect } from "next/navigation";
import { getSession } from "./session";

// Get the currently logged-in user.
export async function getCurrentUser() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  return {
    id: session.userId,
    fullName: session.fullName,
    email: session.email,
    roleId: session.roleId,
    roleName: session.roleName,
    approvalStatus: session.approvalStatus,
    isActive: session.isActive,
  };
}

// Require a logged-in user.
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

// Require a specific role.
export async function requireRole(allowedRoles) {
  const user = await requireAuth();

  if (!allowedRoles.includes(user.roleName)) {
    const roleRoutes = {
      Admin: "/admin",
      Developer: "/developer",
      Designer: "/designer",
      Tester: "/tester",
      "Project Manager": "/project-manager",
      "HR Manager": "/hr",
      Employee: "/dashboard",
    };

    redirect(roleRoutes[user.roleName] || "/dashboard");
  }

  return user;
}
