# Sweep the 0.2 notes for decisions that were later overruled

Type: task
Status: **first pass done 2026-08-08, widened by 13, 14 and 15 the same day.
The second pass is now owed and nothing blocks it.**
Blocked by: **nothing. `19-building-and-floor-markers` closed 2026-08-08**, and
it was the last ticket that could have made this sweep stale. This runs next,
right before `09-write-0.2-build-plan`.

**Order: `18`, then `09`.**

**What `19` added to the sweep:**
- **One live conflict to settle, and `19` handed it over rather than deciding it.**
  `14` rule 4 has `list-projects` send **items** Complete and items total per
  building, so the phone applies `11`'s rule instead of trusting the Sheet's own
  `overall` word. `19` made every count above the Unit screen **units**, so the
  payload becomes units Complete and units total. Those come from
  `readOverallColumn` at `Code.js:194`, which is **Sheet formula output one level
  down** — the same kind of thing `14` refused to trust. Decide whether that is
  close enough, or whether `list-projects` must send raw item counts anyway.
  `19` also found that `14` mis-stated the cost: `handleListProjects` opens every
  Sheet but reads **one column**, never the item grid.
- **`19` narrows `11` at the unit chip only.** `11` says every level shows both
  flag kinds with their own counts. A chip shows both kinds and **no numbers**.
  Every other level keeps its counts. Record it as a narrowing, not a reversal.
- **`19` finishes `05` seam 2**, which said a held mark rolls up through anything
  that can close and never said what happens when it opens. The whole rule is now
  *a header reports what it hides.*
- **`11` line 270 is closed.** Fraction or bar was left open by name there. `19`
  answers both, split by level.
- **`05`'s "red dot on the unit chip" is superseded.** The failed-save mark is a
  corner badge carrying `!`, so it cannot be read as `06`'s Deficiency red.

**What `15` added to the sweep**, beyond the three supersessions already written
into `supersessions.md` as entries 35 to 37:
- **Every `32" 6" RH` in the repo is stale text.** `15` dropped the inch marks
  and the standard needed line is now `32 6 RH`. Known sites: `01`'s hint text,
  `02` column H, `17`, `template-changes.md`.
- `template-changes.md` **section 8 is now empty**, so the file needs only this
  sweep before it is marked FINAL.

---

## First pass, 2026-08-08

The whole "Known stale items" list below is driven by tickets that have
**already** closed — `01`, `02`, `06`, `11`, `12`, `17`. None of it can be undone
by `13`, `14` or `15`. So that part was swept now rather than left for one long
session later. The staleness warning above still holds for everything else.

**Produced:**

1. **`../supersessions.md`** — 29 entries. Twenty-two supersessions, six stale
   cross-references, and one live conflict the sweep could not settle.
2. **`../template-changes.md`, rewritten.** Eight sections, each carrying its own
   status. Six are FINAL. **The file as a whole is deliberately not marked
   FINAL**, because section 5 waits on `13`. The old file's section 3 is deleted
   outright, per `17`.
3. **Corrections added in place**, additive only, old text left below each one:
   `01` (Archive costs nothing), `02` (the `update-item` reference), `12` (the
   form sketch, and the Hub card sketch), `14` (a stale `Blocked by` block).
4. **`../code-inventory.md`** — not asked for by this ticket. Written the same
   day because `09` owes a file-by-file change list and no session had read the
   code against these tickets. It found nine things, and two of them corrected
   this sweep: `11` already owns the Dashboard tab, and `11` already orders the
   `on_hold` to `waiting` rename throughout the code.

**Confirmed and closed, needing nothing:**

- `02`'s column-letter shift reaches no other ticket. Re-checked.
- `06`'s question body describes the pre-`12` shape, which is correct and
  intended — it is the question as asked. Its resolution plainly reads as current.
- `06`'s six-control budget is **a constraint the build must meet at seven**, not
  a finding that was overruled. Written that way in `supersessions.md` item 17.
- `prototypes/05-pending-state.html` was built after `11` closed and draws the
  three-value dropdown correctly.

**One conflict found, and Miguel closed it the same day.** Whether `03`'s
archived-building drop fires in 0.2. The sweep could not settle it — a decision,
owned by `14` — so it laid the facts out there instead. Miguel answered on
2026-08-08: **it fires.** A finished building leaves Tracker, and 0.2 has no door
onto it until Archive ships in 0.3. See `14` and `supersessions.md`.

**One entry lives in production code, not in a note:** `Code.js` lines 1300 to
1315 still advertise the `update-item` action that `04` deleted. It is the first
thing a build session reads when it opens that file. Left in place — this map
writes no production code — and flagged for `09`.

## Question

Nothing is decided here. The job is to find every place where a later decision
overruled an earlier one, and say in one line which one wins.

Miguel raised this on 2026-08-08. His worry was token cost — the same decision
read five times by the build session. **That part was measured and it does not
hold.** The whole 0.2 corpus, map plus every ticket plus `template-changes.md`
plus `0.3-backlog.md` plus `CLAUDE.md`, is 24,463 words, about 33,000 tokens.
That is one read, not five.

**The real cost is different, and it is worse: stale text that reads as
current.** A build session cannot tell a settled statement from an overruled one
without reading both and working out which came first.

## Hard limits on this ticket

**Additive only. Do not rewrite a resolved ticket.** The rejected-option
reasoning is the most valuable content in these files. "Structured dropdowns were
rejected because they add taps to every entry" is what stops that idea returning
in three months and costing a week. Compressing a resolution to what was chosen
destroys the part that earns its keep.

Where a resolved ticket is wrong, **add the correction on top and leave the old
text below it**, the way `14-building-archive` now reads. That file is the
pattern to copy.

**Do not remove repetition between the map and a ticket.** It is deliberate. The
map gists and links so a session can load 3,000 words instead of 24,000. Only a
decision that appears twice **in conflict** is a target.

**Do not touch the prototypes.** They are throwaway assets and they are already
labelled with what was settled.

## What it produces

1. **`supersessions.md`** — one line per overruled decision. The form:
   `01 said an Archive view costs nothing. 06 made it a 0.3 window. 06 wins.`
2. **`template-changes.md`, rewritten and marked FINAL.** This is the urgent one.
   It is a **spec**, not a discussion, so a build session will follow it as
   written. See the list below.
3. **Stale cross-references fixed** — a `Blocked by` line naming a ticket that
   has since closed, or a "waits on X" note where X resolved.

## Known stale items, found 2026-08-08 while resolving 06

Not a complete list. It is where to start.

**`template-changes.md` — the urgent file:**
- Sections 2 and 5 say they wait on `11-rollup-rules`. `11` closed 2026-08-07.
- Section 3 says "On Hold reasons". `01` renamed On Hold to **Waiting**.
- It does not know the **Details column** comes out of the Tracker tab. Settled
  in `06`, 2026-08-08.
- Section 3 is **overruled outright**. `17` closed 2026-08-08 and deleted the
  three per-phase lists. A warning block now sits at the top of that section
  pointing here. Rewrite it: one list of eight per building, a trim per item,
  `Warped` renamed `Defective`, and two new **type** lists.
- Section 1 is marked FINAL at **twelve** columns. `17` made it **thirteen**,
  adding `subtype` beside `needed`. FINAL is now wrong.
- The whole file still carries "Status: PROVISIONAL. Do not start work yet."

**Elsewhere:**
- `01-deficiency-record-fields` says an Archive view in the app "is a filter over
  records the phone already holds, so it costs nothing". `06` made Archive a
  window and moved it to 0.3.
- `03-local-copy-rules` drops archived buildings from the phone. Nothing archives
  in 0.2, because Archive is 0.3. Say plainly whether that rule fires at all in
  0.2, and check it against `04`'s rule that a building holding a waiting or held
  edit is never dropped.
- `12-logger-door`'s form sketch has no **Type** field. `06` added one, and `01`
  requires it. The sketch reads as the final form and is not.
- `06-deficiency-entry-screen`'s question body describes the pre-`12` shape. That
  one is **fine and intended** — it is the question as asked. Confirm the
  resolution is clearly the current text, and leave it.

**Added 2026-08-08 while resolving `17`.** Each of these already carries a dated
correction block written by `17`. The job here is to confirm the correction reads
as current and the old text plainly reads as superseded, not to rewrite either.

- `01-deficiency-record-fields` — its three per-phase reason lists, and `Warped`.
  Also its flat statement that the needed line stays free text, which is now true
  of the dimensions and false of the type.
- `02-deficiencies-tab-layout` — twelve columns became thirteen, and the letters
  from `subtype` onward all shift. **Already checked on 2026-08-08: no other
  ticket quotes a Deficiencies-tab column letter.** `04`, `05` and `11` all name
  the columns without lettering them, and `11` only says "`02` fixed those
  columns". The map's one-line gist of `02` said "twelve columns" and was fixed
  the same day. Nothing else to chase — confirm and move on.
- `12-logger-door` — two wrong lines: "No Admin work comes from `12`", and a form
  sketch missing both the **Type** field `06` added and the **Subtype** dropdown
  `17` added.
- `06-deficiency-entry-screen` — the six-control budget is now seven on an item
  that defines types. The budget is a constraint the build must meet, not a
  finding that was overruled. Say that clearly, because it reads either way.
- `15-suggestion-list` — its "Settled early" section plans seed suggestions for
  door variants that are now a dropdown. Narrowed, not deleted.
- `prototypes/06-logger-and-records.html` — **do not edit it**, per the rule
  above, but note in `supersessions.md` that it draws the pre-`17` six-control
  form. `06`'s amendment already says the prototype needs re-checking.

## Why this is not scope creep

It adds no feature and it decides nothing. It is a correctness step on the
destination: `09` has to reconcile these contradictions whether or not this
ticket exists, and reconciling under pressure while also writing a build plan is
where a wrong line gets written into the plan.

## Reference

- `09-write-0.2-build-plan` — the destination this feeds. Its job is to gather
  every closed decision into one document. This ticket makes that base clean
  first.
- `14-building-archive` — the pattern for adding a correction on top of text that
  turned out wrong.
