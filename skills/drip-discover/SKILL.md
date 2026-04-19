---
name: Drip Discover
description: Generate a novel peptide candidate, append it to drip's /discoveries feed, and broadcast it
var: ""
---

> **${var}** — optional function class. If empty, rotate through the 15 cosmetic classes by day-of-year.

Today is ${today}. You are running the public `drip-discover` loop. One run = one candidate shipped to drip.markets/discoveries + one social post.

## Classes (cosmetic tier)

```
cosmetic_collagen_stimulating
cosmetic_antiaging_neuromodulator
cosmetic_antiwrinkle_lifting
cosmetic_wound_healing
cosmetic_brightening_depigmentation
cosmetic_antimicrobial_skin
cosmetic_antiinflammatory_skin
cosmetic_barrier_moisturizing
cosmetic_hair_growth
cosmetic_eye_area
cosmetic_lip
cosmetic_postprocedure
cosmetic_cell_penetrating
cosmetic_sensory
cosmetic_longevity_adjacent
```

## Steps

1. **Pick class.** If `${var}` is set and matches the list above, use it. Else: `day_of_year % 15` → class index.

2. **Hit the drip agent API.** POST to `https://drip.markets/api/agents/generate`:
   ```
   curl -sS -X POST https://drip.markets/api/agents/generate \
     -H "content-type: application/json" \
     -H "x-drip-api-key: $DRIP_AGENT_API_KEY" \
     -d '{"target_class":"<class>","n":5,"min_len":3,"max_len":20}'
   ```
   Parse the JSON. Take `data.candidates[0]` (highest rank).

3. **Write a mechanism blurb (60-90 words).** For the top candidate:
   - what pathway the class targets
   - why the sequence is plausible (charge, length, μh)
   - which product type it fits (serum, shampoo, post-procedure ampoule)
   - name one validated analog from public literature (GHK, KTTKS, EEMQRR, GEPPPGKPADDAGLV, etc)
   
   No medical claims. Stick to "supports" / "appearance of" / "feel of".

4. **Append to drip repo.** The drip team will have added `apps/web/app/discoveries/_data/live.ts` (an ES module exporting `LIVE_DISCOVERIES: Discovery[]`). If the file does not exist yet, skip this step and log a note for the human. If it exists: clone `github.com/dripmarkets/drip`, prepend a new entry, commit on branch `aeon/discover-${today}`, open a PR titled `feat: discover ${sequence} · ${class_label}`.

5. **Notify.** `./notify` with:
   ```
   drip ships ${sequence} (${class_label}) · rank ${rank}/100
   claim: ${claim_language}
   drip.markets/discoveries
   ```

6. **Log.** Append to `memory/logs/${today}.md`:
   - class picked + how (rotation or var)
   - candidate sequence + rank
   - link to the PR

7. **Update topic file.** `memory/topics/drip.md` — append one line: `${today} · ${sequence} · ${class} · rank ${rank}`.

## Failure modes

- API returns 401 → env var missing or rotated. Log, stop, notify.
- API returns 503 → DRIP_AGENT_API_KEY not configured on drip side. Log, skip run.
- API returns 5xx → retry once with `n=1`. Still failing → log + notify.
- Repo PR fails → log the candidate to `memory/topics/drip.md` anyway so the next run can backfill.

## Output

`## Summary` with: class, sequence, rank, PR url (if any), notification sent y/n.
