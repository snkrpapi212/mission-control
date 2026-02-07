"use client";

import { useMemo, useState } from "react";
import type { Agent } from "@/types";
import type { Doc } from "../../convex/_generated/dataModel";
import type { Id } from "../../convex/_generated/dataModel";
import { timeAgo } from "@/lib/time";
import {
  useDocumentsByTask,
  useMessagesByTask,
  useTaskMutations,
} from "@/hooks/useConvexData";

export function TaskDetailDrawer({
  task,
  agents,
  onClose,
}: {
  task: Doc<"tasks">;
  agents: Agent[];
  onClose: () => void;
}) {
  const taskId = task._id as Id<"tasks">;
  const messages = useMessagesByTask(taskId) || [];
  const documents = useDocumentsByTask(taskId) || [];
  const { updateTask, createMessage, createDocument } = useTaskMutations();

  const [fromAgentId, setFromAgentId] = useState<string>(agents[0]?.agentId ?? "main");
  const [comment, setComment] = useState<string>("");
  const [docTitle, setDocTitle] = useState<string>("");
  const [docType, setDocType] = useState<
    "deliverable" | "research" | "protocol" | "analysis" | "draft"
  >("draft");
  const [docContent, setDocContent] = useState<string>("");

  const statusOptions = useMemo(
    () => [
      "inbox",
      "assigned",
      "in_progress",
      "review",
      "done",
      "blocked",
    ] as const,
    []
  );

  type StatusOption = (typeof statusOptions)[number];

  async function onPostComment() {
    const text = comment.trim();
    if (!text) return;
    await createMessage({
      taskId,
      fromAgentId,
      content: text,
    });
    setComment("");
  }

  async function onCreateDoc() {
    const title = docTitle.trim();
    const content = docContent.trim();
    if (!title || !content) return;
    await createDocument({
      title,
      content,
      type: docType,
      taskId,
      createdBy: fromAgentId,
    });
    setDocTitle("");
    setDocContent("");
    setDocType("draft");
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full sm:w-[520px] bg-white shadow-xl border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs text-gray-500">Task</div>
            <h2 className="text-base font-bold text-gray-900 truncate">{task.title}</h2>
            <div className="mt-1 text-xs text-gray-500">
              updated {timeAgo(task.updatedAt)} · priority {task.priority}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto">
          <div>
            <div className="text-xs font-semibold text-gray-900">Description</div>
            <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{task.description}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <div className="text-xs font-semibold text-gray-900">Acting as</div>
              <select
                value={fromAgentId}
                onChange={(e) => setFromAgentId(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
              >
                {agents.map((a) => (
                  <option key={a._id} value={a.agentId}>
                    {a.name} ({a.agentId})
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <div className="text-xs font-semibold text-gray-900">Status</div>
              <select
                value={task.status}
                onChange={(e) =>
                  updateTask({
                    id: taskId,
                    status: e.target.value as StatusOption,
                    agentId: fromAgentId,
                  })
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="text-xs font-semibold text-gray-900">Comments</div>
            <div className="mt-2 space-y-2">
              {messages.length === 0 ? (
                <div className="text-xs text-gray-400">No comments yet</div>
              ) : (
                messages
                  .slice()
                  .sort((a: { createdAt: number }, b: { createdAt: number }) => (a.createdAt ?? 0) - (b.createdAt ?? 0))
                  .map((m: { _id: string; fromAgentId: string; createdAt: number; content: string }) => (
                    <div key={m._id} className="rounded-md border border-gray-200 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs font-medium text-gray-700">{m.fromAgentId}</div>
                        <div className="text-xs text-gray-500">{timeAgo(m.createdAt)}</div>
                      </div>
                      <div className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{m.content}</div>
                    </div>
                  ))
              )}
            </div>

            <div className="mt-3 flex gap-2">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment…"
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
                rows={3}
              />
            </div>
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={onPostComment}
                className="rounded-md bg-black px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800"
              >
                Post comment
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="text-xs font-semibold text-gray-900">Documents</div>
            <div className="mt-2 space-y-2">
              {documents.length === 0 ? (
                <div className="text-xs text-gray-400">No documents yet</div>
              ) : (
                documents
                  .slice()
                  .sort((a: { updatedAt: number }, b: { updatedAt: number }) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
                  .map((d: { _id: string; title: string; type: string; updatedAt: number; content: string }) => (
                    <details key={d._id} className="rounded-md border border-gray-200 p-3 bg-gray-50">
                      <summary className="cursor-pointer select-none">
                        <span className="text-sm font-semibold text-gray-900">{d.title}</span>
                        <span className="text-xs text-gray-500">{" "}· {d.type} · {timeAgo(d.updatedAt)}</span>
                      </summary>
                      <pre className="mt-2 text-xs whitespace-pre-wrap text-gray-800">{d.content}</pre>
                    </details>
                  ))
              )}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2">
              <input
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="Doc title"
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              <div className="flex items-center gap-2">
                <select
                  value={docType}
                  onChange={(e) =>
                    setDocType(
                      e.target.value as
                        | "deliverable"
                        | "research"
                        | "protocol"
                        | "analysis"
                        | "draft"
                    )
                  }
                  className="rounded-md border border-gray-300 px-2 py-2 text-sm"
                >
                  <option value="draft">draft</option>
                  <option value="deliverable">deliverable</option>
                  <option value="research">research</option>
                  <option value="protocol">protocol</option>
                  <option value="analysis">analysis</option>
                </select>
                <span className="text-xs text-gray-500">attached to this task</span>
              </div>
              <textarea
                value={docContent}
                onChange={(e) => setDocContent(e.target.value)}
                placeholder="Doc content…"
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                rows={6}
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onCreateDoc}
                  className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                >
                  Create document
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
