"use client";

import { useMemo, useState, useCallback } from "react";
import { AgentSidebar } from "@/components/AgentSidebar";
import { ActivityFeed } from "@/components/ActivityFeed";
import { KanbanBoard } from "@/components/KanbanBoard";
import { TaskDetailDrawer } from "@/components/TaskDetailDrawer";
import { CreateTaskModal } from "@/components/CreateTaskModal";
import { TopNavigation } from "@/components/TopNavigation";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { useDarkMode } from "@/context/DarkModeContext";
import {
  useActivitiesLive,
  useAgentsLive,
  useTasksByStatusLive,
} from "@/hooks/useConvexData";
import type { TaskStatus } from "@/types";

export function DashboardShell() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const agentsRaw = useAgentsLive();
  const tasksByStatus = useTasksByStatusLive();
  const activitiesRaw = useActivitiesLive(20);

  const agents = useMemo(() => agentsRaw || [], [agentsRaw]);
  const activities = useMemo(() => activitiesRaw || [], [activitiesRaw]);

  const [selectedTask, setSelectedTask] = useState<import("../../convex/_generated/dataModel").Doc<"tasks"> | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterAgent, setFilterAgent] = useState<string>("all");

  // Mock notifications - in production, fetch from Convex
  const mockNotifications = useMemo(() => [
    {
      _id: "notif-1",
      title: "Task Assigned",
      message: "New task assigned to you",
      type: "info" as const,
      isRead: false,
      createdAt: Date.now() - 5 * 60 * 1000,
      taskId: "task-1",
      agentId: agents[0]?._id,
    },
  ], [agents]);

  // Calculate task counts per agent
  const agentTaskCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    agents.forEach((agent) => {
      counts[agent._id] = Object.values(tasksByStatus)
        .flat()
        .filter((task) => task.assignedTo === agent._id).length;
    });
    return counts;
  }, [agents, tasksByStatus]);

  // Get all tasks for search
  const allTasks = useMemo(() => {
    return Object.values(tasksByStatus).flat();
  }, [tasksByStatus]);

  // Agent name map for activity feed
  const agentNames = useMemo(() => {
    const map: Record<string, string> = {};
    agents.forEach((agent) => {
      map[agent._id] = agent.name;
    });
    return map;
  }, [agents]);

  const handleTaskMove = useCallback(
    async (taskId: string, fromStatus: TaskStatus, toStatus: TaskStatus) => {
      // TODO: Implement Convex mutation for task status update
      console.log(`Move task ${taskId} from ${fromStatus} to ${toStatus}`);
      // await updateTaskStatus({ taskId, status: toStatus });
    },
    []
  );

  const handleMarkNotificationAsRead = useCallback((id: string) => {
    // TODO: Implement Convex mutation for marking notification as read
    console.log(`Mark notification ${id} as read`);
  }, []);

  const handleMarkAllNotificationsAsRead = useCallback(() => {
    // TODO: Implement Convex mutation for marking all notifications as read
    console.log("Mark all notifications as read");
  }, []);

  const handleClearAllNotifications = useCallback(() => {
    // TODO: Implement Convex mutation for clearing all notifications
    console.log("Clear all notifications");
  }, []);

  return (
    <div className={`min-h-screen ${
      isDarkMode ? "bg-gray-900" : "bg-gray-50"
    }`}>
      {/* Top Navigation */}
      <div className="relative">
        <TopNavigation
          isDarkMode={isDarkMode}
          onDarkModeToggle={toggleDarkMode}
          allTasks={allTasks}
          unreadNotificationCount={mockNotifications.filter((n) => !n.isRead).length}
          onNotificationBellClick={() => setShowNotifications(!showNotifications)}
          isConnected={!!process.env.NEXT_PUBLIC_CONVEX_URL}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        
        {/* Notification Dropdown */}
        {showNotifications && (
          <div className="absolute right-4 top-full pt-2 z-50">
            <NotificationDropdown
              notifications={mockNotifications}
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
              onMarkAsRead={handleMarkNotificationAsRead}
              onMarkAllAsRead={handleMarkAllNotificationsAsRead}
              onClearAll={handleClearAllNotifications}
            />
          </div>
        )}
      </div>

      <div className="mx-auto max-w-[1600px]">
        <div className={`flex flex-col ${isDarkMode ? "md:flex-row" : "md:flex-row"}`}>
          {/* Mobile Sidebar Drawer - Show on mobile, hidden on md+ */}
          {sidebarOpen && (
            <>
              <AgentSidebar agents={agents} taskCounts={agentTaskCounts} />
              <div
                className="md:hidden fixed inset-0 top-16 bg-black/50 z-10"
                onClick={() => setSidebarOpen(false)}
              />
            </>
          )}

          {/* Desktop Sidebar - Always visible on md+ */}
          <div className="hidden md:block">
            <AgentSidebar agents={agents} taskCounts={agentTaskCounts} />
          </div>

          {/* Main Content */}
          <main className="flex-1 p-4 overflow-x-auto">
            <div className="flex gap-4">
              <div className="flex-1">
                <KanbanBoard
                  tasksByStatus={tasksByStatus}
                  agents={agents}
                  statusFilter={filterStatus}
                  priorityFilter={filterPriority}
                  agentFilter={filterAgent}
                  onStatusFilterChange={setFilterStatus}
                  onPriorityFilterChange={setFilterPriority}
                  onAgentFilterChange={setFilterAgent}
                  onSelectTask={(t) => setSelectedTask(t)}
                  onTaskMove={handleTaskMove}
                />
              </div>
            </div>
          </main>

          {/* Activity Feed - Hidden on mobile, visible on lg+ */}
          <div className="hidden lg:block">
            <ActivityFeed activities={activities} agentNames={agentNames} />
          </div>
        </div>

        {/* Activity Feed on Mobile - Below main content */}
        <div className="lg:hidden px-4 pb-4">
          <ActivityFeed activities={activities} agentNames={agentNames} />
        </div>
      </div>

      {selectedTask ? (
        <TaskDetailDrawer
          task={selectedTask}
          agents={agents}
          onClose={() => setSelectedTask(null)}
        />
      ) : null}

      {showCreateModal ? (
        <CreateTaskModal
          agents={agents}
          onClose={() => setShowCreateModal(false)}
        />
      ) : null}
    </div>
  );
}
