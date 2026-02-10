# Design Alignment Plan - Friday's Implementation vs Wanda's Design

**Status:** CRITICAL ALIGNMENT REQUIRED  
**Date:** 2026-02-10 00:45 UTC  
**Developer:** Friday  
**Designer:** Wanda

---

## 📊 Current State Analysis

### What Friday Built (Phase 4 Overhaul)
✅ **Functional Features:**
- TopNavigation (search, notifications, dark mode)
- Drag-and-drop Kanban
- Activity Feed with filters
- AgentSidebar with task counts
- NotificationDropdown
- DarkModeContext
- 28+ tests
- Full mobile responsive

❌ **Visual/Design Issues:**
- Colors don't match Wanda's palette
- Component naming different
- Layout structure varies
- Spacing/padding differs
- Typography hierarchy unclear
- Animations not specified
- Missing loading states/skeletons

---

## 🎨 Color System Alignment

### Current Implementation
```
Gray-50, Gray-100, Gray-900, etc. (Tailwind defaults)
Lucide icons (red, blue, orange)
No custom color names
```

### Wanda's Spec
```
Dark Mode:
- mc-bg: #0F0F0F
- mc-surface: #1A1A1A
- mc-text: #F5F5F5
- mc-text-muted: #9CA3AF

Priorities:
- priority-p0: #EF4444 (red)
- priority-p1: #F97316 (orange)
- priority-p2: #3B82F6 (blue)
- priority-p3: #6B7280 (gray)

Status:
- status-active: #22C55E
- status-idle: #F59E0B
- status-offline: #6B7280

Accents:
- accent-primary: #0EA5E9 (cyan)
- accent-secondary: #8B5CF6 (purple)
```

### Action Required
- ✅ Update tailwind.config.ts with custom colors
- ✅ Replace all gray/blue/orange Tailwind classes with mc-* classes
- ✅ Update component styling to match

---

## 🏗️ Component Alignment

### 1. TopNav
**Friday's Implementation:** `TopNavigation.tsx` (260 lines)  
**Wanda's Spec:** `TopNav` component (64px height)

| Aspect | Friday | Wanda | Status |
|--------|--------|-------|--------|
| Name | TopNavigation | TopNav | ❌ Rename |
| Height | Varies | 64px | ❌ Fix |
| Logo | "🎯" emoji | Logo component | ⚠️ Create |
| Search | Implemented | Global search | ✅ Keep |
| Notifications | NotificationDropdown | NotificationPanel | ⚠️ Rename |
| Connection Status | Implemented | Indicator + tooltip | ⚠️ Enhance |
| Dark Mode | Implemented | ThemeToggle | ✅ Keep |
| User Menu | Not implemented | Avatar + dropdown | ❌ Add |

### 2. AgentSidebar
**Friday's Implementation:** `AgentSidebar.tsx` (150 lines)  
**Wanda's Spec:** `AgentSidebar` with grouping

| Aspect | Friday | Wanda | Status |
|--------|--------|-------|--------|
| Width | 240px/72px | 240px/80px/drawer | ⚠️ Fix |
| Grouping | No | By status (Online/Idle/Offline) | ❌ Add |
| Avatar | Emoji | Initials in circle | ✅ Update |
| Status Indicator | Dot | Animated dot (pulsing) | ✅ Keep |
| Current Task | Text | Italic gray text | ✅ Keep |
| Hover | bg-gray-700 | bg-mc-surface-hover | ⚠️ Color |
| Selected | Left border | Left border cyan | ⚠️ Color |

### 3. KanbanBoard
**Friday's Implementation:** `KanbanBoard.tsx` with @hello-pangea/dnd  
**Wanda's Spec:** Separate TaskColumn + TaskCard components

| Aspect | Friday | Wanda | Status |
|--------|--------|-------|--------|
| Columns | 6 (via map) | TaskColumn component | ⚠️ Refactor |
| Layout | grid-cols-6 | min-w-72 with gap | ⚠️ Fix |
| TaskCard | Simple | Priority badge, agent avatar, time | ✅ Similar |
| Drag-Drop | @hello-pangea/dnd | Same library | ✅ Keep |
| Column Header | Count badge | Count badge | ✅ Keep |
| Responsive | Stacks | Horizontal scroll on mobile | ⚠️ Fix |

### 4. ActivityFeed
**Friday's Implementation:** `ActivityFeed.tsx` with filters  
**Wanda's Spec:** Time-grouped timeline

| Aspect | Friday | Wanda | Status |
|--------|--------|-------|--------|
| Grouping | By type/agent | By time (Just now/Today/Yesterday) | ❌ Change |
| Icons | Type labels | Activity type icons | ⚠️ Add |
| Timestamps | Relative | Grouped headers | ⚠️ Refactor |
| Filters | Dropdown selects | Removed (simpler) | ⚠️ Remove |
| Max height | Scrollable | 400px with scroll | ✅ Similar |
| Styling | Cards | Simple dividers | ⚠️ Simplify |

### 5. NotificationPanel
**Friday's Implementation:** `NotificationDropdown.tsx`  
**Wanda's Spec:** `NotificationPanel` (part of TopNav)

| Aspect | Friday | Wanda | Status |
|--------|--------|-------|--------|
| Name | NotificationDropdown | NotificationPanel | ❌ Rename |
| Position | Absolute | Anchored to bell | ✅ Similar |
| Max-width | 96 | 360px | ⚠️ Fix |
| Unread indicator | Badge + filter | Left border cyan | ✅ Update |
| Animation | Slide + fade | Specified | ✅ Keep |
| Colors | Default colors | Wanda's palette | ❌ Update |

---

## 🎯 Build Priority (Following Wanda's Recommendations)

### Phase 1: Foundation (This Priority)
- [ ] 1.1 Update `tailwind.config.ts` with Wanda's color system
- [ ] 1.2 Create `TopNav` component (rename + refactor)
- [ ] 1.3 Create `AgentSidebar` with grouping (refactor existing)
- [ ] 1.4 Add loading skeleton components
- [ ] 1.5 Commit: "Phase 1: Foundation - Colors + TopNav + AgentSidebar"

### Phase 2: Core Features (Next)
- [ ] 2.1 Refactor `KanbanBoard` → separate `TaskColumn` + `TaskCard`
- [ ] 2.2 Refactor `ActivityFeed` → time-grouped timeline
- [ ] 2.3 Implement Convex subscriptions (real-time)
- [ ] 2.4 Commit: "Phase 2: Core - KanbanBoard + ActivityFeed refactor"

### Phase 3: Polish (Final)
- [ ] 3.1 Finalize `NotificationPanel` styling
- [ ] 3.2 Add `ConnectionStatus` indicator with tooltip
- [ ] 3.3 Mobile responsive refinements
- [ ] 3.4 Performance optimization
- [ ] 3.5 Accessibility audit
- [ ] 3.6 Commit: "Phase 3: Polish + Optimization + Accessibility"

---

## 📝 Specific Changes Required

### Tailwind Config
**File:** `tailwind.config.ts`

```typescript
theme: {
  extend: {
    colors: {
      'mc-bg': '#0F0F0F',
      'mc-surface': '#1A1A1A',
      'mc-surface-hover': '#2A2A2A',
      'mc-surface-active': '#333333',
      'mc-border': '#333333',
      'mc-text': '#F5F5F5',
      'mc-text-muted': '#9CA3AF',
      'mc-text-subtle': '#6B7280',
      // ... rest of Wanda's palette
    },
  },
}
```

### Component Files to Rename/Refactor
```
src/components/
├── TopNav.tsx (was TopNavigation.tsx)
│   ├── Logo.tsx
│   ├── Search.tsx
│   ├── ConnectionStatus.tsx
│   ├── NotificationBell.tsx
│   ├── ThemeToggle.tsx
│   └── UserMenu.tsx
├── Sidebar/
│   ├── AgentSidebar.tsx (refactor with grouping)
│   ├── AgentGroup.tsx (new)
│   └── AgentCard.tsx (new)
├── KanbanBoard/
│   ├── KanbanBoard.tsx (refactor)
│   ├── TaskColumn.tsx (new)
│   └── TaskCard.tsx (update)
├── ActivityFeed/
│   ├── ActivityFeed.tsx (refactor for time grouping)
│   └── ActivityGroup.tsx (new)
├── NotificationPanel.tsx (was NotificationDropdown.tsx)
└── Skeletons/ (new)
    ├── TopNavSkeleton.tsx
    ├── AgentSidebarSkeleton.tsx
    └── TaskCardSkeleton.tsx
```

---

## 🎨 Visual Consistency Checklist

### Colors
- [ ] All `gray-*` classes → `mc-*` classes
- [ ] All hardcoded hex → Wanda's palette
- [ ] Hover states → `bg-mc-surface-hover`
- [ ] Active states → `border-accent-primary`
- [ ] Text contrast verified (7:1+ WCAG AAA)

### Spacing
- [ ] Component gaps: 12px (3 units)
- [ ] Section gaps: 24px (6 units)
- [ ] Padding: 16px (4 units) standard
- [ ] Sidebar: 240px (desktop), 80px (tablet), drawer (mobile)

### Typography
- [ ] H1: 32px, 700, line-height 1.2
- [ ] H2: 24px, 600, line-height 1.2
- [ ] H3: 18px, 600, line-height 1.3
- [ ] Body: 14px, 400, line-height 1.5
- [ ] Labels: 11px, 500, line-height 1.3

### Animations
- [ ] Transitions: 300ms default
- [ ] Status dot: pulse animation
- [ ] Drag-drop feedback
- [ ] Hover effects smooth
- [ ] 60fps performance

---

## 📞 Coordination with Wanda

### Phase 1 Deliverables
1. Screenshot of TopNav with correct colors
2. Screenshot of AgentSidebar with grouping
3. Mobile view of both components
4. Confirmation: "Colors match spec? ✅"

### Sign-Off Points
- [ ] Phase 1: TopNav + AgentSidebar color + layout match
- [ ] Phase 2: KanbanBoard layout + ActivityFeed grouping match
- [ ] Phase 3: Final polish + animations smooth

---

## 🚀 Next Steps

1. ✅ Read all 5 design documents (DONE)
2. ⏳ Update tailwind.config.ts with color system (START HERE)
3. ⏳ Refactor TopNav to match spec
4. ⏳ Refactor AgentSidebar with grouping
5. ⏳ Get Wanda's visual sign-off
6. ⏳ Continue to Phase 2
7. ⏳ Deploy with Wanda's approval

**Status:** Ready to start Phase 1 alignment

