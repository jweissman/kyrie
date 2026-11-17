# Substantial early sites: Phase B (the proof)

The sites commission's Phase B, as the lead agreed it after Phase A (`phase-a.md`). Items 1–5 and the OR-12 add-on are
done; item 6, the shovel passage, is not. Every walk below is a headless walk through the authoritative engine, made
with the Phase A walker (`/var/tmp/kyrie/m22/sites/explore.ts`). Three of the walks' logs are kept in `walks/`. A
walker's success is not anyone's enjoyment.

## What changed

| Item | What | Where | Spec |
|---|---|---|---|
| 5 | A mine's ore is paid at half its worth, as a dealer pays for any valuable (SI-07) | deep-sites.ts `hooks` | — (measured below) |
| — | The catacombs under a town are called and kinded as what they are: "the old workings under Lowmouth", a mine, not "the old dead", a barrow (SI-02). The innkeeper no longer says "It is out in under Lowmouth" | region-undertown.ts; the purposes' `plan.buried`; deep-sites.ts `lies` | undertown specs |
| 4 | On a deep site's first level, nothing that lies in wait stands on the spine, and an elite stands only at a branch's end. A band changes rooms; it is never weakened (ruling 6). Near the arrival, a band the company can meet takes its place | deep-placement.ts | small/deep-placement |
| 3 | A wonder within a work or a deep site, met, tells how its makers ended and teaches `history_<art>_fate`. This happens only where the makers are the country's own, and only to a company that meets the wonder | region-marvels.ts `fragment`; wonders.json `fragment` | small/wonder-fragment |
| 1 | A walled-up cache off a room of the second level (detailed below) | deep-cache.ts; rooms.kyrt `cache`; the purposes' `cache` | small/deep-cache |
| 2 | One order chest a site, where the level's Orsino riddle would have been (detailed below) | deep-order.ts; rooms.kyrt `order`, `orderright`; the purposes' `order` | small/deep-order |
| OR-12 | DeepSounds asserts `lurks(band, place)`. A way to where something lurks carries the mark `lurks` and the danger aspect, but only where the company has light to see the sign by, never in the dark | passages.ts `lurking`; marks.ts; aspects.ts; inhabitants.kyr | small/ambush-marked |

**The walled cache (item 1).**
- Its cue is in the room's look, told only in the light.
- Nothing of it is offered until the cue has been seen.
- It can be found three ways:
  - by searching;
  - by lore reading the mark in the newer stone (one try, which may fail);
  - by strength or a crowbar, which takes an hour.
- It holds an arm or armour, a thing of use, one or two of the makers' valuables, and the later kingdom's note of it, which teaches `history_successors`.

**The order chest (item 2).**
- Three marks, each pressed by one flat act.
- The order is shown on a frieze, a board or a carving in another room of the same level.
- A wrong mark sets the chest back, with a noise.
- Lore reads the order off the chest itself (one try, which may fail).
- Force opens it in an hour and breaks what it holds.

**Found along the way:**
- The Elixir of Agility's `use` did not parse, which broke any world that drew it.
- Two specs needed updating to follow the new placement: two-fights and deep-barrow.

## Death and withdrawal, before and after, same seeds

These are careful walks (Phase A's policy) on a1, b2 and c3, in the catacombs and the deep site. "Before" is Phase A's
code; "after 4" is the code with only the placement change; "after" is the finished code.

| Build | Before: died / withdrew | After 4 | After | Rooms reached, before → after |
|---|---|---|---|---|
| Lone mage | 4 of 6 / 2 | 4 of 6 / 2 | 4 of 6 / 2 | 93 → 89 |
| Lone warrior | 3 of 6 / 2 | 3 of 6 / 2 | 3 of 6 / 2 | 107 → 103 |
| Mage and the first town's hire | — | — | 3 of 6 / 0 | 47 |

**The placement change saved no one, as Phase A's walks foretold.** The deaths are not on the first level's spine:
- they come in the town's own troubles (the spiders' mother, the beetles);
- or on the second level, by a one-way ore pass or a routed move into an ambush.

What changed is perception. The deaths by ambush in these walks came by ways at whose mouth the generator tells a seen
sign; the page now marks such a way red to a company with light (small/ambush-marked). The walker reads that sign
only by a phrase in the prose, and missed it after a light burned out.

**Retreat stayed viable.** The careful walkers withdrew, slept, came back to where they had left off, and found the dead
still dead.

**The hire makes the lone mage worse off at the start.** The 6 coin it costs comes out of the mage's 21, before rope and
torches. In a1, the hired mage and Cyril together took on the charnel passage's dead, which the page had reckoned less than grave, and both fell.

## The playthroughs

All are in `walks/` and `/var/tmp/kyrie/m22/sites/final/`.

**c3, mage with the hire, the Delvers' mine** (`walks/c3-mage-hire-deep-mine.txt`). They lived, and brought home +212
coin.
1. Asked at the inn, outfitted (rope and torches), hired Lirion for 6.
2. At the adit, the mage read the makers' marks on the post-stone (lore): `history_deep`.
3. They kept out of the winze head on its sign.
4. They declined the goblins at the crossing, which the page reckoned deadly.
5. At the shaft head they met a wonder, the cold flame: "It shows you, as plainly as a page, how the people who made
   this place ended. The star-iron gave out, and they turned on one another for what was left…". This taught
   `history_deep_fate`, and with it the country's inference completed: `w7_found`, the way to the great work, known
   from no single stone.
6. They went home and sold what they had taken.

**c3's lone mage completed the same inference before it died** on the second level.

**b2, lone warrior, the Delvers' mine** (`walks/b2-warrior-deep-mine.txt`). He lived, and brought home +514 coin.
1. Fights on the way in.
2. A wonder, the singing crystal: no fragment, since b2's makers are not the mine's art.
3. In the Delvers' hall, the boarded wall:
   - the search: "Behind the planks in the end wall the rock is cut square: a store, boarded over";
   - the store: a dagger, a coil of rope, a Delver's ring, a Delver's silver lamp;
   - the tally-board, read: "Taken into the king's keeping: the last of the paymaster's store…", which teaches
     `history_successors`.
4. The shift-board in the haulage, seen, gave the order. The paymaster's strong-box was opened by its three stamps in
   that order, the wheel, then the lamp, then the hammer: "The last stamp goes down. Bolts slide inside the box, and
   the lid comes up."
5. His candle had burned out on the second press, so the walker never took the box's lamp in the dark. That is the
   walker's fault, since fixed.

**b2, lone warrior, the undertown** (`walks/b2-warrior-undertown.txt`). He lived, and brought home +108 coin.
- The town's three jobs taken, and their keys.
- Withdrew when out of light: paid, sold, slept and restocked, then returned to the robbers' way in the catacombs where he had been.

**Not walked:**
- No walk solved the chest by lore.
- No walk forced the cache. The lore and force acts are pinned in small/deep-cache and small/deep-order.

## The economy

Home ÷ spend is `scripts/economy-measure.ts`, with each valuable counted at the best price any buyer pays (the ore
included).

| Seed | Before | Ore at half | After (cache and chest too) |
|---|---|---|---|
| a1 | 5.32 | 4.98 | 4.98 |
| b2 | 3.64 | 3.46 | 3.43 |
| c3 | 6.09 | 5.84 | 5.86 |

- b2's first trip down the mine: +600 before, +514 after.
- The cache and the chest add arms, tools and the makers' things, about 20–60 coin a site at a dealer's half.

**Most of what remains is not ore.** In c3, 2,300 coin of the excess is one domain-tier buyer: the rivals' head pays
2,500 for the mine's heart, against a dealer's 200.

**What the economy lacks:**
- The bought verbs exist and are cheap: rope, pole, crowbar, firebomb, ratsbane, lantern and oil, spyglass, the
  glossary at 80 (the only way to the country's history for five callings).
- Nothing sits between the field and the domain:
  - specialists, guides and pack animals beyond the mule;
  - repair;
  - a room of one's own;
  - training beyond the two first-town teachers.
- After a +500 trip, the only purchases that change what a company can do are the glossary, the lantern and a second
  pair of hands. A successful trip should buy one of these, and should be priced to:
  - a lantern and oil for a whole level (7 + 1);
  - the glossary (80);
  - a hireling's month;
  - a stake in the next site.

## What remains

- Item 6: a shovel-gated side way to an optional depth.
- A look before a one-way drop (SI-08's remainder; the lead's interaction grammar).
- The second level is still where lone novices die (SI-01 stays open). The danger is now perceptible; whether it
  should be survivable for one is a design question.
- History stays lore-gated (SI-06). The wonder fragment is a second way to the makers' fate; their identity still
  needs lore or the 80-coin glossary.
- Empty searches (SI-03), the pole's monopoly (SI-04), the inert tools (SI-05) and CB-22's domain tier (SI-07) are as
  Phase A found them.
- Two specs that fail on the pre-Phase-B base, apparently over-time: mage-play (now OR-21) and sitting-out-the-night.
