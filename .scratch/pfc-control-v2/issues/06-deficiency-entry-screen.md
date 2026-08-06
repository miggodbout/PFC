# What the deficiency entry screen looks like

Type: prototype
Status: open
Blocked by: 01

## Question

How does a person add, edit, and close a deficiency record on a phone?

Build a rough, throwaway screen to react to. Do not build it into the app.

Points to settle:
- What happens the moment a status is set to Deficiency or On Hold. A prompt, a
  new screen, or an open panel.
- How several records under one item are shown in the item list.
- How few taps a common entry takes. The user stands on a job site, often with
  gloves on.
- How the current Details box and the new records live together, or whether the
  Details box goes away.
- How a record is closed once the problem is fixed.

## Carried from 01-deficiency-record-fields

**A bulk fix action is still needed, and the model change removed it.**

Miguel asked for this: "worker clicks a Fixed button, or alternatively if
Interior Door's dropdown goes from Deficiency to Complete, all tracked
deficiencies are marked complete."

Setting the dropdown to Complete was going to be the bulk action. Then progress
and flags split apart, so the dropdown no longer touches records. An item with
four open records now needs four taps. That is a step backwards from what Miguel
asked for, and this ticket must give the bulk action somewhere else to live.

Candidates: a "Fix all" control on the item, a multi-select in the record list,
or a prompt when the dropdown moves to Complete while records are open. That last
one is not automatic status — it is a shortcut that asks first.

**The needed line is the hero field.** Miguel's words: "the important part is
what replacement is needed." Rank the screen that way. The needed line and the
count come first. The reason is one tap from a list and sits second.

**Field order to start from:** needed spec, count, reason, then Other text only
when it is required.
