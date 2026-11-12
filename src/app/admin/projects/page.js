
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FolderKanban,
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  CalendarDays,
  X,
  Clock3,
  CheckCircle2,
  CircleAlert,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

const initialForm = {
  name: "",
  description: "",
  status: "planning",
  startDate: "",
  dueDate: "",
};

const statusOptions = [
  { value: "planning", label: "Planning" },
  { value: "active", label: "Active" },
  { value: "on_hold", label: "On Hold" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const statusStyles = {
  planning: "bg-blue-50 text-blue-700",
  active: "bg-emerald-50 text-emerald-700",
  on_hold: "bg-amber-50 text-amber-700",
  completed: "bg-violet-50 text-violet-700",
  cancelled: "bg-red-50 text-red-700",
};

function formatDate(value) {
  if (!value) return "Not set";

  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [form, setForm] = useState(initialForm);

  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/projects", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to load projects.");
      }

      setProjects(result.projects || []);
    } catch (error) {
      toast.error(error.message || "Unable to load projects.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProjects() {
      try {
        const response = await fetch("/api/admin/projects", {
          cache: "no-store",
          signal: controller.signal,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Unable to load projects.");
        }

        setProjects(result.projects || []);
      } catch (error) {
        if (error.name !== "AbortError") {
          toast.error(error.message || "Unable to load projects.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadProjects();

    return () => controller.abort();
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        project.name.toLowerCase().includes(searchText) ||
        (project.description || "").toLowerCase().includes(searchText) ||
        (project.createdByName || "").toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "all" || project.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusFilter]);

  const stats = useMemo(
    () => ({
      total: projects.length,
      active: projects.filter((project) => project.status === "active").length,
      planning: projects.filter((project) => project.status === "planning").length,
      completed: projects.filter((project) => project.status === "completed").length,
    }),
    [projects]
  );

  function openCreateModal() {
    setEditingProject(null);
    setForm(initialForm);
    setIsModalOpen(true);
  }

  function openEditModal(project) {
    setEditingProject(project);

    setForm({
      name: project.name || "",
      description: project.description || "",
      status: project.status || "planning",
      startDate: project.startDate || "",
      dueDate: project.dueDate || "",
    });

    setIsModalOpen(true);
  }

  function closeModal() {
    if (isSaving) return;

    setIsModalOpen(false);
    setEditingProject(null);
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

    if (form.name.trim().length < 3) {
      toast.error("Project name must contain at least 3 characters.");
      return;
    }

    if (
      form.startDate &&
      form.dueDate &&
      form.dueDate < form.startDate
    ) {
      toast.error("Due date cannot be earlier than the start date.");
      return;
    }

    setIsSaving(true);

    try {
      const isEditing = Boolean(editingProject);

      const response = await fetch(
        isEditing
          ? `/api/admin/projects/${editingProject.id}`
          : "/api/admin/projects",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name.trim(),
            description: form.description.trim(),
            status: form.status,
            startDate: form.startDate || null,
            dueDate: form.dueDate || null,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to save project.");
      }

      toast.success(result.message || "Project saved successfully.");

      setIsModalOpen(false);
      setEditingProject(null);
      setForm(initialForm);

      await fetchProjects();
    } catch (error) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(project) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/admin/projects/${project.id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to delete project.");
      }

      toast.success(result.message || "Project deleted successfully.");

      setProjects((previous) =>
        previous.filter((item) => item.id !== project.id)
      );
    } catch (error) {
      toast.error(error.message || "Unable to delete project.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <Link
              href="/admin"
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
                <FolderKanban size={25} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Project Management
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Create, organize and manage your organization&apos;s projects.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Create Project
          </button>
        </div>

        {/* Statistics */}
        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Projects"
            value={stats.total}
            icon={<FolderKanban size={21} />}
            color="blue"
          />

          <StatCard
            title="Active Projects"
            value={stats.active}
            icon={<Clock3 size={21} />}
            color="emerald"
          />

          <StatCard
            title="Planning"
            value={stats.planning}
            icon={<CircleAlert size={21} />}
            color="amber"
          />

          <StatCard
            title="Completed"
            value={stats.completed}
            icon={<CheckCircle2 size={21} />}
            color="violet"
          />
        </div>

        {/* Projects Section */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Filters */}
          <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                All Projects
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {filteredProjects.length} projects found
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  placeholder="Search projects..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-64"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>

              <button
                onClick={fetchProjects}
                disabled={isLoading}
                title="Refresh projects"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw
                  size={17}
                  className={isLoading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">Project</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Start Date</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4">Created By</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-16 text-center">
                      <Loader2
                        size={28}
                        className="mx-auto animate-spin text-blue-600"
                      />
                      <p className="mt-3 text-sm text-slate-500">
                        Loading projects...
                      </p>
                    </td>
                  </tr>
                ) : filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-16 text-center">
                      <FolderKanban
                        size={38}
                        className="mx-auto text-slate-300"
                      />
                      <h3 className="mt-3 font-semibold text-slate-800">
                        No projects found
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Create a new project or change your search filters.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((project) => (
                    <tr
                      key={project.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">
                          {project.name}
                        </div>
                        <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                          {project.description || "No description provided"}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            statusStyles[project.status] ||
                            "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {statusOptions.find(
                            (item) => item.value === project.status
                          )?.label || project.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDate(project.startDate)}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDate(project.dueDate)}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {project.createdByName || "Admin"}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(project)}
                            title="Edit project"
                            className="rounded-lg border border-slate-200 p-2 text-blue-600 transition hover:bg-blue-50"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            onClick={() => handleDelete(project)}
                            title="Delete project"
                            className="rounded-lg border border-slate-200 p-2 text-red-600 transition hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <div className="my-auto w-full max-w-xl rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingProject ? "Edit Project" : "Create Project"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enter the project information below.
                </p>
              </div>

              <button
                onClick={closeModal}
                disabled={isSaving}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Project Name *
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  minLength={3}
                  maxLength={150}
                  placeholder="Enter project name"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  maxLength={1000}
                  rows={3}
                  placeholder="Describe this project..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Project Status *
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                >
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Start Date
                  </label>
                  <div className="relative">
                    <CalendarDays
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="date"
                      name="startDate"
                      value={form.startDate}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Due Date
                  </label>
                  <div className="relative">
                    <CalendarDays
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="date"
                      name="dueDate"
                      value={form.dueDate}
                      onChange={handleChange}
                      min={form.startDate || undefined}
                      className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSaving}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {isSaving && (
                    <Loader2 size={17} className="animate-spin" />
                  )}
                  {editingProject ? "Save Changes" : "Create Project"}
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
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    violet: "bg-violet-50 text-violet-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className={`rounded-xl p-3 ${colors[color]}`}>
          {icon}
        </div>
      </div>

      <p className="mt-4 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
