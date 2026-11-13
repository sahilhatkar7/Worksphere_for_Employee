
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Users,
  RefreshCw,
  Mail,
  ShieldCheck,
  UserCheck,
  UserX,
  Pencil,
  X,
  Save,
  ArrowLeft,
  CalendarDays,
  BriefcaseBusiness,
  Activity,
  LoaderCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  // Fetch employees
  const fetchEmployees = useCallback(async () => {
    try {
      setIsRefreshing(true);

      const response = await fetch("/api/admin/employees", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to fetch employees.");
      }

      setEmployees(result.employees || []);
    } catch (error) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial employees and roles loading
  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      try {
        const [employeeResponse, roleResponse] = await Promise.all([
          fetch("/api/admin/employees", {
            cache: "no-store",
            signal: controller.signal,
          }),
          fetch("/api/admin/roles", {
            cache: "no-store",
            signal: controller.signal,
          }),
        ]);

        const [employeeResult, roleResult] = await Promise.all([
          employeeResponse.json(),
          roleResponse.json(),
        ]);

        if (!employeeResponse.ok) {
          throw new Error(
            employeeResult.message || "Unable to fetch employees."
          );
        }

        if (!roleResponse.ok) {
          throw new Error(roleResult.message || "Unable to fetch roles.");
        }

        setEmployees(employeeResult.employees || []);
        setRoles(roleResult.roles || []);
      } catch (error) {
        if (error.name !== "AbortError") {
          toast.error(error.message || "Something went wrong.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => controller.abort();
  }, []);

  // Search and filter employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        String(employee.fullName || "").toLowerCase().includes(searchText) ||
        String(employee.email || "").toLowerCase().includes(searchText);

      const matchesRole =
        roleFilter === "All" || employee.roleName === roleFilter;

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" && employee.isActive) ||
        (statusFilter === "Inactive" && !employee.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [employees, search, roleFilter, statusFilter]);

  // Update employee details
  async function handleUpdateEmployee(event) {
    event.preventDefault();

    if (!editingEmployee) return;

    setIsSaving(true);

    try {
      const response = await fetch("/api/admin/employees", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: editingEmployee.id,
          fullName: editingEmployee.fullName,
          email: editingEmployee.email,
          roleId: Number(editingEmployee.roleId),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to update employee.");
      }

      toast.success("Employee updated successfully.");
      setEditingEmployee(null);

      await fetchEmployees();
    } catch (error) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  }

  // Activate or deactivate employee
  async function handleStatusChange(employee) {
    const newStatus = !employee.isActive;

    setUpdatingId(employee.id);

    try {
      const response = await fetch("/api/admin/employees/status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: employee.id,
          isActive: newStatus,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to update status.");
      }

      toast.success(result.message);

      await fetchEmployees();
    } catch (error) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setUpdatingId(null);
    }
  }

  const activeCount = employees.filter(
    (employee) => employee.isActive
  ).length;

  const inactiveCount = employees.length - activeCount;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080d1b] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute -right-40 top-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl space-y-7">

        {/* Header */}
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <Link
              href="/admin"
              className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-violet-300"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
                <Users size={24} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
                  Administration
                </p>

                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Employee Management
                </h1>
              </div>
            </div>

            <p className="mt-3 max-w-xl text-sm text-slate-400">
              Manage your workforce, employee information, assigned roles and
              account access from one place.
            </p>
          </div>

          <button
            onClick={fetchEmployees}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-slate-200 shadow-lg shadow-black/10 backdrop-blur-xl transition hover:border-violet-400/40 hover:bg-violet-500/10 disabled:cursor-not-allowed disabled:opacity-50 sm:self-center"
          >
            <RefreshCw
              size={17}
              className={isRefreshing ? "animate-spin" : ""}
            />
            Refresh Data
          </button>
        </header>

        {/* Statistics */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Employees"
            value={employees.length}
            subtitle="Registered workforce"
            icon={<Users size={21} />}
            color="violet"
          />

          <StatCard
            title="Active Employees"
            value={activeCount}
            subtitle="Accounts currently active"
            icon={<UserCheck size={21} />}
            color="emerald"
          />

          <StatCard
            title="Inactive Employees"
            value={inactiveCount}
            subtitle="Accounts currently inactive"
            icon={<UserX size={21} />}
            color="rose"
          />
        </section>

        {/* Search and Filters */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2">
            <Activity size={18} className="text-violet-300" />

            <h2 className="font-semibold text-white">
              Search & Filters
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                placeholder="Search name or email..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0b1324] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/10"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0b1324] px-4 py-3 text-sm text-slate-200 outline-none transition focus:border-violet-400/50"
            >
              <option value="All">All Roles</option>

              {roles.map((role) => (
                <option key={role.id} value={role.name}>
                  {role.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0b1324] px-4 py-3 text-sm text-slate-200 outline-none transition focus:border-violet-400/50"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {(search || roleFilter !== "All" || statusFilter !== "All") && (
            <button
              onClick={() => {
                setSearch("");
                setRoleFilter("All");
                setStatusFilter("All");
              }}
              className="mt-4 text-xs font-semibold text-violet-300 transition hover:text-violet-200"
            >
              Clear all filters
            </button>
          )}
        </section>

        {/* Employee Table */}
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-xl shadow-black/10 backdrop-blur-xl">
          <div className="flex flex-col justify-between gap-3 border-b border-white/10 px-5 py-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-white">
                All Employees
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Showing {filteredEmployees.length} of {employees.length} employees
              </p>
            </div>

            <div className="flex items-center gap-2 self-start rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-300">
              <ShieldCheck size={15} />
              Workforce Directory
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 p-16 text-slate-400">
              <LoaderCircle size={30} className="animate-spin text-violet-400" />
              <p className="text-sm">Loading employee directory...</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-500">
                <Users size={30} />
              </div>

              <p className="font-semibold text-white">
                No employees found
              </p>

              <p className="mt-2 text-sm text-slate-400">
                Try changing your search or filter settings.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">
                      Employee
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Assigned Role
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Account Status
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Joined Date
                    </th>

                    <th className="px-5 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/[0.06]">
                  {filteredEmployees.map((employee) => (
                    <tr
                      key={employee.id}
                      className="transition hover:bg-white/[0.035]"
                    >
                      {/* Employee */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-gradient-to-br from-violet-500/20 to-blue-500/20 text-base font-bold text-violet-200">
                            {String(employee.fullName || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-100">
                              {employee.fullName}
                            </p>

                            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                              <Mail size={13} />
                              {employee.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-2 rounded-lg border border-violet-400/15 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-300">
                          <BriefcaseBusiness size={13} />
                          {employee.roleName}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                            employee.isActive
                              ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                              : "border-rose-400/20 bg-rose-500/10 text-rose-300"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              employee.isActive
                                ? "bg-emerald-400"
                                : "bg-rose-400"
                            }`}
                          />
                          {employee.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Joined */}
                      <td className="px-5 py-4 text-slate-400">
                        <span className="flex items-center gap-2 text-xs">
                          <CalendarDays size={14} className="text-slate-500" />
                          {employee.createdAt
                            ? new Date(employee.createdAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "—"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              setEditingEmployee({
                                ...employee,
                                roleId: String(employee.roleId),
                              })
                            }
                            className="rounded-xl border border-white/10 bg-white/[0.05] p-2.5 text-slate-400 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-violet-300"
                            title="Edit employee"
                            aria-label={`Edit ${employee.fullName}`}
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            onClick={() => handleStatusChange(employee)}
                            disabled={updatingId === employee.id}
                            className={`rounded-xl border p-2.5 transition disabled:cursor-not-allowed disabled:opacity-50 ${
                              employee.isActive
                                ? "border-rose-400/20 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                                : "border-emerald-400/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                            }`}
                            title={
                              employee.isActive
                                ? "Deactivate employee"
                                : "Activate employee"
                            }
                            aria-label={
                              employee.isActive
                                ? `Deactivate ${employee.fullName}`
                                : `Activate ${employee.fullName}`
                            }
                          >
                            {updatingId === employee.id ? (
                              <LoaderCircle size={16} className="animate-spin" />
                            ) : employee.isActive ? (
                              <UserX size={16} />
                            ) : (
                              <UserCheck size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Edit Employee Modal */}
        {editingEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
            <div className="my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#101a30] shadow-2xl shadow-black/40">
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-violet-300">
                    Employee Profile
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-white">
                    Edit Employee
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Update employee details and assigned role.
                  </p>
                </div>

                <button
                  onClick={() => setEditingEmployee(null)}
                  className="rounded-xl border border-white/10 bg-white/[0.05] p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                  aria-label="Close edit form"
                >
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={handleUpdateEmployee}
                className="space-y-5 p-6"
              >
                {/* Full Name */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-300">
                    Full Name
                  </label>

                  <input
                    required
                    minLength={3}
                    maxLength={100}
                    value={editingEmployee.fullName}
                    onChange={(event) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        fullName: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#0b1324] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/10"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-300">
                    Email Address
                  </label>

                  <input
                    required
                    type="email"
                    maxLength={255}
                    value={editingEmployee.email}
                    onChange={(event) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        email: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#0b1324] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/10"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-300">
                    Assigned Role
                  </label>

                  <select
                    required
                    value={editingEmployee.roleId}
                    onChange={(event) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        roleId: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#0b1324] px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400/50"
                  >
                    {roles.map((role) => (
                      <option
                        key={role.id}
                        value={role.id}
                        className="bg-[#101a30]"
                      >
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Buttons */}
                <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setEditingEmployee(null)}
                    className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving || roles.length === 0}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/20 transition hover:from-violet-500 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSaving ? (
                      <LoaderCircle size={17} className="animate-spin" />
                    ) : (
                      <Save size={17} />
                    )}

                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// Statistics Card
function StatCard({ title, value, subtitle, icon, color }) {
  const colorClasses = {
    violet: {
      icon: "border-violet-400/20 bg-violet-500/10 text-violet-300",
      glow: "bg-violet-500/10",
      value: "text-violet-200",
    },
    emerald: {
      icon: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
      glow: "bg-emerald-500/10",
      value: "text-emerald-200",
    },
    rose: {
      icon: "border-rose-400/20 bg-rose-500/10 text-rose-300",
      glow: "bg-rose-500/10",
      value: "text-rose-200",
    },
  };

  const styles = colorClasses[color];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/20">
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-3xl ${styles.glow}`}
      />

      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">
            {title}
          </p>

          <p className={`mt-3 text-3xl font-bold ${styles.value}`}>
            {value}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            {subtitle}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl border ${styles.icon}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
