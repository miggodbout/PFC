# What one deficiency record holds

Type: grilling
Status: resolved
Blocked by: none

> **Nomenclature correction, added by `18-supersession-sweep` 2026-08-08. Every
> `32" 6" RH` below is stale text.** `15-suggestion-list` dropped the inch marks.
> The standard needed line is **`32 6 RH`**. The examples below are left as
> written, because the sweep does not rewrite a resolved ticket.
>
> **The hint is also gone.** This ticket sets the grey box text as
> `ex: 32" 6" RH`. `15` replaced it with a per-item placeholder that names the
> parts instead of showing an example: **`Size   Jamb   Swing`**, held as a
> `hint` key in `_Config`. See `supersessions.md` entry 39.

## Question

What fields does one deficiency record carry, and does an On Hold record use the
same shape or a different one?

Context. 0.2 allows several records under one item. An item such as "Interior
Doors" can cover six real doors, so it can hold several separate problems.

Points to settle:
- The field list. Candidates: what is wrong, how many, what is needed to fix it,
  a free note, the date, and the state of the record.
- Whether "what is needed" is free text or a countable line, such as
  `2 x passage lockset`. 0.5 adds up material orders, so a countable line matters.
- Whether an On Hold record uses the same fields with a different type, or a
  separate shape. Candidates for On Hold: what is awaited, from whom, and an
  expected date.
- Whether a record can be closed, and what closing it does to the item status.
- Whether a photo belongs on a record in 0.2.

## Answer

Settled with Miguel on 2026-08-06.

### The record

One record is one problem and one thing needed. A problem that needs two
different materials becomes two records. This keeps the screen flat and still
lets 0.5 add up materials.

Fields:

| Field | Holds |
|---|---|
| Type | Deficiency or Waiting |
| Attaches to | an item, or a phase (Waiting only) |
| Reason | one value from the phase's list |
| Other text | free text, only when Reason is Other |
| Needed | free text, such as `32" 6" RH`. Optional on a Waiting record |
| Quantity | a number |
| State | Open, Fixed or Cancelled — see the amendment below |
| Created | date |
| Closed | date, blank while open |

No photo in 0.2. No author. No promised date. Miguel's own example drove the
shape: `Bathroom Door, Wrong Swing, need a 32" (6" Jamb) RH`.

### What was dropped

A separate "which one" field, naming the physical thing. Miguel called it
unnecessary. The needed line identifies the thing in practice, better than a
label does. This is simpler than the sub-item level sketched in `CLAUDE.md`.

### The needed line stays free text

Proper fields per item type were rejected. Doors need width, jamb and hand.
Hardware needs function and finish. A custom item added through Admin has no form
at all, so a per-type form fights the standing rule that config drives structure.

Three things keep the wording consistent instead:
1. Suggestions from what was typed before, drawn across every project, offered as
   tap-to-pick buttons. Typing always stays available.
2. Grey hint text in the empty box: `ex: 32" 6" RH`. Width, jamb, hand. No
   brackets and not the word "Jamb". This teaches the nomenclature to a coworker
   at the moment they need it.
3. A cleanup step when a material order is exported. That is 0.5 work and sits on
   `.scratch/0.3-backlog.md`.

Miguel accepted that suggestions reduce the variation without removing it.

### The reason list follows the phase, not the item

Miguel first proposed dropping the reason field, because no single list fits both
a door and a lockset. The pushback held: the reason is the only field that
separates a supplier error from a freight claim, a GC backcharge, and a delivery
that never came. Four records can carry the same needed line and have four
different outcomes, three of them involving somebody else's money.

The list problem was fixed instead. Admin offers exactly three fixed phases, and
a custom item always lands inside one, so a per-phase list never breaks:

- **Doors & Windows** — Wrong Swing, Wrong Size, Wrong Type, Damaged, Warped,
  Missing, Other
- **Baseboards** — Wrong Size or Profile, Damaged, Warped, Missing, Other
- **Hardware & Accessories** — Wrong Type, Wrong Finish, Damaged, Defective,
  Missing, Other

Waiting reasons, one shared list: Waiting on Another Trade, Awaiting Delivery,
Backordered, Site Not Ready, Other.

`Other` always opens an optional free text box.

Store these lists in the project config, not in the app. Admin cannot add a phase
today, and staircase work will need one. See `.scratch/0.3-backlog.md`.

### Progress and problems are two separate things

This is the largest change on the ticket, and it changes the five statuses in
`CLAUDE.md`.

- The dropdown stays fully manual, with three values: **Not Started, In Progress,
  Complete**. It answers how far the work got.
- **Deficiency** and **Waiting** stop being dropdown values. They become flags
  that appear when an open record exists and clear when the last one is fixed.
  They answer whether something is wrong.

The reason: an item can be complete work with an outstanding problem. All six
doors hung, one on order. One field cannot hold both facts, so a manual status
lies and an automatic status takes the dropdown away.

`On Hold` was renamed to **Waiting**, so `In Progress · Waiting on Painters`
reads without contradiction. This also unlocks `Not Started · Waiting on
Delivery` — nobody began, because the material never came.

### A Waiting record can attach to a phase

Miguel's most common case is "Phase 1 complete, Phase 2 waiting on painters".
Nothing is wrong with the baseboards. They cannot start yet. Forcing that onto an
item would put the reason in the wrong place.

- A **Deficiency** attaches to an item. Always. A defect is about a physical
  thing.
- A **Waiting** attaches to a phase or to an item.

Unit-level Waiting, such as no power on site, was not decided. It sits in the
map's fog.

### Fixing a record

A record is never deleted and never moved. It carries an Open or Fixed state and
a fixed date. History is kept for three reasons: evidence for a supplier claim,
so nobody orders the same door twice, and so 0.5 knows what is still outstanding.

There is no Archive tab in the Sheet. Miguel will filter the state column when he
reads the tab directly. An Archive view in the app is a filter over records the
phone already holds, so it costs nothing.

> **The last sentence is overruled, 2026-08-08.** `06-deficiency-entry-screen`
> made Archive a **window**, not a filter, and Miguel moved it to **0.3** under
> the one-window-per-MINOR guideline. It does not cost nothing, and 0.2 has no
> Archive view of any kind. The two sentences before it still hold: no Archive
> tab in the Sheet, and Miguel filters the state column when he reads it
> directly. See `14-building-archive` for the model and `supersessions.md`
> item 12.

Moving rows to an Archive tab was rejected on the research in
`07-apps-script-write-limits`: a move is a write plus a delete, it can half-fail,
and a retried save must be safe to run twice.

### Amended by `02-deficiencies-tab-layout`, 2026-08-06

The State field gained a third value, **Cancelled**. Open, Fixed and Cancelled.
Cancelled means the record should never have existed. It came out of the Admin
case in `02`: closing a mistaken record as Fixed writes a lie into the Sheet, and
0.5 shows a Fixed record to a supplier as proof of a repair. The Fixed date field
was renamed **Closed**, because Cancelled fills it too.

### Newly created by this ticket

- `10-tab-versus-installed-app` — created earlier from the storage research.
- `11-rollup-rules` — Miguel asked to revisit worst-wins. The likely fault was
  found while charting: 17 Complete and 1 Not Started makes a unit read Not
  Started.
- `12-logger-door` — Miguel asked whether Tracker becomes read-only, with a
  separate Logger door.

### Corrected by `17-reason-list-scope`, 2026-08-08

The old text below stays, because the reasoning in it is still the reasoning. Two
of its conclusions are overruled.

**1. The three per-phase reason lists are deleted.** There is now **one list of
eight per building**, plus a short trim per item naming the values that item does
not offer:

    Wrong Size · Wrong Type · Wrong Swing · Wrong Color · Missing ·
    Damaged · Defective · Other

`17` sorted Miguel's own list of variables and found that six of the eight apply
everywhere. Only `Wrong Swing` (doors) and `Wrong Color` (hardware and hinges)
vary. Three phase lists were maintaining a split that the data does not have.

This ticket's argument against per-item lists — that a custom item lands with an
empty dropdown — still holds and is what killed per-item **copies**. A custom item
now gets all eight and no trim, so it is never blank.

**2. `Warped` is renamed `Defective`.** Miguel's change. `Defective` already
existed on the Hardware list here. It means the thing arrived wrong from the
factory. `Damaged` means somebody hurt it after it arrived. Warranty claim, or
site handling.

**3. "The needed line stays free text" is narrowed.** It holds for width, depth
and swing, which are still typed. It no longer holds for the **type**, which
becomes one dropdown per item — eight door types, four handle types, nothing at
all on an item that defines none. See `17` and the correction on `12-logger-door`.

The Waiting list is **unchanged**. One shared list of five, and `17` confirmed it
can never narrow, because a Waiting record can attach to a whole phase where
there is no item to narrow against.
