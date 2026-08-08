# Which decision wins, where two of them disagree

Produced by `18-supersession-sweep`, 2026-08-08.

One line per overruled decision. Read this before `09-write-0.2-build-plan`, and
before trusting any single sentence in a resolved ticket.

**This is a partial pass.** `18` is meant to run last, after `13`, `14` and `15`
close. Those three are still open. Everything below comes from a ticket that has
**already** closed, so none of it can be undone by the three that remain. A
second pass is still owed, and the last section says exactly what it must check.

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
25. **`14-building-archive`, line 159.** A `Blocked by` line reads
    "`11-rollup-rules` — still open. This is the only thing holding the ticket
    now." `11` closed on 2026-08-07, and the header of the same file already says
    so. Corrected in place.
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

Run this after `13`, `14` and `15` close, and before `09`.

- **`13`** will decide where the Admin edit-item screen sits, who writes the
  default per-item trim, and whether the master template updates through Admin or
  by hand. All three land in `template-changes.md` section 3.
- **`14`** will settle the conflict in the section above, and confirm whether
  `03`'s archived-building drop fires in 0.2.
- **`15`** will decide where the seed suggestion text is stored. If the answer is
  the `_Config` tab, `template-changes.md` gains a section. If the answer is
  "built from records the phone already holds", section 5 loses its last item.
- Re-check that nothing in `13`, `14` or `15` quotes a Deficiencies-tab column
  letter, a five-status list, or the word `Warped`.
- Then, and only then, mark `template-changes.md` **FINAL**.
