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

**`Issue` is also a field label on Logging.** Settled 2026-08-09, closing the
`Subtype` open row. The screen used to read `Type` at the top and `Subtype`
three rows down — two near-synonyms on one short form. Worse, the Subtype
dropdown's own empty option already read `Choose a type`, and its stored list
was already `item.types`. The label was the part out of step, not the code.

| Row | Was | Now | Offers |
|---|---|---|---|
| top | `Type` | `Issue` | Deficiency · Waiting |
| under Item | `Subtype` | `Type` | On Interior Doors: Regular · Bypass · Bi-fold · Double · Pocket · Double Pocket · Dwarf · Unit Door · Other |

The top field names the umbrella, which is what it always chose between.
`Type` moved down to the field whose placeholder had been calling it that all
along. **`Subtype` is now a code word only** — the variable, the Sheet column
and the queued record keep it. See `code-words.md`.

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
| `Type` | Logging, the top field | `Issue`. See the section above |
| `Subtype` | Logging field, Set Up Building list card | `Type`. Code word only from here |
| `Hint` | Set Up Building Lists card | `Example`. The text is an example of what to type, so the label now says what it is. **The config key stays `hint`** — a crew word and a code word may differ, and `Project`/`projectId` is the precedent. Renaming the key would need a fallback read for every building already on Drive |
| `Job site tracker` | Hub subtitle | **Cut.** A subtitle on the home screen tells nobody anything they can act on, which is the rule this file applies to every other message. The header says `PFC Control` and the cards say what it does. The `manifest.json` and `<meta>` descriptions, which no crew member reads on a screen, now say `Site progress and deficiency tracker` |

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
- **Needed** — the Logging hero field, settled 2026-08-09. The alternative was
  `What is needed`, and that phrase is *already* the grey text inside the empty
  box on an item with no Example set. Promoting it to the label would print the
  same words twice in one field. A short label over a wide box is also faster to
  read on a phone, and this is the field the whole screen exists for.
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

## The Logging screen — checked 2026-08-09, when it was built

Logging added more new words than any screen in the app. Every string it
draws is listed here. **Six field names come straight from the build plan**
(section 5.7) and were settled with the design, not at build time.

| String | Where | Status |
|---|---|---|
| `Issue`, `Item`, `Type`, `Needed`, `Count`, `Reason` | the six field labels | **Settled.** Four came from plan 5.7 unchanged. `Issue` and `Type` were `Type` and `Subtype` until 2026-08-09, when the open row closed — see the section above |
| `Deficiency` / `Waiting` | the two Issue buttons | **Settled** above. They are the two kinds of issue |
| `Whole phase — Phase 1` | the first Item row, on a Waiting record | **Settled** in plan 5.7. It read `Whole phase — Doors & Windows` until 2026-08-09, when the phase tags were removed — a phase is named by its number alone |
| `Choose an item`, `Choose a type`, `Choose a reason` | the empty row of each dropdown | Plain, active, names the action. `Choose a type` needed no change in the rename — it was already right, and it is what showed the label above it was wrong |
| `Where are you?` | the sheet that sets Building, Unit and Phase | Plain question. It is the one thing that sheet asks |
| `set unit` / `change` | the button on the place bar | `set unit` while the unit is blank, `change` after |
| `Type the unit number.` / `No unit 201 in this building.` | under the unit box | Says what to do, then what was found |
| `Saved · waiting to send` | the strip after a save | `waiting to send` matches `queued` in meaning and is what the row shows |
| `Logged here` | the list of this visit's records | **Settled** in plan 5.7 |
| `Cancel` | on a Logged here row | It undoes a record. `Delete` is taken, and means losing a queued edit |
| `This phone already has 32 6 RH. You typed 32" 6" RH.` | the near-match prompt, above its two buttons | Two short sentences, both active, no contraction. It states the two spellings and lets the buttons ask the question. Added 2026-08-09 in the step 4 fix round — only its buttons were listed before |
| `Use it` / `Keep mine` | the near-match prompt | **Settled** in plan 5.7 |
| `Fix all 3` | above more than one open record | **Settled** in plan 5.4 |
| `Fixed` / `Undo` | on a record row in Tracker | `Fixed` is the state the Sheet stores. `Undo` is the mis-tap answer |
| `Every issue on Interior Doors is fixed. Set it to Complete?` | the green card, above its two buttons | Added 2026-08-09 in the step 4 fix round. **It read `Every record on` and the code was changed, not the row** — `record` is a code word, and `issue` is the settled umbrella. One thing, one word |
| `Set Complete` / `Not yet` | the green card | **Settled** in plan 5.4 |
| `Choose a building.` · `Set the unit.` · `Type what is needed.` · `Fill in the Type box.` · `Fill in the Reason box.` | over the dimmed Save button, one at a time | Added 2026-08-09 in the step 4 fix round. Save names the one field it still needs. Each line is the action, and the first four reuse words already settled above. The fourth read `Fill in the Subtype box.` until the rename later the same day |
| `No building on this phone` | Logging with no local copy | Says the state. The button under it says the action |
| `Type it` / `Say what it is` | the two `Other` boxes | Short, active, and different from each other on purpose |

The two rows this screen left **OPEN** — `Subtype` and `Needed` — were both
closed on 2026-08-09. `Subtype` became `Type` and moved the field above it to
`Issue`. `Needed` stayed as it was.

## The Set Up Building screen — checked 2026-08-09, in step 5

Step 5 added three cards to this screen: Rename an item, Lists, and the panel
that refuses a removal. Every string they draw is listed here.

**The refusal panel says `issues`, and the build plan says `records`.** The plan
was written before this file existed, and Amendment A3 says this file wins on
any word the crew reads. `record` is a code word. `issue` is the settled
umbrella, and it is the same word the Unit screen already uses.

| String | Where | Status |
|---|---|---|
| `Rename an item` | the card title | Mirrors `Rename a unit`, which was already there |
| `The name changes everywhere. Progress and issues stay with the item.` | under it | Says what moves and what does not. `Progress` and `issues` are both settled |
| `Lists` | the card title | Plain. It holds the reason list and the subtype list |
| `Reasons for this building` | the building-wide list | `Reason` and `Building` are both settled |
| `Reasons for Interior Doors` | the same list, narrowed to one item | The item names itself, so nothing new is read |
| `Choose the reasons this item offers. A reason you leave out stays on the building list.` | under the tick boxes | Names the action, then answers the question it raises. **It avoids a verb on purpose** — `untick` and `uncheck` are both words this file does not settle, and the sentence does not need one |
| `Types` | the item's type list | **Settled** 2026-08-09. Read `Subtypes` until the Logging rename, and this screen follows the field it fills |
| `This item has no types. It shows no Type box.` | an item that defines none | States the list, then what follows from it |
| `New reason` / `New type` | the two Add boxes | Two words, and the button beside each says `Add` |
| `Choose an item…` | the Lists item dropdown | Matches `Choose a building…` already on the screen |
| `Save the reasons` / `Save the example` | the two save buttons | Active. Each names what it saves, because the card holds three lists |
| `Example` | the item's placeholder text | **Settled** 2026-08-09. Read `Hint` until then. The text is an example of what to type, so the label says what it is rather than what it is for |
| `The grey text inside the empty Needed box.` | under the Example box | Says where the text lands |
| `Can not remove Interior Doors.` | the refusal, first line | No contraction. It names the item and refuses in one short sentence |
| `It holds 12 open issues across 9 units.` | the refusal, second line | The unit count is the useful half: nine units is nine doors to walk |
| `Cancel all 12 issues` | the refusal button | Singular at one: `Cancel all 1 issue` |
| `Then remove the item again.` | under the button | **It is two steps**, and this is the line that says so |
| `Cancel 12 issues?` `This can not be undone.` `Yes, cancel 12` `Back` | the confirm | A bulk cancel has no Undo, so the confirm is the only friction there is |
| `12 issues are cancelled. Remove the item again.` | after the cancel | States the result, then the next action |
| `No connection. The app can not load the buildings.` | the building list, offline | **The shared offline line was wrong here.** It says the app opened from its saved copy, and this screen holds no copy — it always asks the server. Step 3 round, point 15 |
| `No connection. The app did not create the building.` | the create form, offline | Same reason. Step 3 round, point 14 |
| `Enter a reason.` / `Enter a type.` / `Choose an item.` | the form checks | Match `Enter an item name.`, already on the screen |
| `The list already has Missing.` | adding a value twice | Names the value, so it is clear which one was the duplicate |
| `Every type list already ends with Other.` | adding `Other` as a type | Says why it was refused, not only that it was |

**One string on this screen is still a developer string:** `Item not found: cut`,
and the `Phase not found` and `Unit not found` beside it. They predate 0.2 and no
tap can reach one — the dropdowns only offer values the same answer named. Left
as they are.

## Open rows

A word this file does not cover gets a row here rather than a guess at build
time. An OPEN row does not block building a screen. It blocks shipping one.

| Word | Where | Status |
|---|---|---|
| `Deficiencies` | The greyed Hub card | **OPEN** on purpose. It is a 0.3 placeholder for a window that does not exist. Whether it stays `Deficiencies` or becomes `Issues` is decided when that window is designed, not before |

**Four rows closed on 2026-08-09**, in one pass, and each one is written up
where it belongs rather than here:

| Row | Outcome | Written up under |
|---|---|---|
| `Subtype` | → `Type`, and the field above it → `Issue` | Issue, Deficiency, Waiting |
| `Hint` | → `Example` on screen, `hint` stays in the config | Settled replacements |
| `Job site` | Subtitle cut | Settled replacements |
| `Needed` | Stays | Words that stay |

**Three of the four changed a word. One deleted a line, and that is the one
worth remembering.** `Job site` went to the picker as a choice between two
spellings, and the answer was that the sentence had not earned its place at
all. This file already had the rule — *a message earns its place by being
actionable* — and had only ever pointed it at warnings and errors. A subtitle
is a message too. Check the decoration against that rule, not only the alerts.

---

## How to add to this file

When a screen is written, every new string gets checked here first. A word this
file does not cover gets a row marked OPEN rather than a guess. An OPEN row is
not a blocker for building a screen — it is a blocker for shipping one.

Open rows live in the section above. **There is one left: `Deficiencies`**, and
it is open on purpose until its window is designed. The other four closed on
2026-08-09.

**An open row can close by changing a word the row does not name.** `Subtype`
was raised as one bad label, and the alternatives on the table — `Kind`,
`Style` — were all bad in the same way, because the real fault was the pair.
`Type` sat three rows above it and meant something else. Reading the screen top
to bottom, rather than reading the row, is what found that. **When an open row
resists every replacement, look at what sits next to it.**

**Logging was the test of this file, and it held.** Every string on the
screen was checked before it was written, and the two the file could not
settle became OPEN rows instead of guesses. Neither one blocks the screen.
Both block shipping 0.2.

**Where it did not hold: whole sentences.** The step 4 test round found two
crew-facing sentences missing — the near-match prompt and the green card
question — while both of their buttons were listed. A button is easy to see
as a string; a sentence inside a card reads as prose and gets skipped.
**Check the sentences too, not only the labels.** Writing the green card row
down is what caught `record` on a screen, a word this file settles as
`issue` everywhere else.
