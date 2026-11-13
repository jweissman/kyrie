# Mission 21: progress

Kept as the mission goes. The brief is [brief.md](brief.md); Phase 0's record is [fast-loop.md](fast-loop.md).

## Lines of work

| Line | Who | Where | State |
|---|---|---|---|
| Phase 0: the fast loop | lead | branch `m21` (`/var/tmp/kyrie/wt-m21`) | small lane (20+ files, ≈ 5 s), ten mechanics on the real kernel (Experiment A), the push lane (CI per push 35 → 5–6 min), PresenceGate (grounding −20 % of a wait) |
| Playability investigator | independent agent | branch `m21-play` | two batches on main: PL-01..03, 05, 08..11 fixed (P0s 05, 08, 11); list in `playability.md` |
| Aesthetic investigator | independent agent | branch `m21-look` | investigation merged (3b9d0a36); integration merged (e248e719): one choice row, the narrator's typed budget (2.4 sentences a glance, none ≥ 5, no clue held), stress in italics, fight and talk layouts; leftovers in hand |
| World construction (Experiment B) | independent agent | branch `m21-world` | paused at the crash (one new spec in its tree) |
| SRD rules as invariants | independent agent | branch `m21-rules` | hit dice as Deem amounts, typed defenses, the honest catalog: resumed |

## Log

- **12 Nov, night.** Baseline measured (fast-loop.md): `check:fast` 18 s warm, but the median source file reaches 99 %
  of CI's suite, so a gameplay change is verified only by CI (45–60 min). `test/support/tiny.ts` and `test/small/`
  (the five regressions, 0.1–0.4 s each, each checked against its fault). Fixed on the way: a band's line said of one
  (T24-19, "one of him says"); "Invalid initial knowledge" now names the fact and the remedy. `signal-inside` shares
  its check with the small spec (`test/support/signals.ts`).
- **13 Nov, early.** CI split: every push runs the push lane (`test/lanes.json`, 524 files) in eight shards, 5–6 min;
  the whole suite nightly and on demand. `--no-isolate` on CI gains nothing (not adopted); kept prefixes −17 % on
  `ombra-local`; `LandModel.goes` memo; `PresenceGate` (an action needing someone beside the actor grounded only where
  they are; checked sound by `KYRIE_CHECK_GATES=1`). WSL crashed with four agents: since then two at a time.
  T24-19 (round 12, B) burned down with small regressions: piped terminal input, typed labels, doubled way labels,
  `*stress*`, the hare and the boy, no weather underground, stated time. Playability batches 1–2 integrated.
- **13 Nov, night.** Obligations made into fast regressions, measured: `bun scripts/register-held.ts` counts the
  register's rows that say fixed and name a spec that holds them: 5 of 46 at first, 17 after naming the specs that
  already held them (each mutation-checked tonight) and those older specs that cite their row. Found on the way: the
  ids PR-01, PR-02 and PR-04 are each two rows (§13's persistence rows and §19's gold rows): for the reconciliation.
  Fixed with small regressions: R10-07 (flight odds and roll from one table, `small/flight`), NP-01's lint advice
  (`small/sky-lint`), WM-01's dead Gaffer (`small/near-dead`). A P0 of our own: the browser bundle read `process.env`
  at load (the game did not start for ~35 min); fixed, and every push now boots the page in Chromium as a gate.
- **13 Nov, late night.** Experiment B steps 2–3 merged (callings and peoples canonical; `proficient` for the company
  only): a first country 230k facts → 33k, a1's start 6.1 → 4.7 s warm, a kept start 28.5 → 14.2 MB, ten installs
  31.6 → 14.2 s. Playability batch 4 (PL-13 gold to the next lead, PL-14 aim-target lint: 57 aims to author). The full
  suite on 76fa804f failed three ways, all ours: the near-dead guard silenced a joined companion's words (a companion
  has no members of their own and reads as dead: fixed), and the SRD ghoul's stat block made the first town's ossuary,
  the king-barrow and the Howe lethal (withdrawn; srd-invariants.md, "Withdrawn"). Lesson: a slice that changes a
  placed creature is fought where it is placed.
- **13 Nov.** Playability batches 5–6 (talk weighed by the engine, a notice read led blue again, the map's across-
  country offers decided by the engine for every client: E155 out of the browser). The aesthetic integration merged:
  the default page now tells a place in three sentences, the rest a touch away ("More of the place"), clues always
  whole; `skeel-browser` reads that touch too. The full suite on 74daeb0b failed only `wren-tower-climbed` (re-digested:
  the ghoul's record changed what the world holds; it comes where it came).
