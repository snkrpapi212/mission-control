/**
 * Accessibility utilities for WCAG AA compliance
 */

export function focusElement(element: HTMLElement | null) {
  if (!element) return;
  element.focus({ preventScroll: false });
}

export function trapFocus(container: HTMLElement | null) {
  if (!container) return;

  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  container.addEventListener("keydown", handleKeyDown);

  return () => {
    container.removeEventListener("keydown", handleKeyDown);
  };
}

export function announceToScreenReader(message: string, priority: "polite" | "assertive" = "polite") {
  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", priority);
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Close element on Escape key
 */
export function closeOnEscape(
  element: HTMLElement | null,
  onClose: () => void
) {
  if (!element) return;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  element.addEventListener("keydown", handleKeyDown);

  return () => {
    element.removeEventListener("keydown", handleKeyDown);
  };
}

/**
 * Check if running on touch device
 */
export function isTouchDevice(): boolean {
  return (
    typeof window !== "undefined" &&
    (window.matchMedia("(hover: none)").matches ||
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0)
  );
}

/**
 * Heading hierarchy validator (dev only)
 */
export function validateHeadingHierarchy(container: HTMLElement | null) {
  if (!container) return;

  const headings = Array.from(container.querySelectorAll("h1, h2, h3, h4, h5, h6"));
  let previousLevel = 0;

  headings.forEach((heading) => {
    const level = parseInt(heading.tagName[1]);
    if (level - previousLevel > 1) {
      // eslint-disable-next-line no-console
      console.warn(
        `Heading hierarchy skipped: ${heading.tagName} after H${previousLevel}`,
        heading
      );
    }
    previousLevel = level;
  });
}
