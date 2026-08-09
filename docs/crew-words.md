# Crew Words — the rule book for text on a screen

Every word the crew reads has to pass through here first. A worker reads his
phone in bad light, in a hurry, wearing gloves. A word he has to stop and work
out costs him more than a longer sentence would have.

This file governs **UI text only** — anything drawn on a screen. Code, comments,
commit messages and planning documents are not bound by it. Those follow
`code-words.md` and plain writing.

**Every row below was settled by Miguel on 2026-08-09**, in one session, against
the app's real strings. Nothing here is a guess. A word this file does not cover
gets a new row marked OPEN, never a guess made at build time.

---

## The rule

From CLAUDE.md, ASD-STE100 Simplified Technical English:

- Short sentences. One instruction per sentence.
- Active voice. Name who does the thing.
- No contractions. `do not`, never `don't`.
- The plain common word wins wherever one exists.
- No stacked helper verbs. No filler.
- No marketing adjectives.

Three more this app learned the hard way, all from the 0.2 step 3 test round:

- **Say it once per screen.** The Outbox printed the same offline sentence on
  every row while the bar above already said it. Repetition reads as noise, and
  noise is skipped.
- **A message earns its place by being actionable.** If the person cannot do
  anything about it, and it is not a warning, cut it.
- **Never hardcode a person's name.** Say the role. A name is right until the
  person changes, and 0.3 adds crew accounts.

---

## One thing, one word

The worst vocabulary problem in the app was not a hard word. It was **three easy
words for one thing** — the app called a building a Job, a Project and a Building
on different screens.

**Building wins on every screen.** Settled 2026-08-09, on the back of a prior
decision: **one project is exactly one building, always.** A two-tower site is
entered as two buildings and opened separately. Floors and unit numbers already
restart per building, so the data agreed with this before the words did.

- `Project` is now a **code word only**. It survives in `projectId` and in the
  Drive folder names, where no crew member reads it. See `code-words.md`.
- `Job` is now a **code word only**, and it means **one queued edit**. It never
  appears on a screen. This is why it could not stay on the Hub: one word cannot
  mean a building and a queued edit at the same time.

---

## Screen names

| Screen | Hub card | Sub | Header | Folder |
|---|---|---|---|---|
| Tracking | `Tracking` | `Buildings & units` | `Buildings` | `control/tracker/` |
| Logging | `Logging` | `Record an issue` | `Logging` | `control/logging/` |
| Set up | `Set Up Building` | `Create or change a building` | — | `control/setup/` |
| Queue | *(none — reached from the sync bar)* | — | `Queue` | `control/tracker/queue.html` |

**Tracking is the section; Buildings is the screen inside it.** That split is
older than this file and deliberate — see CLAUDE.md. A header names what is on
the screen; a card names the activity. They are allowed to differ.

**`Set Up Building` covers create and change**, which is why it is not
`New Building`. Editing an existing building lives behind the same card.

**The word `Admin` is not a screen name.** It was one during 0.1, and the screen
is now an ordinary crew window. `Admin` survives only as the name of a **role** —
see the error codes below — and 0.3 will give that role a real meaning.

---

## Issue, Deficiency, Waiting

Three words, three levels. Settled 2026-08-09.

```
issue          the umbrella. An open Deficiency OR an open Waiting.
 ├─ Deficiency   the kind: wrong, missing or damaged
 └─ Waiting      the kind: cannot continue yet
```

**`flag` never appears on a screen.** It stays in the code, in the build plan and
in CLAUDE.md, where it means the same thing `issue` means on screen. This was
Miguel's own example of a word the crew does not use.

**`Deficiency` stays, and that is a decision, not an oversight.** It is four
syllables and Latin, which the writing standard pushes against. It is also the
word on the GC's punch list, on the paperwork the same defect gets written on.
The plain-word rule applies *where a plain word exists*, and none carries the
same meaning to a GC. Do not revisit this without a reason that beats "shorter".

---

## Settled replacements

| Word | Where | Now reads |
|---|---|---|
| `flag` | `Fix the open flag first.` | `Fix the open issue first. Then Complete comes back.` |
| `Outbox` | Window title, sync bar link | `Queue` |
| `wait` | `Offline · 3 edits wait` | `Offline · 3 edits queued`. Singular: `1 edit queued` |
| `Drop` | Queue row button | `Delete` — **and it must not share a shape with `Try again`**. It is the only button in the app that loses work on purpose |
| `Sheet` (link) | `Open the project Sheet` | `Open in Google Sheets` — it names an app the phone can open |
| `Sheet` (explaining) | `Every project gets its own Google Sheet` | **Cut.** The app describing its own plumbing. The link is right there |
| `Status` | Set-up screen | `Progress`. 0.2 renamed the field; the screen had not caught up |
| `placeholder` | `Units get placeholder names.` | `Units are numbered for now. Rename them when you know the addresses.` |
| `Flat List` | Building shape | `Units only`, opposite `Floors and units` |
| `Create Job` | Hub card | `Set Up Building` |
| `Log` / `Logger` | Hub card, window | `Logging`, in all five places — card, header, folder, file, build plan |

---

## Words that stay

Checked against the real strings and passed. Do not "improve" these.

- **Not Started · In Progress · Complete** — the three Progress values.
- **Waiting** — replaced On Hold in 0.2 for exactly this reason.
- **Unit**, **Floor**, **Item**, **Phase**, **Building** — what the crew says out loud.
- **Try again** — chosen over Retry. Two plain words beat one borrowed one.
- **did not save** — chosen over failed. Says what happened, not a verdict.
- **edit** — as in `3 edits queued`. Plain, and Miguel confirmed the phrasing.
- **queued** — Miguel's own pick.
- Every trade term in the dropdown lists: `Bi-fold`, `Ball Catch`, `Dwarf`,
  `Backordered`, `Wrong Swing`, and the rest. **The crew knows these better than
  the app does.** They come from data, not code, so they are Miguel's to set.

---

## Error codes

Three failures can reach a crew phone that **no crew member can act on**. Each one
gets one plain sentence and a short code, so a worker can read the code down the
phone without opening anything.

| Code | Failure | On screen |
|---|---|---|
| E1 | The app is not set up — `API_URL` is empty | `This app is not set up yet. Tell the Admin. (E1)` |
| E2 | Cannot reach the server, or the reply could not be read | `This app cannot reach the server. Tell the Admin. (E2)` |
| E3 | The app is newer than the backend | `This app needs an update. Tell the Admin. (E3)` |

The full technical reason still goes to the **browser console**, which is the
hidden log every browser has. It costs nothing and no crew member will open it.

**Nothing else gets a code.** `Offline · 3 edits queued`, `no room on this phone`,
`This edit did not save`, and the server timeout all tell the crew what to do
already. A code on those reads as though something is wrong when nothing is.

**`Tell the Admin` names a role, never a person.** Miguel is the Admin today.
Writing his name into the app would break the first time that is not true.

---

## Open rows

A word this file does not cover gets a row here rather than a guess at build
time. An OPEN row does not block building a screen. It blocks shipping one.

| Word | Where | Status |
|---|---|---|
| `Job site` | Hub subtitle `Job site tracker`, and the `description` in `manifest.json` and the `<meta>` tag | **OPEN.** Raised 2026-08-09 while applying this file to the code. `Job` is a code word meaning one queued edit, and it may not appear on a screen — but `job site` is one compound word for the physical place, and it is what the crew says out loud. The two do not read as the same word. Left as it is until Miguel calls it. The alternative is `Site tracker` |
| `Deficiencies` | The greyed Hub card | **OPEN** on purpose. It is a 0.3 placeholder for a window that does not exist. Whether it stays `Deficiencies` or becomes `Issues` is decided when that window is designed, not before |

---

## How to add to this file

When a screen is written, every new string gets checked here first. A word this
file does not cover gets a row marked OPEN rather than a guess. An OPEN row is
not a blocker for building a screen — it is a blocker for shipping one.

**Logging is the next test of this file.** It adds more new words than any screen
in the app: Type, Subtype, Needed, Reason, Count, and every dropdown behind them.
Those get checked here before they are written, not after.

Open rows live in the section above. There are two.
