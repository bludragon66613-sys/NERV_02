---
name: AutoSkills
description: Scan projects for tech stack, detect matching AI skills, and install them. Uses midudev/autoskills for detection and skills.sh for installation.
var: ""
---
> **${var}** — Project name to scan (nerv, tallyai, paperclip, aeon). If empty, scans all projects.

Scan project(s) for technologies and install matching AI agent skills.

---

## Pre-flight

1. Verify `npx` is available: `which npx`
2. Read `~/autoagent/results/autoskills-scan.log` if it exists (previous scan results).
3. Check current installed skills per project:
   ```bash
   for dir in ~/aeon/dashboard ~/tallyai ~/paperclip ~/aeon; do
     echo "$dir: $(ls $dir/.claude/skills/ 2>/dev/null | wc -l) skills"
   done
   echo "global: $(ls ~/.claude/skills/ | wc -l) skills"
   ```

---

## Project Registry

| Name | Path | Stack |
|------|------|-------|
| nerv | `~/aeon/dashboard` | Next.js, React, Tailwind, TypeScript, Vercel |
| tallyai | `~/tallyai` | Next.js, React, Tailwind, shadcn/ui, Drizzle, Neon, AI SDK, Vitest |
| paperclip | `~/paperclip` | Node.js, TypeScript |
| aeon | `~/aeon` | Node.js, TypeScript |

---

## Step 1 — Select targets

If `${var}` is set, scan only that project.
If `${var}` is empty, scan all projects in the registry.

For each target, verify:
- Directory exists
- `package.json` exists
- Project has not been scanned in the last 7 days (check scan log)

If recently scanned, skip unless `${var}` explicitly targets it.

---

## Step 2 — Dry-run scan

For each target project:

```bash
cd <project_dir> && npx autoskills --dry-run -y 2>&1
```

Parse the output to extract:
- **Detected technologies** (list of tech names)
- **Detected combos** (cross-tech combinations)
- **Skills to install** (numbered list with sources)
- **Skill count** (total new skills)

---

## Step 3 — Evaluate and filter

Review the detected skills:
- **Keep**: Skills directly relevant to the project's active development
- **Skip**: Skills for technologies not actively used
- **Flag**: Skills that might conflict with existing global skills

Check for conflicts with existing `~/.claude/skills/` or project `.claude/skills/`:
```bash
ls <project_dir>/.claude/skills/ 2>/dev/null
```

If a skill is already installed (same name), skip it.

---

## Step 4 — Install

For each approved project:

```bash
cd <project_dir> && npx autoskills -y 2>&1
```

Record:
- Number of skills installed
- Installation time
- Any failures

---

## Step 5 — Log results

Append to `~/autoagent/results/autoskills-scan.log`:

```
=== ${date} ===
Project: ${name} (${path})
Detected: ${technologies}
Combos: ${combos}
New skills: ${count}
Status: ${installed|skipped|failed}
```

Append to `~/aeon/memory/logs/$(date +%Y-%m-%d).md`:
```
AUTOSKILLS: Scanned ${project_count} projects, installed ${total_skills} new skills
```

---

## Step 6 — Notify

```bash
./notify "🔧 AutoSkills: Scanned ${project_count} projects
New skills installed: ${total_count}
${per_project_summary}"
```

---

## Summary

End with:
```markdown
## Summary

- **Projects scanned:** ${count}
- **Technologies detected:** ${tech_list}
- **Skills installed:** ${total}
- **Per project:**
  - nerv: ${nerv_count} skills
  - tallyai: ${tallyai_count} skills
  - ...
```

---

## Guardrails

- Always dry-run first before installing
- Never install skills that conflict with existing ones
- Skip projects without package.json
- Log all scan results for tracking
- Do not modify global skills — only project-local installs
