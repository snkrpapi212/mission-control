import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { DashboardShell } from "@/components/DashboardShell";

vi.mock("@/hooks/useConvexData", () => {
  return {
    useAgentsLive: () => [
      {
        _id: "agent_1",
        agentId: "main",
        name: "Jarvis",
        role: "Squad Lead",
        level: "lead",
        status: "working",
        sessionKey: "agent:main:main",
        lastHeartbeat: Date.now(),
        emoji: "🤖",
      },
    ],
    useTasksByStatusLive: () => ({
      inbox: [
        {
          _id: "task_1",
          title: "Define Phase 4 dashboard MVP",
          description: "Test",
          status: "inbox",
          priority: "high",
          assigneeIds: [],
          subscriberIds: [],
          createdBy: "main",
          tags: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
      assigned: [],
      in_progress: [],
      review: [],
      done: [],
      blocked: [],
    }),
    useActivitiesLive: () => [],
  };
});

describe("DashboardShell", () => {
  it("renders key dashboard sections (static render)", () => {
    const html = renderToStaticMarkup(<DashboardShell />);

    expect(html).toContain("MISSION CONTROL");
    expect(html).toContain("Agents");
    expect(html).toContain("Mission Queue");
    expect(html).toContain("Live Feed");
  });

  it("renders at least one task title", () => {
    const html = renderToStaticMarkup(<DashboardShell />);
    expect(html).toContain("Define Phase 4 dashboard MVP");
  });
});
