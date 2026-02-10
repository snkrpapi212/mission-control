"use client";

import { useMemo, useState } from "react";
import type { TaskStatus } from "@/types";
import type { Doc } from "../../convex/_generated/dataModel";
import { TaskCard } from "@/components/TaskCard";

const COLUMNS: Array<{ status: TaskStatus; title: string; accent: string }> = [
  { status: "inbox", title: "Inbox", accent: "#a8a59d" },
  { status: "assigned", title: "Assigned", accent: "#cc9a3f" },
  { status: "in_progress", title: "In Progress", accent: "#4ba47c" },
  { status: "review", title: "Review", accent: "#c89946" },
  { status: "done", title: "Done", accent: "#54a07b" },
  { status: "blocked", title: "Blocked", accent: "#c56b65" },
];

export function KanbanBoard({
  tasksByStatus,
  agents,
  loading,
  onSelectTask,
}: {
  tasksByStatus: Record<TaskStatus, Doc<"tasks">[]>;
  agents: Doc<"agents">[];
  loading?: boolean;
  onSelectTask?: (..._args: [Doc<"tasks">]) => void;
}) {
  const [query, setQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"all" | "urgent" | "high" | "medium" | "low">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | TaskStatus>("all");

  const byAgent = useMemo(() => {
    const map = new Map<string, Doc<"agents">>();
    agents.forEach((a) => map.set(a.agentId, a));
    return map;
  }, [agents]);

  const passesFilter = (task: Doc<"tasks">) => {
    if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
    if (statusFilter !== "all" && task.status !== statusFilter) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      task.title.toLowerCase().includes(q) ||
      task.description.toLowerCase().includes(q) ||
      task.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  };

  return (
    <section className="flex-1">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border mc-card px-3 py-2">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em]">
          <span style={{ color: "var(--mc-accent-amber)" }}>•</span> Mission Queue
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tasks" className="mc-input h-8 rounded-md px-2.5 text-xs" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "all" | TaskStatus)} className="mc-input h-8 rounded-md px-2 text-xs">
            <option value="all">All Status</option>
            {COLUMNS.map((c) => <option key={c.status} value={c.status}>{c.title}</option>)}
          </select>
          {(["all", "urgent", "high", "medium", "low"] as const).map((priority) => (
            <button
              key={priority}
              onClick={() => setPriorityFilter(priority)}
              className={`mc-chip px-2.5 py-1 text-[11px] ${priorityFilter === priority ? "font-semibold" : ""}`}
              style={priorityFilter === priority ? { borderColor: "var(--mc-accent-amber)", color: "var(--mc-accent-amber)" } : undefined}
            >
              {priority === "all" ? "All" : priority.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
        {COLUMNS.map((col) => {
          const tasks = (tasksByStatus[col.status] ?? []).filter(passesFilter);
          return (
            <div key={col.status} className="rounded-lg border mc-panel">
              <div className="flex items-center justify-between border-b px-3 py-2" style={{ borderColor: "var(--mc-border)" }}>
                <h3 className="text-[12px] font-semibold uppercase tracking-[0.1em]">
                  <span className="mr-1.5 text-[10px]" style={{ color: col.accent }}>●</span>
                  {col.title}
                </h3>
                <span className="mc-chip rounded px-1.5 py-0.5 text-[11px]">{tasks.length}</span>
              </div>
              <div className="min-h-32 space-y-2 p-2">
                {loading ? (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="rounded-md border mc-card p-2">
                      <div className="h-3 w-3/4 animate-pulse rounded" style={{ background: "var(--mc-border-soft)" }} />
                      <div className="mt-2 h-2.5 w-full animate-pulse rounded" style={{ background: "var(--mc-border-soft)" }} />
                      <div className="mt-2 h-2.5 w-2/3 animate-pulse rounded" style={{ background: "var(--mc-border-soft)" }} />
                    </div>
                  ))
                ) : tasks.length === 0 ? (
                  <div className="rounded-md border border-dashed p-3 text-center text-xs mc-subtle" style={{ borderColor: "var(--mc-border)" }}>
                    No tasks in {col.title.toLowerCase()}.
                  </div>
                ) : (
                  tasks.map((t) => (
                    <TaskCard key={t._id} task={t} assignee={t.assigneeIds[0] ? byAgent.get(t.assigneeIds[0]) : undefined} onClick={onSelectTask ? () => onSelectTask(t) : undefined} />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
