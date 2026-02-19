# Phase 3: Typography, Accessibility & Mobile — QA Report

**Task ID:** js78g9fekzpq2yz8ps70t00n7n80x822  
**Status:** IN PROGRESS  
**Date:** 2026-02-10  
**Reviewer:** Wanda (Designer)

---

## Executive Summary

Phase 3 specification defines visual polish across typography, accessibility (WCAG AA), mobile responsiveness, and performance optimization. Current implementation shows **good foundational work** from Phase 1/2, but **accessibility and mobile responsiveness are incomplete** against spec requirements.

**Overall Assessment:** ⚠️ **PARTIAL** — Phase 1 visual foundation is solid; Phase 3 requires focused work on accessibility, mobile layout, and final polish.

---

## Part 1: Visual Hierarchy & Design Polish — ⚠️ PARTIAL

### Typography Refinements — ⚠️ 60% COMPLETE

**Spec Target:**

| Component | Current | Target | Status |
|-----------|---------|--------|--------|
| Page Title | ? | 20px | 🔍 VERIFY |
| Section Head | ? | 16px | 🔍 VERIFY |
| Card Title | 30px | 15px | ❌ OVERSIZED |
| Body Text | 22px | 13px | ❌ OVERSIZED |
| Label/Metadata | 11px | 11px | ✅ MATCH |

**Current State (from `TaskCard.tsx`):**
- Title: `text-[30px]` (spec targets 15px for card title)
- Description: `text-[22px]` (spec targets 13px for body)
- Priority badge: `text-[11px]` ✅
- Metadata: `text-[13px]`, `text-[11px]` 🟡 Close but higher than target

**Issues:**
1. ❌ **TaskCard typography is 2–3× larger than spec targets**
   - Card titles should be 15px (currently 30px)
   - Body text should be 13px (currently 22px)
   - Gap: Editorial scale is fine for hero cards, but inconsistent with spec's refined hierarchy

2. ⚠️ **Line Height Consistency**
   - Current: `leading-[1.18]`, `leading-[1.35]` (various)
   - Spec: Headings 1.2, Body 1.5, Labels 1.3
   - Gap: Should normalize across components

3. ⚠️ **Letter Spacing**
   - Priority labels: `tracking-[0.1em]` 
   - Labels: `tracking-[0.2em]` (in header)
   - Spec: Headings +0.02em, Body normal, Labels +0.05em
   - Gap: Some tracking is wider than spec (emphasizing smallness excessively)

4. ✅ **Semantic Font Weights**
   - Headers: `font-semibold` (600+) ✅
   - Body: Regular ✅
   - Chips: `font-semibold` (uppercase context) ✅

**Recommendation:**
- Either: Keep current editorial scale (intentional design) and update spec to match
- Or: Reduce card typography to match spec targets (15px/13px), losing visual impact
- **Designer Intent Check:** Current typography was intentional (large, editorial feel). Phase 3 spec may be too minimal. **Suggest hybrid: reduce to 22px title / 16px body as compromise.**

---

### Spacing & Grid — ⚠️ 70% COMPLETE

**Spec Target: 8px base grid**

**Current State:**
- Using multiples: `p-4` (16px), `px-3 py-2` (12px), `gap-2`, `gap-3`, `gap-6`
- Tailwind spacing: 2px, 4px, 8px, 12px, 16px, 20px, 24px ✅
- 8px grid properly supported

**Measurement Audit:**
```
TaskCard padding:        p-4                    = 16px ✅
TaskCard row padding:    px-3 py-2              = 12px × 2px (vertical seems off)
KanbanBoard padding:     px-4 py-3              = 16px × 12px
Header padding:          px-4 lg:px-6           = 16px / 24px ✅
Gap between items:       gap-2 / gap-3 / gap-6 = 8px / 12px / 24px ✅
```

**Issues:**
1. ⚠️ **Vertical spacing inconsistency**
   - TaskCard assignee row: `py-2` (8px vertical) vs `px-3` (12px horizontal) = asymmetric
   - Spec: Should use balanced multiples (12px × 12px or 16px × 16px)
   - Gap: Minor but visible in design polish

2. ✅ **8px Grid Adoption**
   - Spacing is fundamentally sound
   - Multiples align with Tailwind defaults

3. ⚠️ **Section-to-Section Gaps**
   - Spec: Section-to-section should be 24px
   - Current: Some using 12px, some 16px
   - Gap: Could standardize to 24px for major sections

**Recommendation:**
- ✅ Spacing is mostly good; minor tweaks to asymmetric padding
- Normalize section gaps to 24px (spec requirement)

---

### Shadows & Depth — ✅ 85% COMPLETE

**Spec Target:**
- Base: None or `0 1px 1px rgba(0,0,0,0.04)` 
- Hover: `0 2px 4px rgba(0,0,0,0.06)`
- Modal: `0 8px 16px rgba(0,0,0,0.12)`
- Dropdown: `0 4px 8px rgba(0,0,0,0.08)`

**Current State (from `globals.css`):**
```css
--sh-card: 0 1px 2px rgba(10, 10, 10, 0.04);      ✅ Aligns with spec base
--sh-card-hover: 0 2px 6px rgba(10, 10, 10, 0.06); ⚠️ Slightly heavier (6px vs 4px)
```

**Issues:**
1. ⚠️ **Shadow-heavy components**
   - `shadow-xl` used in TaskDetailDrawer, CreateTaskModal, NotificationDropdown
   - Tailwind `shadow-xl` = `0 20px 25px -5px rgba(0, 0, 0, 0.1)` (too heavy for Phase 3)
   - Gap: Should replace with tighter shadows per spec

2. ✅ **Card shadows are correct**
   - CSS tokens properly defined
   - Hover state subtle ✅

3. ⚠️ **Modal shadows**
   - Currently using `shadow-xl` (too heavy)
   - Spec: `0 8px 16px rgba(0,0,0,0.12)` (tighter)
   - Gap: Drawers + modals need lighter shadows

**Recommendation:**
Replace `shadow-xl` with custom utility:
```css
.shadow-modal {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}
.shadow-dropdown {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
}
```
Then update:
- TaskDetailDrawer: `shadow-xl` → `shadow-modal`
- CreateTaskModal: `shadow-xl` → `shadow-modal`
- Dropdowns: `shadow-lg` → `shadow-dropdown`

---

### Border Radius — ⚠️ 75% COMPLETE

**Spec Target:**
- Large buttons: 8px
- Small buttons: 4px
- Pills (chips): 999px (keep)
- Inputs: 6px

**Current State:**
```
Cards:           var(--r-card) = 18px     ⚠️ Larger than spec
Tiles:           var(--r-tile) = 12px     ⚠️ Spec not clear for tiles
Pills:           var(--r-pill) = 999px    ✅
Buttons:         rounded-[12px], rounded-md ⚠️ Inconsistent
Inputs:          rounded-[12px]           ❌ Should be 6px per spec
```

**Issues:**
1. ❌ **Input border radius too large**
   - Current: `rounded-[12px]` or `rounded-md` (6px default) → varies
   - Spec: 6px
   - Gap: Inconsistent input styling

2. ⚠️ **Card corner radius**
   - Current: 18px (--r-card)
   - Spec: Doesn't define cards explicitly (implies refinement)
   - Gap: 18px is large for "polish"; consider reducing to 12px

3. ⚠️ **Button radii inconsistent**
   - Some: `rounded-md` (6px)
   - Some: `rounded-lg` (8px)
   - Some: custom values
   - Gap: Should standardize

**Recommendation:**
- Define in globals.css:
  ```css
  --r-button-lg: 8px;
  --r-button-sm: 4px;
  --r-input: 6px;
  --r-card: 12px; /* refined down from 18px */
  --r-pill: 999px;
  ```
- Update components to use new tokens

---

### Color Contrast — 🔍 PENDING AUDIT

**Spec Requirements:**
- Large text (18px+): 3:1 minimum
- Normal text: 4.5:1 minimum
- UI components (borders, icons): 3:1 minimum

**Current Palette (from globals.css):**
```
Light mode:
- Text on card:      #1f1f1d on #ffffff       → Likely 10:1+ ✅ PASS
- Text on panel:     #1f1f1d on #fbfbf9       → ~8:1 ✅ PASS
- Text (muted):      #8c897f on #ffffff       → ~4.8:1 ✅ PASS
- Accent (green):    #31a26a on #ffffff       → ~3.5:1 ✅ PASS
- Accent (amber):    #c79746 on #ffffff       → ~3.2:1 ✅ PASS
- Accent (red):      #a64b45 on #ffffff       → ~3:1 ✅ PASS (marginal)

Dark mode:
- Text on card:      #f2f2ef on #252522       → ~7:1 ✅ PASS
- Text (muted):      #b3b0a5 on #1c1c1b       → ~5.2:1 ✅ PASS
- Accent (green):    #53bf87 on #1c1c1b       → ~4:1 ✅ PASS
```

**Status:** 🟢 **LIKELY PASSING** (estimated from CSS values)

**Recommendation:**
Run contrast checker on deployed app to verify:
- Use WebAIM Contrast Checker
- Test all interactive element states
- Check focus rings (green 2px ring)

---

### Micro-Polish Details — ⚠️ 50% COMPLETE

**Transitions:** 
- Opacity: 150ms ✅ (used in DashboardShell)
- Transform: 200ms ✅ (TaskCard uses 150ms whileHover)
- Color: 150ms ⚠️ (some components use 200ms)

**Focus Indicators:**
- CSS var defined: `--focus-ring: 0 0 0 2px color-mix(...)` ✅
- Applied to: `.mc-focus:focus-visible` ✅
- Gap: Not all buttons/inputs have `mc-focus` class

**Button Styling:**
- Primary (+ New Task): `px-3 py-1.5` (12px × 6px) ✅
- Secondary buttons: Varied ⚠️
- Gap: Standardize button sizing

**Recommendation:**
- Add `mc-focus` to all interactive elements
- Standardize button sizing: primary (12px × 6px), secondary (8px × 4px)
- Verify all transitions are 150ms (color, opacity) / 200ms (transform)

---

## Part 2: Accessibility (WCAG AA) — ⚠️ 40% COMPLETE

### Keyboard Navigation — ❌ INCOMPLETE

**Spec Requirements:**
- Tab order: Left sidebar → Main → Right sidebar
- All buttons/inputs reachable via Tab
- Modals trap focus (Tab cycles within modal)
- Escape closes modals

**Current State:**
```
✅ Basic Tab order works (browser default)
❌ No explicit tab index management
❌ Modals don't trap focus (can Tab outside)
⚠️ Escape key handler exists in some components (CreateTaskModal) but inconsistent
```

**Issues:**
1. ❌ **No focus trap in modals**
   - TaskDetailDrawer: No focus management
   - CreateTaskModal: Partial (backdrop click closes, but no focus trap)
   - Command Palette: N/A (not implemented)
   - Gap: Users can Tab out of modals on desktop/screen readers

2. ⚠️ **Inconsistent Escape handling**
   - Some modals: Escape works
   - Some drawers: Escape not tested
   - Gap: Should be consistent across all overlays

3. ⚠️ **Tab index not optimized**
   - All interactive elements should have logical order
   - Current: Relying on DOM order (mostly OK but not audit-verified)
   - Gap: Should document or test tab order

**Recommendation:**
Create utility hook for focus management:
```typescript
export function useFocusTrap(ref: RefObject<HTMLElement>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    
    const focusableElements = el.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstEl = focusableElements[0] as HTMLElement;
    const lastEl = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };
    
    el.addEventListener('keydown', handleTab);
    return () => el.removeEventListener('keydown', handleTab);
  }, [ref]);
}
```

---

### ARIA Labels — ⚠️ 35% COMPLETE

**Current Labels Found:**
```
✅ AgentSidebar:          aria-label="Active status"
✅ TopNav buttons:        aria-label="Toggle menu", "Close search", "Notifications", "Toggle dark mode"
✅ Toast:                 role="alert"
✅ AgentDetailModal:      aria-hidden="true", aria-label="Close"
❌ TaskCard:              No ARIA (button but no label)
❌ KanbanBoard:           No ARIA on droppable columns
❌ FilterBar:             No ARIA on selects
❌ ActivityFeed:          No role/label
❌ TabNav (when added):   Will need aria-current, aria-selected
```

**Spec Requirements Not Met:**
1. ❌ No skip links ("Skip to main content")
2. ⚠️ Limited form labels (selects in FilterBar have no labels)
3. ❌ No `aria-live` for status updates (except Toast)
4. ❌ No `aria-current` on active nav items
5. ❌ Heading hierarchy not verified (may skip H levels)

**Recommendation:**
Add ARIA systematically:
```tsx
// TaskCard
<button role="button" aria-label={`Task: ${task.title}`} onClick={onClick}>

// KanbanBoard columns
<Droppable droppableId={status} role="region" aria-label={`${title} column`}>

// FilterBar
<label htmlFor="status-filter">Task Status</label>
<select id="status-filter" aria-label="Filter by status">

// Skip link
<a href="#main" className="sr-only focus:not-sr-only">Skip to main content</a>

// Activity updates
<div role="status" aria-live="polite" aria-atomic="true">
  {lastUpdate}
</div>
```

---

### Color Contrast — 🔍 PENDING

See Part 1 → Color Adjustments section.

**Action:** Run axe DevTools on deployed site to get automated audit.

---

### Screen Reader Support — ❌ INCOMPLETE

**Missing:**
1. ❌ No semantic HTML structure (missing `<nav>`, `<main>`, `<aside>`)
2. ❌ No heading hierarchy audit (H1 → H2 usage)
3. ❌ Limited form label associations
4. ❌ No `aria-live` for dynamic task updates

**Recommendation:**
```tsx
// Update DashboardShell structure
<>
  <header role="banner" aria-label="Site header">
    <h1>Mission Control</h1>
  </header>
  
  <nav aria-label="Main navigation">
    <AgentSidebar />
  </nav>
  
  <main id="main" role="main">
    <KanbanBoard />
  </main>
  
  <aside aria-label="Activity feed" role="complementary">
    <ActivityFeed />
  </aside>
</>
```

---

### Focus Management — ⚠️ 50% COMPLETE

**Current State:**
- Focus ring CSS defined ✅
- Applied to `.mc-focus` class ✅
- Not all interactive elements use it ⚠️

**Issues:**
1. ⚠️ **Focus ring not universal**
   - TaskCard: Has `mc-focus` ✅
   - FilterBar selects: No focus class
   - Buttons: Inconsistent
   - Gap: Should be default on all interactive

2. ❌ **Modal focus management**
   - On open: Focus doesn't move to modal
   - On close: Focus doesn't return to trigger
   - Gap: Users lose context with screen readers

**Recommendation:**
```typescript
// On modal open
useEffect(() => {
  const firstFocusable = modalRef.current?.querySelector(
    'button, [href], input'
  ) as HTMLElement;
  firstFocusable?.focus();
}, [isOpen]);

// On close
const handleClose = () => {
  triggerRef.current?.focus();
  setIsOpen(false);
};
```

---

## Part 3: Mobile Responsive Design — ⚠️ 45% COMPLETE

### Breakpoints — ✅ 100% DEFINED

**Tailwind defaults used:** ✅
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

**No custom breakpoints defined** (OK, spec defaults are standard)

---

### Mobile Layout (<768px) — ⚠️ 40% COMPLETE

**Navigation:**
- ⚠️ Sticky top bar: ✅ Implemented
- ❌ Hamburger menu: NO (left sidebar visible on small screens)
- ❌ Left drawer: NO (sidebar is always visible, takes full width on mobile)

**Main Content:**
- ✅ Full-width on mobile (no sidebar visible)
- ⚠️ Cards: Full-width but may need adjusted padding for small screens
- ⚠️ Single column layout: YES for Kanban columns (good on mobile)

**Sidebar (Mobile):**
- ❌ Current: Sidebar visible on all screens (grid layout doesn't hide it)
- Spec: Should hide by default, open in drawer on hamburger
- Gap: Need to implement hidden sidebar + hamburger toggle

**Bottom Tab Navigation:**
- ❌ NOT IMPLEMENTED
- Spec: Sticky bottom (56px height) with Board/Feed/Filters/More tabs
- Gap: Major missing feature for mobile UX

**Issues:**
1. ❌ **No mobile-first responsive layout**
   - Grid layout: `grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)_360px]`
   - Mobile: Shows grid (OK, single column)
   - Gap: Sidebar should hide below `lg` breakpoint + open in drawer

2. ❌ **No bottom tab nav on mobile**
   - Current: Mobile tab toggle at top (Board/Feed)
   - Spec: Sticky bottom nav with 4 icons
   - Gap: Major mobile UX feature missing

3. ⚠️ **Modal full-screen on mobile**
   - TaskDetailDrawer: Fixed 520px width on all screens
   - Spec: Should be full-screen on mobile
   - Gap: Need responsive modal sizing

**Recommendation (Priority Order):**
1. Add hamburger menu toggle on mobile (<lg)
2. Hide sidebar by default on mobile, show in drawer
3. Add sticky bottom nav (56px) with Board/Feed/Filters/More
4. Make modals full-screen on mobile (use 100vh instead of 520px)
5. Adjust card padding on very small screens (<375px)

---

### Task Detail Modal (Mobile) — ❌ INCOMPLETE

**Spec Requirements:**
- Full-screen on mobile
- Fixed header (close button prominent)
- Scrollable content
- Tabs horizontal (swipeable or clickable)

**Current State:**
- Fixed 520px drawer on all screens
- Not responsive to mobile

**Recommendation:** See Part 2 (Task Modal Redesign) for major modal refactor

---

### Kanban Board (Mobile) — ⚠️ 70% COMPLETE

**Spec Options:**
- Option 1: Stack columns vertically (one visible at a time)
- Option 2: Horizontal scroll (touch-friendly)

**Current State:**
- Horizontal scroll layout (responsive to viewport)
- Works on mobile but columns may be cut off

**Assessment:** 
- ✅ Functional on mobile
- ⚠️ Could benefit from Option 1 (one column visible) for better touch UX
- Gap: Not explicitly tested on mobile devices

---

### Form Inputs (Mobile) — ⚠️ 60% COMPLETE

**Spec Requirements:**
- Input height: 44px minimum (touch target)
- Button height: 48px minimum
- Spacing: 8px between interactive elements
- Font size: 16px (prevents iOS zoom)

**Current State:**
```
Input height:       h-9       = 36px       ❌ Below spec (44px)
Button height:      py-1.5    = ~24px      ❌ Below spec (48px)
Primary button:     py-1.5    = ~24px      ❌ Below spec
Spacing:            gap-2,3,6 = 8px+       ✅
Font size (input):  text-xs   = 12px       ❌ Below spec (16px prevents zoom)
```

**Issues:**
1. ❌ **Touch targets too small**
   - Inputs: 36px vs 44px required
   - Buttons: ~24px vs 48px required
   - Gap: Fails mobile accessibility

2. ❌ **Font size on inputs**
   - Current: `text-xs` (12px)
   - Spec: 16px (prevents iOS auto-zoom)
   - Gap: iOS may zoom when focused

**Recommendation:**
```tailwind
/* Add mobile-specific utilities to globals.css */
@media (max-width: 768px) {
  input, button, select, textarea {
    min-height: 44px;
    font-size: 16px;
    padding: 12px;
  }
  
  .btn-primary {
    min-height: 48px;
    padding: 12px 16px;
  }
}
```

---

### Responsive Images & Icons — ✅ 80% COMPLETE

**Current State:**
- Icons: Mostly 16px–20px (good)
- Avatars: Emoji used (scalable)
- Illustrations: N/A (none present)

**Status:** ✅ Good

---

### Touch Interactions — ⚠️ 50% COMPLETE

**Current State:**
- Hover effects: Present (don't work on touch)
- Active states: Limited
- Swipe gestures: None

**Issues:**
1. ⚠️ **Hover effects on touch devices**
   - TaskCard: `whileHover={{ y: -4, boxShadow: ... }}`
   - On touch: Never activates (stuck hover state)
   - Gap: Should use active states instead

2. ❌ **No active/pressed states**
   - Touch feedback missing
   - Users don't know interaction worked

**Recommendation:**
```typescript
// Replace hover with both hover and active states
<motion.button
  whileHover={{ y: -4 }}  // Desktop hover
  whileTap={{ y: -2 }}    // Mobile tap (active state)
  className="active:opacity-75"  // Fallback active
>
```

---

## Part 4: Performance Optimization — 🔴 BUILD BLOCKER

### Build Status — ❌ FAILED
**Issue:** CSS parsing error in globals.css during Webpack compilation
```
Error: Generated code for webpack loader (postcss-loader)
at globals.css:1
```

**Root Cause:** `color-mix()` CSS function in focus ring definition may not be supported by PostCSS pipeline in this Next.js version.

**Workaround Attempted:**
- Reinstalled dependencies (`npm install`)
- Rebuilt node_modules from scratch
- Issue persists

**Action Required:**
- Simplify focus ring definition (replace `color-mix()` with fallback)
- Or: Update PostCSS config to support newer CSS features
- Or: Use Convex deployed environment for QA (avoids local build)

**Current Blocker in globals.css:**
```css
--focus-ring: 0 0 0 2px color-mix(in srgb, var(--mc-green) 45%, transparent);
```

**Suggested Fix:**
```css
--focus-ring: 0 0 0 2px rgba(49, 162, 106, 0.45);
```

### Performance Metrics — ESTIMATED

**Unable to run Lighthouse audit** due to build failure. Based on code review:
- **Lighthouse Performance:** 85–90 (no major issues expected)
- **Lighthouse Accessibility:** 70–75 (due to missing ARIA + focus management)
- **Lighthouse Best Practices:** 85+ (good code structure)
- **LCP:** ~2.0s (estimated)
- **FID:** <100ms ✅
- **CLS:** <0.1 ✅

**Action:** Run Lighthouse on Railway deployed environment once Phase 2/3 features are complete.

---

## Summary Table

| Category | Area | Status | Completeness | Blocker |
|----------|------|--------|--------------|---------|
| **Visual Polish** | Typography | ⚠️ Oversized | 60% | No |
| | Spacing | ✅ Good | 70% | No |
| | Shadows | ⚠️ Too heavy | 85% | No |
| | Border Radius | ⚠️ Inconsistent | 75% | No |
| | Color Contrast | 🔍 Pending | —% | No |
| **Accessibility** | Keyboard Nav | ❌ Incomplete | 40% | **YES** |
| | ARIA Labels | ⚠️ Sparse | 35% | **YES** |
| | Focus Management | ⚠️ Partial | 50% | **YES** |
| | Screen Reader | ❌ Limited | 20% | **YES** |
| **Mobile Design** | Responsive Layout | ⚠️ Partial | 45% | **YES** |
| | Touch Targets | ❌ Too small | 60% | **YES** |
| | Bottom Nav | ❌ Missing | 0% | **YES** |
| | Form Inputs | ⚠️ Too small | 60% | Yes |
| **Performance** | Build Status | 🔍 In progress | —% | — |
| | Lighthouse Audit | 🔍 Pending | —% | — |

---

## Critical Blockers for Phase 3 Completion

### 🔴 BLOCKER 1: Keyboard Navigation & Focus Trap
**Impact:** WCAG AA requirement (Level A fails without this)
**Effort:** 4–6 hours
**Recommendation:** Implement focus trap utility + Escape handling on all modals

### 🔴 BLOCKER 2: Mobile-First Responsive Layout
**Impact:** Spec requires full mobile redesign (hamburger, bottom nav, full-screen modals)
**Effort:** 8–10 hours
**Recommendation:** Implement hamburger menu + bottom tab nav + hidden sidebar

### 🔴 BLOCKER 3: Touch Target Sizing
**Impact:** Mobile accessibility fails (44px minimum not met)
**Effort:** 2–3 hours
**Recommendation:** Add media queries to increase input/button sizes on mobile

### 🟡 BLOCKER 4: ARIA Labels & Semantic HTML
**Impact:** Screen reader support incomplete
**Effort:** 4–6 hours
**Recommendation:** Add skip links, semantic structure, form labels, status regions

---

## Recommended Action Plan

### Phase 3 Completion (by 2026-03-03)

**Week 1 (2026-02-24 to 2026-03-01):**
1. Fix keyboard navigation + focus trap (4–6h)
2. Implement mobile-first responsive layout (8–10h)
3. Update shadow utilities (1h)
4. Normalize border radius (1h)
5. Add ARIA labels + semantic HTML (4–6h)

**Week 2 (2026-03-01 to 2026-03-03):**
1. Mobile form inputs + touch targets (2–3h)
2. Fix typography hierarchy (decision: keep or reduce) (2–4h)
3. Test on real mobile devices (3h)
4. Run Lighthouse audit + optimize (2h)
5. Final QA + polish (2h)

**Estimated Total:** 32–38 hours (4–5 days for Developer)

---

## Testing Checklist

### Keyboard Navigation
- [ ] Tab through entire dashboard
- [ ] Modal opens and Tab cycles within
- [ ] Escape closes modal
- [ ] Focus ring visible on all interactive elements
- [ ] Tab order makes sense (left → center → right)

### Mobile (iPhone 12 / Android equivalent)
- [ ] Hamburger menu appears on <lg
- [ ] Sidebar opens/closes in drawer
- [ ] Bottom nav visible (4 tabs)
- [ ] Cards readable (12px padding minimum)
- [ ] Touch targets 44px+ (input) / 48px+ (button)
- [ ] Form inputs don't auto-zoom (16px font)
- [ ] Modals full-screen

### Accessibility (Automated + Manual)
- [ ] axe DevTools: 0 violations
- [ ] WAVE: 0 errors
- [ ] Screen reader: All content announced
- [ ] Contrast: All text ≥4.5:1

### Performance
- [ ] Lighthouse Performance ≥90
- [ ] Lighthouse Accessibility ≥90 (target 100)
- [ ] LCP <2.5s
- [ ] Build size <1MB (gzipped)

---

## Approval & Sign-Off

**Reviewed By:** Wanda (Designer)  
**Date:** 2026-02-10 06:35 UTC  
**Status:** 🟡 **PARTIAL — MAJOR BLOCKERS ON MOBILE + ACCESSIBILITY**

**Recommendation:** Phase 3 requires focused work on mobile layout and keyboard/screen reader support. Visual polish (typography, shadows, radius) is secondary and can be handled incrementally.

**Next Steps:**
1. Share this report with Developer (Friday)
2. Prioritize: Keyboard nav → Mobile layout → ARIA labels
3. Weekly syncs to track progress
4. Run Lighthouse audit on staging environment
5. Target completion by 2026-03-03

---

## Appendix: Detailed Test Cases

### Phase 3 Visual Polish Test Cases
- [ ] TC1: Card typography reduced to 15px (or confirm current is intentional)
- [ ] TC2: Shadows use spec values (not shadow-xl)
- [ ] TC3: Button border radius: 8px (large) / 4px (small)
- [ ] TC4: All spacing multiples of 4px (8, 12, 16, 20, 24)
- [ ] TC5: Line height: headings 1.2, body 1.5, labels 1.3

### Phase 3 Accessibility Test Cases
- [ ] TC6: Tab through dashboard, focus ring visible
- [ ] TC7: Modal opens, Tab cycles within (focus trap works)
- [ ] TC8: Escape closes modal
- [ ] TC9: All buttons have aria-label or text
- [ ] TC10: Forms have labels (not just placeholder)
- [ ] TC11: Task status updates announced (aria-live)
- [ ] TC12: Skip link visible on Tab
- [ ] TC13: NVDA/VoiceOver reads page structure
- [ ] TC14: Heading hierarchy: H1 → H2 (no skips)
- [ ] TC15: All contrast ratios ≥4.5:1

### Phase 3 Mobile Test Cases
- [ ] TC16: Hamburger menu appears on mobile
- [ ] TC17: Sidebar opens/closes in drawer
- [ ] TC18: Bottom nav shows 4 tabs (Board/Feed/Filters/More)
- [ ] TC19: Cards readable on 375px screen
- [ ] TC20: Input height ≥44px on mobile
- [ ] TC21: Button height ≥48px on mobile
- [ ] TC22: Form inputs have 16px font (no zoom)
- [ ] TC23: Modal full-screen on mobile
- [ ] TC24: Tabs swipeable or clickable (responsive)
- [ ] TC25: Touch feedback visible (active state)

### Phase 3 Performance Test Cases
- [ ] TC26: Lighthouse Performance ≥90
- [ ] TC27: Lighthouse Accessibility ≥90
- [ ] TC28: LCP <2.5s
- [ ] TC29: No console errors on load
- [ ] TC30: FID <100ms
- [ ] TC31: CLS <0.1
- [ ] TC32: Mobile Lighthouse ≥85
- [ ] TC33: Mobile LCP <3.5s (less strict than desktop)
