
import { requireRole } from "@/lib/auth/guards";
import EmployeeDashboard from "./components/employee-dashboard";

export default async function EmployeePage() {
  await requireRole(["Employee"]);

  return <EmployeeDashboard />;
}
