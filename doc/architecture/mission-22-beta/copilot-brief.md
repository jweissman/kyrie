**Find the read: the world's read-tracking misses (an investigation, with a fix if it is small)**

Kyrie keeps derived views across turns by what they read: `WorldReads` records which relations a computation reads (src/lang/world-reads.ts), `WorldMemo` keeps a value per world, and `KeptReading` / `KeptParts` / `KeptGroundings` keep a value across worlds until something it read changes (src/lang/kept-reading.ts, src/ui/kept-parts.ts, src/campaign/kept-groundings.ts). This is the engine's whole route to an incremental frame. A CPU profile (doc/architecture/mission-22-beta/turn-profile-2026-11-26.md) found presentation is 73% of a turn, so the decision and turn targets depend on it.

**The symptom.** A builder kept `Guarded.keeper` (who keeps a guarded place; it is read inside `AimAside.room`) across worlds by its reads, the way KeptParts keeps parts. Its keep-equals-fresh spec failed: after a fight, the kept value still named `gate__conger` as the well's keeper, while asking afresh named none. So something `Guarded.keeper` depends on changed in the fight without being recorded as a read.

The fight's reckoning (`DangerSense`, src/presentation/danger-sense.ts) is the suspect. It reads `campaign.readout` (creatures, hit points, conditions, inventory, `daily`) and keeps its own memo (`reckoned`, `foreseen`), all outside `World` facts. Other candidates:

- anything reading `campaign.state.creatures` or `campaign.readout` instead of world facts;
- module-level caches;
- a creature's death or removal taking effect outside the relations read.
**Do:**

1. **Reproduce it as a spec.** Take a walk with a fight at the Gatesend gate-well (the conger; see test/gate-well-conger*.test.ts and the census walks in test/support). Compare `Guarded.keeper` kept-by-reads against fresh at every turn, and show the turn where they part.
2. **Find exactly what is read but not recorded.** Name the file, the line and the datum (for example, a creature's hit points read from `campaign.readout`, which `WorldReads` never sees).
3. **Survey the class of the bug:** list every place in src/presentation, src/ui and src/campaign where a computation kept by reads (WorldMemo, KeptReading, KeptParts, KeptGroundings, anything WorldReads wraps) can reach state outside `World`. Readout, state.creatures, module statics and caches all count. This list is the real deliverable: it says what must be closed before anything can be kept across turns safely.
4. **Recommend one of three:**
- (a) make those reads visible to `WorldReads` (record a synthetic read for readout-derived state, for instance a per-creature revision);
- (b) move the state into world facts;
- (c) declare such computations unkeepable, with a lint. Say which you'd choose and why, with costs.
5. **If the fix for the conger case is small and obviously right,** include it, with its spec failing before and passing after. Otherwise leave the code and write the document.
Write `doc/architecture/hidden-reads-2026-11-27.md` with the findings, the evidence (file:line), the survey table and the recommendation. Open a pull request.

- Run `bun run check:fast`, `bun run test:small`, and the specs you add or touch. Use `bun test --timeout=30000` for walks, as CI does.
- File register rows from OR-700 up, after checking for duplicate ids.
- Report what you measured and what you couldn't check.