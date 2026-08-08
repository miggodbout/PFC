# Which decision wins, where two of them disagree

Produced by `18-supersession-sweep`, 2026-08-08.

One line per overruled decision. Read this before `09-write-0.2-build-plan`, and
before trusting any single sentence in a resolved ticket.

**This is a partial pass.** `18` is meant to run last, after `13`, `14` and `15`
close. **`13` closed on 2026-08-08 and added entries 30 to 34.** `14` and `15` are
still open. Everything below comes from a ticket that has **already** closed, so
none of it can be undone by the two that remain. A second pass is still owed, and
the last section says exactly what it must check.

---

## The supersessions

Form: what the old text says · what overruled it · which one wins.

### The status model

1. `CLAUDE.md` shipped five statuses in one field. `01` split them into Progress
   (three manual values) and Flags (never set by hand). **`01` wins.**
2. `01` gave a record two states, Open and Fixed. `02` added **Cancelled**, and
   renamed the Fixed date field to **Closed**. **`02` wins.**
3. `CLAUDE.md` and `common.js` roll up by worst-wins. `11` deleted worst-wins for
   unanimity-or-In-Progress, counted rather than ordered. **`11` wins.**
4. `CLAUDE.md` says a Deficiency flag beats a Waiting flag. `11` draws both, each
   with its own count, because neither is a status and there is no contest.
   **`11` wins.**
5. `11` first said an open flag blocks Complete on a computed rollup. It was
   amended the same day: a flag blocks Complete on an **item** too. **The
   amendment wins.**
6. `01` renamed `On Hold` to **Waiting**. `11` adds that `on_hold` is renamed
   `waiting` **throughout the code**, which reaches `common.js`, `theme.css`,
   `building.html` and `unit.html`. **Both stand; `11` is the wider one.**

### The reason list and the record fields

7. `01` defined three per-phase reason lists. `17` deleted them for one list of
   eight per building, plus a short trim per item. **`17` wins.**
8. `01` and `template-changes.md` list `Warped`. `17` renamed it **Defective** —
   arrived wrong from the factory, against `Damaged`, hurt on site. **`17` wins.**
9. `01` and `12` both say the needed line stays free text, flatly. `17` narrowed
   it: width, depth and swing stay typed; the **type** becomes a dropdown in its
   own column. **`17` wins, on the type only.** The rest of the free-text
   argument in `12` is untouched and still correct.
10. `01` lists `Wrong Size or Profile` on the Baseboards list. `17` replaced every
    phase list with the shared eight. **`17` wins**; that value no longer exists.
11. `02` fixed the Deficiencies tab at **twelve** columns. `17` made it
    **thirteen**, adding `subtype` beside `needed`, so every letter from `H`
    onward shifts. **`17` wins.** Checked on 2026-08-08: no other ticket quotes a
    column letter from this tab, so nothing else has to move.

### The doors and the screens

12. `01` says an Archive view in the app "is a filter over records the phone
    already holds, so it costs nothing". `06` made Archive a **window**, and
    Miguel moved it to **0.3** under the one-window-per-MINOR guideline.
    **`06` wins.** 0.2 has no Archive view of any kind.
13. `12` says "no new Admin work comes from this ticket". `17` gave Admin the
    per-item type list, Add-only, on an edit-item screen. **`17` wins**, and the
    work lands on `13`.
14. `12`'s form sketch draws seven fields with no **Type** row. `06` added Type
    at the top, and `17` added the **Subtype** dropdown. **`06` and `17`
    together own the current form.** The sketch is a historical drawing.
15. `12` says "`Archive` is not added here. `14-building-archive` owns that
    screen", and its Hub sketch shows five cards. `06` added a **greyed Archive
    card** to the Hub as the 0.3 seam. **`06` wins.** The Hub ships seven cards
    in 0.2: Tracking, Log, Create Job, Deficiencies (greyed), Materials (greyed),
    Reports (greyed), Archive (greyed).
16. `06` listed "prompt when the dropdown moves to Complete" as a candidate. `05`
    and `11` made Complete untappable while a flag is open, so the prompt cannot
    fire. **It is impossible, not rejected** — the shortcut moved to a card that
    offers Complete after the last fix.
17. `06` found that **six controls is the whole budget** on the Logger form. `17`
    took it to **seven** on an item that defines types. This is **not an overruled
    finding.** Six was a measurement of what fits above the keyboard. Seven is
    what the form now needs. **The build must make seven fit**, and `06`'s
    amendment lists the options.
18. `15`'s "Settled early" section plans seed suggestions covering door variants.
    `17` moved the variants to a dropdown. **`17` wins**, and the seed list now
    covers **dimensions only**. Narrowed, not deleted.
19. `14` assumed Archive is a list of finished buildings. Miguel corrected it on
    2026-08-08: Archive is the **history door**, holding fixed records for active
    and finished buildings alike. **The correction wins**, and it already sits on
    top of that file.

### The queue and the backend

20. `03` set a **no-timer** rule for refreshes. `04` runs a retry backoff — 5s,
    15s, 1m, then every 5 minutes — while jobs wait. **`04` wins, deliberately**,
    because it finishes work already asked for rather than polling for news.
21. `04` replaced the planned `update-item` action with **`save-batch`** before
    `update-item` was ever built. **`04` wins.** See the stale reference below —
    two files still name `update-item`.
22. `07` found that a busy server and a permanent failure look the same to the
    app. `04` fixed it: every result carries `retry: true` or `retry: false`.
    **`04` wins**, and this is `07`'s finding being answered, not overruled.

---

## Stale cross-references, and one stale line of production code

23. **`control/appscript/Code.js`, lines 1300 to 1315.** A comment block headed
    `0.2 EXTENSION POINT` tells the next session to build an action called
    `update-item`. `04` deleted that action in favour of `save-batch`.
    **This is the only supersession that lives in real code rather than in a
    note**, and it is the first thing a build session reads when it opens the
    file. The three helpers the block points at — `readConfig`, `computeLayout`,
    `indexOfUnit` — are still correct and still needed.
24. **`02-deficiencies-tab-layout`, line 80.** It cites "the `update-item` note at
    the end of `control/appscript/Code.js`" as the model for idempotence. The
    idempotence rule it describes is right and still applies. Only the action
    name is wrong. Corrected in place.
25. ~~**`14-building-archive`, line 159.**~~ **Cleared 2026-08-08.** The stale
    `Blocked by` lines were deleted outright when `14` resolved, rather than
    annotated. Nothing left to correct.
26. **`01-deficiency-record-fields`, line 141.** The Archive-costs-nothing
    sentence, item 12 above. Corrected in place.
27. **`12-logger-door`, lines 83 to 114.** The form sketch and its field list.
    Item 14 above. `12` already carries the correction at the bottom of the file,
    but a reader who stops at the sketch never reaches it. A pointer is added
    directly above the sketch. The sketch itself is untouched.
28. **`template-changes.md`.** Rewritten this pass. See below.
29. **`prototypes/06-logger-and-records.html`.** It draws the pre-`17` form: it
    has the **Type** toggle that `06` added, and no **Subtype** dropdown. **Do not
    edit it** — the rule on `18` is that prototypes are throwaway assets. `06`'s
    amendment already says the prototype needs re-checking against seven controls.
    `prototypes/05-pending-state.html` was built after `11` closed and draws the
    three-value dropdown correctly. It needs nothing.

    **Widened by `15`, 2026-08-08. Its `suggHtml()` function is now wrong in five
    ways**, and it is the one part of the prototype a build session is most likely
    to copy, because it looks finished:
    - It holds a **`SEEDS` constant**. No seed list exists any more.
    - It groups on **item alone**. The key is now Type · item · subtype.
    - It draws **four chips**. Three.
    - It filters on **plain substring**. Filtering now normalises — strip spaces,
      quote marks and slashes, then lowercase.
    - It has **no near-match prompt** on Save, and no history index behind it.

    Read `15`'s resolution, not this function.

---

## Added by `13-admin-changes`, 2026-08-08

Same form: what the old text says · what overruled it · which one wins.

30. **`17` wrote its subtype lists against items that do not exist.** It named
    `Hardware` and `Baseboards`. Both are **phases**. Its four handle types —
    Passage, Privacy, Dummy, Pocket — were already **three separate items** in
    Phase 3. `13` rewrote the lists against the real item list. **`13` wins**, and
    the corrected lists are `template-changes.md` section 5.
31. **`common.js:78` and the .xlsx template hold seventeen items.** `13` cut them
    to **fourteen**: Unit Door, Passage, Privacy, Dummy, Spring Stops and Hinge
    Stops stop being items; Handles, Stops and Bathtub are the new ones.
    **`13` wins.** See `template-changes.md` section 9.
32. **`17` and `13`'s own earlier text say "Admin needs Add and never Delete",
    flatly.** `13` narrowed it: **Add is Add-only, but the reason trim is freely
    reversible both ways**, because unticking a trim box removes nothing from
    `_Config`. **`13`'s narrowing wins.**
33. **`17` assumed the master template updates by hand and left it open. `13`'s
    own question sheet asked "through Admin or by hand".** Both were built on a
    wrong picture: `handleCreateProject` never copies the .xlsx. **The seed is
    `common.js`, the .xlsx is a drawing, and a value added in Admin never leaves
    its building.** `13` wins.
34. **`17` took the Logger form from six controls to seven, and entry 17 above
    records `06`'s six-control budget as already overrun.** `13` added an `Other`
    text box to the Subtype list, so the worst case is now **nine** controls.
    Nothing is overruled — the budget is simply gone. The recommended answer, pin
    Save to the bottom of the screen, is on `13` and on the map's **Not yet
    specified**. **It needs one line from Miguel at build time.**

Two things `13` **confirmed** rather than overruled, so nothing above changes:
`rebuildTracker` already cannot reach the Deficiencies tab, and Admin has no
`remove-unit` operation and gets none in 0.2.

---

## Added by `14-building-archive`, 2026-08-08

35. **The map read "Tracker stays as lean as possible" as licence to hide finished
    items.** The map's own **Not yet specified** section recommended it, and `14`
    wrote it up as Reading A with `06`'s greyed-and-Undo treatment. Miguel
    overruled the whole branch: *"an item should never dissapear, just be marked
    complete."* **Miguel wins.** Lean means fewer **flags and records**, never
    fewer items. The map's principle now carries the boundary, and `14`'s Reading A
    section is marked dead in place. **Nothing in 0.2 hides an item.**
36. **`03-local-copy-rules`, line 88, marks the archived-building drop "not
    final".** It is final now. `14` shipped the rule in 0.2, so the drop fires.
    **`14` wins**, and the line should stop calling itself provisional. The drop
    runs on app open, which is also when the greyed Tracking row goes, so the row is
    always tappable while it is drawn.
37. **`11-rollup-rules` says the app trusts only the phone, and calls Sheet drift
    cosmetic.** That holds inside a building the phone has a copy of. It cannot hold
    for the **Tracking list**, where the phone has no copy of a building it never
    opened. `14` narrowed it: **`list-projects` sends Complete, total and open-flag
    counts, and the phone applies `11`'s rule to those numbers.** The Sheet's
    `overall` word no longer decides whether a building disappears, because drift
    that hides a live building is not cosmetic. **`14`'s narrowing wins.** The
    server's own `worst(statuses)` at `control/appscript/Code.js:204` goes, which it
    had to anyway once worst-wins was deleted.

One thing `14` **confirmed** rather than overruled: a **Cancelled** record counts
as closed. `02` gives a record three states and `11` blocks Complete on an **open**
flag only, so Cancelled raises no flag and cannot hold a building out of Archive.

---

## Not a supersession: one live conflict — SETTLED 2026-08-08

> **Miguel closed this the same day.** A finished building **does** leave Tracker
> in 0.2, so `03`'s archived-building drop fires. He was offered the safer
> reading below and chose against it, accepting that 0.2 has no door onto a
> finished building until Archive ships in 0.3. The data stays in the project
> Sheet. Full note on `14-building-archive`.
>
> **The build must keep two rules apart**, because they sound identical: leaving
> the **Tracking list** is about what the app draws, and dropping the **local
> copy** is about what the phone stores. `04`'s exemption — a building holding a
> waiting or held edit is never dropped — is a storage rule and is untouched.
>
> The facts below are kept as the reasoning that led to the decision.



`18` asked whether `03`'s rule that the phone drops an archived building "fires at
all in 0.2". **It cannot be answered here, because it is a decision and
`14-building-archive` is still open.** The facts, so `14` can close it in one
line:

- `03` line 88 says an archived building is dropped ahead of the ten-building
  limit, and marks the rule "not final", owned by `14`.
- The Archive **door** is 0.3. So there is no screen in 0.2 that shows a dropped
  building.
- But `14` still owes 0.2 **the rule** — a building is closed when it reads
  Complete — and the rule could fire with no door present.
- `04` says a building holding any waiting or held edit is **never** dropped. That
  exemption must survive whatever `14` decides. The two rules do not conflict
  today; they would if `14` made the archive drop unconditional.

If `14` ships the rule in 0.2, a finished building silently leaves the phone with
nowhere to see it until 0.3. If `14` holds the rule for 0.3, the ten-building
limit is the only thing that drops a copy, which is what `03` already builds.
**The second reads safer.** It is Miguel's call.

---

## What the second pass still owes

Run this before `09`. **`13`, `14` and `15` have all closed, so the second pass is
takeable now. Nothing blocks it.**

- ~~**`13`**~~ **closed 2026-08-08.** Its supersessions are entries 30 to 34
  above, and `template-changes.md` sections 5 and 9 carry the result.
- ~~**`14`**~~ **closed 2026-08-08.** It confirmed that `03`'s archived-building
  drop **does** fire in 0.2, so `03` line 88 stops being "not final". It also
  superseded three things the sweep should carry, listed in the new section below.
  No template change: the counts it adds to `list-projects` are a server change and
  take no new column.
- ~~**`15`**~~ **closed 2026-08-08.** The answer was "built from records the phone
  already holds", so **`template-changes.md` section 8 is now empty** and the file
  is one sweep away from FINAL. `15` added a `hint` key to section 5 and
  superseded three things, listed below.
- Re-check that nothing in `13`, `14` or `15` quotes a Deficiencies-tab column
  letter, a five-status list, or the word `Warped`.
- **Sweep every `32" 6" RH` in the repo.** `15` dropped the inch marks and the
  standard is now `32 6 RH`. Known sites: `01` (the hint text), `02` (column H),
  `17`, `template-changes.md`, and `CLAUDE.md` if it carries one.
- Then, and only then, mark `template-changes.md` **FINAL**.

---

## Superseded by `15-suggestion-list`, 2026-08-08

35. `15`'s whole **"Settled early, 2026-08-07"** section plans a seed suggestion
    list that Miguel writes, Interior Doors first. **The resolution deletes it.**
    Chips come from records across every building on the phone, so a new job
    inherits the vocabulary on day one and the seed has no gap to fill. Entry 18
    above said `17` had *narrowed* the seed. It is now **gone**, not narrowed.
    Miguel writes no seed content and no seed ships in `common.js` or `_Config`.
36. `01` set the needed-line hint as **`ex: 32" 6" RH`**, and `02`, `17` and
    `template-changes.md` copy the form. **`15` wins twice over.** The inch marks
    are dropped — the standard is **`32 6 RH`** — and the hint is no longer an
    example at all. It is a **per-item placeholder naming the parts**:
    `Size   Jamb   Swing`, in crew words, held as a `hint` key in `_Config`.
37. `03-local-copy-rules` never said which record states `get-project` sends.
    **`15` settles it: the whole Deficiencies tab, every state.** This is an
    addition to `03`, not a contradiction of it, but the build plan must read it
    here — `03`'s own text does not mention records at all.

One thing `15` deliberately did **not** overrule: `06`'s control budget. The chip
row and the placeholder were both already drawn in the `06` prototype, so the
Logger form **stays at seven controls**. The Save-under-the-keyboard question in
the map's Not yet specified is untouched.

---

## Settled by Miguel on 2026-08-08, on Exterior Door(s)

Both entries come from one answer, given after `15` closed and before `18`'s
second pass. Neither is a new feature. Entry 38 deletes work the map had listed
as owed before `09`; entry 39 settles a contradiction the first pass missed.

38. **`17` recorded a gap that does not exist.** Its Exterior Doors section says a
    defective patio or entry door is "a real problem that Miguel would want
    recorded, and it is one PFC will never fix", and the map carried it as a rule
    owed before `09` — candidates being a third record state, a flag that does not
    block, or a never-block item rule. **Miguel overruled the premise, not the
    reasoning.** PFC does not fix the door, but PFC does fix the **casing and
    build-out around it**, and a defective door sends the crew back to redo them.
    So the record is ordinary PFC work, and the flag blocking Complete is correct
    rather than a fault. **`11-rollup-rules` wins untouched. Nothing is built and
    no ticket `19` exists.** `17` carries a correction block; the map's Not yet
    specified entry is struck.
39. **Three tickets disagree on whether Exterior Door(s) defines a subtype list.**
    `12-logger-door` line 276 and `17-reason-list-scope` line 178 both name it
    beside Windows and Baseboards as defining **none**, so no dropdown appears.
    `13-admin-changes` line 304 then gave it **`Patio, Entry`** in the new 14-item
    table, and `template-changes.md` sections 5 and 9 copy `13`. **`13` wins, and
    Miguel reconfirmed it directly when the conflict was put to him.** Patio and
    Entry name *which opening*, not swing or size, and they are the only thing
    that tells two records on one item apart. **Four items define a list**, as the
    map says: Interior Doors, Exterior Door(s), Handles, Stops. `12` and `17` are
    the stale text. **`template-changes.md` needs no edit for this** — it already
    follows `13`.

Neither entry disturbs `17`'s reason trim. `Wrong Swing`, `Wrong Type` and
`Wrong Color` still come off Exterior Doors, because PFC did not choose the door.
Miguel restated that reasoning in the same answer.
