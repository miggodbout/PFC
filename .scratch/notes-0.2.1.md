The first week of real use on Elsliger 36-B, fixed. Fourteen items, no new
features, and nothing in the data changed — no Sheet was migrated and the
backend was not touched.

Three of the fourteen turned out to be one bug wearing three hats.

## The big one — a weak signal is not a broken app

The app sorted every failed save into one of two piles: it never reached the
server, or it reached it and the write was refused. A browser reporting "could
not read the reply" went in the second pile.

That is exactly what a weak signal produces. So a bad hallway on Elsliger read
as a broken deployment, three ways at once:

- **The message told you to tell the Admin, over a hallway.** Now the app
  remembers whether a call has ever come back on this phone. Once one has, a
  failure like that reads `The app could not reach the server. The signal here
  may be weak. Try again.` — no code, and nobody to report it to. On a phone
  that has never heard from the server the old E2 message stands, because then
  something really may be wrong.
- **Every weak-signal attempt burnt one of the ten tries that hold an edit.**
  Ten of them and the edit stopped trying and waited for you to re-queue it by
  hand. It does not burn a try any more, exactly as being offline never did. It
  keeps trying on the five-minute beat, when signal comes back, and every time
  you open the app.
- **The technical log filled with E2 entries that meant nothing.** The entries
  are still written — nothing was lost for debugging — but the app stops
  treating them as a fault.

## Progress

- **The bar on the building list is weighted by how long the work takes.**
  Every unit holds 13 items: 4 doors, 2 baseboard, 7 hardware. Hardware was 54%
  of every count in the app and about 6% of the work, so a ball catch counted
  the same as a unit door. Elsliger 36-B read **36%** with the heavy work three
  quarters finished. It reads **58%** now.
- The weights are days per unit, from your own rates: Phase 1 1.60, Phase 2
  0.57, Phase 3 0.17. They live in the code for now. 0.3 puts them on the
  building settings tab, and a building that sets its own will win.
- **The three phase-coloured runs are gone.** Each was measured against the
  whole building, so a phase 76% finished still drew a short amber run and the
  three of them added up to the same wrong number.
- **The split is a line of text under the bar instead**, where a number can be
  exact: `Phase 1 76% · Phase 2 21% · Phase 3 18%`.
- **A started-units count under that**: `30 of 36 units started · 0 done`. No
  unit is finished until the last hardware goes on, so every done count on that
  screen reads zero for months. Started is the number that moves.
- The bar now takes the whole width of the row and prints its own number.

## Adding the app to a phone

- **The install note is a proper sheet now.** It comes up from the bottom edge,
  near your thumb, and dims the page above it. It was a small note under the
  header, built for Safari, easy to read past.
- **Android gets a real Install button.** It fires Chrome's own install dialog.
  That was never possible before.
- **iOS gets the four taps written out**, because no browser on iOS has an
  install button at all — not Safari, not Chrome. Step one names both `Share`
  and `•••`, because iOS 26 hides Share behind the dots and older phones do
  not, and the page cannot tell which one you have.
- The iOS sheet says the seven-day line, and Android does not, because it is a
  WebKit rule and it is not true on Android.
- **`Later` holds it off for fourteen days.** An `Add to phone` row on the Hub
  opens it again whenever you want.
- It never shows on a phone that already has the app, and never on first paint.
- **`manifest.json` declares a 192x192 icon.** Chrome asks for both sizes before
  it will offer an install, so without this the Android half could not work at
  all.

## The Hub

- **`Deficiencies` and `Materials` are gone.** Log already does the first, and
  two cards for one job is how a person taps the wrong one. Materials is really
  the 0.5 export. A card reading "Coming soon" for six months stops meaning
  anything.
- `Reports` and `Archive` stay greyed. Archive is the door 0.4 opens.
- **`Logging` is now `Log`.** An instruction, not a category. The card, the
  header and the browser tab all changed.
- **Every subtitle leads with a verb**: `Tracking → See what is done`,
  `Log → Log an issue`.
- The flag glyph sits in the middle of its card. Its drawing was two units
  narrower than the box around it, and the bottom of the pole was being clipped.

## Logging an issue

- **Reason comes before Needed**, and Count sits between them.
- **Needed is optional.** It was required on every deficiency, and of the 27
  records logged in the test week it held `Adjust`, `Install`, `Flip Privacy`,
  `Adjust slabs` and `Screws broken in jamb`. Those are repairs, not materials
  — they were invented to get past a required field, in the one column the 0.5
  material order reads. No prompt when you leave it blank either.

## Saving, and the queue

- **The Queue screen says what each row is doing, in a word** — `Queued`,
  `Sending`, `Did not save`. It was a ring on every row, and a ring says
  "working" whatever it is doing.
- Only the row actually going out has anything that moves.
- **The `updated 1:22 AM` line goes while a save is in the air.** A red bar
  reading `Saving 3 edits…` over a stale timestamp says the app is both working
  and stuck.
- **Coming back to the app fetches again**, if what is on screen is more than
  two minutes old. Glancing at the app in a hallway still costs nothing.
  Walking to the next unit gets fresh numbers.
- That also fixes `Last updated` sitting there after the phone came back into
  signal. Nothing was fetching, so nothing could clear it.

## Elsewhere

- The turning ring on a pull-down sits level with the header text. It was too
  low, then not low enough, and on Set Up Building it clipped the title.

## Two reports that were not bugs

- **"After fixing an issue the item is marked Complete by itself."** Nothing is
  written automatically. The item was already Complete before the deficiency
  was logged; the app was showing In Progress while the issue was open and
  stopped once it was fixed. An item that was genuinely In Progress still gets
  asked.
- **"Item-specific reasons do not work."** They do, but an item can only ever
  hide a reason from the building list, never add one of its own. That is the
  real limit, and 0.3 fixes it.

## Known and not fixed here

- `Other` is still the escape hatch on the reason list — 8 of 27 records used
  it. Three record types and per-item reasons are the 0.3 release.
