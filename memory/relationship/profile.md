# Profile — Rohan

> Slow-changing facts about the user. Hand-edited; do not auto-overwrite. Last reconciled 2026-04-15.

## Identity

- **Name:** Rohan
- **GitHub:** [@bludragon66613-sys](https://github.com/bludragon66613-sys)
- **Email:** bludragon66613@gmail.com
- **Timezone:** IST (UTC+5:30) — inferred from session timestamps
- **Working hours:** Late evenings to early mornings IST. Long, intensive sessions, often 4–8 hours.

## Role & expertise

- Solo founder/builder operating a portfolio of in-flight projects across AI agents, brand/design, fintech, and dev tooling.
- Comfortable directing autonomous agents and reading diffs; not the audience for hand-holding.
- Bias toward shipping over discussing. Treats unfinished plans as drag.

## Communication style

- **Brevity over politeness.** Skip pleasantries, hedging, "Sure! I'd be happy to help." Cut articles and filler when the meaning survives.
- **Caveman mode tolerated** for normal work, write normal code/commits/security.
- **No emojis** unless asked. Never decorate.
- **Show, don't narrate.** State decisions and results, not the process of arriving at them.
- **End-of-turn:** one or two sentences. What changed, what's next.
- **Direct correction welcome.** When wrong, say so plainly and fix it. Don't spiral.

## Model preferences

- **Default:** Sonnet 4.6.
- **Opus 4.6:** complex coding, deep reasoning, architectural decisions only.
- **Haiku 4.5:** lightweight worker agents, frequent invocation.
- Claude is the primary model. GPT/Gemini used as fallbacks via OpenClaw gateway.

## Quality bar

- Japanese minimalism in design. No tacky effects, no glassmorphism, no gradient abuse, no nested cards, no broken animations, no icon boxes.
- Always include brand marks where applicable. Billion-dollar product quality.
- HTML-to-PDF via Puppeteer is sloppy → use proper PDF libs, always visually review.
- Code: small files (200–400 lines), high cohesion, immutable patterns, no premature abstraction.

## Process preferences

- **Plan before non-trivial code.** Karpathy guidelines on by default — surface assumptions, ask when unclear, scope discipline, goal-driven loops.
- **TDD enforced** for new features and bug fixes. 80% coverage minimum.
- **Atomic commits.** Conventional commit format. No attribution lines (disabled globally).
- **Backup discipline:** push agents + memory to `bludragon66613-sys/Setup` and `bludragon66613-sys/claudecodemem` after significant work.
- **Worktrees over branches** when iterating in parallel.

## Active projects

> This list is the slow, hand-curated cut. Live ranked-by-recency view is in `projects.md` (auto-rebuilt daily).

| Project | What | Repo / path |
|---|---|---|
| Aeon (this) | Autonomous agent on GitHub Actions, 47 skills | `bludragon66613-sys/NERV_02`, `~/aeon` |
| nerv-dashboard | Standalone Vercel dashboard | `bludragon66613-sys/nerv-dashboard`, `~/aeon/dashboard` |
| Paperclip | Agent orchestration platform, 16 companies, 451 agents | `paperclipai/paperclip` (upstream, no push), `~/paperclip` |
| OpenClaw | Local AI gateway powering @kaneda6bot Telegram | local install |
| elevatex | Property layout generation, Phase 4e.3 retry shipped | `~/elevatex` |
| kitchenandwardrobe | Furniture layout generator, Next.js 16, Phase 6 done | `~/kitchenandwardrobe` |
| TallyAI | AI accounting intelligence for Indian SMEs, Tally XML parser | `~/tallyai` |
| Munshi | Brand bible v3.0 (Direction A Stripe Neelam) | `~/munshi` |
| NTS / Neo Tokyo Studios | AI anime production house | Vercel deployed |
| Kaneda Eye | Tauri 2 screen-aware AI companion | scaffold complete |
| Cos / Chief of Staff | Obsidian vault overlay for actions, decisions, frameworks | Obsidian-based |
| Munshi-related projects | Anime DB, NTS monorepo, multi-source screencap fetcher | recent |

## Background context

- Memory is split across three layers: session memory (`~/.claude/projects/C--Users-Rohan/memory/`), Obsidian knowledge graph (`~/OneDrive/Documents/Agentic knowledge/`), and ingestion pipeline (web fetch → vault).
- 55 active Claude Code agents in `~/.claude/agents/`, 183 archived in `~/Setup/agents/_archived/`.
- Uses RTK (Rust Token Killer) prefix for all bash commands to filter terminal noise.
- Excludes `shueb.io` from all Obsidian syncs.

## Things to never assume

- Don't assume the user wants a summary at the end of every response — they read diffs.
- Don't assume Phase 1 of anything has been verified — many shipped phases never got wired up.
- Don't assume the user wants you to add features beyond what's asked. Three similar lines beats a premature abstraction.
- Don't assume Telegram/Discord/Slack notifications are working — verify by sending a test before claiming so.

## How to update this file

Hand-edit when:
- A new project enters or exits active status
- A communication preference shifts and the user calls it out
- Working hours / timezone change
- A new model becomes the default

The `relationship-reconcile` skill (Phase 2.x, not yet built) will eventually do periodic reconciliation by reading `decisions.md`, `interactions/`, and recent git activity, then proposing diffs to this file for the user to approve.
