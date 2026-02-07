"use client";

import type { Task } from "@/types";
import { timeAgo } from "@/lib/time";

function priorityBadge(priority: Task["priority"]) {
  switch (priority) {
    case "low":
      return "bg-gray-100 text-gray-700";
    case "medium":
      return "bg-blue-50 text-blue-700";
    case "high":
      return "bg-orange-50 text-orange-700";
    case "urgent":
      return "bg-red-50 text-red-700";
  }
}

export function TaskCard({ task }: { task: Task }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm hover:shadow transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold text-gray-900 leading-snug">
          {task.title}
        </h4>
        <span className={`text-[11px] px-2 py-0.5 rounded-full ${priorityBadge(task.priority)}`}>
          {task.priority}
        </span>
      </div>
      <p className="mt-1 text-xs text-gray-600 line-clamp-3">{task.description}</p>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {task.tags.slice(0, 3).map((t) => (
            <span key={t} className="text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-700">
              {t}
            </span>
          ))}
        </div>
        <div className="text-[11px] text-gray-500">updated {timeAgo(task.updatedAt)}</div>
      </div>
    </div>
  );
}
