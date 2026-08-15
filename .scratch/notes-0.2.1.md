Fourteen fixes out of the first week of real use on Elsliger 36-B. No new
features. No Sheet was migrated and the backend was not touched.

## Saving

- A weak signal no longer reads as a refused write
- A weak-signal failure no longer burns one of the ten tries on an edit
- E2 log entries are still written, but no longer treated as a fault
- Queue rows say `Queued`, `Sending` or `Did not save` instead of a ring
- Only the row actually going out animates
- The `updated 1:22 AM` line hides while a save is in the air
- Coming back to the app refetches if the screen is over two minutes old

## Progress

- The building bar is weighted by how long work takes, not by item count
- Phase 1 1.60 days per unit, Phase 2 0.57, Phase 3 0.17
- Elsliger 36-B reads 58% instead of 36%
- The three phase-coloured runs are gone
- Phase split moved to a text line under the bar
- Added a started-units count: `30 of 36 units started · 0 done`
- The bar takes the full row width and prints its own number

## Adding the app to a phone

- The install note is a bottom sheet instead of a small header note
- Android gets a real Install button
- iOS gets the four taps written out, naming both `Share` and `•••`
- The seven-day line shows on iOS only
- `Later` hides it for fourteen days
- An `Add to phone` row on the Hub opens it again
- Never shows on a phone that already has the app
- `manifest.json` declares a 192x192 icon, required by Chrome

## Hub

- Removed the `Deficiencies` and `Materials` cards
- `Reports` and `Archive` stay greyed
- `Logging` renamed to `Log` on the card, header and tab
- Every card subtitle leads with a verb
- Flag glyph centered in its card, no longer clipped

## Logging an issue

- Reason comes before Needed, with Count between them
- Needed is optional, and no prompt when you leave it blank

## Elsewhere

- Spinner centered to header

## Reported, but not a bug

- Items are not marked Complete by themselves. The item was already Complete,
  and the app showed In Progress while the issue was open
- Item-specific reasons work, but an item can only hide a reason, never add
  one. 0.3 fixes that

## Not fixed here

- `Other` is still the escape hatch on the reason list, used by 8 of 27 records.
  Three record types and per-item reasons are the 0.3 release
