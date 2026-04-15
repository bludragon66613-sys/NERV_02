# Relationship Store

Aeon's persistent model of the user (Rohan). Read these files at the start of any user-facing task — notifications, briefings, digests, reviews — so the response is grounded in what the user is actually working on right now, not generic.

## Files

| File | Purpose | Update cadence |
|---|---|---|
| `profile.md` | Slow-changing facts: identity, role, timezone, communication style, model preferences. Hand-edited or via `relationship-reconcile` skill. | Weekly |
| `projects.md` | Active projects ranked by recency. Auto-rebuilt from `git log` across `~/`. **Do not hand-edit** — changes will be overwritten. | Daily (`project-state` skill) |
| `decisions.md` | Append-only log of non-obvious decisions and preferences. Each entry: date, decision, source. | On capture (after notification replies, on-demand) |
| `pending.md` | Open questions Aeon owes a response on. Each entry: question, asked-date, due-date, status. Removed when resolved. | Heartbeat sweep + on capture |
| `interactions/YYYY-MM-DD.md` | Daily log of what happened: notifications sent, replies received, what user worked on. Lifted from session-distill manifests + Telegram/Discord history + git activity. | Daily (`interaction-log` skill) |

## Read order

When a skill needs relationship context:

1. Always read `profile.md` (slow, small, defines who).
2. Read `projects.md` if the skill produces project-aware output (briefings, status digests).
3. Read the last 7 entries of `interactions/` if the skill needs to know what happened recently.
4. Read `pending.md` if the skill might surface a follow-up.
5. Read `decisions.md` if the skill needs to respect a stated preference (model choice, communication style).

## Phase

Phase 2 of the affective memory roadmap. Phase 1 (structural reliability evals) was retired in commit `3f79bbf` for being misimplemented and never wired to a scheduled skill. Phase 2 is built on user-relationship modeling — Aeon as a chief-of-staff with persistent memory of the user, not just internal health checks.
