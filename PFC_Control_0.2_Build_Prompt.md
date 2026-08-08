# PFC Control 0.2 — the build protocol

**This file is not the spec.** `.scratch/pfc-control-0.2/BUILD-PLAN.md` is the spec,
and it is LOCKED. This file holds only the things the plan does not: how to run the
build across many sessions, where the code lives, how it reaches Miguel's phone, and
when a step counts as done.

**Where this file and the build plan disagree about *what* to build, the plan wins.**
Where they disagree about *how to run the build*, this file wins. Nothing here
restates the plan.

Written 2026-08-08, after ticket 09 closed the 0.2 wayfinder map.

---

## 0. Read order for a cold session

1. `CLAUDE.md` — loads by itself. The standing constraints. Read the do-not-touch list.
2. This file.
3. `.scratch/pfc-control-0.2/BUILD-LOG.md` — **where the build actually is.** Last
   entry first. Do not guess from the git log.
4. `.scratch/pfc-control-0.2/BUILD-PLAN.md` — **section 11, then only the sections
   your step names.** Section 6 says which those are.

**Do not read the plan whole.** It is 1,343 lines, and reading it cold costs about a
third of a session before a line of work gets done. Changed 2026-08-08, after the
step 1 test round: the log entry plus the step's own sections carries everything a
session needs.

**Section 11 stays mandatory, whatever the step.** It lists about fifty ideas that
were proposed, argued and turned down, and each one is the obvious idea you will have
at the moment you reach that code. It is 80 lines. It is the cheapest thing in the
file and the one that saves the most work.

---

## 1. Where the code lives

The build runs on a branch named `0.2`, cut from `main`.

```
git checkout -b 0.2 main
```

- **`main` keeps serving working 0.1.2 the whole time.** Miguel uses the tracker.
  A half-finished step must never break it.
- Commit on the branch as often as it takes. A broken branch mid-step is fine.
- **Merge to `main` only at a step end**, when that step is ready to test. GitHub
  Pages serves from `main`, so that merge is what puts the new code on his phone.
  The merge is the handoff — see section 5.
- Push the branch after every session, so nothing lives only on this machine.

---

## 2. The token cap

Miguel's plan has a five-hour usage window. This build will cross several of them,
and a session will get cut mid-step. Assume it happens without warning.

**Reserve budget for the landing.** Roughly the last 15k tokens of a session are for
committing, writing the log entry, and saying where things stand. Do not spend them
on code.

**Stop at a coherent point, even if the window has room left.** Coherent means:

- The branch opens in a browser without a blank crash.
- No half-written function, no import pointing at something that does not exist.
- Every file you touched is saved and committed.

**Never start a change you cannot finish in the budget you have left.** Pick the next
smallest piece instead, or stop.

**Before the session ends, always:**

1. `git add -A && git commit` on the `0.2` branch.
2. `git push origin 0.2`.
3. Append an entry to `BUILD-LOG.md` — see section 7.

The status line already enforces a 150k budget per session, well inside the window.
Treat that as the real ceiling.

---

## 3. The deploy loop

Miguel gave full control of the Control script deploy on 2026-08-08: "this will go on
for a while and I don't want it to be interrupted because I am not present. The Live
URL is not in use atm so it does not matter." That permission covers the **Control**
script only.

### Two scripts, two folders

There are two Apps Script projects behind this repo, and each has its own
`.clasp.json` sitting next to the code it describes.

| Run clasp from | Pushes to | Rule |
|---|---|---|
| `control/appscript/` | PFC Control (`11PF1yQ7…`) | This is the one 0.2 touches. |
| `appscript/` | Camera app (`1QFDFU5w…`) | Separate system. Off limits without instruction. |
| the repo root | nothing — `Project settings not found.` | Correct. Leave it that way. |

`clasp` reads the nearest `.clasp.json`, walking up the folder tree until it finds
one. Until 2026-08-08 the camera app's config sat at the **repo root**, so any clasp
command run from the root pushed 0.2 code into the camera app's script. Miguel had it
moved down into `appscript/` on that date. **Do not put a `.clasp.json` back at the
repo root.**

Both config files are gitignored — `.gitignore` holds the single line `.clasp.json`,
which matches at every level. They exist only on Miguel's machine. A fresh clone has
neither, and `clasp push` will fail until they are recreated from the ids in this
table.

**Run every 0.2 clasp command from inside `control/appscript/`.**

### The commands

```
cd control/appscript
clasp push -f
clasp create-version "0.2 step N"          # prints the new version number
clasp redeploy -V <number> -d "0.2 step N" AKfycbzo9lCHMaxDqMEk6PPZouUWXG6dDeAMh3tHI0dtYExjCYE9DYDdT4vj8_YCrtnGjv5e
```

That deployment id is the existing versioned web app, currently at version 1. Updating
it keeps the URL. **Never run `clasp create-deployment` / `clasp deploy`** — that mints
a new URL, and the app on Miguel's phone points at the old one.

Verified working 2026-08-08: clasp 3.3.0, authenticated, two deployments listed, and
`clasp show-file-status` correct from both script folders and failing at the root.

Version descriptions read `0.2 step N`. Not `v2`, not `v1.1`. The existing description
reads "PFC Control v1" because it predates the version rule in `CLAUDE.md`.

---

## 4. `CACHE_NAME` during the build, not only at the release

`control/sw.js` holds `CACHE_NAME`. A phone keeps serving the old cached files until
that string changes. This is the whole reason 0.1.2 exists.

**Bump it on every merge to `main`**, not once at the end:

```
pfc-control-0.2-step1
pfc-control-0.2-step2
…
pfc-control-0.2          ← the release, per plan section 9
```

If Miguel reports that nothing changed on his phone, this is the first suspect, before
any code.

---

## 5. When a step is done, and when a test round happens

Code written is not done. A step is done when all five of these are true:

1. The step's work from plan section 6 is complete on the `0.2` branch.
2. `CACHE_NAME` is bumped to `pfc-control-0.2-stepN`. **Only when a file the phone
   downloads has changed.** A backend-only step changes nothing behind the Service
   Worker, and bumping then makes every phone re-download an identical app. Say in
   the log which way you went and why.
3. The branch is merged to `main` and pushed.
4. `clasp push` and `clasp redeploy` have run, so the backend matches the front end.
5. A smoke check: the app opens, the screen the step touched draws, and nothing
   throws. Minutes, in the session you are already in. Not a test round.

### Two test rounds, not six

**Changed 2026-08-08.** The original plan was six rounds, one per step. Step 1's
round used a whole five-hour window on its own, and Miguel called it: the build
cannot cost three days of windows.

The argument that set where the two rounds land: every defect in 0.2 is something
you can see and correct — a wrong pill, a bad colour, a screen that draws late —
**except a broken save queue**, which takes a record typed on site and silently
drops it. That one is found weeks later, when the door does not get ordered, and a
patch cannot bring the data back.

| After | Round |
|---|---|
| Step 3 — save-batch, the outbox, the pending state | Full round. This is the gate. |
| Step 6 — 0.2 FINAL | Full round, every step's list from plan section 6. |
| Steps 1, 2, 4, 5 | Smoke check only. Ride to the next round. |

**Claude runs the rounds, not Miguel.** Step 1 proved it works: twelve tests driven
in Chrome, one real defect found, fixed, redeployed and retested, with no window
spent on his side. Hand him a list only for what a browser cannot do — a real phone,
airplane mode on a job site, PLAN CALL 3.

**Do not start the step after a gate before that round reports back.** Steps 4 and 7
do not exist; the gates are step 3 and FINAL. Everywhere else, keep building.

### Keeping a session cheap

Step 1's round cost what it did for two reasons, both avoidable:

- **Reading the plan cold.** Fixed by section 0 above.
- **Screenshots.** Driving Google Sheets means looking at pictures, and pictures are
  the most expensive thing in a session. Steps 2 to 6 deliver **app screens**, which
  `get_page_text`, `read_page` and `javascript_tool` assertions read as text for a
  fraction of the cost. **Spend a screenshot on colour and layout. Nothing else.**
- Batch browser actions with `browser_batch`. One round trip, not eight.

---

## 6. Stop and ask

- **PLAN CALL 3, at step 4.** Save is pinned to the bottom of the Logger form. It
  needs one look at his phone. Nothing before step 4 depends on it.
- **Anything the plan does not cover.** Check plan section 11 first — it may already
  be there, rejected, with the reasoning in a named ticket. Do not re-argue a rejected
  option without reading that ticket.
- **A framework or a build tool.** Propose it with what it solves, what it costs, and
  what breaks if it is removed. Never add one quietly. The auto version-stamp step is
  a known candidate, named in plan section 9 and in `CLAUDE.md`.
- **The escape hatch.** If Admin cannot do something and a Sheet needs hand-editing,
  ask first, then write down exactly what changed, then fix Admin.
- **Anything touching the camera app.** `Hub/Log/*` and `appscript/Code.js` are off
  limits without explicit instruction, and the two systems do not share code.

---

## 7. The build log

Path: `.scratch/pfc-control-0.2/BUILD-LOG.md`. One entry per session, newest at the
bottom. It is the only thing that survives a context loss, so write it as if the next
session knows nothing.

```markdown
## Session N — YYYY-MM-DD

**Step:** 3, part way
**Branch:** 0.2 at <short sha>
**Deployed:** yes / no — version <n>
**Merged to main:** no

**Landed:** what actually works now.
**Not landed:** what is started and unfinished, and exactly where.
**Tested:** what Miguel ran, and what he said.
**Open:** anything that needs a decision, or a question for Miguel.
**Next:** the first thing the next session should do.
```

`Not landed` is the important line. Be specific — file and function, not "working on
the outbox".
