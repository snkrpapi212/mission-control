# Mission Control V2 – UI Match Implementation Notes

Task ID: `js7fejp71apv1w58ncmmfxkt0180xn2x`  
Owner: Designer (Wanda)  
Date: 2026-02-10

## Summary
Implemented a high-fidelity visual pass across the 3-panel dashboard to match the provided reference style:
- compact typography
- minimal/flat shadows
- restrained palette
- tighter spacing and small radii
- denser card/feed rows

## Files Updated
- `src/components/DashboardShell.tsx`
- `src/components/AgentSidebar.tsx`
- `src/components/KanbanBoard.tsx`
- `src/components/TaskCard.tsx`
- `src/components/ActivityFeed.tsx`

## What Was Implemented

### 1) Top Bar / Overall Composition
- Introduced reference-like top shell with:
  - Mission Control brand row (`◇ MISSION CONTROL`)
  - central KPI counters
  - docs button
  - bell with unread badge
  - theme toggle affordance
  - online chip
- Reduced chrome and increased information density
- Layout now uses explicit 3-column grid on desktop:
  - left agents rail
  - center kanban
  - right live feed

### 2) Left Agent Rail
- Added grouped sections in required order:
  - Active
  - Idle
  - Offline
- Row styling now includes:
  - avatar/emoji tile
  - larger name + role line
  - level badge (LEAD/SPC/INT)
  - status dot + text
  - current task / heartbeat subtitle
- Added subtle pulse animation for recently active working agents
- Added slide-out agent profile panel (current task, activity, perf)

### 3) Center Kanban / Cards
- Column headers refactored to compact uppercase style + count chips
- Added top filter/search strip
- Card design updated to be dense and reference-like:
  - title + 2-line desc preview
  - P0/P1/P2/P3 chips
  - small tag chips
  - assignee meta row
  - compact progress bar
- Empty and loading skeleton states included

### 4) Right Live Feed
- Added dense feed panel with:
  - filter chips
  - grouped timeline sections
  - collapsible buckets
  - compact item separators
  - icon mapping for activity types (➕/🔄/💬/📄/🟢)
- Added loading/empty states

### 5) Mobile / Tablet Behavior
- Added mobile tab switch (`Board` / `Feed`)
- Feed shifts to hidden right panel on desktop and tabbed section on mobile
- Center content remains primary on small screens

## Design Tokens Applied (Current)

### Color (Light)
- Canvas: `#f7f7f5`
- Panel: `#fbfaf8`, `#f8f8f6`
- Borders: `#dfded8`, `#e2e0d7`, `#ece9df`
- Text primary: `#23211f`, `#24231f`
- Text secondary: `#6f6b61`, `#8d897f`
- Accent green: `#49a46f`, `#55a46f`
- Accent gold: `#c9a15e`, `#d5bf8a`
- Priority tones:
  - P0: `#b44c4c`
  - P1: `#b87425`
  - P2: `#446eab`
  - P3: `#8f8c83`

### Typography
- Dense hierarchy with mostly 10–15px text
- Header tracking increased for labels/sections
- Card and row text tightened for high information density

### Radius / Shadow
- Radius mostly `rounded-md` / small corners
- Minimal shadows (`0 1px 0` style)

### Motion
- Subtle hover transitions (~150ms)
- Pulse animation on active status dots
- Collapsible feed groups

## Known Blocker (Environment)
Local visual verification hit an existing app pipeline issue in this environment:

`Module parse failed: Unexpected character '@' in src/app/globals.css`

This appears to be a Next/PostCSS/Tailwind pipeline issue unrelated to the visual component edits. It prevents reliable local runtime rendering/screenshot capture from `/dashboard`.

## Screenshot Artifacts
Saved in:
`docs/design-reference/before-after/`

- `before-live-dashboard.png` (captured from current live)
- `before-dashboard.png`
- `after-dashboard.png`
- `after-v2-local-dashboard.png` (local capture attempt; impacted by pipeline blocker)

## Next Steps for Dev Pairing
1. Resolve Tailwind/PostCSS pipeline issue in local dev runtime.
2. Re-capture post-fix "after" screenshot from local V2.
3. Tune spacing/typography against reference at 100% zoom.
4. Add full dark mode token map (currently light-first visual pass).
5. Run QA pass for keyboard focus and contrast deltas.
