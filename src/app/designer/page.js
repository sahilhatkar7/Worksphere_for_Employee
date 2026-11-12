
import { requireRole } from "@/lib/auth/guards";
import DesignerDashboard from "./components/designer-dashboard";

export default async function DesignerPage() {
  await requireRole(["Designer"]);

  return <DesignerDashboard />;
}
