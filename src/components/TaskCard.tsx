"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Doc } from "../../convex/_generated/dataModel";
import { timeAgo } from "@/lib/time";
import { Chip } from "@/components/MissionControlPrimitives";
import { User, Check } from "lucide-react";

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
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHover(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={canHover ? { y: -4, boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)" } : undefined}
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
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--mc-text-soft)]">
          {priorityLabel(task.priority)}
        </span>
        <span className="text-[11px] text-[var(--mc-text-soft)]">{timeAgo(task.updatedAt)}</span>
      </div>

      {/* Title */}
      <h4 className="line-clamp-2 text-[15px] font-semibold leading-snug text-[var(--mc-text)]">
        {task.title}
      </h4>

      {/* Description preview */}
      <div className="mt-2 overflow-hidden">
        <p className="line-clamp-2 text-[12px] leading-relaxed text-[var(--mc-text-muted)]">
          {task.description || "No description"}
        </p>
      </div>

      {/* Tags */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {(task.tags ?? []).slice(0, 4).map((tag) => (
          <motion.div
            key={tag}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15 }}
          >
            <Chip className="bg-[var(--mc-line)] text-[var(--mc-text-soft)] text-[10px] px-1.5 py-0.5">{tag}</Chip>
          </motion.div>
        ))}
      </div>

      {/* Assignee row */}
      <div className="mt-3 flex items-center justify-between gap-2 rounded-lg bg-[var(--mc-panel-soft)] px-2.5 py-2">
        <div className="flex items-center gap-2">
          {assignee ? (
            <>
              <div className="h-6 w-6 rounded-md bg-[var(--mc-line)] flex items-center justify-center text-[var(--mc-text-muted)]">
                <User size={14} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[12px] font-medium text-[var(--mc-text)]">
                  {assignee.name}
                </p>
                <p className="text-[10px] text-[var(--mc-text-soft)]">{assignee.role}</p>
              </div>
            </>
          ) : (
            <span className="text-[12px] text-[var(--mc-text-soft)]">Unassigned</span>
          )}
        </div>
        {assignee && (
          <motion.div
            animate={{ scale: isHovered ? 1.1 : 1 }}
            className="h-5 w-5 rounded-full bg-[var(--mc-accent-green-soft)] flex items-center justify-center"
          >
            <Check size={12} className="text-[var(--mc-accent-green)]" />
          </motion.div>
        )}
      </div>
    </motion.button>
  );
}
