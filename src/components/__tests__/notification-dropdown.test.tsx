import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { NotificationDropdown, type Notification } from "../NotificationDropdown";

vi.mock("@/context/DarkModeContext", () => ({
  useDarkMode: () => ({
    isDarkMode: false,
    toggleDarkMode: vi.fn(),
  }),
}));

describe("NotificationDropdown", () => {
  const mockNotifications: Notification[] = [
    {
      _id: "notif-1",
      title: "Task Assigned",
      message: "New task assigned to you",
      type: "info",
      isRead: false,
      createdAt: Date.now() - 5 * 60 * 1000,
      agentId: "agent-1",
    },
    {
      _id: "notif-2",
      title: "Task Completed",
      message: "A task was completed",
      type: "success",
      isRead: true,
      createdAt: Date.now() - 10 * 60 * 1000,
      agentId: "agent-2",
    },
  ];

  it("renders notification content when open", () => {
    const html = renderToStaticMarkup(
      <NotificationDropdown notifications={mockNotifications} isOpen={true} onClose={vi.fn()} />
    );

    expect(html).toContain("Notifications");
    expect(html).toContain("1 unread");
    expect(html).toContain("Task Assigned");
    expect(html).toContain("Task Completed");
  });

  it("renders empty state", () => {
    const html = renderToStaticMarkup(
      <NotificationDropdown notifications={[]} isOpen={true} onClose={vi.fn()} />
    );
    expect(html).toContain("No notifications yet");
  });

  it("does not render when closed", () => {
    const html = renderToStaticMarkup(
      <NotificationDropdown notifications={mockNotifications} isOpen={false} onClose={vi.fn()} />
    );
    expect(html).toBe("");
  });
});
