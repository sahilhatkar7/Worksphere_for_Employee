
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
} from "lucide-react";
import { toast } from "sonner";

const statusStyles = {
  todo: "bg-slate-100 text-slate-700",
  in_progress: "bg-blue-100 text-blue-700",
  in_review: "bg-amber-100 text-amber-700",
  completed: "bg-emerald-100 text-emerald-700",
};

const priorityStyles = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
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
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "To Do",
      value: stats?.todo ?? 0,
      icon: Circle,
      color: "bg-slate-100 text-slate-600",
    },
    {
      label: "In Progress",
      value: stats?.inProgress ?? 0,
      icon: Clock3,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Completed",
      value: stats?.completed ?? 0,
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
              <FolderKanban size={23} />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                WorkSphere
              </h1>
              <p className="text-xs text-slate-500">Employee Workspace</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/chat"
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              <MessageCircle size={16} />
              <span>TeamSpace</span>
            </Link>

            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw size={16} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">
                {loggingOut ? "Logging out..." : "Logout"}
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {loading && !dashboard ? (
          <div className="flex min-h-64 items-center justify-center">
            <div className="text-center">
              <RefreshCw
                className="mx-auto animate-spin text-blue-600"
                size={30}
              />
              <p className="mt-3 text-sm text-slate-500">
                Loading your workspace...
              </p>
            </div>
          </div>
        ) : error && !dashboard ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
            <AlertCircle className="mb-2" size={24} />
            <p className="font-semibold">Unable to load dashboard</p>
            <p className="mt-1 text-sm">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <section className="mb-8">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm font-medium text-blue-600">
                    Employee Dashboard
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                    Welcome, {dashboard?.user?.fullName || "Employee"}!
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    View your assigned tasks and track your work progress.
                  </p>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <UserRound size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {dashboard?.user?.fullName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {dashboard?.user?.email}
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-blue-600">
                      Employee
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {statCards.map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.label}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-500">
                        {card.label}
                      </p>
                      <div className={`rounded-lg p-2.5 ${card.color}`}>
                        <Icon size={20} />
                      </div>
                    </div>
                    <p className="mt-4 text-3xl font-bold text-slate-900">
                      {card.value}
                    </p>
                  </div>
                );
              })}
            </section>

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">
                    My Assigned Tasks
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Tasks assigned to your account.
                  </p>
                </div>
                <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  {dashboard?.tasks?.length ?? 0} Tasks
                </span>
              </div>

              {dashboard?.tasks?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[850px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-5 py-4 font-semibold">Task</th>
                        <th className="px-5 py-4 font-semibold">Project</th>
                        <th className="px-5 py-4 font-semibold">Priority</th>
                        <th className="px-5 py-4 font-semibold">Status</th>
                        <th className="px-5 py-4 font-semibold">Due Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {dashboard.tasks.map((task) => (
                        <tr key={task.id} className="hover:bg-slate-50">
                          <td className="px-5 py-4">
                            <p className="font-semibold text-slate-800">
                              {task.title}
                            </p>
                            <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                              {task.description || "No description"}
                            </p>
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            {task.projectName}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                priorityStyles[task.priority] ||
                                priorityStyles.medium
                              }`}
                            >
                              {formatLabel(task.priority)}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <select
                              value={task.status}
                              onChange={(e) =>
                                handleStatusUpdate(task.id, e.target.value)
                              }
                              disabled={task.status === "completed"}
                              className={`rounded-lg border-0 px-3 py-2 text-xs font-semibold outline-none ${
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
                          <td className="px-5 py-4 text-slate-600">
                            {formatDate(task.dueDate)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-5 py-16 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <ClipboardList size={27} />
                  </div>
                  <h4 className="mt-4 font-semibold text-slate-800">
                    No tasks assigned yet
                  </h4>
                  <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                    Your assigned tasks will appear here when your Admin or
                    Project Manager adds work to your account.
                  </p>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
