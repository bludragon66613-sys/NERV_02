# Pending Items

> Open questions Aeon owes the user a response on, or stalled tasks that need a decision. Removed when resolved. Heartbeat sweeps for items aged > 7 days.

## Format

```
### [asked YYYY-MM-DD] short title
**Question / task:** what's pending.
**Asked by:** user / system / specific skill.
**Due:** YYYY-MM-DD or "no deadline".
**Status:** open / waiting-on-user / waiting-on-external / blocked.
**Notes:** any context.
```

## Open

### [asked 2026-03-19] Verify notification channels are actually delivering
**Question / task:** Telegram / Discord / Slack notifications via `./notify` claim to skip silently when secrets aren't set. Need a real end-to-end test that confirms a message reaches at least one channel.
**Asked by:** self-review
**Due:** no deadline
**Status:** stalled
**Notes:** Carried over from `memory/MEMORY.md`. Has been "next priority" since 2026-03-19. Recommend: send a test message via `./notify "test 2026-04-15"` from a manual run, confirm receipt, log result.

### [asked 2026-03-19] Run first RSS / HN digest
**Question / task:** `rss-digest` and `hacker-news-digest` skills exist and are scheduled but no digest output has been confirmed.
**Asked by:** self-review
**Due:** no deadline
**Status:** stalled
**Notes:** Scheduled at 7 AM UTC daily. Verify in `memory/logs/` whether they actually emit content.

### [asked 2026-04-15] Decide whether session-distill Stop hook fires in production
**Question / task:** The session-distill Stop hook from 2026-03-25 was flagged "verify hook fires correctly in production" and never closed. Phase 2.4 (interaction capture) depends on this working.
**Asked by:** Phase 2 design
**Due:** before Phase 2.4
**Status:** open
**Notes:** Check `memory/topics/` or `memory/logs/` for any session manifests written after 2026-03-25.

## Resolved

_(none yet)_
