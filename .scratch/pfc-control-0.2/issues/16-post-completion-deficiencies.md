# Deficiencies that arrive after a building is finished

Type: grilling
Status: closed — out of scope for 0.2
Closed: 2026-08-07
Blocked by: 14

> **Miguel ruled this out of 0.2 on 2026-08-07.** It moved to
> `.scratch/0.3-backlog.md`. This file stays as the write-up, because the
> thinking below is worth keeping. Nothing here is decided.
>
> **One piece was carved out and kept in 0.2.** What happens to an already
> Complete item when a flag lands is answered in `11-rollup-rules`: it displays
> as In Progress while the flag is open, and returns to Complete when the last
> record is fixed. That case fires in a live building with no archive involved,
> so 0.2 could not leave it undefined. Everything else below is 0.3.

## Question

A building is complete. Months later the GC does a final walk and finds a list of
problems. What does the app do?

Miguel raised this on 2026-08-07, during `11-rollup-rules`. His words:
"deficiencies often show up months after a building is complete. GCs come and do
a final check and find issues."

## Why it is its own ticket

This is not a variation on normal logging. It runs against three decisions that
are already made, and it breaks an assumption in each one.

**`03-local-copy-rules` deletes the copy.** The phone keeps ten buildings, least
recently opened dropped, and an archived building is dropped ahead of that limit.
A building finished eight months ago is not on the phone. The GC is standing
there and the data is gone until there is signal.

**`14-building-archive` has no way back.** Archive is computed: a building
archives when it reads Complete. A new record makes it read In Progress again,
so it un-archives itself. Nobody decided whether that is right, or whether a
finished job should stay finished and hold its punch list separately.

**`11-rollup-rules` left a hole this ticket has to fill.** A flag blocks Complete
on an item. Nobody settled what happens to an item that is **already** Complete
when a flag lands months later. Miguel was asked and declined, because the answer
depends on the archive question above. That question is now here.

## Points to settle

- **The already-Complete item.** Does it drop to In Progress by itself, drop and
  come back when fixed, or does Logger ask first? All three were offered on
  2026-08-07 and none was chosen. Note that "drops by itself" breaks the standing
  rule that Progress is only ever set by hand, so that rule needs rewording if it
  wins.
- **Does the building leave Archive?** Un-archiving by itself is what the
  computed rule already does. The alternatives are a building that stays archived
  and shows a punch list, or a manual reopen.
- **Getting the copy back.** A dropped building must be downloadable on demand.
  Whether that is automatic on open, or a visible "load this building" action.
  What happens with no signal, which is the likely case in an empty building.
- **Is a punch-list record the same record?** `01-deficiency-record-fields` fixed
  the fields. A GC item may need something the field list does not have — who
  raised it, or a date it was found. `01` ruled out author and promised date for
  0.2. This may be the case that changes that, and if it does, it changes the
  Deficiencies tab columns fixed in `02`.
- **Entry speed for a walk.** A GC walk produces twenty problems across many
  units in one pass. The Logger form from `12` sets the place once and then logs
  freely, which suits one room. Walking a whole building is a different shape.
- **Is this even 0.2?** It may belong in a later version. It is written down now
  so the 0.2 decisions do not quietly make it impossible later. Deciding that it
  is out of scope is a valid resolution of this ticket, as long as the seam is
  named.

## What must not be built on a guess

`11-rollup-rules` is explicit: an item already reading Complete when a flag lands
is **undefined** until this ticket resolves. No 0.2 code may assume an answer.
