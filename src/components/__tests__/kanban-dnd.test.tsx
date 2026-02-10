import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { KanbanBoard } from "../KanbanBoard";

vi.mock("@/context/DarkModeContext", () => ({
  useDarkMode: () => ({
    isDarkMode: false,
    toggleDarkMode: vi.fn(),
  }),
}));

type TestTask = {
  _id: string;
  _creationTime: number;
  title: string;
  description: string;
  status: "inbox" | "assigned" | "in_progress" | "review" | "done" | "blocked";
  priority: "low" | "medium" | "high" | "urgent";
  assigneeIds: string[];
  subscriberIds: string[];
  createdBy: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
};

const now = Date.now();

const baseTask: TestTask = {
  _id: "task-1",
  _creationTime: now,
  title: "Task 1",
  description: "Test task",
  status: "inbox",
  priority: "medium",
  assigneeIds: ["agent-1"],
  subscriberIds: [],
  createdBy: "agent-1",
  tags: ["test"],
  createdAt: now,
  updatedAt: now,
};

const emptyAgents = [
  {
    _id: "agent-1",
    _creationTime: now,
    agentId: "agent-1",
    name: "Agent One",
    role: "Worker",
    level: "member",
    status: "working",
    sessionKey: "agent:1",
    lastHeartbeat: now,
    emoji: "🤖",
  },
] as unknown as Parameters<typeof KanbanBoard>[0]["agents"];

const buildTasks = (overrides?: Partial<TestTask>) => ({
  inbox: [{ ...baseTask, ...overrides }],
  assigned: [],
  in_progress: [],
  review: [],
  done: [],
  blocked: [],
}) as unknown as Parameters<typeof KanbanBoard>[0]["tasksByStatus"];

describe("KanbanBoard", () => {
  it("renders mission queue and column titles", () => {
    const html = renderToStaticMarkup(
      <KanbanBoard tasksByStatus={buildTasks()} agents={emptyAgents} onSelectTask={vi.fn()} />
    );

    expect(html).toContain("Mission Queue");
    expect(html).toContain("Inbox");
    expect(html).toContain("Assigned");
    expect(html).toContain("In Progress");
    expect(html).toContain("Review");
    expect(html).toContain("Done");
  });

  it("renders tasks and empty states", () => {
    const html = renderToStaticMarkup(
      <KanbanBoard tasksByStatus={buildTasks()} agents={emptyAgents} onSelectTask={vi.fn()} />
    );

    expect(html).toContain("Task 1");
    expect(html).toContain("No tasks");
  });

  it("renders assigned tasks in assigned column content", () => {
    const html = renderToStaticMarkup(
      <KanbanBoard
        tasksByStatus={buildTasks({ _id: "task-2", title: "Task 2", status: "assigned" })}
        agents={emptyAgents}
        onSelectTask={vi.fn()}
      />
    );

    expect(html).toContain("Task 2");
  });
});
