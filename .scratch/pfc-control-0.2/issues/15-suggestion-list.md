# Where the needed-line suggestions come from

Type: grilling
Status: resolved
Resolved: 2026-08-08
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

## Narrowed by `17-reason-list-scope`, 2026-08-08

**The seed list no longer has to carry the door type.** `17` gave the needed line
one dropdown, holding the types the item defines — Regular, Bypass, Bi-fold,
Double, Pocket, Double Pocket, Dwarf, Unit Door on Interior Doors, and Passage,
Privacy, Dummy, Pocket on Hardware. The type is picked, not typed, and it is
stored in its own column.

So this ticket now covers **the dimensions only**: `32" 6" RH`, width, jamb depth
and hand. That is a much smaller space than the one the "Settled early" section
above was sketching, and Miguel's chosen order still applies — Interior Doors
first, because it holds the most variation.

The trade this ticket was paying for is smaller too. `12` bet that suggestions
would carry the consistency that dropdowns would have bought. `17` gave the
riskiest part of that bet — the type, a closed set of eight words that must match
exactly for 0.5 to total them — to a dropdown instead. Suggestions now only have
to keep dimensions tidy, and a wrong dimension is a wrong door either way.

Every mechanical point above is still open: where the seed text is stored, the
scope, the ranking, the filtering, the near-match prompt, and deletion. Note that
`17` settled Add-only for the **reason and type** lists. It said nothing about
suggestions, which are generated rather than curated, so deletion is still a live
question here.

---

## Resolution, 2026-08-08

### The seed list is deleted

**No seed ships.** The point that killed it: the phone already holds up to ten
buildings, per `03-local-copy-rules`, and a needed line under `interior_doors` is
just as useful whichever building it was typed in. Draw the chips from **every
building on the phone**, this building's own lines first. A new job then inherits
the whole vocabulary on day one, which is exactly the gap the seed existed to
fill.

So the "Settled early, 2026-08-07" section above is **dead**. Miguel writes no
seed content, `common.js` holds no seed constant, and `_Config` holds no seed
list. `template-changes.md` section 8 loses its first unknown: **the suggestion
pool takes no template change at all.**

`17` had already cut the seed down to dimensions only. Cross-building sourcing
finished it off.

### The pool, and how it is grouped

A chip is one **needed line**. Lines are grouped, and the chip row only ever
shows one group.

The group key is **Type, item, subtype**:

| Part | Why |
|---|---|
| Type | A Deficiency line is a door size. A Waiting line is a trade or a delivery. Mixed, the row offers `painters to finish` while you log a broken door |
| item | `32 6 RH` under Baseboards is noise |
| subtype | `17`'s own example splits `Bypass` to `60 6` from `Pocket` to `30 4 9/16 LH` |

**Type splitting is a find, not a detail.** No ticket had noticed that the two
record types write completely different kinds of text into one box. It is the
same shape of miss that `06` found when it drew the Type control itself.

Rules that fall out of the key:

- **An item that defines no subtype** — ten of the fourteen, per `13` — groups on
  Type and item alone. Nothing changes for it.
- **A phase-level Waiting record has no item**, per `02` column D. It groups on
  **Type and phase**: `Waiting, Doors & Windows`.
- **A typed `Other` subtype** — `13` gives every subtype list an `Other` box —
  groups under one **`Other`** bucket per item, whatever was typed. It does not
  get a group per typed word. That keeps the group count bounded: an unbounded
  group count is one typo away from a group nobody can ever reach again.

About 60 groups in total, against 14 items and 16 listed subtypes.

### Ranking, and what a use count counts

**Most used first. A tie breaks on the newest record.** Three chips.

**One record is one use. The `quantity` column is ignored.** A record for twelve
doors is one use, not twelve. The chips are a typing shortcut, so they order by
how often the wording gets typed, not by how much material it represents. Sum the
quantity instead and one big order pins a size to the front of the row forever,
even if it is never typed again.

Three chips, not the four the `06` prototype drew. One row above the keyboard
wraps at about four, and `06` measured that the wrapped row is the row Save
needs.

### Which records feed a chip

**`get-project` returns the whole Deficiencies tab**, every state. The phone
keeps all of it and filters on the phone. `03` never settled this and the chips
forced it.

- Simplest server: return the tab. No filter to write, and none to get wrong when
  a later version wants a state the filter dropped.
- Size is not the constraint. About 300 records at ~120 bytes is ~36 KB, against
  a building copy of ~100 KB and a localStorage cap of ~5 MB.
- **Open-records-only was rejected and is worth naming.** The pool would shrink
  exactly as the job improved: forty chips in week one, almost none in week six.
  Backwards.

Then, on the phone:

| Record state | Feeds a chip |
|---|---|
| Open | Yes |
| Fixed | Yes |
| Cancelled | **Never** |
| Waiting to send, in the outbox | **Yes** |
| Held, per `04` | No |

**Cancelled is how a bad chip is removed, and that is the whole deletion answer.**
A typo enters the pool through a record, so cancelling that record takes it back
out. Both Cancel buttons already exist — `06` puts one on every row of the Logged
here list, and `02` and `06` put one in the Tracker record list. **No delete
control is built anywhere, and no per-chip hide list is stored.** Cancelling also
stops the Sheet showing a typo as real work, so one tap fixes both problems.

The outbox rule is `04` and `05` applied unchanged: **a waiting edit paints the
screen, a held edit does not.** Log four doors in a basement with no signal and
the chips work from the second door. A held edit may never land, so it may never
become a chip.

### The history: chips outlive the job that made them

`03` and `14` delete a finished building's local copy on the next app open, which
would take its chips with it. Miguel kept the history, with a cap.

**Two sources, and they do not overlap:**

| Source | Read how |
|---|---|
| A building still on the phone | Counted live, from scratch, every time |
| A building the phone has dropped | Read from the history index |

Live buildings are **never** written into the index. This is what makes Cancel
exact: cancel a record on a live job and the chip goes at once, because that job
is recounted from nothing. A single flat index that every save writes into would
need Cancel to hunt down and un-count its own line, and a missed one is a
cancelled typo that is a chip forever.

A dropped job cannot be cancelled anyway. It is finished.

**The index:** one new localStorage key, separate from the per-building keys and
from the outbox. Each row holds **item, subtype, type, needed line, use count,
last used**. No unit, no reason, no dates beyond the last-used one. It is
generated by the phone and never written by hand, so it is not a curated list and
`17`'s Add-only rule does not apply to it.

**The cap is 20 lines per group.** Per group, not one shared budget: Interior
Doors logs far more than Attic Hatch, and a shared budget lets the busy item
starve the quiet one, so the quiet item's chip row empties first. Worst case is
about 60 groups times 20 lines times ~50 bytes, near **60 KB**. Only three chips
ever show, so 20 is about six times what the row can hold, with the rest
reachable by typing.

**Pruning: least used goes first, ties broken by oldest last-used.** The same
rule that orders the chips, so the line that leaves is always the one furthest
from the row.

**One expiry rule sits above it, added by Miguel on 2026-08-08 after the first
pass.** A line goes early if it is **unused for 12 months and was used fewer than
three times**. Both tests, not either.

    36 6 RH   x40   last used Jun 2025   protected, count is 40
    30 4 LH   x1    last used Mar 2025   expired

A plain twelve-month expiry was drawn first and it had a real fault: it drops a
size you have logged forty times because the last job did not use it, and you
then retype it and it re-enters at count 1, behind everything. **Adding the count
test removes the fault at no cost**, because a line used once or twice is never
in the top three, so the rule can never take away a chip you can see.

Note what expiry is and is not for. **The cap already stops the index growing**,
so this is about freshness, not size. Its only real work is stopping a stale
one-off squatting in a group that is not yet full.

**When the fold happens:** a building's lines are folded into the index
immediately **before** its copy is deleted, in the same step, whether the copy is
dropped by the ten-building limit or by `14`'s archive rule.

**One rule chosen in the build, not by Miguel:** a dropped building can be
downloaded again, and its lines are then in **both** places. Do not add the two
counts. **Take the larger of the live count and the history count.** Adding them
double-counts. This affects chip order only, never chip content, and the history
does not record which building a line came from, so nothing better is available
without making the index per-building.

### The near-match prompt is built

Miguel overruled the recommendation to drop it, and his reason is better than the
recommendation: with no seed and a pool spanning every building, **the chips are
the only thing holding the wording together**, so guarding what enters the pool
matters more, not less.

**How close is measured: strip every space, quote mark and slash, then lowercase,
then compare for an exact match.** Not an edit distance.

    typed   32 6 RH    ->  326rh
    stored  32" 6" RH  ->  326rh      MATCH

    typed   32 6 LH    ->  326lh
    stored  32 6 RH    ->  326rh      NO MATCH

Edit distance was rejected on one example: `32 6 LH` and `32 6 RH` are one
character apart and are two genuinely different doors. A fuzzy rule offers the
wrong one, and tapping Use it writes the wrong door into the Sheet. The
normalising rule cannot make that mistake, because a real difference is always a
different digit or letter.

**It fires on Save, not while typing.** Two buttons, `Use it` and `Keep mine`.
Either one then saves. Live matching would put the prompt in the same strip of
screen as the chip row, and `06` measured that strip as the one Save needs.

**It compares against the same group the chips came from** — Type, item, subtype,
live buildings plus history. So the prompt can only ever offer a line the chip
row would have offered. If two lines both match, offer the most used.

### Filtering, and the nomenclature

**Typing filters the chips using the same normalising compare.** One rule,
written once, used in two places.

    stored  32" 6" RH
    type 326   -> chip shows
    type 326r  -> chip shows
    type 32 6  -> chip shows

Tap the chip and the **stored** line is what gets saved, punctuation and all. So
you type loose and store clean.

**Miguel changed the nomenclature itself.** `32" 6" RH` was a throwaway he set
early. It reads well on a keyboard, but the inch mark is on the second keyboard
page on iOS and you reach it twice per door, in gloves. **The standard is now
`32 6 RH`**, no inch marks, everything on the first page.

This is content, not code. The box is free text either way and nothing in the
build changes. Two consequences:

- **Lines already typed the old way stay in the history the old way**, so both
  forms sit in the pool for a while. The normalising compare treats them as the
  same string, so the near-match offers the old form against a new typing and the
  two never split into two chips.
- Every `32" 6" RH` example in `01`, `02`, `17` and `template-changes.md` is now
  stale text. Logged for `18`.

### The hint: Size, Jamb, Swing

`32 6 RH` is unreadable to anyone who does not already know the order, so the box
has to say what each number means. Miguel's words for it: **Size, Jamb, Swing** —
crew vocabulary, not the width, depth and swing this map had been writing.

**It is the placeholder inside the empty box**, in grey, gone the moment the
first character lands. **Not a line under the box and not part of the label.** A
separate line costs a row, and `06` measured six controls as the budget before
Save falls under the keyboard, with `17` already at seven. The placeholder costs
zero height, and it disappears exactly when it stops being needed.

**The text lives per item, in `_Config`, edited in Admin.** The item object that
`13` already gives `types` and `trim` gains a third key, **`hint`**. Admin's
**Lists** card, which `13` already builds and which already shows subtypes and
the reason trim for a picked item, gains one text box for it.

- `common.js` seeds it, the same way `13` settled that `DEFAULT_PHASES` is the
  real seed and the .xlsx is a drawing.
- Ship it filled where it is obvious and blank elsewhere, following `13`'s
  precedent for the trim. A blank hint is never wrong, only less helpful.
- A custom item added mid-job can be given one without a release. Code-only hints
  were rejected for exactly that reason.

**One hint per item. It does not change with the subtype.** Miguel took this one
reluctantly — "I don't like this but adding 8 different hints is egregious" — and
he is right on the count: per-subtype hints go from fourteen strings to about
thirty, and every subtype added in Admin then needs one more. A bypass door has
no swing, so its hint names a term it does not use. The hint is a reminder, not a
rule, and the Subtype dropdown sits directly above the box so you can see which
kind of door you picked. **Logged to `.scratch/0.3-backlog.md`** as an optional
per-subtype override, which the `_Config` shape already leaves room for.

### What this ticket did NOT add to the form

Nothing. The chip row and the placeholder were both already drawn in the `06`
prototype. **The control count stays at seven**, so the Save-under-the-keyboard
problem in the map's Not yet specified is untouched by this ticket.

### What the build owes

1. `get-project` returns the whole Deficiencies tab, every state.
2. One normalising function — strip spaces, quote marks and slashes, lowercase —
   used by the chip filter and by the near-match. Write it once.
3. The chip pool: live building copies plus the history index, grouped on Type,
   item and subtype, ordered most-used then newest, three shown.
4. The history index: a new localStorage key, folded in immediately before a
   building copy is deleted, 20 lines per group, least-used pruned first, larger
   count wins on a re-download.
5. The near-match prompt on Save, matching within the current group only.
6. `hint` as a third per-item key in `_Config`, seeded in `common.js`, with one
   text box in Admin's Lists card, drawn as the placeholder in the needed box.
7. `_Config` version is already going to 2 for `13`. The `hint` key rides along
   and needs no further bump.

### Still not answered, on purpose

**A parser that reads loose text and prints the standard form.** Miguel raised it
and then ruled it out of 0.2 himself. It is written up in the map fog and in
`.scratch/0.3-backlog.md`.

The reason it is not urgent: **0.2 already cleans every line that has been typed
before.** Tap a chip and the stored text is saved. Type loose and the Save prompt
offers the stored text. The only line that goes in raw is a size logged for the
very first time, a handful per job, and fewer every job as the history grows.

The reason it is not cheap: a parser must guess. `5 1/4 MDF` on a baseboard and
`32 6 RH` on a door are both numbers, and nothing tells them apart without a
grammar per item, a screen to edit that grammar, and a way to correct it when it
reads wrong. That is the four-field form `17` turned down, wearing a coat.

### Consequences that are not written anywhere else

Added at the end of the session, on a check for undocumented context.

**The phone now holds three separate stores, not one.** `03` rewrote `Store` in
`common.js` from `sessionStorage` to `localStorage`, `04` gave the outbox its own
key, and `15` adds a third. They have different lifetimes and the build must not
merge them:

| Store | Holds | Lifetime |
|---|---|---|
| One key per building | The whole building copy | Dropped at ten buildings, or when the building finishes, per `14` |
| The outbox | Waiting and held edits | Until every job lands or Miguel drops it |
| The history index | Chip lines from **dropped** buildings only | Capped at 20 per group, pruned least-used first |

The index needs a name. `CLAUDE.md` sets the rule for it: a storage key is an
identifier, not a label, so it is named once and never renamed, because renaming
orphans what is already on a crew phone. Follow the existing
`pfc.control.v1.local` form.

**A brand new phone has no chips at all, and that is the real price of deleting
the seed.** The history index lives in `localStorage`, so a fresh install or a
reinstall starts empty, and there is no seed behind it any more. Until that phone
downloads a building holding records, or logs some itself, the chip row is blank
and every needed line is typed by hand.

This was accepted, not overlooked. Two reasons it is small: the crew is Miguel
and one coworker, both already installed per `10`, and the first `get-project`
after an install pulls a live building whole — records included, per this
ticket — so the chips fill from the server, not from local history. The empty
case is a genuinely new phone opening a genuinely new job.

**Miguel pushed on this, correctly, and it produced a scoping rule.** His point:
the common sizes are sitting in the Sheets, so why can a new phone not go and get
them? The answer is that it can. `handleListProjects` at `Code.js:182` walks every
Sheet in the Projects folder, and `14` had the **phone** hide finished buildings,
not the server, so a new phone already receives the id of every job it has ever
run. A `rebuild-suggestions` action reading one tab per Sheet is a small piece of
work.

**He ruled it 0.3 anyway, and gave the reason as a rule: anything about closed
jobs belongs to the Archive, and the Archive is 0.3.** That single line now
explains three deferrals that were each argued separately — the Archive window
from `14`, the GC punch list from `16`, and this. It is on the map.

**What 0.2 must leave open for it**, his words: "still leaving openings in 0.2 for
them." Four seams, all free, all things a later session could destroy by tidying:

1. **`list-projects` keeps returning every building, finished or not.** `14` put
   the finished-building test in the **drawing** layer. Never move it into the
   server answer as an optimisation — that deletes the Archive's discovery for
   free, and `14` already warns that drawing rules and storage rules must stay
   separate.
2. **`get-project` keeps returning every record state.** Do not add a state filter
   later to trim the payload. Archive is a filter over records, per `14`.
3. **The index row shape holds item, subtype, type, needed, count and last used.**
   That is enough to be re-fed from a server source without changing shape.
4. **The index stays its own store**, so a future version can refill it without
   touching the building copies or the outbox.

**Counts do not decay on their own, and that rests on a bet Miguel stated.** His
words on 2026-08-08: "most common suggestions will probably sort themselves well
so I'd like to keep the history, but it should probably have a limit so we do not
end up with 1000's of chips."

**Amended the same day.** He came back and added the tail expiry above — unused
for 12 months **and** used fewer than three times. So the bet is now narrower than
it was: a line you use often still never decays, however long the gap, and only
the tail ages out. **The assumption left standing is that a standard door size
stays standard.** If that ever stops being true the symptom is easy to name — a
size that was standard years ago sits first in the row and will not move, because
ordering is by count and a protected count only ever grows. The fix at that point
is to drop the count test from the expiry rule, which is a one-line change.
Nothing else in the build depends on it.
