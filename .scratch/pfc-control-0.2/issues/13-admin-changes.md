# What Admin must change for the Deficiencies tab

Type: grilling
Status: open
Blocked by: 02, 06

## Question

What work does the Admin screen need in 0.2, now that the Deficiencies tab is
fixed?

This graduated out of the map's fog when `02-deficiencies-tab-layout` closed. The
tab layout is now exact, so the Admin work is a sharp question rather than an
unknown size.

Admin creates the project Sheet, so a new tab is Admin work. `02` also gave Admin
a new job it does not have today: refusing a removal.

Points to settle:
- The build work in `handleCreateProject`: make the `Deficiencies` tab, write the
  header row, freeze row 1, add the filter.
- The reason lists move into the project config, per `01`. Does Admin let Miguel
  edit those lists, or does 0.2 write them once from a fixed default?
- The refusal screen for `remove-item`. `02` settled that Admin stops when an
  item holds an open record. Not settled: whether that screen only names the
  records, or whether it lets him close them there and then. Closing them there
  reuses the entry screen from `06`, which is why this ticket waits on `06`.
- Whether `remove-unit` needs the same refusal. Admin has no remove-unit
  operation today. Confirm that stays true in 0.2.
- Whether Admin needs a rename-item operation. Today a rename means remove plus
  add, which changes the item key and orphans every record under it. This is a
  new cost that did not exist in 0.1.
- What `rebuildTracker` must be changed to guarantee. `02` ruled it must never
  touch the Deficiencies tab. Confirm nothing in the current clear-and-redraw
  path can reach it.
