# Rededge: three adventures in one generated region

20 October 2026. Played in the built Mono client (`site/mono.html?world=thorn&terrain=mountain`) in Chromium at
1280×900 with real key presses, after a first exploratory pass that found the problems listed below. The final pass
is scripted ([journey.sh](journey.sh), driving [control-server.ts](control-server.ts)) so it can be replayed; fights
use a fixed policy ([policy.js](policy.js)): warriors and rangers hit the weakest foe, Bran charges, Dori heals anyone
below half. Each capture has a `.png` and the screen's exact text in a `.txt` file. I wrote the scenarios, so this is
not a blind playtest. How the region is made: [generated-worlds.md](../../architecture/generated-worlds.md).

The default company: Elen (elf ranger, hunter: rope, woodcraft), Bran (human warrior, locksmith: thieves' tools,
lockwork), Dori (dwarf cleric, medic: bandages, herbs, mending).

## The journey

| Captures | What I saw and decided |
|---|---|
| 01 | Creation shows the region's pitch and each background's grants, now including who it lets you know ("knows someone who hears road news"). |
| 02–03 | Coldhill green: a shepherd's boy talking about the sink is the only public news. In the Velvet Hand, the innkeeper can be asked about the ewes and the light at Red Watch; topics name generated places (Stone Delf, Red Watch). |
| 04–05 | Garth offers eight coin to burn the spiders out; Odile, on the frame terrace, asks the opposite. The Journal states the quarrel in both their terms. |
| 06–07 | Garth hands over the dead ewe. Down the shaft on Elen's rope; hack through the webs; the brood-mother is "Cave spider; level 3; 17 HP". Feeding her quiets the brood: 500 experience each, earned by the company's own act. |
| 08 | Odile pays four coin and offers the first silk. |
| 09 | Back in Coldhill: the outfitter knows of an old well behind Red Watch, the priest of opened graves and an acolyte who left the shrine, the innkeeper of a green light. The Journal lists what the company knows, each with its source in the chronicle; no objective appeared before something was heard. |
| 10 | A bed (3 coin), first light, the track to Red Watch. Two ways into the crypt are offered separately: the old well shaft (opened by the rumour; needs rope) and a barred postern (needs lockwork). |
| 11–12 | By the postern to the crypt and up to the study: Burke, "Human cleric; level 3; 16 HP". The daybook says the bone lantern holds the dead; smashing it drops the risen in the hall below without a fight. 800 experience each. |
| 13 | Burke explains (his drowned sister) and is sent away. |
| 14 | The priest takes the news and empties the alms box (6 coin). |
| 15–16 | A bed at the Velvet Hand: all three reach level 2 (Bran +12 HP, Elen and Dori +5); Dori now has three first-level slots (two by the table, one for Wisdom 17). |
| 17 | In Peakview's taproom, Baldrus the drover: "Baldrus and Elen hunted the same hills for a season. News from the roads reaches them first." He knows of the den at Peak Delf. A bed at the Stormy Crown. |
| 18–20 | Peak Delf by daylight: "Bear ×2; level 1; 12–13 HP each; unhurt." The bears act first and both maul Elen; Bran's Charge kills one bear each round, and Dori spends a slot healing Elen. 300 experience for the bears and 200 for the den. (In the exploratory pass the den's search paid 11 coin.) |

Afterwards (exploratory pass): Garth pays three coin once a night passes without a lost ewe; Coldhill's green carries
two pieces of news: Odile's silk is back, and the dead have stopped walking by the tower.

## What the first passes found, and what changed

| Found in play | Fix |
|---|---|
| Rumour topics were listed in the taproom as objects marked "destroyed", with raw ids (`{region__w1}`) | Spoken topics are not things; hook topics name places by their generated names |
| A first try at the den (level 1, attacking blind) killed the whole company in five turns ([90](90-first-attempt-fallen.png)): two bears with 9–11 point blows | Groups now show kind, level, hit points and wounds before a fight; selected actions show their meaning ("A fight goes on until one side is down or runs…"). Encounters are not rescaled |
| Each bludgeoning blow forced two stun saves, under "stun" and its alias "stunned", so a stunned member never acted again | Each triggered condition is saved against once |
| Taking the den first, then sleeping in Coldhill: Garth burned out the sink overnight, and the company was paid the brood's 500 experience anyway | Module experience goes to the company only for its own act or when it is present |
| Hiding the sink path until heard also hid it from Garth, so he could not act on his own deadline | The scenario says Garth knows his own loss (`Initially Assert knows(garth, ewes)`) |
| A save taken right after experience was awarded would not resume (creature facts out of date), and the page silently returned to company creation | Facts are re-projected after awards; a save that cannot resume says why |
| The well and the postern both led to the crypt; only one "Go" was offered | Two ways to one place are offered by name |
| Stepping into the tower counted as cross-country travel; sites drew as separate regions on the chart | Scenarios put sites in the region's wilds (`@wilds`); entering names the outermost enclosure |
| The open action menu misaligned its rows ([91](91-menu-before-fix.png)); slot pips overlapped their label; map stubs read "→ upland of Rededge" | Fixed in layout; ways into open country are named for where they lead |
| A level-1 ranger listed Heal Ally, a fifth-level spell it could never cast; bards had spells and no slots | Bards cast from a lesser slot table; the ranger's Heal Ally is omitted (recorded in the ledger) |
| "Search Peak Delf…" sat under "Other" with a "?" | Actions about nothing in view are the company's |

## Still wrong or thin

- "I've lost 1 to them so far" (a number where a word belongs); stun saves print the total as "constitution 21".
- The member sheet shows personal coin while the purse shows the company's; nothing explains the difference.
- Hunger and lodging interact oddly: a supper at 8:30 p.m. after "eat by 8:00 p.m." passes without comment.
- Garth's deadline is real (he burns the sink after the second night) but the Journal says "No public deadline".
- The objective "Garth and Odile will want to know" stays until Garth has had his night; correct, but it reads as
  a task the player has already done.
