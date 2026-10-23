# The Kyrie project contract

What every change keeps true. Where a rule is checked by machine, the check is named; a rule without one is still a
rule.

## 1. Layout and the command line

- `bin/` holds one file, `bin/kyrie`: the command line. What it does lives in `src/cli` (`bin/kyrie help`): play a
  campaign, lint, compile, test, validate, preview, the world tool, the voice tables, the handbooks, the Orsino
  registry. Development utilities (benchmarks, the painting and asset tools, the web build) live in `scripts/`.
- Generated files say what generated them and are not edited by hand: `data/catalog/orsino/*`,
  `data/generation/scenes/orsino-world.json`, `data/sources/orsino/inventory.json`, `doc/handbook/*`,
  `data/paintings/{likeness,registry}.json`, `web/bundles.generated.json`.
- *Checked by* `test/repository.test.ts`.

## 2. Who owns what content

- **General semantics** (what can be said and how it runs) live in Kyr and the engine: `src/lang`, `src/campaign`,
  and the shared rules modules in `data/rules`.
- **Shared setting content** (Orsino's ancestries, classes, creatures, items, spells; the generators' tables) lives in
  `data/catalog` and `data/generation`.
- **A campaign's or scenario's own fiction** (its item kinds, creatures, mechanisms, laws, people, words and
  generation tables) is declared in its own modules and travels with them. It is never added to a shared catalog or
  a TypeScript registry to make it work. Two scenarios that use the same name for different things do not see
  each other's.

## 3. Determinism and persistence

- The same seed, the same choices and the same code give the same world and the same play. Randomness is drawn
  from named streams (`Draw`, `Expressions`); a new kind of draw gets a stream of its own so nothing else moves.
- A save restores to the same play: the compiled world kept once by its content, the state as what changed
  (`web/engine/kept-game.ts`). Anything play can create or change is in the state.
- *Checked by* `test/kept-game.test.ts`, `test/save-codec.test.ts`, `test/play-session.test.ts`.

## 4. Commands and what the player sees

- A choice is known by its command, never by its label.
- Every choice the page presents does something visible: it succeeds, it fails and says why, or it shows what stands
  in the way. Nothing clickable is inert. A choice that cannot be taken says why where it is offered.
- What the page says is what the company could know: no unlearned names, nothing the generator knows that the
  player has not met.
- *Checked by* `test/command-contract.test.ts`, `test/ui.test.ts`, `test/narration-audit.test.ts`, the browser suites
  (`KYRIE_BROWSER=1`).

## 5. Sources and Orsino

- Every Orsino entry has a status computed from what Kyr has and draws, not claimed (`bin/kyrie orsino inventory`).
  Executable records may not omit; evidence quotes test text (`bin/kyrie orsino check`).
- A painting is credited only from what its own file says; what is unknown stays unknown ("Painter unrecorded").
- *Checked by* `test/orsino-registry.test.ts`, `test/orsino-inventory.test.ts`, `test/paintings.test.ts`.

## 6. Other people's work

- Uncommitted work in the tree is the owner's: it is not stashed, reset, committed or reformatted by anyone else
  (`eslint.config.mts`, `deem.run.json`, `assets/` in particular). Lint limits are the owner's to set.
- Independent branches stay independent (`house-that-grows-authoring` is evidence, not a merge candidate).

## 7. Testing and reporting

- A report says what was played, by whom, and what was not verified. Play by the developer is not independent human
  testing and is never reported as such.
- Something is complete when it can be shown working in play, not when its data structures exist.
- The suite passes before a commit; a failure is reported with its output, not hidden.
