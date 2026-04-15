---
name: Decision Capture
description: Scan recent interactions for stated decisions and preferences, append new entries to memory/relationship/decisions.md
var: ""
---
> **${var}** — Optional lookback window in days. Defaults to 1 (just yesterday + today). Set to 7 for a weekly sweep.

## Purpose

Phase 2.6 of the affective memory roadmap. Decisions and preferences emerge naturally from user interactions — a Telegram reply, a notification follow-up, a session conversation — but they're easy to lose unless something explicitly captures them. This skill reads recent `memory/relationship/interactions/` files, identifies things that look like decisions, dedupes against the existing `decisions.md`, and appends new ones.

## What counts as a decision

Capture statements that should outlive the conversation they came from:

- **Stated preferences.** "Use X by default", "stop doing Y", "I prefer Z over W"
- **Architectural choices.** "We're going with X for project Y because Z"
- **Process rules.** "Always do A before B", "never push without C"
- **Scope cuts.** "Drop feature F from project P", "defer X until Y"
- **Confirmed conventions.** When user accepts an unusual approach without pushback (validation > correction)

## What does NOT count

- One-off questions ("what time is it in PST?")
- Pure status updates ("just deployed")
- Answers to Aeon questions that don't generalize ("yes do that")
- Anything that's already in `decisions.md` (dedupe by normalized content hash)
- Anything contradicted by a more recent entry (don't capture stale takes)

## Steps

1. **Resolve lookback.** Default 1 day. `${var}` overrides.

2. **Read existing decisions.** Load `memory/relationship/decisions.md` and extract all entries. Build a set of normalized content hashes (lowercased, whitespace-collapsed first sentence of each entry's "Decision:" line) for dedupe.

3. **Read recent interactions.** Glob `memory/relationship/interactions/*.md` for files with mtime within the lookback window. Read each.

4. **Read profile.md** for context. Decisions should be evaluated against what the user already says they prefer — a "decision" that just restates an existing profile fact isn't novel.

5. **Identify candidate decisions.** For each interaction file, scan for:
   - Lines starting with `- **[telegram]**`, `- **[discord]**`, `- **[slack]**` (inbound messages)
   - Imperative phrasing: "use", "stop", "always", "never", "prefer", "switch to", "drop", "defer", "from now on", "going forward"
   - Negative phrasing: "don't", "no longer", "stop doing"
   - Rule phrasing: "rule:", "policy:", "convention:"

   For each candidate, decide:
   - **Is it a decision?** (vs a question, a status, a one-off)
   - **Is it novel?** (not already in decisions.md)
   - **Is it durable?** (would still matter in 30 days)

6. **Compose new entries.** For each captured decision, write an entry in the standard format:

   ```markdown
   ### ${YYYY-MM-DD} — short title (max 8 words)
   **Decision:** what was decided, in the user's own words where possible.
   **Why:** the reason given, or "(no reason given)" if absent.
   **Source:** interactions/${date}.md ${HH:MM} — ${SOURCE}
   ```

7. **Append to decisions.md.** Open the file, find the `## Entries` section, and append the new entries at the bottom (chronological order — newest at the bottom). Preserve all existing entries.

8. **Commit and push.** Only if new entries were added:

   ```bash
   git add memory/relationship/decisions.md
   if ! git diff --cached --quiet; then
     git commit -m "chore(relationship): capture ${N} new decision(s) ${DAY}"
     git push origin main || echo "push failed — non-fatal, will retry tomorrow"
   fi
   ```

9. **Log to today's interactions file.** Append a structured entry:

   ```markdown
   ## ${HH:MM} — decision-capture
   Scanned ${N} interaction file(s) over the last ${LOOKBACK} day(s). Captured ${M} new decision(s). ${dedupe summary}.
   ```

## Failure modes

- **No interactions in window.** Exit cleanly with a "nothing to scan" log entry.
- **decisions.md doesn't exist.** Create it from the template if missing.
- **Ambiguous candidate.** When unsure whether something is a decision, log it as a *candidate* in `memory/relationship/interactions/${today}.md` under a `### candidates for review` subsection, but DO NOT commit it to decisions.md. Surface in the next heartbeat for user confirmation.
- **Duplicate detection.** Use first-sentence hash. If the candidate's first sentence is byte-equivalent to an existing entry after normalization (lowercase, collapse whitespace), skip.

## Output

End with a `## Summary`:
- Lookback window
- Files scanned
- Candidates found
- Decisions captured (with one-line summary of each)
- Candidates flagged for review

## Wiring

Scheduled in `aeon.yml` at 21:30 UTC daily — 30 minutes after `interaction-log` (21:00 UTC) finalizes the day, so decision-capture has the full day's interactions available.

## Related

- `skills/interaction-log/SKILL.md` — Phase 2.4, end-of-day roll-up. Runs at 21:00 UTC. decision-capture runs after it.
- `memory/relationship/decisions.md` — append-only log of captured decisions.
- `memory/relationship/profile.md` — slow-changing preferences. If a decision turns out to be a permanent preference (captured 3+ times), a future `relationship-reconcile` skill should propose promoting it from decisions.md to profile.md.
