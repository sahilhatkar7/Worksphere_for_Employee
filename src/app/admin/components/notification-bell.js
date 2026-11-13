
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  Loader2,
  ExternalLink,
  X,
  Circle,
  BellRing,
  RefreshCw,
} from "lucide-react";

function formatNotificationDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  const fetchNotifications = useCallback(async (signal) => {
    try {
      const response = await fetch("/api/notifications", {
        cache: "no-store",
        signal,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load notifications");
      }

      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
      setError("");
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message || "Something went wrong");
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

 useEffect(() => {
  const controller = new AbortController();

  Promise.resolve().then(() => {
    if (!controller.signal.aborted) {
      fetchNotifications(controller.signal);
    }
  });

  return () => controller.abort();
}, [fetchNotifications]);

  async function markAsRead(notificationId) {
    try {
      setUpdating(true);

      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationId }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update notification");
      }

      await fetchNotifications(new AbortController().signal);
    } catch (err) {
      setError(err.message || "Failed to update notification");
    } finally {
      setUpdating(false);
    }
  }

  async function markAllAsRead() {
    try {
      setUpdating(true);

      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ markAll: true }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update notifications");
      }

      await fetchNotifications(new AbortController().signal);
    } catch (err) {
      setError(err.message || "Failed to update notifications");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        type="button"
        aria-label={`Notifications, ${unreadCount} unread`}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((previous) => !previous)}
        className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition duration-200 ${
          isOpen
            ? "border-violet-400/30 bg-violet-500/15 text-violet-300"
            : "border-white/10 bg-white/[0.04] text-slate-400 hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
        }`}
      >
        <Bell size={19} />

        {unreadCount > 0 && (
          <>
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#080d1b] bg-gradient-to-r from-violet-500 to-blue-500 px-1 text-[10px] font-bold text-white shadow-lg shadow-violet-500/30">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
            <span className="absolute right-1.5 top-1.5 h-2 w-2 animate-ping rounded-full bg-violet-400 opacity-50" />
          </>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          <button
            type="button"
            aria-label="Close notifications"
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 cursor-default bg-transparent"
          />

          <div className="absolute right-0 top-14 z-50 w-[min(390px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-[#111b31]/95 shadow-2xl shadow-black/50 backdrop-blur-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] bg-gradient-to-r from-violet-500/[0.08] to-blue-500/[0.06] px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
                  <BellRing size={19} />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white">
                    Notifications
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    {unreadCount} unread notifications
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-white/[0.07] hover:text-white"
                aria-label="Close"
              >
                <X size={17} />
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
              <span className="text-xs font-medium text-slate-500">
                Recent activity
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() =>
                    fetchNotifications(new AbortController().signal)
                  }
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-400 transition hover:text-white disabled:opacity-50"
                  title="Refresh notifications"
                >
                  <RefreshCw
                    size={13}
                    className={loading ? "animate-spin" : ""}
                  />
                  Refresh
                </button>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    disabled={updating}
                    onClick={markAllAsRead}
                    className="flex items-center gap-1.5 text-xs font-semibold text-violet-300 transition hover:text-violet-200 disabled:opacity-50"
                  >
                    {updating ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <CheckCheck size={14} />
                    )}
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mx-4 mt-3 rounded-xl border border-rose-400/20 bg-rose-500/10 px-3 py-2.5">
                <p className="text-xs text-rose-300">{error}</p>
              </div>
            )}

            {/* Notification List */}
            <div className="max-h-[390px] overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-14">
                  <Loader2
                    size={26}
                    className="animate-spin text-violet-400"
                  />
                  <p className="text-xs text-slate-500">
                    Loading notifications...
                  </p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-5 py-14 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-500">
                    <Bell size={25} />
                  </div>

                  <h4 className="mt-4 text-sm font-semibold text-white">
                    No notifications yet
                  </h4>

                  <p className="mt-1 text-xs text-slate-500">
                    You&apos;re all caught up!
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`group border-b border-white/[0.05] px-5 py-4 transition duration-200 hover:bg-white/[0.035] ${
                      !notification.isRead
                        ? "bg-violet-500/[0.045]"
                        : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="relative mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.04] text-slate-400">
                        <Bell size={16} />

                        {!notification.isRead && (
                          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#111b31] bg-violet-400" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-sm leading-5 ${
                              notification.isRead
                                ? "font-medium text-slate-300"
                                : "font-semibold text-white"
                            }`}
                          >
                            {notification.title}
                          </p>

                          {!notification.isRead && (
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                          )}
                        </div>

                        <p className="mt-1.5 text-xs leading-5 text-slate-400">
                          {notification.message}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[10px] text-slate-600">
                            {formatNotificationDate(notification.createdAt)}
                          </span>

                          <div className="flex items-center gap-3">
                            {!notification.isRead && (
                              <button
                                type="button"
                                disabled={updating}
                                onClick={() => markAsRead(notification.id)}
                                className="text-[11px] font-semibold text-violet-300 transition hover:text-violet-200 disabled:opacity-50"
                              >
                                Mark read
                              </button>
                            )}

                            {notification.link && (
                              <Link
                                href={notification.link}
                                onClick={() => {
                                  if (!notification.isRead) {
                                    markAsRead(notification.id);
                                  }
                                }}
                                className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 transition hover:text-blue-300"
                              >
                                Open
                                <ExternalLink size={12} />
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-white/[0.08] bg-white/[0.02] px-5 py-3">
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <Circle size={7} className="fill-emerald-400 text-emerald-400" />
                WorkSphere Updates
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs font-semibold text-slate-400 transition hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
