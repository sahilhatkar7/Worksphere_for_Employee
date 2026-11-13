
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FolderKanban,
  ListTodo,
  Clock3,
  CheckCircle2,
  Circle,
  RefreshCw,
  LogOut,
  CalendarDays,
  Users,
  BriefcaseBusiness,
  AlertCircle,
  MessageCircle,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const statusStyles = {
  planning: "border-blue-400/20 bg-blue-400/10 text-blue-300",
  active: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  on_hold: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  completed: "border-purple-400/20 bg-purple-400/10 text-purple-300",
  cancelled: "border-red-400/20 bg-red-400/10 text-red-300",
};

const taskStatusStyles = {
  todo: "border-slate-400/20 bg-slate-400/10 text-slate-300",
  in_progress: "border-blue-400/20 bg-blue-400/10 text-blue-300",
  in_review: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  completed: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
};

const priorityStyles = {
  low: "text-slate-400",
  medium: "text-blue-300",
  high: "text-orange-300",
  urgent: "text-red-300",
};

const statCards = [
  {
    title: "Total Projects",
    key: "totalProjects",
    icon: FolderKanban,
    subtitle: "All registered projects",
    color: "text-indigo-300",
    accent: "from-indigo-500/20 to-blue-500/10",
    border: "border-indigo-400/20",
  },
  {
    title: "Active Projects",
    key: "activeProjects",
    icon: Clock3,
    subtitle: "Currently running",
    color: "text-emerald-300",
    accent: "from-emerald-500/20 to-teal-500/10",
    border: "border-emerald-400/20",
  },
  {
    title: "Completed Projects",
    key: "completedProjects",
    icon: CheckCircle2,
    subtitle: "Successfully completed",
    color: "text-purple-300",
    accent: "from-purple-500/20 to-violet-500/10",
    border: "border-purple-400/20",
  },
  {
    title: "Total Tasks",
    key: "totalTasks",
    icon: ListTodo,
    subtitle: "Across all projects",
    color: "text-orange-300",
    accent: "from-orange-500/20 to-amber-500/10",
    border: "border-orange-400/20",
  },
  {
    title: "To Do",
    key: "todo",
    icon: Circle,
    subtitle: "Waiting to start",
    color: "text-slate-300",
    accent: "from-slate-500/20 to-slate-400/10",
    border: "border-slate-400/20",
  },
  {
    title: "In Progress",
    key: "inProgress",
    icon: Clock3,
    subtitle: "Currently working",
    color: "text-blue-300",
    accent: "from-blue-500/20 to-cyan-500/10",
    border: "border-blue-400/20",
  },
  {
    title: "In Review",
    key: "inReview",
    icon: Users,
    subtitle: "Awaiting review",
    color: "text-amber-300",
    accent: "from-amber-500/20 to-yellow-500/10",
    border: "border-amber-400/20",
  },
  {
    title: "Completed Tasks",
    key: "completedTasks",
    icon: CheckCircle2,
    subtitle: "Finished tasks",
    color: "text-emerald-300",
    accent: "from-emerald-500/20 to-green-500/10",
    border: "border-emerald-400/20",
  },
];

function StatCard({ title, value, icon: Icon, color, subtitle, accent, border }) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border ${border} bg-white/[0.035] p-5 shadow-xl shadow-black/10 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/[0.06]`}
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent} opacity-60`} />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">
            {value ?? 0}
          </h2>
          <p className="mt-2 text-xs text-slate-500">{subtitle}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.06] p-3 transition group-hover:scale-110">
          <Icon size={22} className={color} />
        </div>
      </div>
    </div>
  );
}

function formatDate(date) {
  if (!date) return "Not set";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ProjectManagerDashboard() {
  const router = useRouter();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async (signal) => {
    try {
      const response = await fetch("/api/project-manager/dashboard", {
        cache: "no-store",
        signal,
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
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Logout failed.");
      }

      toast.success("Logged out successfully.");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Unable to logout. Please try again.");
    }
  }

  const stats = data?.stats;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080d1b] text-slate-100">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-purple-600/10 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#0b1120]/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/project-manager" className="flex shrink-0 items-center gap-3">
            <div className="rounded-xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500 to-blue-600 p-2.5 shadow-lg shadow-indigo-500/20">
              <BriefcaseBusiness size={23} className="text-white" />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-wide text-white sm:text-xl">
                WorkSphere
              </h1>
              <p className="text-[11px] font-medium tracking-wider text-slate-400">
                PROJECT MANAGER WORKSPACE
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-4 py-2 text-xs font-semibold text-indigo-300 sm:inline-flex">
              <span className="h-2 w-2 rounded-full bg-indigo-400 shadow-[0_0_10px_#818cf8]" />
              Project Manager
            </span>

            <button
              onClick={() => loadDashboard()}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:border-indigo-400/30 hover:bg-indigo-400/10 hover:text-indigo-200 disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <Link
              href="/chat"
              className="flex items-center gap-2 rounded-xl border border-indigo-400/20 bg-indigo-500/10 px-3 py-2.5 text-sm font-medium text-indigo-200 transition hover:border-indigo-400/40 hover:bg-indigo-500/20"
            >
              <MessageCircle size={16} />
              <span className="hidden sm:inline">TeamSpace</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2.5 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* Welcome section */}
        <section className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1.5 text-[11px] font-bold tracking-[0.15em] text-indigo-300">
            <Activity size={13} />
            PROJECT MANAGEMENT
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
            Welcome,{" "}
            <span className="bg-gradient-to-r from-indigo-300 via-blue-300 to-cyan-300 bg-clip-text text-transparent">
              {data?.user?.fullName || "Project Manager"}
            </span>
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Monitor projects, track tasks, and manage team progress from one
            workspace.
          </p>
        </section>

        {/* Loading */}
        {loading && !data && (
          <div className="flex min-h-64 items-center justify-center rounded-3xl border border-white/[0.08] bg-white/[0.035] backdrop-blur-xl">
            <div className="text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-indigo-400/20 border-t-indigo-400" />
              <p className="text-sm font-medium text-slate-400">
                Loading your dashboard...
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-400/20 bg-red-400/[0.06] p-4 text-sm text-red-300 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>

            <button
              onClick={() => loadDashboard()}
              className="font-semibold underline sm:ml-auto"
            >
              Retry
            </button>
          </div>
        )}

        {data && (
          <>
            {/* Statistics */}
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {statCards.map((card) => (
                <StatCard
                  key={card.key}
                  title={card.title}
                  value={stats?.[card.key]}
                  icon={card.icon}
                  color={card.color}
                  subtitle={card.subtitle}
                  accent={card.accent}
                  border={card.border}
                />
              ))}
            </section>

            {/* All Projects */}
            <section className="mt-8 overflow-hidden rounded-3xl border border-white/[0.09] bg-white/[0.035] shadow-2xl shadow-black/20 backdrop-blur-2xl">
              <div className="flex flex-col gap-3 border-b border-white/[0.08] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-indigo-400/20 bg-indigo-400/10 p-3">
                    <FolderKanban size={21} className="text-indigo-300" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white">
                      All Projects
                    </h3>
                    <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                      Overview of your organization&apos;s projects
                    </p>
                  </div>
                </div>

                <span className="w-fit rounded-full border border-indigo-400/20 bg-indigo-400/10 px-4 py-2 text-xs font-semibold text-indigo-300">
                  {data.projects.length} Projects
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[750px] text-left text-sm">
                  <thead className="bg-white/[0.025] text-[11px] uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Project</th>
                      <th className="px-6 py-4 font-semibold">Created By</th>
                      <th className="px-6 py-4 font-semibold">Start Date</th>
                      <th className="px-6 py-4 font-semibold">Due Date</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/[0.06]">
                    {data.projects.map((project) => (
                      <tr
                        key={project.id}
                        className="transition hover:bg-white/[0.035]"
                      >
                        <td className="px-6 py-5">
                          <p className="font-semibold text-slate-200">
                            {project.name}
                          </p>
                          <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                            {project.description || "No description"}
                          </p>
                        </td>

                        <td className="px-6 py-5 text-slate-300">
                          {project.createdByName || "Unknown"}
                        </td>

                        <td className="px-6 py-5 whitespace-nowrap text-slate-400">
                          {formatDate(project.startDate)}
                        </td>

                        <td className="px-6 py-5 whitespace-nowrap text-slate-400">
                          <span className="inline-flex items-center gap-2">
                            <CalendarDays size={15} className="text-slate-500" />
                            {formatDate(project.dueDate)}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                              statusStyles[project.status] ||
                              "border-slate-400/20 bg-slate-400/10 text-slate-300"
                            }`}
                          >
                            {project.status.replaceAll("_", " ")}
                          </span>
                        </td>
                      </tr>
                    ))}

                    {data.projects.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-14 text-center">
                          <FolderKanban
                            size={30}
                            className="mx-auto mb-3 text-slate-600"
                          />
                          <p className="font-medium text-slate-300">
                            No projects found
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Your organization&apos;s projects will appear here.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Recent Tasks */}
            <section className="mt-8 overflow-hidden rounded-3xl border border-white/[0.09] bg-white/[0.035] shadow-2xl shadow-black/20 backdrop-blur-2xl">
              <div className="flex flex-col gap-3 border-b border-white/[0.08] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-3">
                    <ListTodo size={21} className="text-cyan-300" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Recent Tasks
                    </h3>
                    <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                      Latest tasks across all projects
                    </p>
                  </div>
                </div>

                <span className="w-fit rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-300">
                  {data.tasks.length} Tasks
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead className="bg-white/[0.025] text-[11px] uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Task</th>
                      <th className="px-6 py-4 font-semibold">Project</th>
                      <th className="px-6 py-4 font-semibold">Assigned To</th>
                      <th className="px-6 py-4 font-semibold">Priority</th>
                      <th className="px-6 py-4 font-semibold">Due Date</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
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

                        <td className="px-6 py-5 text-slate-300">
                          {task.projectName}
                        </td>

                        <td className="px-6 py-5 text-slate-300">
                          {task.assignedToName}
                        </td>

                        <td
                          className={`px-6 py-5 font-semibold capitalize ${
                            priorityStyles[task.priority] || "text-slate-300"
                          }`}
                        >
                          {task.priority}
                        </td>

                        <td className="px-6 py-5 whitespace-nowrap text-slate-400">
                          <span className="inline-flex items-center gap-2">
                            <CalendarDays size={15} className="text-slate-500" />
                            {formatDate(task.dueDate)}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                              taskStatusStyles[task.status] ||
                              "border-slate-400/20 bg-slate-400/10 text-slate-300"
                            }`}
                          >
                            {task.status.replaceAll("_", " ")}
                          </span>
                        </td>
                      </tr>
                    ))}

                    {data.tasks.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-6 py-14 text-center">
                          <ListTodo
                            size={30}
                            className="mx-auto mb-3 text-slate-600"
                          />
                          <p className="font-medium text-slate-300">
                            No tasks found
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Recent project tasks will appear here.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col justify-between gap-2 border-t border-white/[0.07] px-6 py-4 sm:flex-row sm:items-center">
                <p className="text-xs text-slate-500">
                  WorkSphere · Project Management Workspace
                </p>

                <Link
                  href="/chat"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-300 transition hover:text-indigo-200"
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
