
"use client";

import { useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  FolderKanban,
  ClipboardList,
  Loader2,
} from "lucide-react";

const initialStats = {
  totalEmployees: 0,
  pendingApprovals: 0,
  activeProjects: 0,
  totalTasks: 0,
};

export default function DashboardStats() {
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadStats() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/admin/stats", {
          cache: "no-store",
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load dashboard statistics"
          );
        }

        setStats(data.stats);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Something went wrong");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadStats();

    return () => controller.abort();
  }, []);

  const cards = [
    {
      title: "Total Employees",
      value: stats.totalEmployees,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Pending Approvals",
      value: stats.pendingApprovals,
      icon: UserCheck,
      color: "bg-amber-100 text-amber-600",
    },
    {
      title: "Active Projects",
      value: stats.activeProjects,
      icon: FolderKanban,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Total Tasks",
      value: stats.totalTasks,
      icon: ClipboardList,
      color: "bg-emerald-100 text-emerald-600",
    },
  ];

  return (
    <section>
      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {card.title}
                  </p>

                  <h3 className="mt-3 text-3xl font-bold text-slate-800">
                    {loading ? (
                      <Loader2 className="h-7 w-7 animate-spin text-slate-400" />
                    ) : (
                      card.value
                    )}
                  </h3>
                </div>

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.color}`}
                >
                  <Icon size={23} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
