# Pushed back — the v3 and later list

A plain list of work that came up, got decided against for now, and must not be
forgotten. This file outlives any one effort. It is not a plan. Each line says
what the work is, why it was pushed back, and what forces it to happen.

Started 2026-08-06, during the v2 charting. See `.scratch/pfc-control-v2/map.md`.

---

## Pushed back during v2 planning

### The script lock blocks every project at once

The backend takes one lock for the whole script. A write to Building A blocks a
write to Building B, even though the two Sheets have nothing to do with each
other.

- **Why it waits:** Miguel is the only editor in v2. One person cannot collide
  with themself, so the cost is nothing today.
- **What forces it:** the crew getting edit access. Several people on several
  units at once will queue behind each other for no reason.
- **The likely fix:** a lock per project instead of one lock for the script.
  `LockService.getDocumentLock()` exists for this, or a key built from the
  project id.
- **Source:** `.scratch/pfc-control-v2/issues/07-apps-script-write-limits.md`.

### Crew identity, sign-in, and who changed what

No sign-in in v2. Access stays unlocked, and the app records no author.

- **Why it waits:** it adds sign-in, an author column, and trust rules to a v2
  that is already large.
- **What forces it:** the crew getting edit access. A wrong change with no name
  on it cannot be traced or undone with confidence.
- **Note:** the v2 plan must leave a clean seam for Google login. Do not let v2
  make this harder.

### Two phones changing the same unit

No conflict rule in v2. The last write wins, silently.

- **Why it waits:** one editor.
- **What forces it:** the crew getting edit access. Tied to the two items above.
  These three arrive together.

### Admin cannot add, rename, or remove a phase

Admin only ever offers the three phases in `DEFAULT_PHASES`: Doors & Windows,
Baseboards, and Hardware & Accessories. A custom item goes inside one of those
three. The backend is more general and accepts any phase list, so the limit sits
in the Admin screen, not in `Code.js`.

- **Why it waits:** the app is built for Miguel and one coworker, who both work
  inside those three phases.
- **What forces it:** the two higher-ups do staircases. Staircase work is a whole
  phase, not an item inside an existing phase. The moment their work goes into
  the app, this blocks.
- **Note for v2:** the per-phase "what is wrong" lists must be stored in the
  project config, not hardcoded in the app. Then a new phase can carry its own
  list later with no rework. This follows the standing rule in `CLAUDE.md`:
  config drives structure, not code.
- **Source:** raised 2026-08-06 while deciding the deficiency record fields.

### Items that apply to only some units in a building

A custom item today goes on the whole building. Every unit gets it. If only unit
301 has a wet bar, every other unit shows a "Wet Bar" line that has to be marked
Complete to keep the numbers clean.

- **Why it waits:** it is a structure problem, and structure belongs to Admin.
  Adding it to v2 risked the rest of v2.
- **What forces it:** a building with real unit-to-unit variation, or Miguel
  getting tired of the polluted counts.
- **Size:** its own effort. Worth its own map.

---

### A cleanup step when a material order is exported

The needed-material line is free text. Suggestions and the hint text
`ex: 32" 6" RH` reduce the variation, but they do not remove it. Two people will
write the same door two ways, and the totals will split.

- **Why it waits:** it belongs to v5, where the export is built. There is nothing
  to clean up until something exports.
- **What forces it:** the first real material order that comes out split across
  near-identical lines.
- **The likely fix:** a review screen before export that groups near matches and
  lets a person merge them by hand.
- **Source:** raised by Miguel 2026-08-06 while deciding the deficiency fields.

---

## Review later, not tied to one version

### File sprawl in control/

CLAUDE.md says to favour small, separate files over large ones. The rule is
sound, but it has a failure mode: thirty small files where six would do, and
nothing is findable.

- **The check:** when `control/` starts feeling scattered, read the folder and
  ask whether any files exist only because the rule said to split.
- **Why nothing is done now:** the folder is still small. Acting early would
  cost more than it saves.
- **Source:** raised by Miguel 2026-08-06, during a CLAUDE.md review.

---

## Known and accepted, no action planned

### The CORS technique carries no promise from Google

The app avoids a browser check by labelling its data as plain text. This follows
the web standard and works today. Google has never documented how Apps Script
handles this, so Google could change it without a release note.

- **Why nothing is done:** the app already has a second path (JSONP) that works
  when the first one fails. The insurance is in place.
- **What forces it:** saving starts failing for everybody at once, with no change
  on our side. Check this first if that ever happens.
- **Source:** `.scratch/pfc-control-v2/issues/07-apps-script-write-limits.md`,
  section 6.
