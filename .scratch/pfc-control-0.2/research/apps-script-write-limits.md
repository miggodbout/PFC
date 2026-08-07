# Apps Script limits on safe Sheet writes — findings

Type: research findings
Answers: `../issues/07-apps-script-write-limits.md`
Date gathered: 2026-08-06

This file records facts only. It makes no decision and gives no recommendation.
Every claim carries a source URL. Where Google publishes no answer, the file says
so plainly.

Code under review: `C:\Users\Dako\Projects\PFC\control\appscript\Code.js`.

---

## 1. Quotas and run-time limits

### What Google publishes

Google puts every published number on one page.
Source: https://developers.google.com/apps-script/guides/services/quotas

Relevant rows, quoted from the "Current limitations" table:

| Feature | Consumer account | Google Workspace |
|---|---|---|
| Script runtime | 6 min / execution | 6 min / execution |
| Custom function runtime | 30 sec / execution | 30 sec / execution |
| Simultaneous executions per user | 30 / user | 30 / user |
| Simultaneous executions per script | 1,000 | 1,000 |
| Properties value size | 9 KB / val | 9 KB / val |
| Properties total storage | 500 KB / property store | 500 KB / property store |
| Triggers | 20 / user / script | 20 / user / script |
| URL Fetch POST size | 50 MB / call | 50 MB / call |
| Versions | 200 / script | 200 / script |

Relevant rows from the daily "Quotas" table:

| Feature | Consumer account | Google Workspace |
|---|---|---|
| Spreadsheets created | 250 / day | 3,200 / day |
| URL Fetch calls | 20,000 / day | 100,000 / day |
| Triggers total runtime | 90 min / day | 6 hr / day |

Source for all rows: https://developers.google.com/apps-script/guides/services/quotas

### Calls per day for a web app

**Google publishes no per-day limit on web app requests.** The quotas page has no
row for `doGet`, `doPost`, web app calls, or web app executions. I checked the
quotas page and the web apps guide. Neither states a number.

Sources:
- https://developers.google.com/apps-script/guides/services/quotas
- https://developers.google.com/apps-script/guides/web

This is a documented absence, not proof that no limit exists. Google does apply
per-service quotas to the services the script calls. Read section 7.

### What happens at the limit

The quotas page states that the script "throws an exception and execution stops"
when it passes a quota or a limit. The page gives the example message
"Limit exceeded: Email Attachments Per Message."
Source: https://developers.google.com/apps-script/guides/services/quotas

The troubleshooting page lists the matching runtime error:
"Service invoked too many times: <action name>" — cause: "you exceeded your daily
quota for an action".
Source: https://developers.google.com/apps-script/guides/support/troubleshooting

The quotas page also states that quotas reset 24 hours after the first request.
Source: https://developers.google.com/apps-script/guides/services/quotas

### Who the quota belongs to, with access "Anyone"

The web apps guide names two permission settings:
- "Execute the app as me—In this case, the script always executes as you, the
  owner of the script, no matter who accesses the web app."
- "Execute the app as user accessing the web app—In this case, the script runs
  under the identity of the active user using the web app."

Source: https://developers.google.com/apps-script/guides/web

**Not definitively documented:** the quotas page says "Simultaneous executions per
user: 30 / user", but it does not say which user counts when a web app runs as the
owner and many anonymous people call it. I could not find an official sentence
that resolves this. Do not treat any number here as settled.

---

## 2. LockService

### What the API is

"This service allows scripts to prevent concurrent access to sections of code.
This can be useful when you have multiple users or processes modifying a shared
resource and want to prevent collisions."
Source: https://developers.google.com/apps-script/reference/lock

Three kinds of lock:
- `getScriptLock()` — "Gets a lock that prevents any user from concurrently
  running a section of code."
- `getUserLock()` — "Gets a lock that prevents the current user from concurrently
  running a section of code."
- `getDocumentLock()` — "Gets a lock that prevents any user of the current
  document from concurrently running a section of code." It returns `null`
  outside a document context.

Source: https://developers.google.com/apps-script/reference/lock/lock-service

Google states that the lock object alone does nothing: "The lock is not actually
acquired until `Lock.tryLock(timeoutInMillis)` or `Lock.waitLock(timeoutInMillis)`
is called."
Source: https://developers.google.com/apps-script/reference/lock/lock-service

### The two ways to take a lock

- `tryLock(timeoutInMillis)` — "Attempts to acquire the lock, timing out after the
  provided number of milliseconds." Returns `true` on success and `false` on
  failure.
- `waitLock(timeoutInMillis)` — "Attempts to acquire the lock, timing out with an
  exception after the provided number of milliseconds." It throws an `Error`
  instead of returning `false`.
- `hasLock()` — returns `true` if the lock was acquired.
- `releaseLock()` — "Releases the lock, allowing other processes waiting on the
  lock to continue."

Source: https://developers.google.com/apps-script/reference/lock/lock

### The cost of a lock

Google's documented pattern is short:

```js
const lock = LockService.getScriptLock();
lock.waitLock(10000);
// Do some work on a shared resource.
lock.releaseLock();
```

Source: https://developers.google.com/apps-script/reference/lock/lock-service

Google also states: "The lock is automatically released when the script
terminates."
Source: https://developers.google.com/apps-script/reference/lock/lock

**Google publishes no timing cost for taking a lock.** There is no benchmark and
no quota row for LockService. The real cost is the wait. A script lock serialises
every caller, so caller number two waits for the whole of caller number one.

### What the current code already does

`Code.js` uses the pattern in two places, `handleCreateProject` (line 343) and
`handleUpdateStructure` (line 407):

```js
var lock = LockService.getScriptLock();
if (!lock.tryLock(30000)) {
  return { success: false, error: 'The server is busy. Try again.' };
}
try { /* ... */ } finally { lock.releaseLock(); }
```

Two facts follow from the documentation above:
- The lock is a **script** lock. It blocks every write to every project Sheet, not
  only the one Sheet being changed.
- The failure path returns a normal success-shaped reply with `success: false`.
  A caller cannot tell this apart from a permanent error by HTTP status alone.

The read actions (`handleListProjects`, `handleGetStructure`, `handleGetUnit`)
take no lock.

---

## 3. Writes near a formula

### Does a write to one cell break a formula in another cell?

No. `setValue` and `setValues` write only inside the range you name.
`getRange(row, column, numRows, numColumns)` "Returns the range with the top left
cell at the given coordinates with the given number of rows and columns."
Source: https://developers.google.com/apps-script/reference/spreadsheet/sheet

A formula in a neighbouring cell stays a formula. Sheets recalculates it.

### Where the real break happens

Three documented behaviours cause the trap:

1. **A string that starts with `=` becomes a formula.** The Range documentation
   states that the value "can be numeric, string, boolean or date. If it begins
   with '=' it is interpreted as a formula."
   Source: https://developers.google.com/apps-script/reference/spreadsheet/range
   (This is how `Code.js` writes its rollups. See `buildRollupFormula`, line 1048,
   and the `setValues` call at line 833.)

2. **`getValues()` returns results, not formulas.** `getFormulas()` is the
   separate method: "Returns the formulas (A1 notation) for the cells in the
   range."
   Source: https://developers.google.com/apps-script/reference/spreadsheet/range

   So a read-modify-write over a block that contains formula cells destroys those
   formulas. `getValues` gives you the text "Deficiency". Writing that text back
   replaces `=IF(...)` with the plain word.

3. **`setValues` must match the range size exactly.** Google's Range page states
   that if the shape of the array does not match the range, the call aborts and
   returns an error.
   Source: https://developers.google.com/apps-script/reference/spreadsheet/range

### The safe pattern that follows from the documentation

Write to the exact cell or cells you own. Never include a formula column inside
the range you pass to `setValues` unless you intend to rewrite the formula.
If you must read a wide block and write it back, read the formula columns with
`getFormulas()` and write them back with `setFormulas()`, or leave those columns
out of the write range.

### What the current code already does

- `readAllValues` (line 1069) reads the whole row block with one `getValues()`
  call, but it copies **only** the status, details and Last Updated cells into
  `preserved`. It never copies a rollup cell. `rebuildTracker` then writes fresh
  rollup formulas from `buildRollupFormula`. The formulas are regenerated, not
  preserved, so no formula is ever written back as flat text.
- `readOverallColumn` (line 1095) reads the Overall column with `getValues()`.
  It only reads. It never writes that column back.
- The rollup columns and the Overall column hold formulas. The status and details
  columns do not. The two never share a column.

### One more documented hazard

`resizeSheet` (line 1104) calls `insertRowsAfter`, `deleteRows`,
`insertColumnsAfter` and `deleteColumns`. Inserting or deleting rows and columns
moves cells, and Sheets rewrites formula references to follow them. `Code.js`
avoids the problem by rebuilding every formula from scratch after the resize.

---

## 4. Adding a row, and finding a row again

### appendRow

"Appends a row to the bottom of the current data region in the sheet."
Source: https://developers.google.com/apps-script/reference/spreadsheet/sheet

The documentation says nothing about locking, nothing about concurrency, and
nothing about speed. It defines the target as "the current data region", which
depends on where content already sits, not on a fixed row number.

Related:
- `getLastRow()` — "Returns the position of the last row that has content."
- `getDataRange()` — "Returns a Range corresponding to the dimensions in which
  data is present."

Source: https://developers.google.com/apps-script/reference/spreadsheet/sheet

### The cost model Google publishes

Google's best practices page states the rule: "Using JavaScript operations within
your script is faster than calling other services." It tells you to read all data
into an array with one command, work on the array in memory, and write back with
one command. It states that "Alternating read and write commands is slow."

The page gives one measured example. A script that loops over 10,000 cells with
one write per cell takes about **70 seconds**. The same work done with one batched
`getRange()` read and one `setBackgrounds()` write takes about **1 second**.

Source: https://developers.google.com/apps-script/guides/support/best-practices

### The comparison, stated from those facts

| Approach | Service calls for N rows | Documented note |
|---|---|---|
| `appendRow` per row | N | Target depends on current data region |
| `getRange(...).setValues(...)` once | 1 | Array shape must match the range exactly |
| Read a column once into memory, then search in JavaScript | 1 read | Google's stated fast path |

**Google publishes no benchmark that compares `appendRow` against `setValues`
directly.** The 70-second and 1-second figures above come from a different
example (cell backgrounds). Do not quote them as an `appendRow` measurement.

### What the current code already does

`Code.js` never appends. It computes the row number from the config:

```js
var index = indexOfUnit(config, unitKey);   // position in the config
var row    = FIRST_DATA_ROW + index;        // line 293
```

`FIRST_DATA_ROW` is 7 (line 83). The row number comes from the order of units in
`_Config`, so the code needs no search and no read to find a row. This is the
cheapest of the three approaches, because it makes zero extra service calls.

`handleGetUnit` then reads that one row with a single `getRange().getValues()`
call (line 296). `readAllValues` reads the whole unit block with a single call
(line 1077). Both already follow the batched pattern.

---

## 5. CacheService

### Published limits

| Limit | Value |
|---|---|
| Maximum key length | 250 characters |
| Maximum data per key | 100 KB |
| Minimum expiration | 1 second |
| Maximum expiration | 21,600 seconds (6 hours) |
| Default expiration | 600 seconds (10 minutes) |
| Cap on cached items | 1,000 |

Source: https://developers.google.com/apps-script/reference/cache/cache

Google states that expiration is not a promise: "The specified expiration time is
only a suggestion; cached data may be removed before this time if a lot of data is
cached."
Source: https://developers.google.com/apps-script/reference/cache/cache

Google also states that when a script passes 1,000 items, "the cache stores the
900 items farthest from expiration."
Source: https://developers.google.com/apps-script/reference/cache/cache

Method descriptions:
- `put(key, value)` — "Adds a key/value pair to the cache."
- `put(key, value, expirationInSeconds)` — "Adds a key/value pair to the cache,
  with an expiration time (in seconds)."
- `get(key)` — "Gets the cached value for the given key, or `null` if none is
  found."
- `remove(key)` — "Removes an entry from the cache using the given key."
- `putAll(values)` — "Adds a set of key/value pairs to the cache."

Source: https://developers.google.com/apps-script/reference/cache/cache

**Not definitively documented:** what happens when a value passes 100 KB. Google
states the limit but does not state whether `put` throws, truncates, or silently
drops the entry. I could not find an official sentence.

### What the current code already does

`handleListProjects` (line 175) uses `CacheService.getScriptCache()` with the
single key `'list-projects'` and `LIST_CACHE_SECONDS = 60` (line 86).
Both write handlers call `CacheService.getScriptCache().remove('list-projects')`
after they finish (lines 369 and 431).

Facts that apply from the limits above:
- 60 seconds sits well inside the 1-to-21,600-second range.
- The whole project list goes into **one** key. The 100 KB cap applies to that one
  key, not to the list as a whole set of entries. The cached value is
  `JSON.stringify({ success: true, projects: [...] })`, and each project carries
  `id`, `name`, `mode`, `url`, `unitCount`, `groupCount` and `overall`. Roughly
  250 bytes per project, so about 400 projects would reach 100 KB. That figure is
  my arithmetic from the field list, not a Google statement.
- `getScriptCache` is the script-wide cache, so every caller shares the entry.
  This matches `getScriptLock`, which is also script-wide.
  Source: https://developers.google.com/apps-script/reference/cache/cache-service

---

## 6. POST with Content-Type text/plain and CORS preflight

### The rule, from the specification

The Fetch Standard defines a CORS-safelisted request-header. For `Content-Type`
it states: "If mimeType's essence is not 'application/x-www-form-urlencoded',
'multipart/form-data', or 'text/plain', then return false."
Source: https://fetch.spec.whatwg.org/

MDN lists the same three values and states the full set of conditions for a
request that sends no preflight. The allowed methods are `GET`, `HEAD` and `POST`.
The only headers you may set by hand are `Accept`, `Accept-Language`,
`Content-Language`, `Content-Type` (limited to the three types above) and `Range`.
No listener may sit on `XMLHttpRequest.upload`, and no `ReadableStream` may act as
the body. MDN records this page as last modified 30 November 2025.
Source: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS

**Answer: yes.** A `POST` with `Content-Type: text/plain` is still a simple
request. The browser sends no `OPTIONS` preflight. The rule lives in the Fetch
Standard, which is a living standard, and the three-type list has not changed.

### Any recent change

I read the Apps Script release notes for 2024, 2025 and 2026. **No entry mentions
CORS, `OPTIONS`, `doGet`, `doPost`, `ContentService`, web app serving, or web app
redirects.** The entries in that window cover Gemini, Vertex AI, the Maps service,
Calendar, Spreadsheet features, the Rhino runtime deprecation, granular OAuth, and
Chat.
Source: https://developers.google.com/apps-script/release-notes

The Apps Script web apps guide contains **no** mention of CORS, of `OPTIONS`
requests, or of the `script.googleusercontent.com` redirect.
Source: https://developers.google.com/apps-script/guides/web

**Not definitively documented:** Google has never published how an Apps Script web
app handles CORS. The `text/plain` technique is widely used and it follows from
the Fetch Standard, but Google states no support promise for it. A change to how
Apps Script serves web apps could break it without a release note. That is a real
exposure, and the documentation gives no protection against it.

Community write-ups describe two further behaviours that Google does not document:
an Apps Script web app does not answer `OPTIONS` unless the script defines
`doOptions`, and a web app reply arrives through a redirect to
`script.googleusercontent.com`. Treat both as unconfirmed by Google.
Sources (secondary, listed only for traceability):
- https://iith.dev/blog/app-script-cors/
- https://groups.google.com/g/google-apps-script-community/c/zJpevovcFLA

### What the current code already does

`doPost` (line 127) parses `e.postData.contents` as JSON. The comment at line 123
states the intent: "The app sends Content-Type text/plain so the browser makes a
simple request and skips the CORS preflight."

`doGet` (line 102) routes every action too, including the two write actions, and
supports a JSONP `callback` parameter through `respond` (line 156). That gives a
second path when a POST reply fails. The comment at line 96 records the reason.

---

## 7. Traps with a burst of small writes

A draining offline queue sends many small POST calls close together. These facts
apply.

1. **A script lock serialises the burst.** `getScriptLock` "prevents any user from
   concurrently running a section of code."
   Source: https://developers.google.com/apps-script/reference/lock/lock-service
   With the current 30-second `tryLock`, caller number two waits. Total wall time
   grows with queue length.

2. **A refused lock is a normal reply, not an error status.** `tryLock` returns
   `false`.
   Source: https://developers.google.com/apps-script/reference/lock/lock
   `Code.js` turns that into `{ success: false, error: 'The server is busy. Try
   again.' }`. A queue that treats every `success: false` the same way cannot tell
   "retry this" apart from "this will never work".

3. **Concurrency has a published ceiling.** "Simultaneous executions per user:
   30 / user" and "Simultaneous executions per script: 1,000".
   Source: https://developers.google.com/apps-script/guides/services/quotas

4. **Each call has its own 6-minute budget.** "Script runtime: 6 min / execution".
   Source: https://developers.google.com/apps-script/guides/services/quotas
   Time spent waiting for a lock counts inside that 6 minutes, because the wait
   happens inside the execution.

5. **Passing a quota throws and stops the execution.** The quotas page states that
   a script "throws an exception and execution stops", and the troubleshooting
   page names the runtime error "Service invoked too many times: <action name>".
   Sources:
   https://developers.google.com/apps-script/guides/services/quotas ,
   https://developers.google.com/apps-script/guides/support/troubleshooting

6. **"Server error occurred, please try again" is an official, expected error.**
   The troubleshooting page lists "Server not available" and "Server error
   occurred, please try again", and names temporary Google server unavailability
   as a cause.
   Source: https://developers.google.com/apps-script/guides/support/troubleshooting
   A burst raises the chance of hitting it at least once.

7. **"Too many simultaneous invocations: Spreadsheets" is real but undocumented.**
   This error appears in Google's public Issue Tracker, for example issues
   161091247, 374073846 and 374034247. It does not appear in the troubleshooting
   page or the quotas page. I could not read the tracker entries, because the
   tracker requires a sign-in. Treat the error as observed behaviour with no
   published limit behind it.
   Sources:
   https://issuetracker.google.com/issues/161091247 ,
   https://issuetracker.google.com/issues/374073846 ,
   https://issuetracker.google.com/issues/374034247

8. **Repeated small writes are the slow pattern Google warns about.** "Alternating
   read and write commands is slow." Google's example shows 10,000 single-cell
   writes at about 70 seconds against one batched write at about 1 second.
   Source: https://developers.google.com/apps-script/guides/support/best-practices
   A burst of queued writes is that same pattern spread across executions instead
   of across one loop.

9. **The 0.2 plan already assumes retries.** The note at line 1300 of `Code.js`
   states that `update-item` "must be idempotent, because the app will retry it
   after a dropped connection", and that the call "carries the final value, not a
   change to apply". That property is what makes a retry safe. It is a design note
   in the file, not a Google fact.

10. **Cost per call in the current code.** Every call runs `SpreadsheetApp
    .openById`, then `readConfig` (one `getRange('A1').getValue()`), then reads.
    `handleListProjects` is the heaviest: it opens **every** Sheet in the Projects
    folder inside a `while` loop (line 186), and reads the config and the Overall
    column of each. The 60-second cache is the only thing that keeps that off the
    hot path.

---

## 8. Sheet size limits (background)

Google Sheets holds "Up to 10 million cells or 18,278 columns (column ZZZ) for
spreadsheets that are created in or converted to Google Sheets."
Source: https://support.google.com/drive/answer/37603

`computeLayout` (line 638) gives 2 columns, plus 2 per item, plus 1 per phase,
plus 2. With 18 items and 4 phases that reaches column AR (44). A PFC Control
project is far below every Sheets limit.

---

## 9. Things I could not answer

State these as open, not as risks that are ruled out.

1. Whether Google enforces any per-day cap on web app requests. No published
   number exists on the quotas page or the web apps guide.
2. Which account the "30 simultaneous executions per user" cap charges when a web
   app runs as the owner and anonymous people call it.
3. What `Cache.put` does when a value passes 100 KB. Google states the limit and
   not the failure mode.
4. Whether `appendRow` takes an internal lock, or how two concurrent `appendRow`
   calls behave. The Sheet reference says nothing about concurrency.
5. Any measured cost for taking a LockService lock. Google publishes none.
6. Whether Google promises that `text/plain` will keep working against Apps
   Script web apps. Google has never documented Apps Script CORS behaviour at all.
7. The exact content of the Issue Tracker entries about "Too many simultaneous
   invocations". The tracker requires a sign-in.

---

## Source list

Primary, Google Apps Script:
- Quotas and limits — https://developers.google.com/apps-script/guides/services/quotas
- Web apps guide — https://developers.google.com/apps-script/guides/web
- Deployments — https://developers.google.com/apps-script/concepts/deployments
- Best practices — https://developers.google.com/apps-script/guides/support/best-practices
- Troubleshooting — https://developers.google.com/apps-script/guides/support/troubleshooting
- Release notes — https://developers.google.com/apps-script/release-notes
- Lock Service — https://developers.google.com/apps-script/reference/lock
- Class LockService — https://developers.google.com/apps-script/reference/lock/lock-service
- Class Lock — https://developers.google.com/apps-script/reference/lock/lock
- Class Cache — https://developers.google.com/apps-script/reference/cache/cache
- Class CacheService — https://developers.google.com/apps-script/reference/cache/cache-service
- Class Range — https://developers.google.com/apps-script/reference/spreadsheet/range
- Class Sheet — https://developers.google.com/apps-script/reference/spreadsheet/sheet

Primary, web platform:
- Fetch Standard — https://fetch.spec.whatwg.org/
- MDN CORS — https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS

Primary, Google Sheets product:
- Files you can store in Google Drive — https://support.google.com/drive/answer/37603

Secondary, listed for traceability only:
- https://iith.dev/blog/app-script-cors/
- https://groups.google.com/g/google-apps-script-community/c/zJpevovcFLA
- https://issuetracker.google.com/issues/161091247
- https://issuetracker.google.com/issues/374073846
- https://issuetracker.google.com/issues/374034247
