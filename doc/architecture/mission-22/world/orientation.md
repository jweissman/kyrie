# The health and interest of the world: orientation and proposal (17 November 2026)

The owner's commission is `../world-brief.md`. This is its first deliverable, the six-point orientation, written before
anything large is built. The diagnosis rests on the boredom census (`../boredom-census.md`,
`scripts/boredom-census.ts`), the opportunity-depth census (`../census/opportunity-depth-2026-11-16.md`), the sites work
(`../sites/phase-a.md`, `phase-b.md`), novice viability (`../census/novice-viability-a1-2026-11-17.md`) and the boundary
report (`../boundary/report.md`). The numbers below that are not theirs were drawn on main at 9f533bac with three
scratch drivers (in `/var/tmp/kyrie/world-1-scratch`: `cells.ts` draws seven cells of a world, `placements.ts` lists
what eight worlds place, `openings.ts` opens each origin). Rows found here are WD-01 to WD-10 in the register (§54).

## 1. What we have at the strategic level, and where its influence stops

**What exists.**

- **The world's shape** (`data/imbar/shape.json`, `WorldShape`). This is a real strategic layer, written by rule over
  the grid of countries rather than by coordinates. It holds:
  - the Eastern Ocean east of the first country;
  - the Great Desert two and three rows south, then the Southern Sea and the Southern Continent;
  - one seat: Dun Rìerdan is the chief town of the first country's northern neighbour, in every world.
- **The grid** (`WorldGrid`). Every cell is a country drawn from its own seed (`seed@x,y`). Neighbours never share a
  name, and each country knows its neighbours' names and terrains (`beyond`).
- **Authored countries** (`data/adventures/countries.json`, `Countries`). There are 27, all of them now provinces:
  installed inside the first country (Gate B), each with a rumour, a notice, a skyline and an after.
- **The world's history** (`Histories`). The successor kingdom is world-wide by seed (a1's Aergodríce, the abbots, in
  every country). The makers are drawn per country by terrain.
- **The canon city** (`data/imbar/dun-rierdan.kyr`). It names the seven towers and the powers seated in them, as
  identities. Only two modules refer to the city: the Hesper Fells' finds and the House of Doors.
- **One long thread** (`Career`, CR-01). It holds a named dragon in the nearest mountain country, its proclamation
  posted in the first town, and the game-warden in the city's country.
- **The epistemic layers.**
  - World truth: the plan and the cells.
  - What folk say: `beyond`, `further` and notices.
  - What is seen: skylines.
  - What the map shows: only what is heard of or seen.

  These layers already keep the atlas from disclosing what nobody has told.

**Where its influence stops.** A country's strategic inheritance is one word, its terrain. The rest is local.

- The Deem `region` template gives every country 3 settlements, 3 sites and a wonder. `Livelihoods.seat` lays 5
  settlements on the land: always a town, two villages and two hamlets. Each lives by a table keyed by terrain and by
  what lies around it.
- `Histories.make` picks two arts of makers by terrain. The site recipe is the same in every country: two or three
  lesser works of the first makers, two of the second's, two of the successor's, one great, one deep and the imperial
  roadstation. In a1, five drawn countries hold 9–10 sites by this recipe.
- Dens, rovers and merchants are keyed by terrain or by trade. Nothing is keyed by the country, its polity, its roads
  or its neighbours.
- **The canon city is an oversized village** (WD-01). Dun Rìerdan is a `town` of peat in a1, of a forest country in
  kite and of a mountain one in ember. It has the same five-settlement skeleton as a hamlet's country, and its seven
  towers are not built. There is no settlement size above town.
- **The first country is composed by accretion, not from above** (WD-02). Its own seed draws it. Then 27 authored
  provinces and 13 scenarios are put into it. Ten of those 13 are the same in all eight worlds drawn: the factor, the
  players, the unquiet tower, a den, the circus, the Numbered House, the Bound Howe, the silent lord, the fellowship and
  the Walk of the Milestones. Only 3 vary.
- **Nothing relates countries to each other** beyond a name and a terrain over a march. No country rules, trades
  with, fears or sends anything to another. The one exception is the heralds of authored countries, and those are
  now provinces.

Not to rebuild: `WorldShape`, `WorldGrid`, `Countries` and the epistemic layers. They are sound. What they lack is a
layer that says *what a country is* and lets the lower generators read it.

## 2. The handcrafted reference geography

There are three neighbours, on the canon's own cells. The first country is at 0,0, the Eastern Ocean and its firth lie
east, and Dun Rìerdan is one march north. They are fixed by name and fact for a small list of **reference worlds**, set
by seed in the atlas's data: three seeds, so that the same skeleton can be drawn three times. Every other world is
drawn as today, so no recorded trace or journey moves (§4).

| | **Iscoed** (0,0), the start | **Rìerdan**, the Rì's country (0,−1) | **Brynach** (−1,0), the fells |
|---|---|---|---|
| Land | Firth, fen and salt-flats, with a wooded ridge behind: marsh, with woods | Corn country and forest round a river; the city on its height | Mountain: fells, high pasture, iron-pits; one pass down to the fen |
| Polity | The Rì's southern march, ruled for the Rì by a reeve at the salt-port, the town's guild of salt-boilers beside her | The Llys and the seven powers (the canon's); the city is the country's seat | A lord of the pass who owes the Rì a war-band and disputes the Rì's toll on the drove road |
| People | About 6,000: the port 1,500; two villages; fen hamlets. Human, halfling, lizardfolk | The city about 20,000, two market towns, villages. Human, with every people of the realm in the city | About 4,000: a walled market at the pass, mining villages, shielings. Dwarf and human |
| Livelihood | Salt (boiled; needs fuel), eels, reed, oysters | Corn, the court, colleges, guilds and books | Iron, wool, cattle (drovers) |
| Short of | Fuel and iron; grain in a wet year | Salt; iron | Salt for curing; grain |
| Worth buying there | Salt, fish, a fen-boat, the wardens' tide-lore | Training, books, licences, a hearing at the Judges | Iron goods, arms, a mule, a guide over the tops |
| Ancient works | The Water-Wardens: sea-gates and cisterns that keep the fen dry | The successor kingdom's courts and roads; the towers | The Delvers' galleries under the fells |
| Dangers | Tides and the failing sea-gate, fen beasts, smugglers dodging the salt-tax, the customs-men on the road | The city's own: debt, law, rivalry between the powers; footpads on the roads in | The dragon (Career's: the nearest mountain country is Brynach's cell by rule), wolves, winter on the tops |
| Roads | The salt road north to the city; the drove road west up the pass; the firth to the sea | Every road in; the Exchange sets the salt price | The drove road down through Iscoed to the city's markets |

**Tensions, some of which develop whether or not the player acts.**

1. **Iscoed's last sea-gate is failing.** At a dated spring tide it lets the sea into a fen hamlet unless it is mended
   or jammed shut. Mending it means the Water-Wardens' works (the slice's site). This tension has a clock.
2. **The toll on the drove road.** The Rì's customs-men take a tenth of every drove at the march. Brynach's lord
   calls it theft, and a lead-drover is held at Iscoed's port. This is why the customs-men are on the road, which the
   novice census found killing every lone calling (CB-01). The dispute is heard by the Judges in the city.
3. **The dragon** (CR-01's) takes cattle on Brynach's high pasture. As the weeks pass it comes lower. The proclamation
   hangs in Iscoed's port.
4. **Salt for iron.** Iscoed's salt goes up the pass and north. Brynach's iron and the city's coin come down. The price
   of each is set by the other country's want.

**How the characteristics propagate down,** each through a path that exists today.

- **Deem givens** (`WorldGrid.first`'s `given`): terrain, majority people and faith, as the Great Desert gives terrain
  now.
- **The land** (`Atlases.make`): terrain and shore exist already. A second kind of land (Iscoed's ridge) is a finding
  (WD-03): an atlas lays one terrain.
- **Settlements** (`Livelihoods.seat`): the atlas names the chief settlements and gives their size and livelihood. The
  seed draws the rest, choosing from the country's own livelihoods instead of the terrain's table.
- **History** (`Histories.make`): the country's makers are given, not drawn by terrain. The successor kingdom stays
  world-wide.
- **Creatures and dangers** (ecology and rovers): the country's habitats and species are given, as a terrain's are.
- **Trade** (merchant types and stock): exports are cheap where they are made and dear where they are short. A price
  that follows a country's want is a finding (WD-04).
- **Scenarios** (`WorldAssembler.settle`'s Deem select): the country's context keys (polity, livelihoods, roads) join
  the terrain, so the library places what fits. This is the two-way composition ATLAS §13 asks for, by the select that
  exists.
- **Knowledge.** The country's facts are written into its module as Kyr entities and relations: the polity, the reeve,
  exports, roads, neighbours. Topics and rules read them, and the map shows only what is told.

## 3. Baseline boredom diagnosis

**The first hour, by what is actually done** (a1; eight origins opened and the first town's aims read; the eight worlds'
placements):

| Dramatic structure | Where it comes from | What it rewards | What it leaves |
|---|---|---|---|
| Go to the nearest lesser work and search it | order (copy the writing), map (the cross at its door), lost (a sister in it); courier's and debt's follow-ons name a work too | Light, rope, lore, nerve | A history fact and experience. **map and lost go to the same keep in a1** (Ironkeep) |
| Carry something to a person in the next town | courier, herbs | Walking | Coin, then a work named |
| Find money by a date | debt | Anything that pays | A creditor's refusal if missed (real) |
| Search a road for someone | kin (bound to the `drover` scenario) | Walking, asking | The drover found |
| Ask at the inn, read the notice | wanderer | — | The corn-store's rats (the same undertown in every world), the notice's jobs |
| A civic dispute | the boundary stones (`quarrel`, 3 of 8 worlds) | Talk | The only dispute with sides |
| A hunt | the dragon's proclamation, every world | Nothing a novice has | A reason to travel that a novice cannot take up |

**What repeats.** The first hour has three shapes: go to the nearest ruin, carry to the next town, fight in the
corn-store. Under them sit these repetitions:

- Every origin that begins on the way into a town begins with the same reed-cutter and wagoner (WD-05). That is five
  of the seven origins a1 holds; herbs needs the fever.
- The undertown is one template.
- Ten scenarios are in every world.
- Each country is the same skeleton under another terrain word.
- Inside a country, trades collapse to a monoculture: ember's five settlements are furs, furs, furs, furs, peat (WD-06).

**Why interesting things are hard to find** (the census's BO-01, BO-05 and BO-07, with sites phase A):

- No wonder was met in 20 walks. Each stands at the heart of a wild country or past a work's inner way, and nothing
  points at it.
- 21 % of moves are dead walks back through rooms with one way out.
- Talking to someone teaches nothing until a second step: 138 talks, one taught anything.
- The country's own deep work is 131–171 minutes out.
- Nothing in the first hour gives a new verb by a lesson. Two came by a companion.

**Why expeditions open nothing.** Home ÷ spend is about 4–5 (`../sites/economy-now.md`). After a +500 trip, the only
purchases that change what a company can do are the glossary, a lantern and a hireling. Nothing in a town turns gains
into a new way into the world (WD-07).

**By kind of defect.**

| Kind | Defects |
|---|---|
| **Content** | One undertown; ten universal scenarios; origins that resolve to the nearest work; one prologue; no repair, inquiry-with-testimony or hunt-within-reach in the first hour |
| **Generation** | Terrain-only inheritance; one site recipe and one settlement skeleton; trade monoculture; the city a town; no relations between countries; the first country composed by accretion |
| **Presentation** | The first exchange is a greeting (BO-07); lines repeated (BO-02, 08, 09); wonders unsigned (BO-01, partly fixed) |
| **Navigation** | Wonders and deep works out of reach of the first hour; dead rooms (BO-05); a reason to travel (the dragon) that points at a country the player cannot yet survive |

## 4. One bounded implementation slice

This is the smallest change that can show an improvement in actual play: **one reference world** (Iscoed, three seeds),
in five steps, each landed and measured before the next.

1. **The atlas.**
   - `data/imbar/atlas.json` (Westernesse data) holds the three countries as facts.
   - `src/world/strategic-atlas.ts` (Westernesse generation, not the kernel) reads it for the listed seeds and feeds
     §2's paths.
   - A world not listed is drawn byte-for-byte as before. A spec holds a1's region digest unchanged.
2. **A diegetic opening in Iscoed.**
   - Three new origins, which bind only where the atlas's facts are held, so no other world's choices change. Each is
     a life already in the world, not a quest:
     - **Employment.** A hand at a salt-boiler's pans whose fuel boat is three days late. A practical undertaking,
       which leads to the smugglers' channel.
     - **Inheritance.** An aunt's eel-weir lease at the hamlet under the failing sea-gate, bringing kin, a possession
       and a debt to the reeve. This one leads to the repair.
     - **Obligation.** Come down with the Brynach drove, whose lead-drover the customs-men hold. A civic dispute and
       an inquiry, with testimony that disagrees.
   - Whichever circumstance begins the game, the other two are in the world as invitations (a person, a notice, a
     sight): **three distinct opportunities**. They differ in activity, the capabilities they reward and their
     consequences.
   - `circumstance()` is unchanged. These origins lead the library, so a reference world's first origin is one of
     them, and elsewhere the filtered list is as it was.
3. **The site: the Water-Wardens' sea-gate**, built on the existing great-cistern work and the deep levels.
   - The gatehouse, the sluice galleries, the drowned undercroft and the gate's mechanism.
   - **Clues:** the wardens' tide-marks and the last reeve's log.
   - **A secret:** the smugglers keep a gate jammed for their channel, which ties it to the inquiry.
   - **A key and its door:** the tide-table opens the lower gate at low water.
   - **Rewards:** bronze for the factor and the wardens' tide-lore.
   - **A consequence the world remembers:** the gate mended, jammed or left. At the dated spring tide the hamlet floods
     or does not. Its people, prices and description follow from that, and so does the reeve's standing with the
     company.
4. **The capability.**
   - **The fen-boat:** bought at the port (priced at a first trip's take) or earned from the reeve. It is a tool that
     opens the fen's water ways: an alternate way into the sea-gate, and the way to the country's wonder (BO-01).
   - **The salt-licence** from the reeve: a trade act that sells salt dear in Brynach and the city.
5. **The reason to travel.**
   - The salt road north to the city, where the Judges hear the toll and the Exchange sets the price.
   - The drove road west to Brynach, where the dragon is.
   - Both are told by people with reasons of their own and carried as a commission (the reeve's tally for the Tower of
     the Scales), and shown on the map only as heard.

Anything in steps 2–5 that Kyr or Deem cannot say is recorded as a finding, not written as bespoke TypeScript. Expected
findings are WD-03, the multi-terrain land; WD-04, the regional price; and the dated tide.

## 5. Evidence and tests

- **Seeded consistency** (`test/small/strategic-atlas`):
  - The same seed draws the same world twice.
  - The three reference seeds share the skeleton: names, seats, livelihoods, makers and roads. They differ in their
    drawn detail: people, minor settlements and sites.
  - A non-reference world is unchanged, held by a1's digest.
- **Cross-country variation** (`scripts/world-compare.ts`, new). It writes each country's profile: settlement sizes
  and trades, peoples, makers and works, creatures, merchants' stock and prices, scenarios placed, and what people say.
  - It measures the overlap (Jaccard) of trades, creatures, stock and scenarios between atlas neighbours.
  - The control is three pairs of neighbours drawn without the atlas.
  - The target is that atlas neighbours differ measurably more than the controls, and **not by prose alone**: the
    stock, creatures and scenarios have to differ too.
- **Discoverability** (the funnel). Each of the slice's opportunities is counted by stage, under the census's four
  walkers and by directed walks:
  - Exists: in the world's facts.
  - Reachable: a way from the start (`Journey.way`).
  - Perceptible: told or marked within the first 15 and 60 minutes.
  - Offered: an act on the page.
  - Executable: taken without refusal.
  - Realized: its outcome told.
  - Consequential: a fact that persists and is read later.

  The boredom census is rerun on the reference seeds against a1's baseline.
- **Economic consequence.** `scripts/economy-measure.ts` on the reference world: what a first expedition's take buys,
  and which acts and places that purchase opens (the boat's ways, the licence's trade).
- **Feature pins.** The matching `it.todo`s become real pins: a consequence remembered (`choice/consequence`), the key
  and its door (`world/exploration`), and a reason to travel (`world/`).
- **The blind editorial comparison and the reviewed playthrough** (`review-kit/`). These hold:
  - region dumps of six countries, the three atlas countries and three controls, with names masked to letters;
  - two transcripts of the slice played by the page's labels (`scripts/play-transcript.ts`);
  - one control transcript of a1;
  - the reviewer's prompt. The reviewer must group the regions, place the borders, say whether prosperity follows
    from livelihood, and judge whether the city reads as a centre. Then they play-read the transcripts for reasons to
    care about what happens next.

  The lead runs the reviewer; no agent is spawned here.

## 6. The next architectural implications

- **Generalize only what the slice uses, and only as relations.** These are:
  - containment, which `partOf` already is;
  - a place's population and livelihood;
  - routes between places and what they carry;
  - an institution's office and holder (the boundary report's recommendation, with CR-01's warden as the first case);
  - commitments made at install: the dated tide, the held drover.

  These are the abstractions a star chart or a network of planes would also need. None of them names a kingdom, a hex
  or an ancestry.
- **Keep within Westernesse.** The atlas's schema and data (`data/imbar/`); reeves, Rìs, salt-taxes and makers' arts;
  terrain words; the grid of countries; the reader (`src/world/`, already Westernesse generation by the boundary
  report's map).
- **For a later mission.**
  - The atlas for every world, with the recorded journeys re-recorded deliberately.
  - Strategic change on the calendar: rulers die, a road becomes unsafe, the dragon moves. Today only dated facts can
    do this.
  - A city generator: wards, institutions, the towers built. This waits on CR-02's two cities being reconciled.
  - Multi-terrain countries.
  - A strategic map view, which is page work and the lead's.
  - Sea routes across the Eastern Ocean.
  - The first country's 27 provinces placed by the atlas's facts rather than all in one country.
