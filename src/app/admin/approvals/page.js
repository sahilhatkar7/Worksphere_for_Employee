
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
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/admin"
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Pending Approvals
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Review and manage new employee registration requests.
            </p>
          </div>

          <button
            onClick={fetchApprovals}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={isLoading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Pending Requests
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {users.length}
                </p>
              </div>
              <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                <Clock3 size={23} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Approval Status
                </p>
                <p className="mt-2 text-lg font-bold text-slate-900">
                  Awaiting Review
                </p>
              </div>
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <ShieldCheck size={23} />
              </div>
            </div>
          </div>
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
              <Users size={21} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Registration Requests
              </h2>
              <p className="text-xs text-slate-500">
                Review each applicant before granting access.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <RefreshCw
                size={28}
                className="animate-spin text-blue-600"
              />
              <p className="mt-3 text-sm text-slate-500">
                Loading registration requests...
              </p>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
              <div className="rounded-full bg-emerald-50 p-4 text-emerald-600">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">
                All caught up!
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                There are no pending registration requests.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col gap-5 p-5 transition hover:bg-slate-50/70 sm:p-6 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-lg font-bold text-blue-700">
                      {user.fullName?.charAt(0)?.toUpperCase() || "U"}
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-slate-900">
                        {user.fullName}
                      </h3>

                      <p className="mt-1 flex items-center gap-2 break-all text-sm text-slate-500">
                        <Mail size={14} className="shrink-0" />
                        {user.email}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                          <BriefcaseBusiness size={13} />
                          {user.requestedRoleName || "Role not specified"}
                        </span>

                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                          <Clock3 size={13} />
                          Pending
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 lg:shrink-0">
                    <button
                      onClick={() => handleAction(user.id, "approve")}
                      disabled={processingId !== null}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                    >
                      <CheckCircle2 size={16} />
                      Approve
                    </button>

                    <button
                      onClick={() => handleAction(user.id, "reject")}
                      disabled={processingId !== null}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
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

        <div className="mt-5 flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p>
            Approved users receive access with their requested role.
            Rejected registrations will no longer appear in this list.
          </p>
        </div>
      </div>
    </main>
  );
}
