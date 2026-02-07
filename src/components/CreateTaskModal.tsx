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
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-lg shadow-xl border border-gray-200">
        <form onSubmit={handleSubmit}>
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-base font-bold text-gray-900">Create New Task</h2>
          </div>

          <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
            <label className="block">
              <div className="text-xs font-semibold text-gray-900 mb-1">Title *</div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                required
              />
            </label>

            <label className="block">
              <div className="text-xs font-semibold text-gray-900 mb-1">Description</div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter task description"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                rows={4}
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <div className="text-xs font-semibold text-gray-900 mb-1">Priority</div>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high" | "urgent")}
                  className="w-full rounded-md border border-gray-300 px-2 py-2 text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </label>

              <label className="block">
                <div className="text-xs font-semibold text-gray-900 mb-1">Created by</div>
                <select
                  value={createdBy}
                  onChange={(e) => setCreatedBy(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-2 py-2 text-sm"
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
              <div className="text-xs font-semibold text-gray-900 mb-1">Assignees</div>
              <div className="rounded-md border border-gray-300 p-2 max-h-40 overflow-y-auto">
                {agents.length === 0 ? (
                  <div className="text-xs text-gray-400">No agents available</div>
                ) : (
                  <div className="space-y-1">
                    {agents.map((agent) => (
                      <label
                        key={agent._id}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded px-2 py-1"
                      >
                        <input
                          type="checkbox"
                          checked={selectedAgentIds.includes(agent.agentId)}
                          onChange={() => toggleAgent(agent.agentId)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-900">
                          {agent.name} ({agent.agentId})
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-900 mb-1">Tags</div>
              <div className="flex gap-2 mb-2">
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
                  className="flex-1 rounded-md border border-gray-300 px-3 py-1 text-sm"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="rounded-md border border-gray-300 px-3 py-1 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                >
                  Add
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 bg-gray-100 border border-gray-200 rounded px-2 py-1 text-xs"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
