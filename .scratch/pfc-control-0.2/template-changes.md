# Changes needed in the master template

**Status: each section carries its own.** Rewritten 2026-08-08 by
`18-supersession-sweep`. The old file said "PROVISIONAL, do not start work yet"
across the whole thing, which stopped being true section by section as tickets
closed.

| Section | Status | Waits on |
|---|---|---|
| 1. The Deficiencies tab | **FINAL** | nothing |
| 2. The status column and its dropdown | **FINAL** | nothing |
| 3. The rollup formulas | **FINAL** | nothing |
| 4. Remove the Details column | **FINAL** | nothing |
| 5. The lists held in `_Config` | **draft** | `13-admin-changes` |
| 6. The Dashboard tab | **FINAL** | nothing |
| 7. What is not changing | **FINAL** | nothing |
| 8. Still unknown | — | `13`, `15` |

**This file is not marked FINAL as a whole, and must not be until `13`, `14` and
`15` close.** `18` runs a second pass then. Section 5 is the one that moves.

Template in Drive: `PFC/Master Template/PFC_Master_Template.xlsx`
ID `1QIF5TCJ0iekpNGHEjce1PSoFXRFhucmF-ednTSYHT-M`
Local reference copy: `reference/PFC_Master_Template.xlsx`

No existing project Sheet needs an upgrade. Drive holds test projects only. The
plan changes the template, trashes the test Sheets, and makes the real building
fresh.

**One thing to know before reading.** `handleCreateProject` in
`control/appscript/Code.js` does **not** copy this .xlsx file. It builds every
Sheet in code, because the template is fixed at 36 units and 17 items and every
real project differs. The template is the visual specification. So every change
below is really two changes: the .xlsx, and the code that reproduces it.

---

## 1. A new tab: Deficiencies — FINAL

Settled in `02-deficiencies-tab-layout`, widened to thirteen columns by
`17-reason-list-scope` on 2026-08-08.

One row per record. A record covers a deficiency or a waiting reason. The tab
holds every record together, open and closed. There is no Archive tab. Filter the
state column when you read the tab directly.

One header row. Data starts on row 2. Freeze row 1 and add a filter. This tab is
a plain list, unlike the Unit Tracker tab and its six header rows.

**Thirteen columns.** The header row holds these keys, not labels:

| Col | Name | Holds | Notes |
|---|---|---|---|
| A | `record_id` | `d-20260806-1422-a7f3` | Made on the phone, not the server |
| B | `unit` | the unit key | Ties the record to a unit |
| C | `phase` | the phase key | Always filled |
| D | `item` | the item key | From `slug()`, not the label. **Blank means the record is on the whole phase** |
| E | `type` | `Deficiency` or `Waiting` | Decides which reason list applies |
| F | `reason` | one value from the building's list of eight | See section 5 |
| G | `other_text` | free text | Only when the reason is `Other` |
| H | `subtype` | `Bypass`, `Privacy` | **Blank on an item that defines no types.** Added by `17` |
| I | `needed` | free text, such as `32" 6" RH` | Optional on a Waiting record |
| J | `quantity` | a number | How many are needed |
| K | `state` | `Open`, `Fixed` or `Cancelled` | The filter column |
| L | `created` | date, `yyyy-mm-dd` | A real date cell, not text |
| M | `closed` | date, `yyyy-mm-dd` | Blank while the record is Open |

Notes for the build:
- **New rows go on the bottom, always.** The tab is a chronological log.
- The server finds a row by reading column A whole in one call, then matching in
  memory. Not one search per record.
- If the id is already in column A, the server overwrites that row. This is what
  makes a retried save safe.
- `rebuildTracker` must never touch this tab. Confirmed safe by reading the code:
  it operates on one named sheet object and there is no spreadsheet-level clear
  anywhere in `Code.js`. See `code-inventory.md`, FINDING 6.
- The `Attaches to` column from the earliest draft is dropped. A blank `item`
  already carries that fact.
- `subtype` is a **column and not part of the needed text**, because 0.5 totals
  materials and reading a type out of free text means matching words.

## 2. The status column and its dropdown — FINAL

Settled in `01-deficiency-record-fields` and `11-rollup-rules`.

**The per-item Status column now holds three values, not five:**

    Not Started · In Progress · Complete

`Deficiency` and `On Hold` come out. They were never progress. They are flags,
and a flag lives in the Deficiencies tab as an open record.

- The data validation list on every item Status column drops to those three.
  `allowInvalid` stays true, as the template has it.
- The conditional formatting drops from five rules to three. The `Deficiency`
  and `On Hold` fills come out of `STATUS_FILLS` in `Code.js`.
- `On Hold` is renamed **Waiting** wherever the word survives.

The three fills stay as the template has them: `#EFEFEF` Not Started, `#FFEB9C`
In Progress, `#C6EFCE` Complete.

## 3. The rollup formulas — FINAL

Settled in `11-rollup-rules`. **Worst-wins is deleted.**

The rule is unanimity or In Progress, counted rather than ordered:

| Test | Reads |
|---|---|
| No items | A dash |
| Every item Complete, no open flag | Complete |
| Every item Complete, an open flag | In Progress |
| Every item Not Started | Not Started |
| Anything else | In Progress |

Two things compute this, on purpose:

1. **The phone**, from the local copy. This is the one that counts. The app never
   reads the Sheet's rollup column.
2. **The Sheet**, so it still reads correctly when Miguel opens it directly. That
   matters, because the `CLAUDE.md` escape hatch depends on the Sheet being
   readable by hand.

`buildRollupFormula` is rewritten to the count rule. Its `Deficiency` and
`On Hold` branches come out. The open-flag test is a `COUNTIFS` against the
Deficiencies tab, matching the unit key and a state of `Open`.

**Drift between the two is cosmetic and accepted.** Both sides do the same
arithmetic — the existing formula is already built out of `COUNTIF` calls — and
the phone-side answer is the only one the app uses. A disagreement is a wrong
word in a spreadsheet nobody's phone is reading.

Do not change any rollup formula by hand. `Code.js` rebuilds every rollup from
`buildRollupFormula`, so a hand edit is overwritten.

## 4. Remove the Details column — FINAL

Settled in `06-deficiency-entry-screen`, 2026-08-08.

The 0.1 Details box is dropped. Every item loses its Details column from the Unit
Tracker tab, and the Details button leaves `control/tracker/unit.html`.

Miguel's reason: 0.1 is not usable and the button was only a placeholder. **A
column the app never reads is a trap** — a note typed on a computer would be
invisible on every phone.

**This is bigger in the Sheet than it looks.** `computeLayout` in `Code.js` gives
every item two columns, Status then Details. Removing one halves the per-item
column count, which moves the phase rollup columns, Last Updated and Overall
Status, and rewrites every formula address. Nothing stores a column position —
the comment at `Code.js:522` says positions are worked out from the item order
every time — so this is a change in one function plus the four places that read
`detailsCol`. The documented layout in the comment at `Code.js:636`
("status columns C to AK, rollups AM to AP…") becomes wrong and must be rewritten
with it.

## 5. The lists held in `_Config` — DRAFT, waits on `13-admin-changes`

> **Section 3 of the old file is deleted, not amended.** It defined three
> per-phase reason lists. `17-reason-list-scope` closed on 2026-08-08 and
> replaced them. Do not build from any copy of the old lists.

Two lists live in the hidden `_Config` tab. **Both are Add-only. There is never a
Delete button**, which is what makes the Sheet safe by itself: no row can point
at a value that no longer exists.

### Reasons — one list of eight per building

    Wrong Size · Wrong Type · Wrong Swing · Wrong Color ·
    Missing · Damaged · Defective · Other

Six of the eight apply everywhere. Only `Wrong Swing` and `Wrong Color` vary, so
each item carries a short **trim** naming the values it does not offer. One list
plus a trim, not eighteen copies — otherwise "add a reason to everything" is
eighteen edits instead of one.

- **`Warped` is renamed `Defective`.** It means the thing arrived wrong from the
  factory. `Damaged` means somebody hurt it after it arrived.
- **`Wrong Size or Profile` no longer exists.** It was on the old Baseboards list.
- A **custom item gets all eight and no trim**, so it is never blank.
- `Other` always opens an optional free text box.
- **The trim is about responsibility, not about the item.** Miguel's Exterior
  Doors case set this: the framer hangs patio and entry doors, so `Wrong Swing`
  comes off even though the door plainly swings. Ask "does PFC own this", not
  "can this item have this".

### Types — per item, feeding the `subtype` column

- **Interior Doors** — Regular, Bypass, Bi-fold, Double, Pocket, Double Pocket,
  Dwarf, Unit Door
- **Hardware** — Passage, Privacy, Dummy, Pocket
- **Windows, Exterior Doors, Baseboards** — none defined, and no dropdown appears

### The Waiting reason list — never varies

    Waiting on Another Trade · Awaiting Delivery · Backordered ·
    Site Not Ready · Other

Confirmed by `17` as fixed. It can never narrow per item, because a Waiting
record can attach to a whole phase where there is no item to narrow against.

### What `13-admin-changes` still owes this section

1. **The exact shape in `_Config`.** Today `writeConfig` puts the whole config
   into cell A1 as one JSON string. The lists almost certainly join that object,
   but `13` has not said so.
2. **Who writes the default trim per item, and what it holds.** `17` ruled this
   is content, not a rule, and Miguel writes it. He asked for more time on
   2026-08-08. **It does not gate 0.2** — a trim lives in `_Config`, so changing
   it later is an Admin edit or a template edit, with none of the release
   overhead the PATCH rule exists to avoid. Ship sensible defaults.
3. **Whether the master template updates through Admin or by hand.** `17` assumed
   by hand and did not settle it.

One rule is already firm and belongs to the build: **a list change must not
rebuild the Tracker tab.** Adding a type or a reason changes no columns. Today
every branch of `applyStructureOp` is followed by `rebuildTracker`,
`rebuildDashboard` and `writeConfig`. A list change needs `writeConfig` alone.
That is a new code path, not a new branch on the old one.

## 6. The Dashboard tab — FINAL

Settled in `11-rollup-rules`, measured in `code-inventory.md`.

The Dashboard counts units by status. Five status columns become **four
numbers**: the three Progress values, plus how many units hold an open flag.

With the label column that is **five columns wide, not six**. Two literal sixes
in `rebuildDashboard` carry the old width — `resizeSheet(sheet, rowCount, 6)` and
the column-width loop just after it. The three `STATUS_VALUES.forEach` loops fill
the right number of columns by themselves once the list is three long.

## 7. Settled: what is NOT changing — FINAL

- **No Archive tab.** Records are never moved. Filter the state column when you
  read the Deficiencies tab directly.
- **No photo column.** Photos are not in 0.2.
- **No author column.** There is no sign-in in 0.2.
- **No promised or target date column.**
- **Records are never deleted.** Admin refuses to remove an item that holds an
  open record. Closed records stay in the tab as history, even when their item
  leaves the job.
- **The six header rows on the Unit Tracker tab.** The printed look is unchanged.

## 8. Still unknown

- **Where the needed-line suggestion text is stored.** `15-suggestion-list` owns
  it and is open. If the answer is `_Config`, this file gains a section. If the
  answer is "built from the records the phone already holds", this item goes away
  and the template needs nothing. `17` narrowed the question: seeds now cover
  **dimensions only**, because the type became a dropdown.
- **Whether `03`'s archived-building drop fires in 0.2.** `14-building-archive`
  owns it. It changes no template column either way. See the note added to `14`.
