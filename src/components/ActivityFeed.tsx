"use client";

import type { Activity } from "@/types";
import { timeAgo } from "@/lib/time";
import { useDarkMode } from "@/context/DarkModeContext";
import { useState, useMemo } from "react";
import { Filter, X, Plus, RotateCw, MessageSquare, FileText } from "lucide-react";

interface ActivityFeedProps {
  activities: Activity[];
  agentNames?: Record<string, string>;
}

type ActivityType = "task_created" | "task_updated" | "task_completed" | "agent_online" | "agent_offline";

function getTimeGroupLabel(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return "Older";
}

function getActivityIcon(type: string): React.ReactNode {
  switch (type) {
    case "task_created":
      return "➕";
    case "task_updated":
      return "🔄";
    case "task_completed":
      return "✅";
    case "message":
      return "💬";
    case "document":
      return "📄";
    case "agent_online":
      return "🟢";
    case "agent_offline":
      return "⭕";
    default:
      return "•";
  }
}

export function ActivityFeed({ activities, agentNames = {} }: ActivityFeedProps) {
  const { isDarkMode } = useDarkMode();
  const [selectedType, setSelectedType] = useState<ActivityType | "all">("all");
  const [selectedAgent, setSelectedAgent] = useState<string>("all");

  // Extract unique types and agents from activities
  const uniqueTypes = useMemo(() => {
    const types = new Set<string>();
    activities.forEach((a) => {
      types.add(a.type);
    });
    return Array.from(types);
  }, [activities]);

  const uniqueAgents = useMemo(() => {
    const agents = new Set<string>();
    activities.forEach((a) => {
      agents.add(a.agentId);
    });
    return Array.from(agents).sort();
  }, [activities]);

  // Filter and group activities by time
  const groupedActivities = useMemo(() => {
    const filtered = activities.filter((a) => {
      const typeMatch = selectedType === "all" || a.type === selectedType;
      const agentMatch = selectedAgent === "all" || a.agentId === selectedAgent;
      return typeMatch && agentMatch;
    });

    // Group by time label
    const groups: Record<string, Activity[]> = {
      "Just now": [],
      "5 min ago": [],
      "1 hour ago": [],
      "Today": [],
      "Older": [],
    };

    filtered.forEach((a) => {
      const diffMins = Math.floor((Date.now() - a.createdAt) / 60000);
      let group = "Older";

      if (diffMins < 1) group = "Just now";
      else if (diffMins < 60) group = "5 min ago";
      else if (diffMins < 1440) group = "1 hour ago"; // 24 hours
      else if (new Date(a.createdAt).toDateString() === new Date().toDateString())
        group = "Today";

      groups[group].push(a);
    });

    // Return only non-empty groups in order
    const order = ["Just now", "5 min ago", "1 hour ago", "Today", "Older"];
    return order
      .filter((label) => groups[label].length > 0)
      .map((label) => ({
        label,
        activities: groups[label],
      }));
  }, [activities, selectedType, selectedAgent]);

  const activityTypeColor = (type: string, isDark: boolean = false): string => {
    if (isDark) {
      switch (type) {
        case "task_created":
          return "bg-green-900 text-green-300";
        case "task_updated":
          return "bg-blue-900 text-blue-300";
        case "task_completed":
          return "bg-purple-900 text-purple-300";
        case "agent_online":
          return "bg-green-900 text-green-300";
        case "agent_offline":
          return "bg-gray-700 text-gray-300";
        default:
          return "bg-gray-700 text-gray-300";
      }
    }

    switch (type) {
      case "task_created":
        return "bg-green-50 text-green-700";
      case "task_updated":
        return "bg-blue-50 text-blue-700";
      case "task_completed":
        return "bg-purple-50 text-purple-700";
      case "agent_online":
        return "bg-green-50 text-green-700";
      case "agent_offline":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <section className={`w-full xl:w-96 shrink-0 border-t xl:border-t-0 xl:border-l flex flex-col ${
      isDarkMode
        ? "border-gray-700 bg-gray-800"
        : "border-gray-200 bg-white"
    }`}>
      <div className={`p-4 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
        <h2 className={`text-sm font-semibold ${
          isDarkMode ? "text-white" : "text-gray-900"
        }`}>
          Activity Feed
        </h2>
        <p className={`text-xs mt-1 ${
          isDarkMode ? "text-gray-400" : "text-gray-500"
        }`}>
          Recent events across the squad
        </p>

        {/* Filters */}
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4" style={{color: isDarkMode ? '#9ca3af' : '#6b7280'}} />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as ActivityType | "all")}
            className={`text-xs px-2 py-1 rounded border outline-none ${
              isDarkMode
                ? "border-gray-600 bg-gray-700 text-gray-100"
                : "border-gray-200 bg-white text-gray-900"
            }`}
          >
            <option value="all">All types</option>
            {uniqueTypes.map((type) => (
              <option key={type} value={type}>
                {type.replace(/_/g, " ")}
              </option>
            ))}
          </select>

          {uniqueAgents.length > 0 && (
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className={`text-xs px-2 py-1 rounded border outline-none ${
                isDarkMode
                  ? "border-gray-600 bg-gray-700 text-gray-100"
                  : "border-gray-200 bg-white text-gray-900"
              }`}
            >
              <option value="all">All agents</option>
              {uniqueAgents.map((agent) => (
                <option key={agent} value={agent}>
                  {agentNames[agent] || agent}
                </option>
              ))}
            </select>
          )}

          {(selectedType !== "all" || selectedAgent !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSelectedType("all");
                setSelectedAgent("all");
              }}
              className={`p-1 rounded transition-colors ${
                isDarkMode
                  ? "hover:bg-gray-700"
                  : "hover:bg-gray-100"
              }`}
              aria-label="Clear filters"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Activity List */}
      <div className={`flex-1 overflow-y-auto px-4 py-3 space-y-4`}>
        {groupedActivities.length === 0 ? (
          <div className={`text-xs py-8 text-center ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }`}>
            No activity
          </div>
        ) : (
          groupedActivities.map((group) => (
            <div key={group.label}>
              <h3 className={`text-xs font-semibold uppercase tracking-wide mb-2 ${
                isDarkMode ? "text-gray-500" : "text-gray-400"
              }`}>
                {group.label}
              </h3>
              <ul className="space-y-2">
                {group.activities.map((a) => (
                  <li key={a._id} className={`py-2 px-2 rounded transition-colors ${
                    isDarkMode
                      ? "hover:bg-gray-700"
                      : "hover:bg-gray-50"
                  }`}>
                    <div className="flex items-start gap-2">
                      <span className="text-lg flex-shrink-0 mt-0.5">
                        {getActivityIcon(a.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className={`text-xs font-semibold ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          }`}>
                            {a.type.replace(/_/g, " ")}
                          </span>
                          <span className={`text-xs flex-shrink-0 ${
                            isDarkMode ? "text-gray-500" : "text-gray-500"
                          }`}>
                            {timeAgo(a.createdAt)}
                          </span>
                        </div>
                        <div className={`text-sm ${
                          isDarkMode ? "text-gray-200" : "text-gray-900"
                        }`}>
                          {a.message}
                        </div>
                        <div className={`text-xs mt-1 ${
                          isDarkMode ? "text-gray-500" : "text-gray-500"
                        }`}>
                          by {agentNames[a.agentId] || a.agentId}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
