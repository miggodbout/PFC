# Changes needed in the master template

**Status: PROVISIONAL. Do not start work yet.**

This list fills in as the map settles. The exact columns come from
`issues/02-deficiencies-tab-layout.md`, which is not resolved. This file is
marked final only when that ticket closes.

Template in Drive: `PFC/Master Template/PFC_Master_Template.xlsx`
ID `1QIF5TCJ0iekpNGHEjce1PSoFXRFhucmF-ednTSYHT-M`
Local reference copy: `PFC/reference/PFC_Master_Template.xlsx`

No existing project Sheet needs an upgrade. Drive holds test projects only. The
plan changes the template, trashes the test Sheets, and makes the real building
fresh.

---

## 1. A new tab: Deficiencies

One row per record. A record covers a deficiency or an on-hold reason. The tab
holds open and fixed records together. There is no Archive tab. Filter the state
column when you read the tab directly.

Columns, provisional and not yet ordered:

| Column | Holds | Notes |
|---|---|---|
| Unit | the unit key | Ties the record to a unit |
| Attaches to | Item or Phase | Deficiency is always Item. Waiting can be either |
| Item | the item key | The key comes from `slugify()`, not the label. Blank on a phase-level Waiting record |
| Phase | the phase key | Always filled, because the reason list follows the phase |
| Type | Deficiency or Waiting | Decides which reason list applies |
| Reason | one value from the phase's list | See section 3 |
| Other text | free text | Only when Reason is Other |
| Needed | free text, such as `32" 6" RH` | Optional on an On Hold record |
| Quantity | a number | How many are needed |
| State | Open or Fixed | The filter column |
| Created | date | When the record was made |
| Fixed | date | Blank while the record is open |

Open points that change this table:
- How a record row is found again for an edit. Unit rows have a fixed order from
  the config, so the code finds them with no search. This tab has no such order.
- Whether a record needs its own id column to make an edit safe to retry.

## 2. Rollup formulas

The item, phase and unit rollups must account for open records. The exact rule
waits on `issues/02-deficiencies-tab-layout.md` and on the status decision in
`issues/01-deficiency-record-fields.md`.

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

## 5. Still unknown

- Whether the needed-material suggestion list needs storage in the Sheet, or
  whether the app builds it from records it already holds.
- Whether each record needs its own id column, so an edit is safe to retry.
- The status columns themselves. Progress is now three values, and Deficiency and
  Waiting are flags worked out from records. The old five-value column has to
  change. The shape waits on `issues/11-rollup-rules.md`.
