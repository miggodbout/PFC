# What happens when the app runs in a Safari tab, not the installed icon

Type: grilling
Status: open
Blocked by: none

## Question

The app must be installed to the home screen for its stored data to be safe. What
does the app do when it is not?

This ticket exists because of `08-ios-pwa-storage-limits`. iOS deletes all
script-written storage after 7 days without user interaction. WebKit exempts an
installed home screen app. It does not exempt a Safari tab.

The risk is real for v2 and not for v1. v1 keeps nothing that matters. v2 keeps
the local copy and the outbox. A waiting edit that sits in a Safari tab over a
quiet week can disappear before it ever reaches the Sheet.

Points to settle:
- Whether the app detects that it runs in a tab. `display-mode: standalone` in a
  media query is the usual test.
- What the app shows in that case. Options: a one-time note, a permanent bar, a
  block on editing, or nothing at all.
- Whether the app calls `navigator.storage.persist()`, and what it does when the
  request is refused.
- Whether the crew and Miguel all have the app installed today, and who checks.
- What the app does about the isolation between Safari and the installed app.
  Data written in a tab is invisible to the installed app. A person who edits in
  both sees two different sets of waiting edits.
