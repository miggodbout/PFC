# What happens when the app runs in a Safari tab, not the installed icon

Type: grilling
Status: resolved
Blocked by: none

## Question

The app must be installed to the home screen for its stored data to be safe. What
does the app do when it is not?

This ticket exists because of `08-ios-pwa-storage-limits`. iOS deletes all
script-written storage after 7 days without user interaction. WebKit exempts an
installed home screen app. It does not exempt a Safari tab.

The risk is real for 0.2 and not for 0.1. 0.1 keeps nothing that matters. 0.2 keeps
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

## Answer

One signal only: installed, or not. The app checks `display-mode: standalone`
once, on load.

- **Installed:** nothing shown. No change from today.
- **Not installed (a plain Safari tab):** a small, dismissible note appears,
  once per tab-mode open — not repeated on every screen inside that visit. It
  says offline saving may not work right in a browser tab, and gives a short
  step-by-step: Share icon → Add to Home Screen.
- `navigator.storage.persist()` runs once in the background, silently,
  regardless of install state. No message either way, granted or refused.
  WebKit's grant heuristic already favors an installed app (`08-ios-pwa-storage-limits`),
  so this is a free bonus, not something the crew ever needs to know about.
  **This drops the earlier idea of a separate warning when persist() is
  refused** — with no action the crew can take about a refusal, a warning
  would just be noise. Simplified after Miguel found the two-signal version
  confusing.
- No separate handling for the tab/installed data-isolation split. The fix for
  that and the fix this ticket needed are the same action: install it. The
  install nudge above covers it.
- Miguel and his coworker both report they are already installed today. This
  makes the note a safety net — a new phone, a reinstall, a texted link opened
  cold — not a fix for a problem happening now.
- **Out of scope:** GC and other trades' access. That is the 0.4 QR-based
  Log/Status menu, a separate planned bridge. Not this ticket.
