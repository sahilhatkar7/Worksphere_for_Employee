
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
} from "lucide-react";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address"),

  password: z
    .string()
    .min(1, "Password is required"),
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

    // Get the logged-in user's information.
    const meResponse = await fetch("/api/auth/me", {
      cache: "no-store",
    });

    const meData = await meResponse.json();

    if (!meResponse.ok || !meData.success) {
      toast.error("Unable to retrieve user information.");
      return;
    }

    // Redirect according to the user's role.
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
    <main className="min-h-screen bg-[#f5f7fb] text-slate-800">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* LEFT SECTION */}
        <section className="relative hidden overflow-hidden bg-[#101c3a] px-12 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">

          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500">
              <Activity size={25} />
            </div>

            <span className="text-2xl font-bold tracking-tight">
              WorkSphere
            </span>
          </div>

          <div className="relative z-10 max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-white/10 px-4 py-2 text-sm text-blue-100">
              <ShieldCheck size={16} />
              Smart Workforce Management
            </div>

            <h1 className="text-4xl font-bold leading-tight xl:text-5xl">
              Manage your team.
              <br />
              Build better work.
              <br />
              <span className="text-blue-400">
                Achieve more together.
              </span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-8 text-slate-300">
              A centralized workspace to manage employees, organize
              projects, track tasks, and keep your entire organization
              connected.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-4">

              <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                <Users className="mb-3 text-blue-400" size={25} />
                <h3 className="font-semibold">Team Management</h3>
                <p className="mt-1 text-sm text-slate-300">
                  Manage your workforce efficiently.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                <Activity className="mb-3 text-blue-400" size={25} />
                <h3 className="font-semibold">Project Tracking</h3>
                <p className="mt-1 text-sm text-slate-300">
                  Keep projects organized and on track.
                </p>
              </div>

            </div>
          </div>

          <div className="relative z-10 text-sm text-slate-400">
            © 2026 WorkSphere. All rights reserved.
          </div>
        </section>

        {/* RIGHT SECTION */}
        <section className="flex items-center justify-center px-5 py-12 sm:px-10">

          <div className="w-full max-w-md">

            {/* MOBILE BRAND */}
            <div className="mb-10 flex items-center justify-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                <Activity size={25} />
              </div>

              <span className="text-2xl font-bold text-slate-900">
                WorkSphere
              </span>
            </div>

            <div className="mb-8">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-600">
                Welcome Back
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Sign in to your account
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Enter your account details to access your workspace.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

              {/* EMAIL */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    {...register("email")}
                    className={`h-13 w-full rounded-xl border bg-white pl-12 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${
                      errors.email
                        ? "border-red-400"
                        : "border-slate-200"
                    }`}
                  />
                </div>

                {errors.email && (
                  <p className="mt-2 text-xs text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* PASSWORD */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    {...register("password")}
                    className={`h-13 w-full rounded-xl border bg-white pl-12 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${
                      errors.password
                        ? "border-red-400"
                        : "border-slate-200"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p className="mt-2 text-xs text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={isLoading}
                className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Signing in..." : "Sign In"}

                {!isLoading && <ArrowRight size={18} />}
              </button>

            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs text-slate-400">OR</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <p className="text-center text-sm text-slate-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-blue-600 transition hover:text-blue-700"
              >
                Create account
              </Link>
            </p>

            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck size={15} />
              Secure access to your workspace
            </div>

          </div>
        </section>
      </div>
    </main>
  );
}
