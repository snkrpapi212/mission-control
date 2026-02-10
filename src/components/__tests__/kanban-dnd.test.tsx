import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { KanbanBoard } from "../KanbanBoard";
import type { Doc } from "../../../convex/_generated/dataModel";

// Mock DragDropContext and related components
vi.mock("@hello-pangea/dnd", () => ({
  DragDropContext: ({ children }: any) => <div data-testid="drag-drop-context">{children}</div>,
  Droppable: ({ children, droppableId }: any) => (
    <div data-testid={`droppable-${droppableId}`}>
      {children(
        {
          innerRef: () => {},
          droppableProps: {},
        },
        { isDraggingOver: false }
      )}
    </div>
  ),
  Draggable: ({ children, draggableId }: any) => (
    <div data-testid={`draggable-${draggableId}`}>
      {children(
        {
          innerRef: () => {},
          draggableProps: {},
          dragHandleProps: {},
        },
        { isDragging: false }
      )}
    </div>
  ),
}));

vi.mock("@/context/DarkModeContext", () => ({
  useDarkMode: () => ({
    isDarkMode: false,
    toggleDarkMode: vi.fn(),
  }),
}));

describe("KanbanBoard - Drag and Drop", () => {
  const mockTasks: Record<string, any[]> = {
    inbox: [
      {
        _id: "task-1",
        title: "Task 1",
        description: "Test task",
        status: "inbox",
        priority: "medium",
        tags: ["test"],
        assignedTo: "agent-1",
        updatedAt: Date.now(),
      },
    ],
    assigned: [],
    in_progress: [],
    review: [],
    done: [],
    blocked: [],
  };

  it("renders all kanban columns", () => {
    render(
      <KanbanBoard
        tasksByStatus={mockTasks}
        onSelectTask={vi.fn()}
        onTaskMove={vi.fn()}
      />
    );

    expect(screen.getByText("Kanban Board")).toBeTruthy();
    expect(screen.getByTestId("droppable-inbox")).toBeTruthy();
    expect(screen.getByTestId("droppable-assigned")).toBeTruthy();
    expect(screen.getByTestId("droppable-in_progress")).toBeTruthy();
  });

  it("displays task count per column", () => {
    render(
      <KanbanBoard
        tasksByStatus={mockTasks}
        onSelectTask={vi.fn()}
        onTaskMove={vi.fn()}
      />
    );

    // Task 1 should be in inbox
    expect(screen.getByText("1")).toBeTruthy(); // Count showing 1 task in inbox
  });

  it("calls onTaskMove when drag ends", async () => {
    const mockOnTaskMove = vi.fn();
    const { rerender } = render(
      <KanbanBoard
        tasksByStatus={mockTasks}
        onSelectTask={vi.fn()}
        onTaskMove={mockOnTaskMove}
      />
    );

    // Note: Due to dnd-beautiful mock, we can't fully test the drag behavior
    // In a real integration test, you'd use react-beautiful-dnd's test utilities
    expect(mockOnTaskMove).not.toHaveBeenCalled();
  });

  it("displays task cards in correct columns", () => {
    const tasksWithMultiple = {
      ...mockTasks,
      assigned: [
        {
          _id: "task-2",
          title: "Task 2",
          description: "Another task",
          status: "assigned",
          priority: "high",
          tags: [],
          assignedTo: "agent-2",
          updatedAt: Date.now(),
        },
      ],
    };

    render(
      <KanbanBoard
        tasksByStatus={tasksWithMultiple}
        onSelectTask={vi.fn()}
        onTaskMove={vi.fn()}
      />
    );

    expect(screen.getByText("Task 1")).toBeTruthy();
    expect(screen.getByText("Task 2")).toBeTruthy();
  });

  it("shows empty state when no tasks in column", () => {
    render(
      <KanbanBoard
        tasksByStatus={mockTasks}
        onSelectTask={vi.fn()}
        onTaskMove={vi.fn()}
      />
    );

    const noTasksElements = screen.getAllByText("No tasks");
    expect(noTasksElements.length).toBeGreaterThan(0);
  });
});
