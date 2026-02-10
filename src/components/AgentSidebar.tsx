"use client";

import type { Doc } from "../../convex/_generated/dataModel";
import { timeAgo } from "@/lib/time";
import { useDarkMode } from "@/context/DarkModeContext";

const ONLINE_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes

function statusDot(status: Doc<"agents">["status"], lastHeartbeat: number, isDark: boolean = false) {
  const isOnline = Date.now() - lastHeartbeat < ONLINE_THRESHOLD_MS;

  if (!isOnline) return isDark ? "bg-gray-600" : "bg-gray-400"; // offline

  switch (status) {
    case "idle":
      return isDark ? "bg-green-600" : "bg-green-500"; // online & idle
    case "working":
      return isDark ? "bg-green-600 animate-pulse" : "bg-green-500 animate-pulse"; // online & working
    case "blocked":
      return isDark ? "bg-red-600" : "bg-red-500"; // online but blocked
  }
}

interface AgentSidebarProps {
  agents: Doc<"agents">[];
  taskCounts?: Record<string, number>;
}

export function AgentSidebar({ agents, taskCounts = {} }: AgentSidebarProps) {
  const { isDarkMode } = useDarkMode();

  return (
    <aside className={`w-full md:w-72 shrink-0 border-b md:border-b-0 md:border-r ${
      isDarkMode
        ? "border-gray-700 bg-gray-800"
        : "border-gray-200 bg-white"
    }`}>
      <div className="p-4">
        <h2 className={`text-sm font-semibold ${
          isDarkMode ? "text-white" : "text-gray-900"
        }`}>
          Agents
        </h2>
        <p className={`text-xs mt-1 ${
          isDarkMode ? "text-gray-400" : "text-gray-500"
        }`}>
          Squad status & heartbeats
        </p>
      </div>
      <ul className={`px-2 pb-4 space-y-1`}>
        {agents.map((a) => {
          const taskCount = taskCounts[a._id] || 0;
          const isOnline = Date.now() - a.lastHeartbeat < ONLINE_THRESHOLD_MS;

          return (
            <li
              key={a._id}
              className={`flex items-center gap-3 rounded-md px-3 py-2 transition-colors ${
                isDarkMode
                  ? "hover:bg-gray-700"
                  : "hover:bg-gray-50"
              }`}
            >
              {/* Avatar Emoji */}
              <div
                className={`text-xl flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full ${
                  isDarkMode
                    ? isOnline ? "bg-gray-700" : "bg-gray-750"
                    : isOnline ? "bg-gray-100" : "bg-gray-50"
                }`}
                aria-hidden
              >
                {a.emoji}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className={`text-sm font-semibold truncate ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}>
                        {a.name}
                      </span>
                      <span
                        className={`inline-flex h-2.5 w-2.5 rounded-full flex-shrink-0 ${statusDot(a.status, a.lastHeartbeat, isDarkMode)}`}
                        aria-label={`status-${a.status}`}
                      />
                    </div>
                    <span className={`text-xs ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}>
                      {a.role}
                    </span>
                  </div>
                  {taskCount > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${
                      isDarkMode
                        ? "bg-blue-900 text-blue-300"
                        : "bg-blue-100 text-blue-700"
                    }`}>
                      {taskCount}
                    </span>
                  )}
                </div>
                <div className={`text-xs mt-1 leading-tight ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}>
                  <div>heartbeat {timeAgo(a.lastHeartbeat)}</div>
                  {a.currentTaskId ? (
                    <div className={isDarkMode ? "text-gray-500" : "text-gray-400"}>
                      on {a.currentTaskId}
                    </div>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
