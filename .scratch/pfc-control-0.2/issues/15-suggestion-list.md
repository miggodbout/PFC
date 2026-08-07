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
- Whether a first-ever building, with no records yet, gets a seed list, and where
  a seed list would live. This is the case where free text is at its worst.
- Whether a suggestion can be deleted, once a typo is stored and keeps appearing.

## Reference

- `12-logger-door` — the trade this list has to pay for. Read the "needed line
  stays free text" section.
- `01-deficiency-record-fields` — the needed line and the hint `ex: 32" 6" RH`.
- `02-deficiencies-tab-layout` — the columns the source text would be read from.
- `03-local-copy-rules` — what the phone already holds, at no extra cost.
