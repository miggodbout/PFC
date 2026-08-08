# Write the 0.2 build plan

Type: task
Status: open
Blocked by: 18 — every other 0.2 ticket is resolved (17, 13, 14 and 15 all
resolved 2026-08-08)

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
- `../template-changes.md` — rewritten, now nine sections. Section 5 went FINAL
  when `13` closed, and section 9, the default item list, was added by it.
  **Section 8 still waits on `15`.**
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
