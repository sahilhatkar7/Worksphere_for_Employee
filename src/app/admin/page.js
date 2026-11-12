
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/guards";
import {
  Users,
  UserCheck,
  FolderKanban,
  ClipboardList,
  Search,
  MessageCircle,
} from "lucide-react";
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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <AdminSidebar user={user} />

        {/* Main Content */}
        <main className="min-w-0 flex-1">
          {/* Topbar */}
          <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
            <div className="min-w-0 pl-12 lg:pl-0">
              <h2 className="text-lg font-bold text-slate-900">
                Admin Dashboard
              </h2>
              <p className="hidden text-sm text-slate-500 sm:block">
                Manage your organization from one place.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <button
                type="button"
                aria-label="Search"
                className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100"
              >
                <Search size={20} />
              </button>

              <NotificationBell />

              <div className="hidden h-9 w-px bg-slate-200 sm:block" />

              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-slate-800">
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
          <div className="mx-auto max-w-7xl space-y-8 p-5 sm:p-8">
            <div>
              <p className="text-sm font-medium text-indigo-600">
                Welcome back!
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Organization Overview
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Here&apos;s what&apos;s happening across your workspace.
              </p>
            </div>

            {/* Statistics */}
            <DashboardStats />

            {/* Welcome Panel */}
            <div className="overflow-hidden rounded-2xl bg-linear-to-r from-indigo-600 to-violet-600 p-6 text-white shadow-sm sm:p-8">
              <div className="max-w-2xl">
                <p className="text-sm font-medium text-indigo-100">
                  WorkSphere Administration
                </p>

                <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                  Manage your workforce smarter.
                </h2>

                <p className="mt-3 text-sm leading-6 text-indigo-100">
                  Review employee registration requests, manage
                  teams, organize projects, and monitor your
                  organization&apos;s activities from one centralized
                  dashboard.
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <section>
              <h2 className="text-lg font-bold text-slate-900">
                Quick Actions
              </h2>

              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Review Approvals */}
                <Link
                  href="/admin/approvals"
                  className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-indigo-300 hover:shadow-md"
                >
                  <UserCheck className="text-indigo-600" size={25} />

                  <h3 className="mt-4 font-semibold text-slate-900">
                    Review Approvals
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Review and process new employee registration requests.
                  </p>

                  <span className="mt-4 inline-block text-sm font-semibold text-indigo-600">
                    View requests →
                  </span>
                </Link>

                {/* Manage Employees */}
                <Link
                  href="/admin/employees"
                  className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-indigo-300 hover:shadow-md"
                >
                  <Users className="text-blue-600" size={25} />

                  <h3 className="mt-4 font-semibold text-slate-900">
                    Manage Employees
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    View and manage your organization&apos;s workforce.
                  </p>

                  <span className="mt-4 inline-block text-sm font-semibold text-indigo-600">
                    View employees →
                  </span>
                </Link>

                {/* Manage Projects */}
                <Link
                  href="/admin/projects"
                  className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-indigo-300 hover:shadow-md"
                >
                  <FolderKanban className="text-purple-600" size={25} />

                  <h3 className="mt-4 font-semibold text-slate-900">
                    Manage Projects
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Organize and monitor organization projects.
                  </p>

                  <span className="mt-4 inline-block text-sm font-semibold text-indigo-600">
                    View projects →
                  </span>
                </Link>

                {/* Manage Tasks */}
                <Link
                  href="/admin/tasks"
                  className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-indigo-300 hover:shadow-md"
                >
                  <ClipboardList className="text-emerald-600" size={25} />

                  <h3 className="mt-4 font-semibold text-slate-900">
                    Manage Tasks
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Create, assign, and monitor tasks across your projects.
                  </p>

                  <span className="mt-4 inline-block text-sm font-semibold text-indigo-600">
                    View tasks →
                  </span>
                </Link>

                {/* TeamSpace */}
                <Link
                  href="/chat"
                  className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-indigo-300 hover:shadow-md"
                >
                  <MessageCircle className="text-indigo-600" size={25} />

                  <h3 className="mt-4 font-semibold text-slate-900">
                    TeamSpace
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Connect and communicate with all approved members of your organization.
                  </p>

                  <span className="mt-4 inline-block text-sm font-semibold text-indigo-600">
                    Open TeamSpace →
                  </span>
                </Link>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
