
"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
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
  Activity,
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
    accent: "from-blue-500/20 to-cyan-500/10",
    iconColor: "text-cyan-300",
    border: "border-cyan-400/20",
  },
  {
    key: "todo",
    label: "To Do",
    icon: Clock3,
    accent: "from-slate-500/20 to-slate-400/10",
    iconColor: "text-slate-300",
    border: "border-slate-400/20",
  },
  {
    key: "inProgress",
    label: "In Progress",
    icon: RefreshCw,
    accent: "from-amber-500/20 to-orange-500/10",
    iconColor: "text-amber-300",
    border: "border-amber-400/20",
  },
  {
    key: "inReview",
    label: "In Review",
    icon: Eye,
    accent: "from-purple-500/20 to-violet-500/10",
    iconColor: "text-purple-300",
    border: "border-purple-400/20",
  },
  {
    key: "completed",
    label: "Completed",
    icon: CheckCircle2,
    accent: "from-emerald-500/20 to-green-500/10",
    iconColor: "text-emerald-300",
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

export default function TesterDashboard() {
  const router = useRouter();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      const response = await fetch("/api/tester/dashboard", {
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
        const response = await fetch("/api/tester/dashboard", {
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
    <main className="relative min-h-screen overflow-hidden bg-[#080d1b] text-slate-100">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-emerald-600/10 blur-[120px]" />
        <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-purple-600/10 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#0b1120]/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/tester" className="flex shrink-0 items-center gap-3">
            <div className="rounded-xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500 to-teal-600 p-2.5 shadow-lg shadow-emerald-500/20">
              <ShieldCheck size={22} className="text-white" />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-wide text-white sm:text-xl">
                WorkSphere
              </h1>
              <p className="text-[11px] font-medium tracking-wider text-slate-400">
                TESTER WORKSPACE
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold text-emerald-300 sm:inline-flex">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
              Tester
            </span>

            <Link
              href="/chat"
              className="flex items-center gap-2 rounded-xl border border-indigo-400/20 bg-indigo-500/10 px-3 py-2.5 text-sm font-medium text-indigo-200 transition hover:border-indigo-400/40 hover:bg-indigo-500/20"
            >
              <MessageCircle size={17} />
              <span className="hidden sm:inline">TeamSpace</span>
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

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {loading ? (
          <div className="flex min-h-[65vh] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-5 h-11 w-11 animate-spin rounded-full border-4 border-emerald-400/20 border-t-emerald-400" />
              <p className="text-sm font-medium text-slate-400">
                Loading your dashboard...
              </p>
              <p className="mt-1 text-xs text-slate-600">
                Preparing your testing workspace
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="mx-auto mt-16 max-w-lg rounded-3xl border border-red-400/20 bg-white/[0.04] p-8 text-center shadow-2xl backdrop-blur-xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/20 bg-red-400/10">
              <AlertCircle size={27} className="text-red-300" />
            </div>

            <h3 className="text-lg font-bold text-white">
              Unable to load dashboard
            </h3>

            <p className="mt-2 text-sm text-slate-400">{error}</p>

            <button
              onClick={loadDashboard}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:shadow-emerald-500/30"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Welcome section */}
            <section className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[11px] font-bold tracking-[0.15em] text-emerald-300">
                  <Activity size={13} />
                  TESTER DASHBOARD
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                  Welcome,{" "}
                  <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                    {data?.user?.fullName}
                  </span>
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                  Track assigned testing tasks and monitor quality progress
                  across your projects.
                </p>
              </div>

              <button
                onClick={loadDashboard}
                className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-slate-200 shadow-lg backdrop-blur-xl transition hover:border-emerald-400/30 hover:bg-emerald-400/10 hover:text-emerald-200 sm:self-center"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </section>

            {/* Stats */}
            <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {statCards.map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.key}
                    className={`group relative overflow-hidden rounded-2xl border ${card.border} bg-white/[0.035] p-5 shadow-xl shadow-black/10 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/[0.06]`}
                  >
                    <div
                      className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${card.accent} opacity-60`}
                    />

                    <div className="relative flex items-center justify-between">
                      <div className="rounded-xl border border-white/10 bg-white/[0.06] p-3 transition group-hover:scale-110">
                        <Icon size={21} className={card.iconColor} />
                      </div>

                      <span className="text-3xl font-bold tracking-tight text-white">
                        {data?.stats?.[card.key] ?? 0}
                      </span>
                    </div>

                    <div className="relative mt-5">
                      <p className="text-sm font-medium text-slate-400">
                        {card.label}
                      </p>
                      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className={`h-full w-1/2 rounded-full bg-gradient-to-r ${card.accent} opacity-90`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>

            {/* Tasks section */}
            <section className="overflow-hidden rounded-3xl border border-white/[0.09] bg-white/[0.035] shadow-2xl shadow-black/20 backdrop-blur-2xl">
              <div className="flex flex-col gap-4 border-b border-white/[0.08] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3">
                    <FolderKanban size={21} className="text-emerald-300" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white">
                      My Testing Tasks
                    </h3>
                    <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                      Tasks assigned to your Tester account
                    </p>
                  </div>
                </div>

                <span className="w-fit rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold text-emerald-300">
                  {data?.tasks?.length ?? 0} Tasks
                </span>
              </div>

              {!data?.tasks?.length ? (
                <div className="px-6 py-20 text-center">
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                    <FolderKanban size={29} className="text-slate-500" />
                  </div>

                  <h4 className="text-lg font-semibold text-white">
                    No tasks assigned yet
                  </h4>

                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">
                    Your assigned testing tasks will appear here once they are
                    allocated to your account.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[750px] text-left">
                    <thead className="bg-white/[0.025] text-[11px] uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Task</th>
                        <th className="px-6 py-4 font-semibold">Project</th>
                        <th className="px-6 py-4 font-semibold">Priority</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                        <th className="px-6 py-4 font-semibold">Due Date</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-white/[0.06]">
                      {data.tasks.map((task) => (
                        <tr
                          key={task.id}
                          className="transition hover:bg-white/[0.035]"
                        >
                          <td className="px-6 py-5">
                            <p className="font-semibold text-slate-200">
                              {task.title}
                            </p>
                            <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                              {task.description || "No description"}
                            </p>
                          </td>

                          <td className="px-6 py-5">
                            <span className="inline-flex items-center gap-2 text-sm text-slate-300">
                              <FolderKanban
                                size={15}
                                className="text-slate-500"
                              />
                              {task.projectName}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                                priorityStyles[task.priority] ||
                                priorityStyles.medium
                              }`}
                            >
                              {task.priority}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
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

              <div className="flex flex-col justify-between gap-2 border-t border-white/[0.07] px-6 py-4 sm:flex-row sm:items-center">
                <p className="text-xs text-slate-500">
                  WorkSphere · Testing Workspace
                </p>

                <Link
                  href="/chat"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 transition hover:text-emerald-200"
                >
                  Open TeamSpace
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
