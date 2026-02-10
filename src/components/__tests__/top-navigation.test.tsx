import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TopNavigation } from "../TopNavigation";
import type { Doc } from "../../../convex/_generated/dataModel";

describe("TopNavigation", () => {
  const mockTasks = [
    {
      _id: "task-1",
      title: "Important Task",
      description: "This is important",
      status: "in_progress" as const,
      priority: "high" as const,
      tags: ["urgent"],
      assignedTo: "agent-1",
      updatedAt: Date.now(),
    },
  ] as Doc<"tasks">[];

  it("renders navigation title", () => {
    render(
      <TopNavigation
        isDarkMode={false}
        onDarkModeToggle={vi.fn()}
        allTasks={mockTasks}
        unreadNotificationCount={0}
        onNotificationBellClick={vi.fn()}
        isConnected={true}
        onMenuClick={vi.fn()}
      />
    );

    expect(screen.getByText("🎯 Mission Control")).toBeTruthy();
  });

  it("shows connection status when connected", () => {
    render(
      <TopNavigation
        isDarkMode={false}
        onDarkModeToggle={vi.fn()}
        allTasks={mockTasks}
        unreadNotificationCount={0}
        onNotificationBellClick={vi.fn()}
        isConnected={true}
        onMenuClick={vi.fn()}
      />
    );

    expect(screen.getByText("Connected")).toBeTruthy();
  });

  it("shows offline status when disconnected", () => {
    render(
      <TopNavigation
        isDarkMode={false}
        onDarkModeToggle={vi.fn()}
        allTasks={mockTasks}
        unreadNotificationCount={0}
        onNotificationBellClick={vi.fn()}
        isConnected={false}
        onMenuClick={vi.fn()}
      />
    );

    expect(screen.getByText("Offline")).toBeTruthy();
  });

  it("displays unread notification badge", () => {
    render(
      <TopNavigation
        isDarkMode={false}
        onDarkModeToggle={vi.fn()}
        allTasks={mockTasks}
        unreadNotificationCount={3}
        onNotificationBellClick={vi.fn()}
        isConnected={true}
        onMenuClick={vi.fn()}
      />
    );

    expect(screen.getByText("3")).toBeTruthy();
  });

  it("shows 9+ badge for high unread count", () => {
    render(
      <TopNavigation
        isDarkMode={false}
        onDarkModeToggle={vi.fn()}
        allTasks={mockTasks}
        unreadNotificationCount={15}
        onNotificationBellClick={vi.fn()}
        isConnected={true}
        onMenuClick={vi.fn()}
      />
    );

    expect(screen.getByText("9+")).toBeTruthy();
  });

  it("calls toggleDarkMode when button clicked", async () => {
    const mockToggle = vi.fn();
    render(
      <TopNavigation
        isDarkMode={false}
        onDarkModeToggle={mockToggle}
        allTasks={mockTasks}
        unreadNotificationCount={0}
        onNotificationBellClick={vi.fn()}
        isConnected={true}
        onMenuClick={vi.fn()}
      />
    );

    const darkModeButton = screen.getByRole("button", { name: /toggle dark mode/i });
    await userEvent.click(darkModeButton);

    expect(mockToggle).toHaveBeenCalledOnce();
  });

  it("calls onNotificationBellClick when bell clicked", async () => {
    const mockClick = vi.fn();
    render(
      <TopNavigation
        isDarkMode={false}
        onDarkModeToggle={vi.fn()}
        allTasks={mockTasks}
        unreadNotificationCount={0}
        onNotificationBellClick={mockClick}
        isConnected={true}
        onMenuClick={vi.fn()}
      />
    );

    const bellButton = screen.getByRole("button", { name: /notifications/i });
    await userEvent.click(bellButton);

    expect(mockClick).toHaveBeenCalledOnce();
  });

  it("calls onMenuClick when menu button clicked", async () => {
    const mockMenuClick = vi.fn();
    render(
      <TopNavigation
        isDarkMode={false}
        onDarkModeToggle={vi.fn()}
        allTasks={mockTasks}
        unreadNotificationCount={0}
        onNotificationBellClick={vi.fn()}
        isConnected={true}
        onMenuClick={mockMenuClick}
      />
    );

    const menuButton = screen.getByRole("button", { name: /toggle menu/i });
    await userEvent.click(menuButton);

    expect(mockMenuClick).toHaveBeenCalledOnce();
  });

  it("renders search button by default", () => {
    render(
      <TopNavigation
        isDarkMode={false}
        onDarkModeToggle={vi.fn()}
        allTasks={mockTasks}
        unreadNotificationCount={0}
        onNotificationBellClick={vi.fn()}
        isConnected={true}
        onMenuClick={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: /search/i })).toBeTruthy();
  });
});
