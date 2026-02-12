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
      className={`mc-card mc-focus relative w-full overflow-hidden p-5 text-left before:absolute before:inset-y-0 before:left-0 before:w-[5px] ${railClass(
        task.priority
      )} ${
        isDragging
          ? "opacity-50 ring-2 ring-[var(--mc-amber)] scale-[1.02] z-50 shadow-2xl"
          : "border border-[var(--mc-line)] hover:border-[var(--mc-line-strong)]"
      } cursor-pointer group transition-all duration-300`}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <PriorityBadge priority={task.priority} />
        <div className="flex items-center gap-1 text-[11px] font-black text-[var(--mc-text-muted)] opacity-60 uppercase tracking-tighter">
          <Clock size={12} strokeWidth={2.5} />
          {timeAgo(task.updatedAt)}
        </div>
      </div>

      {/* Title */}
      <h4 className="line-clamp-2 text-[16px] font-bold leading-snug text-[var(--mc-text)] group-hover:text-[var(--mc-green)] transition-colors tracking-tight">
        {task.title}
      </h4>

      {/* Description preview */}
      {task.description && (
        <div className="mt-3">
          <p className="line-clamp-2 text-[13px] leading-relaxed text-[var(--mc-text-soft)] font-medium">
            {task.description}
          </p>
        </div>
      )}

      {/* Tags */}
      {(task.tags ?? []).length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {(task.tags ?? []).slice(0, 3).map((tag) => (
            <Chip key={tag} className="bg-[var(--mc-panel-soft)] text-[var(--mc-text-muted)] text-[10px] font-black uppercase tracking-wider px-2 py-0.5 border-none shadow-sm">
              {tag}
            </Chip>
          ))}
          {(task.tags ?? []).length > 3 && (
            <span className="text-[10px] font-black text-[var(--mc-text-muted)] opacity-50">
              +{(task.tags ?? []).length - 3}
            </span>
          )}
        </div>
      )}

      {/* Assignee row */}
      <div className={`mt-5 flex items-center justify-between gap-2 rounded-[14px] px-3 py-3 transition-all duration-300 ${
        assignee ? "bg-[var(--mc-panel-soft)]/50 group-hover:bg-[var(--mc-panel-soft)]" : "border border-dashed border-[var(--mc-line)] opacity-60"
      }`}>
        <div className="flex items-center gap-3 min-w-0">
          {assignee ? (
            <>
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 border border-[var(--mc-line)] flex items-center justify-center text-[var(--mc-text-muted)] shadow-sm group-hover:scale-110 transition-transform">
                <User size={16} strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-bold text-[var(--mc-text)] leading-tight">
                  {assignee.name}
                </p>
                <p className="truncate text-[11px] font-bold text-[var(--mc-text-muted)] uppercase tracking-wide opacity-70">{assignee.role}</p>
              </div>
            </>
          ) : (
            <span className="text-[11px] font-black text-[var(--mc-text-soft)] uppercase tracking-widest px-1">Unassigned</span>
          )}
        </div>
        {assignee && (
          <div
            className="h-6 w-6 rounded-full bg-[var(--mc-green)] flex items-center justify-center shadow-md ring-2 ring-white dark:ring-[var(--mc-panel)]"
          >
            <Check size={14} strokeWidth={3.5} className="text-white" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

