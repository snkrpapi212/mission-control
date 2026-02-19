"use client";

import { useMemo, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import type { TaskStatus } from "@/types";
import type { Doc } from "../../convex/_generated/dataModel";
import { TaskCard } from "@/components/TaskCard";
import { Chip, PanelHeader } from "@/components/MissionControlPrimitives";

const COLUMNS: Array<{ status: TaskStatus; title: string; accent: string }> = [
  { status: "inbox",       title: "Inbox",       accent: "var(--mc-text-subtle)" },
  { status: "assigned",    title: "Assigned",    accent: "var(--mc-purple)" },
  { status: "in_progress", title: "In Flight",   accent: "var(--mc-cyan)" },
  { status: "review",      title: "Review",      accent: "var(--mc-amber)" },
  { status: "done",        title: "Done",        accent: "var(--mc-green)" },
  { status: "blocked",     title: "Blocked",     accent: "var(--mc-red)" },
];

type KanbanBoardProps = {
  tasksByStatus: Record<TaskStatus, Doc<"tasks">[]>;
  agents: Doc<"agents">[];
  loading?: boolean;
  // eslint-disable-next-line no-unused-vars
  onSelectTask?: (..._args: [Doc<"tasks">]) => void;
  // eslint-disable-next-line no-unused-vars
  onTaskMove?: (taskId: string, newStatus: TaskStatus) => void;
};

export function KanbanBoard(props: KanbanBoardProps) {
  return (
    <Suspense fallback={null}>
      <KanbanBoardInner {...props} />
    </Suspense>
  );
}

function KanbanBoardInner({
  tasksByStatus,
  agents,
  loading,
  onSelectTask,
  onTaskMove,
}: KanbanBoardProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const query = searchParams.get("q") ?? "";

  const setQuery = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

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
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="text-[11px] font-bold uppercase tracking-[0.15em] shrink-0"
            style={{ color: "var(--mc-text-subtle)" }}
          >
            Mission Queue
          </span>
          <span
            className="text-[10px] font-semibold tabular-nums px-1.5 py-0.5 rounded"
            style={{
              background: "var(--mc-panel-2)",
              border: "1px solid var(--mc-line)",
              color: "var(--mc-text-muted)",
            }}
          >
            {totalVisible}
          </span>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter tasks…"
          className="h-7 w-[160px] shrink-0 rounded-md px-2.5 text-[11px] outline-none transition-all"
          style={{
            background: "var(--mc-panel-2)",
            border: "1px solid var(--mc-line)",
            color: "var(--mc-text)",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--mc-cyan)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--mc-line)")}
        />
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-6 gap-4 md:gap-6 pb-24 md:pb-8"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.06 } },
          }}
        >
          {COLUMNS.map((col) => {
            const tasks = (tasksByStatus[col.status] ?? []).filter(passesFilter);
            return (
              <motion.div
                key={col.status}
                className="flex flex-col min-w-0"
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 28 } },
                }}
              >
                {/* Column header */}
                <div className="mb-2.5 flex items-center gap-2">
                  {/* Left accent bar */}
                  <div
                    className="h-4 w-[3px] rounded-full shrink-0"
                    style={{ background: col.accent }}
                  />
                  <h3
                    className="flex-1 text-[10px] font-bold uppercase tracking-[0.14em] leading-none"
                    style={{ color: "var(--mc-text-muted)" }}
                  >
                    {col.title}
                  </h3>
                  {/* Count badge */}
                  <span
                    className="text-[10px] font-mono font-semibold tabular-nums min-w-[20px] h-[18px] flex items-center justify-center rounded"
                    style={{
                      background: tasks.length > 0 ? `${col.accent}18` : "var(--mc-panel-3)",
                      color: tasks.length > 0 ? col.accent : "var(--mc-text-subtle)",
                      border: `1px solid ${tasks.length > 0 ? col.accent + "40" : "var(--mc-line)"}`,
                    }}
                  >
                    {tasks.length}
                  </span>
                </div>

                <Droppable droppableId={col.status} type="TASK">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="flex flex-col gap-2 rounded-lg transition-all duration-150"
                      style={{
                        minHeight: tasks.length === 0 && !snapshot.isDraggingOver ? 36 : 40,
                        padding: snapshot.isDraggingOver ? "6px" : "0",
                        background: snapshot.isDraggingOver
                          ? `${col.accent}0D`
                          : "transparent",
                        border: snapshot.isDraggingOver
                          ? `1px dashed ${col.accent}60`
                          : tasks.length === 0
                          ? "1px dashed var(--mc-line)"
                          : "1px solid transparent",
                        borderRadius: 8,
                      }}
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
              </motion.div>
            );
          })}
        </motion.div>
      </DragDropContext>
    </section>
  );
}
