# What a pending save looks like on screen

Type: prototype
Status: resolved
Resolved: 2026-08-07
Blocked by: 04 (resolved)

## Question

What does a person see while a save waits, when it lands, and when it fails?

Build a rough, throwaway screen to react to. Do not build it into the app.

Points to settle:
- The mark on one item that is waiting.
- Whether Building and Tracking also show that a unit holds waiting edits.
- The whole-app sign that the phone is offline, and that edits are held.
- What a failed edit looks like, and how a person retries it or drops it.
- Where a count of waiting edits belongs, if anywhere.

## Asset

`.scratch/pfc-control-0.2/prototypes/05-pending-state.html`

A throwaway file. It loads the real `control/shared/theme.css`, holds a fake
outbox that obeys the rules in `04-queued-edit-rules`, and a fake server with
four settings: OK, Offline, Busy and Rejects. Four variants: **D is the pick**;
A, B and C are the drafts D was chosen from, kept so the pick can be compared.

Open it in a browser. Do not build any of it into the app.

---

## Resolution, 2026-08-07

### The shape: two mechanisms, split by screen

Miguel picked variant **C on the Unit screen and variant B on Building and
Tracking**. Neither draft won whole.

| Screen | What carries the pending state |
|---|---|
| Unit | Marks on the item, the phase and the unit pill. A failed edit opens a red card under the item. |
| Building, Tracking | One sync bar. No marks in the tree, except the one case below. |

The reason the split works: on Unit you are looking at seven items, so a mark per
item is cheap and it points straight at the thing you tapped. On Building you are
looking at 48 chips, so a mark per chip is noise. Up there a single line of text
is faster to read than a grid of dots.

### The mark on a waiting item

A small turning ring, 13px, in the accent colour, sitting between the item name
and the status control. No words. The item itself already shows the tapped
value, because `04` ruled that a waiting edit paints the screen.

The same ring, at 10px, marks the phase header and the unit pill in the header.

### The sync bar

One line under the header. It appears only when the outbox holds something, and
it reads one of three ways:

| State | Reads | Look |
|---|---|---|
| Sending | `Saving 3 edits…` with a turning ring | accent |
| No signal | `Offline · 3 edits wait` with a grey slab | plain |
| All failed | `2 edits did not save` with a red dot | red |

Waiting and failed together read `Saving 3 edits… · 2 failed`.

**The count lives here and nowhere else.** This answers the last point in the
question. There is no badge on the Hub, and no count in the tree.

The bar's right edge reads `Outbox ›` and opens the Outbox screen: every job,
waiting and held, each naming its unit and its item, with **Retry** and **Drop**
on the held ones.

### Seam 1 — the bar rides on every screen, Unit included

One rule, no exception. On the Unit screen a failed edit is therefore said
twice: once in the red bar at the top, once in the fix card under the item.

That duplication is the price of the thing it buys. Standing in unit 204, an
edit that failed in unit 201 has no other way to reach you, and the Outbox has no
other door. A failure said twice costs a glance. A failure said nowhere costs a
unit that quietly never got saved.

A Unit screen with no bar was rejected for that reason. A bar that hides only the
failed state on Unit was rejected because it makes the bar mean a different thing
on one screen than on the others.

### Seam 2 — Building marks failure only, and marks the floor as well

A **waiting** edit puts no mark anywhere above the Unit screen. It sorts itself
out, so it does not earn a place on a grid of 48 chips.

A **held** edit puts a red dot in the corner of its unit chip.

**And on the floor header.** This is not decoration. `control/tracker/building.html`
opens one floor at a time, so a dot on a chip inside a closed floor cannot be
seen at all. Without the floor-header dot the chip dot does nothing on the screen
it was chosen for. Every level that can be collapsed must carry the dot of what
it hides.

The rule generalises: **a held mark rolls up through anything that can be closed.
A waiting mark never leaves the Unit screen.**

### Seam 3 — a landed edit says nothing

The ring stops, the bar disappears, and that is all. No "Saved" flash, no
permanent "All saved" strip.

The item already shows the new value, and it has shown it since the tap. A
message would only repeat what is on screen. A permanent strip was rejected too:
it costs a band of a phone screen to say "nothing is happening".

### What a failed edit looks like, and how it is repaired

On the Unit screen the item **snaps back to what the Sheet holds** and its name
greys out, which is `04`'s rule that a held edit never paints. A red dot sits
where the ring was. Under the item, a red card holds three things:

1. Why it failed, in plain words: `Admin removed this item from the project.`
2. What was lost: `You tapped Complete. The Sheet still says Not Started.`
3. Two buttons: **Try again** and **Drop the edit**.

The same job also appears in the Outbox screen with Retry and Drop, reached from
the bar. Two doors to one job, which is the map's "many doors, one system".

### The status dropdown, and the blocked Complete row

The prototype was first built with tap-to-cycle. Miguel rejected it: the control
is a dropdown, as it is today in `control/tracker/unit.html`. That stands.

Building the real dropdown settled a detail `11-rollup-rules` left open. Ticket
11 says the dropdown does not offer Complete while an open flag sits on the item.
**It does not remove the row.** Complete stays in the list, greyed to 45%, not
tappable, with one line under the panel:

> Fix the open flag first. Then Complete comes back.

A silently missing row reads as a broken app. A greyed row with a reason teaches
the rule the first time it is met.

### Not decided here

- **Whether an Outbox row taps through to its unit.** It names the unit and the
  item, which is enough to walk there. Leave it to the build plan.
- **The Logger form's pending state.** `06-deficiency-entry-screen` owns the
  Logger screens. The marks and the bar defined here apply to a record job as
  much as to an item job, because `04` gave both kinds one shelf and one call.
