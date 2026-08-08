# Write the 0.2 build plan

Type: task
Status: open
Blocked by: 01, 02, 03, 04, 05, 06, 07, 08, 10, 11, 12, 13, 14, 15, 17, 18

## Question

Gather every closed decision on this map into one build plan a single session
can work from.

This is the destination. Nothing is decided here. Every answer already exists in
a closed ticket.

`18-supersession-sweep` runs immediately before this ticket and hands it a clean
base: `supersessions.md`, a final `template-changes.md`, and no stale
cross-references. Read that output first.

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
