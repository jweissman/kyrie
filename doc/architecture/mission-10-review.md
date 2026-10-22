# Mission 10 review: where the world's richness is lost

Before building, I traced Kyr end to end: character creation, region assembly, installation, observation, actions,
travel, combat, recruitment, advancement, saving and the reader. I also measured generated worlds (seeds `thorn`,
`ash`, `a1` and `b2`). This review lists what most limits play, most important first, with the evidence and the
change each calls for. Mission 10 works from it.

## The one-line diagnosis

The richness in Kyr comes from hand-written modules, and the generator produces only a skeleton to hang them on. A
generated region has the following, and nothing more:

- three settlements, all built alike on one road;
- three to five sites, each a single room with one descriptive sentence;
- whatever three adventure modules, four town situations and three kits can be bound to it.

So a world offers five to eight things to do, and every world offers the same eight. Orsino's catalog, the language
package and the rules engine could all support far more; little of it reaches the player.

## Findings, in order of their cost to play

### 1. Sites are empty unless a module happens to be bound to them

`RegionSites` writes each site as one room in its own stretch of country. "Fallen walls in rough grass; someone built
here once" is all there is at a ruin no scenario took.

- Only the den, the unquiet tower and the brood hollow give a site any inside.
- Across 32 worlds, the unquiet tower's revenants and the brood's spiders make up 168 of the 281 creatures met.

**Needed:** sites generated with structure. That means a purpose, layers of later use, inhabitants by ecology and
occupation, mechanisms with states, treasure, secrets, more than one way in, and links to other places.

### 2. The world has no history

Ruins are named in Aenean, but nothing in the world was built for a reason, by anyone, with any technique. No road,
bridge, mine, shrine or ruin is explained by what came before. Religion is a god's name and a blessing.

**Needed:** a selective history of making. Peoples and ages; the techniques and materials they had; what they built
and why; what later peoples did with it. The present world's sites, roads, names and religion derive from that
history.

### 3. Geography is one fixed template

Every region is three settlements west to east, two roads (the first fords a river; the second crosses a wood,
causeway or pass), and sites set one grid step north or south of a town. There is:

- no elevation or drainage;
- no wilderness with an inside;
- no second region;
- no reason any settlement stands where it does except the template.

The map is honest, but it can only draw what the template made.

**Needed:**
- regions generated as terrain, with a coarse grid of elevation, water, woodland and marsh;
- rivers that run downhill;
- settlements placed by water, soil and route;
- roads routed by cost;
- wilderness zones with landmarks and signs;
- several regions to a world, each more dangerous or stranger than the last.

### 4. Orsino's catalog barely reaches play

| Orsino has | Kyr's catalog | Reaches a generated world |
|---|---|---|
| 109 species (93 translated, 16 Kyr's own) | 109 | 11 met across 32 worlds |
| 25 ancestries | 14 | 14 |
| about 380 items: weapons, armour, 68 gear, 28 consumables, 48 magic items, 71 treasures, gems | 98 (weapons and armour only) | 21 item kinds, in fixed shop lists and kits |
| 6 treasure tiers with values | none | gold only |
| 60 traps, 6 triggers, 80 wonders, room features and auras, 27 shop types, planes | none, except one wonder sentence | none |
| 34 deities in 18 domains | 34 | a region's god and 7 local gods |

**Needed:**
- translate gear, consumables, magic equipment, treasure objects and gems faithfully;
- let treasure, traps, wonders and room features reach generated sites;
- let creatures reach worlds through ecology and occupation, not through a short den table.

### 5. Settlements are interchangeable

Every settlement has the same elements and nothing else:

- a green, an inn with a taproom, a shrine and one shop;
- an innkeeper, a priest, a merchant and a traveller;
- no households, trades, institutions, markets, festivals or quarrels of its own;
- no difference between a hamlet and a town except a word and the inn's stock.

Merchants sell fixed lists and buy two or three named things. There are four town situations in all.

**Needed:**
- settlements by size and economy, with institutions that have interests;
- people with households and relationships, from which circumstances arise;
- trade between settlements;
- commerce where stock is items, bought and resold.

### 6. Nothing in the world acts at the scale of a region

What acts today is bespoke to each module:

- each kit's band is written by hand: raids on a dice roll at night, waylaying travellers, a short planning horizon;
- weather is a twelve-day schedule;
- `dominion` (holding, coveting, tolls, credit, losses, seizing what is vacant) is a good vocabulary, but nothing
  uses it beyond the kits.

No faction pursues an intent through operations with prerequisites, participants and visible evidence. A cleared site
stays empty.

**Needed:** a bounded strategic layer. It runs at a daily cadence: factions with resources, territory and intents
carry out operations whose stages leave evidence and change prices, roads and occupancy. Weather follows from
climate, season and the day before.

### 7. Companions and openings say almost nothing

- **Companions.** A recruit is a fighter with a name, a people and a calling. Recruits have no knowledge, opinions,
  concerns or voice.
- **Openings.** A member's reason for coming is one sentence: an acquaintance sent word.

**Needed:**
- companions who recognise places and people their background would know, remark on what they notice, object to
  risks, and carry a concern of their own;
- openings that establish who the character is, what they carry and owe, where they are, and why they act now.

### 8. Narration does not know who perceives what

An observation is a sentence shown whenever its condition holds:

- nothing models which senses, skills or backgrounds notice which details;
- the party's knowledge has no source or uncertainty;
- weather lines repeat at every outdoor place;
- scene, event, result and memory are drawn from one stream of text.

**Needed:** observations that carry what notices them (a sense, a skill, a background, light); a scene that chooses
a few telling details; knowledge with source and possible error; different treatment on the page for description,
event, outcome, speech and memory.

### 9. Authoring needs the engine to carry ordinary behaviour

*The Long Man* showed these gaps:

- an adventure's own objects had to be added to the global item catalog (the miner's lantern, the keeper's face);
- merchants stock fixed lists, not items;
- people cannot simply carry, lend, lose or be robbed of things;
- a flooded room is a description plus hand-written rules, not an environment that spreads to what it connects;
- waiting for a known event means pressing *Wait an hour* repeatedly.

**Needed:** item kinds local to a module; ownership and carrying as ordinary facts; merchants whose stock is items;
environmental states that propagate along passages; waiting until a time or until something happens.

### 10. Loading, rendering and saving do repeated work that will not scale

| Measure (four generated worlds, about 1,200 entities and 16 modules each) | Baseline |
|---|---|
| Assembly | 80–200 ms |
| Load | 1,250–1,650 ms |
| Building one screen (after every action) | 150–185 ms |
| An ordinary action | 40–66 ms on average, 80–350 ms at worst |
| Save | 1.1–1.5 MB |

Where the load time goes:
- the world rules are parsed again for every module: 212 parses, 352 ms;
- each module's installation re-projects every creature fact (505 ms) and repopulates every actor (641 ms);
- `populate` clones the whole creature store once for each creature it adds;
- every placement writes its own "word" module, so a world has five modules that only spread rumours.

A world with five times the content would load in ten seconds.

**Needed:** parse once; install a campaign's modules in one pass; project only what changed; fold generated rumour
modules into the region; build the screen from what changed.

### 11. Experience rewards only fighting

- Experience comes from won fights and from finishing a module.
- Each member receives the whole amount.
- Treasure buys things but teaches nothing; discovery teaches nothing.

With level 2 at 1,000 experience and level 3 at 3,000, a region's content supports two levels at most.

**Needed:**
- experience for treasure brought back to safety, as in old-school play, and for significant discoveries, shared
  among the company;
- regions beyond the first whose dangers suit later levels.

### 12. The interface still makes the player do the engine's work

- Waiting is done an hour at a time.
- A first-level warrior is offered eleven actions in every turn of a fight: cleave, defend, flee, strike, prepare
  charge, second wind, sweep, taunt, vigour, wait, guard.
- Moving gear between companions sits among the world's choices.
- Nothing says whether a creature is beyond the company before the fight begins.

### 13. Publishing fails before it builds

The Pages workflow has failed on every push for this reason:

- `bun install` cannot find `../languages`, because the workflow never checks out the `languages` repository, which
  is private;
- the workflow reads `vars.DEEM_REPOSITORY`, which is not set, so its "deem" checkout is a second copy of Kyrie;
- GitHub Pages is not enabled for the repository.

The first can be fixed in the workflow. The second and third need the owner: a read token as a secret (or a
visibility change), and Pages enabled with GitHub Actions as its source.

## What to keep

- **The reader's restraint.**
- **The fight page.** Foes, what happened, whose turn, choices.
- **Diagnosing balance with measurements**, not adjusting numbers blindly.
- **One authoritative world.** Deterministic, with derived presentation.
- **Kyr as the single way content enters play**, whether authored or generated.
- **The composer's slots and kits.**
- **Orsino as the source of mechanics,** with fidelity recorded per entry.
- **The named land, peoples, ecology and shrines from Mission 9.** They are the right primitives at the wrong scale.

## Direction

1. Make the core loop pleasant and fast first:
   - waiting until something happens;
   - a short list of fight actions with the rest folded away;
   - a way to judge danger;
   - loading and screen building made incremental.
2. Generate the world in this order, each step feeding the next:
   - history first;
   - then terrain and drainage;
   - then peoples and settlements placed by land and history;
   - then roads;
   - then sites made from what history built and what lives there now;
   - then factions with operations;
   - then the weather.

   Write the result as one region module per region, so content grows without multiplying modules.
3. Bring Orsino's items, treasure, traps, wonders and bestiary into that generation, faithfully, where they mean
   something in the world.
4. Give companions, openings and narration a model of who knows, notices and says what.
5. Improve Kyr where the generated and authored material needs it: local items, ownership, merchants, environments,
   waiting.
6. Prove it by playing two worlds through ten expeditions each, reading what happened, and revising what was dull.
