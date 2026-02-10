"use client";

import type { Activity } from "@/types";
import { timeAgo } from "@/lib/time";
import { Chip, PanelHeader } from "@/components/MissionControlPrimitives";

const ICON_BY_TYPE: Record<string, string> = {
  task_created: "◉",
  task_updated: "◌",
  status_changed: "◎",
  message_created: "✎",
  document_created: "▣",
  heartbeat: "•",
};

export function ActivityFeed({
  activities,
  loading,
  compact,
}: {
  activities: Activity[];
  loading?: boolean;
  compact?: boolean;
}) {
  return (
    <section className={`border-l border-[var(--mc-line)] bg-[var(--mc-panel)] ${compact ? "rounded-[var(--r-card)] border" : "min-h-[calc(100vh-var(--h-topbar))]"}`}>
      <PanelHeader title="Live Feed" count={activities.length} />

      <div className="border-b border-[var(--mc-line)] px-[var(--sp-4)] py-[var(--sp-3)]">
        <div className="mb-[var(--sp-2)] flex flex-wrap gap-[var(--sp-2)]">
          <Chip className="border-[var(--mc-amber)] bg-[var(--mc-amber-soft)] text-[var(--mc-amber)]">All</Chip>
          <Chip>Tasks</Chip>
          <Chip>Comments</Chip>
          <Chip>Decisions</Chip>
        </div>
        <div className="flex flex-wrap gap-[var(--sp-2)]">
          <Chip>All Agents</Chip>
          <Chip>Jarvis</Chip>
          <Chip>Friday</Chip>
          <Chip>Loki</Chip>
        </div>
      </div>

      <div className="max-h-[calc(100vh-var(--h-topbar)-var(--h-section)-100px)] overflow-y-auto">
        {loading ? (
          <div className="space-y-[var(--sp-3)] p-[var(--sp-3)]">
            {Array.from({ length: 7 }).map((_, idx) => (
              <div key={idx} className="mc-card h-28 animate-pulse" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <p className="p-[var(--sp-4)] text-[14px] text-[var(--mc-text-soft)]">No activity yet. Updates will appear in real-time.</p>
        ) : (
          <ul>
            {activities.map((activity) => (
              <li key={activity._id} className="border-b border-[var(--mc-line)] px-[var(--sp-4)] py-[var(--sp-4)] hover:bg-[var(--mc-panel-soft)]">
                <div className="flex gap-[var(--sp-3)]">
                  <span className="mt-[var(--sp-1)] text-[18px] text-[var(--mc-amber)]">{ICON_BY_TYPE[activity.type] || "•"}</span>
                  <div className="min-w-0">
                    <p className={`leading-[1.4] text-[var(--mc-text)] ${compact ? "text-[14px]" : "text-[15px]"}`}>
                      <span className="font-semibold">{activity.agentId}</span> {activity.message}
                    </p>
                    <p className="mt-[var(--sp-1)] text-[13px] text-[var(--mc-text-soft)]">{timeAgo(activity.createdAt)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
