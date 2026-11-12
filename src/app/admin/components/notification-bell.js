
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  Loader2,
  ExternalLink,
} from "lucide-react";

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

      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
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

    async function loadNotifications() {
      await fetchNotifications(controller.signal);
    }

    loadNotifications();

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
      <button
        type="button"
        aria-label={`Notifications, ${unreadCount} unread`}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((previous) => !previous)}
        className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
      >
        <Bell size={20} />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-14 z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
            <div>
              <h3 className="font-semibold text-slate-900">
                Notifications
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {unreadCount} unread notifications
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                disabled={updating}
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
              >
                <CheckCheck size={15} />
                Mark all read
              </button>
            )}
          </div>

          {error && (
            <p className="px-4 py-3 text-xs text-red-600">
              {error}
            </p>
          )}

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
                <Loader2 size={18} className="animate-spin" />
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <Bell className="mx-auto text-slate-300" size={30} />
                <p className="mt-3 text-sm font-semibold text-slate-700">
                  No notifications yet
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  You&apos;re all caught up!
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border-b border-slate-100 px-4 py-4 transition hover:bg-slate-50 ${
                    !notification.isRead ? "bg-indigo-50/40" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    <div
                      className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                        notification.isRead
                          ? "bg-slate-300"
                          : "bg-indigo-600"
                      }`}
                    />

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800">
                        {notification.title}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {notification.message}
                      </p>

                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-400">
                          {new Date(notification.createdAt).toLocaleString()}
                        </span>

                        <div className="flex items-center gap-3">
                          {!notification.isRead && (
                            <button
                              type="button"
                              disabled={updating}
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
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
                              className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-indigo-600"
                            >
                              Open <ExternalLink size={12} />
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

          <div className="border-t border-slate-100 px-4 py-3">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
