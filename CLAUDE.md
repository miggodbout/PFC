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

Miguel Godbout. Finish carpenter at Premier Finish & Construction (PFC), Moncton, New Brunswick. Not a formal foreman, but manages field tracking by choice. Early in his coding experience — write clear, commented, modular code. Explain non-obvious decisions in comments.

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

Backend: Google Apps Script, deployed as a web app. Redeploy via Manage Deployments → pencil icon → New Version. Never create a new deployment — the URL is embedded in printed QR codes on physical sheets and cannot change.

Branding: dark theme, accent color `#C4814E`, Arial font.

### System 2 — PFC Control (new, in active development)

Purpose: Miguel's structured deficiency and progress tracking tool. Solves a different problem than the camera app — fast, glanceable, per-unit status lookup, instead of photo documentation.

Location: `PFC/control/`

Structure:
```
PFC/control/
  index.html          — Hub home (grid of feature cards)
  manifest.json
  shared/               — theme, logo, shared JS
  tracker/               — view project status (Tracking → Building → Floor → Unit)
  admin/                  — unlisted, create/edit project structure
```

Backend: separate Google Apps Script project from `Code.gs`. Do not merge them.

Data: one Google Sheet per project (building), generated from a master template.
- Local reference copy: `PFC/reference/PFC_Master_Template.xlsx`
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

Used at the item level, and rolled up at the phase and unit level:

| Status | Meaning |
|---|---|
| Not Started | Default, nothing done |
| In Progress | Work underway |
| Complete | Done, no issues |
| Deficiency | Wrong, missing, or damaged |
| On Hold | Missing or paused (e.g., awaiting materials) |

Rollup logic, worst status wins, in this order: Deficiency > On Hold > In Progress > Not Started > Complete.

---

## Roadmap Summary (PFC Control)

- v1: Admin (create/edit project structure) + Tracker (read-only view). Service Worker shell caching.
- v2: Status/detail editing in Tracker, with offline queue-and-retry sync.
- v3: Structured deficiency entry (item → sub-item → received/needed → optional photo).
- v4: QR-based Log/Status menu for trades and GCs, bridging to the camera app's existing QR system.
- v5: PDF export, material order summaries.

Do not build ahead of the current version without explicit instruction. Do leave clean extension points for the versions above.

---

## Technical Constraints (both systems)

- No frameworks. Vanilla HTML, CSS, JavaScript.
- No build tools. Must run by opening directly or serving from GitHub Pages.
- Mobile-first. iOS Safari is the primary browser for the camera app. iOS/Android PWA is the primary target for PFC Control.
- Every fetch call must fail gracefully with a clear message. Never a blank crash.
