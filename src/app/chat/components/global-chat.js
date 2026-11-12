
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Send,
  MessageCircle,
  Users,
  Hash,
  LoaderCircle,
  AlertCircle,
  Trash2,
} from "lucide-react";

export default function GlobalChat({ currentUser }) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch chat messages
  const fetchMessages = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);

      const response = await fetch("/api/chat/messages", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load messages.");
      }

      setMessages(data.messages || []);
      setError("");
    } catch (err) {
      setError(err.message || "Unable to connect to TeamSpace.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial loading and automatic refresh
  useEffect(() => {
    const loadInitialMessages = async () => {
      await fetchMessages(true);
    };

    loadInitialMessages();

    const interval = setInterval(() => {
      fetchMessages();
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchMessages]);

  // Scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  // Send message
  async function handleSend(event) {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage || sending) return;

    try {
      setSending(true);
      setError("");

      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmedMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Message could not be sent.");
      }

      setMessage("");
      await fetchMessages();
      inputRef.current?.focus();
    } catch (err) {
      setError(err.message || "Message could not be sent.");
    } finally {
      setSending(false);
    }
  }

  // Delete own message
  async function handleDeleteMessage(messageId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this message?"
    );

    if (!confirmed || deletingId !== null) return;

    try {
      setDeletingId(messageId);
      setError("");

      const response = await fetch(`/api/chat/messages/${messageId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not delete message.");
      }

      setMessages((previousMessages) =>
        previousMessages.filter((item) => item.id !== messageId)
      );
    } catch (err) {
      setError(err.message || "Could not delete message.");
    } finally {
      setDeletingId(null);
    }
  }

  // Format message time
  function formatTime(date) {
    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Format message date
  function formatDate(date) {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <main className="min-h-screen bg-slate-100 p-3 sm:p-5 lg:p-8">
      <div className="mx-auto flex h-[calc(100vh-2rem)] max-w-7xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl sm:h-[calc(100vh-3rem)] lg:flex-row">

        {/* TeamSpace Sidebar */}
        <aside className="flex w-full flex-col border-b border-slate-200 bg-slate-950 text-white lg:w-72 lg:border-b-0 lg:border-r lg:border-slate-800">
          <div className="border-b border-slate-800 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600">
                <MessageCircle size={23} />
              </div>

              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  WorkSphere
                </h1>
                <p className="text-xs text-slate-400">
                  TeamSpace
                </p>
              </div>
            </div>
          </div>

          <div className="p-4">
            <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Workspace
            </p>

            <div className="flex items-center gap-3 rounded-xl bg-blue-600/20 px-3 py-3 text-blue-300">
              <Hash size={19} />

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white">teamspace</p>
                <p className="text-xs text-blue-300">
                  Everyone in WorkSphere
                </p>
              </div>
            </div>
          </div>

          <div className="mt-auto border-t border-slate-800 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold">
                {currentUser.fullName?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {currentUser.fullName}
                </p>
                <p className="text-xs text-slate-400">
                  {currentUser.roleName}
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main TeamSpace Area */}
        <section className="flex min-h-0 min-w-0 flex-1 flex-col">

          {/* Header */}
          <header className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Hash size={22} />
              </div>

              <div className="min-w-0">
                <h2 className="font-bold text-slate-900">
                  TeamSpace
                </h2>

                <p className="text-xs text-slate-500">
                  Connect with everyone in your organization
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Users size={17} />
              <span className="hidden sm:inline">All Roles</span>
            </div>
          </header>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-slate-50 px-3 py-5 sm:px-6">
            {loading ? (
              <div className="flex h-full flex-col items-center justify-center text-slate-400">
                <LoaderCircle
                  size={32}
                  className="mb-3 animate-spin text-blue-600"
                />
                <p className="text-sm">Loading conversations...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                  <MessageCircle size={30} />
                </div>

                <h3 className="font-semibold text-slate-800">
                  Welcome to TeamSpace!
                </h3>

                <p className="mt-2 max-w-xs text-sm text-slate-500">
                  Start a conversation with your WorkSphere team.
                </p>
              </div>
            ) : (
              <div className="mx-auto max-w-4xl space-y-5">
                {messages.map((item, index) => {
                  const isMine = item.senderId === currentUser.id;
                  const previous = messages[index - 1];

                  const showDate =
                    !previous ||
                    formatDate(previous.createdAt) !==
                      formatDate(item.createdAt);

                  return (
                    <div key={item.id}>
                      {showDate && (
                        <div className="my-5 flex items-center justify-center">
                          <span className="rounded-full border border-slate-200 bg-white px-4 py-1 text-xs text-slate-500 shadow-sm">
                            {formatDate(item.createdAt)}
                          </span>
                        </div>
                      )}

                      <div
                        className={`flex gap-3 ${
                          isMine ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                          {item.senderName?.charAt(0)?.toUpperCase() || "U"}
                        </div>

                        <div
                          className={`flex max-w-[85%] flex-col ${
                            isMine ? "items-end" : "items-start"
                          }`}
                        >
                          {/* Sender Information */}
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-slate-700">
                              {isMine ? "You" : item.senderName}
                            </span>

                            <span className="rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                              {item.senderRole}
                            </span>

                            <span className="text-[10px] text-slate-400">
                              {formatTime(item.createdAt)}
                            </span>
                          </div>

                          {/* Message and Delete Button */}
                          <div className="flex items-center gap-2">
                            <div
                              className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                                isMine
                                  ? "rounded-tr-sm bg-blue-600 text-white"
                                  : "rounded-tl-sm border border-slate-200 bg-white text-slate-700"
                              }`}
                            >
                              <p className="whitespace-pre-wrap break-words">
                                {item.message}
                              </p>
                            </div>

                            {isMine && (
                              <button
                                type="button"
                                onClick={() => handleDeleteMessage(item.id)}
                                disabled={deletingId !== null}
                                title="Delete your message"
                                aria-label="Delete your message"
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                {deletingId === item.id ? (
                                  <LoaderCircle
                                    size={16}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Trash2 size={16} />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 border-t border-red-100 bg-red-50 px-4 py-2 text-sm text-red-600">
              <AlertCircle size={16} />
              <span>{error}</span>

              <button
                type="button"
                onClick={() => fetchMessages(true)}
                className="ml-auto font-semibold hover:underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* Message Input */}
          <footer className="border-t border-slate-200 bg-white p-3 sm:p-5">
            <form
              onSubmit={handleSend}
              className="mx-auto flex max-w-4xl items-end gap-2 sm:gap-3"
            >
              <div className="flex-1">
                <textarea
                  ref={inputRef}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !event.shiftKey &&
                      !event.nativeEvent.isComposing
                    ) {
                      event.preventDefault();
                      event.currentTarget.form?.requestSubmit();
                    }
                  }}
                  maxLength={2000}
                  rows={1}
                  placeholder="Write a message to your team..."
                  className="max-h-32 min-h-12 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />

                <p className="mt-1 px-1 text-right text-[10px] text-slate-400">
                  {message.length}/2000 · Enter to send · Shift+Enter for new line
                </p>
              </div>

              <button
                type="submit"
                disabled={!message.trim() || sending}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
              >
                {sending ? (
                  <LoaderCircle size={20} className="animate-spin" />
                ) : (
                  <Send size={19} />
                )}
              </button>
            </form>
          </footer>
        </section>
      </div>
    </main>
  );
}
