# Compiling once: the plan for setting out's seconds (lever 3)

The third of the six shared mechanisms (the owner, 18 November, approved). Rows: AX-03, AX-04, AX-06, AX-08, OR-08,
OR-23, OR-44, and S1-3's one defect (setting out 10.8 s on a laptop, 7.8 s on a phone: recordings/s1-3-opening.md).

## Measured (18 November, `bun scripts/load-costs.ts full`; a CPU profile of a cold and a warm start)

| Start | Total | Parse | Installs (40) | Campaign |
|---|---|---|---|---|
| cold (no parse kept) | 14.4 s | 153 parses, 3.4 MB, 8.2 s | 6.3 s | 12.8 s |
| warm (the parse store on disk) | 5.9 s | none | 2.2 s | 4.7 s |

- At a reader's pace the start made ready during creation already hides most of it (OR-08: 1.4–3.1 s from release);
  what cannot be hidden is the install chain, 4.2–5.3 s in the browser, because the protagonist's name is in every
  placement's context, so nothing of it can start before the last choice (first-touch-performance.md §6).
- `structuredClone` is the largest single self cost of a start (2.56 s over a cold and a warm run), spread over the
  actions' grounding, each install's copy of the shared rules (`ModuleBundle.loading`), composition, and world changes;
  the ohm parser is the rest of the cold cost.

## The plan, in order of saving and risk

1. **Compiled modules kept by text** (about −2.5 s warm, no world changes): a module's compiled form keyed by the hash
   of its text and the shared rules' edition, kept in memory and in the page's store.
2. **The shared rules composed once per edition** (AX-03, about −0.9 s): composed and validated once, every install
   referring to them, after proving that a shared declaration's validity does not depend on the module beside it.
3. **Copies at handoffs only where something will change** (about −1.0 s): the shared rules' copy per install, the
   actions' grounding, the world's changes, each by the immutability its readers already keep.
4. **The name out of the installs' inputs** (lets the chain be prepared during creation): the country's people drawn
   without reference to the protagonist's name, a collision settled after. Changes generated worlds (traces, fixtures):
   last, and measured.

Each step keeps the determinism pins (test/set-out-ready: a checkpoint byte-equal to a cold set-out) and is measured
by `scripts/load-costs.ts` and the S1-3 recorder before and after. The profile is kept at
/var/tmp/kyrie/m22/prof/full-warm.md.

## Done (18 November, branch compile-1; `bun scripts/load-costs.ts full`, and alternating warm runs on a loaded machine)

| Step | Commit | Measured |
|---|---|---|
| before | dd0714c4 | cold 13.1 s (installs 5.9 s) · warm 6.2 s (installs 2.3 s, campaign 5.0 s) · again in the process 9.7 s |
| 1. compiled modules kept by text | 5cef917a | warm 5.2 s (installs 1.8 s, campaign 4.2 s) · again 4.7 s · cold unchanged (12.9 s) |
| 2. the shared rules checked once in each install | 5a918b9f | installs warm, alternating: 2.02–2.71 → 1.93–2.21 s (about −0.2 s) |
| 3. copies only where the reader changes | (the commit after) | installs warm, alternating: 1.87–2.79 → 1.43–1.67 s (about −0.5 s); all three: cold 12.9 s (installs 5.6 s) · warm **4.7 s** (installs 1.35 s, campaign 3.7 s) · again 4.2 s |

1. **Kept by text** (`CompiledModules`): a module's own files read among their kinds, joined and shadowed are kept by
   their texts, the kinds already in the catalogs that they name (`Vocabularies.seen`), and the shared rules' edition
   (a hash of their texts), in the process and through `ParseCache.store` (the disk's ParseStore, the browser's
   ParseKeep). Taken, its kinds go back into the catalogs as reading would have put them. The parse store's edition now
   covers module-bundle, module-shadow and compiled-modules, which compile them. test/compiled-modules: a start from
   kept modules is the start compiled afresh, the whole checkpoint alike (mutation-checked: without the kinds put back,
   or without the copy, it fails). Less than the −2.5 s guessed: what a kept compile skips is the per-file copies and
   joins (about 0.5 s). Composition, its naming and the campaign's joining depend on the seed and the generated
   manifest, so they cannot be kept by text. In the browser each module adds one entry beside its parses, against
   ParseKeep's budget of 240. A warm a1 touches about 64 parses and 40 compiled modules, so the budget holds, but a
   module's own parses now age out once it is kept compiled.
2. **Validated once per edition is unsound** (test/shared-validity). A shared declaration's validity depends on the
   module beside it, both ways. Lay to rest's parameter `site` is refused beside a module that declares a place named
   site (`Parameter shadows entity`) and accepted beside another. The shared rules alone are invalid: they name a pole
   (`needs(prodding, pole)`) that only composition declares. Every other check is monotone once ids are unique (entity
   types, signatures, kinds, texts), so a sound per-edition cache would have to keep the parameter-shadow and
   uniqueness checks per install and validate the edition after composition's own additions. What holds was done:
   each install checks its module once, outcomes, pressures and goals in the same pass. Before, `readOnly` checked the
   whole module a second time after `instantiate`, which only settles dice (the shared rules hold none). Of the 0.4 s
   the installs spent validating, about half was that second pass.
3. **Copies removed, each reader's writes checked:**
   - `ModuleNamespace.action`: the schema was copied deep, then nearly every part rebuilt; now it is spread. What stays
     shared (bindings, until) is only written by ClockShift, which sets top-level parts and copies on write, and
     operators are never changed after loading (Campaign.fork).
   - `ModuleNamespace.change`: the change was copied deep; now it is spread. Its call and value are rebuilt anyway.
   - `ModuleAssembly.compose`: `definition.schemas` was a deep copy of the instance's actions; it is now the same
     array. Between composition and naming they are only checked (readOnly, ModuleCanon.settle reads them).
   - `ModuleInstallations.extended`: every actor of the world was copied at every install. Now only an actor an
     extension changes is copied; actors are never changed after they are joined.
   - **Kept:** the shared rules' copy per install (`structuredClone(combined)` in ModuleBundle.loading, about 0.14 s).
     `instantiate` lowers its definition in place (`change.value`, `action.requires`, `query.body`, …), and compose's
     `present` and `unheld` may write shared rules and actions. Removing it needs `instantiate` to lower by copy-on-write
     first. Also kept: the kept compiled module's copy on taking it (its installation sizes it and gives it the canon),
     the actions' grounding (`ActionSchemas.ground`), and the world's changes (`CommandResolution.world`). Those two are
     runtime copies, not on the start's path, and their readers were not audited.
4. **Not done: the name out of the installs' inputs.** The protagonist's name reaches every placement through its Deem
   context, and through `ModuleBundle.apart`'s `taken` (the names of everyone already in the world). So the country's
   people are drawn apart from it, and no install can start before the last choice. To do it: draw the country's
   people without the protagonist's name, then settle a collision after (rename the namesake, by a seeded draw). Then
   key the start made ready (EngineStarts) by the life without its name. This changes generated worlds: test/set-out-
   ready, the kept traces and the generated fixtures must be re-recorded deliberately, measured before and after. Step
   1's key holds either way, since it covers no generation.

Pins: test/set-out-ready holds after each step. Of the kept traces, wren-tower-climbed fails at step 1 already on
dd0714c4 (before any of this, checked in a clean worktree); the other two hold. `check:fast` is green at each commit.
