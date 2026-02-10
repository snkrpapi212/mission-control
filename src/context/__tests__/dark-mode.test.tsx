import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DarkModeProvider, useDarkMode } from "../DarkModeContext";

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

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

function TestComponent() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  return (
    <div>
      <div data-testid="dark-mode-status">{isDarkMode ? "Dark" : "Light"}</div>
      <button onClick={toggleDarkMode}>Toggle</button>
    </div>
  );
}

describe("DarkModeContext", () => {
  afterEach(() => {
    cleanup();
  });

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

    await userEvent.click(screen.getByRole("button", { name: /toggle/i }));

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

    expect(screen.getByTestId("dark-mode-status").textContent).toBe("Dark");
  });
});
