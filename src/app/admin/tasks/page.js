
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ListTodo,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
  AlertCircle,
  FolderKanban,
  User,
  ClipboardList,
  CircleDot,
  Zap,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

const initialForm = {
  title: "",
  description: "",
  projectId: "",
  assignedTo: "",
  status: "todo",
  priority: "medium",
  dueDate: "",
};

const statusOptions = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "in_review", label: "In Review" },
  { value: "completed", label: "Completed" },
];

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

function getStatusStyle(status) {
  const styles = {
    todo: "border-slate-500/20 bg-slate-500/10 text-slate-300",
    in_progress: "border-blue-400/20 bg-blue-400/10 text-blue-300",
    in_review: "border-amber-400/20 bg-amber-400/10 text-amber-300",
    completed: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  };

  return styles[status] || styles.todo;
}

function getPriorityStyle(priority) {
  const styles = {
    low: "border-slate-500/20 bg-slate-500/10 text-slate-300",
    medium: "border-blue-400/20 bg-blue-400/10 text-blue-300",
    high: "border-orange-400/20 bg-orange-400/10 text-orange-300",
    urgent: "border-rose-400/20 bg-rose-400/10 text-rose-300",
  };

  return styles[priority] || styles.low;
}

function formatLabel(value) {
  const option = [...statusOptions, ...priorityOptions].find(
    (item) => item.value === value
  );

  return option?.label || value || "Not set";
}

function formatDate(date) {
  if (!date) return "Not set";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatCard({ title, value, icon: Icon, accent, description }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111b31]/80 p-5 shadow-lg shadow-black/10 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/[0.15]">
      <div
        className={`absolute -right-8 -top-8 h-28 w-28 rounded-full ${accent} opacity-[0.08] blur-2xl transition group-hover:opacity-20`}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-white">
            {value}
          </p>
          <p className="mt-2 text-xs text-slate-500">{description}</p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 ${accent} bg-opacity-10 text-white`}
        >
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function FormField({ label, children, className = "" }) {
  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#0b1427] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/10";

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState(initialForm);

  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/tasks", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load tasks");
      }

      setTasks(data.tasks || []);
    } catch (error) {
      toast.error(error.message || "Failed to load tasks");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPageData() {
      setLoading(true);

      try {
        const [tasksResponse, projectsResponse, employeesResponse] =
          await Promise.all([
            fetch("/api/admin/tasks", {
              cache: "no-store",
              signal: controller.signal,
            }),
            fetch("/api/admin/projects", {
              cache: "no-store",
              signal: controller.signal,
            }),
            fetch("/api/admin/employees", {
              cache: "no-store",
              signal: controller.signal,
            }),
          ]);

        const [tasksData, projectsData, employeesData] = await Promise.all([
          tasksResponse.json(),
          projectsResponse.json(),
          employeesResponse.json(),
        ]);

        if (
          !tasksResponse.ok ||
          !projectsResponse.ok ||
          !employeesResponse.ok ||
          !tasksData.success ||
          !projectsData.success ||
          !employeesData.success
        ) {
          throw new Error("Unable to load task management data");
        }

        setTasks(tasksData.tasks || []);
        setProjects(projectsData.projects || []);
        setEmployees(employeesData.employees || []);
      } catch (error) {
        if (error.name !== "AbortError") {
          toast.error(error.message || "Failed to load page data");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadPageData();

    return () => controller.abort();
  }, []);

  const stats = useMemo(() => {
    return {
      total: tasks.length,
      todo: tasks.filter((task) => task.status === "todo").length,
      inProgress: tasks.filter((task) => task.status === "in_progress").length,
      completed: tasks.filter((task) => task.status === "completed").length,
      urgent: tasks.filter(
        (task) => task.priority === "urgent" && task.status !== "completed"
      ).length,
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        String(task.title || "").toLowerCase().includes(searchValue) ||
        String(task.projectName || "").toLowerCase().includes(searchValue) ||
        String(task.assignedToName || "").toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "all" || task.status === statusFilter;

      const matchesPriority =
        priorityFilter === "all" || task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, search, statusFilter, priorityFilter]);

  function openCreateModal() {
    setEditingTask(null);
    setForm(initialForm);
    setIsModalOpen(true);
  }

  function openEditModal(task) {
    setEditingTask(task);

    setForm({
      title: task.title || "",
      description: task.description || "",
      projectId: String(task.projectId || ""),
      assignedTo: String(task.assignedTo || ""),
      status: task.status || "todo",
      priority: task.priority || "medium",
      dueDate: task.dueDate || "",
    });

    setIsModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setIsModalOpen(false);
    setEditingTask(null);
    setForm(initialForm);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.projectId || !form.assignedTo) {
      toast.error("Please select a project and an employee");
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      projectId: Number(form.projectId),
      assignedTo: Number(form.assignedTo),
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate || null,
    };

    setSaving(true);

    try {
      const url = editingTask
        ? `/api/admin/tasks/${editingTask.id}`
        : "/api/admin/tasks";

      const response = await fetch(url, {
        method: editingTask ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to save task");
      }

      toast.success(
        editingTask
          ? "Task updated successfully"
          : "Task created successfully"
      );

      setIsModalOpen(false);
      setEditingTask(null);
      setForm(initialForm);

      await fetchTasks();
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(task) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${task.title}"?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/tasks/${task.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to delete task");
      }

      toast.success("Task deleted successfully");
      await fetchTasks();
    } catch (error) {
      toast.error(error.message || "Failed to delete task");
    }
  }

  async function handleRefresh() {
    setLoading(true);
    await fetchTasks();
    setLoading(false);
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setPriorityFilter("all");
  }

  const hasActiveFilters =
    search !== "" || statusFilter !== "all" || priorityFilter !== "all";

  return (
    <div className="min-h-screen bg-[#080d1b] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-blue-500/10 blur-[130px]" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-cyan-500/[0.06] blur-[120px]" />
      </div>

      <div className="relative">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#080d1b]/85 backdrop-blur-2xl">
          <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-10">
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-slate-400 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-white"
                title="Back to Dashboard"
              >
                <ArrowLeft size={19} />
              </Link>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/20 bg-gradient-to-br from-violet-500/20 to-blue-500/20 text-violet-300 shadow-lg shadow-violet-950/20">
                <ListTodo size={22} />
              </div>

              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">
                  Task Management
                </h1>
                <p className="text-xs text-slate-500 sm:text-sm">
                  Create, assign and manage organization tasks
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/[0.08] disabled:opacity-50 sm:px-4"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-3 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:brightness-110 sm:px-4"
              >
                <Plus size={17} />
                <span>Create Task</span>
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10">
          {/* Welcome section */}
          <div className="mb-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
              Workspace / Administration
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Manage your tasks
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Keep track of assignments, deadlines and team progress.
            </p>
          </div>

          {/* Statistics */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Tasks"
              value={stats.total}
              icon={ClipboardList}
              accent="bg-violet-500"
              description="All organization tasks"
            />

            <StatCard
              title="To Do"
              value={stats.todo}
              icon={Clock3}
              accent="bg-slate-500"
              description="Waiting to be started"
            />

            <StatCard
              title="In Progress"
              value={stats.inProgress}
              icon={CircleDot}
              accent="bg-blue-500"
              description="Currently being worked on"
            />

            <StatCard
              title="Completed"
              value={stats.completed}
              icon={CheckCircle2}
              accent="bg-emerald-500"
              description="Successfully finished"
            />
          </div>

          {/* Urgent task notice */}
          {stats.urgent > 0 && (
            <div className="mb-7 flex flex-wrap items-center gap-3 rounded-2xl border border-rose-400/20 bg-rose-500/[0.07] px-5 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
                <AlertCircle size={21} />
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold text-rose-300">
                  Attention required
                </p>
                <p className="mt-1 text-xs text-rose-200/70">
                  You have {stats.urgent} urgent unfinished
                  {stats.urgent === 1 ? " task" : " tasks"} that need attention.
                </p>
              </div>

              <span className="rounded-full border border-rose-400/20 bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-300">
                {stats.urgent} Urgent
              </span>
            </div>
          )}

          {/* Task section */}
          <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111b31]/75 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="border-b border-white/[0.07] p-5 sm:p-6">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-1 rounded-full bg-gradient-to-b from-violet-400 to-blue-500" />
                    <h2 className="text-lg font-bold text-white">
                      All Tasks
                    </h2>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    View and manage tasks assigned to your team.
                  </p>
                </div>

                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-400">
                  {filteredTasks.length} results
                </span>
              </div>

              {/* Search and filters */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="relative">
                  <Search
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search tasks, projects, employees..."
                    className={`${inputClass} pl-10`}
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className={inputClass}
                >
                  <option value="all">All Statuses</option>
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>

                <select
                  value={priorityFilter}
                  onChange={(event) => setPriorityFilter(event.target.value)}
                  className={inputClass}
                >
                  <option value="all">All Priorities</option>
                  {priorityOptions.map((priority) => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>

              {hasActiveFilters && (
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="flex items-center gap-2 text-xs text-slate-500">
                    <Filter size={14} />
                    Filters are active
                  </p>

                  <button
                    onClick={clearFilters}
                    className="text-xs font-semibold text-violet-400 transition hover:text-violet-300"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>

            {/* Task table */}
            {loading ? (
              <div className="flex min-h-72 flex-col items-center justify-center gap-3">
                <Loader2
                  size={32}
                  className="animate-spin text-violet-400"
                />
                <p className="text-sm text-slate-500">
                  Loading tasks...
                </p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="flex min-h-80 flex-col items-center justify-center px-5 text-center">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-500">
                  <ListTodo size={30} />
                </div>

                <h3 className="text-lg font-semibold text-white">
                  No tasks found
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  {tasks.length === 0
                    ? "You haven't created any tasks yet. Create your first task to get started."
                    : "No tasks match your current search or filters. Try adjusting them."}
                </p>

                {tasks.length === 0 ? (
                  <button
                    onClick={openCreateModal}
                    className="mt-5 flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
                  >
                    <Plus size={17} />
                    Create First Task
                  </button>
                ) : hasActiveFilters ? (
                  <button
                    onClick={clearFilters}
                    className="mt-5 rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.06]"
                  >
                    Clear Filters
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-left">
                  <thead>
                    <tr className="border-b border-white/[0.07] bg-white/[0.025] text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                      <th className="px-6 py-4">Task Details</th>
                      <th className="px-6 py-4">Project</th>
                      <th className="px-6 py-4">Assigned To</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Priority</th>
                      <th className="px-6 py-4">Due Date</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/[0.05]">
                    {filteredTasks.map((task) => (
                      <tr
                        key={task.id}
                        className="transition hover:bg-white/[0.025]"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-500/10 text-violet-300">
                              <ListTodo size={17} />
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-56 truncate text-sm font-semibold text-slate-100">
                                {task.title}
                              </p>
                              <p className="mt-1 max-w-60 truncate text-xs text-slate-500">
                                {task.description || "No description"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-sm text-slate-300">
                            <FolderKanban
                              size={15}
                              className="shrink-0 text-violet-400"
                            />
                            <span className="max-w-36 truncate">
                              {task.projectName || "No project"}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-blue-400/20 bg-blue-500/10 text-blue-300">
                              <User size={16} />
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-36 truncate text-sm font-medium text-slate-200">
                                {task.assignedToName || "Unassigned"}
                              </p>
                              <p className="max-w-36 truncate text-xs text-slate-500">
                                {task.assignedToEmail || ""}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusStyle(task.status)}`}
                          >
                            {formatLabel(task.status)}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${getPriorityStyle(task.priority)}`}
                          >
                            {formatLabel(task.priority)}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 whitespace-nowrap text-sm text-slate-400">
                            <CalendarDays
                              size={15}
                              className="text-slate-500"
                            />
                            {formatDate(task.dueDate)}
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEditModal(task)}
                              title="Edit Task"
                              className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5 text-slate-400 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-violet-300"
                            >
                              <Pencil size={15} />
                            </button>

                            <button
                              onClick={() => handleDelete(task)}
                              title="Delete Task"
                              className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5 text-slate-400 transition hover:border-rose-400/30 hover:bg-rose-500/10 hover:text-rose-300"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.07] px-5 py-4 sm:px-6">
              <p className="text-xs text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-300">
                  {filteredTasks.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-300">
                  {tasks.length}
                </span>{" "}
                tasks
              </p>

              <p className="text-xs text-slate-600">
                WorkSphere Task Management
              </p>
            </div>
          </section>
        </main>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-md">
          <div className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#111b31] shadow-2xl shadow-black/50">
            <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
                  {editingTask ? <Pencil size={19} /> : <Plus size={20} />}
                </div>

                <div>
                  <h2 className="text-lg font-bold text-white">
                    {editingTask ? "Edit Task" : "Create New Task"}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Enter the task details below.
                  </p>
                </div>
              </div>

              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-xl border border-white/10 p-2 text-slate-400 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
                title="Close"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FormField label="Task Title *" className="sm:col-span-2">
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    minLength={3}
                    maxLength={150}
                    placeholder="Enter task title"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Description" className="sm:col-span-2">
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    maxLength={1000}
                    placeholder="Describe the task..."
                    className={`${inputClass} resize-none`}
                  />
                </FormField>

                <FormField label="Select Project *">
                  <select
                    name="projectId"
                    value={form.projectId}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  >
                    <option value="">Choose Project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>

                  {projects.length === 0 && (
                    <p className="mt-2 text-xs text-rose-400">
                      Create a project before assigning a task.
                    </p>
                  )}
                </FormField>

                <FormField label="Assign Employee *">
                  <select
                    name="assignedTo"
                    value={form.assignedTo}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  >
                    <option value="">Choose Employee</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.fullName} ({employee.roleName})
                      </option>
                    ))}
                  </select>

                  {employees.length === 0 && (
                    <p className="mt-2 text-xs text-rose-400">
                      No approved employees are available.
                    </p>
                  )}
                </FormField>

                <FormField label="Task Status">
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    {statusOptions.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Priority">
                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    {priorityOptions.map((priority) => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Due Date" className="sm:col-span-2">
                  <input
                    type="date"
                    name="dueDate"
                    value={form.dueDate}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </FormField>
              </div>

              <div className="mt-7 flex flex-col-reverse gap-3 border-t border-white/[0.08] pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.06] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving || projects.length === 0 || employees.length === 0
                  }
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingTask ? <Pencil size={16} /> : <Plus size={17} />}
                      {editingTask ? "Update Task" : "Create Task"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
