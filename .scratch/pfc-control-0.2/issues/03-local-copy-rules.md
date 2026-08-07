# What the phone keeps locally and when it refreshes

Type: grilling
Status: open
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
