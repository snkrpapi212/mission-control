"use client";

import type { TaskStatus } from "@/types";
import type { Agent } from "@/types";

export function FilterBar({
  statusFilter,
  priorityFilter,
  agentFilter,
  agents,
  onStatusChange,
  onPriorityChange,
  onAgentChange,
}: {
  statusFilter: TaskStatus | "all";
  priorityFilter: string;
  agentFilter: string;
  agents: Agent[];
  onStatusChange: (status: TaskStatus | "all") => void;
  onPriorityChange: (priority: string) => void;
  onAgentChange: (agentId: string) => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap gap-3 items-center rounded-lg bg-white border border-gray-200 p-3">
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value as TaskStatus | "all")}
        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 hover:bg-gray-50 transition-colors duration-200"
      >
        <option value="all">All Status</option>
        <option value="inbox">Inbox</option>
        <option value="assigned">Assigned</option>
        <option value="in_progress">In Progress</option>
        <option value="review">Review</option>
        <option value="done">Done</option>
        <option value="blocked">Blocked</option>
      </select>

      <select
        value={priorityFilter}
        onChange={(e) => onPriorityChange(e.target.value)}
        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 hover:bg-gray-50 transition-colors duration-200"
      >
        <option value="all">All Priorities</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="urgent">Urgent</option>
      </select>

      <select
        value={agentFilter}
        onChange={(e) => onAgentChange(e.target.value)}
        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 hover:bg-gray-50 transition-colors duration-200"
      >
        <option value="all">All Agents</option>
        {agents.map((a) => (
          <option key={a._id} value={a.agentId}>
            {a.emoji} {a.name}
          </option>
        ))}
      </select>

      {(statusFilter !== "all" || priorityFilter !== "all" || agentFilter !== "all") && (
        <button
          type="button"
          onClick={() => {
            onStatusChange("all");
            onPriorityChange("all");
            onAgentChange("all");
          }}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-medium transition-colors duration-200"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
