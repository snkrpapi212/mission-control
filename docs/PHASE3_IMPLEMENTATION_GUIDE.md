# Phase 3 Implementation Guide

**Status:** READY AFTER PHASE 2  
**Estimated Time:** 7-10 days  
**Branch:** `feature/phase3-polish`  
**Parent Task:** js721zce65dnb5d0ke3hkpfms980xnb3  
**Spec:** `/data/workspace/mission-control/docs/PHASE3_VISUAL_ACCESSIBILITY_SPEC.md`

---

## Implementation Order

### Week 3 Day 1-2: Visual Hierarchy & Design Polish

**Goal:** Refine typography, spacing, shadows, and colors for production-quality design

**Files to modify:**
- `src/app/globals.css` - Update CSS variables
- `tailwind.config.ts` - Extend theme
- All component files - Apply new design tokens

**Implementation steps:**

1. **Update typography scale**
   
   Edit `src/app/globals.css`:
   ```css
   :root {
     /* Typography */
     --font-size-page-title: 20px;     /* was 18px */
     --font-size-section-head: 16px;   /* was 14px */
     --font-size-card-title: 15px;     /* was 14px */
     --font-size-body: 13px;           /* was 12px */
     --font-size-label: 11px;          /* unchanged */
     
     /* Line heights */
     --line-height-heading: 1.2;
     --line-height-body: 1.5;
     --line-height-label: 1.3;
     
     /* Letter spacing */
     --letter-spacing-heading: 0.02em;
     --letter-spacing-body: normal;
     --letter-spacing-label: 0.05em;
   }
   ```

2. **Update spacing & grid**
   
   Enforce 8px grid:
   ```css
   :root {
     /* Spacing (8px base grid) */
     --spacing-xs: 4px;
     --spacing-sm: 8px;
     --spacing-md: 12px;
     --spacing-lg: 16px;
     --spacing-xl: 20px;
     --spacing-2xl: 24px;
     
     /* Component-specific */
     --card-padding: 16px;
     --row-padding: 12px;
     --card-gap: 12px;
     --section-gap: 24px;
   }
   ```

3. **Refine shadows**
   
   Reduce shadow intensity:
   ```css
   :root {
     --shadow-none: none;
     --shadow-sm: 0 1px 1px rgba(0, 0, 0, 0.04);
     --shadow-md: 0 2px 4px rgba(0, 0, 0, 0.06);
     --shadow-lg: 0 4px 8px rgba(0, 0, 0, 0.08);
     --shadow-xl: 0 8px 16px rgba(0, 0, 0, 0.12);
   }
   ```

4. **Update border radius**
   
   Reduce for more refined look:
   ```css
   :root {
     --radius-sm: 4px;  /* was 6px */
     --radius-md: 6px;  /* was 8px */
     --radius-lg: 8px;  /* was 10px */
     --radius-pill: 999px;
   }
   ```

5. **Apply changes globally**
   
   Replace all hardcoded values with CSS variables:
   ```tsx
   // Before
   <div className="p-4 rounded-lg shadow-md">
   
   // After
   <div className="p-[var(--card-padding)] rounded-[var(--radius-md)] shadow-[var(--shadow-md)]">
   ```

**Success criteria:**
- ✅ Typography hierarchy clear and readable
- ✅ 8px grid applied consistently
- ✅ Shadows subtle and refined
- ✅ Border radius consistent
- ✅ No hardcoded spacing/shadow/radius values

---

### Week 3 Day 3-5: Accessibility (WCAG AA)

**Goal:** Full keyboard navigation, ARIA labels, color contrast, and screen reader support

**Libraries:**
```bash
npm install @testing-library/user-event
npm install --save-dev axe-core
```

**Implementation steps:**

1. **Keyboard navigation audit**
   
   Test every interactive element:
   - Tab order: Left sidebar → Main content → Right sidebar
   - All buttons/inputs reachable via Tab
   - Modal traps focus (Tab cycles through modal only)
   - Escape closes modals
   
   Add `tabIndex="0"` to custom interactive elements:
   ```tsx
   // Before
   <div onClick={handleClick}>Click me</div>
   
   // After
   <button onClick={handleClick}>Click me</button>
   // OR
   <div role="button" tabIndex={0} onClick={handleClick} onKeyDown={handleKeyDown}>
     Click me
   </div>
   ```

2. **Add ARIA labels**
   
   Label all interactive elements:
   ```tsx
   // Buttons without text
   <button aria-label="Close modal">×</button>
   
   // Icons
   <span aria-hidden="true">🟢</span> <span>Online</span>
   
   // Form inputs
   <label htmlFor="task-title">Task Title</label>
   <input id="task-title" type="text" />
   
   // Status updates
   <div role="status" aria-live="polite">
     Task updated 2 min ago
   </div>
   ```

3. **Color contrast check**
   
   Test all text with WebAIM Contrast Checker:
   - Normal text: 4.5:1 minimum
   - Large text (18px+): 3:1 minimum
   - UI components: 3:1 minimum
   
   Fix low-contrast text:
   ```css
   /* Before (fails contrast) */
   --mc-text-muted: rgba(0, 0, 0, 0.4);
   
   /* After (passes contrast) */
   --mc-text-muted: rgba(0, 0, 0, 0.6);
   ```

4. **Screen reader support**
   
   - Add skip links: "Skip to main content"
   - Use semantic HTML: `<nav>`, `<main>`, `<aside>`, `<footer>`
   - Proper heading hierarchy: H1 → H2 → H3 (don't skip)
   - Form labels: `<label>` not just placeholder
   - Live regions for toast notifications
   
   ```tsx
   // Skip link
   <a href="#main-content" className="sr-only focus:not-sr-only">
     Skip to main content
   </a>
   
   // Semantic HTML
   <nav aria-label="Main navigation">...</nav>
   <main id="main-content">...</main>
   <aside aria-label="Activity feed">...</aside>
   ```

5. **Focus management**
   
   - Modals: Focus moves to first interactive element
   - Toast: Announced via `aria-live`, no focus movement
   - Focus visible outline on all interactive elements
   
   ```css
   /* Focus styles */
   *:focus-visible {
     outline: 2px solid var(--mc-accent-green);
     outline-offset: 2px;
   }
   ```

6. **Run accessibility audit**
   
   ```bash
   npm install --save-dev @axe-core/playwright
   ```
   
   Add to tests:
   ```ts
   import { injectAxe, checkA11y } from 'axe-playwright'
   
   test('dashboard is accessible', async ({ page }) => {
     await page.goto('/dashboard')
     await injectAxe(page)
     await checkA11y(page)
   })
   ```

**Success criteria:**
- ✅ Full keyboard navigation works
- ✅ All interactive elements have ARIA labels
- ✅ Color contrast passes WCAG AA
- ✅ Screen reader announces updates
- ✅ Focus indicators visible
- ✅ axe audit passes with 0 violations

---

### Week 3 Day 6-8: Mobile Responsive Design

**Goal:** Fully responsive layout for mobile devices (375px+)

**Breakpoints:**
```tsx
// tailwind.config.ts
export default {
  theme: {
    screens: {
      'mobile': '375px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
    },
  },
}
```

**Implementation steps:**

1. **Mobile navigation**
   
   - Sticky top bar (64px)
   - Hamburger menu on left
   - Drawer slides from left (80% width, max 320px)
   
   ```tsx
   // src/components/MobileNav.tsx
   export function MobileNav() {
     const [open, setOpen] = useState(false)
     
     return (
       <>
         <nav className="md:hidden fixed top-0 w-full h-16 bg-mc-card border-b">
           <button onClick={() => setOpen(true)}>
             <HamburgerIcon />
           </button>
         </nav>
         
         <Sheet open={open} onOpenChange={setOpen}>
           <SheetContent side="left" className="w-[80%] max-w-[320px]">
             <AgentList />
           </SheetContent>
         </Sheet>
       </>
     )
   }
   ```

2. **Mobile layout**
   
   - Hide sidebar by default (hamburger menu)
   - Full-width main content
   - Bottom tab navigation
   
   ```tsx
   // src/app/dashboard/page.tsx
   <div className="dashboard-layout">
     {/* Desktop: 3-column */}
     <aside className="hidden md:block">
       <AgentSidebar />
     </aside>
     
     <main className="w-full md:w-auto">
       <KanbanBoard />
     </main>
     
     <aside className="hidden lg:block">
       <ActivityFeed />
     </aside>
     
     {/* Mobile: Bottom tabs */}
     <BottomTabs className="md:hidden" />
   </div>
   ```

3. **Bottom tab navigation**
   
   ```tsx
   // src/components/BottomTabs.tsx
   export function BottomTabs() {
     const [activeTab, setActiveTab] = useState('board')
     
     return (
       <nav className="fixed bottom-0 w-full h-14 bg-mc-card border-t flex">
         <TabButton
           icon={<BoardIcon />}
           label="Board"
           active={activeTab === 'board'}
           onClick={() => setActiveTab('board')}
         />
         <TabButton
           icon={<FeedIcon />}
           label="Feed"
           active={activeTab === 'feed'}
           onClick={() => setActiveTab('feed')}
         />
         <TabButton
           icon={<FilterIcon />}
           label="Filters"
           active={activeTab === 'filters'}
           onClick={() => setActiveTab('filters')}
         />
       </nav>
     )
   }
   ```

4. **Mobile kanban board**
   
   Option 1: Vertical stack (recommended)
   ```tsx
   <div className="kanban-board flex flex-col md:flex-row">
     {columns.map(column => (
       <div key={column.id} className="w-full md:w-80">
         {column.tasks.map(task => <TaskCard task={task} />)}
       </div>
     ))}
   </div>
   ```
   
   Option 2: Horizontal scroll
   ```tsx
   <div className="kanban-board flex overflow-x-auto snap-x">
     {columns.map(column => (
       <div key={column.id} className="w-[90vw] md:w-80 snap-center flex-shrink-0">
         {column.tasks.map(task => <TaskCard task={task} />)}
       </div>
     ))}
   </div>
   ```

5. **Touch targets**
   
   Ensure all interactive elements are ≥44px:
   ```css
   /* Mobile touch targets */
   @media (max-width: 768px) {
     button {
       min-height: 44px;
       min-width: 44px;
     }
     
     input {
       height: 44px;
     }
     
     .nav-item {
       height: 56px; /* Bottom tabs */
     }
   }
   ```

6. **Mobile modals**
   
   Full-screen on mobile:
   ```tsx
   <Dialog>
     <DialogContent className="w-full h-full md:w-auto md:h-auto md:max-w-2xl">
       {/* Full-screen on mobile, centered modal on desktop */}
     </DialogContent>
   </Dialog>
   ```

**Success criteria:**
- ✅ Responsive down to 375px
- ✅ Hamburger menu works
- ✅ Bottom tabs functional
- ✅ Touch targets ≥44px
- ✅ Modals full-screen on mobile
- ✅ No horizontal scroll

---

### Week 3 Day 9-10: Performance Optimization

**Goal:** Lighthouse score >90 on all categories

**Implementation steps:**

1. **Code splitting**
   
   Lazy-load heavy components:
   ```tsx
   import { lazy, Suspense } from 'react'
   
   const CommandPalette = lazy(() => import('./CommandPalette'))
   const TaskDetailModal = lazy(() => import('./TaskDetailModal'))
   
   <Suspense fallback={<Loading />}>
     <CommandPalette />
   </Suspense>
   ```

2. **Debounce search**
   
   ```tsx
   import { useDebouncedCallback } from 'use-debounce'
   
   const handleSearch = useDebouncedCallback((query: string) => {
     setSearchQuery(query)
   }, 300)
   ```

3. **Virtualize long lists**
   
   ```tsx
   import { useVirtualizer } from '@tanstack/react-virtual'
   
   const virtualizer = useVirtualizer({
     count: tasks.length,
     getScrollElement: () => parentRef.current,
     estimateSize: () => 80,
   })
   ```

4. **Image optimization**
   
   - Avatars: 32x32px max
   - AVIF + WebP + PNG fallback
   - Lazy load below-fold images

5. **CSS optimization**
   
   - Purge unused Tailwind classes
   - Inline critical CSS
   - Defer non-critical CSS

6. **Run Lighthouse audit**
   
   ```bash
   npm install --save-dev @lighthouse-ci/cli
   
   # Run audit
   lhci collect --url=http://localhost:3000/dashboard
   ```
   
   Target scores:
   - Performance: >90
   - Accessibility: 100
   - Best Practices: >90
   - SEO: >90

**Success criteria:**
- ✅ Lighthouse Performance >90
- ✅ Lighthouse Accessibility 100
- ✅ LCP <2.5s
- ✅ FID <100ms
- ✅ CLS <0.1

---

## Final Checklist

Before marking Phase 3 complete:

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
- [ ] Commits pushed to `feature/phase3-polish` branch
- [ ] PR created for review
- [ ] Screenshots added to docs/

---

## Testing Checklist

**Manual tests:**
- [ ] Tab through entire site (keyboard only)
- [ ] Screen reader test (NVDA or VoiceOver)
- [ ] Mobile test on real device (iPhone 12+, Android Samsung)
- [ ] Contrast check on all text
- [ ] Lighthouse audit (desktop + mobile)

**Automated tests:**
- [ ] Unit tests for all components
- [ ] Integration tests for user flows
- [ ] E2E tests for critical paths
- [ ] Accessibility tests (axe)

---

**Questions?** Check the full spec at `/data/workspace/mission-control/docs/PHASE3_VISUAL_ACCESSIBILITY_SPEC.md`
