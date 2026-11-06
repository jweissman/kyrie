# Imbar: deep history, selective connection, a voyage, and a ship in the pause between counts

*Branch `adventure/imbar-deep-time`, from `main` at `fb24f94`. Two passes. Read `13-critique-and-status.md` for the
honest account; this file is the map.*

## First pass (charter, keeper, Exchange)

| What | Where |
|---|---|
| The Long Man: an Aenean writ of keeping, the reeve as the dale's auditor, the sheaf in forty, the bell given as it was once before | `the-long-man/charter.kyr` |
| Fair Weather: the keeper's bench, a tally in three notations | `skeel/keeper.kyr` |
| The Founders' Exchange: a Deem-cast factor, carter and hands as a herald to two countries | `data/goings-on/factors/`, `data/scenarios/factors.scenario.json` |
| Audit, working history, editorial review, dossiers, workbook, authorability | `01`–`06` |

## Second pass

| What | Where | Read | Tests |
|---|---|---|---|
| **The Dorothea**: a playable passage Tolleth → Skerrow → home on the existing travel system (a ship is a thing that is somewhere; the company walks her decks) | `data/adventures/the-dorothea/` | `07-voyage.md` | `the-dorothea` (12) |
| **The black square, the Slack, the Remainder**: a portal in the House of Doors opened by a reading, a measure and a standing from four adventures or costly alternatives; a ship in the pause between counts; a surety; a voyage to the threshold of Mechanus | `the-grand-tour/hours.kyr`, `remainder.kyr` | `08-treatment-the-slack.md`, `09-the-slack-as-adventure.md` | `the-slack` (8) |
| **The Exchange as an opponent**: six answers, by what it knows and has; effects read by Low Water and by Skerrow | `data/goings-on/factors/` | `10-exchange.md` | `exchange-responds` (6), `factors-handoff` (3) |
| **Cross-adventure consequences**, twelve, tested | the evidence gifts in the Long Man, Fair Weather, Low Water, What Tessary Owes, the Dorothea | `12-relationships.md` | as above |
| **Companions**: calling-keyed voices and a company-splitting choice | `the-long-man/voices.kyr`, `the-dorothea/voices.kyr` | `11-technical-report.md` §11.6 | `the-long-man-charter`, `the-dorothea` |
| **Every province in one world**: two species clashes that had made some pairs impossible to visit are fixed | `what-tessary-owes/ways.kyr`, `the-lull/*.kyr` | `11` §11.1 | `all-in-one-world` (1) |
| Technical blockers, exactly | | `11-technical-report.md` | |
| Critique and status | | `13-critique-and-status.md` | |
| Playthroughs beginning in an ordinary generated world | `playtests/ordinary-world-voyage.md`, `ordinary-world-slack.md`, `factor-handoff.md` | | |

## The brief's list of deliverables, second pass

1. Additional adventures revised, with before/after: `diffs/` (first pass) and `git log fb24f94..HEAD` (both). Honest count in `13` §13.1.
2. Relationship map: `12-relationships.md`.
3. A playable ordinary voyage: `07-voyage.md`.
4. A creative treatment: `08-treatment-the-slack.md`.
5. A playable meta-adventure with alternate pathways: `09-the-slack-as-adventure.md`, `the-slack` tests.
6. An improved handoff: `10-exchange.md`.
7. Technical report: `11-technical-report.md`.
8. Playthrough evidence from the ordinary world: `playtests/`.
9. Persistence and reload tests: `11` §11.7.
10. Critique: `13-critique-and-status.md`.

## Integration

The branch touches **one engine file** (`src/world/world-assembler.ts`, 3 lines, heralds placed once per distinct
scenario) and otherwise adds data, tests and docs. `data/catalog/items.json` gains five item kinds;
`data/imbar/events.kyr` gains four world events. `11` §11.9 lists everything shared, for the merge. The work is
independent of the M19 consolidation and assumes only that `herald`, `canon`, `Kind` and `memberOf/hasCalling` keep
their meaning.

## Whole-suite verification

See the foot of `13-critique-and-status.md` (§13.5) for the state of the full `bun run check`. Targeted tests are
named in `13`; they are not a substitute.
