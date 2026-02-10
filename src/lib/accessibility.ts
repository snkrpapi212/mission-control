/**
 * Accessibility utilities for WCAG 2.1 AA compliance
 */

import { useCallback, useEffect, useRef, useState, useId } from "react";

// ============================================================================
// Focus Management
// ============================================================================

/**
 * Focus an element with optional scroll behavior
 */
export function focusElement(element: HTMLElement | null, preventScroll = false) {
  if (!element) return;
  element.focus({ preventScroll });
}

/**
 * Trap focus within a container element (for modals, dialogs, etc.)
 * Returns a cleanup function to remove the event listener
 */
export function trapFocus(container: HTMLElement | null): (() => void) | void {
  if (!container) return;

  const getFocusableElements = () => {
    return Array.from(
      container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => {
      const isDisabled = (el as HTMLButtonElement | HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).disabled;
      return !isDisabled && !el.hasAttribute("aria-hidden") && el.offsetParent !== null;
    });
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return;

    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

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

  // Focus first element on mount
  const focusableElements = getFocusableElements();
  if (focusableElements.length > 0) {
    setTimeout(() => focusableElements[0]?.focus(), 0);
  }

  return () => {
    container.removeEventListener("keydown", handleKeyDown);
  };
}

/**
 * React hook for focus trapping in modals/dialogs
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | void>(undefined);

  useEffect(() => {
    if (isActive && containerRef.current) {
      cleanupRef.current = trapFocus(containerRef.current);
    }

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [isActive]);

  return containerRef;
}

// ============================================================================
// Focus Restoration
// ============================================================================

/**
 * Save and restore focus when a modal/dialog opens/closes
 */
export function useFocusRestore(isActive: boolean) {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isActive) {
      // Save the currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
    }
  }, [isActive]);

  useEffect(() => {
    return () => {
      // Restore focus when component unmounts
      if (previousFocusRef.current && "focus" in previousFocusRef.current) {
        setTimeout(() => previousFocusRef.current?.focus(), 0);
      }
    };
  }, []);
}

// ============================================================================
// Screen Reader Announcements
// ============================================================================

/**
 * Announce a message to screen readers via an aria-live region
 */
export function announceToScreenReader(
  message: string,
  priority: "polite" | "assertive" = "polite"
) {
  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", priority);
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    if (document.body.contains(announcement)) {
      document.body.removeChild(announcement);
    }
  }, 1000);
}

/**
 * React hook for announcing state changes to screen readers
 */
export function useAnnounce() {
  return useCallback((message: string, priority: "polite" | "assertive" = "polite") => {
    announceToScreenReader(message, priority);
  }, []);
}

// ============================================================================
// Keyboard Navigation
// ============================================================================

/**
 * Close element on Escape key press
 * Returns a cleanup function to remove the event listener
 */
export function closeOnEscape(
  element: HTMLElement | null,
  onClose: () => void
): (() => void) | void {
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
 * React hook for handling Escape key in modals
 */
export function useEscapeKey(isActive: boolean, onEscape: () => void) {
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onEscape();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isActive, onEscape]);
}

// Backward compatible alias
export function useCloseOnEscape(onEscape: () => void, isActive: boolean) {
  return useEscapeKey(isActive, onEscape);
}

// ============================================================================
// Device Detection
// ============================================================================

/**
 * Check if running on a touch device
 */
export function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(hover: none)").matches ||
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0
  );
}

// ============================================================================
// Reduced Motion Support
// ============================================================================

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * React hook for reduced motion preference
 */
export function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);

    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return reducedMotion;
}

// ============================================================================
// Skip to Content
// ============================================================================

/**
 * Handle skip to content click
 */
export function handleSkipToContent(targetId: string) {
  const element = document.getElementById(targetId);
  if (element) {
    element.tabIndex = -1;
    element.focus();
    // Remove tabIndex after focus to maintain normal tab order
    setTimeout(() => element.removeAttribute("tabindex"), 1000);
  }
}

// ============================================================================
// Heading Hierarchy (Dev Only)
// ============================================================================

/**
 * Validate heading hierarchy within a container (development only)
 * Logs warnings for skipped heading levels
 */
export function validateHeadingHierarchy(container: HTMLElement | null) {
  if (!container || process.env.NODE_ENV === "production") return;

  const headings = Array.from(
    container.querySelectorAll("h1, h2, h3, h4, h5, h6")
  );
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

// ============================================================================
// Unique ID Helper
// ============================================================================

/**
 * Generate unique IDs for ARIA attributes
 */
export function useUniqueId(prefix: string): string {
  const id = useId();
  return `${prefix}-${id}`;
}
