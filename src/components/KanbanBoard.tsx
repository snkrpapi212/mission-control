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

  const byAgent = useMemo(() => {
    const map = new Map<string, Doc<"agents">>();
    agents.forEach((a) => map.set(a.agentId, a));
    return map;
  }, [agents]);

  const passesFilter = (task: Doc<"tasks">) => {
    if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
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
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#e2e0d7] bg-white px-3 py-2">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.15em] text-[#5e5b53]">
          <span className="text-[#b68a3f]">•</span> Mission Queue
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks"
            className="h-8 rounded-md border border-[#e2dfd6] bg-[#fbfbf8] px-2.5 text-xs text-[#44413b] placeholder:text-[#9f9b91]"
          />
          {(["all", "urgent", "high", "medium", "low"] as const).map((priority) => (
            <button
              key={priority}
              onClick={() => setPriorityFilter(priority)}
              className={`rounded-full border px-2.5 py-1 text-[11px] ${priorityFilter === priority ? "border-[#c8b07b] bg-[#f5efe0] text-[#7b6842]" : "border-[#e3e0d7] bg-white text-[#8b877d]"}`}
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
            <div key={col.status} className="rounded-lg border border-[#e2e0d7] bg-[#f6f5f1]">
              <div className="flex items-center justify-between border-b border-[#e2e0d7] px-3 py-2">
                <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#58554d]">
                  <span className="mr-1.5 text-[10px]" style={{ color: col.accent }}>●</span>
                  {col.title}
                </h3>
                <span className="rounded bg-[#ecebe5] px-1.5 py-0.5 text-[11px] text-[#8b877d]">{tasks.length}</span>
              </div>
              <div className="min-h-32 space-y-2 p-2">
                {loading ? (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="rounded-md border border-[#e2e0d7] bg-white p-2">
                      <div className="h-3 w-3/4 animate-pulse rounded bg-[#edeae0]" />
                      <div className="mt-2 h-2.5 w-full animate-pulse rounded bg-[#f2efe7]" />
                      <div className="mt-2 h-2.5 w-2/3 animate-pulse rounded bg-[#f2efe7]" />
                    </div>
                  ))
                ) : tasks.length === 0 ? (
                  <div className="rounded-md border border-dashed border-[#d9d5c9] bg-[#faf9f6] p-3 text-center text-xs text-[#9c988e]">
                    No tasks in {col.title.toLowerCase()}.
                  </div>
                ) : (
                  tasks.map((t) => (
                    <TaskCard
                      key={t._id}
                      task={t}
                      assignee={t.assigneeIds[0] ? byAgent.get(t.assigneeIds[0]) : undefined}
                      onClick={onSelectTask ? () => onSelectTask(t) : undefined}
                    />
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
