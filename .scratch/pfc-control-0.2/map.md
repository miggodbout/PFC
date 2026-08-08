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
  the preview field.
- **The picker's free-text row broke on 2026-08-07 and worked again on
  2026-08-08.** On `13` it carried two answers no listed option would have — a
  restructure and a missed item. **Still write options that cover the whole
  space**, because it has failed once, but do not avoid the picker for fear of
  it. If it fails again, re-ask that one question in prose. One round cannot mix
  tapping and typing, because answering the picker ends the turn.
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
- **Bounded on 2026-08-08 by `14`, after a session read it too widely.** Lean
  means fewer **flags and records** on the screen. It does **not** mean fewer
  items. **Every item a unit holds is always drawn on the Unit screen, whatever
  its Progress.** Complete is a mark on a row, never a reason to remove the row —
  the row is the control you set Progress with, so hiding it takes away the only
  way to correct a mis-tap. Do not propose hiding finished items again.

Guideline Miguel proposed on 2026-08-08, and called a suggestion, not a rule:
- **Aim for one new window per MINOR release.** A window is a screen you reach
  from the Hub or from a door of its own. It exists to hold back scope creep, so
  a second window is an argument to have, never a refusal. **Push back, show both
  sides, let Miguel decide.**
- 0.2 spends its window on **Logger**. The **Archive** window moved to 0.3 on the
  strength of this. The **Outbox** from `05-pending-state-ui` was argued through
  as necessary, because `04` ruled that only Miguel drops a held edit, and that
  needs a screen with a Drop button on it.

Known 0.1 defect to fix inside 0.2, reported by Miguel on 2026-08-07:
- **The header flashes a wrong word while a screen loads.**
  `control/tracker/building.html` ships the literal word `Building` in its HTML
  and JavaScript replaces it when the address arrives. `unit.html` flashes
  `Unit` the same way.
- Miguel expected `03-local-copy-rules` to remove this by itself. **It removes
  it for a building already on the phone, and not otherwise.** A first open, a
  building dropped by the ten-building limit, and a fresh install all still
  fetch, and `03` keeps a spinner for exactly that case.
- So the fix is separate from the local copy. Either pass the name through from
  the Buildings list, which already knows it, or leave the placeholder empty. A
  blank header for a moment reads as loading. A wrong word reads as a label.
- Ticket `09` must fold this into the build plan. It is small, but it is not
  free, and it is not covered by any ticket on this map.

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

Added by `17-reason-list-scope`, 2026-08-08:
- **Reason** — *what is wrong.* One list of eight per building, trimmed per item.
- **Needed** — *what would fix it.* Free text, such as `32 6 RH`.
- **Subtype** — the kind of thing needed, picked from a list the item defines.
  It is part of the needed line, not part of the reason, and it has its own
  column. **Four items define a list**, settled in `13-admin-changes`: Interior
  Doors, Exterior Door(s), Handles, Stops. Every other item defines none and
  shows no dropdown. Each list ends with `Other`, which opens a text box.
- **Defective** — arrived wrong from the factory. Replaces `Warped`. Against
  **Damaged**, which means somebody hurt it after it arrived.

Added by `15-suggestion-list`, 2026-08-08:
- **Chip** — one past needed line, offered as a tap target under the needed box.
  Generated from records, never curated. A chip is not a list Admin owns.
- **Group** — the key a chip belongs to: **Type · item · subtype**. The chip row
  only ever shows one group.
- **The nomenclature dropped its inch marks.** The standard needed line for a door
  is now **`32 6 RH`**, not `32" 6" RH`. Miguel changed it because the inch mark
  is on the second iOS keyboard page and you reach it twice per door, in gloves.
  It is content, not code — the box is free text either way. **Every `32" 6" RH`
  example in `01`, `02`, `17` and `template-changes.md` is stale text**, logged
  for `18`.
- **Hint** — grey placeholder text inside the empty needed box, naming what each
  part means: `Size   Jamb   Swing`. One per item, held in `_Config`, edited in
  Admin. It is crew vocabulary — **Size** and **Jamb**, not width and depth.

Doors, settled in `12-logger-door`. Two doors, split by task, not by permission:
- **Tracker** — a tree. Tracking, Building, Floor, Unit. Answers "how is floor 2
  doing". Holds Progress, and closes records.
- **Logger** — one form. Answers "this one door is wrong". Writes records only.

Three files at the top of `.scratch/pfc-control-0.2/`, not tickets. Read them
before `09`:
- **`supersessions.md`** — which decision wins wherever two disagree. First pass
  2026-08-08, widened the same day by `13`. **`14` and `15` have both closed, so
  the second pass is now takeable.** That is `18`, and it is the last thing before
  `09`.
- **`template-changes.md`** — the master template spec. Nine sections. Section 5
  went FINAL when `13` closed, and section 9, **the default item list**, was added
  by it. **Section 8 is now empty**: `15` took no template change for the
  suggestion pool, and `14` answered the archive drop. The file needs only `18`'s
  sweep before it is FINAL.
- **`code-inventory.md`** — the 0.1 code read against all seventeen tickets.
  Every rollup call site, everywhere the demo data reaches, the exact lines each
  ticket deletes, and nine things no ticket owns. Written 2026-08-08.

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
  tab, one header row, thirteen columns holding keys not labels — twelve here,
  plus `subtype` added by `17`. **Every record
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

- [How a phase and a unit roll up from their items](issues/11-rollup-rules.md) —
  **worst wins is deleted.** The rule is unanimity or In Progress, expressed as
  counts, not as an order: all Complete reads Complete, all Not Started reads Not
  Started, anything else reads In Progress. **An open flag blocks Complete but
  never raises Not Started**, so a fully built unit with a door on order reads
  `In Progress ⚑1`. A hand-set **item** may still read `Complete ⚑1`; only a
  computed rollup is blocked. Every level shows a count beside the status, such
  as `14/18`. Both flag kinds show with their own counts, which overrules the
  Deficiency-beats-Waiting line in `CLAUDE.md`. The phone works the rule out and
  the app trusts only the phone; the Sheet keeps its own formula so it reads by
  hand, and any drift is cosmetic. **Amended the same day:** a flag blocks
  Complete on an **item** too, not only on a rollup. The dropdown does not offer
  Complete while an open flag of either kind sits on the item. What happens to an
  item that is *already* Complete when a flag lands **displays** as In Progress
  while the flag is open, and returns to Complete when the last record is fixed.
  This needs no stored state and no automatic write: the Sheet keeps what a
  person set by hand, and only the display is downgraded.

- [What happens when the app runs in a Safari tab, not the installed icon](issues/10-tab-versus-installed-app.md)
  — **one signal only: installed or not**, checked via `display-mode: standalone`.
  Installed shows nothing. Not installed shows a small dismissible note, once
  per tab-mode open, with a step-by-step install tutorial. `navigator.storage.persist()`
  runs silently in the background either way — **the earlier idea of a separate
  warning when it is refused was dropped**, since there is no action the crew
  can take about a refusal. The tab/installed data-isolation problem gets no
  separate handling; the install nudge is the fix for both. Miguel and his
  coworker are already installed today, so this is a safety net, not an active
  fix. GC/trade access stays out of scope here — that is the 0.4 QR-based
  Log/Status menu.

- [What one queued edit is, and what happens when it fails](issues/04-queued-edit-rules.md)
  — **the outbox is a keyed shelf, not a line-up.** One job per item, keyed
  `project|unit|item`, and one job per record, keyed by its id. A second change
  replaces the first, because every job carries the final value. `update-item` is
  replaced before it is built by **one action, `save-batch`**, which takes the
  whole outbox, takes the script lock once, and answers **one result per job**.
  Every result says `retry: true` or `retry: false`, which fixes the fault `07`
  found. Retry runs on a backoff, 5s, 15s, 1m, then every 5 minutes, **only while
  jobs wait** — a deliberate break from `03`'s no-timer rule, because this
  finishes work already asked for. A failed edit **is held, never dropped**:
  `retry: false` holds at once, an unnamed error holds after 10 tries, and only
  Miguel drops one. **A waiting edit paints the screen, a held edit does not**, so
  a rollup can never read Complete off an edit that will never land. A retap
  replaces a held edit. The outbox is its own localStorage key, a drain runs
  before the refresh on app open, and **a building holding any waiting or held
  edit is never dropped from the phone**.

- [What a pending save looks like on screen](issues/05-pending-state-ui.md) —
  **two mechanisms, split by screen.** On Unit, a turning ring marks the item,
  the phase and the unit pill, and a failed edit opens a red card under the item
  with Try again and Drop. On Building and Tracking, **one sync bar** carries
  everything: `Saving 3 edits…`, `Offline · 3 edits wait`, `2 edits did not
  save`. **The count lives in the bar and nowhere else**, and the bar opens an
  Outbox screen. The bar rides on every screen including Unit, so a failure on
  another unit always reaches you; the cost is that a failure on the unit you are
  looking at is said twice. Above the Unit screen, **only a held edit marks the
  tree, never a waiting one** — a red dot on the unit chip **and on the floor
  header, because a floor closes and hides its chips**. A landed edit says
  nothing at all. Building the real dropdown also settled a detail `11` left
  open: the blocked Complete row is **greyed with a reason, not removed**.
  Asset: `prototypes/05-pending-state.html`.

- [What the Logger form and the record list look like](issues/06-deficiency-entry-screen.md)
  — the form gains a field nobody had drawn: **Type**, Deficiency or Waiting,
  above everything else, because `01`'s two reason lists share no value. Order is
  Type, Item, Needed, Count, Reason, Save, and **six controls is the whole
  budget** — anything added pushes Save under the keyboard. The place bar is two
  lines and **the phone remembers the building and the phase, never the unit**. A
  phase-level Waiting record is the first row of the Item dropdown, `Whole phase
  — Doors & Windows`. On Tracker: **tap the flag to open** the record list, the
  0.1 **Details box is dropped** and its column leaves the template, and `Fix
  all` is the bulk action. The "prompt when the dropdown moves to Complete"
  candidate is **impossible**, not rejected — `05` and `11` made Complete
  untappable while a flag is open — so the shortcut moved to a card that offers
  Complete after the last fix. **A fixed record leaves Tracker**, staying greyed
  with Undo only until you leave the unit. Asset:
  `prototypes/06-logger-and-records.html`.

- [How wide a Reason list is, and who writes it](issues/17-reason-list-scope.md)
  — Miguel's list of variables mixed **two fields**. `Damaged` and `Wrong Swing`
  are Reasons. `Bypass`, width, depth and swing are the **needed line**. Sorted
  that way, the reasons collapse to **eight, six of which apply everywhere**, so
  **the variables were never in this field.** `01`'s three per-phase lists are
  deleted: there is **one list per building plus a short trim per item**, because
  eighteen per-item copies would make "add a reason to everything" eighteen edits
  instead of one. A custom item gets all eight and no trim, which kills `01`'s
  empty-dropdown objection. **`Warped` is renamed `Defective`** — arrived wrong
  from the factory, against `Damaged`, hurt on site. **Lists only grow**: Admin
  needs Add and never Delete, and it touches only the reason and type lists.
  The Waiting list **never varies**, confirmed. The ticket also drew a field
  nobody had: **a Subtype dropdown**, eight door types and four handle types
  (**the lists were wrong — `13` rewrote them, see below**),
  which **partly overturns `12`** — one field, not the four it rejected — takes
  **a thirteenth column** in the Deficiencies tab, and takes `06`'s form **from
  six controls to seven**. Admin owns both lists, and a list change must not
  rebuild the Tracker tab.

- [What Admin must change for the Deficiencies tab](issues/13-admin-changes.md)
  — four decisions and a bigger one nobody asked for. **The `remove-item` refusal
  offers one bulk button, `Cancel all N records`**, with a confirm and no undo,
  because removing an item means PFC is not doing that work and every open record
  on it is Cancelled. It is two steps: cancel, then remove again. **Admin stays one
  page** — a fifth card, **Lists**, holds the building reason list, an item
  dropdown, that item's subtypes and its reason trim. A card in an existing screen
  is not a window, so 0.2 still spends its window on Logger. **`rename-item` is
  added**, label only, key never moves, because without it a typo orphans every
  record plus the item's own two lists. **A new value stays in its building**; new
  buildings seed from defaults in `common.js`, which also answers the master
  template question — `handleCreateProject` never copies the .xlsx, so the .xlsx
  is a drawing and the code is the seed. `_Config` gains `reasons` at building
  level and `types` plus `trim` per item, and its `version` rises to 2. Confirmed
  without asking: `rebuildTracker` already cannot reach the Deficiencies tab, and
  `remove-unit` stays out. **The bigger change: Miguel rewrote the item list.**
  `17` had written its type lists against `Hardware` and `Baseboards`, which are
  phases, not items — and its four handle types were already three items. He fixed
  it by collapsing them: Passage, Privacy and Dummy become subtypes of a new item
  **Handles**, Spring Stops and Hinge Stops become subtypes of **Stops**, Unit Door
  stops being an item and becomes a subtype, and **Bathtub** joins Phase 1. Ball
  Catch stays its own item. **14 items, was 17**, and the Tracker tab goes from 41
  columns to 21. The accepted cost: Passage and Privacy now share one status row.

- [When a building leaves Tracking and enters Archive](issues/14-building-archive.md)
  — **a finished building leaves Tracker in 0.2, and an item never leaves at all.**
  The item half was a misunderstanding, and Miguel closed it as a rule, not an
  option: **every item is always drawn on the Unit screen, whatever its Progress.**
  Complete is a mark on a row, never a reason to remove the row. What he meant is
  the **flag and its records** leaving, which `06` already built. Reading A is
  dead, and with it the empty-phase-header problem at `unit.html:91`. On the
  building half he was offered the safer reading — hold the rule for 0.3 — and
  chose against it, so **0.2 has no door onto a finished building**: the only way
  to read one is to open the project Sheet. This closes the conflict `18` found —
  `03`'s archived-building drop **does** fire in 0.2. Four rules ship: a building
  **keeps its row while any waiting or held edit is on the phone**, because it
  reads Complete off values the Sheet has not accepted; **no force switch**, so an
  abandoned job never leaves (now 0.3 work); **`list-projects` sends counts and the
  phone applies `11`'s rule**, because a drift that hides a live building is not
  cosmetic, and `Code.js:189` already opens every Sheet so it costs one read; and
  **the row stays greyed until the next app open**, `06`'s Undo shape one level up,
  which lines up with `03`'s drop for free. Tracking gains a **second empty
  message** for the all-finished case, since today's one reads as data loss. A
  Cancelled record counts as closed, confirmed without asking. **Two rules must
  stay separate in the build** — leaving the Tracking list is what the app *draws*,
  dropping the local copy is what the phone *stores*. `04`'s exemption is a storage
  rule and survives untouched.

- [Where the needed-line suggestions come from](issues/15-suggestion-list.md) —
  **the seed list is deleted, and the chips are sourced from every building on the
  phone.** `03` already keeps ten, and a door size is just as useful whichever job
  it was typed on, so a new building inherits the whole vocabulary on day one —
  which is the only gap a seed ever filled. Miguel writes no seed content and
  **the template takes no change at all.** A find nobody had noticed: **Type
  splits the pool.** A Deficiency line is a door size and a Waiting line is a
  trade, so the group key is **Type · item · subtype**, about 60 groups; a
  phase-level Waiting groups on Type and phase, and a typed `Other` subtype lands
  in one `Other` bucket per item so the group count stays bounded. Ordering is
  **most used, ties to newest, three chips**, and **one record is one use** — the
  `quantity` column is ignored, or one big order pins a size to the front forever.
  `get-project` now returns **the whole Deficiencies tab, every state**, which
  `03` never settled; Open and Fixed feed a chip, **Cancelled never does**, and a
  waiting outbox record does while a held one does not, per `04`. **Cancelling the
  record is the whole deletion answer** — no delete button and no hide list is
  built. Chips outlive the job: **a building's lines fold into a capped history
  index just before its copy is deleted**, 20 lines per group, least-used pruned
  first; live buildings are recounted from scratch and never written into it,
  which is what makes Cancel exact. The **near-match prompt is built** — Miguel
  overruled the case for dropping it, correctly, since the chips are now the only
  thing holding the wording together. It **normalises rather than fuzzy-matches**:
  edit distance would offer `32 6 RH` against `32 6 LH`, two real and different
  doors. **Miguel changed the nomenclature itself to `32 6 RH`**, no inch marks,
  and the box gains a **grey `Size Jamb Swing` placeholder** held per item in
  `_Config` and edited in Admin's Lists card. **No control was added to the
  Logger form.**

## Not yet specified

- Whether a Waiting record can attach to a whole unit, for something like no
  power on site or a locked unit. Only item and phase are settled.
- **A parser that reads a loose needed line and prints the standard form.** Raised
  by Miguel on 2026-08-08 while resolving `15`, and ruled out of 0.2 by him in the
  same breath. It is not urgent, because 0.2 already cleans every line typed
  before: tap a chip and the stored text is saved, or type loose and the Save
  prompt offers the stored text. Only a size logged for the **first time ever**
  goes in raw. It is not cheap, because a parser must guess — `5 1/4 MDF` on a
  baseboard and `32 6 RH` on a door are both numbers, and telling them apart needs
  a grammar per item, a screen to edit it, and a way to correct a wrong read. That
  is the four-field form `17` turned down, wearing a coat. Logged in
  `.scratch/0.3-backlog.md`.
- How the Service Worker and `CACHE_NAME` handling change once the app holds
  real data locally. Today the Service Worker caches the app shell only.
  **Narrowed on 2026-08-08 by `code-inventory.md`:** the one fact recorded here
  before — that `sw.js` must delete old Cache API entries in its `activate`
  handler — **is already done**, at `sw.js` lines 53 to 63. Every cache whose
  name is not the current one is deleted. What 0.2 adds is data in
  **localStorage**, which a Service Worker never touches, and that is exactly
  what keeps the outbox safe across an update. `registerWorker()` in `common.js`
  already carries the right comment about it. What is genuinely left: adding the
  Logger and Outbox screens to the `SHELL` list, and the standing habit of
  raising `CACHE_NAME`.
- Whether a photo belongs on a deficiency record in 0.2, or later.
- **Where Save sits on the Logger form when both `Other` boxes open.** Raised by
  `13` on 2026-08-08, when Miguel gave the Subtype list its own `Other` text box.
  `06` budgeted six controls and warned that more pushes Save under the keyboard.
  `17` took it to seven. The worst case is now nine, when Subtype-Other and
  Reason-Other are open together. Recommended answer, written up on `13`: pin Save
  to the bottom of the screen instead of leaving it in the scroll flow. It needs
  one line from Miguel at build time and does not gate anything before that.
- **A record for a problem PFC will never fix.** Found on 2026-08-08 while
  resolving `17`. Miguel: Exterior Doors are patio and entry doors that the
  framer installs, PFC only builds out and trims around them, and "they are often
  defective and need repairs but we do not handle that." Every record in the
  model today is a task for PFC. An open flag of either kind blocks Complete on
  its item, per `11`, so logging a defective exterior door would stop that item
  reading Complete after PFC finished everything it owns. Candidates: a record
  state that is neither Open nor Fixed, a record that carries no flag, or a rule
  that some items never block. Do not build ahead of it — write the rule down
  before `09`, or push it to 0.3 on purpose.

## Out of scope

- **The Archive window.** Ruled out of 0.2 by Miguel on 2026-08-08 under his own
  one-window-per-MINOR rule, since 0.2 already spends its window on Logger. The
  model is settled and written on
  [14-building-archive](issues/14-building-archive.md) — a tree like Tracker,
  holding fixed records for active and finished buildings alike, each row tagged
  ACTIVE or CLOSED. **Ticket 14 stays open**, because 0.2 still owes the rule and
  the seams. Only the door is out. The cost, accepted on purpose: **0.2 has no
  on-site history** — a fixed record leaves the phone and is readable only by
  filtering the state column in the Deficiencies tab. The crew does not start
  using the app until 0.4 or 0.5, so nobody pays for it yet.
- [Deficiencies that arrive after a building is finished](issues/16-post-completion-deficiencies.md)
  — the GC final walk, months after completion. Ruled out of 0.2 by Miguel on
  2026-08-07 and moved to `.scratch/0.3-backlog.md`. It needs an archived
  building to reopen, and a deleted local copy to come back, so it is a workflow
  and not a rule. **One piece was kept in 0.2:** an already Complete item that a
  flag lands on, which fires in a live building with no archive involved, and is
  answered in `11-rollup-rules`.
- **An abandoned job never leaves the Tracking list.** Ruled to 0.3 by Miguel on
  2026-08-08, on [14-building-archive](issues/14-building-archive.md), when he
  turned down a force-close switch in Admin. A job cancelled at 60% never reads
  Complete, so its row stays forever. He was told the switch was nearly free —
  `13` already raises `_Config` to version 2 — and chose against it, because a
  stored flag can disagree with the numbers and 0.2 has no Archive door to find a
  wrongly hidden building in. Logged in `.scratch/0.3-backlog.md`. It grows one
  dead row per abandoned job, and one or two buildings are live at a time.
- Per-unit item variation. An item that applies to only some units in a
  building. This is a structure problem and belongs to Admin. Take it up as its
  own effort later.
- Crew identity, sign-in, and Google login. Later version.
- Two phones changing the same unit, and who wins. Access is unlocked, but
  Miguel is the only user in practice for 0.2.
