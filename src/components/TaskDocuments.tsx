"use client";

import { motion } from "framer-motion";
import type { Doc } from "../../convex/_generated/dataModel";

interface TaskDocumentsProps {
  // eslint-disable-next-line no-unused-vars
  task: Doc<"tasks">;
}

interface Document {
  id: string;
  title: string;
  type: string;
  size: string;
  createdAt: number;
}

// Mock documents for now
const MOCK_DOCUMENTS: Document[] = [
  {
    id: "doc1",
    title: "Design Specification v1",
    type: "PDF",
    size: "2.4 MB",
    createdAt: Date.now() - 86400000,
  },
  {
    id: "doc2",
    title: "Technical Architecture",
    type: "Google Docs",
    size: "—",
    createdAt: Date.now() - 172800000,
  },
];

// eslint-disable-next-line no-unused-vars
export function TaskDocuments({ task }: TaskDocumentsProps) {
  return (
    <div className="p-6 space-y-4">
      {/* Documents List */}
      {MOCK_DOCUMENTS.length > 0 ? (
        <div className="space-y-3">
          {MOCK_DOCUMENTS.map((doc, idx) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.2 }}
              className="p-4 rounded border border-[var(--mc-line)] bg-[var(--mc-card)] hover:bg-[var(--mc-panel-soft)] transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[18px]">📄</span>
                    <h3 className="text-[14px] font-semibold text-[var(--mc-text)] truncate">
                      {doc.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 text-[12px] text-[var(--mc-text-soft)]">
                    <span className="px-2 py-0.5 rounded bg-[var(--mc-line)] uppercase tracking-[0.05em] font-semibold">
                      {doc.type}
                    </span>
                    <span>{doc.size}</span>
                    <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 rounded hover:bg-[var(--mc-line)] text-[16px]">
                    👁️
                  </button>
                  <button className="p-1.5 rounded hover:bg-[var(--mc-red-soft)] text-[16px] hover:text-[var(--mc-red)]">
                    🗑️
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-[14px] text-[var(--mc-text-soft)]">
          <div className="text-[32px] mb-2">📭</div>
          <p>No documents yet.</p>
          <p className="text-[12px] mt-1">Click the button below to add one.</p>
        </div>
      )}

      {/* Add Document Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-6 py-3 rounded border-2 border-dashed border-[var(--mc-line)] bg-transparent hover:bg-[var(--mc-panel-soft)] transition-colors text-[14px] font-semibold text-[var(--mc-text)] flex items-center justify-center gap-2"
      >
        <span className="text-[18px]">➕</span>
        Add Document
      </motion.button>
    </div>
  );
}
