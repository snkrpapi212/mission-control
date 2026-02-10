import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  it("renders when isOpen is true", () => {
    render(
      <NotificationDropdown
        notifications={mockNotifications}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText("Notifications")).toBeTruthy();
    expect(screen.getByText("1 unread")).toBeTruthy();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <NotificationDropdown
        notifications={mockNotifications}
        isOpen={false}
        onClose={vi.fn()}
      />
    );

    // Should return empty
    expect(container.innerHTML).toBe("");
  });

  it("displays all notifications", () => {
    render(
      <NotificationDropdown
        notifications={mockNotifications}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText("Task Assigned")).toBeTruthy();
    expect(screen.getByText("Task Completed")).toBeTruthy();
  });

  it("shows no notifications message when empty", () => {
    render(
      <NotificationDropdown
        notifications={[]}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText("No notifications yet")).toBeTruthy();
  });

  it("calls onMarkAsRead when notification clicked", async () => {
    const mockMarkAsRead = vi.fn();
    render(
      <NotificationDropdown
        notifications={mockNotifications}
        isOpen={true}
        onClose={vi.fn()}
        onMarkAsRead={mockMarkAsRead}
      />
    );

    const notification = screen.getByText("Task Assigned");
    await userEvent.click(notification.closest("li")!);

    expect(mockMarkAsRead).toHaveBeenCalledWith("notif-1");
  });

  it("calls onMarkAllAsRead when button clicked", async () => {
    const mockMarkAllAsRead = vi.fn();
    render(
      <NotificationDropdown
        notifications={mockNotifications}
        isOpen={true}
        onClose={vi.fn()}
        onMarkAllAsRead={mockMarkAllAsRead}
      />
    );

    const markAllButton = screen.getByRole("button", { name: /mark all as read/i });
    await userEvent.click(markAllButton);

    expect(mockMarkAllAsRead).toHaveBeenCalledOnce();
  });

  it("calls onClearAll when clear button clicked", async () => {
    const mockClearAll = vi.fn();
    render(
      <NotificationDropdown
        notifications={mockNotifications}
        isOpen={true}
        onClose={vi.fn()}
        onClearAll={mockClearAll}
      />
    );

    const clearButton = screen.getByRole("button", { name: /clear all notifications/i });
    await userEvent.click(clearButton);

    expect(mockClearAll).toHaveBeenCalledOnce();
  });

  it("hides mark all as read button when no unread notifications", () => {
    const allRead = mockNotifications.map((n) => ({ ...n, isRead: true }));
    render(
      <NotificationDropdown
        notifications={allRead}
        isOpen={true}
        onClose={vi.fn()}
        onMarkAllAsRead={vi.fn()}
      />
    );

    expect(screen.queryByRole("button", { name: /mark all as read/i })).toBeFalsy();
  });

  it("displays notification details correctly", () => {
    render(
      <NotificationDropdown
        notifications={mockNotifications}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText("New task assigned to you")).toBeTruthy();
    expect(screen.getByText(/by agent-1/)).toBeTruthy();
  });
});
