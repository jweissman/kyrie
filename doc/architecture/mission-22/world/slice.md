# The world slice: Iscoed, the reference start (17 November 2026)

The bounded slice of `orientation.md` §4, step by step, each landed and measured before the next. Play it at
`?world=iscoed` (also `iscoed3`, `iscoed4`: the same three countries, each world's own detail).

## Step 1: the strategic atlas (landed ab07177d)

`data/imbar/atlas.json` holds three countries as facts, for the worlds it lists; `src/world/strategic-atlas.ts` feeds
them down the paths that exist. What it gives each lower generator, and what it could not:

| Path | Given by the atlas | Before |
|---|---|---|
| Deem `region` | terrain, majority people, faith | terrain only (a great region's) |
| Name, shore | the country's name; its land falls to the sea east | the seed's name; the first country never shored |
| Settling | the chief town on a harbour (`port`) | the best-scored cell, anywhere |
| Livelihoods | the country's own table (Iscoed: salt at the harbour, eels on the fen, charcoal in the woods) | the terrain's |
| Histories | the makers' arts (Iscoed: the Water-Wardens, the Barrow-Kin) | two drawn by terrain |
| Settlement names | the chief settlements (Porthalen, Wrackham, Edderwick, Gatesend) | drawn |
| The module | the country's facts as Kyr entities (polity, people, livelihood, shortage, trade, danger, works, neighbours) | none |

Measured: a1's and kite's first three countries are byte-identical to main's; the three reference worlds share names,
seats, livelihoods, makers and neighbours (Rìerdan north with Dun Rìerdan its seat, Brynach west, mountain, dwarven,
Delvers and Star-Readers), and differ in people, minor settlements and sites (`test/small/strategic-atlas`).

## Step 2: the opening and three invitations

Iscoed begins only its own lives (`AtlasOrigins`; `Origins.bind` gives a country of the atlas no other), and the
atlas places its own goings-on before anything drawn (`StrategicAtlas.goings`, held as a herald is) and keeps out
the library's one that would contradict them (`exclude`: the drover who did not come home). Nothing in the creation
page or flow changed: `circumstance()` draws among the country's lives as before.

**Three lives, each already in the country** (data/origins/drove, pans, weir; begun where the life is, none on the
road in, none by the reed-cutter and the wagoner):

| Life | Begins | Relationships | Possession | Obligation |
|---|---|---|---|---|
| Down the drove road (herdsman) | Porthalen's landing, the drove just taken at the march-stone | Bran ap Ifor, the lead-drover, held; Owain, your cousin, minding the drove | Bran's tally-stick: forty notches, four cut through beside a wavy line | the drove is yours to mind until he is out |
| The salt-pans (labourer) | the salter's salt-house at dawn, two pans skinned with salt | the salter, your master, who owes you a week | — | the fires go out in three days, and your wage with the season |
| Your aunt's weir (fisherman) | the hamlet under the sea-gate | Nest, the eel-wife next door; the reeve, your landlord | Tegwen's lease; the weir itself, whose trap is lifted for a creel | five coin at the quarter-day; the sea-gate does not shut |

**Three invitations, in the world whichever life begins** (data/goings-on/iscoed-*), each a different activity, a
different capability, a different consequence, and a clock:

| | The held drove | The cold pans | The last sea-gate |
|---|---|---|---|
| Dramatic structure | an inquiry: three accounts that disagree (the clerk's forty, the boy's thirty-six, Bran's) | a practical errand against the clock, then a livelihood | a repair of the makers' work, down a dark well |
| Perceived by | the customs-man on the door and the bawling pens, seen from the landing | one smoking chimney over the salt-houses | the reeve's notice on the well-post |
| Ways through | the drowned four in the rhyne (search); the over-written count in the clerk's book (insight); twelve crowns' fine | pole the full fuel boat down the silted cut (brawn: the month's load) or carry two sacks | find the lost pawl in the gate-well (light, search), set it and wind the gate (brawn) |
| Rewards | Bran's freedom and his word for Brynach (the drove road west) | 8 or 15 coin, the week's wage, and a shift's work at three coin whenever wanted | thirty crowns of the reeve, and her errand to the city (step 5) |
| Clock | four days: Bran sent north to the Judges, the drove sold | three days: the brine spoils, no salt this season | six days: the spring tide floods the fen |
| Ties | the clerk's racket is what the reeve will not look at | the cut is silted where the sea came in | the pawl's pin was sawn: someone wants the gate open (step 3's secret) |

From the drove's start all three aims are held after one wait (`test/iscoed-opening`); each is played through to its
end by the page's labels in the same spec.

**The funnel, measured** (iscoed; directed play by the page's labels in `test/iscoed-opening`; the boredom census's
four unguided tempers and the lab's two aim-followers, `gold` and `follow`, 60 acts each, from each of the three
lives: 18 walks):

| Stage | The held drove | The cold pans | The last sea-gate |
|---|---|---|---|
| Exists | in all three reference worlds | all three | all three |
| Reachable | the customs-house, pens and rhyne off the landing | the next settlement along the road (s5/s2/s3 by world) | Gatesend's sea-bank, gatehouse and well |
| Perceptible | seen from the landing (the customs-man, the pens) | one chimney smoking over the salt-houses | the reeve's notice on the well-post |
| Offered | at the customs-house, pens and rhyne | at the staithe and the salt-house | at the gatehouse and in the well |
| Executable | yes | yes | yes (a light for the well) |
| Realized | directed 1/1; walkers 0/18 | directed 1/1; walkers 0/18 | directed 1/1; walkers 0/18 |
| Consequential | Bran's word west; four days, or he is sent north and his drove sold | wage, then a livelihood; three days, or the season's salt spoils | thirty crowns; six days, or the fen floods |

All three aims are held within one wait of the drove's start. The walkers realized none, and the reasons are the
walkers' and the town's, not the invitations' absence: the unguided tempers left Porthalen by the ways into the
provinces (Strewnfield, Ammerlin, the Ossel delta, Pentrice, Larum: 45 ways on from the landing); the aim-followers
took `talk_to` and never the topic behind it (BO-07), went down the undertown and oscillated between two of its rooms,
or followed another aim. The decisive acts were made deeds rather than topics (Tell Mardle where the four bullocks
are; Tell the salter the boat is in) and the first look at the customs-house and the pens now carries each count, so
the chain advances without talk; the walkers still did not finish one. Realized therefore rests on directed play and
on the cold player, not on the lab.

**The census** (four unguided tempers, 60 acts, per life; a1's rows are the census's after its three fixes):

| | repeat % | dead % | places | wonders heard of |
|---|---|---|---|---|
| a1, over the hills | 13 | 27 | 62 | 0 |
| Iscoed, down the drove road | 10 | 10 | 100 | 2 |
| Iscoed, the salt-pans | 14 | 21 | 77 | 0 |
| Iscoed, your aunt's weir | 10 | 15 | 98 | 0 |

The fall in dead time is mostly the provinces' pull (more places, more travel), not the invitations: read it as the
map being busier, not as the opening being better.

**What could not be said without TypeScript** (each a register row, §54):

- A life is matched to one kind of past (`circumstance()` reads one background's kind): a herdsman begins the drove,
  a labourer the pans, a fisherman the weir, and every other past the first, the drove (WD-11). The smallest repair is
  a list of kinds on an origin's manifest, read by `circumstance()`: an engine-flow change, proposed, not made.
- A module cannot begin the company in a place of its own: the company is declared in the region's module, so each
  life begins on a region room (the landing, the salt-house, Gatesend's green) and its own places are one step off
  (WD-14).
- The atlas names a settlement but not what it is: Gatesend, the sea-bank hamlet, was drawn with a brothers' house
  and fells behind it (WD-13).
- The first town is the province's crossroads: from Porthalen's landing there are 45 ways on, 27 of them ways into
  provinces, and the unguided walkers take them (WD-12, WD-02's measure).

## Step 3: the sea-gate's lower works, and what the country remembers

Under the gate-well (`data/goings-on/iscoed-gate`, the same module):

- **The sluice gallery.** The gate's chain goes down its middle, and the water runs its length. Two black eels hunt
  the running water, warn first, and at low water lie stranded on the silt: the ebb is a way past them, not a fight.
- **The wardens' tide-room.** Its walls are cut with the tide's hours. The wardens' tide-table, read, teaches when the
  water is lowest (before dawn and before dusk), and their sluice-key hangs under it.
- **The lower sluice door.** It opens only to the key, and only at low water, when the sea's weight is off it
  (`opening when` the key is held and the hour is low water). This is the key and its door: the clue and the key are
  found in one room and open a way in another. `test/features/world/exploration` now pins it on a tiny world.
- **The smugglers' store.** It is found by searching behind the chain, a ledge rubbed bright by ropes. It holds untaxed
  salt and a smuggler's tally with a mark against every tenth sack, "which is how a man who cannot write writes
  clerk". The reeve reads it, and turns the customs clerk out. This is the secret behind the sawn pawl-pin and Mardle's
  racket on the drove.
- **The wardens' undercroft.** It has bronze fittings (25 coin each to a dealer at worth), a warden's ring found in
  the silt (40), and the wardens' words cut on the wall: the sea is not kept out but bargained with, a tide at a time.

**What the country remembers.**

| The gate | At Gatesend | At Porthalen's well |
|---|---|---|
| shut | every weir has a trap set in it, and the water runs the right way, out | they talk of the gate shut the night before the spring tide, by someone from outside |
| left (day 6, the spring tide) | water a foot deep in the lanes, the doors shut, the nets gone | Gatesend's people sleep in the shrine, and the reeve's notice has a line through it |

Held by `test/iscoed-sea-gate`, which goes down, takes the key and slate, finds the store, waits for the ebb and opens
the door; then lets the tide come, and then shuts the gate, each remembered where it is talked of.

## Step 4: what the gains buy

Before, a +500 trip bought only a glossary, a lantern and a hireling (WD-07). Now Gwil Pryce, a boat-wright on
Porthalen's landing, sells a **fen-boat** for thirty coin. That is exactly the reeve's reward for the shut gate, or ten
shifts at the pans. Owned, it opens ways no road goes:

- **Down the sluice-cut by water into the smugglers' store.** This is the lower works' other way in, which needs no
  ladder and no well.
- **Across the drowned fen to the mere.** The Barrow-Kin's chapel stands there in the water, floored with bones. Its
  bell, rung, is answered by the sea-gate's chain a mile off, and a bell-coin (30) lies among the bones.

Held by `test/iscoed-fen-boat`. The sea-bank offers neither way before the boat. The reeve's thirty pays for it, coin
for coin, and then both ways open, the cut into the store and the bell rung.

The salt-licence the orientation proposed is not built. A licence that sells salt dear in Brynach needs a price that
follows a country's want (WD-04), or a module in Brynach that can read a thing carried from Iscoed's (WD-16).

## Step 5: the roads north and west

Each road is carried by someone with a reason of their own, and each far end is the country's own, placed when that
country is drawn (`StrategicAtlas.goings`, now held by a country beyond the march as by the first).

- **North, the salt road.** The reeve, paid for the shut gate, gives the company her quarter-tally in a scroll-case
  for the Exchange. The aim is "Take the reeve's tally north up the salt road to the Tower of the Scales in Dun
  Rìerdan". In the city, seven towers stand over the roofs, the Exchange's with scales for a weathervane. On its
  counting-floor Iscoed's salt has the highest price chalked under it. Its clerk, Iolo Penwyn, pays twelve crowns
  and writes the company's name in the red ink, "for people we will answer for", and sends it on to the Tower of
  Doors.
- **West, the drove road.** Bran, freed, says Caer Brynach's lord pays for a sword. At the pass the drovers' hall has
  a flame cut beside every drove that lost beasts on the high pasture, "wolves don't burn the grass": this is
  Career's dragon, which lairs in Brynach by its own rule. Marged, the keeper, asks the count, and gives a guide over
  the tops.

Held by `test/iscoed-roads`, which goes up each road to its march-stone and on to the city and to the pass, and by
`test/iscoed-fen-boat`, where the reeve gives the tally.

What could not be said without TypeScript (WD-16): a country's module cannot read what the company did in another
country's module. Marged cannot know that Bran was freed, only that the company says so. The Exchange reads the tally
as a scroll-case, a thing of the catalog, because Iscoed's own kinds are Iscoed's.

## Evidence: cross-country variation and the review kit

**Cross-country variation** (`bun scripts/world-compare.ts`). For each kind of thing, it measures how much two
neighbouring countries share (Jaccard, 1 the same), averaged over the three pairs of neighbours. The atlas neighbours
are Iscoed, Rìerdan and Brynach in `iscoed`, `iscoed3` and `iscoed4`. The control is the same three cells of a1, kite
and b2.

| aspect | atlas neighbours | control neighbours |
|---|---:|---:|
| terrain | 0.00 | 0.22 |
| livelihoods | 0.20 | 0.27 |
| merchants | 0.48 | 0.59 |
| peoples | 0.21 | 0.36 |
| faith | 0.00 | 0.00 |
| makers | 0.11 | 0.37 |
| works | 0.32 | 0.50 |
| creatures | 0.35 | 0.45 |

Atlas neighbours share less of every kind of thing, and the stock, creatures and makers differ as well as the words.
Read this with three caveats:

- The atlas gives each country its own terrain, and the creatures and merchants partly follow from that.
- The difference beyond terrain is the makers and works (0.11 against 0.37), the peoples, and the countries' own
  goings-on, which this table does not count.
- Merchants still overlap at 0.48, because a merchant is still a trade's (WD-04).

**The review kit** (`review-kit/`, for the lead to run blind):

- `prompt.md`, the reviewer's brief.
- `countries/country-A.md` to `country-F.md`. These are six countries, each its profile and what its module says of
  its settlements and people. Every country's and settlement's name is a letter. Three are the atlas's neighbours and
  three are a1's, interleaved. The key is `../review-key.json`, kept out of the kit.
- `transcripts/`, three playthroughs written by the page's labels, a sentence already told at a place left out:
  1. Iscoed's drove road, a human warrior. This is the golden route.
  2. Iscoed's weir, an elf mage. The mage cannot wind the gate by strength, twice, and winds it at low water by the
     wardens' slate: a way added for exactly this (`test/iscoed-sea-gate`).
  3. a1's older opening, over the hills to the inn.

  The country names are masked. The drove transcript is headless (scratch `tplay.ts`).

What the recordings found, and what was fixed at once:

- The pens still said "bawling to be watered" after the drove was watered. They now say what was done.
- At the customs-house, with the drowned four found, the clerk's count and his book still led. "Tell Mardle where the
  four bullocks are" was offered only among the rest. The clerk's other questions now stand aside once the four are
  found, so it leads.
- The sea-gate had no way through but strength. It now also comes round at low water to one who has the slate's hour.
