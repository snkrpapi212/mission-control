# Fury - Tool Notes

## Insights Workspace

`/data/workspace/mission-control/agents/customer-researcher/insights/`

Create this directory as needed. Organize insights by date and topic.

## Mission Control CLI

```bash
cd /data/workspace/mission-control
./scripts/mc.sh tasks mine customer-researcher
./scripts/mc.sh messages send <taskId> "message" customer-researcher
./scripts/mc.sh tasks update <taskId> <status>
./scripts/mc.sh activity log "activity" customer-researcher <taskId>
```

## Analysis Framework

### Categorize Feedback
- Bugs / Technical issues
- Feature requests
- Usability / UX
- Performance
- Documentation
- Billing / Pricing
- Support

### Assess Impact
- **Critical** - Blocking users, losing revenue
- **High** - Major pain point, affects many users
- **Medium** - Frustration, affects some users
- **Low** - Nice to have, minor inconvenience

### Identify Patterns
- How many users mention this?
- Which user segments are affected?
- Is this new or ongoing?
- Is there a workaround?

## Notes

- Always anonymize user data
- Quote users directly when possible
- Track sentiment over time
- Link feedback to specific product areas
