"use client";

import type { TaskStatus } from "@/types";
import type { Doc } from "../../convex/_generated/dataModel";
import { TaskCard } from "@/components/TaskCard";

const COLUMNS: Array<{ status: TaskStatus; title: string }> = [
  { status: "inbox", title: "Inbox" },
  { status: "assigned", title: "Assigned" },
  { status: "in_progress", title: "In Progress" },
  { status: "review", title: "Review" },
  { status: "done", title: "Done" },
  { status: "blocked", title: "Blocked" },
];

export function KanbanBoard({
  tasksByStatus,
  onSelectTask,
}: {
  tasksByStatus: Record<TaskStatus, Doc<"tasks">[]>;
  onSelectTask?: (..._args: [Doc<"tasks">]) => void;
}) {
  return (
    <section className="flex-1">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Kanban</h2>
          <p className="text-xs text-gray-500 mt-1">Tasks grouped by status</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {COLUMNS.map((col) => {
          const tasks = tasksByStatus[col.status] ?? [];
          return (
            <div key={col.status} className="rounded-lg bg-gray-50 border border-gray-200">
              <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xs font-semibold text-gray-800">{col.title}</h3>
                <span className="text-xs text-gray-500">{tasks.length}</span>
              </div>
              <div className="p-2 space-y-2 min-h-24">
                {tasks.length === 0 ? (
                  <div className="text-xs text-gray-400 px-1 py-2">No tasks</div>
                ) : (
                  tasks.map((t) => (
                    <TaskCard
                      key={t._id}
                      task={t}
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
