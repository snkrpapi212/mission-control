"use client";

import { useMemo } from "react";
import type { Activity, Agent, Task, TaskStatus } from "@/types";
import { groupTasksByStatus, mockActivities, mockAgents, mockTasks } from "@/lib/mockData";

/**
 * Phase 4 UI is designed to work even when Convex isn't configured.
 *
 * If NEXT_PUBLIC_CONVEX_URL is set and convex/_generated exists,
 * we can swap these mocks for real useQuery() hooks.
 */
export function useAgents(): Agent[] {
  return mockAgents;
}

export function useTasks(): Task[] {
  return mockTasks;
}

export function useTasksByStatus(): Record<TaskStatus, Task[]> {
  const tasks = useTasks();
  return useMemo(() => groupTasksByStatus(tasks), [tasks]);
}

export function useRecentActivities(limit = 20): Activity[] {
  return useMemo(() => mockActivities.slice(0, limit), [limit]);
}
