# Kyrie

An experimental RPG engine: structured Kyr scenario modules, Deem generation,
a symbolic planner, and a nonspatial party battle system.

## Architecture and authoring (start here)

- [How Kyr works](doc/architecture/overview.md): the four layers, one authored line followed through to a remembered
  consequence, the invariants to defend, and where a change belongs.
- [Performance and the development loop](doc/architecture/performance.md): measurements and the test tiers.

```sh
bun run test:changed   # files affected by uncommitted changes
bun run test:fast      # everything but the 608-call public CLI proof (~20 s)
bun run test           # full suite in parallel (~40 s)
bun bin/bench.ts       # engine workload timings
```

## Silkholme: the integrated expedition

A shepherd losing ewes, a silk-gatherer who lives by a spider brood, and a chalk sink with a rope shaft and webbed
nest. Feed the brood-mother, burn the webs, fight a brood of three Deem-composed spiders, or leave it to the shepherd.
Open `site/mono.html?campaign=data/campaigns/silkholme.campaign.json` after `bun run web:build`. See
[the playtest](doc/playtests/silkholme-2026-10-20/README.md).

Kyr worlds are built from a small canonical vocabulary: places in one containment tree, passages with kinds and
durations, things with states, items, people with Orsino professions and backgrounds, a company, facts, events and
offers. New work uses only that vocabulary. Older campaigns remain as replayable fixtures.

- [Authoring guide](doc/authoring/guide.md): build a region with an inn, a shop, people, a ruin and a situation.
  Its example is extracted and played by `test/authoring-guide.test.ts`.
- [Ontology](doc/architecture/ontology.md): the vocabulary, the authority for each mutable property, and how
  authored, generated and default values combine.
- [Play model](doc/architecture/play-model.md): space, time scales, food, rest, services and NPC agency.
- [Generated regions](doc/architecture/generated-worlds.md): Deem generates a region, scenarios are selected by
  the contexts they declare and situated in it, and word of them spreads through people. Try
  `bun bin/world.ts thorn --terrain mountain`, or play `site/mono.html?world=thorn&terrain=mountain`
  ([a played journey](doc/playtests/rededge-2026-10-20/README.md)).
- [Milestone reports](doc/architecture/milestones.md), [audit](doc/architecture/audit.md) and
  [migration plan](doc/architecture/migration.md).

```sh
bun bin/kyrie.ts lint               # recommended worlds must be clean; legacy worlds are reported
bun bin/kyrie.ts lint --inventory   # every relation and measure, and the files that declare it
```

## The fantasy domain model

Content lives in [data/catalog](data/catalog), one catalog per concept: ancestries, species (with variants), classes,
traits (lineage, nature, feat, specialization…), conditions, abilities, backgrounds, skills, items, religion
(domains and deities), organisms and rules. Persons are written with `Ancestry`, `Calling`, `Trait`, `Carries`,
`Background` and `Profession`, or with `Species` for creatures. Site mechanisms are `Hazard`s in their own module.
See [the domain model](doc/architecture/domain-model.md) and [its report](doc/architecture/domain-model-report.md).
Material that only legacy campaigns use is quarantined in [data/legacy](data/legacy); lint reports any use of it.

## Orsino registry and the Red Crag

`data/sources/orsino/registry.json` catalogues all 2,651 Orsino source definitions, generated reproducibly from the Orsino
checkout. `data/sources/orsino/adaptations.json` records which Kyr definitions represent which entries, and how far. The
compatibility matrix is generated: [orsino-coverage.md](doc/architecture/orsino-coverage.md). See
[the checkpoint](doc/architecture/orsino-checkpoint.md) for the inventory, architecture and plan. The first vertical
slice is a red dragon composed from Orsino's monster tables, with breath saves, recharge, resistances and fire that
burns a bridge: [doc/playtests/red-crag](doc/playtests/red-crag/README.md).

```sh
bun bin/orsino-registry.ts generate   # from ../orsino; report | check validate the ledger
bun test test/orsino-registry.test.ts test/red-crag.test.ts
```

## Caught Below: one situation, rebuilt

A portable rescue situation written with first-class passages, things, events and goals. It is installed at Reedwake
(river) and at Skellfold (quarry) from the same source. These are the recommended example of the canonical
vocabulary: each site has an inn or smith, a shop with counted stock, daily meals, camping, measured travel, and
maps at two scales. The default company's Orsino backgrounds (hunter, locksmith, medic) open different approaches. Open `site/mono.html?campaign=data/campaigns/serewater-march.campaign.json`
or `…/quarry.campaign.json` after `bun run web:build`. See [the intended experience](doc/design/caught-below.md),
[the report](doc/design/caught-below-report.md), [the situation's roles](data/situations/caught-below/README.md) and
[browser histories](doc/playtests/caught-below/).

```sh
bun test test/caught-below.test.ts test/overlays.test.ts test/expedition.test.ts test/world-constructs.test.ts
KYRIE_BROWSER=1 bun test test/caught-below-browser.test.ts
bun bin/record-caught-below.ts && bun bin/caught-below-history.ts   # screenshots, transcripts, readable histories
```

## Mono client and independent review

`site/mono.html` is a compact, monospace, menu-driven game screen for Serewater, built on a renderer-independent
screen model (`src/ui/screen-model.ts`). Every action it offers is a legal `PlayerView` command. See
[the Mono client](doc/playtests/mono/README.md) for build steps, screenshots, tests and the comparison with the previous
player, and [the independent review](doc/design/independent-review.md) for the diagnosis that motivated it.

```sh
bun run web:build                                    # then open site/mono.html; no server needed
KYRIE_BROWSER=1 bun test test/mono-browser.test.ts   # real-browser journey (needs Playwright Chromium)
bun bin/record-mono.ts                               # re-record screenshots and the reference transcript
```

## Play the Serewater March

The default browser page opens **Serewater March**: create three companions, prepare in Reedwake,
and explore eighteen rooms across three levels of Censer Hill. Speak with the burial keeper and salvagers,
rescue and escort a surveyor, discover secret and climbing routes, respond to physical traps,
fight or bypass the Custodian, recover equipment, train, rest and undertake another expedition.
Creatures, possessions, injuries and discoveries persist.

```sh
bun run web:build
# Open site/index.html. Everything runs locally; no game server is required.
bun run kyrie campaign data/serewater/campaign.json serewater
bun run kyrie replay doc/playtests/serewater/fellowship.browser.replay.json
```

See the [campaign and bounded mechanics](doc/serewater-campaign.md),
[actual browser screenshots and histories](doc/playtests/serewater/README.md),
[authoring account](doc/authoring/serewater-package.md), and
[Orsino compatibility boundary](doc/orsino-compatibility.md).

`site/orra.html` preserves the earlier Saint Orra player and its separate saves.
`site/workbench.html` remains the developer interface. The [Milestone A review](doc/design/classical-rpg-review.md)
and [original client study](doc/playtests/lantern-road/README.md) record the preceding design work.

## Browser player and developer workbench

A static, browser-only player runs the same engine (DEEM generation, Kyr rules, NPC planning, combat, saves)
entirely in the page. No server is needed to play.

```sh
bun run web:build          # writes site/; open site/index.html directly, or publish site/ anywhere
bun run web:dev            # same build plus a local static preview at http://localhost:8080/
bun run kyrie replay t.json   # CLI replay of a browser-exported transcript; prints the canonical state
```

`index.html` is the Serewater player interface; `workbench.html` retains the developer tool. Both execute the same simulation.
The workbench's Play mode shows only what the party perceives; Inspect mode shows authoritative facts, NPC goals and plans,
the event log and a run comparison. See [the browser workbench report](doc/browser-workbench.md) for the
architecture, review, playtest findings and recommendations. `.github/workflows/pages.yml` publishes `site/`
to GitHub Pages (set the `DEEM_REPOSITORY` repository variable for the sibling DEEM checkout).

## Play

```sh
bun install
# Serewater: town preparation and a persistent three-level dungeon:
bun run kyrie campaign data/serewater/campaign.json serewater
# Earlier Saint Orra investigation and expedition:
bun run kyrie campaign data/orra/play.campaign.json orra
# Bounded discovery experiment:
bun run kyrie campaign data/discovery/orchard.campaign.json glass
bun run kyrie campaign data/bundles/two-sites.campaign.json sites
# Earlier single-adventure slice:
bun run kyrie adventure slice
# Resume a checkpoint created with `save /tmp/crossing.json`:
bun run kyrie resume /tmp/crossing.json
# Original single-puzzle campaign:
bun run play demo
# Optional party composition, using the same classes available to NPCs:
bun run play demo fighter,cleric,commoner
```

The terminal offers campaign actions, `hint` for a plan, `inspect` for symbolic
state, and `auto` for the next planned action. In combat, first select an ability,
then its eligible target. Self/group abilities determine their scope automatically.
Use `b` to return from targeting or `q` to quit. Combat logs use readable sentences.

The persistent adventure continues after delivery or a missed deadline. NPCs act
on every elapsed campaign watch, including while the player is away. See the
[playable campaign slice](doc/playable-campaign.md) for the authoring files,
time/save semantics, four tested histories, and current limitations.

The [discovery experiment](doc/discovery-experiment.md) separates world truth,
private knowledge, evidence, trusted reporting and player visibility using ordinary
Kyr rules and compositional DEEM records.

The [module bundle guide](doc/module-bundles.md) describes author-facing manifests,
explicit imports/exports, two-site persistence, and late installation without a
TypeScript catalog entry.

Build a standalone binary with embedded data and grammars:

```sh
bun run build
./dist/kyrie play demo
./dist/kyrie auto demo
./dist/kyrie classes
./dist/kyrie races
./dist/kyrie abilities
```

## Author and generate modules

The hand-authored scenario is [crossing.kyr](data/modules/crossing.kyr). Its
vocabulary is declared inside the module, not enumerated by the core parser:

```text
Relation at(entity, place) exclusive.
Measure quantity(group, item).
Query has(owner: group, goods: item) means quantity(owner, goods) > 0.

Action parley "Offer food for safe passage" {
  Requires hungry(raiders) and has(party, rations) and blocked(bridge).
  Cost 1. Time 1.
  On success {
    Decrease quantity(party, rations) by 1.
    Retract blocked(bridge).
    Assert allied(party, raiders).
  }
}
```

The full file declares kinds, entities, relations, quantities, queries, initial
state, a goal, and action consequences. `has` derives from quantity: spending the
last ration changes its answer automatically. Exclusive `at` permits one location
per subject, so moving cargo replaces its previous location.

```sh
./dist/kyrie play-module data/modules/crossing.kyr demo
./dist/kyrie auto-module data/modules/crossing.kyr demo
./dist/kyrie module experiment-7 > /tmp/crossing.kyr
./dist/kyrie validate-module /tmp/crossing.kyr
./dist/kyrie play-module /tmp/crossing.kyr experiment-7
./dist/kyrie module-batch research 100
```

Deem selects town names, cargo, starting resources, deadlines, and a subset of
available approaches. Generated variants have different action graphs, not just
different labels. They serialize to the same Kyr format as the authored module.
Candidates are type-checked and accepted only when the symbolic planner finds a
route within their budget. Generation retries up to 32 deterministic candidates.

This is a **constrained module-generation experiment** over one authored situation.
It does not invent arbitrary plots. Reachability assumes encounters succeed;
actual combat can defeat the party or force replanning. `module-batch` reports
variation and symbolic plans, not guaranteed gameplay wins. Town names currently
come from curated tables; Orsino's language/naming system is deferred.

## Content and rulesets

- [Kyr.ohm](src/lang/Kyr.ohm): genre-independent module and query syntax.
- [Abilities.ohm](src/lang/Abilities.ohm): the current RPG effect-language extension.
- [data/catalog](data/catalog): the canonical catalogs (see "The fantasy domain model" above).
- [data/default](data/default): standard Deem tables/templates.
- [data/rulesets/world](data/rulesets/world): the canonical rules (core, passages, people, needs, services, care,
  belongings).

A goblin cleric and human cleric use the same class definition and resolution
rules. Race, class, and allegiance are separate. Ancestry currently supplies
identity and naming; it does not secretly alter stats or grant unimplemented traits.

The combat rules remain provisional. Attacks still hit automatically and use the
old fixed formula: **weapon profiles, equipment, accuracy, and defense resolution
are still the next combat ruleset task**. This module experiment does not solve
that criticism. Other missing systems include save/load, inventory transfer,
level advancement, and reactive/passive effects.

## Checks and simulation

```sh
bun run check                   # lint with zero warnings, TypeScript, tests
bun run kyrie validate           # catalog and authored module
bun run arena auto demo          # original two-versus-two fixture
bun run kyrie batch research 1000
```

Deem remains a local library dependency at `../deem`; install its dependencies in
that checkout too. Verified with Bun 1.4.3. The scaffold is also usable directly:

```sh
deem validate --settingDir .
deem run --settingDir . --type character --seed demo
deem run --settingDir . --type module --seed demo
```

The raw Deem `module` result is a generation manifest. `kyrie module` composes it
into a complete, checked Kyr module. See [design notes](doc/design.md) for semantics,
architecture, research limitations, and the remaining Orsino effect target.
# kyrie
