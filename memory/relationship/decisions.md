# Decisions Log

> Append-only log of non-obvious decisions and stated preferences. Each entry is a small, atomic fact that should outlive the conversation it came from. Read by skills that need to respect a stated preference (model choice, communication style, project-specific rules).

## Format

```
### YYYY-MM-DD — short title
**Decision:** what was decided.
**Why:** the reason given (one sentence).
**Source:** where this came from — Telegram message, commit hash, session manifest, etc.
```

## Entries

### 2026-04-15 — Retire Phase 1 eval suite, restart as Phase 2
**Decision:** Phase 1 (structural reliability evals) is retired. Phase 2 redesigned around user-relationship modeling — chief-of-staff memory.
**Why:** Phase 1 was misimplemented (`identity-persists` checked the wrong invariant), never wired to a scheduled skill, and the underlying SOUL.md/IDENTITY.md files it claimed to monitor never existed.
**Source:** session 2026-04-15, commit 3f79bbf.

### 2026-04-15 — Sonnet by default, Opus only for complex reasoning
**Decision:** Default model is Claude Sonnet 4.6. Use Opus 4.6 only for complex coding / architectural / reasoning tasks.
**Why:** Cost and latency. Sonnet is sufficient for ~90% of work.
**Source:** memory `feedback_model_selection.md`, reaffirmed 2026-04-15.

### 2026-04-15 — Brevity over politeness
**Decision:** Drop articles, filler, hedging, pleasantries. Short fragments are fine. Code/commits/security written normally.
**Why:** User reads diffs and reads fast. Decoration is drag.
**Source:** caveman skill activation pattern, repeated session preference.

### 2026-04-15 — Three similar lines beats a premature abstraction
**Decision:** Don't extract shared helpers from code that only structurally resembles other code unless the duplication is byte-for-byte identical and meaningful in volume. Don't add features beyond what was asked.
**Why:** Karpathy guidelines, observed during Paperclip cleanup pass 9 — `parse.ts` MEDIUM dedup item was correctly skipped because output models genuinely diverge per adapter.
**Source:** Paperclip cleanup branch `cleanup/ai-slop-2026-04-15`, session 2026-04-15.
