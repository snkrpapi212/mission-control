# Mission Control Agents - Quick Start Guide

## 🚀 Ready to Deploy

All 10 agents are configured and ready. Here's how to activate them.

## Step 1: Apply OpenClaw Config

```bash
# Backup current config
cp /data/.openclaw/openclaw.json /data/.openclaw/openclaw.json.backup

# Edit config (add agents from PHASE2_CONFIG_PATCH.json)
# Add all agent entries to agents.list array

# Restart OpenClaw
openclaw gateway restart
```

## Step 2: Test Agent Communication

```bash
# Talk to Jarvis (Squad Lead)
openclaw chat @jarvis "Hello! Check on the team status"

# Assign work to specialists
openclaw chat @shuri "Research our top 3 competitors"
openclaw chat @loki "Write a blog post about our new feature"
openclaw chat @wanda "Design a landing page mockup"
```

## Step 3: Agents Check Mission Control

Each agent will automatically:
1. Check their assigned tasks every heartbeat (~30 min)
2. Update task status as they work
3. Post messages and activity logs
4. Report to Jarvis for coordination

## The Squad

- **Jarvis** (main) 🤖 - Squad Lead, delegates and coordinates
- **Shuri** (product-analyst) 🔍 - Market research
- **Fury** (customer-researcher) 🕵️ - User feedback
- **Vision** (seo-analyst) 📊 - SEO optimization
- **Loki** (content-writer) ✍️ - Content creation
- **Quill** (social-media) 📱 - Social media
- **Wanda** (designer) 🎨 - Design work
- **Pepper** (email-marketing) 📧 - Email campaigns
- **Friday** (developer) 💻 - Coding
- **Wong** (documentation) 📚 - Documentation

## Mission Control Dashboard

View tasks, messages, and activity:
https://mission-control-production-05fb.up.railway.app/dashboard

## CLI Commands for Agents

```bash
# Check my tasks
./scripts/mc.sh tasks mine <agentId>

# Update task status
./scripts/mc.sh tasks update <taskId> <agentId> --status in_progress

# Post message
./scripts/mc.sh messages send <taskId> "Update here" <agentId>

# Log activity
./scripts/mc.sh activity log task_update <agentId> "Completed research"

# Update my status
./scripts/mc.sh agents status <agentId> working
```

## Architecture Flow

```
Human → OpenClaw → Agent → mc.sh → Convex → Mission Control Dashboard
                     ↑                          ↓
                     └──────── Heartbeat ───────┘
```

## Files Created

- `agents/` - 10 agent workspaces (50 files)
- `scripts/mc.sh` - CLI wrapper (280 lines, tested)
- `PHASE2_CONFIG_PATCH.json` - OpenClaw config
- `PHASE2_COMPLETE.md` - Full documentation
- `QUICK_START.md` - This file

## Next Actions

1. ✅ Review PHASE2_CONFIG_PATCH.json
2. ⬜ Apply config to OpenClaw
3. ⬜ Restart gateway
4. ⬜ Test agent interactions
5. ⬜ Create test tasks in dashboard
6. ⬜ Watch agents work

## Status

🎯 **Phase 2: COMPLETE**  
📦 **Committed to:** dev branch  
🚀 **Ready to:** Apply config and activate agents

---

Need help? Check PHASE2_COMPLETE.md for full details.
