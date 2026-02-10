"use client";

import type { Doc } from "../../convex/_generated/dataModel";
import { timeAgo } from "@/lib/time";

function priorityToken(priority: Doc<"tasks">["priority"]) {
  switch (priority) {
    case "low":
      return { label: "P3", tone: "#8f8c83", bg: "#f2f1ec" };
    case "medium":
      return { label: "P2", tone: "#446eab", bg: "#ebf2fd" };
    case "high":
      return { label: "P1", tone: "#b87425", bg: "#fdf1e2" };
    case "urgent":
      return { label: "P0", tone: "#b44c4c", bg: "#fdeaea" };
  }
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
  const priority = priorityToken(task.priority);
  const progress = task.status === "done" ? 100 : task.status === "review" ? 80 : task.status === "in_progress" ? 55 : task.status === "assigned" ? 30 : task.status === "blocked" ? 15 : 5;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-md border border-[#dfddd4] bg-white p-2.5 text-left shadow-[0_1px_0_rgba(0,0,0,0.03)] transition hover:border-[#d1b27d]"
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-[15px] leading-[1.25] font-semibold text-[#24231f] line-clamp-2">{task.title}</h4>
        <span
          className="rounded px-1.5 py-0.5 text-[10px] font-semibold"
          style={{ color: priority.tone, backgroundColor: priority.bg }}
        >
          {priority.label}
        </span>
      </div>

      <p className="mt-1.5 line-clamp-2 text-[12px] leading-[1.35] text-[#6f6b61]">
        {task.description || "No description"}
      </p>

      {task.tags.length ? (
        <div className="mt-2 flex flex-wrap gap-1">
          {task.tags.slice(0, 3).map((t) => (
            <span key={t} className="rounded bg-[#f2f1ed] px-1.5 py-[2px] text-[10px] text-[#8a867c]">
              {t}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-2 flex items-center justify-between text-[11px] text-[#8d897f]">
        <div className="inline-flex items-center gap-1.5 truncate">
          <span className="text-[12px]">{assignee?.emoji || "👤"}</span>
          <span className="truncate">{assignee?.name || "Unassigned"}</span>
        </div>
        <span>{timeAgo(task.updatedAt)}</span>
      </div>

      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[#efeee9]">
        <div className="h-full rounded-full bg-[#c9a15e]" style={{ width: `${progress}%` }} />
      </div>
    </button>
  );
}
