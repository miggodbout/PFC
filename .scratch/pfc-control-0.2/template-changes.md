# Changes needed in the master template

**Status: FINAL, 2026-08-08.** Marked by `18-supersession-sweep` on its second
pass. **Build from this file.**

| Section | Status | Waits on |
|---|---|---|
| 1. The Deficiencies tab | **FINAL** | nothing |
| 2. The status column and its dropdown | **FINAL** | nothing |
| 3. The rollup formulas | **FINAL** | nothing |
| 4. Remove the Details column | **FINAL** | nothing |
| 5. The lists held in `_Config` | **FINAL** | nothing |
| 6. The Dashboard tab | **FINAL** | nothing |
| 7. What is not changing | **FINAL** | nothing |
| 8. Nothing left unknown | **FINAL** | nothing |
| 9. The default item list | **FINAL** | nothing |

**What FINAL means here.** Every 0.2 ticket that could change a template column
has closed, and the second sweep checked this file against all of them. It is a
**spec**, not a discussion — a build session follows it as written and does not
have to weigh it against anything.

**What FINAL does not mean.** It does not freeze the app. `19` and the
`list-projects` payload change nothing in the Sheet: they are server and phone
work. If a later ticket ever does need a column, say so here and drop this line
back to a section status.

History: the old file said "PROVISIONAL, do not start work yet" across the whole
thing, which stopped being true section by section as tickets closed. The first
sweep replaced that with per-section statuses on 2026-08-08. Section 5 went FINAL
and section 9 was added when `13-admin-changes` closed. Section 8 emptied when
`15-suggestion-list` closed, and the second sweep marked the file whole.

Template in Drive: `PFC/Master Template/PFC_Master_Template.xlsx`
ID `1QIF5TCJ0iekpNGHEjce1PSoFXRFhucmF-ednTSYHT-M`
Local reference copy: `reference/PFC_Master_Template.xlsx`

No existing project Sheet needs an upgrade. Drive holds test projects only. The
plan changes the template, trashes the test Sheets, and makes the real building
fresh.

**One thing to know before reading.** `handleCreateProject` in
`control/appscript/Code.js` does **not** copy this .xlsx file. It builds every
Sheet in code, because the template is fixed at 36 units and 17 items and every
real project differs. The template is the visual specification. So every change
below is really two changes: the .xlsx, and the code that reproduces it.

---

## 1. A new tab: Deficiencies — FINAL

Settled in `02-deficiencies-tab-layout`, widened to thirteen columns by
`17-reason-list-scope` on 2026-08-08.

One row per record. A record covers a deficiency or a waiting reason. The tab
holds every record together, open and closed. There is no Archive tab. Filter the
state column when you read the tab directly.

One header row. Data starts on row 2. Freeze row 1 and add a filter. This tab is
a plain list, unlike the Unit Tracker tab and its six header rows.

**Thirteen columns.** The header row holds these keys, not labels:

| Col | Name | Holds | Notes |
|---|---|---|---|
| A | `record_id` | `d-20260806-1422-a7f3` | Made on the phone, not the server |
| B | `unit` | the unit key | Ties the record to a unit |
| C | `phase` | the phase key | Always filled |
| D | `item` | the item key | From `slug()`, not the label. **Blank means the record is on the whole phase** |
| E | `type` | `Deficiency` or `Waiting` | Decides which reason list applies |
| F | `reason` | one value from the building's list of eight | See section 5 |
| G | `other_text` | free text | Only when the reason is `Other` |
| H | `subtype` | `Bypass`, `Privacy` | **Blank on an item that defines no types.** Added by `17` |
| I | `needed` | free text, such as `32 6 RH` | Optional on a Waiting record |
| J | `quantity` | a number | How many are needed |
| K | `state` | `Open`, `Fixed` or `Cancelled` | The filter column |
| L | `created` | date, `yyyy-mm-dd` | A real date cell, not text |
| M | `closed` | date, `yyyy-mm-dd` | Blank while the record is Open |

Notes for the build:
- **New rows go on the bottom, always.** The tab is a chronological log.
- The server finds a row by reading column A whole in one call, then matching in
  memory. Not one search per record.
- If the id is already in column A, the server overwrites that row. This is what
  makes a retried save safe.
- `rebuildTracker` must never touch this tab. Confirmed safe by reading the code:
  it operates on one named sheet object and there is no spreadsheet-level clear
  anywhere in `Code.js`. See `code-inventory.md`, FINDING 6.
- The `Attaches to` column from the earliest draft is dropped. A blank `item`
  already carries that fact.
- `subtype` is a **column and not part of the needed text**, because 0.5 totals
  materials and reading a type out of free text means matching words.

## 2. The status column and its dropdown — FINAL

Settled in `01-deficiency-record-fields` and `11-rollup-rules`.

**The per-item Status column now holds three values, not five:**

    Not Started · In Progress · Complete

`Deficiency` and `On Hold` come out. They were never progress. They are flags,
and a flag lives in the Deficiencies tab as an open record.

- The data validation list on every item Status column drops to those three.
  `allowInvalid` stays true, as the template has it.
- The conditional formatting drops from five rules to three. The `Deficiency`
  and `On Hold` fills come out of `STATUS_FILLS` in `Code.js`.
- `On Hold` is renamed **Waiting** wherever the word survives.

The three fills stay as the template has them: `#EFEFEF` Not Started, `#FFEB9C`
In Progress, `#C6EFCE` Complete.

## 3. The rollup formulas — FINAL

Settled in `11-rollup-rules`. **Worst-wins is deleted.**

The rule is unanimity or In Progress, counted rather than ordered:

| Test | Reads |
|---|---|
| No items | A dash |
| Every item Complete, no open flag | Complete |
| Every item Complete, an open flag | In Progress |
| Every item Not Started | Not Started |
| Anything else | In Progress |

Two things compute this, on purpose:

1. **The phone**, from the local copy. This is the one that counts. The app never
   reads the Sheet's rollup column.
2. **The Sheet**, so it still reads correctly when Miguel opens it directly. That
   matters, because the `CLAUDE.md` escape hatch depends on the Sheet being
   readable by hand.

`buildRollupFormula` is rewritten to the count rule. Its `Deficiency` and
`On Hold` branches come out. The open-flag test is a `COUNTIFS` against the
Deficiencies tab, matching the unit key and a state of `Open`.

**Drift between the two is cosmetic and accepted.** Both sides do the same
arithmetic — the existing formula is already built out of `COUNTIF` calls — and
the phone-side answer is the only one the app uses. A disagreement is a wrong
word in a spreadsheet nobody's phone is reading.

Do not change any rollup formula by hand. `Code.js` rebuilds every rollup from
`buildRollupFormula`, so a hand edit is overwritten.

## 4. Remove the Details column — FINAL

Settled in `06-deficiency-entry-screen`, 2026-08-08.

The 0.1 Details box is dropped. Every item loses its Details column from the Unit
Tracker tab, and the Details button leaves `control/tracker/unit.html`.

Miguel's reason: 0.1 is not usable and the button was only a placeholder. **A
column the app never reads is a trap** — a note typed on a computer would be
invisible on every phone.

**This is bigger in the Sheet than it looks.** `computeLayout` in `Code.js` gives
every item two columns, Status then Details. Removing one halves the per-item
column count, which moves the phase rollup columns, Last Updated and Overall
Status, and rewrites every formula address. Nothing stores a column position —
the comment at `Code.js:522` says positions are worked out from the item order
every time — so this is a change in one function plus the four places that read
`detailsCol`. The documented layout in the comment at `Code.js:636`
("status columns C to AK, rollups AM to AP…") becomes wrong and must be rewritten
with it.

## 5. The lists held in `_Config` — FINAL

> **Section 3 of the old file is deleted, not amended.** It defined three
> per-phase reason lists. `17-reason-list-scope` closed on 2026-08-08 and
> replaced them. Do not build from any copy of the old lists.

Two lists live in the hidden `_Config` tab. **Both are Add-only. There is never a
Delete button**, which is what makes the Sheet safe by itself: no row can point
at a value that no longer exists.

### Reasons — one list of eight per building

    Wrong Size · Wrong Type · Wrong Swing · Wrong Color ·
    Missing · Damaged · Defective · Other

Six of the eight apply everywhere. Only `Wrong Swing` and `Wrong Color` vary, so
each item carries a short **trim** naming the values it does not offer. One list
plus a trim, not eighteen copies — otherwise "add a reason to everything" is
eighteen edits instead of one.

- **`Warped` is renamed `Defective`.** It means the thing arrived wrong from the
  factory. `Damaged` means somebody hurt it after it arrived.
- **`Wrong Size or Profile` no longer exists.** It was on the old Baseboards list.
- A **custom item gets all eight and no trim**, so it is never blank.
- `Other` always opens an optional free text box.
- **The trim is about responsibility, not about the item.** Miguel's Exterior
  Doors case set this: the framer hangs patio and entry doors, so `Wrong Swing`
  comes off even though the door plainly swings. Ask "does PFC own this", not
  "can this item have this".

### Types — per item, feeding the `subtype` column

> **The lists in this block were rewritten by `13-admin-changes` on 2026-08-08.**
> `17` wrote them against `Hardware` and `Baseboards`, which are **phases, not
> items**, and its four handle types were already three separate items. Miguel
> fixed it by collapsing those items into subtypes. See **section 9** for the
> full new item list.

**Four items define a list. Every other item defines none and shows no dropdown.**

- **Interior Doors** — Regular, Bypass, Bi-fold, Double, Pocket, Double Pocket,
  Dwarf, Unit Door
- **Exterior Door(s)** — Patio, Entry
- **Handles** — Passage, Privacy, Dummy, Pocket
- **Stops** — Spring, Hinge

**Every subtype list ends with `Other`, which opens a text box.** Added by Miguel
on 2026-08-08, matching what `Other` already does on the reason list. The typed
text is stored in the `subtype` column as a per-record value. **It does not join
the list** — a one-off stays a one-off, and making it permanent is an Admin Add.

### The Waiting reason list — never varies

    Waiting on Another Trade · Awaiting Delivery · Backordered ·
    Site Not Ready · Other

Confirmed by `17` as fixed. It can never narrow per item, because a Waiting
record can attach to a whole phase where there is no item to narrow against.

### The exact shape in `_Config`

Settled by `13-admin-changes`, 2026-08-08. The lists join the JSON object already
in cell A1. `writeConfig` and `readConfig` read and write the whole object in one
call, so nothing about the storage itself changes.

    {
      "version": 2,
      "name": "...", "mode": "floors", "createdAt": "...",
      "groups": [ ... unchanged ... ],
      "reasons": ["Wrong Size", "Wrong Type", "Wrong Swing", "Wrong Color",
                  "Missing", "Damaged", "Defective", "Other"],
      "phases": [
        { "key": "phase1", "label": "Phase 1 - Doors & Windows", "items": [
          { "key": "interior_doors", "label": "Interior Doors",
            "types": ["Regular", "Bypass", "Bi-fold", "Double",
                      "Pocket", "Double Pocket", "Dwarf", "Unit Door"],
            "trim":  [],
            "hint":  "Size   Jamb   Swing" }
        ]}
      ]
    }

- **`version` rises from 1 to 2.** There is no upgrade path, so the version exists
  to let the code refuse a version-1 Sheet with a clear message instead of drawing
  it wrong.
- **`trim` holds the reason strings the item does not offer**, matched exactly
  against `reasons`. An empty trim means all eight are offered.
- **`hint` holds the placeholder text for the needed box**, added by
  `15-suggestion-list` on 2026-08-08. It names what each part of the needed line
  means, in crew words: `Size   Jamb   Swing`, not width and depth. It is grey
  text **inside** the empty box, so it costs no screen height and disappears at
  the first character — `06` measured the control budget and `17` already spent
  the last of it. **One hint per item, never per subtype.** A bypass door has no
  swing, and that is accepted: the hint is a reminder, not a rule, and thirty
  per-subtype strings against fourteen per-item ones was not worth it. An optional
  per-subtype override is logged in `.scratch/0.3-backlog.md`; this shape leaves
  room for it.
- **A custom item arrives with `types: []`, `trim: []` and `hint: ""`.** It offers
  all eight reasons, shows no subtype dropdown, and shows no placeholder. Ship
  `hint` filled where it is obvious and blank elsewhere, the same rule as the
  trim below. A blank hint is never wrong, only less helpful, and Admin fills it
  in without a release.
- **The Waiting reason list is not stored per building.** `17` confirmed it never
  varies, so it is a constant in `common.js`.

### The default trim ships empty

`17` ruled the trim is content and Miguel writes it. He asked for more time on
2026-08-08, and the item list changed under it the same day, so what he writes is
now against fourteen items. **It does not gate the build.** Ship every item with
an empty trim — all eight reasons everywhere — and narrow them afterwards through
the Admin Lists card. An empty trim is never wrong, only wider than it needs to
be.

### The master template is a drawing, not a seed

`17` assumed the template updates by hand and did not settle it. `13` settled it,
and the question was built on a wrong picture. **`handleCreateProject` never
copies the .xlsx** — see the note at the top of this file, and `Code.js:352`,
which calls `SpreadsheetApp.create` on an empty file. So:

- **The real seed is `DEFAULT_PHASES` and the default lists beside it in
  `control/shared/common.js`.** Changing what new buildings get is a code change
  that ships in a release.
- **The .xlsx is updated by hand to match**, as the visual specification.
- **A value added in Admin stays in that building.** It never reaches the next
  one. `13` rejected a shared defaults store: it is hidden state with no screen,
  and because lists only grow, one typo would follow every future job.

One rule belongs to the build: **a list change must not rebuild the Tracker tab.**
Adding a type or a reason changes no columns. Today every branch of
`applyStructureOp` is followed by `rebuildTracker`, `rebuildDashboard` and
`writeConfig`. A list change needs `writeConfig` alone. That is a new code path,
not a new branch on the old one.

## 6. The Dashboard tab — FINAL

Settled in `11-rollup-rules`, measured in `code-inventory.md`.

The Dashboard counts units by status. Five status columns become **four
numbers**: the three Progress values, plus how many units hold an open flag.

With the label column that is **five columns wide, not six**. Two literal sixes
in `rebuildDashboard` carry the old width — `resizeSheet(sheet, rowCount, 6)` and
the column-width loop just after it. The three `STATUS_VALUES.forEach` loops fill
the right number of columns by themselves once the list is three long.

## 7. Settled: what is NOT changing — FINAL

- **No Archive tab.** Records are never moved. Filter the state column when you
  read the Deficiencies tab directly.
- **No photo column.** Photos are not in 0.2.
- **No author column.** There is no sign-in in 0.2.
- **No promised or target date column.**
- **Records are never deleted.** Admin refuses to remove an item that holds an
  open record. Closed records stay in the tab as history, even when their item
  leaves the job.
- **The six header rows on the Unit Tracker tab.** The printed look is unchanged.

## 8. Nothing left unknown — FINAL

Both items that sat here are answered. **This section is now empty on purpose.**

- ~~Where the needed-line suggestion text is stored.~~ **Answered by
  `15-suggestion-list`, 2026-08-08. The template takes no change.** The seed list
  was deleted outright: chips are built from records on the phone, across every
  building it holds, plus a phone-local history index that is not a Sheet at all.
  No `_Config` list, no new tab, no new column.
- ~~Whether `03`'s archived-building drop fires in 0.2.~~ **Answered by
  `14-building-archive`, 2026-08-08. It fires.** It changed no template column
  either way, as expected.

`15` did add one thing to this file, but to **section 5**, not here: a **`hint`**
key per item in `_Config`, for the needed box placeholder.

**Swept 2026-08-08 by `18`.** The one `32" 6" RH` example this file carried is now
**`32 6 RH`**, in section 1 column I. `15` dropped the inch marks. Nothing else in
this file used the old form.

## 9. The default item list — FINAL

Added by `13-admin-changes` on 2026-08-08. **This is a change to the template's
own structure, not only to the code that reproduces it.** The template is fixed at
36 units and 17 items. It becomes 36 units and **14 items**.

### Why it changed

`17-reason-list-scope` wrote its subtype lists against `Hardware` and
`Baseboards`. Neither is an item — both are phases. Its four "handle types",
Passage, Privacy, Dummy and Pocket, **were already three separate items** in Phase
3, so a dropdown of them would have asked the same question twice.

Miguel's fix went further than the error: **collapse the repeating items into
subtypes.** His words on 2026-08-08 — "listing all door handles as `Handles` keeps
the tracker lean, `Passage, Privacy, Dummy` is only needed when an issue comes up
in logger." That is `12-logger-door`'s split, lean to look at and detailed to log,
applied to the item list itself.

### The list

| Phase | Item | Subtypes |
|---|---|---|
| 1 — Doors & Windows | Interior Doors | Regular, Bypass, Bi-fold, Double, Pocket, Double Pocket, Dwarf, Unit Door |
| 1 | Exterior Door(s) | Patio, Entry |
| 1 | Windows | — |
| 1 | Attic Hatch | — |
| 1 | Handrail | — |
| 1 | **Bathtub** | — |
| 2 — Baseboards | Cut | — |
| 2 | Nailed | — |
| 3 — Hardware & Accessories | **Handles** | Passage, Privacy, Dummy, Pocket |
| 3 | Ball Catch | — |
| 3 | Deadbolts | — |
| 3 | **Stops** | Spring, Hinge |
| 3 | Mirrors | — |
| 3 | Bathroom Accessories | — |

Every subtype list also ends with `Other`, which opens a text box. See section 5.

### What moved

- **`Unit Door` stops being an item** and becomes a subtype of Interior Doors.
  Miguel: "Unit Door should just be a subtype, we can remove it as an item
  completely."
- **`Passage`, `Privacy`, `Dummy` stop being items**, becoming subtypes of a new
  item, **Handles**.
- **`Spring Stops` and `Hinge Stops` stop being items**, becoming `Spring` and
  `Hinge`, subtypes of a new item, **Stops**.
- **`Ball Catch` stays its own item.** A catch is not a stop. Miguel was offered
  the thirteen-item version that folds it into Stops and chose against it.
- **`Bathtub` is added to Phase 1.** Miguel: "I completely missed Bathtub as an
  item in Phase 1."

### The cost, accepted on purpose

Passage and Privacy share one status row now. You can no longer read that the
passage handles are done and the privacy handles are not. **Progress got coarser
so that logging could get finer.** Miguel was shown this before he chose it.

### What it does to the Tracker tab

    0.1 today, 17 items with Details    41 columns
    0.2, 17 items, no Details           24 columns
    0.2, 14 items, no Details           21 columns

Column count is `2 + items + phases + 2` — Floor and Unit #, one status column per
item, one rollup per phase, then Last Updated and Overall Status. The Details
removal in section 4 does most of the shrinking. Three fewer items does the rest.

The Unit screen scrolls fourteen rows, not seventeen.

### Where it lands in code

`DEFAULT_PHASES` at `control/shared/common.js:78`. The new default subtype lists
and the eight-value reason list go beside it, so every default a person might want
changed sits in one file next to the item list it describes. `13` settled that the
Admin create form sends them up in the payload, the way item labels already are.

**Nothing about this is hardcoded downstream.** The config still drives the
structure, so a project can still add, remove or rename items afterwards. This
section only changes what a **new** project starts with.
