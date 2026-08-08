# When a building leaves Tracking and enters Archive

Type: grilling
Status: open
Blocked by: none — 11 and 12 both resolved 2026-08-07

## Question

When does a whole building stop being live work, and what does the Archive door
show?

---

## Read this first — the model below was wrong, corrected 2026-08-08

Miguel corrected this ticket during `06-deficiency-entry-screen`. Everything
under "Why it is its own ticket" was written from the wrong idea of what Archive
is, and it is kept only so the correction reads clearly.

**This ticket assumed Archive was a list of finished buildings.** It is not.
**Archive is the history door**, and it also happens to know which buildings are
finished. Fixed records go there whether the building is finished or not.

| Case | What Archive holds |
|---|---|
| Building still active in Tracking | its fixed records, so Tracker stays lean |
| Building 100% complete | every fix ever done to it |
| Finished, then a GC finds a problem months later | it must be possible to pull the building back out and log against it |

**Settled already, on 2026-08-08, so this ticket does not reopen them:**

- **Shape: a tree, like Tracker.** Archive, Building, Floor, Unit, then the
  closed records on each item.
- **Active and closed sit in one list**, each row tagged `ACTIVE` or `CLOSED`.
  No second screen and no separate door.
- **Nothing moves.** A fixed record keeps its row in the Deficiencies tab. "Moves
  to Archive" means Tracker stops drawing it and Archive starts drawing it. One
  store, two views. The Sheet gets no Archive tab, as `01` ruled — Miguel filters
  the state column when he reads it directly.
- **An active building appears in both doors at once.** Tracking answers what is
  wrong now. Archive answers what was fixed.

**The door itself is 0.3.** Miguel proposed a guideline on 2026-08-08 — aim for
one new window per MINOR release — and called it a suggestion against scope
creep, not a law. Archive was argued against it and lost on its own size. 0.2
spends its window on Logger.
0.2 therefore has no on-site history at all, which Miguel accepted because the
crew does not start using the app until 0.4 or 0.5.

### What is left for this ticket, and it is smaller now

**The rule and the seam. Not the door.**

- The rule, which `11` already shrank to one sentence: a building is closed when
  it reads Complete.
- The seams 0.2 must leave, listed in `06`: `get-project` returns closed records
  as well as open ones, the Hub carries a greyed `Archive` card, and a dropped
  local copy can be downloaded again on demand.
- Whether a building holding a waiting or held edit leaves the Tracking list.

The points below still apply where they touch the rule. The ones about what the
door shows are answered above or belong to 0.3.

---

Miguel raised this on 2026-08-07, during `03-local-copy-rules`. His words: once
every single entry for a whole building is Complete, the building should leave
Tracker and move into an Archive window in the app.

## Why it is its own ticket

`01-deficiency-record-fields` already settled the **record** level archive: a
fixed record is marked `Fixed` and stays on its row, and an Archive view is a
filter over records the phone already holds. No tab, no move.

Nobody wrote down the **building** level. That is this ticket.

`12-logger-door` resolved on 2026-08-07 and **did not** add an Archive card to
the Hub. It added a `Log` card and left `Archive` to this ticket. So the door
does not exist, and whether it is a Hub card or a filter inside Tracking is still
open here.

## `11-rollup-rules` resolved on 2026-08-07, and it did most of this ticket's work

**The archive test is now one sentence: a building is archived when it reads
Complete.**

No second check for open records is needed. `11` ruled that an open flag blocks
Complete at every computed level, so a building holding one open record cannot
read Complete in the first place.

`11` also settled that the phone works the rollup out from data it already holds.
So the "computed, not stored" shape below is confirmed, and it costs no server
call.

What is left for this ticket is the **door**, not the rule: what Archive shows,
whether Miguel can force a building in or out, and what happens to a queued edit.

## The cheap shape, proposed while charting

Archive is **computed, not stored**. A building is archived when every unit reads
Complete and no open record remains. The phone holds the whole building already,
per `03-local-copy-rules`, so it can work this out with no server call, no new
column, no Admin switch, and no stored state that can drift from the truth.

This has to be checked against `11-rollup-rules`, because "every unit reads
Complete" is a rollup answer.

## A hard requirement, added 2026-08-07

**A finished building can receive new problems, and often does.** Miguel: "GCs
come and do a final check and find issues," months after completion.

So Archive is not a one-way door, and this ticket may not design it as one.

**The workflow itself was pushed to 0.3** on 2026-08-07. See
`16-post-completion-deficiencies`, now closed, and `.scratch/0.3-backlog.md`.
That does not let this ticket off. 0.3 cannot add a way back in if 0.2 designs a
door that only goes one way, and the phone deleting the copy is a 0.2 decision
from `03-local-copy-rules`.

**What this ticket owes 0.3: a seam, not a feature.** Do not build the reopen
flow. Do decide that reopening is possible, and that a dropped building can be
downloaded again on demand. If either is designed shut here, 0.3 pays to undo it.

## `04-queued-edit-rules` resolved on 2026-08-07, and it settled one of the points below

**A building holding a waiting or held edit is never dropped from the phone.** It
is exempt from the ten-building limit in `03-local-copy-rules`, and it must be
exempt from whatever archive drop this ticket decides. Dropping the copy while an
edit needs it would strand the edit's only description of what it means.

So "what happens to a queued edit for a building that archived while the edit
waited" now has half an answer: the copy stays until the outbox is clear. What is
left for this ticket is whether the **building** leaves the Tracking list while
that edit waits.

## Points to settle

- The exact rule. Every item Complete, and no open Deficiency or Waiting record.
  Whether a Cancelled record counts as closed. It should.
- Whether the rule is computed or stored. Computed is proposed above. A stored
  flag needs Admin work and can lie.
- Whether Miguel can force a building into Archive before it is finished, and
  force one back out. A job can be abandoned, or a warranty call can reopen one.
- What the Archive door shows. A list of finished buildings, and what a person
  can do from there. Read only, or can he open a unit and see its record history.
- Whether an archived building still accepts an edit, and what happens to a
  queued edit for a building that archived while the edit waited.
- What Tracking shows when every building is archived.
- The effect on the phone copy. `03-local-copy-rules` settled that the phone
  drops an archived building, with least recently opened as the backstop.
  Confirm that survives whatever this ticket decides.

## Blocked by

- `11-rollup-rules` — the archive rule is a rollup rule, one level up. It cannot
  be written until a unit's Complete is defined.
- `11-rollup-rules` — still open. This is the only thing holding the ticket now.
- ~~`12-logger-door`~~ — resolved 2026-08-07. Doors are settled: Tracking, Log,
  Create Job. Archive is not among them, so this ticket adds it or drops it.
