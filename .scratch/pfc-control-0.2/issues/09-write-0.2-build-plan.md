# Write the 0.2 build plan

Type: task
Status: **resolved 2026-08-08. The map is closed.**
Asset: [`../BUILD-PLAN.md`](../BUILD-PLAN.md)
Blocked by: nothing. `18` resolved 2026-08-08, both passes done. Every 0.2
ticket is now resolved (13, 14, 15, 17, 18 and 19 all resolved 2026-08-08).

> **Resolved 2026-08-08. The plan is `../BUILD-PLAN.md`, marked LOCKED.**
> Eleven sections: the Sheet and the data shape, the backend actions, the three
> phone stores, the marks, the screens file by file, a six-step build order with
> a test after each step, the login and Archive seams, the release checklist,
> the known ceilings, and the four PLAN CALLs.
>
> **Every item on this ticket landed in the plan.** The small items are in
> sections 5.2, 5.3, 5.8, 5.10 and 9. `14`'s five handovers are in 2.4, 3.3, 5.2
> and 5.4. All nine `code-inventory.md` findings are placed. The stale
> `update-item` comment block is a named deletion in section 2.7.
>
> **Four decisions were left to the plan by name and the plan took them**, listed
> in its section 11. Only one needs Miguel: **pin Save to the bottom of the
> Logger form**, one line at build time, gating nothing. See the Answer below.

**This is the last ticket on the map.** Read `../supersessions.md` (47 entries),
`../template-changes.md` (FINAL as a whole) and `../code-inventory.md` first, in
that order. `18` swept the corpus so this session does not have to reconcile
contradictions while also writing a plan.

**One thing `18` left for this ticket on purpose:** `control/appscript/Code.js`
lines 1300 to 1315 still advertise the `update-item` action that `04` deleted for
`save-batch`. It is the first thing a build session reads in that file. `18`
writes no production code, so the deletion belongs in this plan.

## Question

Gather every closed decision on this map into one build plan a single session
can work from.

This is the destination. Nothing is decided here. Every answer already exists in
a closed ticket.

`18-supersession-sweep` runs immediately before this ticket and hands it a clean
base: `supersessions.md`, a final `template-changes.md`, and no stale
cross-references. Read that output first.

**Two of those files exist already, from the sweep's first pass on 2026-08-08:**

- `../supersessions.md` — which decision wins wherever two disagree.
- `../template-changes.md` — rewritten, now nine sections. **The whole file is
  FINAL as of the sweep's second pass, 2026-08-08.** Build the Sheet from it and
  do not weigh it against anything. Section 8 emptied when `15` closed: the
  suggestion chips take no template change at all.
- `../code-inventory.md` — **read this one before writing the file-by-file
  section below.** It is the 0.1 code measured against all seventeen tickets:
  every call site of the rollup, every place the demo data reaches, the exact
  lines each ticket deletes, and nine things no ticket owns.

The plan must hold:
- The data shape, and the Sheet layout, including the master template change.
- The backend actions to add to `control/appscript/Code.js`.
- The local copy rules and the outbox rules.
- The screen changes, file by file.
- The build order, and what to test after each step.
- The seam left for Google login and crew access.
- A reminder to raise `CACHE_NAME` in `control/sw.js`.

## Small items that belong to no other ticket

These are each too small to be a ticket and too easy to lose. The plan must carry
them.

- **The loading header flash.** `control/tracker/building.html` ships the literal
  word `Building` and `unit.html` ships `Unit`, and JavaScript replaces each one
  when the data arrives. `03-local-copy-rules` removes it only for a building
  already on the phone. Pass the name through from the Buildings list, which
  already knows it, or leave the placeholder empty. See the map's Notes.
- **Remove the Details column** from the Tracker tab in the master template, and
  the Details button from `control/tracker/unit.html`. Settled in
  `06-deficiency-entry-screen`.
- **Add a greyed `Archive` card** to `CARDS` in `control/index.html`, beside
  `Deficiencies` and `Materials`. It is the seam the Archive window lands on in
  0.3. Settled in `06`.
- **`get-project` must return closed records, not only open ones.** Filtering
  them out to save space would force Archive to invent a new server call later.
  Settled in `06`, and it is a rule about `03`'s answer, not a change to `03`.
- ~~**Nobody drew the flag marks on the unit chip.**~~ **Moved to
  `19-building-and-floor-markers` on 2026-08-08, the same day it was found.** It
  turned out to be a design question with four sub-questions and a colour
  collision, not a line item. Kept below so the reasoning is not lost. Found while Miguel
  settled the whole-unit Waiting question. The **rule** is settled — `11` says
  every level shows both flag kinds with their own counts — but `11` line 267
  handed **the exact drawing** to `06` and `05`, and neither drew it above the
  Unit screen. `06` drew the item row and the phase header. `05` drew the pending
  marks. The Building screen's unit chips were never covered.
  - This matters because of what Miguel just decided: a blocked unit is a
    **phase-level Waiting record on Phase 1**, and if the chip carries no flag
    mark you must open the unit to learn the unit is blocked. That is the one
    case where the mark earns its place.
  - **Watch for a red-on-red collision.** `05` puts a **red dot** on the unit chip
    and the floor header for a **held edit**. `06` makes a Deficiency flag a **red
    chip**. Both land on the same small chip and mean different things. Decide the
    two marks together, on a phone, before either ships.

## Handed over by `14-building-archive`, 2026-08-08

Five items. The full reasoning is in that ticket's **Answer** section.

- **`list-projects` sends counts, not a word.** Three numbers per building: items
  Complete, items total, open flags. The phone applies `11`'s rule to them. The
  server's own `worst(statuses)` at `control/appscript/Code.js:204` goes, which
  `11` required anyway. This lands in the same pass that FINDING 7 below describes,
  so the file is already open — the extra cost is one read of the Deficiencies tab.
- **The Tracking list runs a four-step order of tests**, first match wins:
  1. The phone holds a waiting or held edit for it → draw a normal row.
  2. It reads Complete and was already Complete on this session's first list answer
     → do not draw it.
  3. It reads Complete and went Complete during this session → draw a greyed row.
  4. Otherwise → draw a normal row.

  **Keep this separate from the storage test.** Deleting the local copy is `03`'s
  rule with `04`'s exemption, and it runs on app open. Two tests, not one.
- **`control/tracker/index.html:74` gains a second empty message.** `emptyHtml()`
  today says *"No projects yet — Create your first building."* That is wrong once
  buildings exist and all of them read Complete, and it reads as data loss. The
  finished case says: **"Nothing to track. Every building is finished. Open the
  project Sheet to read one."** Both keep the `Create Job` button.
- **The phone remembers, for the session only, which buildings it watched go
  Complete.** Not stored, not synced, gone when the app closes. It is what keeps the
  greyed row on screen until the next app open.
- **A rule for the plan, not for code: every item is always drawn on the Unit
  screen.** There is no hide-finished-items work in 0.2. Miguel closed that branch
  on 2026-08-08 and the map's Notes carry the boundary. If a later session proposes
  it, the answer is already no.

## Found by `code-inventory.md`, 2026-08-08

Each of these is real, small, and owned by no ticket. Full reasoning is in that
file under the finding number given.

- **`save-batch` may not fit down the JSONP fallback (FINDING 4).** The plan needs
  a rule for this. `apiUrlFor` puts the whole payload in the address, and an
  address stops working somewhere near 8,000 characters, silently. The fallback
  is used on exactly the networks that block a POST reply, so a large outbox
  drain could fail there with no useful message. Suggested rule: when the
  fallback path is in use, drain in slices of a few jobs. **This is the only
  finding that can lose a person's work. Everything else is cosmetic or slow.**
- **`save-batch` must clear the project list cache (FINDING 8).** Both existing
  write actions end with `CacheService.getScriptCache().remove('list-projects')`.
  Forget the same line and the Buildings screen shows a stale pill for a minute.
- **`tracker/index.html` has no error branch at all (FINDING 3).** `loadProjects`
  swallows every failure today and returns demo buildings instead, so the screen
  never had to handle one. `03` deletes the demo buildings. Compare
  `building.html` and `unit.html`, which both handle `source === 'error'`.
- **Two hardcoded sixes in `rebuildDashboard` (FINDING 5).** The tab narrows from
  six columns to five. `11` says what it counts but not that it changes width.
- **The `update-item` comment block at the end of `Code.js`** still tells the next
  session to build an action that `04` deleted. It is the first thing a build
  session reads in that file. Replace it with a `save-batch` note.
- **The layout comment at `Code.js:636`** documents the template column letters
  and goes wrong the moment the Details column is removed. Rewrite it with the
  removal, not after.
- **The Admin note at `admin/index.html:437`** says "The item loses its Status and
  Details columns." One-line fix with the same removal.
- **`handleListProjects` opens every project Sheet on a cold cache (FINDING 7).**
  At the map's stated ceiling of 50 buildings this is a real wait, hit on app
  open. **Do not fix it in 0.2.** Write down that the ceiling exists and roughly
  when it bites, so it is not discovered on site.
- **The Hub ships seven cards in a two-across grid**, leaving one alone on the
  last row. Cosmetic. Worth seeing on a phone before it ships.

---

## Answer, 2026-08-08

**`../BUILD-PLAN.md`, marked LOCKED.** It is the destination of the map. A build
session reads that one file and does not have to read nineteen tickets.

### What was gathered, and from where

Nothing on this ticket was decided by argument. The work was reading the corpus in
the order `18` set — `supersessions.md`, then `template-changes.md`, then
`code-inventory.md` — and then the nine tickets that hold build-level mechanics:
`02`, `03`, `04`, `05`, `06`, `11`, `13`, `15`, `19`. `07`, `08`, `10`, `12`, `14`,
`16`, `17` and `18` were taken from the map's gists and this ticket's own handover
sections, which carry their build-facing content in full.

The plan states in its own section 0 that **where a ticket disagrees with it, the
plan wins**, because it was written last and from `supersessions.md`.

### The one check that was worth running

`code-inventory.md` measured the code at commit `cf68d6d`, and this session ran at
`b12f77c`. **`git diff cf68d6d HEAD -- control/` is empty**, so every line number
the inventory recorded still holds and the plan cites them directly. Three were
spot-read anyway — the `update-item` block at `Code.js:1300`, `emptyHtml()` at
`tracker/index.html:74`, and `CACHE_NAME` at `sw.js:15`. All three matched.

### The four PLAN CALLs

The plan carries four decisions no ticket had made. They are listed together in
its section 11 so they are easy to overturn.

1. **`save-batch` down the JSONP fallback** — FINDING 4, the only thing on the
   whole map that can lose a person's work. The ticket asked for a rule and
   suggested slicing. The plan makes it exact: POST first, and on the fallback
   path drain in **slices of 5**, measure the built address and **halve the slice
   above 6,000 characters**, and hold a single oversized job with `retry:false`
   and a named reason. It is never dropped and it sends normally the next time a
   POST works.
2. **An Outbox row does not tap through to its unit** — `05` left this open and
   said the row names the unit and the item, which is enough to walk there. A
   tap-through also has to decide what happens to the Outbox screen behind it.
   Build the list; add it when somebody asks.
3. **Save is pinned to the bottom of the Logger form** — the recommended answer
   already written on `13`. **This is the only call that needs Miguel**, one line
   on a phone at build time. The plan carries the second option too: Subtype and
   Count on one row, and the place bar collapsing once a place is set.
4. **The build order** — six steps, each ending somewhere you can stop, each with
   what to test. Sheet and server first, then the local copy and the read-only
   screens, then saving and the outbox, then records and Logger, then Admin, then
   the finish. Records ride the outbox, so they come after it.

### Two fog entries the plan absorbed

Neither becomes a ticket, because the map closes here.

- **Where Save sits on the Logger form** — now PLAN CALL 3.
- **The Service Worker and `CACHE_NAME`** — the plan's section 5.11 says exactly
  what changes (two `SHELL` lines and the version) and repeats what
  `code-inventory.md` found: the `activate` handler already deletes old caches at
  `sw.js:53-63`, and 0.2's data is in `localStorage`, which a Service Worker never
  touches.

### Audited the same day, after Miguel pushed back

**He asked whether that was really all the context 0.2 needs. It was not, and he
was right to ask.** The first pass read fourteen tickets in full and took five
from the map's gists and this ticket's handover sections — `01`, `10`, `12`, `14`
and `17`. Those five were then read in full and the plan checked against them.

**No decision was missing.** Every ruling in all five was already placed, and the
audit changed nothing about what 0.2 does. What was thin was two other things:

1. **Screen-level wording and mechanics**, which a gist drops because it is not a
   decision. The Logger dropdown sources and the `No unit 201 in this building.`
   message, the minus/plus Count starting at 1, the `✓ Saved · waiting to send`
   strip and `[ Log another item ]`, both Tracking empty messages verbatim, the
   install note's actual steps, the rule that one record is one problem and one
   needed line, and the flat rule that a Deficiency always attaches to an item
   while a Waiting may attach to a phase.
2. **The rejected options.** This is the real find. A gist records what was
   decided and drops what was turned down, and **the turned-down option is
   usually the obvious idea a build session has at the moment it reaches that
   code.** They were scattered across nineteen tickets and reachable only by
   reading all of them, which is the thing this plan exists to avoid.

**The fix: section 11, `Already rejected. Do not rebuild these`.** About fifty
entries in four tables — screens, data and lists, storage and queue, marks — each
with its one-line reason and the ticket that holds the argument. Section 0 now
says it is not optional reading.

Two smaller repairs came out of the audit: `17` asked in as many words that the
plan **say plainly that a trim list needs no release at all**, which the first
pass softened to "does not gate the build"; and `17`'s **"lists only grow" scope
table** — which lists are Add-only and which are not — was missing, so the rule
could have been widened by accident.

**The lesson, for the next map.** A ticket gist is enough to place a decision and
is not enough to build from. Where a plan has to carry mechanics or negatives,
read the ticket.

### The map is closed

`09` was the last open ticket. Every 0.2 decision is settled, written down, and
gathered into one file. **No production code was written on this map**, which was
the rule it set for itself in its Destination.
