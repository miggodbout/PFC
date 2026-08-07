# Where the needed-line suggestions come from

Type: grilling
Status: open
Blocked by: none

## Question

The needed line is free text. Suggestions make it fast and keep it consistent.
Where is that list built, and where is it held?

## Why it is now sharp

This sat in the map fog as "how the needed-material suggestion list is built and
where it is held". `12-logger-door` graduated it, because the suggestion list
stopped being a nicety there.

`12` rejected structured per-item dropdowns. Free text won on speed. The argument
that carried it was that **suggestions do the work the dropdowns would have
done**: a tapped suggestion is character-for-character identical to the entry it
came from, so the 0.5 materials count stays countable without any dropdown.

If the suggestions are weak, that argument fails and the whole trade goes bad.
So this is not a polish ticket.

## Points to settle

- Where the source text comes from. Every record the phone already holds, per
  `03-local-copy-rules`, or something stored on purpose.
- Whether suggestions are scoped to the item, the phase, the building, or every
  building. `32" 6" RH` under Interior Door is useful. The same string under
  Baseboard is noise.
- How they are ranked. Most used, most recent, or a mix. Ties.
- How many appear. One row above the keyboard is about two or three.
- Whether typing filters them as characters are entered.
- Whether a near-match is offered. Typing `32" 6 RH` against a stored
  `32" 6" RH` is the exact case the consistency argument depends on. A prompt
  that says "did you mean" costs a tap and saves a bad row.
- Whether a suggestion can be deleted, once a typo is stored and keeps appearing.

## Settled early, 2026-08-07

**A first-ever building gets a seed list, and Miguel writes the content.** This
was the last point in the list above. Miguel raised it himself, asking whether
there was a plan to lay out the variables each item can have — a door is Regular,
Bi-pass, Bi-fold, Double or Pocket, and hardware and windows divide the same way.

This does **not** reopen `12-logger-door`. The variants become **seed
suggestions**, not dropdowns and not fields. The needed line stays free text. The
seed only fills the gap before a building has records of its own, which is the
one case where free text is at its worst.

Ranking follows from that: a seed outranks nothing. Once a real record exists
under an item, what Miguel typed before comes first, and the seed falls behind
it. A seed is a starting point, not a preference.

Order of work, chosen by Miguel: **Interior Doors alone, first.** It is the item
with the most variants and the one he knows best, so it will expose whatever is
hard about the format. Windows, Hardware, Baseboards and Trim follow once the
format holds.

Still open on this ticket: where the seed text is stored, and every mechanical
point above — scope, ranking, filtering, near-match, deletion.

## Reference

- `12-logger-door` — the trade this list has to pay for. Read the "needed line
  stays free text" section.
- `01-deficiency-record-fields` — the needed line and the hint `ex: 32" 6" RH`.
- `02-deficiencies-tab-layout` — the columns the source text would be read from.
- `03-local-copy-rules` — what the phone already holds, at no extra cost.
