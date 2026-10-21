# The Serewater March: three expeditions, one company

20 October 2026. Played in the built Mono client (`site/mono.html?campaign=serewater-march`) in Chromium at
1280×900, by key presses (`scripts/play-server.ts` and `scripts/play-driver.py`, which pick choices by their labels),
and headless through the same commands. I wrote much of the content, so this is not a blind playtest: it checks that
the March holds together across expeditions, that what a company is decides how it gets through, and that the screen
shows what a player needs in order to decide.

The whole journey is a test: [march-journey.test.ts](../../../test/march-journey.test.ts).

## The opening (captures 01–05)

| Capture | What it shows |
|---|---|
| [01](01-title.png) | The title: begin a new campaign or load a saved file. |
| [02](02-campaigns.png) | Choosing where: the March first ("start here"), three shorter campaigns, and a generated region. |
| [03](03-create.png) | Forming the company: four ready companies, then each companion's ancestry, calling, specialization and background, what each brings and carries, and what the company as a whole can and cannot do ("No one has trapwork, stealth, lore…"). |
| [04](04-reedwake.png) | Reedwake quay at 8 a.m. The scene and the choices side by side; the map (this place, and the region) and the company below. Wren is waiting for news of Pell; the ferry to Brackenholt is tied up until there is some; a boy's rumour points at Silkholme. |
| [05](05-boar.png) | An hour's walk out, a boar across the low path. The gentle ways come first (Elen reads its posture; a ration scattered for it); Attack is last and marked as a risk; the way past it needs stealth, which no one in this company has. |

## Three expeditions (headless, the fellowship: Elen, Bran, Dori)

1. **Censer Hill (day 1).** Up the ridge track to the foundry yard; the survey board in the vestibule tells of the
   tram crawl. Bran picks the stores padlock (lockwork), the company takes the pry bar and a line, crawls through to
   the hoist room and Bran lifts the rack off Pell (brawn). The bronze bearing goes to Edda, the salvage forewoman, in
   the yard. Pell is led home; Wren meets them on the quay, and the next time anyone is near it, the ferry runs.
   700 experience each (rescue 400, salvage 300), back by 3 p.m.
2. **Silkholme (day 2).** A bed at the Oar is a night's sleep: the company wakes at seven. Garth (two ewes down)
   hands over his spare torch and says another night or two of this and he goes down with fire. Odile asks that the
   brood-mother be fed. Garth gives up the dead ewe; down the shaft on the line, the torch lit in the dark cave, the
   webs hacked through, and the ewe left for the brood-mother. 500 more experience; Odile pays, Garth waits to see.
3. **Holt tower (day 3).** Another night at the Oar brings level 2 for all three: a point each to raise, and a
   spell for Dori (Smite Evil). (Capture 09 shows the same screen for another company.) Iven tells of the opened graves; two torches from Nera; across on Wren's ferry to
   Brackenholt; Wat in the Holly Bush knows the builders' well behind the tower. Down the well, a torch in the unlit
   crypt, up the crypt steps past the risen dead (who guard the main stair, not the back way) and into the study,
   where the bone lantern is smashed: the dead fall, and the necromancer, broken, is sent away. 800 more; Iven empties
   the alms box. Day 3, early afternoon, and not one fight.

None of it needed a fight because the fellowship had the skills, the tools and the rumours for each quiet way. A
company that comes the front way meets the bears, the hound, the risen and the Custodian instead.

## A different company, a different way

The pilgrims (cleric, monk, bard) have no brawn, locks or woodcraft. They climb the hoist side of the foundry (the
monk's climbing), dig Pell out with their hands (forty minutes), and get Pell out through the gallery by tossing the
hound their only ration, so they come home with no food. Also a test.

## A fight (captures 06–08)

| Capture | What it shows |
|---|---|
| [06](06-bears-across-the-way.png) | The edge of the holt. The bears across the holt way are met from this side: their state, and what can be done (smoke them out, which Elen's woodcraft allows; fight; or slip past, which needs stealth). |
| [07](07-bears-intent.png) | The fight. This round's order, and under each foe what it means to do: both bears wind up a Maul on Elen. |
| [08](08-guard-and-windup.png) | Bran guarded Elen and Dori blessed Bran; the bears reared up. Now both "land Maul → Elen", and Elen is Guarded until Bran acts again, so Bran (who acts before the bears this round) can guard her once more and take both blows in his plate. Helping conditions are shown apart from hurting ones. |

Six seeds of each ready company against the bears: every company won; the healer-less delvers lost one or two
members in half of them; the fellowship walked through.

## Growing, and a generated region (captures 09–12)

| Capture | What it shows |
|---|---|
| [09](09-level-up.png) | A night at the Oar after enough experience: each companion "advance ▸", and the caster's spells to prepare. |
| [10](10-learn-a-spell.png) | Learning a spell: each of the tradition's spells the caster can cast and does not know, with what it does. |
| [11](11-generated-region.png) | A generated region: Deem chose that the town's name means "marsh hold"; the region's human folk say it in Westron, "Merscheald", and the description says so. |
| [12](12-journal.png) | The journal: what is in hand, what the company knows, and a chronicle of what happened (no longer every scene's description). |

## What remains

- The symbolic planner cannot reach these modules' goals within its node budget (each attempt costs ~24 s), so it
  cannot be used to check that every company can resolve every expedition; scripted journeys are the evidence.
- Hostile people cannot start a fight; the dead walking the green at night are a danger only if the company attacks.
- About 100 ms passes between a choice and the next screen (the command plus a 50–70 ms screen build), roughly twice
  the figure before the March grew from five installed modules to ten.
