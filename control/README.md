# PFC Control

Site progress and deficiency tracker for Premier Finish & Construction. It
shows the progress of every item, in every unit, in every building, and it
records the issues found on site.

This is a separate system from the camera app in `Hub/Log/`. The two share no
code, no Apps Script project, and no Drive folder. Do not join them.

**Version 0.2.** Progress is set on the phone and saved back to the building's
Sheet. An edit made with no signal is queued on the phone and sent when signal
returns. Deficiency and Waiting records are entered on the Logging screen.

---

## Folder map

```
control/
  index.html          Home screen. A grid of cards.
  manifest.json       Makes the app installable on a phone.
  sw.js               Keeps a copy of the app, so it opens with no signal.
  README.md           This file.

  shared/
    theme.css         Every colour and size. Change a value here, and it
                      changes on every screen.
    common.js         The link to the backend, the three Progress values,
                      the rollup rule, the local copy, the queue and the
                      suggestion chips.
    logo.png          App icon.

  tracker/
    index.html        Every building.
    building.html     One building. Floors open one at a time.
    unit.html         One unit. Every item, grouped by phase.
    queue.html        Every edit that has not reached its Sheet.

  logging/
    index.html        Record a deficiency or a Waiting note against a unit.

  setup/
    index.html        Create a building. Change an existing building's
                      structure and lists.

  appscript/
    Code.js           The backend. Paste this into Apps Script.
    appsscript.json   Settings for the Apps Script project.
```

---

## The backend

The Apps Script project already exists. It was created with `clasp`.

| Item | Value |
|---|---|
| Owner | `miggodbout0728@gmail.com` |
| Project | PFC Control |
| Script ID | `11PF1yQ7qVu9xicCYG37p--dLEBGhP3-9iSxan2hxQKwbfAO3_YwcY2ZG` |
| Editor | <https://script.google.com/d/11PF1yQ7qVu9xicCYG37p--dLEBGhP3-9iSxan2hxQKwbfAO3_YwcY2ZG/edit> |

The address is already pasted into `API_URL`, near the top of
`control/shared/common.js`.

The deployment is live and authorized. It was tested end to end on
2026-07-31: a project was created, read back through all three read actions,
and shown in the app.

**Check that it still works.** Open the `/exec` address in a browser. It must
show `PFC Control — Active`.

### If you ever deploy to a new account

A script cannot grant itself permission to your Drive. Google asks the owner
to agree, once, in a browser.

1. Sign in to Chrome as the owner account.
2. Open the `/exec` address.
3. Press **REVIEW PERMISSIONS**, then choose the owner account.
4. Google shows a red **"Google hasn't verified this app"** warning. This is
   normal for every personal Apps Script project. Press **Advanced**, then
   **Go to PFC Control (unsafe)**.
5. Press **Allow**.

The `webapp` block in `appsscript.json` already sets access to *Anyone*, so
you do not need to change anything in the Deploy menu.

### Change the code later

From the repo root:

```
cd control/appscript
clasp push --force
clasp create-deployment --deploymentId <the id inside API_URL> --description "what changed"
```

**Update the existing deployment. Never create a new one.** A new deployment
mints a new address, and every phone still holding the old one stops working.
The id is the long string inside `API_URL` in `control/shared/common.js`.

Then prove it landed, rather than trusting the command. One `curl` at the web
app address, asking for the thing you changed:

```
curl -sL ".../exec?action=list-projects"
```

`control/appscript/.clasp.json` links this folder to the script. Git ignores
it, so it lives only on Miguel's machine.

**Never put a `.clasp.json` at the repo root.** `clasp` walks up the folder
tree until it finds one, so a config at the root sends every clasp command
anywhere in the repo to whichever script that config names. The camera app's
config sat there until 2026-08-08 and was moved down into `appscript/`. Each
script now has its own config beside its own code, and clasp at the root
correctly finds nothing.

---

## Where the files live

**Project Sheets.** Apps Script builds one Google Sheet for each building and
saves it in `My Drive/PFC/Control/Project Sheets/`.

```
My Drive/PFC/
  Control/            PFC Control owns everything in here
    Project Sheets/       the generated building Sheets
    Master Template/
    Apps Scripts/         the PFC Control script only
  Project Logs/       the camera app writes here
  Personal/           Miguel's own files. No code touches it.
```

`Control` is pinned by ID in `control/appscript/Code.js`:

```js
var PFC_ROOT_FOLDER_ID = 'paste the folder ID here';
```

**Drive tracks a file by ID, never by path**, so dragging `Control` somewhere
else in the Drive window is safe. **One exception:** `Project Sheets` is found
by *name*, inside whatever folder that ID points at. Drag it out of `Control`
and the script quietly makes a new empty one, and every building disappears
from the app with no error. Move it only by moving `Control`, which carries it.

**Master template.** `reference/PFC_Master_Template.xlsx` is the layout
specification. The backend does not copy it. It builds each Sheet in code, using
the template's colours, merges, column widths and formulas. This is why a
project can have any number of units and any list of items.

**Design.** `reference/design-handoff/` holds the visual prototype. Every colour
and size in `theme.css` comes from it.

---

## How a project Sheet is built

Each Sheet has four tabs.

| Tab | What it holds |
|---|---|
| `Unit Tracker` | One row per unit. **One column per item**, holding its Progress. Then one rollup column per phase, then Last Updated and Overall Status. |
| `Deficiencies` | One row per issue. A plain list, oldest first, thirteen columns. Filter the `state` column to read the open ones. |
| `Dashboard` | How many units sit at each Progress value, per phase and overall. |
| `_Config` | Hidden. The building's structure and its lists, as one line of JSON. |

0.1 gave every item two columns, Status and Details. **The Details column is
gone.** A note about a problem is a record on the Deficiencies tab now, where
it carries a reason, a count and a state.

**You may type a Progress value straight into the Sheet.** The app shows it the
next time it fetches that building.

**Do not add or delete columns or rows in the Sheet.** Use the Set Up Building
screen. It keeps the columns, the formulas and `_Config` in step. A hand edit to
the structure breaks the rollups.

### Progress, and issues

**Progress** is the dropdown on an item. It is always set by hand, and it holds
one of three values.

| Value | Meaning |
|---|---|
| Not Started | Nothing done yet |
| In Progress | Work underway |
| Complete | The work is done |

**An issue is not a Progress value.** It is a row on the Deficiencies tab, and
it is open until somebody marks it Fixed or Cancelled. There are two kinds:

| Kind | Meaning | Attaches to |
|---|---|---|
| Deficiency | Wrong, missing or damaged | An item |
| Waiting | Cannot continue yet | An item, or a whole phase |

**Worst status wins is gone.** It made a unit with 17 items Complete and 1 Not
Started read `Not Started`, which hid a nearly finished unit. The rule now
counts instead of ordering. For any group, count `n` items, `c` Complete, `s`
Not Started, and `f` open issues below it:

| Test, first match wins | Reads |
|---|---|
| `n = 0` | a dash |
| `c = n` and `f = 0` | Complete |
| `c = n` and `f > 0` | In Progress |
| `s = n` | Not Started |
| anything else | In Progress |

**An open issue blocks Complete. It never raises Not Started.** The dropdown
does not offer Complete while an open issue sits on that item. Fix or cancel it
first, and Complete comes back by itself — the stored value is never changed.

---

## Install on a phone

**iPhone.** Open the app in Safari. Press Share, then **Add to Home Screen**.

**Android.** Open the app in Chrome. Press the menu, then **Install app**.

The app then opens with no signal, and it draws from the copy of the building
it keeps on the phone. An edit made with no signal goes on the queue and sends
itself when signal returns.

**Install it. Do not leave it in a browser tab.** iOS clears a website's stored
data after about seven days of no use, and it exempts an app that was added to
the Home Screen. In a tab, that clear takes the queued edits with it. The app
shows a note about this once per visit while it runs in a tab.

Data written in a tab is also invisible to the installed app, so somebody who
edits in both sees two different sets of queued edits. Installing fixes both.

---

## After you change a file in control/

From the repo root, run:

```
powershell -File tools/bump-version.ps1
```

That raises the counter in `control/sw.js`:

```js
var CACHE_NAME = 'pfc-control-0.3.0-dev.1';   // becomes dev.2
```

Phones keep serving the old copy until this string changes. **Every push that
touches a file in `control/` needs the counter to go up.** One bump per push is
enough, however many files changed.

The counter means nothing on its own. It is a tally, not a description of the
work. It never resets inside a milestone, and a gap in it is harmless.

`-dev` says the app is on the way to 0.2.0 and is not there yet. When 0.2 ships,
`tools/bump-version.ps1 -Release 0.2.0` drops the counter, and
`-Dev 0.3.0` opens the next milestone at `0.3.0-dev.1`.

### If a phone still shows the old version

Learned the hard way on 2026-08-07, when a header change took three app opens
and still did not arrive.

First find out where it is stuck. Open the site in **Safari**, as a normal tab,
and pull down to refresh.

- **Safari shows the old version too.** The release is not live. Check that the
  push reached `main`, and that GitHub Pages has finished building.
- **Safari shows the new version, the home screen app does not.** This is the
  normal case, and it is an iOS rule, not a fault. **A home screen web app on
  iOS keeps its own private copy of the site, separate from Safari's.** Clearing
  Safari's website data does nothing to it.

The only reliable cure for the second case:

1. Long press the icon, Remove App, **Delete App**. This is the step that throws
   away the app's private copy.
2. Open the site in Safari and check it shows the new version.
3. Share, then **Add to Home Screen**.

Version 0.1.2 fixed the two faults that made this happen so easily: `sw.js` no
longer throws away a half saved file, and `common.js` now calls
`registration.update()` on every open. A phone stuck on 0.1.1 or older cannot
receive that fix by itself, because the fix lives in the very files that are
stuck. Those phones need the delete and re-add above, once.

---

## Running it

The app needs no build step and no tools. Serve `control/` over `https`, for
example with GitHub Pages.

To try it on this computer, run one of these from the repo root, then open
<http://localhost:8080/control/>:

```
python -m http.server 8080
npx --yes http-server -p 8080
```

Opening a file directly from the disk works too, but the offline copy does not.
A Service Worker needs `https` or `localhost`.

---

## Before the backend is connected

**0.2 deleted the demo buildings.** 0.1 showed two made-up buildings while
`API_URL` was empty. Invented statuses sitting beside real ones are a trap, so
every screen now says what is actually wrong instead: with no `API_URL` the app
reads `This app is not set up yet. Tell the Admin. (E1)`.

---

## What comes next

| Version | What it adds |
|---|---|
| 0.1 | Create a building. Look at status. Read only. **Shipped.** |
| 0.2 | Saving, with an offline queue. Structured deficiency entry and the Logging screen. **Shipped.** |
| 0.3 | Crew access. Google login, a record of who changed what, a lock per building, and the Archive window. |
| 0.4 | A QR menu for trades and GCs, joined to the camera app's QR codes. |
| 0.5 | PDF export and material order lists. |

**0.2 left seams for 0.3 on purpose. Do not tidy them away.** The rule behind
all of them: *the server keeps answering with everything, and the phone does the
hiding.*

- `list-projects` returns every building, finished or not. The test that hides a
  finished one lives on the phone.
- `get-project` returns every record state — Open, Fixed and Cancelled. Fixed
  records feed the suggestion chips, and the Archive is a filter over records.
- The greyed **Archive** card on the home screen is where that window lands.
- The chip history is its own store, so a later version can refill it without
  touching the building copies or the queue.
