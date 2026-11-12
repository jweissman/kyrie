# Reproducible states for M21 (seeds, checkpoints, traces, difficult UI states)

Kept small on purpose. Each item says how to get back to it from a clean checkout.

## Seeds and origins (generated worlds)

| World | Origin / company | Why keep it |
|---|---|---|
| `a1` | `kin` (coming home), human warrior | the reference first hour; round 12 A; the drover's ruts, Millholm, three notice jobs |
| `kahitude` | `debt`, human warrior | the debt's first expedition (Seolforfyrd, the hobs' toll-house: the owner's review's exemplary expedition); the painting survey |
| `pine` | `map` (dead man's map), elf thief | round 12 B; Rainhaven's undertown; the map origin (E221) |
| `wren` | `wanderer`, human warrior | a dwarf country (the standing people's ancestry fault, T24-08); the kept trace |
| `thorn` + `{ region: { terrain: 'mountain' } }` | — | every province in one world (`all-in-one-world`, T24-11's quadratic installs) |

## Headless replays (the shared runtime)

- `bin/kyrie adventure --world a1 --origin kin --as human/warrior/Wynn`, then `save <path>` / `bin/kyrie resume <path>`
  (one process fed line by line: round 12's reviewers found that piping every command at once runs only the first).
- Round 12's turn notes (`../cold/round-12/player-*-notes.md`) list every command: replaying them reaches each finding.
- **The saves themselves are 87–88 MB each** (JSON checkpoints of a generated world after 4–94 commands): too large to
  keep in the repository, and a finding in themselves (persistence cost; `ReaderStore.room` already had to replace an
  old world to fit browser storage). They stay in `/var/tmp/kyrie/m20/review-{a,b}/` until that is cleared.

## Kept traces (regression tests, replayed by `test/traces.test.ts`)

`test/fixtures/traces/`: `wren-tower-climbed` (redigested after content changes:
`bun scripts/redigest-trace.ts wren-tower-climbed`), `wren-turf-hut`, `hessel-into-the-two-poles`.

## Difficult UI states (rendered by the contact-sheet probe)

`../evidence-tools/screens/zz-sheet.test.ts.txt` walks one game through twenty states at 1280×800, 1180×820,
820×1180 and 390×844 and prints every element that scrolls. The hardest states it reaches:

| State | Size | What is hard |
|---|---|---|
| the road in (02) and the camp's green (03) | 390×844 | the telling overflows its panel (666 px in 269) |
| Go and Look opened (04, 05) | all | lists in a panel beside lens tiles; Look scrolls (1 026 px in 490) |
| the green with Talk (10) | 390×844 | eleven likenesses in three rows over the painting |
| the rat fight (13) | 390×844 | foes' names cut, the third foe below the fold of the sides |
| a conversation with no painting (11) | 390×844 | the name in type, the emblem hidden on narrow screens |
| the town's hex (19) | 390×844 | the card scrolls (380 in 336) |

## Measurement scripts

`../evidence-tools/test-loop/` (setup costs, profiles, the province installs), `../evidence-tools/paintings/`
(painting demand), `../evidence-tools/retrospective/` (arrival words, import closures, test layers).
