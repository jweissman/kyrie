# Mission 18: what play reaches

The owner's review of 2026-10-29 found that authored adventures can look almost empty despite substantial source,
and that generated towns can show many people and places without feeling inhabited. The first of its priorities is an
audit of what ordinary play actually reaches: which people, conversations, activities, merchants and scenes are met,
given geography, time, scene conditions and where a module is placed, as distinct from what was written.

## The instrument

`bin/kyrie reach <campaign.json>` (and `--all`) plays a campaign as a curious player would, by what the page offers
and nothing else (src/autoplay/curious.ts). It talks to everyone it meets and asks them everything it can, takes
every way, tries everything the adventure offers but a fight, goes round again when nothing is new, and waits an hour
when there is nowhere it has not been lately. When something closes the book before its end (a way out that ends the
story, a fight that cannot be won), it says what, and plays again from the start without taking it, up to three
times, adding what it reaches. It does not buy, fight or quarrel. What it reaches is therefore a floor of what play
can reach, not a ceiling: plot-gated content (a con, a confession, a second act) mostly lies beyond it, and the
authored journeys of each adventure (test/fixtures/*) reach further.

It reports, against what the campaign's own modules wrote: rooms visited, people met, topics offered, the
adventure's actions offered, observations seen; who had nothing to say when spoken to; what was for sale and by whom;
the busiest rooms and how many were never seen with anyone in them; and how much of play was waiting with nothing new.

## The library, as it stood (900 steps each, seed `reach`, the campaign's own party)

| Campaign | Rooms | People | Topics | Actions | Seen | Mute | Sellers / wares | Closed the book |
|---|---|---|---|---|---|---|---|---|
| The Liberty of the Ice | 39/42 | 27/33 | 66/117 | 21/88 | 97/154 | 3 | 3 / 2 | |
| The Third Night | 40/44 | 31/37 | 97/147 | 27/93 | 112/186 | 2 | 3 / 2 | |
| The Banns at Hessel | 37/42 | 22/30 | 62/153 | 13/54 | 78/157 | 3 | 2 / 2 | the banns, day 5 |
| A Winter in Carth | 39/40 | 31/38 | 94/153 | 32/53 | 73/113 | 0 | 2 / 2 | three times (see below) |
| Gosse's Company | 37/40 | 40/41 | 177/248 | 16/76 | 82/167 | 2 | 4 / 3 | |
| A Parliament of Books | 70/107 | 50/83 | 178/333 | 7/65 | 125/318 | 1 | 4 / 5 | |
| The Road the Star Came Down | 87/104 | 47/53 | 86/123 | 7/42 | 82/222 | 6 | 3 / 7 | |
| What Tessary Owes | 32/54 | 22/34 | 93/213 | 4/24 | 68/175 | 1 | 4 / 11 | died in the Street of Scales |
| Low Water | 54/71 | 20/24 | 122/342 | 7/66 | 93/261 | 2 | 2 / 5 | its first way out |
| The Patient Star (and Hold One Season) | 51/139 | 26/46 | 49/97 | 1/35 | 61/361 | 3 | 5 / 9 | eels at the Flood Line |
| Thrume | 33/85 | 20/35 | 21/46 | 2/13 | 28/186 | 3 | 2 / 3 | Skarn, day 1 |
| The House That Grows | 22/28 | 11/13 | 16/30 | 10/18 | 68/100 | 2 | 2 / 2 | (idle 808 of 900 steps) |
| The Long Man | 24/31 | 9/12 | 19/26 | 2/5 | 44/116 | 0 | 1 / 2 | |

## What it shows

**Written and reached are far apart, and not chiefly by geography.** Most rooms are reached (a curious player walks
nine in ten of the cities of the four winter adventures); most people are met. What is not reached is conversation
and action: between a third and two thirds of what is written to be said, and most of what is written to be done.
Some of that is the plot, gated on knowing or having done something, as it should be; the authored journeys reach
three quarters of Pellam's topics and actions where the curious player reaches half and a quarter. But the floor is
where an ordinary player begins, and it is low.

**Places are described as full and played as empty.** Pellam's Freezeland Street was written with gin and gingerbread,
hot codlings, a skittle alley, a swing-boat, slices of the ox and a man selling the future; play found four people
there and nothing to do but talk to them. The same is true of the descriptions of most of the library's markets,
inns and streets: the prose has a crowd and the page has a list. Across the library, between a third and three fifths
of the rooms a curious player walks are never seen with anyone in them.

**Commerce is thin and scattered.** Pellam sold rope and rations (three sellers, two kinds of thing) in a city holding
a fair. Most adventures have one or two sellers of food, and a light is often found only by chance. Several sellers
have nothing to sell (A Parliament of Books's clerk, Low Water's Halm, The House That Grows's Dace). In generated
countries, a town's merchant is of its trade, and a herb-wife's town had three shops of remedies and nowhere to buy
rope; Orsino's General Store stocked the first eight cheapest things of its kinds in alphabetical order (bedroll,
bell, blanket, caltrops, candle, chalk, dice, firewood).

**People with nothing to say.** In most adventures two or three people answer being spoken to with nothing (Pellam's
bailiffs and night-watchman, Hessel's shepherd, Low Water's clerks, Thrume's watcher); a player who speaks to them
learns only that the page lists people it cannot talk to.

**The book closes before play begins.** Low Water's first way out, "Go up out of the Bowl by the north road", ends the
book at 8:10 on the first morning, unwarned. Thrume's roaming giant kills the company on the first day; What Tessary
Owes's Street of Scales and The Patient Star's Flood Line kill a default company on its first walk. A Winter in Carth
closed three times for a curious player, once by a choice that kills.

**Placement hid four adventures.** The Liberty of the Ice, A Winter in Carth, The Banns at Hessel and The Third Night
were never in the reader's list of campaigns: they could be reached only by crossing a march in a generated world to
the country each is installed as.

## Pellam, closely

Pellam is where the owner's acceptance demonstration is played (a solo protagonist at the Frost Fair), so it was
audited by hand as well, through the reader: the North Road, the North Bar, the Cheaping, Swan Lane, the stairs, the
foot of the stairs, Freezeland Street and the map.

- The North Bar and the Cheaping are empty, as written (everybody is on the ice), and say so; the Cheaping was painted
  as a dark forest.
- Swan Lane's two watermen and their plank were prose only; shaking on a penny a stair (which cannot be undone) was a
  button among the company's, with nobody to ask what it bound.
- Freezeland Street's description named a dozen trades and none could be bought from, played or asked.
- Its people were listed below a long description, out of sight on a laptop.
- The map was five icons and dashed lines: no river, though the Fair stands on one.

## What has been done (this commit and after)

- The four adventures are in the reader's campaigns.
- Pellam's Fair has its trades and its crowd (data/adventures/liberty-of-the-ice/fair.kyr): Mother Gage's chandlery,
  the first booth at the foot of Swan Stairs (candles, torches, a lantern, lamp-oil, rope, a crowbar, sacks, chalk,
  blankets, spikes); Long Meg's gingerbread at the Glove Post; the Butchers' men at the ox; the skittles, the
  swing-boat (from whose top the whole Fair is seen and known) and the man selling the future; the two watermen on
  Swan Stairs, who say what a penny a stair binds; and the crowd, about the Glove Post by day, round the Court at
  four, at the Liars' Bench of an evening, which tells a stranger where everything is, about the knight who lives on
  the ice, and about Master Harker's hiring. Its bailiffs, searchers and night-watchman have something to say.
  Measured again: sellers 6, wares 11 (from 3 and 2), topics 82 of 133 offered (from 66 of 117), people with
  nothing to say 2 (from 3), and the bailiffs since.
- Every generated village and town has a chandler (src/world/outfitters.ts): its merchant where that is its trade,
  otherwise a chandlery off its heart, selling food, light, oil, rope, a crowbar, sacks, chalk, bedrolls, waterskins,
  bandages, a pole and spikes; a hamlet's keeper sells rope and oil besides food and a light. A town's other shops
  are never two of one family (remedies, general goods, arms, cloth, rarities).
- The audit's own rows (M18-05 to M18-09): Low Water's way out asks first and waits until the city has been seen; a
  general store stocks the outfit first; those who only buy are listed apart; everyone found mute across the library
  has something to say; Thrume's guest-right, Tessary's quay steps at high water and the Flood Line's eels warn
  before they kill. Measured again (`kyrie reach --all`): nobody mute in any adventure (from two or three in most);
  no book closed on its first morning; Thrume's first death moved from the first afternoon to the second day, after
  a warning ignored.

The rest is in the register's rows for the owner's review (OWN-01 to OWN-07) and the audit's own (M18-04 onward).
