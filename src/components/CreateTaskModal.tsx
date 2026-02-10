"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Agent } from "@/types";
import { useCreateTask } from "@/hooks/useConvexData";

interface FormErrors {
  title?: string;
  description?: string;
  assignees?: string;
}

interface FormTouched {
  title?: boolean;
  description?: boolean;
}

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
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const validateField = useCallback((field: keyof FormErrors, value: string): string | undefined => {
    switch (field) {
      case "title":
        if (!value.trim()) return "Title is required";
        if (value.trim().length < 3) return "Title must be at least 3 characters";
        if (value.trim().length > 200) return "Title must be less than 200 characters";
        return undefined;
      case "description":
        if (value.length > 2000) return "Description must be less than 2000 characters";
        return undefined;
      default:
        return undefined;
    }
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    const titleError = validateField("title", title);
    if (titleError) newErrors.title = titleError;
    
    const descError = validateField("description", description);
    if (descError) newErrors.description = descError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [title, description, validateField]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTitle(value);
    if (touched.title) {
      setErrors(prev => ({ ...prev, title: validateField("title", value) }));
    }
    setSubmitError("");
  };

  const handleTitleBlur = () => {
    setTouched(prev => ({ ...prev, title: true }));
    setErrors(prev => ({ ...prev, title: validateField("title", title) }));
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDescription(value);
    if (touched.description) {
      setErrors(prev => ({ ...prev, description: validateField("description", value) }));
    }
  };

  const handleDescriptionBlur = () => {
    setTouched(prev => ({ ...prev, description: true }));
    setErrors(prev => ({ ...prev, description: validateField("description", description) }));
  };

  const toggleAgent = (agentId: string) => {
    setSelectedAgentIds((prev) =>
      prev.includes(agentId)
        ? prev.filter((id) => id !== agentId)
        : [...prev, agentId]
    );
  };

  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed) && tags.length < 10) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
    if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({ title: true, description: true });
    
    if (!validateForm()) {
      // Focus first error field
      const firstErrorField = document.querySelector('[aria-invalid="true"]') as HTMLElement;
      firstErrorField?.focus();
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

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
      setSubmitError(error instanceof Error ? error.message : "Failed to create task. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && !isSubmitting) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-task-title"
    >
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.14 }}
        className="absolute inset-0 bg-black/40" 
        aria-hidden="true"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.16, ease: [0.25, 0.1, 0.25, 1] }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg"
      >
        <div className="bg-[var(--mc-panel)] rounded-xl shadow-xl border border-[var(--mc-line)] overflow-hidden max-h-[90vh] flex flex-col">
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--mc-line)] bg-[var(--mc-panel-soft)] flex-shrink-0">
              <h2 
                id="create-task-title" 
                className="text-[16px] font-semibold text-[var(--mc-text)]"
              >
                Create New Task
              </h2>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="p-2 rounded-lg text-[var(--mc-text-muted)] hover:bg-[var(--mc-line)] hover:text-[var(--mc-text)] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--mc-green)] focus:ring-offset-1"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Error Banner */}
            <AnimatePresence>
              {submitError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-[var(--mc-red-soft)] border-b border-[var(--mc-red)] px-6 py-3 flex-shrink-0"
                  role="alert"
                >
                  <p className="text-[13px] text-[var(--mc-red)] flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {submitError}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form Content */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Title Field */}
              <div>
                <label htmlFor="task-title" className="mc-label">
                  Title <span className="text-[var(--mc-red)]">*</span>
                </label>
                <input
                  id="task-title"
                  type="text"
                  value={title}
                  onChange={handleTitleChange}
                  onBlur={handleTitleBlur}
                  placeholder="Enter a clear, descriptive title"
                  className={`mc-input ${errors.title && touched.title ? 'mc-error' : ''}`}
                  disabled={isSubmitting}
                  aria-invalid={errors.title && touched.title ? "true" : "false"}
                  aria-describedby={errors.title && touched.title ? "title-error" : "title-help"}
                  autoFocus
                />
                <div className="flex justify-between mt-1">
                  <AnimatePresence mode="wait">
                    {errors.title && touched.title ? (
                      <motion.p
                        key="error"
                        id="title-error"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="mc-error-text"
                        role="alert"
                      >
                        <span aria-hidden="true">⚠</span> {errors.title}
                      </motion.p>
                    ) : (
                      <motion.p
                        key="help"
                        id="title-help"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mc-help-text"
                      >
                        A clear title helps everyone understand the task
                      </motion.p>
                    )}
                  </AnimatePresence>
                  <span className={`text-[11px] ${title.length > 180 ? 'text-[var(--mc-amber)]' : 'text-[var(--mc-text-soft)]'}`}>
                    {title.length}/200
                  </span>
                </div>
              </div>

              {/* Description Field */}
              <div>
                <label htmlFor="task-description" className="mc-label">
                  Description
                </label>
                <textarea
                  id="task-description"
                  value={description}
                  onChange={handleDescriptionChange}
                  onBlur={handleDescriptionBlur}
                  placeholder="Enter task description (optional)"
                  rows={4}
                  className={`mc-input resize-none ${errors.description && touched.description ? 'mc-error' : ''}`}
                  disabled={isSubmitting}
                  aria-invalid={errors.description && touched.description ? "true" : "false"}
                  aria-describedby={errors.description && touched.description ? "desc-error" : undefined}
                />
                <div className="flex justify-between mt-1">
                  <AnimatePresence>
                    {errors.description && touched.description && (
                      <motion.p
                        id="desc-error"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="mc-error-text"
                        role="alert"
                      >
                        <span aria-hidden="true">⚠</span> {errors.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                  <span className={`text-[11px] ml-auto ${description.length > 1800 ? 'text-[var(--mc-amber)]' : 'text-[var(--mc-text-soft)]'}`}>
                    {description.length}/2000
                  </span>
                </div>
              </div>

              {/* Priority & Created By */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="task-priority" className="mc-label">
                    Priority
                  </label>
                  <select
                    id="task-priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high" | "urgent")}
                    className="mc-input mc-select"
                    disabled={isSubmitting}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="task-creator" className="mc-label">
                    Created by
                  </label>
                  <select
                    id="task-creator"
                    value={createdBy}
                    onChange={(e) => setCreatedBy(e.target.value)}
                    className="mc-input mc-select"
                    disabled={isSubmitting}
                  >
                    {agents.map((a) => (
                      <option key={a._id} value={a.agentId}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Assignees */}
              <div>
                <label className="mc-label">
                  Assignees
                  <span className="ml-2 text-[var(--mc-text-soft)] font-normal normal-case tracking-normal">
                    ({selectedAgentIds.length} selected)
                  </span>
                </label>
                <div className="rounded-lg border border-[var(--mc-line)] bg-[var(--mc-card)] p-3 max-h-40 overflow-y-auto">
                  {agents.length === 0 ? (
                    <p className="text-[13px] text-[var(--mc-text-soft)] py-2">No agents available</p>
                  ) : (
                    <div className="space-y-1">
                      {agents.map((agent) => (
                        <label
                          key={agent._id}
                          className="flex items-center gap-3 cursor-pointer hover:bg-[var(--mc-panel-soft)] px-2 py-1.5 rounded-md transition-colors duration-120"
                        >
                          <input
                            type="checkbox"
                            checked={selectedAgentIds.includes(agent.agentId)}
                            onChange={() => toggleAgent(agent.agentId)}
                            disabled={isSubmitting}
                            className="mc-checkbox"
                          />
                          <span className="text-[16px]" aria-hidden="true">{agent.emoji}</span>
                          <span className="text-[13px] text-[var(--mc-text)]">
                            {agent.name}
                          </span>
                          <span className="text-[11px] text-[var(--mc-text-soft)] ml-auto">
                            {agent.agentId}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tag-input" className="mc-label">
                  Tags
                  <span className="ml-2 text-[var(--mc-text-soft)] font-normal normal-case tracking-normal">
                    ({tags.length}/10)
                  </span>
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    id="tag-input"
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value.slice(0, 20))}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Add a tag and press Enter"
                    disabled={isSubmitting || tags.length >= 10}
                    className="mc-input flex-1"
                    aria-describedby="tag-help"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    disabled={!tagInput.trim() || isSubmitting || tags.length >= 10}
                    className="mc-btn"
                  >
                    Add
                  </button>
                </div>
                <p id="tag-help" className="mc-help-text">
                  Press Enter to add. Tags help organize and filter tasks.
                </p>
                
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 bg-[var(--mc-panel-soft)] border border-[var(--mc-line)] rounded-lg px-2.5 py-1 text-[12px] text-[var(--mc-text)]"
                      >
                        <span className="text-[var(--mc-text-muted)]">#</span>
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          disabled={isSubmitting}
                          className="ml-1 text-[var(--mc-text-muted)] hover:text-[var(--mc-red)] transition-colors duration-120 p-0.5 rounded focus:outline-none focus:ring-2 focus:ring-[var(--mc-red)]"
                          aria-label={`Remove tag ${tag}`}
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[var(--mc-line)] bg-[var(--mc-panel-soft)] flex justify-end gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="mc-btn mc-btn-ghost"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || (!!errors.title && touched.title)}
                className="mc-btn mc-btn-primary min-w-[100px]"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating...
                  </span>
                ) : "Create Task"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
