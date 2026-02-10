"use client";

import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import type { TaskStatus } from "@/types";
import type { Agent } from "@/types";
import type { Doc } from "../../convex/_generated/dataModel";
import { TaskCard } from "@/components/TaskCard";
import { FilterBar } from "@/components/FilterBar";
import { useDarkMode } from "@/context/DarkModeContext";
import { useState, useCallback, useMemo } from "react";

const COLUMNS: Array<{ status: TaskStatus; title: string }> = [
  { status: "inbox", title: "Inbox" },
  { status: "assigned", title: "Assigned" },
  { status: "in_progress", title: "In Progress" },
  { status: "review", title: "Review" },
  { status: "done", title: "Done" },
  { status: "blocked", title: "Blocked" },
];

interface KanbanBoardProps {
  tasksByStatus: Record<TaskStatus, Doc<"tasks">[]>;
  agents?: Agent[];
  statusFilter?: TaskStatus | "all";
  priorityFilter?: string;
  agentFilter?: string;
  onStatusFilterChange?: (status: TaskStatus | "all") => void;
  onPriorityFilterChange?: (priority: string) => void;
  onAgentFilterChange?: (agentId: string) => void;
  onSelectTask?: (task: Doc<"tasks">) => void;
  onTaskMove?: (taskId: string, fromStatus: TaskStatus, toStatus: TaskStatus) => Promise<void>;
}

export function KanbanBoard({
  tasksByStatus,
  agents = [],
  statusFilter = "all",
  priorityFilter = "all",
  agentFilter = "all",
  onStatusFilterChange,
  onPriorityFilterChange,
  onAgentFilterChange,
  onSelectTask,
  onTaskMove,
}: KanbanBoardProps) {
  const { isDarkMode } = useDarkMode();
  const [optimisticTasksByStatus, setOptimisticTasksByStatus] =
    useState<Record<TaskStatus, Doc<"tasks">[]>>(tasksByStatus);
  const [isMoving, setIsMoving] = useState(false);

  // Sync optimistic state with actual state when it changes
  const currentTasksByStatus =
    Object.keys(optimisticTasksByStatus).length === 0
      ? tasksByStatus
      : optimisticTasksByStatus;

  // Apply filters
  const filteredTasksByStatus = useMemo(() => {
    const filtered: Record<TaskStatus, Doc<"tasks">[]> = {
      inbox: [],
      assigned: [],
      in_progress: [],
      review: [],
      done: [],
      blocked: [],
    };

    for (const status of Object.keys(currentTasksByStatus) as TaskStatus[]) {
      let tasks = currentTasksByStatus[status] || [];

      if (statusFilter !== "all" && status !== statusFilter) {
        continue;
      }

      if (priorityFilter !== "all") {
        tasks = tasks.filter((t) => t.priority === priorityFilter);
      }

      if (agentFilter !== "all") {
        tasks = tasks.filter((t) => t.assigneeIds?.includes(agentFilter));
      }

      filtered[status] = tasks;
    }

    return filtered;
  }, [currentTasksByStatus, statusFilter, priorityFilter, agentFilter]);

  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      const { source, destination, draggableId } = result;

      // If dropped outside a valid droppable area
      if (!destination) {
        return;
      }

      // If dropped in the same position
      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      ) {
        return;
      }

      const fromStatus = source.droppableId as TaskStatus;
      const toStatus = destination.droppableId as TaskStatus;
      const taskId = draggableId;

      // Find the task
      const task = currentTasksByStatus[fromStatus]?.find(
        (t) => t._id === taskId
      );
      if (!task) return;

      // Optimistic update: reorder locally
      setOptimisticTasksByStatus((prev) => {
        const newState = { ...prev };

        // Remove from source column
        newState[fromStatus] = newState[fromStatus].filter((t) => t._id !== taskId);

        // Add to destination column at the correct index
        newState[toStatus] = [...(newState[toStatus] || [])];
        newState[toStatus].splice(destination.index, 0, task);

        return newState;
      });

      // Call the server mutation
      setIsMoving(true);
      try {
        await onTaskMove?.(taskId, fromStatus, toStatus);
      } catch (error) {
        console.error("Failed to move task:", error);
        // Revert optimistic update on error
        setOptimisticTasksByStatus(tasksByStatus);
      } finally {
        setIsMoving(false);
      }
    },
    [tasksByStatus, currentTasksByStatus, onTaskMove]
  );

  return (
    <section className="flex-1">
      <div className="flex items-baseline justify-between gap-4 mb-4">
        <div>
          <h2 className={`text-sm font-semibold ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}>
            Task Board
          </h2>
          <p className={`text-xs mt-1 ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }`}>
            Drag tasks between columns · Total:{" "}
            {Object.values(filteredTasksByStatus).flat().length}
          </p>
        </div>
        {isMoving && (
          <span className={`text-xs ${
            isDarkMode ? "text-blue-400" : "text-blue-600"
          }`}>
            Syncing...
          </span>
        )}
      </div>

      <FilterBar
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        agentFilter={agentFilter}
        agents={agents}
        onStatusChange={onStatusFilterChange || (() => {})}
        onPriorityChange={onPriorityFilterChange || (() => {})}
        onAgentChange={onAgentFilterChange || (() => {})}
      />

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 auto-rows-max`}>
          {COLUMNS.map((col) => {
            const tasks = filteredTasksByStatus[col.status] ?? [];
            return (
              <div
                key={col.status}
                className={`rounded-lg border ${
                  isDarkMode
                    ? "border-gray-700 bg-gray-800"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className={`px-3 py-2 border-b flex items-center justify-between ${
                  isDarkMode
                    ? "border-gray-700 bg-gray-750"
                    : "border-gray-200 bg-white"
                }`}>
                  <h3 className={`text-xs font-semibold ${
                    isDarkMode ? "text-white" : "text-gray-800"
                  }`}>
                    {col.title}
                  </h3>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                    isDarkMode
                      ? "bg-gray-700 text-gray-300"
                      : "bg-gray-200 text-gray-700"
                  }`}>
                    {tasks.length}
                  </span>
                </div>

                <Droppable droppableId={col.status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`p-2 space-y-2 min-h-24 transition-colors ${
                        snapshot.isDraggingOver
                          ? isDarkMode
                            ? "bg-gray-700"
                            : "bg-blue-50"
                          : ""
                      }`}
                    >
                      {tasks.length === 0 ? (
                        <div className={`text-xs px-1 py-2 ${
                          isDarkMode ? "text-gray-500" : "text-gray-400"
                        }`}>
                          {statusFilter !== "all" || priorityFilter !== "all" || agentFilter !== "all"
                            ? "No tasks match filters"
                            : "No tasks"}
                        </div>
                      ) : (
                        tasks.map((task, index) => (
                          <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`transition-all ${
                                  snapshot.isDragging
                                    ? "opacity-50 scale-95"
                                    : ""
                                }`}
                              >
                                <TaskCard
                                  task={task}
                                  agents={agents}
                                  onClick={
                                    onSelectTask
                                      ? () => onSelectTask(task)
                                      : undefined
                                  }
                                />
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </section>
  );
}
