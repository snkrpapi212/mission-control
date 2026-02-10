"use client";

import { useMemo, useRef } from "react";
import { useConvexConnectionState, useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import type { TaskStatus } from "@/types";

function useStickyQuery<T>(value: T | undefined, fallback: T): T {
  const cache = useRef<T>(fallback);
  if (value !== undefined) {
    cache.current = value;
  }
  return value ?? cache.current;
}

export function useConnectionStateLive() {
  return useConvexConnectionState();
}

export function useAgentsLive() {
  const query = useQuery(api.agents.getAll, {});
  return useStickyQuery(query, [] as Doc<"agents">[]);
}

export function useTasksLive() {
  const query = useQuery(api.tasks.getAll, {});
  return useStickyQuery(query, [] as Doc<"tasks">[]);
}

export function useActivitiesLive(limit = 20) {
  const query = useQuery(api.activities.getRecent, { limit });
  return useStickyQuery(query, [] as Doc<"activities">[]);
}

export function useTasksByStatusLive(): Record<TaskStatus, Doc<"tasks">[]> {
  const tasks = useTasksLive();

  return useMemo(() => {
    const map: Record<TaskStatus, Doc<"tasks">[]> = {
      inbox: [],
      assigned: [],
      in_progress: [],
      review: [],
      done: [],
      blocked: [],
    };

    for (const task of tasks) {
      const status = task.status as TaskStatus;
      if (status in map) map[status].push(task);
    }

    for (const key of Object.keys(map) as TaskStatus[]) {
      map[key].sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
    }

    return map;
  }, [tasks]);
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

export function useCreateTask() {
  return useMutation(api.tasks.create);
}
