# PFC Control 0.2 — map

Labels: wayfinder:map

## Destination

A locked build plan for PFC Control 0.2. This map closes when every 0.2 decision
is settled and written down, ready to hand to one build session. No production
code is written on this map.

## Notes

Domain: PFC Control, the deficiency and progress tracker in `control/`. It is
System 2 in this repo. Do not touch the camera app (System 1).

Read `CLAUDE.md` at the repo root before any session on this map.

Skills every session should consult: `/grilling` and `/domain-modeling`.
Prototype tickets use `/prototype`. Research tickets use `/research`.

Standing preferences for this effort:
- Miguel is a carpenter, not a coder. Explain every choice in plain language in
  chat, not only in code comments.
- Write all prose in ASD-STE100 Simplified Technical English.
- **Ask questions with the clickable picker, not as prose.** Miguel answers by
  tapping. Recommended option first, labelled `(Recommended)`. Two to four
  questions a round is fine. Put concrete numbers and rough screen sketches in
  the preview field. `Other` is added by the tool and never shows in the written
  option list, so say it is there when a question may need a free answer.
- Define every technical term inside the option that uses it.
- **Push back.** Miguel asks for it by name and changes course when the argument
  is good. Do not take the first answer and move on.
- **He wants to launch, not to study.** His words: the app is vibe-coded, and he
  wants to learn later. Explain enough to decide. Do not turn an answer into a
  lesson.

Design principle Miguel stated, on 2026-08-06:
- **Tracker stays as lean as possible, and the data stays logged.** Looking must
  not get slower because logging got richer. This drove `12-logger-door`, which
  answered it by giving logging its own form-shaped door.

Scale to design for, stated on 2026-08-07:
- Up to about **50 buildings** over the life of the tool. One or two are live at
  a time. This is why the phone drops old copies, and why a finished building has
  to leave the Tracking list.

Who uses it:
- Miguel and one coworker, working in the three phases the app knows.
- Two higher-ups do staircases, which the app cannot hold yet. See
  `.scratch/0.3-backlog.md`.

What 0.2 covers:
1. Fast screens, drawn from a local copy on the phone.
2. Two-way saving, from the app back to the project Sheet.
3. An offline queue with a visible pending mark. Never a silent loss.
4. Structured deficiencies. Several records per item. The same treatment for
   Waiting, which was called On Hold. A new Deficiencies tab in the Sheet, and
   the screen to enter it.

Vocabulary, settled in `01-deficiency-record-fields`. Use these words:
- **Progress** — the manual dropdown: Not Started, In Progress, Complete.
- **Flag** — Deficiency or Waiting. A flag is never set by hand. It appears while
  an open record exists.
- **Record** — one problem and one needed line, held in the Deficiencies tab. It
  carries an id made on the phone, and a state: Open, Fixed or Cancelled.
- **Waiting** — the old On Hold. Renamed so `In Progress · Waiting` reads without
  contradiction.

Doors, settled in `12-logger-door`. Two doors, split by task, not by permission:
- **Tracker** — a tree. Tracking, Building, Floor, Unit. Answers "how is floor 2
  doing". Holds Progress, and closes records.
- **Logger** — one form. Answers "this one door is wrong". Writes records only.

## Decisions so far

- Destination and 0.2 scope (this charting session) — 0.2 = fast local copy,
  two-way saving, offline queue, structured deficiency and On Hold records with
  a reworked entry screen. The map delivers a plan, not code.
- Access stays unlocked. No sign-in. No author recorded. The plan must leave a
  clean seam for Google login later.
- No upgrade path for existing Sheets. Change the master template, trash the
  test Sheet, make the real building fresh from the new template.
- Custom items stay at building level, as Admin already supports through the
  "Other" row. Everything new must key off whatever items a project holds. Never
  a fixed item list.
- [Browser storage limits for a PWA on iOS Safari](issues/08-ios-pwa-storage-limits.md)
  — space is not a constraint on iOS 17 and later. `sessionStorage` is out. iOS
  wipes stored data after 7 days without interaction, but WebKit exempts an
  installed home screen app. Install is the line between safe storage and storage
  that disappears.
- [Apps Script limits on safe Sheet writes](issues/07-apps-script-write-limits.md)
  — no published cap on web app calls. The existing script lock serialises every
  write across every project. A busy server and a permanent failure look the same
  to the app today, which the queue must fix. The existing code is already safe
  around rollup formulas and already finds a unit row with no extra calls.
- [What one deficiency record holds](issues/01-deficiency-record-fields.md) — one
  record is one problem and one needed line, with a count. The needed line stays
  free text, helped by suggestions and the hint `ex: 32" 6" RH`. The reason list
  follows the phase, not the item. **Progress and problems split apart:** the
  dropdown keeps Not Started, In Progress and Complete, while Deficiency and
  Waiting become flags driven by open records. `On Hold` is renamed **Waiting**.
  A Waiting record can attach to a phase, not only an item. Records are marked
  Fixed, never deleted and never moved. No Archive tab. No photo, no author and
  no promised date in 0.2.
- [How the Deficiencies tab lays out](issues/02-deficiencies-tab-layout.md) — one
  tab, one header row, twelve columns holding keys not labels. **Every record
  carries an id, and the phone makes it before the save leaves the phone.** That
  is what makes a retried save safe: the server appends when the id is new and
  overwrites when it is not, so a retry can never make a duplicate. Rows always
  go on the bottom. The server finds a row by reading column A whole in one call.
  A third state, **Cancelled**, was added for a record entered in error, so a
  typo never looks like a repair. Admin refuses to remove an item that holds an
  open record. `rebuildTracker` must never touch this tab. The rollup moved out
  of this ticket into `11-rollup-rules`.
- [What the phone keeps locally and when it refreshes](issues/03-local-copy-rules.md)
  — one new call, `get-project`, returns a whole building in one answer, because
  the Tracker tab is one grid and the server reads it in one pass either way.
  Storage is **localStorage**, one key per building, ten buildings kept, least
  recently opened dropped. `sessionStorage` is out, so `Store` in
  `control/shared/common.js` is rewritten. A refresh runs on app open (the list
  only) and on building open, plus pull to refresh. No timer. A stored copy draws
  instantly under a thin moving bar; a spinner survives only where no copy exists.
  No staleness clock — the app warns only when a fetch fails. Demo buildings are
  deleted.

- [Does logging get its own door, separate from Tracker?](issues/12-logger-door.md)
  — yes, and the split is **by task, not by permission**. Tracker stays a tree
  and keeps its Progress dropdowns. **Logger is a form, not a second tree**: the
  place is set once at the top, and the record fields under it clear after each
  save. Logger writes records only. Progress and marking a record Fixed both stay
  in Tracker, which is where **Fix all** now lives. Structured per-item dropdowns
  were proposed and rejected: the needed line stays free text, and **suggestions
  carry the consistency the dropdowns would have bought**. The Hub gains a `Log`
  card. `Deficiencies` stays greyed out in 0.2.

## Not yet specified

- Whether a Waiting record can attach to a whole unit, for something like no
  power on site or a locked unit. Only item and phase are settled.
- How the Service Worker and `CACHE_NAME` handling change once the app holds
  real data locally. Today the Service Worker caches the app shell only. One fact
  is now known: `sw.js` must delete old Cache API entries in its `activate`
  handler, because a worker update does not remove them.
- Whether a photo belongs on a deficiency record in 0.2, or later.

## Out of scope

- Per-unit item variation. An item that applies to only some units in a
  building. This is a structure problem and belongs to Admin. Take it up as its
  own effort later.
- Crew identity, sign-in, and Google login. Later version.
- Two phones changing the same unit, and who wins. Access is unlocked, but
  Miguel is the only user in practice for 0.2.
