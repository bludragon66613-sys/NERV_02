---
name: Morning Brief
description: Aggregated daily briefing — digests, priorities, and what's ahead
var: ""
---
> **${var}** — Area to emphasize. If empty, covers all areas.

If `${var}` is set, emphasize that area in the briefing.


Read memory/MEMORY.md for goals, priorities, and tracked items.
Read memory/relationship/profile.md for who the user is and how to address them.
Read memory/relationship/projects.md for what they're actively working on (rebuilt by `project-state` skill at 6:30 UTC).
Read memory/relationship/pending.md for open follow-ups Aeon owes.
Read yesterday's and today's memory/logs/ entries.

Steps:
1. Gather inputs:
   - **Priorities**: top 3 items from MEMORY.md "Next Priorities"
   - **Active projects**: top 3 from `relationship/projects.md` Active section (sorted by last commit)
   - **Pending follow-ups**: any items in `relationship/pending.md` aged > 3 days
   - **Yesterday's activity**: summarize what Aeon did yesterday from logs
   - **Scheduled today**: check aeon.yml for what skills run today
2. Check for quick headlines:
   - Use WebSearch for 2-3 top headlines in AI and crypto
   - Keep headlines to one line each
3. Format and send via `./notify`. Address the user by their preference from `profile.md` (no "Hello!" or "Good morning!" — they prefer brevity).
   ```
   *Morning Brief — ${today}*

   *Priorities*
   1. priority one
   2. priority two
   3. priority three

   *Active projects*
   - repo — last commit subject (X days ago)
   - repo — last commit subject (X days ago)

   *Yesterday*
   - what happened

   *Pending follow-ups*
   - item from pending.md (asked X days ago)

   *Headlines*
   - headline 1
   - headline 2

   *Today's schedule*
   - skill at time
   ```
4. Log to memory/logs/${today}.md.
