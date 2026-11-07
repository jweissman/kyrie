# The Third Night (Wrayford): broad-pass ledger

*Branch `adventure/imbar-deep-time`. Module `data/adventures/wrayford/`. New: `voices.kyr`. Edited: `wade.kyr` (one condition), `module.json`/`placed.json` (source, canon). Test: `test/the-third-night-voices.test.ts`.*

## The Account

| | |
|---|---|
| **Count** | The dead on the rail: three carters, hanged until the captain comes; behind it the older count, ten men hanged at the Michaelmas Burning, and the bridge-penny that is counted on every cart. |
| **Keeper** | The Bridge Company (the board, Pinch's day-book); the reeve; and, unlisted, Corbin the sexton, who keeps a lamp. |
| **First page** | Why a Wrayford grave faces the water, and who the second figure in the chapel picture was. Nobody remembers; the paint was scraped. |
| **Price of reading** | Whoever reads the count aloud is taken for it (Kit, or the company). |

## Acts and scenes (what the earlier documents left implicit)

| Act | Days | Scene (place, face) |
|---|---|---|
| I. The homecoming | Day 1, morning | Drove road (the swallows), Northgate, the Nine Wheels (Pell, Gault), the Pardoe kitchen (Maudie's bread) |
| II. The rail | Days 1-2 | Bridge End (Pinch, Jennet), the Guildhall (Hulme), the Hill (Gidley, Honoria), the Liberty (Corbin, the Abbess, the Ferry Inn and its gander) |
| III. The night work | Night 1-2 | Gate leads, the bank under the arch (the hook), the ford (the Bargeman), the Acre; or Kit's night at the counting-house |
| IV. The captain | Day 3 | The riders sighted, Sefton and the verdict, the storm, Maudie |
| V. The reckoning | Night 3 to day 5 | Endings, the Bridge Feast |

## Characterization (want / fear / lie / thing they do when pressed)

- **Simon Hulme, reeve**: wants the city spared a burning; fears being the clerk's boy at the Bridge End again; tells himself it is law, not fear; when pressed, resigns (existing).
- **Lys Sefton, captain**: wants not to be her father; fears Water Lane again; says she only administers; asked about it, "I held the horses" (existing).
- **Sergeant Gault**: wants the duty done; fears the big man turning on his rope; says it is the rope drying; **in play (new)**: fed the widow's bread, he lets a cloak down over the biggest of the three at night and says in the morning that it was the youngest rider's.
- **Maudie Pardoe**: wants the door unlocked; fears the third night; says she can't stop baking; takes the bread knife (existing).
- **Corbin, sexton**: wants the dead properly down; fears nothing the living do; says he is only the sexton; **in play (new)**: lights a lantern every dusk for the drowned never carried over, and does not know for whom.

## Companion arc (calling-keyed; capability-keyed, see friction)

Six voices, each once: ranger on the drove road (the sky, planted for the third day), cleric at the Acre (the ten stones lie with feet to the river), thief at the gate (the new lock on the old door), warrior at the rail (four riders, no relief), bard at the Nine Wheels (has the hymn by heart; this teaches `wade_hymn`), mage at the chapel (lampblack over a scraped second figure).

**A way through that only some can take, with a price.** The Bargeman already yields to bread, woodcraft, Dorcas's boat or the bridge. Two new exits are by calling: **the bard sings the carters' hymn** (loud: the Wharf hears, `temper(wray)` rises by one, a morning rumour follows) and **the cleric says the office** (quiet: six minutes of the narrow low-water window, no noise, and the weight at the Step comes lighter, which also changes what the carrier feels). One company cannot do both; they are different companies' choices.

## Danger with two noncombat exits

The Bargeman (a pike a ferry long): fed bread, woodcraft along the pier foot, Dorcas's boat, the offal cart, the bridge, the hymn, the office; or fight (a lone carrier dies). The counting-house ambush (Kit's night) already had its refusals.

## New depth (not on the critical path)

1. The ten stones at the Acre lie with their feet to the river (cleric).
2. The chapel altar picture has a scraped second figure under lampblack (mage); nobody says who.
3. **The hook under the first arch** with its ring of old tallow, a lantern lit nightly by Corbin for the drowned who were never carried, as his father and grandfather did (the kept light).
4. The Ferry Inn's **Assize of the Goose**: every week the landlady's gander "the Alderman" is tried for crossing the bridge without paying the penny.

## Links

- **Out**: `befell(slack_opened)` read at the Nine Wheels: Pell relays a tale from the south of a black square in a floor and a stair to a place with no weather (reads canon, sets nothing). The Assize candle is the catalog `candle`; a tale of Harbury salt; Sennet by implication.
- **In**: Wrayford is where the drove roads come down: a drover, a packman or a carter from any country with fells to the north may arrive by the drove road for the Michaelmas fair or on the news of the rail. Nothing else is needed.

## Tone, foreshadow and payoff

- **Contrast**: the Assize of the Goose (comic, in a city that has hanged three men on a rail).
- **Planted early, paid in the last act**: the swallows skimming the Wray on the first morning (and the ranger's warning) are the third day's yellow air and storm (existing chapter text). **Paid only if the player went looking**: the hook is seen under the arch, Corbin explains it, and on the carrier's far bank the light is behind them.

## Tests

`bun test test/the-third-night-voices.test.ts` (11): voices by calling, the swallows, the hook and its payoff on the far bank, the tale from the south (absent until `befell(slack_opened)` is staged), the bard and the cleric at the Step, the Assize, Gault's cloak. The original suites (`the-third-night*.test.ts`) were re-run; see the report.

## Shortfalls

- The party is one person in the homecoming: "companion arc" is calling voices plus the Pardoes as kin, not a roster.
- `befell(slack_opened)` shows a lint warning "no possible target" in a world where the Grand Tour is not played: true and intended.
- The Assize's outcome is a persuasion die; the failure is only a comic result.
