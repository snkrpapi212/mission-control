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
        });

        // Success feedback
        toast.success(successMessage);
      } catch (error) {
        // Error feedback
        toast.error(errorMessage);
        console.error("Task mutation failed:", error);
      }
    },
    [updateTask, toast]
  );

  const updateTaskField = useCallback(
    async (
      taskId: string,
      updates: Partial<Doc<"tasks">>,
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
          id: taskId,
          ...updates,
        });

        toast.success(successMessage);
      } catch (error) {
        toast.error(errorMessage);
        console.error("Update failed:", error);
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
