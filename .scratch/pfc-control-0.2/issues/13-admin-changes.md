# What Admin must change for the Deficiencies tab

Type: grilling
Status: open
Blocked by: 02 (resolved), 06 (resolved 2026-08-08)

## Question

What work does the Admin screen need in 0.2, now that the Deficiencies tab is
fixed?

This graduated out of the map's fog when `02-deficiencies-tab-layout` closed. The
tab layout is now exact, so the Admin work is a sharp question rather than an
unknown size.

Admin creates the project Sheet, so a new tab is Admin work. `02` also gave Admin
a new job it does not have today: refusing a removal.

**One thing this ticket does not have to carry.** `12-logger-door` considered
structured per-item questions — Style, Width, Depth and Swing on an Interior
Door — which would have needed a new Admin screen to define them per item. It was
rejected. The needed line stays free text. No Admin work comes from `12`.

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

## Added by `06-deficiency-entry-screen`, 2026-08-08

`06` resolved, so this ticket is unblocked. Two things came out of it.

- **The Details column leaves the Tracker tab in the master template.** The 0.1
  Details box is dropped. Miguel: 0.1 is not usable and the button was only a
  placeholder. A column the app never reads is a trap, because a note typed on a
  computer would be invisible on every phone. This is template work, so it lands
  here and in `09-write-0.2-build-plan`.
- **The reason-list question is now shared.** The point above — "does Admin let
  Miguel edit those lists" — is also a point on `17-reason-list-scope`, which
  asks whether a list narrows to the item at all. **Answer it once.** `17` should
  settle what a list covers; this ticket should settle who edits it and where the
  Admin screen sits.

`06` added no other Admin work. The refusal screen for `remove-item` is still
this ticket's, and it can now be answered: `06` built the record list and the
Fixed action, so the refusal screen has a shape to borrow from.
