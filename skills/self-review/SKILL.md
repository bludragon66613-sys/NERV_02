---
name: Self Review
description: Weekly audit of what Aeon did, what failed, and what to improve
var: ""
---
> **${var}** — Area to focus on. If empty, reviews everything.

If `${var}` is set, focus the review on that specific area.


Read memory/MEMORY.md for context and goals.
Read memory/relationship/profile.md for who the user is and what they expect from Aeon.
Read memory/relationship/projects.md for the user's currently-active projects.
Read memory/relationship/decisions.md for stated preferences that should shape the audit.
Read memory/relationship/pending.md for items Aeon owes the user.
Read ALL memory/logs/ entries from the last 7 days.
Read memory/relationship/interactions/ entries from the last 7 days if any exist.

Steps:
1. Audit quality of outputs:
   - Read recent articles in articles/ — are they substantive or formulaic?
   - Check recent notifications in logs — were they useful or noisy?
   - Review any PR comments posted — were they actionable?
   - Cross-reference notifications against `relationship/profile.md` — did Aeon respect the brevity preference, no-emoji rule, and any decisions in `decisions.md`?
2. Audit reliability:
   - How many skills ran vs expected?
   - Any repeated errors or patterns of failure?
   - Are monitors catching real issues or always returning OK?
   - Did `project-state` rebuild `projects.md` daily? Check the file's last-rebuilt timestamp.
3. Audit relationship hygiene:
   - Is `relationship/profile.md` current? Flag if any listed active project has had no GitHub activity in 30 days.
   - Are `pending.md` items being resolved or just accumulating? Count net change over the week.
   - Did any new decisions land in `decisions.md` this week? If so, are they being respected?
   - **Read `memory/relationship/eval-results.jsonl`** (Phase 2.7 daily eval suite). Count how many of the last 7 days were clean. Compute the current consecutive clean streak (toward the 14-day Phase 2 exit). If the streak reset this week, flag the failing eval as a top finding. If the streak hit 14, celebrate it in the notification.
4. Audit memory hygiene:
   - Is MEMORY.md current and under 50 lines?
   - Are logs structured consistently?
   - Any stale data that should be cleaned?
4. Generate improvement recommendations:
   - Skills to add, modify, or disable
   - Schedule adjustments
   - Config changes (feeds, repos, addresses to add/remove)
   - Quality improvements (better prompts, new data sources)
5. Save the full review to articles/self-review-${today}.md.
6. Apply any safe, obvious improvements directly:
   - Prune stale MEMORY.md entries
   - Update feeds.yml if feeds are dead
7. Send a summary via `./notify`. Use the brevity preference from `relationship/profile.md` — no greetings, no decoration:
   ```
   *Self Review — ${today}*
   Quality: assessment
   Reliability: X/Y skills ran
   Relationship hygiene: profile-current=Y/N, pending-net=±N, decisions-respected=Y/N
   Actions taken: what was fixed
   Recommendations: top 2-3 suggestions
   ```
8. Log to memory/logs/${today}.md AND append a structured entry to `memory/relationship/interactions/${today}.md`:
   ```
   ## ${HH:MM} — self-review
   Audited last 7 days. Quality={substantive|formulaic}, reliability={X/Y}, relationship hygiene={pass|fail}. {one-line top finding}.
   ```
