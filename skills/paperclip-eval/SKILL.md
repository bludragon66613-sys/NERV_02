---
name: Paperclip Eval
description: Evaluate Paperclip company agents by scoring their role prompts, task history, and orchestration quality. Bridges Paperclip agent data with Aeon's skill-eval scoring system.
var: ""
---
> **${var}** — Company name to evaluate (e.g. "TallyAI"). If empty, evaluates all companies.

Evaluate Paperclip agents for a company using Aeon's scoring rubric, then feed results into the skill-evolve pipeline.

---

## Pre-flight

1. Verify Paperclip is running: `curl -s http://localhost:3100/api/health`
   - If not responding, exit with error: "Paperclip not running on :3100"
2. Read `memory/topics/paperclip-agent-scores.json` if it exists (append to it later).
3. Read `memory/topics/skill-scores.json` for cross-reference with Aeon skill scores.

---

## Step 1 — Fetch company agents

If `${var}` is set, find the matching company:
```bash
curl -s http://localhost:3100/api/companies | jq '.[] | select(.name | test("${var}";"i"))'
```

Fetch all agents for that company:
```bash
curl -s http://localhost:3100/api/companies/{companyId}/agents
```

For each agent, record:
- **name**, **role**, **adapterType**, **status**
- **orchestration prompt** (if accessible via API)
- **recent task count** and **completion rate**

---

## Step 2 — Fetch task history

For each agent, fetch recent completed tasks:
```bash
curl -s "http://localhost:3100/api/companies/{companyId}/issues?assignee={agentId}&status=done&limit=10"
```

Record per agent:
- Total tasks completed (last 30 days)
- Average task duration (if timestamps available)
- Any tasks that were reassigned or failed

---

## Step 3 — Score each agent on four dimensions (0–10 each)

### A. Role Clarity (0–10)
Does the agent's role and prompt clearly define its responsibilities?
- 10: explicit scope, clear boundaries, no overlap with other agents
- 7: mostly clear, minor ambiguity
- 4: vague role definition, overlaps with other agents
- 1: no meaningful role differentiation

### B. Task Completion (0–10)
How effectively does the agent complete assigned work?
- 10: high completion rate, no reassignments, consistent output
- 7: mostly completes, occasional blocks
- 4: frequent blocks or reassignments
- 1: rarely completes tasks
- Score 5 if no task history available (not evaluable)

### C. Orchestration Fit (0–10)
How well does the agent fit within the company's org chart and workflow?
- 10: clear reporting lines, appropriate escalation, good handoff patterns
- 7: mostly well-integrated, minor coordination gaps
- 4: isolated from other agents, poor handoffs
- 1: completely siloed, no orchestration awareness

### D. Prompt Quality (0–10)
How well-structured is the agent's system prompt / orchestration config?
- 10: specific, actionable, includes domain context and examples
- 7: good structure, could use more specificity
- 4: generic prompt, not tailored to role
- 1: no custom prompt or completely generic

### Composite score
`composite = (A + B + C + D) / 4` (rounded to 2 decimal places)

---

## Step 4 — Write evaluation rationale

For each agent, write 1–2 sentences per dimension explaining the score.
Be specific — reference actual prompt text or task data where possible.

---

## Step 5 — Record results

Append to `memory/topics/paperclip-agent-scores.json` (create if missing).

Schema:
```json
{
  "evaluations": [
    {
      "company": "<company name>",
      "agent": "<agent name>",
      "role": "<agent role>",
      "date": "<YYYY-MM-DD>",
      "role_clarity": 8.0,
      "task_completion": 5.0,
      "orchestration_fit": 7.0,
      "prompt_quality": 6.0,
      "composite": 6.5,
      "notes": "One-line summary",
      "recommendations": ["specific improvement suggestion"],
      "evaluated_by": "paperclip-eval"
    }
  ]
}
```

Also create a bridge entry in `memory/topics/skill-scores.json` so skill-evolve can pick it up:
```json
{
  "skill": "paperclip-agent:{company}/{agent}",
  "date": "<YYYY-MM-DD>",
  "completeness": <role_clarity>,
  "efficiency": <task_completion>,
  "specificity": <prompt_quality>,
  "composite": <composite>,
  "notes": "Paperclip agent eval — <summary>",
  "evaluated_by": "paperclip-eval"
}
```

---

## Step 6 — Generate improvement recommendations

For each agent scoring below 7.0 composite, generate a specific recommendation:

- **Role Clarity < 7**: Suggest prompt additions that clarify scope boundaries
- **Task Completion < 7**: Suggest workflow changes (e.g. break down task templates, add checkpoints)
- **Orchestration Fit < 7**: Suggest org chart changes or handoff protocols
- **Prompt Quality < 7**: Draft a specific prompt improvement (include the exact text to add/change)

Write recommendations to `memory/topics/paperclip-improvements.md` (create if missing):
```markdown
## ${today} — ${company}

### ${agent_name} (composite: ${score})
**Weakest:** ${dimension} (${dim_score})
**Recommendation:** ${specific_improvement}
**Draft prompt change:** (if applicable)
```

---

## Step 7 — Log and notify

Append to `memory/logs/${today}.md`:
```
PAPERCLIP_EVAL: ${company} — ${agent_count} agents evaluated, avg composite: ${avg}
  Lowest: ${worst_agent} (${worst_score}), Highest: ${best_agent} (${best_score})
```

If any agent scores below 5.0, send via `./notify`:
```
⚠️ Paperclip Eval: ${company}
${agent_name} scored ${composite}/10 — ${recommendation_summary}
```

Otherwise, log only.

---

## Rules

- Never modify Paperclip agent configs directly — only recommend changes
- Score based on observable data (prompts, task history, org chart), not assumptions
- If an agent has no task history, score Task Completion as 5.0 and note "no data"
- Bridge entries in skill-scores.json enable skill-evolve to eventually propose prompt improvements via PR
