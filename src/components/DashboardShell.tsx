"use client";

import { useMemo, useState } from "react";
import { AgentSidebar } from "@/components/AgentSidebar";
import { ActivityFeed } from "@/components/ActivityFeed";
import { KanbanBoard } from "@/components/KanbanBoard";
import { TaskDetailDrawer } from "@/components/TaskDetailDrawer";
import {
  useActivitiesLive,
  useAgentsLive,
  useTasksByStatusLive,
} from "@/hooks/useConvexData";

export function DashboardShell() {
  const agentsRaw = useAgentsLive();
  const tasksByStatus = useTasksByStatusLive();
  const activitiesRaw = useActivitiesLive(20);

  const agents = useMemo(() => agentsRaw || [], [agentsRaw]);
  const activities = useMemo(() => activitiesRaw || [], [activitiesRaw]);

  const [selectedTask, setSelectedTask] = useState<import("../../convex/_generated/dataModel").Doc<"tasks"> | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-[1600px] px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Mission Control</h1>
            <p className="text-xs text-gray-500 mt-0.5">Squad dashboard (Phase 4)</p>
          </div>

          <div className="text-xs text-gray-500">
            {process.env.NEXT_PUBLIC_CONVEX_URL ? (
              <span className="text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded">
                Convex connected
              </span>
            ) : (
              <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded">
                Mock data (set NEXT_PUBLIC_CONVEX_URL to connect Convex)
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px]">
        <div className="flex flex-col md:flex-row">
          <AgentSidebar agents={agents} />

          <main className="flex-1 p-4">
            <KanbanBoard
              tasksByStatus={tasksByStatus}
              onSelectTask={(t) => setSelectedTask(t)}
            />
          </main>

          <ActivityFeed activities={activities} />
        </div>
      </div>

      {selectedTask ? (
        <TaskDetailDrawer
          task={selectedTask}
          agents={agents}
          onClose={() => setSelectedTask(null)}
        />
      ) : null}
    </div>
  );
}
