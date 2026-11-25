# Trust contracts: investigation and state

The owner's commission (18 November, late) is kept verbatim in trust-contracts-brief.md; its follow-up the same night
asks that a false Atlas indicator be **unconstructible**, not merely tested against. This file says what was found,
what is built, and what each contract's pin is.

## 1. What was found

### Gold that vanishes at its destination (priority 1)

Measured by `bun scripts/gold-continuity.ts` (a player who follows an aim and takes only its gold, through the
runner, every turn): nine walks over a1 (order, debt, wanderer), b2 (courier), c3 (wanderer), iscoed (human warrior,
elf mage), kite (order) and thorn, 60 turns each, 106 gold acts taken. Three distinct lapses, each the same cause:

| Walk | Gold taken | Came to | The lead there | What the four held |
|---|---|---|---|---|
| a1, debt | Set out for Ironkeep | Ironkeep's mouth | here → Ironkeep | "Into the gate-passage", as exploration only |
| b2, courier | To the counting-room | the counting-room | barred → the iron door | nothing that acts on the door |
| iscoed (both) | Search here | the gate-well | here → the gate-well | nothing: searched, the pawl not found |

**The common cause.** Gold and the lead are reckoned apart. Gold is a promoted act's undertaking aspect, from its
reasons (advance, named, toward, about…: the route planner's reading of what the aim names, Glance.reading); the
lead (AimLeading: the resolved objective-target machinery, Stakes.target) says what the step is. They agree on the
road and part where the step is not a thing the planner names: the inside of a site the aim names as a whole, a bar
with nothing to do to it, a place whose search found nothing. There the lead still names a step and nothing carries
gold, and nothing says why.

### False or stale pips (priority 2)

Every rail pip, row pip, likeness pip and map mark is drawn by `Pip.View({ fill })` or ChoiceRow's `mark` string: a
colour chosen by the page. 38 places in web/reader pick a tone (`Pip.tone(aspects)`, `var(--tone-…)` strings); the
aspects they read are the glance's, but nothing makes them, and the page could draw any colour. OR-73 (17 November)
derived the rail's pips from the drawer's rows; that held by care, not by construction. The map's way back ("Put away
the map") drew no pip at all, whatever the place held; the Book's unread pip was blue or violet, an Atlas tone for what
is no opportunity.

## 2. The architecture: an indicator needs a witness

`src/presentation/attest.ts`:

- **Witness**: issued only by `Attest.index(glance)`, from what the glance projected for this world, place,
  knowledge and aim followed: an act it leads with or a lens holds (direct), an act inside an opener (direct), a
  likeness (direct), a way or journey the followed aim goes by (directional, gold), something perceived off along a
  way (directional, its distance kept). Its type is branded: nothing else makes one.
- **Attested**: an indicator, made only by `Attest.of(witnesses)` or `Attest.join(indicators)`: its tone by
  Indicator's one precedence, its words, faint where all it stands on is perceived afar, and its witnesses kept.
  No witness, no indicator.
- **Renderer**: `Pip.View` and `ChoiceRow` take an `Attested`, never a colour; every rail mark, row, likeness, map
  mark and menu row, the things at hand and the talk's replies, draw from one (the 38 places that chose a tone did). A row that is no opportunity says
  which plain kind it is (neutral, chosen, a fight's blow, the title's): a fixed set, none of them an Atlas tone.
- **Cache**: the index is kept for each glance object, and a glance is drawn again whenever the world (a new World
  object), what the company knows, or the aim followed changes; so a witness is never older than the state it reads.
- **Diagnosis**: `Attest.why(glance, id)` says why an id has no indicator.

## 3. The contracts and their pins

Carried as beta commitments (closeout.md, 21 November): knowledge integrity, restoration and travel continuity are
first-class contracts of M22-beta (Integrity and Trust), not open notes of this investigation.

| Contract | State | Pin | Its counterexample (fails the pin) |
|---|---|---|---|
| **Indicator soundness**: no pip without a witness | built, by construction | test/small/indicator-witness (structural: no Atlas tone written outside the indicator's own drawing, the legend, and what an indicator already says; the brand cast nowhere but `attest.ts`; Pip and ChoiceRow take an `Attested`); test/small/witnessed (behaviour) | `<Pip.View fill="var(--tone-gold)">`, `mark="var(--tone-gold)"` (the "your aim" row had been gold for any act the place led with), a likeness pip composed from acts (PL-32), a reply drawn from a snapshot |
| **Indicator freshness**: pips follow the state | built | test/small/witnessed ("goes the moment its opportunity does"); the index is kept per glance object, which is drawn again on every change of world, knowledge or aim | the talk page's replies drawn from `s.turned`, the glance as it was when the talk was turned to (removed) |
| **Lens inheritance**: a control's pip is its rows' | built | test/marks-borne (the drove road, every act: Go and Look against their drawers); SceneRail.go/look are `Attest.of` over the witnesses of the very rows the drawers draw (Wayfinder.bears, AtHand.bears) | a rail tone from the promoted lens instead of the rows shown (OR-73) |
| **Return inheritance**: the way back carries the place | built | test/small/witnessed ("carried back from a view"): `Attest.local`, the map's way back and "Put away the map" both read it | "Put away the map" blank beside a place with something to do; its red chosen by the page's own reading of danger |
| **Gold continuity** | built | test/small/aim-continuity; `scripts/gold-continuity.ts` over nine walks (0 lapses) | a1's debt gold gone out at Ironkeep's gate; b2's at the strongroom door; iscoed's in the gate-well |
| **Travel continuity** | partly: interruptions (G) fixed; legs traced (E), three gaps registered | test/travel-continuity (every leg a move, a cost, what is known, and a hurt stopping it on its leg; a pedlar told in passing); test/journey-brought (what each leg brought told with the journey, in every client); `scripts/travel-census.ts`; see Travel below, TR-01..TR-03 | a journey stopped by a butterfly; a stop that led to nothing (7 of 24 before) |
| **Knowledge integrity** | built for fragments (OR-524); across walks to do (OR-534) | test/small/knowledge-noninterference: two worlds differing only in what the company neither knows nor perceives (a hidden person, an undiscovered way, what a topic would reveal) give the same frame, until it is learnt or seen | someone unseen by the company listed among those there and talked to (fixed: noticed reads unseen) |
| **Restoration** | to do | | |

### The Book and Gather Your Thoughts (D): a recommendation

- The Book is a record, not an opportunity. Its unread mark is now a count in ivory (test/small/book-unread), never an
  Atlas tone. Recommendation: move it off the action rail to a reference place of its own (beside the map's mark, or
  the page's corner), so the rail holds only lenses on what can be done now.
- **Gather your thoughts** fits as a lens over the company's own acts that take no place: preparing spells, studying,
  recalling what it knows of a thing, and deductions. A deduction must be an authored or systemic inference over facts
  the company knows (Kyr already has `teaches` and rules that assert knowledge when facts hold); the lens would show
  only those whose premises are known and whose conclusion is not, each witnessed like any act. Nothing is created by
  pressing it. Recommendation: no implementation until the rail is settled; the Time lens (`glance.lenses.time`) is
  where the company's own acts already gather, and it is the natural seed.

## Travel

The owner's sections E (travel as an authoritative sequence of perceptible steps), G (meaningless interruptions) and,
as measurement only, F (travel cost). Register rows TR-01 (E), TR-02 (G), TR-03 (F): `open-register.md` §57. (The
commission's own ids, TC-01.., were taken: the TC family is the test architecture's.)

### E. What a journey is, traced

A journey is `travel:<place>` (the map's set-out, the terminal's and the runner's): `PlaySession.leg` or
`EngineHost.travel` call `Travel.go`, which lays the way once (`Itineraries.plan`) and takes it a leg at a time, each
leg the ordinary command the page offers for it (`go(passage,place)`), conferred the right to cross a hex boundary
for that one command (`Campaign.crossing.travelling`, `Crossing.bound`). A leg is then one campaign command:
`WatchLoop.watches` spends its minutes (`ActionTime.minutes`: the passage's `travelMinutes`, doubled when laden, by
the slowest member's speed), a watch at a time; for a leg of two watches or more the company departs at once
(`Journey.depart`: `enRoute`, at no place), the world runs every watch (people act, rules fire, needs come on,
`Engagement.foe` and `halt` are tried, a way gone impassable turns it back), and it arrives for the last watch. After
each leg `Travel.interrupted` reads the world as it now is and stops the journey or lets it go on; where the way
ahead turns out to be water, it is laid again (`Overland.found`). A march-stone crossed draws the next country
(`Frontier.expand`, inside the command). So, for each leg:

| Contract | Held? | Where |
|---|---|---|
| The company's true location updated | yes, at the leg's end (`at`), `enRoute` between | `Journey.depart/arrive` |
| Time advanced by the leg's cost | yes, watch by watch | `WatchLoop`, `ActionTime` |
| Fatigue, provisions, travel effects | yes, as rules of the watch (`needs.kyr`: a ration a day, weary after 18 hours) | `CampaignTick` |
| Perception and map knowledge from the new location | yes for a hex of open country; **no** for a road: see below | `LandModel.known` |
| Progress shown through the route | **after the fact** on the page: see below | `ReaderApp.walk`, `JourneyCourse` |
| Interruptions with the world state at that step | yes: per watch inside the leg, and per leg after it; nothing is rolled up front | `WatchLoop`, `Travel.interrupted` |

Where it is not so:

1. **The page walks the journey after it is over, over the map as it was before setting out.** The page sends one
   `travel` request; the engine makes every leg and replies with the last frame; the page then walks the mark over
   the *starting* frame's map (`ReaderApp.walk`, `JourneyCourse.of(before, after)`) and swaps in the final one, so all
   that was learned on the way (each hex's ring, the land seen) appears at once when the walk ends; and where the
   journey crossed a march-stone (the land's width or cover changed) there is no walk at all, a plain jump. The walk
   is true to the way gone (`test/route-drawn`), and the map is never ahead during it, but it is a replay, not the
   journey as it is made. Tried and taken back: each leg posted to the page as it is made (`{ kind: 'leg', frame }`)
   and walked from where the company was, the map then that leg's own. The board is made again whenever its land
   changes (`BoardField`, keyed by the drawn land), so every leg remade the WebGL board and its walk waited for it:
   kite's walk to Brockfield outlasted `test/board-browser`'s thirty seconds. Open (TR-01): the board taking a land
   that has grown without being made again (a reveal of cells, as `show` takes a course), then the legs streamed.
2. **A road leg goes all its hexes at once.** A country's road is two passages (out to its middle room, `…_way`, and
   on), each one command of hours: iscoed's road to the Tolleth gate is one leg of 230 minutes over seven hexes, the
   Ossel delta's one of 480 over fourteen. For those hours the company is `enRoute`, at no hex: nobody between the
   ends can meet it (`Engagement.foe` needs `at`), the land along it is not seen from each hex, and the one point of
   perception and interruption is the far end. Census: 40 of 114 moving legs went more than one hex, holding 130 of
   204 hexes travelled. Open (TR-01): the fix is a road walked a hex at a time, its own pace kept (the tracts on every
   road cell exist: each could be the road's stop, or the watch loop could carry the company along the road's course
   watch by watch); either changes every world's road legs and every kept walk on a road, so it wants the lead.
3. **A road is one place, and the map knows the whole of it once the company is on it.** `LandModel.about` reveals
   every cell of a road place visited and the ring beside it: on a1 the second leg, onto the road between Lowmouth and
   Mistshaw at its middle room, made known hexes three beyond where the company turned off it into the open country
   (26, 27, 47, 66, 67). The map is ahead of what the company has come near. Open (TR-01): knowledge of a road wants
   the cells walked, not the place; pinned as failing.

### G. Interruptions, measured

`bun scripts/travel-census.ts [world/race/calling,...] [--journeys N] [--json]`: from where a life begins in a1
(human warrior), b2 (elf mage), kite (dwarf cleric), thorn (human ranger) and iscoed (human warrior), the three
journeys of six to eight hexes the map lays to named places and three to stretches of open country at bearings apart,
each made as `PlaySession.leg` makes it and set out on again after every stop, fights fought by the company's
tactics. Each stop classed (mandatory: fight, hurt, a way that will not let it by, danger, night, weariness, hunger, a
changed route; discovery: something staged come to; incident: something said there) and whether it led to a decision
(`Travel.weighty`: an act there for an aim, a gain, a danger, a marvel or someone's company, or a sign), danger or a
discovery.

| 28 journeys, 151 legs | before | after |
|---|---|---|
| stops | 24 (0.9 a journey; one every 6.3 legs) | 7 (0.25; one every 21.6 legs) |
| over the 14 open-country journeys | 20 (1.4 a journey) | 5 (0.36) |
| told on the way, not stopping | 0 | 12 |
| "There is danger here" for a beast at home | 7 (a butterfly twice, a curlew, a fox, a hedgehog, a monkey, an otter) | 0 |
| a pedlar's wave far off, a shepherd's whistle | 7 | 0 (told with the leg) |
| "Something is going on here" (a hayward's word, woundwort) | 5 | 0 (told with the leg) |
| a toll across the road ("Pikes come down across the road") | 1 | 1 |
| water across the way, the way laid round it | 4 | 6 |
| stops that led to nothing | 7 | 1 |

What was wrong: `Travel.interrupted` stopped for anything said where a leg came (any `event` perception not a
companion's), anything staged there seen for the first time, and anyone here who could be attacked and did not
`tolerate` the company. Every country's animals are written to "let the company be" and "not stop a journey"
(`data/generation/wild/animals.kyrt`: no temperament, a lair where they stand), yet each was attackable, so each was
"danger"; a traveller on a sheep-track waving from far off was something said; a meeting whose one act was a word was
something staged.

Fixed, in `Travel.interrupted`, with the engine's own projection: something said or staged where a leg comes stops
the journey only where the place now offers something that asks the player (`Travel.weighty`: an act that is no way,
journey, wait or fight bearing undertaking, payoff, danger, wonder or companionship, as the glance's `Aspects` reckon
them; or a glance act led for a sign, a thing unlooked at, an answer or a warning). Otherwise it is kept on the leg
(`Journeyed.legs[].passed`) and told with it, and the journey goes on. Danger is no longer a beast at home with no
temper, or a wary or tame one (`Travel.lets`: a lair and no temperament but wary/tame). A fight, a hurt, a barred way,
night, weariness, hunger and a changed route stop as before. The toll still stops (paying it is a decision).

Then the water re-route: water found across the way ahead, where a way round it is known, is told with the leg ("the
way on goes round it") and the journey re-plans and goes on; it stops only where no way round is known ("you know no
way round it"), which asks the player for a decision. The census after: 1 stop in 28 journeys (151 legs), 16 things
told in passing, 28 of 28 arrived.

Still open (TR-02): what is told in passing leaves no mark on the map to come back to (an optional discovery should).

### F. What travel costs, measured (no numbers changed)

From the same census (minutes per hex travelled, by the cell come to):

| Going | Minutes a hex | Source |
|---|---|---|
| open fields (meadow) | 34 | `data/generation/scenes/tracts.json`: 30 |
| heath | 35 | 40 |
| wood | 61 | 60 |
| fen | 72 | 70 |
| the land the atlas marks `,` | 69 | |
| by road (all lands) | 44 | `RegionRoads`: the land's going, 30 minutes to the hour |

- A journey of six to eight hexes took 210 to 670 minutes (most 4 to 7 hours); one neighbouring hex 30 to 70. The
  time differs; nothing else does. In all 28 journeys **no ration was eaten, nobody grew weary or hungry**: a ration
  is eaten once in 144 watches (a day, `needs.kyr`), weariness comes 18 hours after sleep, and a day's journey ends
  before either. No rule found makes the weather change a leg's time. Water: a waterskin is sold, and nothing drinks.
- **A road is no faster than the land it crosses** (44 minutes a hex against 34 across open fields): its time is the
  ground's going (`RegionRoads.halves`), so a road's only advantage is that it is known and safe (no hex of it can
  be met on, item 2 above).
- Load: anyone carries 10 and twice their strength (`Burden`); laden, a company goes at half its pace
  (`belongings.kyr`, `ActionTime.laden`). The one beast in the catalog is the pack mule (`gear.json`: 30 coin at a
  chandlery, carries 30 more), which changes only capacity. No horse, donkey, cart or riding animal exists; the lance
  speaks of mounted combat and nothing mounts. `speed(member)` slows a company to its slowest, set only by a module.

Proposals (for the lead and the owner; none made):

1. Roads quicker than the land under them (say two-thirds of the ground's going), and the open country keeping its
   own; so a road is a real choice against a straight line through wood and fen.
2. Provisions by the march, not the calendar: a ration for each day's travelling (or each eight hours walked), and
   water where the land is dry; so a journey of a day costs a ration and a neighbouring hex nothing.
3. Fatigue by hours on the road as well as hours awake: a long march leaves the company weary at the end of it,
   which a camp or an inn mends; night travel slower and riskier.
4. Beasts as tradeoffs: the mule as now (capacity, a longer expedition, no faster; slower in fen and on the fells);
   a riding horse (quicker on roads and open fields, not in wood or fen, fed each day, held at the gate of a site);
   a cart (much capacity on roads only).
5. A reckoning before setting out, from what the plan already knows: the hours, the rations it will eat, and the
   known risks on the way (a ford in spate, a den heard of, the dark coming on), the unknown left unknown.

### The pins

`test/travel-continuity.test.ts`: on a1, a journey of six hexes over open country: every leg moves the company
to where the leg goes and from where it was, spends at least the leg's minutes, knows the cell it came to and
forgets nothing; a hurt that comes on the third leg stops the journey there (the counterexample a roll made up front,
or one put off to the end, fails); a pedlar seen far off is told with its leg and the journey arrives (it had stopped
there). Two failing pins hold TR-01's open half: the map knows nothing new more than three hexes from where a leg
comes (fails on the a1 road), and every leg is one hex (fails on iscoed's road). `test/wild-meetings.test.ts` now holds
a meeting met on the way to the new rule: stopped for where it asks something, told with its leg where not.
