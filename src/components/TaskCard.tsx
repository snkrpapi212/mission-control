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
    urgent: "URGENT",
    high: "HIGH",
    medium: "MEDIUM",
    low: "LOW",
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

  return (
    <motion.button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{
        y: -4,
        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)",
      }}
      transition={{ duration: 0.15 }}
      className={`mc-card mc-focus relative w-full overflow-hidden p-4 text-left before:absolute before:inset-y-0 before:left-0 before:w-[3px] ${railClass(
        task.priority
      )} ${
        isDragging
          ? "opacity-50 ring-2 ring-[var(--mc-amber)]"
          : "border border-[var(--mc-line)]"
      } transition-all`}
    >
      {/* Priority badge */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--mc-text-soft)]">
          {priorityLabel(task.priority)}
        </span>
        <span className="text-[13px] text-[var(--mc-text-soft)]">{timeAgo(task.updatedAt)}</span>
      </div>

      {/* Title */}
      <h4 className="line-clamp-2 text-[16px] font-semibold leading-[1.3] text-[var(--mc-text)]">
        {task.title}
      </h4>

      {/* Description preview with enhanced styling */}
      <motion.div
        animate={{ height: isHovered ? "auto" : "2.8em" }}
        transition={{ duration: 0.2 }}
        className="mt-2 overflow-hidden"
      >
        <p className={`text-[13px] leading-[1.45] text-[var(--mc-text-muted)] ${
          !isHovered ? "line-clamp-2" : ""
        }`}>
          {task.description || "No description"}
        </p>
      </motion.div>

      {/* Tags */}
      <div className="mt-3 flex flex-wrap gap-2">
        {(task.tags ?? []).slice(0, 4).map((tag) => (
          <motion.div
            key={tag}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Chip className="bg-[var(--mc-line)] text-[var(--mc-text-soft)]">{tag}</Chip>
          </motion.div>
        ))}
      </div>

      {/* Assignee row */}
      <div className="mt-4 flex items-center justify-between gap-2 rounded-[8px] bg-[var(--mc-panel-soft)] px-3 py-2">
        <div className="flex items-center gap-2">
          {assignee ? (
            <>
              <span className="text-[18px]">{assignee.emoji}</span>
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
          <motion.div
            animate={{ scale: isHovered ? 1.1 : 1 }}
            className="text-[14px]"
          >
            ✓
          </motion.div>
        )}
      </div>
    </motion.button>
  );
}
