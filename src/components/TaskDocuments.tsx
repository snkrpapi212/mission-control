"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Doc } from "../../convex/_generated/dataModel";
import { useDocumentsByTask, useTaskMutations } from "@/hooks/useConvexData";
import { FileText, X, Eye, Plus, FileCode, FileType, ScrollText } from "lucide-react";

interface TaskDocumentsProps {
  task: Doc<"tasks">;
}

const TYPE_MAP: Record<string, { label: string; icon: React.ReactNode }> = {
  deliverable: { label: "Deliverable", icon: <FileText size={14} /> },
  research: { label: "Research", icon: <ScrollText size={14} /> },
  protocol: { label: "Protocol", icon: <FileCode size={14} /> },
  analysis: { label: "Analysis", icon: <FileType size={14} /> },
  draft: { label: "Draft", icon: <FileText size={14} /> },
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
        <div className="space-y-2">
          {docs.map((doc, idx) => (
            <motion.div
              key={doc._id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.06, duration: 0.2 }}
              className="group rounded-lg border border-[var(--mc-line)] bg-[var(--mc-card)] p-3.5 transition-colors hover:bg-[var(--mc-panel-soft)] hover:border-[var(--mc-line-strong)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="text-[var(--mc-text-muted)]">{TYPE_MAP[doc.type]?.icon || <FileText size={14} />}</span>
                    <h3 className="truncate text-[14px] font-medium text-[var(--mc-text)]">
                      {doc.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-[var(--mc-text-soft)]">
                    <span className="rounded-md bg-[var(--mc-line)] px-2 py-0.5 font-medium uppercase tracking-[0.05em]">
                      {TYPE_MAP[doc.type]?.label || doc.type}
                    </span>
                    <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveDocId(doc._id)}
                  className="shrink-0 rounded-md p-2 text-[var(--mc-text-muted)] hover:bg-[var(--mc-line)] hover:text-[var(--mc-text)] transition-colors"
                  title="View document"
                  aria-label={`View document ${doc.title}`}
                >
                  <Eye size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-10 px-6 text-center rounded-xl border border-dashed border-[var(--mc-line)] bg-[var(--mc-panel-soft)]/50"
        >
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-[var(--mc-line)] text-[var(--mc-text-muted)] mb-3">
            <FileText size={24} />
          </div>
          <h3 className="text-[15px] font-medium text-[var(--mc-text)] mb-1">No documents yet</h3>
          <p className="text-[13px] text-[var(--mc-text-soft)] leading-relaxed">
            Attach notes, specs, or research to keep everything organized.
          </p>
        </motion.div>
      )}

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleCreateQuickDoc}
        disabled={creating}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[var(--mc-line)] bg-transparent py-3 text-[14px] font-medium text-[var(--mc-text)] transition-colors hover:bg-[var(--mc-panel-soft)] hover:border-[var(--mc-line-strong)] disabled:opacity-60"
      >
        <Plus size={18} />
        {creating ? "Creating..." : "Add Document"}
      </motion.button>

      {/* Document Viewer Modal */}
      <AnimatePresence>
        {activeDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setActiveDocId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl border border-[var(--mc-line)] bg-[var(--mc-panel)] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-[var(--mc-line)] px-5 py-4 bg-[var(--mc-panel-soft)]">
                <div className="min-w-0 flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[var(--mc-text-muted)]">{TYPE_MAP[activeDoc.type]?.icon || <FileText size={16} />}</span>
                    <h3 className="truncate text-[17px] font-semibold text-[var(--mc-text)]">{activeDoc.title}</h3>
                  </div>
                  <p className="text-[12px] text-[var(--mc-text-soft)]">
                    {TYPE_MAP[activeDoc.type]?.label || activeDoc.type} · Updated {new Date(activeDoc.updatedAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setActiveDocId(null)}
                  className="shrink-0 rounded-lg p-2 text-[var(--mc-text-muted)] hover:bg-[var(--mc-line)] hover:text-[var(--mc-text)] transition-colors"
                  aria-label="Close document"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="max-h-[60vh] overflow-y-auto px-5 py-5 bg-[var(--mc-panel)]">
                <pre className="whitespace-pre-wrap text-[14px] leading-7 text-[var(--mc-text)] font-mono">{activeDoc.content}</pre>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
