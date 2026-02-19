"use client";

import { useState, useMemo } from "react";
import type { Activity } from "@/types";
import { timeAgo } from "@/lib/time";
import {
  PlusCircle,
  RefreshCcw,
  ArrowRightLeft,
  MessageSquare,
  FileText,
  Activity as ActivityIcon,
  X,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Icon + color config per activity type
const ACTIVITY_CONFIG: Record<
  string,
  { icon: React.ElementType; color: string; verb: string }
> = {
  task_created: {
    icon: PlusCircle,
    color: "var(--mc-green)",
    verb: "created",
  },
  task_updated: {
    icon: RefreshCcw,
    color: "var(--mc-amber)",
    verb: "updated",
  },
  status_changed: {
    icon: ArrowRightLeft,
    color: "var(--mc-cyan)",
    verb: "moved",
  },
  message_created: {
    icon: MessageSquare,
    color: "var(--mc-purple)",
    verb: "messaged",
  },
  document_created: {
    icon: FileText,
    color: "var(--mc-purple)",
    verb: "added doc",
  },
  heartbeat: {
    icon: ActivityIcon,
    color: "var(--mc-text-subtle)",
    verb: "pinged",
  },
};

function formatGroupDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();
  const yesterday = today - 86_400_000;
  const t = date.getTime();
  if (t >= today) return "Today";
  if (t >= yesterday) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function ActivityFeed({
  activities,
  loading,
}: {
  activities: Activity[];
  loading?: boolean;
  compact?: boolean;
}) {
  const [detail, setDetail] = useState<Activity | null>(null);

  const grouped = useMemo(() => {
    const map: Record<string, Activity[]> = {};
    for (const a of activities) {
      const d = new Date(a.createdAt);
      const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
      if (!map[key]) map[key] = [];
      map[key].push(a);
    }
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]));
  }, [activities]);

  return (
    <>
      <section
        className="flex min-h-[calc(100vh-var(--h-topbar))] flex-col"
        style={{
          background: "var(--mc-panel)",
          borderLeft: "1px solid var(--mc-line)",
          width: "var(--w-right)",
          minWidth: "var(--w-right)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: "1px solid var(--mc-line)" }}
        >
          <span
            className="text-[10px] font-bold uppercase tracking-[0.15em]"
            style={{ color: "var(--mc-text-subtle)" }}
          >
            Activity
          </span>
          <span
            className="tabular-nums text-[10px] font-semibold"
            style={{ color: "var(--mc-text-muted)" }}
          >
            {activities.length}
          </span>
        </div>

        {/* Scrollable feed */}
        <div className="flex-1 overflow-y-auto pb-12">
          {loading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 px-2">
                  <div className="h-6 w-6 shrink-0 rounded-full skeleton-shimmer" />
                  <div className="flex-1 space-y-1.5 pt-0.5">
                    <div className="h-2.5 w-20 rounded skeleton-shimmer" />
                    <div className="h-2 w-40 rounded skeleton-shimmer" />
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <ActivityIcon
                size={28}
                style={{ color: "var(--mc-text-subtle)" }}
              />
              <p
                className="mt-3 text-[12px]"
                style={{ color: "var(--mc-text-subtle)" }}
              >
                No activity yet
              </p>
            </div>
          ) : (
            grouped.map(([dateStr, items]) => (
              <div key={dateStr}>
                {/* Date group label */}
                <div className="px-4 py-2.5">
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: "var(--mc-text-subtle)" }}
                  >
                    {formatGroupDate(dateStr)}
                  </span>
                </div>

                {/* Items with timeline line */}
                <div className="relative px-4">
                  {/* Vertical line */}
                  <div
                    className="absolute left-[28px] top-0 bottom-0 w-px"
                    style={{ background: "var(--mc-line)" }}
                  />

                  <ul className="space-y-px">
                    {items.map((activity) => {
                      const cfg =
                        ACTIVITY_CONFIG[activity.type] ??
                        ACTIVITY_CONFIG.heartbeat;
                      const Icon = cfg.icon;

                      return (
                        <li key={activity._id} className="relative z-10">
                          <button
                            type="button"
                            onClick={() => setDetail(activity)}
                            className="group flex w-full items-start gap-3 rounded-md px-2 py-2.5 text-left transition-colors duration-100"
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background =
                                "var(--mc-panel-2)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "")
                            }
                          >
                            {/* Icon bubble */}
                            <div
                              className="relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                              style={{
                                background: "var(--mc-panel-3)",
                                border: "1px solid var(--mc-line)",
                              }}
                            >
                              <Icon
                                size={11}
                                style={{ color: cfg.color }}
                                strokeWidth={2.5}
                              />
                            </div>

                            {/* Content */}
                            <div className="min-w-0 flex-1 pt-0.5">
                              <div className="flex items-baseline justify-between gap-2">
                                <span
                                  className="truncate text-[11px] font-semibold"
                                  style={{ color: "var(--mc-text)" }}
                                >
                                  {activity.agentId}
                                </span>
                                <span
                                  className="shrink-0 text-[10px] tabular-nums"
                                  style={{ color: "var(--mc-text-subtle)" }}
                                >
                                  {timeAgo(activity.createdAt)}
                                </span>
                              </div>
                              <p
                                className="mt-0.5 text-[11px] leading-snug line-clamp-2"
                                style={{ color: "var(--mc-text-muted)" }}
                              >
                                <span
                                  className="font-medium mr-1"
                                  style={{ color: cfg.color }}
                                >
                                  {cfg.verb}
                                </span>
                                {activity.message}
                              </p>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Detail modal */}
      <AnimatePresence>
        {detail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setDetail(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.15 }}
              className="relative w-full max-w-md overflow-hidden rounded-xl"
              style={{
                background: "var(--mc-panel)",
                border: "1px solid var(--mc-line)",
                boxShadow: "var(--sh-modal)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: "1px solid var(--mc-line)" }}
              >
                <div>
                  <h3
                    className="text-[14px] font-bold"
                    style={{ color: "var(--mc-text)" }}
                  >
                    Activity Detail
                  </h3>
                  <p
                    className="text-[10px] mt-0.5"
                    style={{ color: "var(--mc-text-subtle)" }}
                  >
                    {new Date(detail.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setDetail(null)}
                  className="flex h-7 w-7 items-center justify-center rounded-md transition-colors"
                  style={{ color: "var(--mc-text-muted)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--mc-panel-2)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "")
                  }
                >
                  <X size={15} />
                </button>
              </div>

              {/* Modal body */}
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className="rounded-lg p-3"
                    style={{
                      background: "var(--mc-panel-2)",
                      border: "1px solid var(--mc-line)",
                    }}
                  >
                    <p
                      className="text-[9px] font-bold uppercase tracking-widest mb-1.5"
                      style={{ color: "var(--mc-text-subtle)" }}
                    >
                      Type
                    </p>
                    <p
                      className="text-[12px] font-semibold capitalize"
                      style={{ color: "var(--mc-text)" }}
                    >
                      {detail.type.replace(/_/g, " ")}
                    </p>
                  </div>
                  <div
                    className="rounded-lg p-3"
                    style={{
                      background: "var(--mc-panel-2)",
                      border: "1px solid var(--mc-line)",
                    }}
                  >
                    <p
                      className="text-[9px] font-bold uppercase tracking-widest mb-1.5"
                      style={{ color: "var(--mc-text-subtle)" }}
                    >
                      Agent
                    </p>
                    <p
                      className="text-[12px] font-semibold truncate"
                      style={{ color: "var(--mc-text)" }}
                    >
                      {detail.agentId}
                    </p>
                  </div>
                </div>

                {detail.taskId && (
                  <div
                    className="flex items-center gap-2 rounded-lg px-3 py-2"
                    style={{
                      background: "var(--mc-cyan-glow)",
                      border: "1px solid var(--mc-cyan-border)",
                    }}
                  >
                    <Zap size={12} style={{ color: "var(--mc-cyan)" }} />
                    <span
                      className="text-[11px] font-mono"
                      style={{ color: "var(--mc-cyan)" }}
                    >
                      {detail.taskId}
                    </span>
                  </div>
                )}

                <div
                  className="rounded-lg p-4"
                  style={{
                    background: "var(--mc-panel-2)",
                    border: "1px solid var(--mc-line)",
                  }}
                >
                  <p
                    className="text-[9px] font-bold uppercase tracking-widest mb-2"
                    style={{ color: "var(--mc-text-subtle)" }}
                  >
                    Message
                  </p>
                  <p
                    className="text-[13px] leading-relaxed whitespace-pre-wrap"
                    style={{ color: "var(--mc-text-muted)" }}
                  >
                    {detail.message}
                  </p>
                </div>
              </div>

              <div
                className="flex justify-end px-5 py-3"
                style={{ borderTop: "1px solid var(--mc-line)" }}
              >
                <button
                  onClick={() => setDetail(null)}
                  className="rounded-md px-4 py-1.5 text-[12px] font-semibold transition-colors"
                  style={{
                    background: "var(--mc-panel-3)",
                    border: "1px solid var(--mc-line)",
                    color: "var(--mc-text)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--mc-panel-2)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "var(--mc-panel-3)")
                  }
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
