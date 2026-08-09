# TEST ROUND — 0.2 step 3, second pass

Written 2026-08-09, end of session 11. This is the **gate**. Step 4 does not
start until this round reports back.

Step 3 shipped, Miguel tested it, and fifteen findings came back. The fix round
answered them in five blocks. **This round checks that work.**

---

## What this round is for

Two jobs, in this order of importance:

1. **Every point Miguel raised shows up in the app exactly as he described it.**
   This is the main job. Not "a fix was committed" — *the screen looks the way he
   asked.* Go and look at each one.
2. **Nothing else broke.** The fixes touched the rollup, the sync bar, the queue
   drain and the Unit header. A general pass over the Tracker screens.

**Report point by point, using his numbers**, because this round is a reply to
his list. That is the opposite of the fix round's rule — there he asked for
classification because the list was messy. Here the numbers are the whole point.
Keep regressions in a separate section of their own.

---

## Read these first

1. `CLAUDE.md` — repo context. Non-negotiable.
2. `docs/crew-words.md` — the authority on every word a crew member reads.
3. `.scratch/pfc-control-0.2/BUILD-LOG.md`, **session 11 last** — what landed and
   what is deliberately still open.
4. `.scratch/pfc-control-0.2/HANDOFF.md` — the fix round's work order, now marked
   done. Read it for *why* a thing was built the way it was.

`notes/0.2-step-3-testing.md` holds Miguel's raw findings and **is gitignored**,
so it exists only on his machine. It is quoted below where it matters, but ask
him to open it if you want his exact words.

> **⚠ Session 10's BUILD-LOG entry is wrong.** It warns in capitals that nothing
> reached GitHub and tells you to re-run block 2. Block 2 is on `origin/0.2` and
> on `origin/main`. Session 11's entry corrects it. Do not act on that warning.

---

## The fifteen points, and where each one landed

| # | What he asked for | Where | Check |
|---|---|---|---|
| 1 | Greyed `Complete` looks wrong; wants normal colour + red dot, message only on tap | **Step 4** | Only the wording changed so far: `flag` → `issue`. The redesign is not built. Confirm it still reads `Fix the open issue first. Then Complete comes back.` and nothing regressed |
| 2 | Two dictionaries — one for code words, one for crew words | Done before the round | `docs/code-words.md`, `docs/crew-words.md` exist. Spot-check that screens obey the crew file |
| 3 | Progress bars on Building, Floor and Unit | **Block 3** | The big one. See below |
| 4 | `Exterior Door(s)` → `Exterior Doors` | **Block 4** | Not visible in the ZZ sheets — see gotchas |
| 5 | Spinner only beside the item's status and in the sync bar; remove phase and unit level. Plus the `Save UI Glitch.png` smoosh | **Block 2** | Set an item and watch where rings appear |
| 6 | Queue text and spinner too close to the box edge | **Block 1** | Compare against his `Outbox UI.PNG` |
| 7 | Queue offline sentence too verbose; empty queue wording | **Block 1** | Should read `All edits reached the server.` when empty |
| 8 | Offline should be a symbol (signal bars with a slash), not a grey box | **Block 2, partly** | **Chips got the glyph. The sync bar still has the grey slab.** Deliberate — see Open below |
| 9 | The `!` unsaved marker never showed up | **Block 2** | Needs a refused edit to look at |
| 10 | Offline + queued edit flashes red `Saving` for a few ms | **Block 5** | Fixed at the root: `drain()` no longer enters the sending state offline |
| 11 | `Offline. Last Update…` shows ~5s then vanishes; three stacked headers | **Block 5** | Merged into the sync bar and made state instead of a draw argument |
| 12 | `Offline · 1 edit wait` → `1 edit queued` | **Block 1** | |
| 13 | `Outbox` → `Queue` | **Block 1** | Window, file, header, and the sync bar link |
| 14 | Setup screen offline message too verbose | **Step 5** | Deferred on purpose. Confirm only that it is unchanged |
| 15 | Setup screen says `There are no saved projects yet` when local copies exist | **Step 5** | Deferred on purpose. **This one is false, not just verbose** — the worse of the two |

### Point 3 in detail, because it has four parts

- **Buildings row** — a bar, filling by items. It drew nothing before because it
  filled by whole units finished.
- **Floor header** — same. A floor of half-built units drew nothing.
- **Unit chip** — was already correct. Check it did not regress.
- **Unit screen** — a new bar, **top right, under the pill**, per unit and not
  per item. **Miguel chose to keep the pill** rather than have the bar replace
  it.
- **Count text everywhere** — `12 units · 5 done` is now `5/12 Units done`.

The rule for a bar: **nothing done draws no bar at all**, not an empty track. So
a floor with zero items complete showing no bar is correct, not a miss.

---

## How to run it

The app is live at **`https://miggodbout.github.io/PFC/control/`**, serving
`CACHE_NAME = pfc-control-0.2-step3-fix5`. Confirmed live at the end of session
11.

**Claude runs the round, not Miguel** — that is settled in
`PFC_Control_0.2_Build_Prompt.md` section 5. Drive it in Chrome. Hand him a list
only for what a browser genuinely cannot do: a real phone, real airplane mode on
a job site, a real second person.

### Gotchas that will cost you time otherwise

- **The Service Worker will serve you `fix4`.** It caches the app shell. Force an
  update, or check `sw.js` over the network before trusting what you see. A whole
  round tested against the old build is the classic way to waste this window.
- **The two ZZ test Sheets are saturated.** Nearly every item is In Progress and
  almost nothing is Complete, so every bar is a thin sliver and some are absent
  correctly. **To judge the bars you will have to set several items Complete
  yourself.** Writing to these Sheets is fine — they are junk and already on the
  trash list, and step 4 wants fresh ones anyway.
- **`Exterior Doors` is not in the ZZ sheets.** They carry three items per unit
  (Interior Doors, Windows, Cut). The rename lives in the default item list, so
  check it on the **Set Up Building** screen where a new building is created, not
  in the Tracker.
- **Simulating offline:** DevTools offline works, and the code reads
  `navigator.onLine` in `drain()` and in `syncBarHtml()`. Toggling it is enough
  to exercise points 8, 10, 11 and 12 without a real dead zone.
- **Points 9 and 1 both need a state you have to create.** `9` needs an edit the
  server *refused* (not merely queued) — the red `!` is for refusals, the blue
  offline glyph is for queued. `1` needs an item carrying an open issue.
- **Never create a new Apps Script deployment.** Redeploy the existing one. The
  backend is already at version 9 and returns `itemsDone` / `itemsTotal`.

---

## Already known, so do not report these as new findings

- **The sync bar's offline mark is still the grey slab.** Point 8 named that grey
  box specifically. Block 2 gave the glyph to chips only, and `HANDOFF.md` block
  5 still draws the slab in its own sketch, so session 11 left it rather than
  widen the block quietly. **It is a one-line change — `ICON.offline` already
  exists.** Worth putting in front of Miguel as a decision, not as a bug.
- The Unit-screen bar's exact look was checked in Chrome at desktop width but
  **never on a real phone**. Same for the block 2 corner badges at chip size.
- `reference/PFC_Master_Template.xlsx` is still not updated. No code reads it.
- The unfolded landed RECORD is step 4's job.

---

## When the round is done

Write a session entry in `.scratch/pfc-control-0.2/BUILD-LOG.md` holding:

- Each of the fifteen points: **confirmed / not fixed / fixed but wrong / not
  this round.**
- Regressions, separately.
- Anything only Miguel can check, as a short list for him.
- Whether step 4 is clear to start.

Ship a `0.2` patch for anything found only if it **blocks the round itself**.
Otherwise collect the findings and let Miguel decide — a release costs a push, a
Pages build, a `CACHE_NAME` bump and a phone update cycle, and that cost is the
same for a one-word fix as for a hundred-line one.
