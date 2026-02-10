"use client";

import { useMemo, useState } from "react";
import type { TaskStatus } from "@/types";
import type { Doc } from "../../convex/_generated/dataModel";
import { TaskCard } from "@/components/TaskCard";
import { Chip, PanelHeader } from "@/components/MissionControlPrimitives";

const COLUMNS: Array<{ status: TaskStatus; title: string; dotClass: string }> = [
  { status: "inbox", title: "Inbox", dotClass: "text-[var(--mc-line-strong)]" },
  { status: "assigned", title: "Assigned", dotClass: "text-[var(--mc-amber)]" },
  { status: "in_progress", title: "In Progress", dotClass: "text-[var(--mc-green)]" },
  { status: "review", title: "Review", dotClass: "text-[var(--mc-amber)]" },
  { status: "done", title: "Done", dotClass: "text-[var(--mc-green)]" },
  { status: "blocked", title: "Blocked", dotClass: "text-[var(--mc-red)]" },
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

  const byAgent = useMemo(() => {
    const map = new Map<string, Doc<"agents">>();
    agents.forEach((a) => map.set(a.agentId, a));
    return map;
  }, [agents]);

  const totalVisible = COLUMNS.reduce((sum, col) => sum + (tasksByStatus[col.status] ?? []).length, 0);

  const passesFilter = (task: Doc<"tasks">) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return task.title.toLowerCase().includes(q) || task.description.toLowerCase().includes(q);
  };

  return (
    <section className="min-w-0 bg-[var(--mc-panel-soft)]">
      <PanelHeader dotClass="text-[var(--mc-amber)]" title="Mission Queue" count={totalVisible} />

      <div className="flex items-center justify-between border-b border-[var(--mc-line)] px-4 py-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tasks"
          className="mc-focus h-9 w-[260px] rounded-[12px] border border-[var(--mc-line)] bg-[var(--mc-card)] px-3 text-[13px] text-[var(--mc-text)] placeholder:text-[var(--mc-text-soft)]"
        />
        <div className="flex items-center gap-2">
          <Chip className="border-[var(--mc-amber)] bg-[var(--mc-amber-soft)] text-[var(--mc-amber)]">All</Chip>
          <Chip>Tasks</Chip>
          <Chip>Priority</Chip>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 p-3 md:grid-cols-2 2xl:grid-cols-5">
        {COLUMNS.map((col) => {
          const tasks = (tasksByStatus[col.status] ?? []).filter(passesFilter);
          return (
            <div key={col.status} className="rounded-[var(--r-card)] border border-[var(--mc-line)] bg-[var(--mc-panel)]">
              <div className="flex items-center justify-between border-b border-[var(--mc-line)] px-4 py-3">
                <h3 className="text-[14px] font-semibold uppercase tracking-[0.1em] text-[var(--mc-text)]">
                  <span className={`mr-2 ${col.dotClass}`}>●</span>
                  {col.title}
                </h3>
                <Chip>{tasks.length}</Chip>
              </div>

              <div className="space-y-3 p-3">
                {loading ? (
                  Array.from({ length: 2 }).map((_, idx) => (
                    <div key={idx} className="mc-card h-32 animate-pulse p-4" />
                  ))
                ) : tasks.length === 0 ? (
                  <div className="rounded-[14px] border border-dashed border-[var(--mc-line-strong)] bg-[var(--mc-card)] p-4 text-center text-[13px] uppercase tracking-[0.12em] text-[var(--mc-text-soft)]">
                    No tasks
                  </div>
                ) : (
                  tasks.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      assignee={task.assigneeIds[0] ? byAgent.get(task.assigneeIds[0]) : undefined}
                      onClick={onSelectTask ? () => onSelectTask(task) : undefined}
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
