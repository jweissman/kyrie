# Stage 3 — what Kyr can say, and how the design is fitted to it

*Read before a line of the adventure was written: the authoring guide, the grammar (`src/lang/Kyr.ohm`), the shared
rules (`data/rules`), the creature projection (`src/campaign/creature-facts.ts`), checks (`src/rules/checks.ts`), the
field resolver, the frontier that places an authored country in a generated world, the journey driver, and the five
independent adventures already on `main` (above all Low Water, whose friction report saved days).*

## What is direct

| Design need | Kyr |
|---|---|
| A city of districts, buildings, rooms | `Place … is region / settlement / building / room`; each district a settlement on the region map; streets and squares are rooms *within* the settlement, interiors rooms *within* buildings. Doors, steps, bridges, ferries are passages of those kinds. |
| Seeing before naming | Observations describe what is there in plain words; a building's door is a passage named for what it looks like ("the door under the iron needle"), and the building's own name is learned. `seen as "…" until fact` gives a place an appearance until it is known. |
| People with lives | `Person` with role, ancestry, calling, level, manner, pronouns, greeting; `Topic … when … once { Says … On discuss { … } }`. Where they are by hour: rules on `hour(clock)` that move them. |
| Small adventures with several approaches | Things with states and changes (`needing` a skill or item), `Found by searching … with` a skill, `Resolve check(actor, skill, dc)` with `On failure`, topics gated on knowledge, `Buys` / `Wants`, owned items and objection, `tolerates`, `Grave`. |
| A knowledge-assembled mystery | `Discovery` facts, taught by sources, topics, observations (`teaches`), rules (`teaches`); a rule that puts two known facts together teaches a third. The journal keeps them. |
| Who the protagonist is | `craft(party, craft_learning)` from the members' backgrounds (fourteen crafts), `capable(party, lore)` from skills, `brings(member, …)`, checks on qualities. |
| Companions | `willing` + `recruit` (they fight); `acceptsEscort` + `lead` (they follow). Topics `travelling`. |
| A talking book carried | A peaceable `Person` with no body, kept where the company is by a rule while a copy is carried (as the Auditor in Low Water is a voice). |
| Danger | Local `Species … like chimera / sprite / pixie / mind_destroyer`, temperaments and words, `Numbers`, `Hazard`. |
| A clock | `watch(clock)`, `hour(clock)`, `day(clock)`; fixed hours for the Court, the Guildhall, the Kindling; a placed country's clock starts when it is reached. |
| The council's vote | Rules fire once for every binding of their variables, in the order written, in one pass: a poll is a reset rule, a counting rule over `sits(?m) and favours(?m, ?o)`, and a deciding rule comparing `ayes(o) * 2` with `seated(chamber)`. |
| Endings | `Ending` in a file only the standalone campaign installs; in a generated world the city goes on after the Kindling. |
| Placement | `countries.json`, `"among": "independent"`, a `placed.json` without the company. |

## What is missing, and the narrow extensions made

### E1. A book that raises a quality (`Resolve endow`)

Kyr could teach a spell (`Resolve reward`) or a skill (`school`, but only with a level's development in hand), and
raise a quality only by spending a level's development (`improve`). A Manual is exactly the thing a level's
development is *not*: a permanent gift from outside the ordinary course. Added:

- `Resolve endow(member, quality, degree)`, with `Kind degree` and `by_one`, `by_two`, `by_three` in the shared rules
  (`care.kyr`). The quality rises by that much, never past twenty-five (first written as twenty; a level-ten mage already has twenty-one). It spends nothing; the module that offers it says
  what it costs.
- `Measure levelOf(member)`, projected for every member, so that a module can say what a Manual asks of its reader
  (`levelOf(reader) >= 5`).

Implications for the broader system are in the final report: an attribute ceiling of twenty for every gift, and the
first measure of a member that is not a body's condition.

### Everything else is authored

The design asked for nothing else the language cannot already say. The friction met while saying it is recorded as
it was met ([friction.md](friction.md)).

## How the design is fitted

- **Districts** are seven settlements and one wilderness on the region map, each a few streets with buildings off
  them. The Commonplace is a second region of the same module, with no road to it: its ways in are passages that open
  on what the company has done.
- **The Colophon's pieces** are seven discoveries; Quarles teaches the whole only to a company that knows two.
- **Positions in the chamber** are facts the company learns by asking; the order paper on the Roll's floor shows the
  count as it stands.
- **Rhule's arc** is a measure (`doubt`) raised by what she is shown, and three ends decided by what she has seen and
  whether she has been lied to.
- **The Almanack's arc** is a set of facts: what it heard, whether it tells, and what it becomes at the Kindling.
