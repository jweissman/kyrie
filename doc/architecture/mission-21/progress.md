# Mission 21: progress

Kept as the mission goes. The brief is [brief.md](brief.md); Phase 0's record is [fast-loop.md](fast-loop.md).

## Lines of work

| Line | Who | Where | State |
|---|---|---|---|
| Phase 0: the fast loop | lead | branch `m21` (`/var/tmp/kyrie/wt-m21`) | small lane and the brief's five regressions in; next: ports of the dearest Westernesse specs' rules, the suites named, CI's cost |
| Playability investigator | independent agent | branch `m21-play` | started 12 Nov night: reproducing human-reported failures; P0/P1 list in `playability.md` |
| Aesthetic investigator | independent agent | branch `m21-look` | started 12 Nov night: critique, compositions, design system in `aesthetic/` |

## Log

- **12 Nov, night.** Baseline measured (fast-loop.md): `check:fast` 18 s warm, but the median source file reaches 99 %
  of CI's suite, so a gameplay change is verified only by CI (45–60 min). `test/support/tiny.ts` and `test/small/`
  (the five regressions, 0.1–0.4 s each, each checked against its fault). Fixed on the way: a band's line said of one
  (T24-19, "one of him says"); "Invalid initial knowledge" now names the fact and the remedy. `signal-inside` shares
  its check with the small spec (`test/support/signals.ts`).
