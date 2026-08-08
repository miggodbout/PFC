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

### Sharpened by `18-supersession-sweep`, 2026-08-08

The sweep found one live conflict and could not settle it, because it is a
decision and this ticket owns it. **Does `03`'s rule that the phone drops an
archived building fire at all in 0.2?**

The facts, so this closes in one line:

- `03` line 88 drops an archived building ahead of the ten-building limit, and
  marks the rule "not final", owned by this ticket.
- The Archive **door** is 0.3, so no screen in 0.2 can show a dropped building.
- This ticket still owes 0.2 **the rule**, and a rule can fire with no door.
- `04` exempts any building holding a waiting or held edit from being dropped.
  That exemption must survive whatever is decided here.

If the rule ships in 0.2, a finished building silently leaves the phone with
nowhere to see it until 0.3. If the rule waits for 0.3, the ten-building limit is
the only thing that drops a copy, which is what `03` already builds. **The second
reads safer.** Miguel decides.

### Settled by Miguel, 2026-08-08

**The rule ships in 0.2. A finished building leaves Tracker.** His words: "a
finished item and a finished building do leave tracker in 0.2, the data will
still live in the Sheet."

He was offered the safer reading above and took the other one on purpose. The
cost is stated and accepted: **0.2 has no door onto a finished building.** It
leaves the Tracking list, and until the Archive window ships in 0.3 the only way
to read it is to open the project Sheet in Google Sheets. That is what "the data
will still live in the Sheet" means, and it is why the cost is acceptable —
nothing is lost, only hidden from the app.

This closes the conflict `18` raised. `03`'s archived-building drop **does** fire
in 0.2.

**Two rules that must not be confused, because they sound the same:**

| Rule | What it governs | Owner |
|---|---|---|
| A finished building leaves the **Tracking list** | what the app draws | this ticket |
| A building's **local copy is deleted from the phone** | what the phone stores | `03`, and `04`'s exemption |

`04` says a building holding any waiting or held edit is never dropped from the
phone. That exemption is about **storage** and it survives untouched. A building
can be gone from the Tracking list while its copy stays on the phone, holding an
edit that still has to land. Those are not in conflict. The build must keep them
as two separate tests, or a queued edit loses the data it describes.

**The reopen seam still holds.** `16-post-completion-deficiencies` pushed the GC
final-walk workflow to 0.3, and this ticket owes 0.3 the seam rather than the
feature: reopening must be possible, and a dropped local copy must be
downloadable again on demand. Nothing above closes that door.

---

## The other half of Miguel's answer: a finished **item**

Same sentence, and it is a bigger change than the building half. It is recorded
here rather than lost, but **it is not settled**, because "leaves Tracker" has
two readings for an item and they build differently.

This is the same principle Miguel stated on 2026-08-06 and the map still carries:
**"Tracker stays as lean as possible, and the data stays logged."** Hiding
finished work is that principle applied one level down. So the direction is not
in doubt. The mechanism is.

**Reading A — a Complete item stops being drawn on the Unit screen.** Eighteen
items, fourteen Complete, and the screen shows four. Tracker becomes a list of
outstanding work.

**Reading B — nothing changes on the Unit screen**, and Miguel meant the fixed
**record**, which `06` already settled: a fixed record leaves Tracker, staying
greyed with Undo only until you leave the unit.

### Why this needs one more sentence from Miguel

Reading A has a real hole, and it is the reason to ask rather than build.

**You cannot undo a mistaken Complete on a row that is no longer drawn.** Tap
Complete on the wrong item and it vanishes. There is no path back to it on that
screen, and the dropdown that would fix it went with the row.

`06` already solved exactly this shape for a fixed record: **greyed with Undo,
until you leave the unit.** The row stays visible and dimmed while you are still
standing there, then it is gone on the next visit. That answers the hole
completely and it reuses a pattern that is already decided, already prototyped,
and already familiar on the same screen.

So the recommendation is **Reading A, with `06`'s greyed-and-Undo treatment**, and
the question for Miguel is whether that is what he meant.

**What does not change either way:** the counts. `11` shows `14/18`, and it
counts what the unit **holds**, not what the screen draws. A hidden item is still
counted. Complete stays visible as a number even when the rows are gone, which is
what keeps the rollup honest.

**One thing to check before building Reading A:** a unit where every item is
Complete draws an empty screen. It needs a line saying so, not a blank body.

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

> **Nothing blocks this ticket. Corrected 2026-08-08.** Both entries below are
> stale. `11-rollup-rules` resolved on 2026-08-07, which the header of this file
> already says. The `12-logger-door` question is answered too: `06` added the
> greyed `Archive` card to the Hub, so the seam exists. What is left here is the
> **rule and the seams, not the door** — see the section above.

- `11-rollup-rules` — the archive rule is a rollup rule, one level up. It cannot
  be written until a unit's Complete is defined.
- `11-rollup-rules` — still open. This is the only thing holding the ticket now.
- ~~`12-logger-door`~~ — resolved 2026-08-07. Doors are settled: Tracking, Log,
  Create Job. Archive is not among them, so this ticket adds it or drops it.
