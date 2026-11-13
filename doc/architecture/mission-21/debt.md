# Mission 21: debt accountability

Builds on M20's retrospective (`mission-20/retrospective/`, especially `debt.md`, which ran to M20). This file adds M21's
row, says what M21's own work shows about how debt is made, and states the measures so they can be taken again. 13
November 2026, main at 311e21b0 and after.

**Measures, re-runnable.**
- `bun scripts/register-state.ts [revision]` counts the register by each table's own status and weight columns. Its
  classes are open, partly, fixed, deferred, decided, ambition (an idea, direction or proposal, not a defect) and
  unstated. The classes are keyword reads of the status cell, so treat them as a measure, not a verdict.
- `bun scripts/register-held.ts` counts the rows that say fixed and name a spec that exists, with the process's fixes
  (a CI timeout, evidence copied) counted apart.

## 1. M21's row

Same script, both revisions:

| | M20 landed (74de47a2) | M21, 13 Nov night |
|---|---|---|
| Rows | 324 | 349 (the 24 PL rows carried in, §25) |
| Open | 146 | 140 |
| Partly | 67 | 77 |
| Fixed | 42 | 64 |
| Deferred | 42 | 44 |
| P0 open | 1 (FH-01) | 1 (FH-01) |
| P1 open | 19 | 14 |
| P1 fixed | 13 | 25 |
| Ids used by two rows | 7 (PR-01..07) | 0 (§19's are OPR-01..07) |
| Fixed rows held by a spec | 5 of 46 at M21's start (a looser reading) | 42 of the game's 62 |

M21 found 24 playability rows (PL-01..24, nine of them P0) and fixed 19 of them in full or in part. It closed or
advanced about 20 inherited rows. It carries out more rows than it inherited only because the PL list was carried
in. The open count fell by six. M21 is the first mission whose new rows were mostly fixed inside it.

Most of the change is in the last line of the table. Of the rows whose status column says fixed, a spec now holds 42
of 62. (An earlier count of 53 of 67 read "fixed" anywhere in a row, so it took in rows fixed only in part and notes
that say "held by". `register-held` now reads the status column as `register-state` does.) Each spec added in M21 was
checked against its fault: the fault put back, and the spec seen to fail.

## 2. What M21's own work shows

**One root cause behind many tickets: guidance inferred, not typed.** OPR-01, PL-05, 08, 11, 12, 13, 19, 21 and 23 are
one defect told nine ways. The gold was chosen by reading what an act's words or place suggest: standing at the aim's
place, a search wherever the aim names, any door of the aim's place, every rule that pays a coin. Each fix replaced a
heuristic with a typed reading of what the act makes so (`AimAdvances`, `AimLeads`). The ninth came after eight
fixes. The lesson: a recurring symptom calls for one typed contract, not another case.

**Findings outside the register are debt the register cannot see.** The PL list lived in `playability.md` until this
reconciliation. M19's 74 UNT rows were the same failure (M20's `debt.md` §1). The rule we already had (carry an
investigation's findings into the register, verified and deduped) was not applied while the work was hot.

**A fix without a spec is a promise kept once.** Before M21, 5 of 46 fixed rows named a spec. Naming the specs that
already held them, mutation-checking each, raised that to 23 on the looser reading. The rest needed new fast regressions (T24-12, 13, 14,
17, R9-02, R11-01). Three rows that said fixed did not hold:
- R10-13's padlock was fixed elsewhere;
- T24-14's "strike first" sorted by a name that had changed ("Melee Attack" came fifth);
- T24-17's antidote was never consumable, because the module knew only its starting kinds.

**Our regressions this mission, all found by the slow lanes or the boot gate:**
- the browser bundle read `process.env` at load: the game did not start for about 35 minutes; now gated per push;
- the near-dead guard silenced a joined companion;
- the SRD ghoul made three of the first town's places lethal. The lesson: a slice that changes a placed creature is
  fought where it is placed;
- two browser journeys read prose that the new budget moves under More of the place.

Each was caught by CI's full run or the boot gate, not by a player, and each was fixed the same day. The split loop
(push lane in minutes, everything nightly or on demand) works only while the full run is read every time.

**Balance was a question to measure.** CB-01, R7-02 and R10-12 had been "open: balance" since M19. The placement
report fought a1's 39 hostile groups against three small companies. It decided the matter in data (pairs, a real
keeper, warnings at the door) without retuning a stat block. It also found that the undertown is written for a company
of one in every real start, which no one had known.

**Human acceptance is still missing.** FH-01, "no person has accepted the first hour", is the one open P0, and only
the owner can close it. Investigators' cold plays (headless and in the page) calibrate it. A green suite or a
playability batch does not close it, and this file does not either.

## 3. How we work, from here

- Carry an investigator's list into the register at each merge, not at the mission's end. A row says the spec that
  holds it, as `test/x` or `small/x`.
- A recurring symptom gets one typed contract and a census across seeds, not a ninth case.
- Read the full run every time; when it changes a placed creature or a told sentence, fight it, or read it, where it
  is placed.
- A row's status names its state in words the measures read: fixed, partly, open, deferred, decided, or an idea,
  proposal or direction. "Not in log", "unverified" and "noted" are not states; 17 rows still state none.
- Keep the agent count to what the machine bears (two besides the lead since the WSL crash). The register gained more
  from a lead with time to reconcile than from a fourth agent.
