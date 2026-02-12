"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AgentSidebar, AgentAvatar, RoleBadge } from "@/components/AgentSidebar";
import { AgentDetailModal } from "@/components/AgentDetailModal";
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
import { 
  User, 
  Settings, 
  Moon, 
  Sun, 
  LogOut, 
  ChevronRight, 
  Plus, 
  Smartphone, 
  ShieldCheck, 
  Bell,
  Info,
  HelpCircle,
  ExternalLink
} from "lucide-react";
import { MobileNav } from "@/components/MobileNav";
import { Header } from "@/components/Header";
import type { TaskStatus } from "@/types";

export function DashboardShell() {
  const agentsRaw = useAgentsLive();
  const tasksByStatus = useTasksByStatusLive();
  const activitiesRaw = useActivitiesLive(24);

  const agents = useMemo(() => agentsRaw || [], [agentsRaw]);
  const activities = useMemo(() => activitiesRaw || [], [activitiesRaw]);
  const loading = agentsRaw === undefined || activitiesRaw === undefined;

  const [selectedTask, setSelectedTask] = useState<import("../../convex/_generated/dataModel").Doc<"tasks"> | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<import("../../convex/_generated/dataModel").Doc<"agents"> | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [mobileTab, setMobileTab] = useState<"board" | "agents" | "feed" | "more">("board");
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof document === "undefined") return "light";
    return (document.documentElement.getAttribute("data-theme") as "light" | "dark") || "light";
  });
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
    theme,
  });
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const { moveTask } = useOptimisticUI();

  const applyTheme = (next: "light" | "dark") => {
    setTheme(next);
    setCustomizationPrefs((prev) => ({ ...prev, theme: next }));
    localStorage.setItem("mc-theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  useEffect(() => {
    const saved = localStorage.getItem("mc-theme");
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
      setCustomizationPrefs((prev) => ({ ...prev, theme: saved }));
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    applyTheme(next);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
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

      <Header
        activeAgentCount={activeAgentCount}
        taskCount={taskCount}
        theme={theme}
        onToggleTheme={toggleTheme}
        onLogout={handleLogout}
        onNewTask={() => setShowCreateModal(true)}
        onSearchClick={() => setIsCommandPaletteOpen(true)}
        customizationPrefs={customizationPrefs}
        onPrefsChange={(next) => {
          setCustomizationPrefs(next);
          if (next.theme !== theme) applyTheme(next.theme);
        }}
      />

      <div className="mx-auto max-w-[2000px]">
        <div className="flex flex-col xl:flex-row">
          {customizationPrefs.showAgentsSidebar && (
            <div className="w-full xl:w-[280px] xl:shrink-0 bg-zinc-50/50 dark:bg-zinc-900/50">
              <AgentSidebar agents={agents} taskTitles={currentTaskById} loading={loading} />
            </div>
          )}

          <main 
            id="main-content"
            className="flex-1 min-w-0 px-4 py-4 md:px-6 md:py-4 bg-white dark:bg-zinc-950" 
            role="main"
          >

            {/* Mobile Sub-nav - shows Board/Feed options when in board view */}
            {mobileTab === "board" ? (
              <div key="board-view" className="space-y-4">
                <SmartFilters agents={agents} onFiltersChange={setFilters} />
                <KanbanBoard
                  tasksByStatus={filteredTasksByStatus}
                  agents={agents}
                  loading={loading}
                  onSelectTask={(t) => setSelectedTask(t)}
                  onTaskMove={handleTaskMove}
                />
              </div>
            ) : null}
            {mobileTab === "agents" ? (
              <div className="xl:hidden space-y-4">
                {/* Mobile Agents Header */}
                <div className="flex items-center justify-between px-1 mb-2">
                  <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Active Agents</h2>
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{agents.length} active</span>
                </div>
                
                <div className="grid gap-3 sm:grid-cols-2">
                  {agents.map((agent) => {
                    const taskTitle = agent.currentTaskId ? currentTaskById.get(agent.currentTaskId) : undefined;
                    const online = Date.now() - agent.lastHeartbeat < 2 * 60 * 1000;
                    const isActive = agent.status === "working" && online;
                    
                    return (
                      <motion.button
                        key={agent._id}
                        onClick={() => setSelectedAgent(agent)}
                        className={`w-full rounded-xl bg-white dark:bg-zinc-900 p-4 text-left shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 active:scale-[0.98] transition-all`}
                      >
                        <div className="flex items-center gap-3">
                          <AgentAvatar 
                            name={agent.name} 
                            lastHeartbeat={agent.lastHeartbeat}
                            emoji={agent.emoji}
                          />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 truncate tracking-tight">{agent.name}</span>
                              {isActive && (
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              )}
                            </div>
                            <div className="mt-0.5">
                              <RoleBadge role={agent.role} level={agent.level} />
                            </div>
                          </div>
                        </div>
                        
                        {/* Current Task - only if it exists */}
                        {taskTitle && (
                          <div className="mt-4 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50">
                            <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Current Task</p>
                            <p className="text-[12px] font-medium text-zinc-600 dark:text-zinc-400 line-clamp-1">{taskTitle}</p>
                          </div>
                        )}

                        <div className="mt-4 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-3">
                           <div className="flex items-center gap-1.5">
                             <div className={`h-1.5 w-1.5 rounded-full ${agent.status === 'working' ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
                             <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{agent.status}</span>
                           </div>
                           <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                             {online ? "Online Now" : "Offline"}
                           </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ) : null}
            {mobileTab === "feed" ? <div className="xl:hidden"><ActivityFeed activities={activities} loading={loading} compact /></div> : null}
            {mobileTab === "more" ? (
              <div className="xl:hidden -mx-4 -mt-4 p-4 min-h-[calc(100vh-130px)] bg-zinc-50 dark:bg-zinc-950/50">
                {/* Profile Section */}
                <div className="mb-6 flex items-center gap-4 px-2 py-4">
                  <div className="h-16 w-16 rounded-2xl bg-white dark:bg-zinc-900 flex items-center justify-center text-2xl shadow-sm ring-1 ring-black/5 dark:ring-white/10">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center">
                      <User size={24} className="text-zinc-600 dark:text-zinc-400" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Admin User</h2>
                    <p className="text-sm text-zinc-500 font-medium">admin@missioncontrol.ai</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <section>
                    <h3 className="px-2 mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Account</h3>
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm ring-1 ring-black/5 dark:ring-white/10 overflow-hidden">
                      <button className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-left border-b border-zinc-100 dark:border-zinc-800">
                        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600">
                          <User size={18} />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Personal Information</div>
                        </div>
                        <ChevronRight size={16} className="text-zinc-300 dark:text-zinc-600" />
                      </button>
                      <button className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-left">
                        <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
                          <ShieldCheck size={18} />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Security & Privacy</div>
                        </div>
                        <ChevronRight size={16} className="text-zinc-300 dark:text-zinc-600" />
                      </button>
                    </div>
                  </section>

                  <section>
                    <h3 className="px-2 mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Application</h3>
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm ring-1 ring-black/5 dark:ring-white/10 overflow-hidden">
                      <button 
                        onClick={() => setShowCreateModal(true)}
                        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-left border-b border-zinc-100 dark:border-zinc-800"
                      >
                        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600">
                          <Plus size={18} />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Create New Task</div>
                        </div>
                        <ChevronRight size={16} className="text-zinc-300 dark:text-zinc-600" />
                      </button>
                      <DashboardCustomization
                        prefs={customizationPrefs}
                        onPrefsChange={(next) => {
                          setCustomizationPrefs(next);
                          if (next.theme !== theme) applyTheme(next.theme);
                        }}
                        trigger={
                          <button className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-left border-b border-zinc-100 dark:border-zinc-800">
                            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600">
                              <Settings size={18} />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Interface Settings</div>
                            </div>
                            <ChevronRight size={16} className="text-zinc-300 dark:text-zinc-600" />
                          </button>
                        }
                      />
                      <button className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-left border-b border-zinc-100 dark:border-zinc-800">
                        <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600">
                          <Bell size={18} />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Notifications</div>
                        </div>
                        <ChevronRight size={16} className="text-zinc-300 dark:text-zinc-600" />
                      </button>
                      <div className="flex items-center justify-between px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
                            {theme === 'light' ? <Sun size={18} /> : <Moon size={18} />}
                          </div>
                          <div className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                            Dark Mode
                          </div>
                        </div>
                        <button 
                          onClick={toggleTheme}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 focus:outline-none ${theme === 'dark' ? 'bg-zinc-700' : 'bg-zinc-200'}`}
                        >
                          <span
                            className={`${
                              theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-sm`}
                          />
                        </button>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="px-2 mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Support</h3>
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm ring-1 ring-black/5 dark:ring-white/10 overflow-hidden">
                      <button className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-left border-b border-zinc-100 dark:border-zinc-800">
                        <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
                          <HelpCircle size={18} />
                        </div>
                        <div className="flex-1 text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Help Center</div>
                        <ExternalLink size={14} className="text-zinc-300 dark:text-zinc-600" />
                      </button>
                      <button className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-left">
                        <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
                          <Info size={18} />
                        </div>
                        <div className="flex-1 text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">About Mission Control</div>
                        <ChevronRight size={16} className="text-zinc-300 dark:text-zinc-600" />
                      </button>
                    </div>
                  </section>

                  <section>
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm ring-1 ring-black/5 dark:ring-white/10 overflow-hidden">
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-left text-red-600"
                      >
                        <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600">
                          <LogOut size={18} />
                        </div>
                        <div className="flex-1 text-sm font-semibold tracking-tight">Logout</div>
                        <ChevronRight size={16} className="opacity-50" />
                      </button>
                    </div>
                  </section>

                  <div className="pt-4 pb-12 text-center">
                    <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Mission Control v2.4.0</p>
                    <p className="text-[10px] text-zinc-300 dark:text-zinc-600 mt-1">Build 2026.02.12.1729</p>
                  </div>
                </div>
              </div>
            ) : null}
          </main>

          {customizationPrefs.showActivityFeed && (
            <div className="hidden xl:block w-[320px] shrink-0 bg-zinc-50/50 dark:bg-zinc-900/50">
              <ActivityFeed activities={activities} loading={loading} />
            </div>
          )}
        </div>
      </div>

      {selectedTask && <TaskDetailModal task={selectedTask} agents={agents} onClose={() => setSelectedTask(null)} />}
      {selectedAgent && (
        <AgentDetailModal
          agent={selectedAgent}
          currentTaskTitle={selectedAgent.currentTaskId ? currentTaskById.get(selectedAgent.currentTaskId) : undefined}
          onClose={() => setSelectedAgent(null)}
        />
      )}
      {showCreateModal ? <CreateTaskModal agents={agents} onClose={() => setShowCreateModal(false)} /> : null}
      
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onOpenChange={setIsCommandPaletteOpen}
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
