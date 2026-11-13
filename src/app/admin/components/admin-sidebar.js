
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Sparkles,
} from "lucide-react";

const navigation = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Approvals", href: "/admin/approvals", icon: UserCheck },
  { name: "Employees", href: "/admin/employees", icon: Users },
  { name: "Projects", href: "/admin/projects", icon: FolderKanban },
  { name: "Tasks", href: "/admin/tasks", icon: ClipboardList },
  { name: "TeamSpace", href: "/chat", icon: MessageCircle },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
        className="fixed left-4 top-5 z-40 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#111a32] text-slate-200 shadow-lg transition hover:bg-white/10 lg:hidden"
      >
        <Menu size={21} />
      </button>

      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/[0.08] bg-[#0c1326]/95 shadow-2xl backdrop-blur-2xl transition-transform duration-300 lg:static lg:z-auto lg:w-64 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-white/[0.08] px-6">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-lg shadow-blue-500/20">
              <ShieldCheck size={24} />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                WorkSphere
              </h1>
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
                Workforce Management
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-7">
          <div className="mb-4 flex items-center justify-between px-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Workspace
            </p>
            <Sparkles size={14} className="text-violet-400" />
          </div>

          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-500/20 to-violet-500/20 text-white shadow-lg shadow-blue-950/20"
                      : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  {isActive && (
                    <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-gradient-to-b from-blue-400 to-violet-500" />
                  )}

                  <Icon
                    size={19}
                    className={
                      isActive
                        ? "text-blue-300"
                        : "text-slate-500 transition group-hover:text-blue-300"
                    }
                  />

                  <span>{item.name}</span>

                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.9)]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="shrink-0 border-t border-white/[0.08] p-4">
          <div className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.04] p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-sm font-bold text-white">
              {user.fullName.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {user.fullName}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                System Administrator
              </p>
            </div>
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          </div>
        </div>
      </aside>
    </>
  );
}
