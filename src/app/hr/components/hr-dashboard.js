
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  RefreshCw,
  LogOut,
  Search,
  BriefcaseBusiness,
  UserRound,
  AlertCircle,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

function StatCard({ title, value, icon: Icon, color, subtitle }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            {value ?? 0}
          </h2>
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
  if (!date) return "Not available";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function HRDashboard() {
  const router = useRouter();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadDashboard = useCallback(async (signal) => {
    try {
      const response = await fetch("/api/hr/dashboard", {
        cache: "no-store",
        signal,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load HR dashboard.");
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

  const employees = data?.employees || [];

  const filteredEmployees = employees.filter((employee) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      employee.fullName.toLowerCase().includes(searchText) ||
      employee.email.toLowerCase().includes(searchText);

    const matchesRole =
      roleFilter === "all" || employee.roleName === roleFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && employee.isActive) ||
      (statusFilter === "inactive" && !employee.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-600 p-2.5 text-white">
              <BriefcaseBusiness size={23} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">WorkSphere</h1>
              <p className="text-xs text-slate-500">HR Manager Workspace</p>
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
              className="flex items-center gap-2 rounded-lg bg-purple-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-purple-700"
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
          <p className="text-sm font-medium text-purple-600">
            HUMAN RESOURCES
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            Welcome, {data?.user?.fullName || "HR Manager"}
          </h2>
          <p className="mt-2 text-slate-500">
            Monitor your workforce and view employee information.
          </p>
        </div>

        {loading && !data && (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
            Loading HR dashboard...
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
                title="Total Employees"
                value={data.stats.totalEmployees}
                icon={Users}
                color="bg-purple-50 text-purple-600"
                subtitle="Approved accounts"
              />
              <StatCard
                title="Active Employees"
                value={data.stats.activeEmployees}
                icon={UserCheck}
                color="bg-green-50 text-green-600"
                subtitle="Currently active"
              />
              <StatCard
                title="Inactive Employees"
                value={data.stats.inactiveEmployees}
                icon={UserX}
                color="bg-red-50 text-red-600"
                subtitle="Deactivated accounts"
              />
              <StatCard
                title="Pending Approvals"
                value={data.stats.pendingApprovals}
                icon={Clock}
                color="bg-amber-50 text-amber-600"
                subtitle="Waiting for approval"
              />
            </section>

            <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">
                    Employees by Role
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Workforce distribution across departments and roles
                  </p>
                </div>
                <BriefcaseBusiness className="text-purple-500" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {data.roleCounts.map((item) => (
                  <div
                    key={item.roleName}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <UserRound size={17} />
                      {item.roleName}
                    </div>
                    <p className="mt-3 text-2xl font-bold text-slate-900">
                      {item.total}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Employees
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">
                      Employee Directory
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      View approved employee accounts
                    </p>
                  </div>
                  <Users className="text-purple-500" />
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <div className="relative">
                    <Search
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search name or email..."
                      className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    />
                  </div>

                  <select
                    value={roleFilter}
                    onChange={(event) => setRoleFilter(event.target.value)}
                    className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-purple-500"
                  >
                    <option value="all">All Roles</option>
                    {data.roleCounts.map((item) => (
                      <option key={item.roleName} value={item.roleName}>
                        {item.roleName}
                      </option>
                    ))}
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-purple-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[750px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Employee</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Joined Date</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEmployees.map((employee) => (
                      <tr key={employee.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 font-semibold text-purple-700">
                              {employee.fullName.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-slate-800">
                              {employee.fullName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {employee.email}
                        </td>
                        <td className="px-6 py-4">
                          <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                            {employee.roleName}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {formatDate(employee.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              employee.isActive
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {employee.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))}

                    {filteredEmployees.length === 0 && (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-6 py-10 text-center text-slate-500"
                        >
                          No employees match your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-slate-100 px-6 py-4 text-sm text-slate-500">
                Showing {filteredEmployees.length} of {employees.length} employees
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
