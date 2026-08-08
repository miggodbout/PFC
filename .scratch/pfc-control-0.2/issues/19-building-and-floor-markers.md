# How the Building screen marks completion, flags and failed saves

Type: prototype
Status: resolved
Resolved: 2026-08-08
Blocked by: nothing. Every input is resolved — `05`, `06`, `11` and `14` all
closed on 2026-08-07 or 2026-08-08.
Blocks: `09-write-0.2-build-plan`. Run this **before `18-supersession-sweep`**,
so the sweep still runs last and nothing makes it stale.

## Question

Three separate marks now have to land on the same two controls, and nobody has
drawn them together. What does a floor header look like, and what does a unit
chip look like, when a unit is part done, holds two kinds of flag, and has a save
that failed?

Build a rough, throwaway screen to react to. Do not build it into the app.

## Why this is a ticket and not a line in `09`

`11-rollup-rules` line 267 says plainly that **the exact drawing of the flag
marks is not decided there**, and hands it to `06-deficiency-entry-screen` and
`05-pending-state-ui`. Both then drew only what their own question needed:

- `06` drew the **Unit screen** — the item row and the phase header.
- `05` drew the **pending marks** — the ring, the red card, the sync bar.

So the Building screen's **floor headers and unit chips** were never drawn against
the finished model. `09` would have to invent them while also writing a build
plan, which is where a wrong line gets written down.

It became urgent on 2026-08-08. Miguel settled that a blocked unit is a
**phase-level Waiting record on Phase 1**, with no whole-unit level. If the chip
carries no flag mark, a blocked unit and an untouched unit look identical, and
you must open the unit to tell them apart. That is the case the mark exists for.

## What the screen holds today

`control/tracker/building.html`. Floors open one at a time, and **a closed floor
hides every chip under it.**

- **Floor header**, `floorHtml` at line 82 — label, `N units`, a status pill from
  `pillHtml(worst(statuses), 'sm')`, and a caret.
- **Unit chip**, `chipsHtml` at line 102 — the chip number and `dotHtml()`.
  Nothing else.

Note that `worst()` is **deleted by `11`**, so the floor pill is being rewritten
in 0.2 no matter what this ticket decides.

## Points to settle

1. **Does a unit chip carry flag marks at all?** `11` says every level shows both
   flag kinds with their own counts. A chip is small and a floor holds many. The
   honest options are a full chip with counts, a single silent dot that says only
   "something is flagged", or nothing on the chip and everything on the header.
2. **What a closed floor header must carry.** It is the only thing on screen for
   every unit under it. Rollup status, the count, both flag kinds, and any failed
   save all want to be there at once.
3. **Fraction or bar for the count.** `11` left this open by name at line 270 and
   guessed `05` would argue for a bar once forty units are on one screen. A
   fraction — `14/18` — is what is written everywhere today.
4. **The red-on-red collision.** `05` puts a **red dot** on the unit chip and the
   floor header for a **held edit**. `06` makes a Deficiency flag a **red chip**.
   Two red marks, one small chip, and they mean completely different things — one
   says a save failed, the other says something on site is broken. Decide both
   marks together or neither reads.
5. **How much fits before a chip stops being glanceable.** The whole point of the
   Building screen is answering "how is floor 2 doing" without reading. A chip
   carrying four marks is a paragraph.

## Rules this must obey

These are settled and are not reopened here.

- **Only a held edit marks the tree, never a waiting one** — `05`. A waiting edit
  paints the item on the Unit screen and nothing above it.
- **The count of waiting edits lives in the sync bar and nowhere else** — `05`.
  This ticket adds no second counter for edits.
- **Red is Deficiency and blue is Waiting** — `06`. The colours are fixed; how
  they are carried at this level is not.
- **An open flag blocks Complete but never raises Not Started** — `11`. A blocked
  unit with no work started reads `Not Started` with a blue flag, not `Waiting`.
- **Waiting is not a status in 0.2.** `theme.css:78` still holds the 0.1 blue on
  `.s-on_hold`, which drives a **dot** because On Hold used to be a status. The
  dot now shows Progress only.

## Check the answer one level up

The Tracking screen has the same shape one level higher — one row per building,
with a pill, and `14-building-archive` added a greyed row for a building that
went Complete during the session. **Do not widen this ticket to redesign
Tracking.** Just confirm the answer chosen here still reads on that row, and say
so, since a mark that only works two levels down is not finished.

## Asset

`.scratch/pfc-control-0.2/prototypes/19-building-markers.html`

Follow the pattern set by `05` and `06`: a throwaway file loading the real
`control/shared/theme.css`, with fake data covering the awkward cases — a floor
where every unit is clean, a floor mixing all three marks, a unit that is blocked
by a Phase 1 Waiting record with nothing started, and a unit holding a failed
save and a deficiency at once. Draw two or three variants and pick one.

## Reference

- `05-pending-state-ui` — the held-edit dot, the sync bar, and the rule that only
  held edits mark the tree.
- `06-deficiency-entry-screen` — red for Deficiency, blue for Waiting, and the
  flag as a button.
- `11-rollup-rules` — the counted rollup, the count beside the status, and the
  line that defers this drawing.
- `14-building-archive` — the Tracking row, and the greyed finished building.

---

## Resolution, 2026-08-08

### Three marks, three shapes

The marks were fighting because nobody had given them different **shapes**. They
have three now, and shape carries the meaning before colour does:

| Shape | Means | Where |
|---|---|---|
| Round dot | Progress | Grey, amber, green. Unchanged from 0.1. |
| Flag glyph | A flag on site | Red Deficiency, blue Waiting. |
| Corner badge, `!` | The phone could not save | Red, hanging off the chip's top right corner. |

**This is the answer to point 4, the red-on-red collision.** Neither red moved.
`05`'s failed save and `06`'s Deficiency simply never share a shape and never
share a place: the flag sits in the marks row under the chip number, the failed
save sits on the corner, outside the chip, cut away from it by a border in the
card colour.

Miguel was shown both, on unit 203, which holds a failed save and a deficiency at
once. `05`'s plain red dot puts two red dots on one 77px chip, meaning two
unrelated things — the app failed, and something on site is broken. He picked the
badge.

The `!` also matters on its own. Shape and a glyph both survive bright sun and
colour blindness. Two reds separated only by hue do not.

### Variant C is the pick: a bar, not a fraction

Three variants were drawn. **C won.**

- **A — marks only.** Chip carries a Progress dot and a flag per open flag kind.
  Every number lives on the floor header.
- **B — the chip prints `14/18`.** Rejected: twelve fractions on one floor is
  twelve numbers to read, on the screen that exists so you do not have to read.
- **C — a hairline bar** on the chip's bottom edge, coloured by Progress, and the
  same bar on the floor header beside its count.

**This closes point 3, fraction or bar, which `11` line 270 left open by name.
The answer is both, split by level:** a bar where you glance, a number where you
read. The Unit screen still prints the exact fraction, because that is the screen
where you are looking at items one at a time.

`11` guessed `05` would argue for a bar once forty units were on one screen. It
did not — `05` never drew this screen. The argument arrived here instead, and it
went the way `11` guessed.

**A unit with nothing started draws no bar at all, not an empty track.** An empty
track and a missing bar say the same thing, and floor 4 would otherwise carry
twelve marks that carry no news.

**The accepted cost:** a 60px bar cannot tell `15/18` from `16/18`, and a nearly
finished unit is the one you care about most. Miguel took it. The chip is a
target; you tap it and the Unit screen gives you the exact number.

### The count is units, not items

**A floor header reads `12 units · 5 done`. It does not read `148/216 items`.**

`11` writes the count as `14/18`, which is items, and `14` sends items up to
Tracking. Applied to a floor of 12 units that prints a four-digit fraction nobody
reads. The Building screen answers "how is floor 2 doing", and a floor is made of
units. **Items stay on the Unit screen, where you are actually looking at items.**

**This amends `14`, and it makes `14` cheaper, not dearer.** `14` rule 4 has
`list-projects` send *items* Complete and items total per building, and called the
cost close to nothing because `handleListProjects` already opens every Sheet.
**Checked in the code: it opens the Sheet but it does not read the item grid.**
`control/appscript/Code.js:194` calls `readOverallColumn`, which reads **one
column — the per-unit rolled-up status.** Counting units Complete out of that is
free. Counting items would mean reading the whole Tracker grid for every building
on the list.

So `list-projects` sends **units Complete, units total, and the open flag counts.**

**One thing this does not settle, and it is `18`'s to reconcile.** `14` rule 4
exists because the phone must not trust the Sheet's own `overall` word. Unit
statuses out of `readOverallColumn` are Sheet formula output too, one level down.
Whether that is close enough, or whether `list-projects` must send raw item
counts after all, is a conflict between `14` and this ticket. **It is written
here, and `18-supersession-sweep` runs next and owns the call.**

### A header reports what it hides

**Settled by Miguel on 2026-08-08, and it is the rule this ticket really found.**
His words: the flag counts and the not-saved chip should show only for a floor
whose units are hidden. Open the floor and every chip carries its own marks, so
repeating the totals on the header is noise on a screen he called busy.

| Floor is | Header carries |
|---|---|
| Closed | Label, bar, count, status pill, **both flag counts, the not-saved chip** |
| Open | Label, bar, count, status pill. Nothing else. |

**This finishes the rule `05` started.** `05` seam 2 says a held mark must roll up
through anything that can close, because `control/tracker/building.html` opens one
floor at a time and a dot inside a closed floor cannot be seen. The other half was
never written: **it rolls back down when that thing opens.** One rule, stated
whole: *a header reports what it hides.*

**The count, the bar and the status pill stay either way.** You cannot work those
out by eye from twelve chips. A flag count you can — the flagged chips are right
there in front of you.

**It does not fire on the Unit screen.** Phases there never collapse —
`control/tracker/unit.html:90` draws every phase open, always — so a phase header
keeps its own Waiting flag and every item keeps its own. `06` is untouched.

**Only one floor is open at a time**, so at most one header ever drops its marks.

**A flat project has no floor header at all, and needs no extra rule.**
`control/tracker/building.html:73` draws a flat project's one unnamed group as
chips with no header, because there is nothing to open or close. A flat project
therefore hides nothing, so under this rule there is nothing for a header to
report — the chips carry their own marks and the sync bar carries the saves.
Written down so `09` does not have to re-derive it.

### The floor header layout

Two lines, or three when there is a problem to report:

```
Floor 3                              ● In Progress   ⌄
▬░░░░░  12 units · 0 done
⚑1   ⚑2   ! 1 not saved
```

**The marks get a line of their own.** Left to trail the count and wrap where
they land, they break in a different place on every floor, which reads as a
mistake. A closed floor with nothing wrong never draws the third line, so only
floors with problems pay the height.

The Tracking row takes the same shape. A Tracking row never opens, so its marks
always show.

### Point 1, answered: the chip carries marks and no counts

**Both flag kinds show on the chip. Neither shows a number.** `11` says every
level shows both flag kinds with their own counts. On a 77px chip a count is a
number nobody reads, and the floor header above it already carries the totals.

**This narrows `11` at the chip, and only at the chip.** Every other level —
floor header, Tracking row, Unit screen — keeps its counts as `11` wrote them.

The case the ticket was opened for now works. **Unit 206** is blocked by a
Phase 1 Waiting record with nothing started. It reads a grey dot with a blue
flag, and it is the only chip on the floor that does. Before this ticket it was
identical to units 207 and 208.

### Point 5, answered: how much fits

A chip carries at most four marks — dot, red flag, blue flag, corner badge — and
that is the ceiling, not a target. It holds because nothing on it is a number and
nothing on it is a word. The bar costs no height, because it sits on the chip's
bottom edge rather than in the flow.

### Checked one level up

The Tracking screen reads with the same marks: bar, `48 units · 13 done`, both
flag chips, the not-saved chip, and the status pill. `14`'s greyed finished
building still reads — it goes to 45% opacity with a `FINISHED` tag, and its
green bar and Complete pill grey out with it.

The prototype draws all three rows so this could be confirmed rather than assumed.
**Tracking was not redesigned**, as the ticket asked.

### What changes in the code

`control/tracker/building.html`:
- `floorHtml` at line 82 is rewritten. `pillHtml(worst(statuses), 'sm')` goes,
  because `11` deletes `worst()`. The header gains the bar, the units count, the
  two flag chips and the not-saved chip, and the last three are drawn only while
  the floor is closed.
- `chipsHtml` at line 102 is rewritten. The chip gains the marks row and the bar,
  and its `aria-label` must say every fact the marks say — status, count, each
  flag kind, and the failed save — or the marks are decoration to a screen reader.

`control/tracker/index.html`: the Tracking row takes the same sub-line shape.

`control/shared/theme.css`: new classes for the flag glyph, the marks row, the
corner badge, the flag chips and the two bars. **Do not put these colours in the
HTML files** — the flag red and blue are `.s-deficiency` and `.s-on_hold` at
lines 77 and 78 today, and `on_hold` is renamed `waiting` by `11`.

`control/appscript/Code.js`: `handleListProjects` sends units Complete, units
total and the open flag counts, per the section above.

### The asset

`.scratch/pfc-control-0.2/prototypes/19-building-markers.html`

Opens straight from the file system, no server. It pins itself to 400px wide on a
desktop, because a 4-column grid stretched across a monitor lies about whether
three marks fit on a chip. **C, corner badge and units are the pick and load by
default.** A and B, the plain red dot, and the items count all stay switchable so
the pick can be compared.
