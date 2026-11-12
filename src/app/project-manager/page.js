
import { requireRole } from "@/lib/auth/guards";
import ProjectManagerDashboard from "./components/project-manager-dashboard";

export default async function ProjectManagerPage() {
  await requireRole(["Project Manager"]);

  return <ProjectManagerDashboard />;
}
