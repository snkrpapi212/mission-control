# Mission Control V2 — Visual QA Checklist

Reference: `docs/design-reference/mission-control-target-ui.jpg`

## Blocker status log

### Fix Pack 1 — `js7eyr02y3bc00cc9sykjcrzk180x57p`

1) Typography scale — **PASS**
- Evidence: `src/components/DashboardShell.tsx` brand `text-[31px]`, KPI numerals `text-[50px]`; larger editorial scale retained in `TaskCard`.

2) 3-pane proportions — **PASS**
- Evidence: `src/app/globals.css` width tokens `--w-left` and `--w-right`; shell grid uses `xl:grid-cols-[var(--w-left)_minmax(0,1fr)_var(--w-right)]`.

3) Header hierarchy — **PASS**
- Evidence: `--h-topbar: 72px`; 3-zone header composition in `DashboardShell.tsx` (brand | KPI | controls/time/status).

4) Card density/rhythm — **PENDING (Fix Pack 2)**
5) Chip/tag styling — **PENDING (Fix Pack 2)**
6) Accent semantics — **PENDING (Fix Pack 2)**
7) Theme token parity + CSS pipeline — **PENDING (Fix Pack 3)**

## Screenshot evidence
- Before: `docs/design-reference/before-after/before-dashboard.png`
- After Pack 1: `docs/design-reference/before-after/after-pack1.png`
