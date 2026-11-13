
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
  Sparkles,
  ShieldCheck,
  Radio,
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

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

  function formatTime(date) {
    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatDate(date) {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#080d1b] p-2 text-slate-100 sm:p-4 lg:p-6">
      <div className="mx-auto flex h-[calc(100dvh-1rem)] max-w-[1600px] flex-col overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0c1426]/90 shadow-[0_25px_100px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:h-[calc(100dvh-2rem)] sm:rounded-3xl lg:h-[calc(100dvh-3rem)] lg:flex-row">

        {/* Sidebar */}
        <aside className="relative flex w-full shrink-0 flex-col border-b border-white/[0.08] bg-[#101a30]/90 lg:w-[290px] lg:border-b-0 lg:border-r">
          <div className="pointer-events-none absolute -left-20 top-20 h-56 w-56 rounded-full bg-purple-600/10 blur-[100px]" />

          {/* Brand */}
          <div className="relative border-b border-white/[0.07] p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500 to-blue-600 shadow-lg shadow-violet-950/40">
                <MessageCircle size={24} className="text-white" />
              </div>

              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">
                  WorkSphere
                </h1>
                <p className="mt-0.5 text-xs font-medium tracking-wide text-slate-400">
                  TEAM COMMUNICATION
                </p>
              </div>
            </div>
          </div>

          {/* Workspace */}
          <div className="relative p-4 sm:p-5">
            <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Workspace
            </p>

            <div className="group flex items-center gap-3 rounded-2xl border border-violet-400/20 bg-gradient-to-r from-violet-500/15 to-blue-500/10 p-3.5 shadow-inner shadow-violet-500/[0.03]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 text-violet-300">
                <Hash size={20} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white">teamspace</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  Everyone in WorkSphere
                </p>
              </div>

              <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]" />
            </div>

            <div className="mt-5 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
              <div className="mb-3 flex items-center gap-2 text-slate-300">
                <ShieldCheck size={16} className="text-cyan-400" />
                <span className="text-xs font-semibold">Team workspace</span>
              </div>

              <p className="text-xs leading-5 text-slate-500">
                A shared space for your organization to communicate and stay
                connected.
              </p>
            </div>
          </div>

          {/* User Profile */}
          <div className="relative mt-auto border-t border-white/[0.07] p-4 sm:p-5">
            <div className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.035] p-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-base font-bold text-white shadow-lg shadow-indigo-950/30">
                {currentUser.fullName?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {currentUser.fullName}
                </p>
                <p className="mt-1 truncate text-xs text-slate-400">
                  {currentUser.roleName}
                </p>
              </div>

              <div className="rounded-lg bg-emerald-400/10 p-2 text-emerald-400">
                <ShieldCheck size={17} />
              </div>
            </div>
          </div>
        </aside>

        {/* Main Chat */}
        <section className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#0b1324]">
          <div className="pointer-events-none absolute -right-32 top-0 h-80 w-80 rounded-full bg-blue-600/[0.07] blur-[120px]" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-purple-600/[0.05] blur-[110px]" />

          {/* Header */}
          <header className="relative z-10 flex shrink-0 items-center justify-between border-b border-white/[0.07] bg-[#101a30]/70 px-4 py-4 backdrop-blur-xl sm:px-7 sm:py-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
                <Hash size={22} />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-bold tracking-tight text-white sm:text-lg">
                    TeamSpace
                  </h2>
                  <span className="rounded-md border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                    General
                  </span>
                </div>

                <p className="mt-1 truncate text-[11px] text-slate-400 sm:text-xs">
                  Connect with everyone in your organization
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.035] px-3 py-2">
              <Users size={16} className="text-violet-300" />
              <span className="hidden text-xs font-medium text-slate-300 sm:inline">
                All Roles
              </span>
            </div>
          </header>

          {/* Chat Info */}
          <div className="relative z-10 flex shrink-0 items-center justify-between px-4 py-3 sm:px-7">
            <div className="flex items-center gap-2">
              <Radio size={14} className="text-emerald-400" />
              <span className="text-[11px] font-medium text-slate-400">
                Shared team conversation
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <Sparkles size={12} className="text-violet-400" />
              <span>TeamSpace</span>
            </div>
          </div>

          {/* Messages */}
          <div className="relative z-10 min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-5">
            {loading ? (
              <div className="flex h-full flex-col items-center justify-center text-slate-400">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10">
                  <LoaderCircle
                    size={30}
                    className="animate-spin text-violet-400"
                  />
                </div>
                <p className="text-sm font-medium text-slate-300">
                  Loading TeamSpace...
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Getting your latest messages
                </p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-4 text-center">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-500/15 to-blue-500/10 shadow-xl shadow-violet-950/20">
                  <MessageCircle size={34} className="text-violet-300" />
                </div>

                <h3 className="text-lg font-bold text-white">
                  Welcome to TeamSpace!
                </h3>

                <p className="mt-2 max-w-xs text-sm leading-6 text-slate-400">
                  Your team conversation starts here. Send the first message
                  and get everyone connected.
                </p>

                <div className="mt-5 flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.03] px-4 py-2 text-xs text-slate-500">
                  <Sparkles size={13} className="text-violet-400" />
                  Start a conversation
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-4xl space-y-6">
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
                        <div className="my-7 flex items-center gap-4">
                          <div className="h-px flex-1 bg-white/[0.07]" />
                          <span className="rounded-full border border-white/[0.08] bg-[#172238] px-4 py-1.5 text-[10px] font-semibold tracking-wide text-slate-400">
                            {formatDate(item.createdAt)}
                          </span>
                          <div className="h-px flex-1 bg-white/[0.07]" />
                        </div>
                      )}

                      <div
                        className={`group flex items-start gap-3 ${
                          isMine ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-lg ${
                            isMine
                              ? "bg-gradient-to-br from-violet-500 to-blue-600"
                              : "border border-white/10 bg-gradient-to-br from-slate-600 to-slate-800"
                          }`}
                        >
                          {item.senderName?.charAt(0)?.toUpperCase() || "U"}
                        </div>

                        <div
                          className={`flex min-w-0 max-w-[88%] flex-col sm:max-w-[78%] ${
                            isMine ? "items-end" : "items-start"
                          }`}
                        >
                          {/* Sender Details */}
                          <div className="mb-2 flex flex-wrap items-center gap-2 px-1">
                            <span className="text-xs font-bold text-slate-200">
                              {isMine ? "You" : item.senderName}
                            </span>

                            <span className="rounded-md border border-white/[0.07] bg-white/[0.04] px-2 py-0.5 text-[9px] font-medium text-slate-400">
                              {item.senderRole}
                            </span>

                            <span className="text-[10px] text-slate-500">
                              {formatTime(item.createdAt)}
                            </span>
                          </div>

                          {/* Message Bubble */}
                          <div className="flex items-center gap-2">
                            <div
                              className={`rounded-2xl px-4 py-3 text-sm leading-6 shadow-lg ${
                                isMine
                                  ? "rounded-tr-md border border-violet-400/20 bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-violet-950/20"
                                  : "rounded-tl-md border border-white/[0.08] bg-[#172238]/90 text-slate-200 shadow-black/10"
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
                                className="rounded-lg border border-transparent p-2 text-slate-500 opacity-100 transition hover:border-red-400/20 hover:bg-red-400/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40 sm:opacity-0 sm:group-hover:opacity-100"
                              >
                                {deletingId === item.id ? (
                                  <LoaderCircle
                                    size={15}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Trash2 size={15} />
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
            <div className="relative z-10 flex shrink-0 items-center gap-2 border-t border-red-400/15 bg-red-500/[0.08] px-4 py-3 text-xs text-red-300 sm:px-6">
              <AlertCircle size={16} className="shrink-0" />
              <span className="min-w-0 flex-1">{error}</span>

              <button
                type="button"
                onClick={() => fetchMessages(true)}
                className="shrink-0 font-semibold text-red-200 transition hover:text-white hover:underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* Message Composer */}
          <footer className="relative z-10 shrink-0 border-t border-white/[0.07] bg-[#101a30]/85 p-3 backdrop-blur-xl sm:p-5">
            <form
              onSubmit={handleSend}
              className="mx-auto flex max-w-4xl items-end gap-2 sm:gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="rounded-2xl border border-white/[0.09] bg-[#0b1324] p-2 transition focus-within:border-violet-400/50 focus-within:ring-2 focus-within:ring-violet-500/10">
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
                    className="max-h-32 min-h-10 w-full resize-y bg-transparent px-3 py-2 text-sm leading-6 text-white outline-none placeholder:text-slate-500"
                  />
                </div>

                <div className="mt-2 flex items-center justify-between px-1">
                  <p className="text-[10px] text-slate-500">
                    Enter to send · Shift+Enter for new line
                  </p>

                  <p className="text-[10px] tabular-nums text-slate-500">
                    {message.length}/2000
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={!message.trim() || sending}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-950/30 transition hover:-translate-y-0.5 hover:shadow-violet-900/40 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                aria-label="Send message"
              >
                {sending ? (
                  <LoaderCircle size={20} className="animate-spin" />
                ) : (
                  <Send size={19} />
                )}
              </button>
            </form>

            <p className="mt-3 text-center text-[10px] tracking-wide text-slate-600">
              WorkSphere TeamSpace · Stay connected, work together
            </p>
          </footer>
        </section>
      </div>
    </main>
  );
}
