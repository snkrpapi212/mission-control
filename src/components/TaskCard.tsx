"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Doc } from "../../convex/_generated/dataModel";
import { timeAgo } from "@/lib/time";
import { Chip } from "@/components/MissionControlPrimitives";

function railClass(priority: Doc<"tasks">["priority"]) {
  if (priority === "urgent") return "before:bg-[var(--mc-red)]";
  if (priority === "high") return "before:bg-[var(--mc-amber)]";
  if (priority === "medium") return "before:bg-[var(--mc-green)]";
  return "before:bg-[var(--mc-line-strong)]";
}

function priorityLabel(priority: Doc<"tasks">["priority"]) {
  const labels: Record<string, string> = {
    urgent: "🔴 URGENT",
    high: "🟠 HIGH",
    medium: "🟢 MEDIUM",
    low: "⚪ LOW",
  };
  return labels[priority] || "LOW";
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
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: isPressed ? 0.985 : 1,
      }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ 
        duration: 0.14,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      whileHover={{
        boxShadow: "var(--sh-card-hover)",
      }}
      className={`mc-card mc-focus relative w-full overflow-hidden p-4 text-left before:absolute before:inset-y-0 before:left-0 before:w-[3px] ${railClass(
        task.priority
      )} ${
        isDragging
          ? "opacity-50 ring-2 ring-[var(--mc-amber)]"
          : "border border-[var(--mc-line)]"
      } mc-interactive ${isPressed ? 'bg-[var(--mc-panel-soft)]' : ''}`}
      disabled={isDragging}
      aria-label={`Task: ${task.title}, Priority: ${task.priority}`}
    >
      {/* Priority badge */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--mc-text-soft)]">
          {priorityLabel(task.priority)}
        </span>
        <span className="text-[13px] text-[var(--mc-text-soft)]">{timeAgo(task.updatedAt)}</span>
      </div>

      {/* Title */}
      <h4 className="line-clamp-2 text-[16px] font-semibold leading-[1.35] text-[var(--mc-text)]">
        {task.title}
      </h4>

      {/* Description preview - simplified, no expand on hover to avoid layout shift */}
      <p className="mt-2 line-clamp-2 text-[13px] leading-[1.45] text-[var(--mc-text-muted)]">
        {task.description || "No description"}
      </p>

      {/* Tags */}
      <div className="mt-3 flex flex-wrap gap-2">
        {(task.tags ?? []).slice(0, 4).map((tag) => (
          <Chip key={tag} className="bg-[var(--mc-line)] text-[var(--mc-text-soft)] transition-colors duration-150 hover:bg-[var(--mc-line-strong)]">
            {tag}
          </Chip>
        ))}
      </div>

      {/* Assignee row */}
      <div className={`mt-4 flex items-center justify-between gap-2 rounded-[8px] px-3 py-2 transition-colors duration-150 ${isHovered ? 'bg-[var(--mc-panel-soft)]' : 'bg-transparent'}`}>
        <div className="flex items-center gap-2">
          {assignee ? (
            <>
              <span className="text-[16px]" aria-hidden="true">{assignee.emoji}</span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-[var(--mc-text)]">
                  {assignee.name}
                </p>
                <p className="text-[11px] text-[var(--mc-text-soft)]">{assignee.role}</p>
              </div>
            </>
          ) : (
            <span className="text-[13px] text-[var(--mc-text-soft)]">👤 Unassigned</span>
          )}
        </div>
        {assignee && (
          <span className="text-[14px] text-[var(--mc-green)]" aria-hidden="true">✓</span>
        )}
      </div>
    </motion.button>
  );
}
