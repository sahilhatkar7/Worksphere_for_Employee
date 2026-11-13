
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
  Filter,
  Layers3,
  CalendarCheck,
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
  planning: "border-blue-400/20 bg-blue-400/10 text-blue-300",
  active: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  on_hold: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  completed: "border-violet-400/20 bg-violet-400/10 text-violet-300",
  cancelled: "border-rose-400/20 bg-rose-400/10 text-rose-300",
};

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#0b1427] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/10";

function formatDate(value) {
  if (!value) return "Not set";

  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusLabel(status) {
  return (
    statusOptions.find((item) => item.value === status)?.label || status
  );
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

function FormField({ label, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </label>
      {children}
    </div>
  );
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
    setIsLoading(true);

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
        String(project.name || "").toLowerCase().includes(searchText) ||
        String(project.description || "").toLowerCase().includes(searchText) ||
        String(project.createdByName || "").toLowerCase().includes(searchText);

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

    if (form.startDate && form.dueDate && form.dueDate < form.startDate) {
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
      const response = await fetch(`/api/admin/projects/${project.id}`, {
        method: "DELETE",
      });

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

  const hasActiveFilters = search !== "" || statusFilter !== "all";

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
  }

  return (
    <div className="min-h-screen bg-[#080d1b] text-white">
      {/* Background effects */}
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
                <FolderKanban size={22} />
              </div>

              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">
                  Project Management
                </h1>
                <p className="text-xs text-slate-500 sm:text-sm">
                  Organize and manage your organization&apos;s projects
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={fetchProjects}
                disabled={isLoading}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/[0.08] disabled:opacity-50 sm:px-4"
              >
                <RefreshCw
                  size={16}
                  className={isLoading ? "animate-spin" : ""}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-3 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:brightness-110 sm:px-4"
              >
                <Plus size={17} />
                Create Project
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10">
          {/* Page introduction */}
          <div className="mb-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
              Workspace / Administration
            </p>

            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Manage your projects
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Track project timelines, organize work and monitor progress.
            </p>
          </div>

          {/* Statistics */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Projects"
              value={stats.total}
              icon={Layers3}
              accent="bg-violet-500"
              description="All organization projects"
            />

            <StatCard
              title="Active Projects"
              value={stats.active}
              icon={Clock3}
              accent="bg-emerald-500"
              description="Currently in progress"
            />

            <StatCard
              title="Planning"
              value={stats.planning}
              icon={CircleAlert}
              accent="bg-amber-500"
              description="Projects being planned"
            />

            <StatCard
              title="Completed"
              value={stats.completed}
              icon={CheckCircle2}
              accent="bg-blue-500"
              description="Successfully finished"
            />
          </div>

          {/* Projects section */}
          <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111b31]/75 shadow-2xl shadow-black/20 backdrop-blur-xl">
            {/* Filters */}
            <div className="border-b border-white/[0.07] p-5 sm:p-6">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-1 rounded-full bg-gradient-to-b from-violet-400 to-blue-500" />
                    <h2 className="text-lg font-bold text-white">
                      All Projects
                    </h2>
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    {filteredProjects.length} projects found
                  </p>
                </div>

                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-400">
                  {projects.length} total
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="relative">
                  <Search
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    type="text"
                    placeholder="Search projects, descriptions, creators..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
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
              </div>

              {hasActiveFilters && (
                <div className="mt-3 flex items-center justify-between">
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

            {/* Projects table */}
            {isLoading ? (
              <div className="flex min-h-72 flex-col items-center justify-center gap-3">
                <Loader2
                  size={32}
                  className="animate-spin text-violet-400"
                />
                <p className="text-sm text-slate-500">
                  Loading projects...
                </p>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="flex min-h-80 flex-col items-center justify-center px-5 text-center">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-500">
                  <FolderKanban size={30} />
                </div>

                <h3 className="text-lg font-semibold text-white">
                  No projects found
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  {projects.length === 0
                    ? "You haven't created any projects yet. Create your first project to get started."
                    : "No projects match your current search or filters. Try adjusting them."}
                </p>

                {projects.length === 0 ? (
                  <button
                    onClick={openCreateModal}
                    className="mt-5 flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
                  >
                    <Plus size={17} />
                    Create First Project
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
                <table className="w-full min-w-[1000px] text-left">
                  <thead>
                    <tr className="border-b border-white/[0.07] bg-white/[0.025] text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                      <th className="px-6 py-4">Project</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Start Date</th>
                      <th className="px-6 py-4">Due Date</th>
                      <th className="px-6 py-4">Created By</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/[0.05]">
                    {filteredProjects.map((project) => (
                      <tr
                        key={project.id}
                        className="transition hover:bg-white/[0.025]"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-500/10 text-violet-300">
                              <FolderKanban size={18} />
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-64 truncate text-sm font-semibold text-slate-100">
                                {project.name}
                              </p>

                              <p className="mt-1 max-w-64 truncate text-xs text-slate-500">
                                {project.description || "No description provided"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${
                              statusStyles[project.status] ||
                              "border-slate-500/20 bg-slate-500/10 text-slate-300"
                            }`}
                          >
                            {getStatusLabel(project.status)}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 whitespace-nowrap text-sm text-slate-400">
                            <CalendarDays
                              size={15}
                              className="text-slate-500"
                            />
                            {formatDate(project.startDate)}
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 whitespace-nowrap text-sm text-slate-400">
                            <CalendarCheck
                              size={15}
                              className="text-slate-500"
                            />
                            {formatDate(project.dueDate)}
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-sm text-slate-300">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-400/20 bg-blue-500/10 text-xs font-semibold text-blue-300">
                              {(project.createdByName || "A")
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                            <span className="max-w-36 truncate">
                              {project.createdByName || "Admin"}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEditModal(project)}
                              title="Edit project"
                              className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5 text-slate-400 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-violet-300"
                            >
                              <Pencil size={15} />
                            </button>

                            <button
                              onClick={() => handleDelete(project)}
                              title="Delete project"
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
                  {filteredProjects.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-300">
                  {projects.length}
                </span>{" "}
                projects
              </p>

              <p className="text-xs text-slate-600">
                WorkSphere Project Management
              </p>
            </div>
          </section>
        </main>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-md">
          <div className="my-auto w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-[#111b31] shadow-2xl shadow-black/50">
            <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
                  {editingProject ? <Pencil size={19} /> : <Plus size={20} />}
                </div>

                <div>
                  <h2 className="text-lg font-bold text-white">
                    {editingProject ? "Edit Project" : "Create Project"}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Enter the project information below.
                  </p>
                </div>
              </div>

              <button
                onClick={closeModal}
                disabled={isSaving}
                className="rounded-xl border border-white/10 p-2 text-slate-400 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
                title="Close"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <FormField label="Project Name *">
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  minLength={3}
                  maxLength={150}
                  placeholder="Enter project name"
                  className={inputClass}
                />
              </FormField>

              <FormField label="Description">
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  maxLength={1000}
                  rows={3}
                  placeholder="Describe this project..."
                  className={`${inputClass} resize-none`}
                />
              </FormField>

              <FormField label="Project Status *">
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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Start Date">
                  <div className="relative">
                    <CalendarDays
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                    />
                    <input
                      type="date"
                      name="startDate"
                      value={form.startDate}
                      onChange={handleChange}
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </FormField>

                <FormField label="Due Date">
                  <div className="relative">
                    <CalendarDays
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                    />
                    <input
                      type="date"
                      name="dueDate"
                      value={form.dueDate}
                      onChange={handleChange}
                      min={form.startDate || undefined}
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </FormField>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-white/[0.08] pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSaving}
                  className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.06] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:brightness-110 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingProject ? <Pencil size={16} /> : <Plus size={17} />}
                      {editingProject ? "Save Changes" : "Create Project"}
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
