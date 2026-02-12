"use client";

import type { Doc } from "../../convex/_generated/dataModel";
import { timeAgo } from "@/lib/time";
import { Chip } from "@/components/MissionControlPrimitives";
import { User, Check, Clock, AlertCircle, ArrowUpCircle, Circle } from "lucide-react";
import { motion } from "framer-motion";

function railClass(priority: Doc<"tasks">["priority"]) {
  if (priority === "urgent") return "before:bg-[var(--mc-red)]";
  if (priority === "high") return "before:bg-[var(--mc-amber)]";
  if (priority === "medium") return "before:bg-[var(--mc-green)]";
  return "before:bg-[var(--mc-line-strong)]";
}

function priorityIcon(priority: Doc<"tasks">["priority"]) {
  switch (priority) {
    case "urgent":
      return <AlertCircle size={12} className="text-[var(--mc-red)]" />;
    case "high":
      return <ArrowUpCircle size={12} className="text-[var(--mc-amber)]" />;
    case "medium":
      return <Clock size={12} className="text-[var(--mc-green)]" />;
    default:
      return <Circle size={12} className="text-[var(--mc-text-soft)]" />;
  }
}

function priorityLabel(priority: Doc<"tasks">["priority"]) {
  const labels: Record<string, string> = {
    urgent: "URGENT",
    high: "HIGH",
    medium: "MEDIUM",
    low: "LOW",
  };
  return labels[priority] || "LOW";
}

function priorityBgClass(priority: Doc<"tasks">["priority"]) {
  switch (priority) {
    case "urgent":
      return "bg-[var(--mc-red-soft)]";
    case "high":
      return "bg-[var(--mc-amber-soft)]";
    case "medium":
      return "bg-[var(--mc-green-soft)]";
    default:
      return "bg-[var(--mc-panel-soft)]";
  }
}

export function TaskCard({
  task,
  assignee,
  onClick,
  isDragging,
}: {
  task: Doc<"tasks">;
  assignee?: Doc<"agents">;
  onClick?: () => void;
  isDragging?: boolean;
}) {
  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      whileHover={{ y: -2, boxShadow: "var(--sh-card-hover)" }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
      className={`group relative w-full overflow-hidden rounded-xl border bg-[var(--mc-card)] p-4 text-left 
        before:absolute before:inset-y-0 before:left-0 before:w-[3px] ${railClass(task.priority)}
        ${isDragging ? "opacity-50 ring-2 ring-[var(--mc-amber)]" : "border-[var(--mc-line)]"}
        cursor-pointer shadow-[var(--sh-card)] hover:border-[var(--mc-line-strong)]
        transition-colors duration-200`}
    >
      {/* Priority badge */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {priorityIcon(task.priority)}
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--mc-text-soft)]">
            {priorityLabel(task.priority)}
          </span>
        </div>
        <span className="text-[11px] text-[var(--mc-text-soft)]">{timeAgo(task.updatedAt)}</span>
      </div>

      {/* Title */}
      <h4 className="line-clamp-2 text-[15px] font-semibold leading-snug text-[var(--mc-text)] group-hover:text-[var(--mc-text)]">
        {task.title}
      </h4>

      {/* Description preview */}
      <div className="mt-2 overflow-hidden">
        <p className="line-clamp-2 text-[12px] leading-relaxed text-[var(--mc-text-muted)]">
          {task.description || "No description"}
        </p>
      </div>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(task.tags ?? []).slice(0, 4).map((tag) => (
            <Chip key={tag} className="bg-[var(--mc-chip-bg)] text-[var(--mc-chip-text)] text-[10px] px-2 py-0.5 border-0">
              {tag}
            </Chip>
          ))}
        </div>
      )}

      {/* Assignee row */}
      <div className={`mt-3 flex items-center justify-between gap-2 rounded-lg ${priorityBgClass(task.priority)} px-2.5 py-2 transition-colors`}>
        <div className="flex items-center gap-2">
          {assignee ? (
            <>
              <div className="h-6 w-6 rounded-md bg-[var(--mc-card)] border border-[var(--mc-line)] flex items-center justify-center text-[var(--mc-text-muted)]">
                <User size={14} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[12px] font-medium text-[var(--mc-text)]">
                  {assignee.name}
                </p>
              </div>
            </>
          ) : (
            <span className="text-[12px] text-[var(--mc-text-soft)] flex items-center gap-1.5">
              <User size={14} />
              Unassigned
            </span>
          )}
        </div>
        {assignee && (
          <div className="h-5 w-5 rounded-full bg-[var(--mc-card)] border border-[var(--mc-line)] flex items-center justify-center">
            <Check size={12} className="text-[var(--mc-accent-green)]" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
