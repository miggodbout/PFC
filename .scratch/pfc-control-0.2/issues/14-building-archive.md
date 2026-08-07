# When a building leaves Tracking and enters Archive

Type: grilling
Status: open
Blocked by: 11, 12

## Question

When does a whole building stop being live work, and what does the Archive door
show?

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

## The cheap shape, proposed while charting

Archive is **computed, not stored**. A building is archived when every unit reads
Complete and no open record remains. The phone holds the whole building already,
per `03-local-copy-rules`, so it can work this out with no server call, no new
column, no Admin switch, and no stored state that can drift from the truth.

This has to be checked against `11-rollup-rules`, because "every unit reads
Complete" is a rollup answer.

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
