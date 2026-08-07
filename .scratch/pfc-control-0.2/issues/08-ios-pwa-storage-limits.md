# Browser storage limits for a PWA on iOS Safari

Type: research
Status: resolved
Blocked by: none

## Question

How much data can an installed PWA keep on an iPhone, and when does the phone
throw it away?

Find the facts. Make no decisions. iOS Safari is the main browser for this
crew, so iOS answers matter most. Note the Android answer where it differs.

Points to find:
- The size limit for `localStorage`, IndexedDB, and the Cache API on iOS Safari.
- The eviction rule. When iOS clears storage for a site, and whether an
  installed home screen app is treated differently from a tab.
- Whether `navigator.storage.persist()` works on iOS, and what it does.
- Whether storage survives an app update through the Service Worker.
- What happens in Private Browsing, and whether an installed PWA can hit it.
- Any trap with `sessionStorage` in a home screen app, which is what the code
  uses today.

## Answer

Full findings, with a source for every claim:
[`../research/ios-pwa-storage-limits.md`](../research/ios-pwa-storage-limits.md).

The facts that change the plan:

1. **Space is not a constraint.** On iOS 17 and later an origin may use up to 60%
   of the disk. The old 1 GB cap is gone. WebKit states that an installed home
   screen app gets the same quota as a tab. A whole building of unit data is
   nowhere near any limit.
2. **`localStorage` is the exception, at about 5 MB.** That figure comes from MDN
   only. WebKit publishes no byte number.
3. **iOS deletes script-written storage after 7 days without user interaction.**
   That includes IndexedDB, localStorage, sessionStorage, and the Service Worker
   with its cache. The count is 7 days of Safari use, not calendar days.
   Scrolling does not reset it.
4. **An installed home screen app is exempt from the 7 day rule.** WebKit states
   this word for word, and treats deletion inside a home screen app as a bug.
   The installed app's data is also isolated from Safari. This makes install the
   line between safe storage and storage that disappears.
5. **`navigator.storage.persist()` works from Safari 15.2, with no prompt.**
   WebKit grants it by heuristic, and "opened as a Home Screen Web App" is the
   one heuristic WebKit names. Persistent mode is excluded from eviction under
   storage pressure. There is no documented promise of a grant.
6. **Stored data survives a Service Worker update.** Old Cache API caches are not
   removed automatically. The `activate` handler must delete them.
7. **`sessionStorage` is the wrong store for 0.2.** It dies with the page session,
   and the home screen exemption does not help it, because the exemption blocks
   the 7 day wipe and does not extend a session. Apple publishes no timer for
   when iOS ends a backgrounded web app window, so survival across a background
   and return is not guaranteed. `Store` in `control/shared/common.js` uses
   `sessionStorage` today.
8. **A correction to an existing comment.** `common.js` line 294 says private
   browsing can block storage. Modern Safari makes storage ephemeral instead of
   blocking it. The `try`/`catch` is still correct, because a full quota throws.

Six points had no primary source and are recorded as open in section 9 of the
findings file. The one that matters most: nobody documents whether "Clear History
and Website Data" reaches an installed web app's data.

Write findings to a Markdown file in the repo and link it here.
