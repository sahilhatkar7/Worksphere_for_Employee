
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  X,
  Users,
  FolderKanban,
  ClipboardList,
  UserCheck,
  Loader2,
  ArrowUpRight,
} from "lucide-react";

const SEARCH_SOURCES = [
  {
    key: "employees",
    url: "/api/admin/employees",
    resultKey: "employees",
    category: "Employee",
    href: "/admin/employees",
    icon: Users,
  },
  {
    key: "projects",
    url: "/api/admin/projects",
    resultKey: "projects",
    category: "Project",
    href: "/admin/projects",
    icon: FolderKanban,
  },
  {
    key: "tasks",
    url: "/api/admin/tasks",
    resultKey: "tasks",
    category: "Task",
    href: "/admin/tasks",
    icon: ClipboardList,
  },
  {
    key: "approvals",
    url: "/api/admin/pending-approvals",
    resultKey: "users",
    category: "Approval",
    href: "/admin/approvals",
    icon: UserCheck,
  },
];

function makeSearchResults(source, records) {
  return records.map((record) => {
    let title = "";
    let subtitle = "";
    let keywords = [];

    if (source.key === "employees") {
      title = record.fullName || "Unnamed employee";
      subtitle = `${record.email || ""} · ${record.roleName || "Employee"}`;
      keywords = [
        record.id,
        record.fullName,
        record.email,
        record.roleName,
        record.isActive ? "active" : "inactive",
      ];
    }

    if (source.key === "projects") {
      title = record.name || "Unnamed project";
      subtitle = `${record.status || "Unknown status"} · ${
        record.description || "No description"
      }`;
      keywords = [
        record.id,
        record.name,
        record.description,
        record.status,
        record.createdByName,
      ];
    }

    if (source.key === "tasks") {
      title = record.title || "Untitled task";
      subtitle = `${record.projectName || "No project"} · ${
        record.assignedToName || "Unassigned"
      }`;
      keywords = [
        record.id,
        record.title,
        record.description,
        record.projectName,
        record.assignedToName,
        record.assignedToEmail,
        record.status,
        record.priority,
      ];
    }

    if (source.key === "approvals") {
      title = record.fullName || "Unnamed applicant";
      subtitle = `${record.email || ""} · ${
        record.requestedRoleName || "Requested role"
      }`;
      keywords = [
        record.id,
        record.fullName,
        record.email,
        record.requestedRoleName,
        record.approvalStatus,
      ];
    }

    return {
      id: `${source.key}-${record.id}`,
      title,
      subtitle,
      category: source.category,
      href: source.href,
      icon: source.icon,
      keywords: keywords.filter(Boolean).join(" ").toLowerCase(),
    };
  });
}

export default function AdminGlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    async function loadSearchData() {
      setIsLoading(true);
      setError("");

      const responses = await Promise.allSettled(
        SEARCH_SOURCES.map(async (source) => {
          const response = await fetch(source.url, {
            method: "GET",
            credentials: "same-origin",
            cache: "no-store",
          });

          if (!response.ok) {
            throw new Error(`${source.category} data could not be loaded.`);
          }

          const data = await response.json();

          if (!data.success || !Array.isArray(data[source.resultKey])) {
            throw new Error(`${source.category} data has an invalid format.`);
          }

          return makeSearchResults(source, data[source.resultKey]);
        })
      );

      if (cancelled) return;

      const loadedResults = [];
      const failedSources = [];

      responses.forEach((response, index) => {
        if (response.status === "fulfilled") {
          loadedResults.push(...response.value);
        } else {
          failedSources.push(SEARCH_SOURCES[index].category);
        }
      });

      setResults(loadedResults);

      if (failedSources.length === SEARCH_SOURCES.length) {
        setError("Unable to load search data. Please try again.");
      } else if (failedSources.length > 0) {
        setError(
          `Some results could not be loaded: ${failedSources.join(", ")}.`
        );
      }

      setIsLoading(false);
    }

    loadSearchData();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const filteredResults = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();

    if (!searchTerm) return [];

    return results
      .filter((result) => {
        const searchableText =
          `${result.title} ${result.subtitle} ${result.category} ${result.keywords}`.toLowerCase();

        return searchableText.includes(searchTerm);
      })
      .slice(0, 10);
  }, [query, results]);

  function openSearch() {
    setQuery("");
    setIsOpen(true);
  }

  function closeSearch() {
    setIsOpen(false);
    setQuery("");
  }

  return (
    <>
      <button
        type="button"
        aria-label="Open dashboard search"
        title="Search"
        onClick={openSearch}
        className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-2.5 text-slate-400 transition hover:border-blue-400/30 hover:bg-white/10 hover:text-white"
      >
        <Search size={19} />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-black/70 px-4 pt-[12vh] backdrop-blur-md sm:pt-[15vh]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeSearch();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Search your workspace"
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#10182b]/95 shadow-2xl shadow-black/50 backdrop-blur-2xl"
          >
            <div className="flex items-center gap-3 border-b border-white/[0.08] px-5 py-4">
              <Search size={21} className="shrink-0 text-blue-300" />

              <input
                autoFocus
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search employees, projects, tasks..."
                aria-label="Search employees, projects, tasks and approvals"
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />

              <button
                type="button"
                onClick={closeSearch}
                aria-label="Close search"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            <div className="max-h-[55vh] overflow-y-auto p-4">
              {isLoading && (
                <div className="flex items-center justify-center gap-3 py-12 text-sm text-slate-400">
                  <Loader2 size={19} className="animate-spin text-blue-400" />
                  Loading workspace data...
                </div>
              )}

              {!isLoading && error && (
                <p className="rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3 text-sm text-amber-200">
                  {error}
                </p>
              )}

              {!isLoading && !query.trim() && (
                <div className="py-10 text-center">
                  <Search
                    size={30}
                    className="mx-auto mb-3 text-slate-600"
                  />
                  <p className="text-sm font-medium text-slate-300">
                    Search your workspace
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Find employees, projects, tasks and pending approvals.
                  </p>
                </div>
              )}

              {!isLoading &&
                query.trim() &&
                filteredResults.length > 0 && (
                  <div className="space-y-2">
                    <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Search results ({filteredResults.length}
                      {results.length > filteredResults.length ? "+" : ""})
                    </p>

                    {filteredResults.map((result) => {
                      const Icon = result.icon;

                      return (
                        <Link
                          key={result.id}
                          href={result.href}
                          onClick={closeSearch}
                          className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 transition hover:border-blue-400/20 hover:bg-white/[0.06]"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.05] text-blue-300">
                            <Icon size={19} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-200 group-hover:text-white">
                              {result.title}
                            </p>
                            <p className="mt-1 truncate text-xs text-slate-500">
                              {result.subtitle}
                            </p>
                          </div>

                          <span className="hidden rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium text-slate-400 sm:inline-block">
                            {result.category}
                          </span>

                          <ArrowUpRight
                            size={17}
                            className="shrink-0 text-slate-600 transition group-hover:text-blue-300"
                          />
                        </Link>
                      );
                    })}
                  </div>
                )}

              {!isLoading &&
                query.trim() &&
                filteredResults.length === 0 && (
                  <div className="py-10 text-center">
                    <Search
                      size={28}
                      className="mx-auto mb-3 text-slate-600"
                    />
                    <p className="text-sm font-medium text-slate-300">
                      No results found
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Try another name, email, project or task.
                    </p>
                  </div>
                )}
            </div>

            <div className="flex items-center justify-between border-t border-white/[0.08] px-5 py-3 text-[11px] text-slate-500">
              <span>WorkSphere Global Search</span>
              <span>Press ESC to close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
