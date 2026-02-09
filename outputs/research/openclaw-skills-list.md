# OpenClaw Skills - Comprehensive Research List

**Last Updated:** February 9, 2026  
**Research Sources:** ClawHub, GitHub (openclaw/skills, VoltAgent/awesome-openclaw-skills), OpenClaw Documentation, Installed Skills (/openclaw/skills/)

---

## Overview

OpenClaw is a locally-running AI assistant that operates directly on your machine. **Skills** extend its capabilities by teaching the agent how to interact with external services, automate workflows, and perform specialized tasks. 

As of February 2026:
- **5,705+ community-built skills** are available on ClawHub (OpenClaw's public skills registry)
- **2,999 curated skills** in the Awesome OpenClaw Skills list
- **54 skills** bundled with the default OpenClaw installation

This document compiles **20+ highly useful skills** organized by category, with installation commands and source URLs.

---

## Quick Installation

### Using ClawHub CLI (Recommended)
```bash
npx clawhub@latest install <skill-slug>
```

### Manual Installation
Copy the skill folder to one of these locations:

| Location | Path |
|----------|------|
| Global | `~/.openclaw/skills/` |
| Workspace | `<project>/skills/` |

**Priority:** Workspace > Local > Bundled

---

## 📦 Skill Categories

### 1. Development & Coding

#### **coding-agent** ⭐⭐⭐⭐⭐
Run Codex CLI, Claude Code, OpenCode, or Pi Coding Agent for software development tasks.

- **Description:** Comprehensive skill for orchestrating coding agents. Supports multiple agent backends including OpenAI Codex, Claude Code, OpenCode, and Pi Coding Agent. Use for automated code generation, refactoring, bug fixes, and complex development workflows.
- **Category:** Development & Coding
- **Source URL:** https://github.com/openclaw/skills/tree/main/skills/steipete/coding-agent
- **Installation:** `npx clawhub@latest install coding-agent`
- **Requirements:** Requires `codex`, `claude`, `opencode`, or `pi` CLI installed

---

#### **github** ⭐⭐⭐⭐⭐
Interact with GitHub using the `gh` CLI.

- **Description:** Manage issues, pull requests, CI runs, and API queries via GitHub CLI. Essential for developers working with GitHub repositories. Supports PR checks, workflow runs, and structured JSON output.
- **Category:** Development & Coding / Git & GitHub
- **Source URL:** https://github.com/openclaw/skills/tree/main/skills/steipete/github
- **Installation:** `npx clawhub@latest install github`
- **Requirements:** `gh` CLI (`brew install gh` or `apt install gh`)

---

#### **git-essentials** ⭐⭐⭐⭐
Essential Git commands and workflows for version control.

- **Description:** Covers common Git operations including commit, push, pull, branch management, merge conflict resolution, and advanced workflows. Essential for any development work.
- **Category:** Development & Coding / Git & GitHub
- **Source URL:** https://github.com/openclaw/skills/tree/main/skills/arnarsson/git-essentials
- **Installation:** `npx clawhub@latest install git-essentials`
- **Requirements:** `git` on PATH

---

#### **docker-essentials** ⭐⭐⭐⭐
Essential Docker commands and workflows for container development.

- **Description:** Docker container management including image operations, container lifecycle, docker-compose, and container networking. Useful for DevOps and development environments.
- **Category:** Development & Coding / DevOps
- **Source URL:** https://github.com/openclaw/skills/tree/main/skills/arnarsson/docker-essentials
- **Installation:** `npx clawhub@latest install docker-essentials`
- **Requirements:** `docker` on PATH

---

### 2. Communication & Messaging

#### **discord** ⭐⭐⭐⭐⭐
Control Discord from OpenClaw via the discord tool.

- **Description:** Full Discord bot capabilities including sending messages, reactions, polls, sticker uploads, thread management, channel management, moderation actions, and bot presence control. Perfect for team notifications and automation.
- **Category:** Communication
- **Source URL:** https://github.com/openclaw/skills/tree/main/skills/steipete/discord
- **Installation:** Bundled with OpenClaw
- **Requirements:** Discord bot token configured in OpenClaw

---

#### **slack** ⭐⭐⭐⭐
Control Slack from OpenClaw via the slack tool.

- **Description:** Manage Slack messages, reactions, pins, and member information. Useful for team communication automation and notifications.
- **Category:** Communication
- **Source URL:** https://github.com/openclaw/skills/tree/main/skills/steipete/slack
- **Installation:** Bundled with OpenClaw
- **Requirements:** Slack bot token configured in OpenClaw

---

#### **himalaya** ⭐⭐⭐⭐
CLI email client for reading, composing, and sending emails.

- **Description:** Terminal-based email management supporting multiple accounts (Gmail, IMAP). Use for checking emails, composing new messages, and managing mailboxes without leaving the terminal.
- **Category:** Communication / Email
- **Source URL:** https://github.com/openclaw/skills/tree/main/skills/steipete/himalaya
- **Installation:** `npx clawhub@latest install himalaya`
- **Requirements:** `himalaya` CLI (`brew install himalaya`)

---

### 3. Productivity & Task Management

#### **things-mac** ⭐⭐⭐⭐
Manage Things 3 via the `things` CLI on macOS.

- **Description:** Task management for Things 3 users. Add/update projects and todos via URL scheme, read/search/list from the local Things database. Perfect for macOS users who rely on Things 3.
- **Category:** Productivity & Task Management
- **Source URL:** https://github.com/openclaw/skills/tree/main/skills/steipete/things-mac
- **Installation:** Bundled with OpenClaw (macOS only)
- **Requirements:** macOS, Things 3 app, `things` CLI (`go install github.com/ossianhempel/things3-cli/cmd/things@latest`)

---

#### **apple-notes** ⭐⭐⭐⭐
Manage Apple Notes via the `memo` CLI on macOS.

- **Description:** Create, view, edit, delete, search, move, and export notes from Apple Notes. macOS-only skill for users who prefer native note-taking.
- **Category:** Productivity & Notes
- **Source URL:** https://github.com/openclaw/skills/tree/main/skills/steipete/apple-notes
- **Installation:** Bundled with OpenClaw (macOS only)
- **Requirements:** macOS, `memo` CLI (`brew tap antoniorodr/memo && brew install antoniorodr/memo/memo`)

---

#### **obsidian** ⭐⭐⭐⭐
Work with Obsidian vaults (plain Markdown notes) via obsidian-cli.

- **Description:** Obsidian vault management including note creation, search (by name and content), movement with automatic wikilink updates, and deletion. Perfect for PKM (Personal Knowledge Management) enthusiasts.
- **Category:** Productivity & Notes / PKM
- **Source URL:** https://github.com/openclaw/skills/tree/main/skills/steipete/obsidian
- **Installation:** Bundled with OpenClaw
- **Requirements:** `obsidian-cli` (`brew install yakitrak/yakitrak/obsidian-cli`)

---

#### **notion** ⭐⭐⭐⭐
Notion API for creating and managing pages, databases, and blocks.

- **Description:** Full Notion integration for creating, reading, updating, and deleting pages, databases (data sources), and blocks. Essential for users who rely on Notion as their workspace.
- **Category:** Productivity & Notes / Database
- **Source URL:** https://github.com/openclaw/skills/tree/main/skills/steipete/notion
- **Installation:** Bundled with OpenClaw
- **Requirements:** `NOTION_API_KEY` environment variable

---

### 4. Utilities & System Tools

#### **1password** ⭐⭐⭐⭐⭐
Set up and use 1Password CLI (`op`) for secret management.

- **Description:** Secure credential management via 1Password. Install CLI, enable desktop app integration, sign in, and read/inject/run secrets. Essential for secure credential handling in workflows.
- **Category:** Utilities & Security
- **Source URL:** https://github.com/openclaw/skills/tree/main/skills/steipete/1password
- **Installation:** Bundled with OpenClaw
- **Requirements:** `op` CLI (`brew install --cask 1password-cli`), 1Password account

---

#### **tmux** ⭐⭐⭐⭐⭐
Remote-control tmux sessions for interactive CLIs.

- **Description:** Advanced tmux session management for running interactive terminal applications. Essential for CLIs that require TTY interaction (like Claude Code, Codex, or authenticated commands).
- **Category:** Utilities & System Tools
- **Source URL:** https://github.com/openclaw/skills/tree/main/skills/steipete/tmux
- **Installation:** Bundled with OpenClaw
- **Requirements:** `tmux` on PATH

---

#### **weather** ⭐⭐⭐
Get current weather and forecasts (no API key required).

- **Description:** Quick weather information using wttr.in or Open-Meteo. No API keys needed. Perfect for quick weather checks in workflows or conversations.
- **Category:** Utilities & Information
- **Source URL:** https://github.com/openclaw/skills/tree/main/skills/steipete/weather
- **Installation:** Bundled with OpenClaw
- **Requirements:** `curl` on PATH

---

### 5. Content & Media

#### **summarize** ⭐⭐⭐⭐
Summarize or extract text/transcripts from URLs, podcasts, and local files.

- **Description:** Powerful summarization tool supporting URLs, local files, PDFs, and YouTube videos. Uses various AI models (OpenAI, Anthropic, Google Gemini, xAI). Great fallback for transcribing videos.
- **Category:** Content & Media / AI Tools
- **Source URL:** https://github.com/openclaw/skills/tree/main/skills/steipete/summarize
- **Installation:** Bundled with OpenClaw
- **Requirements:** `summarize` CLI (`brew install steipete/tap/summarize`), API keys for various providers

---

#### **nano-pdf** ⭐⭐⭐
Extract text and summaries from PDF documents.

- **Description:** PDF processing capability for extracting text and generating summaries from PDF documents. Useful for processing reports, papers, and documentation.
- **Category:** Content & Media / Documents
- **Source URL:** https://github.com/openclaw/skills/tree/main/skills/steipete/nano-pdf
- **Installation:** `npx clawhub@latest install nano-pdf`
- **Requirements:** Various PDF tools (pup, qpdf, pdftotext)

---

#### **canvas** ⭐⭐⭐⭐
Control node canvases (present/hide/navigate/eval/snapshot).

- **Description:** Canvas rendering and control for creating presentations, visual outputs, and interactive displays. Use with the canvas tool for rich visual experiences.
- **Category:** Content & Media / Presentation
- **Source URL:** https://github.com/openclaw/skills/tree/main/skills/steipete/canvas
- **Installation:** Bundled with OpenClaw
- **Requirements:** Canvas node configured

---

### 6. Apple Ecosystem (macOS)

#### **apple-reminders** ⭐⭐⭐
Manage Apple Reminders via the `remind` CLI on macOS.

- **Description:** Create, view, complete, and manage reminders using Apple's Reminders app. Quick way to add tasks and check off items through natural language.
- **Category:** Apple Ecosystem / Productivity
- **Source URL:** https://github.com/openclaw/skills/tree/main/skills/steipete/apple-reminders
- **Installation:** Bundled with OpenClaw (macOS only)
- **Requirements:** macOS, Apple Reminders app

---

#### **bear-notes** ⭐⭐⭐
Work with Bear notes via Bear-CLI.

- **Description:** Bear note management for users who prefer this Markdown-based note-taking app. Create, search, and manage notes with Bear's elegant interface.
- **Category:** Apple Ecosystem / Notes
- **Source URL:** https://github.com/openclaw/skills/tree/main/skills/steipete/bear-notes
- **Installation:** Bundled with OpenClaw (macOS only)
- **Requirements:** macOS, Bear app, `bear-cli` (`brew install bear`)
---

#### **bluebubbles** ⭐⭐⭐
Integrate with BlueBubbles server for Android messaging.

- **Description:** Bridge to BlueBubbles server for sending/receiving Android messages through iMessage. Useful for cross-platform messaging from your Mac.
- **Category:** Apple Ecosystem / Communication
- **Source URL:** https://github.com/openclaw/skills/tree/main/skills/steipete/bluebubbles
- **Installation:** Bundled with OpenClaw
- **Requirements:** BlueBubbles server running

---

#### **imsg** ⭐⭐⭐
Send iMessages via the `imessage` CLI.

- **Description:** Direct iMessage sending capabilities from the terminal. Send messages to contacts directly from OpenClaw workflows.
- **Category:** Apple Ecosystem / Communication
- **Source URL:** https://github.com/openclaw/skills/tree/main/skills/steipete/imsg
- **Installation:** Bundled with OpenClaw (macOS only)
- **Requirements:** macOS, iMessage configured

---

### 7. Home Automation & IoT

#### **openhue** ⭐⭐⭐
Control Philips Hue lights via the Hue CLI.

- **Description:** Smart light control for Philips Hue ecosystems. Turn lights on/off, adjust brightness, change colors, and activate scenes.
- **Category:** Home Automation & IoT
- **Source URL:** https://github.com/openclaw/skills/tree/main/skills/steipete/openhue
- **Installation:** `npx clawhub@latest install openhue`
- **Requirements:** Philips Hue bridge, `hue-cli`

---

### 8. Development Tools & CLI

#### **skill-creator** ⭐⭐⭐⭐
Guide for creating effective OpenClaw skills.

- **Description:** Comprehensive tutorial and template for creating new skills. Follow this when you need to build custom skills for specific use cases.
- **Category:** Development Tools / OpenClaw Development
- **Source URL:** https://github.com/openclaw/skills/tree/main/skills/chindden/skill-creator
- **Installation:** Bundled with OpenClaw
- **Requirements:** None

---

#### **model-usage** ⭐⭐⭐
Track and summarize AI model usage and costs locally.

- **Description:** Monitor AI model API usage and costs across different providers. Track spending and usage patterns for optimization.
- **Category:** Development Tools / Analytics
- **Source URL:** https://github.com/openclaw/skills/tree/main/skills/steipete/model-usage
- **Installation:** Bundled with OpenClaw
- **Requirements:** CodexBar CLI or compatible usage tracking

---

### 9. Search & Research

#### **blogwatcher** ⭐⭐⭐
Monitor blogs and websites for new posts.

- **Description:** RSS feed monitoring and blog tracking. Get notified when new content appears on followed blogs and websites.
- **Category:** Search & Research
- **Source URL:** https://github.com/openclaw/skills/tree/main/skills/steipete/blogwatcher
- **Installation:** Bundled with OpenClaw
- **Requirements:** RSS feed URLs

---

#### **gifgrep** ⭐⭐⭐
Search and share GIFs via Giphy API.

- **Description:** GIF search and sharing capabilities using Giphy. Perfect for adding animated reactions and fun to communications.
- **Category:** Search & Research / Media
- **Source URL:** https://github.com/openclaw/skills/tree/main/skills/steipete/gifgrep
- **Installation:** Bundled with OpenClaw
- **Requirements:** Giphy API key (optional)

---

### 10. Gaming & Entertainment

#### **gog** ⭐⭐⭐
Manage GOG Galaxy games library.

- **Description:** GOG game library integration. Check installed games, launch games, and manage your GOG collection.
- **Category:** Gaming & Entertainment
- **Source URL:** https://github.com/openclaw/skills/tree/main/skills/steipete/gog
- **Installation:** Bundled with OpenClaw
- **Requirements:** GOG Galaxy or GOG games installed

---

#### **spotify-player** ⭐⭐⭐
Control Spotify playback via spotify-cli.

- **Description:** Spotify playback control including play, pause, skip, volume control, and playlist management. Perfect for music lovers.
- **Category:** Gaming & Entertainment / Music
- **Source URL:** https://github.com/openclaw/skills/tree/main/skills/steipete/spotify-player
- **Installation:** Bundled with OpenClaw
- **Requirements:** Spotify account, `spotify-cli`

---

---

## 📚 Additional Resources

### Official Sources
- **ClawHub (Skill Registry):** https://clawhub.com
- **OpenClaw Documentation:** https://docs.openclaw.ai
- **GitHub Repository:** https://github.com/openclaw
- **Awesome OpenClaw Skills:** https://github.com/VoltAgent/awesome-openclaw-skills

### Skill Installation Statistics
- **Total Skills on ClawHub:** 5,705+ (as of February 2026)
- **Curated in Awesome List:** 2,999 skills
- **Bundled with OpenClaw:** 54 skills

### Installation Locations
Skills are loaded from three places (in order of precedence):
1. **Workspace skills:** `/skills` (highest priority)
2. **Managed/local skills:** `~/.openclaw/skills`
3. **Bundled skills:** Shipped with OpenClaw install (lowest priority)

---

## 🔒 Security Notes

⚠️ **Important Security Considerations:**

1. **Treat third-party skills as untrusted code.** Always review skill code before enabling.
2. **Check VirusTotal reports** on ClawHub before installing unfamiliar skills.
3. **Use sandboxed runs** for untrusted inputs and risky tools.
4. **Keep secrets out of prompts and logs.** Use environment variables and tools like 1Password.
5. **Review skill permissions** before installation.

---

## 📋 Recommended Skill Set by Use Case

### For Developers
- `coding-agent`, `github`, `git-essentials`, `docker-essentials`, `tmux`, `1password`

### For Remote Teams
- `discord`, `slack`, `himalaya`, `notion`, `obsidian`

### For macOS Users
- `things-mac`, `apple-notes`, `apple-reminders`, `bear-notes`, `imsg`, `bluebubbles`

### For Productivity Enthusiasts
- `notion`, `obsidian`, `things-mac`, `apple-notes`, `summarize`

### For Home Automation
- `openhue` (expand with Home Assistant skills)

---

## 🚀 Getting Started

1. **List installed skills:** Skills are pre-loaded in `/openclaw/skills/`
2. **Browse ClawHub:** Visit https://clawhub.com to discover new skills
3. **Install a skill:** `npx clawhub@latest install <skill-name>`
4. **Verify installation:** Check `~/.openclaw/skills/` or your workspace `/skills/` directory
5. **Configure credentials:** Set required API keys and environment variables

---

*This research was compiled on February 9, 2026. Skill availability and URLs may change. Always verify the latest information on ClawHub and the official OpenClaw documentation.*
