# What the Logger form and the record list look like

Type: prototype
Status: open
Blocked by: 01, 12

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
