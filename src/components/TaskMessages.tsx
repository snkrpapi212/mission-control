"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import type { Doc } from "../../convex/_generated/dataModel";

interface TaskMessagesProps {
  task: Doc<"tasks">;
  agents: Doc<"agents">[];
}

interface Message {
  id: string;
  author: string;
  authorId: string;
  content: string;
  timestamp: number;
  attachments?: string[];
}

// Mock messages for now - would be fetched from Convex in production
const MOCK_MESSAGES: Message[] = [
  {
    id: "msg1",
    author: "Jarvis",
    authorId: "main",
    content: "Started working on this task. Will have an update tomorrow.",
    timestamp: Date.now() - 3600000,
    attachments: [],
  },
  {
    id: "msg2",
    author: "Friday",
    authorId: "developer",
    content: "**Bold update:** I've completed the foundation work. Ready for review when you are.",
    timestamp: Date.now() - 1800000,
    attachments: ["design-spec.pdf"],
  },
];

export function TaskMessages({ task: _task, agents }: TaskMessagesProps) {
  const [newMessage, setNewMessage] = useState("");
  const [mentionSearch, setMentionSearch] = useState("");
  const [showMentions, setShowMentions] = useState(false);

  const byAgentId = useMemo(() => {
    const map = new Map<string, Doc<"agents">>();
    agents.forEach((a) => map.set(a.agentId, a));
    return map;
  }, [agents]);

  const filteredMentions = useMemo(() => {
    if (!mentionSearch) return agents;
    return agents.filter((a) =>
      a.name.toLowerCase().includes(mentionSearch.toLowerCase())
    );
  }, [mentionSearch, agents]);

  const handleMentionSelect = (agentName: string) => {
    const lastAtIndex = newMessage.lastIndexOf("@");
    const beforeAt = newMessage.slice(0, lastAtIndex);
    const afterMention = newMessage.slice(lastAtIndex + mentionSearch.length + 1);
    setNewMessage(`${beforeAt}@${agentName} ${afterMention}`);
    setShowMentions(false);
    setMentionSearch("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Cmd+Enter or Ctrl+Enter to submit
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      // TODO: submit message
      setNewMessage("");
    }

    // @ mention trigger
    if (e.key === "@") {
      setShowMentions(true);
    }
  };

  const handleInputChange = (value: string) => {
    setNewMessage(value);

    // Handle mention search
    const atIndex = value.lastIndexOf("@");
    if (atIndex !== -1) {
      const afterAt = value.slice(atIndex + 1);
      if (!afterAt.includes(" ")) {
        setMentionSearch(afterAt);
        setShowMentions(true);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {MOCK_MESSAGES.map((msg, idx) => {
          const author = byAgentId.get(msg.authorId);
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.2 }}
              className="rounded-[var(--r-card)] border border-[var(--mc-line)] bg-[var(--mc-card)] p-4"
            >
              {/* Message Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {author && <span className="text-[18px]">{author.emoji}</span>}
                  <span className="font-semibold text-[14px] text-[var(--mc-text)]">
                    {msg.author}
                  </span>
                </div>
                <span className="text-[12px] text-[var(--mc-text-soft)]">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>

              {/* Message Content (Markdown) */}
              <div className="prose prose-sm max-w-none text-[14px] text-[var(--mc-text)]">
                <ReactMarkdown
                  components={{
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
                    p: ({ _node, ...props }: any) => (
                      <p className="my-0 text-[var(--mc-text)]" {...props} />
                    ),
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
                    strong: ({ _node, ...props }: any) => (
                      <strong className="font-bold text-[var(--mc-text)]" {...props} />
                    ),
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
                    em: ({ _node, ...props }: any) => (
                      <em className="italic text-[var(--mc-text)]" {...props} />
                    ),
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
                    code: ({ _node, inline, ...props }: any) =>
                      inline ? (
                        <code
                          className="bg-[var(--mc-line)] px-2 py-0.5 rounded text-[13px] font-mono text-[var(--mc-text-soft)]"
                          {...props}
                        />
                      ) : (
                        <code
                          className="block bg-[var(--mc-line)] p-3 rounded text-[13px] font-mono text-[var(--mc-text-soft)] overflow-x-auto"
                          {...props}
                        />
                      ),
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
                    a: ({ _node, ...props }: any) => (
                      <a
                        className="text-[var(--mc-accent-green)] hover:underline"
                        {...props}
                      />
                    ),
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
                    ul: ({ _node, ...props }: any) => (
                      <ul className="list-disc list-inside my-2" {...props} />
                    ),
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
                    li: ({ _node, ...props }: any) => (
                      <li className="my-0.5" {...props} />
                    ),
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>

              {/* Attachments */}
              {msg.attachments && msg.attachments.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {msg.attachments.map((file) => (
                    <div
                      key={file}
                      className="px-2 py-1 rounded bg-[var(--mc-panel-soft)] text-[12px] text-[var(--mc-text-soft)] flex items-center gap-1"
                    >
                      📎 {file}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* New Message Input */}
      <div className="border-t border-[var(--mc-line)] bg-[var(--mc-panel)] p-4 space-y-3">
        {/* Message Input */}
        <div className="relative">
          <textarea
            value={newMessage}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a comment... (@mention available)"
            className="w-full min-h-[80px] rounded border border-[var(--mc-line)] bg-[var(--mc-card)] px-4 py-3 text-[14px] text-[var(--mc-text)] placeholder:text-[var(--mc-text-soft)] outline-none focus:border-[var(--mc-accent-green)] resize-none"
          />

          {/* @mention Autocomplete */}
          {showMentions && mentionSearch && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute bottom-full left-0 right-0 mb-2 border border-[var(--mc-line)] rounded bg-[var(--mc-panel)] shadow-lg max-h-[200px] overflow-y-auto"
            >
              {filteredMentions.map((agent) => (
                <button
                  key={agent._id}
                  onClick={() => handleMentionSelect(agent.name)}
                  className="w-full px-4 py-2 text-left text-[13px] text-[var(--mc-text)] hover:bg-[var(--mc-panel-soft)] transition-colors flex items-center gap-2"
                >
                  <span className="text-[16px]">{agent.emoji}</span>
                  <span>{agent.name}</span>
                  <span className="text-[12px] text-[var(--mc-text-soft)]">
                    {agent.role}
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded hover:bg-[var(--mc-panel-soft)] transition-colors text-[18px]"
              title="Add emoji"
            >
              😊
            </button>
            <button
              className="p-2 rounded hover:bg-[var(--mc-panel-soft)] transition-colors text-[18px]"
              title="Attach file"
            >
              📎
            </button>
          </div>
          <button
            onClick={() => {
              // TODO: submit message
              setNewMessage("");
            }}
            disabled={!newMessage.trim()}
            className="px-4 py-2 rounded bg-[var(--mc-accent-green)] text-white text-[13px] font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            Send (⌘↵)
          </button>
        </div>
      </div>
    </div>
  );
}
