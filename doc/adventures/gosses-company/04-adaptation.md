# Gosse's Company — what the engine can carry, and what it needed

*Stage 3: the revised design ([03-revised-design.md](03-revised-design.md)) read against Kyr, Deem and the runtime as
they stand on `main` at `d79cbbd`, and the plan for building it. What was actually changed, and what was worked
round, is kept up to date in [friction.md](friction.md).*

## What was inspected

- **Kyr** (`src/lang/Kyr.ohm`, the shared rules in `data/rules`): places, passages (with `opening when`), things
  with states and changes, people with topics (`once`, `travelling`, `On discuss`), actions with `Requires`,
  `Resolve check(actor, skill, difficulty)`, `Grave`, `Time 0`; rules (`at`/`near` anchors, `says`, `teaches`),
  events, observations, discoveries with sources and `Found by searching`, milestones, endings, measures with
  left-to-right arithmetic, queries, local item kinds and species, escorts (`acceptsEscort` → `following`, `home`,
  `cameHome`), recruitment (`willing`, `hire`, `travelsWith`), ownership and lending.
- **Checks** (`src/rules/checks.ts`): a d20 for the company member best placed, plus the quality's modifier, plus a
  proficiency where the skill is theirs; easy 10, fair 13, hard 16, formidable 19; shown to the player as odds before
  it is tried; retried freely.
- **What the world says about a member**: `canCast(member, ability)` for spells usable outside a fight
  (`conjure_light` is the mage's); `craft(company, craft_stage)` when anyone in the company has a trade of the stage
  (nineteen of Orsino's backgrounds: tragedian, comedian, playwright, juggler, town crier…); `brings`, `capable`.
- **Time** (`src/campaign/clock-shift.ts`): an installed country's literal comparisons with `watch(clock)` count from
  the first midnight after it is reached. `hour(clock)` is the time of day.
- **Placement**: `data/adventures/countries.json` and `src/world/countries.ts` (a country beyond a march, its rumour,
  its notice, its `after`); `src/world/frontier.ts` (installed as a chapter when the march is crossed, with the
  imports `party` and, optionally, `word`); `src/world/world-assembler.ts` (a region's scenarios, adventures in the
  wilds and goings-on in the towns, bound to a town's green, taproom, shrine, shop, innkeeper, priest, merchant and
  traveller); `src/world/region-borders.ts` (each side's road leaves from one town, whose innkeeper tells what lies
  beyond).
- **Manifests**: `optional` imports (The Long Man's `word`) are bound when the installer can, and otherwise are the
  module's own entity.
- **Precedents**: *What Tessary Owes* (its Feast and Board are public occasions built by hand: hour-keyed rules,
  gated actions, measures); the goings-on (`data/goings-on`), which are whole authored adventures in a generated town.

## Expressed directly in Kyr

| Design | How |
|---|---|
| Pentrice, its districts and the Soke | one settlement of rooms, a second settlement over the river, the West Road as wilderness; the river crossed by a `ferry` passage `opening when` the watermen work, and the weir path `hidden until` known and `opening when` the water is low |
| The week | literal watch offsets: the day the company arrives, then four days; the Siege on the evening of the second, the Children on the third, Gosse's company on the fourth, the verdict the next morning |
| Casting | a relation `plays(part, actor)` set by actions in the loft; each part's player chosen among those willing |
| Rehearsal | actions that take an hour in the loft with named members present, asserting `rehearsed(scene)` |
| The Office, the licence, the struck lines | the book as a thing with states (fair copy, struck, licensed, warranted, seized); Tunstall's strikes; the ordinance of the dead as a discovery read in the Office's statute-book |
| The mystery | four clues as discoveries with sources and searches; a query that puts them together; Carrow tested |
| The critics | a `regard` measure for each; each scene's outcome moves them by what they care for; a query for each vote; the verdict a query over four votes |
| The house | `temper` and `crowd` measures; the watermen and the weir path decide `crowd` |
| The fines | a `fines` measure, counted per unlicensed scene and per ad-lib, scaled by whether anyone in the front row is counting |
| The night | one room, the Wheel; the company's post (in the wings, under the stage, in the front row with the tallymen, in the pit) a relation chosen by action; each scene a measure-driven state; preparation read by rules at its end; live choices as `Time 0` actions offered only in the scene they belong to and at the post they need; every telling anchored `at wheel`, so the play goes on whether or not the company is there to see it |
| The bear | an escort that follows, with a home in the Moon yard |
| The mage's light | an action needing a member who `canCast(?m, conjure_light)` |
| A player by trade | `craft(party, craft_stage)` opens lines and approaches that no one else gets |
| Romances | topics, notes as items, overhearings as actions at places and hours |
| Rewards | milestones; lodging as a service Gosse's people offer; local item kinds (the paste crown, the Master's licence) |
| Endings | `Ending`s, which in a generated world close only this chapter |

## What the engine needed

### 1. Heralds: a country that sends word ahead into the generated towns (general)

The commission's point is that this adventure performs in the generated world's own towns. The placement contract
already lets a country lie beyond a march, and lets a going-on be set in a generated town. Nothing joins them: a
going-on is chosen at random among those that fit, so the players might not be on the road to Pentrice when Pentrice is
there, and might be on the road to nowhere when it is not; and the country, installed only when its march is crossed,
cannot know what happened in the town.

The change, which any country may use:

- a country in `countries.json` may name a **herald**: a scenario of the library's own form, kept outside the
  library's random draw, and the exports of it the country wants;
- the world assembler places a held country's herald in the first region before the random rounds, in the town the
  road to that country leaves from (a new settlement need, `toward:<side>`, which any scenario may use);
- the frontier, installing the country, binds the herald's exports to the country's optional imports of the same name,
  so the country can read what the company did and learned in the town.

Without a herald (a world kept before, or the campaign played alone without one) the imports are the country's own
entities, unknown, and the country is played from the road in.

### 2. Nothing else had to change before building

The Night was the risk, and Kyr can say it: the Feast in Tessary proves the idiom. What the design wants that Kyr
does not have is listed as friction, and worked round, rather than built speculatively:

- a public occasion construct (beats, seats, an audience's temper) is written by hand, as three adventures before
  this one did;
- an ensemble (companions with relations among themselves) is played as people of the city who relate to each other
  in topics, observations and rules, not as members of the company;
- assigning members to parts is assigning the troupe's people by relations, which is all the play needs; the
  protagonist's own part is a choice the protagonist makes;
- who someone is now (a role that changes) is said in observations and greetings, as Tessary does.

## Two principal approaches, as Kyr will hold them

- **The Book**: `state(book, licensed)` or `state(book, warranted)` by the night; no fines except for ad-libs.
- **The Liberty**: the book never sent, or withdrawn; `state(book, fair)` on the night; the tallymen count every
  scene; the fines are read at the end.

A third, **the Author's Bow**, needs `knows(party, author_known)`, Clemency told, and her trust.

## Order of work

1. The herald contract in the engine, with its own probe.
2. The herald: *the players on the green* (`data/goings-on/players`), with its scenario.
3. The city: places, people, the week's clock.
4. The small adventures, district by district.
5. The Office, the book and the mystery.
6. The Night.
7. The verdict, endings, milestones, aftermath.
8. The standalone campaign (a small authored village with the herald bound to it, the road, and the city), the
   placement in `countries.json`, and the journeys.
