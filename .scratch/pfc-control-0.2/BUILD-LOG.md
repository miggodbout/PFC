# PFC Control 0.2 — the build log

Where the build actually is. One entry per session, newest at the bottom.
A cold session reads the last entry before it reads anything else.

The format and the rules are in `PFC_Control_0.2_Build_Prompt.md`, section 7.
What to build is in `BUILD-PLAN.md`. Neither belongs in here.

---

## Session 0 — 2026-08-08

**Step:** none. The build has not started.
**Branch:** none cut yet. `main` at `ca1f880`, serving 0.1.2.
**Deployed:** no.
**Merged to main:** n/a.

**Landed:** the 0.2 wayfinder map closed. `BUILD-PLAN.md` is LOCKED, and audited
against all nineteen tickets. `PFC_Control_0.2_Build_Prompt.md` written, holding the
branch rule, the token-cap rule, the clasp deploy loop, and the per-step `CACHE_NAME`
bump.

**Not landed:** nothing started.

**Tested:** nothing. clasp 3.3.0 confirmed installed and authenticated against the
Control script, two deployments listed.

**Open:** PLAN CALL 3 — Save pinned to the bottom of the Logger form — needs one look
at Miguel's phone at step 4. Nothing before then depends on it.

**Next:** cut the `0.2` branch from `main` and start plan section 6, step 1: the Sheet
and the server foundations. No screen work in that step.

---

## Session 1 — 2026-08-08

**Step:** 1, code complete, waiting on Miguel's test round.
**Branch:** `0.2` at `289318a`, cut from `main` at `1ff2e80`.
**Deployed:** yes — script version 2, description `0.2 step 1`. Same deployment id,
same URL. Health check answers `PFC Control — Active`.
**Merged to main:** yes, `1d5ab3c`. Both branches pushed.
**CACHE_NAME:** `pfc-control-0.2-step1`.

**Landed:** everything on the step 1 list.

- `Code.js` — three status values through `STATUS_VALUES`, `STATUS_FILLS` and
  `STATUS_KEYS`, so the dropdown and the conditional formatting drop to three by
  themselves. `ROLLUP_ORDER` and `worst()` deleted. `buildRollupFormula` rewritten
  to the counted rule, with the open-flag test as a `COUNTIFS` against the
  Deficiencies tab. `computeLayout` gives every item one column: 21 columns, was 41.
  All four `detailsCol` readers and the layout comment gone with it.
  `rebuildDashboard` five columns wide. New `buildDeficienciesTab`. Config version 2
  carrying `reasons` and per-item `types` / `trim` / `hint`. `handleListProjects`
  sends `unitsDone`, `unitsTotal`, `deficiencies`, `waiting` and no verdict. The
  stale `update-item` note replaced with one naming `save-batch`, `get-project` and
  `cancel-item-records`.
- `common.js` — `DEFAULT_PHASES` is the fourteen-item list. `DEFAULT_REASONS`,
  `WAITING_REASONS`, `DEFAULT_ITEM_LISTS` and `defaultItemLists()` sit beside it.
  Nothing else in this file is touched yet; `STATUS`, `CYCLE` and `worst()` still
  hold the 0.1 model, and step 2 owns them.
- `admin/index.html` — `collectPhases` sends each item's three lists, and the create
  payload carries `reasons`. The note that named the Details column is fixed.

**Three calls made during the build, none of them reversing a plan decision:**

1. **`handleListProjects`'s four numbers landed in step 1, not step 2.** Step 1 says
   delete `worst()`; that function's three call sites are what made the deletion
   possible, and `list-projects` is one of them. Splitting it would have meant
   writing a throwaway rollup on the server, which is the third copy the plan
   forbids.
2. **`handleGetUnit` takes its `overall` from the Sheet's own Overall Status cell**,
   which the rollup formula already computed. `handleGetStructure` lost its
   `overall` key outright — nothing on the phone read it. Both actions die in step 2
   anyway. No third rollup was written.
3. **A version guard, `configVersionError`.** The plan says version 2 exists so the
   code can refuse a version 1 Sheet with a clear message. `get-structure`,
   `get-unit` and `update-structure` now refuse one, and `list-projects` leaves it
   out of the list. This is why Buildings reads empty right now: the old test Sheets
   are version 1 and there is no upgrade path. Confirmed live —
   `list-projects` answers `{"success":true,"projects":[]}`.

**Not landed:**

- **`reference/PFC_Master_Template.xlsx` is not updated.** Plan section 1.7. It is
  the visual specification and no code reads it, and it is not on any step's list.
  It needs: 14 items instead of 17, no Details columns, three values in the
  dropdown, three conditional formats, the new Deficiencies tab, and the
  five-column Dashboard. The live copy in Drive
  (`1QIF5TCJ0iekpNGHEjce1PSoFXRFhucmF-ednTSYHT-M`) needs the same.
- Everything else in the plan from step 2 onward.

**Tested:** by me, not by Miguel. A dry run under node built the config from the
Admin payload and printed the layout and every formula: 21 columns, status C to P,
rollups Q to S, T Last Updated, U Overall Status, 14 items, version 2, the four
subtype lists, and the counted rollup formula with its `COUNTIFS`. The deployed web
app answers its health check and `list-projects`.

**Open:**

- **Miguel's step 1 test round has not run.** Do not start step 2 before it reports
  back.
- Only one `hint` ships filled, `Size   Jamb   Swing` on Interior Doors — the one
  Miguel gave. Every other hint is blank, and every trim is empty, both per plan
  section 1.1. Admin's Lists card fills them in step 5, with no release.
- The item name in row 5 of the Tracker tab now sits over an 89px column instead of
  a merged 234px one, so a long name such as BATHROOM ACCESSORIES wraps to two
  lines. Nothing in the plan set a new width. Worth one look when the Sheet is open.
- PLAN CALL 3 still waits for step 4.

**Next:** hand Miguel the step 1 test list from plan section 6, fix whatever it
finds, and only then start step 2 — `get-project`, `Store` on `localStorage`, the
demo data deleted, the rollup function and `pillHtml`, and the marks of section 4.

---

## Session 2 — 2026-08-08

**Step:** 1, test round run and passed. Step 1 is done.
**Branch:** `0.2` at `996673a`.
**Deployed:** yes — script version 3, description `0.2 step 1 fix 1`. Same
deployment id, same URL.
**Merged to main:** yes, `f4c62a8`. Both branches pushed.
**CACHE_NAME:** unchanged at `pfc-control-0.2-step1`. **Deliberate.** The one fix
this session was in `Code.js`, which lives in the Apps Script project and is never
served to a phone. No file behind the Service Worker changed, so a bump would have
forced every phone to re-download the same shell. Bump on the next front-end merge.

**Landed:** the twelve-item step 1 test list from plan section 6 was run in Chrome
against the live app, the live Admin and two fresh project Sheets. **All twelve
pass.** One real defect was found, fixed, deployed and retested end to end.

**The defect — the Dashboard Open Flags column read 1 when there were no records.**

`unitsWithOpenFlagFormula` built this:

```
=IFERROR(COUNTA(UNIQUE(FILTER(unit range, state range="Open"))),0)
```

FILTER answers `#N/A` when nothing matches, and the `IFERROR` was there to turn
that into a zero. It never fired. **`COUNTA` counts an error as one value**, so
`COUNTA(#N/A)` is `1`, `IFERROR` sees a number, and the cell reports one flagged
unit on a Sheet with an empty Deficiencies tab. Every Open Flags cell on every new
project read 1, and every phase without a record kept reading 1 after a real
record was added — so the column was wrong in both directions.

Fixed by dropping the FILTER construction for **`COUNTUNIQUEIFS`**, which answers
0 by itself when nothing matches:

```
=COUNTUNIQUEIFS(unit range, state range,"Open", phase range,"phase1")
```

The replacement was tested by hand in the test Sheet before the deploy — a phase
holding a record read 1, a phase without one read 0, the building read 1. A
comment above the function now names the trap by hand, because
`IFERROR(COUNTA(UNIQUE(FILTER(...))))` is the obvious thing to write there.

**What each test showed:**

| # | Test | Result |
|---|---|---|
| 1 | Buildings empty, "No projects yet." | pass — the version guard skips the four version 1 Sheets |
| 2 | Create a project, 14 items with Handles, Stops, Bathtub | pass |
| 3 | Tracker 21 columns, no Details | pass — A-B, C-P items, Q-S rollups, T DATE, U COMPLETION |
| 4 | Three values in the dropdown | pass |
| 5 | Three fills | pass — grey, amber, green |
| 6 | Deficiencies 13 columns, row 1 frozen, filter on | pass |
| 7 | Dashboard five columns, last reads Open Flags | **failed on the number**, fixed, retested |
| 8 | Phase 1 all Complete -> Q Complete | pass |
| 9 | One back to Not Started -> Q In Progress | pass — worst-wins is gone |
| 10 | Phase 1 all Not Started -> Q Not Started | pass |
| 11 | Three phases Complete -> U Complete | pass |
| 12 | One Open record -> Q, U and Open Flags all flip; Fixed -> all back | **failed on Open Flags**, fixed, retested both directions |

**Two extra checks, neither on the list, both clean:**

- `list-projects` over the wire sends `unitsDone:1, unitsTotal:6, deficiencies:0,
  waiting:0` and no `overall`. Correct per plan 2.4.
- **Admin's edit block survives the column change.** Added an item to Phase 1 on a
  project where unit 101 held fourteen Complete values, then removed it again.
  Every status came back intact both times and the rollups still read right. This
  was the one live path step 1 could have broken silently, because `readAllValues`
  and `rebuildTracker` both moved when the Details column left.

**Not landed:**

- **`reference/PFC_Master_Template.xlsx` is still not updated**, and neither is the
  live copy in Drive (`1QIF5TCJ0iekpNGHEjce1PSoFXRFhucmF-ednTSYHT-M`). Plan section
  1.7. Unchanged from session 1. No code reads it.
- Everything from step 2 onward.

**Open:**

- **Five Sheets in `PFC/Projects/` for Miguel to trash. I did not delete any.**
  Three are version 1 and the app already refuses them:
  `Elsliger`, `Elsliger 36 Unit B`, `ZZ Test Build (delete me)`.
  Two are mine from this test round, disposable once he has looked:
  `ZZ 0.2 Step 1 Test`, `ZZ 0.2 Step 1 Test B`.
- **The Buildings row still shows a wrong pill, and this is expected.** The server
  stopped sending `overall` in step 1, so the 0.1 drawing layer falls back and a
  building holding one Complete unit reads `Not Started`. Step 2 owns that screen
  and the four numbers are already on the wire waiting for it. Not a defect to fix
  now.
- **Buildings takes about eight seconds on a cold cache.** That is
  `handleListProjects` opening every project Sheet, the known ceiling in plan
  section 10. Do not fix it in 0.2.
- The item name in row 5 of the Tracker tab still wraps to two lines over an 89px
  column. Carried from session 1. Cosmetic, nothing in the plan sets a new width.
- PLAN CALL 3 still waits for step 4.

**Next:** start step 2 — `get-project`, `Store` rewritten to `localStorage`, the
demo data deleted, the rollup function and `pillHtml`, `list-projects` drawn from
the four numbers, the error branch on Buildings, the two empty messages, the
four-step Tracking order, pull to refresh, and the header flash.
