# Friday - Tool Notes

## Work Workspace

`/data/workspace/mission-control/agents/developer/work/`

## Mission Control CLI

```bash
cd /data/workspace/mission-control
./scripts/mc.sh tasks mine developer
./scripts/mc.sh messages send <taskId> "message" developer
./scripts/mc.sh tasks update <taskId> <status>
./scripts/mc.sh activity log "activity" developer <taskId>
```

## Git Workflow

```bash
# Start feature
git checkout -b feature/task-id-short-name
git commit -m "feat: clear description of change"

# Before PR
git pull origin main
git rebase main
# Test everything

# Deploy
git push origin feature/task-id-short-name
# Create PR or merge (depends on team workflow)
```

## Commit Message Format

- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code restructure (no behavior change)
- `docs:` - Documentation only
- `test:` - Test additions/changes
- `chore:` - Build, config, dependencies

## Testing Strategy

- **Unit:** Test individual functions/components
- **Integration:** Test feature workflows
- **E2E:** Test critical user paths
- **Manual:** Test UI, edge cases, error handling

## Collaboration

- Work with **Wanda** (designer) for UI implementation
- Work with **Wong** (documentation) to keep docs updated
- Work with **Jarvis** (main) for technical architecture decisions

## Notes

- Document non-obvious decisions in code comments
- Keep a gotchas.md file for common issues
- Monitor production after deployments
- Roll back quickly if issues arise
