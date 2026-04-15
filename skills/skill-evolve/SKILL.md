---
name: Skill Evolve
description: Autonomous skill improvement loop — picks the lowest-scored skill, hypothesizes one change, applies it on a branch, re-evaluates, and keeps or reverts based on score delta. Enhanced with autoagent patterns (results tracking, failure analysis, overfitting guard).
var: ""
---
> **${var}** — Skill name to evolve. If empty, picks the lowest-scored skill automatically.
> Append `--loop` to run continuously until interrupted (e.g. `morning-brief --loop`).

Run one iteration of the skill evolution loop.

---

## Pre-flight

1. Read `memory/topics/skill-scores.json`.
   - If it does not exist or has fewer than 3 entries, run `skill-eval` on 3 core skills
     first: `morning-brief`, `self-review`, `skill-health`. Then re-read scores.
2. Read `memory/topics/skill-evolution.md` if it exists (evolution history log).
3. Read `~/autoagent/results/results.tsv` if it exists (cross-system results tracking).
4. Read `~/autoagent/benchmarks/skill-benchmarks.json` for failure mode awareness.
5. Read `memory/MEMORY.md` for current goals.

---

## Step 1 — Select target skill

If `${var}` is set, use that skill as the target.

Otherwise, find the skill with the **lowest composite score** in `skill-scores.json`
that has not been evolved in the last 7 days (check evolution history log).

Record:
- `target_skill`: the chosen skill name
- `baseline_score`: its most recent composite score
- `baseline_date`: date of that score

If all scored skills have been evolved in the last 7 days, pick the one evolved
least recently regardless of score. Log: "All skills recently evolved — picking oldest."

---

## Step 2 — Diagnose the skill

Read `skills/${target_skill}/SKILL.md` in full.

Identify the **single weakest dimension** from its most recent score:
- If completeness is lowest → look for missing steps or ambiguous instructions
- If efficiency is lowest → look for redundant fetches, repeated steps, bloated prompts
- If specificity is lowest → look for vague output descriptions or missing format examples

### Failure analysis (autoagent pattern)
Check `~/autoagent/benchmarks/skill-benchmarks.json` for known failure modes of this skill.
Also check the evolution log for past failed hypotheses on this skill — do not repeat them.

Classify the weakness:
- **Missing capability** — skill lacks a step to handle a common scenario
- **Weak verification** — skill doesn't check its own output
- **Prompt bloat** — instructions are longer than needed
- **Vague output** — no concrete examples of expected output
- **Silent failure** — skill can fail without reporting it
- **Missing error handling** — known failure mode not addressed

Write a one-sentence hypothesis:
> "Hypothesis: Adding [specific change] to [section] will improve [dimension] because [reason]."

### Overfitting guard (autoagent pattern)
Before applying, check: "If the benchmark task that exposed this weakness disappeared,
would this still be a worthwhile improvement?" If no, find a more general fix.

**Constraint: make exactly one change per evolution iteration.**
Do not rewrite the whole skill — surgical edits only.

---

## Step 3 — Create a branch and apply the change

```bash
git checkout -b skills/evolve/${target_skill}-v$(date +%Y%m%d-%H%M)
```

Edit `skills/${target_skill}/SKILL.md` with the single hypothesized change.

Examples of valid changes:
- Add a missing step (e.g. "If no results found, log 'NO_DATA' and exit")
- Tighten a vague output format (e.g. add a concrete example block)
- Remove a redundant step
- Clarify an ambiguous instruction with a concrete example
- Add an error handling branch that was missing

Examples of invalid changes (do not do these):
- Rewriting the entire skill from scratch
- Changing the skill's core purpose
- Adding new external API calls that weren't in the original
- Modifying the score rubric

Commit:
```bash
git add skills/${target_skill}/SKILL.md
git commit -m "evolve(${target_skill}): ${one_line_description_of_change}"
```

---

## Step 4 — Re-evaluate

Run `skill-eval` on `${target_skill}`:

Mentally execute the skill-eval rubric on the **modified** skill text.

Record:
- `new_completeness`: new score
- `new_efficiency`: new score
- `new_specificity`: new score
- `new_composite`: new composite

---

## Step 5 — Decision: KEEP, DISCARD, or NOTE

### KEEP (merge to main)
If `new_composite > baseline_score`:
```bash
git checkout main
git merge skills/evolve/${target_skill}-v... --no-ff -m "evolve(${target_skill}): improve composite ${baseline_score} → ${new_composite}"
git branch -d skills/evolve/${target_skill}-v...
```
Outcome: **KEEP** ✅

### DISCARD (revert)
If `new_composite <= baseline_score`:
```bash
git checkout main
git branch -D skills/evolve/${target_skill}-v...
```
Outcome: **DISCARD** ❌

### NOTE (edge case)
If scores are equal (within 0.1) but the change fixed a real ambiguity:
- Use judgment — KEEP if the change removes genuine confusion, DISCARD otherwise
- Record as **NOTE** in evolution log

---

## Step 6 — Record in evolution log

Append to `memory/topics/skill-evolution.md` (create if missing):

```markdown
## ${today} — ${target_skill}

- **Hypothesis:** <your hypothesis>
- **Change:** <one-line description of what was changed>
- **Weakness class:** <missing_capability|weak_verification|prompt_bloat|vague_output|silent_failure|missing_error_handling>
- **Baseline:** ${baseline_score} (C:${c} E:${e} S:${s}) on ${baseline_date}
- **New score:** ${new_composite} (C:${nc} E:${ne} S:${ns})
- **Delta:** ${new_composite - baseline_score:+.2f}
- **Outcome:** KEEP ✅ / DISCARD ❌ / NOTE 📝
- **Reason:** <why you made this decision>
- **Learning:** <what signal this provides for future iterations>
```

Also append a new entry to `memory/topics/skill-scores.json` with the post-eval score
(regardless of outcome — the history is valuable either way).

### Cross-system results tracking (autoagent pattern)
Also append to `~/autoagent/results/results.tsv`:
```
${date}\t${target_skill}\tskill\t${baseline_score}\t${new_composite}\t${delta}\t${outcome}\t${hypothesis}\t${description}
```
This enables unified tracking across skill-evolve and autoagent runs.

---

## Step 7 — Log and notify

Append to `memory/logs/${today}.md`:
```
SKILL_EVOLVE: ${target_skill} ${outcome} ${baseline_score} → ${new_composite} (Δ${delta})
```

Send via `./notify`:
```
🧬 Skill Evolved: ${target_skill}
Hypothesis: <your hypothesis>
Score: ${baseline_score} → ${new_composite} (${outcome})
```

---

## Continuous mode (--loop)

If `${var}` contains `--loop`, after completing one iteration:
1. Do NOT stop or ask whether to continue
2. Return to Step 1 and select the next target
3. Continue until explicitly interrupted
4. Sleep 10 seconds between iterations to avoid rate limits

This enables overnight autonomous improvement runs.

---

## Guardrails

- Never modify `aeon.yml`, `skill-eval/SKILL.md`, `skill-evolve/SKILL.md`, or `autoagent/SKILL.md` — these are the locked harness
- Never change the eval rubric thresholds
- One change per run — resist the urge to "fix everything"
- No overfitting: "If this benchmark disappeared, would this still help?" — if no, skip it
- Prefer changes that fix a class of issues, not a single case
- If git operations fail, log the error and exit cleanly without leaving a dirty branch
- If `skill-scores.json` is missing scores for the target skill, run `skill-eval ${target_skill}` first, then proceed
- Even discarded experiments provide learning signal — always record what was learned
