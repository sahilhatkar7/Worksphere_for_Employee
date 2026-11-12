
import { requireRole } from "@/lib/auth/guards";
import TesterDashboard from "./components/tester-dashboard";

export default async function TesterPage() {
  await requireRole(["Tester"]);

  return <TesterDashboard />;
}
