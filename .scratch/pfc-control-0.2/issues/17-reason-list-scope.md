# How wide a Reason list is, and who writes it

Type: grilling
Status: resolved 2026-08-08
Blocked by: none

## Question

A Reason list is offered per phase today. Should it narrow to the item, and who
writes the lists?

## Why this is a new ticket and not a reopen of 01

Miguel asked for this on 2026-08-08, during `06-deficiency-entry-screen`, and
asked for a fresh ticket by name. His words: "there's an extreme amount of
variables and I want to make sure it's covered."

`01-deficiency-record-fields` settled the lists as they stand and it should not
be unpicked line by line. What `01` decided:

- The list follows the **phase**, not the item.
- Three Deficiency lists, one per phase, plus one shared Waiting list.
- The lists live in the **project config**, not in the app code.
- `Other` always opens a free text box.

Two of Miguel's three asks are already true. The list already depends on
Deficiency or Waiting — the two lists share no value, so "Waiting on Another
Trade" can never appear under a Deficiency. That part needs no work.

**The third ask is the live one: the list should depend on the item too.**

## The argument `01` used, which this ticket has to answer

The list follows the phase because **a custom item has no list of its own.**
Admin adds a custom item through the "Other" row, inside one of three fixed
phases. If lists are per item, every custom item lands with an empty dropdown, or
Admin must make Miguel write one before the item can be used. That fights the
standing rule in `CLAUDE.md`: config drives structure, not code.

## How much the problem is actually worth

The phase already does most of the filtering. "Wrong Swing" cannot reach
Baseboard, because Baseboard sits in a different phase with a different list. The
leak is **inside** a phase: Doors & Windows holds Interior Doors, Closet Doors
and Window Trim, and Window Trim gets offered Wrong Swing.

Weigh that against curating a list per item, per project, across the roughly 50
buildings this tool is designed for.

## Points to settle

- Per phase, per item, or per phase with a per-item trim in Admin. The middle
  option keeps a custom item safe, because it falls back to the full phase list.
- Where a per-item list is stored, if there is one. `02-deficiencies-tab-layout`
  fixed the Deficiencies tab columns, so this is config, not a new column.
- Whether Admin edits the lists at all in 0.2, or whether 0.2 writes a fixed
  default once. This point is shared with `13-admin-changes` and must not be
  answered twice.
- What a custom item gets before anybody writes a list for it.
- Whether the Waiting list ever varies. It is one shared list today, and nothing
  has argued against that.
- The cost this puts on `13-admin-changes`, which is already unblocked and
  waiting.
- Whether a reason list can be edited after records exist against it. A removed
  reason must not orphan a record that already carries it.

## Reference

- `01-deficiency-record-fields` — the lists as they stand, and the argument for
  the phase.
- `13-admin-changes` — owns whether Admin can edit them at all.
- `06-deficiency-entry-screen` — where the Reason dropdown lives on the form.
- `.scratch/0.3-backlog.md` — Admin cannot add a phase. Staircase work will need
  one, and a new phase will need a list.

---

## Answer

Settled with Miguel on 2026-08-08.

### The finding that reframed the ticket

Miguel listed what each item can have. The list mixed **two different fields**,
and separating them answered the question:

| What he listed | Which field | Why |
|---|---|---|
| Damaged, Warped, Missing, Wrong Hinge Color, Wrong Size, Wrong Color | **Reason** | what is wrong |
| Width, Depth, Swing | **Needed** | describes the replacement |
| Door type — Regular, Bypass, Bi-fold… | **Needed** | describes the replacement |
| Handle type — Passage, Privacy, Dummy, Pocket | **Needed** | describes the replacement |

`Wrong Type` is a reason. `Bypass` is the type it should have been. Two columns,
not one.

**The variables were never in the Reason field.** Sorted this way, Miguel's own
list collapses to eight reasons, six of which apply to everything. His words for
every item except Doors and Hardware were "either Wrong Size, Missing or
Damaged". The whole variable explosion he was worried about sits on the **needed
line**, which is `15-suggestion-list` and `12-logger-door`, not here.

### The eight reasons

`Wrong Size · Wrong Type · Wrong Swing · Wrong Color · Missing · Damaged ·
Defective · Other`

**`Warped` is renamed `Defective`,** by Miguel. The word already existed on the
Hardware list in `01`, and it carries the split that matters: **Defective** means
it arrived wrong from the factory — a warped door, a faulty lockset — and
**Damaged** means somebody hurt it after it arrived. Warranty claim against the
supplier, or site handling. Different money, different person paying.

Only two of the eight are not global. `Wrong Swing` is doors. `Wrong Color` is
hardware and hinges. Those two are the leak Miguel spotted when he opened the
ticket.

### One list, held once, plus a trim per item

**`01`'s three per-phase reason lists are deleted.** The list does not follow the
phase and it does not follow the item. There is **one list per building**, and
each item may hide values that do not apply to it.

- Add a reason to everything — **one edit**.
- Stop offering `Wrong Swing` on Baseboards — **one trim entry** on that item.
- A custom item added through the Other row gets **all eight and no trim**, so it
  is never blank. This kills `01`'s objection, which was that a per-item list
  leaves a custom item with an empty dropdown.

Per-item **copies** were rejected on a count. Eighteen items means eighteen
near-identical lists per building, and the thing Miguel would do most often is
add a reason to *everything* — eighteen edits instead of one. The flexibility
being bought is per-item, and no case for it was ever named.

Hardcoding the eight was offered honestly, because Miguel said the reasons are
constant enough that they "could almost be hardcoded". He is right that they are.
It lost because a change would then cost a code edit, a cache version bump, a
push and a phone update, instead of a tap.

### Lists only grow

Miguel's rule, and it is narrower than it first sounds. It touches **two lists**:

| List | Covered? |
|---|---|
| Reasons | **Yes** |
| Door and handle types | **Yes** |
| Progress: Not Started, In Progress, Complete | No — fixed in code |
| Record states: Open, Fixed, Cancelled | No — fixed in code |
| Phases | No — Admin cannot add or remove one |
| Items | No — `02` already gave these their own rule |
| Units | No — Admin has no remove operation |

A value goes in and stays in. **Admin needs Add. It never needs Delete.** No row
in the Sheet can point at a value that no longer exists, so nothing can break by
itself. The one cost, accepted: a typo sits in a dropdown until it is hand-edited
out through the escape hatch.

### The Waiting list never varies

One shared list of five: Waiting on Another Trade, Awaiting Delivery,
Backordered, Site Not Ready, Other. Unchanged from `01`.

It cannot narrow even in principle. `01` lets a Waiting record attach to a whole
phase, where there is no item to narrow against. And there is nothing to trim
anyway — all five apply to every item.

### New: a Subtype dropdown, which no ticket had drawn

This is the part of the ticket that was not in the question.

The needed line gains **one dropdown**, above the text box, offering the types
that item defines:

- **Interior Doors** — Regular, Bypass, Bi-fold, Double, Pocket, Double Pocket,
  Dwarf, Unit Door
- **Hardware** — Passage, Privacy, Dummy, Pocket
- **Windows, Exterior Doors, Baseboards** — none defined, so no dropdown appears
  and the form does not change at all

**Width, depth and swing stay free text.** Miguel's words: "Width, Depth and
Swing should be text, the rest should be dropdown." So `32" 6" RH` is still
typed, and only the type is picked.

**This partly overturns `12-logger-door`,** which rejected structured per-item
fields. `12` argued against a four-field form — Style, Width, Depth and Swing.
This is one field. The cost is one control, and only on an item that defines
types.

### The subtype gets its own column, making thirteen

`02-deficiencies-tab-layout` fixed twelve columns and `template-changes.md`
marked them FINAL. **It is now thirteen.** A new `subtype` column sits beside
`needed`.

A separate column is the entire point of making it a dropdown. Folding the type
into the front of the needed text was offered and rejected: 0.5 would be back to
reading text and matching words, which is the problem the dropdown was added to
solve.

    item          subtype  needed          qty
    interior_...  Bypass   32" 6" RH        1
    interior_...  Pocket   30" 4 9/16 LH    2
    hardware      Privacy  satin nickel     4
    baseboards    (blank)  5 1/4 MDF       12

### Admin owns both lists

Miguel: "the door types should be decided in admin, I believe there is a way to
add new tasks later on in a job, there should also be a way to add new types."
He is right — Admin already adds an item mid-job, so types work the same way.

- The master template ships the eight door types, the four handle types, and the
  eight reasons. A new project inherits them.
- Admin adds a value to the building being worked on, so it is usable at once.
- Buildings already made are left alone. One or two jobs run at a time, and a
  finished building has no new problems to log.

**Adding a type or a reason must not rebuild the Tracker tab.** It changes no
columns. Today every structure operation in `Code.js` runs `rebuildTracker`,
`rebuildDashboard` and `writeConfig`. A list change needs `writeConfig` alone. It
is a fast write that cannot disturb a single status value.

### What this changed elsewhere

- **`01-deficiency-record-fields`** — its three per-phase reason lists are
  superseded by one list plus a trim. `Warped` is renamed `Defective`. Its
  "needed line stays free text" holds for width, depth and swing, and no longer
  holds for the type.
- **`02-deficiencies-tab-layout`** — twelve columns becomes thirteen.
- **`06-deficiency-entry-screen`** — the six-control budget becomes seven on an
  item that defines types. `06` said six is the whole budget and anything more
  pushes Save under the keyboard, so the form layout needs re-checking against
  the prototype.
- **`12-logger-door`** — its rejection of structured per-item fields is narrowed,
  not reversed. Its line "No Admin work comes from `12`" is now wrong.
- **`13-admin-changes`** — gains the edit-item screen holding both lists, and the
  Add-only rule. The shared reason-list question from `06` is answered here, so
  `13` settles only where the screen sits.
- **`15-suggestion-list`** — narrows. Seed suggestions no longer have to carry
  the door type, because the type is picked. They carry the dimensions.
- **`template-changes.md`** — section 3 is materially wrong. `18` rewrites it.

### `Dwarf` and `Unit Door` are types

Confirmed by Miguel on 2026-08-08. Both sit in the Interior Doors type list, with
the other six. Neither becomes an item in Admin.

### Exterior Doors: PFC does not own the door

Miguel explained this on 2026-08-08, and it is the reason `Wrong Swing` does not
belong on the item even though an exterior door plainly swings.

**Exterior Doors means patio and entry doors, and the framer installs them.** PFC
does the **build-out and trim** around them. The swing is not PFC's concern,
because PFC never hangs the door. Miguel's words: "they are often defective and
need repairs but we do not handle that."

So the trim on this item is not about what a door can be. It is about **what PFC
is responsible for.** Drop `Wrong Swing`, and probably `Wrong Type` and
`Wrong Color` with it, because PFC did not choose the door.

**This exposed a gap in the model, and it is not this ticket's to close.** Moved
to the map's Not yet specified list: a defective exterior door is a real problem
that Miguel would want recorded, and it is one PFC will never fix. Every record
today is a task for PFC. An open flag of either kind blocks Complete on its item,
per `11-rollup-rules`, so logging the defective door would stop Exterior Doors
from ever reading Complete — even after PFC finished all of its own build-out and
trim.

### The default trim per item is content, and it needs no release

Which reasons each item hides out of the box is **content, not a rule**, and
Miguel writes it, the same way he is writing the seed suggestions on `15`. He
asked on 2026-08-08 for more time on it, and said the finer details could ship as
patch releases.

**They are cheaper than that. A trim list needs no release at all.** It lives in
`_Config`, not in the code, so changing it costs an Admin edit on a live
building, or a template edit for new ones. None of the release overhead that the
PATCH rule in `CLAUDE.md` exists to avoid applies — no push, no Pages build, no
`CACHE_NAME` bump, no phone update.

So the defaults do not have to be right before 0.2 ships. They have to be *there*
and roughly sensible. The build plan should say this plainly, so nobody treats a
trim list as a thing that needs a version number.

### Not decided here

- Where the edit-item screen sits inside Admin. That is `13`.
- The trim defaults themselves. Miguel writes them, `13` holds the question, and
  `15`'s Interior Doors first order is the model to copy.
