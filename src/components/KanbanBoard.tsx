"use client";

import { useMemo, useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import type { TaskStatus } from "@/types";
import type { Doc } from "../../convex/_generated/dataModel";
import { TaskCard } from "@/components/TaskCard";
import { Chip, PanelHeader } from "@/components/MissionControlPrimitives";

const COLUMNS: Array<{ status: TaskStatus; title: string; dotClass: string }> = [
  { status: "inbox", title: "Inbox", dotClass: "text-[var(--mc-line-strong)]" },
  { status: "assigned", title: "Assigned", dotClass: "text-[var(--mc-amber)]" },
  { status: "in_progress", title: "In Progress", dotClass: "text-[var(--mc-green)]" },
  { status: "review", title: "Review", dotClass: "text-[var(--mc-amber)]" },
  { status: "done", title: "Done", dotClass: "text-[var(--mc-green)]" },
  { status: "blocked", title: "Blocked", dotClass: "text-[var(--mc-red)]" },
];

export function KanbanBoard({
  tasksByStatus,
  agents,
  loading,
  onSelectTask,
  onTaskMove,
}: {
  tasksByStatus: Record<TaskStatus, Doc<"tasks">[]>;
  agents: Doc<"agents">[];
  loading?: boolean;
  // eslint-disable-next-line no-unused-vars
  onSelectTask?: (..._args: [Doc<"tasks">]) => void;
  // eslint-disable-next-line no-unused-vars
  onTaskMove?: (taskId: string, newStatus: TaskStatus) => void;
}) {
  const [query, setQuery] = useState("");

  const byAgent = useMemo(() => {
    const map = new Map<string, Doc<"agents">>();
    agents.forEach((a) => map.set(a.agentId, a));
    return map;
  }, [agents]);

  const totalVisible = COLUMNS.reduce(
    (sum, col) => sum + (tasksByStatus[col.status] ?? []).length,
    0
  );

  const passesFilter = (task: Doc<"tasks">) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      task.title.toLowerCase().includes(q) ||
      task.description.toLowerCase().includes(q)
    );
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Get the task from source column
    const sourceColumnStatus = source.droppableId as TaskStatus;
    const destColumnStatus = destination.droppableId as TaskStatus;
    const task = (tasksByStatus[sourceColumnStatus] ?? []).find(
      (t) => t._id === draggableId
    );

    if (task && onTaskMove && destColumnStatus !== sourceColumnStatus) {
      onTaskMove(draggableId, destColumnStatus);
    }
  };

  return (
    <section className="min-w-0">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Mission Queue</h2>
        <div className="flex items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter tasks..."
            className="h-7 w-[180px] rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 text-[11px] outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 shadow-sm transition-all"
          />
          <div className="text-[11px] text-zinc-400 font-medium">{totalVisible} tasks</div>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-6 gap-4 md:gap-6 pb-24 md:pb-8">
          {COLUMNS.map((col) => {
            const tasks = (tasksByStatus[col.status] ?? []).filter(passesFilter);
            return (
              <div
                key={col.status}
                className="flex flex-col min-w-0"
              >
                <div className={`flex items-center justify-between px-1 ${tasks.length === 0 ? "mb-1.5" : "mb-3"}`}>
                  <h3 className="text-[12px] font-semibold tracking-tight text-zinc-500 dark:text-zinc-400 uppercase flex items-center gap-2">
                    {col.title}
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-normal">({tasks.length})</span>
                  </h3>
                </div>

                <Droppable droppableId={col.status} type="TASK">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex flex-col gap-2 transition-all duration-200 rounded-lg ${
                        tasks.length === 0 && !snapshot.isDraggingOver
                          ? "h-8 border border-dashed border-zinc-200 dark:border-zinc-800/50"
                          : "min-h-[40px]"
                      } ${
                        snapshot.isDraggingOver
                          ? "bg-zinc-100/50 dark:bg-zinc-800/50 min-h-[120px] ring-2 ring-zinc-200 dark:ring-zinc-800 border-transparent"
                          : ""
                      }`}
                    >
                      {loading ? (
                        tasks.length === 0 ? (
                           <div className="h-8 animate-pulse rounded border border-zinc-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50" />
                        ) : (
                          Array.from({ length: 1 }).map((_, idx) => (
                            <div
                              key={idx}
                              className="h-24 animate-pulse rounded border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                            />
                          ))
                        )
                      ) : (
                        tasks.map((task, index) => (
                          <Draggable
                            key={task._id}
                            draggableId={task._id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="outline-none"
                              >
                                <TaskCard
                                  task={task}
                                  assignee={
                                    task.assigneeIds[0]
                                      ? byAgent.get(task.assigneeIds[0])
                                      : undefined
                                  }
                                  onClick={() => onSelectTask?.(task)}
                                  isDragging={snapshot.isDragging}
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
