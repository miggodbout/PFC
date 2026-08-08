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
4. `.scratch/pfc-control-0.2/BUILD-PLAN.md`, whole, then its own read order in its
   section 0.

Section 11 of the plan is not optional. It lists about fifty ideas that were proposed,
argued and turned down. Each one is the obvious idea you will have at the moment you
reach that code.

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

## 5. When a step is done

Code written is not done. A step is done when all six of these are true:

1. The step's work from plan section 6 is complete on the `0.2` branch.
2. `CACHE_NAME` is bumped to `pfc-control-0.2-stepN`.
3. The branch is merged to `main` and pushed.
4. `clasp push` and `clasp redeploy` have run, so the backend matches the front end.
5. Miguel has been handed that step's test list, copied out of plan section 6 as a
   checklist he can tick, with anything he needs (a phone, airplane mode, the Sheet
   open on a computer) stated up front.
6. He has reported back, and every failure is fixed.

Six test rounds, one per step. He chose that over banking them, so that a failure
points at one step of code.

**Do not start step N+1 before step N reports back.** If waiting, write the log entry
and stop.

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
