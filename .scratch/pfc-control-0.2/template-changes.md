# Changes needed in the master template

**Status: PROVISIONAL. Do not start work yet.**

Section 1 is now final. `issues/02-deficiencies-tab-layout.md` closed on
2026-08-06 and fixed the Deficiencies tab exactly.

Sections 2 and 5 are still provisional. They wait on
`issues/11-rollup-rules.md`, which now owns the whole status model on the Unit
Tracker tab.

Template in Drive: `PFC/Master Template/PFC_Master_Template.xlsx`
ID `1QIF5TCJ0iekpNGHEjce1PSoFXRFhucmF-ednTSYHT-M`
Local reference copy: `PFC/reference/PFC_Master_Template.xlsx`

No existing project Sheet needs an upgrade. Drive holds test projects only. The
plan changes the template, trashes the test Sheets, and makes the real building
fresh.

---

## 1. A new tab: Deficiencies — FINAL

Settled in `issues/02-deficiencies-tab-layout.md`.

One row per record. A record covers a deficiency or a waiting reason. The tab
holds every record together, open and closed. There is no Archive tab. Filter the
state column when you read the tab directly.

One header row. Data starts on row 2. Freeze row 1 and add a filter. This tab is
a plain list, unlike the Unit Tracker tab and its six header rows.

| Col | Name | Holds | Notes |
|---|---|---|---|
| A | `record_id` | `d-20260806-1422-a7f3` | Made on the phone, not the server |
| B | `unit` | the unit key | Ties the record to a unit |
| C | `phase` | the phase key | Always filled. The reason list follows the phase |
| D | `item` | the item key | From `slug()`, not the label. **Blank means the record is on the whole phase** |
| E | `type` | `Deficiency` or `Waiting` | Decides which reason list applies |
| F | `reason` | one value from the phase's list | See section 3 |
| G | `other_text` | free text | Only when the reason is `Other` |
| H | `needed` | free text, such as `32" 6" RH` | Optional on a Waiting record |
| I | `quantity` | a number | How many are needed |
| J | `state` | `Open`, `Fixed` or `Cancelled` | The filter column |
| K | `created` | date, `yyyy-mm-dd` | A real date cell, not text |
| L | `closed` | date, `yyyy-mm-dd` | Blank while the record is Open |

Notes for the build:
- **New rows go on the bottom, always.** The tab is a chronological log.
- The server finds a row by reading column A whole in one call, then matching in
  memory. Not one search per record.
- If the id is already in column A, the server overwrites that row. This is what
  makes a retried save safe.
- `rebuildTracker` must never touch this tab.
- The `Attaches to` column from the earlier draft is dropped. A blank `item`
  already carries that fact.
- `Cancelled` is new. It means the record should never have existed. It amends
  `issues/01-deficiency-record-fields.md`.

## 2. Rollup formulas — PROVISIONAL

The item, phase and unit rollups must account for open records. The exact rule
waits on `issues/11-rollup-rules.md`, which now owns the whole status model on
the Unit Tracker tab.

Do not change any rollup formula by hand. `Code.js` rebuilds every rollup from
`buildRollupFormula`, so a hand edit is overwritten.

## 3. The reason lists, held in config

The "what is wrong" list follows the **phase**, not the item. Store the lists in
the project config so a new phase can carry its own list later. Do not hardcode
them in the app. This follows the standing rule in `CLAUDE.md`: config drives
structure, not code.

Deficiency reasons, by phase:

- **Doors & Windows** — Wrong Swing, Wrong Size, Wrong Type, Damaged, Warped,
  Missing, Other
- **Baseboards** — Wrong Size or Profile, Damaged, Warped, Missing, Other
- **Hardware & Accessories** — Wrong Type, Wrong Finish, Damaged, Defective,
  Missing, Other

On Hold reasons, one shared list:

- Waiting on Another Trade, Awaiting Delivery, Backordered, Site Not Ready, Other

`Other` always opens an optional free text box.

## 4. Settled: what is NOT changing

- **No Archive tab.** Records are never moved. Filter the State column when you
  read the Deficiencies tab directly.
- **No photo column.** Photos are not in 0.2.
- **No author column.** There is no sign-in in 0.2.
- **No promised or target date column.**
- **Records are never deleted.** Admin refuses to remove an item that holds an
  open record. Closed records stay in the tab as history, even when their item
  leaves the job.

## 5. Still unknown

- Whether the needed-material suggestion list needs storage in the Sheet, or
  whether the app builds it from records it already holds.
- The status columns themselves. Progress is now three values, and Deficiency and
  Waiting are flags worked out from records. The old five-value column has to
  change. The shape waits on `issues/11-rollup-rules.md`.
