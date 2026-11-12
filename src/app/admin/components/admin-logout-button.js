
"use client";

import { useState } from "react";
import { LogOut, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

export default function AdminLogoutButton() {
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) return;

    try {
      setLoggingOut(true);

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to log out.");
      }

      window.location.replace("/login");
    } catch (error) {
      toast.error(error.message || "Unable to log out. Please try again.");
      setLoggingOut(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loggingOut}
      className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loggingOut ? (
        <LoaderCircle size={17} className="animate-spin" />
      ) : (
        <LogOut size={17} />
      )}

      <span>{loggingOut ? "Logging out..." : "Logout"}</span>
    </button>
  );
}
