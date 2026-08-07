# How a phase and a unit roll up from their items

Type: grilling
Status: open
Blocked by: 01, 02

## Question

What status does a phase show, and what status does a unit show, once progress
and problems are two separate things?

**Scope widened on 2026-08-06.** This ticket now owns the whole status model on
the Unit Tracker tab, not only the worst-wins order. It took the rollup question
back from `02-deficiencies-tab-layout`, so the decision lives in one place. It
now waits on `02`, because it cannot say how a flag is worked out until it knows
how a record is stored.

It also owns:
- Which columns a unit row holds once Progress is three values and Deficiency and
  Waiting are flags. The old five-value status column has to change.
- Whether a flag comes from a Sheet formula that reads the Deficiencies tab, or
  whether the app works it out from the records it already holds. Formulas are
  harder to write to safely. See `07-apps-script-write-limits`.
- What the Dashboard tab counts, once the five columns no longer match the model.

Miguel raised this on 2026-08-06. He remembered that the current rule caused a
problem but not the exact case.

## The likely case, found while charting

The rule today is worst wins, in this order:

    Deficiency > On Hold > In Progress > Not Started > Complete

`ROLLUP_ORDER` in `control/shared/common.js` holds it, and `worst()` applies it.

Take a unit with 18 items, where 17 are Complete and 1 is Not Started. Not
Started sits above Complete in the order, so the unit reads **Not Started**. It
looks exactly like a unit that nobody has entered.

That is the rule hiding a nearly finished unit. It is very likely the problem
Miguel remembers.

## Points to settle

- What a mix of Complete and Not Started should read. "In Progress" is the
  obvious answer, but confirm it.
- Whether Complete must mean every item is Complete, with no exception.
- How the two new flags fold in. A Deficiency flag anywhere probably wins, then a
  Waiting flag, then the worst progress value. Confirm the order.
- Whether a phase and a unit use the same rule, or different rules.
- Whether a number would serve better than a status at the unit level, such as
  "14 of 18". A count cannot hide a nearly finished unit the way a worst-wins
  status can.
- What a phase-level Waiting record does to the phase status and to the unit
  status above it.
- Where the rule lives. `worst()` in `common.js` and `buildRollupFormula` in
  `control/appscript/Code.js` both hold a copy today. The two must not drift.
