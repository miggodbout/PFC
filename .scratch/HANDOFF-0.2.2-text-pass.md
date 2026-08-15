# Handoff — the 0.2.2 UI text pass

One job: **read every string a person sees in `control/` and check its shape.**
Nothing else. Do not build features, do not refactor, do not fix bugs you notice
in passing — write those down instead.

Written 2026-08-15, at the end of the session that built 0.2.2 and wrote the rule
this pass applies.

---

## Why this exists

0.2.2 shipped a field note reading `You can leave this empty.` Miguel cut it the
same day: *"no app would say 'You can leave this empty' it would just say
'Optional'."*

The interesting part is that it passed the writing standard. STE is a
**documentation** standard — written for maintenance manuals, so every rule in it
drives toward a well-formed sentence. `You can leave this empty.` is short,
active, plain, no contraction, one idea. Good STE. Bad UI, because a screen is
mostly labels, and a sentence where a label belongs is what reads as
machine-written.

So the standard was not being broken. It was incomplete. It has been completed —
see below — and this pass applies the new half to every string already shipped.

Miguel's ask, verbatim: *"we should do a full pass and fix any left over
sentences that should be labels or instructions."*

---

## Read this first, before any string

**`docs/crew-words.md`, the section "The shape comes before the words".** It is
the whole rule and it is not long. `CLAUDE.md` carries a short version under the
Writing Standard heading and points here.

The one-line version: **pick the shape first — label, instruction, or
explanation — then apply STE inside that shape.** Most UI text is a label: a
fragment, no full stop.

| Shape | When | Form |
|---|---|---|
| **Label** | Names a thing, a state, or a rule about a field | Fragment. No full stop. |
| **Instruction** | The person must do something | One STE sentence, imperative. |
| **Explanation** | Rare. Confusion or data loss only | One STE sentence. |

The tells, the two tests, and the settled rows are all in that file. Do not work
from this summary.

---

## Where 0.2.2 stands

Branch `0.2.2`, pushed, **not merged to `main` and not tagged.** All five items
from `notes/0.2.1_bugs.md` are built:

1. Phase split is three columns; the `30 of 36 units started` line is deleted.
2. Chrome/Firefox/Edge on iPhone get their own install sheet; `Add to phone`
   centred and its class-name collision fixed.
3. Two Hub subtitles reworded.
4. Log flag optically centred.
5. `Needed` says `Optional`.

`CACHE_NAME` is `pfc-control-0.2.2-dev.2`. **Bump it on every push that touches
`control/`** — `powershell -File tools/bump-version.ps1`. At the ship commit use
`-Release 0.2.2`, then tag, then a GitHub Release.

Release notes are bullet points now, one line per change. The rule is in
`CLAUDE.md`; `.scratch/notes-0.2.1.md` is the worked example.

---

## Already checked — do not redo

A regex sweep for the tells ran at the end of the writing session. It was
**shallow on purpose** and it is not the pass. Four hits:

| String | Verdict |
|---|---|
| `Then you can log against it here` (Log empty state) | **Fixed.** Granted permission instead of instructing. Now `Then log against it here`. |
| `Install it to keep your saved work.` | **Correct.** Instruction; second person is allowed in one. |
| `A browser tab can delete your saved work after 7 days.` | **Correct.** Settled explanation, already a row in `crew-words.md`. |
| `Create your first building.` | **Correct.** Imperative instruction. |

Counts, so the next session knows the size of the job: **44 sentence-shaped
strings** across the UI files, of which only **2** contain `you` or `your`. Most
are error messages and install steps, which are legitimately sentences.

**That is the point.** The regex found almost nothing, and the bug that started
all this — `You can leave this empty.` — would have been the *only* real hit. The
remaining problems are the ones a regex cannot see: a label phrased as a mini
sentence with no full stop, a reason welded onto a field name, a heading written
as a description. Those need reading, not grepping.

---

## The method

Go file by file, in this order. Small ones first so the rule is warm before the
big two.

| File | Lines | Rough strings |
|---|---|---|
| `control/index.html` | 176 | 9 |
| `control/manifest.json` | 37 | — (`name`, `short_name`, `description`) |
| `control/tracker/index.html` | 275 | 5 |
| `control/tracker/building.html` | 347 | 5 |
| `control/tracker/queue.html` | 238 | 7 |
| `control/tracker/unit.html` | 739 | 14 |
| `control/setup/index.html` | 960 | 37 |
| `control/logging/index.html` | 1035 | 39 |
| `control/shared/common.js` | 3721 | 111 |

For each string, in order:

1. **Is it seen by a person?** `aria-label` counts — a screen reader is a person.
   A code word in a variable name does not.
2. **What shape is it?** Label, instruction, or explanation. If you are writing a
   sentence, prove it is one of the last two.
3. **Run the two tests** from `crew-words.md` — cut until one more cut changes the
   meaning; then, could this exact string appear in iOS Settings or a banking app.
4. **Check it against the settled rows** in `crew-words.md` before changing it.
   Many strings were settled by Miguel on 2026-08-09 and are correct as they
   stand. **A settled row outranks your judgement.**
5. **If the tests leave two defensible options, ask Miguel.** Do not guess and do
   not invent a rule at build time. That instruction is in the rule itself.

`shared/common.js` holds a third of the strings and every error message. Its
error codes E1/E2/E3 are settled rows — read the Error codes section before
touching one.

---

## What to do with what you find

- **A clear fix:** make it, and add or update the row in `crew-words.md`. A change
  with no row is a change that gets re-argued in six months.
- **Two defensible options:** collect them and ask Miguel in one picker round at
  the end. Do not send him one question at a time.
- **A bug that is not text:** write it in `notes/0.2.2_bugs.md` and keep going.
  Miguel keeps a numbered bugs file per release; follow that shape.

**Ask with the picker.** `AskUserQuestion`, recommended option first, previews for
anything concrete. There is a hook enforcing this on grill sessions
(`~/.claude/hooks/grill-picker.js`) and a section in `CLAUDE.md` under Repo Owner.
It applies to this pass too.

---

## Do not

- **Do not touch the camera app.** `Hub/Log/*` and `appscript/Code.js` are live in
  daily crew use and are named in `CLAUDE.md` as not-to-modify. This pass is
  `control/` only.
- **Do not rename Tracking to Buildings or the reverse.** `CLAUDE.md` has a
  section on this. The section is Tracking; the one screen header is Buildings.
  Miguel chose it deliberately after being offered the full rename.
- **Do not reword a settled row** because you would have phrased it differently.
  Settled means settled. If you think one is genuinely wrong, say so and let him
  rule.
- **Do not hide or remove an item from a screen.** `CLAUDE.md` is emphatic about
  this and a previous session lost a whole design branch to it.

---

## Finishing

The pass is done when every file in the table has been read and every finding is
either fixed with a row, queued as a question, or written into the bugs file.

Then: bump `CACHE_NAME`, commit, push. Whether 0.2.2 ships at that point is
Miguel's call — patches ship freely now, so there is no bar to clear, but the
text pass may be worth folding into the same release as the five fixes rather
than shipping twice.
