
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

  // Fetch employees and roles when page loads
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
          throw new Error(
            roleResult.message || "Unable to fetch roles."
          );
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
        employee.fullName.toLowerCase().includes(searchText) ||
        employee.email.toLowerCase().includes(searchText);

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
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/admin"
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>

            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Employee Management
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage employee information, roles and account status.
            </p>
          </div>

          <button
            onClick={fetchEmployees}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={isRefreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Employees"
            value={employees.length}
            icon={<Users size={21} />}
            color="indigo"
          />

          <StatCard
            title="Active Employees"
            value={activeCount}
            icon={<UserCheck size={21} />}
            color="emerald"
          />

          <StatCard
            title="Inactive Employees"
            value={inactiveCount}
            icon={<UserX size={21} />}
            color="rose"
          />
        </div>

        {/* Search and Filters */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-3 md:grid-cols-3">

            <div className="relative md:col-span-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search name or email..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
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
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

          </div>
        </div>

        {/* Employee Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-bold text-slate-900">
                All Employees
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {filteredEmployees.length} employees found
              </p>
            </div>

            <ShieldCheck size={21} className="text-indigo-500" />
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-sm text-slate-500">
              Loading employees...
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="p-12 text-center">
              <Users
                size={35}
                className="mx-auto mb-3 text-slate-300"
              />

              <p className="font-semibold text-slate-700">
                No employees found
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">

                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">
                      Employee
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Role
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Status
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Joined
                    </th>

                    <th className="px-5 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredEmployees.map((employee) => (
                    <tr
                      key={employee.id}
                      className="hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 font-bold text-indigo-600">
                            {employee.fullName.charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-800">
                              {employee.fullName}
                            </p>

                            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                              <Mail size={13} />
                              {employee.email}
                            </p>
                          </div>

                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                          {employee.roleName}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                            employee.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {employee.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-500">
                        {new Date(
                          employee.createdAt
                        ).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">

                          <button
                            onClick={() =>
                              setEditingEmployee({
                                ...employee,
                                roleId: String(employee.roleId),
                              })
                            }
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                            title="Edit employee"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            onClick={() => handleStatusChange(employee)}
                            disabled={updatingId === employee.id}
                            className={`rounded-lg border p-2 transition disabled:opacity-50 ${
                              employee.isActive
                                ? "border-rose-200 text-rose-600 hover:bg-rose-50"
                                : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                            }`}
                            title={
                              employee.isActive
                                ? "Deactivate employee"
                                : "Activate employee"
                            }
                          >
                            {employee.isActive ? (
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

        </div>

        {/* Edit Employee Modal */}
        {editingEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">

            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">

              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Edit Employee
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Update employee details and role.
                  </p>
                </div>

                <button
                  onClick={() => setEditingEmployee(null)}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                  aria-label="Close edit form"
                >
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={handleUpdateEmployee}
                className="space-y-4"
              >

                {/* Full Name */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
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
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
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
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Role Dropdown */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
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
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                  >
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Form Buttons */}
                <div className="flex gap-3 pt-3">

                  <button
                    type="button"
                    onClick={() => setEditingEmployee(null)}
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving || roles.length === 0}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                  >
                    <Save size={16} />

                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>

                </div>

              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// Statistics Card Component
function StatCard({ title, value, icon, color }) {
  const colorClasses = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    rose: "bg-rose-50 text-rose-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        <div className={`rounded-xl p-3 ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>

      <p className="mt-4 text-3xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}
