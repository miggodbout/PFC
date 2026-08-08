# Does logging get its own door, separate from Tracker?

Type: grilling
Status: resolved
Resolved: 2026-08-07
Blocked by: 01

## Question

Should Tracker become read-only, with a separate Logger door for entering work?

Miguel raised this on 2026-08-06, at the end of the deficiency fields ticket. His
words: with this level of editing and logging, Tracker becomes "a menu in a menu
in a menu".

## Why it is worth asking

Tracker today is a drill-down built for looking: Tracking, then Building, then
Floor, then Unit. 0.2 adds status editing, deficiency records, waiting records,
and a pending state to that same path. Every one of those makes the looking
slower.

The standing rule in `CLAUDE.md` supports a split: "Many doors, one system.
Different users reach the same data through different views. Do not duplicate
data per view."

A split also lines up with the roadmap. 0.4 adds a QR door for trades and GCs.
That is a third door onto the same data, so the pattern is coming anyway.

## Points to settle

- Whether Tracker goes fully read-only, or keeps a quick status change.
- What the Logger door opens on. A unit picker, the last unit used, or a QR scan.
- Whether Logger is one long form per unit, or the same drill-down with editing
  switched on.
- What the Hub home screen holds. Today it is Tracking and Create. Candidates:
  Track, Log, Archive, Admin.
- Whether the split makes the offline queue simpler or harder. Edits would come
  from one screen instead of several.
- Whether this changes what `06-deficiency-entry-screen` prototypes. It probably
  does, so settle this ticket first.

---

## Resolution, 2026-08-07

### Yes. Logger is a separate door, and it is a form, not a second tree

The split is **by task, not by permission**. This is the part the ticket had
wrong at the start.

| Door | Shape | Answers |
|---|---|---|
| Tracker | A tree: Tracking, Building, Floor, Unit | "How is floor 2 doing?" |
| Logger | One form | "This one door is wrong." |

Both doors reach the same data. Neither door holds a copy of it.

The first argument against a split was that Logger would duplicate the
Building, Floor, Unit drill-down to arrive at the same Unit screen. Miguel
rejected that shape, and he was right. His words: "I do not need to see the
status of Baseboards, Windows and Hardware when I want to log a door."

Logger never draws a unit. It draws a form. The clutter is the point, and a form
has none.

### Logger holds records only

Logger enters deficiency and waiting records. It does **not** set Progress.

Progress stays on the Tracker unit screen, where eighteen items take eighteen
taps. Running a five-field form once per item to mark a unit Complete would be
much worse than what exists today.

So Tracker is **not** read-only. Tracker keeps its Progress dropdowns.

### The Logger screen

Place is set once. The record fields sit under it, and they clear after each
save. Miguel stands in one unit for a while, so the place fields must not be
asked again for every problem in the room.

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

Field by field:

- **Building** — a dropdown, from the buildings the phone holds.
- **Unit** — a text box. Type `201`. The app matches the text against the unit
  labels in the local copy and shows the floor it found under the box. **It does
  not assume that the first digit is the floor.** A building may number units in
  any way, and the local copy already holds the true answer. No match shows
  `No unit 201 in this building.`
- **Phase** — a dropdown, from the phases the project holds.
- **Item** — a dropdown, from the items that phase holds. Never a fixed list.
- **Needed** — free text. The hero field. See the next section.
- **Count** — minus and plus buttons. Starts at 1.
- **Reason** — a dropdown. The list follows the phase, as `01` settled.

Everything fits one screen. No scrolling to reach Save.

One step per screen was rejected: seven screens per record, and no view of the
whole entry before it is sent. One long scrolling page was rejected: the keyboard
covers the lower half of the screen when the needed line is typed.

### The needed line stays free text. Ticket 01 stands

Structured per-item questions were proposed during this session — Style, Width,
Depth and Swing for an Interior Door, each a dropdown, composed into the needed
line. Miguel rejected it and the reasoning is recorded here, because the idea
will come back.

**For:** dropdowns cut typing with gloves on, and they make the text identical
every time, so a 0.5 materials count is clean.

**Against, and this won:** dropdowns add taps to every entry and they add Admin
work to define the questions per item. The tool must stay fast at the moment of
entry. Bad data is corrected **once, at export**, by a person reading the list,
instead of being prevented at a cost paid on every door.

**Suggestions carry the load instead.** Past needed lines appear as tap targets
above the keyboard, ranked by what is typed most. The second `32" 6" RH` is one
tap, not typing — and a tapped suggestion is character-for-character identical to
the first one, so the export count stays clean without any dropdown. Typing stays
open and unrestricted.

This makes the suggestion list load-bearing, so it graduated from the map fog
into `15-suggestion-list`.

### Marking a record Fixed lives in Tracker only

Logger writes records. Tracker closes them. Miguel chose the crisp rule over the
convenient one.

The Tracker unit screen shows an item's open records with a Fixed button on each,
and a **Fix all** control on the item. That is where the bulk action carried from
`01` now lives.

**The cost, stated plainly:** repair a door while Logger is open, and you must
switch doors to close the record. Miguel accepted this. Fixing is a pass of its
own, and a pass ends in review, which is Tracker's job anyway.

**One exception, and it is not an exception to the rule.** The "Logged here" list
under the Logger form can **Cancel** a record, not mark it Fixed. Cancel is the
state `02` added for a record entered in error. Fixing is a repair and belongs to
Tracker. Cancelling is an undo of a typo made ten seconds ago, and sending a
person to another door to correct their own slip is bad. The two states never
mean the same thing, so the rule holds.

### After a save, Logger stays put

Building, Unit and Phase stay filled. The record fields clear. A short list under
the form shows what was logged here, with its send state.

```
─────────────────────────
 ✓ Saved · waiting to send
─────────────────────────
 Maple Ridge · 201 · Doors

 Logged here:
  · Interior Door 32" 6" RH x1 ⏳
  · Closet Door bypass      x1 ✓

   [  Log another item  ]
```

Four problems in one room means four saves and no walk back through Building and
Unit. The list is also where a typo is caught before the person leaves the room.

Jumping to the unit in Tracker after a save was rejected. It confirms the save
and then puts the person in the wrong place for the next one.

### The Hub gains a Log card

```
┌──────────┬──────────┐
│ Tracking │ Log      │
├──────────┼──────────┤
│ Create   │ Materials│
│ Job      │ (greyed) │
├──────────┴──────────┤
│ Reports  (greyed)   │
└─────────────────────┘
```

The `Deficiencies` card that is greyed out today is **not** turned on in 0.2. It
promised a list of open records across buildings. Nothing in this ticket needs
it, and the records are visible in two places already. It stays greyed.

`Archive` is not added here. `14-building-archive` owns that screen.

### The split makes the offline queue simpler

This was an open point and the answer is clear.

Records now have **one** producer: the Logger form. Progress has one producer:
the Tracker unit screen. Two kinds of edit, two screens, no overlap. Compare that
with the shape the ticket started from, where one Unit screen produced both.

`04-queued-edit-rules` must still handle both kinds, but it never has to work out
which screen a queued edit came from.

### What this changes elsewhere

- **`06-deficiency-entry-screen`** — its subject moved. It prototypes the Logger
  form above, plus the Tracker item record list with Fixed and Fix all. The
  "what happens the moment a status is set to Deficiency" point is dead: progress
  and flags split apart in `01`, and a status change no longer opens anything.
- **`13-admin-changes`** — no new Admin work comes from this ticket. The
  structured item questions that would have needed an Admin screen were rejected.
- **`14-building-archive`** — unblocked by this ticket. Its Hub card is still its
  own to decide.
- **`15-suggestion-list`** — new. Graduated from the map fog, because free text
  made suggestions load-bearing.
- **`control/index.html`** — the `CARDS` list gains one entry. That file was
  built for exactly this.

### Not decided here

- Where the Logger door lands when it is opened cold, with no place set. The
  form asks for Building first, and that is enough for 0.2. A "last unit used"
  memory and the 0.4 QR scan both fit the same slot later.
- Whether Logger can log against a phase with no item, which `01` allows for a
  Waiting record. The Item dropdown needs a "whole phase" choice. `06` draws it.

## Narrowed by `17-reason-list-scope`, 2026-08-08

**The rejection of structured per-item fields is narrowed, not reversed.** Read
the old text below as still correct about the thing it rejected.

This ticket rejected a **four-field form** on a door — Style, Width, Depth and
Swing — on speed, and on the argument that a custom item has no form at all.
Miguel confirmed on 2026-08-08 that he wants **width, depth and swing to stay
typed**. That part of the rejection stands untouched.

What he asked for is **one field**: the type. So the needed line gains a single
dropdown, above its text box, offering whatever types the item defines.

- **Interior Doors** — Regular, Bypass, Bi-fold, Double, Pocket, Double Pocket,
  Dwarf, Unit Door
- **Hardware** — Passage, Privacy, Dummy, Pocket
- **Windows, Exterior Doors, Baseboards** — none defined, **no dropdown appears,
  and the form is exactly as this ticket drew it**

The custom-item objection dies the same way it died on `01`: an item that defines
no types shows no dropdown at all. Nothing lands empty and nothing has to be
written before a new item works.

**Two lines in this ticket are now wrong:**

1. **"No Admin work comes from `12`."** There is Admin work now. Admin owns the
   type list per item, on an edit-item screen, Add-only. It lands on
   `13-admin-changes`.
2. **The form sketch.** It already missed the **Type** field that `06` added. It
   now also misses the Subtype dropdown. The sketch reads as final and is not —
   `06` and `17` together own the current form.

**The trade this ticket made is now partly paid in a different currency.** It bet
that suggestions would carry the consistency dropdowns would have bought.
`17` moved the riskiest part of that bet — a closed set of eight type words that
must match character for character before 0.5 can total them — onto a dropdown
and into its own Sheet column. Suggestions still carry the dimensions. See the
narrowing note on `15-suggestion-list`.
