"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Doc } from "../../convex/_generated/dataModel";
import { useDocumentsByTask, useTaskMutations } from "@/hooks/useConvexData";

interface TaskDocumentsProps {
  task: Doc<"tasks">;
}

const TYPE_MAP: Record<string, string> = {
  deliverable: "Deliverable",
  research: "Research",
  protocol: "Protocol",
  analysis: "Analysis",
  draft: "Draft",
};

export function TaskDocuments({ task }: TaskDocumentsProps) {
  const docsQuery = useDocumentsByTask(task._id);
  const docs = docsQuery ?? [];
  const { createDocument } = useTaskMutations();

  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const activeDoc = useMemo(
    () => (docsQuery ?? []).find((d) => d._id === activeDocId) ?? null,
    [docsQuery, activeDocId]
  );

  const handleCreateQuickDoc = async () => {
    if (creating) return;
    setCreating(true);
    try {
      const now = new Date().toLocaleString();
      const title = `Task Note - ${now}`;
      const content = `# ${task.title}\n\nQuick note created at ${now}.\n\n- Status: ${task.status}\n- Priority: ${task.priority}`;

      const id = await createDocument({
        title,
        content,
        type: "draft",
        taskId: task._id,
        createdBy: task.createdBy,
      });

      setActiveDocId(id);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      {/* Documents List */}
      {docs.length > 0 ? (
        <div className="space-y-3">
          {docs.map((doc, idx) => (
            <motion.div
              key={doc._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.2 }}
              className="group rounded border border-[var(--mc-line)] bg-[var(--mc-card)] p-4 transition-colors hover:bg-[var(--mc-panel-soft)]"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-[16px]">📄</span>
                    <h3 className="truncate text-[14px] font-semibold text-[var(--mc-text)]">
                      {doc.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 text-[12px] text-[var(--mc-text-soft)]">
                    <span className="rounded bg-[var(--mc-line)] px-2 py-0.5 font-semibold uppercase tracking-[0.05em]">
                      {TYPE_MAP[doc.type] ?? doc.type}
                    </span>
                    <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="ml-4 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => setActiveDocId(doc._id)}
                    className="rounded p-1.5 text-[15px] hover:bg-[var(--mc-line)]"
                    title="View document"
                    aria-label={`View document ${doc.title}`}
                  >
                    👁️
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-[14px] text-[var(--mc-text-soft)]">
          <div className="mb-2 text-[28px]">📭</div>
          <p>No documents yet.</p>
          <p className="mt-1 text-[12px]">Create one to attach notes or specs to this task.</p>
        </div>
      )}

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleCreateQuickDoc}
        disabled={creating}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded border-2 border-dashed border-[var(--mc-line)] bg-transparent py-3 text-[14px] font-semibold text-[var(--mc-text)] transition-colors hover:bg-[var(--mc-panel-soft)] disabled:opacity-60"
      >
        <span className="text-[16px]">➕</span>
        {creating ? "Creating..." : "Add Document"}
      </motion.button>

      {/* Document Viewer */}
      <AnimatePresence>
        {activeDoc && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setActiveDocId(null)}
          >
            <motion.div
              initial={{ scale: 0.98 }}
              animate={{ scale: 1 }}
              className="max-h-[82vh] w-full max-w-3xl overflow-hidden rounded-[var(--r-card)] border border-[var(--mc-line)] bg-[var(--mc-panel)] shadow-[var(--sh-modal)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[var(--mc-line)] px-5 py-4">
                <div className="min-w-0">
                  <h3 className="truncate text-[16px] font-semibold text-[var(--mc-text)]">{activeDoc.title}</h3>
                  <p className="mt-1 text-[12px] text-[var(--mc-text-soft)]">
                    {TYPE_MAP[activeDoc.type] ?? activeDoc.type} • Updated {new Date(activeDoc.updatedAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setActiveDocId(null)}
                  className="rounded p-2 text-[var(--mc-text-soft)] hover:bg-[var(--mc-line)]"
                  aria-label="Close document"
                >
                  ✕
                </button>
              </div>

              <div className="max-h-[65vh] overflow-y-auto px-5 py-4">
                <pre className="whitespace-pre-wrap text-[13px] leading-6 text-[var(--mc-text)]">{activeDoc.content}</pre>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
