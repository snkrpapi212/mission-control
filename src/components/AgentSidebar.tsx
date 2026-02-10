"use client";

import type { Doc } from "../../convex/_generated/dataModel";
import { timeAgo } from "@/lib/time";
import { useDarkMode } from "@/context/DarkModeContext";
import { useMemo } from "react";

const ONLINE_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes

interface AgentSidebarProps {
  agents: Doc<"agents">[];
  taskCounts?: Record<string, number>;
  selectedAgentId?: string;
  isCollapsed?: boolean;
  onAgentClick?: (agentId: string) => void;
}

type AgentStatus = 'online' | 'idle' | 'offline';

interface GroupedAgents {
  online: Doc<"agents">[];
  idle: Doc<"agents">[];
  offline: Doc<"agents">[];
}

export function AgentSidebar({
  agents,
  taskCounts = {},
  selectedAgentId,
  isCollapsed = false,
  onAgentClick,
}: AgentSidebarProps) {
  const { isDarkMode } = useDarkMode();

  // Group agents by status
  const groupedAgents = useMemo((): GroupedAgents => {
    const groups: GroupedAgents = { online: [], idle: [], offline: [] };

    agents.forEach((agent) => {
      const isOnline = Date.now() - agent.lastHeartbeat < ONLINE_THRESHOLD_MS;

      if (!isOnline) {
        groups.offline.push(agent);
      } else if (agent.status === 'working') {
        groups.online.push(agent);
      } else if (agent.status === 'idle') {
        groups.idle.push(agent);
      } else {
        groups.online.push(agent);
      }
    });

    return groups;
  }, [agents]);

  const AgentGroup = ({
    title,
    agents: groupAgents,
    icon,
  }: {
    title: string;
    agents: Doc<"agents">[];
    icon: string;
  }) => {
    if (groupAgents.length === 0) return null;

    return (
      <div className={`mb-6 ${isCollapsed ? 'hidden' : 'block'}`}>
        <div className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wide ${
          isDarkMode ? 'text-mc-text-muted' : 'text-gray-500'
        }`}>
          <span>{icon}</span>
          <span>{title}</span>
          <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-semibold ${
            isDarkMode
              ? 'bg-mc-surface-active text-mc-text-muted'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {groupAgents.length}
          </span>
        </div>

        <div className="space-y-1">
          {groupAgents.map((agent) => {
            const isSelected = selectedAgentId === agent._id;
            const taskCount = taskCounts[agent._id] || 0;

            return (
              <button
                key={agent._id}
                onClick={() => onAgentClick?.(agent._id)}
                className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                  isSelected
                    ? isDarkMode
                      ? 'bg-mc-surface-hover border-l-2 border-accent-primary'
                      : 'bg-gray-100 border-l-2 border-blue-500'
                    : isDarkMode
                    ? 'hover:bg-mc-surface-hover border-l-2 border-transparent'
                    : 'hover:bg-gray-50 border-l-2 border-transparent'
                }`}
              >
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded flex items-center justify-center text-xs font-bold text-white ${
                  isDarkMode ? 'bg-accent-primary' : 'bg-blue-500'
                }`}>
                  {agent.name.charAt(0).toUpperCase()}
                </div>

                {/* Agent Info (hidden if collapsed) */}
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm font-semibold truncate ${
                        isDarkMode ? 'text-mc-text' : 'text-gray-900'
                      }`}>
                        {agent.name}
                      </span>
                      {taskCount > 0 && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${
                          isDarkMode
                            ? 'bg-accent-primary bg-opacity-20 text-accent-primary'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {taskCount}
                        </span>
                      )}
                    </div>

                    {/* Status dot + text */}
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        agent.status === 'working'
                          ? 'bg-status-active animate-pulse'
                          : agent.status === 'idle'
                          ? 'bg-status-idle'
                          : 'bg-status-offline'
                      }`} />
                      <span className={`text-xs ${
                        isDarkMode ? 'text-mc-text-muted' : 'text-gray-500'
                      }`}>
                        {agent.status === 'working' ? 'Working' : agent.status === 'idle' ? 'Idle' : 'Offline'}
                      </span>
                    </div>

                    {/* Current task */}
                    {agent.currentTaskId && (
                      <p className={`text-xs italic mt-0.5 truncate ${
                        isDarkMode ? 'text-mc-text-subtle' : 'text-gray-500'
                      }`}>
                        {agent.currentTaskId}
                      </p>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <aside className={`${
      isCollapsed ? 'w-20' : 'w-60'
    } transition-all duration-200 ${
      isDarkMode
        ? 'bg-mc-surface border-mc-border'
        : 'bg-gray-50 border-gray-200'
    } border-r h-screen overflow-y-auto`}>
      <div className={`p-4 border-b ${isDarkMode ? 'border-mc-border' : 'border-gray-200'}`}>
        <h2 className={`text-sm font-semibold ${
          isDarkMode ? 'text-mc-text' : 'text-gray-900'
        }`}>
          👥 Squad
        </h2>
        {!isCollapsed && (
          <p className={`text-xs mt-1 ${
            isDarkMode ? 'text-mc-text-muted' : 'text-gray-500'
          }`}>
            {agents.length} agents
          </p>
        )}
      </div>

      <div className="p-4">
        <AgentGroup
          title="Online"
          agents={groupedAgents.online}
          icon="🟢"
        />
        <AgentGroup
          title="Idle"
          agents={groupedAgents.idle}
          icon="🟡"
        />
        <AgentGroup
          title="Offline"
          agents={groupedAgents.offline}
          icon="🔴"
        />

        {agents.length === 0 && (
          <div className={`text-xs text-center py-4 ${
            isDarkMode ? 'text-mc-text-muted' : 'text-gray-500'
          }`}>
            No agents
          </div>
        )}
      </div>
    </aside>
  );
}
