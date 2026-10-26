# The Third Night

*A tragedy in a city on a bridge. Three carters hang from the gatehouse rail at Wrayford until the lord's captain
comes; in Wrayford the dead are buried on the third day, and one who is not, goes looking; and Wat Pardoe's widow has
said that if he is still up there on the third night she will go up with the bread knife herself.*

An independent author-builder commission, on branch `adventure/third-night`. The module is
`data/adventures/wrayford/`; the region is **the vale of the Wray**, south of a generated mountain country.

## Playing it

- **As a homecoming**, Wat Pardoe's elder child home a week late:
  `bin/kyrie campaign data/campaigns/the-third-night.campaign.json`.
- **As a chapter of a generated world**: in a mountain country, ask an innkeeper *about the bridge at Wrayford*, walk
  to the south march, and go down the drove road. The company is a stranger there; when the verdict is given the
  chapter closes and the world goes on.
- **The tests**: `bun test test/the-third-night.test.ts test/the-third-night-small.test.ts
  test/the-third-night-wander.test.ts` (longer walks: `WANDER_STEPS=300 WANDER_SEEDS=s1,s2,s3`).

## The documents

| | Stage | |
|---|---|---|
| [`01-treatment.md`](01-treatment.md) | 1 | The original design |
| [`02-critique.md`](02-critique.md) | 2 | The severe editorial review of it |
| [`03-revised-design.md`](03-revised-design.md) | 2 | The design revised under that review |
| [`04-adaptation.md`](04-adaptation.md) | 3 | What Kyrie could do directly, what needed working round, what needed extending |
| [`05-the-city.md`](05-the-city.md) | deliverables 2, 5 | The map, the crossings, the clock, and what the place does to the problem |
| [`06-adventures.md`](06-adventures.md) | deliverables 3, 4, 5 | Synopsis, acts, people, the strategic conflict, the fourteen small adventures and how they connect, the eleven endings |
| [`07-builds-and-rewards.md`](07-builds-and-rewards.md) | deliverables 6, 7 | The build matrix as played, and what is won |
| [`08-playtest.md`](08-playtest.md) | deliverable 8 | The tests, the transcripts, the random walks, and what playing found |
| [`playtest/`](playtest/) | deliverable 8 | Seventeen playthroughs, as the player saw them |
| [`09-friction.md`](09-friction.md) | deliverable 9 | Authoring friction in Kyr, the engine, Deem and the interface |
| [`10-critique.md`](10-critique.md) | deliverable 10, stage 6 | A final critique, and what changed from the design to the final |

## The module

| File | What is in it |
|---|---|
| `module.json`, `placed.json` | The homecoming, and the world chapter (which imports the world's company) |
| `clock.kyr` | Days that turn at dawn; the third night; low water; the ferry's hours; the drawbridge; the curfew |
| `city.kyr` | Seventy places and forty-four passages |
| `company.kyr`, `placed.kyr` | Wat's child and their kin; or the world's own company |
| `pardoes.kyr` | Maudie, Kit, Bramble, the vigil, the coat |
| `bridge.kyr` | The Bridge End, the toll and its board, Pinch, the rail and the dead, Gault and the riders, Jennet |
| `pitch.kyr` | Annis Pye; the burned toll-house and the flask in the ash |
| `northgate.kyr` | The drove road, the Nine Wheels, Gault's letter, Win Fenner, the farrier, the young carters, Kit's plan |
| `market.kyr` | The broadside, Lumley's portrait, the cart in the Guildhall yard, Pinch's room and day-book, Quoin, Pratt, Tull, the Shambles and the offal cart, Ham |
| `hill.kyr` | The reeve and his question, Hal and the letter, Gidley, Honoria, the ice |
| `river.kyr` | The Wharf, the ford, Ham's drive, Dorcas and the quarrel at dusk |
| `liberty.kyr` | Overbridge, Corbin and the graves, the Abbess, her court and the hide, the bear-garden |
| `night.kyr` | Up to the leads; cutting, lowering, carrying, burying; the dawn reckoning; Maudie on the third night |
| `fire.kyr` | Kit's night at the counting-house |
| `day.kyr` | The Remonstrance; the reeve's cover; the two mothers |
| `captain.kyr` | The captain, the third night's reeve and rising, the verdict |
| `endings.kyr`, `aftermath.kyr`, `growth.kyr` | Eleven endings and the fates told with them; the city afterwards and the Bridge Feast; twenty-three milestones |

Outside the module: an entry in `data/adventures/countries.json` (the placement), the campaign
`data/campaigns/the-third-night.campaign.json`, and two small engine fixes (`src/lang/module-parser.ts`, topics only to
the waking; `src/presentation/narrator.ts`, no article before a kin phrase).
