# Westernesse

*A History of Emprise.* A literary fantasy RPG set in the world of Imbar, a Seventh Star game. It runs in the
browser, with a book's look and a persistent world underneath. Someone sets out, alone or with companions found on
the way, explores, decides, survives, comes back, recovers, grows, and goes out again. The world does not wait: people
pursue their own ends, deadlines pass, and what the company did stays done. Danger is not scaled to the company;
going round, talking, or turning back are often the better choice.

**Kyrie** is the engine, **Kyr** the language the world is written in, **Deem** the library that generates what no one
wrote by hand. (Older pages call the whole game "Kyr".) Influences: BBS door games (LORD), old-school dungeon RPGs
(descending armour class, prepared spells, experience for what you resolve), JRPG party combat without a battle grid,
and Orsino's content and generators.

## Where to start

| You want | Read |
|---|---|
| what it is meant to be | [the creative vision](doc/design/VISION.md) |
| to write something for it | [the authoring trail](doc/authoring/README.md): nine short pages, every command run |
| how it is built | [How Kyr works](doc/architecture/overview.md), then [the project contract](doc/CONTRACT.md) |
| what is promised, built, broken or wished | [the findings index](doc/architecture/findings/index.md) |
| everything else | [the documentation index](doc/README.md), each document marked current, historical, aspiration, proposal or obsolete |

**Where it stands** (6 November 2026): a new life begins as one person in a town of a generated country; the first
town's jobs, travel on a 3D hex map, wild country, ruins and deep sites, recruits, trade, combat and an Encyclopedia
are built and have been played through the page by the builder; twenty-one authored adventures lie as provinces of
every first country. No independent player and not the owner has yet accepted a build since Mission 19's repairs;
the current mission's record is [doc/architecture/mission-19](doc/architecture/mission-19/progress.md).

## Play

```sh
bun install            # Deem and the languages package: git URLs pinned at a commit (doc/architecture/verification.md)
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
bin/kyrie world a1                           # describe a generated country (a1 is the reference seed)
bin/kyrie play --world a1 --as human/thief/Wat "To the landing at Lowmouth"   # play into it by the page's labels
bin/kyrie replay <transcript.json>           # replay a browser transcript; prints the canonical state
bin/kyrie campaign data/campaigns/the-long-man.campaign.json   # an adventure on its own, with a preset company (legacy)
```

The Serewater March, Silkholme and Skellfold remain as test beds under `test/fixtures`; they are not played from the
title page.

## How it is built

Four layers with fixed responsibilities. **Deem** generates (regions, towns, people, names' meanings). **Kyr**, a
small declarative language, expresses what things mean: places, passages, people, states, actions and their
consequences. **Kyrie** is the authoritative runtime: one world state, a planner for every person, Orsino-derived
combat, and identity-keyed randomness so the same seed and choices always give the same history. The
**presentation** has no rules of its own: every choice on screen is a legal command of the runtime.

- [How Kyr works](doc/architecture/overview.md): the layers, one authored line followed to a remembered
  consequence, the invariants, and where a change belongs.
- [Ontology](doc/architecture/ontology.md) and [play model](doc/architecture/play-model.md): the vocabulary, who
  owns each mutable fact, and space, time, food, rest, services and people's agency.
- [Domain model](doc/architecture/domain-model.md): ancestries, species, classes, traits, abilities, conditions,
  backgrounds and skills, one catalog each in [data/catalog](data/catalog).
- [The living world](doc/architecture/living-world.md) and [generated regions](doc/architecture/generated-worlds.md).
- [Orsino coverage](doc/architecture/orsino-coverage.md): what of Orsino's definitions Kyr represents, and how
  faithfully (generated from the ledger).
- [Performance](doc/architecture/performance.md) and [verification](doc/architecture/verification.md): measures and
  the test tiers.

## Write for it

Start with [the authoring trail](doc/authoring/README.md). The [authoring guide](doc/authoring/guide.md) is the full
manual of the language (its example is played by `test/authoring-guide.test.ts`); [data/README.md](data/README.md)
says where each kind of content lives.

```sh
bin/kyrie new <id> "Title"     # an adventure that lints, plays and tests as written
bin/kyrie lint                 # every recommended campaign must load clean
bin/kyrie lint --inventory     # every relation and measure, and the files that declare it
bin/kyrie verify <adventure>   # its lint, specs and kept traces
bun run web:build              # after any .kyr or data change: the browser bundles the authored files
```

## Develop

```sh
bun run check:fast       # the routine check: incremental typecheck, cached lint, the quick suite (about 30 s warm)
bun run test:changed     # then the specs a change touches, by its code and by the data it names
bun run test:quick       # the specs under two seconds each (about 10 s, one module registry a worker)
KYRIE_BROWSER=1 bun test ./test/opening-browser.test.ts   # real-browser journeys (Playwright Chromium; one heavy job at a time)
```

The whole suite (some 840 spec files, over 800 CI file-minutes), the browser specs and the long descents
(`KYRIE_LONG=1`) are CI's: push a branch and read its run. `bun run check` runs everything locally and takes hours;
it is not the routine check. Why, and the route to a faster loop: `doc/architecture/mission-20/test-loop.md`.

`test/march-journey.test.ts` plays the March's three expeditions end to end; `test/conflict.test.ts` the necromancer's
operations and what disrupts them; `test/holt-keep.test.ts` the keep; `test/encounters.test.ts` declared intents,
guarding and wind-ups. `bin/kyrie` is the one executable (`bin/kyrie help`); development tools (benchmarks, recorders,
Orsino registry generation, the playtest server and driver used to play the browser client by label) live in
`scripts/`.

Recorded play: [the March as a living world](doc/playtests/living-world-2026-10-21/README.md),
[the March's three expeditions](doc/playtests/march-2026-10-20/README.md),
[Silkholme](doc/playtests/silkholme-2026-10-20/README.md),
[a generated region](doc/playtests/rededge-2026-10-20/README.md), [the Red Crag](doc/playtests/red-crag/README.md);
the latest evidence is [Mission 19's](doc/architecture/mission-19/evidence.md). What was removed in the October 2026
consolidation, and the fiction worth reusing from it: [doc/archive/legacy-material.md](doc/archive/legacy-material.md).
