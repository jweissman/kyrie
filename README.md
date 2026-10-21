# Kyr

A party-based fantasy RPG that runs in the browser, with a terminal's look and a persistent world underneath.
Three companions set out from a town, explore, decide, survive, come back, recover, grow, and go out again. The
world does not wait: people pursue their own ends, deadlines pass, and what the company did stays done. Danger is
not scaled to the company; going round, talking, or turning back are often the better choice.

Influences: BBS door games (LORD), old-school dungeon RPGs (descending armour class, prepared spells, experience for
what you resolve), JRPG party combat without a battle grid, and Orsino's content and generators.

## Play

```sh
bun install            # Deem (../deem) and the languages (../languages) are sibling checkouts
bun run web:build      # writes site/; nothing else is needed
open site/mono.html    # or serve site/ anywhere; the whole game runs in the page
```

The title screen begins a new campaign or loads a saved file. **The Serewater March** is the one to start with:
three settlements share a river valley and their troubles: a surveyor missing under Censer Hill, something taking a
shepherd's ewes off the chalk ridge, and a green light in Holt tower across the river. Form a company (or take a
ready one); who they are decides what they can do and which ways open. Each trouble is an expedition; each can be
fought, talked down, gone round or left to others, and each changes what comes after (bring the surveyor home and
the ferry runs). The other entries are shorter: Silkholme, Skellfold, the Red Crag, and **a generated region**, in
which Deem draws a region (its towns, people, faith and wild places, named in its people's tongue) and situates
authored adventures in it.

Keys: ↑↓ to look, Enter to do, digits to do at once, Esc to go back; E/I/C/J/M for explore, pack, company,
journal and map. The terminal plays the same campaigns:

```sh
bun bin/kyrie.ts campaign data/campaigns/serewater-march.campaign.json
bun bin/kyrie.ts world thorn --terrain mountain     # describe and load a generated region
bun bin/kyrie.ts replay <transcript.json>           # replay a browser transcript; prints the canonical state
```

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
bun bin/kyrie.ts lint                 # every recommended campaign must load clean
bun bin/kyrie.ts lint --inventory     # every relation and measure, and the files that declare it
bun run web:build                     # after any .kyr or data change: the browser bundles the authored files
```

## Develop

```sh
bun run check            # lint (zero warnings), typecheck, then the full suite
bun run test:changed     # tests affected by uncommitted changes
bun run test:fast        # everything but the long Deem choice-space proof
KYRIE_BROWSER=1 bun test ./test/caught-below-browser.test.ts   # real-browser journeys (Playwright Chromium)
```

`test/march-journey.test.ts` plays the March's three expeditions end to end; `test/encounters.test.ts` covers
declared intents, guarding and wind-ups. `bin/kyrie.ts` is the one executable; the other files in `bin/` are
development tools (benchmarks, recorders, Orsino registry generation, Deem proofs), and `scripts/` holds the
playtest server and driver used to play the browser client by label.

Recorded play: [Silkholme](doc/playtests/silkholme-2026-10-20/README.md),
[a generated region](doc/playtests/rededge-2026-10-20/README.md), [the Red Crag](doc/playtests/red-crag/README.md).
What was removed in the October 2026 consolidation, and the fiction worth reusing from it:
[doc/archive/legacy-material.md](doc/archive/legacy-material.md).
