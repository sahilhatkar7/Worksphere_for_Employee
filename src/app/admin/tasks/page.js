
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
    todo: "bg-slate-100 text-slate-700",
    in_progress: "bg-blue-100 text-blue-700",
    in_review: "bg-amber-100 text-amber-700",
    completed: "bg-green-100 text-green-700",
  };

  return styles[status] || "bg-slate-100 text-slate-700";
}

function getPriorityStyle(priority) {
  const styles = {
    low: "bg-slate-100 text-slate-600",
    medium: "bg-blue-100 text-blue-700",
    high: "bg-orange-100 text-orange-700",
    urgent: "bg-red-100 text-red-700",
  };

  return styles[priority] || "bg-slate-100 text-slate-600";
}

function formatLabel(value) {
  const option = [...statusOptions, ...priorityOptions].find(
    (item) => item.value === value
  );

  return option?.label || value;
}

function formatDate(date) {
  if (!date) return "Not set";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

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

  // Initial page data
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

  // Task statistics
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

  // Search and filters
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        task.title?.toLowerCase().includes(searchValue) ||
        task.projectName?.toLowerCase().includes(searchValue) ||
        task.assignedToName?.toLowerCase().includes(searchValue);

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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"
              title="Back to Dashboard"
            >
              <ArrowLeft size={19} />
            </Link>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <ListTodo size={23} />
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Task Management
              </h1>
              <p className="text-sm text-slate-500">
                Create, assign and manage organization tasks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <Plus size={17} />
              Create Task
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        {/* Statistics */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Tasks"
            value={stats.total}
            icon={<ListTodo size={21} />}
            color="bg-indigo-100 text-indigo-600"
          />

          <StatCard
            title="To Do"
            value={stats.todo}
            icon={<Clock3 size={21} />}
            color="bg-slate-100 text-slate-600"
          />

          <StatCard
            title="In Progress"
            value={stats.inProgress}
            icon={<FolderKanban size={21} />}
            color="bg-blue-100 text-blue-600"
          />

          <StatCard
            title="Completed"
            value={stats.completed}
            icon={<CheckCircle2 size={21} />}
            color="bg-green-100 text-green-600"
          />
        </div>

        {/* Urgent task notice */}
        {stats.urgent > 0 && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={19} />
            <span>
              You have <strong>{stats.urgent}</strong> urgent unfinished
              {stats.urgent === 1 ? " task" : " tasks"}.
            </span>
          </div>
        )}

        {/* Task List */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5 sm:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-900">
                All Tasks
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                View and manage tasks assigned to your team.
              </p>
            </div>

            {/* Search and filters */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search tasks, projects, employees..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
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
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="all">All Priorities</option>
                {priorityOptions.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-slate-500">
              <Loader2 size={30} className="animate-spin text-indigo-600" />
              <p className="text-sm">Loading tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center px-5 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <ListTodo size={30} />
              </div>

              <h3 className="text-lg font-semibold text-slate-800">
                No tasks found
              </h3>

              <p className="mt-1 max-w-sm text-sm text-slate-500">
                {tasks.length === 0
                  ? "You haven't created any tasks yet. Create your first task to get started."
                  : "Try changing your search or filters to find tasks."}
              </p>

              {tasks.length === 0 && (
                <button
                  onClick={openCreateModal}
                  className="mt-5 flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  <Plus size={17} />
                  Create First Task
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-237.5 text-left">    
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4">Task</th>
                    <th className="px-6 py-4">Project</th>
                    <th className="px-6 py-4">Assigned To</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Priority</th>
                    <th className="px-6 py-4">Due Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredTasks.map((task) => (
                    <tr
                      key={task.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <p className="max-w-56 truncate text-sm font-semibold text-slate-900">
                          {task.title}
                        </p>
                        <p className="mt-1 max-w-56 truncate text-xs text-slate-500">
                          {task.description || "No description"}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-700">
                          {task.projectName}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                            <User size={15} />
                          </div>

                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              {task.assignedToName}
                            </p>
                            <p className="text-xs text-slate-500">
                              {task.assignedToEmail}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(task.status)}`}
                        >
                          {formatLabel(task.status)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getPriorityStyle(task.priority)}`}
                        >
                          {formatLabel(task.priority)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <CalendarDays
                            size={15}
                            className="text-slate-400"
                          />
                          {formatDate(task.dueDate)}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(task)}
                            title="Edit Task"
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            onClick={() => handleDelete(task)}
                            title="Delete Task"
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="border-t border-slate-200 px-6 py-4">
            <p className="text-sm text-slate-500">
              Showing <strong>{filteredTasks.length}</strong> of{" "}
              <strong>{tasks.length}</strong> tasks
            </p>
          </div>
        </section>
      </main>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingTask ? "Edit Task" : "Create New Task"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enter the task details below.
                </p>
              </div>

              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {/* Task title */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Task Title *
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    minLength={3}
                    maxLength={150}
                    placeholder="Enter task title"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    maxLength={1000}
                    placeholder="Describe the task..."
                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {/* Project */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Select Project *
                  </label>

                  <select
                    name="projectId"
                    value={form.projectId}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="">Choose Project</option>

                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>

                  {projects.length === 0 && (
                    <p className="mt-2 text-xs text-red-500">
                      Create a project before assigning a task.
                    </p>
                  )}
                </div>

                {/* Employee */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Assign Employee *
                  </label>

                  <select
                    name="assignedTo"
                    value={form.assignedTo}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="">Choose Employee</option>

                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.fullName} ({employee.roleName})
                      </option>
                    ))}
                  </select>

                  {employees.length === 0 && (
                    <p className="mt-2 text-xs text-red-500">
                      No approved employees are available.
                    </p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Task Status
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    {statusOptions.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Priority
                  </label>

                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    {priorityOptions.map((priority) => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Due date */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Due Date
                  </label>

                  <input
                    type="date"
                    name="dueDate"
                    value={form.dueDate}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              {/* Modal buttons */}
              <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving || projects.length === 0 || employees.length === 0
                  }
                  className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus size={17} />
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

function StatCard({ title, value, icon, color }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
        </div>

        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
