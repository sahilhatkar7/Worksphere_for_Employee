
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  Sparkles,
  CalendarDays,
} from "lucide-react";
import { toast } from "sonner";

function StatCard({ title, value, icon: Icon, accent, glow, subtitle }) {
  return (
    <div
      className={`group rounded-2xl border border-white/[0.09] bg-white/[0.045] p-5 shadow-xl ${glow} backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07]`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">
            {value ?? 0}
          </h2>
          <p className="mt-2 text-xs text-slate-500">{subtitle}</p>
        </div>

        <div className={`rounded-xl bg-gradient-to-br ${accent} p-3 shadow-lg`}>
          <Icon size={23} className="text-white" />
        </div>
      </div>

      <div className="mt-5 h-1 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={`h-full w-1/2 rounded-full bg-gradient-to-r ${accent} transition-all duration-500 group-hover:w-3/4`}
        />
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

  function handleRefresh() {
    setLoading(true);
    loadDashboard();
  }

  const employees = data?.employees || [];
  const roleCounts = data?.roleCounts || [];

  const filteredEmployees = employees.filter((employee) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      (employee.fullName || "").toLowerCase().includes(searchText) ||
      (employee.email || "").toLowerCase().includes(searchText);

    const matchesRole =
      roleFilter === "all" || employee.roleName === roleFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && employee.isActive) ||
      (statusFilter === "inactive" && !employee.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const statCards = [
    {
      title: "Total Employees",
      value: data?.stats?.totalEmployees,
      icon: Users,
      accent: "from-purple-500 to-indigo-500",
      glow: "shadow-purple-500/10",
      subtitle: "Approved accounts",
    },
    {
      title: "Active Employees",
      value: data?.stats?.activeEmployees,
      icon: UserCheck,
      accent: "from-emerald-400 to-teal-400",
      glow: "shadow-emerald-500/10",
      subtitle: "Currently active",
    },
    {
      title: "Inactive Employees",
      value: data?.stats?.inactiveEmployees,
      icon: UserX,
      accent: "from-rose-500 to-red-500",
      glow: "shadow-rose-500/10",
      subtitle: "Deactivated accounts",
    },
    {
      title: "Pending Approvals",
      value: data?.stats?.pendingApprovals,
      icon: Clock,
      accent: "from-amber-400 to-orange-400",
      glow: "shadow-amber-500/10",
      subtitle: "Waiting for approval",
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080b18] text-slate-100">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-purple-600/15 blur-[120px]" />
        <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-blue-600/15 blur-[130px]" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#080b18]/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/20">
              <BriefcaseBusiness size={23} className="text-white" />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                WorkSphere
              </h1>
              <p className="text-xs text-slate-400">HR Manager Workspace</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:border-purple-400/30 hover:bg-white/[0.08] disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <Link
              href="/chat"
              className="flex items-center gap-2 rounded-xl border border-purple-400/20 bg-purple-500/10 px-3 py-2.5 text-sm font-medium text-purple-200 transition hover:border-purple-400/40 hover:bg-purple-500/20"
            >
              <MessageCircle size={16} />
              <span className="hidden sm:inline">TeamSpace</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-3 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/10 transition hover:from-rose-600 hover:to-red-700"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome banner */}
        <section className="mb-8">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#241b46]/90 via-[#191b40]/90 to-[#17264a]/90 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
            <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-purple-500/20 blur-[90px]" />
            <div className="pointer-events-none absolute bottom-0 right-1/4 h-40 w-40 rounded-full bg-blue-500/20 blur-[80px]" />

            <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-400/10 px-3 py-1.5 text-xs font-semibold text-purple-200">
                  <Sparkles size={13} />
                  HUMAN RESOURCES
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Welcome, {data?.user?.fullName || "HR Manager"}
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
                  Monitor your workforce, explore employee information and
                  stay updated with your organization.
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/20">
                  <UserRound size={23} className="text-white" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    {data?.user?.fullName || "HR Manager"}
                  </p>
                  <p className="text-xs text-slate-400">HR Manager Account</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Loading */}
        {loading && !data && (
          <div className="flex min-h-72 items-center justify-center rounded-2xl border border-white/[0.09] bg-white/[0.045] backdrop-blur-xl">
            <div className="text-center">
              <RefreshCw
                className="mx-auto animate-spin text-purple-400"
                size={30}
              />
              <p className="mt-4 text-sm text-slate-400">
                Loading HR dashboard...
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-400/20 bg-red-500/[0.07] p-5 text-sm text-red-200 backdrop-blur-xl sm:flex-row sm:items-center">
            <AlertCircle size={21} className="shrink-0 text-red-400" />
            <span>{error}</span>
            <button
              onClick={handleRefresh}
              className="font-semibold text-red-300 underline sm:ml-auto"
            >
              Retry
            </button>
          </div>
        )}

        {data && (
          <>
            {/* Statistics */}
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {statCards.map((card) => (
                <StatCard key={card.title} {...card} />
              ))}
            </section>

            {/* Role distribution */}
            <section className="mt-8 rounded-2xl border border-white/[0.09] bg-white/[0.045] p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl sm:p-6">
              <div className="mb-6 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-300">
                      <BriefcaseBusiness size={19} />
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      Employees by Role
                    </h3>
                  </div>

                  <p className="mt-2 text-sm text-slate-400">
                    Workforce distribution across departments and roles.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {roleCounts.map((item) => (
                  <div
                    key={item.roleName}
                    className="rounded-xl border border-white/[0.07] bg-white/[0.035] p-4 transition hover:border-purple-400/20 hover:bg-white/[0.06]"
                  >
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <UserRound size={17} className="text-purple-300" />
                      {item.roleName}
                    </div>

                    <p className="mt-4 text-2xl font-bold text-white">
                      {item.total}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">Employees</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Employee directory */}
            <section className="mt-8 overflow-hidden rounded-2xl border border-white/[0.09] bg-white/[0.045] shadow-2xl shadow-black/20 backdrop-blur-2xl">
              <div className="border-b border-white/[0.08] p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                        <Users size={19} />
                      </div>

                      <h3 className="text-lg font-semibold text-white">
                        Employee Directory
                      </h3>
                    </div>

                    <p className="mt-2 text-sm text-slate-400">
                      View and search approved employee accounts.
                    </p>
                  </div>

                  <span className="rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-300">
                    {employees.length} Employees
                  </span>
                </div>

                {/* Filters */}
                <div className="mt-6 grid gap-3 md:grid-cols-3">
                  <div className="relative">
                    <Search
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                    />

                    <input
                      type="text"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search name or email..."
                      className="w-full rounded-xl border border-white/10 bg-[#0b1020]/80 py-3 pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-500/10"
                    />
                  </div>

                  <select
                    value={roleFilter}
                    onChange={(event) => setRoleFilter(event.target.value)}
                    className="rounded-xl border border-white/10 bg-[#0b1020]/80 px-3 py-3 text-sm text-slate-300 outline-none transition focus:border-purple-400/50"
                  >
                    <option value="all">All Roles</option>
                    {roleCounts.map((item) => (
                      <option key={item.roleName} value={item.roleName}>
                        {item.roleName}
                      </option>
                    ))}
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="rounded-xl border border-white/10 bg-[#0b1020]/80 px-3 py-3 text-sm text-slate-300 outline-none transition focus:border-purple-400/50"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Employee table */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[750px] text-left text-sm">
                  <thead className="bg-white/[0.025] text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Employee</th>
                      <th className="px-6 py-4 font-semibold">Email</th>
                      <th className="px-6 py-4 font-semibold">Role</th>
                      <th className="px-6 py-4 font-semibold">Joined Date</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/[0.06]">
                    {filteredEmployees.map((employee) => (
                      <tr
                        key={employee.id}
                        className="transition hover:bg-white/[0.035]"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 font-semibold text-purple-200">
                              {(employee.fullName || "?")
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <span className="font-semibold text-slate-100">
                              {employee.fullName}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-slate-400">
                          {employee.email}
                        </td>

                        <td className="px-6 py-4">
                          <span className="rounded-full bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-300">
                            {employee.roleName}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-slate-400">
                            <CalendarDays size={15} className="text-slate-500" />
                            {formatDate(employee.createdAt)}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                              employee.isActive
                                ? "bg-emerald-400/10 text-emerald-300"
                                : "bg-red-400/10 text-red-300"
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
                          className="px-6 py-16 text-center"
                        >
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400">
                            <Search size={22} />
                          </div>

                          <p className="mt-4 font-semibold text-slate-300">
                            No employees found
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            Try changing your search or filters.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-white/[0.08] px-6 py-4 text-sm text-slate-500">
                Showing {filteredEmployees.length} of {employees.length} employees
              </div>
            </section>

            {/* Footer */}
            <footer className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-white/[0.07] py-5 text-xs text-slate-500 sm:flex-row">
              <p>
                © {new Date().getFullYear()} WorkSphere. All rights reserved.
              </p>

              <p className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                HR Manager Workspace
              </p>
            </footer>
          </>
        )}
      </div>
    </main>
  );
}
