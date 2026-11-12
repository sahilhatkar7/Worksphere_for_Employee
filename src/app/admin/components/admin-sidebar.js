
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  FolderKanban,
  ClipboardList,
  Settings,
  ShieldCheck,
  MessageCircle,
  Menu,
  X,
} from "lucide-react";

const navigation = [
  {
    name: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
    active: true,
  },
  {
    name: "Approvals",
    href: "/admin/approvals",
    icon: UserCheck,
  },
  {
    name: "Employees",
    href: "/admin/employees",
    icon: Users,
  },
  {
    name: "Projects",
    href: "/admin/projects",
    icon: FolderKanban,
  },
  {
    name: "Tasks",
    href: "/admin/tasks",
    icon: ClipboardList,
  },
  {
    name: "TeamSpace",
    href: "/chat",
    icon: MessageCircle,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminSidebar({ user }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile and Tablet Menu Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
        className="fixed left-4 top-5 z-40 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100 lg:hidden"
      >
        <Menu size={22} />
      </button>

      {/* Background Overlay */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:static lg:z-auto lg:w-64 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Branding */}
        <div className="flex h-20 shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <ShieldCheck size={23} />
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-900">
                WorkSphere
              </h1>
              <p className="text-xs text-slate-500">
                Workforce Management
              </p>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <X size={21} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Workspace
          </p>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    item.active
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon size={19} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile */}
        <div className="mt-auto shrink-0 border-t border-slate-200 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
              {user.fullName.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">
                {user.fullName}
              </p>
              <p className="text-xs text-slate-500">
                Administrator
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
