"use client";

import { useEffect, useState, useCallback } from "react";
import { Command } from "cmdk";
import { motion, AnimatePresence } from "framer-motion";
import type { Doc } from "../../convex/_generated/dataModel";

interface CommandPaletteProps {
  // eslint-disable-next-line no-unused-vars
  tasks: Doc<"tasks">[];
  agents: Doc<"agents">[];
  // eslint-disable-next-line no-unused-vars
  onSelectTask?: (task: Doc<"tasks">) => void;
  // eslint-disable-next-line no-unused-vars
  onSelectAgent?: (agent: Doc<"agents">) => void;
  onCreateTask?: () => void;
}

const ACTIONS = [
  {
    id: "create-task",
    title: "Create task",
    icon: "➕",
    shortcut: "⌘+Shift+N",
    shortcutDisplay: "⌘⇧N",
  },
  {
    id: "mark-done",
    title: "Mark complete",
    icon: "✓",
    shortcut: "⌘+Enter",
    shortcutDisplay: "⌘↵",
  },
  { 
    id: "archive", 
    title: "Archive", 
    icon: "📦", 
    shortcut: "⌘+⌫",
    shortcutDisplay: "⌘⌫",
  },
  { 
    id: "share", 
    title: "Share", 
    icon: "🔗", 
    shortcut: "⌘+Shift+S",
    shortcutDisplay: "⌘⇧S",
  },
];

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const panelVariants = {
  hidden: { opacity: 0, scale: 0.96, y: -10 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, y: -10 },
};

const itemVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export function CommandPalette({
  tasks,
  agents,
  onSelectTask,
  onSelectAgent,
  onCreateTask,
}: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Cmd+K / Ctrl+K to open
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Reset search when closing
  useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  const handleSelectTask = useCallback((task: Doc<"tasks">) => {
    onSelectTask?.(task);
    setOpen(false);
    setSearch("");
  }, [onSelectTask]);

  const handleSelectAgent = useCallback((agent: Doc<"agents">) => {
    onSelectAgent?.(agent);
    setOpen(false);
    setSearch("");
  }, [onSelectAgent]);

  const handleCreateTask = useCallback(() => {
    onCreateTask?.();
    setOpen(false);
    setSearch("");
  }, [onCreateTask]);

  const handleAction = useCallback((actionId: string) => {
    switch (actionId) {
      case "create-task":
        handleCreateTask();
        break;
      case "mark-done":
        // TODO: implement mark done for current/selected task
        break;
      case "archive":
        // TODO: implement archive
        break;
      case "share":
        // TODO: implement share
        break;
    }
  }, [handleCreateTask]);

  const filteredTasks = search 
    ? tasks.filter(
        (task) =>
          task.title.toLowerCase().includes(search.toLowerCase()) ||
          task.description.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const filteredAgents = search
    ? agents.filter((agent) =>
        agent.name.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <AnimatePresence>
      {open && (
        <div 
          className="fixed inset-0 z-50"
          onClick={() => setOpen(false)}
        >
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.14 }}
            className="absolute inset-0 bg-black/40"
            style={{ backdropFilter: "blur(4px)" }}
            aria-hidden="true"
          />

          {/* Command Palette Modal */}
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.16, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed left-1/2 top-[20%] -translate-x-1/2 z-50 w-full max-w-2xl px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Command
              className="rounded-xl border border-[var(--mc-line)] bg-[var(--mc-panel)] shadow-2xl overflow-hidden"
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  setOpen(false);
                }
              }}
              loop
            >
              {/* Search Input */}
              <div className="flex items-center border-b border-[var(--mc-line)] px-4 py-3">
                <svg 
                  className="w-5 h-5 text-[var(--mc-text-muted)] mr-3 flex-shrink-0" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <Command.Input
                  placeholder="Search tasks, agents, actions..."
                  value={search}
                  onValueChange={setSearch}
                  className="h-10 flex-1 bg-transparent text-[15px] text-[var(--mc-text)] placeholder:text-[var(--mc-text-muted)] outline-none"
                  aria-label="Search commands"
                />
                <kbd className="hidden sm:inline-flex items-center px-2 py-1 rounded bg-[var(--mc-panel-soft)] border border-[var(--mc-line)] text-[11px] text-[var(--mc-text-soft)] font-mono">
                  ESC
                </kbd>
              </div>

              {/* Results List */}
              <Command.List className="max-h-[60vh] overflow-y-auto p-2">
                {/* "Create Task" Action (always visible at top) */}
                <Command.Group heading="Quick Actions" className="px-1 py-1">
                  <Command.Item
                    value="create-task"
                    onSelect={() => handleCreateTask()}
                    className="group flex items-center justify-between px-3 py-2.5 rounded-lg text-[14px] cursor-pointer transition-colors duration-120 aria-selected:bg-[var(--mc-panel-soft)] aria-selected:text-[var(--mc-text)] outline-none"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-[18px] w-6 text-center" aria-hidden="true">➕</span>
                      <span className="text-[var(--mc-text)]">Create task</span>
                    </span>
                    <kbd className="text-[11px] text-[var(--mc-text-soft)] bg-[var(--mc-panel-soft)] px-1.5 py-0.5 rounded border border-[var(--mc-line)]">
                      {ACTIONS[0].shortcutDisplay}
                    </kbd>
                  </Command.Item>
                </Command.Group>

                {/* Search Results: Tasks */}
                {search && filteredTasks.length > 0 && (
                  <>
                    <Command.Separator className="h-px bg-[var(--mc-line)] my-2 mx-1" />
                    <Command.Group heading={`Tasks (${filteredTasks.length})`} className="px-1 py-1">
                      {filteredTasks.map((task, index) => (
                        <motion.div
                          key={task._id}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          transition={{ duration: 0.1, delay: index * 0.02 }}
                        >
                          <Command.Item
                            value={`task-${task._id}`}
                            onSelect={() => handleSelectTask(task)}
                            className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] cursor-pointer transition-colors duration-120 aria-selected:bg-[var(--mc-panel-soft)] aria-selected:text-[var(--mc-text)] outline-none"
                          >
                            <span className="text-[18px] w-6 text-center flex-shrink-0" aria-hidden="true">📋</span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[var(--mc-text)] font-medium">
                                {task.title}
                              </p>
                              <p className="text-[12px] text-[var(--mc-text-soft)] truncate flex items-center gap-1.5">
                                <span className="capitalize">{task.status.replace("_", " ")}</span>
                                <span aria-hidden="true">•</span>
                                <span 
                                  className="uppercase text-[11px] font-medium"
                                  style={{
                                    color: task.priority === "urgent" 
                                      ? "var(--mc-red)" 
                                      : task.priority === "high"
                                      ? "var(--mc-amber)"
                                      : "var(--mc-green)"
                                  }}
                                >
                                  {task.priority}
                                </span>
                              </p>
                            </div>
                          </Command.Item>
                        </motion.div>
                      ))}
                    </Command.Group>
                  </>
                )}

                {/* Search Results: Agents */}
                {search && filteredAgents.length > 0 && (
                  <>
                    <Command.Separator className="h-px bg-[var(--mc-line)] my-2 mx-1" />
                    <Command.Group heading={`Agents (${filteredAgents.length})`} className="px-1 py-1">
                      {filteredAgents.map((agent, index) => (
                        <motion.div
                          key={agent._id}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          transition={{ duration: 0.1, delay: index * 0.02 }}
                        >
                          <Command.Item
                            value={`agent-${agent._id}`}
                            onSelect={() => handleSelectAgent(agent)}
                            className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] cursor-pointer transition-colors duration-120 aria-selected:bg-[var(--mc-panel-soft)] aria-selected:text-[var(--mc-text)] outline-none"
                          >
                            <span className="text-[18px] w-6 text-center flex-shrink-0" aria-hidden="true">{agent.emoji}</span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[var(--mc-text)] font-medium">
                                {agent.name}
                              </p>
                              <p className="text-[12px] text-[var(--mc-text-soft)] truncate">
                                {agent.role}
                              </p>
                            </div>
                          </Command.Item>
                        </motion.div>
                      ))}
                    </Command.Group>
                  </>
                )}

                {/* Actions Section */}
                {!search && (
                  <>
                    <Command.Separator className="h-px bg-[var(--mc-line)] my-2 mx-1" />
                    <Command.Group heading="Actions" className="px-1 py-1">
                      {ACTIONS.slice(1).map((action) => (
                        <Command.Item
                          key={action.id}
                          value={action.id}
                          onSelect={() => handleAction(action.id)}
                          className="group flex items-center justify-between px-3 py-2.5 rounded-lg text-[14px] cursor-pointer transition-colors duration-120 aria-selected:bg-[var(--mc-panel-soft)] aria-selected:text-[var(--mc-text)] outline-none"
                        >
                          <span className="flex items-center gap-3">
                            <span className="text-[18px] w-6 text-center" aria-hidden="true">{action.icon}</span>
                            <span className="text-[var(--mc-text)]">{action.title}</span>
                          </span>
                          <kbd className="text-[11px] text-[var(--mc-text-soft)] bg-[var(--mc-panel-soft)] px-1.5 py-0.5 rounded border border-[var(--mc-line)]">
                            {action.shortcutDisplay}
                          </kbd>
                        </Command.Item>
                      ))}
                    </Command.Group>
                  </>
                )}

                {/* Empty State */}
                <Command.Empty className="px-4 py-12 text-center">
                  <div className="text-[40px] mb-2" aria-hidden="true">🔍</div>
                  <p className="text-[14px] text-[var(--mc-text-muted)]">
                    No results found
                  </p>
                  <p className="text-[12px] text-[var(--mc-text-soft)] mt-1">
                    Try a different search term
                  </p>
                </Command.Empty>
              </Command.List>

              {/* Footer */}
              <div className="border-t border-[var(--mc-line)] px-4 py-2 flex items-center justify-between text-[11px] text-[var(--mc-text-soft)] bg-[var(--mc-panel-soft)]">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-[var(--mc-card)] border border-[var(--mc-line)] font-mono">↑↓</kbd>
                    to navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-[var(--mc-card)] border border-[var(--mc-line)] font-mono">↵</kbd>
                    to select
                  </span>
                </div>
                <span>
                  {filteredTasks.length + filteredAgents.length} results
                </span>
              </div>
            </Command>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
