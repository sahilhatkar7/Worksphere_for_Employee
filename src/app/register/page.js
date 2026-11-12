
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { toast } from "sonner";

import { registerSchema } from "@/lib/validations/auth";

export default function RegisterPage() {
  const router = useRouter();

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

  // Fetch available registration roles from the backend.
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

  // Submit registration details.
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
    "h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

  // Registration success screen.
  if (registrationComplete) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f7fb] px-5 py-12">
        <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-xl shadow-slate-200/50 sm:p-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
            <CheckCircle2 size={42} className="text-green-600" />
          </div>

          <h1 className="mt-6 text-2xl font-bold text-slate-900">
            Registration Successful!
          </h1>

          <p className="mt-4 text-sm leading-7 text-slate-500">
            Your WorkSphere account has been created successfully.
            Your account is currently waiting for Admin approval.
          </p>

          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-800">
              <ShieldCheck size={18} />
              Approval Pending
            </div>

            <p className="mt-2 text-xs leading-6 text-amber-700">
              You can sign in after the Admin reviews and approves
              your registration request.
            </p>
          </div>

          <Link
            href="/"
            className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Go to Login
            <ArrowRight size={18} />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-800">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* LEFT SECTION */}
        <section className="relative hidden overflow-hidden bg-[#101c3a] px-12 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">

          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />

          <Link href="/" className="relative z-10 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500">
              <Activity size={25} />
            </div>

            <span className="text-2xl font-bold tracking-tight">
              WorkSphere
            </span>
          </Link>

          <div className="relative z-10 max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-white/10 px-4 py-2 text-sm text-blue-100">
              <Users size={16} />
              Join Our Workforce
            </div>

            <h1 className="text-4xl font-bold leading-tight xl:text-5xl">
              One workspace.
              <br />
              Every team.
              <br />
              <span className="text-blue-400">
                Better collaboration.
              </span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-8 text-slate-300">
              Create your account and become part of a connected
              workplace where teams collaborate and projects move
              forward.
            </p>

            <div className="mt-10 space-y-5">

              {[
                "Centralized employee management",
                "Organized projects and tasks",
                "Role-based workspace access",
                "Secure account approval system",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <CheckCircle2 size={19} className="text-blue-400" />
                  <span className="text-sm text-slate-200">
                    {feature}
                  </span>
                </div>
              ))}

            </div>
          </div>

          <div className="relative z-10 text-sm text-slate-400">
            © 2026 WorkSphere. All rights reserved.
          </div>
        </section>

        {/* RIGHT SECTION */}
        <section className="flex items-center justify-center px-5 py-10 sm:px-10">

          <div className="w-full max-w-md">

            {/* MOBILE BRAND */}
            <Link
              href="/"
              className="mb-8 flex items-center justify-center gap-3 lg:hidden"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                <Activity size={25} />
              </div>

              <span className="text-2xl font-bold text-slate-900">
                WorkSphere
              </span>
            </Link>

            <div className="mb-7">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-600">
                Get Started
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Create your account
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Enter your details and request your preferred role.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              {/* FULL NAME */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Full Name
                </label>

                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    placeholder="Enter your full name"
                    autoComplete="name"
                    {...register("fullName")}
                    className={`${inputClass} ${
                      errors.fullName ? "border-red-400" : ""
                    }`}
                  />
                </div>

                {errors.fullName && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              {/* EMAIL */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    {...register("email")}
                    className={`${inputClass} ${
                      errors.email ? "border-red-400" : ""
                    }`}
                  />
                </div>

                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* ROLE */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Requested Role
                </label>

                <select
                  {...register("requestedRoleId", {
                    valueAsNumber: true,
                  })}
                  disabled={rolesLoading || !!rolesError}
                  className={`h-12 w-full rounded-xl border bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${
                    errors.requestedRoleId
                      ? "border-red-400"
                      : "border-slate-200"
                  }`}
                >
                  <option value={0}>
                    {rolesLoading
                      ? "Loading available roles..."
                      : rolesError
                        ? "Roles unavailable"
                        : "Select your preferred role"}
                  </option>

                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>

                {errors.requestedRoleId && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.requestedRoleId.message}
                  </p>
                )}

                {rolesError && (
                  <p className="mt-1 text-xs text-red-500">
                    {rolesError}
                  </p>
                )}

                <p className="mt-1 text-xs text-slate-400">
                  Your selected role requires Admin approval.
                </p>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    autoComplete="new-password"
                    {...register("password")}
                    className={`${inputClass} pr-12 ${
                      errors.password ? "border-red-400" : ""
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Confirm Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    {...register("confirmPassword")}
                    className={`${inputClass} pr-12 ${
                      errors.confirmPassword ? "border-red-400" : ""
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
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
                  <p className="mt-1 text-xs text-red-500">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={isLoading || rolesLoading || !!rolesError}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Creating Account..." : "Create Account"}

                {!isLoading && <ArrowRight size={18} />}
              </button>

            </form>

            <p className="mt-7 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link
                href="/"
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Sign in
              </Link>
            </p>

            <div className="mt-7 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck size={15} />
              Your account is protected by secure authentication.
            </div>

          </div>
        </section>
      </div>
    </main>
  );
}
