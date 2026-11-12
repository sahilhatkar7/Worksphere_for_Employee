
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/guards";
import GlobalChat from "./components/global-chat";

export default async function ChatPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (
    String(user.approvalStatus).toLowerCase() !== "approved" ||
    !user.isActive
  ) {
    redirect("/login");
  }

  return <GlobalChat currentUser={user} />;
}
