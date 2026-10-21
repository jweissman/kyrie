# Mission 7: vertical depth

At the start of this mission Kyr played a first-level company well and little beyond it. In practice it stopped at
tenth level. Nothing reached spells above fifth level. It had fourteen hand-made creatures that each acted once a turn
and whose temperament was ignored, summons that belonged to nobody, no reactions, no planes and no city.

At the end:
- Kyr generates its Player's Handbook, Dungeon Master's Guide and Monster Manual from the definitions it plays, with
  a status on every entry.
- Companions rise to twentieth level and develop in kind along the way.
- The game holds Orsino's bestiary and runs its summons, random targets, reactions and compound effects.
- Creatures meet the company by temperament.
- The Varrow has a high country: Brack, a city at the river's mouth, and the Unlit, a plane under the Lanthorn,
  with laws a place can hold and a company can change.

The game has been played through the browser and through recorded sessions. All of this was tested by its builder
only.

Ten commits, `8b71142` to `f8ccb43`, are listed at the end.

## A. The three books and the capability matrix

- `bun bin/handbook.ts` writes `doc/handbook/{phb,dmg,mm}.md`, `README.md` (coverage) and `coverage.json`. The site
  build writes the same books as searchable pages at `site/handbook/`, linked from the title screen.
- Every entry has a stable id and one of these statuses: faithful, adapted, represented, Kyr's own, not playable,
  unreachable, or Orsino's data only. 2030 entries are classified:

| Book | Faithful | Adapted | Represented | Kyr | Not playable | Unreachable | Orsino data only |
|---|---:|---:|---:|---:|---:|---:|---:|
| Player's Handbook | 566 | 292 | 4 | 56 | 75 | 4 | 22 |
| Dungeon Master's Guide | 124 | 8 | 18 | 105 | 0 | 0 | 342 |
| Monster Manual | 105 | 122 | 9 | 19 | 5 | 0 | 154 |

- Rules text comes from typed mechanics. The guide's rule entries come from the rules modules' own source: the
  author's comment, then the condition and the change.
- `doc/architecture/capabilities.json` answers the seven questions for ten families of rules.
  `capability-audit.md` renders it with live counts and ranks the deficiencies by what fixing them unlocks. Of the
  ten:
  - **addressed:** progression, creatures, summoning, reactions, random targets, compound effects and electric
    damage;
  - **partly addressed:** planes and the city;
  - **open:** items.
- Building the books is itself an audit. It found:
  - 56 unreachable spells (fixed);
  - temperament read by nothing (fixed);
  - Snipe's description promising damage that Orsino's own code never applies (now judged cosmetic).
  
  Four problems remain: formations that need ancestries players cannot choose.

## B. Mechanical depth

| What | Where it is shown |
|---|---|
| Summons owned by their summoner: at most 3 + ⌊level/3⌋, the oldest sent back, made at the spell's level and grown as Orsino's template grows them; companions by ancestry | `test/summoning.test.ts` |
| Random multi-target spells drawn once for every effect and save (magic missile, lightning bolt, cone of cold, meteor swarm) | `test/summoning.test.ts` |
| An owlbear's two actions a turn; worth from its class | `test/summoning.test.ts` |
| Reactions: overwatch against a melee blow, a braced spear against a charge, magebane against a cast | `test/reactions.test.ts` |
| Command and turn undead (the foe leaves the fight alive), raise dead at 50%, death with its declared save, chaos bolt from the seed | `test/reactions.test.ts` |
| Calling features: every calling gains something new in kind at least every three levels | `test/progression.test.ts` |
| Place laws held by every combatant | `test/proving-ground.test.ts` |

Unplayable abilities fell from 89 to 43, and unplayable conditions from 35 to 24. Each that remains says why in the
handbook.

## C. Adventure depth

The Unlit (`data/planes/unlit`) is a plane under its own law, reached by three doors:
- the veil under the Lanthorn's deep cellar, found by searching once the Unlight is gone and passed only with
  sunlight;
- the drowned stair under the Brimming's lake, found from either side;
- the Lamplighters' door from Brack, kept by a Watcher who lets by only the Charter's seal.

Its inhabitants meet the company by temperament:
- shades that slink away and fear the sun;
- wraith riders who fall on whatever is on the road;
- a mouth under the Ash Mere that strikes unless spotted;
- lamp-bearers that bar a gate;
- the Hollow Warden of Lampfall, a fourteenth-level lich who names a price in coin or light, keeps his word, and
  comes for the Last Light or his regalia however he was paid.

Relighting Lampfall's beacon changes the plane's law.

## D. Vertical scale

- Experience runs to level 20, and slot tables reach ninth-level spells at 17.
- Calling features give warriors, thieves, rangers and monks techniques and traits at set levels.
- A companion made at a level holds what one trained to it would.
- The Old hands preset is three twelfth-level companions.
- Two comparisons:
  - A fifteenth-level company beats a red dragon on six seeds of six; first- and fifth-level companies on none.
  - Ninefingers' crew costs a first-level company 64 actions and two of three companions. The Old hands need 27
    actions and lose nobody.

## E. Urban, extended geography and planar breadth

Brack (`data/regions/brack`) is fourteen hours down the salt road from Hollin. It has districts, the Watch's passes
after dark, a fence who knows a way over the roofs, the Salt Exchange, and the Lamplighters' Charter.

- The Exchange's factor has been paying Ninefingers to hold the Gap. A clerk can be bought, and the strongroom's
  black ledger read by a light.
- The factor can be taken money from, or exposed to the Exchange's warden, who becomes the company's patron.
- The Charter's seal is earned by burning out the Unlight, or by bringing Lampfall's regalia home.
- City and valley act on each other through shared facts. The Exchange's prices follow the Toll, and its grain
  barges go up the river.

## F. Composition

- **A faction takes a fortress without bespoke rules.** If the factor is not exposed and the Lanthorn falls empty,
  the existing dominion rule `seized` hands him the gate, and his guards toll the Gap. The Varrow's own toll rules,
  written for Ninefingers, answer him without naming him (`test/proving-ground.test.ts`).
- **A plane and a city introduced into a campaign under way** keep everything the company did and learnt
  (`test/introduction.test.ts`).
- **General fixes.** A rule's instances are now re-checked as earlier ones apply, so two powers cannot both seize
  one gate. The shared rules modules are installed once instead of once per module; the new inhabitants rules
  exposed the old duplication.

## G. Player quality, before and after

`doc/architecture/editorial.md` shows each change before and after:
- knowledge sorted by where it came from (seen; heard and borne out; heard only);
- passages that point no way;
- a scene that no longer contradicts its gate;
- a halt told once;
- a place's law told once under the fight's heading, instead of a red chip on everyone;
- labels that distinguish slots;
- spell text for drawn and nested effects;
- an event's time above its words;
- the region chart drawing one region at a time;
- each companion's sheet saying what the next level brings.

Screenshots are in `doc/playtests/high-country-2026-10-21`, at 1440×900 and 390×844.

## H. Sustained play

`doc/playtests/validation-2026-10-21` holds eleven recorded sessions played only through the choices a player has.
They cover all ten experience types and three adversarial variants:
- refusing the Warden's price;
- taking his regalia;
- a first-level company going into the Unlit without sunlight (all three die at the Mere).

Five saves taken part-way resumed to the same game.

The builder's browser playtest (`doc/playtests/high-country-2026-10-21/README.md`) found nine problems. All were
fixed, among them shared rules installed nine times and warnings that ran out during a move.

Nobody but the builder has played any of this.

## Tests and performance

- **Tests.** 381 tests pass, plus 11 browser tests. This mission added: `handbook`, `handbook-browser`,
  `progression`, `summoning`, `reactions`, `inhabitants`, `proving-ground` and `introduction`.
- **Lint.** Kyr lint reports nothing for the five recommended campaigns.
- **Load time.** The Varrow takes 4.1 s with Brack and the Unlit, against 3.1 s without them. A watch costs a median
  34 ms, against 23 ms.
- **Other timings.** Generated worlds load in about 4.2 s. The handbooks build in 0.5 s. The full suite takes about
  290 s.

## Limits, plainly

- **Rules not yet run.** 43 abilities and 24 conditions do not run:
  - reflection and spell turning;
  - invisibility and true sight;
  - polymorph and shapechange;
  - planeshift and teleport;
  - cascading damage;
  - bonus spell slots;
  - extra turns;
  - summons with an aspect.
  
  Three of ten feats do not run, so a mage or ranger has no feat to take.
- **Orsino data Kyr does not hold.** Its ten planes, traps, wonders, 89 kinds of person, aspects and ranks; also 42
  of 48 magic items and 60 of 68 pieces of gear.
- **Generation.** The Deem generator does not yet draw from the new bestiary, so generated dens still choose among
  five kinds. Brack and the Unlit are authored, not generated, and institutions are not yet kits.
- **Movement and timing.**
  - A move puts the company at its destination before the move's time passes. Warnings work around this by stopping
    the company; the cause remains.
  - Pursuit beyond a creature's own ground is authored per place, not given by temperament.
  - A place's law holds in fights. Its effect outside them, such as lightlessness, is written per place.
- **Balance and testing.** Balance at high level is untested beyond the comparisons above. The Old hands may be too
  strong for Lampfall. No external player has tried any of it.

## Commits

| Commit | What |
|---|---|
| `8b71142` | The handbooks and the capability audit |
| `b562e49` | Twenty levels that develop in kind |
| `cf10f35` | Orsino's bestiary, summons, random targets |
| `70c08ea` | Reactions, flight, return from death, spells made of spells |
| `f5b174c` | Inhabitants by temperament |
| `869b252` | Brack, the Unlit and place laws |
| `98b19c8` | Playtest fixes: halting warnings, shared rules once, Old hands |
| `1c3fbab` | Laws told once, times above words, the builder's playtest |
| `ed7d284` | Editorial pass |
| `babef81` | A plane and a city introduced mid-campaign |
| `f8ccb43` | The validation campaign |
