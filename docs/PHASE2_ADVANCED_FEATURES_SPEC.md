# Phase 2: Advanced Features — Design Specification

**Sprint:** Week 2 (2026-02-17 to 2026-02-24)  
**Status:** DESIGN SPEC READY  
**Coordination:** Designer (Wanda) → Developer (Friday)

---

## Feature 1: Command Palette (Cmd+K)

### UX Flow
1. User presses `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux)
2. Full-screen modal appears (backdrop blur)
3. Search input focused with placeholder: "Search tasks, agents, actions..."
4. Results populate below (live filtering)
5. Arrow keys navigate, Enter selects

### Design

**Modal Container:**
- Full viewport overlay
- Background: `var(--mc-bg)` with opacity 0.8 + blur
- Input box centered, width max-w-2xl
- Results list below (max-height: 60vh, scrollable)

**Input Styling:**
- Size: 48px height (large, prominent)
- Border: `2px solid var(--mc-accent-green)` when focused
- Font: 16px (prevents mobile zoom)
- Placeholder: `var(--mc-text-muted)`
- Icon: Search glass (left side, 20px)

**Result Item Structure:**
```
[Icon] Action Name
       Keyboard shortcut (right-aligned, muted)
```

**Result Types & Icons:**
- Task: 📋 "Create task"
- Search task: 🔍 "Search: [query]"
- Jump to agent: 👤 "Go to [Agent Name]"
- Action: ⚡ "Mark complete", "Archive", "Share"

**Keyboard Shortcuts:**
- `Cmd+K` / `Ctrl+K` → Open palette
- `Esc` → Close
- `↑` `↓` → Navigate
- `Enter` → Select
- `⌘+↵` → New task

### Animation
- Entrance: Fade in + scale from center (200ms)
- Exit: Fade out (150ms)
- Results: Stagger fade-in (50ms per item)

---

## Feature 2: Task Detail Modal (Redesign)

### Layout

**Header (sticky, 64px):**
- Title (bold, 18px)
- Close button (X icon)
- Divider

**Content (scrollable):**
- Description (rich text / markdown rendered)
- Metadata row (status, priority, assignee, created date)
- Tabs: Messages | Docs | Activity

**Tabs Content:**

#### Tab 1: Messages
- Comment thread (reverse chronological)
- Each comment: avatar, name, timestamp, content, actions (edit/delete if owned)
- New comment input at bottom (always visible)
- @mention autocomplete (triggered on `@`, shows agents)
- Upload button for files (emoji icon)

#### Tab 2: Documents
- List of attached docs (title, type badge, size, created date)
- Each doc: preview on hover, delete button
- "Add document" button (upload or create new)

#### Tab 3: Activity
- Timeline of all changes (status updates, comments, assignments)
- Each entry: icon, agent name, action, timestamp
- Grouped by day

### Design Details

**Metadata Row:**
```
Status: [Dropdown]  |  Priority: [Badge]  |  Assigned to: [Avatar] [Name]
Created: [Date]     |  Updated: [Time ago]
```

**Comment:**
```
[Avatar] Name  [timestamp] [edit] [delete]
[Content text, may span multiple lines]
[Attachments: file1.pdf file2.doc]
```

**Comment Input:**
- Textarea (auto-expand, min 2 rows)
- Placeholder: "Add a comment... (@mention available)"
- Buttons: Emoji picker, attachment, send (right-aligned)
- Submit on Cmd+Enter

**Markdown Support:**
- `**bold**` → **bold**
- `_italic_` → _italic_
- `` `code` `` → `code`
- `- list item` → bulleted list
- Links: `[text](url)`

### Animation
- Modal entrance: Slide from right + fade (250ms)
- Tab switch: Cross-fade (150ms)
- New comment arrives: Slide up + fade (200ms)

---

## Feature 3: Smart Filters

### Filter UI

**Location:** Top of kanban board (filter bar)

**Filter Types:**
1. **Status Multi-Select** (dropdown)
   - Show selected count: "Status (2)"
   - Checkboxes for: All / Inbox / Assigned / In Progress / Review / Done / Blocked
   - "Clear all" button inside

2. **Agent Filter** (dropdown or chips)
   - Search input: "Filter by agent..."
   - Chips for selected agents (removable)
   - Shows avatar + name

3. **Priority Filter** (radio or single-select)
   - P0 / P1 / P2 / P3 / All

4. **Custom Presets** (dropdown)
   - "My Tasks" → assigned to me
   - "Urgent" → P0 + (Inbox | Assigned | In Progress)
   - "Blocked" → status = blocked
   - "Save current as..." button to create new preset

### Design

**Filter Bar:**
- Horizontal scroll on mobile (chips)
- Sticky below the "Mission Queue" header
- Background: Subtle contrast, `var(--mc-card)` with border

**Dropdown:**
- Max-width: 240px
- Shadow: `var(--mc-shadow)`
- Border: `var(--mc-border)`
- Checkboxes or radio buttons

**Chips (selected filters):**
- Removable with × icon
- Color-coded by type (status=blue, agent=green, priority=red)
- Click to open dropdown for that filter

**Save Preset Modal:**
- Input: "Preset name" (e.g., "Q1 Priority Tasks")
- Buttons: Cancel / Save
- Saves to localStorage + Convex

### Fuzzy Search (within filters)
- Real-time filtering as user types
- Highlights matching text
- Shows match count

---

## Feature 4: Dashboard Customization

### Customization Panel (toggle in top-right)

**Layout Options:**
- Column density: Compact / Normal / Spacious
- Card density: Low / Medium / High (affects padding + font sizes)

**Panel Management:**
- Toggle visibility: Agents sidebar, Activity feed, Notifications
- Reorder: Drag columns in kanban

**Preferences (localStorage):**
- Theme (light/dark)
- Density
- Panel visibility
- Filter presets
- Column order

### Design

**Settings Cog Icon (top-right nav):**
- Opens slide-out panel (right side, width 360px)
- Close button (X)
- Sections:
  - Display (theme, density)
  - Panels (checkboxes for visibility)
  - Presets (manage filter presets)
  - About (version, shortcuts)

**Density Toggle:**
```
Compact    | Normal [selected] | Spacious
[visual preview of each]
```

**Reorder Columns:**
- Drag-handle on each column header (6 dots icon)
- Persists to localStorage

---

## Phase 2 Success Criteria

- [ ] Command palette open/close/search working smoothly
- [ ] Task modal: all 3 tabs functional
- [ ] @mention autocomplete works
- [ ] Smart filters functional + presets saveable
- [ ] Customization persists (localStorage)
- [ ] All animations smooth (60fps)
- [ ] Mobile: command palette & filters responsive
- [ ] Accessibility: keyboard nav through modals + tabs

---

## Developer Handoff

**Libraries needed:**
- `cmdk` or `kbar` (command palette)
- `react-hook-form` (modal form handling)
- `react-markdown` (markdown rendering in comments)
- `date-fns` (timeline formatting)

**Key Integration Points:**
- Convex mutation: `createMessage`, `updateTask`
- Real-time: subscribe to task changes for activity timeline
- State: Zustand for customization prefs + filter state

**Testing Focus:**
- Keyboard shortcuts (@, mentions, Cmd+K)
- Markdown rendering edge cases
- Mobile responsiveness in modals
- Accessibility: screen reader announces new comments
