# A Winter in Carth: playtest evidence

*Every journey here was played by the labels a player sees (`Journey.play`), from the Penitent's Cross, and the
transcripts in [playtest/](playtest) are the pages as they were told, written by
`bun scripts/winter-in-carth-transcripts.ts`. The assertions are in the tests named.*

## The suites

| Suite | Tests | What it proves |
|---|---|---|
| `test/winter-in-carth.test.ts` | 9 | lint clean; left alone; the five principal journeys and their endings; a checkpoint kept on Shrove Monday and resumed to the same end; replay determinism |
| `test/winter-in-carth-small.test.ts` | 18 | the ways through the night at Carth (refused custody, let go at the Fork, the letter, the thief's lie, the ranger's beasts, Hern's confession, the mage's cold light); the back ways into the Close; the thirtieth peg; the put-outs' fold; the Fabric's night-men; Thackray's night; the widow; the wood; the tower bargain; Prudence paid; the Lady's words; the monk's soles |
| `test/winter-in-carth-wander.test.ts` | 8 by default | four builds × two seeds, 200 random offered choices each, then the days waited out: after every step the company stands in a place, the page has no ids or unfilled slots, Hern is in one condition, the Consistory gives one verdict at most, and one ending is told. `WANDER_STEPS=300 WANDER_SEEDS=w3,w4,w5,w6,w7` (20 walks) also passed |
| `test/winter-in-carth-placed.test.ts` | 2 | placement beside a frost or forest country, never on the first ring; an ordinary wanderer in a generated world (seed `g5`) walks east, east and north, hears the innkeeper's rumour, crosses the march, takes custody at the Cross, waits the week out to *Put Out*, and the world is still running |
| `test/frontier.test.ts`, `test/adventure-names.test.ts` | | existing placements unchanged; no name shared with another adventure |

All pass at the final commit.

## The journeys

| Transcript | Build | Approach | Ending | Steps |
|---|---|---|---|---|
| [alone](playtest/alone.md) | bard | waits at the Cross and does nothing | Put Out | 83 |
| [above](playtest/above.md) | bard | the Close | The Bearer (Thackray) | 174 |
| [below](playtest/below.md) | thief | the Row | The Fast | 143 |
| [flight](playtest/flight.md) | warrior | the Row and the lane | The Flight | 116 |
| [bearer](playtest/bearer.md) | cleric | the Close, by its own body | The Bearer (the company), put out | 135 |
| [dead](playtest/dead.md) | ranger | does nothing at Carth | Put Out, in a coffin | 95 |
| [letter](playtest/letter.md) | bard | the letter of the vigil, then waits at the Fell Gate | Put Out | 106 |
| [recant](playtest/recant.md) | bard | the masked Lady and the window | The Recantation | 122 |
| [peg](playtest/peg.md) | bard | Annis's sister, the coin matched, Thackray told | Put Out | 111 |
| [fold](playtest/fold.md) | bard | Hern taken to the fold on the way in; Joby told of his son | Put Out, to the fold | 124 |

## Exploration by offered choices

The wander suite is the exploratory player: it does not know the module, it only takes what the page offers, and
its checks are about the page and the world rather than any plot. The scripted journeys and the wander between them
met these faults, all fixed: the Hal Metcalfe "taken" message told in every room of the city; serjeants too strong
for a cleric who walks into Gaol Lane at ten; a page that said "Ninian Hern, an at the bars", from a role used as a
name; the cold hazards' paralysis killing a bard on the Steps.

## The portal approached several ways

The Close Gate is the portal between the Row and the Close. Played through it:

- **a clean tally** by a proxy at the Stand (*above*), and by the company's own barefoot mile and a night on the Steps
  (*bearer*, and the monk's soles test);
- **a forgery** from Heb's cellar, past the porter on a deception check (*below*);
- **the Lady's ring**, which shaves the tally smooth (*recant*: "'Remitted,' he says. He does not ask how");
- **as Hern's custodian**, on the day he is delivered (*above*, *bearer*);
- **over the Close wall** at dusk by a monk, and **through the masons' lodge** on Joby's word by a bard, each with a
  tally still notched (the back-ways test; for the bard the wall is not even offered);
- **refused**: in *flight* the company never enters the Close at all, and talks to Hern through the bars.

## Negotiations

- **The beadle** (custody, refusal, his foot bound).
- **Annis Scaife** (why no fire; who paid; how anyone would know) and **Will** (persuasion, hard: lights it himself or
  says "Seventeen nights" and does not move).
- **Raistrick**, lied to by a thief: "I've known a fever warm a stone" when it holds; "A child's fever doesn't make a
  fire" when it does not.
- **Thackray**, moved by four different routes (the tests use two: Annis at the cob and the rhyme in *above*; a night
  of his own at Carth in the small suite).
- **Canon Laverock's bargain**: the Scaifes' rent for silence about the tower (taken, in the tower test).
- **Bess Ackroyd**: the strike persuaded, or cornered with the Ladder's buying-out (*below*).
- **The masked woman**: three reasons, each carried from elsewhere (*above*, *recant*).
- **Prudence Garth**, paid six shillings for her mother's fine, and does not inform.
- **Hern himself**, told to live, in words that quote what the company said on the road.

## Alternate outcomes of the same strand

| Strand | Outcomes seen |
|---|---|
| Carth's night | kept by the byre; kept by the letter; kept by the beasts; kept by the bed; nursed; broken by the company; broken by the house, at Hern's confession; the lie held / not held; nothing done, and Hern's coat |
| The child | warm; nursed; Hern's coat; dead (let go at the Fork, nobody at Carth to give her a coat) |
| The old woman | brought in; Ralph laid out; found on the twenty-sixth morning |
| Thackray | bears it; releases and opens the wood; known and unchanged; never found out |
| The trial | the Fast; the Flight (window; Fork); the Recantation (the Lady's words); the Bearer (Thackray; the company); Put Out (alone; in a coffin) |

## Persistence

`kept on Shrove Monday and opened again` plays *from below* to the step before Heb's cellar, takes
`session.checkpoint()`, serialises it through JSON, resumes it with `PlaySession.resume`, plays the rest, and reaches
the same ending, the same elapsed time and the same pains as the unbroken run. `played twice from the same seed`
shows the same steps make the same pages.

## From outside

The placed test is the ordinary player's journey: a wanderer in a generated world who has never heard of Gaunt, hears
a rumour in an inn two countries away ("They say a beadle went down the march road to fetch him, and has not come back
up it"), walks north over the march, and finds the beadle. Nothing in the run selects the adventure; it is found by
walking.
