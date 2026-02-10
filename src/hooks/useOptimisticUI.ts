"use client";

import { useCallback } from "react";
import { useToast } from "@/components/Toast";
import { useTaskMutations } from "@/hooks/useConvexData";
import type { Doc } from "../../convex/_generated/dataModel";
import type { TaskStatus } from "@/types";

interface OptimisticUpdateOptions {
  optimisticUpdate?: () => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useOptimisticUI() {
  const toast = useToast();
  const { updateTask } = useTaskMutations();

  const moveTask = useCallback(
    async (
      task: Doc<"tasks">,
      newStatus: TaskStatus,
      options: OptimisticUpdateOptions = {}
    ) => {
      const {
        optimisticUpdate,
        successMessage = "Task updated ✓",
        errorMessage = "Failed to update task",
      } = options;

      try {
        // Optimistic update
        optimisticUpdate?.();

        // Perform mutation
        await updateTask({
          id: task._id,
          status: newStatus,
          agentId: task.createdBy,
        });

        // Success feedback
        toast.success(successMessage);
      } catch {
        // Error feedback
        toast.error(errorMessage);
        // eslint-disable-next-line no-console
        console.error("Task mutation failed");
      }
    },
    [updateTask, toast]
  );

  const updateTaskField = useCallback(
    async (
      taskId: string,
      updates: Partial<Doc<"tasks">>,
      agentId: string,
      options: OptimisticUpdateOptions = {}
    ) => {
      const {
        optimisticUpdate,
        successMessage = "Changes saved ✓",
        errorMessage = "Failed to save changes",
      } = options;

      try {
        optimisticUpdate?.();

        await updateTask({
          id: taskId as import("../../convex/_generated/dataModel").Id<"tasks">,
          agentId,
          ...updates,
        });

        toast.success(successMessage);
      } catch {
        toast.error(errorMessage);
        // eslint-disable-next-line no-console
        console.error("Update failed");
      }
    },
    [updateTask, toast]
  );

  return {
    moveTask,
    updateTaskField,
    showSuccess: (msg: string) => toast.success(msg),
    showError: (msg: string) => toast.error(msg),
    showInfo: (msg: string) => toast.info(msg),
  };
}
