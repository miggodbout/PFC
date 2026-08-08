# What Admin must change for the Deficiencies tab

Type: grilling
Status: resolved 2026-08-08
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

---

## Resolution, 2026-08-08

Four points needed Miguel. Four were already answered by the code or by another
ticket, and are recorded here as confirmations, not as decisions.

### Confirmed without asking

- **`rebuildTracker` cannot reach the Deficiencies tab.** `code-inventory.md`
  FINDING 6. `rebuildTracker` takes one sheet object at `Code.js:681` and every
  later call is a method on that object. `rebuildDashboard` does the same.
  `resizeSheet` takes a sheet as an argument. There is no `ss`-level clear
  anywhere in the file, so `02`'s rule holds by the shape of the code and needs
  no new guard. **The plan must carry one caveat:** it stays true only while the
  new tab is reached the same way. A future `ss.getSheets().forEach(...)` breaks
  it silently.
- **`remove-unit` stays out of 0.2.** `applyStructureOp` has four branches —
  `add-item`, `remove-item`, `add-unit`, `rename-unit`. There is no
  `remove-unit`, nobody has asked for one, and adding one would need the same
  open-record refusal plus a rule for the unit's status values. Out.
- **Admin owns the reason and type lists.** Settled by `17`. Not reopened.
- **Building the Deficiencies tab at create time** is `template-changes.md`
  section 1, already FINAL. No decision was needed, only the build work: make the
  tab, write the header row, freeze row 1, add the filter.

### 1. The `remove-item` refusal screen — a Cancel all button

Admin refuses to remove an item that holds open records, per `02`. The refusal
names the count and offers **one bulk button**, and nothing else:

    Can not remove Interior Doors.
    It holds 12 open records across 9 units.

    [ Cancel all 12 records ]

    Then remove the item again.

No record list, no per-record choice. Removing an item means PFC is not doing
that work on this job, so every open record on it is **Cancelled**, not Fixed.
One button says exactly that, and Cancelled is the state `02` created for a
record that should never read as a repair.

Rejected: naming the records and stopping. Twelve open records across nine units
means opening nine units by hand, because `06`'s `Fix all` works inside one unit,
not across a building. That is the escape hatch, not a workflow.

Rejected: drawing `06`'s full record list inside Admin. It ports a Tracker screen
into a screen with no unit context, for an action taken a handful of times a job.

**It is two steps, not one.** Cancel all does not remove the item. You press
Remove again afterwards. Miguel chose the sketch that says so.

**Cancel all asks once before it fires.** A second tap, no typing:
`Cancel 12 records?` `[ Yes, cancel 12 ]` `[ Back ]`. There is no Undo for a
bulk cancel — `06`'s greyed-with-Undo lives on the Tracker unit screen and does
not reach here — so the confirm is the only friction there is.

### 2. The Lists card — one new card, not a screen

Admin stays one page. A fifth card joins the four in the "Edit an existing
project" block. It holds both levels, because both hang off the project already
picked at the top of that block:

    - Lists ---------------------------
    Reasons for this building
      Wrong Size, Wrong Type, Wrong Swing, Wrong Color,
      Missing, Damaged, Defective, Other
      [ + Add a reason ]

    Item:  Interior Doors  [v]

      Subtypes
        Regular, Bypass, Bi-fold, Double,
        Pocket, Double Pocket, Dwarf, Unit Door
        [ + Add a subtype ]

      Reasons for this item
        [x] Wrong Size    [x] Wrong Type
        [x] Wrong Swing   [x] Wrong Color
        [x] Missing       [x] Damaged
        [x] Defective     [x] Other

One item dropdown serves both item-level lists. Two cards would make you pick the
item twice to set up one item. A separate screen would stop Admin being one page,
for something visited a handful of times a job.

**This does not spend the one-window-per-MINOR budget.** A card inside a screen
that already exists is not a window. 0.2 still spends its window on Logger.

**Add is Add-only. The trim is not.** Adding a reason or a subtype can never be
undone in Admin, per `17` — that is what keeps the Sheet safe, because no record
can point at a value that stopped existing. **Unticking a trim box is different
and is freely reversible**, because it removes nothing: the value stays in the
building list, and a record already pointing at a trimmed reason still reads
correctly. The trim only decides what a dropdown offers next time.

### 3. `rename-item` is added in 0.2 — label only

A new branch on `applyStructureOp`, copying `rename-unit`, which already changes
the label and returns without touching the key. The item key never moves.

Without it, fixing a typo in an item name costs everything under that item:

| | With rename | Without (remove + add) |
|---|---|---|
| item key | stays | becomes `interior_doors_2` |
| deficiency records | kept | orphaned |
| subtype list | kept | gone |
| reason trim | kept | gone |
| status values in every unit | kept | gone |
| the removal itself | — | refused first, cancel all records |

0.2 makes the damage far worse than 0.1, because records, a subtype list and a
trim now all hang off the item key. The fix is one branch mirroring code that is
already there, plus one card.

**`rename-item` does rebuild the Tracker tab**, because the header text changes.
It is the one new operation that keeps the full three-step preserve-and-rebuild
path. **It never touches the Deficiencies tab**, because `02` stores the item
*key* in that tab and not the label. That is exactly why a label-only rename is
safe.

### 4. A new value stays in the building it was added to

Add a subtype to building A and it is usable in A at once. It does not reach
building B, created next week. New buildings seed from the default lists in the
code.

Rejected: a shared defaults store that every new building copies. It is hidden
state with no screen showing it, and because lists only grow and there is no
Delete, one typo added once would follow every future job for the life of the
tool. Blast radius stays one building.

**This answers "does the master template update through Admin or by hand".**
Neither, and the question was built on a wrong picture. `handleCreateProject`
does not copy the .xlsx — `template-changes.md` line 30 says so, and
`Code.js:352` calls `SpreadsheetApp.create` on an empty file. The .xlsx is the
visual specification. **The real seed is the default list in the code**, so a
change to what new buildings get is a code change that ships in a release, and
the .xlsx is updated by hand to match.

**Where the defaults live:** beside `DEFAULT_PHASES` in
`control/shared/common.js`, and sent up in the create payload the way item labels
already are. One file holds every default a person might want changed, next to
the item list it describes.

---

## The item list changed, and Miguel changed it

This came out of a check on `17`. **`17` wrote its type lists against items that
do not exist.** It named `Hardware` and `Baseboards` as items. Those are phases.
The real list in `common.js:78` is seventeen items, and `17`'s four "handle
types" — Passage, Privacy, Dummy, Pocket — **were already three of them.** A
dropdown of them would have asked the same question twice.

Miguel's answer went further than the fix: **collapse the repeating items into
subtypes.** His words: "listing all door handles as `Handles` keeps the tracker
lean, `Passage, Privacy, Dummy` is only needed when an issue comes up in logger."
That is `12-logger-door`'s split — lean to look at, detailed to log — applied to
the item list itself.

### The new default item list — 14 items, was 17

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

Changes from 0.1, all chosen by Miguel on 2026-08-08:
- **`Unit Door` stops being an item** and becomes a subtype of Interior Doors.
  His words: "Unit Door should just be a subtype, we can remove it as an item
  completely." One door, one place to log it.
- **`Passage`, `Privacy`, `Dummy` stop being items.** They become subtypes of a
  new item, **Handles**.
- **`Spring Stops` and `Hinge Stops` stop being items.** They become `Spring` and
  `Hinge`, subtypes of a new item, **Stops**.
- **`Ball Catch` stays its own item.** A catch is not a stop. Miguel was offered
  the thirteen-item version that folds it in and chose against it.
- **`Bathtub` is added to Phase 1.** Miguel: "I completely missed Bathtub as an
  item in Phase 1."

**The accepted cost, stated before he chose it.** Passage and Privacy share one
status row now. You can no longer read that the passage handles are done and the
privacy handles are not. Progress got coarser so that logging could get finer.

**What it buys.** The Tracker tab goes from 41 columns to 21 — the Details column
removal in `06` does most of it, and three fewer items does the rest. The Unit
screen scrolls fourteen rows, not seventeen.

    Tracker tab width
      0.1 today, 17 items with Details    41 columns
      0.2, 17 items, no Details           24 columns
      0.2, 14 items, no Details           21 columns

### A subtype list ends with `Other`

Added by Miguel, 2026-08-08: "Subtypes should probably have an `Other` text field
just like the items do." So the Subtype dropdown behaves exactly like the Reason
dropdown already does — the last row is `Other`, and picking it opens a text box.

- The typed text is stored **in the subtype column**, as a per-record value.
- **It does not join the list.** A one-off stays a one-off. If Miguel wants it
  permanently, he adds it in the Lists card, which is the Add-only path.

**One conflict this creates, for `09`.** `06` budgeted the Logger form at six
controls, and `17` took it to seven. Worst case is now nine — Type, Item,
Subtype, Subtype-Other, Needed, Count, Reason, Reason-Other, Save — when both
`Other` boxes are open at once. `06`'s warning was that anything more pushes Save
under the keyboard. **Recommended answer: pin Save to the bottom of the screen
rather than leaving it in the scroll flow**, so the form is free to grow when a
rare `Other` opens. It needs one line from Miguel at build time.

---

## What this ticket hands to the build

Server, `control/appscript/Code.js`:

1. `handleCreateProject` — make the `Deficiencies` tab, header row, freeze row 1,
   add the filter. Seed `reasons`, and each item's `types` and `trim`, from the
   create payload.
2. `applyStructureOp` — new branch **`rename-item`**, label only, key never
   changes. Mirrors `rename-unit` at line 496.
3. `applyStructureOp` — three list branches: **`add-reason`**, **`add-type`**,
   **`set-trim`**. These return **before** the rebuild block, so
   `handleUpdateStructure` calls `writeConfig` alone. A list change touches no
   column and must never rebuild the Tracker tab. This is the small change to
   lines 419 to 429 that `code-inventory.md` measured.
4. `applyStructureOp`, `remove-item` at line 459 — add the open-record check. One
   read of the Deficiencies tab's item-key and state columns. Refuse with the
   count and the unit count.
5. New action **`cancel-item-records`** `{ id, itemKey }` — set every Open record
   on that item to Cancelled, return the count. Writes the Deficiencies tab only.
   No config change, no rebuild.
6. `get-project` from `03` must return `reasons`, and each item's `types` and
   `trim`, so Logger can draw the dropdowns from the local copy.

Client, `control/admin/index.html`:

7. A fifth card, **Lists**, in the edit block. Building reason list with Add. Item
   dropdown, then that item's subtype list with Add, and its reason trim as
   checkboxes.
8. A sixth card, **Rename an item**. Copies the Rename a unit card at line 449.
9. The refusal panel on the Remove an item card, with `Cancel all N records` and
   its confirm.
10. The note at line 437 says "The item loses its Status and Details columns."
    There is no Details column after `06`. One-line fix, already on
    `code-inventory.md`'s list.

Client, `control/shared/common.js`:

11. `DEFAULT_PHASES` at line 78 — the new fourteen-item list.
12. New default lists beside it: the eight reasons, the per-item subtype lists,
    the per-item trim, and the fixed Waiting reason list.

### The `_Config` shape

The lists join the existing JSON object in cell A1. `writeConfig` and `readConfig`
already read and write the whole object in one call, so nothing about the storage
changes:

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
            "trim":  [] }
        ]}
      ]
    }

- **`version` rises from 1 to 2.** There is no upgrade path — the plan trashes the
  test Sheets — so the version is there to let the code refuse a version-1 Sheet
  with a clear message instead of drawing it wrong.
- **`trim` holds the reason strings the item does not offer**, matched exactly
  against `reasons`. An empty trim means the item offers all eight.
- **A custom item arrives with `types: []` and `trim: []`**, so it offers all
  eight reasons and shows no subtype dropdown. `17`'s empty-dropdown objection
  cannot happen.
- **The Waiting reason list is not stored.** `17` confirmed it never varies, so it
  is a constant in `common.js`, not per-building config.

### Still open, and not gating 0.2

- **The default reason trim per item.** `17` ruled this is content and Miguel
  writes it. He asked for more time on 2026-08-08. The item list changed under it
  today, so what he writes is now against fourteen items, not seventeen. It does
  not gate the build: a trim lives in `_Config`, so changing it later is an Admin
  edit or a template edit, with none of the release overhead the PATCH rule
  exists to avoid. **Ship every item with an empty trim** — all eight reasons
  everywhere — and narrow them afterwards. An empty trim is never wrong, only
  wider than it needs to be.
- **Where Save sits on the Logger form** when both `Other` boxes open. See above.
