
"use client";

import { useEffect, useState } from "react";
import {
  Code2,
  ListTodo,
  Clock3,
  Eye,
  CheckCircle2,
  RefreshCw,
  LogOut,
  CalendarDays,
  FolderKanban,
  MessageCircle,
  ArrowUpRight,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const statCards = [
  {
    key: "totalTasks",
    label: "Total Tasks",
    icon: ListTodo,
    gradient: "from-blue-500/20 to-cyan-500/10",
    iconColor: "text-cyan-300",
    iconBg: "bg-cyan-400/10",
    border: "border-cyan-400/20",
  },
  {
    key: "todo",
    label: "To Do",
    icon: Clock3,
    gradient: "from-slate-500/20 to-slate-400/5",
    iconColor: "text-slate-300",
    iconBg: "bg-slate-400/10",
    border: "border-slate-400/20",
  },
  {
    key: "inProgress",
    label: "In Progress",
    icon: RefreshCw,
    gradient: "from-amber-500/20 to-orange-500/5",
    iconColor: "text-amber-300",
    iconBg: "bg-amber-400/10",
    border: "border-amber-400/20",
  },
  {
    key: "inReview",
    label: "In Review",
    icon: Eye,
    gradient: "from-purple-500/20 to-fuchsia-500/5",
    iconColor: "text-purple-300",
    iconBg: "bg-purple-400/10",
    border: "border-purple-400/20",
  },
  {
    key: "completed",
    label: "Completed",
    icon: CheckCircle2,
    gradient: "from-emerald-500/20 to-green-500/5",
    iconColor: "text-emerald-300",
    iconBg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
  },
];

const priorityStyles = {
  low: "border-slate-400/20 bg-slate-400/10 text-slate-300",
  medium: "border-blue-400/20 bg-blue-400/10 text-blue-300",
  high: "border-orange-400/20 bg-orange-400/10 text-orange-300",
  urgent: "border-red-400/20 bg-red-400/10 text-red-300",
};

const statusStyles = {
  todo: "border-slate-400/20 bg-slate-400/10 text-slate-300",
  in_progress: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  in_review: "border-purple-400/20 bg-purple-400/10 text-purple-300",
  completed: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
};

const statusLabels = {
  todo: "To Do",
  in_progress: "In Progress",
  in_review: "In Review",
  completed: "Completed",
};

export default function DeveloperDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();

  async function loadDashboard() {
    setRefreshing(true);

    try {
      const response = await fetch("/api/developer/dashboard", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load dashboard.");
      }

      setData(result);
      setError("");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();

    async function fetchDashboard() {
      try {
        const response = await fetch("/api/developer/dashboard", {
          cache: "no-store",
          signal: controller.signal,
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load dashboard.");
        }

        setData(result);
        setError("");
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchDashboard();

    return () => controller.abort();
  }, []);

  async function handleLogout() {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Logout failed.");
      }

      router.push("/login");
    } catch (err) {
      toast.error(err.message || "Unable to log out.");
    }
  }

  function formatDate(date) {
    if (!date) return "Not set";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080b18] text-white">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-600/15 blur-[120px]" />
        <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-purple-600/15 blur-[130px]" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#080b18]/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/developer" className="flex items-center gap-3">
            <div className="rounded-xl border border-blue-400/20 bg-gradient-to-br from-blue-500 to-purple-600 p-2.5 shadow-lg shadow-blue-500/20">
              <Code2 size={22} className="text-white" />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight text-white sm:text-xl">
                WorkSphere
              </h1>
              <p className="text-[11px] text-slate-400 sm:text-xs">
                Developer Workspace
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 sm:flex">
              <span className="h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_10px_#60a5fa]" />
              <span className="text-sm font-medium text-blue-200">
                Developer
              </span>
            </div>

            <Link
              href="/chat"
              className="group flex items-center gap-2 rounded-xl border border-purple-400/20 bg-purple-500/10 px-3 py-2.5 text-sm font-medium text-purple-200 transition hover:border-purple-400/40 hover:bg-purple-500/20"
            >
              <MessageCircle size={17} />
              <span className="hidden sm:inline">TeamSpace</span>
              <ArrowUpRight
                size={14}
                className="hidden transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 sm:block"
              />
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut size={17} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {loading ? (
          <div className="flex min-h-[65vh] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10">
                <RefreshCw
                  size={28}
                  className="animate-spin text-blue-400"
                />
              </div>
              <p className="font-medium text-slate-200">
                Preparing your workspace...
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Loading your development tasks
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="mx-auto mt-16 max-w-lg rounded-3xl border border-red-400/20 bg-white/[0.04] p-8 text-center shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/20 bg-red-500/10 text-red-300">
              <AlertCircle size={27} />
            </div>

            <h2 className="text-xl font-bold text-white">
              Unable to load dashboard
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              {error}
            </p>

            <button
              onClick={loadDashboard}
              disabled={refreshing}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:brightness-110 disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Welcome section */}
            <section className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Sparkles size={15} className="text-cyan-400" />
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                    Developer Dashboard
                  </p>
                </div>

                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Welcome,{" "}
                  <span className="bg-gradient-to-r from-blue-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
                    {data?.user?.fullName || "Developer"}
                  </span>
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
                  Your development workspace is ready. Track your assigned
                  tasks and stay on top of your progress.
                </p>
              </div>

              <button
                onClick={loadDashboard}
                disabled={refreshing}
                className="inline-flex w-fit items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-slate-200 shadow-lg shadow-black/10 backdrop-blur-xl transition hover:border-blue-400/30 hover:bg-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
            </section>

            {/* Statistics */}
            <section className="mb-9">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Task Overview
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Your current development activity
                  </p>
                </div>
                <span className="hidden rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-400 sm:inline-flex">
                  Live dashboard data
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {statCards.map((card) => {
                  const Icon = card.icon;

                  return (
                    <div
                      key={card.key}
                      className={`group relative overflow-hidden rounded-2xl border ${card.border} bg-gradient-to-br ${card.gradient} p-5 shadow-xl shadow-black/10 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl`}
                    >
                      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/[0.04] blur-2xl transition group-hover:bg-white/[0.08]" />

                      <div className="relative flex items-center justify-between">
                        <div className={`rounded-xl ${card.iconBg} p-3`}>
                          <Icon size={21} className={card.iconColor} />
                        </div>

                        <span className="text-3xl font-bold tracking-tight text-white">
                          {data?.stats?.[card.key] ?? 0}
                        </span>
                      </div>

                      <div className="relative mt-5">
                        <p className="text-sm font-medium text-slate-300">
                          {card.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Assigned tasks */}
            <section className="overflow-hidden rounded-3xl border border-white/[0.09] bg-white/[0.035] shadow-2xl shadow-black/20 backdrop-blur-2xl">
              <div className="flex flex-col justify-between gap-4 border-b border-white/[0.08] px-5 py-6 sm:flex-row sm:items-center sm:px-7">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-blue-400/20 bg-blue-500/10 p-3">
                    <FolderKanban size={21} className="text-blue-300" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white">
                      My Assigned Tasks
                    </h3>
                    <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                      Manage and monitor your development assignments
                    </p>
                  </div>
                </div>

                <span className="w-fit rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-200">
                  {data?.tasks?.length ?? 0} Tasks
                </span>
              </div>

              {!data?.tasks?.length ? (
                <div className="px-6 py-20 text-center">
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-500">
                    <FolderKanban size={29} />
                  </div>

                  <h4 className="text-lg font-semibold text-white">
                    No tasks assigned yet
                  </h4>

                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">
                    Your assigned development tasks will appear here once
                    they are assigned to your account.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px] text-left">
                    <thead className="border-b border-white/[0.08] bg-white/[0.025]">
                      <tr className="text-[11px] uppercase tracking-wider text-slate-500">
                        <th className="px-6 py-5 font-semibold">Task</th>
                        <th className="px-6 py-5 font-semibold">Project</th>
                        <th className="px-6 py-5 font-semibold">Priority</th>
                        <th className="px-6 py-5 font-semibold">Status</th>
                        <th className="px-6 py-5 font-semibold">Due Date</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-white/[0.06]">
                      {data.tasks.map((task) => (
                        <tr
                          key={task.id}
                          className="transition hover:bg-white/[0.035]"
                        >
                          <td className="px-6 py-5">
                            <p className="max-w-xs font-semibold text-slate-100">
                              {task.title}
                            </p>
                            <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                              {task.description || "No description"}
                            </p>
                          </td>

                          <td className="px-6 py-5 text-sm text-slate-300">
                            {task.projectName || "—"}
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${
                                priorityStyles[task.priority] ||
                                priorityStyles.medium
                              }`}
                            >
                              {task.priority || "Medium"}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${
                                statusStyles[task.status] ||
                                statusStyles.todo
                              }`}
                            >
                              {statusLabels[task.status] || task.status}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm text-slate-400">
                              <CalendarDays
                                size={15}
                                className="text-slate-500"
                              />
                              {formatDate(task.dueDate)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Footer */}
            <footer className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-white/[0.07] pt-6 text-xs text-slate-500 sm:flex-row">
              <p>WorkSphere · Developer Workspace</p>
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 transition hover:text-purple-300"
              >
                <MessageCircle size={14} />
                Connect with your team
                <ArrowUpRight size={13} />
              </Link>
            </footer>
          </>
        )}
      </div>
    </main>
  );
}
