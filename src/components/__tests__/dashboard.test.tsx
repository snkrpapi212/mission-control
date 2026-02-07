import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { DashboardShell } from "@/components/DashboardShell";

describe("DashboardShell", () => {
  it("renders key dashboard sections (static render)", () => {
    const html = renderToStaticMarkup(<DashboardShell />);

    expect(html).toContain("Mission Control");
    expect(html).toContain("Agents");
    expect(html).toContain("Kanban");
    expect(html).toContain("Activity");
  });

  it("renders at least one task title from mock data", () => {
    const html = renderToStaticMarkup(<DashboardShell />);
    expect(html).toContain("Define Phase 4 dashboard MVP");
  });
});
