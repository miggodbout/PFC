# What one queued edit is, and what happens when it fails

Type: grilling
Status: open
Blocked by: 03

## Question

What is the unit of work in the outbox, and what are the rules when a send
fails?

Points to settle:
- What one queued edit holds. One field change, one item, or one whole unit.
- What happens when the same item is changed twice before the first send
  succeeds. Replace the earlier edit, or send both in order.
- The retry rule. How often, how many times, and what triggers a retry.
- What the app does when an edit never sends. It must not vanish. Options are a
  hold list the user can see and act on, or an endless retry.
- The order rule. Whether edits must reach the Sheet in the order they were
  made.
- What happens when the app is closed with edits still waiting.
- Whether the queue sends one edit per call, or gathers a unit's edits into one
  call. The backend cost per call is high, so this matters.

## Facts already settled by research

From `07-apps-script-write-limits`:
- A busy server and a permanent failure look the same today. `tryLock` returns
  `false`, and the backend turns that into `{ success: false, error: 'The server
  is busy. Try again.' }` with an HTTP 200. A queue that treats every
  `success: false` as final will throw away edits that only needed a retry. The
  backend must mark a reply as "retry this" or "this will never work", and this
  ticket must say which errors fall on which side.
- The existing lock is a script lock. It blocks every write to every project
  Sheet, so a draining queue runs one edit at a time, end to end.
- Each call gets 6 minutes, and lock waiting counts inside that budget.
- "Server error occurred, please try again" is an expected error from Google. A
  burst raises the chance of hitting it.
- The note at the end of `control/appscript/Code.js` already states that
  `update-item` must be idempotent and must carry the final value, not a change
  to apply. That property is what makes a retry safe. Keep it.
