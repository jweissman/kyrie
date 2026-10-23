# Generated regions and situated scenarios

20 October 2026. For authors adding a scenario and for builders changing the assembler. The engine pieces are
[world-assembler.ts](../../src/world/world-assembler.ts) and [region-writer.ts](../../src/world/region-writer.ts);
tests are [world-assembly.test.ts](../../test/world-assembly.test.ts); a played journey is
[playtests/rededge-2026-10-20](../playtests/rededge-2026-10-20/README.md).

## What happens

```
seed ──► Deem `region` ──► RegionWriter ──► region.kyr          (settlements, people, roads, sites)
                    │
library ──► Deem select over scenario manifests, by region context ──► placements (sites claimed or generated)
                    │
each placement ──► its authored modules, imports bound to region places ──► word-<instance>.kyr (who knows what)
                    │
            campaign manifest ──► Campaign.load (the ordinary loader; nothing downstream knows it was generated)
```

1. **Region.** The Deem `region` template draws terrain, the ancestry of its people, a faith (domain and deity), three
   settlements (size, trade, inn, innkeeper, priest, outfitter, a traveller and their calling), three sites whose kinds
   suit the terrain, and a wonder. `RegionWriter` writes it as Kyr: each settlement is a green, an inn with a taproom,
   a shrine and a shop, joined by two-hour roads; each site is a room in the region's wilds with a track from the
   nearest settlement. Every entity is exported under its own id (`s1_priest`, `w2_track`).
2. **Selection.** The scenario library is turned into a Deem table, one row per scenario, and chosen with Deem's
   `select` against the region's context (`terrain`, `ancestry`, `domain`). A scenario's `context` lists the values it
   accepts per key; a key it does not mention accepts anything. Weights are Deem weights. Selection repeats (three
   rounds by default) among scenarios that still fit, have instances left and can be placed.
3. **Placement.** Each place a scenario needs is bound: a `site` role takes a free region site of an accepted kind, or
   Deem generates a new site of that kind (strictly; a kind the terrain cannot have fails, and the scenario is not
   placeable); a `settlement` role takes the settlement nearest another role. Sites are claimed exclusively;
   settlements and their people are shared.
4. **Word of mouth.** For each placement a generated module spreads its hooks (below).
5. **Contacts.** Each company member whose background declares a contact gets an old acquaintance of that channel in
   one of the settlements (drawn from a stream keyed by the member's name). The contact hears that channel's news from
   anywhere in the region, and is introduced in the room where they are found.

Identity is stable and readable: instances are `broodhollow`, `den`, `den2`; module ids follow (`den2__beasts`); the
region's entities are `region__s1_green` and so on. Every draw is keyed by seed and identity
(`RandomStreams.key(seed, 'world', 'site', instance, role)`), so adding a scenario to the library changes only the
rounds after the one where it could first be chosen, and changing the company changes only its contacts.

## Authoring a scenario

A scenario is a manifest next to ordinary Kyr modules. The tower ([unquiet-tower.scenario.json](../../data/scenarios/unquiet-tower.scenario.json)):

```json
{ "id": "unquiet-tower", "instances": 1, "weight": 3,
  "context": { "domain": ["life", "light", "nature", "war", "knowledge", "storms", "order"] },
  "places": { "spire": { "site": ["tower"] }, "town": { "settlement": "near:spire" } },
  "modules": [{ "id": "tower", "bundle": "../situations/unquiet-tower/module.json",
    "imports": { "party": "@party", "land": "@wilds", "outside": "@spire", "shrine": "@town.shrine",
                 "gossip": "@town.green", "keeper": "@town.priest" } }],
  "route": "tower.well",
  "hooks": [
    { "fact": "tower.lights", "topic": "the light in {spire}", "channels": ["tavern", "road"], "opens": false },
    { "fact": "tower.graves", "topic": "the opened graves", "channels": ["temple"], "opens": false },
    { "fact": "tower.old_well", "topic": "the old well at {spire}", "channels": ["road", "market"] } ] }
```

| Field | Meaning |
|---|---|
| `context` | Region values the scenario accepts, per key. A death-faith region never gets the necromancer's tower. |
| `instances`, `weight` | How many times it may be placed in one region; relative likelihood when several fit. |
| `places` | Roles it needs: `site` (kinds it accepts, claimed exclusively) or `settlement` (`near:<role>`, shared). |
| `modules[].imports` | References: `@party`, `@region`, `@wilds` (the open country sites stand in), `@role`, `@role.part` (a settlement's `green`, `taproom`, `shrine`, `shop`, `priest`, `innkeeper`, `merchant`, `traveller`; a site's `track`), or `module.export`. |
| `route` | A passage (`module.export` or `@role.track`) hidden until the company knows a hook that opens it. |
| `hooks` | Facts the scenario establishes, the topic people raise (`{role}` becomes the bound place's generated name), and the channels that carry them. `opens: false` keeps a hook from revealing the route. |

The Kyr side says what is true and who knows it; nothing about the region is hard-coded:

```kyr
Entity old_well: fact "There is an old well behind {outside} that runs down into the cellars. The builders used it.".
Initially Assert established(old_well).
Initially Assert knows(garth, ewes).                      (brood: Garth knows his own loss, so the hidden way does not strand him)
Objective tower when not ended(necromancer) and knows(party, binding) "The bone lantern in the tower holds the risen dead.".
```

`module.json` declares `exports` (what a manifest may name) and `experience` (what resolving the module is worth). A
scenario's own Deem templates receive the region context, so the tower's necromancer is a cleric or mage drawn from a
`necromancerCalling` table keyed by the region's ancestry. Backgrounds declare contacts in the catalog
([backgrounds.json](../../data/catalog/backgrounds.json)): `"contact": { "channel": "road", "text": "{contact} and
{member} hunted the same hills for a season." }`.

## Knowledge: true, believed, learned

| | Representation | Who sees it |
|---|---|---|
| True | `established(fact)` in the scenario's own module | No one directly |
| Believed | `knows(group, fact)` (and `assumesFalse`) for carriers, scenario people and the company | Carriers answer `ask` only with facts they know |
| Learned | `knows(party, fact)` after `ask`, `examine` or `tell` | The Journal's "What you know", with the source in the chronicle |

The generated word module makes each hook known to carriers of its channels in the settlement nearest the scenario
and the next one along, plus any company contact of a matching channel, and offers it as a topic in the carrier's
room. Hearing an opening hook reveals the route; objectives appear only once a hook is known, so there is no
omniscient quest list. Today every carried belief is true; the model has room for false ones (`assumesFalse`) but the
assembler does not yet create them.

## The worked example: seed `thorn`, upland (`bin/kyrie world thorn --terrain mountain`)

```
Rededge: mountain, human, faith of Brigid (life)
  s1 Coldhill (town; wool); inn: the Velvet Hand      w1 Stone Delf (cave)      w3 Lonely Delving (mine)
  s2 Peakview (village; tin); inn: the Stormy Crown   w2 Peak Delf (cave)       w4 Red Watch (tower) [generated]
  s3 Highstead (hamlet; tin); inn: the Ancient Banner
Eligibility: fits brood-hollow, den, unquiet-tower       (in a fen, brood-hollow does not fit: it wants mountain/forest)
Placed:
  broodhollow <- brood-hollow: approach=w1, town=s1; modules sink, brood
    hook brood.ewes: told by s1_innkeeper, s1_traveller, s2_innkeeper, s2_traveller
    hook brood.no_silk: told by s1_merchant, s1_priest, s2_merchant, s2_priest, s3_priest   (s3_priest: Dori's contact)
  unquiettower <- unquiet-tower: spire=w4, town=s1; modules tower
  den <- den: den=w2; modules den
Loaded in 1555 ms: 648 entities, 8 modules installed.
```

The region had no tower, so one was generated for the scenario (Red Watch) and given a track from Coldhill. The brood
claimed Stone Delf; the den claimed Peak Delf; the mine stayed free for ordinary use. The den's beasts are drawn by the
generic creature generator for the terrain (two bears here); the necromancer is a human cleric because the region's
people are human.

## RPG substance: what is playable, against Orsino

Counts are from the generated [orsino-coverage.md](orsino-coverage.md); the rest is a judgement of what play uses.

| Area | Playable in Kyr now | Missing or thinner than Orsino |
|---|---|---|
| Ancestries | Human, elf, dwarf: attribute modifiers and the classes each may take (a dwarf is a warrior or cleric) | 22 of 25 Orsino ancestries are not offered |
| Classes | Warrior, mage, thief, cleric, bard, ranger, monk: hit die, attributes, abilities, weapon and armour proficiencies, specializations | The ranger's Heal Ally is omitted (a fifth-level spell with no slots to cast it); starting gold and kits are not added |
| Backgrounds | 8 of 215 (hunter, medic, locksmith, explorer, miner, acolyte, soldier, caravaner) plus 4 professions: Orsino's modifiers and coin, a skill and gear that open choices in play (rope for shafts, lockwork for the postern, woodcraft to smoke out a den), and a contact in generated regions | 207 backgrounds; nobility and alignment |
| Spellcasting | Old-school slots: a table by class level (mage, cleric; bard as a lesser caster), one extra first-level slot for a casting attribute of 14+, cantrips free, the lowest free slot of the spell's level or higher, all slots back under a roof and one in the open, more at each level | **No preparation**: a caster knows its spells and casts any of them; no spellbooks, scrolls or learning from them |
| Equipment | 81 executable weapons, 15 armours, shop goods, rope, torches, bandages, antidote, lodging | No encumbrance; little gear beyond what shops in these scenarios sell |
| Conditions | 115 executable statuses, damage-type triggers (bludgeoning may stun) | 25 represented only |
| Advancement | Orsino's experience curve; experience for foes by kind and level and for resolving a module (only when the company did it or was there); levels taken at a sheltered rest (hit die + Constitution, slot table) | No new abilities or attribute increases on levelling |
| Encounters | Generated by terrain and family; the player sees kind, level and hit points before fighting | Not scaled to the company: two bears killed a level-1 company in five turns in play |

## Continuity

One region holds several scenarios at once and keeps them: the company returns to the same inns, pays for beds and
torches, carries experience and wounds between adventures, and takes levels at the inn. Scenario people act on their
own clock: if the company spends its first day on the den, Garth burns out the sink overnight, the frames burn with the
spiders, and Coldhill talks about the smoke (no experience for the company). Done the other way, Coldhill talks about
Odile's silk and the stilled dead. Saves hold the whole world and resume in the browser.

## Open questions

- **Overlap.** Sites are exclusive and settlements shared, but people are shared without checks: two scenarios that
  both bind `@town.priest` would both make demands of one priest. A role contract (who may be claimed, who only
  consulted) is the smallest next rule.
- **Commitment.** Every placed scenario is compiled and populated at assembly (about 270 ms each). Instantiating a
  scenario only when its first hook is heard would make large libraries cheap, but its people would not act before
  then, and Garth's deadline depends on acting from the start.
- **Knowledge.** All carried beliefs are true, static and evenly spread; there are no false rumours, no news that
  travels over time, no carriers who forget. The relations allow it; the assembler does not do it.
- **Ordering.** The region is generated first and scenarios adapt to it; a scenario cannot ask the region for a
  person or a culture (only for sites). Within the Deem region template, children must be generated before the
  region's own name, because a generator's context overrides the fields of what it generates.
- **Difficulty.** Encounters do not scale to the company and old-school lethality is kept; the remedy so far is
  legibility (what a group is, how hard it hits) and alternatives (smoke them out, go around). Whether scenarios should
  declare a level band for selection is open.
