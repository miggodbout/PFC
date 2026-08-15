# The big-picture session — decisions

The four questions Miguel listed under **NEXT** in `../notes/0.2.0_bugs.md`,
worked one at a time on **2026-08-15**, before 0.3 charts.

Order taken: framework first, because it is the only one of the four with a
build-it-twice cost attached to a date. 0.3 adds more new UI than 0.2 did.

| # | Question | State |
|---|---|---|
| 1 | A frontend framework | **SETTLED** — see below |
| 2 | Voice and AI | **SETTLED** — see below |
| 3 | Sheets or a real database | **SETTLED** — see below |
| 4 | A generic, unbranded version | **SETTLED** — see below |

---

## 1 — A frontend framework. SETTLED 2026-08-15.

### The decision

**Preact + htm, vendored into the repo. No build step, no npm, no Node.**
Rolled in **one screen at a time, as 0.3 touches that screen.** The Logger goes
first. Screens 0.3 does not touch stay as they are.

**The double-click rule stays** — the app must still open by double-clicking
`control/index.html`, with no server and no internet. Miguel kept it knowingly
after it was explained, so it is now his rule and not an inherited one. It costs
nothing here: Preact + htm keeps it for free. Its only real job is to rule out a
build step.

### What lands on disk

```
+ control/shared/preact.js      one vendored file, ~12 KB
+ one line in the SHELL list in control/sw.js
```

That is all. No `package.json`, no `node_modules/`, no `dist/`. What is in the
repo is what runs on the phone.

### Why — the evidence in the shipped code

The problem is not buttons. `CLAUDE.md`'s old note said *"every button is
rewritten in each place it appears"*, and the code does not support that:
`theme.css` defines 251 classes and `common.js` already exports `pillHtml`,
`dotHtml` and `barHtml`, used across three screens.

**The problem is that every screen rebuilds itself from a string on every tap.**
`render()` sets `screen.innerHTML` to one concatenated string. Four consequences
are visible in the shipped 0.2.2 code:

1. **`control/logging/index.html:221`** — a hand-written fix for the focus bug.
   It reads `document.activeElement.id` and `selectionStart`, redraws, then puts
   both back. The comment above it says why: a queue drain redraws the screen and
   *"the Needed box loses focus mid-word and the keyboard drops on a phone —
   which, standing in a unit with gloves on, reads as the app throwing the line
   away."* A diffing library does this for free.
2. **Three places already bypass `render()`** to patch one element
   (`row.innerHTML = chips` at :777 and :838, `note.innerHTML = unitNote()` at
   :723), each with its own `else render()` fallback. That is a hand-rolled
   diffing layer, started.
3. **`placeOpenMenu()` at `control/tracker/unit.html:679`** re-measures the DOM
   after every redraw to flip a dropdown upward.
4. **42 inline `onclick=` attributes** across seven screens, every argument
   passed through `attr()` = `escapeHtml(JSON.stringify(...))`. Every handler
   must be a global function.

Plus UI state in module-level globals — `openMenu`, `openRecs`, `greenFor`,
`blockedTapped`, `fixedHere`, `storageRefused` — each reset by hand at the right
moment. 0.3 adds more of them.

### Why now and not after 0.3

0.3 is the biggest UI release so far: the History tab (new screen), three record
types (rewires the Logger, the worst offender and the one with the text box),
per-item reason lists on two screens, bulk update (new screen), and "Log issue
here" on Tracker items. Built raw and converted later, that list gets built
twice. This is the same reasoning that pulled structured deficiency entry into
0.2.

### Which screens convert, and when

| Screen | 0.3 touches it? | Convert |
|---|---|---|
| `logging/index.html` | yes — three record types | **yes, first** |
| `setup/index.html` | yes — per-item reason rows | yes |
| `tracker/unit.html` | yes — "Log issue here" | yes |
| the new bulk screen | new | born converted |
| the new History tab | new | born converted |
| `tracker/index.html` | no | leave raw |
| `tracker/building.html` | no | leave raw |
| `tracker/queue.html` | no | leave raw |
| `index.html` (Hub) | no | leave raw |

Two styles coexist in the repo during and after 0.3. That is accepted. The four
raw screens convert whenever they next need real work, not on their own release.

### What it costs, stated plainly

One piece of code in the repo that neither Miguel nor Claude wrote. Miguel reads
no JavaScript, so if Preact ever misbehaves he is relying on Claude to sort it.
He accepted that with the trade-off in front of him.

The counter-argument, for the record: **nothing on the 0.2 test-week list was
caused by raw JavaScript.** 12,040 lines is not a big app. This is a bet on 0.3
and 0.4 being bigger, not a fix for a shipped bug.

### Rejected, and why

- **No library, ~100 lines of our own plumbing in `common.js`** — delegated click
  listeners plus a `patch()` that skips unchanged HTML. Fixes the keyboard and
  the `attr()` tax, but controls still do not own their own state, so the loose
  globals stay and 0.3 adds more. It is a small framework of our own, and those
  grow.
- **Alpine.js** — no build step either, and the smallest rewrite. Rejected
  because it moves logic back into HTML attributes, and the 1,035-line Logger
  would become a wall of them. The thing that hurts today is logic stuffed into
  markup.
- **Svelte / Vue / React with a build step** — best to write in, biggest
  ecosystem. Rejected: needs Node and a build command before every push, the file
  you read stops being the file that runs, a broken build ships nothing, and it
  breaks the double-click rule. Formally proposed and formally declined, which is
  what `CLAUDE.md`'s framework clause asks for.

### Open mechanics, Claude's call, not Miguel's

- Pin the vendored Preact version and write it in a comment at the top of the
  file. Never fetch it at runtime — the Service Worker must be able to cache it.
- `common.js` stays as it is. It holds logic, not UI, and none of it changes.
  `pillHtml` / `dotHtml` / `barHtml` gain Preact twins as screens convert; the
  string versions stay while any raw screen still uses them.
- Bump `CACHE_NAME` on the push that adds the file, as always.

---

## 2 — Voice and AI. SETTLED 2026-08-15.

### The decision

**Read-only, starting now. No write path is built, and none is planned.**
Miguel uses Claude to *ask about* the buildings; the app stays the only thing
that writes. The write path gets revisited only if he finds himself repeatedly
asking Claude to change things.

Framed as **the truck and the office tool, not the gloves-on tool.** The drive
home, the morning coffee, the call with the GC.

### The pushback that set the frame

**Claude needs signal. The app does not.** The whole outbox, the queue, the
retry logic and `hasReachedServer()` exist because the hallways at Elsliger drop
the connection. In a dead hallway the app still takes an edit and holds it;
Claude cannot even hear the question. So the on-site voice-capture idea is
competing with the app on the app's strongest ground, and losing.

### Two of the three parts already existed

1. **Voice — solved, zero work.** The Claude mobile app has voice input.
2. **Reading the building — solved, zero work.** Proved live in the session: the
   Google Drive connector read the whole `Elsliger 36-B` Sheet
   (`1bddT-0WG5oyRiOAlN5wUi0U20PHjFuB3Uywfo070qio`) in one call — status grid, all
   27 Deficiency records, and the `_Config` tab. Nothing was built.
3. **Writing — the API already exists.** `handleSaveBatch` at
   `control/appscript/Code.js:639` takes a JSON list of edits over HTTP POST, and
   `control/appscript/appsscript.json` sets `"access": "ANYONE_ANONYMOUS"`.
   Anything that can POST can already drive PFC Control. What is missing is only
   a way for the **Claude app** — as opposed to Claude Code on this machine — to
   make that POST.

### Rejected, and why

- **An MCP connector served by the Apps Script backend.** Would give Claude real
  tools routed through the same validation, lock and cache-clear the app uses.
  Rejected for now: ~200–300 lines in `Code.js`, a real unknown about whether the
  Claude app tolerates the Apps Script redirect, and it widens what an
  unauthenticated URL can do. Reversible — nothing about 0.3 blocks it.
- **Claude Code with a plain HTTP call.** Works today with zero work. Not a
  phone-in-a-hallway tool, and Miguel has never reached for it.
- **A mic button inside the app.** The only offline option, and he ruled it out
  for a first version. It needs iOS speech recognition inside an installed PWA
  (flaky, and still wants signal for the good engine) plus something to turn
  words into a scope — a fragile parser, or an API key on a phone. **This is a
  1.0 conversation.**

### It constrains nothing in 0.3

`save-batch` is already the machine-callable write API. Bulk scope expansion
stays client-side; anything driving the app from outside can expand a scope
itself and post the resulting jobs. **No seam needs leaving open for this.**

### What the read-side demo proved, beyond "it works"

Building the Elsliger material order by hand from the 27 records surfaced the
0.3 argument on live data:

- **24 open, 3 fixed.**
- Nine line items have a real size or part: `36 8 RH` ×2, `36 4 5/8` ×2,
  `30 slab` ×2, `36 6 7/8 LH`, `16 6-7/8 LH`, `32 6 LH`, `72 4`, a ball catch,
  a passage handle.
- **Six line items say "go measure it"** — three records read `Install Bypass
  slabs` with no size, because `needed` was required and there was nothing else
  to put there.
- `Adjust`, `Flip Privacy` and `1 piece unnailed` sit in the same column as
  `36 8 RH`. **One column holds "what to buy" and "what to redo" at once.** That
  is the split 0.3 makes.

**Also worth recording:** most of the 0.5 PDF export is this grouping, and the
grouping only becomes easy after 0.3 separates the record types.

---

## 3 — Sheets or a real database. SETTLED 2026-08-15.

### The decision

**Stay on Google Sheets. Change only how the phone READS.** Reads go straight to
the Sheet, skipping Apps Script. Writes keep going through `save-batch`,
unchanged. **No data moves anywhere.**

**It lands inside 0.3**, not as its own release, and deliberately alongside the
Preact conversion — 0.3 already opens `logging`, `setup` and `unit`, and those
are the same screens that read data. Doing both swaps at once opens each screen
once instead of twice.

### The measurements, taken live against the deployed backend

```
list-projects  (fresh=1, cache bypassed)
  1st call   33.0 s     <- cold start
  2nd call    2.6 s
  3rd call    2.7 s

get-project    (Elsliger 36-B, 23 KB)
  1.68 s   1.81 s   1.86 s

direct Sheet endpoints (gviz and Sheets API v4)
  refused in 0.27 s and 0.39 s  <- the floor, no script involved
```

So the direct read path is roughly **4–6× faster** than Apps Script, and it has
**no cold start** because no script has to wake up.

### Scale was never the argument, and never will be

Elsliger is 36 units × 13 items = **468 status cells**, plus 27 records. Twenty
buildings is under 10,000 cells. A Google Sheet holds ten million. **Do not
reopen this question on scale grounds.**

The two real weaknesses are **speed** (answered above, without moving data) and
**no logins** (see the trigger below).

### What staying on Sheets keeps

- The escape hatch in `CLAUDE.md` principle 2 — open the Sheet, fix anything.
- $0/month, nothing to patch, nothing that goes down at 7 am.
- **Claude reads it for free**, which decision 2 now depends on.
- A document you can hand to the GC.
- `Code.js` stays as it is. Moving means rewriting all 2,614 lines.

### The trigger to reopen — named, so it is not re-argued

Two conditions, both chosen by Miguel:

1. **Somebody other than Miguel writes.** Crew access needs real logins, and
   that is the strongest argument for moving. **Crew access and the database
   question are now ONE decision, not two.**
2. **The generic version happens** (question 4). N companies cannot share one
   Drive and one anonymous URL.

Explicitly *not* a trigger: data volume.

### THE SECURITY FACT, found while measuring this

**The repo is public and the write API has no authentication.**

- `github.com/miggodbout/PFC` — `"visibility": "PUBLIC"`.
- `control/shared/common.js:30` holds the Apps Script URL in plain text.
- `control/appscript/appsscript.json` — `"access": "ANYONE_ANONYMOUS"`.

**Anyone who finds the repo can read and write every project Sheet.** No key, no
login. Viewing source on the live app gives the same thing.

**Decision: note it, act on it never — until one of the two triggers above.**
Reasoning, and Miguel agreed with all of it:

- It is one building of door statuses on a repo nobody knows exists.
- **There is no cheap fix.** A shared secret in `common.js` sits in the same
  public file. The only real answer is Google login (`executeAs: USER_ACCESSING`),
  which *is* the crew-access work.
- Making the repo private probably breaks the app — GitHub Pages from a private
  repo needs a paid plan, and the URL is already on every phone that has the app.

**It is now a hard blocker on both triggers.** You cannot sell a tool where every
customer's data is world-writable. Write this into any crew-access or
generic-version plan as a requirement, not a nice-to-have.

### One consequence for the fast-read work

The direct read path needs the Sheet set to **readable by anyone with the link**.
Given the fact above, that **exposes nothing new** — the data is already fully
readable *and writable* by anyone with the published URL. Link-sharing is
strictly less exposure than what exists today.

### The cold start — pending confirmation, then 0.2.3

One 33-second reading is not proof. **Measure it cold before opening the app in
the morning of 2026-08-16.**

- ~30 s again → ship a keep-warm time-based trigger in `Code.js` as **0.2.3**.
  About five lines plus one trigger, free, and it stops the script ever sleeping.
- ~2 s → it was a fluke. Drop it.

Worth knowing either way: `API_TIMEOUT` in `control/shared/common.js:33` is
**12 000 ms**, so a 33-second cold start times the app out and shows the offline
message. And once fast reads land, the cold start only affects the first *write*
of the day, which the outbox retries silently — 0.2.1 made connection failures
not burn the hold limit. **So this fix is worth having now and stops mattering
after 0.3.**

---

## 4 — A generic version. SETTLED 2026-08-15.

### The decision

**It is a real goal, sold as a service, aimed at small crews — and it is a
post-1.0 goal with no version number.** Miguel: *"still need logins, database,
and all the above but it would be catered for small construction crews not
massive businesses."*

**De-branding waits until after 1.0.** Not opportunistically during 0.3, not as
its own job. His call.

**One thing does happen now: hosting moves.** See below.

### It passes Miguel's own "something real" test

The QR menu rule in `CLAUDE.md` says: do not write a thing into a version until
something real puts it there. This one has something real.

**The painters.** Miguel: *"No one has asked but I specifically have it in mind
for the painters we work alongside, we work with them daily and they are a
similarly sized outfit as us, currently using a simple checklist taped to
doors."*

A named, adjacent, similarly sized crew, with the same problem and the same
current solution — a checklist taped to a door. **That is the first concrete
requirement the login work has ever had.** It does not earn a version number
today, but it stops being hypothetical, and it should be named in any future
crew-access or multi-tenant plan.

### The branding is the small part. Do not be fooled by it.

Measured: **42 PFC/Premier strings across 11 files, 3 uses of the brand colours**,
one logo, one Sheet template header. About a day.

**And the domain model is already generic.** Building → floors → units → phases →
items fits any trade that works unit by unit. Item lists and reason lists already
live in `_Config` per building; `DEFAULT_ITEM_LISTS` in `common.js` is only a
starting suggestion. This was built right the first time.

### The four things that are not a day's work

1. **Every customer's data would live in Miguel's Google Drive.** Sheets are
   created in `PFC/Control/Project Sheets/` by a script running as him
   (`executeAs: USER_DEPLOYING`). Another company's job data would be his files,
   in his account, under his name.
2. **No accounts, and the API is world-writable.** See decision 3.
3. **One URL, one Google account, one Apps Script quota**, shared by everyone.
4. **Onboarding with no Miguel in it.** Today a building is made through Admin,
   by him, against his Drive.

### Cloudflare — the question Miguel added, and the answer

**"Can we just private the repo and my code disappears?" No.**

A web app's front end is always delivered to the browser. Every phone that opens
PFC Control downloads the HTML, CSS and JavaScript in full, and View Source shows
all of it. **A private repo hides the repo, not the running app.** Cloudflare does
not change that, and minifying obscures rather than hides. The only way to hide
logic is to move it to a server — which is what Apps Script does, and why
`Code.js` is the one file nobody can read.

**What a private repo does hide is still worth having:** `.scratch/` holds the
entire design reasoning, `notes/` holds the site notes, and the commit history
holds every decision. That is the actual IP here, not the button code.

**What Cloudflare offers, and it is more than was asked:**

| | GitHub Pages | Cloudflare |
|---|---|---|
| Private repo on a free plan | **no** | **yes** |
| Static hosting | yes | yes, free |
| Server-side code | none | Workers, free to 100k/day, ~5 ms cold start |
| Database | none | D1 (SQLite), free tier |
| Logins | none | Access, free to 50 users |
| Photo storage | none | R2 |

**So the entire "sell it to small crews" stack sits on Cloudflare's free tier.**
This weakens one argument made in decision 3 — that a database means a bill and a
server. At this scale the bill is zero.

**Decision 3 does not change, and Miguel confirmed it.** The bill was never the
main argument. The three that stand are untouched by free hosting: the escape
hatch of opening a spreadsheet, Claude's free read (decision 2 depends on it),
and 2,614 lines of `Code.js` that would need rewriting.

### The hosting move — the one thing that happens now

**Buy a domain, point it at Cloudflare Pages, then take the repo private.**

The real fragility was never GitHub versus Cloudflare. It is that everything is
pinned to `miggodbout.github.io`, **a hostname Miguel does not own**. Owning the
domain means hosting can move underneath it forever.

**The blocker that would have stopped this is gone.** Verified live on
2026-08-15 that the printed QR codes point at GitHub Pages, not at the Apps
Script URL — so taking the repo private would have broken every sheet on every
door. It does not, because **Miguel said the camera app is dead**: *"the Camera /
QR app is currently dead, will probably get scrapped."* No reprint to pay for.

`CLAUDE.md` was corrected in two places on the back of this: the camera app is no
longer described as in daily crew use, and the QR-code paragraph no longer names
the wrong URL.

### Not done, deliberately

- De-branding. Post-1.0.
- Any multi-tenancy work, any accounts, any migration off Sheets.
- Writing a Cloudflare migration plan. It would be an hour on a thing that may
  never happen in that shape.
