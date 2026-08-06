# Browser storage limits for a PWA on iOS Safari

Research note for issue `08-ios-pwa-storage-limits.md`.
Written 2026-08-06. Facts only. This file makes no decision for PFC Control.

Sources are ranked. WebKit blog and Apple documentation first. Then MDN. Then
web.dev. Every claim below shows its source and the source date. Storage rules
changed a lot between iOS 13 and iOS 17, so an undated claim is not safe.

---

## 1. Short answer

- On iOS 17 and later, an installed home screen web app gets a large quota. The
  quota is a share of the disk, not a fixed number of megabytes.
- The old 1 GB per site limit ended with Safari 17.
- `localStorage` is the exception. It stays at about 5 MB per site.
- iOS deletes script-written storage after 7 days without user interaction. An
  installed home screen web app is exempt from that rule.
- `navigator.storage.persist()` works on iOS. WebKit grants it by heuristic, and
  "the site runs as a Home Screen Web App" is one of the heuristics.

---

## 2. Size limits

### 2.1 iOS 17 and later (current rule)

WebKit changed the quota model in Safari 17 / iOS 17.

| Scope | Limit |
|---|---|
| One origin, inside a browser app | up to 60% of total disk space |
| One origin, inside another app (WKWebView) | up to 15% of total disk space |
| All origins together, browser app | up to 80% of total disk space |
| All origins together, other apps | up to 20% of total disk space |
| A cross-origin frame | 10% of the main frame origin quota |

Source: [Updates to Storage Policy, WebKit blog, Sihui Liu, 2023](https://webkit.org/blog/14403/updates-to-storage-policy/).
The post states the rule starts "in Safari 17.0, and in WebKit apps for iOS 17,
iPadOS 17 and macOS Sonoma". The byline on the post reads August 10, 2023. Some
search indexes date it September 2023. Treat it as 2023.

A home screen web app is not penalised. The same post states: "When a web app is
running standalone (as Home Screen Web App on iOS or Web App added to dock on
macOS), it has the same origin quota and overall quota as when it is opened in a
browser app."
Source: [Updates to Storage Policy, WebKit blog, 2023](https://webkit.org/blog/14403/updates-to-storage-policy/).

MDN repeats these figures for WebKit on macOS 14+ and iOS 17+.
Source: [Storage quotas and eviction criteria, MDN](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria).

### 2.2 What counts against the quota

The WebKit post lists the storage types under the quota: "localStorage, Cache
API, IndexedDB, Service Worker, and File System". Cookies and the HTTP cache are
not counted.
Source: [Updates to Storage Policy, WebKit blog, 2023](https://webkit.org/blog/14403/updates-to-storage-policy/).

MDN gives the same list, and adds Origin Private File System and WebAssembly
code caching.
Source: [Storage quotas and eviction criteria, MDN](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria).

### 2.3 localStorage and sessionStorage size

MDN gives the Web Storage limit as 10 MiB per origin in all browsers: 5 MiB for
`localStorage` and 5 MiB for `sessionStorage`. Over that limit the browser
throws `QuotaExceededError`.
Source: [Storage quotas and eviction criteria, MDN](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria).

Note the conflict. WebKit counts `localStorage` inside the large origin quota,
but the 5 MB Web Storage cap still applies on top. I found no WebKit page that
states an exact `localStorage` byte figure for iOS. Treat 5 MB as the working
number, from MDN only.

### 2.4 Before iOS 17 (old rule, for context)

Before Safari 17 an origin started with a 1 GB limit. Over that limit, the write
failed in a Home Screen web app, or Safari asked the user to raise the quota.
Source: [Updates to Storage Policy, WebKit blog, 2023](https://webkit.org/blog/14403/updates-to-storage-policy/).

web.dev gives the same figure with the prompt step: "Safari (both desktop and
mobile) appears to allow about 1GB. When the limit is reached, Safari will
prompt the user, increasing the limit in 200MB increments."
Source: [Storage for the web, web.dev, last updated 2024-09-23](https://web.dev/articles/storage-for-the-web).
This web.dev text is now out of date for iOS 17 and later. It still describes
the behaviour a device on iOS 16 or older will show.

### 2.5 Measuring the quota from code

`navigator.storage.estimate()` reports usage and quota. Safari added it in
Safari 17. Safari 15.2 through 16 do not have it.
Source: [MDN browser-compat-data, api/StorageManager.json](https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/StorageManager.json).

MDN warns the returned values are padded for privacy. They are estimates.
Source: [Storage quotas and eviction criteria, MDN](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria).

---

## 3. The eviction rules

iOS has two separate rules. Both can delete data. Do not confuse them.

### 3.1 Rule A — the 7 day cap (Intelligent Tracking Prevention)

WebKit states the rule word for word:

> "Trackers executing script in the first-party context often make use of
> first-party storage to save and recall cross-site tracking information.
> Therefore, ITP deletes all cookies created in JavaScript and all other
> script-writeable storage after 7 days of no user interaction with the website.
> The latter storage forms are:
>
> * IndexedDB
> * LocalStorage
> * Media keys
> * SessionStorage
> * Service Worker registrations and cache"

Source: [Tracking Prevention in WebKit, webkit.org](https://webkit.org/tracking-prevention/). This page is the living policy page. It has no single publication date.

Conditions to know:

- The count is 7 days **of Safari use**, not 7 calendar days. A phone left in a
  drawer does not burn the days.
  Source: [Full Third-Party Cookie Blocking and More, WebKit blog, John Wilander, 2020-03-24](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/).
- User interaction resets the timer. WebKit states that scrolling is not user
  interaction. A tap, a click or a key press is.
  Source: [Tracking Prevention in WebKit, webkit.org](https://webkit.org/tracking-prevention/).
- The rule deletes the Service Worker registration and its Cache API data too.
  The whole offline shell goes, not only the app data.
  Source: [Tracking Prevention in WebKit, webkit.org](https://webkit.org/tracking-prevention/).

### 3.2 An installed home screen web app is exempt from rule A

This is the important finding. WebKit states it word for word:

> "The first-party domain of home screen web applications is exempt from ITP's
> 7-day cap on all script-writeable storage, i.e. ITP always skips that domain
> in its website data removal algorithm. In addition, the website data of home
> screen web applications is kept isolated from Safari and thus will not be
> affected by ITP's classification of tracking behavior in Safari."

Source: [Tracking Prevention in WebKit, webkit.org](https://webkit.org/tracking-prevention/).

The 2020 blog post that introduced the 7 day cap says the same, and adds that
Apple treats deletion inside a home screen web app as a bug:

> Home screen web apps keep "their own counter of days of use". "We do not
> expect the first-party in such a web application to have its website data
> deleted." Apple asks developers to report such deletion as "a serious bug".

Source: [Full Third-Party Cookie Blocking and More, WebKit blog, John Wilander, 2020-03-24](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/).

So the difference between a tab and an installed app is large:

| | Safari tab | Installed home screen app |
|---|---|---|
| 7 day storage wipe | Yes | No, exempt |
| Storage shared with Safari | Yes | No, isolated |

web.dev states the same conclusion in plainer words: "Safari will evict all
content from the cache after seven days of Safari use if the user does not
interact with the site. This eviction policy does not apply to installed PWAs."
Source: [Storage for the web, web.dev, last updated 2024-09-23](https://web.dev/articles/storage-for-the-web).

### 3.3 Rule B — quota eviction (least recently used)

Separate from ITP, WebKit removes whole origins when the device runs short of
space or the overall quota is passed.

- "Eviction means automatic website data deletion that is not initiated by the
  user or website."
- WebKit picks victims by a least-recently-used policy. It uses "the time of the
  last user interaction, or the time of the last storage operation".
- An origin escapes eviction if it has an active page at that moment, or if its
  storage is in persistent mode.

Source: [Updates to Storage Policy, WebKit blog, 2023](https://webkit.org/blog/14403/updates-to-storage-policy/).

MDN adds that when an origin is evicted, all of its data goes at once. IndexedDB,
Cache API and OPFS are deleted together, not one at a time.
Source: [Storage quotas and eviction criteria, MDN](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria).

### 3.4 What the user can still do

The user can always delete the data by hand. Persistent mode does not block a
user action. MDN states persistent data is "only deleted if the user explicitly
removes it via browser settings".
Source: [Storage quotas and eviction criteria, MDN](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria).

**Not confirmed.** I did not find an Apple page that states whether "Clear
History and Website Data" in iOS Settings also clears the storage of an
installed home screen web app. WebKit says that storage is isolated from Safari,
which suggests it is separate, but the WebKit page does not answer the question.
Do not assume either way.

---

## 4. navigator.storage.persist() on iOS

Yes, it exists on iOS Safari.

- Safari and Safari on iOS added `persist()` and `persisted()` in **Safari 15.2**.
  Source: [MDN browser-compat-data, api/StorageManager.json](https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/StorageManager.json).
- WebKit decides without asking the user: "WebKit currently grants a request
  based on heuristics like whether the website is opened as a Home Screen Web
  App."
  Source: [Updates to Storage Policy, WebKit blog, 2023](https://webkit.org/blog/14403/updates-to-storage-policy/).
- What it buys: the origin moves to persistent mode, and WebKit excludes
  persistent mode origins from automatic eviction.
  Source: [Updates to Storage Policy, WebKit blog, 2023](https://webkit.org/blog/14403/updates-to-storage-policy/).
- `persist()` needs a secure context (HTTPS). It is not available in Web Workers.
  Source: [StorageManager.persist(), MDN](https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist).

Two limits on this answer:

1. WebKit publishes no exact list of heuristics. "Like whether the website is
   opened as a Home Screen Web App" is the only example WebKit gives. There is
   no primary source that promises a grant.
2. WebKit does not state whether persistent mode also overrides the ITP 7 day
   cap for a plain Safari tab. The two rules are documented on separate pages.
   I found no primary source that links them. Assume nothing here.

---

## 5. Does data survive a Service Worker update?

Short answer: yes, unless your own code deletes it.

- Cache API caches are not tied to a Service Worker version. The browser does
  not clear old caches when a new worker installs. The developer must delete
  them, normally in the `activate` event. MDN: "While there are open pages that
  are controlled by the previous version of the worker, you need to keep both
  caches ... You can use the `activate` event to remove data from the previous
  caches."
  Source: [Using Service Workers, MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers).
- IndexedDB and `localStorage` are origin storage. They do not belong to the
  Service Worker registration. A worker update does not touch them.
  Source: [Using Service Workers, MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers)
  and [Storage quotas and eviction criteria, MDN](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria).

Two warnings:

- ITP deletion is different. When ITP runs on a non-exempt site, it removes the
  Service Worker registration **and** its cache, together with IndexedDB and
  Web Storage. That is a wipe of everything, not a version change.
  Source: [Tracking Prevention in WebKit, webkit.org](https://webkit.org/tracking-prevention/).
- Quota eviction is also different. It deletes the whole origin at once.
  Source: [Storage quotas and eviction criteria, MDN](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria).

**Not confirmed.** I found no primary source that says whether
`registration.unregister()` deletes Cache API data on WebKit. MDN does not state
it. Do not rely on unregister to clean up.

---

## 6. Private Browsing

- Safari Private Browsing uses an ephemeral session. Nothing persists. The data
  goes when the user closes the tab, quits the browser, or restarts the device.
  Safari also uses a separate ephemeral session for each private tab, so tabs do
  not see each other.
  Source: [Private Browsing 2.0, WebKit blog, John Wilander and others, 2024-07-16](https://webkit.org/blog/15697/private-browsing-2-0/), covering Safari 17.0, 17.2 and 17.5.
- The same post states the general rule for `sessionStorage`: "Session Storage is
  a storage area in Safari that is scoped to the current tab. When a tab in
  Safari is closed, all of the session storage associated with it is destroyed."
  Source: [Private Browsing 2.0, WebKit blog, 2024-07-16](https://webkit.org/blog/15697/private-browsing-2-0/).
- MDN records that a browser may apply a different, smaller quota in a private
  session, and deletes the data at the end of the session.
  Source: [Storage quotas and eviction criteria, MDN](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria).

### Can an installed PWA end up in Private Browsing?

**No definitive primary answer found.** I searched WebKit and Apple developer
documentation. Neither states that a home screen web app can run in a private or
ephemeral session, and neither states that it cannot.

What the primary sources do say:

- A home screen web app keeps its website data isolated from Safari.
  Source: [Tracking Prevention in WebKit, webkit.org](https://webkit.org/tracking-prevention/).
- Private Browsing in Safari is per tab, inside the Safari browser app.
  Source: [Private Browsing 2.0, WebKit blog, 2024-07-16](https://webkit.org/blog/15697/private-browsing-2-0/).

Those two facts point to a home screen web app running in its own normal,
persistent container, not a private one. That is an inference, not a documented
guarantee. Do not record it as a fact.

The practical risk is the reverse case. If a crew member opens the site in a
Safari private tab instead of the installed icon, that session writes nothing
that lasts.

---

## 7. The sessionStorage trap in a home screen web app

The current code in `C:\Users\Dako\Projects\PFC\control\shared\common.js` uses
`sessionStorage` in the `Store` object (lines 285 to 343). It writes to the key
`pfc.control.v1.local`. Here are the facts that apply to that choice.

1. `sessionStorage` lives only for a page session. MDN: "A page session lasts as
   long as the tab or the browser is open, and survives over page reloads and
   restores." And: "Closing the tab/window ends the session and clears the data
   in `sessionStorage`."
   Source: [Window.sessionStorage, MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage).
2. `sessionStorage` is scoped per top-level browsing context. A new tab or a new
   window starts empty. MDN: "Opening a page in a new tab or window creates a
   new session".
   Source: [Window.sessionStorage, MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage).
3. WebKit repeats the tab scope rule: session storage is "scoped to the current
   tab", and iOS destroys it when the tab closes.
   Source: [Private Browsing 2.0, WebKit blog, 2024-07-16](https://webkit.org/blog/15697/private-browsing-2-0/).
4. A home screen web app has one window. When iOS ends that window, the page
   session ends, and `sessionStorage` goes with it. This follows from points 1
   to 3.
5. Storage written in Safari is not visible in the installed app, and the
   reverse. The installed app has its own isolated website data.
   Source: [Tracking Prevention in WebKit, webkit.org](https://webkit.org/tracking-prevention/).
6. `sessionStorage` gains nothing from the home screen exemption. The exemption
   protects against ITP deletion after 7 days. It does not extend a page session.
   Source: [Tracking Prevention in WebKit, webkit.org](https://webkit.org/tracking-prevention/).

**Not confirmed.** I found no Apple primary source that states exactly when iOS
ends the window of a home screen web app. Many secondary reports say iOS
terminates a backgrounded web app quickly and restarts it cold, which ends the
session. Apple does not document a timer. Treat the exact timing as unknown, and
treat `sessionStorage` survival across a background and return as not
guaranteed.

Also note the existing comment in `common.js` at line 294 says "private browsing
can block storage". On current Safari, private browsing does not block Web
Storage. It makes it ephemeral. See section 6. The `try`/`catch` is still
correct, because a full quota still throws `QuotaExceededError`.
Source: [Storage quotas and eviction criteria, MDN](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria).

---

## 8. Where Android and Chrome differ

| Point | iOS Safari / WebKit | Chrome (desktop and Android) |
|---|---|---|
| Per-origin quota | up to 60% of disk in a browser app | up to 60% of total disk size |
| Total across all origins | up to 80% of disk | 80% of total disk size |
| 7 day wipe without interaction | Yes, except home screen web apps | None |
| Eviction trigger | overall quota reached, or storage pressure, LRU | storage pressure or over the total limit, LRU |
| `persist()` prompt | No prompt. Heuristic grant | No prompt. Heuristic grant |
| `persist()` heuristics | "like whether the website is opened as a Home Screen Web App" | site engagement level, site installed or bookmarked, notification permission granted |
| Private mode quota | different quota, data deleted at session end | Incognito about 5% of total disk space |
| localStorage cap | about 5 MiB | about 5 MiB |

Sources, in order of trust:
[Updates to Storage Policy, WebKit blog, 2023](https://webkit.org/blog/14403/updates-to-storage-policy/);
[Tracking Prevention in WebKit, webkit.org](https://webkit.org/tracking-prevention/);
[Storage quotas and eviction criteria, MDN](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria);
[Persistent storage, web.dev, last updated 2020-05-12](https://web.dev/articles/persistent-storage);
[Storage for the web, web.dev, last updated 2024-09-23](https://web.dev/articles/storage-for-the-web).

The main difference for this crew: Chrome never applies a 7 day wipe, so an
Android phone keeps data longer by default. iOS gives the same protection only
after the user installs the app to the home screen.

---

## 9. Open questions

These points have no definitive primary source. Do not fill them with a guess.

1. Does "Clear History and Website Data" in iOS Settings delete the data of an
   installed home screen web app? Not documented.
2. Can an installed home screen web app run in an ephemeral or private session?
   Not documented either way.
3. How long does iOS wait before it ends the window of a backgrounded home
   screen web app? Apple publishes no timer.
4. Does persistent mode override the ITP 7 day cap for a plain Safari tab?
   WebKit documents the two rules separately and never links them.
5. Exact `localStorage` byte cap on iOS. Only MDN gives a figure (5 MiB). WebKit
   publishes none.
6. Whether WebKit deletes Cache API data when a page calls
   `registration.unregister()`. Not documented.

---

## 10. Source list

Primary, WebKit and Apple:

- [Tracking Prevention in WebKit](https://webkit.org/tracking-prevention/) — living policy page, no single date.
- [Updates to Storage Policy, WebKit blog, Sihui Liu, 2023](https://webkit.org/blog/14403/updates-to-storage-policy/)
- [Full Third-Party Cookie Blocking and More, WebKit blog, John Wilander, 2020-03-24](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/)
- [Private Browsing 2.0, WebKit blog, 2024-07-16](https://webkit.org/blog/15697/private-browsing-2-0/)

Secondary, MDN:

- [Storage quotas and eviction criteria](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
- [StorageManager.persist()](https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist)
- [Window.sessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage)
- [Using Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers)
- [browser-compat-data, api/StorageManager.json](https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/StorageManager.json)

Third, web.dev. Both articles carry dated figures. Check the date before use:

- [Storage for the web, last updated 2024-09-23](https://web.dev/articles/storage-for-the-web) — the Safari 1 GB figure here is out of date for iOS 17 and later.
- [Persistent storage, last updated 2020-05-12](https://web.dev/articles/persistent-storage) — Chrome heuristics only. It does not cover Safari.
