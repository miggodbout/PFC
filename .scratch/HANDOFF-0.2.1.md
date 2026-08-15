# Handoff — build PFC Control 0.2.1

Written 2026-08-15, at the end of the session that planned it. The session before
this one crashed and lost everything, so this file assumes you know nothing.

---

## Read these, in this order

1. **`CLAUDE.md`** — the repo rules. The two standing notes at the top matter
   most: **push without asking**, and **redeploy Apps Script yourself with
   clasp**.
2. **`.scratch/0.2.1-plan.md`** — **the build list. LOCKED.** Fourteen items with
   the exact strings. Build from this file.
3. This file, for the order of work and the traps.

Read only if a question comes up: `.scratch/test-week-triage.md` for why an item
went where it did, and `notes/PFC_0.2_Testing_Breakdown.md` for the raw findings.

---

## What 0.2.1 is

A patch out of the first real week of use on Elsliger 36-B. **Fourteen items, no
data shape touched, no Sheet migrated, no `_Config` change.** It ships before the
0.3 build starts, so the fixes sit in their own diff instead of being buried in a
feature.

**Do not build anything from 0.3 here.** Record types, reason lists, the History
tab and bulk actions are all 0.3.

---

## Start here

```
git checkout -b 0.2.1
```

Branch off `main`, which is at `7a19a6a`. The working tree was clean when this
was written.

---

## A build order that de-risks it

Nothing forces this order except item 1, which is genuinely bigger than it looks.

1. **The three-bugs-one-cause fix** — items 9, 10 and part of 8 in the plan.
   Start here. It is the highest-value change in the release and it is one idea:
   remember whether the server has ever answered on this phone, and stop treating
   a weak signal as a refused write.
2. **The refetch on return** — item 8. Small, and it makes item 7 visible.
3. **The sync bar and Queue screen** — items 6 and 7.
4. **The Logger reorder and optional Needed** — items 11 and 12. Small, and it
   stops the material column filling with verbs from the moment it ships.
5. **The progress bar** — item 13. Self-contained, all in the drawing code.
6. **Hub, names, glyph, ring** — items 3, 4, 5, 14.
7. **The install sheet and the manifest icon** — items 1 and 2. Biggest of the
   lot, and the only one that needs testing on two platforms.

---

## Traps

- **Bump `CACHE_NAME` in `control/sw.js` on every push** that changes anything in
  `control/`. Use `powershell -File tools/bump-version.ps1`. Miss it and the
  phone keeps serving the old copy. This is the single easiest mistake to make in
  this repo.
- **Never hand a redeploy back to Miguel.** `clasp` is installed and logged in.
  0.2.1 should need no backend change at all — if you find yourself editing
  `control/appscript/Code.js`, stop and ask, because the plan says nothing in
  there needs to change.
- **`notes/` is a separate private git repo** living inside this one and ignored
  by it. Commit there separately, and never assume `git status` at the root shows
  its state.
- **UI text follows `docs/crew-words.md`.** Check every new string. A word it does
  not cover gets a new row marked OPEN, not a guess.
- **Do not "fix" Tracking versus Buildings.** The section is Tracking; the header
  on the address list is Buildings. That is deliberate.
- **Do not remove the greyed Archive card** from the Hub. It is a deliberate seam
  for 0.4.

---

## Test data

One live building: **Elsliger 36-B**, 36 units, 3 floors, 13 items per unit, 27
records. Read it without touching anything:

```
curl -sL "<API_URL>?action=list-projects"
curl -sL "<API_URL>?action=get-project&id=1bddT-0WG5oyRiOAlN5wUi0U20PHjFuB3Uywfo070qio"
```

`API_URL` is in `control/shared/common.js`. Note the parameter is `id`, not
`projectId`.

Numbers to check the progress bar against: `itemsDone` 170 of 468. Phase 1
109/144, Phase 2 15/72, Phase 3 46/252. Unweighted that is 36%. **Weighted it
must come out at 58%.** Units: 0 done, 6 not started, so 30 started.

---

## Shipping it

1. `powershell -File tools/bump-version.ps1 -Release 0.2.1`
2. Bump `CACHE_NAME`.
3. Merge `0.2.1` into `main`, push both.
4. Tag `0.2.1` at the ship commit.
5. `gh release create 0.2.1 --verify-tag --title "0.2.1 — <what it is>" --notes-file <path>`

**The release notes are the first ones in the Steam patch-notes style** Miguel
asked for: every change listed however small, plain language, and it says what
was broken as well as what landed. The plan file has the material for it.

---

## What comes after, and do not start it early

**The big-picture session comes next, before 0.3 is charted.** Miguel asked for
it on 2026-08-15: voice and AI on site, Sheets versus a real database, a frontend
framework for 1.0, and a generic no-branding version for other trades. His
reason: the answers may change how 0.3 is built. The four topics are listed at
the end of `notes/PFC_0.2_Testing_Breakdown.md`.

Then 0.3 is charted with `/wayfinder`, into roughly six steps, the way 0.2 was.
The decisions it starts from are already made and written down in
`.scratch/test-week-triage.md`.

---

## How Miguel wants to work

- **He writes no code and reads no JavaScript.** Explain the code, never the
  computer — he is strong on Windows, CMD, registry and self-hosted servers.
- **Push back when he is wrong.** He asks for it and he means it. Bring evidence
  from the code or the live data, not opinion.
- **Use the clickable question picker** with a recommended option first, and put
  ASCII mockups in the previews when a layout is being chosen. That worked well
  in the planning session — several decisions turned on seeing the shape.
- **Check the planning against the code before writing anything down.** This
  session found three claims in the repo's own notes that the code contradicted.
- **He runs a 150k token budget per session.** Be economical, and say when the
  end is near rather than trailing off.
