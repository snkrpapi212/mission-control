"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Agent } from "@/types";
import { useCreateTask } from "@/hooks/useConvexData";
import { X, User, Plus, Tag } from "lucide-react";

export function CreateTaskModal({
  agents,
  onClose,
}: {
  agents: Agent[];
  onClose: () => void;
}) {
  const createTask = useCreateTask();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [createdBy, setCreatedBy] = useState(agents[0]?.agentId ?? "main");

  const toggleAgent = (agentId: string) => {
    setSelectedAgentIds((prev) =>
      prev.includes(agentId)
        ? prev.filter((id) => id !== agentId)
        : [...prev, agentId]
    );
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Title is required");
      return;
    }

    try {
      await createTask({
        title: title.trim(),
        description: description.trim(),
        assigneeIds: selectedAgentIds,
        createdBy,
        priority,
        tags,
      });
      onClose();
    } catch (error) {
      alert(`Failed to create task: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
        <motion.div 
          className="absolute inset-x-2 bottom-2 top-auto max-h-[92dvh] rounded-2xl border border-[var(--mc-line)] bg-[var(--mc-panel)] shadow-2xl overflow-hidden sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:w-full sm:max-w-lg sm:max-h-[88dvh] sm:-translate-x-1/2 sm:-translate-y-1/2"
          initial={{ opacity: 0, scale: 0.98, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
        >
          <form onSubmit={handleSubmit} className="flex max-h-[inherit] flex-col">
            <div className="flex items-center justify-between border-b border-[var(--mc-line)] px-5 py-4 bg-[var(--mc-panel-soft)]">
              <h2 className="text-[16px] font-semibold text-[var(--mc-text)]">Create New Task</h2>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-[var(--mc-line)] text-[var(--mc-text-muted)] transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
              <label className="block">
                <div className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--mc-text-soft)]">Title *</div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter task title"
                  className="w-full rounded-lg border border-[var(--mc-line)] bg-[var(--mc-card)] px-3 py-2.5 text-[14px] text-[var(--mc-text)] outline-none placeholder:text-[var(--mc-text-muted)] focus:border-[var(--mc-accent-green)] focus:ring-1 focus:ring-[var(--mc-accent-green)] transition-all"
                  required
                />
              </label>

              <label className="block">
                <div className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--mc-text-soft)]">Description</div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter task description"
                  className="w-full rounded-lg border border-[var(--mc-line)] bg-[var(--mc-card)] px-3 py-2.5 text-[14px] text-[var(--mc-text)] outline-none placeholder:text-[var(--mc-text-muted)] focus:border-[var(--mc-accent-green)] focus:ring-1 focus:ring-[var(--mc-accent-green)] transition-all resize-none"
                  rows={4}
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <div className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--mc-text-soft)]">Priority</div>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high" | "urgent")}
                    className="w-full rounded-lg border border-[var(--mc-line)] bg-[var(--mc-card)] px-3 py-2.5 text-[14px] text-[var(--mc-text)] outline-none focus:border-[var(--mc-accent-green)] focus:ring-1 focus:ring-[var(--mc-accent-green)] transition-all appearance-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </label>

                <label className="block">
                  <div className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--mc-text-soft)]">Created by</div>
                  <select
                    value={createdBy}
                    onChange={(e) => setCreatedBy(e.target.value)}
                    className="w-full rounded-lg border border-[var(--mc-line)] bg-[var(--mc-card)] px-3 py-2.5 text-[14px] text-[var(--mc-text)] outline-none focus:border-[var(--mc-accent-green)] focus:ring-1 focus:ring-[var(--mc-accent-green)] transition-all appearance-none"
                  >
                    {agents.map((a) => (
                      <option key={a._id} value={a.agentId}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div>
                <div className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--mc-text-soft)]">Assignees</div>
                <div className="max-h-40 overflow-y-auto rounded-lg border border-[var(--mc-line)] bg-[var(--mc-card)] p-2">
                  {agents.length === 0 ? (
                    <div className="text-[13px] text-[var(--mc-text-muted)] py-2 px-2">No agents available</div>
                  ) : (
                    <div className="space-y-1">
                      {agents.map((agent) => (
                        <label
                          key={agent._id}
                          className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-[var(--mc-panel-soft)] transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedAgentIds.includes(agent.agentId)}
                            onChange={() => toggleAgent(agent.agentId)}
                            className="rounded border-[var(--mc-line)] text-[var(--mc-accent-green)] focus:ring-[var(--mc-accent-green)]"
                          />
                          <div className="h-6 w-6 rounded-md bg-[var(--mc-line)] flex items-center justify-center text-[var(--mc-text-muted)]">
                            <User size={14} />
                          </div>
                          <span className="text-[14px] text-[var(--mc-text)]">
                            {agent.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--mc-text-soft)]">Tags</div>
                <div className="mb-3 flex gap-2">
                  <div className="relative flex-1">
                    <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mc-text-muted)]" />
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                      placeholder="Add a tag"
                      className="w-full rounded-lg border border-[var(--mc-line)] bg-[var(--mc-card)] pl-9 pr-3 py-2.5 text-[14px] text-[var(--mc-text)] outline-none placeholder:text-[var(--mc-text-muted)] focus:border-[var(--mc-accent-green)] focus:ring-1 focus:ring-[var(--mc-accent-green)] transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addTag}
                    className="rounded-lg border border-[var(--mc-line)] bg-[var(--mc-card)] px-4 py-2 text-[14px] font-medium text-[var(--mc-text)] hover:bg-[var(--mc-panel-soft)] transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 rounded-md border border-[var(--mc-line)] bg-[var(--mc-panel-soft)] px-2.5 py-1 text-[12px] text-[var(--mc-text)]"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-[var(--mc-text-muted)] hover:text-[var(--mc-text)] transition-colors"
                          aria-label={`Remove tag ${tag}`}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-[var(--mc-line)] bg-[var(--mc-panel-soft)] px-4 py-3 sm:flex-row sm:justify-end sm:gap-3 sm:px-5 sm:py-4">
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-lg border border-[var(--mc-line)] bg-[var(--mc-card)] px-4 py-2 text-[14px] font-medium text-[var(--mc-text)] hover:bg-[var(--mc-panel)] transition-colors sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full rounded-lg bg-[var(--mc-accent-green)] px-4 py-2 text-[14px] font-medium text-white hover:bg-[var(--mc-accent-green)]/90 transition-colors sm:w-auto"
              >
                Create Task
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
