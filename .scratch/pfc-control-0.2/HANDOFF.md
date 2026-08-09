# HANDOFF — the 0.2 step 3 fix round

> **DONE, 2026-08-09. All five blocks have landed on `0.2`.** Blocks 1 and 2 in
> sessions 9 and 10, blocks 3, 4 and 5 in session 11 (`4b9dec3`). Read this file
> now for the reasoning behind a decision, not as a work order.
>
> **Session 10's entry in `BUILD-LOG.md` warns that block 2 never reached GitHub
> and tells you to re-run it. That warning is wrong** — block 2 is on
> `origin/0.2` and on `origin/main`. See the session 11 entry.
>
> What is left is the merge to `main` and then the step 3 test round, which is
> the gate before step 4.

Written 2026-08-09, end of session 9. Branch `0.2` at `42b9be9`.

**Nothing here is step 4.** Step 3 shipped, Miguel tested it, and fifteen findings
came back. This round fixes those. Step 4 — records, Logging, chips — starts after
it.

---

## Read these first, in this order

1. `CLAUDE.md` — repo context. Non-negotiable.
2. `PFC_Control_0.2_Build_Prompt.md` — how the build is run. Branch, token cap,
   deploy loop, when a step is done.
3. `docs/crew-words.md` — **the authority on every word a crew member reads.**
   Most of this round is that file being applied to the code.
4. `.scratch/pfc-control-0.2/BUILD-LOG.md`, **session 9 last** — what was found
   and why four of the findings are not what they look like.
5. `.scratch/pfc-control-0.2/BUILD-PLAN.md` **amendment A3** at the top — the
   plan is LOCKED, and A3 is what supersedes its wording.

`notes/0.2-step-3-testing.md` holds Miguel's raw findings. It is **gitignored**,
so it exists only on his machine. Ask him to open it if you need the original
numbering — but work by classification, not by his numbers. He asked for that
explicitly.

---

## The work order

Do it in this order. Each block is independently shippable.

### 1. Words and renames

Apply `docs/crew-words.md` to the code. The renames with teeth:

- `control/tracker/outbox.html` → `control/tracker/queue.html`, and the `Outbox`
  window becomes `Queue` everywhere.
- `control/admin/` → `control/setup/`. Hub card `Create Job` → `Set Up Building`,
  sub `Create or change a building`.
- `Drop` → `Delete`, **and give it a different shape.** It is the only button in
  the app that loses work on purpose, and today it is a grey ghost twin of
  `Try again`.
- `flag` leaves every screen. `Fix the open flag first.` becomes
  `Fix the open issue first. Then Complete comes back.`
- `Offline · 3 edits wait` → `Offline · 3 edits queued`. Singular `1 edit queued`.
- The three developer error strings get E1/E2/E3 wording, `Tell the Admin`, and
  the technical half goes to `console`.
- Drop the per-row offline sentence in the Queue entirely. The bar above already
  says it, and it printed three times on Miguel's screenshot.
- Empty queue reads `All edits reached the server.`

> **Both folder renames touch `SHELL` in `control/sw.js:18`.** That list is what
> makes the app open with no signal. Miss it and the app works on a desk and goes
> blank in a basement. **Test this one in airplane mode, not just online.**

### 2. Marks and spinners

- **Remove the spinner at phase level and unit level.** Keep it beside the item's
  own status and in the sync bar. This deletes the `#unit-pill` ring, which is the
  `Save UI Glitch.png` defect — no CSS repair needed. Root cause is in the log if
  you want it.
- **A queued edit gets a mark.** Today only a refused edit does. The mark is an
  offline symbol — signal bars with a slash, or a wifi glyph if bars read badly at
  chip size. Miguel chose the symbol over a plain dot. The red `!` stays for a
  refusal, so the two never look alike.

### 3. Progress bars

- **The bar fills by items; the count stays in units.** Above the Unit screen
  `done` counts whole units complete, so a floor of half-built units draws
  nothing. Fix the fill, not the count.
- **The count text changes shape:** `12 units · 5 done` → `5/12 Units done`.
  `countText` in `common.js:1518` is shared by the Tracking row, the floor header
  and the unit chip, so all three move together.
- **The Unit screen gets a bar**, top right, where its pill is now. Per item, no.

### 4. `Exterior Door(s)` → `Exterior Doors`

Two places in `common.js` — the default item list at `211` and the subtype table
key at `281`. The derived key moves from `exterior_door_s` to `exterior_doors`.

**Miguel confirmed on 2026-08-09 there is no real building yet, only ZZ tests, so
there is nothing to migrate.** Do this before that stops being true.

### 5. The header stack

Merge the stale line into the sync bar so there are never three bars. Miguel
picked this shape:

```
offline, nothing queued    ■ Offline · updated 1:22 AM
offline, three queued      ■ Offline · 3 edits queued
                             updated 1:22 AM      Queue ›
online                     no bar at all
```

The stale line is currently an argument to `render()`, so any later redraw paints
over it — that is the "shows for five seconds" report, and the same root cause as
the red `Saving` flash he saw while offline. Both are in this block.

---

## Not this round

- **Point 1, the greyed Complete.** Miguel wants normal colour with a red dot, and
  a message only when someone taps it. It **overrules a settled decision** in
  CLAUDE.md and ticket `05` — his call, but update the doc when you build it.
  Needs a flag to exist to look at, so it belongs to **step 4**.
- **Points 14 and 15, offline behaviour on the setup screen.** **Step 5** owns
  that screen. 15 is the worse of the two: `There are no saved projects yet` is
  not merely verbose, it is false when local copies exist.
- **Offline queueing for the setup screen** — Miguel asked for it to be written
  down as out of scope. It is a future version, not 0.2.

---

## Standing gotchas

- **Raise `CACHE_NAME` in `control/sw.js` on every front-end change.** Phones serve
  old files until it moves. Last value: `pfc-control-0.2-step3-fix2`.
- **Never create a new Apps Script deployment.** Redeploy the existing one.
- The two ZZ test Sheets are full of junk and were always on the trash list.
  Step 4 wants fresh ones anyway — and ones whose units are **not** all
  `in_progress`, because saturated data cannot show a rollup working.
- `reference/PFC_Master_Template.xlsx` is still not updated. Plan 1.7. No code
  reads it, which is why it keeps sliding.
- **Miguel reads no code.** Explain the intent and the non-obvious part, define
  coding terms as you use them, and do not narrate line by line. `docs/code-words.md`
  is the shared dictionary — if you use a term that is not in it, add it.
