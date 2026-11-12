# Integration notes for M20

*Branch `adventure/first-steps`, 12 November 2026. Read with [final-report.md](final-report.md) (what exists, what was verified, what was experienced) and [handoff.md](handoff.md) (the Phase One file-by-file guide). This page is what changed since those were written, and what to check first. It was written in a hurry at the integration request, so it says plainly what was not run.*

## 1. What I know is failing or stale on this branch

| Gate | State | What to do |
|---|---|---|
| `KYRIE_LONG=1 bun test test/descent.test.ts` | **The `thorn` route fails; wren, a1 and d4 pass.** At choice 62, `^Buy a torch for Arlen`, the first town's shop stock was redrawn when the standing scenarios were added, and the company already holds a torch. A fix was started and stopped unfinished. | Re-record `test/fixtures/descent/thorn.choices` from that step "played on from there", as the test's header describes. Do it after the integration has settled the world's draws, not before. Prefer name-agnostic regexes (`\w+`), as the neighbouring lines already are. Removing one step shifts the dice for every later fight, so expect to adjust further steps. |
| `bun run test:honest` | **Was failing, fixed.** The Bound Howe's `ridge_aim` objective outranked the "down under the town" lead for a page-led player. It is now held to day 3 (`situation.kyr`), and `bound-howe.test.ts` waits to day 3 before asserting it. | If you want the Howe's lead earlier, the cost is the honest start's journey. This is your call. |
| Kept traces | Re-recorded four times with `bun scripts/redigest-trace.ts wren-tower-climbed`. The last full `traces.test.ts` ran green before the ties merge. After the ties merge (`7d66c52a`) I re-recorded `wren-tower-climbed`, but did **not** see a green `traces.test.ts`. | Run `test/traces.test.ts` first. The other two kept traces (`hessel-into-the-two-poles`, `wren-turf-hut`) were not re-recorded; they pass only if they do not visit a tie town's green or a tie site. |
| Browser specs and the full suite | **Not run here** (as agreed). A local attempt failed on Chromium start-up under load, which is environmental. | CI. |
| `silent-lord-turns` "forged remission" | Fails when rain puts a ford in spate: the test helper `Journey.way` ignores `hazardous`. Known, not fixed. | Either make the helper skip hazardous crossings (TypeScript) or have the spec wait out the spate. |
| `test/timings.json` | None of the new specs are in it, so CI shards are balanced by estimate. Several new specs take 5 to 15 minutes. | `bun run test:timings` once after integration. |

## 2. Merging with `main`

`origin/main` was 59 commits ahead when I tried. A trial merge gave **three conflicts** and nothing else:

1. `data/paintings/scenery.json`: main removed `scene-great-hall` from the `fort` rooms; this branch added `scene-lone-tower` to the `tower` grounds. Take main's `fort` line and this branch's `tower` line.
2. `test/fixtures/traces/wren-tower-climbed.transcript.json`: take either side and run `bun scripts/redigest-trace.ts wren-tower-climbed`.
3. `web/bundles.generated.json`: take either side and regenerate: `bun -e "import {AssetCatalog} from './src/cli/asset-catalog'; await AssetCatalog.write('.')"`.

After resolving them the trial merge passed `scenery-kinds`, `page-paintings`, `repository` and the gates; the one failure it showed was the honest-start one above, since fixed on this branch.

## 3. What this branch touches that you own

- **TypeScript** (Phase One, tested, small): `src/world/` only: `region-ties.ts`, `region-threads.ts`, `region-bonds.ts`, `region-outskirts.ts`, and small edits to `histories.ts`, `work-plans.ts`, `kyr-template.ts`, `founding.ts`, `origins.ts`, `world-assembler.ts` and five other `region-*.ts` files (the `@count` and template `if`/`unless` migrations, ties and bonds). Nothing since Phase Two.
- **Shared data:** `data/scenarios/standing.json` (now six entries), `data/paintings/scenery.json`, `data/paintings/seen.json` and `registry.json` (24 new paintings; regenerate with `bun scripts/paintings.ts assets/portraits`), `data/adventures/countries.json` (`after` news), `data/imbar/events.kyr`, `data/generation/*` (sites, deep-site counts, ties).
- **First hour, indirectly:** standing scenarios add hooks to the first town and add facts and an Ask line to the first keeper (`first_keeper` import). This is what moves kept-trace digests, and it is why page-led players now see the Walk, the Howe's cart and notice, and the keep's crier.
- **No change** to `data/rules`, the opening text, the debt origin, or the landing.

## 4. Known fragilities (all of them found by a gate)

- **Item kinds are global.** Two modules declaring `ledger_kind` fail *every* country's load. Prefix them with the module name. `test/standing-modules-gates.test.ts` loads all 27 gates (about 3 to 9 minutes) and is the only thing that catches this.
- **Draws shift.** Adding or reordering a standing scenario changes later scenarios' Deem draws and the first town's cast. Specs and fixtures must not hard-code drawn names or stock.
- **Portraits are unique per country.** `page-paintings.test.ts` caught two new people sharing a face with first-country folk; give such people a `Likeness "…"` line.
- **Local lint** (`eslint .`) runs out of memory if there are agent worktrees under `.claude/worktrees` in the tree (each is a full repo copy). CI has none. Lint `src test scripts web index.ts` instead.

## 5. Not done, with reasons

- **Rotating the altered-law provinces** per world (R96): needs `src/world/provinces.ts`.
- **Retiring `oldcoin` and `quarrel`** (R97): the wanderer origin's arrivals name them (M20's first hour).
- **The yuanti's habitat:** a `ruin` habitat would move every first country's ruin den draw.
- **The four ruins paintings** (`bridge`, `hall`, `elevator`, `elevator-base`) and the town paintings with no carrying word are dormant with reasons in `dormant.json`.
- **Quittance, Muster, Quiet in the Sky, Parliament:** no prose pass. **Book of Faces, Gosse's Company:** none either.

## 6. Where the weakest evidence is

Three blind playtests found the world visibly reacting to the new modules, but only one of three players entered one (the Numbered House). Nobody played any module to an ending on foot, and nobody fought the dangerous opponents. The largest cold-play obstacles were M20's: no HP display, no warning before a fight that one round can kill, an empty menu on death, 60 or more "Ways on" lines in the hub, and replays that take two minutes by day 13. See [final-report.md](final-report.md) §3.

## 7. The requests, in the order they matter

Read the triage at the head of [kyr-deem-requests.md](kyr-deem-requests.md). R96 to R110 were added after the triage was written: R96 and R97 are the consolidation decisions above; R105 to R108 came from the second pass (an `Ending` closes the book so aftermath is unseen; a long clock cannot be waited out in a spec); R110 from the ties (a section conditioned on a room existing; a person walking a route).
