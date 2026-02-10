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

      <div className="border-b border-[var(--mc-line)] px-4 py-3">
        <div className="mb-2 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-[var(--mc-amber)] bg-[var(--mc-amber-soft)] px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--mc-amber)]">All</span>
          <Chip>Tasks</Chip>
          <Chip>Comments</Chip>
          <Chip>Decisions</Chip>
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip>All Agents</Chip>
          <Chip>Jarvis</Chip>
          <Chip>Friday</Chip>
          <Chip>Loki</Chip>
        </div>
      </div>

      <div className="max-h-[calc(100vh-172px)] overflow-y-auto">
        {loading ? (
          <div className="space-y-3 p-3">
            {Array.from({ length: 7 }).map((_, idx) => (
              <div key={idx} className="h-28 animate-pulse bg-[var(--mc-line)] rounded border border-[var(--mc-border)]" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <p className="p-4 text-[14px] text-[var(--mc-text-soft)]">No activity yet. Updates will appear in real-time.</p>
        ) : (
          <ul>
            {activities.map((activity) => (
              <li key={activity._id} className="border-b border-[var(--mc-line)] px-4 py-4 hover:bg-[var(--mc-panel-soft)]">
                <div className="flex gap-3">
                  <span className="mt-1 text-[18px] text-[var(--mc-amber)]">{ICON_BY_TYPE[activity.type] || "•"}</span>
                  <div className="min-w-0">
                    <p className="text-[28px] leading-[1.2] text-[var(--mc-text)]">
                      <span className="font-semibold">{activity.agentId}</span> {activity.message}
                    </p>
                    <p className="mt-1 text-[18px] text-[var(--mc-text-soft)]">{timeAgo(activity.createdAt)}</p>
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
