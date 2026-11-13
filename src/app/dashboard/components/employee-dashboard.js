
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  Clock3,
  ClipboardList,
  LogOut,
  RefreshCw,
  UserRound,
  AlertCircle,
  FolderKanban,
  MessageCircle,
  CalendarDays,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

const statusStyles = {
  todo: "border-slate-500/20 bg-slate-500/10 text-slate-300",
  in_progress: "border-blue-400/20 bg-blue-400/10 text-blue-300",
  in_review: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  completed: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
};

const priorityStyles = {
  low: "bg-slate-500/10 text-slate-300",
  medium: "bg-blue-500/10 text-blue-300",
  high: "bg-orange-500/10 text-orange-300",
  urgent: "bg-red-500/10 text-red-300",
};

function formatLabel(value = "") {
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) =>
    char.toUpperCase()
  );
}

function formatDate(value) {
  if (!value) return "Not set";

  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function EmployeeDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  const loadDashboard = useCallback(async (signal) => {
    try {
      setError("");

      const response = await fetch("/api/employee/dashboard", {
        cache: "no-store",
        signal,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load dashboard.");
      }

      setDashboard(data);
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message || "Something went wrong.");
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchDashboard() {
      await loadDashboard(controller.signal);
    }

    fetchDashboard();

    return () => controller.abort();
  }, [loadDashboard]);

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

  function handleRefresh() {
    setLoading(true);
    loadDashboard();
  }

  async function handleStatusUpdate(taskId, newStatus) {
    try {
      const response = await fetch("/api/employee/tasks/status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskId,
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to update task.");
      }

      toast.success("Task status updated successfully.");

      await loadDashboard();
    } catch (error) {
      toast.error(error.message || "Unable to update task.");
    }
  }

  const stats = dashboard?.stats;

  const statCards = [
    {
      label: "Total Tasks",
      value: stats?.totalTasks ?? 0,
      icon: ClipboardList,
      accent: "from-blue-500 to-cyan-400",
      glow: "shadow-blue-500/10",
    },
    {
      label: "To Do",
      value: stats?.todo ?? 0,
      icon: Circle,
      accent: "from-slate-400 to-slate-300",
      glow: "shadow-slate-500/10",
    },
    {
      label: "In Progress",
      value: stats?.inProgress ?? 0,
      icon: Clock3,
      accent: "from-amber-400 to-orange-400",
      glow: "shadow-amber-500/10",
    },
    {
      label: "Completed",
      value: stats?.completed ?? 0,
      icon: CheckCircle2,
      accent: "from-emerald-400 to-teal-400",
      glow: "shadow-emerald-500/10",
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080b18] text-slate-100">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-600/15 blur-[120px]" />
        <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-purple-600/15 blur-[130px]" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#080b18]/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20">
              <FolderKanban size={23} className="text-white" />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                WorkSphere
              </h1>
              <p className="text-xs text-slate-400">Employee Workspace</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/chat"
              className="flex items-center gap-2 rounded-xl border border-purple-400/20 bg-purple-500/10 px-3 py-2.5 text-sm font-medium text-purple-200 transition hover:border-purple-400/40 hover:bg-purple-500/20"
            >
              <MessageCircle size={16} />
              <span className="hidden sm:inline">TeamSpace</span>
            </Link>

            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:border-blue-400/30 hover:bg-white/[0.08] disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-3 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/10 transition hover:from-rose-600 hover:to-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">
                {loggingOut ? "Logging out..." : "Logout"}
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {loading && !dashboard ? (
          <div className="flex min-h-96 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10">
                <RefreshCw
                  className="animate-spin text-blue-400"
                  size={30}
                />
              </div>
              <p className="mt-5 text-sm text-slate-400">
                Loading your workspace...
              </p>
            </div>
          </div>
        ) : error && !dashboard ? (
          <div className="rounded-2xl border border-red-400/20 bg-red-500/[0.07] p-6 text-red-200 backdrop-blur-xl">
            <AlertCircle className="mb-3 text-red-400" size={28} />
            <p className="font-semibold">Unable to load dashboard</p>
            <p className="mt-1 text-sm text-red-200/70">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-5 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Welcome section */}
            <section className="mb-8">
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#17264a]/90 via-[#171b3b]/90 to-[#241b46]/90 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
                <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-[90px]" />
                <div className="pointer-events-none absolute bottom-0 right-1/4 h-40 w-40 rounded-full bg-purple-500/20 blur-[80px]" />

                <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                  <div>
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-400/10 px-3 py-1.5 text-xs font-semibold text-blue-200">
                      <Sparkles size={13} />
                      Employee Dashboard
                    </div>

                    <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                      Welcome, {dashboard?.user?.fullName || "Employee"}!
                    </h2>

                    <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
                      Stay organized, manage your assigned tasks and keep
                      track of your progress.
                    </p>
                  </div>

                  <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-xl">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20">
                      <UserRound size={23} className="text-white" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {dashboard?.user?.fullName}
                      </p>
                      <p className="max-w-[190px] truncate text-xs text-slate-400">
                        {dashboard?.user?.email}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-blue-300">
                        Employee Account
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Statistics */}
            <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {statCards.map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.label}
                    className={`group rounded-2xl border border-white/[0.09] bg-white/[0.045] p-5 shadow-xl ${card.glow} backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07]`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-400">
                        {card.label}
                      </p>

                      <div
                        className={`rounded-xl bg-gradient-to-br ${card.accent} p-3 shadow-lg`}
                      >
                        <Icon size={20} className="text-white" />
                      </div>
                    </div>

                    <p className="mt-5 text-3xl font-bold tracking-tight text-white">
                      {card.value}
                    </p>

                    <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className={`h-full w-1/2 rounded-full bg-gradient-to-r ${card.accent} transition-all duration-500 group-hover:w-3/4`}
                      />
                    </div>
                  </div>
                );
              })}
            </section>

            {/* Assigned Tasks */}
            <section className="overflow-hidden rounded-2xl border border-white/[0.09] bg-white/[0.045] shadow-2xl shadow-black/20 backdrop-blur-2xl">
              <div className="flex flex-col gap-4 border-b border-white/[0.08] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                      <ClipboardList size={19} />
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      My Assigned Tasks
                    </h3>
                  </div>

                  <p className="mt-2 text-sm text-slate-400">
                    View and manage the tasks assigned to your account.
                  </p>
                </div>

                <span className="w-fit rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-300">
                  {dashboard?.tasks?.length ?? 0} Tasks
                </span>
              </div>

              {dashboard?.tasks?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[850px] text-left text-sm">
                    <thead className="bg-white/[0.025] text-xs uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Task</th>
                        <th className="px-6 py-4 font-semibold">Project</th>
                        <th className="px-6 py-4 font-semibold">Priority</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                        <th className="px-6 py-4 font-semibold">Due Date</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-white/[0.06]">
                      {dashboard.tasks.map((task) => (
                        <tr
                          key={task.id}
                          className="transition hover:bg-white/[0.035]"
                        >
                          <td className="px-6 py-5">
                            <p className="font-semibold text-slate-100">
                              {task.title}
                            </p>
                            <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                              {task.description || "No description"}
                            </p>
                          </td>

                          <td className="px-6 py-5 text-slate-300">
                            {task.projectName}
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                                priorityStyles[task.priority] ||
                                priorityStyles.medium
                              }`}
                            >
                              {formatLabel(task.priority)}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <select
                              value={task.status}
                              onChange={(e) =>
                                handleStatusUpdate(task.id, e.target.value)
                              }
                              disabled={task.status === "completed"}
                              className={`cursor-pointer rounded-xl border px-3 py-2 text-xs font-semibold outline-none transition focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-70 ${
                                statusStyles[task.status] || statusStyles.todo
                              }`}
                            >
                              {task.status === "todo" && (
                                <>
                                  <option value="todo">To Do</option>
                                  <option value="in_progress">
                                    In Progress
                                  </option>
                                </>
                              )}

                              {task.status === "in_progress" && (
                                <>
                                  <option value="in_progress">
                                    In Progress
                                  </option>
                                  <option value="in_review">In Review</option>
                                </>
                              )}

                              {task.status === "in_review" && (
                                <>
                                  <option value="in_review">In Review</option>
                                  <option value="completed">Completed</option>
                                </>
                              )}

                              {task.status === "completed" && (
                                <option value="completed">Completed</option>
                              )}
                            </select>
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2 text-slate-400">
                              <CalendarDays
                                size={15}
                                className="text-slate-500"
                              />
                              {formatDate(task.dueDate)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-5 py-20 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-400">
                    <ClipboardList size={28} />
                  </div>

                  <h4 className="mt-5 text-lg font-semibold text-white">
                    No tasks assigned yet
                  </h4>

                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">
                    Your assigned tasks will appear here when your Admin or
                    Project Manager adds work to your account.
                  </p>
                </div>
              )}
            </section>

            {/* Footer */}
            <footer className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-white/[0.07] py-5 text-xs text-slate-500 sm:flex-row">
              <p>© {new Date().getFullYear()} WorkSphere. All rights reserved.</p>
              <p className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Employee Workspace
                <ArrowUpRight size={13} />
              </p>
            </footer>
          </>
        )}
      </div>
    </main>
  );
}
