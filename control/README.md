# PFC Control

A job site tracker for Premier Finish & Construction. It shows the status of
every item, in every unit, in every building.

This is a separate system from the camera app in `Hub/Log/`. The two share no
code, no Apps Script project, and no Drive folder. Do not join them.

Version 1. You can look at any status and change it on screen, but a change is
**not saved** yet. Saving arrives in version 2.

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
    common.js         The link to the backend, the five statuses, the
                      rollup rule, and the demo building.
    logo.png          App icon.

  tracker/
    index.html        Every building.
    building.html     One building. Floors open one at a time.
    unit.html         One unit. Every item, grouped by phase.
    queue.html        Every edit that has not reached its Sheet.

  setup/
    index.html        Create a building. Change an existing building's
                      structure.

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
clasp push
clasp create-version "what changed"
```

Then open the editor, press **Deploy**, then **Manage deployments**, press the
pencil, set **Version** to **New version**, and press **Deploy**.

This is the same pattern the camera app uses. The address never changes.

`control/appscript/.clasp.json` links this folder to the script. Git ignores
it. It is separate from the `.clasp.json` at the repo root, which belongs to
the camera app. Do not mix the two.

---

## Where the files live

**Project Sheets.** Apps Script builds one Google Sheet for each building. It
saves them in a Drive folder named `Projects`. The script makes that folder the
first time you create a project.

By default `Projects` sits at the top level of My Drive. To put it somewhere
else, open that folder in Drive, copy the ID from the address bar, and set it in
`control/appscript/Code.js`:

```js
var PFC_ROOT_FOLDER_ID = 'paste the folder ID here';
```

**Master template.** `reference/PFC_Master_Template.xlsx` is the layout
specification. The backend does not copy it. It builds each Sheet in code, using
the template's colours, merges, column widths and formulas. This is why a
project can have any number of units and any list of items.

**Design.** `reference/design-handoff/` holds the visual prototype. Every colour
and size in `theme.css` comes from it.

---

## How a project Sheet is built

Each Sheet has three tabs.

| Tab | What it holds |
|---|---|
| `Unit Tracker` | One row per unit. Two columns per item: Status and Details. Then one rollup column per phase, then Last Updated and Overall Status. |
| `Dashboard` | How many units sit at each status, per phase and overall. |
| `_Config` | Hidden. The project's structure, as one line of JSON. |

**You may type a status or a note straight into the Sheet.** The app shows it
the next time the page loads.

**Do not add or delete columns or rows in the Sheet.** Use the Set Up Building
screen. It
keeps the columns, the formulas and `_Config` in step. A hand edit to the
structure breaks the rollups.

### Status values

| Status | Meaning |
|---|---|
| Not Started | Nothing done yet |
| In Progress | Work underway |
| Complete | Done, no issues |
| Deficiency | Wrong, missing or damaged |
| On Hold | Paused, for example waiting on materials |

Worst status wins. A phase shows Deficiency if any one item is a Deficiency.
Complete shows only when every item is Complete.

---

## Install on a phone

**iPhone.** Open the app in Safari. Press Share, then **Add to Home Screen**.

**Android.** Open the app in Chrome. Press the menu, then **Install app**.

The app then opens with no signal. Data still needs a connection. Without one,
each screen says so and offers **Try again**.

iOS clears a saved copy after about seven days of no use. Daily use keeps it.

---

## After you change a file in control/

From the repo root, run:

```
powershell -File tools/bump-version.ps1
```

That raises the counter in `control/sw.js`:

```js
var CACHE_NAME = 'pfc-control-0.2.0-dev.7';   // becomes dev.8
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

While `API_URL` is empty, the app shows two example buildings, marked **DEMO**.
Every screen works, so you can see the whole app before you set up Drive. The
demo disappears as soon as the backend answers.

---

## What comes next

| Version | What it adds |
|---|---|
| 0.1 | This. Create a project. Look at status. |
| 0.2 | Save a status and a note. Changes queue when there is no signal, and send when signal returns. Structured deficiency entry, moved up from 0.3. |
| 0.3 | Crew access. Google login, a record of who changed what, and a lock per project. |
| 0.4 | A QR menu for trades and GCs, joined to the camera app's QR codes. |
| 0.5 | PDF export and material order lists. |

The place version 2 attaches is marked in two files. Look for `Store` in
`shared/common.js`, and the note at the end of `appscript/Code.js`.
