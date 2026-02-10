# Phase 3: Visual Hierarchy, Accessibility & Mobile — Design Specification

**Sprint:** Week 3 (2026-02-24 to 2026-03-03)  
**Status:** DESIGN SPEC READY  
**Coordination:** Designer (Wanda) → Developer (Friday)

---

## Part 1: Visual Hierarchy & Design Polish

### Typography Refinements

**Current Issues:**
- Inconsistent font sizes across components
- Weak visual hierarchy (not enough contrast between levels)

**Fixes:**

| Component | Current | Target | Change |
|-----------|---------|--------|--------|
| Page Title | 18px | 20px | +2px, increase weight to 700 |
| Section Head | 14px | 16px | +2px, increase tracking |
| Card Title | 14px | 15px | Subtle lift |
| Body Text | 12px | 13px | Improve readability |
| Label/Metadata | 11px | 11px | No change, ensure consistent |

**Line Heights:**
- Headings: 1.2 (tight, assertive)
- Body: 1.5 (airy, readable)
- Labels: 1.3 (compact)

**Letter Spacing:**
- Headings: +0.02em (tracked out)
- Body: normal
- Labels: +0.05em (emphasize smallness)

---

### Spacing & Grid

**8px Base Grid:**
- Apply consistently across all components
- Padding: 8px, 12px, 16px, 20px, 24px (multiples of 4)
- Gap: 8px (tight), 12px (normal), 16px (loose)

**Vertical Rhythm:**
- Card to card: 12px gap
- Section to section: 24px gap
- Component padding: 16px (cards), 12px (rows)

**Borders & Dividers:**
- Reduce border weight: `1px solid var(--mc-border)` everywhere
- Soften borders: use lighter color `var(--mc-border-soft)` for subtle dividers
- Remove unnecessary borders (cards don't need 4 borders)

---

### Shadows & Depth

**Current:** Shadows too heavy

**Target:**
- **Base (no hover):** None or `0 1px 1px rgba(0,0,0,0.04)`
- **Hover/Focus:** `0 2px 4px rgba(0,0,0,0.06)`
- **Modal:** `0 8px 16px rgba(0,0,0,0.12)` (intentional depth)
- **Dropdown:** `0 4px 8px rgba(0,0,0,0.08)`

**Rationale:** Shadows should enhance, not dominate. Most elements stay flat or minimal.

---

### Color Adjustments

**Current palette is good.** Minor tweaks:
- Reduce saturation on accent colors slightly (less jarring)
- Ensure all text meets WCAG AA on intended backgrounds

**Contrast Testing Required:**
- Text on `var(--mc-text)` on `var(--mc-card)` → should be 7:1+
- Button text on button background → should be 7:1+
- Link color on body text → should be 5:1+

---

### Micro-Polish Details

1. **Button Corners:** Reduce border-radius
   - Large buttons: 8px → 6px
   - Small buttons: 6px → 4px
   - Pills (chips): Keep 999px

2. **Input Fields:** 
   - Rounded: 6px
   - Border on focus: `2px solid var(--mc-accent-green)`
   - Padding: 10px (vertical) × 12px (horizontal)

3. **Transitions:**
   - Opacity: 150ms
   - Transform: 200ms
   - Color: 150ms

4. **Focus Indicators:**
   - Ring: `2px solid var(--mc-accent-green)`
   - Offset: 2px
   - Visible on all interactive elements

---

## Part 2: Accessibility (WCAG AA)

### Keyboard Navigation

**Required:**
- Tab order: Left sidebar → Main content → Right sidebar
- All buttons/inputs reachable via Tab
- Modal traps focus (Tab cycles through modal only)
- Escape closes modals

**Implementation:**
- `tabIndex="0"` on custom interactive elements
- `aria-modal="true"` on modals
- `focus-visible` pseudo-class for keyboard-only focus rings

### ARIA Labels

**Required labels:**
- Buttons: `aria-label="Close modal"` if no text
- Icons: `aria-hidden="true"` if decorative, or label if functional
- Lists: `role="list"` + `role="listitem"` for activity feed
- Status indicators: `aria-live="polite"` for dynamic updates

**Examples:**
```jsx
<button aria-label="Close">×</button>
<div role="status" aria-live="polite">Task updated 2 min ago</div>
<span aria-hidden="true">🟢</span> <span>Online</span>
```

### Color Contrast

**All text must pass:**
- Large text (18px+): 3:1 ratio minimum
- Normal text: 4.5:1 ratio minimum
- UI components (borders, icons): 3:1 ratio

**Testing tools:**
- WebAIM Contrast Checker
- Lighthouse DevTools
- axe DevTools browser extension

### Screen Reader Support

- **Skip links:** "Skip to main content" (hidden, visible on focus)
- **Heading hierarchy:** H1 → H2 → H3 (don't skip levels)
- **Form labels:** `<label for="inputId">` not just placeholder
- **Status updates:** `aria-live="polite"` for toast notifications
- **Page regions:** `<nav>`, `<main>`, `<aside>`, `<footer>` semantic HTML

### Focus Management

- Modals: Focus moves to first interactive element (or title)
- Toast: Announced via `aria-live`, focus may move after interaction
- Keyboard-only users: Focus visible outline on all interactive elements

---

## Part 3: Mobile Responsive Design

### Breakpoints

**Tailwind defaults + custom:**
- `mobile`: 375px (minimum width target)
- `sm`: 640px
- `md`: 768px (tablet)
- `lg`: 1024px (desktop)
- `xl`: 1280px (large desktop)

### Mobile Layout (<768px)

#### Navigation
- Sticky top bar remains (64px)
- Hamburger menu on left (3-line icon)
- Drawer slides from left (80% width, max 320px)
- Overlay backdrop (dark, dismissible)

#### Main Content
- Full-width (no sidebar)
- Single column layout
- Cards: Full-width with 12px padding

#### Sidebar (Hidden by default)
- Opens in drawer on hamburger click
- Agent list: Cards instead of rows (wider, tappable)
- Scroll independently from main content

#### Bottom Tab Navigation
- Sticky bottom (56px height)
- 4 icons: Board / Feed / Filters / More
- Active tab: highlighted with accent color
- Tap area: 56px square (accessible)

### Task Detail Modal (Mobile)
- Full-screen on mobile
- Header fixed (close button prominent)
- Content scrollable
- Tabs horizontal (swipeable or clickable)

### Kanban Board (Mobile)
- Stack columns vertically (vs. horizontal scroll)
- One column visible at a time (swipe to next)
- OR: Option 2 = horizontal scroll (touch-friendly)
- Card height reduced (fit 3-4 cards on screen)

### Form Inputs (Mobile)
- Input height: 44px minimum (touch target)
- Button height: 48px minimum
- Spacing: 8px between interactive elements
- Font size: 16px (prevents zoom on iOS)

### Responsive Images & Icons
- Icons: Scale up slightly on mobile (16px → 18px)
- Avatars: Keep 32px (or slightly larger)
- Empty state illustrations: Reduce size on mobile (responsive SVG)

### Touch Interactions
- No hover effects (they don't work on touch)
- Replace with active/pressed states
- Touch feedback: Brief opacity change or scale
- Swipe gestures optional (but don't rely on them)

---

## Part 4: Performance Optimization

### Critical Rendering Path

1. **Code Splitting:**
   - Modals: Lazy-load
   - Heavy components (charts, rich editor): Lazy-load

2. **Image Optimization:**
   - Avatars: 32x32px max, AVIF + WebP + PNG fallback
   - Illustrations: SVG (scalable, smaller file)

3. **CSS Optimization:**
   - Tailwind: Purge unused classes
   - Critical CSS: Inline top-nav styles

4. **JavaScript:**
   - Tree-shake unused dependencies
   - Debounce search (300ms)
   - Lazy-load Framer Motion animations

### Metrics

**Targets:**
- Lighthouse Performance: >90
- Lighthouse Accessibility: 100 (or 95+ with known issues)
- Lighthouse Best Practices: >90
- LCP: <2.5s
- FID: <100ms
- CLS: <0.1

---

## Phase 3 Success Criteria

- [ ] Typography hierarchy clear + readable
- [ ] Contrast ratios pass WCAG AA
- [ ] Keyboard nav works end-to-end
- [ ] Focus indicators visible
- [ ] Screen reader announces updates
- [ ] Mobile layout responsive (375px+)
- [ ] Touch targets 44px+
- [ ] Lighthouse >90 on all categories
- [ ] Zero console errors
- [ ] Load time <1.5s, TTI <2s

---

## Developer Handoff

**Tools & Libraries:**
- `axe-core` (accessibility testing)
- `@testing-library/user-event` (keyboard testing)
- Lighthouse CI for performance regression testing

**Testing Checklist:**
- Manual keyboard navigation (Tab through entire site)
- Screen reader testing (NVDA on Windows, VoiceOver on Mac)
- Mobile device testing (iPhone 12 min, Android Samsung)
- Contrast checker on all text
- Lighthouse audit (desktop + mobile)

**Key Files:**
- `src/app/globals.css` (update spacing, shadows, radius)
- `src/components/*.tsx` (add ARIA labels, focus styles)
- `tailwind.config.ts` (extend breakpoints if needed)

**Final QA:**
- All 3 phases deployed to staging
- Full end-to-end testing
- Performance profiling
- Accessibility audit pass
