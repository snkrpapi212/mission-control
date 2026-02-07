"use client";

import { useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import type { TaskStatus } from "@/types";

export function useAgentsLive() {
  return useQuery(api.agents.getAll, {});
}

export function useTasksLive() {
  return useQuery(api.tasks.getAll, {});
}

export function useActivitiesLive(limit = 20) {
  return useQuery(api.activities.getRecent, { limit });
}

export function useTasksByStatusLive(): Record<TaskStatus, Doc<"tasks">[]> {
  const tasksQuery = useTasksLive();
  return useMemo(() => {
    const tasks = tasksQuery || [];
    const map: Record<TaskStatus, Doc<"tasks">[]> = {
      inbox: [],
      assigned: [],
      in_progress: [],
      review: [],
      done: [],
      blocked: [],
    };
    for (const t of tasks) {
      const s = t.status as TaskStatus;
      if (!map[s]) continue;
      map[s].push(t);
    }
    // Sort newest first for a nicer UI
    for (const k of Object.keys(map) as TaskStatus[]) {
      map[k].sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
    }
    return map;
  }, [tasksQuery]);
}

export function useMessagesByTask(taskId: Id<"tasks"> | null) {
  return useQuery(api.messages.getByTask, taskId ? { taskId } : "skip");
}

export function useDocumentsByTask(taskId: Id<"tasks"> | null) {
  return useQuery(api.documents.getByTask, taskId ? { taskId } : "skip");
}

export function useTaskMutations() {
  const updateTask = useMutation(api.tasks.update);
  const createMessage = useMutation(api.messages.create);
  const createDocument = useMutation(api.documents.create);

  return { updateTask, createMessage, createDocument };
}
