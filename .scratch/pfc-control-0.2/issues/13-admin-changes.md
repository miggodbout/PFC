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

## Added by `17-reason-list-scope`, 2026-08-08

`17` closed, and it answered the shared reason-list question in this ticket's
favour: **Admin owns the lists.** Miguel's words — "the door types should be
decided in admin, I believe there is a way to add new tasks later on in a job,
there should also be a way to add new types."

So the point above, "does Admin let Miguel edit those lists, or does 0.2 write
them once from a fixed default", is **answered: Admin edits them.** Do not answer
it again. What is left for this ticket is only **where the screen sits**.

### What Admin now owns

Two lists, both stored in the hidden `_Config` tab, both **Add-only**:

1. **Reasons** — one list of eight, held once per building, plus a short trim per
   item naming the values that item does not offer.
2. **Types** — per item. Eight door types on Interior Doors, four handle types on
   Hardware, none on an item that defines none.

`17` sketched them on one edit-item screen. That sketch is not binding — this
ticket decides the shape:

    ADMIN → EDIT ITEM → Interior Doors

      Door types
        Regular, Bypass, Bi-fold, Double,
        Pocket, Double Pocket, Dwarf, Unit Door
        [ + Add ]

      Reasons for this item
        ☐ Wrong Colour
        ☑ everything else

### Rules this ticket must carry

- **Add-only. There is no Delete button, ever.** Miguel settled this on
  2026-08-08. It is what makes the Sheet safe by itself: no row can point at a
  value that no longer exists. A typo is removed by hand-editing `_Config`
  through the escape hatch, and written down.
- **A list change must not rebuild the Tracker tab.** Adding a type or a reason
  changes no columns. Today every branch of `applyStructureOp` is followed by
  `rebuildTracker`, `rebuildDashboard` and `writeConfig`. A list change needs
  `writeConfig` alone — a fast write that cannot disturb a status value. This is
  a **new code path**, not a new branch on the old one.
- **A new value lands in the building being worked on**, so it is usable at once.
  It does not push to other buildings. The master template is updated separately
  so new projects inherit it.
- **A custom item seeds correctly with no work.** It gets all eight reasons and
  no trim, and it defines no types, so it shows no type dropdown.

### Still open, and now this ticket's

- Where the edit-item screen sits inside Admin, and whether the reason trim and
  the type list share one screen or two.
- **Who writes the default trim per item.** `17` ruled this is content, not a
  rule, and Miguel writes it — the same arrangement as the seed suggestions on
  `15`. He asked for more time on it on 2026-08-08. **It does not gate 0.2:** a
  trim list lives in `_Config`, so changing it is an Admin edit or a template
  edit, with none of the release overhead the PATCH rule in `CLAUDE.md` exists to
  avoid. Ship sensible defaults, adjust freely afterwards.
- **The trim is about responsibility, not about the item.** Miguel's Exterior
  Doors case set this: the framer hangs patio and entry doors, PFC only builds
  out and trims around them, so `Wrong Swing` comes off even though the door
  plainly swings. Ask "does PFC own this" and not "can this item have this".
- Whether the master template updates through Admin or by hand. `17` assumed by
  hand and did not settle it.

### Unchanged by `17`

The `remove-item` refusal screen, `remove-unit`, the rename-item question, and
the `rebuildTracker` guarantee are all untouched. Note that the rename-item cost
is now **worse**: a rename changes the item key, which orphans every record under
it, and an item now also carries its own type list and reason trim to lose.
