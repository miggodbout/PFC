# Apps Script limits on safe Sheet writes

Type: research
Status: resolved
Blocked by: none

## Question

What are the real limits and traps when a Google Apps Script web app writes to a
Sheet, for a small, single-user, offline-first app?

Find the facts. Make no decisions.

Points to find:
- Quotas and run time limits for a web app deployed to Anyone. Calls per day,
  run time per call, and what happens at the limit.
- `LockService`. How to stop two writes from clashing, and the cost of a lock.
- How a write near a cell that holds a formula behaves. Whether a
  `setValue` call can break a rollup formula, and the safe pattern.
- The cheap way to add a row and to find a row again. Compare `appendRow`,
  `getRange().setValues()`, and reading a whole column once.
- `CacheService` behaviour. The current code caches `list-projects`. Note the
  size and time limits.
- Whether a POST body of `text/plain` still avoids a CORS preflight, and any
  recent change to that.
- Any known trap with a web app that answers many small writes in a burst, which
  is what a draining offline queue looks like.

Write findings to a Markdown file in the repo and link it here.

## Answer

Full findings, with a source for every claim:
[`../research/apps-script-write-limits.md`](../research/apps-script-write-limits.md).

The facts that change the plan:

1. **No published cap on web app calls per day.** Google publishes no number for
   `doGet` or `doPost` volume. This is a documented absence, not a promise. Per
   service quotas still apply to what the script calls.
2. **6 minutes per execution. 30 simultaneous executions per user, 1,000 per
   script.** Time spent waiting for a lock counts inside the 6 minutes.
3. **The existing lock is a script lock.** `getScriptLock` blocks every write to
   every project Sheet, not only the Sheet being changed. A draining queue is
   therefore serialised end to end.
4. **A busy server looks exactly like a permanent failure.** `tryLock` returns
   `false`, and `Code.js` turns that into `{ success: false, error: 'The server
   is busy. Try again.' }`. That reply carries an HTTP 200. A queue that treats
   every `success: false` as final will drop edits that only needed a retry. The
   backend must separate "retry this" from "this will never work".
5. **A write to one cell never breaks a formula in another cell.** The real traps
   are three: a string that starts with `=` becomes a formula; `getValues()`
   returns results and not formulas, so a read-modify-write over a formula column
   flattens it; and `setValues` must match the range shape exactly.
6. **The existing code is already safe on formulas.** `readAllValues` copies only
   status, details and Last Updated. It never copies a rollup cell, and
   `rebuildTracker` regenerates every formula from `buildRollupFormula`.
7. **The existing code already finds a row the cheapest way.** It computes
   `row = FIRST_DATA_ROW + indexOfUnit(...)` from the config, so it makes zero
   extra service calls. Do not replace this with `appendRow` or a search.
   Note that the new Deficiencies tab has no such fixed row order, so finding a
   record row there is a new problem, not a solved one.
8. **CacheService: 100 KB per key, 6 hours maximum, expiry is only a suggestion.**
   The current `list-projects` key at 60 seconds is well inside every limit.
9. **`text/plain` still avoids the CORS preflight.** The Fetch Standard safelists
   it, and no Apps Script release note from 2024 to 2026 touches CORS. The real
   exposure: Google has never documented Apps Script CORS behaviour at all, so
   the technique carries no support promise. The JSONP fallback in `common.js`
   stays worth keeping.
10. **`handleListProjects` is the heavy call.** It opens every Sheet in the
    Projects folder in a loop. Only the 60 second cache keeps that off the hot
    path.

Seven points had no primary source and are recorded as open in section 9 of the
findings file.
