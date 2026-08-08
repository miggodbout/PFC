# What the Logger form and the record list look like

Type: prototype
Status: resolved
Resolved: 2026-08-08
Assignee: Claude (session of 2026-08-07, finished 2026-08-08)
Blocked by: 01 (resolved), 12 (resolved)

> **Nomenclature correction, added by `18-supersession-sweep` 2026-08-08. Every
> `32" 6" RH` below is stale text.** `15-suggestion-list` dropped the inch marks.
> The standard needed line is **`32 6 RH`**.
>
> **The `ex: 32" 6" RH` line under the needed box is also gone.** `15` replaced it
> with a per-item placeholder **inside** the empty box, naming the parts rather
> than showing an example: `Size   Jamb   Swing`. It costs no screen height, which
> matters here — this ticket measured the control budget. See `supersessions.md`
> entry 39.

## Question

How does a person add, correct, and close a deficiency record on a phone?

Build rough, throwaway screens to react to. Do not build them into the app.

**`12-logger-door` moved this ticket's subject.** There are now two screens to
draw, not one, and they live behind different doors.

## Screen 1 — the Logger form

`12` settled the shape and the field order. Prototype it and find what is wrong
with it.

```
─────────────────────────
 Maple Ridge · 201 · Doors
                   [change]
─────────────────────────
 Item   [Interior Door  ▾]

 Needed
 [32" 6" RH             ]
  ex: 32" 6" RH
 ┌──────────┐┌──────────┐
 │ 32" 6" RH││ 30" 4" LH│  ← tap
 └──────────┘└──────────┘
 Count  [ − ] 1 [ + ]
 Reason [Damaged        ▾]

      [    Save    ]
```

Points to settle:
- Whether the whole form really fits one screen with the keyboard open. This is
  the assumption `12` rests on. Test it on a real phone size.
- What the `[change]` control opens, and how a person moves to unit 202.
- What the Item dropdown shows for a Waiting record against a whole phase, with
  no item. `01` allows this and no control exists for it yet.
- How the "Logged here" list draws, and how Cancel works on it. `12` ruled that
  the list can Cancel a record but never mark one Fixed.
- How few taps a common entry takes, with gloves on.
- Whether the Reason dropdown belongs above the Count, once real thumbs try it.

## Screen 2 — the Tracker item record list

`12` ruled that **Tracker closes records, and Logger never does.** So the Fixed
action and the bulk action both live here.

```
TRACKER › Unit 201
 Interior Door  [Complete ▾] ⚑2
   32" 6" RH  x1   [ Fixed ]
   30" 4" LH  x1   [ Fixed ]
              [ Fix all ✓ ]
```

Points to settle:
- How several records under one item are shown, without burying the Progress
  dropdown that shares the row.
- Whether the list is always open, or opens on a tap of the flag.
- **The bulk fix action.** Miguel asked for it by name: "worker clicks a Fixed
  button, or alternatively if Interior Door's dropdown goes from Deficiency to
  Complete, all tracked deficiencies are marked complete." Setting the dropdown
  to Complete was going to be that action. Then `01` split progress from flags,
  so the dropdown no longer touches records, and an item with four open records
  needs four taps. This screen must give the bulk action a home. Candidates: a
  `Fix all` control on the item, a multi-select in the list, or a prompt when the
  dropdown moves to Complete while records are open. The last one is not
  automatic status. It is a shortcut that asks first.
- Whether a Fixed record stays visible on the item, or disappears from the list.
- How the current Details box and the new records live together, or whether the
  Details box goes away.

## Dead points

These were on this ticket and `01` or `12` killed them.

- "What happens the moment a status is set to Deficiency or On Hold." Nothing
  happens. `01` split progress from flags. Those two values left the dropdown, so
  a status change no longer opens anything.
- The needed line as structured dropdowns. `12` rejected it. The needed line is
  free text, helped by suggestions, and `15-suggestion-list` owns the
  suggestions. Draw them here as if they work.

## Still true from 01

**The needed line is the hero field.** Miguel's words: "the important part is
what replacement is needed." Rank the screen that way. The needed line and the
count come first. The reason is one tap from a list and sits second.

## Asset

`.scratch/pfc-control-0.2/prototypes/06-logger-and-records.html`

A throwaway file. It loads the real `control/shared/theme.css`, holds fake data
and a fake server, and draws both screens. The blue bar at the bottom is
scaffolding: every toggle on it was an open question, and each one now starts on
the answer below. The losing side stays switchable so the pick can be compared.

Open it in a browser. Open it on the phone to judge the one-screen claim — the
bar prints the live gap between Save and the fold, measured against
`visualViewport`, so the real keyboard gives a real number. Do not build any of
it into the app.

---

## Resolution, 2026-08-08

### The Logger form

Field order, top to bottom: **Type, Item, Needed, Count, Reason, Save.**

**A field was missing, and building it found it.** `12` drew Item, Needed, Count
and Reason. There is no way to say whether the record is a Deficiency or a
Waiting, and `01` needs that answer before the Reason list can even be drawn,
because the two lists share no value. So the form gains a **Type** control:
two buttons, `Deficiency` and `Waiting`, above everything else.

The Type toggle **holds for the visit and resets when the place changes.** Four
backordered locksets in one room cost one tap, not four. Walk to the next unit
and it is back on Deficiency, because a new place is usually new work. A toggle
that holds forever was offered and turned down.

**Count stays above Reason**, as `12` drew it. The count belongs beside the
needed line it counts.

**The needed line keeps its size and its suggestions.** It is the only field
drawn at full height. Suggestions sit under it as tap targets, filtered as you
type, past records first and seed entries behind them. `15-suggestion-list` owns
where that list comes from.

### The place bar

**Two lines, not one.** `1500 Main St · 204` over `Doors & Windows · Floor 2`.
One line was drawn first and it wrapped — "Hardware & Accessories" pushes the
whole form down a row, which is the row Save needs.

**`[change]` opens a sheet from the bottom** holding Building, Unit and Phase
together, with the found floor confirmed under the unit box. Moving to 202 is:
tap change, type 202, tap Use this place. The unit box matches typed text against
the unit labels in the local copy, and never assumes the first digit is the
floor — Harbour View numbers its units A1 and A2.

**The phone remembers the building and the phase. It never remembers the unit.**
A building lasts weeks and a phase lasts days, so both are safe to assume. The
unit changes every few minutes, and a wrong unit writes a real door against the
wrong door. Opening Logger cold shows `1500 Main St · ____` with `set unit`, and
the form stays greyed until the unit is set.

This answers the point `12` left open — "where the Logger door lands when it is
opened cold". It is phone-local storage and needs no sign-in. Sign-in only
matters later, for carrying the memory between phones.

### A Waiting record against a whole phase

`01` allows it and no control existed. The **Item dropdown carries it as its
first row**, and only when Type is Waiting: `Whole phase — Doors & Windows`.

No separate "attaches to" control. The record either names an item or it does
not, and one dropdown says which.

### The Logged here list

**A Cancel button on every row.** One tap, always visible, works with gloves.
Each row also carries its send state: a turning ring while it is on its way, a
grey slab when the phone is offline, a tick when it lands.

`12`'s rule holds: this list can Cancel a record and can never mark one Fixed.
Cancel is an undo of a typo made ten seconds ago. Fixing is a repair and belongs
to Tracker.

### The one-screen claim holds

Type, Item, Needed, Count, Reason and Save fit above the keyboard. **Six controls
is the whole budget.** Anything added to this form pushes Save off the screen,
which is the failure `12` chose this shape to avoid.

### The Tracker item record list

**Tap the flag to open.** The item row stays one line, and the unit reads as a
short list again. An always-open list was drawn first and rejected: three records
push the next item down about 150px, and a unit with several flagged items stops
being glanceable.

**The Details box is dropped.** Miguel, 2026-08-08: 0.1 is not usable and the
Details button was only a placeholder, overtaken by the Logger door. So there is
nothing to migrate and no note to find a home for. Its column also comes out of
the master template — a column the app never reads is a trap, because a note
typed on a computer would be invisible on every phone. See `13-admin-changes`.

Dropping it gives the item row its width back. With Details on, "Door Hardware"
wraps to two lines beside a flag chip and a status control.

**Both flag kinds show, each with its own count**, as `11` ruled. A red chip for
Deficiency, a blue one for Waiting.

**A phase-level Waiting record draws on the phase header, and its flag is a
button too.** Miguel caught this on 2026-08-08: the first build drew phase
records open no matter what, which made tap-to-open a rule with a hole in it. A
phase sits above seven items, so a phase drawn open costs more height than any
item does. **One rule, no exception: a flag is a button and its records stay shut
until it is tapped.** The phase header is still the only place in Tracker a
phase-level record can be seen or closed.

**`Fix all` is the bulk action**, on the item, when it holds more than one open
record. A phase with more than one open Waiting record gets the same control.
Fixing the last one on a phase offers nothing, because a phase has no Progress
dropdown to set — the flag simply clears.

**One bulk candidate is dead, and this ticket kills it.** The ticket listed "a
prompt when the dropdown moves to Complete while records are open". `11` and `05`
grey Complete out and make it untappable while a flag is open, so that gesture
cannot happen. It is not a design choice any more; it is impossible.

**The idea comes back somewhere legal.** Fix the last open record on an item and
a green card asks once: *Every record on Interior Doors is fixed. Set it to
Complete?* with `Set Complete` and `Not yet`. It asks. It never sets by itself,
so `01`'s rule that Progress is always manual is untouched.

### A fixed record leaves Tracker

**Tracker shows what is wrong now.** A record marked Fixed is gone from the item.

**With one exception, for exactly one visit.** The record you just fixed stays in
place, greyed and struck through, with `Fixed · Undo`. Leave the unit and it is
gone. Without this a mis-tap is unrecoverable on the phone, because there is
nowhere on the phone left to find it.

Nothing moves in the Sheet. The record keeps its row in the Deficiencies tab with
`Fixed` in the state column and a closed date, exactly as `01` and `02` settled.
"Leaves Tracker" means Tracker stops drawing it.

A grey tick chip that kept the history on the item forever was offered and
rejected. It puts a chip on every item ever worked, which is the clutter Tracker
exists to avoid.

### Where the history goes instead: Archive, and Archive is 0.3

Miguel corrected the map's model of Archive on 2026-08-08, and the correction
matters enough to write here, because this ticket now depends on it.

`14-building-archive` assumed Archive was **a list of finished buildings**. It is
not. Archive is **the history door**, and it also knows which buildings are
finished:

| Case | What Archive holds |
|---|---|
| Building still active | its fixed records, so Tracker stays lean |
| Building 100% complete | every fix ever done to it |
| Finished, then a GC finds a problem | it must be possible to pull the building back out |

Shape, chosen 2026-08-08: **a tree, like Tracker** — Archive, Building, Floor,
Unit, then the closed records on each item. The building list carries a tag on
each row, `ACTIVE` or `CLOSED`, with both kinds in one list and no second
screen.

**Archive does not ship in 0.2.** Miguel proposed a guideline the same day:
**aim for one new window per MINOR release.** He was clear it is a suggestion
against scope creep and not a law, so a second window is an argument to have, not
a refusal. Archive lost that argument on its own size. 0.2 already spends its
window on Logger. See the note below on the Outbox, which won it.

**So 0.2 loses on-site history, deliberately.** A fixed record disappears from
the phone when you leave the unit and is readable only in the Deficiencies tab,
on a computer, by filtering the state column. Miguel accepted this on
2026-08-08: the crew does not start using the app until 0.4 or 0.5, so a
disappearing log costs nobody anything, **as long as the record really is marked
Fixed in the Sheet.** That is the one thing 0.2 must not get wrong.

### The seams 0.2 owes Archive

Three, and none of them cost 0.2 any work beyond not closing a door:

1. **`get-project` must return closed records, not only open ones.** `03` returns
   the whole building in one answer. Filtering closed records out of that answer
   to save space would force Archive to invent a new server call later.
2. **The Hub gets a greyed `Archive` card**, beside `Deficiencies` and
   `Materials`. `control/index.html` was built for exactly this, and a greyed
   card is the obvious opening Miguel asked for.
3. **A dropped local copy must be able to come back on demand.** `03` drops
   buildings, and `14` already owes 0.3 this seam. Archive holding closed
   buildings makes it load-bearing rather than theoretical.

### The Outbox, and the one-window guideline

0.2 also adds the **Outbox** screen, from `05-pending-state-ui`. That is a second
new window in one MINOR release, so the guideline puts it up for argument.

**It wins the argument.** `04` ruled that a held edit is never dropped by the app
and that only Miguel drops one. That requires a screen with a Drop button on it.
There is no version of 0.2 that obeys `04` and has no Outbox. The window is not
a feature here; it is the only place a rule already decided can live.

### What this changed elsewhere

- **`13-admin-changes`** — gains one item: the Details column comes out of the
  Tracker tab in the master template. Its existing question about who edits the
  reason lists is now shared with the new ticket below.
- **`14-building-archive`** — its model is replaced by Miguel's, above. Its scope
  narrows: 0.2 decides the **rule and the seam**, not the door. The door is 0.3.
- **`17-reason-list-scope`** — new. Miguel asked for the reason lists to depend
  on the item and not only the phase, and asked for a fresh ticket rather than
  reopening `01`.
- **`09-write-0.2-build-plan`** — the build plan gains the Details column
  removal, the greyed Archive card, and the `get-project` note above.
- **`03-local-copy-rules`** — unchanged, but its answer must include closed
  records. Written into the build plan, not reopened.

### Not decided here

- **What a note that is not a problem does in 0.2.** Nothing. The Details box is
  gone and no replacement was asked for, because it was never used.
- **Whether an Outbox row taps through to its unit.** Still `05`'s open point,
  still left to the build plan.

## Amended by `17-reason-list-scope`, 2026-08-08

**The six-control budget becomes seven, on an item that defines types.** This is
the one thing on this ticket that `17` breaks, and it needs re-checking against
`prototypes/06-logger-and-records.html` before the build plan is written.

`17` gave the needed line one dropdown for the type. It appears **only** on an
item that defines types, so most of the form is untouched:

    LOGGING A DOOR                LOGGING A BASEBOARD

    Type      [ Deficiency ▾ ]    Type      [ Deficiency ▾ ]
    Item      [ Interior Doors ▾] Item      [ Baseboards ▾ ]
    Door type [ Bypass ▾ ]  ← new Needed    [ 5 1/4 MDF   ]
    Needed    [ 32" 6" RH   ]     Count     [ 12 ]
    Count     [ 1 ]               Reason    [ Damaged ▾ ]
    Reason    [ Wrong Type ▾ ]              [ Save ]
              [ Save ]
                                  6 controls, unchanged
    7 controls

This ticket's finding was that six controls is the whole budget, because anything
more pushes Save under the keyboard. **That finding is not overruled — it is a
constraint the build now has to meet at seven.** Options the build plan should
weigh: putting the type dropdown and Count on one row, or letting the place bar
collapse once a place is set.

Two smaller consequences:

- **The Reason dropdown reads from a different place.** It no longer follows the
  phase. It reads the building's one list of eight, minus whatever the chosen
  item trims. The control does not change, only its source.
- **The record list gains the subtype.** A row now reads `Bypass · 32" 6" RH`
  rather than `32" 6" RH`, because `17` put the type in its own Sheet column.

Everything else on this ticket stands: the field order, the phone remembering the
building and the phase but never the unit, tap the flag to open, `Fix all`, the
dropped Details box, and a fixed record leaving Tracker greyed with Undo.
