# Module 1, exploration and wonder: THE NUMBERED HOUSE (an arcology)

*11 November 2026. Branch `adventure/fs-wonder`, from `adventure/first-steps`. Written storyboard-first (the method of
[storyboard.md](../storyboard.md) §5): every place has a dramatic function before it has a line of Kyr. Sections 1 to 5
were written before the module; section 9 (status) is revised against what was built and played. Nothing here decides
canon: the cause of the Mathematical Age's fall, any survival of its works and the Empire's relation to them stay open.*

## 0. What it is, and the question it asks

**The dramatic question: who is a house for, and who counts the people in it?** The Mathematical Age built a dwelling that
allotted its air, water, light and warmth by count. Every stair, every room and every body that passed under an arch was
numbered, and the House admitted the *counted* and queued everyone else. Nothing in it is a monster in the ordinary
sense: its keepers are bookkeepers that have outlived their books. The chief hazard is to be taken for something the
House has a rule for.

The premise (canon rule 1 of `doc/imbar/02-history.md` §2: one hypothesis per work): *a dwelling run by census*. Rule 2,
*its people were people*: there are tenants' marks on door-posts, a quarrel scratched into a tablet about whether the
Roll belonged to the Proprietors or the Residents, a dwelling someone left in a hurry with the kettle on its hob.
Rule 4 of the Fall (ecological, not treasure): the House still runs *water* and *light* and, above all, *counting*; what
it has stopped doing is deciding anything. It is dull, as the Long Man's wall is dull.

**Rival readings, never settled.** It was housing (the Tenants' Row, the Roots that fed it, the laid table); it was an
*answering* engine (the Question Hall, the Reckoning Room's ceiling of the sky, the disc); it was a vessel (the Ledge
shows a curved wall of rusted metal under the green, and the Aeneans' note on it says "HULL" crossed out, "HILL" written
over). The Aeneans surveyed it, wrote a tablet that the road must go round and no stage be built, and left their chalk.
Later a monastic party cut a ladder, then cut it down again. This decade someone has been in with a lantern and left a
tin. None of the three agrees about the stair. Nothing says what the Quiet Floor is *waiting for*.

**Where it stands.** Beside the old paved road, where the straightest road in the country bends once, eight miles
round nothing visible: a hillside of tumbled green. The generated site that is the Bend is, in the world's own terms,
`the fallen walls` (a `ruin`), named by the folk. The House is installed as a *standing scenario*
(`data/scenarios/standing.json`), so every first country has one (section 7).

## 1. Map

```
 the Bend (road, milestone, fallen walls)  ·····culvert (hidden; swim, then dark)·····┐
   │                                                                                  │
 the Landing ──(climb)── the Goat Ledge (view: the hull)                              ▼
   │ brass doors                    │ (climb)                                  the Sluice-race
 the Lodge  [THE COUNT]             │                                                 │
   │ the Stair That Counts          │                                                 ▼
 the Terrace of Tiers ◄─────────────┘                                    the Drowned Level ── valve gallery
   ├─ Tenants' Row ── a dwelling                                                │ (drained: door)    [WATER]
   ├─ the Hanging Garden (pollen; the Gardener) ── waterfall                    ▼
   ├─ the stalled lift (cage: the salvager) ═══ the foot of the Great Void ──► the Roots ── the glowing pool
   │                                          (owlbear)                          │            the seed-vault (air)
   └─ the Counterweight Gantry                                                   │ (gardeners' stair, hidden)
        │ Bridge of Weights: near · middle · far                                 ▼
 the Question Hall [THE HUM] ── the Drawer Gallery ──(ladder)── rim of the Void  the Service Way ─► [shrine at town]
   │            ╲ the Keepers' Bay (the Marshal)                                  ▲
 the Reckoning Room ── the Ring-walk (roof: view)                                │
   │ the disc (noon, or a mirror at night; only the counted)                      │
 the Quiet Floor ── the laid table  ─────────────────────────────────────────────┘
```

Places (33): Bend, Landing, Goat Ledge, Lodge, Stair (a way), Terrace, Tenants' Row, the dwelling, Hanging Garden,
Gantry, three places of the Bridge, rim of the Void, foot of the Void, the lift cage, Question Hall, Drawer Gallery,
Keepers' Bay, Reckoning Room, the disc, Ring-walk, Drowned Level, valve gallery, sluice-race, the Roots, the glowing
pool, the seed-vault, Quiet Floor, the laid room, Service Way, the cliff door. Loops: Terrace ⇄ Bridge ⇄ Hall ⇄ Drawer
Gallery ⇄ Void rim ⇄ Terrace; Terrace ⇄ lift ⇄ Void floor ⇄ Drowned ⇄ Roots; and the shortcuts the company makes (the
lift once mended; the Service Way to the town's shrine once opened from inside).

## 2. Dramatic function of each place

| Place | Does this to the player | Painting (existing, dormant until now) |
|---|---|---|
| Bend | **Orient and warn.** The road bends round nothing; a milestone with two counts, the second struck through; the carters' dish; the brook under the road-wall (the culvert) | site ground |
| Landing | **Reveal three visitors.** Aenean chalk (nine and one led, ten admitted; the ass kept out), a monks' ladder cut down, a fresh lantern-tin; the posted limit of the Bridge, in numerals, as the survey copied it; the Prefect's tablet of the detour | – |
| Goat Ledge | **Wonder, and a second way.** The flank of the hill is not a hill. A goat on a balcony says a stair is sound | `scene-ruins-starship` |
| Lodge | **Teach the House's grammar.** The Usher, the post, the question "ARE YOU COUNTED?": the first rule (heads, including the led) | – |
| The Stair That Counts | **First puzzle with a cost.** Treads that sound; a sequence, learned from chalk, wear, or a tablet | – |
| Terrace | **Scale.** The tiers climb a cliff; ivy; a waterfall from the fourth ring; every door numbered | `scene-ecumenopolis` |
| Tenants' Row, the dwelling | **People were people.** A quarrel on a door-post, children's heights in numerals, a kettle; the second reading (housing) | – |
| Hanging Garden | **Beauty that is a hazard.** Bell-lilies breathe sleep by day; the Gardener keeps them | `scene-enchanted-glade` kind |
| Gantry, the Bridge | **Weight.** Chains as thick as an arm; a deck that tilts; the posted limit | `scene-ruins-arcology` (the Bridge) |
| Void rim, foot | **Vertical wonder, danger below.** A hundred-foot well of light; what falls lands here | `scene-ruins-arcology` |
| The stalled lift | **A person to save, a shortcut to mend.** The salvager (his lantern-tin); the governor is elsewhere | – |
| Question Hall | **The House answers, at a price.** Five tablets by their engraved devices; the hum rises with every answer | library/archive |
| Drawer Gallery | **A lock that is a number.** The ring; the monks' crossed-out guesses; the governor, the Roll | archive |
| Keepers' Bay | **The formidable thing, asleep.** A soldier of springs with a key in its back | – |
| Reckoning Room | **Time as a key.** At noon the shaft of light falls on the bronze ring | celestial/observatory kind |
| The disc | **A rule of the House made flesh:** it rises for the counted | `scene-floating-disk` |
| Ring-walk | **Wonder.** The drowned installation under its ring | `scene-ruins-installation`, `-bridge` |
| Drowned Level, valve gallery, race | **A world with water in it.** Three wheels; what the town gets | waterworks/cistern |
| Roots, pool, seed-vault | **Light and air as resources.** Glow to read by; sealed air; a crystal that burns without oil | crystallarium, pool |
| Quiet Floor, laid room | **The only place that has been kept.** A meal for the counted; a spoon that is not yours | dining/great hall |
| Service Way, cliff door | **Return.** Eleven miles of lamp-niches that follow the water to the town's shrine | – |

## 3. The House's grammar (what a player can learn)

1. **Count.** The House counts heads under the arch, *those you lead as well as those you are*. Animals are not heads.
2. **The permitted** are the counted. The counted are tolerated by every keeper, always, and may ride the disc.
3. **Noise is a number.** Every answer a tablet gives, every wrong key, raises the *hum*. At 4 the Hall's keepers step out
   of their niches and stand across the arches (a barred way, no blow); at 6 they turn on you; at 8 the Marshal wakes
   and comes. The hum falls one an hour. Being counted (or holding the Marshal's key) makes every keeper tolerate you; the hum itself stays.
4. **Weight is a number.** The deck takes `limit` a head; the counterweights add to the limit.
5. **Light is a time.** The Reckoning ring takes the sun at noon, or a mirror's light at any hour.
6. **Water is a wheel.** Three wheels; each is one thing, and each has a consequence outside the walls.

## 4. Mechanisms: clue, operation, consequence

| # | Mechanism | Clue | Operation (public control) | Consequence / recovery |
|---|---|---|---|---|
| 1 | **The Count** (Lodge post) | Landing chalk: "nine and one led, ten"; Usher's greeting | "Give the post your number: N"; or climb the Ledge; or fight | wrong: hum +1, the Usher warns (patience one watch), retry; right: counted, tolerated |
| 2 | **Stair That Counts** | chalk numerals (lore), tread wear (perception), a tablet (Hall) | strike three plates in order; wedge with a crowbar; climb the shaft with rope | wrong note: hum +1, progress resets; unstilled stair hurts each crossing |
| 3 | **Bridge of Weights** | numeral plate; abandoned packs at the near end; the canted deck's lean | cross light; spread the load; wind the counterweights; climb the chains | overweight: the deck cants, the company slides back hurt; the deck rights itself in an hour |
| 4 | **Hanging Garden** | the Gardener's talk; lilies shut at dark | cross at night; tie wet cloth; ask the Gardener | sleep for an hour (the owlbear, the salvager and the clock do not wait) |
| 5 | **Question tablets** | five engraved devices | "Ask the tablet marked with …" | each answer: hum +1 and an hour; teaches stair order, limit, ring, count, and "the question is not permitted" |
| 6 | **The hum** | the Hall's description grows with the number (a steady note, glasses ringing, oil trembling, a bell) | wait an hour a step; be counted; or leave the Hall | 4: keepers bar the arches; 6: they turn; 8: the Marshal wakes and comes |
| 7 | **Drawer ring** | monks' guesses; a tablet's answer | turn a notch; press it home | wrong: jams an hour, hum +1; right: the governor and the Roll |
| 8 | **The failed lift** | the cage's state; the salvager | fit the governor, free the cage | persistent shortcut Terrace ⇄ Void floor |
| 9 | **Bronze ring** (Reckoning) | the room's light by the hour; the surveyors' mirror | turn the ring at noon, or throw lamplight with the mirror | the disc rises |
| 10 | **Disc** | "take only what was counted" cut round its rim | step onto the disc | descends to the Quiet Floor if counted; otherwise it will not stir |
| 11 | **Wheels** (valve gallery) | plan on the wall (lore) or trial | turn the town wheel; the drain wheel; the garden wheel | town spring runs / Drowned Level drains and opens the Roots door / waterfall stops |
| 12 | **Seed-vault** | foul air in its door; a vent-wheel | open the vent first, then the door | bad air hurts (con save) until vented |
| 13 | **Laid table** | a kept place for each counted head | accept the meal; or take a spoon | counted tenants are fed and rested; a pocketed spoon is *owed* |
| 14 | **Service Way slab** | the plan; draught from the far end | lift the bar from inside | a way to the town's shrine, for good |
| 15 | **Culvert** | hook ("an arch where the brook runs out under the road") | search at the Bend; swim | enters at the sluice-race, in the dark, in water |

## 5. Encounters (levels are the company's)

| # | Encounter | Kind | Level range | Ways through |
|---|---|---|---|---|
| E1 | Ledge-goats and ravens | information | any | they say what is sound |
| E2 | The Usher (automaton, Lodge) | negotiation / fight | 1-3 (fair at 2) | be counted; talk; or fight |
| E3 | The Gardener (a dryad) | negotiation | any | she opens the beds for those who do not cut them |
| E4 | The owlbear at the Void's foot | avoidance / fight | 3-5 | don't fall; lure it with the carrion at the rim; rope past |
| E5 | Eels and pike (Drowned Level) | hazard / fight | 2-4 | drain the level, or wade the walkway |
| E6 | The salvager | rescue / bargain | any | free him; bargain for the shrine's lamp; leave him (he is counted by the cage) |
| E7 | Three automata (the Hall) | tactical fight / avoid | 3-5 | keep the hum below four; be counted |
| E8 | The Marshal (clockwork soldier, **deadly at any level**) | avoid / reason / disarm | 5+ to fight | never wake it; be counted; pull the key in its back while it sleeps |
| E9 | Beetles and a slump (Roots) | fight | 2-4 | the pool's light drives the beetles; the slump is slow |
| E10 | The Host (Quiet Floor) | negotiation | any | accept, or refuse politely |
| E11 | The counting figure on the town green (outside; a consequence of writing in the Roll) | avoidance | any | wind it down with the Marshal's key |

## 6. Consequences that leave the walls

1. **The town's spring** (`spring` at the green): runs again if the town wheel is turned; the priest tells you what it was worth.
2. **The shrine's stolen lamp-chain:** the salvager took it; return it to the priest.
3. **The Service Way** opens a stone in the town shrine's floor: a permanent road in and out.
4. **The night count:** whoever writes the company's names in the Roll in chalk (the cheap way to be counted) has reopened it, and a figure of brass walks to the town green after dark to count the sleepers, until it is wound down with the Marshal's key.
5. **Counted, tenant, and owed:** the company is on the Roll; the House's return greeting differs; a pocketed spoon is a debt.
6. **The Prefect's tablet** (an item): the Office of the Road's detour order, carried out; its two readings (a fence, a claim) remain.

## 7. How it is installed (verified in code, not assumed)

`data/scenarios/standing.json` is read by `WorldAssembler.assemble` and handed to `settle`, which places every standing
scenario *after* the drawn ones, with `placeable()`; there is no limit on how many. A scenario's `places.<role>.site`
generates a new site when none is free (a makers' work is never taken: `!w.work`), here a `ruin`. The site is laid by
`Atlases.place` in the wild country, with a track from the nearer of the settlement and the nearest road
(`RegionSites.start`); a settlement `near:` it is bound; hooks are told by that settlement's keepers and by its
neighbour along the road. See the status table for what each seed shows.

## 8. Variation through Kyr and Deem

Each country draws (`data/situations/arcology/tables.json`, `templates.json`): the Usher's voice (chime, rasp, hush)
and the greeting its words keep; the stair's sequence (three patterns); how the water stands by terrain (marsh: high,
the Drawer Gallery's lowest rows awash; desert: low, the cisterns dry and the pool a crust); how much the garden has
taken the Terrace (forest: heavy); the salvager's name and calling (the names data); a number rolled at install for
the drawer ring. The layout, the grammar and the dangers never change.

## 9. How to run it, and what was built

**Running it.** A company that comes to the nearest town's taproom (the walk from the first town is an hour in `thorn`, five hours in `a1`, eleven in `d4`, fourteen in the reference country `kahitude`) can ask about "the bend in the old road", "the hum in the hollow" and "the arch where the brook comes out"; any of the three names the fallen walls, and the first leads the page as an aim. The Landing is ten minutes in from the road. Allow two to three hours for the Lodge, the stair, the terraces and the Bridge; a company that wants the Hall's answers, the lift mended, the disc and the Quiet Floor should expect a day. The module is **level 2 to 6**: the Landing, Lodge and Terrace are fair at 2; the Hall, the Void's floor and the Roots at 3 to 5; the Marshal is *deadly at any level* and is meant to be left asleep, reasoned with (by being counted) or disarmed (by a quiet hand).

**Intended approaches.** Count (honestly, or by the Roll in chalk), climb (the Ledge), swim (the culvert), or fight the Usher. Cross light, or wind the capstans, or climb the chains. Cross the garden veiled, by night, or with the Gardener's leave; or turn her water away. Ask the tablets sparingly (five answers is quiet; the eye is not); or be counted and be quiet however loud. Mend the lift, or rope down. Come back by the Service Way, or the cliff door.

**Retreat and return.** The Bridge, the stair and the Lodge are all one door from the Landing; a company the Hall has roused can leave across the Bridge and wait an hour; the Service Way and the lift are the shortcuts the company makes for itself, and stay made.

**Built (IMPLEMENTED).** 30 places (the Bend, the Landing, the Ledge, the Lodge, the Terrace, Tenants' Row, a dwelling, the Garden, the Gantry, three places of the Bridge, the rim, the lift cage, the floor of the Void, the Question Hall, the Drawer Gallery, the Keepers' Bay, the Reckoning Room, the Ring-walk, the Drowned Level, the valve gallery, the race, the Roots, the pool, the seed-vault, the Quiet Floor, the laid room, the Service Way, the cliff door), in six levels, with the stair, the Bridge's chains, the lift shaft and the disc as ways of their own; 18 mechanisms (Count, plates, deck and capstans, blossoms, tablets, hum and keepers, drawer ring, lift, bronze ring, disc, three wheels, vent and vault air, laid table and spoons, beam and slab, culvert water, the Roll, the Marshal's key, the counting figure); 12 encounters; 7 consequences outside the walls. Files: `data/scenarios/arcology.scenario.json`, `data/situations/arcology/{module.json, house.kyr, entry.kyr, tiers.kyr, halls.kyr, deeps.kyr, kept.kyr, world.kyr, tables.json, templates.json}`.

**What is not built.** The Prefect's tablet is carried out as a document and teaches `detour_order` but nothing outside the House reads it yet (it is a thread for a later campaign: the Office of the Road and its two readings). The oldcoin scholar is not tied in (the scenario `links` would need its module to export its scholar). The Ring-walk's drowned city is a view only. The seed-vault and the Roots' beetles are small. A painting of the laid room and one of the Lodge are wanted (the existing paintings are used where they fit; see the commission list below).

**Paintings used** (`data/paintings/scenery.json`, `places`): `scene-ruins-starship` (the Ledge), `scene-ecumenopolis` (the Terrace), `scene-ruins-arcology` (the Bridge's ends, the rim), `scene-ruins-installation-bridge` (the middle of the Bridge), `scene-ruins-installation` (the Ring-walk), `scene-floating-disk` (the Reckoning Room), `scene-cave-falls` (the foot of the Void), `scene-cistern`, `scene-waterworks`, `scene-sewer-drain`, `scene-jungle-falls`, `scene-glowing-pool`, `scene-library`, `scene-archive`, `scene-enchanted-glade`, `scene-mine-pump-room`, `scene-undercroft-dark`, `scene-undercroft`. The five held paintings (arcology, installation, starship, ecumenopolis, floating disk) and the two construct kinds are removed from `dormant.json`. *Wanted:* a laid table in a room with no corners; the Lodge's lane of brass posts.

## 10. Verification, in three kinds

**Implemented** is section 9. **Automatically verified** (`bun test test/arcology.test.ts`, __N__ tests; lint of the module in seven seeds with no finding; `bun run lint`; `test/traces.test.ts`, `decision-frame`, `scenery-kinds`, `page-paintings` pass with the one kept trace re-recorded):

- installed, on a site generated for it, in `kahitude a1 b2 thorn c3 d4 kite`, told by two towns' keepers in three rumours;
- walked to from the first town by the page's own `>place` (a way at a time; one hour in `thorn` to fourteen in `kahitude`), the rumour asked at the nearest taproom, and the aim leading the page;
- every mechanism of section 4 played by its public control, including the failures and the recoveries: a wrong count (twice: the Usher comes), a wrong plate (hum and reset), a tipped deck (back to the near end, righting in an hour), sleep in the garden (and its three cures), the hum climbing and the keepers standing down, a jammed drawer (an hour), a disc that will not rise for the uncounted, dead air behind a vault door;
- each stair order is true in exactly one of three hands in each country tried, and the Hall's tablet gives the true one (four countries);
- the persistent consequences: the town's spring running and failing again with the wheel, the priest paying for the news, the lamp-chain, the slab and the shrine, the Roll and the counting figure wound down with the Marshal's key, tenancy and the spoon owed and settled;
- three machine-played transcripts (`transcripts/arcology-*.txt`).
Where a spec sets the company down with `Placed.at` it is to skip a walk, never to bypass a mechanism; where it asserts a fact (`counted`, `following`, a mended lift) the mechanism that makes it so has its own spec.

**Experienced.** Nothing here has been played by a person. The author-engineer read the page as told in scripted sessions (the transcripts) and corrected what read badly (the Usher's warning that never came, the keepers who attacked at once, a spoon that could not be settled, a veil nobody could buy). That is not the independent play the trail says is the only proof of enjoyment (page 8).

**Not verified, and why.**
- No fight with the Usher, the keepers, the Marshal, the owlbear, the eels, the beetles or the slump was played to its end; the tiers were chosen from `data/catalog/challenge.json` (Usher and keepers: automaton 1 to 4 on the warrior scale; Marshal 8 to 12; owlbear 1 to 6; slump 1 to 4) and `bin/kyrie forecast` takes a campaign, not a generated world.
- Whether the brass figure at the green is frightening, or only odd, at night; whether the Quiet Floor is eerie; whether the Count is a puzzle or a chore. Those are a player's to say.
- The paintings were mapped and the painting specs pass; the pages were not looked at in the browser.
- The drawn variation was exercised in seven seeds (forest, marsh, mountain). Frost and desert load and place the House (`bin/kyrie world kahitude --terrain frost` and `--terrain desert`) but their draws were not played.
- The oldcoin scholar is not tied in (see "What is not built").
