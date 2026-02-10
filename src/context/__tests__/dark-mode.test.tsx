import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DarkModeProvider, useDarkMode } from "../DarkModeContext";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

function TestComponent() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  return (
    <div>
      <div data-testid="dark-mode-status">
        {isDarkMode ? "Dark" : "Light"}
      </div>
      <button onClick={toggleDarkMode}>Toggle</button>
    </div>
  );
}

describe("DarkModeContext", () => {
  beforeEach(() => {
    localStorageMock.clear();
    document.documentElement.classList.remove("dark");
  });

  it("provides isDarkMode and toggleDarkMode", () => {
    render(
      <DarkModeProvider>
        <TestComponent />
      </DarkModeProvider>
    );

    expect(screen.getByTestId("dark-mode-status")).toBeTruthy();
  });

  it("toggles dark mode when button clicked", async () => {
    render(
      <DarkModeProvider>
        <TestComponent />
      </DarkModeProvider>
    );

    const toggleButton = screen.getByRole("button", { name: /toggle/i });
    const status = screen.getByTestId("dark-mode-status");

    // Initial state (light or based on system preference)
    const initialText = status.textContent;

    await userEvent.click(toggleButton);
    await waitFor(() => {
      expect(status.textContent).not.toBe(initialText);
    });
  });

  it("persists dark mode preference to localStorage", async () => {
    render(
      <DarkModeProvider>
        <TestComponent />
      </DarkModeProvider>
    );

    const toggleButton = screen.getByRole("button", { name: /toggle/i });

    await userEvent.click(toggleButton);

    await waitFor(() => {
      expect(localStorageMock.getItem("darkMode")).toBeTruthy();
    });
  });

  it("restores dark mode preference from localStorage", () => {
    localStorageMock.setItem("darkMode", "true");

    render(
      <DarkModeProvider>
        <TestComponent />
      </DarkModeProvider>
    );

    const status = screen.getByTestId("dark-mode-status");
    expect(status.textContent).toBe("Dark");
  });
});
