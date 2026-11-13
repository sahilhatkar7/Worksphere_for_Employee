
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Activity,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Users,
  ArrowRight,
  Sparkles,
  FolderKanban,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function Home() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data) {
    try {
      setIsLoading(true);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.message || "Login failed.");
        return;
      }

      const meResponse = await fetch("/api/auth/me", {
        cache: "no-store",
      });

      const meData = await meResponse.json();

      if (!meResponse.ok || !meData.success) {
        toast.error("Unable to retrieve user information.");
        return;
      }

      const roleRoutes = {
        Admin: "/admin",
        Developer: "/developer",
        Designer: "/designer",
        Tester: "/tester",
        "Project Manager": "/project-manager",
        "HR Manager": "/hr",
        Employee: "/dashboard",
      };

      const destination =
        roleRoutes[meData.user.roleName] || "/dashboard";

      toast.success("Welcome to WorkSphere!");

      router.replace(destination);
      router.refresh();
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Unable to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080b18] text-white">

      {/* BACKGROUND LIGHT EFFECTS */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[130px]" />
      <div className="pointer-events-none absolute -right-40 top-0 h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-52 left-1/3 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[130px]" />

      {/* BACKGROUND GRID */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "45px 45px",
        }}
      />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-2">

        {/* LEFT BRAND SECTION */}
        <section className="relative hidden flex-col justify-between p-10 lg:flex xl:p-16">

          <div className="absolute inset-5 rounded-[2.5rem] border border-white/[0.08] bg-white/[0.025] backdrop-blur-xl" />

          {/* BRAND */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-400/30 bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/25">
              <Activity size={26} />
            </div>

            <div>
              <h2 className="text-2xl font-extrabold tracking-tight">
                WorkSphere
              </h2>
              <p className="text-[10px] font-semibold tracking-[0.25em] text-slate-400">
                WORK SMARTER. TOGETHER.
              </p>
            </div>
          </div>

          {/* HERO CONTENT */}
          <div className="relative z-10 mx-auto w-full max-w-xl">

            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-300 backdrop-blur-xl">
              <Sparkles size={15} />
              Smart Workforce Management
            </div>

            <h1 className="text-4xl font-extrabold leading-[1.2] tracking-tight xl:text-5xl">
              Everything your team needs.

              <span className="mt-3 block bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
                One connected workspace.
              </span>
            </h1>

            <p className="mt-6 max-w-md text-sm leading-8 text-slate-400">
              Manage employees, organize projects, track tasks,
              and collaborate with your entire organization
              through one powerful workspace.
            </p>

            {/* FEATURE CARDS */}
            <div className="mt-10 grid grid-cols-2 gap-4">

              <div className="group rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/10 backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-blue-400/30 hover:bg-white/[0.075]">

                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/15 text-blue-400">
                  <Users size={22} />
                </div>

                <h3 className="font-bold text-white">
                  Team Management
                </h3>

                <p className="mt-2 text-xs leading-6 text-slate-400">
                  Organize your workforce and manage employees efficiently.
                </p>
              </div>

              <div className="group rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/10 backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-violet-400/30 hover:bg-white/[0.075]">

                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/15 text-violet-400">
                  <FolderKanban size={22} />
                </div>

                <h3 className="font-bold text-white">
                  Project Tracking
                </h3>

                <p className="mt-2 text-xs leading-6 text-slate-400">
                  Track progress and keep every project on schedule.
                </p>
              </div>

            </div>

            {/* TRUST INDICATORS */}
            <div className="mt-8 flex flex-wrap gap-6 text-xs font-medium text-slate-400">

              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-blue-400" />
                Organized Workspace
              </span>

              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-violet-400" />
                Secure Access
              </span>

            </div>
          </div>

          {/* FOOTER */}
          <div className="relative z-10 text-xs text-slate-500">
            © 2026 WorkSphere. All rights reserved.
          </div>
        </section>

        {/* RIGHT LOGIN SECTION */}
        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10 lg:px-12">

          <div className="w-full max-w-md">

            {/* MOBILE BRAND */}
            <div className="mb-9 flex items-center justify-center gap-3 lg:hidden">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/25">
                <Activity size={25} />
              </div>

              <div>
                <h2 className="text-2xl font-extrabold">
                  WorkSphere
                </h2>
                <p className="text-[10px] tracking-[0.2em] text-slate-400">
                  WORK SMARTER. TOGETHER.
                </p>
              </div>

            </div>

            {/* GLASS LOGIN CARD */}
            <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.12] bg-white/[0.055] p-7 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:p-10">

              {/* CARD TOP GLOW */}
              <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-blue-500/15 blur-[75px]" />

              <div className="relative z-10">

                {/* CARD HEADER */}
                <div className="mb-9">

                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/20 bg-gradient-to-br from-blue-500/20 to-violet-500/20 text-blue-300 shadow-lg shadow-blue-500/10">
                    <ShieldCheck size={28} />
                  </div>

                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-blue-400">
                    Welcome Back
                  </p>

                  <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                    Sign in to your account
                  </h1>

                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    Enter your credentials to access your WorkSphere workspace.
                  </p>

                </div>

                {/* LOGIN FORM */}
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-6"
                >

                  {/* EMAIL */}
                  <div>

                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-semibold text-slate-300"
                    >
                      Email Address
                    </label>

                    <div className="relative">

                      <Mail
                        size={19}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                      />

                      <input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        {...register("email")}
                        className={`h-14 w-full rounded-2xl border bg-[#0c1225]/70 pl-12 pr-4 text-sm text-white outline-none transition duration-200 placeholder:text-slate-600 focus:border-blue-400/60 focus:bg-[#111a32] focus:ring-4 focus:ring-blue-500/10 ${
                          errors.email
                            ? "border-red-400/70"
                            : "border-white/10"
                        }`}
                      />

                    </div>

                    {errors.email && (
                      <p className="mt-2 text-xs font-medium text-red-400">
                        {errors.email.message}
                      </p>
                    )}

                  </div>

                  {/* PASSWORD */}
                  <div>

                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm font-semibold text-slate-300"
                    >
                      Password
                    </label>

                    <div className="relative">

                      <LockKeyhole
                        size={19}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                      />

                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        {...register("password")}
                        className={`h-14 w-full rounded-2xl border bg-[#0c1225]/70 pl-12 pr-12 text-sm text-white outline-none transition duration-200 placeholder:text-slate-600 focus:border-blue-400/60 focus:bg-[#111a32] focus:ring-4 focus:ring-blue-500/10 ${
                          errors.password
                            ? "border-red-400/70"
                            : "border-white/10"
                        }`}
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-blue-400"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={19} />
                        ) : (
                          <Eye size={19} />
                        )}
                      </button>

                    </div>

                    {errors.password && (
                      <p className="mt-2 text-xs font-medium text-red-400">
                        {errors.password.message}
                      </p>
                    )}

                  </div>

                  {/* SUBMIT BUTTON */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? "Signing in..." : "Sign In"}

                    {!isLoading && (
                      <ArrowRight
                        size={19}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    )}
                  </button>

                </form>

                {/* DIVIDER */}
                <div className="my-8 flex items-center gap-4">
                  <div className="h-px flex-1 bg-white/10" />

                  <span className="text-xs font-medium text-slate-500">
                    OR
                  </span>

                  <div className="h-px flex-1 bg-white/10" />
                </div>

                {/* REGISTER */}
                <p className="text-center text-sm text-slate-400">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/register"
                    className="font-bold text-blue-400 transition hover:text-violet-400"
                  >
                    Create account
                  </Link>
                </p>

                {/* SECURITY FOOTER */}
                <div className="mt-8 flex items-center justify-center gap-2 rounded-xl border border-blue-400/15 bg-blue-500/[0.07] px-4 py-3 text-xs font-medium text-slate-400">
                  <ShieldCheck size={16} className="text-blue-400" />
                  Secure access to your workspace
                </div>

              </div>
            </div>

            {/* FOOTER */}
            <p className="mt-6 text-center text-xs text-slate-600">
              © 2026 WorkSphere · All rights reserved
            </p>

          </div>
        </section>

      </div>
    </main>
  );
}
