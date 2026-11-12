
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
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const statusStyles = {
  planning: "bg-blue-50 text-blue-700",
  active: "bg-green-50 text-green-700",
  on_hold: "bg-amber-50 text-amber-700",
  completed: "bg-purple-50 text-purple-700",
  cancelled: "bg-red-50 text-red-700",
};

const taskStatusStyles = {
  todo: "bg-slate-100 text-slate-700",
  in_progress: "bg-blue-100 text-blue-700",
  in_review: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700",
};

const priorityStyles = {
  low: "text-slate-500",
  medium: "text-blue-600",
  high: "text-orange-600",
  urgent: "text-red-600",
};

function StatCard({ title, value, icon: Icon, color, subtitle }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">{value ?? 0}</h2>
          <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
        </div>
        <div className={`rounded-xl p-3 ${color}`}>
          <Icon size={23} />
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
        setError(err.message);
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
    <main className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-600 p-2.5 text-white">
              <BriefcaseBusiness size={23} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">WorkSphere</h1>
              <p className="text-xs text-slate-500">Project Manager Workspace</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => loadDashboard()}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw size={16} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <Link
              href="/chat"
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              <MessageCircle size={16} />
              <span className="hidden sm:inline">TeamSpace</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-medium text-indigo-600">
            PROJECT MANAGEMENT
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            Welcome, {data?.user?.fullName || "Project Manager"}
          </h2>
          <p className="mt-2 text-slate-500">
            Monitor projects, track tasks, and manage team progress.
          </p>
        </div>

        {loading && !data && (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
            Loading dashboard...
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={20} />
            {error}
            <button
              onClick={() => loadDashboard()}
              className="ml-auto font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {data && (
          <>
            <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Projects"
                value={stats.totalProjects}
                icon={FolderKanban}
                color="bg-indigo-50 text-indigo-600"
                subtitle="All registered projects"
              />
              <StatCard
                title="Active Projects"
                value={stats.activeProjects}
                icon={Clock3}
                color="bg-green-50 text-green-600"
                subtitle="Currently running"
              />
              <StatCard
                title="Completed Projects"
                value={stats.completedProjects}
                icon={CheckCircle2}
                color="bg-purple-50 text-purple-600"
                subtitle="Successfully completed"
              />
              <StatCard
                title="Total Tasks"
                value={stats.totalTasks}
                icon={ListTodo}
                color="bg-orange-50 text-orange-600"
                subtitle="Across all projects"
              />
            </section>

            <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="To Do"
                value={stats.todo}
                icon={Circle}
                color="bg-slate-100 text-slate-600"
                subtitle="Waiting to start"
              />
              <StatCard
                title="In Progress"
                value={stats.inProgress}
                icon={Clock3}
                color="bg-blue-50 text-blue-600"
                subtitle="Currently working"
              />
              <StatCard
                title="In Review"
                value={stats.inReview}
                icon={Users}
                color="bg-amber-50 text-amber-600"
                subtitle="Awaiting review"
              />
              <StatCard
                title="Completed Tasks"
                value={stats.completedTasks}
                icon={CheckCircle2}
                color="bg-green-50 text-green-600"
                subtitle="Finished tasks"
              />
            </section>

            <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <div>
                  <h3 className="font-bold text-slate-900">All Projects</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Overview of your organization&apos;s projects
                  </p>
                </div>
                <FolderKanban className="text-indigo-500" />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[750px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Project</th>
                      <th className="px-6 py-4">Created By</th>
                      <th className="px-6 py-4">Start Date</th>
                      <th className="px-6 py-4">Due Date</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.projects.map((project) => (
                      <tr key={project.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-800">
                            {project.name}
                          </p>
                          <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                            {project.description || "No description"}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {project.createdByName || "Unknown"}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {formatDate(project.startDate)}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {formatDate(project.dueDate)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[project.status] || "bg-slate-100 text-slate-600"}`}>
                            {project.status.replaceAll("_", " ")}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {data.projects.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-10 text-center text-slate-500">
                          No projects found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <div>
                  <h3 className="font-bold text-slate-900">Recent Tasks</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Latest tasks across all projects
                  </p>
                </div>
                <ListTodo className="text-indigo-500" />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Task</th>
                      <th className="px-6 py-4">Project</th>
                      <th className="px-6 py-4">Assigned To</th>
                      <th className="px-6 py-4">Priority</th>
                      <th className="px-6 py-4">Due Date</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.tasks.map((task) => (
                      <tr key={task.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-800">
                            {task.title}
                          </p>
                          <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                            {task.description || "No description"}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {task.projectName}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {task.assignedToName}
                        </td>
                        <td className={`px-6 py-4 font-semibold capitalize ${priorityStyles[task.priority] || "text-slate-600"}`}>
                          {task.priority}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          <span className="flex items-center gap-2">
                            <CalendarDays size={15} />
                            {formatDate(task.dueDate)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${taskStatusStyles[task.status] || "bg-slate-100 text-slate-600"}`}>
                            {task.status.replaceAll("_", " ")}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {data.tasks.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-6 py-10 text-center text-slate-500">
                          No tasks found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
