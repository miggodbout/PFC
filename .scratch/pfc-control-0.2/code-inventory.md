# What the 0.1 code actually holds, measured against the 0.2 decisions

Written 2026-08-08. Nothing is decided here. Every line is a fact read out of
the working tree at commit `cf68d6d`, set beside the ticket that changes it.

`09-write-0.2-build-plan` owes a "screen changes, file by file" section. No
session had read the code against the seventeen tickets yet, so this file does
that first. It is the base `09` builds its file list from.

**How to read it.** Each file gets three parts: what is there now, what a closed
0.2 ticket changes, and anything the tickets did not see. The third part is the
one worth your attention. It is marked **FINDING** and there are nine of them.

---

## The whole surface, in numbers

| File | Lines | How much 0.2 touches |
|---|---:|---|
| `control/shared/common.js` | 753 | Most of it. About 200 lines are deleted outright |
| `control/appscript/Code.js` | 1315 | The status model, the layout, one new tab, one new action |
| `control/tracker/unit.html` | 320 | The heaviest screen rewrite in 0.2 |
| `control/admin/index.html` | 548 | One new screen inside it. Ticket `13` still open |
| `control/shared/theme.css` | 656 | Five status colours become three, plus flag colours |
| `control/tracker/building.html` | 130 | Header flash, counts, red dot on a closed floor |
| `control/sw.js` | 156 | The file list and the version number |
| `control/index.html` | 114 | Two cards in an array |
| `control/tracker/index.html` | 83 | Sync bar, install nudge, local list |
| `control/manifest.json` | 25 | Nothing known |

New files 0.2 adds: the Logger screen, the Outbox screen. Both need a line in
`sw.js` and both are new windows or doors, so both are covered by `12` and `05`.

---

## `control/shared/common.js` — the file 0.2 rewrites

Every screen loads this one file. It holds the status model, the backend call,
the local store, the demo buildings and the drawing helpers. Four of those five
change.

### The status model — deleted and rebuilt

Lines 38 to 68 hold the 0.1 model:

- `STATUS` — the five values, keyed `not_started`, `in_progress`, `complete`,
  `deficiency`, `on_hold`.
- `CYCLE` — the dropdown order, all five.
- `ROLLUP_ORDER` — worst to best.
- `worst(list)` — returns the first match in that order.
- `safeStatus(key)` — falls back to `not_started`.

`11-rollup-rules` deletes `ROLLUP_ORDER` and `worst()` and replaces them with a
counted rule. `01` cuts `STATUS` and `CYCLE` to three values and moves
`deficiency` and `on_hold` out of this object entirely, because a flag is not a
status.

**Every place that calls `worst()` today, so none is missed:**

| File | Line | What it rolls up |
|---|---:|---|
| `common.js` | 371 | a unit, inside `applyItemOverrides` |
| `common.js` | 481, 500, 534, 573 | four demo builders — all deleted by `03` |
| `building.html` | 94 | one floor's pill |
| `unit.html` | 98 | one phase's pill |
| `unit.html` | 308 | the unit pill, inside `refreshRollup` |
| `Code.js` | 204, 273, 320 | the server's own copy, a separate function |

So after the demo deletion there are exactly **four** live call sites on the
phone, and three on the server. That is the whole blast radius of the rollup
change.

> **FINDING 1 — the new rollup needs two things the old one never took.**
> `worst()` takes one argument: a list of statuses. The rule in `11` needs a
> count as well (`14/18`) and a flag count per kind, and at phase level it needs
> to know about phase-attached Waiting records. So this is not a swap of one
> function for another. It is a new function with a different shape, returning an
> object rather than a string, and all four call sites change with it. Every one
> of those four call sites feeds `pillHtml()`, which today takes a single status
> string. `pillHtml` changes too.

### `Store` — the sessionStorage object `03` rewrites

Lines 285 to 343. It reads and writes `sessionStorage` under the key
`pfc.control.v1.local`, holding two maps: `items` and `units`.

`03-local-copy-rules` moves this to `localStorage`, one key per building, ten
buildings kept, least recently opened dropped. `04` adds the outbox as its own
separate key.

The file's own comment at line 274 already says this: *"The store below is the
exact place 0.2 replaces."* That was written correctly in 0.1.

Call sites outside `common.js` are all in `unit.html`: lines 188, 195, 242, 258
and 309. Three of those five are the Details box, which `06` deletes anyway.

`CLAUDE.md` says the key name `pfc.control.v1.local` keeps its name because it is
an identifier, not a label.

> **FINDING 2 — the old key holds data that the new code cannot read.**
> `Store` today writes one flat object under one key. `03` writes one key per
> building. A phone that has used 0.1 has an object sitting at
> `pfc.control.v1.local` in **sessionStorage**, not localStorage, so it dies when
> the tab closes and no migration is needed. That is lucky rather than planned.
> The build plan should say plainly that no migration step exists, so nobody
> writes one.

### The demo buildings — about 200 lines, deleted

Lines 376 to 575, plus `demoBannerHtml` at 683. `03-local-copy-rules` deletes
the demo buildings. That reaches into four screens:

| File | Line | What breaks |
|---|---:|---|
| `tracker/index.html` | 40 | calls `demoBannerHtml(result)` |
| `tracker/index.html` | 51 | draws the `DEMO` tag |
| `tracker/building.html` | 66 | draws the demo banner |
| `tracker/unit.html` | 193, 194, 315 | `isMadeUpNote`, `demoItemDetails`, `demoDef`, `DEMO_DETAILS` |
| `admin/index.html` | 369 | filters demo projects out of the edit picker |

The `unit.html` coupling is the awkward one. `chooseStatus` moves a made-up demo
note along with the status so the two never disagree. All of that goes, and it
goes for free, because `06` deletes the Details box in the same release.

> **FINDING 3 — deleting the demo data removes the app's only offline-safe
> first run.** Today, when the backend cannot be reached and nothing is stored,
> every screen still draws something. After `03` the phone shows a spinner and
> then a failure message. That is what `03` intends and it is correct — a made-up
> building on a job site is worse than an error. But `loadProjects()` at line 226
> currently *never* returns a failure to its caller: it swallows the error and
> returns demo projects. So `tracker/index.html` has **no error branch at all**
> today. Compare `building.html` line 52 and `unit.html` line 61, which both
> handle `result.source === 'error'`. The Buildings screen must gain that branch
> in 0.2, and no ticket says so.

### `apiCall` — the transport, and it survives

Lines 117 to 172. It never throws. It answers `{ok:true, data}` or
`{ok:false, reason, detail}` with five named reasons: `not-configured`,
`offline`, `timeout`, `blocked`, `server`. There is a twelve second timeout and a
JSONP fallback through a script tag for networks that block a cross-site reply.

`04-queued-edit-rules` needs one result per job, each carrying
`retry: true|false`. That is a layer **above** `apiCall`, not a change to it. The
transport is reusable as written. This is the best news in the file.

> **FINDING 4 — `save-batch` may not fit down the JSONP fallback.**
> `apiUrlFor` at line 176 puts the whole payload in the address as a query
> string. That works for `get-unit`, which carries two short ids. A whole outbox
> is much larger. Browsers and Apps Script both stop accepting an address
> somewhere near 8,000 characters, and a long address fails silently rather than
> with a clear error. So on the exact network that needs the fallback most — a
> site proxy that blocks the POST reply — a large outbox drain could fail with no
> useful message. `04` never saw this, because it settled the outbox rules
> without reading the transport. **This is a question for `09`, not a decision
> for this file.** The cheap answer is to drain in slices of a few jobs when the
> fallback path is in use.

### The rest of `common.js`

- `applyUnitOverrides` (347) and `applyItemOverrides` (359) paint the 0.1 local
  changes on top of the server's answer. `05` replaces both: a waiting edit
  paints the screen, a held edit does not.
- `localOnlyNote()` (694) draws the "Preview only" banner. 0.2 saves for real,
  so it goes.
- `reasonText` (656) turns a reason into a sentence. It keeps working. It gains
  whatever new reasons `save-batch` returns.
- `pillHtml` (611) and `dotHtml` (620) — see FINDING 1.
- `registerWorker()` (711) already carries the right comment at line 729: a
  queued edit lives in localStorage, which a reload does not touch. That seam
  was left correctly in 0.1 and needs nothing.

---

## `control/appscript/Code.js` — the server

### The status model, again

`STATUS_VALUES` (43), `STATUS_FILLS` (46), `STATUS_KEYS` (55), `ROLLUP_ORDER`
(68), `worst()` (1251) and `buildRollupFormula` (1048) all hold the five-value
model. All change under `11`.

`STATUS_FILLS` and `STATUS_VALUES` drive more than the dropdown. They build the
conditional formatting — five rules at line 889 — and the whole Dashboard tab.

> **FINDING 5 — the Dashboard tab has two hardcoded sixes.**
> `11` already owns this tab and says what it must count: the three Progress
> values, plus one more number for how many units hold an open flag. What `11`
> does not say is that the tab changes width. `rebuildDashboard` calls
> `resizeSheet(sheet, rowCount, 6)` at line 928, and line 932 widens columns 2
> through 6. Six is one label column plus five statuses. Under `11` it becomes
> **five** — one label, three Progress counts, one flag count. Those two literal
> sixes are the whole change, and they are easy to miss because the number does
> not look like a status count. `STATUS_VALUES.forEach` at lines 968, 991 and
> 1012 then fills the right number of columns by itself.

### `computeLayout` — where removing the Details column actually lands

Lines 638 to 668. It gives every item **two** columns, Status then Details, then
one rollup column per phase, then Last Updated and Overall.

`06` removes the Details column. That sounds like deleting a button. In the Sheet
it halves the per-item column count, which moves the rollup columns, Last
Updated and Overall, and rewrites every formula address.

The good news: nothing stores a column position. The comment at line 522 says the
positions are worked out from the item order every time, so the two can never
drift. Removing `detailsCol` is a change in one function and the four places that
read it — lines 307, 714, 816 and 1084.

The comment at line 636 documents the resulting template layout ("status columns
C to AK, rollups AM to AP, AQ Last Updated, AR Overall Status"). That comment
becomes wrong and must be rewritten with it.

### `rebuildTracker` and the Deficiencies tab

> **FINDING 6 — `13-admin-changes` asks a question the code already answers.**
> Ticket `13` asks: *"Confirm nothing in the current clear-and-redraw path can
> reach it."* It cannot. `rebuildTracker` takes `ss.getSheetByName(TRACKER_SHEET_NAME)`
> at line 681 and every later call is a method on that one sheet object.
> `rebuildDashboard` does the same with the Dashboard tab. `resizeSheet` takes a
> sheet as its argument. There is no `ss`-level clear anywhere in the file. So
> `02`'s rule that `rebuildTracker` must never touch the Deficiencies tab is
> satisfied by the shape of the existing code, not by a new guard.
> **One caveat that must go in the plan:** it stays true only while the new tab
> is reached the same way. A future `ss.getSheets().forEach(...)` would break it
> silently.

### `handleListProjects` — the scale problem

Lines 175 to 217. For every Sheet in the Projects folder it calls
`SpreadsheetApp.openById`, reads the config, and reads the whole Overall column.
The answer is cached for 60 seconds.

> **FINDING 7 — this does not survive 50 buildings.**
> The map fixes the scale at "up to about 50 buildings over the life of the
> tool". `openById` plus two range reads is a slow call, and Apps Script stops a
> script at six minutes. With two test projects today nobody notices. At forty
> it is a real wait on every cold cache, and the crew hits it on app open,
> because `03` refreshes the list on app open. Two cheap answers exist — keep a
> small index file rather than opening every Sheet, or raise the cache and
> refresh it in the background — and neither is a 0.2 decision. **Flag it in
> `09` as a known ceiling with a note of when it bites.** `03` already reduces
> the pain by drawing the stored list first.

> **FINDING 8 — `save-batch` must clear the project list cache.**
> Both write actions today end with `CacheService.getScriptCache().remove('list-projects')`
> — lines 369 and 431. A status edit changes a building's rollup, so the
> Buildings screen would show a stale pill for up to a minute if `save-batch`
> forgets the same line. It is one line and it is easy to lose.

### The stale comment at the bottom of the file

Lines 1300 to 1315 are a block headed `0.2 EXTENSION POINT`. It tells the next
session to add an action called `update-item`.

> **FINDING 9 — `04` deleted `update-item` before it was built, and the code
> does not know.** `04-queued-edit-rules` replaced it with `save-batch`, which
> takes the whole outbox, takes the script lock once, and answers one result per
> job. The comment block still names `update-item` and describes writing one
> item. It is the first thing a build session will read when it opens `Code.js`,
> and it is wrong. It is listed in `supersessions.md` as the only stale item that
> lives in **production code** rather than in a note.
> The three helpers it points at are still correct and still needed:
> `readConfig`, `computeLayout`, `indexOfUnit`.

### What is fine and needs nothing

`respond` and the JSONP path, `writeConfig` / `readConfig`, `slug`, `uniqueKey`,
`colLetter`, `allUnits`, `activePhases`, `indexOfUnit`, `resizeSheet`. The lock
handling in both write actions is already correct, and `07` confirmed it.

---

## `control/tracker/unit.html` — the heaviest screen rewrite

320 lines. Roughly half change.

**Deleted by `06` — the Details box, in six places:** the editor markup (123 to
136), the Details button (142 to 144), the read-only line (158), `toggleDetails`
(217), `typeDetails` (238), `closeDetails` (246), `cancelDetails` (253), and the
`editorFrom` and `openEditor` variables (50, 51).

**Deleted with the demo data:** `isMadeUpNote` (314) and the block at 190 to 196.

**Deleted by `05`:** `localOnlyNote()` at line 82.

**Changed:** the dropdown at line 112 maps `CYCLE`, all five values. It becomes
three, with Complete greyed and not tappable while an open flag sits on the item,
and one line of reason under the panel. `refreshRollup` (303) takes the new rule.

**Added:** the flag row per item, tap-a-flag to open the record list, `Fix all`,
the turning ring on item and phase and unit pill, and the red card with Try again
and Drop.

**Kept and still useful:** `attr()` (165), the close-on-outside-tap listener
(275 to 286), and `placeOpenMenu` (205), which flips a dropdown upward when it
would run off the bottom of the screen. That last one matters more in 0.2, not
less, because the panel grows a reason line.

---

## The small screens

**`control/index.html`** — the Hub. One array, `CARDS`, at line 90. `12` adds a
`Log` card, `06` adds a greyed `Archive` card. Five cards become seven. The grid
is two across, so seven leaves one card alone on the last row. Cosmetic, worth
knowing before it is seen on a phone.

**`control/tracker/index.html`** — 83 lines, the smallest screen. Header already
reads `Buildings`, correct per the 0.1.1 decision. Needs the sync bar from `05`,
the install nudge from `10`, pull to refresh from `03`, flag counts on the pill,
and the error branch from FINDING 3.

**`control/tracker/building.html`** — the header flash lives at line 25, the
literal word `Building` inside `<h1 id="title">`, replaced at line 58 once the
data lands. `unit.html` line 25 does the same with `Unit`, replaced at line 75.
Both are named in `09`. Also needs the red dot on a closed floor header from
`05`, because a closed floor hides its unit chips.

**`control/shared/theme.css`** — lines 74 to 78 define five status classes. Under
`11`, `.s-deficiency` and `.s-on_hold` stop being statuses. The colours stay
useful for flag chips. `11` says `on_hold` is renamed `waiting` **throughout**,
and this file is one of the places "throughout" reaches — the class name
`.s-on_hold` at line 78, plus its uses in `building.html`, `unit.html` and
`common.js`. A CSS class name is free to change, unlike the storage key.

**`control/sw.js`** — `CACHE_NAME` at line 15, `SHELL` at line 18. The Logger and
Outbox screens each need a line in `SHELL`, and the version must rise.

One open question on the map is already answered by this file: *"`sw.js` must
delete old Cache API entries in its `activate` handler."* It already does, at
lines 53 to 63 — every cache whose name is not the current one is deleted. What
0.2 adds is data in **localStorage**, which a Service Worker never touches, and
that is exactly what keeps the outbox safe across an update.

---

## `control/admin/index.html` — the file ticket 13 still owns

548 lines. Two halves: the create form (111 to 344) and the "Edit an existing
project" block (347 to 540).

The edit block already has the shape `13` needs. It draws one card per operation
— Add an item, Remove an item, Add a unit, Rename a unit — each with its own
dropdowns and its own button, and `runOp` at line 493 builds the payload and
calls `updateStructure`. A per-item screen for the type list and the reason trim
is a fifth card, or a new screen reached from one.

Server side, `applyStructureOp` at line 444 is one function with four branches,
and `handleUpdateStructure` follows every branch with `rebuildTracker`,
`rebuildDashboard` and `writeConfig`. `13` wants a list edit to call
`writeConfig` alone. That is a new branch **before** the rebuild block, returning
early — a small change to lines 419 to 429, not a rewrite.

`remove-item` at line 459 has no open-record check. `02` requires one.

The comment at line 437 tells the user "The item loses its Status and Details
columns." After `06` there is no Details column. One-line fix.

---

## What no ticket owns

Collected from the nine findings, so `09` can decide each one in a sentence.

| # | Thing | Suggested home |
|---|---|---|
| 4 | `save-batch` size against the JSONP fallback | `09`, needs a rule. The only one that can lose data |
| 3 | `tracker/index.html` has no error branch | `09`, small items list |
| 8 | `save-batch` must clear the list cache | `09`, small items list |
| 5 | Two hardcoded sixes in `rebuildDashboard` | `09`, small items list |
| 7 | `handleListProjects` at 50 buildings | `09`, note the ceiling, do not fix in 0.2 |
| 9 | The stale `update-item` comment in `Code.js` | `18`, and it is the only one in real code |
| — | Seven Hub cards in a two-wide grid | cosmetic, mention once |
| — | The layout comment in `computeLayout` goes wrong | `09`, with the Details column removal |
| — | The Admin note at line 437 names the Details column | `09`, small items list |

Findings 1, 2 and 6 need no decision. 1 and 2 are facts the plan should state.
6 answers an open question on `13` in the code's favour.

Only FINDING 4 can lose a person's work. Everything else is a wrong word on a
screen, a slow load, or a comment that misleads a reader. Rank them that way.
