---
name: close
description: Close out a session on the PFC repo — sweep the conversation for decisions and facts that never got written down, land them where they belong, then commit and push.
disable-model-invocation: true
---

A session is ending. Two things happen, in this order, and the order is the
point: **the sweep comes first, so whatever it finds lands in the same commit.**

## 1. Sweep the session

Read back over this whole conversation and find every **decision** and every
**fact** that is not yet written into a file. Be relentless — a thing said once
in chat and never written down is a thing that did not happen.

Look for all five kinds:

- **A decision Miguel made.** A choice between options, a rule, a scope call, a
  push-back he accepted or rejected. Include the reason he gave and the cost he
  accepted. A decision without its reason gets re-litigated in three weeks.
- **A decision I made and only mentioned.** A default I picked, an assumption I
  worked under, a trade-off I resolved on my own.
- **A fact the code told us.** A measurement, a line number, a limit, a thing
  that turned out already built or already broken.
- **Something that turned out wrong.** A note, a ticket, or a `CLAUDE.md` line
  that the session proved stale. Stale text is worse than missing text.
- **Something newly opened.** A question the session raised and did not answer.

For each one, name where it belongs:

| Kind | Where it goes |
|---|---|
| A 0.2 planning decision | its ticket in `.scratch/pfc-control-0.2/issues/`, then one line on `map.md` |
| A decision that overrules an older one | `.scratch/pfc-control-0.2/supersessions.md` |
| A master template change | `.scratch/pfc-control-0.2/template-changes.md` |
| An open question, not sharp enough to ticket | the map's **Not yet specified** |
| Work ruled past the destination | the map's **Out of scope** |
| A standing rule for the whole repo | `CLAUDE.md` |
| Something about how Miguel works, or how I should work | the memory directory |
| Pushed past 0.2 | `.scratch/0.3-backlog.md` |

Then write them. **Ask Miguel only where the answer is genuinely his** — whether
a thing is a real decision or just talk, or which of two homes it belongs in.
Do not ask permission to write something down.

**Done when every item found has a file behind it, or Miguel has said out loud
that it does not need one.** Report the list either way, including the empty
list. "Nothing new" is a real and common answer, and saying it plainly is worth
more than inventing something to write.

## 2. Commit and push

Stage everything, commit, push to `origin main`. No further confirmation — asking
for this command **is** the go-ahead.

**Write the commit message the way this repo writes them.** Read the last two
with `git log -2 --format='%s%n%b'` and match what you see:

- **Subject: one sentence, capitalised, no prefix and no tag.** It says what the
  session settled, not which files moved. `Settle how wide a Reason list is, and
  find a field nobody had drawn`.
- **Body: prose that explains the decisions and why they went that way**, in the
  plain register `CLAUDE.md` asks for. Several paragraphs is normal. Carry the
  reasoning and the accepted cost, not a file list — `git` already holds the
  file list, and the reasoning exists nowhere else.
- Say **`No production code changed`** when that is true. Most sessions on this
  repo are planning sessions and it is worth stating.
- End with the `Co-Authored-By` trailer.

Multi-line messages go through a file and `git commit -F`. The Bash tool here is
Git Bash, where a heredoc will corrupt the text.

**Done when the push succeeds and I have told Miguel the subject line and the
commit hash.** If the push is rejected, say so with the error and stop. Never
force.
