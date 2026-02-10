"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import type { TaskStatus } from "@/types";
import type { Doc } from "../../convex/_generated/dataModel";
import { TaskCard } from "@/components/TaskCard";
import { PanelHeader } from "@/components/MissionControlPrimitives";

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
    <section className="min-w-0 bg-[var(--mc-panel-soft)]">
      <PanelHeader
        dotClass="text-[var(--mc-amber)]"
        title="Mission Queue"
        count={totalVisible}
      />

      <div className="flex items-center justify-between border-b border-[var(--mc-line)] px-4 py-3">
        <input
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
          placeholder="Search tasks"
          className="h-9 w-[260px] rounded-[12px] border border-[var(--mc-line)] bg-[var(--mc-card)] px-3 text-[13px] text-[var(--mc-text)] placeholder:text-[var(--mc-text-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--mc-accent-green)]"
        />
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-[var(--mc-amber)] bg-[var(--mc-amber-soft)] px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--mc-amber)]">
            All
          </span>
          <span className="mc-chip">Tasks</span>
          <span className="mc-chip">Priority</span>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 gap-3 p-3 md:grid-cols-2 2xl:grid-cols-6">
          {COLUMNS.map((col) => {
            const tasks = (tasksByStatus[col.status] ?? []).filter(passesFilter);
            return (
              <motion.div
                key={col.status}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-[var(--r-card)] border border-[var(--mc-line)] bg-[var(--mc-panel)]"
              >
                <div className="flex items-center justify-between border-b border-[var(--mc-line)] px-4 py-3">
                  <h3 className="text-[14px] font-semibold uppercase tracking-[0.1em] text-[var(--mc-text)]">
                    <span className={`mr-2 ${col.dotClass}`}>●</span>
                    {col.title}
                  </h3>
                  <span className="mc-chip">{tasks.length}</span>
                </div>

                <Droppable droppableId={col.status} type={`tasks-${col.status}`}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-3 p-3 min-h-[200px] transition-colors ${
                        snapshot.isDraggingOver
                          ? "bg-[var(--mc-amber-soft)]"
                          : ""
                      }`}
                    >
                      {loading ? (
                        Array.from({ length: 2 }).map((_, idx) => (
                          <div
                            key={idx}
                            className="h-32 animate-pulse bg-[var(--mc-line)] rounded-[var(--r-card)] border border-[var(--mc-border)]"
                          />
                        ))
                      ) : tasks.length === 0 ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="rounded-[var(--r-card)] border border-dashed border-[var(--mc-line-strong)] bg-[var(--mc-card)] p-4 text-center text-[13px] uppercase tracking-[0.12em] text-[var(--mc-text-soft)]"
                        >
                          <div className="text-[24px] mb-2">📭</div>
                          No tasks in {col.title}
                        </motion.div>
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
              </motion.div>
            );
          })}
        </div>
      </DragDropContext>
    </section>
  );
}
