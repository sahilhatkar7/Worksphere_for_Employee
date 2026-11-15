
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/guards";
import {
  Users,
  UserCheck,
  FolderKanban,
  ClipboardList,
  Search,
  MessageCircle,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import AdminGlobalSearch from "./components/admin-global-search";
import Link from "next/link";
import DashboardStats from "./components/dashboard-stats";
import NotificationBell from "./components/notification-bell";
import AdminLogoutButton from "./components/admin-logout-button";
import AdminSidebar from "./components/admin-sidebar";

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.roleName !== "Admin") {
    redirect("/dashboard");
  }

  const quickActions = [
    {
      title: "Review Approvals",
      description: "Review and process new employee registration requests.",
      href: "/admin/approvals",
      icon: UserCheck,
      color: "text-blue-300",
      gradient: "from-blue-500/20 to-cyan-500/10",
      border: "hover:border-blue-400/40",
    },
    {
      title: "Manage Employees",
      description: "View and manage your organization's workforce.",
      href: "/admin/employees",
      icon: Users,
      color: "text-cyan-300",
      gradient: "from-cyan-500/20 to-blue-500/10",
      border: "hover:border-cyan-400/40",
    },
    {
      title: "Manage Projects",
      description: "Organize and monitor organization projects.",
      href: "/admin/projects",
      icon: FolderKanban,
      color: "text-violet-300",
      gradient: "from-violet-500/20 to-fuchsia-500/10",
      border: "hover:border-violet-400/40",
    },
    {
      title: "Manage Tasks",
      description: "Create, assign, and monitor tasks across projects.",
      href: "/admin/tasks",
      icon: ClipboardList,
      color: "text-emerald-300",
      gradient: "from-emerald-500/20 to-teal-500/10",
      border: "hover:border-emerald-400/40",
    },
    {
      title: "TeamSpace",
      description: "Connect and communicate with approved members.",
      href: "/chat",
      icon: MessageCircle,
      color: "text-pink-300",
      gradient: "from-pink-500/20 to-violet-500/10",
      border: "hover:border-pink-400/40",
    },
  ];

  return (
    <div className="min-h-screen bg-[#080d1b] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-violet-600/10 blur-[130px]" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-cyan-500/[0.06] blur-[120px]" />
      </div>

      <div className="relative flex min-h-screen">
        <AdminSidebar user={user} />

        <main className="min-w-0 flex-1">
          {/* Topbar */}
          <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/[0.08] bg-[#080d1b]/80 px-5 backdrop-blur-2xl sm:px-8">
            <div className="min-w-0 pl-12 lg:pl-0">
              <h2 className="text-lg font-bold text-white">
                Admin Dashboard
              </h2>
              <p className="hidden text-xs text-slate-500 sm:block">
                Your organization at a glance
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <AdminGlobalSearch />

              <NotificationBell />

              <div className="hidden h-9 w-px bg-white/10 sm:block" />

              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-white">
                  {user.fullName}
                </p>
                <p className="text-xs text-slate-500">
                  System Administrator
                </p>
              </div>

              <AdminLogoutButton />
            </div>
          </header>

          {/* Dashboard Content */}
          <div className="mx-auto max-w-[1500px] space-y-8 p-5 sm:p-8">
            {/* Welcome Heading */}
            <section>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
                  ADMINISTRATION
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Workspace overview
                </span>
              </div>

              <h1 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Welcome back,{" "}
                <span className="bg-gradient-to-r from-blue-300 via-violet-300 to-cyan-300 bg-clip-text text-transparent">
                  {user.fullName.split(" ")[0]}
                </span>
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Here&apos;s what&apos;s happening across your workspace today.
              </p>
            </section>

            {/* Statistics */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Organization Statistics
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Live overview of your organization
                  </p>
                </div>
                <Sparkles size={19} className="text-violet-400" />
              </div>

              <DashboardStats />
            </section>

            {/* Welcome Banner */}
            <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#172b55] via-[#22204b] to-[#171a36] p-6 shadow-2xl shadow-blue-950/20 sm:p-9">
              <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[35px] border-white/[0.04]" />
              <div className="pointer-events-none absolute -bottom-28 right-1/4 h-64 w-64 rounded-full bg-blue-500/20 blur-[80px]" />

              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3 py-1.5 text-xs font-medium text-blue-200">
                  <ShieldCheck size={14} />
                  WorkSphere Administration
                </div>

                <h2 className="mt-5 text-2xl font-bold leading-tight text-white sm:text-3xl">
                  Manage your workforce
                  <br />
                  <span className="bg-gradient-to-r from-blue-300 to-violet-300 bg-clip-text text-transparent">
                    smarter and faster.
                  </span>
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
                  Review employee registration requests, manage teams,
                  organize projects, and monitor your organization&apos;s
                  activities from one centralized dashboard.
                </p>

                <Link
                  href="/admin/employees"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:-translate-y-0.5 hover:shadow-blue-500/20"
                >
                  Explore Workforce
                  <ArrowUpRight size={17} />
                </Link>
              </div>
            </section>

            {/* Quick Actions */}
            <section>
              <div className="mb-5">
                <h2 className="text-lg font-bold text-white">
                  Quick Actions
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Access your most-used administration tools
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {quickActions.map((action) => {
                  const Icon = action.icon;

                  return (
                    <Link
                      key={action.title}
                      href={action.href}
                      className={`group relative overflow-hidden rounded-2xl border border-white/[0.09] bg-white/[0.04] p-5 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/[0.07] ${action.border}`}
                    >
                      <div
                        className={`absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gradient-to-br ${action.gradient} opacity-60 blur-2xl transition group-hover:opacity-100`}
                      />

                      <div className="relative flex items-start justify-between">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.08] bg-gradient-to-br ${action.gradient} ${action.color}`}
                        >
                          <Icon size={23} />
                        </div>

                        <ArrowUpRight
                          size={19}
                          className="text-slate-600 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-white"
                        />
                      </div>

                      <div className="relative mt-5">
                        <h3 className="font-semibold text-white transition group-hover:text-blue-200">
                          {action.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {action.description}
                        </p>
                      </div>

                      <div className="relative mt-5 text-xs font-semibold text-slate-400 transition group-hover:text-blue-300">
                        Open section →
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>

            <footer className="border-t border-white/[0.07] pt-5 text-center text-xs text-slate-600">
              WorkSphere 2.0 · Administration Workspace
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
