
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Activity,
  User,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Users,
  Sparkles,
  LoaderCircle,
} from "lucide-react";
import { toast } from "sonner";

import { registerSchema } from "@/lib/validations/auth";

export default function RegisterPage() {
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [rolesError, setRolesError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      requestedRoleId: 0,
    },
  });

  useEffect(() => {
    const controller = new AbortController();

    async function loadRoles() {
      try {
        const response = await fetch("/api/auth/roles", {
          signal: controller.signal,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Unable to load roles.");
        }

        setRoles(result.roles || []);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Role loading error:", error);
          setRolesError(error.message || "Unable to load roles.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setRolesLoading(false);
        }
      }
    }

    loadRoles();

    return () => controller.abort();
  }, []);

  async function onSubmit(data) {
    try {
      setIsLoading(true);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.message || "Registration failed.");
        return;
      }

      toast.success("Registration completed successfully!");
      setRegistrationComplete(true);
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Unable to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  }

  const inputClass =
    "h-12 w-full rounded-xl border border-white/[0.09] bg-[#0b1324]/80 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400/60 focus:bg-[#111d33] focus:ring-4 focus:ring-violet-500/10";

  const labelClass =
    "mb-2 block text-xs font-semibold tracking-wide text-slate-300";

  if (registrationComplete) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080d1b] px-5 py-12 text-white">
        <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-violet-600/15 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-blue-600/15 blur-[120px]" />

        <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#101a30]/85 p-8 text-center shadow-2xl shadow-black/30 backdrop-blur-2xl sm:p-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-emerald-400/20 bg-emerald-400/10">
            <CheckCircle2 size={42} className="text-emerald-400" />
          </div>

          <h1 className="mt-6 text-2xl font-bold text-white">
            Registration Successful!
          </h1>

          <p className="mt-4 text-sm leading-7 text-slate-400">
            Your WorkSphere account has been created successfully. Your
            account is currently waiting for Admin approval.
          </p>

          <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/[0.07] p-4 text-left">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
              <ShieldCheck size={18} />
              Approval Pending
            </div>

            <p className="mt-2 text-xs leading-6 text-amber-200/70">
              You can sign in after the Admin reviews and approves your
              registration request.
            </p>
          </div>

          <Link
            href="/"
            className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:brightness-110"
          >
            Go to Login
            <ArrowRight size={18} />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#080d1b] text-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* LEFT BRAND SECTION */}
        <section className="relative hidden overflow-hidden border-r border-white/[0.06] bg-[#0c1426] px-12 py-12 lg:flex lg:flex-col lg:justify-between xl:px-20">
          <div className="pointer-events-none absolute -right-32 -top-32 h-[450px] w-[450px] rounded-full bg-violet-600/15 blur-[120px]" />
          <div className="pointer-events-none absolute -bottom-32 -left-32 h-[450px] w-[450px] rounded-full bg-blue-600/15 blur-[120px]" />

          <Link href="/" className="relative z-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500 to-blue-600 shadow-lg shadow-violet-950/40">
              <Activity size={25} />
            </div>

            <span className="text-2xl font-bold tracking-tight">
              WorkSphere
            </span>
          </Link>

          <div className="relative z-10 max-w-xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-xs font-semibold text-violet-300">
              <Sparkles size={15} />
              Join Our Workforce
            </div>

            <h1 className="text-4xl font-bold leading-tight xl:text-5xl">
              One workspace.
              <br />
              Every team.
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
                Better collaboration.
              </span>
            </h1>

            <p className="mt-6 max-w-md text-sm leading-8 text-slate-400 xl:text-base">
              Create your account and become part of a connected workplace
              where teams collaborate and projects move forward.
            </p>

            <div className="mt-10 space-y-5">
              {[
                "Centralized employee management",
                "Organized projects and tasks",
                "Role-based workspace access",
                "Secure account approval system",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-400/10">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                  </div>
                  <span className="text-sm text-slate-300">{feature}</span>
                </div>
              ))}
            </div>

            <div className="mt-12 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-5 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                  <Users size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Built for connected teams
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    One platform. Multiple roles. Shared progress.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-xs text-slate-600">
            © 2026 WorkSphere. All rights reserved.
          </div>
        </section>

        {/* RIGHT REGISTRATION SECTION */}
        <section className="relative flex items-center justify-center overflow-y-auto px-5 py-8 sm:px-10 lg:px-12">
          <div className="pointer-events-none absolute -right-32 top-0 h-80 w-80 rounded-full bg-violet-600/10 blur-[120px]" />

          <div className="relative w-full max-w-md">
            {/* MOBILE BRAND */}
            <Link
              href="/"
              className="mb-8 flex items-center justify-center gap-3 lg:hidden"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-600">
                <Activity size={23} />
              </div>
              <span className="text-2xl font-bold">WorkSphere</span>
            </Link>

            <div className="mb-7">
              <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-violet-400">
                <Sparkles size={14} />
                Get Started
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-white">
                Create your account
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Enter your details and request your preferred role.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* FULL NAME */}
              <div>
                <label className={labelClass}>Full Name</label>
                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    autoComplete="name"
                    {...register("fullName")}
                    className={`${inputClass} ${
                      errors.fullName ? "border-red-400/70" : ""
                    }`}
                  />
                </div>
                {errors.fullName && (
                  <p className="mt-1.5 text-xs text-red-400">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              {/* EMAIL */}
              <div>
                <label className={labelClass}>Email Address</label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    {...register("email")}
                    className={`${inputClass} ${
                      errors.email ? "border-red-400/70" : ""
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-400">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* ROLE */}
              <div>
                <label className={labelClass}>Requested Role</label>
                <select
                  {...register("requestedRoleId", {
                    valueAsNumber: true,
                  })}
                  disabled={rolesLoading || !!rolesError}
                  className={`h-12 w-full rounded-xl border bg-[#0b1324]/80 px-4 text-sm text-white outline-none transition focus:border-violet-400/60 focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:opacity-60 ${
                    errors.requestedRoleId
                      ? "border-red-400/70"
                      : "border-white/[0.09]"
                  }`}
                >
                  <option value={0} className="bg-[#101a30]">
                    {rolesLoading
                      ? "Loading available roles..."
                      : rolesError
                        ? "Roles unavailable"
                        : "Select your preferred role"}
                  </option>

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

                {errors.requestedRoleId && (
                  <p className="mt-1.5 text-xs text-red-400">
                    {errors.requestedRoleId.message}
                  </p>
                )}

                {rolesError && (
                  <p className="mt-1.5 text-xs text-red-400">
                    {rolesError}
                  </p>
                )}

                <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                  <ShieldCheck size={13} className="text-amber-400" />
                  Your selected role requires Admin approval.
                </p>
              </div>

              {/* PASSWORD */}
              <div>
                <label className={labelClass}>Password</label>
                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    autoComplete="new-password"
                    {...register("password")}
                    className={`${inputClass} pr-12 ${
                      errors.password ? "border-red-400/70" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-violet-300"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-400">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label className={labelClass}>Confirm Password</label>
                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    {...register("confirmPassword")}
                    className={`${inputClass} pr-12 ${
                      errors.confirmPassword ? "border-red-400/70" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-violet-300"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1.5 text-xs text-red-400">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={isLoading || rolesLoading || !!rolesError}
                className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {isLoading ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link
                href="/"
                className="font-semibold text-violet-400 transition hover:text-violet-300"
              >
                Sign in
              </Link>
            </p>

            <div className="mt-7 flex items-center justify-center gap-2 text-xs text-slate-500">
              <ShieldCheck size={15} className="text-emerald-400" />
              Your account is protected by secure authentication.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
