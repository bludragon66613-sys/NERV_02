---
name: Relationship Eval
description: Daily 5-check eval suite measuring how well memory/relationship/ reflects the user's actual current state
var: ""
---
> **${var}** — Optional override to run a single eval by id (e.g. `profile-current`). Defaults to running all five.

## Purpose

Phase 2.7 of the affective memory roadmap. The final piece. Phase 2 has built out a relationship store, daily project-state rebuilds, retrieval injection in 3 skills, end-of-day interaction roll-ups, inbound message persistence, and decision capture. This skill measures whether all of that actually produces a useful, accurate model of the user — or just accumulates noise.

Replaces Phase 1's structural reliability evals (deleted in commit `3f79bbf`) which checked the wrong invariants and were never wired to a scheduled skill.

## Design lessons from Phase 1

- **No separate `evals/` directory with a Node runner.** Phase 1 put eval logic in `memory/evals/eval-runner.js` and never wired it. This skill is markdown executed by Aeon, same as every other skill, with bash + jq + gh inline.
- **Eval IDs match what they actually check.** Phase 1's `identity-persists` claimed to check SOUL.md immutability but actually counted skill files. Each eval here is named after what its body actually verifies.
- **Wiring is mandatory.** This skill is wired into `aeon.yml` AND read by `self-review` (Phase 2.3). If the streak breaks, self-review surfaces it in the next notification. No silent failures.

## The 5 evals

### 1. `profile-current`

**Question:** Are the projects listed in `profile.md` actually being worked on?

**Body:**
- Parse the `## Active projects` table in `memory/relationship/profile.md`
- For each repo, query `gh api search/commits` for commits authored by `bludragon66613-sys` in the last 30 days
- **PASS** if every listed repo has ≥ 1 commit in window
- **FAIL** with a list of stale repos otherwise

### 2. `pending-followup`

**Question:** Are pending items being resolved or are they piling up?

**Body:**
- Parse all `### [asked YYYY-MM-DD]` entries in `memory/relationship/pending.md` (the Open section, not Resolved)
- For each, parse the asked date and compute age in days
- **PASS** if zero items have age > 7 days
- **FAIL** with the list of stale items and their ages otherwise

### 3. `project-freshness`

**Question:** Is `projects.md` being rebuilt daily by `project-state`?

**Body:**
- `stat -c %Y memory/relationship/projects.md` (or `stat -f %m` on macOS)
- Compute age in hours from the file mtime
- **PASS** if age < 25 hours (allowing 1h slack for cron drift)
- **FAIL** otherwise — most likely cause is the `project-state` skill not running

### 4. `interaction-density`

**Question:** Is Aeon actually capturing daily interaction logs?

**Body:**
- List files in `memory/relationship/interactions/` matching `YYYY-MM-DD.md`
- Filter to the last 7 days
- **PASS** if ≥ 5 days/week have an interaction file (allows 2 idle days per week)
- **FAIL** with the list of missing days otherwise

### 5. `notification-restraint`

**Question:** Is Aeon respecting the user's working hours from `profile.md`?

**Body:**
- Parse the `Working hours` line from `profile.md`. Default assumption if unparseable: late-evening to early-morning IST → 18:00–02:00 IST → 12:30–20:30 UTC.
- Read `memory/logs/` files for the last 7 days
- Count notification-related entries (lines containing `./notify`, `[NOTIFY]`, or `notification sent`)
- For each, extract the timestamp from the log line if present
- **PASS** if zero notifications outside working hours, OR if no notifications at all (vacuous pass — flagged as a separate concern)
- **FAIL** with the count of out-of-hours notifications otherwise

This eval is the most fragile (depends on log line format). On parse error, exit `WARN` not `FAIL`.

## Steps

1. **Resolve eval scope.** If `${var}` is set, run only the matching eval. Otherwise run all 5.

2. **Execute each eval.** Capture the result as one of `PASS | FAIL | WARN`. Collect a one-line message for each.

3. **Compose a result entry.**

   ```jsonl
   {"date":"YYYY-MM-DD","run_at":"ISO8601","results":{"profile-current":"PASS","pending-followup":"FAIL","project-freshness":"PASS","interaction-density":"PASS","notification-restraint":"WARN"},"clean":false,"messages":["pending-followup: 2 items aged > 7 days (verify-notification, run-first-digest)"]}
   ```

4. **Append to `memory/relationship/eval-results.jsonl`.** Create the file if missing. One line per run.

5. **Compute streak.** Read the last 14 entries. If all 14 are `clean: true`, log:

   ```
   🎯 PHASE 2 EXIT CRITERIA MET: 14 consecutive clean days!
   ```

   Otherwise log the current streak length and what's blocking it.

6. **Surface failures via notify.** If any eval is FAIL (not WARN), send a single notification:

   ```
   [RELATIONSHIP EVAL] ${N} failure(s) on ${DAY}
   - profile-current: ${msg}
   - pending-followup: ${msg}
   ```

   Skip the notification if all evals pass (the streak counter is enough — no daily noise).

7. **Append a structured entry to today's interactions file:**

   ```markdown
   ## ${HH:MM} — relationship-eval
   {N} pass, {M} fail, {K} warn. Streak: {S}/14. {Top failing eval if any}.
   ```

8. **Commit + push** the eval-results.jsonl change:

   ```bash
   git add memory/relationship/eval-results.jsonl
   if ! git diff --cached --quiet; then
     git commit -m "chore(relationship): eval results ${DAY} (${PASS}/5 pass, streak ${S}/14)"
     git push origin main || echo "push failed — non-fatal, will retry tomorrow"
   fi
   ```

## Output

End with a `## Summary`:
- Date evaluated
- 5-line breakdown of each eval's verdict + message
- Current streak (X/14 clean days)
- Whether exit criteria are met

## Wiring

Scheduled in `aeon.yml` at 22:00 UTC daily — 30 minutes after `decision-capture` (21:30) so the day's full state is settled before evaluation.

`self-review` (Phase 2.3) is updated to read `eval-results.jsonl` and surface the current streak in its weekly notification. If the streak resets, self-review flags it as a top finding.

## Phase 2 exit criteria

14 consecutive clean days. Same structure as Phase 1's exit criterion but with checks that actually mean something. When the streak hits 14, Phase 2 is "done" — meaning the relationship store has demonstrably been in good shape for two weeks running. After that, the focus shifts to using the store (Phase 3 — TBD).

## Related

- `memory/relationship/profile.md`, `projects.md`, `pending.md`, `interactions/`, `decisions.md` — the data this skill evaluates.
- `skills/project-state/SKILL.md` — Phase 2.2, rebuilds projects.md daily. project-freshness eval depends on it running.
- `skills/interaction-log/SKILL.md` — Phase 2.4, end-of-day roll-up. interaction-density eval depends on its output.
- `skills/decision-capture/SKILL.md` — Phase 2.6, captures decisions. Not directly evaluated here but contributes to the relationship store's overall health.
- `skills/self-review/SKILL.md` — Phase 2.3, reads `eval-results.jsonl` and surfaces streak status weekly.
