# Crew Words — the rule book for text on a screen

Every word the crew reads has to pass through here first. A worker reads his
phone in bad light, in a hurry, wearing gloves. A word he has to stop and work
out costs him more than a longer sentence would have.

This file governs **UI text only** — anything drawn on a screen. Code, comments,
commit messages and planning documents are not bound by it. Those follow
`code-words.md` and plain writing.

**Status of this file: draft.** Every row marked OPEN needs Miguel. Nothing marked
OPEN gets built until he settles it.

---

## The rule

From CLAUDE.md, ASD-STE100 Simplified Technical English:

- Short sentences. One instruction per sentence.
- Active voice. Name who does the thing.
- No contractions. `do not`, never `don't`.
- The plain common word wins wherever one exists.
- No stacked helper verbs. No filler.
- No marketing adjectives.

Two more that this app needs, learned from the 0.2 step 3 test round:

- **Say it once per screen.** The 0.2 Outbox printed the same offline sentence on
  every row while the bar above already said it. Repetition reads as noise, and
  noise is skipped.
- **A message earns its place by being actionable.** If the person cannot do
  anything about it, and it is not a warning, cut it.

---

## One thing, one word

The worst vocabulary problem in the app is not a hard word. It is **three easy
words for one thing**, which is harder to read than any single term.

The app currently calls a building all of these:

| Word | Where it appears now |
|---|---|
| Job | Hub card `Create Job`, and the browser tab `Create Job — PFC Control` |
| Project | `Project name`, `Create project`, `No project was given`, `Open the project Sheet`, `There are no saved projects yet` |
| Building | Screen header `Buildings`, `Every building is finished`, `Create your first building` |

**Recommendation: Building wins on every screen.** It is the plainest of the
three, it is what the crew already says out loud, and the Tracking screen is
already headed Buildings. `Project` becomes a code word only — it stays in
`projectId` and in the Drive folder names, where no crew member reads it.

`Job` is the harder loss, because `Create Job` is the Hub card you use most. But
`Job` also already means something else in the code — one queued edit is called a
job — and one word cannot mean both.

**Status: OPEN.** Three ways to go:

| Option | Hub card reads | Cost |
|---|---|---|
| A | `New Building` | Everything matches. You give up the word Job on screen |
| B | `Create Job`, everything else Building | Card keeps the word you use. Two words survive on screen |
| C | Job everywhere, Buildings header renamed | Reverses a decision you already made in 0.1.1 |

---

## Words to replace

| Word | Where | The problem | Proposed | Status |
|---|---|---|---|---|
| **Flag** | `Fix the open flag first. Then Complete comes back.` | Miguel's own example. Nothing on site is called a flag. It is an app invention for "an open problem of either kind" | **Name the actual kind instead.** The crew never needs the umbrella word — a real screen always knows whether it is a deficiency or a wait. `Fix the deficiency first.` / `This item is waiting.` The word Flag survives in the code and in these documents, and never on a screen | OPEN |
| **Outbox** | Window title, sync bar link | Email word. Nobody outside email has an outbox | **Queue** | DECIDED 2026-08-09 |
| **wait** | `Offline · 3 edits wait` | Reads as a verb given to the reader | **`Offline · 3 edits queued`**. Singular `1 edit queued` | DECIDED 2026-08-09 |
| **Drop** | Queue row button `Drop`, and `Drop the edit` | Vague. Drop it where | **`Delete`**, or `Throw away`. Whatever it says, it must not look like `Try again` | OPEN |
| **Sheet** | `Open the project Sheet`, `Every project gets its own Google Sheet`, `…has reached its project Sheet` | It is a Google Sheet, and half the crew has never opened one | Where it is a link, **`Open in Google Sheets`** is clear. Where it is only explaining where data went, **cut the sentence** — the crew does not need to know | OPEN |
| **Deficiency** | Status vocabulary, the record type, the Hub card | The industry word, and a GC punch list uses it. But it is four syllables and Latin | Probably **keep**. It is the word on the paperwork the crew already signs. Flagged only so the decision is on the record | OPEN |
| **placeholder** | Admin: `Units get placeholder names. Rename them below once you know the addresses.` | Software word | `Units are numbered for now. Rename them when you know the addresses.` | OPEN |
| **Status** | Admin: `The item loses its Status column.` | 0.2 renamed this field **Progress**. The app now uses both words for one field | Use **Progress** everywhere on screen. `Status` is fine in code | OPEN |
| **Flat List** | Admin, building shape | Software word for a shape | `No floors` or `One list, no floors` | OPEN |

---

## Words that stay

Checked against the inventory and passed. Do not "improve" these.

- **Not Started · In Progress · Complete** — the three Progress values. Plain, and
  already familiar from 0.1.
- **Waiting** — replaced On Hold in 0.2 for exactly this reason.
- **Unit**, **Floor**, **Item**, **Phase** — all four are what the crew says out loud.
- **Try again** — chosen over Retry. Two plain words beat one borrowed one.
- **did not save** — chosen over failed. Says what happened, not a verdict.
- **queued** — Miguel's own pick, 2026-08-09.
- Every trade term in the dropdown lists: `Bi-fold`, `Ball Catch`, `Dwarf`,
  `Backordered`, `Wrong Swing`, and the rest. **The crew knows these better than
  the app does.** They come from data, not from code, so they are Miguel's to set
  in Admin.

---

## Messages the crew must never see

These are real strings in the app today. Every one of them is written for Miguel
or for a developer, and each one appears on a crew screen when things go wrong.

| String | Why it is wrong for the crew |
|---|---|
| `The backend is not connected yet. Open control/shared/common.js and paste the web app address into API_URL.` | Names a file and a variable |
| `This app is newer than the backend. Deploy the script again.` | Two dev words, and an instruction only Miguel can carry out |
| `The browser could not read the reply. Check that the web app is deployed with access set to Anyone.` | Same |

**Recommendation:** each keeps one plain sentence for the crew, and the technical
half moves to the browser console where Miguel can read it. Something like
`This app cannot reach the server. Tell Miguel.` **Status: OPEN.**

The console is a hidden log built into every browser. Writing there costs nothing
and no crew member will ever see it.

---

## How to add to this file

When a new screen is written, every new string gets checked here first. When a
word is not covered, add a row and mark it OPEN rather than guessing. An OPEN row
is not a blocker for building the screen — it is a blocker for shipping it.

**Logger is the next test of this file.** It adds more new words than any screen
in the app: Type, Subtype, Needed, Reason, Count, and every dropdown behind them.
Those get checked here before they are written, not after.
