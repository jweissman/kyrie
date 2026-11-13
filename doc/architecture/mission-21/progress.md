# Mission 21: progress

Kept as the mission goes. The brief is [brief.md](brief.md); Phase 0's record is [fast-loop.md](fast-loop.md).

## Lines of work

| Line | Who | Where | State |
|---|---|---|---|
| Phase 0: the fast loop | lead | branch `m21` (`/var/tmp/kyrie/wt-m21`) | small lane (20+ files, ≈ 5 s), ten mechanics on the real kernel (Experiment A), the push lane (CI per push 35 → 5–6 min), PresenceGate (grounding −20 % of a wait) |
| Playability investigator | independent agent | branch `m21-play` | two batches on main: PL-01..03, 05, 08..11 fixed (P0s 05, 08, 11); list in `playability.md` |
| Aesthetic investigator | independent agent | branch `m21-look` | investigation merged (3b9d0a36); integration merged (e248e719): one choice row, the narrator's typed budget (2.4 sentences a glance, none ≥ 5, no clue held), stress in italics, fight and talk layouts; leftovers in hand |
| World construction (Experiment B) | independent agent | branch `m21-world` | paused at the crash (one new spec in its tree) |
| SRD rules as invariants | independent agent | branch `m21-rules` | batch 2 on main (4834cb0d): variations carry HD and defenses, `ghoul/barrow` and `golem/flesh` unplaced, challenge re-measured, `rules/placements.md`; batch 3 (PL-07 placements) in hand |

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
- **13 Nov, later.** Rules batch 2 merged (4834cb0d). Its placement report fights a1's 39 hostile groups against three
  small companies: 18 trivial, 13 fair, 8 lethal; the undertown's keepers are its easiest rooms, its spider room is
  lethal to a lone warrior, a lone thief dies in most fights. Decided (PL-07): no stat block is retuned; trivial
  singles get company by number, the undertown's hardest group comes last, every lethal keeper is told at the door and
  escapable, `ghoul/barrow` is placed alone in one room deep enough for a level-2 company and never in the first town's
  barrows; the thief's frailty is a calling question, kept open for the lead.
- **13 Nov, later still.** Playability batch 8 merged (ac3d9cd5): the gold goes into a site only as far as what the aim
  waits on is known to lie (PL-23, the lead's ruling); an opened box tells what is in it (PL-22). PL-24 found: kahitude's
  errand points at a work that does not teach what it waits on (gold-thread admits `lost` there until it is fixed).
  PL-06 approved, ranks 1–2 first. The lead: a way off a road names its town once (`small/way-labels`); a band down to
  its last is "the last of the cave spiders" (`small/last-of-band`, T24-17's grammar). The full run on 4415559c failed
  only `quiet-in-the-sky-browser` (its prose now under More of the place): fixed, and a full run dispatched on d0ec9afa.
- **13 Nov, evening.** Rules batch 3 merged (3ce83fdb), PL-07 as decided: denned singles of challenge ≤ 1 now in pairs,
  the sealed vault's keeper is the barrow ghoul (a lone level-1 warrior wins 60 %, was 95 %), the spiders told at the
  adit by their husks; a1's 39 groups 18/13/8 trivial/fair/lethal → 11/20/8; wonders' weapons count as magic against a
  typed reduction. Lead rulings: no change to the thief (avoid and recruit); every lethal group told at the door, the
  barrow's savage embalmers too; silver weapons deferred. The lead: T24-17's other half: a remedy the world
  gives later was never `consumable` (ItemTraits read the starting kinds only: `small/given-remedy`).
- **13 Nov, night.** The full run on d0ec9afa green (suite, descents, browser). T24-17 fixed in all four parts (band
  grammar; a remedy given later was never `consumable`; an interrupted search says so; given things named as a kit's,
  so the lantern is filled once), T24-12 and T24-13 held by new specs; `register-held` read a backquoted `test/` path as
  "test" (fixed): 26 of 47 fixed rows now held. A full run dispatched on 14594d9d for rules batch 3's dens.
- **13 Nov, late.** Rules batch 4 merged (420746da): attack riders are data on a natural weapon (the barrow ghoul's
  paralysis, `attack-riders`); ambush bands in deep sites are now perceived by anyone at the door, so a lone thief can
  see every lethal group coming (`deep-sounds-ambush`); the undertown is written for a company of one in every real
  start (an origin keeps the first member), so the earlier rows were fought at a fixture's numbers and are re-fought.
  Lead rulings: the vault keeps the barrow ghoul (deep, optional, told, escapable); no generation change for the brood
  in M21 (the company's size read on the way down is M22's). Rows held: 29 of 47.
- **14 Nov, small hours.** Register reconciled: §19's ids are OPR-01..07 (no id now names two rows); the PL list carried
  in as §25; `scripts/register-state.ts` counts the register by its own columns at any revision (since M20 landed:
  fixed 42 → 62, open 146 → 141, P1 open 19 → 15); `mission-21/debt.md` is M21's row of M20's inflow table and what
  M21's own work shows. Held rows 53 of the game's 67 fixed. AR-05 in part: the roll of who is here said apart
  (`Leaf.roll`), the page's word-match gone (`small/roll-apart`). The full run on 14594d9d failed only
  `wren-tower-climbed` (re-digested: it comes where it came); a full run dispatched on c610ca2d.
