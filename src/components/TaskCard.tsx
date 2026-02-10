"use client";

import type { Doc } from "../../convex/_generated/dataModel";
import { timeAgo } from "@/lib/time";
import { Chip } from "@/components/MissionControlPrimitives";

function railClass(priority: Doc<"tasks">["priority"]) {
  if (priority === "urgent") return "before:bg-[var(--mc-red)]";
  if (priority === "high") return "before:bg-[var(--mc-amber)]";
  if (priority === "medium") return "before:bg-[var(--mc-green)]";
  return "before:bg-[var(--mc-line-strong)]";
}

export function TaskCard({
  task,
  assignee,
  onClick,
}: {
  task: Doc<"tasks">;
  assignee?: Doc<"agents">;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mc-card mc-focus relative w-full overflow-hidden p-4 text-left before:absolute before:inset-y-0 before:left-0 before:w-[3px] ${railClass(task.priority)}`}
    >
      <h4 className="line-clamp-2 text-[30px] font-semibold leading-[1.18] text-[var(--mc-text)]">{task.title}</h4>
      <p className="mt-2 line-clamp-3 text-[22px] leading-[1.35] text-[var(--mc-text-muted)]">{task.description || "No description"}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {(task.tags ?? []).slice(0, 4).map((tag) => (
          <Chip key={tag}>{tag}</Chip>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 text-[19px] text-[var(--mc-text-muted)]">
        <span className="truncate">{assignee ? `${assignee.emoji} ${assignee.name}` : "👤 Unassigned"}</span>
        <span className="shrink-0 text-[18px] text-[var(--mc-text-soft)]">{timeAgo(task.updatedAt)}</span>
      </div>
    </button>
  );
}
