# Mission Control

Multi-agent AI squad manager built on Convex + Next.js + TypeScript + Tailwind + Vitest.

## Project Status

### ✅ Phase 1: Complete
- 6-table Convex schema (agents, tasks, messages, documents, activities, notifications)
- Full CRUD backend functions for all tables
- Auto-subscribe & @mention notification system
- Seed data for 10 agent squad
- Unit tests for all modules
- GitHub Actions CI pipeline

## Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend:** Convex (serverless database + functions)
- **Testing:** Vitest, React Testing Library
- **Dev Tools:** ESLint, TypeScript, Node 22

## Quick Start

### Setup

```bash
npm install
npx convex init
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Testing

```bash
npm test        # Run once
npm run test:watch   # Watch mode
npm run test:coverage  # Coverage report
```

### Lint & Type Check

```bash
npm run lint      # ESLint
npm run typecheck   # TypeScript
```

### Build

```bash
npm run build
npm start
```

## Directory Structure

```
mission-control/
├── src/
│   ├── app/             # Next.js app directory
│   ├── components/      # React components (Phase 4)
│   ├── hooks/          # Custom hooks (Phase 4)
│   ├── lib/            # Utilities
│   ├── types/          # TypeScript types
│   └── test/           # Test setup
├── convex/
│   ├── schema.ts       # Convex database schema
│   ├── agents.ts       # Agent queries & mutations
│   ├── tasks.ts        # Task queries & mutations
│   ├── messages.ts     # Message queries & mutations
│   ├── documents.ts    # Document queries & mutations
│   ├── activities.ts   # Activity queries & mutations
│   ├── notifications.ts # Notification queries & mutations
│   ├── seed.ts         # Seed data
│   └── tests/          # Integration tests
├── .github/workflows/  # GitHub Actions CI/CD
├── vitest.config.ts    # Vitest configuration
├── tsconfig.json       # TypeScript configuration
├── tailwind.config.ts  # Tailwind CSS configuration
└── README.md
```

## The Squad (10 Agents)

| # | Agent | Name | Role | Level |
|---|-------|------|------|-------|
| 1 | main | Jarvis | Squad Lead | LEAD |
| 2 | product-analyst | Shuri | Product Analyst | SPC |
| 3 | customer-researcher | Fury | Customer Researcher | SPC |
| 4 | seo-analyst | Vision | SEO Analyst | SPC |
| 5 | content-writer | Loki | Content Writer | SPC |
| 6 | social-media | Quill | Social Media Manager | INT |
| 7 | designer | Wanda | Designer | SPC |
| 8 | email-marketing | Pepper | Email Marketing | INT |
| 9 | developer | Friday | Developer | SPC |
| 10 | documentation | Wong | Documentation | SPC |

## Upcoming Phases

- **Phase 2:** OpenClaw agent workspaces + heartbeat crons
- **Phase 3:** Notification daemon (polling Convex, delivery)
- **Phase 4:** React dashboard (Kanban board, activity feed, agent sidebar)
- **Phase 5:** Daily standup automation + production deployment

## License

MIT
