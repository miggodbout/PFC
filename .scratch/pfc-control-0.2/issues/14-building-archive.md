# When a building leaves Tracking and enters Archive

Type: grilling
Status: resolved
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

> **Settled 2026-08-08. Reading A is dead and Reading B is right.** Miguel:
> "I think this was a misunderstanding, I meant that a flag / reason leaves the
> tracker screen an item should never dissapear, just be marked complete."
> Everything below is kept only so the correction reads clearly. See the
> **Answer** section at the bottom of this file.

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

**Nothing. Cleared 2026-08-08 when this ticket resolved.** The two stale
`11-rollup-rules` entries and the `12-logger-door` entry that used to sit here are
deleted, which closes item 25 of `supersessions.md`. `11` resolved 2026-08-07,
and `06` added the greyed `Archive` card to the Hub, so nothing was left waiting.

---

## Answer

Resolved 2026-08-08. Six questions, all answered by Miguel. One correction that
kills a whole branch, and four rules that ship in 0.2.

### 1. An item never disappears from Tracker

**This is the correction, and it is the biggest thing on the ticket.** Miguel's
words: *"I think this was a misunderstanding, I meant that a flag / reason leaves
the tracker screen an item should never dissapear, just be marked complete."*

So **Reading A is dead**, and it is dead as a rule, not as one rejected option:

> **Every item a unit holds is drawn on the Unit screen, whatever its Progress.**
> Complete is a mark on a row. It is never a reason to remove the row.

Write this down so nobody proposes hiding finished items again. It reads against
"Tracker stays as lean as possible", and Miguel drew the line himself: leanness
means fewer **flags and records** on the screen, not fewer items. An item row is
the control you set Progress with. Take it away and you take away the only way to
correct it.

What he actually meant was already built. `06-deficiency-entry-screen` settled it:
a record marked Fixed leaves Tracker, staying in place greyed and struck through
with `Fixed · Undo` for exactly one visit, then gone when you leave the unit. The
same holds for a phase-level Waiting record on the phase header. Nothing new to
design.

**Two stale things die with Reading A:**

- The ticket's own example above — *"Eighteen items, fourteen Complete, and the
  screen shows four"* — was already wrong. `13-admin-changes` cut the default
  list to **14 items** in three phases on 2026-08-08. The example is left in place
  above only as history.
- A problem found while grilling and now moot: `control/tracker/unit.html:91`
  skips a phase only when it holds **zero** items, so filtering Complete items out
  would have drawn a phase header and pill with nothing under it. Reading A would
  have owed a rule for that. It owes nothing now.

### 2. A building stays in the Tracking list until its edits land

**A building that reads Complete keeps its row while the phone holds any waiting
or held edit for it.** The row goes when the outbox is clear for that building.

The reason is honesty, not convenience. A building reads Complete off values that
have not reached the Sheet yet. If a held edit never lands, the Sheet says
In Progress while the app has already hidden the building. That is the one failure
0.2 must not have.

The cost, accepted: the row shows `Complete` with the sync bar reporting the edit.
Per `05-pending-state-ui`, **the count lives in the sync bar and nowhere else**, so
the row itself carries no extra mark.

**This is still a separate test from `04`'s storage rule**, as the table above
demands. `04` says the phone never *drops the copy* of a building holding a waiting
or held edit. This says the app never *stops drawing* it. The two happen to agree
here. The build must still keep them as two tests, or a later change to one
silently changes the other.

### 3. No force switch in 0.2

**The rule stays computed. Nothing but the numbers moves a building out of the
Tracking list, and nothing can move one back in.** No stored flag, no Admin
checkbox.

A stored flag can disagree with the numbers, and 0.2 has no Archive door, so a
mis-tapped flag would hide a live job with no way back inside the app. A two-way
switch in Admin was offered — `13` already raises `_Config` to version 2, so the
flag itself would have been nearly free — and Miguel chose against it.

**The accepted cost, and it is new fog for 0.3: an abandoned job never leaves.**
A job cancelled at 60% never reads Complete, so its row sits in Tracking forever.
With one or two live buildings at a time this grows slowly, and 0.3's Archive door
is the right place to put a closed building. Logged in `.scratch/0.3-backlog.md`.

### 4. The server sends the numbers, the phone applies the rule

`list-projects` gains three numbers per building: **items Complete, items total,
and open flags.** The phone runs `11-rollup-rules` on them. The Sheet's own
`overall` word is not what decides whether a building disappears.

This keeps `11`'s rule in one place, and it matters more here than anywhere else.
`11` called drift between the Sheet's formula and the phone's answer *cosmetic*.
It is not cosmetic on this screen: a wrong formula would hide a live building from
the only list that names it.

**The cost is close to nothing, and that was checked in the code.**
`handleListProjects` at `control/appscript/Code.js:189` already opens every
project Sheet, and at line 195 to 204 it reads the overall column and works the
building status out in **server JavaScript**, not from a formula. Reading the
Deficiencies tab in the same pass adds one read to a call that already has the
file open. The server's `worst(statuses)` call at line 204 has to be rewritten for
`11` regardless, because worst-wins is deleted.

### 5. Tracking gets a second empty message

Today `control/tracker/index.html:74` has one empty state: **"No projects yet /
Create your first building."** After this rule ships, that message appears while
five finished buildings sit in Drive, which reads as data loss.

So there are two, and the list answer already tells them apart — it either came
back empty, or came back holding buildings that all read Complete.

| Case | What the screen says |
|---|---|
| No buildings exist | **No projects yet.** Create your first building. Every project gets its own Google Sheet. |
| Buildings exist, all finished | **Nothing to track.** Every building is finished. Open the project Sheet to read one. |

Both keep the `Create Job` button.

A third option was offered and Miguel turned it down: a greyed **Finished**
section at the bottom of Tracking. It would have bought back the missing door,
and that is exactly the problem — it is the Archive window in a smaller coat, and
it was already ruled out of 0.2 under the one-window guideline.

### 6. The row stays greyed until the next app open

**Set the last item Complete and the building keeps its row for the rest of the
session, greyed, reading Complete. Close the app and open it again and the row is
gone.**

This is `06`'s greyed-with-Undo shape, one level up, and Miguel asked for it on
the same grounds he used in answer 1 — nothing should vanish under your thumb. It
matters more at building level than at item level, because answer 3 gives no force
switch and there is no Archive door: without this, one wrong tap puts a building
out of reach until 0.3, and the only fix is Google Sheets on a computer.

**It costs one thing the phone remembers for the session** — which buildings it
watched go Complete. Not stored, not synced, gone when the app closes.

**It lines up with the local copy drop for free.** `03-local-copy-rules` line 88
drops an archived building ahead of the ten-building limit, and a refresh runs on
app open. The row goes on app open and the copy goes on app open, so the greyed
row is always tappable while it is drawn.

### The order of tests, for one building on the Tracking list

Read top to bottom and stop at the first match:

1. Does the phone hold a waiting or held edit for it? → **draw a normal row.**
2. Does it read Complete, by the phone's rule on the server's numbers?
   - It was already Complete on this session's first list answer → **do not draw it.**
   - It went Complete during this session → **draw a greyed row.**
3. Otherwise → **draw a normal row.**

**The storage test is separate and runs on app open:** delete the local copy of a
building that reads Complete, ahead of the ten-building limit, **unless** `04`
exempts it for holding a waiting or held edit.

### Confirmed without asking

**A Cancelled record counts as closed.** `02-deficiencies-tab-layout` gives a
record three states — Open, Fixed, Cancelled — and `11-rollup-rules` says only an
**open** flag blocks Complete. A Cancelled record raises no flag, so it cannot hold
a building out of Archive. This was on the Points-to-settle list above and needed
no decision.

### The seams 0.2 still owes 0.3, unchanged

None of the above closes a door, which was the requirement:

1. `get-project` returns closed records as well as open ones (`06`, seam 1).
2. The Hub carries a greyed `Archive` card (`06`, seam 2, already decided).
3. A dropped local copy can be downloaded again on demand (`06`, seam 3).
4. Reopening a finished building is possible. `16-post-completion-deficiencies`
   owns the workflow in 0.3; this ticket only promises not to design it shut. It
   does not: nothing is stored, so nothing has to be un-stored.

### What this hands `09-write-0.2-build-plan`

Five items, all small:

1. `list-projects` sends Complete, total and open-flag counts per building, and
   its server-side `worst()` at `Code.js:204` goes.
2. The Tracking list runs the four-step order of tests above.
3. `control/tracker/index.html:74` gains a second empty message.
4. The phone remembers, for the session only, which buildings it watched go
   Complete.
5. **A rule to write into the plan, not code:** every item is always drawn on the
   Unit screen. There is no hide-finished-items work in 0.2, and there should be
   none proposed later.
