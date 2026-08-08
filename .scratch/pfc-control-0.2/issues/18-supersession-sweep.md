# Sweep the 0.2 notes for decisions that were later overruled

Type: task
Status: open
Blocked by: 13, 14, 15, 17 — every other 0.2 ticket. This runs last, right
before `09-write-0.2-build-plan`. Run it earlier and the tickets that close
after it make it stale again.

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
- Section 3 states the reason lists as settled. `17-reason-list-scope` may narrow
  them to the item, so section 3 cannot be marked FINAL until `17` closes.
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
