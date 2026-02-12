import { motion } from "framer-motion";
import type { Doc } from "../../convex/_generated/dataModel";
import { timeAgo } from "@/lib/time";
import { Chip } from "@/components/MissionControlPrimitives";
import { User, Check, Clock, Paperclip, MessageSquare } from "lucide-react";

function railClass(priority: Doc<"tasks">["priority"]) {
  if (priority === "urgent") return "before:bg-[var(--mc-red)]";
  if (priority === "high") return "before:bg-[var(--mc-amber)]";
  if (priority === "medium") return "before:bg-[var(--mc-green)]";
  return "before:bg-[var(--mc-line-strong)]";
}

function PriorityBadge({ priority }: { priority: Doc<"tasks">["priority"] }) {
  const configs = {
    urgent: { label: "URGENT", class: "text-[var(--mc-red)] bg-[var(--mc-red-soft)] border-[var(--mc-red)]/20" },
    high: { label: "HIGH", class: "text-[var(--mc-amber)] bg-[var(--mc-amber-soft)] border-[var(--mc-amber)]/20" },
    medium: { label: "MEDIUM", class: "text-[var(--mc-green)] bg-[var(--mc-green-soft)] border-[var(--mc-green)]/20" },
    low: { label: "LOW", class: "text-[var(--mc-text-soft)] bg-[var(--mc-panel-soft)] border-[var(--mc-line)]" },
  };
  const { label, class: className } = configs[priority] || configs.low;

  return (
    <span className={`px-1.5 py-0.5 rounded text-[9px] font-black tracking-wider border ${className}`}>
      {label}
    </span>
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

  return (
    <motion.div
      layoutId={task._id}
      whileHover={{ y: -2, boxShadow: "var(--sh-card-hover)" }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`mc-card mc-focus relative w-full overflow-hidden p-4 text-left before:absolute before:inset-y-0 before:left-0 before:w-[4px] ${railClass(
        task.priority
      )} ${
        isDragging
          ? "opacity-50 ring-2 ring-[var(--mc-amber)] scale-105 z-50"
          : "border border-[var(--mc-line)]"
      } cursor-pointer group`}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <PriorityBadge priority={task.priority} />
        <div className="flex items-center gap-1 text-[11px] font-medium text-[var(--mc-text-soft)]">
          <Clock size={12} className="opacity-70" />
          {timeAgo(task.updatedAt)}
        </div>
      </div>

      {/* Title */}
      <h4 className="line-clamp-2 text-[15px] font-bold leading-tight text-[var(--mc-text)] group-hover:text-[var(--mc-green)] transition-colors">
        {task.title}
      </h4>

      {/* Description preview */}
      {task.description && (
        <div className="mt-2.5">
          <p className="line-clamp-2 text-[12px] leading-relaxed text-[var(--mc-text-muted)]">
            {task.description}
          </p>
        </div>
      )}

      {/* Tags */}
      {(task.tags ?? []).length > 0 && (
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {(task.tags ?? []).slice(0, 3).map((tag) => (
            <Chip key={tag} className="bg-[var(--mc-panel-soft)] text-[var(--mc-text-soft)] text-[10px] font-bold px-2 py-0.5 border-none">
              {tag}
            </Chip>
          ))}
          {(task.tags ?? []).length > 3 && (
            <span className="text-[10px] font-bold text-[var(--mc-text-muted)]">
              +{(task.tags ?? []).length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer Info (if needed, e.g. indicators for comments/attachments) */}
      {/* <div className="mt-4 flex items-center gap-3 border-t border-[var(--mc-line)]/50 pt-3">
        <div className="flex items-center gap-1 text-[11px] text-[var(--mc-text-muted)]">
          <MessageSquare size={12} />
          <span>2</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-[var(--mc-text-muted)]">
          <Paperclip size={12} />
          <span>1</span>
        </div>
      </div> */}

      {/* Assignee row */}
      <div className={`mt-4 flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 transition-colors ${
        assignee ? "bg-[var(--mc-panel-soft)]/50" : "border border-dashed border-[var(--mc-line)]"
      }`}>
        <div className="flex items-center gap-2.5 min-w-0">
          {assignee ? (
            <>
              <div className="h-7 w-7 rounded-lg bg-[var(--mc-card)] border border-[var(--mc-line)] flex items-center justify-center text-[var(--mc-text-muted)] shadow-sm">
                <User size={14} strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[12px] font-bold text-[var(--mc-text)] leading-tight">
                  {assignee.name}
                </p>
                <p className="truncate text-[10px] font-medium text-[var(--mc-text-soft)]">{assignee.role}</p>
              </div>
            </>
          ) : (
            <span className="text-[11px] font-bold text-[var(--mc-text-soft)]/60 italic px-1">Unassigned</span>
          )}
        </div>
        {assignee && (
          <div
            className="h-5 w-5 rounded-full bg-[var(--mc-green)] flex items-center justify-center shadow-sm"
          >
            <Check size={12} strokeWidth={3} className="text-white" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

