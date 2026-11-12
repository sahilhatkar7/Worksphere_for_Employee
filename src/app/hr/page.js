
import { requireRole } from "@/lib/auth/guards";
import HRDashboard from "./components/hr-dashboard";

export default async function HRPage() {
  await requireRole(["HR Manager"]);

  return <HRDashboard />;
}
