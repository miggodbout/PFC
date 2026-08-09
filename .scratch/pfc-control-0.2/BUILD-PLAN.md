# PFC Control 0.2 — the build plan

**Status: LOCKED, 2026-08-08.** Written by `09-write-0.2-build-plan`, the last
ticket on the 0.2 map. Every answer in this file comes from a closed ticket.
**Nothing is decided here except the four items marked `PLAN CALL`.**

This file is the destination of `.scratch/pfc-control-0.2/map.md`. A build
session works from this file. It does not have to read nineteen tickets first.

**Section 11 is not optional reading.** It holds every option that was proposed,
argued and turned down. Each one is the obvious idea a build session has at the
moment it reaches that code.

---

## Amendments made during the build

LOCKED means planning is closed, not that the file can be wrong. Each line
below is a place where building the thing showed the plan was short. **Every
one is marked again where it lands in the file**, so nobody reads the old
sentence on its own and "fixes" the code back.

A1 and A2 re-open nothing. Each is arithmetic the plan could not have done on
paper. **A3 is a different animal** — Miguel changed his mind about words, on
purpose, after seeing the built screens. It is marked so you do not read it as a
correction.

| # | Amendment | Sections | Date |
|---|---|---|---|
| A1 | `list-projects` sends **five** numbers, not four. `unitsNotStarted` was added | 2.4, 3.4, 5.2, 6 | 2026-08-08, step 2 |
| A2 | The Details box was deleted in **step 2**, not step 3 | 5.4, 6 | 2026-08-08, step 2 |
| A3 | **Every crew-facing word in this plan is superseded by `docs/crew-words.md`** | 5.6, 5.7, 5.8, and every screen | 2026-08-09, after step 3 |

### A3 — the words moved, the design did not

The 0.2 step 3 test round put built screens in front of Miguel, and fifteen
findings came back. Point 2 of `notes/0.2-step-3-testing.md` asked for a
vocabulary pass. It was run as a grilling session on 2026-08-09 and settled
eleven decisions.

**`docs/crew-words.md` is now the authority on any word a crew member reads.**
Where this plan and that file disagree, that file wins. The ones that touch this
plan by name:

| This plan says | Now reads |
|---|---|
| the **Logger** window, `Log` card, section 5.7 | **Logging**, in all five places — card, header, folder `control/logging/`, file, and this plan |
| the **Outbox** window, section 5.6 | **Queue**, at `control/tracker/queue.html` |
| `Create Job` on the Hub, section 5.8 | **`Set Up Building`**, folder `control/setup/` |
| `Drop` on a Queue row, section 5.6 | **`Delete`**, and it must not share a shape with `Try again` |
| a **flag** anywhere on a screen | **issue**. `flag` stays in this plan and in the code, and never reaches a screen |
| `Offline · 3 edits wait` | `Offline · 3 edits queued` |

**None of this changes a mechanism.** The outbox still drains the same way, the
marks still carry the same three facts, and section 4's shape rules are
untouched. Only the words moved, plus two shapes: the `Delete` button and the
greyed Complete row.

Two decisions from that session are **not** wording, and they do change what gets
built:

- **One project is exactly one building, always.** A two-tower site is two
  buildings, opened separately. Nothing nests. This closes the door on a level
  above Building for 0.2 and 0.3.
- **The three developer error strings get crew wording plus a code**, `E1` to
  `E3`, with the technical half written to the browser console. Listed in
  `crew-words.md`.

### A1 — the fifth number

The plan says `list-projects` sends four numbers: `unitsDone`, `unitsTotal`,
`deficiencies`, `waiting`. **The rollup rule of section 3.4 cannot run on
them.** It needs `n`, `c` **and `s`** — how many are Not Started — and four
numbers do not carry `s`.

The failure is not an edge case. "Every unit Not Started" and "some unit In
Progress" both arrive as `unitsDone: 0`, so the phone cannot tell a job nobody
has touched from a job halfway done. **Every untouched building on Tracking
read In Progress**, which is the same class of lie worst-wins told.

`unitsNotStarted` is one `.filter()` over `readOverallColumn`'s answer, which
is already in memory. It costs no extra read.

**It does not break the rule the four numbers existed for.** That rule is
"the server sends numbers and the phone applies the rule", from `14` rule 4.
A fifth number is still a number. What was banned is a *verdict* — a status
string worked out on the server, which the phone cannot re-check. There is
still no `overall` key anywhere in the answer.

### A2 — the Details box

Section 5.4 lists the Details box among the Unit screen deletions, and the
Unit screen rewrite is step 3 and step 4 work. **Step 1 had already removed
the Details column from the Sheet**, so by step 2 `get-project` sent no
`details` key at all and the box had nothing to read or write. It went with
its column, in step 2, with `toggleDetails`, `typeDetails`, `closeDetails`,
`cancelDetails`, `editorFrom` and `openEditor`.

This changes when, not what. Everything else in 5.4 is still step 3 and 4.

---

## 0. Before you start

### Read order

1. This file, whole.
2. `template-changes.md` — FINAL. The Sheet spec. Build the Sheet from it.
3. `supersessions.md` — 47 entries. Which decision wins where two disagree.
   Read it before you trust any single sentence in a resolved ticket.
4. `code-inventory.md` — the 0.1 code measured against every ticket.
5. A ticket, only when this file points you at one for the reasoning.

**Where a ticket disagrees with this file, this file wins.** It was written after
all of them, from `supersessions.md`.

### What 0.2 is

1. Fast screens, drawn from a local copy on the phone.
2. Two-way saving, from the app back to the project Sheet.
3. An offline queue with a visible pending mark. Never a silent loss.
4. Structured deficiency and Waiting records, and the screen to enter them.

### What 0.2 is not

- No sign-in, no author, no crew identity. That is 0.3.
- No Archive window. That is 0.3. 0.2 leaves the seams, listed in section 8.
- No photo on a record. No promised date. No GC punch list.
- No hiding of finished items. **Every item is always drawn on the Unit screen.**

### Two facts that shape everything

- **There is no upgrade path.** Change the template, trash the test Sheets, make
  the real building fresh. `_Config.version` rises to **2** so the code can refuse
  a version 1 Sheet with a clear message.
- **`handleCreateProject` never copies the .xlsx.** It builds every Sheet in code.
  The .xlsx is the visual specification. **The real seed is
  `control/shared/common.js`.** Every change below is two changes: the code, and
  the .xlsx by hand to match.

---

## 1. The data shape, and the Sheet

### 1.1 `_Config`, version 2

One JSON object in cell A1 of the hidden `_Config` tab. `writeConfig` and
`readConfig` already read and write the whole object in one call, so the storage
does not change. Three keys are added.

```
{
  "version": 2,
  "name": "...", "mode": "floors", "createdAt": "...",
  "groups": [ ... unchanged ... ],
  "reasons": ["Wrong Size", "Wrong Type", "Wrong Swing", "Wrong Color",
              "Missing", "Damaged", "Defective", "Other"],
  "phases": [
    { "key": "phase1", "label": "Phase 1 - Doors & Windows", "items": [
      { "key": "interior_doors", "label": "Interior Doors",
        "types": ["Regular", "Bypass", "Bi-fold", "Double",
                  "Pocket", "Double Pocket", "Dwarf", "Unit Door"],
        "trim":  [],
        "hint":  "Size   Jamb   Swing" }
    ]}
  ]
}
```

- `reasons` — one list of eight, **per building**. Not per phase and not per item.
- `types` — per item. Feeds the Subtype dropdown and the `subtype` column.
- `trim` — the reason strings this item does **not** offer, matched exactly
  against `reasons`. An empty trim offers all eight.
- `hint` — the grey placeholder text inside the empty needed box.
- **The Waiting reason list is not stored.** It never varies. It is a constant in
  `common.js`: `Waiting on Another Trade · Awaiting Delivery · Backordered ·
  Site Not Ready · Other`.
- A custom item arrives with `types: []`, `trim: []`, `hint: ""`. It offers all
  eight reasons and shows no subtype dropdown.
- **Ship every item with an empty trim.** Miguel writes the trim content later,
  through the Admin Lists card. An empty trim is never wrong, only wider than it
  needs to be. It does not gate the build.
- **A trim change needs no release at all.** It lives in `_Config`, not in code,
  so changing it costs one Admin tap on a live building or a template edit for new
  ones. No push, no Pages build, no `CACHE_NAME` bump, no phone update. **Do not
  treat a trim list as a thing that needs a version number.**
- **The trim is about responsibility, not about the item.** Ask "does PFC own
  this", not "can this item have this". The worked example is Exterior Door(s):
  the framer hangs patio and entry doors and PFC only builds out and trims around
  them, so `Wrong Swing`, `Wrong Type` and `Wrong Color` all come off — even
  though the door plainly swings.

**"Lists only grow" covers exactly two lists.** Do not widen the rule:

| List | Add-only? |
|---|---|
| Reasons | **Yes** |
| Subtypes | **Yes** |
| Progress: Not Started, In Progress, Complete | No — fixed in code |
| Record states: Open, Fixed, Cancelled | No — fixed in code |
| Phases | No — Admin cannot add or remove one |
| Items | No — `remove-item` has its own rule, section 2.6 |
| Units | No — Admin has no remove operation |

### 1.2 The default item list — 14 items, was 17

`DEFAULT_PHASES` at `control/shared/common.js:78`.

| Phase | Item | Subtypes |
|---|---|---|
| 1 — Doors & Windows | Interior Doors | Regular, Bypass, Bi-fold, Double, Pocket, Double Pocket, Dwarf, Unit Door |
| 1 | Exterior Door(s) | Patio, Entry |
| 1 | Windows | — |
| 1 | Attic Hatch | — |
| 1 | Handrail | — |
| 1 | **Bathtub** | — |
| 2 — Baseboards | Cut | — |
| 2 | Nailed | — |
| 3 — Hardware & Accessories | **Handles** | Passage, Privacy, Dummy, Pocket |
| 3 | Ball Catch | — |
| 3 | Deadbolts | — |
| 3 | **Stops** | Spring, Hinge |
| 3 | Mirrors | — |
| 3 | Bathroom Accessories | — |

`Unit Door`, `Passage`, `Privacy`, `Dummy`, `Spring Stops` and `Hinge Stops` stop
being items. `Handles`, `Stops` and `Bathtub` are new. **Every subtype list ends
with `Other`, which opens a text box.** The typed text goes in the record's
`subtype` cell. It never joins the list.

The default subtype lists, the eight reasons, the per-item trim and the fixed
Waiting list all live beside `DEFAULT_PHASES` in the same file. The Admin create
form sends them up in the payload, the way item labels already are.

### 1.3 The Unit Tracker tab

- **The Status column holds three values:** `Not Started · In Progress ·
  Complete`. `Deficiency` and `On Hold` come out. They were never progress.
- **The Details column is removed.** Every item had two columns, Status and
  Details. It now has one.
- Data validation drops to three values. `allowInvalid` stays true.
- Conditional formatting drops from five rules to three. The three fills stay:
  `#EFEFEF` Not Started, `#FFEB9C` In Progress, `#C6EFCE` Complete.
- `On Hold` is renamed **Waiting** wherever the word survives.
- The six header rows stay. The printed look does not change.

Width: `2 + items + phases + 2`.

```
0.1 today, 17 items with Details    41 columns
0.2, 14 items, no Details           21 columns
```

Removing Details is bigger in the Sheet than it looks. `computeLayout`
(`Code.js:638-668`) gives every item two columns. Halving that moves the phase
rollup columns, Last Updated and Overall Status, and rewrites every formula
address. **Nothing stores a column position** — the comment at `Code.js:522` says
positions are worked out from the item order every time — so the change is one
function plus the four places that read `detailsCol`: lines **307, 714, 816,
1084**. **Rewrite the layout comment at `Code.js:636` in the same edit.** It
names the old column letters and goes wrong the moment the column leaves.

### 1.4 The Deficiencies tab — thirteen columns

One tab per project Sheet. One header row, data from row 2. Freeze row 1, add a
filter. It is a plain list, unlike the Unit Tracker tab. The header row holds
**keys, not labels**.

| Col | Name | Holds | Notes |
|---|---|---|---|
| A | `record_id` | `d-20260806-1422-a7f3` | Made on the phone, never on the server |
| B | `unit` | the unit key | |
| C | `phase` | the phase key | Always filled |
| D | `item` | the item key from `slug()` | **Blank means the record is on the whole phase** |
| E | `type` | `Deficiency` or `Waiting` | Decides which reason list applies |
| F | `reason` | one value from the building's eight | |
| G | `other_text` | free text | Only when the reason is `Other` |
| H | `subtype` | `Bypass`, `Privacy` | Blank on an item that defines no types |
| I | `needed` | free text, such as `32 6 RH` | Optional on a Waiting record |
| J | `quantity` | a number | |
| K | `state` | `Open`, `Fixed` or `Cancelled` | The filter column |
| L | `created` | date `yyyy-mm-dd` | A real date cell, not text |
| M | `closed` | date `yyyy-mm-dd` | Blank while the record is Open |

Rules:

- **One record is one problem and one thing needed.** A problem that needs two
  different materials becomes **two records**. This keeps the screen flat and
  still lets 0.5 add up materials.
- **A Deficiency always attaches to an item. A Waiting attaches to an item or to
  a phase.** A defect is about a physical thing. "Phase 2 waiting on painters" is
  not about any one item, and forcing it onto one puts the reason in the wrong
  place.
- **The record id format is `d-YYYYMMDD-HHMM-xxxx`**, where `xxxx` is four random
  hex characters. **The phone makes it when Save is tapped, before anything leaves
  the phone.** This is what makes a retried save safe.
- **New rows always go on the bottom.** Never inserted. The tab is a
  chronological log.
- The server finds a row by reading **column A whole in one call**
  (`getRange(2,1,lastRow-1,1).getValues()`), then matching in memory. Not one
  search per record.
- **Id found, overwrite that row. Id new, append.** A retry can never duplicate.
- Three states. `Fixed` and `Cancelled` both clear the flag and both fill the
  `closed` date. **A record is never deleted and never moved.** There is no
  Archive tab.
- **`Cancelled` is how a mistake is undone.** Closing a typo as `Fixed` writes a
  lie into the Sheet, and 0.5 shows a Fixed record to a supplier.
- **`rebuildTracker` must never touch this tab.** It is already safe:
  `rebuildTracker` takes one sheet object at `Code.js:681` and every later call is
  a method on that object. There is no spreadsheet-level clear in the file.
  **Caveat for the build: it stays true only while the new tab is reached the same
  way. A future `ss.getSheets().forEach(...)` breaks it silently.**

### 1.5 The rollup formula in the Sheet

`buildRollupFormula` (`Code.js:1048`) is rewritten to the count rule below. Its
`Deficiency` and `On Hold` branches come out. The open-flag test is a `COUNTIFS`
against the Deficiencies tab, matching the unit key and a state of `Open`.

**Two things compute the rollup on purpose:** the phone, which is the one the app
uses, and the Sheet, so it still reads by hand. **Drift between them is cosmetic
and accepted** — both sides do the same arithmetic, and the app never reads the
Sheet's rollup column. Do not add a third copy.

Do not change a rollup formula by hand. `Code.js` rebuilds every one of them.

### 1.6 The Dashboard tab

It counts units by status. Five status columns become **four numbers**: the three
Progress values, plus how many units hold an open flag. With the label column
that is **five columns wide, not six**.

Two literal sixes in `rebuildDashboard` carry the old width:
`resizeSheet(sheet, rowCount, 6)` at **line 928**, and the column-width loop at
**line 932**. The three `STATUS_VALUES.forEach` loops at lines 968, 991 and 1012
fill the right number of columns by themselves once the list is three long.

### 1.7 The .xlsx, by hand

`reference/PFC_Master_Template.xlsx`, and the live copy at
`PFC/Master Template/PFC_Master_Template.xlsx`
(ID `1QIF5TCJ0iekpNGHEjce1PSoFXRFhucmF-ednTSYHT-M`).

It is the visual specification and no code reads it. Update it to match: 14 items
instead of 17, no Details columns, three status values in the dropdown, three
conditional formats, the new Deficiencies tab, and the five-column Dashboard.

---

## 2. The backend — `control/appscript/Code.js`

### 2.1 New action: `get-project`

Returns **one whole building in one answer**. It replaces `get-structure` plus one
`get-unit` per unit. This is cheap because the Unit Tracker tab is one grid, and
reading the whole grid is the same single `getValues` call that
`handleGetUnit` already makes for one row.

It returns:

- the config, including `reasons` and every item's `types`, `trim` and `hint`, so
  Logger can draw its dropdowns from the local copy;
- every unit and every item status;
- **the whole Deficiencies tab, every state — Open, Fixed and Cancelled.**

**Do not filter the records.** Fixed records feed a suggestion chip, and Archive
is a filter over records in 0.3. A state filter added later to trim the payload
takes away both. Size is not the constraint: about 300 records at ~120 bytes is
~36 KB, against a building copy of ~100 KB.

### 2.2 New action: `save-batch`

**One write action for the whole outbox.** It takes every job, of both kinds,
takes the script lock **once**, writes them, and answers **one result per job**.

```
{ action: 'save-batch', jobs: [
    { key:'1500Main|2-204|interior_doors', kind:'item',
      projectId:'1500Main', unitKey:'2-204', itemKey:'interior_doors',
      progress:'Complete' },
    { key:'rec|d-20260806-1422-a7f3', kind:'record',
      projectId:'1500Main', record:{ ...the thirteen columns... } }
] }

-> { success:true, results:[
      { key:'1500Main|2-204|interior_doors', ok:true },
      { key:'rec|d-20260806-1422-a7f3', ok:false, retry:true,
        error:'The server is busy. Try again.' }
] }
```

Rules on the batch:

- **Cap about 100 jobs per call.** The oldest 100 go first. The rest go on the
  next drain. This keeps a call inside its six minute budget, which lock waiting
  eats into.
- **Jobs may span buildings.** Group them by project id and open each Sheet once.
- **Per-job results, never one verdict.** One bad job must not poison the others.
  A job with `ok:true` leaves the outbox. Every other job stays.
- **Oldest first**, because it is free. There is no strict order requirement — the
  keyed shelf in section 3.2 guarantees at most one job per target, so two jobs
  can never race for the same cells.
- **Every job carries the final value, not a change to apply.** Writing it twice
  is the same as writing it once.
- **Every result carries `retry: true` or `retry: false`.** This is the fix for
  the fault `07` found: today a busy server and a permanent failure look
  identical.

| Failure | retry | Why |
|---|---|---|
| `tryLock` returned false, server busy | true | Another write is running. It will end. |
| No signal, request never left the phone | true | Nothing was attempted. |
| Request timed out | true | The write may have landed. It is idempotent. |
| `Unknown action` | false | The backend is older than the app. |
| Not a PFC Control project | false | Wrong Sheet. |
| Unit not found | false | Admin removed it. |
| Item not found | false | Admin removed it. |
| Anything the app cannot name | true, to a limit | See section 3.2. |

- **`save-batch` must end with
  `CacheService.getScriptCache().remove('list-projects')`.** Both existing write
  actions do this, at lines 369 and 431. Forget it and the Buildings screen shows
  a stale pill for up to a minute. It is one line and it is easy to lose.

### 2.3 New action: `cancel-item-records`

`{ id, itemKey }`. Sets every `Open` record on that item to `Cancelled` and
returns the count. It writes the Deficiencies tab only. No config change and no
rebuild. It backs the Admin refusal panel in section 5.6.

### 2.4 Changed: `handleListProjects`

> **AMENDED A1, 2026-08-08 — it sends FIVE numbers.** `unitsNotStarted` was
> added during step 2. Section 3.4's rule needs it and four numbers do not
> carry it. Do not take it back out. See Amendments, above.

Per building it sends **five numbers and no verdict**:

```
unitsDone, unitsNotStarted, unitsTotal, deficiencies, waiting
```

- `unitsDone` and `unitsTotal` come from the per-unit `COMPLETION` column that
  `readOverallColumn` (`Code.js:1098`) already reads. Counting units out of that
  column is free. Counting **items** would mean reading the whole Tracker grid for
  every building on the list.
- `deficiencies` and `waiting` are **raw row counts** out of the Deficiencies tab,
  by type, state `Open`. One extra read per building, on a file that is already
  open.
- **`worst(statuses)` at `Code.js:204` is deleted, and the `overall` word goes
  with it.** The server sends numbers. The phone applies the rule. That was the
  load-bearing half of `14` rule 4: `worst()` is the deleted worst-wins rule
  applied in server code, and it gave the phone a judgement it could not re-check.
- **Keep returning every building, finished or not.** The finished-building test
  lives in the drawing layer on the phone. Moving it into the server answer as an
  optimisation deletes the 0.3 Archive's way in.

### 2.5 Changed: `handleCreateProject`

- Make the `Deficiencies` tab, write the header row, freeze row 1, add the filter.
- Seed `reasons`, and each item's `types`, `trim` and `hint`, from the create
  payload.
- Write `version: 2`.

### 2.6 Changed: `applyStructureOp`

Today it has four branches — `add-item`, `remove-item`, `add-unit`,
`rename-unit` — and `handleUpdateStructure` follows every branch with
`rebuildTracker`, `rebuildDashboard` and `writeConfig`.

Add:

1. **`rename-item`** — label only, the key never moves. Mirrors `rename-unit` at
   line 496. It **does** rebuild the Tracker tab, because the header text changes.
   It **never** touches the Deficiencies tab, because that tab stores the item
   *key* and not the label. That is exactly why a label-only rename is safe.
   Without it, fixing a typo in an item name orphans every record under that item
   and loses its subtype list, its trim and every status value.
2. **`add-reason`, `add-type`, `set-trim`** — these **return before the rebuild
   block**, so `handleUpdateStructure` calls `writeConfig` alone. A list change
   touches no column and must never rebuild the Tracker tab. This is a new code
   path, not a new branch on the old one. It is a small change to lines 419-429.
3. **`remove-item` at line 459 gains the open-record check.** One read of the
   Deficiencies tab's item-key and state columns. Refuse with the record count and
   the unit count.

**Add is Add-only. There is never a Delete button** on a reason or a subtype list.
That is what keeps the Sheet safe by itself: no row can ever point at a value that
stopped existing. **Unticking a trim box is different and is freely reversible**,
because it removes nothing — the value stays in the building list.

**`remove-unit` stays out of 0.2.** Nobody has asked for one.

**A new value stays in the building it was added to.** It never reaches the next
building. New buildings seed from `common.js`.

### 2.7 Deleted from `Code.js`

- `ROLLUP_ORDER` (line 68) and `worst()` (line 1251).
- The `Deficiency` and `On Hold` entries in `STATUS_VALUES` (43), `STATUS_FILLS`
  (46) and `STATUS_KEYS` (55). They also drive the conditional formatting — five
  rules at line 889 become three — and the Dashboard.
- **The `0.2 EXTENSION POINT` comment block at lines 1300-1315.** It tells the
  next session to build an action called `update-item`, which `04` deleted before
  it was ever built. **It is the first thing a build session reads when it opens
  this file, and it is the one piece of stale text living in production code.**
  Replace it with a short `save-batch` note. The three helpers it points at —
  `readConfig`, `computeLayout`, `indexOfUnit` — are still correct and still
  needed.

### 2.8 What needs nothing

`respond` and the JSONP path, `writeConfig` / `readConfig`, `slug`, `uniqueKey`,
`colLetter`, `allUnits`, `activePhases`, `indexOfUnit`, `resizeSheet`. The lock
handling in both existing write actions is already correct.

---

## 3. The phone

### 3.1 Three stores, three lifetimes. Do not merge them

| Key | Holds | Lifetime |
|---|---|---|
| `pfc.control.v1.project.<id>` | one whole building copy | dropped at ten buildings, or when the building finishes |
| `pfc.control.v1.projects` | the Buildings list answer, the least-recently-opened order | replaced on every list refresh |
| `pfc.control.v1.outbox` | waiting and held jobs | until every job lands or Miguel drops it |
| `pfc.control.v1.chips` | needed lines from **dropped** buildings only | capped at 20 per group |

- **Storage is `localStorage`.** `sessionStorage` is out: it dies with the page
  session, and Apple publishes no timer for when iOS ends a backgrounded web app
  window. `Store` in `common.js` (lines 285-343) is rewritten, not reconfigured.
- **One key per building, not one key holding everything.** `localStorage` reads
  and writes a key whole, so one big key would rewrite a megabyte every time one
  status changed.
- IndexedDB was considered and rejected for 0.2. Every read is asynchronous, so
  every screen would have to handle the wait, and every wait is a place a screen
  can go blank. One building is about 100 KB against a ~5 MB cap.
- **A storage key is an identifier, not a label.** Name each one once and never
  rename it. Renaming orphans what is already on a crew phone.
- **There is no migration step, and nobody should write one.** The 0.1 store sits
  in `sessionStorage`, so it is already gone. That is lucky rather than planned.

### 3.2 The outbox — a keyed shelf, not a line-up

- **One item job, keyed `projectId|unitKey|itemKey`. One record job, keyed by the
  record id.** One key holds one job.
- **Change the same thing twice before it sends and the second job replaces the
  first.** Only the final value reaches the Sheet. This works because every job
  carries the final value.
- **Retry runs on a backoff: at once, then 5s, 15s, 1m, then every 5 minutes.**
  The timer runs **only while jobs wait, and stops dead when the outbox empties**.
  A drain also runs on app open, on pull down, and when the phone reports signal
  is back. This deliberately breaks `03`'s no-timer rule, because it finishes work
  already asked for rather than polling for news. The `online` event is not
  trustworthy on iOS, so the timer is the safety net under it.
- **A failed edit is held, never dropped.** `retry: false` holds at once. An
  unnamed error retries and holds after **10 tries**, about 30 minutes. **Only
  Miguel deletes a job, by tapping Drop.**
- **A waiting edit paints the screen. A held edit does not.** A held edit shows
  what the Sheet holds, and lives only in the Outbox. Otherwise a floor could read
  `18/18 Complete` off an edit that will never land.
- The same rule applies to a record, and so to the flags: a **waiting** record
  counts toward its flag right away, a **held** record stops counting.
- **Retap replaces a held edit.** The held job is gone, the new value goes on the
  shelf as a fresh waiting job with its try count at zero. Retrying by hand is
  therefore never strictly needed.
- **A fresh copy can never overwrite an unsent edit.** The building copy and the
  outbox are separate keys. A fetch replaces the building copy only. Painting
  happens on the way to the screen, the way `applyItemOverrides` already works. A
  job's paint is removed when, and only when, the server answers `ok:true`.
- **A drain runs before the refresh fetch on app open.** Send first, then ask.

**PLAN CALL 1 — `save-batch` down the JSONP fallback.**
`apiUrlFor` (`common.js:176`) puts the whole payload in the address. A browser and
Apps Script both stop accepting an address near 8,000 characters, and a long
address **fails silently**. The fallback is used on exactly the networks that
block a POST reply, so a large drain could fail there with no useful message.
**This is the only finding in the whole map that can lose a person's work.**

The rule:

1. `save-batch` always tries the POST path first.
2. If `apiCall` falls back to JSONP, drain in **slices of 5 jobs**.
3. Before a slice is sent, measure the built address. **If it is over 6,000
   characters, halve the slice and measure again.**
4. A **single** job that still will not fit is held at once with
   `retry: false` and the reason `This edit is too large to send on this network.`
   It is never dropped, and it sends normally the next time a POST works.

### 3.3 The local copy

- **The phone keeps ten buildings.** Open an eleventh and the least recently
  opened is deleted. A deleted copy is only a copy.
- **An archived building is dropped as well, ahead of the ten limit.** The drop
  runs on app open, with the refresh.
- **`04`'s exemption wins over both. A building holding a waiting or held edit is
  never dropped**, archived or not.
- **Leaving the Tracking list and dropping the local copy are two separate
  tests.** They sound identical and they are not. Leaving the list is what the app
  **draws** (section 5.2). Dropping the copy is what the phone **stores**. Keep
  them as two tests in the code.
- **Immediately before a building copy is deleted, fold its needed lines into the
  chip history** (section 3.5), in the same step, whichever rule dropped it.

Refreshes:

| Event | Calls |
|---|---|
| Open the app | 1 — the building list only |
| Open a building | 1 — that building, whole |
| Pull down | 1 — force a refresh of what is on screen |
| Idle, app open | 0 |

**No timer, and no staleness clock.** A stored copy draws **instantly** under a
thin moving bar. A spinner survives only where no copy exists — a first ever open,
or a building the phone dropped. The app warns only when a fetch **fails**, and
then it shows when the copy was last updated: `Offline. Last updated Tue 2:14 PM.`
With no copy and no signal: `No copy on this phone. Connect and open it once.`

**The demo buildings are deleted** — `demoUnitStatus`, `demoItemStatus`,
`demoItemDetails` and the four demo builders, about 200 lines at
`common.js:376-575`, plus `demoBannerHtml` at 683. Invented statuses beside real
ones are a trap. See section 5.2 for the error branch this exposes.

### 3.4 The rollup — one function, written once

`ROLLUP_ORDER` and `worst()` are **deleted** from `common.js` (lines 38-68).
Worst-wins made a unit with 17 items Complete and 1 Not Started read
**Not Started**, which hid a nearly finished unit.

One new function replaces them. It takes a list of items plus the open records
below them, and returns the status, the count and **both** flag counts together.
**Every screen calls it. Nothing recomputes a rollup itself.**

For any group — a phase, a unit, a floor, a building — count `n` items, `c`
Complete, `s` Not Started, `f` open flags below the group. Read the tests in
order, first match wins:

| Test | Reads |
|---|---|
| `n = 0` | a dash |
| `c = n` and `f = 0` | **Complete** |
| `c = n` and `f > 0` | **In Progress** |
| `s = n` | **Not Started** |
| anything else | **In Progress** |

- **An open flag blocks Complete. It never raises Not Started.** A unit with
  nothing done and one Waiting record reads `Not Started` with a blue flag.
- **A flag blocks Complete on an item too.** The Progress dropdown does not offer
  Complete while an open flag of either kind sits on that item.
- **Store what is set. Display what is true.** The Sheet holds whatever a person
  last set by hand and it never changes on its own. The app **displays** that
  value with one downgrade: **Complete displays as In Progress while an open flag
  sits on the item.** Fix the last record and Complete comes back by itself. No
  extra column, no stored state, and **no automatic write**.
- Because a flagged item can never read Complete, the rollup's `f > 0` test only
  has to catch **phase-level Waiting records**.

What the count counts, one level down: a phase counts its items, a unit counts its
items across every phase, a floor counts its **units**, a building counts its
**units**.

`pillHtml` (`common.js:611`) takes a single status string today. It now takes the
object this function returns. Every call site changes with it: `common.js:371`,
`building.html:94`, `unit.html:98` and `unit.html:308`. That is the whole blast
radius on the phone once the demo builders are gone.

### 3.5 The needed-line chips

**No seed list ships anywhere** — not in `common.js`, not in `_Config`, not in the
template. Chips are built from records across **every building on the phone**, so
a new job inherits the vocabulary on day one.

- **The group key is Type · item · subtype.** A Deficiency line is a door size and
  a Waiting line is a trade, so Type splits the pool. About 60 groups. An item
  that defines no subtype groups on Type and item. **A phase-level Waiting record
  has no item and groups on Type and phase.** A typed `Other` subtype lands in one
  `Other` bucket per item, whatever was typed, so the group count stays bounded.
- **The chip row shows one group only, three chips.** Ordered **most used first,
  ties to the newest record**.
- **One record is one use. The `quantity` column is ignored.** Otherwise one big
  order pins a size to the front of the row forever.
- Which records feed a chip: **Open yes, Fixed yes, Cancelled never**, a waiting
  outbox record yes, a held one no.
- **Cancelling the record is the whole deletion answer.** No delete button and no
  per-chip hide list is built anywhere. A typo enters the pool through a record,
  so cancelling that record takes it back out.
- **Two sources that never overlap.** A building still on the phone is counted
  **live, from scratch, every time**. A building the phone has dropped is read
  from the history index. **A live building is never written into the index.**
  That is what makes Cancel exact.
- **The history index** holds, per row: item, subtype, type, needed line, use
  count, last used. No unit, no reason, no other dates. **20 lines per group**,
  pruned **least used first, ties to the oldest last-used**.
- **One expiry rule above the cap:** a line goes early when it is unused for **12
  months and** was used **fewer than three times**. Both tests, not either. A line
  used forty times never decays.
- **On a re-download, a building's lines are in both places. Take the larger of
  the live count and the history count. Never add them.** This affects chip order
  only, never chip content.
- **One normalising function, written once and used twice** — by the chip filter
  and by the near-match prompt. **Strip every space, quote mark and slash, then
  lowercase, then compare for an exact match.** Not an edit distance: `32 6 LH`
  and `32 6 RH` are one character apart and are two different doors.

```
typed   32 6 RH    ->  326rh
stored  32" 6" RH  ->  326rh      MATCH
```

- **The near-match prompt fires on Save, not while typing**, with two buttons,
  `Use it` and `Keep mine`. Either one then saves. It compares inside the current
  group only, so it can only ever offer a line the chip row would have offered. If
  two lines match, offer the most used.
- **Tap a chip and the stored line is saved, punctuation and all.** You type
  loose and store clean.
- **The standard needed line is `32 6 RH`, with no inch marks.** This is content,
  not code. The box is free text either way.

---

## 4. The marks — three facts, three shapes

Shape carries the meaning before colour does, because shape survives bright sun
and colour blindness.

| Shape | Means | Colour |
|---|---|---|
| Round dot | Progress | grey, amber, green |
| Flag glyph | a flag on site | red Deficiency, blue Waiting |
| Corner badge with `!` | the phone could not save | red, hanging off the chip's top right corner, outside the chip |

**This is the red-on-red answer.** Neither red moved. A failed save and a
Deficiency never share a shape and never share a place.

**The bar, not the fraction, above the Unit screen.** A hairline bar on the bottom
edge of a unit chip and of a floor header, coloured by Progress. **A unit with
nothing started draws no bar at all**, not an empty track. The exact fraction
stays on the Unit screen, where you look at items one at a time.

**Every count above the Unit screen is units, not items.** A floor reads
`12 units · 5 done`, never `148/216 items`.

**A header reports what it hides.**

| Floor is | The header carries |
|---|---|
| Closed | label, bar, count, status pill, **both flag counts, the not-saved chip** |
| Open | label, bar, count, status pill. Nothing else. |

The count, the bar and the status pill stay either way — you cannot work those out
by eye from twelve chips. A flag count you can, because the flagged chips are
right in front of you. **Only one floor is open at a time**, so at most one header
ever drops its marks. **The rule does not fire on the Unit screen**, where phases
never collapse. **A flat project draws no floor header at all**
(`building.html:73`), so it hides nothing and needs no extra rule.

**The unit chip carries both flag kinds and no numbers.** This narrows `11` at the
chip and nowhere else. A chip carries at most four marks — dot, red flag, blue
flag, corner badge — and that is the ceiling, not a target.

The floor header layout is two lines, or three when there is a problem:

```
Floor 3                              ● In Progress   ⌄
▬░░░░░  12 units · 0 done
⚑1   ⚑2   ! 1 not saved
```

**The marks get a line of their own.** Left to trail the count they break in a
different place on every floor, which reads as a mistake. A closed floor with
nothing wrong never draws the third line. **The Tracking row takes the same shape,
and always shows its marks, because a Tracking row never opens.**

---

## 5. The screens, file by file

### 5.1 `control/shared/common.js` — the file 0.2 rewrites

753 lines. About 200 are deleted outright.

| Change | Where |
|---|---|
| `STATUS` and `CYCLE` drop to three values; `deficiency` and `on_hold` move to a separate flag map | 38-68 |
| `ROLLUP_ORDER` and `worst()` deleted, replaced by the counted function in 3.4 | 38-68 |
| `on_hold` renamed `waiting` **throughout** | this file, `theme.css`, `building.html`, `unit.html` |
| `Store` rewritten: `localStorage`, four keys, per section 3.1 | 285-343 |
| Demo buildings deleted | 376-575, 683 |
| `applyUnitOverrides` / `applyItemOverrides` rewritten: a waiting edit paints, a held edit does not | 347, 359 |
| `localOnlyNote()` deleted — 0.2 saves for real | 694 |
| `pillHtml` takes the rollup object, not a status string | 611 |
| `DEFAULT_PHASES` becomes the fourteen-item list, with the default lists beside it | 78 |
| The Waiting reason list, as a constant | new |
| The normalising function for chips and near-match | new |
| The outbox, the drain, the backoff | new |
| The chip pool and the history index | new |

`apiCall` (117-172) **survives as written**. It never throws, it answers
`{ok:true,data}` or `{ok:false,reason,detail}` with five named reasons, it has a
twelve second timeout and a JSONP fallback. `save-batch`'s per-job results are a
layer **above** it. This is the best news in the file. `reasonText` (656) keeps
working and gains whatever new reasons `save-batch` returns. `registerWorker()`
(711) already carries the right comment and needs nothing.

### 5.2 `control/tracker/index.html` — Buildings

83 lines. The header already reads `Buildings`, per the 0.1.1 decision. **Do not
"fix" that** — Tracking is the section, Buildings is this screen.

- Draw from `pfc.control.v1.projects` first, then refresh.
- **The sync bar** from section 5.5, and the **install nudge** from 5.8.
- **Pull to refresh.**
- The row takes the marks of section 4: bar, `48 units · 13 done`, both flag
  chips, the not-saved chip, the status pill. Its marks always show.
- Apply the rollup rule of 3.4 to the **five** numbers `list-projects` sends.
  **AMENDED A1** — the fifth is `unitsNotStarted`, and the rule needs it.

**The four-step order of tests for drawing a row. First match wins:**

1. The phone holds a waiting or held edit for it → draw a normal row.
2. It reads Complete **and** was already Complete on this session's first list
   answer → **do not draw it**.
3. It reads Complete and went Complete **during this session** → draw a **greyed**
   row, 45% opacity with a `FINISHED` tag. Its green bar and Complete pill grey
   out with it.
4. Otherwise → draw a normal row.

**The phone remembers, for the session only, which buildings it watched go
Complete.** Not stored, not synced, gone when the app closes. It is what keeps the
greyed row on screen until the next app open, which is also when the local copy is
dropped — so the row is always tappable for as long as it is drawn.

**A second empty message.** `emptyHtml()` at line 74 has one state today, and it
is wrong once buildings exist and every one of them reads Complete — it reads as
data loss. The list answer already tells the two cases apart: it either came back
empty, or came back holding buildings that all read Complete.

| Case | What the screen says |
|---|---|
| No buildings exist | **No projects yet.** Create your first building. Every project gets its own Google Sheet. |
| Buildings exist, all finished | **Nothing to track.** Every building is finished. Open the project Sheet to read one. |

Both keep the `Create Job` button.

**A greyed `Finished` section at the bottom of Tracking was offered and Miguel
turned it down.** It buys back the missing door, and that is the problem — it is
the Archive window in a smaller coat, already ruled out of 0.2.

**This screen has no error branch at all today.** `loadProjects()` at
`common.js:226` swallows every failure and returns demo buildings, so the screen
never had to handle one. Deleting the demo data exposes that. **Add the branch.**
Copy `building.html:52` and `unit.html:61`, which both handle
`result.source === 'error'`.

### 5.3 `control/tracker/building.html` — Floors and unit chips

130 lines.

- **`floorHtml` at line 82 is rewritten.** `pillHtml(worst(statuses),'sm')` goes.
  The header gains the bar, the units count, both flag chips and the not-saved
  chip, and **the last three are drawn only while the floor is closed**.
- **`chipsHtml` at line 102 is rewritten.** The chip gains the marks row and the
  bar. **Its `aria-label` must say every fact the marks say** — status, count,
  each flag kind and the failed save — or the marks are decoration to a screen
  reader.
- The demo banner at line 66 goes.
- **The header flash.** Line 25 ships the literal word `Building` inside
  `<h1 id="title">`, and line 58 replaces it when the data lands. Pass the name
  through from the Buildings list, which already knows it, or leave the
  placeholder empty. **A blank header for a moment reads as loading. A wrong word
  reads as a label.** The local copy does not fix this on its own — a first open,
  a dropped building and a fresh install all still fetch.

### 5.4 `control/tracker/unit.html` — the heaviest rewrite

320 lines, roughly half changed.

> **AMENDED A2, 2026-08-08 — the Details box was deleted in STEP 2**, not
> here. Step 1 took its column out of the Sheet, so by step 2 `get-project`
> sent no `details` key and the box had nothing to read. Everything else in
> this section is still step 3 and step 4 work.

**Deleted — the Details box, in eight places:** the editor markup (123-136), the
Details button (142-144), the read-only line (158), `toggleDetails` (217),
`typeDetails` (238), `closeDetails` (246), `cancelDetails` (253), and the
`editorFrom` / `openEditor` variables (50, 51). **Deleted with the demo data:**
`isMadeUpNote` (314) and the block at 190-196. **Deleted by `05`:**
`localOnlyNote()` at line 82. `Store` call sites at 188, 195, 242, 258, 309 —
three of the five are the Details box and go with it.

**Changed:** the dropdown at line 112 maps `CYCLE`, all five values. It becomes
three. **Complete stays in the list, greyed to 45%, not tappable**, while an open
flag sits on the item, with one line under the panel:

> Fix the open flag first. Then Complete comes back.

**A silently missing row reads as a broken app.** `refreshRollup` (303) takes the
new rule.

**Added:**

- The flag row per item — a red chip for Deficiency, a blue one for Waiting, each
  with its own count.
- **Tap the flag to open the record list.** The item row stays one line. **One
  rule, no exception: a flag is a button and its records stay shut until it is
  tapped.** This includes a phase-level Waiting record on the phase header, which
  sits above seven items and costs more height than any item does.
- A record row reads `Bypass · 32 6 RH  x1  [ Fixed ]`.
- **`Fix all`** on an item that holds more than one open record, and on a phase
  with more than one open Waiting record.
- **A fixed record leaves Tracker**, with one exception for exactly one visit: it
  stays in place, greyed and struck through, with `Fixed · Undo`. Leave the unit
  and it is gone. Without that a mis-tap is unrecoverable on the phone. **Nothing
  moves in the Sheet** — the row keeps its place with `Fixed` and a closed date.
- **The green card.** Fix the last open record on an item and it asks once:
  *Every record on Interior Doors is fixed. Set it to Complete?* with
  `Set Complete` and `Not yet`. **It asks. It never sets by itself.**
- The pending marks of 5.5.

**Every item is always drawn, whatever its Progress.** Complete is a mark on a
row, never a reason to remove the row. The row is the control you set Progress
with, so hiding it takes away the only way to correct a mis-tap. **Do not build a
hide-finished-items option, and do not propose one.**

**Kept and still useful:** `attr()` (165), the close-on-outside-tap listener
(275-286), and `placeOpenMenu` (205), which flips a dropdown upward when it would
run off the bottom of the screen. That one **matters more in 0.2**, because the
panel grows a reason line.

### 5.5 The pending state — two mechanisms, split by screen

| Screen | What carries it |
|---|---|
| Unit | marks on the item, the phase and the unit pill. A failed edit opens a red card under the item. |
| Building, Tracking | one sync bar. No marks in the tree, except a held edit. |

On Unit you look at seven items, so a mark per item points straight at what you
tapped. On Building you look at 48 chips, so a mark per chip is noise.

- **The waiting mark** is a small turning ring, 13px, in the accent colour,
  between the item name and the status control. No words. The item already shows
  the tapped value. The same ring at 10px marks the phase header and the unit pill.
- **The sync bar** is one line under the header. It appears only when the outbox
  holds something:

| State | Reads | Look |
|---|---|---|
| Sending | `Saving 3 edits…` with a turning ring | accent |
| No signal | `Offline · 3 edits wait` with a grey slab | plain |
| All failed | `2 edits did not save` with a red dot | red |

Both together read `Saving 3 edits… · 2 failed`. **The count lives in the bar and
nowhere else.** No badge on the Hub, no count in the tree.

- **The bar rides on every screen, Unit included.** On Unit a failure is therefore
  said twice, once in the bar and once in the fix card. That is the price of the
  thing it buys: standing in unit 204, an edit that failed in unit 201 has no
  other way to reach you.
- **A landed edit says nothing.** The ring stops, the bar goes. No "Saved" flash
  and no permanent "All saved" strip.
- **A failed edit on Unit:** the item **snaps back to what the Sheet holds** and
  its name greys out. A red dot sits where the ring was. Under it a red card holds
  three things — why it failed in plain words, what was lost
  (`You tapped Complete. The Sheet still says Not Started.`), and two buttons,
  **Try again** and **Drop the edit**.
- **A held edit puts a corner badge on its unit chip and on the floor header.** A
  waiting edit marks nothing above the Unit screen.

### 5.6 The Outbox — new window

Reached from the sync bar's right edge, which reads `Outbox ›`. It lists every
job, waiting and held, each naming its unit and its item, with **Retry** and
**Drop** on the held ones.

**This window earns its place under the one-window-per-MINOR guideline**, and the
argument was had. `04` ruled that only Miguel drops a held edit. That needs a
screen with a Drop button on it. There is no version of 0.2 that obeys `04` and
has no Outbox.

**PLAN CALL 2 — an Outbox row does not tap through to its unit in 0.2.** `05` left
this open. The row names the unit and the item, which is enough to walk there, and
a tap-through has to decide what happens to the Outbox screen behind it. Build the
list. Add the tap-through when somebody asks for it.

### 5.7 Logger — new window

The Hub gains a `Log` card. **Logger is a form, not a second tree.** The place is
set once at the top and the record fields under it clear after each save.
**Logger writes records only.** Progress and marking a record Fixed both stay in
Tracker.

**Field order, top to bottom: Type, Item, Subtype, Needed, Count, Reason, Save.**

- **Type** — two buttons, `Deficiency` and `Waiting`, above everything else,
  because the two reason lists share no value. **It holds for the visit and resets
  when the place changes.** Four backordered locksets in one room cost one tap.
- **Item** — when Type is Waiting, its **first row** is
  `Whole phase — Doors & Windows`. There is no separate "attaches to" control.
- **Subtype** — drawn **only** on an item that defines types. Four items do:
  Interior Doors, Exterior Door(s), Handles, Stops. The list ends with `Other`,
  which opens a text box.
- **Needed** — the hero field, the only one at full height. Miguel's words: "the
  important part is what replacement is needed." Its grey placeholder is the
  item's `hint`, `Size   Jamb   Swing`, **inside** the empty box. The three chips
  sit under it, filtered as you type.
- **Count** — minus and plus buttons, starting at **1**. It stays above Reason.
  The count belongs beside the line it counts.
- **Reason** — the building's eight, minus this item's trim. It no longer follows
  the phase.

**Where every dropdown gets its list.** None of them is ever a fixed list in code.

| Control | Source |
|---|---|
| Building | the buildings the phone holds |
| Unit | a **text box**, matched against the unit labels in the local copy |
| Phase | the phases the project holds |
| Item | the items **that phase** holds |
| Subtype | the `types` that item defines, or no dropdown at all |
| Reason | the building's `reasons`, minus that item's `trim` |

**The unit box never assumes the first digit is the floor.** Harbour View numbers
its units A1 and A2, and the local copy already holds the true answer. It shows
the floor it found under the box. No match reads
`No unit 201 in this building.`

**The place bar is two lines**, `1500 Main St · 204` over `Doors & Windows ·
Floor 2`. One line wrapped, and the wrap pushed the whole form down a row.
`[change]` opens a sheet from the bottom holding Building, Unit and Phase
together. The unit box matches typed text against the unit labels in the local
copy, and **never assumes the first digit is the floor** — Harbour View numbers
its units A1 and A2.

**The phone remembers the building and the phase. It never remembers the unit.** A
building lasts weeks and a phase lasts days. The unit changes every few minutes,
and a wrong unit writes a real door against the wrong door. Opening Logger cold
shows `1500 Main St · ____` with `set unit`, and **the form stays greyed until the
unit is set.**

**After a save, Logger stays put.** Building, Unit and Phase stay filled. Only the
record fields clear. A short strip confirms the save — `✓ Saved · waiting to
send` — and a `[ Log another item ]` button sits under the list.

```
─────────────────────────
 ✓ Saved · waiting to send
─────────────────────────
 1500 Main St · 204
 Doors & Windows · Floor 2

 Logged here:
  · Bypass · 32 6 RH   x1  ⏳
  · Regular · 30 4 LH  x1  ✓

   [  Log another item  ]
```

Four problems in one room means four saves and no walk back through Building and
Unit. **Jumping to the unit in Tracker after a save was rejected** — it confirms
the save and then puts the person in the wrong place for the next one.

**The "Logged here" list** carries a **Cancel** button on every row, always
visible, and each row's send state — a turning ring on its way, a grey slab
offline, a tick when it lands. **This list can Cancel a record and can never mark
one Fixed.** Cancel undoes a typo made ten seconds ago. Fixing is a repair and
belongs to Tracker. The list is also where a typo is caught before the person
leaves the room.

**PLAN CALL 3 — pin Save to the bottom of the screen. ANSWERED by Miguel on
2026-08-09: pin it.** `06` measured six controls as the budget before Save falls
under the keyboard. `17` took the form to seven, and `13` made the worst case
**nine** — Type, Item, Subtype, Subtype-Other, Needed, Count, Reason,
Reason-Other, Save — when both `Other` boxes are open at once. Pinning Save frees
the form to grow.

Save sits in a bar fixed to the bottom of the screen. The form scrolls behind it.
Save is reachable at every scroll position and at every form length.

**The second option was offered and not taken.** Putting Subtype and Count on one
row and collapsing the place bar was the fallback if Miguel disliked the pinned
bar. He chose the pinned bar with the form left as section 5.7 lists it, one
control per row. **Do not compress the form to save height.** If height is short
later, the pinned bar is the thing that pays for it, not the row spacing.

**The pinned bar must survive the iOS keyboard.** `position: fixed` on iOS Safari
does not track the software keyboard — the bar can end up under the keyboard or
floating in the middle of the screen. Size the bar off `window.visualViewport`
(its `resize` and `scroll` events give the height the keyboard leaves behind)
rather than off `100vh` or `position: fixed` alone. **Look at it on a phone with
the Needed box focused before the screen is called done.**

### 5.8 `control/index.html` — the Hub

One array, `CARDS`, at line 90. Five cards become **seven**: Tracking, **Log**,
Create Job, Deficiencies (greyed), Materials (greyed), Reports (greyed),
**Archive (greyed)**.

The greyed `Archive` card is the seam the 0.3 Archive window lands on.

**The grid is two across, so seven leaves one card alone on the last row.** It is
cosmetic. Look at it on a phone before it ships.

### 5.9 `control/shared/theme.css`

656 lines. Lines 74-78 define five status classes.

- `.s-deficiency` and `.s-on_hold` **stop being statuses**. Their colours stay
  useful as the flag red and blue.
- **`.s-on_hold` is renamed `.s-waiting`.** A CSS class name is free to change,
  unlike a storage key.
- New classes for the flag glyph, the marks row, the corner badge, the flag chips
  and the two bars. **Do not put these colours in the HTML files.**

### 5.10 `control/admin/index.html`

548 lines, in two halves: the create form (111-344) and the edit block (347-540).
Admin **stays one page**. A card inside an existing screen is not a window.

- **A fifth card, `Lists`,** in the edit block. It holds the building reason list
  with `+ Add a reason`, then one item dropdown, then that item's subtype list
  with `+ Add a subtype`, its reason trim as checkboxes, and its `hint` text box.
  **One item dropdown serves all three item-level lists** — two cards would make
  you pick the item twice to set up one item.
- **A sixth card, `Rename an item`.** Copies the Rename a unit card at line 449.
- **The refusal panel on Remove an item:**

```
Can not remove Interior Doors.
It holds 12 open records across 9 units.

[ Cancel all 12 records ]

Then remove the item again.
```

  No record list and no per-record choice. Removing an item means PFC is not doing
  that work, so every open record on it is **Cancelled**, not Fixed. **It is two
  steps** — Cancel all does not remove the item, you press Remove again
  afterwards. **Cancel all asks once first:** `Cancel 12 records?`
  `[ Yes, cancel 12 ]` `[ Back ]`. There is no Undo for a bulk cancel, so the
  confirm is the only friction there is.
- The demo filter at line 369 goes with the demo data.
- **The note at line 437 says "The item loses its Status and Details columns."**
  There is no Details column after this release. One-line fix.

### 5.11 `control/sw.js`

- Add the **Logger** and **Outbox** screens to `SHELL` at line 18.
- **Raise `CACHE_NAME` at line 15 to `pfc-control-0.2`.** See section 9.
- Nothing else. The `activate` handler already deletes every cache whose name is
  not the current one, at lines 53-63. **0.2's data lives in `localStorage`, which
  a Service Worker never touches**, and that is exactly what keeps the outbox safe
  across an update.

---

## 6. The build order, and what to test after each step

Six steps. Each one ends somewhere you can stop.

### Step 1 — the Sheet and the server foundations

`Code.js` and `common.js` defaults. No screen work.

`DEFAULT_PHASES` to fourteen items with the default lists beside it · `_Config`
version 2 · the Deficiencies tab in `handleCreateProject` · the Details column out
of `computeLayout` and its four readers · the layout comment at 636 rewritten ·
three status values in `STATUS_VALUES`, `STATUS_FILLS`, `STATUS_KEYS` ·
`buildRollupFormula` to the count rule · `rebuildDashboard` five columns wide ·
`worst()` and `ROLLUP_ORDER` deleted from the server · the `update-item` comment
block replaced.

**Test:** create a fresh project from Admin. Open the Sheet by hand. Check 21
columns on the Tracker tab, the Deficiencies tab with its header row frozen and
filtered, a three-value dropdown, three fills, and a five-column Dashboard. Set
some statuses by hand and confirm the rollup column reads by the new rule. Trash
the old test Sheets.

### Step 2 — the local copy and the read-only screens

`get-project` · `Store` rewritten to `localStorage` · the demo data deleted · the
rollup function and `pillHtml` · the marks of section 4 on `building.html` and
`tracker/index.html` · `list-projects` sending five numbers (**A1**) · the error
branch on Buildings · the two empty messages · the four-step Tracking order ·
pull to refresh · the header flash · the Details box, with its column (**A2**).

**Test:** open a building, then turn the phone to airplane mode and open it again.
It must draw instantly from the copy. Delete the copy in the browser tools and
open it offline — you must get `No copy on this phone. Connect and open it once.`,
not a blank screen. Break the backend URL and confirm Buildings shows an error and
not an empty list. Check a floor header's marks appear when it is closed and go
when it is open.

### Step 3 — saving, the outbox and the pending state

`save-batch` on the server, with the cache line · the outbox, the shelf key, the
backoff and the hold rules · painting rules · the sync bar · the Unit marks and
the red card · the Outbox window · the three-value dropdown with the greyed
Complete.

**Test:** tap a status with signal, and watch the ring and the bar go. Tap four
statuses in airplane mode, close the app, open it, and confirm they are still
there and drain. Force a `retry:false` — remove an item in Admin and then save
against it — and confirm the item snaps back, greys, and shows the red card, and
that the job is in the Outbox with Retry and Drop. Confirm a held edit is **not**
counted in any rollup. **Then test the JSONP slicing rule of PLAN CALL 1 with 40
queued jobs.**

### Step 4 — records, Logger and the chips

Records in the `get-project` payload · the Logger window · the flag chips, the
tap-to-open record list, `Fix all`, the greyed `Fixed · Undo` row and the green
card on Unit · the chip pool, the history index, the fold-before-delete and the
near-match prompt.

**Test:** log a deficiency from Logger with no signal, and confirm the flag
appears on Tracker before it lands. Confirm Complete is greyed on that item, and
comes back by itself when the last record is fixed. Confirm a record on a
**already Complete** item makes the item display In Progress without writing
anything. Log the same needed line three times and confirm the chip appears and
orders correctly. Cancel a record and confirm its chip goes. Open eleven buildings
and confirm the eleventh drops the oldest **and** that its lines survive as chips.

### Step 5 — Admin

`rename-item` · the three list branches that skip the rebuild ·
`cancel-item-records` · the `remove-item` refusal check · the Lists card, the
Rename card, the refusal panel, and the line 437 note.

**Test:** add a subtype and confirm the Tracker tab is **not** rebuilt and no
status value moves. Rename an item and confirm every record still points at it.
Try to remove an item holding open records, run Cancel all, and confirm the second
Remove works. Confirm a custom item offers all eight reasons and shows no subtype
dropdown.

### Step 6 — the finish

The seven Hub cards including greyed Archive · the install nudge · `sw.js` SHELL
and `CACHE_NAME` · `on_hold` renamed `waiting` everywhere · the theme classes ·
a read of every comment this release made wrong.

**Test:** install the app fresh on a phone. Confirm the nudge does **not** show.
Open it in a Safari tab and confirm it does, once. Walk one real unit end to end
with the phone in airplane mode for part of it.

---

## 7. The install nudge

**One signal only: installed or not**, checked with `display-mode: standalone`.

- Installed shows nothing. No change from today.
- Not installed shows a small dismissible note, **once per tab-mode open** and not
  repeated on every screen inside that visit. It says offline saving may not work
  right in a browser tab, and it gives the steps: **Share icon → Add to Home
  Screen.**
- **No separate handling for the tab/installed data split.** Data written in a tab
  is invisible to the installed app, so a person who edits in both sees two sets
  of waiting edits. The fix for that and the fix this section needed are the same
  action: install it. The nudge covers both.
- `navigator.storage.persist()` runs silently in the background either way.
  **There is no warning when it is refused**, because there is nothing the crew can
  do about a refusal.

Install is the line between safe storage and storage that disappears: iOS wipes
stored data after 7 days without interaction, and WebKit exempts an installed home
screen app. Miguel and his coworker are already installed, so this is a safety net.

---

## 8. The seams 0.2 must leave open

None of these costs 0.2 any work. Each one is destroyed by a later session
tidying up.

### For Google login and crew access (0.3)

- **No author column anywhere**, and no identity on a job. Adding one later is a
  column and a field, not a redesign.
- **The lock is still a script lock.** A per-project lock is 0.3 work. Do not
  change it now — `07` confirmed the existing handling is correct.
- **Keep the `respond` shape and the five named `apiCall` reasons.** An auth
  failure becomes a sixth reason with `retry:false`.
- Logger's memory of the building and the phase is phone-local and needs no
  sign-in. **Sign-in only matters later, for carrying that memory between phones.**

### For the Archive window (0.3)

1. **`list-projects` keeps returning every building, finished or not.** The
   finished test lives in the drawing layer. Never move it into the server answer
   as an optimisation.
2. **`get-project` keeps returning every record state.** Do not add a state filter
   later to trim the payload.
3. **The history index row shape holds item, subtype, type, needed, count and
   last used.** That is enough to be re-fed from a server source without changing
   shape.
4. **The history index stays its own store**, so a future version can refill it
   without touching the building copies or the outbox.
5. **The greyed `Archive` card on the Hub.**
6. **A dropped local copy must be able to come back on demand.**

The rule behind all six, in Miguel's words: **the server keeps answering with
everything, and the phone does the hiding.**

---

## 9. The release

- **Raise `CACHE_NAME` in `control/sw.js` to `pfc-control-0.2`.** Phones keep
  serving old files until it changes. This is the step that is easiest to forget
  and the one that makes the release invisible if it is missed.
- Update `CLAUDE.md`: current version, the status model section, and the note that
  `STATUS`, `CYCLE`, `ROLLUP_ORDER` and `buildRollupFormula` still hold the old
  model.
- **A build step that stamps the version automatically would earn its place.** It
  is a known candidate in `CLAUDE.md`. Propose it; do not add it quietly.

---

## 10. Known ceilings, not fixed in 0.2

Written down so they are not discovered on site.

- **`handleListProjects` opens every project Sheet on a cold cache.** Lines
  175-217: `SpreadsheetApp.openById` plus two range reads per building, cached 60
  seconds. The map's stated scale is **up to about 50 buildings over the life of
  the tool**. With two test projects nobody notices. **At around forty it is a real
  wait on every cold cache, and the crew hits it on app open**, because the list
  refreshes there. **Do not fix it in 0.2.** Two cheap answers exist for later:
  keep a small index file instead of opening every Sheet, or raise the cache and
  refresh it in the background.
- **A 60px bar cannot tell `15/18` from `16/18`.** Accepted on purpose. The chip
  is a target — tap it and the Unit screen gives the exact number.
- **0.2 has no on-site history.** A fixed record leaves the phone when you leave
  the unit, and is readable only by filtering the state column in the Deficiencies
  tab, on a computer. The crew does not use the app until 0.4 or 0.5, so nobody
  pays for it yet. **The one thing 0.2 must not get wrong is that the record really
  is marked Fixed in the Sheet.**
- **0.2 has no door onto a finished building.** It leaves the Tracking list and
  the copy is dropped. Open the project Sheet in Drive to read one. Archive is 0.3.
- **An abandoned job never leaves the Tracking list.** A job cancelled at 60% never
  reads Complete, so its row stays. It grows one dead row per abandoned job, and
  one or two buildings are live at a time.
- **A brand new phone has no chips at all.** The history index is `localStorage`,
  and there is no seed behind it. The first `get-project` after an install pulls a
  live building whole, records included, so the chips fill from the server. The
  empty case is a genuinely new phone opening a genuinely new job.
- **Passage and Privacy now share one status row.** Progress got coarser so that
  logging could get finer. Miguel was shown this before he chose it.

---

## 11. Already rejected. Do not rebuild these

Every line here was proposed, argued and turned down. They are collected because
each one is the obvious idea a build session has at exactly the moment it reaches
that code. **The reasoning is in the ticket named. Do not re-argue one without
reading it first.**

### The screens

| Rejected | Why | Ticket |
|---|---|---|
| Hiding a Complete item on the Unit screen | The row is the control you set Progress with. Hide it and a mis-tap cannot be undone. **Miguel closed this branch as a rule.** | `14` |
| A greyed `Finished` section on Tracking | The Archive window in a smaller coat | `14` |
| A line reading `3 finished buildings are not shown` | It cannot say which building, so it does not shorten the fix. 0.3 lists them by name | `18` |
| A force-close switch in Admin | A stored flag can disagree with the numbers, and 0.2 has no door to find a wrongly hidden building in | `14` |
| Tap-to-cycle on the status control | It is a dropdown, as it is today | `05` |
| Removing the Complete row while a flag is open | A silently missing row reads as a broken app. Grey it with a reason | `05` |
| An always-open record list under an item | Three records push the next item down ~150px | `06` |
| A prompt when the dropdown moves to Complete | **Impossible, not rejected.** Complete is untappable while a flag is open | `06` |
| A grey tick chip keeping fixed records on the item forever | Puts a chip on every item ever worked | `06` |
| A Unit screen with no sync bar | A failure in another unit would have no way to reach you | `05` |
| A "Saved" flash, or a permanent "All saved" strip | It costs a band of screen to say nothing is happening | `05` |
| A badge on the Hub, or a waiting count in the tree | The count lives in the sync bar and nowhere else | `05` |
| Logger as a second drill-down tree | "I do not need to see Baseboards, Windows and Hardware when I want to log a door" | `12` |
| Logger one step per screen, or one long scrolling page | Seven screens per record; or the keyboard covers Save | `12` |
| Jumping to Tracker after a Logger save | Wrong place for the next entry | `12` |
| Logger setting Progress | Eighteen items would mean eighteen runs of a form | `12` |
| The `Deficiencies` Hub card turned on | Records are visible in two places already. It stays greyed | `12` |

### The data and the lists

| Rejected | Why | Ticket |
|---|---|---|
| Structured per-item fields on the needed line (Style, Width, Depth, Swing) | Taps on every entry, Admin work per item. **`17` took back one field, the type, and no more** | `12`, `17` |
| Three per-phase reason lists | Six of the eight reasons apply everywhere | `17` |
| Per-item reason list **copies** | "Add a reason to everything" becomes eighteen edits | `17` |
| Hardcoding the eight reasons | A change would then cost a release | `17` |
| A Delete button on a reason or subtype list | A row could then point at a value that stopped existing | `17` |
| Folding the subtype into the needed text | 0.5 would be back to matching words | `17` |
| A seed suggestion list | Chips come from every building on the phone, so a new job inherits the vocabulary on day one | `15` |
| Edit-distance fuzzy matching on the needed line | `32 6 LH` and `32 6 RH` are one character apart and are two different doors | `15` |
| A per-subtype hint | Fourteen strings become about thirty, and every new subtype needs one | `15` |
| `get-project` returning open records only | The pool would shrink exactly as the job improved | `15` |
| Adding the live count and the history count | It double-counts. Take the larger | `15` |
| A per-chip delete button or hide list | Cancelling the record is the whole deletion answer | `15` |
| A separate "which one" field naming the physical thing | The needed line identifies it better than a label does | `01` |
| Moving fixed rows to an Archive tab | A move is a write plus a delete and can half-fail | `01` |
| Deleting records along with their item | One misclick would destroy a supplier claim | `02` |
| Leaving open records orphaned and hidden | Two live problems would vanish from every screen | `02` |
| A shared defaults store every new building copies | Hidden state with no screen, and one typo would follow every future job | `13` |
| Naming the records and stopping, on the removal refusal | Twelve records across nine units means opening nine units by hand | `13` |
| Drawing the full record list inside Admin | Ports a Tracker screen into a screen with no unit context | `13` |

### The storage and the queue

| Rejected | Why | Ticket |
|---|---|---|
| IndexedDB | Every read is asynchronous, so every screen gains a wait, against a problem the app does not have | `03` |
| One localStorage key holding everything | One status change would rewrite a megabyte | `03` |
| A staleness clock, or a refresh timer | A fetch that succeeds makes the copy fresh by definition | `03` |
| Refreshing every building on app open | Ten calls, nine for buildings nobody will open | `03` |
| Refreshing the last-opened building beside the list | Wastes a call every time Miguel switches jobs | `03` |
| An outbox line-up, in strict order | It breaks exactly when one call fails and the next succeeds | `04` |
| One field per job | The Sheet would hold half a change | `04` |
| One whole unit per job | It would overwrite a hand edit on an item nobody touched | `04` |
| A flat 30 second retry | A burst on a fixed beat is the pattern most likely to keep losing the lock fight | `04` |
| Holding an edit on its first failure | Driving through a dead zone would turn six taps of work into six taps of housekeeping | `04` |
| Painting a held edit on the screen | A floor could read `18/18 Complete` off an edit that will never land | `04` |
| A separate warning when `persist()` is refused | There is no action the crew can take about a refusal | `10` |
| The server reading the whole Tracker grid for `list-projects` | Same call count, but it puts a **third** copy of the rollup rule in the code | `18` |

### The marks

| Rejected | Why | Ticket |
|---|---|---|
| A plain red dot for a failed save | Two reds of two meanings on one 77px chip | `19` |
| The chip printing `14/18` | Twelve fractions on one floor, on the screen that exists so you do not have to read | `19` |
| An empty progress track on an unstarted unit | An empty track and a missing bar say the same thing | `19` |
| Four chips in the suggestion row | The row wraps at about four, and the wrapped row is the row Save needs | `15` |
| Flag counts on a floor header while the floor is open | The flagged chips are right there in front of you | `19` |
| A blue dot for Waiting | Waiting is a flag, not a status. The dot shows Progress only | `19` |

---

## 12. The four PLAN CALLs, in one place

Everything else in this file comes from a closed ticket. These four were left to
the plan by name.

| # | Call | Where |
|---|---|---|
| 1 | `save-batch` drains in slices of 5 down the JSONP fallback, halving on a 6,000 character address, and a single oversized job holds with `retry:false` | 3.2 |
| 2 | An Outbox row does not tap through to its unit in 0.2 | 5.6 |
| 3 | Save is pinned to the bottom of the Logger form. **ANSWERED 2026-08-09 — pin it.** | 5.7 |
| 4 | The build order in section 6 | 6 |

**PLAN CALL 3 was the only one that needed Miguel. It is closed.** He was shown
the pinned bar against the compressed form and chose the pinned bar, with the
form left one control per row. The fallback is dead — see 5.7. What is left is
mechanical: the bar has to be sized off `visualViewport` so the iOS keyboard does
not bury it, and it wants one look on a phone.
