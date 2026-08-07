# How a phase and a unit roll up from their items

Type: grilling
Status: resolved
Resolved: 2026-08-07
Blocked by: 01, 02

## Question

What status does a phase show, and what status does a unit show, once progress
and problems are two separate things?

**Scope widened on 2026-08-06.** This ticket now owns the whole status model on
the Unit Tracker tab, not only the worst-wins order. It took the rollup question
back from `02-deficiencies-tab-layout`, so the decision lives in one place. It
now waits on `02`, because it cannot say how a flag is worked out until it knows
how a record is stored.

It also owns:
- Which columns a unit row holds once Progress is three values and Deficiency and
  Waiting are flags. The old five-value status column has to change.
- Whether a flag comes from a Sheet formula that reads the Deficiencies tab, or
  whether the app works it out from the records it already holds. Formulas are
  harder to write to safely. See `07-apps-script-write-limits`.
- What the Dashboard tab counts, once the five columns no longer match the model.

Miguel raised this on 2026-08-06. He remembered that the current rule caused a
problem but not the exact case.

## The likely case, found while charting

The rule today is worst wins, in this order:

    Deficiency > On Hold > In Progress > Not Started > Complete

`ROLLUP_ORDER` in `control/shared/common.js` holds it, and `worst()` applies it.

Take a unit with 18 items, where 17 are Complete and 1 is Not Started. Not
Started sits above Complete in the order, so the unit reads **Not Started**. It
looks exactly like a unit that nobody has entered.

That is the rule hiding a nearly finished unit. It is very likely the problem
Miguel remembers.

**Confirmed on 2026-08-07.** Miguel's words: "in that case I just want it to show
in Progress."

---

## Resolution, 2026-08-07

### Worst wins is deleted

There is no order of precedence any more. `ROLLUP_ORDER` and `worst()` come out
of `control/shared/common.js`. The rule is now **unanimity, or In Progress**, and
it is expressed as counts.

For any group of items — a phase, a unit, a floor, a building — count:

| Symbol | Count of |
|---|---|
| `n` | items in the group |
| `c` | items whose Progress is Complete |
| `s` | items whose Progress is Not Started |
| `f` | open flags below the group, of either kind |

Then:

| Test | Reads |
|---|---|
| `n = 0` | nothing. A dash. |
| `c = n` and `f = 0` | **Complete** |
| `c = n` and `f > 0` | **In Progress** |
| `s = n` | **Not Started** |
| anything else | **In Progress** |

Read the tests in order. The first that matches wins.

Counts, not an order, is what makes this safe. A ladder of statuses invites a
question about which rung beats which. Arithmetic does not.

### An open flag blocks Complete. It never raises Not Started

Miguel chose this on 2026-08-07. A unit with all 18 items Complete and one door
on order reads **In Progress**, not Complete.

The reason: a unit is not finished while a problem is open. It also makes
`14-building-archive` much simpler — "every unit reads Complete" is enough on its
own to archive a building, with no second test for open records, because a unit
holding an open record cannot read Complete in the first place.

**The flag only blocks Complete. It does not push anything upward.** A unit with
nothing done and one Waiting record reads `Not Started ⏸1`. That is the truth:
no work has happened, and something is waiting. Raising it to In Progress would
be a lie.

### A flag blocks Complete on an item too. Amended 2026-08-07

An earlier draft of this resolution kept an exception: an **item's** Progress is
set by hand, so an item could read `Complete ⚑1` — the six-doors-hung example
from `CLAUDE.md` — while only computed rollups were blocked.

**Miguel rejected the exception the same day.** His words: "18/18 with a flag
should not be possible. Interior Doors cannot be complete if there is a
deficiency. So Complete should not be an option if there is a deficiency."

He confirmed that **Waiting blocks Complete as well**. If work cannot continue,
it is not done. One rule, no exceptions.

So:

> **The Progress dropdown does not offer Complete on an item that holds an open
> flag of either kind.** Fix or cancel the record first.

This is enforcement in the dropdown, not a rollup rule. `06-deficiency-entry-screen`
draws what a blocked Complete looks like on the item row.

**It makes the rollup simpler.** "Every item Complete" now already implies that no
item carries a flag, because a flagged item cannot be Complete. So the rollup's
`f > 0` test only has to catch **phase-level Waiting records**, which `01` allows
to attach to a phase and not to any item. Item-level flags can never reach it.

The count table above is unchanged. It is still correct, and one of its rows —
every item Complete with an open flag — is now reachable only through a
phase-level Waiting record.

**The split between Progress and Flags still stands.** It just loses the example
that was justifying it. Two reasons carry it instead: `In Progress · Waiting on
Painters` is two facts about one item, and one item often holds several problems
at once, each with its own needed line and count. One field holds neither.

### Not decided: an item that is already Complete when a flag arrives

Miguel was asked what happens when a deficiency is logged against an item that
already reads Complete. **He declined to answer here, and he was right to.** His
words: "if the Building has already moved to the Archive this gets complicated."

The answer depends on whether an archived building can be reopened, and that is
not settled. It moved to `16-post-completion-deficiencies`.

Until that ticket resolves, the rule above only governs a **new** setting of
Complete. An item already reading Complete when a flag lands is undefined, and
nothing in 0.2 may be built on a guess about it.

### The count shows beside the status

In Progress covers everything from one item touched to seventeen of eighteen
done. That is the same blindness as the old rule, moved one step over. So every
level shows a count of what is Complete below it.

```
FLOOR 2
  201  Complete      18/18
  202  In Progress   18/18  ⚑1
  203  In Progress   14/18  ⚑3  ⏸2
  204  In Progress    2/18
  205  Not Started    0/18
```

`202` reads oddly at first and then reads exactly right: everything is built, one
problem is open. That is a different unit from `204`, and the old rule could not
tell them apart.

**What the count counts, one level down:**

| Level | Count |
|---|---|
| Phase | its items |
| Unit | its items, across every phase |
| Floor | its units |
| Building | its units, not its floors |

Building counts units and not floors because "38/56 units" is a useful number and
"2/4 floors" is not.

*This table is my call, not Miguel's. It was not asked. Change it freely.*

### Both flags show, with counts

A Deficiency and a Waiting mean different things and lead to different actions. A
Deficiency is Miguel's work. A Waiting is somebody else's. So both show:

```
203  In Progress  14/18  ⚑3  ⏸2
```

This overrules the line in `CLAUDE.md` that says a Deficiency flag beats a
Waiting flag. There is no contest between them any more, because neither one is
a status. They are two separate counts and both are drawn.

### Where the rule is worked out: both, and the app trusts the phone

Miguel chose the two-implementation answer on 2026-08-07, so the Sheet still
reads correctly when it is opened directly in Google Sheets. That matters,
because the `CLAUDE.md` escape hatch depends on the Sheet being readable by hand.

**The drift risk is much smaller than it looked**, for two reasons:

1. `buildRollupFormula` in `control/appscript/Code.js` is **already** built out of
   `COUNTIF` calls. The new rule is counts. Both sides implement the same
   arithmetic, not a ladder that one side can order differently.
2. **The app never reads the Sheet's rollup column.** The phone holds every item
   and every record from `03-local-copy-rules` and totals them itself. So if the
   two ever disagree, the disagreement is cosmetic — a wrong word in a spreadsheet
   nobody's phone is reading — and not a wrong answer in the app.

The phone-side rule is the one that counts, and it must be written **once**, in
one function in `control/shared/common.js`, called by every screen.

The phone-side rule also updates instantly after an offline edit, before the save
has been sent. A formula cannot do that, because its answer lives on a server the
phone cannot reach.

### What changes in the code

- `control/shared/common.js`
  - `CYCLE` drops to three values: `not_started`, `in_progress`, `complete`.
  - `STATUS` keeps those three. Deficiency and Waiting move to a separate map,
    because they are flags and never appear in a dropdown.
  - `ROLLUP_ORDER` and `worst()` are **deleted**.
  - One new function replaces them. It takes a list of items plus the open
    records below them, and returns the status, the count and the two flag
    counts together. Every screen calls it. Nothing recomputes a rollup itself.
  - `on_hold` is renamed `waiting` throughout, per `01`.

- `control/appscript/Code.js`
  - `buildRollupFormula` is rewritten to the count rule. Its `Deficiency` and
    `On Hold` branches come out.
  - The flag count comes from a `COUNTIFS` against the Deficiencies tab: the
    unit key, and a state of `Open`. `02` fixed those columns.
  - `rebuildDashboard` counts units by the three Progress values, plus one more
    number: how many units hold an open flag. The old five columns no longer
    match the model.
  - Conditional formatting on the Tracker tab drops to three colours. The
    Deficiency and On Hold fills come out of `STATUS_FILLS`.

### Not decided here

- The exact drawing of the flag marks. `06-deficiency-entry-screen` and
  `05-pending-state-ui` own how a unit row looks with a flag count and a pending
  mark on it at the same time.
- Whether the count shows as a fraction or a bar. A fraction is written above.
  `05` may argue for a bar once forty units are on one screen.

### What this unblocks

`14-building-archive`. Its archive test is now one sentence: **a building is
archived when it reads Complete.** No second check for open records is needed,
because an open record already blocks Complete at every level.
