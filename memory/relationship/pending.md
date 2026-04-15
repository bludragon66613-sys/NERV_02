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

### [asked 2026-04-15, updated 2026-04-15] Register session-distill.js in ~/.claude/settings.json Stop hooks
**Question / task:** The session-distill.js hook (~/.claude/hooks/session-distill.js) is **not registered** in the user's local Claude Code Stop hooks. Only Telegram-credential reading happens at module-load and only one manifest has been captured (2026-03-25), confirming the hook never fires. To enable it, add a new entry to `~/.claude/settings.json` under `hooks.Stop[]`:

```json
{
  "matcher": "*",
  "hooks": [
    {
      "type": "command",
      "command": "node \"C:/Users/Rohan/.claude/hooks/session-distill.js\"",
      "timeout": 60,
      "async": true
    }
  ]
}
```

**Asked by:** Phase 2.4 audit
**Due:** before Phase 2.x richer interaction capture
**Status:** waiting-on-user (touches global Claude Code config, deferred to user approval)
**Notes:** Phase 2.4 interaction-log skill is built and works without this — it derives user activity from gh search/commits instead. Adding the Stop hook will unlock session topic/exchange data for richer entries in `memory/relationship/interactions/`. Once registered, a future Phase 2.x pass should teach interaction-log to read manifests from `memory/topics/claude-sessions.md`.

## Resolved

_(none yet)_
