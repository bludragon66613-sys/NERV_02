# Active Projects

> Auto-rebuilt daily by `skills/project-state/SKILL.md`. **Do not hand-edit** — changes will be overwritten on the next run. For slow-curated project context, see `profile.md`.

_Last rebuilt: never (Phase 2.2 skill not yet wired)._

## How this works

The `project-state` skill scans `~/` for git repositories, runs `git log --author=$USER` against each one to find user-authored commits in the last 30 days, ranks the repos by most-recent commit, and writes the result here.

The `pending` and `stalled` columns are derived heuristics:
- **pending** = repo has uncommitted working-tree changes
- **stalled** = no commit in last 7 days, but commits in the prior 30

## Format (when populated)

| Repo | Last commit | Branch | State | Notes |
|---|---|---|---|---|
| _example_ | 2026-04-15 17:42 | `main` | clean | "feat: ship Phase 6 quality toggle" |
| _example_ | 2026-04-13 22:11 | `cleanup/ai-slop-2026-04-15` | pending (5 modified) | "refactor: pass 11 cycle break" |

## Empty state

This file is empty until `project-state` runs for the first time.
