# How the Building screen marks completion, flags and failed saves

Type: prototype
Status: open
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
