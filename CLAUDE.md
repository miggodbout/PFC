# CLAUDE.md — PFC Repo Context

This file gives Claude Code persistent context for this repo. Read it before making changes.

---

## Writing Standard

**UI text follows ASD-STE100 Simplified Technical English.** Every word the crew reads on a screen obeys these rules. A worker reads his phone in bad light, in a hurry, wearing gloves. Ambiguity costs him time.

- Short sentences. One instruction per sentence.
- Active voice. Name the actor.
- No contractions.
- Plain common words over jargon, where a plain word exists.
- No stacked auxiliaries or filler phrases.
- No marketing adjectives.

This does not apply to code syntax or variable names.

**Everything else — documentation, comments, commit messages, chat — is written plainly, not formally.** The goal is no filler, not stiffness. Contractions are fine. Cut marketing adjectives, hedging, padding, and restated points. Say a thing once and move on.

---

## Repo Owner

Miguel Godbout. Finish carpenter at Premier Finish & Construction (PFC), Moncton, New Brunswick. Not a formal foreman, but manages field tracking by choice.

Pitch explanations to this level:

- **Strong with computers.** He works in Windows down to the registry, in CMD, and with self-hosted servers. He deduces technical causes well. Do not explain computers to him.
- **He writes no code.** He reads no JavaScript. He can often deduce what a line does, but not reliably.
- **So: define coding terms when you use them.** This includes dev-workflow terms — branches, deployments, OAuth, CORS. Explain the intent and the non-obvious parts, then trust him to follow the rest. Do not narrate every line.
- **He wants to learn, but the launch comes first.** Teach in passing while you build. Do not stop the work for a lesson. Do not pad an answer with background he did not ask for.

Write clear, commented, modular code. Explain non-obvious decisions in comments.

---

## Two Separate Systems in This Repo

This repo holds two independent systems. Keep them separate until a roadmap milestone bridges them on purpose — the QR Log/Status menu is that planned bridge. Until then, do not share code, Apps Script deployments, or Drive folders unless told to.

### System 1 — Camera App (live, in daily use by the crew)

Purpose: crew photographs the physical checklist sheet taped to each unit door. Photo uploads to Google Drive, auto-sorted by job/floor/unit.

Status: live, but Miguel expects to scrap or rebuild it. Ask before any large work on it.

**Do not modify these files without explicit instruction:**
- `Hub/Log/index.html`
- `Hub/Log/app_v1.html`
- `Hub/Log/app_v2.html`
- `appscript/Code.js` — the Apps Script project calls this file `Code.gs`. It is tracked with `.clasp.json` and `appscript/appsscript.json`.

`upload.html` is part of the live camera app but is not in this repo. It exists only inside the Apps Script project. Do not look for it here.

Backend: Google Apps Script, deployed as a web app. Redeploy via Manage Deployments → pencil icon → New Version. Never create a new deployment — the URL is embedded in printed QR codes on physical sheets and cannot change.

Branding: dark theme, accent color `#C4814E`, Arial font.

### System 2 — PFC Control (new, in active development)

Purpose: Miguel's structured deficiency and progress tracking tool. Solves a different problem than the camera app — fast, glanceable, per-unit status lookup, instead of photo documentation.

Location: `control/` at the repo root.

Structure:
```
control/
  index.html          — Hub home (grid of feature cards)
  manifest.json
  shared/               — theme, logo, shared JS
  tracker/               — view project status (Tracking → Building → Floor → Unit)
  admin/                  — unlisted, create/edit project structure
```

Backend: separate Google Apps Script project from `Code.gs`. Do not merge them.

Data: one Google Sheet per project (building), generated from a master template.
- Local reference copy: `reference/PFC_Master_Template.xlsx` (repo root)
- Live template (Drive): `PFC/Master Template/PFC_Master_Template.xlsx` (ID: 1QIF5TCJ0iekpNGHEjce1PSoFXRFhucmF-ednTSYHT-M)
- Generated project Sheets (Drive): `PFC/Projects/`

Branding: dark theme, accent color `#DE7452` (primary), `#A47263` (secondary) — deliberately distinct from the camera app's gold, so the two tools are visually distinguishable.

Icon: `PFC/assets/Logo Placeholder.png` — known placeholder, low resolution. Do not attempt to enhance it. Will be replaced later.

PWA: installable on iOS and Android. Mobile-first. Service Worker caches the app shell so it opens with no signal on site.

Full build spec: see `PFC_Control_Opus5_Prompt.md` in the repo root.

---

## Core Design Principles (PFC Control)

1. **Config drives structure, not code.** Never hardcode a floor count, unit count, or item list. Structure comes from data created in Admin.
2. **Structure changes go through Admin only.** Never edit Sheet columns/rows to change structure — only through the Admin UI. Direct Sheet edits are for status/detail values only.
   **Escape hatch:** if Admin cannot do what Miguel needs, he is not stuck. Ask first, hand-edit the Sheet, and write down exactly what changed. Then fix Admin to cover that case, so the hatch is not needed twice.
3. **Offline-aware.** Job sites have unreliable signal. Every fetch call must fail gracefully, never crash blank. Data edits (from 0.2 onward) queue locally and sync when signal returns, with a visible pending state — never a silent optimistic save that can lose data.
4. **Many doors, one system.** Different users reach the same data through different views. Do not duplicate data per view.
5. **Expect frequent change.** Miguel will request many incremental changes over time. Favor small, separate files over large ones. Comment clearly.

---

## Status Values (PFC Control)

**Version 0.1 shipped five statuses in one field. Version 0.2 splits them into two things.** The
reason: `In Progress · Waiting on Painters` is two facts about one item, and one
field cannot hold both. A single field also cannot hold several problems at once,
and one item often has several, each with its own needed line and count.

An earlier draft justified the split with a different example — six doors hung
and one on order, called Complete with a flag. Miguel rejected that on
2026-08-07. An item with an open problem is not Complete. The split stands on the
two reasons above.

**Progress** — the dropdown. Always set by hand. One value per item:

| Value | Meaning |
|---|---|
| Not Started | Default, nothing done |
| In Progress | Work underway |
| Complete | The work is done |

**Flags** — never set by hand. A flag appears while an open record exists in the
Deficiencies tab, and clears when the last one is fixed:

| Flag | Meaning | Attaches to |
|---|---|---|
| Deficiency | Wrong, missing, or damaged | An item |
| Waiting | Cannot continue yet (painters, delivery, backorder) | An item or a phase |

`On Hold` was renamed **Waiting** in 0.2, so `In Progress · Waiting on Painters`
reads without contradiction.

**Rollup: worst wins is deleted.** Settled 2026-08-07 in
`.scratch/pfc-control-0.2/issues/11-rollup-rules.md`. The 0.1 order made a unit
with 17 Complete items and 1 Not Started item read "Not Started", which hid a
nearly finished unit.

The rule is now unanimity or In Progress, counted rather than ordered:

| Test | Reads |
|---|---|
| No items | A dash |
| Every item Complete, no open flag | Complete |
| Every item Complete, an open flag | In Progress |
| Every item Not Started | Not Started |
| Anything else | In Progress |

An open flag blocks Complete. It never raises Not Started. Every level also shows
a count, such as `14/18`, and both flag kinds show with their own counts. There
is no contest between Deficiency and Waiting, because neither one is a status.

**An open flag blocks Complete on an item too, not only on a rollup.** Settled by
Miguel on 2026-08-07: "Interior Doors cannot be Complete if there is a
deficiency." The dropdown does not offer Complete while an open flag of either
kind sits on that item. Fix or cancel the record first.

So the rollup's flag test only has to catch **phase-level Waiting records**. Any
flag on an item has already stopped that item from reading Complete.

**Undecided, and it matters:** what happens to an item that already reads
Complete when a flag arrives months later. That is the GC punch-list case and it
is owned by `.scratch/pfc-control-0.2/issues/16-post-completion-deficiencies.md`.

Version 0.1 code still holds the old model: `STATUS`, `CYCLE` and `ROLLUP_ORDER` in
`control/shared/common.js`, and `buildRollupFormula` in
`control/appscript/Code.js`.

---

## Version Numbers (both systems)

Use `MAJOR.MINOR.PATCH`. Never use `v1`, `v2` style names for a milestone again — a milestone is named by the version it ships as.

- **MINOR** (`0.1` → `0.2`) — a roadmap milestone. New features.
- **PATCH** (`0.1.1` → `0.1.2`) — fixes only, inside a milestone. No new features.
- **1.0** — reached when the crew uses PFC Control daily as the primary tool. It marks trust, not a feature count.

Current: PFC Control `0.1`. Camera app `0.1.2`.

`CACHE_NAME` in `control/sw.js` carries the version, as `pfc-control-0.1.0`. Raise it on every release. Phones keep serving old files until it changes.

Two exceptions, both deliberate:
- `Hub/Log/app_v1.html` and `app_v2.html` keep their names. There `v1` and `v2` mean a second attempt at one file, not a release. The live app links to them.
- The browser storage key `pfc.control.v1.local` keeps its name. It is an identifier, not a label. Renaming it would orphan changes already saved on a crew phone.

---

## Roadmap Summary (PFC Control)

- 0.1: Admin (create/edit project structure) + Tracker (read-only view). Service Worker shell caching. **Shipped.**
- 0.2: Status editing with offline queue-and-retry sync, **plus structured deficiency entry**, which moved up from 0.3.
- 0.3: Crew access — Google login, who changed what, and a lock per project instead of one lock for the whole script.
- 0.4: QR-based Log/Status menu for trades and GCs, bridging to the camera app's existing QR system.
- 0.5: PDF export, material order summaries.

Two scope moves were made on 2026-08-06, both for the same reason: building the
save path around free text first means building it twice.
- Structured deficiency entry moved from 0.3 into 0.2.
- The offline queue stayed in 0.2 rather than sliding to 0.3.

Deficiency records dropped the sub-item level and the photo. One record is one
problem and one needed line, with a count.

**Version 0.2 is being planned on a wayfinder map at `.scratch/pfc-control-0.2/map.md`.**
Read that map before any 0.2 work. Pushed-back work is listed in
`.scratch/0.3-backlog.md`.

Do not build ahead of the current version without explicit instruction. Do leave clean extension points for the versions above.

---

## Technical Constraints (both systems)

- **Default to no frameworks and no build tools.** Vanilla HTML, CSS and JavaScript. The app must run by opening a file directly, or by serving it from static hosting.
- **This is a strong default, not a ban.** If a framework or a build tool is the obvious fix for a real problem, propose it. State what it solves, what it costs, and what breaks if it is removed later. Miguel decides. Never add one quietly, and never add one for tidiness alone.
- Known candidate: raising `CACHE_NAME` in `control/sw.js` by hand is easy to forget, and stale phones are the result. A build step that stamps the version automatically would earn its place.
- Mobile-first. iOS Safari is the primary browser for the camera app. iOS/Android PWA is the primary target for PFC Control.
- Every fetch call must fail gracefully with a clear message. Never a blank crash.
