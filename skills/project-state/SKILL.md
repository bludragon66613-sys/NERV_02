---
name: Project State
description: Rebuild memory/relationship/projects.md from recent GitHub activity by bludragon66613-sys
var: ""
---
> **${var}** — Optional GitHub username override. Defaults to `bludragon66613-sys` (read from `memory/relationship/profile.md`).

## Purpose

Phase 2.2 of the affective memory roadmap. Rebuilds `memory/relationship/projects.md` daily so other skills (briefings, notifications, status digests) can ground their output in what the user is *actually* working on right now, not stale memory.

This skill replaces local filesystem scanning (which doesn't work — Aeon runs on GitHub Actions, not on the user's machine) with a GitHub API query for repos the user has committed to recently.

## Steps

1. **Resolve target user.** Default to `bludragon66613-sys`. If `${var}` is set, use that instead.

2. **Find recently-touched repos.** Pull commits authored by the target user in the last 30 days, grouped by repo:

   ```bash
   USER="${var:-bludragon66613-sys}"
   SINCE="$(date -u -d '30 days ago' +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -v-30d +%Y-%m-%dT%H:%M:%SZ)"
   gh api -X GET "search/commits" \
     -f q="author:$USER committer-date:>=$SINCE" \
     -f per_page=100 \
     -H "Accept: application/vnd.github.cloak-preview+json" \
     --jq '.items[] | {repo: .repository.full_name, sha: .sha[0:7], date: .commit.author.date, message: (.commit.message | split("\n")[0])}' \
     | jq -s '.'
   ```

   The `cloak-preview` Accept header is required for the search/commits endpoint.

3. **Group and rank.** For each unique repo, pick the most recent commit. Sort all repos by that commit date descending. Cap at 20 entries.

4. **Enrich with branch info.** For each repo, get the default branch:

   ```bash
   gh api "repos/$REPO" --jq '{defaultBranch: .default_branch, pushedAt: .pushed_at, isFork: .fork}'
   ```

5. **Classify state.** Heuristics based purely on the API data (Aeon can't see uncommitted local changes):
   - **active** — commit in the last 7 days
   - **stalled** — commits in the prior 30 days but nothing in the last 7
   - **archived** — flagged as archived in the API

6. **Write the file.** Overwrite `memory/relationship/projects.md` with the new ranked table. Format:

   ```markdown
   # Active Projects

   > Auto-rebuilt by `skills/project-state/SKILL.md`. **Do not hand-edit** — changes will be overwritten on the next run. For slow-curated project context, see `profile.md`.

   _Last rebuilt: ${ISO_TIMESTAMP}_
   _Source: `gh search/commits author:${USER} committer-date:>=${SINCE}`_

   ## Active (last 7 days)

   | Repo | Last commit | Branch | Subject |
   |---|---|---|---|
   | owner/repo | YYYY-MM-DD HH:MM | main | "feat: short subject" |
   | ... |

   ## Stalled (8–30 days)

   | Repo | Last commit | Branch | Subject |
   |---|---|---|---|
   | ... |

   ## Archived

   _(none)_
   ```

   Preserve any human-readable footer or notes from the previous version of the file ONLY if they are inside a `<!-- preserve -->` block (none currently exist).

7. **Commit.** Stage and commit:

   ```bash
   git add memory/relationship/projects.md
   git commit -m "$(cat <<MSG
   chore(relationship): rebuild projects.md ($(date -u +%Y-%m-%d))

   Source: gh search/commits author:${USER}
   Active: ${ACTIVE_COUNT} repos
   Stalled: ${STALLED_COUNT} repos
   MSG
   )"
   ```

   Skip the commit if the rebuilt content is identical to the prior version (`git diff --quiet memory/relationship/projects.md` returns 0).

8. **Log to today's interaction file.** Append a one-line entry to `memory/relationship/interactions/$(date -u +%Y-%m-%d).md`, creating the file if it doesn't exist. This is the first writer to interactions/ — it's seeding the directory.

   ```markdown
   ## $(date -u +%H:%M) — project-state
   Rebuilt projects.md from gh search/commits. ${ACTIVE_COUNT} active, ${STALLED_COUNT} stalled.
   ```

## Failure modes

- **Rate limit hit.** `gh api search/commits` is rate-limited at 30 req/min. Falls within the budget. If hit, log a `pending.md` entry and exit non-zero.
- **No commits in window.** Write an empty active section with a note. Don't fail the skill.
- **gh not authenticated.** Fail with a clear error pointing at the `gh auth status` check.

## Output

After running, end with a `## Summary` listing:
- Repos found / classified
- Whether projects.md changed
- Whether commit was made
- Any pending items written

## Wiring

Scheduled via `aeon.yml` to run daily at 6:30 AM UTC (12 PM IST), before `morning-brief` so the brief can read fresh project state.
