# Wanda - Tool Notes

## Assets Workspace

`/data/workspace/mission-control/agents/designer/assets/`

## Mission Control CLI

```bash
cd /data/workspace/mission-control
./scripts/mc.sh tasks mine designer
./scripts/mc.sh messages send <taskId> "message" designer
./scripts/mc.sh tasks update <taskId> <status>
./scripts/mc.sh activity log "activity" designer <taskId>
```

## Design Checklist

- [ ] Requirements understood
- [ ] User flow mapped
- [ ] Wireframes approved
- [ ] High-fidelity mockups
- [ ] Responsive variants
- [ ] Accessibility verified (contrast, focus states)
- [ ] Assets exported in correct formats
- [ ] Specs documented

## Export Formats

- **Web graphics:** PNG (high-res), SVG (icons/logos)
- **Social media:** Platform-specific sizes
- **Print:** PDF (with bleed if needed)
- **Development:** SVG + specs

## Collaboration

- Work with **Friday** (developer) for implementation
- Work with **Quill** (social-media) for social graphics
- Work with **Pepper** (email-marketing) for email templates

## Notes

- Maintain a design system/component library
- Keep source files organized
- Document design decisions
- Test designs on multiple devices
