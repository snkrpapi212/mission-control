"use client";

import { useMemo, useState } from "react";
import type { Activity } from "@/types";
import { timeAgo } from "@/lib/time";

const ICON_BY_TYPE: Record<string, string> = {
  task_created: "➕",
  task_updated: "🔄",
  status_changed: "🔄",
  message_created: "💬",
  document_created: "📄",
  heartbeat: "🟢",
};

function bucketFor(ts: number) {
  const minutes = (Date.now() - ts) / 60000;
  if (minutes < 2) return "Just now";
  if (minutes < 60) return `${Math.round(minutes / 5) * 5} min ago`;
  return "Today";
}

export function ActivityFeed({ activities, loading, compact }: { activities: Activity[]; loading?: boolean; compact?: boolean }) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const groups = useMemo(() => {
    const map = new Map<string, Activity[]>();
    for (const item of activities) {
      const key = bucketFor(item.createdAt);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return Array.from(map.entries());
  }, [activities]);

  return (
    <section className={`border-l mc-panel ${compact ? "rounded-lg border" : "min-h-[calc(100vh-72px)]"}`}>
      <div className="flex h-[50px] items-center justify-between border-b px-3" style={{ borderColor: "var(--mc-border)" }}>
        <h2 className="text-[14px] font-semibold tracking-[0.1em]"><span className="mr-1.5" style={{ color: "var(--mc-accent-green)" }}>•</span>LIVE FEED</h2>
        <span className="mc-chip px-2 py-0.5 text-[11px]">{activities.length} active</span>
      </div>

      <div className="border-b px-3 py-3" style={{ borderColor: "var(--mc-border)" }}>
        <div className="mb-2 flex flex-wrap gap-1.5">
          {[["All", activities.length], ["Tasks", activities.filter((a) => a.type.includes("task")).length], ["Comments", activities.filter((a) => a.type.includes("message")).length]].map(([label, count], idx) => (
            <button key={label as string} className="mc-chip px-2.5 py-1 text-[11px]" style={idx === 0 ? { borderColor: "var(--mc-accent-amber)", color: "var(--mc-accent-amber)" } : undefined}>
              {label} <span className="ml-1 opacity-70">{count as number}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-h-[calc(100vh-162px)] overflow-y-auto">
        {loading ? (
          <div className="space-y-2 p-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-md border mc-card p-3">
                <div className="h-3 w-1/2 animate-pulse rounded" style={{ background: "var(--mc-border-soft)" }} />
                <div className="mt-2 h-2.5 w-full animate-pulse rounded" style={{ background: "var(--mc-border-soft)" }} />
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="p-4 text-center text-xs mc-subtle">No activity yet. Updates will appear in real-time.</div>
        ) : (
          groups.map(([groupName, items]) => (
            <div key={groupName} className="border-b" style={{ borderColor: "var(--mc-border-soft)" }}>
              <button onClick={() => setCollapsed((prev) => ({ ...prev, [groupName]: !prev[groupName] }))} className="flex w-full items-center justify-between px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.12em] mc-subtle">
                <span>{groupName}</span>
                <span>{collapsed[groupName] ? "+" : "−"}</span>
              </button>

              {!collapsed[groupName] ? (
                <ul>
                  {items.map((a) => (
                    <li key={a._id} className="border-t px-3 py-3" style={{ borderColor: "var(--mc-border-soft)" }}>
                      <div className="flex gap-2">
                        <span className="mt-0.5 text-sm">{ICON_BY_TYPE[a.type] || "•"}</span>
                        <div className="min-w-0">
                          <div className="text-[13px] leading-[1.3]"><span className="font-semibold">{a.agentId}</span> <span className="mc-muted">{a.message}</span></div>
                          <div className="mt-1 text-[11px] mc-subtle">{timeAgo(a.createdAt)}</div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
