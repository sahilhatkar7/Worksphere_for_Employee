
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Users,
  Clock3,
  Mail,
  BriefcaseBusiness,
  ShieldCheck,
  AlertCircle,
  UserRoundCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

export default function ApprovalsPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchApprovals = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/admin/pending-approvals", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to load approvals.");
      }

      setUsers(result.users || []);
    } catch (error) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadApprovals() {
      try {
        const response = await fetch("/api/admin/pending-approvals", {
          cache: "no-store",
          signal: controller.signal,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Unable to load approvals.");
        }

        setUsers(result.users || []);
      } catch (error) {
        if (error.name !== "AbortError") {
          toast.error(error.message || "Something went wrong.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadApprovals();

    return () => controller.abort();
  }, []);

  async function handleAction(userId, action) {
    const actionName = action === "approve" ? "approve" : "reject";

    try {
      setProcessingId(userId);

      const response = await fetch(`/api/admin/${actionName}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Unable to ${actionName} user.`);
      }

      toast.success(
        action === "approve"
          ? "User approved successfully."
          : "Registration rejected successfully."
      );

      await fetchApprovals();
    } catch (error) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080d1b] px-4 py-7 text-white sm:px-6 lg:px-10">
      {/* Background Effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute -right-40 top-40 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-cyan-500/[0.06] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <Link
              href="/admin"
              className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-violet-300"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-violet-400/20 bg-gradient-to-br from-violet-500/20 to-blue-500/10 text-violet-300">
                <UserRoundCheck size={23} />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Pending Approvals
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                  Review and manage new registration requests.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchApprovals}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={isLoading ? "animate-spin" : ""}
            />
            Refresh Requests
          </button>
        </div>

        {/* Statistics */}
        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-[#101a30]/75 p-5 shadow-xl shadow-black/10 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">
                  Pending Requests
                </p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {users.length}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Awaiting administrator review
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-500/10 text-amber-300">
                <Clock3 size={23} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#101a30]/75 p-5 shadow-xl shadow-black/10 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">
                  Approval Status
                </p>
                <p className="mt-2 text-xl font-bold text-white">
                  Awaiting Review
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Registration access control
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-blue-300">
                <ShieldCheck size={23} />
              </div>
            </div>
          </div>
        </div>

        {/* Requests Panel */}
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#101a30]/75 shadow-xl shadow-black/10 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-5 py-5 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
                <Users size={20} />
              </div>

              <div>
                <h2 className="font-semibold text-white">
                  Registration Requests
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Review applicants before granting access.
                </p>
              </div>
            </div>

            <span className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-400">
              {users.length} Requests
            </span>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10">
                <RefreshCw
                  size={25}
                  className="animate-spin text-violet-400"
                />
              </div>

              <p className="mt-4 text-sm text-slate-400">
                Loading registration requests...
              </p>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 size={32} />
              </div>

              <h3 className="mt-5 text-base font-semibold text-white">
                All caught up!
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                There are no pending registration requests. New requests will
                appear here when users register.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col justify-between gap-5 p-5 transition hover:bg-white/[0.025] sm:p-6 lg:flex-row lg:items-center"
                >
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-gradient-to-br from-violet-500/20 to-blue-500/10 text-lg font-bold text-violet-300">
                      {user.fullName?.charAt(0)?.toUpperCase() || "U"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-white">
                        {user.fullName || "Unnamed User"}
                      </h3>

                      <p className="mt-1 flex min-w-0 items-center gap-2 break-all text-sm text-slate-400">
                        <Mail size={14} className="shrink-0 text-slate-500" />
                        {user.email}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-400/15 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-300">
                          <BriefcaseBusiness size={13} />
                          {user.requestedRoleName || "Role not specified"}
                        </span>

                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/15 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300">
                          <Clock3 size={13} />
                          Pending
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 lg:shrink-0">
                    <button
                      type="button"
                      onClick={() => handleAction(user.id, "approve")}
                      disabled={processingId !== null}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-2.5 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                    >
                      {processingId === user.id ? (
                        <RefreshCw size={16} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={16} />
                      )}
                      Approve
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAction(user.id, "reject")}
                      disabled={processingId !== null}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-400/20 bg-rose-500/10 px-5 py-2.5 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                    >
                      <XCircle size={16} />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Information */}
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-blue-400/15 bg-blue-500/[0.06] p-4">
          <AlertCircle
            size={19}
            className="mt-0.5 shrink-0 text-blue-300"
          />

          <p className="text-xs leading-6 text-slate-400">
            Approved users receive access with their requested role.
            Rejected registrations will no longer appear in this list.
            Review each registration carefully before taking action.
          </p>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-600">
          <Sparkles size={13} className="text-violet-400" />
          WorkSphere Administration · Access Management
        </div>
      </div>
    </main>
  );
}
