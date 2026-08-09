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

---

## Session 3 — 2026-08-08

**Step:** 2, code complete. Smoke check run and passed. Step 2 is done.
**Branch:** `0.2` at `3380012`.
**Deployed:** yes — script version 4, description `0.2 step 2`. Same deployment
id, same URL.
**Merged to main:** yes, `0cbfe8d`. Both branches pushed.
**CACHE_NAME:** raised to `pfc-control-0.2-step2`. Every front-end file changed,
so a phone must re-download the shell.

**Landed:** everything on the step 2 list.

- **`get-project`** — one whole building in one answer. The config with every
  item's `types`, `trim` and `hint`, the building's `reasons`, every unit's item
  statuses as `status[unitKey][itemKey]`, `lastUpdated` per unit, and the whole
  Deficiencies tab in every state through a new `readRecords`. One `getValues`
  over the Tracker grid, one over the records block. No rollup goes out — the
  phone owns that rule. A six-unit building is **4.4 KB** on the wire.
- **`Store` rewritten to `localStorage`** — four keys, four lifetimes:
  `projects`, `project.<id>`, `outbox`, `chips`. One key per building. Ten copies
  kept, least recently opened dropped first, and never one holding an unsent
  edit. `dropProject` is the only delete path and it calls
  `foldNeededLinesIntoChips`, which step 4 fills in.
- **The outbox shelf, storage only.** Keyed `projectId|unitKey|itemKey`, one job
  per key, every job carrying the final value. A tap on the Unit screen now
  survives a tab close. The drain, the backoff, the hold rules and the Outbox
  window are step 3, as planned. The shelf is memoised per page load — painting
  48 chips asks for it about 700 times.
- **The rollup, written once.** `rollup(counts, flags)` plus `rollupOf(statuses,
  flags)`, returning status, count and both flag counts. `worst()` and
  `ROLLUP_ORDER` deleted from `common.js`. `displayStatus` applies the one
  downgrade: Complete displays as In Progress while an open flag sits on the
  item, and the stored value is never touched. `pillHtml` and `dotHtml` take the
  rollup object.
- **The demo buildings deleted** — about 200 lines, plus `demoBannerHtml`,
  `spread`, `hashStr` and `isDemo`. The `DEMO` tag is gone from Buildings, the
  banner from the Building screen, and the demo filter from Admin.
- **The marks of plan section 4** — `barHtml`, `countText`, `flagChipHtml`,
  `notSavedChipHtml`, `marksHtml` and `marksLabel` in `common.js`, with the
  classes in `theme.css`. A floor header carries its marks only while closed. A
  unit chip carries both flag kinds with no numbers, and the corner badge hangs
  outside its top right corner.
- **Buildings** — draws its stored list first, refreshes behind, and now has an
  error branch. Both empty messages. The four-step order for drawing a row, with
  the already-finished set in `sessionStorage`. A finished building's copy is
  dropped on the list refresh.
- **Pull to refresh** on Buildings, Building and Unit, as `enablePullToRefresh`.
- **The header flash fixed** on `building.html` and `unit.html`. Both ship an
  empty `<h1>`, and the name comes out of the stored copy, or out of the stored
  Buildings list when there is no copy yet.
- `.s-on_hold` renamed `.s-waiting`, and `.s-none` added for a group with
  nothing in it.

**Four calls made during the build:**

1. **`list-projects` gained a FIFTH number, `unitsNotStarted`.** Plan 2.4 says
   four numbers. The rollup rule of 3.4 needs `s`, and four numbers cannot tell
   "every unit Not Started" from "some unit In Progress" — both arrive as
   `unitsDone: 0`. It is one `.filter()` over an array already in memory, it is
   still a number and not a verdict, and without it every untouched building on
   Tracking would have read In Progress. **The plan should be treated as having
   five numbers there.**
2. **The Details box was deleted in step 2, not step 3.** Plan 5.4 owns it, but
   step 1 removed the Details column from the Sheet and `get-project` sends no
   `details` key, so the box had no data source at all. It went with its column.
3. **`handleGetUnit` and `handleGetStructure` both stay.** Session 1 predicted
   both would die here. `get-structure` cannot: Admin calls it for the item list
   its edit cards offer, and it wants the server's answer rather than a phone
   copy. `handleGetUnit` is now unused and is left in place with a comment
   saying so. Neither is on any step's delete list.
4. **`localOnlyNote()` is kept for one more step.** Plan 5.1 deletes it, but it
   is still true: step 2 puts a tap on the shelf and nothing sends it. The
   wording changed from "Preview only / saving arrives in the next version" to
   "Not sent yet / it reaches the project Sheet in the next step". **Delete it in
   step 3 when the sync bar lands** — there is a BUILD NOTE on the function.

**Tested:** by me, not by Miguel. Three rounds, no screenshots except one.

- **A node dry run of the rules, 45 assertions, all pass.** Every branch of the
  rollup including 17-done-1-not; `displayStatus` in both directions; a flagged
  Complete item; a Fixed record not flagging; a floor counting units and not
  items; a waiting edit painting and a held edit not painting; one key holding
  one job; eleven buildings opened keeping ten; a copy with an unsent edit never
  dropped; and the five-number building rollup, including the case the fifth
  number exists for.
- **Against the live web app**, a fresh project `ZZ 0.2 Step 2 Test`: 17
  assertions on the `get-project` shape and the `list-projects` numbers, all
  pass.
- **In Chrome, against the live backend**, on all three screens: Buildings drew
  its row with the count line and the correct Not Started pill; the Building
  screen drew both floors, and a waiting edit moved unit 101's dot and bar while
  a held edit left unit 102 alone and gave it the corner badge; floor marks
  appeared when the floor closed and went when it opened; the Unit screen drew
  **14 items instantly from the copy with no spinner and no header flash**, the
  dropdown held three values, and a tap landed on the shelf and painted. Then
  with `fetch` broken and `navigator.onLine` false: with a copy it drew all 14
  items under `Offline. Last updated Sat 8:37 PM.`, and with the copy deleted it
  read **No copy on this phone**, not a blank screen. One screenshot: colours
  and layout correct.

**Not landed:**

- **`reference/PFC_Master_Template.xlsx` is still not updated**, and neither is
  the live copy in Drive (`1QIF5TCJ0iekpNGHEjce1PSoFXRFhucmF-ednTSYHT-M`). Plan
  1.7. Unchanged since session 1. No code reads it.
- Everything from step 3 onward.

**Open:**

- **One test Sheet for Miguel to trash: `ZZ 0.2 Step 2 Test`.** I did not delete
  it. Nothing else was created this session.
- **The greyed, untappable Complete is not built yet.** It is on step 3's list.
  It cannot be reached today: no screen creates a record until Logger lands in
  step 4, so no item can hold an open flag unless the Deficiencies tab is edited
  by hand.
- **The chip bar looks long on a desktop window.** The floor grid is four
  columns of `1fr`, so at 1536px each chip is ~370px wide and its bar stretches
  with it. On a phone the chips are ~77px and it reads as intended. Pre-existing
  grid behaviour, not new. Worth one look on his phone.
- **`.details-btn` and `.details-edit` are still in `theme.css`** with nothing
  drawing them. Step 6 sweeps the theme classes.
- PLAN CALL 3 still waits for step 4.
- The item name in row 5 of the Tracker tab still wraps to two lines over an
  89px column. Carried from session 1. Cosmetic.

**Next:** start step 3 — `save-batch` on the server with the cache-clear line,
the drain with its backoff, the hold rules, the sync bar, the Unit marks and the
red card, the Outbox window, and the greyed Complete. **Step 3 ends at the first
of the two test rounds, and it is the gate: do not start step 5 before it
reports back.** Delete `localOnlyNote()` in the same step.

---

## Session 4 — 2026-08-08

**Step:** none. A defect fix between step 2 and step 3.
**Branch:** `0.2` at `eadf9a4`. Pushed.
**Deployed:** no. Front-end only, no `Code.js` change.
**Merged to main:** **no, on purpose.** Not a step end. It rides into step 3's
merge.
**CACHE_NAME:** unchanged at `pfc-control-0.2-step2`. **`theme.css` is a file the
phone downloads, so whoever merges this to `main` MUST bump it.** Step 3's merge
does that by itself with `-step3`. Do not merge this to `main` on its own without
a bump.

**Landed:** the press effect no longer steals its own clicks.

Miguel tested step 2 and found two dead controls: the checkbox on Admin's Create
form would not toggle when he clicked the box, only the label, and the floor
header would not open when he clicked the caret, only the label. He also disliked
the animation on both. **One bug, and it was neither of those two screens.**

`.press:active` used `transform: scale(0.95)`. A transform shrinks the box about
its own centre, so both edges pull inward the moment you press. A click only
fires when the press and the release land on the **same element** — so a release
on an edge that has just moved away goes to the container behind, and the handler
never runs. The centre never moves, which is why the label always worked.

The dead band is 2.5% of the control's width on each side. On Admin's Create form
at 1489px wide that is **37px**, and the 22px `.check-box` spans x 20 to 42 —
entirely inside it. The caret sits in the same band on the right of `.floor-head`.

**It was never limited to those two controls.** `.press` is on 15 kinds of
control, and every full-width one had the same dead edges — including
`card row press`, the item rows on the Unit screen, and `hub-card`.

**Reproduced and fixed in Chrome, against the real Create form** on a local
server. With the old rule injected back, a click on the checkbox logged
`mousedown` inside `.check`, then `mouseup` and `click` on `.phase-block`, and
`aria-checked` stayed `true`. With the fix, all three events stay on the button
and the row toggles. Retested on the right edge too. Both pass.

**The fix, in `theme.css`:**

- New token `--press-tint: rgba(255,255,255,0.07)`.
- `.press` is now paint only — `box-shadow: inset 0 0 0 999px var(--press-tint)`.
  A large inset spread floods the padding box, so one rule tints a dark card and
  an orange button alike, sits under the text, follows the border radius, and
  **changes no geometry**. On instantly, out over 160ms; a press that fades *in*
  reads as lag.
- `.check` gains `border-radius: 10px`, so the flash is not a hard-edged band.
  The row draws no background of its own, so the radius does nothing else.
- A comment on `.press` states the rule as a hit-target rule, not a taste one,
  and names what scale(0.95) broke.

**Miguel chose the background flash** over dim-only, scale-on-small-controls-only,
and no feedback at all.

**Not landed:** nothing new. `reference/PFC_Master_Template.xlsx` still not
updated, per sessions 1 to 3. Everything from step 3 onward.

**Open:**

- **Nothing may move a control on `:active` again.** Any new press state must be
  paint. This binds the Outbox and Logger windows, which do not exist yet and
  will inherit `theme.css`.
- **`.caret` has a dead transition.** `theme.css` has
  `transition: transform 150ms` on it, but `toggleFloor` calls `render()`, which
  replaces the element, so a fresh node draws already rotated and the transition
  never plays. Harmless. Step 6 sweeps the theme classes — drop it there.
- Everything still open from session 3: the `ZZ 0.2 Step 2 Test` Sheet to trash,
  the greyed Complete not reachable until step 4, the chip bar looking long on a
  desktop window, `.details-btn` / `.details-edit` unused, the Tracker row 5
  wrap, and PLAN CALL 3 at step 4.

**Next:** unchanged — start step 3.

## Session 5 — 2026-08-08

**Miguel's step 2 test notes**, at `Miguel's Notes/0.2-Step 2 Testing.md`. Four
items. Three needed no code. One did.

**Item 3, the only bug: new project Sheets landed in `My Drive/Projects/`.**
`PFC_ROOT_FOLDER_ID` in `control/appscript/Code.js` was `''`, which means the top
of My Drive, and `PROJECTS_FOLDER_NAME` was `Projects`. So `getProjectsFolder`
built a folder at the top level, beside PFC rather than inside it.

Fixed. The root is now pinned to the `PFC` folder by ID,
`1fw8Wl7EEWIdHpr0QtD0vr6OBJDK86e2N`, and the folder name is **`Project Sheets`**,
so it reads apart from the camera app's `PFC/Project Logs/` at a glance.

**Pinned by ID, not looked up by name, on purpose.** A name lookup from the top of
My Drive would silently build a second `PFC` folder the day this one is renamed or
moved, and every project made after that would disappear from the app with no
error. An ID survives a rename and a move.

`CLAUDE.md` said `PFC/Projects/` and was wrong on both halves. Corrected, with the
folder ID recorded beside it.

**Miguel chose to start clean** rather than move the test projects across. The old
`My Drive/Projects/` folder and its contents are his to delete.

**Item 4, the missing flag on the Unit screen: not a bug.** Flag chips are step 4.
`unit.html:256` already says so, and the build plan agrees. Building and floor
views carry chips today only because the rollup needs the counts to compute.

**Item 1, the dead tap zone: already fixed in session 4** and already on
`origin/0.2`. Miguel's note says it is unpushed. It is not.

**Item 2, the animation: half of it is still open, and Miguel's worry was
unfounded.** There is no "text fade". `.press:active` is a 7% white inset wash
that appears instantly and fades out over 160ms, painted under the text, moving
nothing. That is what he asked for.

The half that is genuinely not done: **`.floor-body` has no expand transition.**
The unit grid still pops in. He wants it to "merge out like a smooth dropdown".
Deferred to the step 3 UI push by his choice, so there is one redeploy.

**A trap for whoever builds that animation.** It is the same one already logged
against `.caret` in session 4: `toggleFloor` calls `render()`, which replaces the
element, so a fresh node draws in its final state and no CSS transition ever
plays. A `max-height` or `grid-template-rows` transition on `.floor-body` will do
nothing at all unless the open state stops going through a full re-render. Budget
for that, do not budget for a two-line CSS change.

**Redeployed twice, same session.** `clasp push`, then `clasp deploy` against the
**existing** deployment id `AKfycbzo9lC…4vj8_YCrtnGjv5e` — version 5 for the
folder fix, version 6 for the move under `Control/`. Never `clasp deploy` with no
id here: that mints a new deployment with a new URL, and `API_URL` in
`control/shared/common.js` names this one.

`clasp deployments` printed the **old** `@4` line for minutes after the version 5
deploy, which looked like a failed deploy and is not one — it caught up to `@6`
later on its own. It lags. Verify a deploy against the live URL, never against
that list.

Verified live both times: `list-projects` answered `{"success":true,"projects":[]}`,
and Drive showed the target folder created at the moment of the call. Only the new
code creates that folder, so the new version is serving.

### The Drive layout, settled the same evening

Miguel moved the Apps Script project into `PFC/Apps Scripts/` by hand and asked
whether it broke a path. It did not, and the general rule is now in `CLAUDE.md`:
**Drive tracks a file by ID, never by path.** Both scripts pin their root by ID,
and clasp finds a script project by `scriptId`. Dragging any of it is safe.

**One exception, and it is the only one in either codebase.**
`PROJECTS_FOLDER_NAME` is found by NAME inside whatever `PFC_ROOT_FOLDER_ID`
points at. Drag `Project Sheets` out of `Control` on its own and the lookup
silently creates a new empty folder — every project disappears from the app with
no error. The comment on that constant now says so.

He then asked for `PFC/Control/` so the camera app, PFC Control and his own files
each get a branch. Done: `PFC_ROOT_FOLDER_ID` is now the `Control` folder,
`1SwrhzsObgZpaLsjJtP5ErsEZtt53ton9`. Free to do because `Project Sheets` was
still empty — with projects in it, they would have had to move first.

**`Project Logs` stays at `PFC/` level.** Offered `PFC/Camera/` and `PFC/Log/` for
symmetry; Miguel chose to leave it. The separation reads clearly already, and the
camera app may be scrapped or rebuilt anyway.

**Not landed:** nothing new. `reference/PFC_Master_Template.xlsx` still not
updated, per sessions 1 to 4. Everything from step 3 onward.

**Open:**

- **The `.floor-body` expand animation**, with the re-render trap above. Step 3.
- **Drive tidying: Miguel did all of it the same evening.** `Master Template` and
  `Apps Scripts` are in `Control/`, the orphaned empty `PFC/Project Sheets` is
  gone, and `PFC - Highland View Tracker` moved to `Personal/`. Verified against
  Drive, and `clasp deployments` plus a live `list-projects` both still answer, so
  moving the script project did not disturb anything. The layout is drawn in
  `CLAUDE.md`. **Still there: `My Drive/Projects/`
  (`14dnEMxAXBdeIXOTlrWcLrHmhhavMvyje`) with the old test projects.**
- Everything still open from session 4: nothing may move a control on `:active`
  again, the dead `.caret` transition for the step 6 sweep, the
  `ZZ 0.2 Step 2 Test` Sheet to trash, the greyed Complete not reachable until
  step 4, the chip bar looking long on a desktop window, `.details-btn` /
  `.details-edit` unused, the Tracker row 5 wrap, and PLAN CALL 3 at step 4.

**Next:** unchanged — start step 3.

---

## Session 6 — 2026-08-08 into 2026-08-09

**Step:** 3, code complete on every item of the list. **Not smoke checked in a
browser** — see Not landed. Step 3 is NOT done yet.
**Branch:** `0.2` at `bb549e0`.
**Deployed:** yes — script version 8, description `0.2 step 3 fix 1`. Same
deployment id, same URL.
**Merged to main:** yes, `b0090bf`. Both branches pushed.
**CACHE_NAME:** raised to `pfc-control-0.2-step3`. Every front-end file
changed and there is a new one, so a phone must re-download the shell.

**Landed:** everything on the step 3 list.

- **`save-batch` on the server.** One call takes the whole outbox, of both
  job kinds, takes the script lock **once**, and answers **one result per
  job**. Every failed result carries `retry:true` or `retry:false`. Jobs are
  grouped by building so each Sheet opens once. It ends with the
  `list-projects` cache clear.
- **One cell at a time, on purpose.** Reading a unit's whole row and writing
  it back would be fewer calls, and it would also write back every other item
  in that row — undoing anything a person changed in the Sheet between the
  read and the write. The comment on `writeItemJob` says so. **One date stamp
  per unit that changed**, not one per item.
- **The record path is built too**, though nothing calls it until Logger lands
  in step 4. Id found, overwrite that row. Id new, append. That is what makes
  a retry after a timeout land on the same row instead of making a twin, and
  it was tested live.
- **The drain**, in `common.js`. Backoff `0, 5s, 15s, 1m, then every 5m`. The
  timer runs only while jobs wait and stops dead when the shelf empties. It
  also wakes on app open, on pull down, on `online`, and on
  `visibilitychange` — iOS wakes a backgrounded web app without firing
  `online`.
- **PLAN CALL 1 built.** `apiCall` gained one option, `noFallback`, so the
  drain takes the JSONP fallback over itself instead of letting the whole
  payload go into one address. Five jobs per slice, the address **measured**
  before each slice, halved until it fits under 6,000 characters. A single
  job that still will not fit is held with `retry:false` and its own reason,
  and it sends normally the next time a POST works.
- **The hold rules.** `retry:false` holds at once. Ten burned tries hold.
  **A job never leaves the shelf except on `ok:true` or on Miguel tapping
  Drop.**
- **The sync bar**, on Buildings, Building and Unit. Three states, and the
  count lives there and nowhere else. `Outbox ›` on the right edge.
- **The Unit marks.** A turning ring on the item, and the same ring one size
  down on the phase header and the unit pill. A held edit greys the item
  name, turns the ring into a still red dot, and opens the red card: why, what
  was lost (`You tapped Complete. The Sheet still says Not Started.`), and
  **Try again** / **Drop the edit**.
- **The greyed Complete.** It stays in the dropdown, dimmed to 45%, not
  tappable while an open flag sits on the item, with the line
  `Fix the open flag first. Then Complete comes back.` under the panel.
- **`control/tracker/outbox.html`**, a new window. Held rows first, each
  naming the building, the unit and the item, with Retry and Drop. Waiting
  rows below with no buttons. Added to `sw.js` SHELL. **PLAN CALL 2 held: a
  row does not tap through to its unit.**
- **`localOnlyNote()` deleted**, per plan 5.1.
- **The floor drawer animates**, which is Miguel's item from session 5.

**Four calls made during the build:**

1. **`apiCall` gained an option.** Plan 5.1 says it survives as written. It
   does, for every existing caller — `noFallback` is additive and only the
   drain passes it. Without it PLAN CALL 1 cannot be built at all: the
   function's own fallback fires first and puts every queued job into one web
   address, which is the exact silent failure the plan call exists to stop.
2. **Offline and timeout do not burn a try.** The plan says an *unnamed* error
   holds after ten tries. The rule in the code is: **a try is burned when the
   phone reached the server and the job still did not land.** Offline burns
   nothing — nothing was attempted — so a phone in a dead zone all afternoon
   never holds a single edit. A timeout burns nothing either: the write may
   have landed and the job is idempotent. A busy server does burn one, because
   the phone did reach it. `classifyCallFailure` carries the comment.
3. **The sync bar has a fourth wording.** Plan 5.5 gives `Offline · 3 edits
   wait` for the waiting state. Online but between retries is a real state and
   `Offline` there would be a lie, so it reads `3 edits wait` with the same
   grey slab. One word dropped, no new state.
4. **The floor drawer needed `toggleFloor` to stop redrawing.** Session 5
   predicted this and it was right. Every floor's chips are now always in the
   page, the drawer grows its grid row from `0fr` to `1fr`, and the header's
   marks come off by a CSS rule instead of by being left out of the HTML.
   `toggleFloor` moves a class and draws nothing. The dead `.caret` transition
   from session 4 works now for the same reason.

**Tested:** by me, not by Miguel. Two rounds, no browser.

- **A node dry run, 42 assertions, all pass.** The shelf and one-key-one-job;
  oldest first; `ok:true` leaves and everything else stays; `retry:false`
  holding on the first failure; nine tries waiting and the tenth holding;
  **forty offline attempts burning nothing**; every branch of
  `classifyCallFailure`; a retap while the call is in the air keeping its own
  value and not inheriting the failure; a held edit not painting and a waiting
  one painting; the eleventh building dropping one and the one with an unsent
  edit surviving; the JSONP slice measurement in both directions; and all four
  sync bar states including both together.
  Kept at `scratchpad/drain-test.js` — it is not in the repo.
- **Against the live web app**, on a fresh project `ZZ 0.2 Step 3 Test`: a
  seven-job batch holding three good item jobs, a dead unit, a dead item, a
  bad Sheet id and a record. Three wrote. The dead unit and the dead item both
  came back **hold**. The bad Sheet id came back **retry**. The record wrote.
  Then verified from `get-project`: the three statuses landed, **unit 102 was
  untouched**, Last Updated was stamped on exactly the two units that changed,
  and re-sending the same record id **updated the row instead of making a
  twin** (quantity 1 became 2, still one record). `list-projects` answered
  `deficiencies:1` immediately, so the cache clear ran.

**One real defect found and fixed live: a record's date shifted a day back.**

`new Date('2026-08-08')` reads a date-only string as **UTC midnight**. The
script runs on Atlantic time, so the cell stored 2026-08-07 9:00 PM and
printed **2026-08-07**. A record logged this morning would be dated yesterday,
in the tab a supplier claim gets built from. `dayValue()` parses `yyyy-mm-dd`
into local midnight instead. Fixed, redeployed as version 8, retested: the
same record now reads `created: 2026-08-08`.

**Not landed:**

- **No browser smoke check. This is the one thing step 3 still needs before it
  counts as done.** The session ran out of budget after the live server round.
  Nothing has drawn the sync bar, the ring, the red card, the greyed Complete,
  the Outbox window or the floor animation on a real screen. Every one of them
  parses and every rule under them is asserted, but **none of them has been
  looked at**. Do that first next session, before the test round proper.
- **`reference/PFC_Master_Template.xlsx` is still not updated**, and neither is
  the live copy in Drive (`1QIF5TCJ0iekpNGHEjce1PSoFXRFhucmF-ednTSYHT-M`).
  Plan 1.7. Unchanged since session 1. No code reads it.
- Everything from step 4 onward.

**Open:**

- **Two test Sheets for Miguel to trash, both named `ZZ 0.2 Step 3 Test`.**
  `1-Fa_75qo-Eh4AyHsNerjdWluUgAN2m5pbNxxVFqp148` holds the test data.
  `12w2aZm-r1Z-AA3hN73kGCJwJRKUijbs6O1lv8t5utRg` is an empty twin — a create
  call went through twice while I was working out how to drive the backend
  from the command line.
- **A POST to the `/exec` address over a redirect drops the body.** `curl -L`
  answers `411 Length Required`, because the redirect re-sends without the
  length header. Use the GET path with a `payload` parameter to drive the
  backend from a shell. Not a defect — the app POSTs from a browser, where
  this does not happen.
- **The `.floor-body` grid-row animation needs iOS Safari 16.** `0fr` to `1fr`
  on `grid-template-rows` is the only way to animate to a height nobody
  measured. Safari 16 shipped in 2022. Worth one look on his phone; if it does
  not animate there it simply snaps, which is what it did before.
- Everything still open from session 5: nothing may move a control on
  `:active`, the `ZZ 0.2 Step 2 Test` Sheet to trash, `My Drive/Projects/`
  (`14dnEMxAXBdeIXOTlrWcLrHmhhavMvyje`) with the old test projects, the chip
  bar looking long on a desktop window, `.details-btn` / `.details-edit`
  unused, the Tracker row 5 wrap, and PLAN CALL 3 at step 4.
- The greyed Complete still cannot be reached by tapping alone: no screen
  creates a record until Logger lands in step 4. To see it, add an `Open` row
  to the Deficiencies tab by hand.

**Next:** smoke check step 3 in Chrome — the sync bar in all three states, a
tap that lands, a tap that holds and its red card, the Outbox window's Retry
and Drop, the greyed Complete with a hand-written record, and the floor
animation. **Then run the full step 3 test round from plan section 6. It is
the first of the two rounds and it is the gate: do not start step 5 before it
reports back.** It includes the 40-job JSONP slicing test of PLAN CALL 1.
