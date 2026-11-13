
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  UserRound,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  Save,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
  Settings,
  Sparkles,
  KeyRound,
} from "lucide-react";
import { toast } from "sonner";

function PasswordField({
  label,
  name,
  value,
  field,
  placeholder,
  showPassword,
  onToggle,
  onChange,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-slate-300"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={name}
          name={name}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={128}
          className="w-full rounded-xl border border-white/10 bg-[#0a1325]/80 px-4 py-3 pr-12 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/10"
        />

        <button
          type="button"
          onClick={() => onToggle(field)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 transition hover:text-violet-300"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/admin/settings", {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load profile.");
        }

        setProfile({
          fullName: result.profile.fullName,
          email: result.profile.email,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  function handleProfileChange(event) {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handlePasswordChange(event) {
    const { name, value } = event.target;

    setPasswords((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function togglePassword(field) {
    setShowPasswords((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (passwords.newPassword && passwords.newPassword.length < 8) {
      toast.error("New password must contain at least 8 characters.");
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    if (!passwords.currentPassword) {
      toast.error("Please enter your current password.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: profile.fullName,
          email: profile.email,
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
          confirmPassword: passwords.confirmPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to update profile.");
      }

      setProfile({
        fullName: result.profile.fullName,
        email: result.profile.email,
      });

      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast.success("Admin profile updated successfully.");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080d1b]">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10">
            <LoaderCircle size={26} className="animate-spin text-violet-400" />
          </div>
          <p className="text-sm font-medium text-slate-400">
            Loading Admin Settings...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080d1b] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute -right-40 top-40 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-cyan-500/[0.06] blur-[120px]" />
      </div>

      <header className="relative z-10 border-b border-white/[0.07] bg-[#0b1324]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/20 bg-gradient-to-br from-violet-500/20 to-blue-500/10 text-violet-300">
              <Settings size={21} />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">
                WorkSphere
              </h1>
              <p className="text-xs text-slate-500">Administration Panel</p>
            </div>
          </div>

          <Link
            href="/admin"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-white sm:px-4 sm:text-sm"
          >
            <ArrowLeft size={16} />
            <span>Dashboard</span>
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
        <div className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-[11px] font-bold tracking-wider text-violet-300">
            <ShieldCheck size={14} />
            ADMINISTRATOR
          </div>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Account Settings
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                Manage your administrator profile, personal information and
                account security from one place.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Sparkles size={15} className="text-violet-400" />
              Secure account management
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-300">
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#101a30]/75 shadow-xl shadow-black/10 backdrop-blur-xl">
            <div className="flex items-center gap-4 border-b border-white/[0.07] px-5 py-5 sm:px-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
                <UserRound size={21} />
              </div>

              <div>
                <h3 className="font-semibold text-white">
                  Personal Information
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Update your administrator account details.
                </p>
              </div>
            </div>

            <div className="space-y-5 p-5 sm:p-7">
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Full Name
                </label>

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  minLength={3}
                  maxLength={100}
                  value={profile.fullName}
                  onChange={handleProfileChange}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-white/10 bg-[#0a1325]/80 px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/10"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    maxLength={255}
                    value={profile.email}
                    onChange={handleProfileChange}
                    placeholder="Enter your email"
                    className="w-full rounded-xl border border-white/10 bg-[#0a1325]/80 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/10"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#101a30]/75 shadow-xl shadow-black/10 backdrop-blur-xl">
            <div className="flex items-center gap-4 border-b border-white/[0.07] px-5 py-5 sm:px-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300">
                <LockKeyhole size={21} />
              </div>

              <div>
                <h3 className="font-semibold text-white">Change Password</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Keep your administrator account protected.
                </p>
              </div>
            </div>

            <div className="space-y-5 p-5 sm:p-7">
              <PasswordField
                label="Current Password"
                name="currentPassword"
                value={passwords.currentPassword}
                field="current"
                placeholder="Enter current password"
                showPassword={showPasswords.current}
                onToggle={togglePassword}
                onChange={handlePasswordChange}
              />

              <div className="grid gap-5 md:grid-cols-2">
                <PasswordField
                  label="New Password"
                  name="newPassword"
                  value={passwords.newPassword}
                  field="new"
                  placeholder="Minimum 8 characters"
                  showPassword={showPasswords.new}
                  onToggle={togglePassword}
                  onChange={handlePasswordChange}
                />

                <PasswordField
                  label="Confirm New Password"
                  name="confirmPassword"
                  value={passwords.confirmPassword}
                  field="confirm"
                  placeholder="Re-enter new password"
                  showPassword={showPasswords.confirm}
                  onToggle={togglePassword}
                  onChange={handlePasswordChange}
                />
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-cyan-400/10 bg-cyan-500/[0.05] p-4">
                <KeyRound size={17} className="mt-0.5 shrink-0 text-cyan-300" />
                <p className="text-xs leading-5 text-slate-400">
                  Leave the new password fields empty if you do not want to
                  change your password. Your current password is required to
                  save profile changes.
                </p>
              </div>
            </div>
          </section>

          <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
            <Link
              href="/admin"
              className="rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3 text-center text-sm font-semibold text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/25 transition hover:from-violet-500 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}

              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>

        <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-400/15 bg-emerald-500/[0.06] p-4">
          <CheckCircle2
            size={19}
            className="mt-0.5 shrink-0 text-emerald-400"
          />
          <div>
            <p className="text-sm font-semibold text-emerald-300">
              Your account is protected
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Your current password is verified before profile changes are
              saved. Keep your login credentials private.
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-slate-600">
          WorkSphere Administration · Account Settings
        </p>
      </div>
    </main>
  );
}
