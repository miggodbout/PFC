# What one queued edit is, and what happens when it fails

Type: grilling
Status: resolved
Resolved: 2026-08-07
Blocked by: 03 (resolved)

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

---

## Resolution, 2026-08-07

### The outbox is a keyed shelf, not a line-up

One queued edit is **one item**, keyed `projectId|unitKey|itemKey`. A deficiency
record is **one record**, keyed by the record id the phone made in
`02-deficiencies-tab-layout`. One key holds one job. Nothing else.

Change the same item twice before it sends and the second job **replaces** the
first. Only the final value ever reaches the Sheet.

This works because every job carries the **final value, not a change to apply**.
The note at the end of `control/appscript/Code.js` already demanded that, and
`02` already demanded a phone-made record id for the same reason. Sending a job
twice writes the same cells twice, which is the same as writing them once.

A line-up was rejected. Two taps on one item end on the same Sheet value either
way, nothing in 0.2 reads the middle steps, and a line-up forces strict order,
which is exactly the part that breaks when one call fails and the next succeeds.

One field per job was rejected: the Sheet would hold half a change, and the row's
Last Updated stamp would be written twice for one edit.

One whole unit per job was rejected: the job would carry the whole row, so it
would overwrite a hand edit made straight in the Sheet on an item nobody touched.

### One call drains everything

`update-item` as a single-item action is **replaced before it is ever built**. The
0.2 backend gets one write action, `save-batch`. It takes the whole outbox as a
list of jobs, of both kinds, takes the script lock **once**, writes every job, and
answers with one result per job.

```
{ action: 'save-batch', jobs: [
    { key:'1500Main|2-204|interior_doors', kind:'item',
      projectId:'1500Main', unitKey:'2-204', itemKey:'interior_doors',
      progress:'Complete', details:'...' },
    { key:'rec|d81f-4a2', kind:'record', projectId:'1500Main', ... }
] }

-> { success:true, results:[
      { key:'1500Main|2-204|interior_doors', ok:true },
      { key:'rec|d81f-4a2', ok:false, retry:true,
        error:'The server is busy. Try again.' }
] }
```

`07-apps-script-write-limits` found the lock is a **script** lock: it blocks every
write to every project. Twelve calls means twelve lock fights end to end. One call
means one.

Rules on the batch:

- **Cap about 100 jobs per call.** More than that and the oldest 100 go first, and
  the rest go on the next drain. This keeps a call inside its 6 minute budget,
  which lock waiting eats into.
- **Jobs may span buildings.** The server groups them by project id and opens each
  Sheet once.
- **Per-job results, not one verdict for the batch.** One bad job must not poison the other
  eleven. A job with `ok:true` leaves the outbox. Every other job stays.
- **Order.** Oldest first, because it is free. There is no strict order
  requirement: the keyed shelf guarantees at most one job per target, so two jobs
  can never race for the same cells.

### Every reply says retry or do not retry

This is the fix for the fault `07` found: today a busy server and a permanent
failure look identical, so a queue that treats every `success: false` as final
throws away edits that only needed a retry.

Each job result carries `retry: true` or `retry: false`.

| Failure | retry | Why |
|---|---|---|
| `tryLock` returned false — server busy | true | Another write is running. It will end. |
| No signal, request never left the phone | true | Nothing was attempted. |
| Request timed out | true | The write may have landed. Idempotent, so a repeat is safe. |
| `Unknown action` | false | The backend is older than the app. A retry cannot fix it. |
| Not a PFC Control project | false | Wrong Sheet. |
| Unit not found | false | Admin removed it. |
| Item not found | false | Admin removed it. |
| Anything the app cannot name | true, up to a limit | See below. |

### Retry runs on a backoff, and only while jobs wait

Try at once, then after 5 seconds, 15 seconds, 1 minute, then every 5 minutes.
The timer runs **only while jobs wait, and stops dead when the outbox empties**. A
drain also runs on app open, on pull down, and when the phone reports signal is
back.

This deliberately breaks the no-timer rule from `03-local-copy-rules`. `03` was
about not **fetching** what nobody asked for. This is **finishing work you already
asked for**. The phone's `online` event is not trustworthy on iOS — it can miss a
weak or captive signal — so the timer is the safety net under it.

A flat 30 second retry was rejected. A burst on a fixed beat against a busy server
is the pattern most likely to keep losing the lock fight. Backoff exists to let a
busy server clear.

### A failed edit is held, never dropped

An edit that will not send moves to a **hold list**: the app stops retrying it, it
stays on the phone, and it shows with its reason. Miguel retries it or drops it.
The rest of the outbox keeps draining.

- **`retry: false` holds at once.**
- **An unnamed error retries, then holds after 10 tries** — about 30 minutes on the
  backoff above. Without a limit, an edit the server will never take keeps the
  waiting count above zero forever, and then the pending mark stops meaning
  anything.
- **Held is not deleted.** Only Miguel deletes an edit, by tapping Drop. This is
  the CLAUDE.md rule: never a silent loss.

Holding on the first failure was rejected. Driving through a dead zone would turn
six taps of work into six taps of housekeeping, and a dead zone costing nothing is
the whole point of the queue.

### A waiting edit paints the screen. A held edit does not.

| State | What Tracker shows for that item |
|---|---|
| Waiting | What you tapped, with a pending mark |
| Held | What the Sheet holds. The edit lives only in the hold list. |

A waiting edit is still on its way, so showing it is telling the truth early. A
held edit is not going into the Sheet, so showing it as the item's status makes
the screen lie, and the lie would survive every refresh. Worse, a rollup would
count it: a floor could read `18/18 Complete` off an edit that will never land,
and nobody else would see that floor the way Miguel does.

The same rule applies to a **record**, and so to the flags in `11-rollup-rules`: a
waiting record counts toward the Deficiency or Waiting flag right away, so logging
a problem shows a flag before the save lands. A held record stops counting.

### A fresh copy can never overwrite an unsent edit

This is the collision `03-local-copy-rules` left here.

The building copy and the outbox are **separate localStorage keys**. A fetch
replaces the building copy only. Painting happens on the way to the screen, the
way `applyItemOverrides` in `control/shared/common.js` already works: the screen
is the server copy with waiting jobs painted on top.

A job's paint is removed when, and only when, the server answers `ok: true` for
that job. So a refresh landing mid-drain changes nothing on screen.

### Retap replaces a held edit

Tap a new value on an item that already has a held edit and the held edit is
gone. The new value goes on the shelf as a fresh waiting edit with its try count
at zero, and the hold count drops by one. Same key, one job — the shelf rule,
applied everywhere.

This means retrying by hand is never strictly needed: tap the value again and it
goes. And if the failure was permanent because Admin deleted the item, the new tap
fails the same way and lands back in the hold list. No loop.

### The outbox survives a close, and holds a building on the phone

- The outbox is its own localStorage key. Close the app with edits waiting and
  they are there on the next open.
- **A drain runs before the refresh fetch on app open.** Send first, then ask.
- **A building holding a waiting or held edit is never dropped from the phone.**
  It is exempt from the ten-building limit in `03-local-copy-rules`, and from any
  archive drop `14-building-archive` decides. Dropping the copy while the edit
  needs it would strand the edit's only description of what it means.

### Not decided here

- **What any of this looks like.** The pending mark, the hold list screen, the
  offline sign and the waiting count all belong to `05-pending-state-ui`, which
  this ticket unblocks.
- **A hand edit in the Sheet losing to a queued edit.** Last write wins, and there
  is no author to ask. The map already rules two people editing one unit out of
  scope for 0.2.
