"use client";

import { motion } from "framer-motion";
import type { Doc } from "../../convex/_generated/dataModel";
import { timeAgo } from "@/lib/time";
import { MessageSquare, Paperclip } from "lucide-react";

// Priority → visual config
const PRIORITY_CONFIG = {
  urgent: {
    stripe: "var(--mc-red)",
    label: "URGENT",
    labelColor: "var(--mc-red)",
    bg: "var(--mc-red-glow)",
  },
  high: {
    stripe: "var(--mc-amber)",
    label: "HIGH",
    labelColor: "var(--mc-amber)",
    bg: "var(--mc-amber-glow)",
  },
  medium: {
    stripe: "var(--mc-cyan)",
    label: "MEDIUM",
    labelColor: "var(--mc-cyan)",
    bg: "var(--mc-cyan-glow)",
  },
  low: {
    stripe: "var(--mc-line-strong)",
    label: "LOW",
    labelColor: "var(--mc-text-subtle)",
    bg: "transparent",
  },
} as const;

// Agent initials + model-derived gradient
function AgentBubble({ name, model }: { name: string; model?: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Color avatar by model type
  const modelLower = (model || "").toLowerCase();
  let gradient = "linear-gradient(135deg, #8B949E 0%, #484F58 100%)"; // default gray
  if (modelLower.includes("claude") || modelLower.includes("anthropic")) {
    gradient = "linear-gradient(135deg, #BC8CFF 0%, #7C3AED 100%)";
  } else if (modelLower.includes("gpt") || modelLower.includes("openai") || modelLower.includes("codex")) {
    gradient = "linear-gradient(135deg, #58A6FF 0%, #0969DA 100%)";
  } else if (modelLower.includes("gemini") || modelLower.includes("google")) {
    gradient = "linear-gradient(135deg, #E3B341 0%, #BF7F00 100%)";
  } else if (modelLower.includes("kimi") || modelLower.includes("minimax") || modelLower.includes("deepseek")) {
    gradient = "linear-gradient(135deg, #3FB950 0%, #1A7F37 100%)";
  }

  return (
    <div
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white shadow-sm"
      style={{ background: gradient }}
      title={name}
    >
      {initials}
    </div>
  );
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
  const priority = task.priority as keyof typeof PRIORITY_CONFIG;
  const config = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.low;
  const tags = task.tags ?? [];
  const messageCount = 0; // metadata not in schema
  const attachmentCount = 0;

  return (
    <motion.div
      layoutId={task._id}
      whileHover={isDragging ? {} : { y: -2, transition: { duration: 0.15 } }}
      animate={
        isDragging
          ? { opacity: 0.6, scale: 1.02, rotate: 1.2 }
          : { opacity: 1, scale: 1, rotate: 0 }
      }
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`group relative w-full overflow-hidden rounded-md text-left transition-all duration-150 ${
        isDragging ? "ring-2 ring-[var(--mc-cyan)] shadow-xl cursor-grabbing" : "cursor-pointer"
      }`}
      style={{
        background: `var(--mc-panel)`,
        border: `1px solid var(--mc-line)`,
        boxShadow: isDragging
          ? `0 8px 24px rgba(0,0,0,0.3), 0 0 0 2px var(--mc-cyan)`
          : `var(--sh-card)`,
      }}
    >
      {/* Priority stripe — left edge */}
      <div
        className="absolute inset-y-0 left-0 w-[3px] rounded-l-md"
        style={{ background: config.stripe }}
      />

      {/* Content — offset from stripe */}
      <div className="pl-4 pr-3 pt-3 pb-3">
        {/* Row 1: priority label + time + agent avatar */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="shrink-0 text-[9px] font-bold uppercase tracking-widest"
              style={{ color: config.labelColor }}
            >
              {config.label}
            </span>
            <span
              className="shrink-0 text-[10px] tabular-nums"
              style={{ color: "var(--mc-text-subtle)" }}
            >
              {timeAgo(task.updatedAt)}
            </span>
          </div>

          {/* Agent avatar — top right */}
          {assignee && (
            <AgentBubble name={assignee.name} model={assignee.model} />
          )}
        </div>

        {/* Title */}
        <h4
          className="line-clamp-2 text-[13px] font-semibold leading-snug tracking-tight"
          style={{ color: "var(--mc-text)" }}
        >
          {task.title}
        </h4>

        {/* Tags row */}
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                style={{
                  background: "var(--mc-panel-2)",
                  color: "var(--mc-text-muted)",
                  border: "1px solid var(--mc-line)",
                }}
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span
                className="rounded px-1.5 py-0.5 text-[10px]"
                style={{ color: "var(--mc-text-subtle)" }}
              >
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer: unassigned label OR counters */}
        <div className="mt-3 flex items-center justify-between">
          {!assignee ? (
            <span
              className="text-[10px] italic"
              style={{ color: "var(--mc-text-subtle)" }}
            >
              Unassigned
            </span>
          ) : (
            <span
              className="truncate text-[10px] font-medium"
              style={{ color: "var(--mc-text-muted)" }}
            >
              {assignee.name}
            </span>
          )}

          {/* Metadata counts */}
          <div className="flex items-center gap-2.5">
            {messageCount > 0 && (
              <span
                className="flex items-center gap-0.5 text-[10px] tabular-nums"
                style={{ color: "var(--mc-text-subtle)" }}
              >
                <MessageSquare size={10} />
                {messageCount}
              </span>
            )}
            {attachmentCount > 0 && (
              <span
                className="flex items-center gap-0.5 text-[10px] tabular-nums"
                style={{ color: "var(--mc-text-subtle)" }}
              >
                <Paperclip size={10} />
                {attachmentCount}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Hover highlight — right edge glow strip */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-px opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ background: config.stripe }}
      />
    </motion.div>
  );
}
