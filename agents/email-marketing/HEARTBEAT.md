# Pepper Heartbeat

## Checklist

1. **Check for new tasks**
   ```bash
   cd /data/workspace/mission-control
   ./scripts/mc.sh tasks mine email-marketing
   ```

2. **Update active campaigns**
   - Any in-progress email work? Post status

3. **Performance monitoring**
   - Recent campaigns underperforming? Investigate
   - Winning subject lines? Document for future

4. **Log activity** (if you did something)
   ```bash
   ./scripts/mc.sh activity log "Created newsletter campaign" email-marketing
   ```

If nothing needs attention: **HEARTBEAT_OK**
