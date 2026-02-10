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
  onStatusChange: (_status: TaskStatus | "all") => void;
  onPriorityChange: (_priority: string) => void;
  onAgentChange: (_agentId: string) => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-[14px] border border-[var(--mc-line)] bg-[var(--mc-card)] p-3">
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value as TaskStatus | "all")}
        className="rounded-[10px] border border-[var(--mc-line)] bg-[var(--mc-panel)] px-3 py-1.5 text-[13px] text-[var(--mc-text)] transition-colors duration-200 hover:border-[var(--mc-line-strong)]"
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
        className="rounded-[10px] border border-[var(--mc-line)] bg-[var(--mc-panel)] px-3 py-1.5 text-[13px] text-[var(--mc-text)] transition-colors duration-200 hover:border-[var(--mc-line-strong)]"
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
        className="rounded-[10px] border border-[var(--mc-line)] bg-[var(--mc-panel)] px-3 py-1.5 text-[13px] text-[var(--mc-text)] transition-colors duration-200 hover:border-[var(--mc-line-strong)]"
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
          className="rounded-[10px] border border-[var(--mc-line)] bg-[var(--mc-panel)] px-3 py-1.5 text-[13px] font-medium text-[var(--mc-text-muted)] transition-colors duration-200 hover:border-[var(--mc-line-strong)] hover:text-[var(--mc-text)]"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
