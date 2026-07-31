# PFC Control — Build Prompt for Claude Opus 5 (Claude Code)

Read this entire document before you write code. It gives you the full project scope, not just the v1 task list. Build v1 only, but structure the code so v2 through v5 can attach without rewrites.

Reference files (local, read these before coding):
- `reference/PFC_Master_Template.xlsx` — the exact Sheet structure, formulas, and formatting to replicate
- `assets/Logo Placeholder.png` — app icon (placeholder, will be swapped later)
- `reference/design-handoff/` — a working visual and interaction prototype, exported from Claude Design. **Read `reference/design-handoff/README.md` first.** It is written directly for you, a coding agent, and explains how to use the bundle. Then read `reference/design-handoff/project/PFC Control.dc.html` in full, followed by its imports (`support.js`, `ios-frame.jsx`). This prototype is the authoritative source for visual design, colors, spacing, and interaction behavior — where it conflicts with a written description elsewhere in this document, the prototype wins. Recreate it in this project's vanilla HTML/CSS/JS stack; do not copy its internal component structure, only its visual output and behavior.

---

## 1. The Problem

Miguel Godbout is a finish carpenter, not a foreman by title, at Premier Finish & Construction (PFC) in Moncton, New Brunswick. He tracks deficiencies and progress across hundreds of apartment units by himself, using a notes app and memory. This causes two problems:

1. He forgets which unit had which issue, so he re-checks units he already checked.
2. He has no fast way to view status at the building level or the single-unit level.

The physical checklist sheet (taped to unit doors, already in production) holds good data, but the crew does not update it consistently, and it is not searchable.

PFC Control solves this. It gives Miguel a fast, trustworthy, glanceable view of every unit's status, built on structured data instead of notes and memory.

---

## 2. Who Uses This

| User | Role | Need |
|---|---|---|
| Miguel | Primary user, manages tracking by choice (no formal title) | Fast lookup, at-a-glance status, confidence the data is current |
| The Boss | Handles big-picture project management | Same tracking, different focus area |
| 2 Senior Carpenters | Crew, no hierarchy | May contribute data later (v2+), not in v1 |
| GCs | 2 on the current site, about 4 more across other jobs | Status visibility (future version) |
| Painters | Primary trade contact | Needs to know if a unit is ready, and why not, plus a way to flag urgent needs (future version) |
| Flooring, Electricians, Laborers | Other trades | Status visibility, notified when PFC's work is done (future version) |

V1 serves Miguel only. Build the data model so other roles can be added later without restructuring.

---

## 3. Where and When

- Current site: one of three 36-unit apartment buildings, in beta.
- Near future: townhouses in the same development (4-6 unit multiplexes).
- Longer term: other jobs across Greater Moncton.
- Work happens 8am-4pm on site. Miguel does tracking admin after 4pm.
- Buildings vary in shape: some are floors of numbered units (101-112, 201-212...), others are flat multiplexes with no floor structure and addresses that are not always known yet. **The system must support both without code changes per building.**

---

## 4. Design Principles

Apply these while coding:

1. **Config drives structure, not code.** Never hardcode a floor count, unit count, or item list. Every building's shape and item list comes from data created in Admin.
2. **Structure changes go through Admin only.** Adding/removing a unit or item happens in the Admin UI, never by editing the Sheet directly. This keeps the Sheet's shape predictable and prevents silent breakage.
3. **The Sheet is a data surface, not a schema editor.** Once created, cell values (status, notes) may be edited directly in Google Sheets and will show in the app on next load. Columns and rows do not change from the Sheet side.
4. **Many doors, one system.** Different users (Miguel now, others later) reach the same underlying data through different views. Don't duplicate data per view.
5. **This codebase will change often.** Miguel is non-technical and will request many incremental changes. Write clear, commented, modular code. Prefer small separate files over one large file.

---

## 5. Full Roadmap (context only — build v1)

Knowing the destination prevents v1 from blocking later work.

- **v1 (build now):** Admin Panel (create/edit project structure, reachable as a Hub home card) + Tracker (browse the hierarchy, view status and details per item). The status dropdown and details field are visually present and tappable, matching the prototype, but are **not wired to save** — selections are local-only and reset on reload. Built on a Service Worker that caches the app shell.
- **v2:** Wire up the status dropdown and details field to actually save. Edits queue locally and sync when a connection is available, with a visible pending-sync state — never a silent optimistic save. Builds on the Service Worker shell caching from v1.
- **v3:** Structured deficiency entry (item → sub-item → received/needed → optional photo), separate from the existing camera app's sheet-photo flow.
- **v4:** QR-based two-option menu (Log / Check Status) for trades and GCs, with a simplified public status view. Bridges to the existing camera app's QR system.
- **v5:** PDF export of deficiencies, material order summaries.

Do not build v2-v5 now. Leave clean extension points (see Section 9 for exactly where).

---

## 6. Existing System — Do Not Touch

A separate, live system already exists in this repo. Crew uses it daily. Do not modify, rename, or move any of these:

- `Hub/Log/index.html`
- `Hub/Log/app_v1.html`
- `Hub/Log/app_v2.html`
- `Code.gs` (its Apps Script deployment)
- `upload.html`

PFC Control is a new, separate system living at `PFC/control/`. It uses its own Apps Script project. It does not read or write anything the camera app touches.

---

## 7. V1 Scope

**Build:**
- Admin Panel: create a new project (building), define its structure and item list, edit that structure later. Reachable as a card on the Hub home screen.
- Tracker: browse Tracking (project list) → Building → Floor (if applicable) → Unit. View status and details per item. The status dropdown and details field are visually functional (tappable, open, show options) matching the prototype, but **do not persist** — no write to the Sheet happens in v1. Selections reset on page reload. This is intentional: it lets the UI match the design exactly now, while the actual save logic (with offline queue) is built in v2.
- Google Sheet auto-generated per project, based on the master template.
- PWA install support (manifest, icon, dark theme).
- Service Worker, caching the app shell (HTML, CSS, JS, icon) so the app opens even with no signal on site. This is foundational — build it now, even though v1 has no offline writes yet. v2's queue-and-retry sync will build on top of this.

**Do not build in v1:**
- Any actual saving of status/detail edits (v2).
- Structured deficiency entry forms (item → sub-item → received/needed → photo).
- QR code integration or public status views for trades/GCs.
- PDF export.
- Light mode (dark mode only for now).

---

## 8. Repo Structure

The repo root is already `PFC/`. Paths below are relative to that root — do not add a redundant `PFC/` prefix inside them.

```
control/
  index.html          — Hub home. Grid of cards: "Tracking" and "Create Job" for v1, more cards later without restructuring.
  manifest.json        — PWA manifest
  shared/
    theme.css          — dark theme, PFC Control branding (see Section 12)
    logo.png            — copy of assets/Logo Placeholder.png
    common.js           — shared fetch/render helpers used by tracker and admin
  tracker/
    index.html          — Tracking list (all projects)
    building.html        — Building view (floors or flat unit list, depending on project mode)
    unit.html             — Unit view (items grouped by phase, status + details; dropdown/edit UI present but non-persisting in v1)
  admin/
    index.html            — project creation and structure editing. Reachable from Hub home.
```

Apps Script project: create a new, separate Apps Script deployment for PFC Control. Do not extend `Code.gs`.

---

## 9. Data Layer

**Storage:** Google Sheets, one Sheet per project (building), auto-generated on creation.

**Master template:** Lives in Google Drive at `PFC/Master Template/PFC_Master_Template.xlsx`. Two tabs: `Dashboard` and `Unit Tracker`. Read the local copy at `PFC/reference/PFC_Master_Template.xlsx` to learn its exact columns, formulas, and formatting before writing any Apps Script generation code.

**New project Sheets:** On project creation, Apps Script duplicates the master template, renames it to the project's name, and writes the correct number of unit rows and item columns for that project's configuration. Save these to a `PFC/Projects/` Drive folder (create this folder if it does not exist; flag its folder ID clearly in the code as a constant, since Miguel may want to move it later).

**Structure of the Sheet (already defined in the template, replicate exactly):**
- `Unit Tracker` tab: one row per unit. Columns: Floor, Unit #, then per enabled item: a Status column (dropdown: Not Started / In Progress / Complete / Deficiency / On Hold) and a Details column (free text). Items are grouped under merged phase headers. Four rollup columns follow (Phase 1 Status, Phase 2 Status, Phase 3 Status, Other Status), each a formula returning the worst status among that phase's items for the row. Then Last Updated and Overall Status (formula, worst of the four rollups).
- `Dashboard` tab: per-phase counts of units (not items) in each status, out of the total unit count. Pulls from the four rollup columns, not individual item columns.

**Apps Script functions needed (v1):**
- `doPost`, action `create-project`: takes project name, mode, floor/unit config, item selections; duplicates template; builds correct rows/columns; returns the new Sheet's ID and URL.
- `doPost`, action `update-structure`: adds or removes an item column, or adds/renames a unit row, on an existing project's Sheet. Structure only — never touches status/detail values.
- `doGet`, action `list-projects`: returns all known projects (name, mode, Sheet ID).
- `doGet`, action `get-structure`: returns a project's floors/units/items, for rendering Tracker views.
- `doGet`, action `get-unit`: returns one unit's full item list with current status/details.

Not needed in v1, planned for v2: a `doPost` action `update-item`, writing a single item's status and/or details for one unit. Must be idempotent (safe to call repeatedly on retry) once built.

Data does not need to auto-refresh. Reloading the page to see Sheet edits is acceptable for v1.

---

## 10. Admin Panel — Detailed Spec

Reachable as a card on the Hub home screen (labeled "Create Job"), matching the design prototype. Also reachable by direct URL.

**Create new project form:**
1. **Project name / address.**
2. **Mode select**, two options:
   - **Mode A — Floors + Units:** enter floor count and units per floor. Auto-generates unit numbers as `floor*100 + position` (matches existing convention: 101-112, 201-212...).
   - **Mode B — Flat list:** enter a unit count only. Units are placeholder-labeled ("Unit 1", "Unit 2"...) and can be renamed individually later, since exact addresses are often unknown at creation time.
3. **Item template**, pre-loaded with the standard list below (Section 11), shown with checkboxes to include/exclude each item per phase. Also allow adding a custom named item under any phase (goes in as an "Other"-style column).
4. **Submit** creates the Sheet via Apps Script and confirms with a link.

**Edit existing project (v1, structure only):**
- Add/remove an item (adds/removes a Status+Details column pair, keeping existing data in other columns intact).
- Add a unit, or rename a unit's label (Mode B).
- No status/detail editing here — that happens in Tracker's Unit view, not Admin's job.

---

## 11. Item Template (standard defaults, all editable per project)

The design prototype (Section reference at the top of this document) uses this exact list. Follow it, with two open questions flagged below.

**Phase 1 — Doors & Windows**
Interior Doors, Exterior Door(s), Unit Door (rare), Windows, Attic Hatch (~50% of buildings), Handrail (rare)

**Phase 2 — Baseboards**
Cut, Nailed

**Phase 3 — Hardware & Accessories**
Passage, Privacy, Dummy, Ball Catch, Deadbolts, Spring Stops, Hinge Stops, Mirrors, Bathroom Accessories

**Other**
Free-text, added per project as needed, per phase, through the Admin form (matches the prototype's "Add custom item" flow under each phase). "Firesweep / Peephole / Spring" (rare, unit doors only) is intentionally left out of the coded defaults — add it per project via "Other" when it applies.

Every item gets its own Status (5-value dropdown) and Details (free text) column when enabled. No item is hardcoded into the app's logic — the app reads whatever the project's Sheet contains.

---

## 12. Status System

Five values, used everywhere (item-level, phase rollup, overall):

| Status | Meaning |
|---|---|
| Not Started | Default state, nothing done yet |
| In Progress | Work underway |
| Complete | Done, no issues |
| Deficiency | Wrong, missing, or damaged — needs a fix |
| On Hold | Missing (e.g., awaiting materials) or otherwise paused |

**Rollup logic (already in the template's formulas, replicate in any app-side calculation too):** worst status wins. Priority order, worst to best: Deficiency > On Hold > In Progress > Not Started > Complete (i.e., if any item is a Deficiency, the phase/unit shows Deficiency; if none are Deficiency but any are On Hold, it shows On Hold; and so on. Complete only shows when every item is Complete).

**Colors** (exact values from the design prototype — use these, not approximations):
- Not Started — dot `#8A8A8E`, text `rgba(255,255,255,0.75)`, background `rgba(255,255,255,0.08)`
- In Progress — dot/text `#E0A344`, background `rgba(224,163,68,0.16)`
- Complete — dot/text `#4CAF6D`, background `rgba(76,175,109,0.16)`
- Deficiency — dot `#E85C5C`, text `#F08080`, background `rgba(224,82,82,0.18)`
- On Hold — dot `#6C9CFF`, text `#8CB0FF`, background `rgba(91,141,239,0.18)`

**Interaction:** tapping a status badge opens a dropdown of all 5 options (see the prototype's `CYCLE` list and status-dropdown behavior). Tapping "Details" opens an editable text field. In v1, both are fully interactive visually but **do not save** — selections reset on reload. Wire up actual persistence in v2 (see Section 5).

---

## 13. Branding & PWA

PFC Control is visually related to the existing camera app but distinct, not identical — this is intentionally a separate tool.

- **App name:** PFC Control
- **Theme:** dark mode only for v1 (light mode is a future toggle, do not build it now)
- **Background:** match the existing camera app's dark tone (`#0D0D0D` family)
- **Accent color:** `#DE7452` (primary), `#A47263` (secondary/darker variant) — distinct from the camera app's `#C4814E` gold, so the two tools are visually distinguishable while staying in the same brand family
- **Font:** Arial, matching all existing PFC documents
- **Icon/logo:** `assets/Logo Placeholder.png` — this is a known placeholder, low-res pixel art. Reference it as-is; do not attempt to enhance or regenerate it.
- **Manifest:** installable on iOS and Android as a home-screen PWA. This is the primary intended usage — design mobile-first, prioritize touch targets and small-screen layouts over desktop.
- **Offline shell:** register a Service Worker on first load, caching the app's HTML, CSS, JS, and icon. The app must open with no network signal, even though data fetches will fail gracefully until signal returns (see Section 9). Note: iOS Safari may clear a PWA's cache after roughly 7 days of no use — acceptable for daily use, but do not assume the cache is permanent.

---

## 14. Writing Standard

All text you write — README, code comments, UI labels, error messages, commit messages — must follow ASD-STE100 Simplified Technical English. Short sentences. Active voice. One instruction per sentence. No contractions. Plain common words over technical jargon where a plain word exists. This applies to prose you write, not to code syntax or variable names.

---

## 15. Technical Constraints

- No frameworks. Vanilla HTML, CSS, JavaScript, matching the existing camera app's approach.
- No build tools. Must run by opening directly or serving from GitHub Pages.
- Mobile-first (iOS/Android PWA is the primary target, not desktop browser).
- Every fetch call must fail gracefully — job site connectivity is unreliable. Show a clear "unable to load" state, never a blank crash.
- Comment code clearly. Miguel will read and modify this himself over many future sessions, and he is early in his coding experience.
- Keep Admin, Tracker, and shared logic in separate files (see Section 8). Do not merge them into one large file.

---

## 16. Deliverables

Output every file complete. No placeholders, no TODOs, no "add this later" comments in place of real code.

1. `control/index.html`
2. `control/manifest.json`
3. `control/shared/theme.css`
4. `control/shared/common.js`
5. `control/tracker/index.html`
6. `control/tracker/building.html`
7. `control/tracker/unit.html`
8. `control/admin/index.html`
9. New Apps Script project source (all functions from Section 9)
10. Short `control/README.md` — one page, explains the folder structure, the Apps Script deployment steps (matching the existing "Manage Deployments → pencil → New Version" pattern Miguel already uses), and where the Drive folders live.

If you cannot complete everything in one pass, finish in this order and stop cleanly: Apps Script backend → Admin Panel → Tracker views → Hub home → manifest/PWA polish → README.
