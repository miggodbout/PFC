# CLAUDE.md — PFC Repo Context

This file gives Claude Code persistent context for this repo. Read it before making changes.

---

## Two Standing Notes — read these first

Both were written by Miguel on 2026-08-09, after a session stopped short and
asked permission for things he had already decided. They exist to stop that
happening again.

### 1. Ship it. The crew is not on this app yet.

**PFC Control is under construction, and nobody but Miguel opens it.** The
crew does not touch it until **0.4 at the earliest** — that is the QR Log
and Status menu, the first release aimed at anyone else.

So **commit and push without asking.** A bad push costs Miguel one reload.
It cannot cost a carpenter his afternoon, because no carpenter is looking.
The normal flow is: commit on the version branch, merge to `main`, push
both. `main` is what GitHub Pages serves.

Do not weigh "does this diff reach a crew phone" any more. Until 0.4, the
answer is no.

**What this does NOT change:** still bump `CACHE_NAME` on every push, still
say plainly what was and was not tested, and still ask before anything
destructive — a force push, a history rewrite, a hard reset, or deleting a
Sheet. The rule is about hesitating, not about care.

The camera app is the exception, and it always was. It IS in daily crew use.
Its rules further down stand untouched.

### 2. Claude is connected to Apps Script. Redeploy it yourself.

`clasp` is installed and already logged in on this machine. **Never hand a
redeploy back to Miguel as a manual step.** If a change to `Code.js` needs
to be live, put it live in the same session, then say which version it
became.

For **PFC Control**, from `control/appscript/`:

```
clasp push --force
clasp create-deployment --deploymentId <the id below> --description "what changed"
```

**Update the existing deployment. Never create a new one.** The deployment
id is the one already inside `API_URL` in `control/shared/common.js`:

```
AKfycbzo9lCHMaxDqMEk6PPZouUWXG6dDeAMh3tHI0dtYExjCYE9DYDdT4vj8_YCrtnGjv5e
```

A new deployment mints a new URL, which orphans every phone still holding
the old one. `clasp list-deployments` shows both the live one and a `@HEAD`
entry — `@HEAD` is not it.

Then **prove it landed**, rather than trusting the command. One `curl` at
the web app URL with the action you changed, and read the field back:

```
curl -sL ".../exec?action=list-projects"
```

The same applies to the camera app's script in `appscript/`, with its own
config and its own deployment. Both configs are gitignored and live only on
this machine.

---

## Writing Standard

**UI text follows ASD-STE100 Simplified Technical English.** Every word the crew reads on a screen obeys these rules. A worker reads his phone in bad light, in a hurry, wearing gloves. Ambiguity costs him time.

- Short sentences. One instruction per sentence.
- Active voice. Name the actor.
- No contractions.
- Plain common words over jargon, where a plain word exists.
- No stacked auxiliaries or filler phrases.
- No marketing adjectives.

This does not apply to code syntax or variable names.

**Two dictionaries carry this standard, in `docs/`.** Both were started on
2026-08-09, after the 0.2 step 3 test round found crew-facing screens using words
the crew does not use.

- `docs/crew-words.md` — **the rule book for text on a screen.** Check every new
  UI string against it before writing the string. A word it does not cover gets a
  new row marked OPEN, never a guess. An OPEN row does not block building a
  screen; it blocks shipping one.
- `docs/code-words.md` — plain-English definitions of the coding terms used on
  this project, for Miguel. Reference only. It never changes the app. If a term
  comes up in a session and is not in there, add it.

**Everything else — documentation, comments, commit messages, chat — is written plainly, not formally.** The goal is no filler, not stiffness. Contractions are fine. Cut marketing adjectives, hedging, padding, and restated points. Say a thing once and move on.

---

## Repo Owner

Miguel Godbout. Finish carpenter at Premier Finish & Construction (PFC), Moncton, New Brunswick. Not a formal foreman, but manages field tracking by choice.

Pitch explanations to this level:

- **Strong with computers.** He works in Windows down to the registry, in CMD, and with self-hosted servers. He deduces technical causes well. Do not explain computers to him.
- **He writes no code.** He reads no JavaScript. He can often deduce what a line does, but not reliably.
- **So: define coding terms when you use them.** This includes dev-workflow terms — branches, deployments, OAuth, CORS. Explain the intent and the non-obvious parts, then trust him to follow the rest. Do not narrate every line.
- **He wants to learn, but the launch comes first.** Teach in passing while you build. Do not stop the work for a lesson. Do not pad an answer with background he did not ask for.

Write clear, commented, modular code. Explain non-obvious decisions in comments.

---

## Two Separate Systems in This Repo

This repo holds two independent systems. Keep them separate until a roadmap milestone bridges them on purpose — the QR Log/Status menu is that planned bridge. Until then, do not share code, Apps Script deployments, or Drive folders unless told to.

### System 1 — Camera App (live, in daily use by the crew)

Purpose: crew photographs the physical checklist sheet taped to each unit door. Photo uploads to Google Drive, auto-sorted by job/floor/unit.

Status: live, but Miguel expects to scrap or rebuild it. Ask before any large work on it.

**Do not modify these files without explicit instruction:**
- `Hub/Log/index.html`
- `Hub/Log/app_v1.html`
- `Hub/Log/app_v2.html`
- `appscript/Code.js` — the Apps Script project calls this file `Code.gs`. Its clasp config is `appscript/.clasp.json`, beside it.

**Never put a `.clasp.json` at the repo root.** `clasp` walks up the folder tree until it finds one, so a config at the root makes every clasp command anywhere in the repo push to whichever script that config names. The camera app's config sat there until 2026-08-08 and was moved down into `appscript/`. Each script now has its own config next to its own code, and clasp at the root correctly finds nothing. Both configs are gitignored and live only on Miguel's machine.

`upload.html` is part of the live camera app but is not in this repo. It exists only inside the Apps Script project. Do not look for it here.

Backend: Google Apps Script, deployed as a web app. Redeploy via Manage Deployments → pencil icon → New Version. Never create a new deployment — the URL is embedded in printed QR codes on physical sheets and cannot change.

Branding: dark theme, accent color `#C4814E`, Arial font.

### System 2 — PFC Control (new, in active development)

Purpose: Miguel's structured deficiency and progress tracking tool. Solves a different problem than the camera app — fast, glanceable, per-unit status lookup, instead of photo documentation.

Location: `control/` at the repo root.

Structure:
```
control/
  index.html          — Hub home (grid of feature cards)
  manifest.json
  shared/               — theme, logo, shared JS
  tracker/               — view project status (Tracking → Building → Floor → Unit)
                           The section is named Tracking. Only the address list
                           on tracker/index.html is headed Buildings. See below.
  admin/                  — unlisted, create/edit project structure
```

Backend: separate Google Apps Script project from `Code.gs`. Do not merge them.

Data: one Google Sheet per project (building), generated from a master template.
- Local reference copy: `reference/PFC_Master_Template.xlsx` (repo root)
- Live template (Drive): `PFC/Control/Master Template/PFC_Master_Template.xlsx` (ID: 1QIF5TCJ0iekpNGHEjce1PSoFXRFhucmF-ednTSYHT-M)
- Generated project Sheets (Drive): `PFC/Control/Project Sheets/`

### The Drive layout, and the one reference that a move can break

Settled 2026-08-08 during 0.2 step 2 testing.

```
My Drive/PFC/
  Control/          ← PFC Control owns everything in here    1SwrhzsObgZpaLsjJtP5ErsEZtt53ton9
    Project Sheets/     generated project Sheets             1_J7pwpy3NFYIpBSAD8rg6O7L7jGLhnWE
    Master Template/                                         1It8gHaSGjsSGgVx2gucnhsBHkibaPwvY
    Apps Scripts/       holds the PFC Control script only    1icyZGjIM6TTCy1VFuxZR4Q6Jo1ynyCuT
  Project Logs/     ← the camera app writes here             1-eJRDVcj7CrGM02XE-gXs_EU4YdazdYg
  Personal/         ← Miguel's own files, no code touches it 1UoQj3eCBdgrNw_F0MoNbKelZQx8HPFYK
```

`Apps Scripts` sits **inside** `Control`, so despite the plural name it holds the
PFC Control script alone. The camera app's script project has no home folder yet.
Do not put it in there — that would nest a camera app file under Control. Give it
one beside `Project Logs` when it matters.

**Drive tracks a file by ID, never by path**, so dragging a folder in the Drive UI
does not break an ID reference. Both scripts pin their root by ID:
`PFC_ROOT_FOLDER_ID` in `control/appscript/Code.js` and `ROOT_FOLDER_ID` in
`appscript/Code.js`. Moving or renaming either folder is safe. Moving the Apps
Script project files is safe too — clasp finds them by `scriptId`.

**One exception.** `PROJECTS_FOLDER_NAME` is found by *name*, inside whichever
folder `PFC_ROOT_FOLDER_ID` names. Drag `Project Sheets` out of `Control` and the
lookup silently creates a new empty one, and every project disappears from the
app with no error. Move it only by moving `Control`, which carries it.

History: the code wrote to `My Drive/Projects/` at the top level, because
`PFC_ROOT_FOLDER_ID` was empty. Fixed to `PFC/Project Sheets/`, then moved again
under `Control/` the same evening so the camera app, PFC Control and Miguel's own
files each have their own branch.

Branding: dark theme, accent color `#DE7452` (primary), `#A47263` (secondary) — deliberately distinct from the camera app's gold, so the two tools are visually distinguishable.

Icon: `PFC/assets/Logo Placeholder.png` — known placeholder, low resolution. Do not attempt to enhance it. Will be replaced later.

PWA: installable on iOS and Android. Mobile-first. Service Worker caches the app shell so it opens with no signal on site.

Full build spec: see `PFC_Control_Opus5_Prompt.md` in the repo root. That file is the
0.1 spec. **For 0.2, read `PFC_Control_0.2_Build_Prompt.md` in the repo root first** —
it says how the 0.2 build is run, and points at the spec and the log.

---

## Core Design Principles (PFC Control)

1. **Config drives structure, not code.** Never hardcode a floor count, unit count, or item list. Structure comes from data created in Admin.
2. **Structure changes go through Admin only.** Never edit Sheet columns/rows to change structure — only through the Admin UI. Direct Sheet edits are for status/detail values only.
   **Escape hatch:** if Admin cannot do what Miguel needs, he is not stuck. Ask first, hand-edit the Sheet, and write down exactly what changed. Then fix Admin to cover that case, so the hatch is not needed twice.
3. **Offline-aware.** Job sites have unreliable signal. Every fetch call must fail gracefully, never crash blank. Data edits (from 0.2 onward) queue locally and sync when signal returns, with a visible pending state — never a silent optimistic save that can lose data.
4. **Many doors, one system.** Different users reach the same data through different views. Do not duplicate data per view.
5. **Expect frequent change.** Miguel will request many incremental changes over time. Favor small, separate files over large ones. Comment clearly.
6. **Aim for one new Hub card per MINOR release. This is a guideline, not a rule.**
   Miguel proposed it on 2026-08-08 while planning 0.2, and said plainly it is a
   suggestion to hold back scope creep, not a law.

   **It counts buttons on the Hub. It does not count features.** Corrected by
   Miguel on 2026-08-15, after this file's old wording made a session argue that
   0.3 had to be split in two. His words: *"the main screen / hub should aim to
   only gain one button / window. in this case bulk would be the only one, the
   other features are just extra buttons within existing ones."*

   So a release may hold any amount of work, as long as the Hub gains at most one
   card. A new control inside an existing screen is free under this guideline.
   The thing it guards against is the Hub turning into a wall of buttons.

   **A release can also spend the budget backwards.** 0.2.1 removed two greyed
   cards, `Deficiencies` and `Materials`. Deficiencies named a window Log
   already is, and Materials is the 0.5 export. A card that reads "Coming soon"
   for six months stops meaning anything, and it is still a button on the wall.

   **How to use it:** when a release wants a second Hub card, do not refuse it —
   **push back, make the case both ways, and let Miguel decide.** That is what he
   wants the guideline to buy. 0.2 spent its card on **Logger** and argued the
   **Outbox** through as necessary. 0.3 spends its card on **Bulk**.

---

## Status Values (PFC Control)

**Version 0.1 shipped five statuses in one field. Version 0.2 splits them into two things.** The
reason: `In Progress · Waiting on Painters` is two facts about one item, and one
field cannot hold both. A single field also cannot hold several problems at once,
and one item often has several, each with its own needed line and count.

An earlier draft justified the split with a different example — six doors hung
and one on order, called Complete with a flag. Miguel rejected that on
2026-08-07. An item with an open problem is not Complete. The split stands on the
two reasons above.

**Progress** — the dropdown. Always set by hand. One value per item:

| Value | Meaning |
|---|---|
| Not Started | Default, nothing done |
| In Progress | Work underway |
| Complete | The work is done |

**Flags** — never set by hand. A flag appears while an open record exists in the
Deficiencies tab, and clears when the last one is fixed:

| Flag | Meaning | Attaches to |
|---|---|---|
| Deficiency | Wrong, missing, or damaged | An item |
| Waiting | Cannot continue yet (painters, delivery, backorder) | An item or a phase |

`On Hold` was renamed **Waiting** in 0.2, so `In Progress · Waiting on Painters`
reads without contradiction.

**Rollup: worst wins is deleted.** Settled 2026-08-07 in
`.scratch/pfc-control-0.2/issues/11-rollup-rules.md`. The 0.1 order made a unit
with 17 Complete items and 1 Not Started item read "Not Started", which hid a
nearly finished unit.

The rule is now unanimity or In Progress, counted rather than ordered:

| Test | Reads |
|---|---|
| No items | A dash |
| Every item Complete, no open flag | Complete |
| Every item Complete, an open flag | In Progress |
| Every item Not Started | Not Started |
| Anything else | In Progress |

An open flag blocks Complete. It never raises Not Started. Every level also shows
a count, such as `14/18`, and both flag kinds show with their own counts. There
is no contest between Deficiency and Waiting, because neither one is a status.

**An open flag blocks Complete on an item too, not only on a rollup.** Settled by
Miguel on 2026-08-07: "Interior Doors cannot be Complete if there is a
deficiency." The dropdown does not offer Complete while an open flag of either
kind sits on that item. Fix or cancel the record first.

**The blocked row is greyed, not removed.** Settled in
`.scratch/pfc-control-0.2/issues/05-pending-state-ui.md`. Complete stays in the
dropdown, dimmed and not tappable, with one line under the panel: "Fix the open
flag first. Then Complete comes back." A row that silently disappears reads as a
broken app.

**An item is never removed from the Unit screen either.** Settled by Miguel on
2026-08-08 in `.scratch/pfc-control-0.2/issues/14-building-archive.md`. Every item
a unit holds is drawn, whatever its Progress. **Complete is a mark on a row, never
a reason to remove the row.**

A planning session read the principle "Tracker stays as lean as possible" as
licence to hide finished items, and got as far as recommending it. Miguel
overruled the whole branch: "an item should never dissapear, just be marked
complete." Lean means fewer **flags and records** on the screen. It never means
fewer items.

The reason is recovery. The row is the control you set Progress with, so hiding it
takes away the only way to undo a wrong tap. What *does* leave the screen is a
**record**: a record marked Fixed stays greyed and struck through with
`Fixed · Undo` while you are on that unit, then it is gone. Do not propose hiding
finished items again.

So the rollup's flag test only has to catch **phase-level Waiting records**. Any
flag on an item has already stopped that item from reading Complete.

**Store what is set. Display what is true.** The Sheet holds whatever a person
last set by hand, and it never changes on its own. The app *displays* that value
with one downgrade: Complete shows as In Progress while an open flag sits on the
item. Fix the last record and Complete comes back by itself, because the stored
value was never touched. No extra column, and no automatic write.

**0.3 splits the record kinds three ways, and this section will need rewriting
then.** Decided 2026-08-15: `Deficiency` becomes work to redo, `Order` becomes
material to buy, and `Waiting` is unchanged. An Order blocks Complete exactly as
a Deficiency does, and carries its own count and colour. Nothing below is wrong
yet — it describes what is live — but do not treat two record kinds as settled.
See `.scratch/test-week-triage.md`.

**This section describes the shipped code, as of 0.2.0.** It used to carry a
warning that 0.1 still held the old five-value model. That is gone: `STATUS` and
`CYCLE` in `control/shared/common.js` hold three values, `worst()` and
`ROLLUP_ORDER` were deleted from both files, and `buildRollupFormula` in
`control/appscript/Code.js` counts by the rule above. The phone applies the same
rule in `rollup()`, and `displayStatus()` is the one downgrade.

---

## Screen Names (PFC Control)

**Tracking is the section. Buildings is one screen inside it.** Settled by Miguel
on 2026-08-07, shipped as 0.1.1.

`tracker/index.html` shows a list of addresses, so its on-screen header reads
**Buildings**. Everything else keeps the word Tracking: the Hub card, the browser
tab title, and all the planning language in `.scratch/pfc-control-0.2/`, where
ticket 14 asks when a building leaves **Tracking** and enters Archive.

Do not "fix" this for consistency. A header names what is on the screen. A card
and a section name the activity. They are allowed to differ, and Miguel chose
this deliberately after being offered the full rename.

---

## Version Numbers (both systems)

Use `MAJOR.MINOR.PATCH`. Never use `v1`, `v2` style names for a milestone again — a milestone is named by the version it ships as.

- **MINOR** (`0.1` → `0.2`) — a roadmap milestone. New features.
- **PATCH** (`0.1.1` → `0.1.2`) — fixes only, inside a milestone. No new features.
- **1.0** — reached when the crew uses PFC Control daily as the primary tool. It marks trust, not a feature count.

Current: PFC Control `0.2.1`. Camera app `0.1.2`. Last shipped Control
release: `0.2.1`, on 2026-08-15.

### Mid-build versions, and the counter that feeds the cache

Settled by Miguel on 2026-08-09, after the cache string had grown to
`pfc-control-0.2-step4-fix3` and nobody could say which fix round that was.

Two separate things had been fused into one string:

1. **The version** — what the app *is*. It changes rarely and means something.
2. **The cache key** — what tells a phone its copy is stale. It only has to
   differ from last time. It means nothing.

Build history was being encoded into #2 because #1 had nothing to say
mid-build. SemVer already answers that: a **pre-release** suffix.

**While building a milestone, the version is `MINOR.0-dev`.** So the whole of
the 0.2 build is `0.2.0-dev` — on the way to 0.2.0, not at it. Never write a
bare `0.2` for work in progress.

**A counter rides behind it, and it feeds the cache.** `CACHE_NAME` in
`control/sw.js` reads `pfc-control-0.2.0-dev.7`. The number is a tally. It
describes nothing, it never resets inside a milestone, and a gap in it is
harmless.

**The counter must go up whenever a new `CACHE_NAME` is needed** — that is,
on every push that changes any file inside `control/`. One bump per push,
however many files changed. Miss it and phones keep serving the old copy.

**Do not hand-edit the string.** From the repo root:

| Command | Result |
|---|---|
| `powershell -File tools/bump-version.ps1` | `0.2.0-dev.7` → `0.2.0-dev.8` |
| `... -Release 0.2.0` | `0.2.0-dev.8` → `0.2.0`, at the ship commit |
| `... -Dev 0.3.0` | `0.2.0` → `0.3.0-dev.1`, opening the next milestone |

This is the small build tool the Technical Constraints section named as a
known candidate. It is one PowerShell script, it edits one line, and the app
still runs from a plain file if it is deleted.

### Shipped releases are git tags, and a GitHub Release on top

Release history belongs in tags, not in a Service Worker string. Backfilled
2026-08-09: `0.1.0` at the first PFC Control commit, `0.1.1` and `0.1.2` at
the two patch commits. Tag every release from here on, at the commit stamped
by `-Release`.

**Every MINOR and every PATCH gets a GitHub Release.** Asked by Miguel on
2026-08-09 and agreed. A tag is a pointer with no room to explain itself. The
Release is where the notes live — what changed, and why it was worth shipping.
That is the only reason this repo has them: PFC Control is served from Pages,
so there is never a file to download.

```
gh release create 0.2.0 --verify-tag --title "0.2.0 — <what it is>" --notes-file <path>
```

**A dev counter bump never gets a Release, and never gets a tag.** `dev.8` is
not a version, it is a tally. A milestone runs to forty of them. Releasing each
one would bury the three that matter.

Notes follow the repo writing standard: plain, no filler, and they say what
broke as well as what landed.

**When to ship a PATCH at all.** Decided by Miguel on 2026-08-07, after two
releases in one evening. Ship a `0.1.x` only when the defect **costs someone
time every day**, or when it **blocks releasing at all**. Everything else waits
for the next MINOR, where the screen is usually being rewritten anyway.

The reason is the overhead, not the fix. A release costs a push, a Pages build,
a `CACHE_NAME` bump you must remember, and a phone update cycle that can go
wrong. That cost is the same for a one word fix as for a hundred line one.

The three releases that set the rule:
- `0.1.1` renamed a header Miguel reads every day. Daily friction. Shipped.
- `0.1.2` fixed the update path itself. Nothing could ship until it landed.
  Shipped.
- The loading header flash annoys for 200ms and costs the crew nothing. **Held
  for 0.2**, and written into the 0.2 map's Notes instead.

Two exceptions, both deliberate:
- `Hub/Log/app_v1.html` and `app_v2.html` keep their names. There `v1` and `v2` mean a second attempt at one file, not a release. The live app links to them.
- The browser storage key `pfc.control.v1.local` keeps its name. It is an identifier, not a label. Renaming it would orphan changes already saved on a crew phone.

---

## Roadmap Summary (PFC Control)

- 0.1: Admin (create/edit project structure) + Tracker (read-only view). Service Worker shell caching. **Shipped.**
- 0.2: Status editing with offline queue-and-retry sync, **plus structured deficiency entry**, which moved up from 0.3.
- 0.2.1: fourteen fixes out of the 0.2 test week. **Shipped 2026-08-15.** The
  build list is `.scratch/0.2.1-plan.md`; the sorting behind it is
  `.scratch/test-week-triage.md`. Three of the fourteen shared one root cause —
  the app read a weak signal as a refused write. See `hasReachedServer()` in
  `control/shared/common.js`.
- 0.3: **The Logger release.** Three record types, reason lists per type and per
  item, the History tab, bulk Progress by scope, and the "Log issue here" button.
  Decided 2026-08-15 — see below.
- 0.4: **The Archive release.** The history door, and the closed-job work behind it.
  - **Scoping rule, stated by Miguel on 2026-08-08:** anything about a **closed job** belongs to the Archive. Four items land under this one rule: the Archive window, the GC punch list, an abandoned job that never leaves Tracking, and rebuilding the chip history on a new phone. Settle the next one with the rule, not a fresh argument.
  - **It bound 0.2, and 0.2 paid it.** The short version: **the server answers with everything, and the phone does the hiding.** Verified in the shipped code — `handleGetProject` sends every record state, `handleListProjects` sends finished buildings, the Hub carries the greyed card. Do not trim any of those.
- 0.5: PDF export, material order summaries.
- **Unplaced:** the QR-based Log/Status menu, and the three crew-access items. See
  `.scratch/0.3-backlog.md`.

### 0.3 is the Logger. The Archive is 0.4. The QR menu has no version.

Decided by Miguel across 2026-08-14 and 2026-08-15, in one grill session on the
0.2 test-week fix list. **The full write-up is `.scratch/test-week-triage.md`.
Read it before charting 0.3** — it holds the live-data evidence behind every call
below, and 0.3 is charted with `/wayfinder` from it.

**What 0.3 holds.** Three record types — `Deficiency` (work), `Order` (buy),
`Waiting`. A reason list per type, plus words an item can add for itself, which
raises `_Config` to version 3. An append-only History tab, one row per Progress
change. Bulk Progress by scope. A "Log issue here" button on Tracker items.

**Why it beat the Archive to 0.3.** Both were on the table the day 0.2.0 shipped,
when 0.3 was named the Archive release. A week of real logging changed the
answer: 8 of 27 records escaped through `Other`, and the `needed` column that
feeds the 0.5 material order filled with verbs — `Adjust`, `Install`, `Flip
Privacy` — because the field is required. Every day of logging on the old shape
costs data. The Archive costs nothing to wait, and it stays cheap: read-only,
three screens, no backend change, every seam already left.

**Why the QR menu left the roadmap.** Miguel, 2026-08-14: "QR is a little stale i
dont even know where / if that fits at this point." It had held 0.4 since before
0.1 shipped, on a plan nobody had revisited. It is in the backlog now, unplaced,
beside crew access. **Do not write it into a version until something real puts it
there** — a GC asking for it, or the camera app needing the bridge.

**Crew access is still unplaced too**, and that has not changed since 2026-08-09.
The three items are in `.scratch/0.3-backlog.md` under their own heading.

### What the Archive holds, whenever it is charted

The release is named, not scoped. It was 0.3 from 2026-08-09 and became 0.4 on
2026-08-15 — see the section above for why. Nothing about its contents changed
with the move.

**Crew access is not in it, and never was after 2026-08-09.** The three items —
Google login, an author column, a lock per project, two phones on one unit — pay
out on the day somebody other than Miguel edits, and not one hour before. They
sit in `.scratch/0.3-backlog.md` under their own heading, with no version. **Do
not write them into a release until Miguel rules on it.**

The recommendation on the table, not yet ruled on:

- **The read-only Archive window alone.** One Hub card, and it needs **no backend
  change at all** — every seam 0.2 promised was checked in the shipped code. The
  three new screens are the Tracker screens with the item grid swapped for a
  record list, and read-only, so they are smaller than the originals.
- **The other three ride later, each on its own merit.** Each is bigger than the
  window. The close/reopen switch raises `_Config` again and migrates every live
  Sheet. The GC punch list may add columns to the Deficiencies tab, which
  migrates every live Sheet again. `rebuild-suggestions` runs one tab read per
  Sheet against the 6 minute Apps Script limit.
- **One conflict is already known and must be settled when it charts.**
  `dropFinishedCopies` in `control/tracker/index.html` deletes a finished
  building's local copy every time the Tracking list loads. Archive downloads it
  back, and Tracking throws it away again. Archive also cannot promise offline
  for a closed building, because 0.2 dropped that copy on purpose. It must say so
  rather than fail blank.

**Waiting on the test week was the right call, and it paid.** The reasoning was:
Archive draws the record data, so if testing changed the record shape, anything
built on top of it now gets built twice. Testing did change it — 0.3 splits
records into three types. An Archive built in August would have been rebuilt in
September.

Two scope moves were made on 2026-08-06, both for the same reason: building the
save path around free text first means building it twice.
- Structured deficiency entry moved from 0.3 into 0.2.
- The offline queue stayed in 0.2 rather than sliding to 0.3.

Deficiency records dropped the sub-item level and the photo. One record is one
problem and one needed line, with a count.

**Version 0.2 planning is finished. The map at `.scratch/pfc-control-0.2/map.md` is
closed.** Three files carry 0.2 now, and they do not overlap:

| File | Holds |
|---|---|
| `.scratch/pfc-control-0.2/BUILD-PLAN.md` | **What to build.** LOCKED. The destination of the map. |
| `PFC_Control_0.2_Build_Prompt.md` (repo root) | **How to run the build.** Branch, token cap, deploy loop, when a step is done. |
| `.scratch/pfc-control-0.2/BUILD-LOG.md` | **Where the build is.** One entry per session. Read the last entry first. |

The nineteen tickets in `.scratch/pfc-control-0.2/issues/` hold the reasoning behind
each decision. Read one only when the build plan points you at it. Pushed-back work is
listed in `.scratch/0.3-backlog.md`.

Do not build ahead of the current version without explicit instruction. Do leave clean extension points for the versions above.

---

## Technical Constraints (both systems)

- **Default to no frameworks and no build tools.** Vanilla HTML, CSS and JavaScript. The app must run by opening a file directly, or by serving it from static hosting.
- **This is a strong default, not a ban.** If a framework or a build tool is the obvious fix for a real problem, propose it. State what it solves, what it costs, and what breaks if it is removed later. Miguel decides. Never add one quietly, and never add one for tidiness alone.
- Known candidate: raising `CACHE_NAME` in `control/sw.js` by hand is easy to forget, and stale phones are the result. A build step that stamps the version automatically would earn its place.
- Mobile-first. iOS Safari is the primary browser for the camera app. iOS/Android PWA is the primary target for PFC Control.
- Every fetch call must fail gracefully with a clear message. Never a blank crash.
