"use client";

import type { TaskStatus } from "@/types";
import type { Agent } from "@/types";

interface FilterBarProps {
  statusFilter: TaskStatus | "all";
  priorityFilter: string;
  agentFilter: string;
  agents: Agent[];
  onStatusChange: (_status: TaskStatus | "all") => void;
  onPriorityChange: (_priority: string) => void;
  onAgentChange: (_agentId: string) => void;
}

export function FilterBar({
  statusFilter,
  priorityFilter,
  agentFilter,
  agents,
  onStatusChange,
  onPriorityChange,
  onAgentChange,
}: FilterBarProps) {
  const hasActiveFilters = statusFilter !== "all" || priorityFilter !== "all" || agentFilter !== "all";

  const handleClearFilters = () => {
    onStatusChange("all");
    onPriorityChange("all");
    onAgentChange("all");
  };

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-[var(--mc-line)] bg-[var(--mc-card)] p-3 shadow-sm">
      <div className="relative">
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value as TaskStatus | "all")}
          className="mc-input mc-select pr-10 appearance-none cursor-pointer min-w-[140px]"
          aria-label="Filter by status"
        >
          <option value="all">All Status</option>
          <option value="inbox">Inbox</option>
          <option value="assigned">Assigned</option>
          <option value="in_progress">In Progress</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      <div className="relative">
        <select
          value={priorityFilter}
          onChange={(e) => onPriorityChange(e.target.value)}
          className="mc-input mc-select pr-10 appearance-none cursor-pointer min-w-[140px]"
          aria-label="Filter by priority"
        >
          <option value="all">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      <div className="relative">
        <select
          value={agentFilter}
          onChange={(e) => onAgentChange(e.target.value)}
          className="mc-input mc-select pr-10 appearance-none cursor-pointer min-w-[160px]"
          aria-label="Filter by agent"
        >
          <option value="all">All Agents</option>
          {agents.map((a) => (
            <option key={a._id} value={a.agentId}>
              {a.emoji} {a.name}
            </option>
          ))}
        </select>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={handleClearFilters}
          className="mc-btn mc-btn-ghost text-[var(--mc-text-muted)] hover:text-[var(--mc-text)] text-[12px]"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
