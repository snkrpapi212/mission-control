import { motion } from "framer-motion";
import type { Doc } from "../../convex/_generated/dataModel";
import { timeAgo } from "@/lib/time";
import { Chip } from "@/components/MissionControlPrimitives";
import { User, Check, Clock, Paperclip, MessageSquare } from "lucide-react";

function PriorityDot({ priority }: { priority: Doc<"tasks">["priority"] }) {
  const configs = {
    urgent: "bg-red-500",
    high: "bg-amber-500",
    medium: "bg-emerald-500",
    low: "bg-zinc-300 dark:bg-zinc-600",
  };
  return <span className={`h-1.5 w-1.5 rounded-full ${configs[priority] || configs.low}`} />;
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
      whileHover={{ y: -1, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)" }}
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
      className={`relative w-full overflow-hidden p-4 text-left rounded-lg bg-white dark:bg-zinc-900 ring-1 ring-black/5 dark:ring-white/10 shadow-sm ${
        isDragging
          ? "opacity-50 ring-2 ring-violet-500 scale-[1.02] z-50 shadow-xl"
          : "hover:ring-black/10 dark:hover:ring-white/20"
      } cursor-pointer group transition-all duration-200`}
    >
      {/* Header */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <PriorityDot priority={task.priority} />
          <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
            {task.priority}
          </span>
        </div>
        <div className="text-[10px] text-zinc-400 tabular-nums font-medium">
          {timeAgo(task.updatedAt)}
        </div>
      </div>

      {/* Title */}
      <h4 className="line-clamp-2 text-sm font-semibold leading-tight text-zinc-900 dark:text-zinc-50 tracking-tight">
        {task.title}
      </h4>

      {/* Tags */}
      {(task.tags ?? []).length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1">
          {(task.tags ?? []).slice(0, 2).map((tag) => (
            <span key={tag} className="text-[10px] text-zinc-500 bg-zinc-50 dark:bg-zinc-800 px-1.5 py-0.5 rounded ring-1 ring-black/5 dark:ring-white/5">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Assignee row */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {assignee ? (
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="h-5 w-5 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-medium text-zinc-500">
                {assignee.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
              </div>
              <span className="truncate text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                {assignee.name}
              </span>
            </div>
          ) : (
            <span className="text-[10px] text-zinc-400 italic">Unassigned</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

