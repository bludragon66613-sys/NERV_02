---
name: AutoAgent
description: Autonomous agent/skill improvement loop — reads program-local.md, selects weakest target, applies one surgical improvement, evaluates, and keeps or discards based on score delta. Modelled on kevinrgu/autoagent.
var: ""
---
> **${var}** — Target to evolve. If empty, auto-selects the weakest agent or skill.

Run one iteration of the autonomous improvement loop.

---

## Pre-flight

1. Read `~/autoagent/program-local.md` in full — this is your directive.
2. Read `~/autoagent/results/results.tsv` for experiment history.
3. Read `~/aeon/memory/topics/skill-scores.json` if it exists.
4. Read `~/aeon/memory/topics/skill-evolution.md` if it exists.
5. Verify `~/.claude/agents/` contains agent definitions.
6. Verify `~/aeon/skills/` contains skill definitions.

---

## Step 1 — Select target

If `${var}` is set, use that as the target. Determine if it's an agent
(exists in `~/.claude/agents/${var}.md`) or a skill (exists in `~/aeon/skills/${var}/SKILL.md`).

If `${var}` is empty, select automatically:
1. Check `skill-scores.json` for the lowest composite score
2. Check `results.tsv` for recently evolved targets (skip anything evolved in last 3 days)
3. Pick the lowest-scored target that hasn't been evolved recently
4. If no scores exist, start with `morning-brief` (well-understood baseline skill)

Record:
- `target`: name of agent/skill
- `target_type`: `agent` or `skill`
- `baseline_score`: current composite score (or `unscored` if never evaluated)

---

## Step 2 — Evaluate baseline (if unscored)

If the target has no score:
- For skills: mentally run the `skill-eval` rubric (Completeness, Efficiency, Specificity — each 0-10)
- For agents: read the agent definition and benchmark tasks from `~/autoagent/benchmarks/agent-benchmarks.json`, evaluate task_completion, output_quality, efficiency (each 0-10)

Record the baseline composite score.

---

## Step 3 — Diagnose

Read the full target definition:
- For agents: `~/.claude/agents/${target}.md`
- For skills: `~/aeon/skills/${target}/SKILL.md`

Identify the **single weakest dimension**:
- If completeness/task_completion is lowest → look for missing steps, vague instructions
- If efficiency is lowest → look for redundant steps, bloated prompts, wasted tokens
- If specificity/output_quality is lowest → look for vague outputs, missing examples

Also check:
- Missing error handling for common failure modes
- No verification step (agent doesn't check its own work)
- Overly long prompts that could be tightened
- Missing output format examples

Write a one-sentence hypothesis:
> "Hypothesis: [specific change] will improve [dimension] because [reason]."

---

## Step 4 — Branch and apply

```bash
cd ~/aeon  # or appropriate repo
git checkout -b autoagent/evolve/${target}-v$(date +%Y%m%d-%H%M)
```

Make **exactly one surgical change** to the target. Examples:
- Add a missing verification step
- Tighten a vague output format with a concrete example
- Remove a redundant step
- Add error handling for a common failure mode
- Clarify ambiguous instructions

**Do NOT:**
- Rewrite the entire target from scratch
- Change the target's core purpose
- Add task-specific hacks (overfitting rule from program-local.md)
- Modify locked files (skill-eval, skill-evolve, autoagent, aeon.yml)

Commit:
```bash
git add <changed-file>
git commit -m "autoagent(${target}): ${one_line_description}"
```

---

## Step 5 — Re-evaluate

Score the modified target using the same rubric as Step 2.

Record:
- `new_score`: new composite score
- `delta`: new_score - baseline_score
- Per-dimension scores

---

## Step 6 — Decision

Apply strictly:

| Condition | Decision |
|-----------|----------|
| `new_score > baseline_score` | **KEEP** — merge to main |
| `new_score == baseline_score` AND change is simpler | **KEEP** — merge to main |
| `new_score == baseline_score` AND change adds complexity | **DISCARD** — delete branch |
| `new_score < baseline_score` | **DISCARD** — delete branch |

### KEEP
```bash
git checkout main
git merge autoagent/evolve/${target}-v... --no-ff -m "autoagent(${target}): improve ${baseline_score} → ${new_score}"
git branch -d autoagent/evolve/${target}-v...
```

### DISCARD
```bash
git checkout main
git branch -D autoagent/evolve/${target}-v...
```

Even discarded runs provide signal — record what was learned.

---

## Step 7 — Log results

### results.tsv
Append to `~/autoagent/results/results.tsv`:
```
${date}\t${target}\t${target_type}\t${baseline_score}\t${new_score}\t${delta}\t${status}\t${hypothesis}\t${description}
```

### skill-scores.json (for skills only)
If target is a skill, append new score entry to `~/aeon/memory/topics/skill-scores.json`.

### Evolution log
Append to `~/aeon/memory/topics/skill-evolution.md`:
```markdown
## ${today} — ${target} (via autoagent)

- **Hypothesis:** ${hypothesis}
- **Change:** ${description}
- **Baseline:** ${baseline_score}
- **New score:** ${new_score} (delta: ${delta})
- **Outcome:** ${status}
- **Learning:** ${what_was_learned}
```

### Daily log
Append to `~/aeon/memory/logs/$(date +%Y-%m-%d).md`:
```
AUTOAGENT: ${target} ${status} ${baseline_score} → ${new_score} (Δ${delta})
```

---

## Step 8 — Notify

```bash
./notify "🧬 AutoAgent: ${target} ${status}
Score: ${baseline_score} → ${new_score} (Δ${delta})
Change: ${description}"
```

---

## Summary

End with:
```markdown
## Summary

- **Target:** ${target} (${target_type})
- **Hypothesis:** ${hypothesis}
- **Change:** ${description}
- **Result:** ${baseline_score} → ${new_score} (${status})
- **Learning:** ${key_insight}
```

---

## Guardrails

- Never modify locked files: `skill-eval`, `skill-evolve`, `autoagent`, `aeon.yml`
- One change per run — resist the urge to fix everything
- No overfitting: changes must be generalizable
- If git operations fail, log error and exit cleanly
- Simpler is better at equal scores
- Record even failed experiments — they provide signal
