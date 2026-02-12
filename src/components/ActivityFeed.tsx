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
    <section className={`flex flex-col border-l border-[var(--mc-line)] bg-[var(--mc-panel)] ${compact ? "rounded-xl border shadow-sm overflow-hidden" : "min-h-[calc(100vh-var(--h-topbar))]"}`}>
      <PanelHeader title="Live Feed" count={activities.length} />

      <div className="flex items-center justify-between border-b border-[var(--mc-line)] px-4 py-2.5 bg-[var(--mc-panel-soft)]/30">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[var(--mc-green)] animate-pulse" />
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--mc-text-muted)]">Live Updates</p>
        </div>
        <button className="text-[var(--mc-text-soft)] hover:text-[var(--mc-text)] transition-colors">
          <Search size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="space-y-4 p-4">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="mc-card h-24 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="mb-4 rounded-full bg-[var(--mc-panel-soft)] p-4 text-[var(--mc-text-soft)]/30">
              <ActivityIcon size={32} />
            </div>
            <p className="text-[14px] font-bold text-[var(--mc-text)]">No activity yet</p>
            <p className="mt-1 text-[12px] text-[var(--mc-text-muted)] max-w-[180px]">Updates from your team will appear here in real-time.</p>
          </div>
        ) : (
          <div className="pb-12">
            {groupedActivities.map(([dateStr, items]) => (
              <div key={dateStr}>
                <div className="sticky top-0 z-20 bg-[var(--mc-panel)]/90 backdrop-blur-md px-6 py-3 border-b border-[var(--mc-line)]/50">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--mc-text-muted)] flex items-center gap-2">
                    <span className="h-[1px] w-3 bg-[var(--mc-line-strong)]" />
                    {formatGroupDate(dateStr)}
                    <span className="h-[1px] flex-1 bg-[var(--mc-line-strong)]" />
                  </span>
                </div>
                <ul className="relative">
                  {/* Vertical Timeline Line */}
                  <div className="absolute left-[36px] top-0 bottom-0 w-[1.5px] bg-gradient-to-b from-[var(--mc-line)] via-[var(--mc-line)] to-transparent opacity-50" />
                  
                  {items.map((activity) => {
                    const config = ACTIVITY_CONFIG[activity.type] || ACTIVITY_CONFIG.heartbeat;
                    const Icon = config.icon;

                    return (
                      <li key={activity._id} className="relative z-10">
                        <button
                          type="button"
                          onClick={() => setSelectedActivity(activity)}
                          className={`group w-full px-5 py-5 text-left transition-all duration-300 ${
                            config.premium 
                              ? "bg-gradient-to-r from-[var(--mc-green-soft)]/20 to-transparent hover:from-[var(--mc-green-soft)]/40" 
                              : "hover:bg-[var(--mc-panel-soft)]/50"
                          }`}
                        >
                          <div className="flex gap-4">
                            <div 
                              className={`mt-0.5 flex h-9 min-w-9 items-center justify-center rounded-[12px] border shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md ${
                                config.premium ? "ring-2 ring-[var(--mc-green)]/10" : ""
                              }`}
                              style={{ 
                                backgroundColor: config.bg, 
                                borderColor: config.premium ? "var(--mc-green)" : `${config.color}30`,
                                color: config.color
                              }}
                            >
                              <Icon size={18} strokeWidth={config.premium ? 3 : 2.5} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <span className={`text-[14px] font-bold text-[var(--mc-text)] truncate transition-colors ${config.premium ? "text-[var(--mc-green)]" : "group-hover:text-[var(--mc-text-muted)]"}`}>
                                  {activity.agentId}
                                </span>
                                <span className="flex items-center gap-1 text-[10px] font-black text-[var(--mc-text-muted)] tabular-nums whitespace-nowrap opacity-60 uppercase tracking-tighter">
                                  <Clock size={10} />
                                  {timeAgo(activity.createdAt)}
                                </span>
                              </div>
                              <p className={`text-[13px] leading-[1.6] font-medium transition-colors ${
                                config.premium ? "text-[var(--mc-text)] font-bold" : "text-[var(--mc-text-soft)]"
                              } line-clamp-3`}>
                                {activity.message}
                              </p>
                              <div className="mt-3 flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-[var(--mc-green)] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                                View Details <ChevronRight size={12} strokeWidth={3} />
                              </div>
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

