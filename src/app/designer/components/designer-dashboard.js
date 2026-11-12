
"use client";

import { useEffect, useState } from "react";
import {
  Palette,
  ListTodo,
  Clock3,
  Eye,
  CheckCircle2,
  RefreshCw,
  LogOut,
  CalendarDays,
  FolderKanban,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const statCards = [
  { key: "totalTasks", label: "Total Tasks", icon: ListTodo, color: "bg-blue-50 text-blue-600" },
  { key: "todo", label: "To Do", icon: Clock3, color: "bg-slate-100 text-slate-600" },
  { key: "inProgress", label: "In Progress", icon: RefreshCw, color: "bg-amber-50 text-amber-600" },
  { key: "inReview", label: "In Review", icon: Eye, color: "bg-purple-50 text-purple-600" },
  { key: "completed", label: "Completed", icon: CheckCircle2, color: "bg-green-50 text-green-600" },
];

const priorityStyles = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-blue-50 text-blue-600",
  high: "bg-orange-50 text-orange-600",
  urgent: "bg-red-50 text-red-600",
};

const statusLabels = {
  todo: "To Do",
  in_progress: "In Progress",
  in_review: "In Review",
  completed: "Completed",
};

export default function DesignerDashboard() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      const response = await fetch("/api/designer/dashboard", {
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
    }
  }

  useEffect(() => {
    const controller = new AbortController();

    async function fetchDashboard() {
      try {
        const response = await fetch("/api/designer/dashboard", {
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
    <main className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href="/designer" className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-600 p-2.5 text-white">
              <Palette size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">WorkSphere</h1>
              <p className="text-xs text-slate-500">Designer Workspace</p>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden rounded-full bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700 sm:inline-flex">
              Designer
            </span>

            <Link
              href="/chat"
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              <MessageCircle size={16} />
              <span>TeamSpace</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              <LogOut size={17} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8">
        {loading ? (
          <div className="flex min-h-80 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 h-9 w-9 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
              <p className="text-sm text-slate-500">Loading your dashboard...</p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
            <p className="font-semibold text-red-600">{error}</p>
            <button
              onClick={loadDashboard}
              className="mt-4 rounded-lg bg-purple-600 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-700"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <section className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="mb-2 text-sm font-medium text-purple-600">
                  DESIGNER DASHBOARD
                </p>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                  Welcome, {data?.user?.fullName}
                </h2>
                <p className="mt-2 text-slate-500">
                  Manage your design tasks and track creative project progress.
                </p>
              </div>

              <button
                onClick={loadDashboard}
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </section>

            <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {statCards.map((card) => {
                const Icon = card.icon;

                return (
                  <div key={card.key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className={`rounded-xl p-3 ${card.color}`}>
                        <Icon size={21} />
                      </div>
                      <span className="text-2xl font-bold text-slate-900">
                        {data?.stats?.[card.key] ?? 0}
                      </span>
                    </div>
                    <p className="mt-4 text-sm font-medium text-slate-500">
                      {card.label}
                    </p>
                  </div>
                );
              })}
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">My Assigned Tasks</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Tasks assigned to your Designer account.
                  </p>
                </div>
                <span className="w-fit rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                  {data?.tasks?.length ?? 0} Tasks
                </span>
              </div>

              {!data?.tasks?.length ? (
                <div className="px-6 py-16 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <FolderKanban size={26} />
                  </div>
                  <h4 className="font-semibold text-slate-800">No tasks assigned yet</h4>
                  <p className="mt-2 text-sm text-slate-500">
                    Your assigned design tasks will appear here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[750px] text-left">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-6 py-4">Task</th>
                        <th className="px-6 py-4">Project</th>
                        <th className="px-6 py-4">Priority</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Due Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.tasks.map((task) => (
                        <tr key={task.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4">
                            <p className="font-semibold text-slate-800">{task.title}</p>
                            <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                              {task.description || "No description"}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">{task.projectName}</td>
                          <td className="px-6 py-4">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${priorityStyles[task.priority] || priorityStyles.medium}`}>
                              {task.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                              {statusLabels[task.status] || task.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="flex items-center gap-2 text-sm text-slate-600">
                              <CalendarDays size={15} />
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
          </>
        )}
      </div>
    </main>
  );
}
