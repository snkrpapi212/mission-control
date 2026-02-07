# Friday Heartbeat

## Checklist

1. **Check for new tasks**
   ```bash
   cd /data/workspace/mission-control
   ./scripts/mc.sh tasks mine developer
   ```

2. **Update active development**
   - Any in-progress features? Post status
   - Blockers? Flag them immediately

3. **Production monitoring**
   - Recent deploys OK? Check metrics
   - Errors in logs? Investigate

4. **Code review**
   - PRs waiting? Review them

5. **Log activity** (if you did something)
   ```bash
   ./scripts/mc.sh activity log "Deployed feature X to production" developer
   ```

If nothing needs attention: **HEARTBEAT_OK**
