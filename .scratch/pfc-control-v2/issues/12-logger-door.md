# Does logging get its own door, separate from Tracker?

Type: grilling
Status: open
Blocked by: 01

## Question

Should Tracker become read-only, with a separate Logger door for entering work?

Miguel raised this on 2026-08-06, at the end of the deficiency fields ticket. His
words: with this level of editing and logging, Tracker becomes "a menu in a menu
in a menu".

## Why it is worth asking

Tracker today is a drill-down built for looking: Tracking, then Building, then
Floor, then Unit. v2 adds status editing, deficiency records, waiting records,
and a pending state to that same path. Every one of those makes the looking
slower.

The standing rule in `CLAUDE.md` supports a split: "Many doors, one system.
Different users reach the same data through different views. Do not duplicate
data per view."

A split also lines up with the roadmap. v4 adds a QR door for trades and GCs.
That is a third door onto the same data, so the pattern is coming anyway.

## Points to settle

- Whether Tracker goes fully read-only, or keeps a quick status change.
- What the Logger door opens on. A unit picker, the last unit used, or a QR scan.
- Whether Logger is one long form per unit, or the same drill-down with editing
  switched on.
- What the Hub home screen holds. Today it is Tracking and Create. Candidates:
  Track, Log, Archive, Admin.
- Whether the split makes the offline queue simpler or harder. Edits would come
  from one screen instead of several.
- Whether this changes what `06-deficiency-entry-screen` prototypes. It probably
  does, so settle this ticket first.
