"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AgentSidebar } from "@/components/AgentSidebar";
import { ActivityFeed } from "@/components/ActivityFeed";
import { KanbanBoard } from "@/components/KanbanBoard";
import { TaskDetailModal } from "@/components/TaskDetailModal";
import { CreateTaskModal } from "@/components/CreateTaskModal";
import { ToastContainer } from "@/components/Toast";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { CommandPalette } from "@/components/CommandPalette";
import {
  useActivitiesLive,
  useAgentsLive,
  useTasksByStatusLive,
} from "@/hooks/useConvexData";
import { useOptimisticUI } from "@/hooks/useOptimisticUI";
import { SmartFilters, type FilterState } from "@/components/SmartFilters";
import { DashboardCustomization, type CustomizationPrefs } from "@/components/DashboardCustomization";
import { MobileNav } from "@/components/MobileNav";
import { Bell, Moon, Plus, Search, Sparkles, Sun } from "lucide-react";
import type { TaskStatus } from "@/types";

export function DashboardShell() {
  const agentsRaw = useAgentsLive();
  const tasksByStatus = useTasksByStatusLive();
  const activitiesRaw = useActivitiesLive(24);

  const agents = useMemo(() => agentsRaw || [], [agentsRaw]);
  const activities = useMemo(() => activitiesRaw || [], [activitiesRaw]);
  const loading = agentsRaw === undefined || activitiesRaw === undefined;

  const [selectedTask, setSelectedTask] = useState<import("../../convex/_generated/dataModel").Doc<"tasks"> | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [mobileTab, setMobileTab] = useState<"board" | "agents" | "feed" | "filters" | "more">("board");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [filters, setFilters] = useState<FilterState>({
    statuses: [],
    agentIds: [],
    priorities: [],
  });
  const [customizationPrefs, setCustomizationPrefs] = useState<CustomizationPrefs>({
    density: "normal",
    showAgentsSidebar: true,
    showActivityFeed: true,
    showNotifications: true,
    columnOrder: ["inbox", "assigned", "in_progress", "review", "done", "blocked"],
    theme: "light",
  });
  const { moveTask } = useOptimisticUI();

  useEffect(() => {
    const saved = (localStorage.getItem("mc-theme") as "light" | "dark" | null) || "light";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("mc-theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  // Update timestamp on data changes
  useEffect(() => {
    setLastUpdated(new Date());
  }, [tasksByStatus, agentsRaw]);

  const flattenedTasks = useMemo(() => Object.values(tasksByStatus).flat(), [tasksByStatus]);
  const taskCount = flattenedTasks.length;
  const activeAgentCount = agents.filter((a) => a.status === "working").length;

  const currentTaskById = useMemo(() => {
    const map = new Map<string, string>();
    for (const t of flattenedTasks) map.set(t._id, t.title);
    return map;
  }, [flattenedTasks]);

  const timeAgoString = (() => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  })();

  const handleTaskMove = useCallback(
    (taskId: string, newStatus: TaskStatus) => {
      const task = flattenedTasks.find((t) => t._id === taskId);
      if (task) {
        moveTask(task, newStatus, {
          successMessage: `Moved to ${newStatus} ✓`,
        });
      }
    },
    [flattenedTasks, moveTask]
  );

  // Apply filters to tasks
  const filteredTasksByStatus = useMemo(() => {
    const filtered = { ...tasksByStatus };

    Object.keys(filtered).forEach((status) => {
      filtered[status as TaskStatus] = filtered[status as TaskStatus].filter((task) => {
        // Filter by status
        if (filters.statuses.length > 0 && !filters.statuses.includes(task.status as TaskStatus)) {
          return false;
        }

        // Filter by agent
        if (filters.agentIds.length > 0 && !filters.agentIds.some((id) => task.assigneeIds.includes(id))) {
          return false;
        }

        // Filter by priority
        if (filters.priorities.length > 0 && !filters.priorities.includes(task.priority)) {
          return false;
        }

        return true;
      });
    });

    return filtered;
  }, [tasksByStatus, filters]);

  return (
    <div className="min-h-screen" style={{ background: "var(--mc-bg)", color: "var(--mc-text)" }}>
      {/* Accessibility: Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-50 focus:bg-[var(--mc-accent-green)] focus:text-white focus:p-2 focus:rounded"
      >
        Skip to main content
      </a>

      <header 
        className="sticky top-0 z-30 border-b border-[var(--mc-line)] bg-[color:color-mix(in_srgb,var(--mc-panel)_92%,white_8%)]" 
        style={{ backdropFilter: "blur(10px)" }}
        role="banner"
      >
        <div className="mx-auto flex h-[72px] max-w-[1800px] items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--mc-line)] bg-[var(--mc-card)] text-[var(--mc-amber)]">
              <Sparkles size={14} />
            </div>
            <h1 className="text-[16px] font-semibold tracking-[0.08em]">Mission Control</h1>
            <span className="mc-chip px-2 py-0.5 text-[11px]">Live Ops</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-10 text-center">
              <div>
                <div className="text-[24px] leading-none font-semibold">{activeAgentCount}</div>
                <div className="mc-subtle mt-1 text-[10px] uppercase tracking-[0.2em]">Agents Active</div>
              </div>
              <div>
                <div className="text-[24px] leading-none font-semibold">{taskCount}</div>
                <div className="mc-subtle mt-1 text-[10px] uppercase tracking-[0.2em]">Tasks In Queue</div>
              </div>
            </div>
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mc-text-soft)]" />
              <input placeholder="Search tasks, agents..." className="mc-input h-9 w-[260px] rounded-md pl-9 pr-3 text-xs" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="mc-input hidden sm:inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs">Docs</button>
            <button className="mc-input relative inline-flex h-9 w-9 items-center justify-center rounded-md text-xs" aria-label="Notifications">
              <Bell size={14} />
              <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] text-white" style={{ background: "var(--mc-accent-red)" }}>3</span>
            </button>
            <button onClick={toggleTheme} className="mc-input inline-flex h-9 w-9 items-center justify-center rounded-md text-xs" aria-label="Toggle theme">
              {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
            </button>
            <DashboardCustomization
              prefs={customizationPrefs}
              onPrefsChange={setCustomizationPrefs}
            />
            <div className="hidden md:block">
              <ConnectionStatus />
            </div>
            <button type="button" onClick={() => setShowCreateModal(true)} className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-semibold" style={{ borderColor: "var(--mc-border)", background: "var(--mc-text)", color: "var(--mc-bg)" }}>
              <Plus size={13} />
              New Task
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1800px]">
        <div className="grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)_360px]">
          {customizationPrefs.showAgentsSidebar && (
            <AgentSidebar agents={agents} taskTitles={currentTaskById} loading={loading} />
          )}

          <main 
            id="main-content"
            className="border-x px-3 py-3 md:px-4 md:py-4" 
            style={{ borderColor: "var(--mc-border)", background: "var(--mc-panel-2)" }}
            role="main"
          >

            {/* Mobile Sub-nav - shows Board/Feed options when in board view */}
            <AnimatePresence mode="wait">
              {mobileTab === "board" ? (
                <motion.div 
                  key="board-view"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-3"
                >
                  <div className="flex items-center justify-between">
                    <SmartFilters agents={agents} onFiltersChange={setFilters} />
                    <div className="text-[11px] text-[var(--mc-text-soft)]">Updated {timeAgoString}</div>
                  </div>
                  <KanbanBoard
                    tasksByStatus={filteredTasksByStatus}
                    agents={agents}
                    loading={loading}
                    onSelectTask={(t) => setSelectedTask(t)}
                    onTaskMove={handleTaskMove}
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>
            {mobileTab === "agents" ? (
              <div className="xl:hidden space-y-3">
                {/* Mobile Agents Header */}
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-[15px] font-semibold text-[var(--mc-text)]">Active Agents</h2>
                  <span className="text-[12px] text-[var(--mc-text-soft)]">{agents.length} total</span>
                </div>
                
                {agents.map((agent) => {
                  const taskTitle = agent.currentTaskId ? currentTaskById.get(agent.currentTaskId) : undefined;
                  const online = Date.now() - agent.lastHeartbeat < 2 * 60 * 1000;
                  const lastSeen = (() => {
                    const diff = Date.now() - agent.lastHeartbeat;
                    const min = Math.floor(diff / 60000);
                    if (min < 60) return `${min}m ago`;
                    const hr = Math.floor(min / 60);
                    if (hr < 24) return `${hr}h ago`;
                    return `${Math.floor(hr / 24)}d ago`;
                  })();
                  
                  const statusLabel = agent.status === "working" ? "Working" : agent.status === "blocked" ? "Blocked" : "Idle";
                  const statusColor = agent.status === "working" ? "bg-[var(--mc-green)]" : agent.status === "blocked" ? "bg-[var(--mc-red)]" : "bg-[var(--mc-amber)]";
                  
                  return (
                    <motion.button
                      key={agent._id}
                      onClick={() => {
                        const t = flattenedTasks.find((x) => x._id === agent.currentTaskId);
                        if (t) setSelectedTask(t);
                      }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full rounded-xl border border-[var(--mc-line)] bg-[var(--mc-card)] px-4 py-3.5 text-left active:bg-[var(--mc-panel-soft)] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <div className="h-10 w-10 rounded-lg border border-[var(--mc-line)] bg-[var(--mc-panel-soft)] flex items-center justify-center text-[var(--mc-text)]">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="8" r="4"/>
                              <path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>
                            </svg>
                          </div>
                          <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[var(--mc-card)] ${online ? "bg-[var(--mc-green)]" : "bg-[var(--mc-text-soft)]"}`} />
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[15px] font-semibold text-[var(--mc-text)] truncate">{agent.name}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[var(--mc-line)] text-[var(--mc-text-soft)]">
                              {agent.level === "lead" ? "LEAD" : agent.level === "intern" ? "INT" : "SPC"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-block h-2 w-2 rounded-full ${statusColor}`} />
                            <span className="text-[13px] text-[var(--mc-text)]">{statusLabel}</span>
                            <span className="text-[var(--mc-text-soft)]">·</span>
                            <span className={`text-[13px] ${online ? "text-[var(--mc-green)]" : "text-[var(--mc-text-soft)]"}`}>
                              {online ? "Online" : lastSeen}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Current Task */}
                      <div className="mt-3 pt-3 border-t border-[var(--mc-line)]">
                        <p className="text-[12px] text-[var(--mc-text-muted)] uppercase tracking-wide">Current Task</p>
                        <p className="text-[13px] text-[var(--mc-text)] truncate mt-0.5">{taskTitle || "No active task"}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            ) : null}
            {mobileTab === "feed" ? <div className="xl:hidden"><ActivityFeed activities={activities} loading={loading} compact /></div> : null}
            {mobileTab === "filters" ? (
              <div className="xl:hidden">
                <SmartFilters agents={agents} onFiltersChange={setFilters} />
              </div>
            ) : null}
            {mobileTab === "more" ? (
              <div className="xl:hidden p-6 space-y-4">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="w-full px-4 py-3 rounded bg-[var(--mc-accent-green)] text-white font-semibold text-[13px]"
                >
                  + Create Task
                </button>
              </div>
            ) : null}
          </main>

          {customizationPrefs.showActivityFeed && (
            <div className="hidden xl:block">
              <ActivityFeed activities={activities} loading={loading} />
            </div>
          )}
        </div>
      </div>

      {selectedTask && <TaskDetailModal task={selectedTask} agents={agents} onClose={() => setSelectedTask(null)} />}
      {showCreateModal ? <CreateTaskModal agents={agents} onClose={() => setShowCreateModal(false)} /> : null}
      
      <CommandPalette
        tasks={flattenedTasks}
        agents={agents}
        onSelectTask={(t) => setSelectedTask(t)}
        onSelectAgent={() => {
          /* TODO: implement agent jump */
        }}
        onCreateTask={() => setShowCreateModal(true)}
      />

      {/* Mobile Navigation */}
      <MobileNav
        activeTab={mobileTab}
        onTabChange={setMobileTab}
        onSettingsClick={() => {
          /* MobileNav will handle settings via DashboardCustomization */
        }}
      />
      
      <ToastContainer />
    </div>
  );
}
