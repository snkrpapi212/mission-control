import { useState, useMemo } from "react";
import type { Activity } from "@/types";
import { timeAgo } from "@/lib/time";
import { Chip, PanelHeader } from "@/components/MissionControlPrimitives";
import { 
  PlusCircle, 
  RefreshCcw, 
  ArrowRightLeft, 
  MessageSquare, 
  FileText, 
  Activity as ActivityIcon,
  Search,
  ChevronRight,
  Clock,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ACTIVITY_CONFIG: Record<string, { icon: any, color: string, bg: string, premium?: boolean }> = {
  task_created: { icon: PlusCircle, color: "var(--mc-green)", bg: "var(--mc-green-soft)", premium: true },
  task_updated: { icon: RefreshCcw, color: "var(--mc-amber)", bg: "var(--mc-amber-soft)" },
  status_changed: { icon: ArrowRightLeft, color: "var(--mc-amber)", bg: "var(--mc-amber-soft)" },
  message_created: { icon: MessageSquare, color: "#3b82f6", bg: "#eff6ff" },
  document_created: { icon: FileText, color: "#8b5cf6", bg: "#f5f3ff", premium: true },
  heartbeat: { icon: ActivityIcon, color: "var(--mc-text-soft)", bg: "var(--mc-panel-soft)" },
};

function formatGroupDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86400000;
  const time = date.getTime();

  if (time >= today) return "Today";
  if (time >= yesterday) return "Yesterday";
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

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

  const groupedActivities = useMemo(() => {
    const groups: Record<string, Activity[]> = {};
    activities.forEach(activity => {
      const d = new Date(activity.createdAt);
      const dateStr = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(activity);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [activities]);

  return (
    <>
    <section className={`flex flex-col min-h-[calc(100vh-var(--h-topbar))]`}>
      <div className="px-6 py-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Activity</h2>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="space-y-4 p-4">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="h-16 w-full animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <p className="text-[12px] text-zinc-400 dark:text-zinc-500">No activity yet</p>
          </div>
        ) : (
          <div className="pb-12">
            {groupedActivities.map(([dateStr, items]) => (
              <div key={dateStr}>
                <div className="px-6 py-2">
                  <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                    {formatGroupDate(dateStr)}
                  </span>
                </div>
                <ul className="relative">
                  {/* Vertical Timeline Line - Subtle */}
                  <div className="absolute left-[24px] top-0 bottom-0 w-[1px] bg-zinc-100 dark:bg-zinc-800" />
                  
                  {items.map((activity) => {
                    const config = ACTIVITY_CONFIG[activity.type] || ACTIVITY_CONFIG.heartbeat;
                    const Icon = config.icon;

                    return (
                      <li key={activity._id} className="relative z-10 px-4">
                        <button
                          type="button"
                          onClick={() => setSelectedActivity(activity)}
                          className="group w-full rounded-md px-2 py-3 text-left transition-colors hover:bg-white dark:hover:bg-zinc-800 hover:shadow-sm hover:ring-1 hover:ring-black/5 dark:hover:ring-white/10"
                        >
                          <div className="flex gap-3">
                            <div 
                              className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors"
                            >
                              <Icon size={12} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 truncate">
                                  {activity.agentId}
                                </span>
                                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 tabular-nums whitespace-nowrap font-medium">
                                  {timeAgo(activity.createdAt)}
                                </span>
                              </div>
                              <p className="mt-0.5 text-[12px] leading-relaxed text-zinc-600 dark:text-zinc-400 line-clamp-2">
                                {activity.message}
                              </p>
                            </div>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>

    <AnimatePresence>
      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            onClick={() => setSelectedActivity(null)} 
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg rounded-2xl border border-[var(--mc-line)] bg-[var(--mc-card)] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--mc-line)] bg-[var(--mc-panel-soft)]/50 px-6 py-4">
              <div>
                <h3 className="text-[16px] font-bold text-[var(--mc-text)]">Activity Details</h3>
                <p className="text-[11px] font-bold text-[var(--mc-text-muted)] uppercase tracking-wider mt-0.5">
                  {new Date(selectedActivity.createdAt).toLocaleString()}
                </p>
              </div>
              <button 
                onClick={() => setSelectedActivity(null)}
                className="rounded-full p-2 hover:bg-[var(--mc-line)]/50 text-[var(--mc-text-soft)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-[var(--mc-line)] p-3 bg-[var(--mc-panel-soft)]/20">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--mc-text-muted)] mb-1">Type</p>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const config = ACTIVITY_CONFIG[selectedActivity.type] || ACTIVITY_CONFIG.heartbeat;
                      const Icon = config.icon;
                      return (
                        <>
                          <Icon size={14} style={{ color: config.color }} />
                          <p className="text-[13px] font-bold text-[var(--mc-text)] capitalize">{selectedActivity.type.replace('_', ' ')}</p>
                        </>
                      );
                    })()}
                  </div>
                </div>
                <div className="rounded-xl border border-[var(--mc-line)] p-3 bg-[var(--mc-panel-soft)]/20">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--mc-text-muted)] mb-1">Agent</p>
                  <p className="text-[13px] font-bold text-[var(--mc-text)]">{selectedActivity.agentId}</p>
                </div>
              </div>

              {(selectedActivity.taskId || selectedActivity.documentId) && (
                <div className="space-y-3">
                  {selectedActivity.taskId && (
                    <div className="flex items-center justify-between rounded-xl border border-[var(--mc-line)] px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                          <Zap size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--mc-text-muted)]">Task ID</p>
                          <p className="text-[12px] font-mono font-medium text-[var(--mc-text)]">{selectedActivity.taskId}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="rounded-xl border border-[var(--mc-line)] p-4 bg-[var(--mc-panel-soft)]/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--mc-text-muted)] mb-2">Message</p>
                <p className="text-[14px] leading-relaxed font-medium text-[var(--mc-text-soft)] whitespace-pre-wrap">
                  {selectedActivity.message}
                </p>
              </div>
            </div>

            <div className="border-t border-[var(--mc-line)] bg-[var(--mc-panel-soft)]/30 px-6 py-4 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedActivity(null)}
                className="rounded-xl border border-[var(--mc-line)] bg-[var(--mc-card)] px-5 py-2 text-[13px] font-bold text-[var(--mc-text)] hover:bg-[var(--mc-panel)] hover:shadow-sm transition-all"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  );
}

