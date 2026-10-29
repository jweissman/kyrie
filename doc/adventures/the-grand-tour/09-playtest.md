# The Grand Tour: playtest evidence

*What was played, by whom, how, and what it showed. All of it is developer play: journeys written by the author
from the labels the page offers, autoplay by the engine's laboratory players, and the author reading the
transcripts. None of it is independent human testing, which this work has not had.*

## The suites

| File | Tests | What it proves |
|---|---|---|
| `test/the-grand-tour.test.ts` | 3 | Lints clean (errors and warnings); the bard's whole Tour by phase, each phase's state asserted, to A Present from Sennet; a game kept after the Whelm, resumed in a fresh page, played on to the same end with the same canonical state |
| `test/the-grand-tour-outcomes.test.ts` | 11 | Every other end, each by its own route and company, and the fault where Perrin is drowned |
| `test/the-grand-tour-builds.test.ts` | 3 | The monk's chain; a bard cannot climb it; the sailor's greeting |
| `test/the-grand-tour-autoplay.test.ts` | 4 | 300 offered commands each, four tempers and callings, every step checked by the laboratory's invariants, round-tripped every forty, replayed to the same game |
| `test/the-grand-tour-second.test.ts` | 6 | The Sexton: the wrong hour kills, the turn is safe; the bell stopped lets it down and rung again sends it up; Bethan told why sleeps with the bell ringing; fed, it lets you be; the Courant's printed lie makes the case; the wrong answer puts Aubrey in the Watch-house and sends Perrin up |
| `test/the-grand-tour-placed.test.ts` | 3 | Sennet as a province; the proclamation, the keeper's rumour, the gate, the installation, the coast road, the left-alone week in a world that goes on; and the Undertow played by the world's own protagonist, with the Door opened on the Glass Market |

All 30 pass. The full repository suite was not run end to end in this session (it is several hours serial); the 31
files that the province placement can touch (world assembly, regions, provinces, frontier, the other placed
adventures, lint, seeds, the repository bundle) were, and pass, except `lint-outside`, which fails on the base branch
too, on a pre-existing redefinition in `data/adventures/low-water/undercroft.kyr` this branch does not touch.

## The journeys

Twelve transcripts in `playtest/`, written by `bun scripts/the-grand-tour-transcripts.ts` from the fixtures in
`test/fixtures/sennet/` as the page told them:

| Journey | Who | Steps | End |
|---|---|---|---|
| `tour.md` | Tamsin, bard | 299 | A Present from Sennet |
| `alone.md` | Tamsin, waiting at the coast road | 171 | The Second Whelming |
| `coming-down.md` | Tamsin | 165 | The Coming Down |
| `undertow.md` | Brann, warrior (labourer) | 64 | The Undertow |
| `found-out.md` | Ama, cleric (acolyte) | 187 | Found Out |
| `rectors-door.md` | Tamsin | 302 | The Rector's Door |
| `first-through.md` | Tamsin | 327 | First Through |
| `kept-above.md` | Tamsin | 288 | Kept Above |
| `keepsake.md` | Tamsin | 363 | The Keepsake |
| `letter.md` | Wren, thief (burglar) | 199 | The Letter |
| `bell.md` | Tamsin: the bell stopped for Bethan, the Sexton down, the bell rung again, Bethan told why | 190 | The Second Whelming |
| `wrong-answer.md` | Tamsin: Aubrey's story carried to Bassett; Perrin told | 295 | The Tour Unfinished |

## The two portals, compared in play

The **Rose** (`tour.md`): four courts played by their own rules (a mirror in the Hour Court; Chert and the motion in
the Slow Assembly; supper, a name and a child in the Guildhall; gossip and a story in the Gallery of Winds), Prue
saved by the Rector, the North Wind's breath in a jar, Prue's petal made overnight, the keel swapped, Chert through the
cat-flap, the Rose turned on the fourth evening. Three and a half days; 850 experience each.

The **Undertow** (`undertow.md`): Ha'penny carried up the stairs, her breath, the guards, supper, the joke of No
Admittance's name, Perrin's word about the engine, her leave, Perrin moved, the whole Whelm on the wheel, the cage, the
Door, the Rector barred. Sixty-four steps, the first day; 400 experience. No Cloudgate, no mystery, no romance. They
differ in length, in cost, and in what they leave: the Rose leaves Cloudgate held up by glass, the Undertow leaves
the Whelm a day in the dark and the four petals where they were.

## Negotiations

- **No Admittance** gives the Water petal three ways in play: after the name and the step (`tour.md`), after supper and
  the step (`keepsake.md`); never to the divers if warned.
- **The Rector** withdraws Prue's complaint (and says you owe her); credits Tolley's line if asked; refuses the ember;
  at the keel offers to take you through with her, and in `first-through.md` keeps her word.
- **Pumphrey** takes a deposit (`tour.md`), relents to Bethan, or is argued down (persuasion, an even chance).
- **The Dowager** offers a hundred coin (`kept-above.md`); kneels on the gravel to a mermaid with her son's ring on her
  thumb, and goes up the Air Door to say sorry (`keepsake.md`).
- **The North Wind** gives his breath for a glass-blower ("the first new thing anybody has said to me in two hundred
  years"), renews his gift for a letter (`letter.md`) or an apology (`keepsake.md`), and gives the feather.
- **Bassett** takes the case from an acolyte with no persuasion at all (`found-out.md`).

## Alternate outcomes, and the fault

Eleven ends are reached (`05-story.md`). The fault: in the Keepsake route, the Rector hears Perrin is alive from
Mercy's speech on the Promenade and goes for her cloak; the company is in the air-bell at two and she says "Another
night" and goes; in the variant where the company stays up in the Air, she drowns him, and Ha'penny tells you on the
third step in the morning (`the-grand-tour-outcomes.test.ts`, "stays up in the Air").

## Persistence

The bard's Tour is kept after the Whelm (`checkpoint()`), resumed with `PlaySession.resume` in a fresh session, and
both copies are played on through Cloudgate, the Air, Lamp Street and the Door: the same ending and the same
canonical game. Autoplay round-trips every forty steps and replays each run from its commands to an identical game.

## Exploratory play

The four autoplay runs (`the-grand-tour-autoplay.test.ts`), and a script that reports what each reached:

| Run | Commands | Places | Learned | End |
|---|---|---|---|---|
| gulls, mixed, bard | 141 | 19: the House, the Fire (Hour Court, Ash Market), the Earth (Assembly, Minutes), Lamp Street's shops | the board; the fee | The Second Whelming |
| tide, explore, thief | 78 | 7: the lower city, the taproom, the Landing Stage | the board; the fall | The Second Whelming |
| ember, fight, warrior | 83 | 11: the Quay, the Fish Stairs, the Harbourmaster's, the winch-house, Cloudgate's Promenade and Wind Court | six facts, including the Lifting and the third step | The Second Whelming |
| fern, explore, monk | 74 | 6 | the board | The Second Whelming |

What autoplay found that journeys had not: the first version of the Fire's heat killed a wandering bard who waited an
hour in the Hour Court; now the court carries a scorched Tourist out (`06-environment.md`). None found a petal by
chance, which is as it should be; none stranded itself.

## The ordinary player from outside

`test/the-grand-tour-placed.test.ts`, seed `kite`: the world's protagonist starts on a green in the first town, is
told of the Grand Tour by whoever keeps travellers there (the rumour and the notice), walks the country's roads to
the gate, and comes down the coast road. Left alone, the week runs on Sennet's own clock from the first morning
after, and ends in the Second Whelming without closing the world. In the third test the same protagonist plays the
Undertow on Sennet's second day by the world's calendar and opens the Door on the Glass Market.

## Defects found by reading the transcripts, and fixed

The opening page at the coast road was empty. Ha'penny, Imogen and Mercy joined and left in the engine's generic
words ("'Why not,' says Lady Imogen Halyard. 'It's not as if anything is keeping me here.'"). Chert greeted you with
"You're back!" the first time you spoke to him. Cloudgate was "in the sun" at night, and still above the cloud after
it fell. The Rector took the keel in front of the company without a word. The Rose counted "1 of the four hollows
have". Bassett was unreachable outside a three-hour window, and his arrest rule could never fire. The closed ferry's
text was told on the Landing Stage, in the sky. A promise's kept-line was told minutes before the man it concerned was crushed. Each is
fixed and the transcripts written again; `11-changes.md` has the list.
