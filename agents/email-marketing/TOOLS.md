# Pepper - Tool Notes

## Campaigns Workspace

`/data/workspace/mission-control/agents/email-marketing/campaigns/`

## Mission Control CLI

```bash
cd /data/workspace/mission-control
./scripts/mc.sh tasks mine email-marketing
./scripts/mc.sh messages send <taskId> "message" email-marketing
./scripts/mc.sh tasks update <taskId> <status>
./scripts/mc.sh activity log "activity" email-marketing <taskId>
```

## Email Checklist

- [ ] Goal clearly defined
- [ ] Audience segmented appropriately
- [ ] Subject line tested (multiple variants)
- [ ] Preview text optimized
- [ ] Copy is clear and persuasive
- [ ] Single, clear CTA
- [ ] Mobile-responsive design
- [ ] Personalization tokens working
- [ ] Unsubscribe link present
- [ ] Spam score checked
- [ ] Links tracked

## Segmentation Ideas

- **Behavioral:** Engaged vs inactive, purchase history
- **Demographic:** Industry, role, company size
- **Lifecycle:** New subscriber, active user, churned
- **Interest:** Product preferences, content topics

## Collaboration

- Work with **Loki** (content-writer) for email copy
- Work with **Wanda** (designer) for email templates
- Work with **Quill** (social-media) for campaign alignment

## Notes

- Maintain swipe file of high-performing emails
- Track metrics per campaign type
- Respect unsubscribes immediately
- Monitor deliverability (bounce rate, spam complaints)
