"use client";

import { useState } from "react";
import type { Agent } from "@/types";
import { useCreateTask } from "@/hooks/useConvexData";

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
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-[var(--r-card)] border border-[var(--mc-line)] bg-[var(--mc-panel)] shadow-[var(--sh-modal)]">
        <form onSubmit={handleSubmit}>
          <div className="border-b border-[var(--mc-line)] px-4 py-4">
            <h2 className="text-[16px] font-semibold text-[var(--mc-text)]">Create New Task</h2>
          </div>

          <div className="max-h-[70vh] space-y-4 overflow-y-auto px-4 py-4">
            <label className="block">
              <div className="mb-1 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--mc-text-soft)]">Title *</div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title"
                className="w-full rounded-md border border-[var(--mc-line)] bg-[var(--mc-card)] px-3 py-2 text-sm text-[var(--mc-text)] outline-none placeholder:text-[var(--mc-text-soft)] focus:border-[var(--mc-green)] focus:shadow-[var(--focus-ring)]"
                required
              />
            </label>

            <label className="block">
              <div className="mb-1 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--mc-text-soft)]">Description</div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter task description"
                className="w-full rounded-md border border-[var(--mc-line)] bg-[var(--mc-card)] px-3 py-2 text-sm text-[var(--mc-text)] outline-none placeholder:text-[var(--mc-text-soft)] focus:border-[var(--mc-green)] focus:shadow-[var(--focus-ring)]"
                rows={4}
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <div className="mb-1 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--mc-text-soft)]">Priority</div>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high" | "urgent")}
                  className="w-full rounded-md border border-[var(--mc-line)] bg-[var(--mc-card)] px-2 py-2 text-sm text-[var(--mc-text)] outline-none focus:border-[var(--mc-green)] focus:shadow-[var(--focus-ring)]"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </label>

              <label className="block">
                <div className="mb-1 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--mc-text-soft)]">Created by</div>
                <select
                  value={createdBy}
                  onChange={(e) => setCreatedBy(e.target.value)}
                  className="w-full rounded-md border border-[var(--mc-line)] bg-[var(--mc-card)] px-2 py-2 text-sm text-[var(--mc-text)] outline-none focus:border-[var(--mc-green)] focus:shadow-[var(--focus-ring)]"
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
              <div className="mb-1 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--mc-text-soft)]">Assignees</div>
              <div className="max-h-40 overflow-y-auto rounded-md border border-[var(--mc-line)] bg-[var(--mc-card)] p-2">
                {agents.length === 0 ? (
                  <div className="text-xs text-[var(--mc-text-soft)]">No agents available</div>
                ) : (
                  <div className="space-y-1">
                    {agents.map((agent) => (
                      <label
                        key={agent._id}
                        className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-[var(--mc-panel-soft)]"
                      >
                        <input
                          type="checkbox"
                          checked={selectedAgentIds.includes(agent.agentId)}
                          onChange={() => toggleAgent(agent.agentId)}
                          className="rounded border-[var(--mc-line)]"
                        />
                        <span className="text-sm text-[var(--mc-text)]">
                          {agent.name} ({agent.agentId})
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--mc-text-soft)]">Tags</div>
              <div className="mb-2 flex gap-2">
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
                  className="flex-1 rounded-md border border-[var(--mc-line)] bg-[var(--mc-card)] px-3 py-1 text-sm text-[var(--mc-text)] outline-none placeholder:text-[var(--mc-text-soft)] focus:border-[var(--mc-green)] focus:shadow-[var(--focus-ring)]"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="rounded-md border border-[var(--mc-line)] bg-[var(--mc-card)] px-3 py-1 text-sm font-semibold text-[var(--mc-text)] hover:bg-[var(--mc-panel-soft)]"
                >
                  Add
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded border border-[var(--mc-line)] bg-[var(--mc-panel-soft)] px-2 py-1 text-xs text-[var(--mc-text-muted)]"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-[var(--mc-text-soft)] hover:text-[var(--mc-text)]"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-[var(--mc-line)] px-4 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-[var(--mc-line)] bg-[var(--mc-card)] px-4 py-2 text-sm font-semibold text-[var(--mc-text)] hover:bg-[var(--mc-panel-soft)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md border border-[var(--mc-text)] bg-[var(--mc-text)] px-4 py-2 text-sm font-semibold text-[var(--mc-bg)] hover:opacity-90"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
