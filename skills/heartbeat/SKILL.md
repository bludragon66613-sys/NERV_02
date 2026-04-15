---
name: Heartbeat
description: Chief-of-staff heartbeat — orchestrate checks, auto-resolve low-risk items, surface what matters
var: ""
---
> **${var}** — Area to focus on. If empty, runs all checks.

If `${var}` is set, focus checks on that specific area.

## 1. Load Context (Principal State)

Read these canonical sources for full situational awareness:
- `memory/MEMORY.md` — current goals, priorities, active topics
- `memory/relationship/profile.md` — who the user is, communication style, what to never assume
- `memory/relationship/projects.md` — currently-active user projects, their freshness, what's stalled
- `memory/relationship/pending.md` — open follow-ups Aeon owes; sweep for items aged > 7 days
- Last 2 days of `memory/logs/` — recent activity and prior heartbeat findings
- Last 2 days of `memory/relationship/interactions/` — what user actually did/said recently
- `memory/topics/` — any topic files referenced in MEMORY.md that have open items

## 2. Signal Scan

Check the following signals. For each, record: signal, severity (low/medium/high), and recommended action.

**Code & PRs:**
- [ ] Any open PRs stalled > 24h? (`gh pr list --state open`)
- [ ] Any PR review requests waiting on us? (`gh pr list --search "review-requested:@me"`)

**Issues:**
- [ ] Check recent GitHub issues for anything labeled urgent (`gh issue list --label urgent`)
- [ ] Any issues assigned to us with no recent activity? (`gh issue list --assignee @me`)

**Skill Health:**
- [ ] Read `skills/skill-health/SKILL.md` and run its steps: scan aeon.yml scheduled skills against recent logs, flag missed or erroring skills.

**Goal Progress:**
- [ ] Check goals in MEMORY.md against recent logs — flag any that are stalled > 7 days.

**Project Freshness:**
- [ ] Read `memory/relationship/projects.md`. Flag any active project with last commit > 7 days old. Flag any stalled project that just became active again (cross-reference with prior heartbeat findings).

**Pending Sweep:**
- [ ] Read `memory/relationship/pending.md`. For each item aged > 7 days: bump severity, surface in the heartbeat output, suggest a resolution path.

**Memory Flags:**
- [ ] Anything flagged in memory that needs follow-up? (look for TODO, BLOCKED, WAITING tags)

## 3. Auto-Resolve (Low-Risk Policy)

For LOW severity signals where the next step is obvious and non-destructive, take action directly:
- Stale branch with merged PR → delete the branch
- Skill missed a single scheduled run → log it, no notification needed
- Memory flag that's already been addressed in recent logs → clear it

Log every auto-resolved item to `memory/logs/${today}.md` with prefix `[AUTO]`.

## 4. Deduplicate

Before sending any notification, grep `memory/logs/` for the same item in the last 48h. Skip if:
- Same signal was already notified
- Same signal was auto-resolved
- No materially new information since last notification

## 5. Route to Specialized Skills

For MEDIUM/HIGH severity signals that need deeper investigation, note which skill should handle it:
- Code quality issues → `code-health`
- Skill failures → `skill-health`
- Goal drift → `goal-tracker`
- Security concerns → `security-digest`
- Issue triage needed → `issue-triage`

Include the routing recommendation in the notification so the principal can dispatch.

## 6. Notify

If nothing needs attention after auto-resolution, log "HEARTBEAT_OK" and end.

If something needs attention:
1. Send ONE concise notification via `./notify` — prioritize by severity (HIGH first). Use the brevity preference from `relationship/profile.md` — no greetings, no decoration.
2. Format: `[HEARTBEAT] {severity}: {finding} → {recommended action or skill to run}`
3. Never send more than 3 items per heartbeat — if more exist, summarize the rest as a count
4. Log all findings and actions to `memory/logs/${today}.md`
5. Append a structured entry to `memory/relationship/interactions/${today}.md`:
   ```
   ## ${HH:MM} — heartbeat
   {OK or N findings}. {one-line summary of severity distribution}.
   ```
