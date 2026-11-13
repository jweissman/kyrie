# Brief: an adversarial performance investigation

Commissioned by the owner, 14 November: *where does the time actually go?* To be run by an investigator who did not
build the instruments, starting when the machine has room for one heavy job (see "Constraints"). The lead's own
measurements are deliberately not given here, so that the answer is not anchored on them. The instruments
(`src/costs.ts`, `scripts/load-costs.ts`) may be used, and may also be wrong. Check them.

## Questions

1. **Where does the time go, cold and warm,** at each stage:
   - process start and import resolution (TypeScript modules, and the data they import at load);
   - Kyr parsing;
   - module import resolution and compilation;
   - the canon's installation;
   - Deem composition;
   - world construction;
   - session initialization;
   - the first observation (the screen, the narrator's leaf and glance) and the first client rendering.
2. **At four scales:**
   - an empty universe (no setting at all, if one can be made);
   - a tiny Kyr fixture (`test/support/tiny.ts`);
   - one real adventure on its own (for example `data/campaigns/low-water.campaign.json`);
   - full Westernesse (`DrawnWorld.start('a1', …)`).
3. **What scales with what:** the number of declarations, entities, scenarios installed, and instantiated relations
   and facts. Fit or tabulate each against the stage it costs. Name anything superlinear.
4. **Whether full-world cost is paid when an operation needs only one rule or one location:**
   - a spec of one rule;
   - a look at one place;
   - one command in a large world;
   - a tiny world that still installs the canon or generates creatures with Deem;
   - a presentation module that imports Deem or the paintings at load.
5. **Whether the caches hide cost, and whether they are sound.** The in-process parse map, `ParseCache`, the disk
   `ParseStore`, `Campaign`'s `LoadCache`, the route trees and the memoized ways. Measure each one's hit rate on real
   runs, and what its key misses.

## Method

- Every number reproducible by a committed script, with the machine, bun version and commit stated.
- Profile before concluding: `bun --cpu-prof` or the inspector for the top stages. Do not assume parsing is the
  bottleneck.
- Distinguish one-time from per-process, per-spec and per-command costs, since the test suite pays the per-spec ones
  thousands of times.
- Cross-check the `Costs` tally against wall time and a CPU profile at least once. Report where they disagree.

## Deliverables

- `doc/architecture/mission-21/performance-investigation.md`: the measured map, the scaling table, and the top ten
  costs by what they cost the suite and the player, each with its cause in the code (file:line).
- A ranked list of repairs. For each: what it saves, at which scale, its risk to determinism and test isolation, and
  its size. Mark which fit in Mission 21 and which are redesigns for later.

## Constraints

- One heavy job at a time on this machine (WSL runs out of memory with more): no whole suite, browser specs or
  parallel world starts beside other heavy work. Long runs go to CI through a pushed branch.
- Read-only on `src/` unless a measurement needs a probe. A probe is kept only if it is cheap and stays off by default.
- Commit on a branch of its own (`perf/investigation`), and push it to `ci/perf-<n>` for any whole-suite measure.
