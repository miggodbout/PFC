# PFC Control 0.2 — the build log

Where the build actually is. One entry per session, newest at the bottom.
A cold session reads the last entry before it reads anything else.

The format and the rules are in `PFC_Control_0.2_Build_Prompt.md`, section 7.
What to build is in `BUILD-PLAN.md`. Neither belongs in here.

---

## Session 0 — 2026-08-08

**Step:** none. The build has not started.
**Branch:** none cut yet. `main` at `ca1f880`, serving 0.1.2.
**Deployed:** no.
**Merged to main:** n/a.

**Landed:** the 0.2 wayfinder map closed. `BUILD-PLAN.md` is LOCKED, and audited
against all nineteen tickets. `PFC_Control_0.2_Build_Prompt.md` written, holding the
branch rule, the token-cap rule, the clasp deploy loop, and the per-step `CACHE_NAME`
bump.

**Not landed:** nothing started.

**Tested:** nothing. clasp 3.3.0 confirmed installed and authenticated against the
Control script, two deployments listed.

**Open:** PLAN CALL 3 — Save pinned to the bottom of the Logger form — needs one look
at Miguel's phone at step 4. Nothing before then depends on it.

**Next:** cut the `0.2` branch from `main` and start plan section 6, step 1: the Sheet
and the server foundations. No screen work in that step.
