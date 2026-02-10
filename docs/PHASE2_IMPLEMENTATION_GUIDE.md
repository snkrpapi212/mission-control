# Phase 2 Implementation Guide

**Status:** READY TO START  
**Estimated Time:** 7-10 days  
**Branch:** `feature/phase2-advanced`  
**Parent Task:** js721zce65dnb5d0ke3hkpfms980xnb3  
**Spec:** `/data/workspace/mission-control/docs/PHASE2_ADVANCED_FEATURES_SPEC.md`

---

## Implementation Order

### Week 2 Day 1-2: Command Palette (Cmd+K)

**Goal:** Global search and command execution via keyboard shortcut

**Libraries:**
```bash
npm install cmdk
# OR
npm install kbar
```

**Files to create:**
- `src/components/CommandPalette.tsx` - Main component
- `src/hooks/useCommandPalette.ts` - State management + keyboard handling
- `src/lib/commands.ts` - Command registry

**Implementation steps:**

1. **Install cmdk** (recommended - lighter than kbar)
   ```bash
   npm install cmdk
   ```

2. **Create CommandPalette component**
   ```tsx
   // src/components/CommandPalette.tsx
   import { Command } from 'cmdk'
   
   export function CommandPalette({ open, onOpenChange }) {
     return (
       <Command.Dialog open={open} onOpenChange={onOpenChange}>
         <Command.Input placeholder="Search tasks, agents, actions..." />
         <Command.List>
           <Command.Empty>No results found.</Command.Empty>
           <Command.Group heading="Tasks">
             {/* Task results */}
           </Command.Group>
           <Command.Group heading="Agents">
             {/* Agent results */}
           </Command.Group>
           <Command.Group heading="Actions">
             {/* Action results */}
           </Command.Group>
         </Command.List>
       </Command.Dialog>
     )
   }
   ```

3. **Add global keyboard shortcut** (Cmd+K / Ctrl+K)
   ```tsx
   // src/hooks/useCommandPalette.ts
   export function useCommandPalette() {
     const [open, setOpen] = useState(false)
     
     useEffect(() => {
       const down = (e: KeyboardEvent) => {
         if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
           e.preventDefault()
           setOpen((open) => !open)
         }
       }
       document.addEventListener('keydown', down)
       return () => document.removeEventListener('keydown', down)
     }, [])
     
     return { open, setOpen }
   }
   ```

4. **Integrate with Convex data**
   - Query tasks: `useQuery(api.tasks.getAll)`
   - Query agents: `useQuery(api.agents.getAll)`
   - Filter results based on search input
   - Navigate on Enter key

5. **Style per spec**
   - Full-screen overlay with backdrop blur
   - Centered input box (max-w-2xl)
   - Results list below (max-height: 60vh)
   - Animations: fade + scale (200ms entrance)

**Success criteria:**
- ✅ Cmd+K / Ctrl+K opens palette
- ✅ Esc closes it
- ✅ Arrow keys navigate results
- ✅ Enter selects result
- ✅ Search filters tasks, agents, actions in real-time
- ✅ Animations smooth (60fps)

---

### Week 2 Day 3-5: Task Detail Modal Redesign

**Goal:** Rich task detail view with tabs for messages, docs, and activity

**Libraries:**
```bash
npm install react-hook-form react-markdown @radix-ui/react-tabs
```

**Files to create/modify:**
- `src/components/TaskDetailModal.tsx` - Main modal component
- `src/components/TaskMessages.tsx` - Messages tab
- `src/components/TaskDocuments.tsx` - Documents tab
- `src/components/TaskActivity.tsx` - Activity tab
- `src/hooks/useTaskDetail.ts` - Data fetching + mutations

**Implementation steps:**

1. **Create modal shell with tabs**
   ```tsx
   // src/components/TaskDetailModal.tsx
   import * as Tabs from '@radix-ui/react-tabs'
   
   export function TaskDetailModal({ taskId, open, onOpenChange }) {
     const task = useQuery(api.tasks.getById, { id: taskId })
     
     return (
       <Dialog open={open} onOpenChange={onOpenChange}>
         <DialogContent>
           {/* Header */}
           <DialogHeader>
             <DialogTitle>{task?.title}</DialogTitle>
           </DialogHeader>
           
           {/* Metadata */}
           <TaskMetadata task={task} />
           
           {/* Tabs */}
           <Tabs.Root defaultValue="messages">
             <Tabs.List>
               <Tabs.Trigger value="messages">Messages</Tabs.Trigger>
               <Tabs.Trigger value="docs">Documents</Tabs.Trigger>
               <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
             </Tabs.List>
             
             <Tabs.Content value="messages">
               <TaskMessages taskId={taskId} />
             </Tabs.Content>
             
             <Tabs.Content value="docs">
               <TaskDocuments taskId={taskId} />
             </Tabs.Content>
             
             <Tabs.Content value="activity">
               <TaskActivity taskId={taskId} />
             </Tabs.Content>
           </Tabs.Root>
         </DialogContent>
       </Dialog>
     )
   }
   ```

2. **Implement Messages tab**
   - Fetch messages: `useQuery(api.messages.getByTask, { taskId })`
   - Render message thread (reverse chronological)
   - Add new message input with textarea
   - Implement @mention autocomplete
   - File upload button
   - Markdown rendering via `react-markdown`

3. **Implement Documents tab**
   - List attached documents
   - Upload new document
   - Delete document (with confirmation)
   - Preview on hover

4. **Implement Activity tab**
   - Fetch activities: `useQuery(api.activities.getByTask, { taskId })`
   - Timeline view with icons
   - Group by day
   - Auto-update on new activity

5. **Add animations**
   - Modal entrance: slide from right + fade (250ms)
   - Tab switch: cross-fade (150ms)
   - New message: slide up + fade (200ms)

**Success criteria:**
- ✅ Modal opens on task card click
- ✅ All 3 tabs functional
- ✅ Messages: post, @mention, upload
- ✅ Markdown renders correctly
- ✅ Documents: list, upload, delete
- ✅ Activity timeline updates in real-time
- ✅ Animations smooth

---

### Week 2 Day 6-7: Smart Filters

**Goal:** Advanced filtering system with presets

**Files to create:**
- `src/components/FilterBar.tsx` - Filter UI
- `src/components/FilterDropdown.tsx` - Individual filter dropdowns
- `src/hooks/useFilters.ts` - Filter state management
- `src/lib/filterPresets.ts` - Preset definitions

**Implementation steps:**

1. **Create filter bar component**
   ```tsx
   // src/components/FilterBar.tsx
   export function FilterBar() {
     const { filters, setFilter, clearFilters } = useFilters()
     
     return (
       <div className="filter-bar sticky top-0 bg-mc-card border-b border-mc-border">
         <div className="flex gap-2 p-3">
           <FilterDropdown
             type="status"
             label="Status"
             options={['inbox', 'assigned', 'in_progress', 'review', 'done']}
             value={filters.status}
             onChange={(v) => setFilter('status', v)}
           />
           
           <FilterDropdown
             type="agent"
             label="Agent"
             options={agents}
             value={filters.agent}
             onChange={(v) => setFilter('agent', v)}
           />
           
           <FilterDropdown
             type="priority"
             label="Priority"
             options={['urgent', 'high', 'medium', 'low']}
             value={filters.priority}
             onChange={(v) => setFilter('priority', v)}
           />
           
           <PresetDropdown />
           
           {hasActiveFilters && (
             <button onClick={clearFilters}>Clear all</button>
           )}
         </div>
         
         {/* Active filter chips */}
         <ActiveFilters filters={filters} />
       </div>
     )
   }
   ```

2. **Implement filter dropdowns**
   - Multi-select for status
   - Agent search with chips
   - Priority radio buttons
   - Fuzzy search within dropdowns

3. **Create preset system**
   - Save current filters as preset
   - Load preset
   - Delete preset
   - Persist to localStorage + Convex

4. **Apply filters to task list**
   ```tsx
   const filteredTasks = useMemo(() => {
     return tasks.filter(task => {
       if (filters.status.length && !filters.status.includes(task.status)) return false
       if (filters.agent.length && !task.assigneeIds.some(id => filters.agent.includes(id))) return false
       if (filters.priority && task.priority !== filters.priority) return false
       return true
     })
   }, [tasks, filters])
   ```

**Success criteria:**
- ✅ Multi-select filters work
- ✅ Presets save/load correctly
- ✅ Filter chips show active filters
- ✅ Fuzzy search within filters
- ✅ Performance: filters 500+ tasks smoothly

---

### Week 2 Day 8-10: Dashboard Customization

**Goal:** User preferences for layout, density, and panel visibility

**Files to create:**
- `src/components/SettingsPanel.tsx` - Settings slide-out
- `src/hooks/useCustomization.ts` - Customization state
- `src/lib/customizationPresets.ts` - Default presets

**Implementation steps:**

1. **Create settings panel**
   ```tsx
   // src/components/SettingsPanel.tsx
   export function SettingsPanel({ open, onOpenChange }) {
     const { density, setDensity, panelVisibility, setPanelVisibility } = useCustomization()
     
     return (
       <Sheet open={open} onOpenChange={onOpenChange}>
         <SheetContent side="right" className="w-96">
           <SheetHeader>
             <SheetTitle>Settings</SheetTitle>
           </SheetHeader>
           
           <div className="space-y-6">
             {/* Density */}
             <section>
               <h3>Density</h3>
               <RadioGroup value={density} onValueChange={setDensity}>
                 <RadioGroupItem value="compact">Compact</RadioGroupItem>
                 <RadioGroupItem value="normal">Normal</RadioGroupItem>
                 <RadioGroupItem value="spacious">Spacious</RadioGroupItem>
               </RadioGroup>
             </section>
             
             {/* Panel visibility */}
             <section>
               <h3>Panels</h3>
               <Checkbox
                 checked={panelVisibility.agents}
                 onCheckedChange={(v) => setPanelVisibility('agents', v)}
               >
                 Agents Sidebar
               </Checkbox>
               <Checkbox
                 checked={panelVisibility.activity}
                 onCheckedChange={(v) => setPanelVisibility('activity', v)}
               >
                 Activity Feed
               </Checkbox>
             </section>
           </div>
         </SheetContent>
       </Sheet>
     )
   }
   ```

2. **Implement density controls**
   - Compact: reduce padding, font sizes
   - Normal: default
   - Spacious: increase padding, font sizes
   - Apply CSS variables dynamically

3. **Panel visibility toggles**
   - Hide/show agents sidebar
   - Hide/show activity feed
   - Persist to localStorage

4. **Column reordering** (bonus)
   - Drag-drop column headers
   - Persist order to localStorage

**Success criteria:**
- ✅ Density changes apply globally
- ✅ Panel toggles work
- ✅ Settings persist across sessions
- ✅ Smooth transitions between density levels

---

## Final Checklist

Before marking Phase 2 complete:

- [ ] Command palette functional (Cmd+K)
- [ ] Task modal: all 3 tabs working
- [ ] @mention autocomplete works
- [ ] Smart filters + presets functional
- [ ] Customization panel working
- [ ] All animations smooth (60fps)
- [ ] Mobile responsive
- [ ] TypeScript strict mode passing
- [ ] Lighthouse >90
- [ ] Commits pushed to `feature/phase2-advanced` branch
- [ ] PR created for review
- [ ] Screenshots added to docs/

---

## Developer Notes

**State Management:**
- Use Zustand for customization preferences
- Use React Context for filter state (avoid prop drilling)
- Convex queries for all server data

**Performance:**
- Lazy-load modals (React.lazy)
- Debounce search inputs (300ms)
- Virtualize long lists (react-window or @tanstack/react-virtual)

**Accessibility:**
- Keyboard nav through all modals
- ARIA labels on all interactive elements
- Focus management (trap focus in modals)
- Screen reader announces updates

**Testing:**
- Unit tests for filter logic
- Integration tests for command palette
- E2E tests for task modal workflow

---

**Questions?** Check the full spec at `/data/workspace/mission-control/docs/PHASE2_ADVANCED_FEATURES_SPEC.md`
