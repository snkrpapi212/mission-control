"use client";

import { useState } from "react";
import type { Activity } from "@/types";
import { timeAgo } from "@/lib/time";
import { Chip, PanelHeader } from "@/components/MissionControlPrimitives";

const ICON_BY_TYPE: Record<string, string> = {
  task_created: "TC",
  task_updated: "TU",
  status_changed: "SC",
  message_created: "MS",
  document_created: "DC",
  heartbeat: "HB",
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
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  return (
    <>
    <section className={`border-l border-[var(--mc-line)] bg-[var(--mc-panel)] ${compact ? "rounded-[var(--r-card)] border" : "min-h-[calc(100vh-var(--h-topbar))]"}`}>
      <PanelHeader title="Live Feed" count={activities.length} />

      <div className="border-b border-[var(--mc-line)] px-4 py-3">
        <div className="flex items-center justify-between">
          <p className="text-[12px] text-[var(--mc-text-soft)]">Realtime team activity</p>
          <Chip>Latest</Chip>
        </div>
      </div>

      <div className="max-h-[calc(100vh-172px)] overflow-y-auto">
        {loading ? (
          <div className="space-y-3 p-3">
            {Array.from({ length: 7 }).map((_, idx) => (
              <div key={idx} className="mc-card h-28 animate-pulse" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <p className="p-4 text-[14px] text-[var(--mc-text-soft)]">No activity yet. Updates will appear in real-time.</p>
        ) : (
          <ul>
            {activities.map((activity) => (
              <li key={activity._id} className="border-b border-[var(--mc-line)]">
                <button
                  type="button"
                  onClick={() => setSelectedActivity(activity)}
                  className="w-full px-4 py-4 text-left hover:bg-[var(--mc-panel-soft)]"
                >
                  <div className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-[var(--mc-line)] bg-[var(--mc-panel-soft)] px-1 text-[10px] font-semibold tracking-[0.04em] text-[var(--mc-text-soft)]">{ICON_BY_TYPE[activity.type] || "EV"}</span>
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-[14px] leading-[1.4] text-[var(--mc-text)]">
                        <span className="font-semibold">{activity.agentId}</span> {activity.message}
                      </p>
                      <div className="mt-1 flex items-center justify-between gap-3">
                        <p className="text-[12px] text-[var(--mc-text-soft)]">{timeAgo(activity.createdAt)}</p>
                        <span className="text-[12px] text-[var(--mc-accent-green)]">View details</span>
                      </div>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>

    {selectedActivity && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelectedActivity(null)}>
        <div
          className="w-full max-w-xl rounded-[var(--r-card)] border border-[var(--mc-line)] bg-[var(--mc-panel)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="border-b border-[var(--mc-line)] px-4 py-3">
            <p className="text-[15px] font-semibold text-[var(--mc-text)]">Activity details</p>
            <p className="text-[12px] text-[var(--mc-text-soft)]">{new Date(selectedActivity.createdAt).toLocaleString()}</p>
          </div>
          <div className="space-y-3 px-4 py-4 text-[14px]">
            <div>
              <p className="text-[11px] text-[var(--mc-text-soft)]">Type</p>
              <p className="text-[var(--mc-text)]">{selectedActivity.type}</p>
            </div>
            <div>
              <p className="text-[11px] text-[var(--mc-text-soft)]">Agent</p>
              <p className="text-[var(--mc-text)]">{selectedActivity.agentId}</p>
            </div>
            {selectedActivity.taskId && (
              <div>
                <p className="text-[11px] text-[var(--mc-text-soft)]">Task ID</p>
                <p className="break-all text-[var(--mc-text)]">{selectedActivity.taskId}</p>
              </div>
            )}
            {selectedActivity.documentId && (
              <div>
                <p className="text-[11px] text-[var(--mc-text-soft)]">Document ID</p>
                <p className="break-all text-[var(--mc-text)]">{selectedActivity.documentId}</p>
              </div>
            )}
            <div>
              <p className="text-[11px] text-[var(--mc-text-soft)]">Message</p>
              <p className="whitespace-pre-wrap text-[var(--mc-text)]">{selectedActivity.message}</p>
            </div>
          </div>
          <div className="border-t border-[var(--mc-line)] px-4 py-3 text-right">
            <button
              type="button"
              onClick={() => setSelectedActivity(null)}
              className="rounded-[var(--r-tile)] border border-[var(--mc-line)] px-3 py-1.5 text-[13px] text-[var(--mc-text)]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
