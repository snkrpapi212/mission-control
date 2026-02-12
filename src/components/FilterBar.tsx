import type { TaskStatus } from "@/types";
import type { Agent } from "@/types";
import { Filter, ChevronDown, X, User, BarChart, Activity, SlidersHorizontal } from "lucide-react";

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
  const hasFilters = statusFilter !== "all" || priorityFilter !== "all" || agentFilter !== "all";

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--mc-line)] bg-[var(--mc-card)]/50 p-2 backdrop-blur-sm shadow-sm">
      <div className="flex items-center gap-1.5 px-3 py-1.5 text-[var(--mc-text-soft)] border-r border-[var(--mc-line)] mr-1">
        <SlidersHorizontal size={14} strokeWidth={2.5} />
        <span className="text-[12px] font-bold uppercase tracking-wider">Filters</span>
      </div>

      <div className="relative group">
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value as TaskStatus | "all")}
          className="appearance-none rounded-xl border border-[var(--mc-line)] bg-[var(--mc-card)] pl-8 pr-10 py-2 text-[13px] font-bold text-[var(--mc-text)] transition-all hover:border-[var(--mc-line-strong)] hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--mc-green)]/20 cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="inbox">Inbox</option>
          <option value="assigned">Assigned</option>
          <option value="in_progress">In Progress</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
          <option value="blocked">Blocked</option>
        </select>
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mc-text-muted)] pointer-events-none">
          <Activity size={14} strokeWidth={2.5} />
        </div>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--mc-text-muted)] pointer-events-none group-hover:text-[var(--mc-text)] transition-colors">
          <ChevronDown size={14} strokeWidth={2.5} />
        </div>
      </div>

      <div className="relative group">
        <select
          value={priorityFilter}
          onChange={(e) => onPriorityChange(e.target.value)}
          className="appearance-none rounded-xl border border-[var(--mc-line)] bg-[var(--mc-card)] pl-8 pr-10 py-2 text-[13px] font-bold text-[var(--mc-text)] transition-all hover:border-[var(--mc-line-strong)] hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--mc-green)]/20 cursor-pointer"
        >
          <option value="all">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mc-text-muted)] pointer-events-none">
          <BarChart size={14} strokeWidth={2.5} />
        </div>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--mc-text-muted)] pointer-events-none group-hover:text-[var(--mc-text)] transition-colors">
          <ChevronDown size={14} strokeWidth={2.5} />
        </div>
      </div>

      <div className="relative group">
        <select
          value={agentFilter}
          onChange={(e) => onAgentChange(e.target.value)}
          className="appearance-none rounded-xl border border-[var(--mc-line)] bg-[var(--mc-card)] pl-8 pr-10 py-2 text-[13px] font-bold text-[var(--mc-text)] transition-all hover:border-[var(--mc-line-strong)] hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--mc-green)]/20 cursor-pointer"
        >
          <option value="all">All Agents</option>
          {agents.map((a) => (
            <option key={a._id} value={a.agentId}>
              {a.name}
            </option>
          ))}
        </select>
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mc-text-muted)] pointer-events-none">
          <User size={14} strokeWidth={2.5} />
        </div>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--mc-text-muted)] pointer-events-none group-hover:text-[var(--mc-text)] transition-colors">
          <ChevronDown size={14} strokeWidth={2.5} />
        </div>
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={() => {
            onStatusChange("all");
            onPriorityChange("all");
            onAgentChange("all");
          }}
          className="ml-auto flex items-center gap-1.5 rounded-xl border border-[var(--mc-red)]/20 bg-[var(--mc-red-soft)] px-3 py-2 text-[12px] font-bold text-[var(--mc-red)] transition-all hover:bg-[var(--mc-red)] hover:text-white"
        >
          <X size={14} strokeWidth={2.5} />
          Clear all
        </button>
      )}
    </div>
  );
}

