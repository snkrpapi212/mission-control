# Phase 1: Micro-Interactions — Detailed Sprint Plan

**Task ID:** js721zce65dnb5d0ke3hkpfms980xnb3  
**Sprint Duration:** Week 1 (2026-02-10 to 2026-02-17)  
**Status:** IN PROGRESS  
**Coordination:** Designer (Wanda) + Developer (Friday)

---

## Phase 1 Subtasks (Weekly Breakdown)

### SUBTASK 1.1: Agent Sidebar Interactions (2-3 days)
**Owner:** Designer (Wanda) — spec & animation design  
**Dev Lead:** Friday — implementation  

**Deliverables:**
- [ ] Expand/collapse animation (smooth 200ms slide)
- [ ] Hover task preview tooltip (agent's current task name)
- [ ] Pulse animation on active status (1.5s cycle, green dot)
- [ ] Performance sparklines (mini charts: tasks completed this week)
- [ ] Slide-out detail panel (click agent → modal with full profile + recent tasks)
- [ ] Skeleton loaders for async agent list

**Design Spec Location:** `src/components/AgentSidebar.tsx` (enhancements)  
**Key Colors:** Green (#4ea56a) for active, amber (#c89a46) for idle  
**Animations:** Framer Motion for slide/expand, CSS for pulse  
**Status:** DESIGN READY → AWAITING DEV

---

### SUBTASK 1.2: Kanban Board Polish (3-4 days)
**Owner:** Designer (Wanda) — interaction design  
**Dev Lead:** Friday — drag-drop + state management  

**Deliverables:**
- [ ] Drag-drop enabled (@hello-pangea/dnd integration)
- [ ] Card hover effects (lift shadow, slight scale, border highlight)
- [ ] Priority left-border colors (P0=red, P1=orange, P2=blue, P3=gray)
- [ ] Description preview on hover (2-line clamp + ellipsis)
- [ ] Agent avatars with emoji + name (assignee row)
- [ ] Time badges (relative: "2h ago", updates live)
- [ ] Click → task detail modal opens
- [ ] Smooth reorder animation (siblings shift 150ms)
- [ ] Empty state per column (friendly message + icon)

**Design Spec Location:** `src/components/KanbanBoard.tsx` + `src/components/TaskCard.tsx`  
**Key Interactions:** Drag feedback (opacity 0.7), drop snap (spring), hover lift  
**Status:** DESIGN READY → AWAITING DEV

---

### SUBTASK 1.3: Real-Time Feedback (2-3 days)
**Owner:** Designer (Wanda) — UX flow design  
**Dev Lead:** Friday — Convex subscriptions + state  

**Deliverables:**
- [ ] Toast notifications (top-right corner, auto-dismiss 4s, stacked)
  - Success: task updated (green)
  - Error: mutation failed (red)
  - Info: agent came online (blue)
- [ ] Optimistic UI (task moves immediately, reverts on error)
- [ ] Connection status indicator (top-right nav: green dot "Connected" / amber "Reconnecting" / red "Offline")
- [ ] Last-updated timestamp (bottom-right board: "Updated 2 minutes ago")
- [ ] Smooth fade-ins for new content (200ms opacity + slide)
- [ ] Loading skeleton states (while fetching agents/tasks/activities)

**Design Spec Location:** New component `src/components/Toast.tsx` + connection indicator  
**Key UX:** Non-intrusive, dismissible, stackable toasts  
**Status:** DESIGN SPEC → READY FOR DEV

---

### SUBTASK 1.4: Empty States & Illustrations (1-2 days)
**Owner:** Designer (Wanda) — UX copy + visual direction  
**Dev Lead:** Friday — component structure  

**Deliverables:**
- [ ] Empty agent list (illustration: "No agents yet", prompt: "Invite team members")
- [ ] Empty task board (illustration: "No tasks in Inbox", prompt: "+ Create your first task")
- [ ] Empty activity feed (illustration: "No activity yet", text: "Updates will appear here")
- [ ] No search results (illustration: "No tasks match", prompt: "Try different filters")
- [ ] All illustrations: simple line art, brand color accents, 2-3 sentences max copy
- [ ] CTA button styling (prominent but not jarring)

**Design Direction:** Warm, welcoming tone. Illustrations in brand color palette.  
**Status:** DESIGN READY → AWAITING DEV

---

## Phase 1 Success Criteria

- [ ] All micro-interactions smooth (60fps, no jank)
- [ ] Real-time updates feel instant (optimistic + actual)
- [ ] Accessibility preserved (keyboard nav, focus indicators)
- [ ] Mobile still works (hover states adapted for touch)
- [ ] No console errors
- [ ] Load time <1.5s (initial)
- [ ] TTI <2s

---

## Dependencies & Risks

**Dependencies:**
- Framer Motion installed and wired
- @hello-pangea/dnd installed and wired
- Zustand state management for UI state (modals, filters, theme)
- Toast library or custom Toast component

**Risks:**
- Drag-drop complexity (browser compat, touch events)
- Real-time sync timing (optimistic UI can diverge if mutations fail)
- Animation performance (testing on older devices critical)

---

## Coordination Protocol

**Designer (Wanda) → Developer (Friday):**
- Specs pushed to `designer/phase1-microinteractions` branch
- Figma/design docs linked in pull request descriptions
- Animation timing + easing specs in code comments

**Developer (Friday) → Designer (Wanda):**
- Tag @Wanda on PRs for visual review before merge
- Share test environment URL for QA
- Flag any animations that don't feel right (performance or UX)

**Weekly Sync:**
- Monday 9am: kickoff, confirm priorities
- Wed 4pm: midweek checkpoint (blockers?)
- Fri 3pm: review + demo for next phase planning

---

## Deliverables Checklist

By end of Week 1:
- [ ] All subtasks 1.1–1.4 implemented on `dev` branch
- [ ] Visual QA pass complete (screenshots in `docs/phase1-before-after/`)
- [ ] Accessibility audit pass (keyboard nav, ARIA, contrast)
- [ ] Mobile responsive verified (375px+)
- [ ] Performance metrics captured (Lighthouse, load time)
- [ ] Zero console errors in QA session
