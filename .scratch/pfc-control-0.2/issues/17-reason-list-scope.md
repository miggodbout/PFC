# How wide a Reason list is, and who writes it

Type: grilling
Status: open
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
