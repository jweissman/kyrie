# Mission 20 architecture risk and mediation report (11 November 2026)

Scope: a read-only architecture review focused on medium-term delivery risk for Kyrie/Westernesse, with concrete
mitigation actions and verification gates.

Primary references: [overview](../overview.md), [play model](../play-model.md), [living world](../living-world.md),
[performance](../performance.md), [verification](../verification.md), [mission 20 log](./log.md), and runtime code in
[`src/campaign`](../../../src/campaign/), [`src/lang`](../../../src/lang/), [`src/presentation`](../../../src/presentation/)
and [`src/ui`](../../../src/ui/).

## Executive summary

The architecture is strong in its fundamentals (single authoritative world, declarative content contract, shared
player/NPC action semantics, deterministic replay discipline). The main risks are now mostly *operational and
evolutionary*: correctness under growing complexity, cache invalidation confidence, global mutable shared state, and
maintaining replay/save continuity while Mission 20 continues to reshape the experience layer.

## Risk register

### R1. Campaign orchestration concentration

- **Where**: [`src/campaign/campaign.ts`](../../../src/campaign/campaign.ts)
- **Risk**: one class coordinates execution, rollback, watch passing, deferred/interrupted actions, combat integration,
  projection refresh, perception recording and outcome updates.
- **Failure mode**: ordering regressions that pass local checks but fail in long journeys (especially around interruption,
  undo, or module install boundaries).
- **Mediation**:
  1. Define explicit command lifecycle phases as internal typed states.
  2. Add phase-boundary assertions (world/store agreement, no active leases, no reentry).
  3. Add lifecycle golden-trace tests (interrupt, deferred success/failure, undo-on-expander-failure).
- **Verification gate**: journey replay + digest checks unchanged for canonical transcripts before/after refactor.

### R2. Global mutable catalog state and load serialization pressure

- **Where**: [`src/canon/local-catalog.ts`](../../../src/canon/local-catalog.ts),
  [`src/campaign/load-cache.ts`](../../../src/campaign/load-cache.ts),
  [`src/campaign/module-bundle.ts`](../../../src/campaign/module-bundle.ts)
- **Risk**: local kinds are process-global and ownership-reclaimed by convention; load queue serializes all loads to
  avoid collisions.
- **Failure mode**: cross-campaign bleed or hard-to-reproduce interleaving defects; head-of-line blocking for load-heavy
  workflows.
- **Mediation**:
  1. Add queue telemetry (wait time, load duration, contention count).
  2. Add stress tests with interleaved load/install/save/restore from multiple sessions.
  3. Move toward per-campaign catalog snapshots (copy-on-write or scoped registries), keeping queue as guardrail until
     complete.
- **Verification gate**: concurrent stress suite runs clean for N iterations; no digest drift across interleavings.

### R3. Cache invalidation confidence gap

- **Where**: [`src/campaign/campaign-grounding.ts`](../../../src/campaign/campaign-grounding.ts),
  [`src/campaign/projection.ts`](../../../src/campaign/projection.ts),
  [`src/campaign/committed-world.ts`](../../../src/campaign/committed-world.ts),
  [`src/lang/parse-cache.ts`](../../../src/lang/parse-cache.ts)
- **Risk**: correctness depends on identity/stamp/version invalidation assumptions across several memo layers.
- **Failure mode**: stale offered actions, stale projections, or state/render mismatch after install/restore.
- **Mediation**:
  1. Document each cache key contract in one internal contract note.
  2. Add debug mode for cache decisions (hit/miss + invalidation reason).
  3. Add differential tests that run key scenarios with caches forced on/off and compare canonical outputs.
- **Verification gate**: deterministic equality of transcript/save/view/chronicle under cache-on/cache-off.

### R4. Shared structure mutability by convention

- **Where**: [`src/campaign/operators.ts`](../../../src/campaign/operators.ts),
  [`src/campaign/module-assembly.ts`](../../../src/campaign/module-assembly.ts),
  [`doc/architecture/performance.md`](../performance.md)
- **Risk**: shared operator/schema structures are treated as immutable by discipline, not hard guarantees.
- **Failure mode**: accidental mutation causing nondeterminism across forks, runs, or replay.
- **Mediation**:
  1. Enforce `readonly` at type boundaries where practical.
  2. Enable deep-freeze of shared structures in dev/test mode.
  3. Add mutation-guard tests to fail fast on illegal writes.
- **Verification gate**: mutation attempts fail in development builds; no new mutable escape hatches in lint/type checks.

### R5. Save/checkpoint evolution risk

- **Where**: [`src/campaign/campaign-types.ts`](../../../src/campaign/campaign-types.ts),
  [`src/session/play-session.ts`](../../../src/session/play-session.ts),
  [`src/campaign/campaign.ts`](../../../src/campaign/campaign.ts)
- **Risk**: save/checkpoint schema is versioned (`version: 1`) but has no migration path yet; replay trust checks rely on
  digest continuity.
- **Failure mode**: legitimate engine evolution making old saves non-resumable or fragile across deployments.
- **Mediation**:
  1. Establish explicit compatibility policy (strict, rolling window, or migration-first).
  2. Add migration harness before next schema change (fixture bank of historical saves/checkpoints).
  3. Record save-format changes in release notes with verification commands.
- **Verification gate**: fixture bank restore + replay suite passes before release branch cut.

### R6. Replay command identity coupling

- **Where**: [`src/session/play-session.ts`](../../../src/session/play-session.ts),
  [`src/presentation/player-view.ts`](../../../src/presentation/player-view.ts),
  [`src/random-streams.ts`](../../../src/random-streams.ts)
- **Risk**: transcripts store user commands that are resolved against current offered choices; mission-driven presentation
  changes increase chance of accidental replay incompatibility.
- **Failure mode**: old transcript commands fail to resolve, or resolve to changed semantics.
- **Mediation**:
  1. Maintain durable command aliases for renamed player-facing commands.
  2. Add transcript compatibility tests for representative old sessions after UX wording/ID changes.
  3. Keep deterministic domain identities stable for action-equivalent behavior.
- **Verification gate**: historical transcript corpus replays without manual edits.

### R7. Planner scaling under denser living-world agency

- **Where**: [`src/campaign/planner.ts`](../../../src/campaign/planner.ts),
  [`src/campaign/agency.ts`](../../../src/campaign/agency.ts),
  [`doc/architecture/living-world.md`](../living-world.md)
- **Risk**: richer multi-power worlds increase branch factor and search depth pressure.
- **Failure mode**: latency spikes during watches, especially when several actors replan in one tick.
- **Mediation**:
  1. Introduce per-actor planning budgets and adaptive horizons.
  2. Persist tactical subplans where safe.
  3. Benchmark with high-agency worlds, not only player-centric paths.
- **Verification gate**: p95 watch and command times within defined budget on benchmark worlds.

### R8. Authoring contract drift vs runtime cost

- **Where**: [`src/lang/module-compiler.ts`](../../../src/lang/module-compiler.ts),
  [`doc/architecture/overview.md`](../overview.md),
  [`doc/architecture/play-model.md`](../play-model.md)
- **Risk**: language expressiveness can outrun constraints that keep runtime behavior tractable and legible.
- **Failure mode**: authored content that is valid but expensive/opaque in play.
- **Mediation**:
  1. Add “cost lint” checks (unbound parameters, weakly constrained conjunctions, broad query patterns).
  2. Require new construct RFCs to include compiler rule + runtime complexity note + player-surface note.
  3. Add static warnings for patterns correlated with past slowdowns.
- **Verification gate**: new high-cost constructs fail lint or require explicit override with rationale.

### R9. Mission 20 semantics split risk (meaning/perception/presentation)

- **Where**: [`doc/architecture/mission-20/opportunities.md`](./opportunities.md),
  [`doc/architecture/mission-20/amendment-6.md`](./amendment-6.md),
  [`src/presentation/player-view.ts`](../../../src/presentation/player-view.ts),
  [`src/ui/screen-model.ts`](../../../src/ui/screen-model.ts)
- **Risk**: rapid UX iteration can re-couple opportunity ranking/styling to hidden game state, violating “honest” cues.
- **Failure mode**: false promises, inconsistent marks, and player trust loss despite technically legal actions.
- **Mediation**:
  1. Keep a strict data pipeline: world meaning → player-perceivable facts → presentation mapping.
  2. Add assertions/tests that styled opportunities map only to legal visible actions or explained states.
  3. Maintain a “false-promise” test corpus from cold rounds.
- **Verification gate**: cold-round regression checklist passes on representative starts/seeds.

### R10. Architecture/documentation divergence

- **Where**: [`doc/architecture/overview.md`](../overview.md),
  [`doc/architecture/performance.md`](../performance.md),
  [`doc/architecture/verification.md`](../verification.md),
  [`doc/architecture/mission-20/log.md`](./log.md)
- **Risk**: rich narrative docs can become stale during fast implementation cycles.
- **Failure mode**: incorrect assumptions in future changes, duplicate fixes, or misleading onboarding.
- **Mediation**:
  1. Add doc freshness checks in mission closure (changed subsystem must touch its architecture note or assert no drift).
  2. Add concise “current invariants” appendix updated per mission.
  3. Promote “known broken assumptions” section when temporary deviations are accepted.
- **Verification gate**: mission handoff includes explicit architecture drift review.

## Prioritized mediation plan

### Immediate (Mission 20, low disruption)

1. Add lifecycle invariant assertions around command execution/rollback.
2. Add cache/load telemetry and debug toggles.
3. Build cache-on/cache-off differential determinism tests.
4. Add transcript compatibility replay lane for a small historical corpus.

### Near term (Mission 20–21)

1. Add planner budget controls and benchmark thresholds.
2. Add cost-lint warnings for high-risk authoring patterns.
3. Formalize save/checkpoint compatibility policy and migration harness.

### Structural (post-M20 stabilization)

1. Split command pipeline internals into explicit phases.
2. Reduce process-global catalog mutation through scoped catalog state.
3. Harden immutable shared structures by default in development builds.

## Acceptance criteria for this risk program

The mediation work is considered successful when:

1. Canonical replay outputs remain deterministic through targeted refactors.
2. Concurrency/load stress runs are stable without catalog bleed.
3. Cache diagnostics explain invalidation decisions in failing scenarios.
4. Cold-play trust regressions (false promises, contradictory marks, hidden critical actions) trend down across rounds.
5. Save/transcript compatibility expectations are explicit and verified before release.
