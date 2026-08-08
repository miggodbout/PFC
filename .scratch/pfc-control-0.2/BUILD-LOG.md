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
