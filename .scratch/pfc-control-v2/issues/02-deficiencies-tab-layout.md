# How the Deficiencies tab lays out and rolls up

Type: grilling
Status: open
Blocked by: 01, 07

## Question

How does the new Deficiencies tab lay out in a project Sheet, and how does a
status roll up once records live there?

Points to settle:
- The column list, and the key that ties a record to its unit and item. Item
  keys come from `slugify()` in `control/shared/common.js`.
- Where a record row is added, and how a row is found again for an edit.
- What happens to a record when Admin changes the structure and an item goes
  away.
- How the item status, the phase status, and the unit status are worked out once
  records exist. The rollup rule today is worst status wins, held in
  `ROLLUP_ORDER`.
- Whether the tab holds formulas, or whether the app works out every rollup.
  Formulas are harder to write to safely. See `07-apps-script-write-limits`.
- What changes in the master template, ID `1QIF5TCJ0iekpNGHEjce1PSoFXRFhucmF-ednTSYHT-M`.
