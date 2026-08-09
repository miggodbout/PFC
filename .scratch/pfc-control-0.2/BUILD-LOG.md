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

### Session 6 addendum — the offline path, hardened

Miguel asked for offline to be bullet proof. **The retry rules were already
the safe direction.** Offline burning no tries means a phone in a dead zone
never holds an edit, and holding only moves a job into the Outbox — it never
deletes one. There was nothing to loosen there.

**The real hole was underneath them, and it could lose work silently.**

`putJob` set its in-memory copy of the shelf **before** writing to
`localStorage`, and nothing checked whether the write succeeded. On a full
phone, or in Safari private mode, the screen painted the tapped value, the
person walked away, and the edit was gone at the next app open with nothing
to show it had ever existed. **A retry cannot help an edit that was never
written down.** Ten building copies are about a megabyte and they are what
fills the phone, so this was reachable in normal use.

Three changes:

- **The outbox outranks every building copy.** When storage refuses the
  shelf, `Store.writeJobs` deletes copies to make room and tries again, least
  recently opened first, and **never one belonging to a building that is
  itself holding an unsent edit**. A copy is only a copy — the Sheet has it
  and opening the building once brings it back. An unsent edit exists nowhere
  else.
- **A refused job is not kept in memory.** The shelf goes back exactly the
  way it was, so nothing paints a value the phone did not store.
- **`putJob` answers false and the Unit screen says so**, with a red banner:
  `Not stored. This phone has no room to save the change. Free space on the
  phone, then set the value again.` This is the only failure in the app that
  no queue catches, so it is said at once, while the person still remembers
  what they tapped.

**Tested:** 12 new assertions under node, all pass, at
`scratchpad/storage-test.js`. A copy dropped to make room; the oldest one
chosen; a building holding an unsent edit spared while another is dropped
instead; nothing left to drop answering false; the refused job absent from
memory and painting nothing; and a refused **retap** leaving the value that
was stored alone. The 42 drain assertions still pass.

**Deployed:** no. Front end only, no `Code.js` change, so the script version
stays at 8. **Merged to main** at `a674e39`. `CACHE_NAME` is already
`pfc-control-0.2-step3` from this session's earlier merge, so the phone picks
this up with it.

---

## Session 7 — 2026-08-09

**Step:** 3, test round run. **Step 3 is done.**
**Branch:** `0.2` at `99a3352`.
**Deployed:** no clasp deploy. No `Code.js` change this session, so the script
stays at version 8.
**Merged to main:** yes, three times — `942be37`, the retap fix, then the
screen re-read. Both branches pushed.
**CACHE_NAME:** raised to `pfc-control-0.2-step3-fix2`. Front-end files changed
twice, so it was bumped twice: `-step3-fix1`, then `-step3-fix2`.

**Landed:** the full step 3 test round from plan section 6, plus the browser
smoke check session 6 never got to. Everything on the step 3 list has now been
looked at on a real screen. **Three real defects were found, all three fixed,
redeployed and retested end to end.**

### Defect 1 — a save that worked read as a save that failed

**The worst kind of defect this app can have, and it was on every tap.**

Tap Complete with signal. The ring turns, the bar says `Saving 1 edit…`, the
server takes it, and the row **snaps back to Not Started**. Confirmed against
the live backend: the Sheet held `complete` and the phone showed `not_started`
until a refetch. On site that reads as a lost edit, and the crew taps it again.

The screen paints a waiting edit out of the OUTBOX, not out of the building
copy — that is `paintedStatus`, and it is what stops a fresh fetch from
overwriting an unsent edit. The job leaves the outbox the moment the server
answers `ok:true`. Nothing ever wrote the value into the copy, and nothing
refetched after a drain. So the paint vanished and the copy underneath still
held the old value.

**It took two fixes, and the first one alone was not enough.**

1. `Store.foldLanded` writes every landed value into its building copy, and
   `applyOutcome` calls it grouped by building, so one copy is read and written
   once however many items landed on it. `fetchedAt` is deliberately not moved
   — it records when the server last spoke, and a fold is not a fetch.
2. **The open screen still showed the old value after that**, because
   `unit.html` and `building.html` hold their own copy object from when the
   screen opened. The drain writes to storage; the screen redrew from the
   object it already had. Both now re-read the copy on an outbox change.
   `tracker/index.html` is left alone — its rows come from the `list-projects`
   numbers, which no single edit touches.

### Defect 2 — a retap during a successful call was thrown away

Found by reading the success path after fixing defect 1. Not on any test list.

`settleJob` has always guarded the failure path: if the job under this key is
not the one that was sent, somebody has set a new value since, and it must not
inherit the old call's outcome. **The success path had no such guard** — it
removed by key alone.

So: tap Complete by mistake, correct it to In Progress while the first call is
still in the air, and the correction is deleted the instant the first call
answers ok. Silently, with the Sheet keeping the value the person had just
fixed. Over the JSONP path a call takes two to three seconds, so the window is
wide open.

The `ok` branch now checks `at` the same way `settleJob` does. The landed value
still goes into the copy — that is genuinely what the Sheet holds — and the
newer job stays on the shelf, paints over it, and goes out on the next drain.

### Defect 3 — a closed floor showed a 14px strip of its unit chips

Visible on every building screen, on both floors.

**`overflow: hidden` clips at the padding box, not the content box.** The `0fr`
row track collapsed `.floor-body`'s CONTENT to nothing, but its own
`2px 12px 14px` padding survived, and the chips drew straight through the 14px
of it. Measured: the drawer was 16px tall when closed, with 14px of chip
visible.

The padding now comes off while the floor is closed and grows back with the
row, on the same 220ms. Verified by sampling mid-animation: the drawer grows
4 to 68px while the padding grows 3 to 14px in step, and the chips stay clipped
the whole way.

**What each test showed:**

| # | Test (plan section 6, step 3) | Result |
|---|---|---|
| 1 | Tap a status with signal. Watch the ring and the bar go | **failed — defect 1**, fixed, retested |
| 2 | Four taps in airplane mode, close the app, open it, drain | pass — all four survived a reload and landed, spanning two units |
| 3 | Force `retry:false`. The item snaps back, greys, red card | pass |
| 4 | That job is in the Outbox with Retry and Drop | pass — both work |
| 5 | A held edit is not counted in any rollup | pass — unit pill, phase and floor all ignored it |
| 6 | PLAN CALL 1 — the JSONP slicing rule with 40 queued jobs | pass — 8 slices of 5, longest address 3,294 chars, **all 40 landed** |

**Six more checks, none of them on the list:**

- **The halving branch and the oversized job.** Padded jobs forced the slice
  from 5 down to 1, each measured and sent under the 6,000 cap. A single job
  over the cap held at once with `retry: false` and the plan's exact reason,
  `This edit is too large to send on this network.` It was never dropped, and
  the four padded jobs all got per-job results — nothing was silently lost.
- **The greyed Complete.** Dimmed to 0.45, `aria-disabled`, its onclick is
  `stopPropagation` and nothing else, with the plan's line under the panel.
- **All four sync bar wordings**, including session 6's fourth one. `Saving 3
  edits…` accent, `Offline · 3 edits wait` grey, `3 edits wait` online between
  retries, `2 edits did not save` red, `Saving 3 edits… · 2 failed` for both,
  and `1 edit` singular.
- **The storage-refused banner** of the session 6 addendum, which had also
  never been drawn. With every write refused it reads `Not stored. This phone
  has no room to save the change…`, the shelf stays empty, and **the row does
  not paint the tapped value**.
- **The floor header marks rule.** A closed header carries its third line; an
  open one drops it by CSS. The corner badge hangs outside the chip's top right
  corner, in red, and never shares a shape with a Deficiency flag.
- **The rollups against real data**, on both test buildings. A unit whose
  `interior_doors` is `complete` with an open Deficiency draws no bar and does
  not count as done — the downgrade in `displayStatus` reaching the floor count.

**Tested:** by me, in Chrome against the live Pages build and the live backend,
on both ZZ test projects. 79 node assertions all pass: the 42 drain and 12
storage suites from session 6, unchanged, plus **25 new ones in
`fold-test.js`** covering the fold, `fetchedAt` staying put, a failure folding
nothing, one write for many items, jobs spanning buildings, no copy on the
phone, a unit key the copy has never seen, a record job not corrupting the
status grid, and the retap surviving a successful call. `fold-test.js` is in
the scratchpad, not in the repo.

**One test could not be run as written.** The plan says to force `retry:false`
by removing an item in Admin. Driving a structure change through Admin was
blocked in this session, so the same server-side `retry:false` was produced by
putting the phone's copy one item ahead of the server — which is exactly the
state an Admin removal leaves behind until the next refresh. The failure came
back from the real server with the real classification. **Admin's own
remove-item path was not exercised. Step 5 owns Admin and should cover it.**

**Not landed:**

- **`reference/PFC_Master_Template.xlsx` is still not updated**, and neither is
  the live copy in Drive (`1QIF5TCJ0iekpNGHEjce1PSoFXRFhucmF-ednTSYHT-M`). Plan
  1.7. Unchanged since session 1. No code reads it.
- Everything from step 4 onward.

**Open:**

- **A landed RECORD is not folded into the copy.** The same defect as 1, on the
  other job kind. Nothing creates a record until Logger ships, so it is not
  written yet — there is a BUILD NOTE on `Store.foldLanded` naming it. **Step 4
  must fold a landed record into `copy.records` by `record_id`**, or a saved
  record will vanish off the screen until the next fetch.
- **The two ZZ test Sheets are full of test data now.** Both hold 18 items set
  to `in_progress` across all six units, and `ZZ 0.2 Step 3 Test`
  (`1-Fa_75qo-Eh4AyHsNerjdWluUgAN2m5pbNxxVFqp148`) holds four junk records on
  unit 201 named `JSONP slice test 0-3`, beside session 6's real one on unit
  101. Both Sheets were already on the trash list. Nothing was written to any
  Sheet that is not a ZZ test project.
- **Three cosmetic things, none worth a release on its own:**
  - An offline job stores the long error `This phone has no connection. The app
    opened from its saved copy…`, and an Outbox **waiting** row prints it. The
    second half of that sentence is about opening a screen, not about a queued
    edit.
  - When the item is gone from the copy, the Outbox row and the red card print
    the item KEY, not its label. After a real Admin removal it would read
    `cut`, not `Cut`.
  - The greyed Complete still carries `.press`, so it flashes when pressed even
    though it does nothing.
- Everything still open from session 6: the chip bar and the fix-card buttons
  look long on a desktop window, `.details-btn` / `.details-edit` unused, the
  Tracker row 5 wrap, `My Drive/Projects/`
  (`14dnEMxAXBdeIXOTlrWcLrHmhhavMvyje`) with the old test projects, the
  `ZZ 0.2 Step 2 Test` Sheet to trash, nothing may move a control on `:active`,
  and the `.floor-body` animation wanting one look on iOS Safari 16.
- PLAN CALL 3 still waits for step 4.

**Next:** **the gate is passed — start step 4.** Records in the `get-project`
payload, the Logger window, the flag chips, the record list and the green card.
Fold a landed record into the copy while you are in there. **PLAN CALL 3 needs
one line from Miguel on his phone before Save is pinned to the bottom of the
Logger form.**

---

## Session 8 — 2026-08-09

**Step:** 4, not started. This session answered a plan call and nothing else.
**Branch:** `0.2`.
**Deployed:** no. **Merged to main:** no code changed. **CACHE_NAME:** untouched.

**PLAN CALL 3 is answered. Save is pinned to the bottom of the Logger form.**

Miguel was shown the two options side by side on his phone: the pinned Save bar
with the form left one control per row, against Save in the scroll flow with
Subtype and Count sharing a row and the place bar collapsed. **He chose the
pinned bar.** He did not take the compressed form, so section 5.7's field order
stands as written, one control per row.

Two things came out of it that the plan did not say:

- **The fallback is dead, not deferred.** Compressing the form was the answer to
  a question that has now been answered another way. Do not reach for it later
  as a tidy-up. If the screen runs short of height, the pinned bar is what pays.
- **The bar has to survive the iOS keyboard.** `position: fixed` on iOS Safari
  does not track the software keyboard, so a naive bar lands under it or floats
  mid-screen. Size it off `window.visualViewport`. This is written into 5.7 and
  it wants one look on a phone with the Needed box focused.

Both are marked in 5.7, and section 12's table row 3 now reads ANSWERED.

**Also confirmed for Miguel:** Logger is not on his phone and that is correct.
There is no `control/logger/`, and `CARDS` in `control/index.html` still holds
the five 0.1 cards. The greyed `Deficiencies` card is the 0.1 placeholder, not
Logger. The `Log` card arrives with step 4, per 5.8.

**Not landed:** everything from step 4 onward. `reference/PFC_Master_Template.xlsx`
is still not updated, plan 1.7, unchanged since session 1.

**Open:** everything session 7 left open, unchanged — the unfolded landed RECORD
that step 4 must fix, the two ZZ test Sheets to trash, the three cosmetic things,
and session 6's list. **PLAN CALL 3 is off that list.** No plan call is open now.

**Next:** step 4, with nothing waiting on Miguel. Records in the `get-project`
payload, the Logger window with its pinned Save bar, the flag chips, the record
list and the green card. Fold a landed record into `copy.records` by `record_id`
while you are in there.

---

## Session 9 — 2026-08-09

**Step:** 4, not started. **No app code changed this session.**
**Branch:** `0.2` at `42b9be9`.
**Deployed:** no. **Merged to main:** no. **CACHE_NAME:** untouched.

**Landed: the 0.2 step 3 test round from Miguel's side**, in
`notes/0.2-step-3-testing.md` — fifteen findings from his desktop and his phone.
`notes/` is gitignored, so that file is on his machine only. Everything below is
the durable half.

**Four findings were not what they looked like**, and the code says so:

- **The smooshed unit spinner.** `.ring` in `theme.css:579` sets width and height
  but never sets `display`. Everywhere else its parent is a flex row, which
  blockifies it. `#unit-pill` is a plain `div`, so there it is a raw inline span
  and collapses onto the text baseline. Miguel's own fix — drop the unit-level
  spinner — deletes the element, so this needs no CSS repair.
- **The missing progress bars are all present in the code.** `barHtml` runs on the
  Tracking row, the floor header and the unit chip. They draw nothing because
  above the Unit screen `done` counts whole **units** complete (`common.js:139`),
  and `barHtml` returns `''` when `done` is 0. **A floor of twelve half-built
  units reads `12 units · 0 done` and draws no bar — the same lie worst-wins
  told.**
- **The `!` marker works as written.** It fires on `held`, a server refusal, never
  on `waiting`. `index.html:180` states it in a comment. Miguel's model is that
  unsaved includes queued, which is not what got built.
- **The Offline/Last-updated line is not on a timer.** It is an argument to
  `render()`, so the next redraw paints over it. The outbox ticks on a 5s backoff,
  which is the "five seconds" he saw.

**Decided this session — PLAN CALL 3, and eleven vocabulary calls.**

`docs/crew-words.md` and `docs/code-words.md` are new, built from the app's real
strings rather than from memory. CLAUDE.md points at both. **`crew-words.md` is
now the authority on any word a crew member reads**, and plan amendment A3 says
so. The two that are not wording and do change what gets built:

- **One project is exactly one building, always.** Nothing nests. This closes the
  door on a level above Building for 0.2 and 0.3.
- **Three developer error strings get crew wording plus a code**, E1 to E3, with
  the technical half written to the browser console.

**Not landed:** every one of the fifteen findings. Nothing was fixed in code.

**Open:** everything session 7 left open, minus PLAN CALL 3, which is closed. The
two ZZ Sheets are still to trash. `reference/PFC_Master_Template.xlsx` is still
not updated, plan 1.7, unchanged since session 1.

**Confirmed by Miguel:** there is no real building yet, only ZZ tests. So
`Exterior Door(s)` → `Exterior Doors` is a clean change — the derived key moves
from `exterior_door_s` to `exterior_doors` with no data to migrate. **Do it before
a real building exists.**

**Next:** `.scratch/pfc-control-0.2/HANDOFF.md` holds the work order.

---

## Session 10 — 2026-08-09

**Step:** 3 fix round, block 2 of 5 (Marks and spinners). **The code is
written and committed, but this entry is not reaching you the normal way —
read the warning below before anything else.**

Block 1 (words and renames) landed earlier tonight in `e4eaf62`, before this
session started — confirmed by reading that commit, since no BUILD-LOG entry
covers it.

**⚠ NOTHING IN THIS SESSION REACHED GITHUB. THIS FILE, AS YOU ARE READING IT
ON `origin/0.2`, DOES NOT YET HAVE THIS ENTRY IN IT.**

This session ran in a cloud container with no push access. `git push` failed
with `403` from the git proxy, and both GitHub write paths the MCP server
offers — `push_files` (git trees/blobs) and `create_or_update_file`
(Contents API) — failed the same way: `403 Resource not accessible by
integration`. Read access worked the whole time (fetch, pull, and
`get_file_contents` all succeeded); only writes were refused. That is a
GitHub App permission gap for this session's installation, not something
retriable from in here — session instructions are explicit that a 403 like
this gets reported, not worked around. **If you are reading this file with
this entry in it, someone with push access (you, or a session running with
your own git credentials, the way block 1 did) copied it in by hand — check
the note at the bottom of this entry for exactly what that means for what to
do next.**

**Branch:** `0.2`, in this container only — commits `9e4745d` (the code) and
`5345fa8` (one follow-up comment fix), both on top of `e4eaf62`. **Not on
`origin/0.2`.**
**Deployed:** no clasp deploy — this block touches no `Code.js` anyway.
**Merged to main:** no — nothing to merge until `0.2` itself has this on it.
**CACHE_NAME:** raised to `pfc-control-0.2-step3-fix4` **in this container's
copy of `control/sw.js` only.** The version on GitHub still reads
`pfc-control-0.2-step3-fix3` as of this session.

**Landed, both bullets of HANDOFF.md block 2:**

- **The phase-level and unit-level spinner rings are gone.** `unit.html`
  no longer draws `.ring`/`.ring--sm` beside the unit pill or a phase header —
  those two calls into `waitingIn()` are deleted, and `waitingIn()` itself is
  deleted since nothing else called it. This is the `#unit-pill` fix session 9
  diagnosed: `.ring` never set `display`, and `#unit-pill` is a plain `div`
  rather than a flex row, so the ring collapsed onto the text baseline. Deleting
  the element needed no CSS repair, exactly as the session 9 note said. The
  per-item ring (beside each item's own status control) and the sync bar's ring
  are untouched — those are the two HANDOFF said to keep. `.ring--sm` in
  `theme.css` is deleted too, since removing both draws left it with no caller.
- **A queued edit now gets its own mark**, wherever a held (refused) edit
  already got the red `!` badge: the Tracking row, a closed floor header, and a
  unit chip. New `queuedChipHtml()` in `common.js` draws a blue corner badge
  (`#6C9CFF`, matching the existing Waiting-flag blue) holding a small
  signal-bars-with-a-slash glyph (`ICON.offline`), never red and never a plain
  dot, so it cannot be mistaken for the not-saved badge. On a unit chip it
  hangs off the top-left corner while not-saved keeps the top-right, so a chip
  with one edit held and another still queued can show both marks at once
  without them overlapping. `marksHtml()` and `marksLabel()` both take a new
  `queued` argument alongside the existing `notSaved` one; every call site
  (`tracker/index.html`, both spots in `tracker/building.html`) was updated to
  pass `jobs.waiting` / a new `queuedEditsFor()` / `queuedEditsIn()` pair that
  mirrors the existing `heldEditsFor()` / `heldEditsIn()` but counts `!job.held`
  instead of `job.held`. The stale comment in `building.html` claiming "only a
  HELD edit marks anything above the Unit screen" is rewritten to say what the
  code now does.

**Not landed:** everything from block 3 onward (progress bars, the
`Exterior Door(s)` rename, the header stack) — this firing is scoped to block 2
only, per the pacing rule. Everything still open from session 9 that block 2
was not asked to touch: `reference/PFC_Master_Template.xlsx`, the two ZZ test
Sheets, the unfolded landed RECORD (step 4's job), and session 6/7's remaining
cosmetic list.

**Tested:** not on a real screen — no browser or phone available tonight.
Reasoned through instead: every edited `.html` file's inline `<script>` block
parses (`node -e "new Function(...)"` against each), `common.js` parses on its
own (`node -c`), and `theme.css`'s brace count is balanced. Traced the two new
call paths by hand — a project with only queued jobs (`jobs.held === 0`,
`jobs.waiting > 0`) now reaches `queuedChipHtml` and draws the blue badge; a
project with only held jobs is unchanged from before, since `queuedEditsFor`
excludes anything with `job.held` true. The exact rendered look of the new
offline glyph at 8-9px, and whether the two corner badges read cleanly side by
side on a real 77px chip, has not been seen and should get one look on a phone.

**Open:** the offline-glyph shape (signal bars with a slash) and its exact blue
are a reasoned pick within the latitude HANDOFF left open ("signal bars ... or
a wifi glyph", "Miguel chose the symbol over a plain dot") — not a guess at
something HANDOFF specified, but still worth Miguel's eye on a phone before
calling the visual settled. Everything else session 9 left open is unchanged.
**Plus the push failure above — that is the bigger open item tonight.**

**Next — for a human, not for the next scheduled firing:** the GitHub App
this environment uses needs `Contents: write` (or equivalent) restored for
`miggodbout/pfc` before any session running in this kind of cloud container
can land a commit. Until that is fixed, every later firing tonight most
likely hits the identical wall doing block 3, then block 4, then block 5 —
each one probably re-diagnoses this same 403 from scratch, wasting its run,
unless this note is on `origin/0.2` before it starts. **If you are reading
this on GitHub, block 2's actual code is sitting in `.scratch` nowhere —
it only exists in that one ephemeral container, which is reclaimed after
the session ends.** The fastest recovery is likely to re-run block 2 from
`HANDOFF.md` section 2 in a session that has real push access (the way
block 1 was built), rather than trying to recover the dead container.

**Next — if a later firing tonight reads this file straight from
`origin/0.2` and does NOT see this warning:** that confirms the entry never
reached GitHub, exactly as predicted above. Do not assume block 2 is
untouched — check the open PRs / branches for a stray `0.2`-based branch
from this session first (there should not be one, since branch creation is
also a write and would have failed the same way), then just re-run block 2
following `HANDOFF.md` section 2 as if this session had not happened, and
say so plainly in your own entry.

---

## Session 11 — 2026-08-09

**Step:** 3 fix round, blocks 3, 4 and 5 of 5, in one sitting. **The fix round
is complete.** Every block in `HANDOFF.md` has landed.

**Branch:** `0.2`, commit `4b9dec3`, pushed.
**Deployed:** yes — Apps Script version 9, redeployed onto the existing
deployment id. The URL did not change.
**Merged to main:** see the open item at the bottom.
**CACHE_NAME:** raised to `pfc-control-0.2-step3-fix5`. `SHELL` needed no
change — no file was renamed this round.

### First: session 10's warning was wrong, and block 2 did ship

The session 10 entry says in capitals that nothing from it reached GitHub, and
tells the next session to re-run block 2 from scratch. **Do not.** Block 2 is on
`origin/0.2` as `e668459` and `14b7087`, and it is on `origin/main` as well
through the merge `7275731`. I checked the code, not just the log:
`queuedChipHtml` is in `common.js`, `waitingIn` and `.ring--sm` are gone.

I cannot tell from here how it got there — whether the push succeeded on a later
try, or whether Miguel moved it across by hand. The commits are authored
`Claude`, where blocks 1 and the handoff before them are authored `miggodbout`,
which suggests the container's own commits made it over intact rather than being
retyped. What matters is that the work exists and is live, so I built blocks 3 to
5 on top of it. **The session 10 entry is left exactly as written** — a log that
gets edited to look correct afterwards is worth nothing. This paragraph is the
correction.

### Block 3 — the bar fills by items, the count stays in units

The defect was one line. `barHtml` filled from `roll.done`, and above the Unit
screen `done` counts whole units finished. A floor of twelve half-built units has
none finished, so the bar drew nothing — and `barHtml` returns an empty string
when nothing is done, so it did not even draw an empty track. That is Miguel's
"Missing: Building View, Floor View" exactly. Unit chips looked right the whole
time because a unit rollup already counts items.

`rollup()` now carries a second pair, `itemsDone` and `itemsTotal`, used by the
bar alone. `groupRollup` sums that pair across its units. A caller that gives no
item numbers falls back to the unit pair, which is why the unit level needed no
change at all: there, `done` and `total` already are items.

**The Buildings row needed the backend.** The server sent unit counts only, and
the old comment there said counting items would mean reading the whole Tracker
grid for every building. That turned out to overstate it: the item status columns
are contiguous, and the Sheet is already open at that point, so `countItemCells`
is one extra `getValues()` on an open Spreadsheet. The expensive part of that
handler is `openById` on every project, and this adds none of it. **I asked
Miguel before spending the deploy and he chose to send the counts.**

It reads stored values, so an item held at In Progress by an open issue still
counts Complete there. `unitsDone` already had that property, since it reads the
Sheet's own rollup column, so this is not a new approximation — and it can only
move a hairline bar by one item's width.

`countText` changed shape with it: `12 units · 5 done` becomes `5/12 Units done`.
The done number leads because it is the one being read.

**The Unit screen got its bar**, under the pill, top right, stretched to the
pill's width. **PLAN CALL: Miguel chose to keep the pill** rather than have the
bar replace it. The reason to keep it is that a full bar beside `In Progress` is
the only thing on that screen that shows an open issue holding a finished unit
back — with the pill gone, a blocked unit and a finished one look identical.

### Block 4 — `Exterior Door(s)` became `Exterior Doors`

Three places in `common.js`, and the `slug` example comment in `Code.js` that
used it. The derived key moves from `exterior_door_s` to `exterior_doors`.
Nothing to migrate, per Miguel's confirmation that only ZZ tests exist.

### Block 5 — the header stack, and two bugs with one root cause

The stale line is no longer a banner of its own, so three stacked bars cannot
happen. It rides on the sync bar in the three shapes Miguel drew.

**The important half is not the layout.** The line used to be an argument to
`render()`, so the next redraw — a queue change, an edit landing — painted over
it. That is the whole "shows for ~5 secs and then disappears" report. It is state
now: `markStale()` when a fetch fails, `markFresh()` when one lands, held outside
the draw. A redraw cannot remove it and only a successful fetch can.

The same shape of bug caused the red `Saving` flash. `sendJobs` answers `offline`
without touching the network, so `drain()` set the sending state, painted
`Saving 3 edits…` in accent, and went back to grey inside one frame — four times
over in the trace below. `drain()` now stops before the paint when the phone is
offline. **Nothing is stranded by that:** no try is burnt, the backoff timer is
still armed, and the `online` event, returning to the app, and a pull down all
still wake it. I tested that specifically, because an early return in a send loop
is exactly the kind of fix that quietly eats a queue.

`staleNoteHtml` and the `.banner--quiet` rule are deleted, both having lost their
last caller.

### Tested

**Traced first, then driven in Chrome.** 51 checks across four Node traces:
the item fill at every level and the old-payload fallback, the count text
including singular and empty, all the sync bar shapes including held edits and
the Queue screen's own linkless variant, and the offline flash reproduced against
a rebuilt before-case and then shown gone.

**Then a real smoke check** against the live backend on a local server, which is
the part that actually earned its time:

- The Buildings row draws a bar where it drew none before. The first ZZ project
  is `unitsDone 0` but `itemsDone 1 / itemsTotal 18`, so the old code drew
  nothing and the new code draws a sliver. The second is genuinely 0 done and
  still correctly draws nothing.
- Floor 2 draws a bar and reads `0/3 Units done`. Floor 1 has no item done and
  draws no bar. Both correct.
- **The Unit screen's new corner is clean** — pill on top, bar under it at the
  pill's width, no repeat of the `#unit-pill` smoosh. This is the one thing I
  would not have trusted a trace for, since it is the same element that broke
  before.
- It filled 33%, not the 67% I set. **That is the flag downgrade working**: one
  of the two items I marked Complete carries a deficiency, so it displays In
  Progress and does not count. A free confirmation of the rollup rule.
- All three sync bar shapes rendered as drawn, and online-with-nothing-queued
  leaves the slot genuinely empty.
- No console errors anywhere, and the queue shelf was empty at the end — the
  visual checks stubbed `Queue.counts` for one paint rather than writing jobs, so
  nothing was queued and nothing was sent.

`curl` against the live web app confirms `itemsDone` and `itemsTotal` are in the
real answer.

### Open

- **The merge to `main` is not done**, and that is the one step that puts this on
  a crew phone. `main` still serves `fix4`, which is blocks 1 and 2. Held for
  Miguel deliberately rather than assumed.
- **The backend is already redeployed and `main` is not.** This is safe in this
  direction and only this direction: the new fields are additions, and the old
  front end ignores fields it does not know. A phone on `fix4` keeps working
  exactly as before until the merge.
- **The offline glyph in the sync bar is still the grey slab.** Miguel's point 8
  named that grey box specifically and asked for signal bars with a slash. Block
  2 gave the glyph to chips; the bar kept the slab, and `HANDOFF.md` block 5
  draws the slab in its own sketch. **I left it rather than widen the block
  quietly.** It is a one-line change if he wants it — `ICON.offline` already
  exists.
- Everything session 9 and 10 left open that this round was not asked to touch:
  `reference/PFC_Master_Template.xlsx`, the two ZZ test Sheets that step 4 wants
  replaced with unsaturated data, and the unfolded landed RECORD.
- Not this round, per `HANDOFF.md`: the greyed Complete (point 1, needs a flag to
  look at, belongs to step 4, and it overrules a settled decision in `CLAUDE.md`
  and ticket `05` that must be updated when built), and points 14 and 15 on the
  setup screen, which step 5 owns.

**Next:** merge to `main` when Miguel says so, then the step 3 test round — the
gate. Step 4 does not start before that round reports back.

---

## Session 12 — 2026-08-09

**Step:** the step 3 **test round** — the gate before step 4. No code was
changed. This entry is the reply to Miguel's fifteen findings.

**Branch:** `0.2` at `b6ec578`. **Merged to main:** yes, already — `7275731`
carries blocks 3 to 5 onto `main`, so session 11's "the merge is not done" is
now closed.
**Deployed:** nothing new. Backend still Apps Script version 9.
**CACHE_NAME:** unchanged at `pfc-control-0.2-step3-fix5`.

### First: I was on the right build

Unregistered the Service Worker and deleted every cache before starting, then
reloaded from the network. `https://miggodbout.github.io/PFC/control/sw.js`
serves `pfc-control-0.2-step3-fix5`, and the browser re-cached that same name.
`origin/main` holds it too. Nothing below was read off `fix4`.

Driven in Chrome at desktop width against the live backend and the first ZZ
Sheet (`1-Fa_75qo…`). I set real items Complete to make the bars show, which
that Sheet was cleared for.

### The fifteen points

**1 — greyed Complete. Confirmed as planned, wording only.** Interior Doors on
unit 101 carries an open deficiency. Its dropdown draws `Complete` dimmed, it
does not respond to a tap, and one line sits under the panel reading
`Fix the open issue first. Then Complete comes back.` `flag` is gone. The
redesign Miguel asked for — normal colour, red dot, message only on tap — is
**not built**, which is what step 4 owns.

**2 — two dictionaries. Confirmed.** `docs/code-words.md` and
`docs/crew-words.md` both exist. Spot-checked Hub, Buildings, Building, Unit,
Queue and Set Up Building against the crew file: no `flag`, no `Outbox`, no
`Drop`, no `Create Job`, and no `Project` or `Job` on any screen except the
known OPEN `Job site tracker` on the Hub. `Delete` carries its own red outline
and does not take half the row. Both unit-numbering notes match the file — the
`Floors and units` shape gets the site-convention sentence, `Units only` gets
`Units are numbered for now. Rename them when you know the addresses.`

**3 — progress bars. Confirmed, all four parts.**

- **Buildings row.** Project 1 answers `itemsDone 1 / itemsTotal 18` and drew a
  6% sliver where the old code drew nothing. After I set five more items it read
  33% against `1/6 Units done`. Project 2 is genuinely 0 done and correctly
  draws no bar at all.
- **Floor header.** Floor 1 drew a bar at 5 of 9 items while its count read
  `1/3 Units done` — the bar in items, the count in units, exactly as asked.
  Floor 2 draws a 1/9 sliver at `0/3 Units done`.
- **Unit chip.** No regression. 101 orange at two thirds, 102 full green, 103
  nothing at zero.
- **Unit screen.** The bar sits under the pill, stretched to the pill's width.
  It grew 33% → 67% → full green as I set the three items, and the pill turned
  `Complete` with it. No repeat of the `#unit-pill` smoosh.
- **Count text.** The new shape everywhere: `0/6 Units done`, `1/6 Units done`,
  `1/3 Units done`, `2/3 Units done`, `0/3 Units done`.
- **The no-bar rule holds** at every level.

**4 — `Exterior Doors`. Confirmed.** Reads `Exterior Doors` in the default item
list on Set Up Building. The key really moved too: a save aimed at
`exterior_doors` on an old ZZ Sheet came back refused, which is the old
`exterior_door_s` column being gone.

**5 — spinners. Confirmed.** Setting an item drew exactly two rings: one beside
that item's own status control, one in the sync bar. The phase header drew none.
The unit pill drew none.

**6 — Queue text and spinner too close to the box edge. NOT FIXED.** This is the
one outright miss of the round. `.item` in `theme.css:727` is still
`padding: 12px 2px`, unchanged since step 3 — `git log -S` finds no later commit
touching it. On the Queue screen those rows sit inside a bordered `.card`, so
measured live: card border at x=16, row text starts at x=19, and the ring ends
3px short of the right border. Block 1 gave `Delete` its own shape and dropped
the per-row reason, but never touched the padding. It does not show on the Unit
screen because there the rows run under the page's own padding with no card
around them.

**7 — queue wording. Confirmed.** Empty Queue reads `Nothing waiting` over
`All edits reached the server.` And the repeated offline sentence is gone: the
reason prints on a held row only, never on a queued one.

**8 — offline as a symbol. Confirmed as expected, and still split.** With one
edit queued, chip 103 carried a blue round badge in its **top-left** corner
while chip 101 carried the red `!` in its **top-right** — different colour,
different corner, no overlap. **The sync bar still draws the grey slab**, which
is the box Miguel named. Known, deliberate, and a one-line change.
*Worth his eye:* at real chip size the blue glyph reads as a plain blue dot. The
signal-bars-and-slash shape is not legible; colour and corner are doing all the
work.

**9 — the `!` marker. Confirmed.** Two genuine server refusals, not simulated
ones — the server answered `Unit 999 is not in this building any more.` The red
`!` badge drew on the unit chip's top-right corner and the sync bar read
`2 edits did not save`. `Try again` sent it again and it came back held with the
same reason. `Delete` cleared both and the empty state returned.

**10 — the red `Saving` flash. Confirmed fixed at the root.** I put a DOM
observer on the sync bar slot, went offline, and set an item. **Exactly one
paint was recorded:** `syncbar syncbar--quiet` / `Offline · 1 edit queued`.
There is no accent `Saving…` paint in the trace at all, so there is nothing left
to flash. And nothing is stranded by the early return: firing the `online` event
drained the queued edit immediately and the Sheet took it.

**11 — the stale line and the header stack. Confirmed.** One bar, two lines:
`Offline · 1 edit queued` on top, `updated Sun 4:50 AM` and `Queue ›` under it.
Still on screen after 18 seconds and several redraws. There is no third header.

**12 — `1 edit queued`. Confirmed**, singular, and `queued` not `wait`.

**13 — `Outbox` → `Queue`. Confirmed** in all four places: the file is
`queue.html`, the header reads `Queue`, the tab title reads
`Queue — PFC Control`, and the sync bar link reads `Queue ›`.

**14 — setup offline message. Confirmed unchanged.** Still three sentences:
`This phone has no connection. The app opened from its saved copy. Move to a
spot with signal, then try again.` Step 5.

**15 — the false empty message. Confirmed unchanged, and still false.** Offline
with two buildings cached, `Change a building` says `There are no buildings yet.
Create one above.` Block 1's word sweep turned `saved projects` into
`buildings`, so the sentence moved but the lie did not. Step 5. This is still
the worse of the two.

### Regressions

**None found.** The four things the fix round touched were all exercised:

- **Rollup.** Setting three items Complete on unit 102 turned its phase pill,
  its unit pill and its chip green in step, and lifted Floor 1 from `0/3` to
  `1/3 Units done` and the building from `0/6` to `1/6`.
- **Sync bar.** All shapes rendered: `Saving 1 edit…` in accent online,
  `Offline · 1 edit queued` quiet, `2 edits did not save` in red, the combined
  `Offline · 1 edit queued · 2 did not save`, the stale two-line shape, and
  genuinely nothing at all when online with an empty queue.
- **Queue drain.** Edits made online land in a few seconds. An edit made offline
  waits and goes out the moment the phone is back. `Try again` and `Delete` both
  work. The queue was empty at the end.
- **Unit header.** Pill and bar stack cleanly. No smoosh.

No console errors on any screen. The offline shell cache holds all eleven
`SHELL` entries **including the renamed `tracker/queue.html` and
`setup/index.html`**, which was HANDOFF's "works on a desk, blank in a basement"
warning — cleared, at least as far as a browser can tell.

### Four things worth a look, none of them on his list

- **A queued row's ring spins for ever while offline.** The `spin` animation
  runs at 0.75s on the Unit screen and on the Queue screen even though nothing
  is being sent and the bar two lines above says `Offline`. A spinner that never
  stops says "working" when nothing is working.
- **A held row can print a raw code key.** `Item exterior_doors is not in this
  building any more.` is a server string, and it reaches a crew screen with the
  underscore key in it. Fixable in `Code.js` by sending the label.
- **The Unit screen gives no sign of an open issue on the row.** Today the only
  way to find one is to open the dropdown and see `Complete` greyed. That is
  what step 4's records fix, and it is the same ground point 1's redesign
  stands on.
- **Offline with an empty, fresh queue draws no bar at all.** Miguel's sketch has
  `■ Offline · updated 1:22 AM` for that row, but the code only draws it once a
  fetch has actually failed. Defensible — the app never warns a copy *might* be
  old — but it does mean the phone says nothing about signal until something
  fails.

### For Miguel — a browser cannot do these

1. **A real phone, at chip size.** The blue queued glyph and the red `!` corner
   badge, side by side on a 77px chip.
2. **A real phone, the Unit screen corner.** Pill over bar at phone width.
3. **Real airplane mode on site.** The shell cache is complete, so it should
   open. Nobody has proved it on a phone.
4. **Two decisions.** Point 8's second half — give the sync bar `ICON.offline`
   instead of the grey slab, one line. And point 6 — patch now, or roll the
   padding into step 4.

### Is step 4 clear to start?

**Yes.** Fourteen of the fifteen points are where they should be, and the one
miss is a padding value on one screen that blocks nothing. Points 1, 14 and 15
are deliberately still open and belong to step 4 and step 5.

**Next:** step 4 — records, Logging, chips — plus fresh unsaturated test Sheets,
and point 6 folded in.

## Session 13 — 2026-08-09

**Step:** 4 — records, Logging and the chips. Built whole, **not tested in a
browser.**
**Branch:** `0.2` at `2db3401`, pushed.
**Merged to main:** **no, on purpose.** See "Why main was left alone".
**Deployed:** nothing. **`Code.js` was not touched, so no clasp push is
needed** — step 3 already shipped `save-batch` with its record branch, and
`get-project` already sends the whole Deficiencies tab. Step 4 is entirely
phone-side. Backend stays at Apps Script version 9.
**CACHE_NAME:** raised to `pfc-control-0.2-step4`.

Miguel started the session at bedtime: build it, do not test, no questions
to answer. So every judgement call below was made and written down rather
than asked.

### Landed

**`common.js` — records.** `newRecordId` (`d-YYYYMMDD-HHMM-xxxx`),
`makeRecord` (all thirteen columns, nothing left undefined), `queueRecord`,
`recordById`, `openRecords`. Every change to a record — new, Fixed,
Cancelled, reopened — sends the whole record again under the same id,
because a job carries the final value.

**`paintedRecords`, and the memo under it.** It merges waiting record jobs
over the stored copy, so a record logged in a basement flags its item
before it lands. A held record does not paint, same rule as an item edit.
`countFlags` now reads the painted list, which is called about 900 times on
a floor draw — so the answer is memoised against `jobsRev`, a counter
`Store.write` moves whenever the shelf changes. The bump sits inside
`write`, not in its four callers, because one missed bump paints a stale
flag.

**`foldLanded` now folds a landed record** into `copy.records` by id. The
build note left in step 3 said the bug would be identical to the item one,
and it was.

**The chip engine.** `normaliseNeeded` (strip space, quote, slash;
lowercase — never an edit distance), `chipGroupKey` / `chipScope` /
`chipSubtype`, `chipRows`, `chipsFor` (three, filtered as you type),
`nearMatch` (on Save only), `chipIndex`, `foldNeededLinesIntoChips` and
`pruneChipIndex`. Live buildings are counted from scratch every call;
dropped ones are read from the index; where both hold a line the larger
count wins and they are never added. The fold hangs off `Store.dropProject`,
which is the only place a copy is deleted.

**`unit.html`.** Flag chips under the item name and on the phase header,
each one a button that opens the records under it — shut until tapped, one
open at a time. A row reads `Bypass · 32 6 RH  x1  [ Fixed ]`. `Fix all N`
above more than one open record. A record fixed here stays struck through
with `Undo` for this visit and is gone when you leave the unit; nothing
moves in the Sheet. The green card asks about Complete after the last
record on an item is fixed, and never sets it.

**Test point 1, the greyed Complete row, is rebuilt as Miguel asked.**
Complete keeps its normal colour and carries a small red dot. The line
`Fix the open issue first. Then Complete comes back.` appears only after
somebody taps it.

**`control/logging/index.html` — the new window.** The place bar in two
fixed lines, `[change]` opening a bottom sheet with Building, Unit and
Phase together, and the seven controls in plan order: Type, Item, Subtype,
Needed, Count, Reason, Save. Type holds for the visit. Subtype is drawn
only on an item that defines types. The Needed box carries the item's hint
as its placeholder and the three chips under it. The unit box matches typed
text against the unit labels and prints the floor it found — it never
assumes the first digit is the floor. The phone remembers the building and
the phase in a new key, `pfc.control.v1.log.place`, and never the unit.

**Save is pinned**, PLAN CALL 3, sized off `window.visualViewport` on its
`resize` and `scroll` events. **This is the one thing in step 4 that a
browser cannot prove.** It wants a real phone with the Needed box focused.

**`Logged here`** carries Cancel on every row plus the row's send state.
**Cancel writes a Cancelled record rather than dropping the queued job** —
a job that timed out may already have reached the Sheet, and sending the
word Cancelled is the only way to be sure the Sheet ends up right. It also
takes the line back out of the chip pool, exactly, with no bookkeeping.

**Test point 6, the Queue padding, is fixed** — `.card .item` gets 12px of
side padding. Scoped to the card on purpose: the Unit screen runs the same
rows under the page padding with no card around them, where 2px is right.

**Also:** the `Logging` Hub card with a flag glyph, `logging/index.html` in
the Service Worker `SHELL`, `CACHE_NAME` to `pfc-control-0.2-step4`, and a
Logging section in `docs/crew-words.md` listing every string the screen
draws.

### Tested

**No browser.** Fourteen checks over the new pure functions run green in
node against a fake building copy: flag counting and the Complete
downgrade, phase-level Waiting reaching the phase and not the item,
normalising, chips from Open and Fixed records with two spellings counted
as one line, near-match hit and miss, a queued record painting, a held one
not painting, the fold surviving a dropped copy, a Cancelled line never
entering the pool, and the id shape. Every file parses.

### Why main was left alone

The protocol says a step ends with a merge to `main`, and `main` is what
GitHub Pages serves to his phone. Step 4 has not been opened in a browser
once. Merging it would put an untested Unit screen and an untested new
window on the tool he uses daily, overnight, with nobody awake to back it
out. The branch is pushed, so nothing lives only on this machine.

**The merge is the first thing the next session does, after a smoke
check.** It is three commands and one `CACHE_NAME` that is already raised.

### Open

- **Two OPEN words in `crew-words.md`:** `Subtype` and `Needed`, both plan
  words the crew does not say out loud. Neither blocks the screen; both
  block shipping 0.2.
- **The green card's rule for "asks once"** is per visit, not stored. Leave
  the unit and fix another record and it asks again. Nothing in the plan
  settles this; it costs a key to store and buys little.
- **A queued row's ring still spins for ever while offline** — carried over
  from session 12's four extras, untouched.
- **A held row can still print a raw item key** (`exterior_doors`). Also
  carried over. It is a `Code.js` string, so it costs a deploy.

### Next

1. Smoke check step 4 in Chrome: open Logging, save a record with the
   network off, confirm the flag appears on the item in Tracker, fix it,
   watch Complete come back. Then merge `0.2` to `main` and push.
2. Then step 5 — Admin. `rename-item`, the three list branches that skip
   the rebuild, `cancel-item-records`, the removal refusal panel, and test
   points 14 and 15, which are the two false offline messages on the
   Set Up Building screen.

## Session 14 — 2026-08-09

**Step:** 4 — the browser test round session 13 could not run.
**Branch:** `0.2`, unchanged. **No code was touched this session.**
**Deployed:** nothing. Backend still Apps Script version 9.
**Merged to main:** **no.** One real defect found. See below.

Miguel asked for the step 4 testing. The protocol says step 4 is a smoke
check, not a round — but step 4 was built blind, so this was run as a full
round against the plan section 6 step 4 list.

**How it was driven.** The `0.2` branch is not on GitHub Pages, so the app
was served from `python -m http.server` at `127.0.0.1:8765` and driven in
Chrome against the live Apps Script backend and the real `ZZ 0.2 Step 3
Test` Sheet. Offline was simulated by overriding `navigator.onLine` and
rejecting `fetch`, because this session had no DevTools throttle. Records
were written to the ZZ Sheet freely — it is junk and already on the trash
list.

### The six plan tests

**1 — a record logged with no signal flags the item before it lands.
Confirmed.** Saved `Bypass · 32 6 RH` on unit 202 offline, opened the unit,
and the issue chip drew while the job was still on the shelf.

**2 — Complete is blocked, and comes back by itself. Confirmed.** The
dropdown refused Complete on the flagged item, `Fix all 2` closed both
records, and after that Complete was selectable again with no write of its
own.

**3 — a record on an already-Complete item. Confirmed.** Windows on 202 was
stored `complete`. After logging `sash cracked` the screen read
`In Progress` with a 1 chip, and the stored value was still `complete`.
Store what is set, display what is true.

**4 — the same needed line three times. Confirmed.** The chip row read
`32 6 RH` then `28 6 RH`, most used first. Typing `28` filtered to one
chip. On Save, `32" 6" RH` raised the near-match prompt —
`This phone already has 32 6 RH. You typed 32" 6" RH.` — and `Keep mine`
saved the typed spelling.

**5 — cancel takes the chip back. Confirmed, after a redraw.** The row went
to `Cancelled` and the record went Cancelled in the copy, but the chip only
disappeared after the page was reloaded. Same root cause as the defect
below.

**6 — the eleventh building. Confirmed.** With ten copies held and distinct
seen times, the eleventh dropped the least recently seen, the phone stayed
at ten, and the dropped building's needed line was still offered as a chip
out of the history index. Worth knowing: when several copies share the same
`seen` millisecond the drop order is arbitrary. Only reachable in a
synthetic test, and one real tap apart is enough to separate them.

### The defect — a landed record does not refresh the screen

**One cause, three faces.**

`applyOutcome` in `common.js` takes a landed job off the shelf with
`Store.removeJob`, which fires `Queue.changed()` **before** the fold runs.
Every screen listening redraws from the copy as it was before the fold. The
fold, `Store.foldLanded`, then writes the copy and tells nobody: it does not
call `Queue.changed()` and it does not move `jobsRev`, which is the only
thing `paintedRecords` watches. So the memo keeps serving the pre-fold list
until the next outbox write or a reload.

Seen three times:

- **The issue chip count drops when the record lands.** Chip read `2` while
  queued, `1` one second later, with the record Open in the copy. On the
  last record of an item, the chip disappears and Complete unblocks.
- **`Fix all 2` left one row drawn as still open**, with its own `Fixed`
  button, while both records were Fixed in the copy and the green card
  above them said every record was fixed.
- **A cancelled line stayed in the chip pool** on the Logging screen.

Why it matters: the crew logs an issue in a basement, walks into signal,
opens the unit, and the issue they just logged vanishes off the row. The
comment above `foldLanded` says exactly what must not happen, and the fold
does its half of the job — the screen just never learns.

**The fix is small.** Either run the `foldLanded` loop before the removeJob
pass in `applyOutcome`, or add `jobsRev += 1; Queue.changed();` to the end
of `foldLanded` when `touched`. Not applied — the round's rule is to
collect findings and let Miguel decide, and nothing here blocked the round.

Item status edits were not seen to go stale the same way. Only records.

### Also confirmed, none of it on the plan's list

- **Test point 1, rebuilt.** Complete keeps its own green, carries a small
  red dot, and the line `Fix the open issue first. Then Complete comes
  back.` appears only after the row is tapped. The tap sets nothing.
- **Test point 6, the Queue padding.** Rows now sit 12px in from the card
  edge. `Try again` and `Delete` are different shapes.
- **A Waiting record on a whole phase** lands on the phase header with its
  own kind and count, beside a Deficiency count on an item below it.
- The Logging screen: place bar in two fixed lines, `set unit` before and
  `change` after, the sheet asking `Where are you?`, Subtype drawn only on
  an item that defines types, the item's hint as the Needed placeholder,
  the unit box printing the floor it found and refusing `999` by name, the
  phone remembering building and phase and never the unit, both `Other`
  boxes, `Logged here` carrying the send state and a Cancel that writes
  Cancelled.
- Save is disabled at half opacity until the form is complete.
- The Hub card, `./logging/index.html` in the Service Worker SHELL, and no
  console error on any screen all round.

### Small things, none of them blocking

- **Escape does not close the status menu.** Tapping outside does.
- **`Whole phase — Phase 1 — Doors & Windows`** reads with two dashes,
  because the phase label already carries `Phase 1 —`. `crew-words.md`
  writes it as `Whole phase — Doors & Windows`.
- **Two crew-facing sentences are missing from `crew-words.md`**, which says
  it lists every string the screen draws: the near-match sentence
  (`This phone already has …`) and the green card question (`Every record on
  X is fixed. Set it to Complete?`). Only their buttons are listed.
- **Save says nothing about which field is missing.** The dimmed button is
  the only signal.
- Carried over and still true: a queued row's ring spins for ever while
  offline, and the sync bar's offline mark is still the grey slab.

### For Miguel — a browser cannot do these

1. **The pinned Save on a real phone**, with the keyboard up and the Needed
   box focused. PLAN CALL 3. This is the one part of step 4 nothing here
   can prove.
2. The chips and the red `!` at chip size, still unproven on a phone.
3. Real airplane mode on site.

### Open

- **Fix the landed-record refresh before merging to `main`.** Main is what
  his phone serves, and this is the one defect in step 4 that loses work in
  a way the crew can see.
- The two OPEN words, `Subtype` and `Needed`, are still open. They block
  shipping 0.2, not building it.

### Next

1. The one-line fix above, then a re-check of the three faces, then merge
   `0.2` to `main` and push. `CACHE_NAME` is already at
   `pfc-control-0.2-step4`.
2. Then step 5 — Admin, and test points 14 and 15.

**Update, same evening — merged after all.** Miguel: "Crew does not use the
app." Nobody but him opens it, so an untested screen on `main` costs him a
reload, not a lost record. `0.2` merged to `main` and pushed at `03bd7a4`.
`CACHE_NAME` was already `pfc-control-0.2-step4`. `Code.js` was not touched,
so no clasp push — the backend stays at version 9. The line above reading
**Merged to main: no** is what was true before this update.

## Session 15 — 2026-08-09

**Step:** 4 — the fix round for what session 14 found.
**Branch:** `0.2` at `4779e3f`, merged to `main` and pushed.
**Deployed:** nothing. `Code.js` was not touched, so the backend stays at
Apps Script version 9. Every fix in this session is front end.
**Merged to main:** **yes.** `CACHE_NAME` is now `pfc-control-0.2-step4-fix1`.

### The defect — fixed, and re-checked on all three faces

`applyOutcome` in `common.js` emptied the shelf before it folded the landed
jobs into the building copy. `Store.removeJob` fires `Queue.changed()`, so
every screen redrew from the copy as it stood *before* the fold, and the
record that had just landed painted as though it never existed.

**Fixed twice over, on purpose.** Either change alone closes it; both
together mean no future caller can reopen it by accident.

1. `applyOutcome` now runs in three passes: file the results, fold every
   landed job into its copy, **then** take the landed jobs off the shelf.
   That is the order the function's own doc comment always claimed.
2. `Store.foldLanded` moves `jobsRev` when it writes. That counter is the
   only thing `paintedRecords`' memo watches, and `Store.write` moves it
   for the queue shelf alone — so the memo went on serving the pre-fold
   list even after the copy was right.

**All three faces re-checked in Chrome**, on the local `0.2` files, against
the ZZ copy already on this browser. A landing was simulated by calling
`applyOutcome` with `ok: true` — exactly what a drain does — with `fetch`
blocked, so nothing reached a Sheet.

| Face | Before | Now |
|---|---|---|
| The chip count | dropped when the record landed | queued `4` and `1`, landed `4` and `1`, shelf empty |
| `Fix all` | left a row drawn open with its own `Fixed` button | `Fix all 5` closed five; every row reads `Fixed · Undo` |
| The cancelled line | stayed in the Logging chip pool | chip appears on save, gone on cancel, gone after the cancellation lands |

The `Fix all` check was run with **no extra `Queue.changed()`** afterwards,
so the redraw it proves is `removeJob`'s own — not the one `drain` fires at
the end of the batch.

### The small things

- **The queued ring no longer spins for ever.** `queuedRingHtml` in
  `common.js` draws it still unless `Queue.sending()` is true. Three call
  sites take it: the Unit row, the Queue row and `Logged here`. Verified
  offline: `class="ring ring--wait"`, computed `animation-name: none`.
- **The sync bar draws the offline glyph, not the grey slab.** The slab
  still marks `1 edit queued` on a phone that *has* signal — there the word
  is "waiting", and the slab is right. `.sync-off` is the new class.
- **`Whole phase — Doors & Windows` reads with one dash.** `phaseName()`
  drops the label's own `Phase 1 — ` prefix. **The place bar keeps the full
  label** — there the phase number is the useful part. Plan section 5.7
  draws the place bar as `Doors & Windows · Floor 2`, so the two differ;
  nobody has flagged the bar, so it was left alone.
- **Save names the one field it still needs.** `missingLine()` returns the
  highest empty field, top to bottom, and the line sits over the dimmed
  button. Walked the whole ladder in the browser: `Set the unit.` →
  `Choose an item.` → `Choose a type.` → `Fill in the Subtype box.` →
  `Type what is needed.` → `Choose a reason.` → `Fill in the Reason box.` →
  no note, Save live.
  - **This makes Save refuse what it used to accept.** It only checked the
    building and the unit, so an empty form saved a blank record. Needed is
    now required on a Waiting record too. **Miguel's to veto** — it is one
    line in `missingLine()`.
  - The Needed box and the two `Other` boxes move the bar through
    `paintSaveState()`, which edits the bar in place. A `render()` on a
    keystroke takes the keyboard down mid-word.
- **The green card reads `Every issue on …`**, not `Every record on …`.
  Writing the sentence into `crew-words.md` is what caught it: `record` is
  a code word and `issue` is the settled umbrella. One thing, one word.

### Escape — there was never a defect

Session 14 reported that Escape does not close the status menu. **The app is
fine and always has been.** `git log -S` shows the handler in `unit.html`
unchanged since the first commit, and a real `keydown` closes the menu:
`openMenu` goes to `null`.

What fails is the test rig. Chased down after the entry was first written,
and **the first answer here was wrong** — it blamed the key action alone.

**The real cause: every tab in this Chrome reads `document.visibilityState
= "hidden"`.** The Chrome window is behind everything else or minimised, so
no synthetic input reaches the page at all. A keydown listener armed on the
page recorded **nothing** — not Escape, not a plain letter. A click listener
recorded nothing either, and a click on empty screen did not close the menu
that a tap outside is supposed to close. Tried on a second, freshly created
tab: also hidden.

So it is not a key-versus-click thing. **Screenshots and `javascript_tool`
work on a hidden tab; `computer` clicks and keys do not.** Two ways to test
a screen from here:

1. Bring the Chrome window to the front first, then drive it normally.
2. Leave it as it is and drive through `javascript_tool` — call the page's
   own handlers, and dispatch a real `KeyboardEvent` for a shortcut. That
   is how every check in this session was run.

Nothing about Escape needs fixing in the app, and nothing in this repo can
fix the input path. The extension is not our code.

### crew-words.md

The two missing sentences are in, plus the Save lines this session added:

- `This phone already has 32 6 RH. You typed 32" 6" RH.`
- `Every issue on Interior Doors is fixed. Set it to Complete?`
- The five Save lines.

A note at the bottom says why they were missed: **both of their buttons were
already listed.** A button reads as a string; a sentence inside a card reads
as prose and gets skipped. Check the sentences too.

### Worth knowing

- **Two test edits reached the live ZZ Sheet.** Loading a page drains the
  shelf before any block can be set, and two edits went out. The ZZ Sheet is
  junk and already on the trash list. Block `fetch` *before* putting
  anything on the shelf.
- **The Service Worker served a stale `logging/index.html`** in the middle of
  the round, and the first test result was against the old file. Caught by a
  `missingLine is not defined`. `CACHE_NAME` was bumped and the caches
  cleared. Bump it before testing, not after.
- The ZZ building has left the server's Buildings list, so Logging filtered
  it out — Logging only offers a building the phone holds a copy of *and*
  the list names. Put back on the phone's stored list for the round; the
  next real fetch overwrites it.

### Open

- The two OPEN words, `Subtype` and `Needed`, are still open. They block
  shipping 0.2, not building it.
- Still unproven, and a browser cannot do them: **the pinned Save on a real
  phone** with the keyboard up (PLAN CALL 3), the chips and the red `!` at
  chip size, and real airplane mode on site.
- The Save change above, if Miguel wants Needed optional.

### Next

Step 5 — Admin, and test points 14 and 15.


---

## Session 16 — 2026-08-09

**Step:** 4 — the second fix round, from Miguel's own test run.
**Branch:** `0.2` at `7945e55`, merged to `main` and pushed.
**Deployed:** **not yet.** `Code.js` gained one number, so this round DOES
need an Apps Script redeploy — the first round in three sessions that does.
See "The one deploy" below.
**Merged to main:** **yes.** `CACHE_NAME` is `pfc-control-0.2-step4-fix2`.

The findings are `notes/0.2-step-4-testing.md`, twelve of them across Core,
Logger, Set Up Building, UI and Bugs. Two were questions and got answers
rather than code. The other ten are built.

### The two questions

- **Subtypes in Set Up Building.** Not missing — not written yet. Step 5 is
  Admin and its test line is "add a subtype and confirm the Tracker tab is
  not rebuilt". Today the four subtype lists are seeded from
  `DEFAULT_ITEM_LISTS` when a building is created and nothing can edit them.
- **The ghost `ZZ 02 Step 3 Test` building.** Not a ghost. Logging never
  fetched anything, so it filtered a *stored* Buildings list against the
  copies on the phone, and both were stale. The desktop had a newer list, so
  it did not show it — which is why the report says "only from my phone".
  The `301 is not a unit in this building` half is the same root cause one
  level down: the copy of Elsliger 36-B predated the floor 301 sits on.

**Both halves are one fix.** Logging now draws its stored copy at once and
refreshes the list and the copy behind it, the way every Tracker screen
already did. **This was confirmed live during the check:** the seeded test
building vanished from the dropdown the instant the real `list-projects`
answer landed, because the fresh list no longer named it.

### The refresh ring — Core 1 and Core 2 are one mechanism

Miguel picked "old numbers, no sign it is checking" out of three readings of
"does not fetch the latest version quickly enough". So the fetch is not what
is slow; the silence is. Every screen already drew its copy instantly and
asked the server behind it, and nothing on the screen said so.

`enablePullToRefresh`'s private indicator became a shared one, and
`fetchProjects`, `fetchProject` and `loadStructure` now turn it. **A screen
gets the ring for free by fetching** — no per-screen wiring, which is what
keeps the next screen from forgetting it.

It is a **counter, not a flag**: Logging fetches a list and a copy back to
back, and the first one finishing must not stop the ring the second is
still using.

- The pull is on the Hub and Set Up Building too. On the Hub it drains the
  queue and refreshes the list and changes nothing on screen — the turning
  ring is the only answer it gives, which is right, because the Hub carries
  no queue count by design.
- `.ptr.spin` rests at `translateY(30px)`, was 60px. 60 parked it across the
  middle of the header title.

### The Logging form, rebuilt at the top

Building, Unit and Phase were a two-line place bar and a bottom sheet. They
are now the first three fields of the form, and the bar and the sheet are
deleted along with their CSS. Miguel picked this over keeping Building on a
bar.

- Building is a dropdown and is still remembered. Unit is a text box and is
  still never remembered.
- `typeUnit` moves three things in place and never redraws — the note, the
  dimmed class on the record half, and the Save bar. A redraw on a keystroke
  takes the keyboard down mid-number.
- `render()` now restores focus and caret for **any** input with an id, not
  just `#needed`. The unit box needed the same treatment.
- The unit is held as **typed text**, so a refreshed copy re-matches it. A
  unit added on the server this morning starts matching with no retype.

### The x on a suggestion chip

A chip is earned, not written: saved records with the same line make one. So
a typo saved three times became a permanent suggestion, and the only way
back was to find and cancel every record that fed it.

`chips.hidden` is a per-phone, per-group list of **normalised** lines.
`chipRows` filters it last, after both sources are read, so the history
index cannot put back what the live records already lost.

**It never touches a record.** `painters to finish` stays exactly as written
on every record holding it. That is history, and history does not get edited
to tidy a dropdown.

Checked in the browser: chip gone, `nearMatch` on a different spelling of
the same line answers `null`, and the record is still in the copy.

### The flags read as buttons now

Both flags were bare glyphs, and a bare glyph beside a name reads as a label
about the item.

- `.phase-label` and `.item-name` stopped being `flex: 1`. A new `.head-gap`
  eats the leftover width instead, which is what puts the flag **against the
  name** and leaves the pill on the right edge. The label taking the space
  itself is what pushed the flag over beside the status.
- The item's flags came off their own line underneath and onto the row.
- `.flag-btn` gained a round background tinted in the flag's own colour, and
  inverts when its records are open. **Fully rounded, not a fixed circle**:
  one open issue draws round, and a count of 12 grows sideways rather than
  spilling out of a 30px box.
- `queue.html` needed a `.head-gap` too — its ring rode on `.item-name`
  being `flex: 1`.

### The offline mark

- **Grey, not blue.** Blue is Waiting's colour everywhere else, so a mark
  about signal was wearing the colour of a mark about painters.
- **A wifi symbol with a slash**, not signal bars with a dash. Three bars is
  a strength meter, so a full bar next to a slash says two things at once.
  **The slash is a judgement call** — the note said "just a classic Wifi
  symbol" and did not say whether to keep it. It is one line to drop.
- **The clipping was the floor drawer, not the badge.** The drawer clips at
  its padding box and a chip's corner badges hang 5px above the chip, so the
  top row lost half of one. `padding-top` on an open `.floor-body` went from
  2px to 9px. Confirmed fixed in the browser on unit 101.

### The last floor stays open

Stored by **group key, not index** — add a floor in Admin and every index
moves. Read once, on the first draw that has a copy, so the fetch behind the
screen cannot undo a tap. `-1` is a real state and is stored as absence.

### The progress bar, coloured by phase

Miguel's complaint: a unit with Phase 1 wholly finished still drew one amber
bar part way along, which hides a closed phase.

He turned down the option he was offered. The slices-by-item-count version
left a phase's fill sitting in its own slot, so a part-done phase left a gap
before the next one started. **His rule instead: "if P3 has data logged that
3rd should stick at the tail end of P2".**

So every phase contributes a run as long as the items it has finished, and
**the runs butt up against each other** — no slots, no gaps, no dividers. A
run is green when its phase is wholly complete and amber while it is part
way. Two amber phases in a row are indistinguishable from one longer amber
run, which is the point: it is still one bar.

The total filled width is unchanged. It still equals `itemsDone /
itemsTotal`. Only the colouring is new.

Checked over all 320 combinations of a 7/7/4 building: **zero** width
mismatches against the old single fill.

`rollup()` carries an optional `phases: [ { key, done, total } ]`, and it is
optional the whole way through — a caller with none gets the old one-colour
bar. That matters, because a phone can be holding a list answer from before
the backend sent them.

### The one deploy

`countItemCells` groups the block it already reads in memory by phase — the
item columns sit in phase order, so no second read of the Sheet — and
`list-projects` sends it as `phaseCounts`, the **eighth** number after A1's
fifth and the step 3 round's sixth and seventh.

**Without the redeploy nothing breaks.** The Tracking rows keep drawing the
plain one-colour bar, and every other screen colours by phase off the copy,
because `projectRollup` passes `phaseCounts` straight through, undefined
included. Same rule the sixth and seventh follow.

### Worth knowing

- **The check ran against seeded data on `localhost:8731`**, not against a
  real Sheet. The two queued jobs named `TESTBLD1`, which no Drive file is,
  so nothing could have reached a Sheet even when the live backend answered.
  `API_URL` was pointed at a dead address **in the browser only** — the file
  is untouched.
- `overscroll-behavior-y: none` on `html` and `body` is what stops the
  Logging form sliding into the pinned Save bar. The custom pull still
  works: it reads touch positions and a `scrollY` of 0, and never needed the
  browser's bounce. **This one cannot be proved on a desktop.**

### Open

- The two OPEN words, `Subtype` and `Needed`, still block shipping 0.2.
- **Needs a real phone:** the overscroll fix, the pinned Save with the
  keyboard up, the new chip x at thumb size, and the grey wifi mark at 15px.
- Miguel's call on the slash through the wifi glyph.
- The Apps Script redeploy for `phaseCounts`.

### Next

Step 5 — Admin, and test points 14 and 15. Subtype editing lands there.
