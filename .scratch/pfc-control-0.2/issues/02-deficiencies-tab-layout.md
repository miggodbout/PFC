# How the Deficiencies tab lays out

Type: grilling
Status: resolved
Blocked by: 01, 07

> **Nomenclature correction, added by `18-supersession-sweep` 2026-08-08. Every
> `32" 6" RH` below is stale text.** `15-suggestion-list` dropped the inch marks.
> The standard needed line is **`32 6 RH`**. This changes no column and no rule —
> the `needed` cell is free text either way. The examples are left as written,
> because the sweep does not rewrite a resolved ticket.

## Question

How does the new Deficiencies tab lay out in a project Sheet?

**Scope narrowed on 2026-08-06.** This ticket held the rollup question as well.
Ticket `11-rollup-rules` asks the same thing, so the rollup moved there whole,
and `11` now waits on this ticket. The seam: **02 is the record store, 11 is the
view above it.**

Points to settle:
- The column list, and the key that ties a record to its unit and item. Item
  keys come from `slug()` in `control/appscript/Code.js`.
- Where a record row is added, and how a row is found again for an edit.
- Whether a record carries its own id, so a retried save cannot make a duplicate.
- What happens to a record when Admin changes the structure and an item goes
  away.
- What changes in the master template, ID `1QIF5TCJ0iekpNGHEjce1PSoFXRFhucmF-ednTSYHT-M`.

## Answer

Settled with Miguel on 2026-08-06.

### The tab

One tab named `Deficiencies`, in every project Sheet. One header row, data from
row 2. This is not the Unit Tracker tab, which carries six header rows for the
printed look. This tab is a plain list, so it filters and sorts like a list.

Twelve columns:

| Col | Name | Holds |
|---|---|---|
| A | `record_id` | The record's own id. See below |
| B | `unit` | The unit key, such as `103` |
| C | `phase` | The phase key. Always filled |
| D | `item` | The item key. **Blank means the record is on the whole phase** |
| E | `type` | `Deficiency` or `Waiting` |
| F | `reason` | One value from the phase's list |
| G | `other_text` | Free text. Only when the reason is `Other` |
| H | `needed` | Free text, such as `32" 6" RH` |
| I | `quantity` | A number |
| J | `state` | `Open`, `Fixed` or `Cancelled` |
| K | `created` | A real date cell, formatted `yyyy-mm-dd` |
| L | `closed` | A real date cell. Blank while the record is Open |

Keys, not labels. The tab stores `interior_doors`, not `Interior Doors`. A slug
from `slug()` reads well enough by eye, and one column cannot disagree with
itself.

**Dropped: the `Attaches to` column** from the provisional list in
`template-changes.md`. A blank `item` already says the record is on a phase. A
second column saying the same thing can only ever drift out of step with the
first.

### Every record carries an id, and the phone makes it

Format: `d-YYYYMMDD-HHMM-xxxx`, where `xxxx` is four random hex characters.
Example: `d-20260806-1422-a7f3`. Readable by eye, sorts by time, and collides
only if two records are made in the same minute and draw the same four
characters. Two users make this impossible in practice.

**The phone makes the id, not the server.** This is the whole reason the id
exists, and it is what makes a save safe to retry:

1. The phone makes the id when Save is tapped, before anything leaves the phone.
2. The save goes into the outbox with that id already on it.
3. The server looks for the id in column A. Not found, it appends a row. Found,
   it overwrites that row.
4. A retry after an unclear failure therefore updates instead of duplicating.

A server-made id breaks step 4. The phone cannot tell a lost reply from a lost
request, so it retries, and the server makes a second record.

This is the same idempotence rule as the `update-item` note at the end of
`control/appscript/Code.js`: the call carries the final value, not a change to
apply. Ticket `04-queued-edit-rules` owns the retry rules themselves.

> **The action name is stale, 2026-08-08.** `04` deleted `update-item` before it
> was built and replaced it with **`save-batch`**, which takes the whole outbox in
> one call. The idempotence rule above is unchanged and still exactly right — it
> is now the rule `save-batch` follows, per job. The comment block at the end of
> `Code.js` still advertises `update-item` and is the one piece of stale text
> living in production code. See `supersessions.md` items 21 and 23.

### Finding a row

The server reads column A whole, in one call:

    sheet.getRange(2, 1, lastRow - 1, 1).getValues()

Then it finds the id in memory. One service call, not a search per record. This
matters when the outbox drains: a batch of queued edits resolves every id from
one read. `TextFinder` also costs one call, but only for one id.

New rows always go on the **bottom**. Never inserted in the middle. The tab is
then a chronological log, and appending is the one write that cannot disturb an
existing row.

### `Cancelled` is a new state, and it changes ticket 01

Ticket 01 gave a record two states, Open and Fixed. That is not enough.

- `Open` — still a problem. The flag shows.
- `Fixed` — somebody did the work. The `closed` date is filled.
- `Cancelled` — the record should never have existed. Wrong unit, wrong item, a
  typo, or an item that left the job. The `closed` date is filled.

Both Fixed and Cancelled clear the flag. Neither is ever deleted.

The reason: closing a mistaken record as `Fixed` writes a lie into the Sheet.
Version 0.5 reads open records to total up material orders, and a Fixed record is
the proof shown to a supplier. A typo must not look like a repair.

### Admin refuses to remove an item that has open records

Admin's `remove-item` operation stops when the item holds any record in the
`Open` state. It names the unit and the reason for each one:

    Interior Doors has 2 open records. Close them first.
      103  Wrong Swing   32" 6" RH
      204  Damaged       1 slab

Records already `Fixed` or `Cancelled` never block a removal. They stay in the
tab as history, pointing at an item key that is gone. That is correct. They are
evidence of what happened, not a live problem.

Rejected: deleting the records with the item. It contradicts ticket 01, and one
misclick in Admin would destroy a supplier claim with no way back.

Rejected: leaving open records orphaned and hidden. Two live problems would
vanish from every screen with no warning, findable only by reading the Sheet.

### Rules for the rebuild

`rebuildTracker` clears and redraws the Unit Tracker tab on every structure
change. **It must never touch the Deficiencies tab.** The two tabs are rebuilt on
different triggers: the Unit Tracker is redrawn from the config, and the
Deficiencies tab is only ever appended to and edited in place.

`handleCreateProject` creates the Deficiencies tab with its header row, freezes
row 1, and adds a filter.

### What this ticket did not answer

The rollup moved to `11-rollup-rules` whole, along with the whole status model on
the Unit Tracker tab. Nothing here says what a flag looks like in a unit row, or
whether a flag is a Sheet formula or worked out by the app.

### Corrected by `17-reason-list-scope`, 2026-08-08

**Twelve columns becomes thirteen.** A `subtype` column joins the tab, holding
the door type or the handle type. It sits beside `needed`, so the two fields that
describe the replacement stay together.

| Col | Name | Holds |
|---|---|---|
| … | … | A to G unchanged |
| H | `subtype` | `Bypass`, `Privacy`. **Blank on an item that defines no types** |
| I | `needed` | Free text, such as `32" 6" RH`. Was column H |
| J | `quantity` | Was column I |
| K | `state` | Was column J |
| L | `created` | Was column K |
| M | `closed` | Was column L |

Everything else on this ticket holds. The id rule, the append-on-the-bottom rule,
the one-call column A read, `Cancelled`, the removal refusal, and the rule that
`rebuildTracker` never touches this tab are all unaffected.

**Why a column and not part of the needed text.** Folding `Bypass` into the front
of the needed line was offered and rejected. 0.5 totals materials, and reading a
type out of free text means matching words — the exact problem the dropdown was
added to solve. A column makes the total countable with no guessing.

**`Wrong Size or Profile` is gone.** Column F now takes one of eight shared
values. See the correction on `01-deficiency-record-fields`.
