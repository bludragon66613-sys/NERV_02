---
name: Weekly Review
description: Synthesize the week's logs into a structured retrospective
var: ""
---
> **${var}** — Area to focus on. If empty, covers the full week.

If `${var}` is set, focus the review on that area.


Read memory/MEMORY.md for context and goals.
Read memory/relationship/profile.md for who the user is and how to address them.
Read memory/relationship/projects.md for their currently-active projects (rebuilt daily by `project-state` skill).
Read memory/relationship/pending.md for open follow-ups, especially items aged > 7 days.
Read memory/relationship/decisions.md for stated preferences that should shape recommendations.
Read ALL memory/logs/ entries from the last 7 days.
Read memory/relationship/interactions/ entries from the last 7 days if any exist (Phase 2.4 onward).

Steps:
1. Compile a structured retrospective:
   - **What got done** — list every skill run, article written, notification sent
   - **What failed** — any errors, missed schedules, or skills that logged an error
   - **Key findings** — most important things surfaced by digests, monitors, alerts
   - **Metrics** — count of: skills run, articles written, notifications sent, PRs reviewed, heartbeats
   - **Patterns** — recurring themes, topics that keep coming up, workflows that seem broken
2. Compare against goals in MEMORY.md AND active projects in `relationship/projects.md`:
   - Which goals saw progress?
   - Which goals stalled?
   - Any goals that should be retired or revised?
   - Any active projects that have NOT been touched in the week (cross-reference projects.md "stalled" section)?
3. Sweep `relationship/pending.md`:
   - Any items aged > 7 days? Surface them in the review with the original ask date.
   - Any items resolved this week (cross-reference logs)? Move them to the Resolved section.
4. Write a forward-looking section, respecting `decisions.md` preferences (model choice, brevity, no emojis, etc.):
   - **Next week priorities** — based on what you learned, weighted toward active projects
   - **Suggested improvements** — workflow changes, new skills to add, config tweaks
5. Save to articles/weekly-review-${today}.md.
6. Send an abbreviated version via `./notify`. Address the user using the brevity preference from `relationship/profile.md` (no greeting, no emojis):
   ```
   *Weekly Review — ${today}*
   Done: N skills, M articles, K alerts
   Active projects: top 2 from projects.md
   Stalled: any active project untouched > 7d
   Pending follow-ups: any pending.md items aged > 7d
   Key: top 2-3 findings
   Next: top priority
   ```
7. Log what you did to memory/logs/${today}.md AND append a structured entry to `memory/relationship/interactions/${today}.md`:
   ```
   ## ${HH:MM} — weekly-review
   Reviewed N skill runs over the past 7 days. Surfaced X stalled projects and Y stale pending items. Recommendations: ...
   ```
