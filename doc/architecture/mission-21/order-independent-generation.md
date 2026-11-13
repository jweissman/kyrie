# Order-independent world generation: a conceptual overview

The owner's question (14 November): can Deem and Kyrie give the world durable identities and global commitments
without realizing every place in full? Could the same seed give the same shrine keeper whether that shrine is
visited first or last? And what then of unique entities, linked situations, saves, content changes and off-screen
events?

This note answers from the code as it stands in the `m21` worktree (15386e37). Its line numbers are those of the
working tree, which held another agent's uncommitted timing instrumentation (`Costs`) in `content.ts`,
`module-bundle.ts`, `world-assembler.ts` and `campaign.ts`. Against the commit, those files' lines may be one to
three lower. It builds on Experiment B
([world/construction.md](world/construction.md)), which measured world construction and showed by a long spec
(`test/crossing-order.test.ts:101`, an `it.failing`) that a country beyond a march depends on the order of crossings.
Nothing was run for this note: no tests, benchmarks or world draws. Every file:line was read. A claim marked
*inferred* follows from reading the code but was not observed in a run. Measured figures are quoted from Experiment B.

## 1. How generation is ordered today

### What is keyed by identity

Most of Kyrie's randomness is keyed by identity, as the architecture map says (`doc/architecture/README.md:82`, "Randomness is keyed by
identity"). The building blocks:

- **Stream keys.** `RandomStreams.key(seed, domain, ...identity)` is a JSON array (`src/random-streams.ts:5-7`), so
  keys cannot collide by concatenation. `Expressions` hashes the key with 32-bit FNV-1a and seeds a Deem runtime
  (`src/expressions.ts:7-14`). Deem's generator is mulberry32 (`node_modules/deem/src/stdlib.ts:16-20`).
- **The grid.** Every country has an address. `WorldGrid.id(x, y)` gives `region` or `x1y0`, and
  `WorldGrid.seed(seed, x, y)` gives `seed@x,y` (`src/world/world-grid.ts:13-19`). A region's Deem draw is keyed by
  its own cell (`world-grid.ts:46-56`, with a per-process memo), and so are its land, history and peoples
  (`src/world/world-assembler.ts:166-175`, `235-247`).
- **The world's fixed shape.** `WorldShape` decides seas, deserts and the seat of Dun Rìerdan from
  `data/imbar/shape.json` by rule over the grid, with no seed at all (`src/world/world-shape.ts:29-80`).
- **One global plan.** `Countries.plan(seed, first)` allocates every authored country to a cell from the seed and
  the first country's terrain alone, and memoizes it (`src/world/countries.ts:78-96`). This is the codebase's one
  true *global commitment*: it is made before any of those countries is realized, and every border reads it
  (`countries.ts:144-186`, `src/world/frontier.ts:36-42`, `173-178`).
- **A constraint decided from addresses alone.** A region is never called what a neighbour is called. It checks
  itself against its neighbours' *first draws*, which are pure functions of their cells, not against their realized
  names (`world-grid.ts:28-36`). This is the pattern section 2 generalizes.
- **Creatures by stream per domain.** `Content.createCreature(id, context, randomIdentity)` draws population, class,
  attributes, name, traits, spells, hit points, weapon and armour, each from
  `RandomStreams.key(seed, domain, randomIdentity)` (`src/content.ts:143-212`, `221`). So a new trait row changes
  traits and nothing else. `RegionPeoples` keeps pronouns on a stream of their own for the same reason
  (`src/world/region-peoples.ts:31`). `RegionFaith` keys each shrine by `${region.name}:${s.id}:faith`
  (`src/world/region-faith.ts:29`).
- **Command draws.** A command's stream is its action's identity plus how many earlier commands had the same
  identity (`random-streams.ts:18-27`). So doing A then B draws the same for each as doing B then A.

### What still depends on order, or on what was drawn before

Within one country the draw is sequential on purpose. `PlaceNames.render` uses one stream (`${seed}:names`) and one
`taken` list for the whole country (`src/world/place-names.ts:41-60`). `take` pushes each chosen name onto it
(`place-names.ts:136-140`), so a later site is named apart from earlier ones. `RegionPeoples.settle` names every
settlement's four townsfolk from one stream with a shared `used` set (`region-peoples.ts:26-42`). Scenario choice
within a country is a sequence of rounds keyed by round number, over an `open` list that shrinks as sites are
`claimed` (`world-assembler.ts:182-203`). Deem's own templates evaluate their fields in order on one stream, and the
region template draws `name` after `genList(settlement, 3)`, `genList(site, 3)` and `gen(wonder)`
(`data/generation/templates/places.json:2-13`). This is order dependence *within an atomic unit*, and it is harmless
while the country is the unit. It does matter for content changes (section 3d).

The order dependence that matters comes from crossing the edge of that unit: a country reads what the rest of the
world already holds. `Frontier.drawn` hands `WorldAssembler.beyond` five things read from the live campaign
(`frontier.ts:141-153`):

- `exclude`: every scenario already placed anywhere (`frontier.ts:197-202`). `settle` turns it into a count of
  Infinity (`world-assembler.ts:183`), so a one-instance scenario (the fever) goes to whichever country is drawn
  first.
- `taken`: the names of works already drawn (`frontier.ts:204-206`). `Histories.make` names this country's works
  apart from them (`src/world/history/histories.ts:59-66`), and `PlaceNames.render` then names the other sites apart
  from those works (`place-names.ts:58`).
- `held`: the paintings the world's people already hold (`src/paintings/sittings.ts:35-37`), which this country's
  people are painted apart from (`src/world/community/community-writer.ts:73-79`).
- `named`: the real names of neighbours already installed (`frontier.ts:208-219`). In practice this equals the
  deterministic draw, except in worlds kept from before a plan changed.
- `calendar`: the campaign's start date, which is constant.

Two more dependencies sit at install time rather than draw time. `ModuleBundle.apart` adds the name of every person
already in the world to a story's `taken` list before its people are generated (`src/campaign/module-bundle.ts:93-99`,
`323`). The generation context also receives `now: elapsed` (`module-bundle.ts:323`). And
`StoryPeople.reserve` renames a country's townsfolk who drew a name that one of its placed stories uses
(`src/world/story-people.ts:36-45`, `region-peoples.ts:46-54`). Which stories are placed depends on `exclude`, so the
renaming depends on order too.

Some ids depend on position rather than identity:

- A generated site's id is `w` plus one more than the number of sites so far (`world-assembler.ts:353`).
- A scenario's word module is `${prefix}word${i + 1}`, where `i` is its index among the country's placements
  (`world-assembler.ts:226`).

*Inferred:* when `exclude` removes a placement, every later word module's id moves down by one, and so would a later
generated site's. Experiment B compared the ids of places, ways and people (`crossing-order.test.ts:93`), not of
word modules.

### An identity collision, found in passing

The opposite failure also exists: two distinct things share one identity. A module's seed is
`RandomStreams.key(campaignSeed, 'module', mine[0].id, request.randomIdentity ?? '')` (`module-bundle.ts:321`).
`mine[0].id` is the id declared in the module's *source*, not the installation's id, and nothing in `src`, `web` or
`data` sets `randomIdentity` (searched; its only uses are `module-bundle.ts:24` and `:321`). Every generated region's
source begins `Module region` (`src/world/region-writer.ts:116`, `135`, `145`). So every country in the world has the
same module seed. Each creature it declares is seeded `${moduleSeed}:creature:${localId}`
(`src/campaign/module-namespace.ts:135`) and made with `randomIdentity` `'self'`
(`src/campaign/module-installations.ts:62-63`).

*Inferred:* `s1_priest` in `region`, in `x1y0` and in every other country draws the same attributes and the same
weapon and armour. They also draw the same class wherever the people are the same. Two installations of one
scenario (`fever` in one country, `renewal1fever`) share a seed the same way. `RandomStreams.identity` re-keys
entity ids by that same seed (`random-streams.ts:9-12`), so `region__w1` and `x1y0__w1` are one identity to command
draws. Searching the first country's `w1` therefore advances the draw count for searching `x1y0`'s `w1`. None of
this breaks order independence, because it is the same in every order. But it shows that the address is not yet
the identity everywhere. It is also the cheapest thing to fix (section 5).

## 2. The conceptual model

**Identity first.** Every entity that could ever exist gets an address before it gets any content: a path such as
`seed / cell x1y0 / settlement s2 / role priest`. Every random draw about it is keyed by that path and a domain.
Kyrie has most of this already: grid cells, module-prefixed ids (`x1y0__s2_priest`), and `RandomStreams.key`.
Hierarchical seeds follow from it. A child's seed is derived from its parent's seed and its own name
(`WorldGrid.seed`, `Content.stream`), so drawing a child never consumes any of its siblings' randomness.

**Commitment versus realization.** A *commitment* is a fact other places can rely on before this place exists: that
cell `xm1y0` is Fencarr, a marsh country of men; that it holds the fever; that Dun Rìerdan is north. *Realization*
is the local detail: rooms, people's qualities, words on a sign. Commitments must be cheap, small, and decidable
without realizing anything. Realization may be expensive, but it must be a deterministic function of the address,
the seed, the content version and the commitments that concern that address, and of nothing else. Today the
commitment layer is `WorldShape`, `Countries.plan`, and the skeleton draw (`WorldGrid.drawn`: terrain, ancestry,
domain, name). Everything else is realization, and some of it (as section 1 shows) still reads other places'
realized state.

**Two kinds of constraint.** A constraint is *local* if it can be decided from the address and the addresses of a
bounded neighbourhood. Examples: "not named like a neighbour's first draw", or "a shrine's god is the river's where
it stands by a ford". A constraint is *global* if it needs knowledge of an unbounded set: "at most one fever in the
world", "no two people anywhere share a name", "the painting no one else holds". Local constraints fit lazy
generation for free. Global ones have three standard treatments:

1. Allocate them up front in the commitment layer, as `Countries.plan` does.
2. Weaken them to a local version: unique within a neighbourhood, not world-wide.
3. Resolve them in a *canonical order over addresses* rather than in visit order.

The third is the general trick. Any greedy first-come algorithm becomes order-independent if "first" means "lowest
address" rather than "first visited". The price is that realizing a cell needs the relevant commitments of every
cell before it in that order, so it is affordable only when that set is small (a neighbourhood or a ring) and the
commitments are cheap to compute.

**Lazy materialization.** A place is realized when the company's horizon reaches it, by a function
`realize(seed, address, commitments, contentVersion)`. Caches are allowed, because the function is pure.
`Frontier.prepare` already draws ahead while the player reads (`frontier.ts:123-136`), keyed by everything the draw
reads (`frontier.ts:146`). Once the draw reads only the address and the commitments, that key collapses to the cell,
and a country can be cached once per seed.

**Two different properties.** "The same regardless of visit order" is a property of the realization function.
"The same regardless of save and restore" is a property of persistence. Kyrie has the second already, by brute
force: a `CampaignSave` holds the whole compiled module, the world state, every creature and the event log
(`src/campaign/campaign-types.ts:46-51`, `src/campaign/campaign.ts:170-176`). Experiment B confirmed that keeping and
opening between crossings changes nothing. A lazy design has to keep that property while saving less. Then it
matters which of the two you are relying on: a restored game can only re-derive what was never saved if realization
is order-independent *and* the content has not changed.

## 3. The hard cases

### 3a. Unique entities (one dragon, one named hero)

Today uniqueness is first-come. A scenario's `instances` (default 1, `world-assembler.ts:32`) is enforced by `count`
within a country and by `exclude` across countries. Authored countries and canon cities are already unique by
allocation (`Countries.plan`, `WorldShape.seat`).

To make it order-independent, give each limited scenario a home allocated from the seed. The scenario context that
`fits` reads is `{terrain, ancestry, domain}` (`world-assembler.ts:180`), and all three are in the skeleton draw
(`places.json:3-6`). So "could the fever go in this cell" is decidable from the address alone. "Can its site stand
in this land" (`placeable`, `world-assembler.ts:342-346`) is not, because it needs the atlas. Three options, each a
different promise:

- **At most once.** Rank candidate cells by a hash of (seed, scenario, cell), restricted to fitting cells within a
  ring R of the first country. The scenario's home is the first-ranked cell. If at realization its site cannot stand
  there, it is simply absent. That is cheap and order-independent. Absence is rare today (H1: 2 of 41 seeds could not
  place a site; `world-assembler.ts:356-359`).
- **Exactly once.** As above, but run `placeable` over the candidates at allocation. That means laying each
  candidate's land, which is the expensive part of a region. Measure first: Experiment B gives 0.3–0.5 s for "Deem's
  draw of a region", but not the cost of the skeleton draw alone, nor of `lay` alone.
- **A lottery per cell.** Each cell hosts the scenario if hash(seed, scenario, cell) < p. This is O(1) and needs no
  ring, but promises only an expected count. It is right for "a few wandering hermits", wrong for "the dragon".

A named hero is the same problem over names. `FantasyRules.apart` is already half order-independent. When a name is
taken, the family it adds is chosen by a hash of the person's part in the story (`src/fantasy-rules.ts:17-25`). But
"taken" is everyone present in the world (`module-bundle.ts:93-99`). The local alternative is to make names apart
from the people of this cell and its neighbours' *skeleton* draws, as region names already are. A name meant to be
world-unique (the hero) belongs in the commitment layer, reserved by allocation, and every other cell's draws avoid
the reserved list. Like `StoryPeople.reserve`, but computed from the plan, not from what has been placed.

### 3b. Linked situations across places

Today links are bound only within one country. `link` searches `at.placements`, which is the current `settle` call's
list (`world-assembler.ts:394-406`, fed at `187`, `198`). A feud between towns in two countries, or a bell stolen to
a hold elsewhere, has no representation.

The model needs a *plot*, a commitment with an id and roles bound to addresses: `feud#seed:7 = {a: x0y0.s2,
b: x1y0.s1}`. It can bind to a settlement cheaply, because settlement ids come from the template
(`places.json:16`, then `src/world/livelihoods.ts:17`). It cannot bind to a specific work in an unrealized country
cheaply, because works come from `Histories.make` over the atlas. So bind roles at the grain the skeleton knows
("a hold in Fencarr"), and let Fencarr's realization resolve the role deterministically from the plot id when it is
drawn.

The difficult part is what the first-realized side says about the other. If the company hears of the bell in
country A, A's text may only name what is committed about B: B's name and kind of country, which cost one skeleton
draw (as `Region.beyond` and `Countries.further` already name unrealized neighbours, `world-grid.ts:69-75`,
`countries.ts:175-186`). If A's text must name the hold itself, one of two things is needed:

- realize B's naming layer (draw, lay and names, without installing its modules), which costs a region draw; or
- commit the hold's name in the plot and require B's realization to honour it, as `named` already overrides a
  neighbour's names (`world-assembler.ts:152`).

The second is cheaper, but it makes the plot an input to B's realization, so the plot must be saved.

### 3c. Save and restore

What a save holds today is everything (section 2). SP-02's cost is that it also holds distant content no one has
reached: 130,826 facts and a 23.8 MB checkpoint on `wren` before Experiment B's steps 2–3 (a kept start fell from
28.5 to 14.2 MB).

Lazy materialization needs a save to hold:

1. the seed, the creation options (`DrawnWorld.options`, `src/world/drawn-world.ts:11-15`) and a content version;
2. the commitment layer's state, where it is not pure (plots once bound, names committed by reference);
3. the set of realized addresses;
4. for each realized place, either its full state (as now) or its delta from a fresh realization.

Option 4a (keep realized places whole, store unrealized ones only as addresses) is the safe first form. It removes
distant content from saves without any delta machinery. Option 4b (deltas only) is smaller still, but makes every
load re-run realization: parsing a freshly written region was 4.4 s of a 12.8 s cold start (Experiment B §0). It also
makes every load depend on content never having changed under a realized place. 4b needs a digest per realized
module (as `Digest` already digests a game at each step, `src/session/digest.ts:9-16`) and a fallback when a digest
disagrees. Which is better is a measurement question: save size and write time against load time.

### 3d. Content changes between versions

A new table row moves every later draw that picks by index. Deem's `lookup` picks `rand(max)` over the group
(`node_modules/deem/src/Template.ts:48-61`). A new scenario in the library changes every round of `choose`, because
the weighted select runs over the `open` list (`world-assembler.ts:195`, `318-336`). A new field in the settlement
template changes every region's name, because `name` is drawn after the settlements (`places.json:8-12`).

Kyrie already uses three of the four standard defences:

- **Per-key streams** (`Content.createCreature`'s domains, the separate pronoun stream).
- **Append-only placement.** Standing scenarios are placed last, "so nothing drawn moves"
  (`world-assembler.ts:204-206`).
- **Migrations.** These keep the edition a world was made with (`module-installations.ts:67-79`), bring an old
  save's projection up to date (`CreatureFacts.revised`, Experiment B §6), install the canon into a world kept
  before it (`src/campaign/canon-install.ts:27-35`), and install city residents a saved world lacks
  (`frontier.ts:93`).
- `Renewal.draw` even has a crude version check: it re-derives the first country and declines if its name differs
  from the one in play (`src/world/renewal.ts:40-41`).

The fourth defence is missing: **stable choice**. Pick by weighted rendezvous hashing: each row gets the score
hash(key, row id) raised to 1/weight, and the highest wins. A new row then changes only the draws it wins, and a
removed row only those it held. That could be a Kyrie function beside `apart` (`fantasy-rules.ts:42`) or a Deem
stdlib function, used first where churn is worst: the scenario library and the townsfolk name lists.

Salting every key by content version is the blunt alternative. It makes old and new worlds share nothing, which
helps with honesty but not with stability. The rule that matters is: **whatever realized content has said about an
unrealized place is a commitment and is saved.** Then a newer build may realize the unrealized place differently
without contradicting anything the player has seen. Kyrie already follows this rule for march-stones
(`frontier.ts:169-172`, the E2 note).

### 3e. Off-screen events

Today the policy is that unrealized places are frozen. `ClockShift` starts a module's own time at the first morning
after it is installed, so "a fever that kills a child on the tenth day does so ten days after the country it is in
is first reached" (`src/campaign/clock-shift.ts:6-17`, `20-21`). The Grand Tour decision was explicit: "a world that
never visits Sennet records nothing of the Tour" (`doc/history/missions/18/one-universe.md:177-179`). The one
exception is `Renewal`: new troubles in the first country fall due by elapsed time and are drawn from the seed and
their ordinal (`renewal.ts:20-30`, `78-96`).

The options, in rising cost:

- **Frozen until realized** (now). Order-independent by construction, but the world does not move behind the player.
- **Scheduled catch-up.** Events are a pure function of (address, time slot), like Renewal. A place realized at time
  t applies those before t on arrival. This is order-independent as long as no scheduled event depends on what the
  company did elsewhere.
- **Coarse simulation of the commitment layer.** A few world-level processes (a plot's feud escalating, the Rector's
  seven nights) advance by the clock without any place being realized. Their small state is saved, and realization
  reads it. This is where the Grand Tour's rejected "lazy history" would live.
- **Event sourcing for cross-place effects.** When the company does something in A that matters to unrealized B
  (returns the bell), the act is recorded as an event addressed to B's plot and applied when B is realized. Kyrie's
  transcripts and per-step digests already make replays checkable (`digest.ts:1-8`), so an event log is a natural
  fit.

## 4. The shrine-keeper test

The keeper of settlement `s2`'s shrine in cell `x1y0` of seed a1 is `x1y0__s2_priest`. It is written as a Person by
`SettlementWriter.priest` (`src/world/settlement-writer.ts:134-137`) from the settlement's `priest` name. For it to
be identical whether that country is reached first or last, each of the following must be a function of (seed,
address, commitments, content version) only:

| What | Where it comes from | Order-independent? |
|---|---|---|
| The address `x1y0__s2_priest` | `WorldGrid.id`, `livelihoods.ts:17`, module prefixing | yes |
| The country's skeleton (terrain, folk, name) | `world-grid.ts:28-56` | yes |
| The settlement's name | `place-names.ts:49-56`: named before works are pushed into `taken` | yes |
| The shrine (god, form, history) | `region-faith.ts:29-42`, keyed by region name and settlement | yes |
| The keeper's drawn name | `region-peoples.ts:26-42` | yes, as drawn |
| ...then renamed if a placed story reserves it | `world-assembler.ts:208` → `region-peoples.ts:46-54`, placements depending on `exclude` (`frontier.ts:143`) | **no** |
| The keeper's likeness | `Sittings.held` (`sittings.ts:35`, `frontier.ts:144`); Experiment B saw 55 and 69 people painted otherwise | **no** |
| What the keeper can tell (word of the country's troubles) | `ScenarioWord` over the placements (`world-assembler.ts:222-228`) | **no** |
| Neighbouring sites' names they may mention | works named apart from `taken` (`frontier.ts:204`, `histories.ts:66`) | **no** |
| The keeper's rolled body (qualities, class, gear) | `module-bundle.ts:321`, `module-namespace.ts:135` | yes, but shared by every country's `s2_priest` (*inferred*) |
| Their own module's clock and schedule | `clock-shift.ts:20-21`: counted from the install morning | yes, relative to arrival |
| The world's date and weather when met | the campaign clock | no, by design |
| Command draws when dealing with them | `random-streams.ts:18-27`, identity shared across countries | depends on history in other countries (*inferred*) |

So the address, the shrine and the drawn name already pass. Four things fail, and all four fail for one reason: the
country's draw reads the world's history (`exclude`, `held`, `taken`, and `ModuleBundle.apart`'s `people`). The
body passes the order test but fails a stronger one, since every country's keeper of `s2` has the same body.

"Identical" also needs a definition. Generated identity and initial state can be identical. The date the company
meets them on, and what the company has done, cannot be, and should not be.

The distance to passing is therefore not architectural. It is the three allocation inputs plus a per-installation
random identity, and the long spec that checks it exists already as an inverted test.

## 5. A staged path

Within Mission 21's scope, the brief rules out "comprehensive lazy world generation"
(`doc/architecture/mission-21/brief.md:205`). The steps below are small, and each is checkable without the long
lane.

1. **A cheap parity check first.** Call `WorldAssembler.beyond` for one cell twice, with different `exclude`,
   `taken` and `held` (as if after different crossings), and compare the region objects and the written files. No
   install and no campaign: a few region draws. It fails today for the same reasons as `crossing-order.test.ts:101`,
   in seconds rather than a minute. Add a unit check that two countries' module seeds differ.
2. **A per-installation random identity.** Set `randomIdentity` to the installation's address for regions beyond
   the first and for scenario instances (`x1y0`, `x1y0fever`). Leave the first country's at `''` so recorded first-
   country traces keep their digests. Saves are unaffected, because they hold creatures whole. Replays past a march
   change, and their kept traces must be re-digested. This is low risk, and it makes the address the identity
   everywhere.
3. **Allocate limited things from the seed** (Experiment B's step 4). Give scenario homes the "at most once" ranking
   of 3a, over fitting cells within a ring. Make paintings apart from this cell's and its neighbours' first choices.
   Make works' and stories' names apart from the cell and its neighbourhood, not the world. The ring size is a cost
   question: measure the skeleton draw alone (`WorldGrid.first`) before choosing R, since it sets how many cells the
   allocation must draw. The long spec's inverted test should then pass, and `Frontier.drawn`'s key collapses to the
   cell.
4. **Ids by identity, not position.** Name word modules by placement instance, not index (`world-assembler.ts:226`),
   and generated sites by (instance, role). Do it in the same change as step 3, so replays move once.
5. **Stable choice where churn is worst.** A rendezvous-hash pick for the scenario library and the name lists, adopted
   when the next content change would move them anyway.

After Mission 21:

- **SP-02 proper.** Keep realized places whole and unrealized ones as addresses in saves (3c, option 4a). Install the
  first country's standing scenarios and distant towns at their gates, as provinces already are. Experiment B
  measured 1.6 s and 3,296 entities for the standing scenarios. Splitting the region module by settlement was not
  measured, and needs measuring before it is promised.
- **Plots** as commitments for linked situations across countries (3b), with names committed by reference and saved.
- **Off-screen motion** through scheduled catch-up or a coarse plot simulation (3e). This is the owner's decision, as
  the Grand Tour's was.
- **Delta-only saves** (3c, option 4b), only if measurement shows load-time re-realization is cheaper than the bytes
  it saves.

Two measurements would decide most of this:

- **The cost of the skeleton draw alone, and of `lay` alone.** This decides the ring size, and whether "exactly
  once" is affordable.
- **Load time with re-realization against the size of a whole-state save.** This decides between 4a and 4b.

## Can Deem do it?

Deem is a sound realization function and nothing more, which is what this design wants from it. It is seeded and
deterministic per runtime. Its compatibility constraints (`fits`, `owns`, `select`) are local
(`node_modules/deem/src/constraints.ts:64-73`, `Template.ts:62-70`).

It has no notion of address, partial realization or global commitment:

- A template evaluates every field on one stream. Its generated ids are drawn from that stream
  (`Template.ts:322-328`).
- Its one uniqueness mechanism, `lookupUnique`, keeps picked options on the shared `Table` object for the life of the
  process, and silently clears them when they run out (`Generator.ts:227-278`).
- Without a random function, `lookupInTable` falls back to `Math.random` (`Generator.ts:170`), and `lookupUnique`
  passes none (`Template.ts:72-74`).

None of Kyrie's generation tables or templates use `lookupUnique` (searched `data`: its only mention is in
`data/sources/orsino/registry.json`). It should stay that way.

So the answer to the owner's first question is: Deem can realize a place deterministically from an address without
realizing anything else, provided Kyrie gives it an address-derived seed and an address-derived context. The
durable identities and global commitments have to live in Kyrie, where `WorldGrid`, `WorldShape` and
`Countries.plan` already are. What is missing is to move the three greedy world-wide constraints into that layer,
and to make the module seed the address.
