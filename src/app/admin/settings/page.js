
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
        className="mb-2 block text-sm font-semibold text-slate-700"
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
          className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />

        <button
          type="button"
          onClick={() => onToggle(field)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
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
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-500">
          <LoaderCircle size={22} className="animate-spin" />
          Loading Admin Settings...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              WorkSphere
            </h1>
            <p className="text-xs text-slate-500">
              Admin Profile Settings
            </p>
          </div>

          <Link
            href="/admin"
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 py-8">
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
            <ShieldCheck size={15} />
            ADMINISTRATOR
          </div>

          <h2 className="text-3xl font-bold text-slate-900">
            Profile Settings
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Manage your account information and password.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={19} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <UserRound size={21} />
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  Personal Information
                </h3>
                <p className="text-sm text-slate-500">
                  Update your administrator account details.
                </p>
              </div>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-semibold text-slate-700"
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
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
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
                    className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
              <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                <LockKeyhole size={21} />
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  Change Password
                </h3>
                <p className="text-sm text-slate-500">
                  Leave new password fields empty if you do not want to change it.
                </p>
              </div>
            </div>

            <div className="space-y-5 p-6">
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

              <PasswordField
                label="New Password"
                name="newPassword"
                value={passwords.newPassword}
                field="new"
                placeholder="Enter new password (minimum 8 characters)"
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

              <p className="text-xs text-slate-400">
                Your current password is required to save any profile changes.
              </p>
            </div>
          </section>

          <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
            <Link
              href="/admin"
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
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

        <div className="mt-6 flex items-start gap-3 rounded-xl border border-green-100 bg-green-50 p-4 text-sm text-green-800">
          <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
          <p>
            Your account information is protected. Your current password is
            verified before profile changes are saved.
          </p>
        </div>
      </div>
    </main>
  );
}
