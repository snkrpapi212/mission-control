"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import type { TaskStatus } from "@/types";
import type { Doc } from "../../convex/_generated/dataModel";
import { TaskCard } from "@/components/TaskCard";
import { Chip, PanelHeader } from "@/components/MissionControlPrimitives";
import { EmptyColumn } from "@/components/EmptyStates";
import { Search, Layers } from "lucide-react";

const COLUMNS: Array<{ status: TaskStatus; title: string; dotClass: string; description: string }> = [
  { status: "inbox", title: "Inbox", dotClass: "text-[var(--mc-line-strong)]", description: "New tasks" },
  { status: "assigned", title: "Assigned", dotClass: "text-[var(--mc-amber)]", description: "Ready to start" },
  { status: "in_progress", title: "In Progress", dotClass: "text-[var(--mc-green)]", description: "Active work" },
  { status: "review", title: "Review", dotClass: "text-[var(--mc-amber)]", description: "Pending review" },
  { status: "done", title: "Done", dotClass: "text-[var(--mc-green)]", description: "Completed" },
  { status: "blocked", title: "Blocked", dotClass: "text-[var(--mc-red)]", description: "Needs attention" },
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
        icon={<Layers size={16} />}
      />

      <div className="flex items-center justify-between border-b border-[var(--mc-line)] bg-[var(--mc-panel)]/60 backdrop-blur-sm px-4 py-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mc-text-soft)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks..."
            className="h-10 w-[260px] rounded-xl border border-[var(--mc-line)] bg-[var(--mc-card)] pl-9 pr-4 text-[13px] text-[var(--mc-text)] placeholder:text-[var(--mc-text-soft)] outline-none focus:border-[var(--mc-accent-green)] focus:ring-2 focus:ring-[var(--mc-accent-green)]/20 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[var(--mc-text-soft)]">{totalVisible} tasks</span>
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
                className="rounded-xl border border-[var(--mc-line)] bg-[var(--mc-panel)] flex flex-col shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-[var(--mc-line)] bg-[var(--mc-panel-soft)]/50 backdrop-blur-sm px-4 py-3 sticky top-0 z-10"
                >
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex h-2.5 w-2.5 rounded-full ${col.dotClass.replace('text-', 'bg-')}`} />
                    <div>
                      <h3 className="text-[13px] font-semibold tracking-[0.02em] text-[var(--mc-text)]">
                        {col.title}
                      </h3>
                      <p className="text-[10px] text-[var(--mc-text-muted)]">{col.description}</p>
                    </div>
                  </div>
                  <Chip className="bg-[var(--mc-panel-soft)] border-[var(--mc-line)]">{tasks.length}</Chip>
                </div>

                <Droppable droppableId={col.status} type="TASK">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex flex-col gap-3 p-3 min-h-[200px] flex-1 rounded-b-xl transition-colors ${
                        snapshot.isDraggingOver
                          ? "bg-[var(--mc-amber-soft)]/50"
                          : ""
                      }`}
                    >
                      {loading ? (
                        Array.from({ length: 2 }).map((_, idx) => (
                          <div
                            key={idx}
                            className="h-32 rounded-xl bg-[var(--mc-panel-soft)] animate-pulse"
                          />
                        ))
                      ) : tasks.length === 0 ? (
                        <EmptyColumn title={col.title} />
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
              </motion.div>
            );
          })}
        </div>
      </DragDropContext>
    </section>
  );
}
