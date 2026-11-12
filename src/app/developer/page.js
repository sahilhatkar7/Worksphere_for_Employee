
import { requireRole } from "@/lib/auth/guards";
import DeveloperDashboard from "./components/developer-dashboard";

export default async function DeveloperPage() {
  await requireRole(["Developer"]);

  return <DeveloperDashboard />;
}
