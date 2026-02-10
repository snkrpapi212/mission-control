import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { TopNavigation } from "../TopNavigation";

const now = Date.now();

const mockTasks = [
  {
    _id: "task-1",
    _creationTime: now,
    title: "Important Task",
    description: "This is important",
    status: "in_progress",
    priority: "high",
    tags: ["urgent"],
    assigneeIds: ["agent-1"],
    subscriberIds: [],
    createdBy: "agent-1",
    createdAt: now,
    updatedAt: now,
  },
] as unknown as Parameters<typeof TopNavigation>[0]["allTasks"];

describe("TopNavigation", () => {
  it("renders title and connected state", () => {
    const html = renderToStaticMarkup(
      <TopNavigation
        isDarkMode={false}
        onDarkModeToggle={() => {}}
        allTasks={mockTasks}
        unreadNotificationCount={3}
        onNotificationBellClick={() => {}}
        isConnected={true}
        onMenuClick={() => {}}
      />
    );

    expect(html).toContain("🎯 Mission Control");
    expect(html).toContain("Connected");
    expect(html).toContain("3");
  });

  it("renders offline state and 9+ badge", () => {
    const html = renderToStaticMarkup(
      <TopNavigation
        isDarkMode={false}
        onDarkModeToggle={() => {}}
        allTasks={mockTasks}
        unreadNotificationCount={15}
        onNotificationBellClick={() => {}}
        isConnected={false}
        onMenuClick={() => {}}
      />
    );

    expect(html).toContain("Offline");
    expect(html).toContain("9+");
  });
});
