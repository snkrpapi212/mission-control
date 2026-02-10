"use client";

import type { Doc } from "../../convex/_generated/dataModel";
import type { Agent } from "@/types";
import { timeAgo } from "@/lib/time";

function priorityBadge(priority: Doc<"tasks">["priority"], isDark: boolean = false) {
  if (isDark) {
    switch (priority) {
      case "low":
        return "bg-blue-900 text-blue-300 border border-blue-800";
      case "medium":
        return "bg-orange-900 text-orange-300 border border-orange-800";
      case "high":
        return "bg-red-900 text-red-300 border border-red-800";
      case "urgent":
        return "bg-red-800 text-red-200 border border-red-700 font-semibold";
    }
  }

  switch (priority) {
    case "low":
      return "bg-blue-50 text-blue-700 border border-blue-200";
    case "medium":
      return "bg-orange-50 text-orange-700 border border-orange-200";
    case "high":
      return "bg-red-50 text-red-700 border border-red-200";
    case "urgent":
      return "bg-red-100 text-red-800 border border-red-300 font-semibold";
  }
}

export function TaskCard({
  task,
  agents = [],
  onClick,
  isDark = false,
}: {
  task: Doc<"tasks">;
  agents?: Agent[];
  onClick?: () => void;
  isDark?: boolean;
}) {
  const assignedAgents = agents.filter((a) => task.assigneeIds?.includes(a.agentId));

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-lg border p-3 shadow-sm hover:shadow-md transition-all ${
        isDark
          ? "border-gray-700 bg-gray-750 hover:bg-gray-700"
          : "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className={`text-sm font-semibold leading-snug flex-1 line-clamp-2 ${
          isDark ? "text-white" : "text-gray-900"
        }`}>
          {task.title}
        </h4>
        <span className={`text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${priorityBadge(task.priority, isDark)}`}>
          {task.priority === "urgent" ? "🔴 " : ""}{task.priority}
        </span>
      </div>

      <p className={`text-xs line-clamp-2 mb-3 ${
        isDark ? "text-gray-400" : "text-gray-600"
      }`}>
        {task.description}
      </p>

      <div className="flex items-center justify-between gap-2 mb-2">
        {assignedAgents.length > 0 ? (
          <div className="flex items-center gap-1">
            {assignedAgents.slice(0, 3).map((a) => (
              <span key={a._id} className="text-lg" title={a.name}>
                {a.emoji}
              </span>
            ))}
            {assignedAgents.length > 3 && (
              <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                +{assignedAgents.length - 3}
              </span>
            )}
          </div>
        ) : (
          <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            Unassigned
          </span>
        )}
        <div className={`text-[11px] ${
          isDark ? "text-gray-500" : "text-gray-500"
        }`}>
          {timeAgo(task.createdAt ?? task.updatedAt)}
        </div>
      </div>

      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.tags.slice(0, 2).map((t) => (
            <span
              key={t}
              className={`text-[10px] px-1.5 py-0.5 rounded ${
                isDark
                  ? "bg-gray-700 text-gray-300"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
