# Kyr

A fantasy RPG that runs in the browser, with a book's look and a persistent world underneath. Someone sets out,
alone or with companions found on the way, explores, decides, survives, comes back, recovers, grows, and goes out
again. The world does not wait: people pursue their own ends, deadlines pass, and what the company did stays done.
Danger is not scaled to the company; going round, talking, or turning back are often the better choice.

Influences: BBS door games (LORD), old-school dungeon RPGs (descending armour class, prepared spells, experience for
what you resolve), JRPG party combat without a battle grid, and Orsino's content and generators.

## Play

```sh
bun install            # Deem and the languages package are pinned by commit (doc/architecture/verification.md)
bun run web:build      # writes site/; nothing else is needed
open site/mono.html    # or serve site/ anywhere; the whole game runs in the page
```

The title page names the country you are in and offers to go on, or to begin again. Beginning, you choose who you
are and where you come from (a wanderer, a herb-wife's apprentice, someone come home to a brother and a mother who
wrote), and a country is drawn for you from a seed: its land, rivers and roads, its towns and the people who live
in them and keep their days and animals, its faiths, the works of those who built there before, its wild country,
its troubles and its wonders, all named in its people's own tongue. Nothing in it waits for you: the riders keep the
lord's toll, a fever runs in a household that needs willow bark, a power acts while you are elsewhere. What you do
there stays done; if you die, the country remembers you, and you can begin again in it.

Arrow keys move among the choices, Enter or Space takes one, Escape or Backspace goes back, `?` shows the keys, and
`t` lets a fight run itself. The terminal plays the same worlds:

```sh
bin/kyrie world thorn --terrain mountain     # describe and load a generated country
bin/kyrie campaign data/campaigns/the-long-man.campaign.json
bin/kyrie replay <transcript.json>           # replay a browser transcript; prints the canonical state
```

The Serewater March, Silkholme and Skellfold remain as test beds under `test/fixtures`; they are not played from the
title page.

## How it is built

Four layers with fixed responsibilities. **Deem** generates (creatures, regions, casts, names' meanings). **Kyr**, a
small declarative language, expresses what things mean: places, passages, people, states, actions and their
consequences. **Kyrie** is the authoritative runtime: one world state, a planner for every person, Orsino-derived
combat, and identity-keyed randomness so the same seed and choices always give the same history. The
**presentation** has no rules of its own: every choice on screen is a legal command of the runtime.

- [How Kyr works](doc/architecture/overview.md): the layers, one authored line followed to a remembered
  consequence, the invariants, and where a change belongs. Start here.
- [Ontology](doc/architecture/ontology.md) and [play model](doc/architecture/play-model.md): the vocabulary, who
  owns each mutable fact, and space, time, food, rest, services and people's agency.
- [Domain model](doc/architecture/domain-model.md): ancestries, species, classes, traits, abilities, conditions,
  backgrounds and skills, one catalog each in [data/catalog](data/catalog).
- [The living world](doc/architecture/living-world.md): powers that act while the company is elsewhere, how the
  March's conflict is built from ordinary actions, and what the company finds out and how.
- [Generated regions](doc/architecture/generated-worlds.md): how a region is drawn and adventures are situated in it.
- [Orsino coverage](doc/architecture/orsino-coverage.md): what of Orsino's 2,651 definitions Kyr represents, and how
  faithfully (generated from the ledger; see [the checkpoint](doc/architecture/orsino-checkpoint.md)).
- [Performance](doc/architecture/performance.md): measurements and the test tiers.

## Write for it

- [Authoring guide](doc/authoring/guide.md): a region with an inn, a shop, people, a ruin and a situation; its
  example is played by `test/authoring-guide.test.ts`.
- [data/README.md](data/README.md): where each kind of content lives, how modules import and export, and how the
  campaigns are composed.

```sh
bin/kyrie lint                 # every recommended campaign must load clean
bin/kyrie lint --inventory     # every relation and measure, and the files that declare it
bun run web:build                     # after any .kyr or data change: the browser bundles the authored files
```

## Develop

```sh
bun run check            # lint (zero warnings), typecheck, then the full suite
bun run test:changed     # tests affected by uncommitted changes
bun run test:fast        # everything but the long Deem choice-space proof
KYRIE_BROWSER=1 bun test ./test/caught-below-browser.test.ts   # real-browser journeys (Playwright Chromium)
```

`test/march-journey.test.ts` plays the March's three expeditions end to end; `test/conflict.test.ts` the necromancer's
operations and what disrupts them; `test/holt-keep.test.ts` the keep; `test/encounters.test.ts` declared intents,
guarding and wind-ups. `KYRIE_BROWSER=1 bun test ./test/living-world-browser.test.ts` plays the keep and the register
by keys in a real browser. `bun scripts/deem-bench.ts` times Deem generation. `bin/kyrie` is the one executable; the other files in `bin/` are
development tools (benchmarks, recorders, Orsino registry generation, Deem proofs), and `scripts/` holds the
playtest server and driver used to play the browser client by label.

Recorded play: [the March as a living world](doc/playtests/living-world-2026-10-21/README.md),
[the March's three expeditions](doc/playtests/march-2026-10-20/README.md),
[Silkholme](doc/playtests/silkholme-2026-10-20/README.md),
[a generated region](doc/playtests/rededge-2026-10-20/README.md), [the Red Crag](doc/playtests/red-crag/README.md).
What was removed in the October 2026 consolidation, and the fiction worth reusing from it:
[doc/archive/legacy-material.md](doc/archive/legacy-material.md).
