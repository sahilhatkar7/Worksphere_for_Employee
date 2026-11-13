
"use client";

import { useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  FolderKanban,
  ClipboardList,
  Loader2,
  TrendingUp,
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
      gradient: "from-blue-500 to-cyan-400",
      glow: "shadow-blue-500/10",
      description: "Registered workforce",
    },
    {
      title: "Pending Approvals",
      value: stats.pendingApprovals,
      icon: UserCheck,
      gradient: "from-amber-500 to-orange-400",
      glow: "shadow-orange-500/10",
      description: "Awaiting review",
    },
    {
      title: "Active Projects",
      value: stats.activeProjects,
      icon: FolderKanban,
      gradient: "from-violet-500 to-fuchsia-400",
      glow: "shadow-violet-500/10",
      description: "Ongoing projects",
    },
    {
      title: "Total Tasks",
      value: stats.totalTasks,
      icon: ClipboardList,
      gradient: "from-emerald-500 to-teal-400",
      glow: "shadow-emerald-500/10",
      description: "Tasks in workspace",
    },
  ];

  return (
    <section>
      {error && (
        <p className="mb-4 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className={`group relative overflow-hidden rounded-2xl border border-white/[0.09] bg-white/[0.045] p-5 shadow-xl ${card.glow} backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07]`}
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/[0.035] blur-2xl transition group-hover:bg-white/[0.08]" />

              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-400">
                    {card.title}
                  </p>

                  <h3 className="mt-4 text-3xl font-bold tracking-tight text-white">
                    {loading ? (
                      <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
                    ) : (
                      card.value
                    )}
                  </h3>

                  <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                    <TrendingUp size={13} className="text-emerald-400" />
                    {card.description}
                  </p>
                </div>

                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient} text-white shadow-lg`}
                >
                  <Icon size={22} />
                </div>
              </div>

              <div
                className={`absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r ${card.gradient} transition-all duration-500 group-hover:w-full`}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
