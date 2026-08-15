# Test week triage — the 0.2 fix list, sorted and settled

Source: `notes/PFC_0.2_Testing_Breakdown.md`, from the 0.2 test week that started
2026-08-09. This file sorts that list and records what was decided about it. It
does not replace it.

Sorted and settled 2026-08-14 and 2026-08-15, in one grill session. An earlier
session on the same job crashed before writing anything.

**About the source file's wording.** Miguel logged these on site, where there was
no time to write them out, so he dictated them to Haiku 4.5 and it produced the
breakdown. **The phrasing is Haiku's, not Miguel's.** Two items in it were
misleading for that reason — the "auto-complete" bug and "item-specific reasons"
both described something the code does not do. Read that file for the list of
complaints, not for the wording of any one of them, and check the code before
building from a line in it.

---

## The sorting rule used here

A **0.2 patch** is a defect in a screen that already shipped, and the fix is
inside that screen. It changes no data shape, no `_Config` version, and no
backend contract. Anything that adds a control, a record kind, or a column is a
**feature**, however small it looks.

---

## 0.2.1 — the patch, 12 items

Ships before the 0.3 build starts. Reason: four of these are in screens 0.3 will
edit, and a fix buried in a feature diff is a fix nobody can find later. It also
gives the changelog a short honest first entry.

### Tutorial
1. Built for Safari only. Test and fix in Chrome. `control/index.html`
2. Must block the page as a popup, not sit inside the page. Position likely
   fixes itself once it does.

### Visual
3. The Logging flag logo on the Hub is not centered. `theme.css`
4. The refresh ring does not center on the header text, and it overlaps the
   header on Set up building. `common.js` `.ptr`
5. Dead Hub cards — Deficiencies and Materials. Remove or re-label. Reports stays.
6. Queue screen: the spinner does not center on each queued row. Replace it with
   a WiFi symbol. `tracker/queue.html`
7. Window names and subtitles. Every string goes through `docs/crew-words.md`.

### Messages and state
8. "Last updated" stays after the phone reconnects, and shows on the red Saving
   bar. It must go the moment Saving starts. `common.js`
9. E2 "Tell the Admin" fires on a weak connection. Only a real fault should ask
   anyone to report anything. `common.js:2516`

### Logger — the field order defect
10. **Reason moves above Needed.** The order today is Type → Item → Subtype →
    Needed → Count → Reason.
11. **Needed becomes optional on a Deficiency.** It is required today
    (`logging/index.html:846`) and Waiting is already exempt.

    **The evidence, from the 27 live records.** `needed` holds `Adjust`,
    `Install`, `Flip Privacy`, `Adjust slabs`, `Screws broken in jamb`. Those are
    not materials. They are actions invented to get past a required field. The
    column that feeds the 0.5 material order filled with to-do notes in one week.

### Progress bar
12. **Three segments, one per phase, plus a started-units count.** Drawing only —
    `list-projects` already sends `phaseCounts`, and started units is
    `total − done − notStarted`.

    **Why it reads wrong today.** Each unit has 13 items: 4 doors, 2 baseboard,
    7 hardware. Hardware supplies 54% of every count in the app while being the
    lightest work and the last done. On Elsliger 36-B: doors 109/144 (76%),
    baseboards 15/72 (21%), hardware 46/252 (18%) — and the single bar reads
    170/468, **36%**. The heavy work is three-quarters done and the bar says a
    third. `unitsDone: 0` makes it worse: no unit is fully finished, so every
    unit-level number reads zero while 30 of 36 units have work in them.

    Weighting is the real fix and it is **not** in 0.2.1. See the History tab in
    0.3 — the data to weight with does not exist yet.

**Not in 0.2.1:** anything touching record types, reason lists, history, or bulk.

---

## Two reports that turned out not to be bugs

### "After fixing a flag the item is marked Complete automatically"

**Nothing is written automatically.** `unit.html:393` draws a green card that
asks — "… is fixed. Set it to Complete?" — and `askGreen` only skips it when the
item already *reads* Complete.

What actually happened: the item was set to Complete **before** the deficiency
landed. While the flag was open the app displayed In Progress, which is the
`Store what is set, display what is true` rule in `CLAUDE.md`. Marking the record
Fixed removed the mask and the stored Complete came back on its own.

Miguel confirmed 2026-08-15 that this is right, once he could see what it was
doing: an item that was In Progress does get asked, and that is all he wanted.
**No change. Written down here so it is not re-reported.**

### "Need item-specific reasons"

They exist, and the report meant something else. A building carries one list of
eight reasons. Each item can carry a list of reasons to **hide** — the code calls
it `trim`, the screen says "Choose the reasons this item offers"
(`setup/index.html:671`, applied at `logging/index.html:550`).

Two facts from the live building:

- **Every item's list is empty.** All thirteen items show the identical eight.
- **8 of 27 records used "Other"** — Not installed, Track + Handle, Adjust angle,
  Adjust slabs, OCD, X, Warped. 30% of the vocabulary escaping out the back.

**The ceiling is that hiding only ever subtracts.** Nothing today can put a word
on one item alone. To give Cut the word "Gap" you must add it to the building's
list, where it then shows on all thirteen items unless you go and hide it on the
other twelve. That is why setting the lists would not have fixed what he saw.

Fixed in 0.3 by letting an item **add** its own words. See below.

**`trim` is a code word.** Miguel had never heard it and it is not on any screen.
Do not use it in conversation or in UI text — the word is *reasons*.

---

## The roadmap, as it now stands

| Version | Holds |
|---|---|
| 0.2.1 | The 12 fixes above |
| 0.3 | The Logger, the config behind it, and bulk actions |
| 0.4 | The Archive |
| 0.5 | PDF export, material order summaries |
| unplaced | The QR Log/Status menu, and the three crew-access items |

**The QR menu left the roadmap.** Miguel, 2026-08-14: "QR is a little stale i
dont even know where / if that fits at this point." It held 0.4 since before 0.1
shipped. It goes to `.scratch/0.3-backlog.md` unplaced, beside crew access, and
gets a version when something real puts it there — a GC asking for it, or the
camera app needing the bridge.

**The Archive moved twice and this is why.** 0.3 → 0.4. It is the cheap window —
read-only, three screens, no backend change, every seam already left by 0.2 — and
the Logger work is what costs Miguel time every day he logs.

**The one-window guideline was recorded wrong, and it cost this session an
argument.** Miguel, 2026-08-15: *"the main screen / hub should aim to only gain
one button / window. in this case bulk would be the only one, the other features
are just extra buttons within existing ones."*

It counts **Hub cards**, not features. `CLAUDE.md` had it as a scope check on a
whole release, which is what made a session argue 0.3 should be split. Corrected
in `CLAUDE.md` on 2026-08-15.

---

## 0.3 — decided here, to be charted with /wayfinder

Not a build plan. These are the decisions the charting starts from.

### 1. Three record types

`Deficiency` · `Order` · `Waiting`.

The split came out of the live data. Of 27 records, **11 are orders** — `72 4`,
`32 6`, `36 8 RH`, `30 Slab`, reason Missing or Defective, something must be
bought. **10 are work** — `Adjust`, `Install`, `Flip Privacy`, `Screws broken in
jamb`, `1 piece unnailed`, nothing to buy, somebody must go back and do it. One
is Waiting.

Both piles live in one field today, which is why `needed` fills with verbs, and
why the 0.5 material order cannot be trusted.

- **Order requires a needed line.** It is the only type that feeds the export.
- **Deficiency requires none.** Reason, and optional detail.
- **Waiting is unchanged.** Miguel, 2026-08-14: "TBH waiting has been useless so
  far but we'll keep it for now."
- **Order blocks Complete**, exactly like a Deficiency. A door that is not there
  is not complete, whatever pile it sits in.
- **Order carries its own count and colour.** A unit reads `3 to order · 2 to
  fix`. Those are two different days — a phone call to a supplier, or a morning
  with a screwdriver — and the screen should say which.
- **The word is Order.** It names the action and reads in a count. `Material` was
  rejected as reading oddly and colliding with the 0.5 export's name; `Missing`
  was rejected because it is already one of the eight reasons.
- Old records keep their type. The column already exists.

**This dissolves the "log unfinished work" item.** "Forgot to install" is work,
not a purchase: a Deficiency, reason `Not Installed`, no needed line.

### 2. Reason lists per type, plus per-item words

**Order — the existing eight, unchanged.** Wrong Size, Wrong Type, Wrong Swing,
Wrong Color, Missing, Damaged, Defective, Other. They were written for exactly
this, and six of the eight were used in one week.

**Deficiency — the lean five.** `Not Installed` · `Needs Adjusting` ·
`Installed Wrong` · `Damaged` · `Other`.

Derived from Miguel's own ten work records, which all fit it:

| His record | Reads as |
|---|---|
| Not installed · 1 piece unnailed | Not Installed |
| Adjust angle · Adjust slabs · Adjust ×2 | Needs Adjusting |
| Flip Privacy · Misaligned handle hole | Installed Wrong |
| Screws broken in jamb | Damaged |

`Loose`, `Gap` and `Incomplete` were offered and turned down. Anything missing is
added per item, which is what the per-item words are for.

**Waiting — its own fixed list, unchanged.**

**Per-item words are additive.** An item may add words no other item sees — `Gap`
on Cut — on top of the list its type provides. Hiding stays. This is the
`_Config` version 3 bump.

### 3. Reason pickers in Set up building

Per item, **collapsed by default** — each item row shows a count that opens when
tapped. Closed, the form is the length it is today. The same control appears on
create and on edit, so there is one thing to learn.

Miguel, 2026-08-14: the reasons must be choosable **while creating** a building,
not only editable afterwards.

**Do this step first.** It is the `_Config` v3 migration, and there is exactly
**one live building** to migrate right now. That will never be more true.

### 4. The History tab — append-only

One row per Progress change: unit, item, old value, new value, date.

**Why it must start now.** The Sheet stamps **one date per unit**, not per item
(`Code.js:739`). Nothing anywhere records when an item was finished. Miguel's
plan to weight phases from real speed data cannot happen later unless the
recording starts earlier — waiting produces no data, it only loses months of it.

- Progress changes only. Records already carry `created` and `closed` in the
  Deficiencies tab; logging them twice duplicates data and grows the tab faster.
- No author column yet. Crew access has no version, and the column can be added
  when it does.

### 5. Bulk Progress by scope, and the prefill button

- Pick an item, pick a scope (unit / floor / building), pick a value, apply.
  **Tracking only.** Flagged units skip automatically, by the existing rule.
- **Bulk logging is not in 0.3.** One deficiency across twelve units is twelve
  records with twelve needed lines. That wants a design pass, not a scope picker.
- **"Log issue here" on a Tracker item**, pre-filling the Logger with unit and
  item. It is the same wiring as bulk — carry an item and a scope to another
  screen — and it kills the Tracker↔Logger bouncing.
- **The open question, still open:** does a bulk apply show a summary — "34 of 36
  set, skipped 204 and 311" — or skip silently? Settle it while charting.

### 6. Progress bar weights

Three weight numbers, one per phase, once the History tab has fed them. Miguel,
2026-08-14: use the dates to work out how fast each phase really goes, rather
than guessing ratios.

Thirteen per-item weights were offered and turned down as too much to maintain.

### Set up building is a crew screen, not an admin one

Miguel, 2026-08-15: *"It was called admin in early planning but I think its a
worthy crew feature… everyone should have access. the real Admin panel will have
a different use case (which will be decided / planned later on)."*

- The **create** flow is fine as it is. The **editor** is what needs work, and
  the collapsed rows above are most of that fix.
- The real Admin panel — deleting jobs, deleting Sheets, locking things away —
  is a separate thing with no version and no design yet.

---

## Still on the list, unplaced

From the breakdown, not settled here, not lost:

- Units in hallway order, not numeric order.
- Per-phase dots on units in the floor view.
- A summary view of what is left on a floor or building.
- Hallways and stairwells as trackable things.
- Multi-unit and floor-wide logging.
- Better back navigation, a sticky header, a Home button.
- Light mode. Haptics on refresh. The icon.
- A map view for picking a building.
- Deleting a building from the app, including its Sheet.
- Adding and removing floors, units and item types during an edit.
- Choosing which item types a building uses at creation (Bypass, Bi-fold).
- Voice input and the LLM bulk-update path.
- Sheets versus a real database for 1.0.
- A frontend framework for 1.0.
- A generic, no-branding version for other trades.

The last four are the big-picture conversation Miguel wants **after 0.2.1 locks**,
because the answers may change how 0.3 is built.
