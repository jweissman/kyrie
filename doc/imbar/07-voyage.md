# 7. The Dorothea: a sea voyage on the existing travel system

*`data/adventures/the-dorothea/`, a province of the generated first country (`countries.json`: `tolleth`). Tests:
`test/the-dorothea.test.ts` (12). Evidence: `playtests/ordinary-world-voyage.md`.*

## 7.1 The adventure

A harbour at the end of a coast road (Tolleth), a ketch (the Dorothea) that sails on the noon ebb whether or not you
are aboard, and an island (Skerrow) a night and a morning out past a reef called the Combs, where a lamp has burned
since before the roads. You arrange a passage (six coin; or your backs at the casks; or a quiet hour among them); you
walk aboard; you cross.

The voyage has people, not set pieces: Captain Ingrith Bascom, in debt to a factor who wants her keel; her mate,
Tobias Rune, who has been selling the Pharos oil to make up her debt; the cook, Mab, who has watched him do it;
a boy, Nipper; a surveyor of the Collegium of Measures, Odile Quint (who can be asked to come with you); and Jago
Pendry, whose cutter does a night's business on this passage. On the way: **fog in the Sound** (take soundings, or
wait it out, and the count stops while you do); **the smuggler at the hatch** (tell the Captain, take eight coin,
shame Rune into putting the casks back, or only watch); **the Combs** (lie off five hours for the slack and lose the
Orsett man's patience; run the gap on the ebb; jettison twelve casks of the Captain's cargo; or, if you shamed Rune,
let him take the wheel and be the Captain's man again). A holed hull makes water, and the pump is a labour done in
turns; a hull that takes forty strokes of water is *told* to founder (the narration and the flag are written; **the loss of the ship, and the swim ashore it implies, are not implemented**, and I say so rather than leave it to be found).

On Skerrow: forty-one people, a winter coming, a factor's agent (Silas Quillon) who offers sixty down and a lease
waived for ten years for the Pharos's bronze table and reflector, a keeper (Marren Kestle) who will not say what she
will take, and her brother (Jory), who has four children and a sixth bad cod season in nine. The company can pay
Jory's winter debt at the Gull, argue the island out of it, or watch; on the second evening, if no one has spoken,
Jory puts his name to the paper and the lamp goes out. A rubbing of the Prefect's Table can be taken either way. The
Dorothea goes home on the second morning ebb; a company still ashore is on Skerrow until the *Mary Ann* on the
24th.

## 7.2 How it uses the existing travel system

What the engine already had, and what I found it had not.

| Question | Finding |
|---|---|
| A vessel entity | **None.** `ferry` is a static passage between two fixed rooms (`world-constructs.ts:138-141`). |
| A mobile location | **None.** Places do not move. |
| Places within a vessel | Ordinary: a `site` with rooms, joined by passages. |
| Interrupting a passage in progress | **Not possible.** A `go` that is interrupted by a foe lands at its destination (`journey.ts:92-98`); there is no resume. |
| A sea route across non-walkable hexes | The world map has no archipelago concept; every region is land-linked to four neighbours (`world-grid.ts`, `borders.ts`). |

Given those, I did not extend the engine. **A ship is a thing that is somewhere, and its decks are ordinary rooms.**
`hull` is a `Thing` that is `at` one of five stations (the quay, the Sound, open water, the Combs, Skerrow roads,
the jetty). The stations are rooms in a `sea` region that nobody walks to. The company is *aboard*: it stands in the
Dorothea's rooms (waist, quarterdeck, cabin, forecastle, hold), which are joined to the quay and the jetty by
**gangway passages that are shut when she is not there** (`opening when at(hull, quay) and booked(party)`). The clock
moves her: a counter, `progress`, ticks once for each watch she is under way and *not in trouble*; a rule moves
`at(hull, …)` when it passes a threshold. **A trouble (`troubled(hull)`) stops the count and the count resumes when the
trouble is settled.** That is the interruption-and-resume the engine's passage did not have, and it is a few lines of
ordinary Kyr per event.

So the semantics are:

- **Identity.** One hull, one id, one state (`alongside`, `underway`, `moored_isle`) and some measures
  (`progress`, `water`, `cargo`, `delay`).
- **Embarkation.** Walking: quay → gangway → waist. Not a script. Not offered without a fare, work, or a stowaway's
  success. The gangway is shut again when she casts off, whether you are aboard or not.
- **Geography.** Three landmasses (the mainland port, the sea, the island) with no walking route between them. The
  island's rooms are physically elsewhere.
- **Time.** Real watches pass: fog costs the company hours; the reef costs five or none; the voyage takes
  about 31 hours out and 27 home.
- **Interruption and resumption.** Any event can stop the count; the count resumes from the same station.
- **Persistence.** All of it is ordinary world state. A save made in the fog resumes into the fog; one made in the
  Combs resumes in the Combs (`test/the-dorothea.test.ts`: *survives a save and a reload in fog, and again in the
  Combs, and goes on to arrive*; and the same inside a generated world).
- **Return.** The hull is reused: homeward legs reverse the stations on a second counter, so the Combs are met
  again on the flood, and a company ashore at the ebb is stranded.

## 7.3 What this does not prove, and the extension I would make

- **The ship does not show on the world map**; there is no chart for a voyage. A route would need the regional chart
  (`ChartModel.regional`, `roads`) to know a `sea` kind. A new passage kind `sea` is a three-file change
  (`world-constructs.ts`, `chart-model.ts`, `journeys.ts`) and I did not make it because nothing here required it.
- **Dice-driven weather**: the events here are on a schedule with decisions (fog at progress 22; the cutter at 66;
  the Combs at 108). A table of sea events a Deem template could draw would make the passage different each time.
  Possible with the existing `generation` mechanism; not done.
- **Several ships.** One is easy, many want a `vessel` rules module.
- **Sail handling as a skill.** The catalog has `wayfinding`, `mending`, `climbing` and `tumbling`. No `seamanship`.
  A catalog skill is a JSON row.

## 7.4 As an echo

The Remainder (§9) uses the same pattern with different stations, a different clock and a canonical plane's
threshold as the far station. The sea was the proving ground: the company learns, on a ketch, what it will
find on a ship that goes out of the world.
