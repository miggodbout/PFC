# What the phone keeps locally and when it refreshes

Type: grilling
Status: resolved
Resolved: 2026-08-07
Blocked by: 08

## Question

What data does the app keep on the phone, where does it keep it, and when does
it go back to the server?

This ticket answers the speed complaint. Today every screen calls the server on
its own. Tracking calls `list-projects`, Building calls `get-structure`, and
Unit calls `get-unit`. Each call shows a spinner.

Points to settle:
- Whether the phone holds one project, the open project only, or every project.
- Which storage to use. `sessionStorage` today, which empties when the tab
  closes. Candidates are `localStorage` and IndexedDB. Size limits come from
  `08-ios-pwa-storage-limits`.
- When a refresh runs. On open, on a pull down, on a timer, or on a mix.
- What the screen shows while a refresh runs behind a copy that is already
  drawn.
- How old a copy may get before the app warns that it is stale.
- What replaces the demo buildings once a real copy exists on the phone.

## Facts already settled by research

From `08-ios-pwa-storage-limits`:
- Space is not a constraint. An origin may use up to 60% of the disk on iOS 17
  and later. Hold as much as is useful.
- `localStorage` is capped at about 5 MB. IndexedDB is not.
- `sessionStorage` is out. It dies with the page session, and Apple publishes no
  timer for when iOS ends a backgrounded web app window. `Store` in
  `control/shared/common.js` uses it today, so this is a change, not a choice.
- Storage survives a Service Worker update. Old Cache API entries are not removed
  automatically. The `activate` handler must delete them.
- The 7 day wipe applies to a Safari tab and not to an installed app. See
  `10-tab-versus-installed-app`.

From `07-apps-script-write-limits`:
- `handleListProjects` opens every Sheet in the Projects folder in a loop. It is
  the heavy call, and only a 60 second server cache keeps it off the hot path. A
  local copy helps this call the most.

---

## Resolution, 2026-08-07

### One call holds one building

A new backend action, `get-project`, returns a whole building in one answer:
structure, every unit, every item, every detail. It replaces `get-structure`
plus one `get-unit` per unit.

The reason this is cheap: the Unit Tracker tab is one grid. Every unit is a row,
every item is a column. `handleGetUnit` in `control/appscript/Code.js` already
reads one row with one `getValues` call. Reading the whole grid is the same one
call. Fifty spinners become one.

After the call lands, Tracking, Building, Floor and Unit all draw from the phone
with no server call at all.

### Storage is localStorage

`sessionStorage` is out. `08-ios-pwa-storage-limits` settled that it dies with
the page session, and Apple publishes no timer for when iOS ends a backgrounded
web app window. `Store` in `control/shared/common.js` uses it today, so this is a
rewrite of that object, not a setting change.

IndexedDB was considered and rejected for 0.2. It has no size cap, but every read
and write is asynchronous, so every screen that touches data has to be rewritten
to handle the wait, and every wait is a place a screen can go blank. That is real
work and real risk against a problem the app does not have: one building is about
100 KB, and localStorage holds about 5 MB.

**One key per building, plus one small index key.** Not one key holding
everything. localStorage reads and writes a key whole, so a single key would
rewrite a megabyte every time one status changed.

### The phone keeps ten buildings

Open an eleventh and the least recently opened one is deleted. About 1 MB against
a 5 MB cap. Nothing is lost: a deleted copy is only a copy, and it downloads
again on the next open.

An archived building is dropped as well, ahead of the ten limit. That rule is
written here but not final. `14-building-archive` owns it and must confirm it.

### When a refresh runs

| Event | Calls |
|---|---|
| Open the app | 1 — the building list only |
| Open a building | 1 — that building, whole |
| Pull down | 1 — force a refresh of what is on screen |
| Idle, app open | 0 |
| Phone in a pocket | 0 |

No timer. Refreshing every building on open was rejected: ten calls, nine of them
for buildings nobody is going to look at, against a server that
`07-apps-script-write-limits` showed handles calls one at a time.

Refreshing the last-opened building alongside the list was also rejected. It buys
one instant screen and wastes a call every time Miguel switches jobs.

### What a person sees

- A stored copy draws **instantly**. A thin moving bar under the header shows a
  fetch running behind it. The bar goes when the fetch lands. The screen never
  blocks and nothing jumps.
- **No stored copy is the only place a spinner survives in 0.2.** First ever open,
  or a building the phone dropped.
- No stored copy and no signal: `No copy on this phone. Connect and open it once.`
- **No staleness clock.** The app warns only when a fetch *fails*, and then it
  shows when the copy was last updated: `Offline. Last updated Tue 2:14 PM.` A
  fetch that succeeds makes the copy fresh by definition, so there is nothing to
  warn about. No age threshold to argue over, and no nagging when nothing is
  wrong.

### Demo buildings are deleted

`demoUnitStatus`, `demoItemStatus` and `demoItemDetails` in
`control/shared/common.js` come out. They existed to make 0.1 screens look alive
before real data existed. Real data exists now, and invented statuses that can
appear beside real ones are a trap. An empty list says so plainly:
`No projects yet. Create one in Admin.`

### Left for 04-queued-edit-rules

**A fresh copy must never overwrite an unsent edit of your own.** That collision
is the outbox's problem, not the local copy's. It is stated here so it does not
get lost, and decided in `04-queued-edit-rules`, which this ticket unblocks.

### Raised here, moved out

Miguel raised building-level archive during this session: once every entry in a
building is Complete, the building should leave Tracking and move to an Archive
window. It is a real question and it is not this ticket's. It became
`14-building-archive`, waiting on `11-rollup-rules` and `12-logger-door`.

Record-level archive was already settled in `01-deficiency-record-fields` and is
unaffected: a fixed record is marked `Fixed` and stays on its row, and an Archive
view is a filter over records the phone already holds.
