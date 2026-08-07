# CLAUDE.md — PFC Repo Context

This file gives Claude Code persistent context for this repo. Read it before making changes.

---

## Writing Standard

Write all prose in ASD-STE100 Simplified Technical English. This applies to documentation, READMEs, commit messages, code comments, and UI text. It does not apply to code syntax or variable names.

Rules:
- Short sentences. One instruction per sentence.
- Active voice. Name the actor.
- No contractions.
- Plain common words over jargon, where a plain word exists.
- No stacked auxiliaries or filler phrases.
- No marketing adjectives.

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

This repo holds two independent systems. Do not let them share code, Apps Script deployments, or Drive folders unless explicitly told to.

### System 1 — Camera App (live, in daily use by the crew)

Purpose: crew photographs the physical checklist sheet taped to each unit door. Photo uploads to Google Drive, auto-sorted by job/floor/unit.

**Do not modify these files without explicit instruction:**
- `Hub/Log/index.html`
- `Hub/Log/app_v1.html`
- `Hub/Log/app_v2.html`
- `Code.gs`
- `upload.html`

Path note: in this repo `Code.gs` is the file `appscript/Code.js`, tracked with `.clasp.json` and `appscript/appsscript.json`. `upload.html` is not in this repo. It exists only inside the live Apps Script project.

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
3. **Offline-aware.** Job sites have unreliable signal. Every fetch call must fail gracefully, never crash blank. Data edits (from v2 onward) queue locally and sync when signal returns, with a visible pending state — never a silent optimistic save that can lose data.
4. **Many doors, one system.** Different users reach the same data through different views. Do not duplicate data per view.
5. **Expect frequent change.** Miguel will request many incremental changes over time. Favor small, separate files over large ones. Comment clearly.

---

## Status Values (PFC Control)

**v1 shipped five statuses in one field. v2 splits them into two things.** The
reason: an item can be complete work with an outstanding problem — all six doors
hung, one on order. One field cannot hold both facts.

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

`On Hold` was renamed **Waiting** in v2, so `In Progress · Waiting on Painters`
reads without contradiction.

Rollup, worst wins: a Deficiency flag anywhere beats a Waiting flag, which beats
the worst progress value.

**The rollup rule is under review.** The v1 order made a unit with 17 Complete
items and 1 Not Started item read "Not Started", which hides a nearly finished
unit. See `.scratch/pfc-control-v2/issues/11-rollup-rules.md`.

v1 code still holds the old model: `STATUS`, `CYCLE` and `ROLLUP_ORDER` in
`control/shared/common.js`, and `buildRollupFormula` in
`control/appscript/Code.js`.

---

## Roadmap Summary (PFC Control)

- v1: Admin (create/edit project structure) + Tracker (read-only view). Service Worker shell caching. **Shipped.**
- v2: Status editing with offline queue-and-retry sync, **plus structured deficiency entry**, which moved up from v3.
- v3: Crew access — Google login, who changed what, and a lock per project instead of one lock for the whole script.
- v4: QR-based Log/Status menu for trades and GCs, bridging to the camera app's existing QR system.
- v5: PDF export, material order summaries.

Two scope moves were made on 2026-08-06, both for the same reason: building the
save path around free text first means building it twice.
- Structured deficiency entry moved from v3 into v2.
- The offline queue stayed in v2 rather than sliding to v3.

Deficiency records dropped the sub-item level and the photo. One record is one
problem and one needed line, with a count.

**v2 is being planned on a wayfinder map at `.scratch/pfc-control-v2/map.md`.**
Read that map before any v2 work. Pushed-back work is listed in
`.scratch/v3-backlog.md`.

Do not build ahead of the current version without explicit instruction. Do leave clean extension points for the versions above.

---

## Technical Constraints (both systems)

- No frameworks. Vanilla HTML, CSS, JavaScript.
- No build tools. Must run by opening directly or serving from GitHub Pages.
- Mobile-first. iOS Safari is the primary browser for the camera app. iOS/Android PWA is the primary target for PFC Control.
- Every fetch call must fail gracefully with a clear message. Never a blank crash.
