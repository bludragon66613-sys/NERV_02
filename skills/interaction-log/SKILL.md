---
name: Interaction Log
description: End-of-day roll-up of user activity and Aeon activity into memory/relationship/interactions/${today}.md
var: ""
---
> **${var}** — Optional date override (YYYY-MM-DD). Defaults to today (UTC).

## Purpose

Phase 2.4 of the affective memory roadmap. Aggregates what happened today — what the user actually did across their repos, what Aeon did in response, and what was decided — into a single daily interaction file. Other skills (heartbeat, weekly-review, self-review) read these files when they need recency.

This skill runs at end-of-day so it can capture the full day's activity in one pass. Earlier in the day, heartbeat/weekly-review/self-review append their own structured entries to the same file as they run; interaction-log writes the closing roll-up that synthesizes everything.

## Sources

- `gh search/commits author:bludragon66613-sys committer-date:>=YYYY-MM-DD` — user's commits today
- `memory/logs/${today}.md` — Aeon's own activity log (notifications, skill runs)
- `memory/relationship/projects.md` — current project state for cross-reference
- `memory/relationship/interactions/${today}.md` — existing entries from earlier skills today
- `articles/` — any new articles created today
- (future, Phase 2.5) inbound Telegram/Discord/Slack replies

## Steps

1. **Resolve target date.** Default to `$(date -u +%Y-%m-%d)`. Override with `${var}` if set.

2. **Read existing today's interaction file** if it exists. Preserve all prior entries (heartbeat, weekly-review, self-review, project-state already write here). The roll-up is appended at the end.

3. **Pull today's user commits.**

   ```bash
   USER="bludragon66613-sys"
   DAY="${VAR:-$(date -u +%Y-%m-%d)}"
   gh api -X GET "search/commits" \
     -f q="author:$USER author-date:$DAY" \
     -f per_page=100 \
     -H "Accept: application/vnd.github.cloak-preview+json" \
     --jq '.items[] | {repo: .repository.full_name, sha: .sha[0:7], time: .commit.author.date, msg: (.commit.message | split("\n")[0])}' \
     | jq -s 'sort_by(.time)'
   ```

   Group by repo. Count commits per repo. Note the first and last commit times.

4. **Compare against `projects.md`.** Cross-reference today's commits with the auto-rebuilt projects list:
   - Are any repos with commits today missing from `projects.md` Active section? Possible drift.
   - Are any repos in `projects.md` Stalled section newly active today? Note the recovery.

5. **Read today's Aeon log.** If `memory/logs/${today}.md` exists, count:
   - Skill runs (lines starting with `## ` or `### `)
   - Notifications sent (lines containing `notify` or `[NOTIFY]`)
   - Errors logged
   - PR/issue actions

6. **Read today's articles.** List any new files in `articles/` with today's date in the filename or mtime.

7. **Compose the roll-up.** Append a final section to `memory/relationship/interactions/${day}.md`:

   ```markdown
   ## ${HH:MM} — interaction-log (end-of-day roll-up)

   ### User activity
   - {N} commits across {M} repos
   - Top repos: repo1 ({n}), repo2 ({n}), repo3 ({n})
   - First commit: {time} ({repo} — "subject")
   - Last commit: {time} ({repo} — "subject")
   - {Stalled→active recoveries, if any}
   - {Drift warnings, if any}

   ### Aeon activity
   - {N} skill runs
   - {N} notifications sent
   - {N} articles produced
   - {N} errors logged

   ### Net relationship state
   - profile.md: {unchanged | updated}
   - decisions.md: {N new entries today}
   - pending.md: {N opened, M resolved, K aged-out}
   - projects.md: {last rebuilt at HH:MM}
   ```

8. **Create the day file if it doesn't exist.** First write a header:

   ```markdown
   # Interactions — ${DAY}

   > Daily activity log from Aeon's POV. Entries are appended throughout the day by skills (heartbeat, weekly-review, self-review, project-state) and finalized by interaction-log at end-of-day.
   ```

9. **Commit + push.** Stage the day's interactions file and any other relationship/ changes:

   ```bash
   git add memory/relationship/interactions/${day}.md
   if ! git diff --cached --quiet; then
     git commit -m "chore(relationship): interaction roll-up ${day}"
     git push origin main || echo "push failed — non-fatal, will retry tomorrow"
   fi
   ```

10. **Log to `memory/logs/${today}.md`** with what was rolled up and any flags.

## Failure modes

- **No commits today.** Write the roll-up anyway with "No user commits today" — that's a meaningful signal (idle day, weekend, etc).
- **gh rate limit.** Same as project-state — log to pending.md, exit non-zero, retry tomorrow.
- **Today's interactions file already has an interaction-log entry.** Skip — this skill should run once per day.

## Output

End with a `## Summary`:
- Date rolled up
- N commits, N repos, N skills, N articles
- Anything notable (drift, recovery, errors)

## Wiring

Scheduled in `aeon.yml` at 21:00 UTC (02:30 IST) — late enough to capture the user's full working day in IST, early enough that the next morning's brief reads a complete prior-day roll-up.

## Related

- `skills/project-state/SKILL.md` — Phase 2.2, rebuilds `projects.md` at 06:30 UTC. interaction-log reads its output.
- `skills/heartbeat/SKILL.md`, `weekly-review`, `self-review` — Phase 2.3, append structured entries to today's interactions file as they run. interaction-log preserves them and adds the closing roll-up.
- `~/.claude/hooks/session-distill.js` — local Stop hook designed to capture Claude Code session manifests into `memory/topics/claude-sessions.md`. Currently NOT wired into `~/.claude/settings.json` Stop hooks (only 1 manifest captured since 2026-03-25). Phase 2.4 deliberately doesn't depend on this; once the hook is registered, a future pass can teach interaction-log to read the manifests for richer recency context.
