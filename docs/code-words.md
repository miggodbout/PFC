# Code Words — a plain-English dictionary for Miguel

Every term here is one that actually shows up in this repo, in its code
comments, in the planning documents, or in a session with Claude. It is not a
general programming glossary. If a word is not used on this project, it is not
in here.

Read it when a word goes past that you half know. Nothing in here changes the
app.

**How to use it during a build:** if Claude uses a term that is not in this
file, that is a gap in the file, not a gap in you. Say so and it gets added.

---

## Parts of a screen

These are the words for the shapes you see. They exist because "that little
round thing" is not something two people can agree on.

| Word | What it means | Where you see it |
|---|---|---|
| **Element** | Any one piece of a page — a button, a line of text, a box. The page is a stack of elements inside elements. | Everywhere |
| **Chip** | A small tappable rectangle standing for one thing. | The unit squares on the Building screen |
| **Pill** | A rounded box with a word in it, used for status. | `● In Progress` at the top right |
| **Dot** | A small filled circle. Progress only, never anything else. | Inside a pill, and on a unit chip |
| **Badge** | A small mark that hangs on the **corner** of something, outside its edge. | The red `!` on a unit chip |
| **Banner** | A full-width strip of message across the screen. | `Offline. Last updated…` |
| **Bar** | Two meanings, so we always say which. **Progress bar** = the hairline fill showing how much is done. **Sync bar** = the strip under the header counting unsent edits. | Both on the Building screen |
| **Ring** | The small turning circle meaning something is in flight. Also called a **spinner**. | Beside an item while it saves |
| **Caret** | The little `⌄` arrow that says a section opens. | Right of a floor header |
| **Header** | The strip at the top of a screen with the title in it. | Every screen |
| **Footer** | The same thing at the bottom. | Nothing uses one yet |
| **Modal** / **Dialog** | A box that opens on top of the screen and blocks everything behind it until you answer. | Nothing uses one — on purpose |
| **Placeholder** | Grey text sitting inside an empty box, showing what to type. It is not a value and it does not save. | The `Size Jamb Swing` line in the Needed box. The screen calls it the Example |
| **Hairline** | A line one pixel thick. A description, not a component. | The progress bar |

---

## Data words

| Word | What it means | Why it matters here |
|---|---|---|
| **Key** | The app's private name for a thing. Lower case, underscores, never shown to anyone. `interior_doors` | The Sheet stores keys. A key can never change without breaking the data that points at it |
| **Label** | The human name for the same thing. `Interior Doors` | This is what a screen draws. Two items can share a label; they can never share a key |
| **Value** | What is stored in one spot. `in_progress` is a value |  |
| **Field** | One named slot that holds a value. Progress is a field | 0.2 split one field into two: Progress and Flags |
| **Record** | One saved row about one problem — what is wrong, what is needed, how many | A deficiency is a record |
| **Payload** | Everything the server sends back in one answer, as one lump | `get-project` sends a payload holding the whole building |
| **Config** | Settings that describe shape, kept as data instead of written into the code | `_Config` in the Sheet holds the floors and items, so the code never has a floor count in it |
| **Rollup** | Adding many small facts up into one. Eighteen item statuses roll up into one unit status | The 0.2 rule: everything Complete, or everything Not Started, or else In Progress |
| **Structure** | Floors, units, items — the skeleton. Changed only in Admin | As opposed to status, which changes all day |
| **Migration** | Changing already-saved data so it fits a new shape | Renaming `Exterior Door(s)` needs one, because the key is built from the label |
| **Schema** | The agreed shape of the data — which columns exist, in what order | The Deficiencies tab's thirteen columns are a schema |
| **`subtype`** | The narrower kind of an item — a Bypass door, a Privacy set. The record column, the variable and the Logging field all use it | **The screen says `Type`.** It said `Subtype` until 2026-08-09. The stored list was always `item.types`, so only the label moved |
| **`hint`** | The config key holding one item's placeholder line | **The screen says `Example`.** Same day, same reason. The key was left alone because every building already on Drive stores `hint`, and renaming it would need a fallback read forever |

---

## Saving, offline and the queue

This is the part 0.2 is built out of, so these are the words that come up most.

| Word | What it means |
|---|---|
| **Fetch** | Ask the server for something and wait for the answer. A "fetch call" is one such ask |
| **Request** / **Response** | The ask, and the answer that comes back |
| **Endpoint** | One address on the server that does one job. `save-batch` is an endpoint |
| **API** | The full set of endpoints — the list of things the server will do if asked |
| **Backend** | The server side. Here it is the Apps Script. Everything on the phone is the **front end** |
| **Job** | One queued edit waiting to go. Careful — this collides with a crew word. See `crew-words.md` |
| **Queue** | The line of jobs waiting to send. Called the Outbox until 0.2 renamed it |
| **Waiting** (a job) | Queued and still trying. It will go by itself when signal returns |
| **Held** (a job) | The server refused it. It will never go by itself — you have to act |
| **Drain** | Working through the queue, sending jobs until it is empty |
| **Backoff** | Waiting longer between each retry so a dead network is not hammered. Ours goes 0s, 5s, 15s, 60s, 5min |
| **Fold** | Writing a landed change into the phone's saved copy, so the screen shows it without asking the server again |
| **Optimistic save** | Painting a change as done before the server confirms it. **We do not do this** — an edit shows as queued until it truly lands |
| **Batch** | Several edits sent in one request instead of one each |
| **Slice** | A batch cut into smaller pieces because the whole thing was too big to send |
| **Idempotent** | Safe to send twice. If a retry might duplicate something, the design is wrong |
| **Stale** | A saved copy that may be out of date. The app only says so when a refresh actually failed |
| **Race** | Two things happening at once where the order decides the result. Usually a bug |

---

## The web underneath

| Word | What it means |
|---|---|
| **HTML** | The content and structure of a page |
| **CSS** | How it looks. Colors, spacing, size |
| **JavaScript** | What it does. All the behaviour |
| **DOM** | The live page in memory. Code changes the DOM; the screen follows |
| **Render** / **Paint** / **Draw** | Put it on the screen. Used interchangeably |
| **Redraw** | Build a piece of the screen again from current data |
| **Flex** / **Flexbox** | The CSS way of laying things out in a row or column. A "flex container" arranges its children; the children are "flex items" |
| **Inline** vs **Block** | Inline elements sit in a line of text and ignore width and height. Block elements take a full line and obey both. This is exactly what broke the unit spinner |
| **Console** | The hidden log every browser keeps. Code writes to it, nothing on the page shows it, and you open it from the browser's developer tools. Where the technical half of an E1/E2/E3 failure goes |
| **Identifier** | A name the code uses to find a thing, as opposed to a **label**, which is text a person reads. `pfc.control.v1.outbox` is an identifier — the window it belongs to is called Queue now, but renaming the identifier would orphan every edit already saved under the old one |
| **localStorage** | A small store on the phone that survives closing the app. Holds the queue and the saved copies |
| **Service Worker** | A script that sits between the app and the network. Ours serves saved files when there is no signal |
| **App shell** | The files that make the app open at all — HTML, CSS, JS. Cached by the Service Worker |
| **Cache** | A saved copy kept to avoid asking again |
| **`CACHE_NAME`** | The version stamp on our cache. Phones keep serving old files until this string changes |
| **PWA** | A web app a phone can install to the home screen and open like a real app |
| **JSONP** | An old trick for getting data from another domain when the normal way is blocked. Limited, because the whole request must fit in a URL |
| **CORS** | The browser rule about which sites may talk to which servers. When it blocks us, JSONP is the fallback |
| **Manifest** | The file telling the phone the app's name and icon when it installs |

---

## Git and shipping

| Word | What it means |
|---|---|
| **Repo** | The project folder, with its full history |
| **Commit** | One saved step in that history, with a message saying why |
| **Branch** | A separate line of work. `0.2` is a branch; `main` is the one that goes live |
| **Merge** | Bring one branch's work into another |
| **Push** | Send commits up to GitHub |
| **Diff** | The exact lines a change added and removed |
| **Pages** | GitHub Pages — the free hosting that serves the app from the repo |
| **Deploy** | Put new code where it actually runs. For the Apps Script this is a manual step |
| **clasp** | Google's command-line tool for pushing local files into an Apps Script project |
| **Apps Script** | Google's server-side JavaScript. Our backend |
| **Web app deployment** | The Apps Script setting that gives the script a public URL |
| **Version** | `MAJOR.MINOR.PATCH`. See CLAUDE.md |

---

## Words for how code is written

You will hear these when Claude explains a change.

| Word | What it means |
|---|---|
| **Function** | A named block of code you can run. `barHtml` is one |
| **Argument** / **Parameter** | What you hand a function when you run it |
| **Return** | What a function hands back |
| **Variable** | A named box holding a value |
| **String** | Text. **Number**, **Boolean** (true or false), **Array** (an ordered list), **Object** (named slots) are the other shapes |
| **Null** / **Undefined** | Nothing here. Two flavours of nothing, which is a common source of bugs |
| **Loop** | Do the same thing over each item in a list |
| **Condition** | An `if` — do this only when that is true |
| **Refactor** | Rewrite code without changing what it does |
| **Hardcode** | Write a fixed value into the code that should have come from data. Against principle 1 |
| **Edge case** | A rare input that breaks otherwise fine code |
| **Regression** | Something that used to work and now does not |
| **Seam** | A deliberate place left open for later work to attach to |
| **Escape hatch** | A way out when the tool cannot do what you need |
