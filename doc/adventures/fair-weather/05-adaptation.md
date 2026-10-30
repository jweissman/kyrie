# Fair Weather — Stage 3: reading the engine, and what the design asked of it

*Written after the treatment and critique, before most of the Kyr; amended where the build taught otherwise.*

## What Kyr could say directly

| The design wants | Kyr has | Used as |
|---|---|---|
| A sea that empties and fills | `opening when` on passages, read every pass; measures and arithmetic | The sand ways open at low water; the boat ways round high water; the Sill at slack (`tide.kyr`) |
| Drowning on the flood | `Hazard` + a rule asserting `strikes(hazard, party)` every watch | The fifth hour; the Gut; the sinking sand off the withies |
| A guide, a fare | Actions that cost coin and set a fact or a measure (`guided`, `fareDay`) | Cuddy Pascoe; Jinny Rowse's day of sailing |
| A frightened dog won by patience | A creature of a local species (`like dog temperament wary`), a trust measure, actions | Admiral |
| A court without a vote | `Occasion` with three `Matter`s, each closed by what is done in the room | The Wreck Court |
| A confession that is not a puzzle | An `Event` when two people and the company are in one room | Loveday asks Hender |
| A question put to the player | Topics `answering` a question | The Reeve's offer; Ewan's letter; the purse |
| Things that cannot be undone | `Grave` | Drowning the dog; the purse; asking Kerensa in the loft; pushing past Ewan |
| Being told the truth by a scene | `Observe … teaches`, `Rule … says … teaches` | The oil, the hook, the knocking on the hull, the inference |
| Inference | A rule over several known facts that teaches a new one | `put_together` (`kerensa.kyr`) |
| An unreliable world clock for others | Rules on `hour(clock)` moving people | Hender's day; Cuddy at low water; Cawse on the wreck |
| Being found from the world | `countries.json`, `placed.json` | North of a fen, forest or frost country |
| Something lasting after | Observations conditioned on outcome; ending in a placed country closes a chapter | Fore Street, the quay, the Holm, the Acre after |

## What it could not, and how the design bent

- **A cyclic tide with a daily lag** had to be arithmetic by hand ([friction 5](friction.md)).
- **Boats are passages, not vessels.** The Patience does not sail anywhere you can stand on her. The design never
  needed a deck; it needed the fact that a boat goes *when there is water*, which passages can say. A voyage beyond
  the Reach (Ferrar's packet) is told, not sailed.
- **Nobody is beaten without being killed** ([friction 17](friction.md)): the Cawse lads' fight is real, and Skeel
  answers a killing.
- **A standalone ending closes the book**: the endings were moved to the packet's sailing so the third ebb could be
  played ([friction 6](friction.md)).
- **The planes** were not used. Nothing in the repository defines them ([friction 18](friction.md)).

## What I chose not to build

- No new engine capability, no shared rule changed, no shared voice line added: every limit met is reported, and met
  in the module.
- No generated content: everyone in Skeel is authored. The town is small enough to be written person by person.
