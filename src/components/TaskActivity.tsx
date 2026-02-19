"use client";

import { motion } from "framer-motion";
import type { Doc } from "../../convex/_generated/dataModel";

interface TaskActivityProps {
  task: Doc<"tasks">;
}

interface ActivityEntry {
  id: string;
  agentName: string;
  action: string;
  target: string;
  icon: string;
  timestamp: number;
}

// Mock activity for now
const MOCK_ACTIVITY: ActivityEntry[] = [
  {
    id: "act1",
    agentName: "Jarvis",
    action: "created",
    target: "this task",
    icon: "➕",
    timestamp: Date.now() - 604800000,
  },
  {
    id: "act2",
    agentName: "Friday",
    action: "changed status from",
    target: "Inbox → Assigned",
    icon: "🔄",
    timestamp: Date.now() - 345600000,
  },
  {
    id: "act3",
    agentName: "Friday",
    action: "assigned to",
    target: "Friday (Developer Agent)",
    icon: "👤",
    timestamp: Date.now() - 259200000,
  },
  {
    id: "act4",
    agentName: "Friday",
    action: "changed status from",
    target: "Assigned → In Progress",
    icon: "🔄",
    timestamp: Date.now() - 86400000,
  },
  {
    id: "act5",
    agentName: "Friday",
    action: "added comment",
    target: "Update on progress",
    icon: "💬",
    timestamp: Date.now() - 3600000,
  },
];

const groupByDay = (activities: ActivityEntry[]) => {
  const groups: Record<string, ActivityEntry[]> = {};
  const now = new Date();

  activities.forEach((activity) => {
    const date = new Date(activity.timestamp);
    let key: string;

    if (isToday(date, now)) {
      key = "Today";
    } else if (isYesterday(date, now)) {
      key = "Yesterday";
    } else {
      key = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }

    if (!groups[key]) groups[key] = [];
    groups[key].push(activity);
  });

  return groups;
};

const isToday = (date: Date, now: Date) => {
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
};

const isYesterday = (date: Date, now: Date) => {
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
};

export function TaskActivity({ task: _task }: TaskActivityProps) {
  const groupedActivity = groupByDay(MOCK_ACTIVITY);

  return (
    <div className="p-6">
      {/* Activity Timeline */}
      {Object.entries(groupedActivity).map(([dayLabel, activities], dayIdx) => (
        <motion.div
          key={dayLabel}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: dayIdx * 0.1, duration: 0.2 }}
        >
          {/* Day Separator */}
          <div className="flex items-center gap-3 my-4 mb-6">
            <div className="flex-1 h-px bg-[var(--mc-line)]" />
            <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[var(--mc-text-soft)] px-2">
              {dayLabel}
            </span>
            <div className="flex-1 h-px bg-[var(--mc-line)]" />
          </div>

          {/* Activity Items */}
          <div className="space-y-3">
            {activities.map((activity, itemIdx) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: dayIdx * 0.1 + itemIdx * 0.05,
                  duration: 0.2,
                }}
                className="p-3 rounded border border-[var(--mc-line)] bg-[var(--mc-card)] hover:bg-[var(--mc-panel-soft)] transition-colors"
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 text-[18px] mt-0.5">
                    {activity.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-[var(--mc-text)]">
                      <span className="font-semibold">{activity.agentName}</span>{" "}
                      {activity.action}{" "}
                      <span className="font-medium text-[var(--mc-text-muted)]">
                        {activity.target}
                      </span>
                    </p>
                    <p className="text-[12px] text-[var(--mc-text-soft)] mt-1">
                      {formatTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Empty State */}
      {MOCK_ACTIVITY.length === 0 && (
        <div className="py-12 text-center text-[14px] text-[var(--mc-text-soft)]">
          <div className="text-[32px] mb-2">📭</div>
          <p>No activity yet.</p>
        </div>
      )}
    </div>
  );
}

const formatTime = (timestamp: number): string => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};
