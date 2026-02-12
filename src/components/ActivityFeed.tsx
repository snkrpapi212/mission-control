"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Activity } from "@/types";
import { timeAgo } from "@/lib/time";
import { Chip, PanelHeader } from "@/components/MissionControlPrimitives";
import { 
  FilePlus, 
  Edit3, 
  GitCommit, 
  MessageSquare, 
  FileText, 
  Heart, 
  Activity,
  Clock,
  X
} from "lucide-react";

const ICON_BY_TYPE: Record<string, { icon: React.ReactNode; bg: string; color: string }> = {
  task_created: { 
    icon: <FilePlus size={14} />, 
    bg: "bg-[var(--mc-green-soft)]", 
    color: "text-[var(--mc-green)]" 
  },
  task_updated: { 
    icon: <Edit3 size={14} />, 
    bg: "bg-[var(--mc-amber-soft)]", 
    color: "text-[var(--mc-amber)]" 
  },
  status_changed: { 
    icon: <GitCommit size={14} />, 
    bg: "bg-[var(--mc-amber-soft)]", 
    color: "text-[var(--mc-amber)]" 
  },
  message_created: { 
    icon: <MessageSquare size={14} />, 
    bg: "bg-[var(--mc-panel-soft)]", 
    color: "text-[var(--mc-text-muted)]" 
  },
  document_created: { 
    icon: <FileText size={14} />, 
    bg: "bg-[var(--mc-green-soft)]", 
    color: "text-[var(--mc-green)]" 
  },
  heartbeat: { 
    icon: <Heart size={14} />, 
    bg: "bg-[var(--mc-red-soft)]", 
    color: "text-[var(--mc-red)]" 
  },
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

  const getActivityIcon = (type: string) => {
    return ICON_BY_TYPE[type] || { 
      icon: <Activity size={14} />, 
      bg: "bg-[var(--mc-panel-soft)]", 
      color: "text-[var(--mc-text-muted)]" 
    };
  };

  return (
    <>
      <section className={`border-l border-[var(--mc-line)] bg-[var(--mc-panel)]/80 backdrop-blur-sm 
        ${compact ? "rounded-xl border shadow-sm" : "min-h-[calc(100vh-var(--h-topbar))]"}`}
      >
        <PanelHeader 
          title="Live Feed" 
          count={activities.length}
          icon={<Activity size={16} />}
        />

        <div className="border-b border-[var(--mc-line)] px-4 py-3 bg-[var(--mc-panel-soft)]/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--mc-green)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--mc-green)]"></span>
              </span>
              <p className="text-[12px] text-[var(--mc-text-soft)]">Realtime team activity</p>
            </div>
            <Chip className="bg-[var(--mc-green-soft)] text-[var(--mc-green)] border-[var(--mc-green)]/20">Latest</Chip>
          </div>
        </div>

        <div className={`overflow-y-auto ${compact ? "max-h-[400px]" : "max-h-[calc(100vh-172px)]"}`}>
          {loading ? (
            <div className="space-y-3 p-3">
              {Array.from({ length: 7 }).map((_, idx) => (
                <div key={idx} className="h-24 rounded-xl bg-[var(--mc-panel-soft)] animate-pulse" />
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="p-6 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--mc-panel-soft)] mb-3">
                <Clock size={20} className="text-[var(--mc-text-muted)]" />
              </div>
              <p className="text-[14px] text-[var(--mc-text-soft)]">No activity yet. Updates will appear in real-time.</p>
            </div>
          ) : (
            <ul className="divide-y divide-[var(--mc-line)]">
              {activities.map((activity, index) => {
                const { icon, bg, color } = getActivityIcon(activity.type);
                return (
                  <motion.li 
                    key={activity._id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className="border-b border-[var(--mc-line)] last:border-b-0"
                  >
                    <motion.button
                      type="button"
                      onClick={() => setSelectedActivity(activity)}
                      whileHover={{ backgroundColor: "var(--mc-panel-soft)" }}
                      className="w-full px-4 py-4 text-left transition-all duration-200 group"
                    >
                      <div className="flex gap-3">
                        <div className={`shrink-0 h-7 w-7 rounded-lg ${bg} ${color} flex items-center justify-center border border-[var(--mc-line)]`}>
                          {icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-[14px] leading-[1.4] text-[var(--mc-text)]">
                            <span className="font-semibold">{activity.agentId}</span>{" "}
                            <span className="text-[var(--mc-text-muted)]">{activity.message}</span>
                          </p>
                          <div className="mt-1.5 flex items-center justify-between gap-3">
                            <p className="text-[12px] text-[var(--mc-text-soft)]">{timeAgo(activity.createdAt)}</p>
                            <span className="text-[12px] text-[var(--mc-accent-green)] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              View details →
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <AnimatePresence>
        {selectedActivity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setSelectedActivity(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-xl rounded-xl border border-[var(--mc-line)] bg-[var(--mc-card)] shadow-[var(--mc-sh-modal)] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[var(--mc-line)] px-4 py-3 bg-[var(--mc-panel-soft)]/50">
                <div>
                  <p className="text-[15px] font-semibold text-[var(--mc-text)]">Activity details</p>
                  <p className="text-[12px] text-[var(--mc-text-soft)]">{new Date(selectedActivity.createdAt).toLocaleString()}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedActivity(null)}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-[var(--mc-text-muted)] hover:text-[var(--mc-text)] hover:bg-[var(--mc-panel-soft)] transition-colors"
                >
                  <X size={18} />
                </motion.button>
              </div>
              
              <div className="space-y-4 px-4 py-5 text-[14px]">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-[var(--mc-panel-soft)] border border-[var(--mc-line)]">
                    <p className="text-[11px] uppercase tracking-wider text-[var(--mc-text-soft)] mb-1">Type</p>
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${getActivityIcon(selectedActivity.type).bg.replace('bg-', 'bg-').replace('soft', '')}`} />
                      <p className="text-[var(--mc-text)] font-medium">{selectedActivity.type}</p>
                    </div>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-[var(--mc-panel-soft)] border border-[var(--mc-line)]">
                    <p className="text-[11px] uppercase tracking-wider text-[var(--mc-text-soft)] mb-1">Agent</p>
                    <p className="text-[var(--mc-text)] font-medium">{selectedActivity.agentId}</p>
                  </div>
                </div>

                {selectedActivity.taskId && (
                  <div className="p-3 rounded-lg bg-[var(--mc-panel-soft)] border border-[var(--mc-line)]">
                    <p className="text-[11px] uppercase tracking-wider text-[var(--mc-text-soft)] mb-1">Task ID</p>
                    <p className="text-[var(--mc-text)] font-mono text-[13px] break-all">{selectedActivity.taskId}</p>
                  </div>
                )}

                {selectedActivity.documentId && (
                  <div className="p-3 rounded-lg bg-[var(--mc-panel-soft)] border border-[var(--mc-line)]">
                    <p className="text-[11px] uppercase tracking-wider text-[var(--mc-text-soft)] mb-1">Document ID</p>
                    <p className="text-[var(--mc-text)] font-mono text-[13px] break-all">{selectedActivity.documentId}</p>
                  </div>
                )}

                <div className="p-3 rounded-lg bg-[var(--mc-panel-soft)] border border-[var(--mc-line)]"
                  >
                  <p className="text-[11px] uppercase tracking-wider text-[var(--mc-text-soft)] mb-1">Message</p>
                  <p className="text-[var(--mc-text)] whitespace-pre-wrap leading-relaxed">{selectedActivity.message}</p>
                </div>
              </div>
              
              <div className="border-t border-[var(--mc-line)] px-4 py-3 bg-[var(--mc-panel-soft)]/30">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setSelectedActivity(null)}
                  className="w-full rounded-lg border border-[var(--mc-line)] px-3 py-2 text-[13px] font-medium text-[var(--mc-text)] bg-[var(--mc-card)] hover:bg-[var(--mc-panel)] hover:border-[var(--mc-line-strong)] transition-all"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
