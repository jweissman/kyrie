# The Road the Star Came Down: a five-act supermodule of the Corrow

*Written from four documents of campaign material (the setting, "The Corrow: A Setting for Imbar"; its epic-run
playtest; the sourcebook "The Corrow in 2731"; and a Player Portfolio of six read-aloud scenes). Designed first as a
spine ([spine.md](spine.md)), then written in Kyr (`data/adventures/let-one-remember`), then played headlessly by the
labels a player sees (`test/let-one-remember.test.ts`, 24 journeys, one of them the whole campaign in a single run of
415 steps). The critique and the friction of writing it are in [friction.md](friction.md). Spoilers throughout.*

In 412 the Lettings tried to forget the star in the Well and forgot only its name. Ninety years ago the star woke and
went up the road it came down, after the jewel that Wenna Coyle carried away. Now the floating mountain the Corrow
calls Hightown drifts on its chain toward the lake it was lifted out of. Its people's knowing is its weight. In the
grey country beyond the Seam the star's forgotten name is gathering itself to follow its body. And over the Teskarn
the slow star that came in 2593 is brightening.

| Act | Title | Places | What plays | File |
|---|---|---|---|---|
| I | **Let One Remember** | The Corrow: the Stake ruins, the Emptied Well, Hornwake and the Drag, the Socket, the Chain, Hightown, Keld, Wendhead, Wendmouth | Investigation and politics. Who is told what, and the balance of the mountain. Climax on Hightown's rim over the Socket | `clocks`, `scarp`, `well`, `hornwake`, `hightown`, `keld`, `wendmouth` |
| II | **The Grey Country** | The Margin: the grey shore, the drifts, Keld Hollow, the untitled library, the mountain's place, the fog of 2604, the gathering | Entered by being forgotten, left by being remembered: the anchors are the people helped in Act I. The Unsaid housed, sent, unmade or bargained with; the Open Hand's rite at the Seam | `act2_margin` |
| III | **The Kin Fall** | The Teskarn, the star's crater, and the Unfolded's road across the plateau to the Seam | A war against an army no spell can touch. The Forgetting of the Way Home held on the Drag by three hundred who can forget, at a price; Drevka's hammer and Wenna's band | `act3_kin` |
| IV | **Under Way** | Hightown as a ship: the helm, the rim, the cradles, the cloud sea, the burnt road, the Gate of Being | A needle cut from the horn; the Chain cast off; the mountain steered by memory up the road the star came down; an Arbiter of the Virina who opens to one | `act4_voyage` |
| V | **The Road the Star Came Down** | Beyond the gates of being: the unwoven country, the Nail's wake, where the road stops | Wenna Coyle, who forgot her own name to stay a thought ahead; the Nail, whole or not; the last choice: one keeps it, it is given back, none knows it, or you follow | `act5_road` |

104 rooms on three planes, 53 people and creatures, 78 topics, 42 actions and 92 rules and events, in about 2,100
lines of Kyr across twelve files.

### The adversary

The strategic adversary is the setting's own, made explicit. The **Unsaid** is the Nail's forgotten name, and it wants
its body. The **Nail** is the body, a thought behind the jewel beyond the gates of being. The **kin**, the new star,
are coming for both. Their human instruments are **Corin Webb**, a Settled Stray at a consulate desk, and the
**Open Hand**, a kind school of forgetting that is gathering the name's syllables out of mercy. What the company does
in each act decides what the next act holds:
- whom it helped (Act II's anchors);
- whether the name crossed (Act III's march, Act V's Nail);
- what the Corrow paid for the rite (Act III's price);
- whether Hightown is still aloft (Act IV's vessel);
- whether it brought home a stone of the mountain's place (Act V's last image).

### Play it

```sh
bin/kyrie lint data/campaigns/let-one-remember.campaign.json      # 0 errors, 0 warnings
bin/kyrie campaign data/campaigns/let-one-remember.campaign.json  # the terminal
bin/kyrie preview data/campaigns/let-one-remember.campaign.json   # the reader
bun test test/let-one-remember.test.ts                            # 24 journeys, about a minute
```

Each later act can also be started at its threshold with a company of the act's level:
`test/fixtures/corrow/act{2,3,4,5}/act*.campaign.json` (written by `test/fixtures/corrow/make.py`). The campaign is
on the title page as *The Road the Star Came Down*.

| Journeys | What they show |
|---|---|
| Act I (13) | The default four weeks; the Drag and the roster; the number bought with coal; the low road and the court's deeds; the secretary; the Grounders' hall; the sealed room; the climb; the Lettings' door; the chart and the lens; the Gaol and the Old Silver; the rim at the Socket |
| Act II (5) | The Unsaid housed in the reeve's empty house; unmade, with Hightown's place going home and the mountain falling; sent after its body; the anchors' voices running out; Teshen staying, a stranger at last. The default run continues to the Open Hand's rite and the name crossing |
| Act III (2) | Three hundred who can forget gathered from four peoples and the rite held on the Drag; Wenna's band broken before the Unfolded reach the Seam. The default run continues to the kin reading the band |
| Act IV (1) | The needle, the casting-off, the steering through four legs by altitude and bearing, the Arbiter, the road let go out of all but one |
| Act V (3) | Wenna's lens and her name, the charge taken and the mountain home; the Hush given back; the road let go out of every mind |
| One run | All five acts, from the cart on the Scarp road to the end of the road |

---

*What follows is the design of Act I, as first written; the spine has the rest.*

## 1. Act I: what it is about, and what it is not

The source offers four or five campaigns' worth of material. A module has to choose. I chose the sourcebook's era
(2731) and its largest situation, the balance of Hightown, and built the rest of the country around it as threads
that never require one another. The deciding reason was originality: three adventures already exist on other branches
of this repository, and the Corrow's 2601 era overlaps two of them heavily.

### Against the three other adventures

| Branch | Its core | What in the Corrow would have repeated it | What this module does instead |
|---|---|---|---|
| `hold-one-season-authoring`, *The Patient Star* | A fallen seed whose light stops time; a held king; a slowed body; mirrors moving gardens; a six-seat Concord voted on; a fastness coming down two metres a day | The Corrow of 2601 is a fallen star with thick time round it, the Collar, Peleth mirrors, a Concord, and Drevka still riveting in slowed time | Set in 2731, when "an hour in the Well is an hour". No slowed time anywhere. The mirrors are left as scenery. No council is voted on; the people who decide (Ruth Teake, Esk, Lene Tallow, Aron Fennimore) are moved one at a time by what they are told |
| `adventure/thrume`, *Thrume* | A descent through a body to a tomb opened by three keys gathered from three peoples; the Between under every sleep, where forgotten dreams fall and the Mouth eats them | The Margin, "where forgotten things go", with the Unsaid gathering them, is the Between with a different name; a descent to the Seam to stop it would be Thrume's last act | The Margin is never entered. The grey shore is seen once, with the lights out, and a Stray says one syllable. The Unsaid's thread is played on Imbar's side: a Settled Stray at a consulate desk, a man nobody can name in a hospice bed, and a Keld girl who cannot forget a face. No key-gathering; nothing is unlocked by collecting |
| `house-that-grows-authoring`, *The House That Grows* | The law of attention: a watched room is fixed, an unwatched one grows; doors open behind your back | The Corrow's first law, thinning (what no mind holds lapses), played as a room mechanic, would be the same law | In 2731 the scar is fading, so thinning is history and texture (Returns, blank stones, Tip at the gate), not a mechanic. The mechanic is the inverse: what one mind *comes to know* restores weight |

The module also keeps clear of the sourcebook's own known risk ("the mountain is so central that a referee may run
the sourcebook as a single countdown"): the Webb thread, the Keld Strays, the court's deeds, the Seam, the Chimed and
the Registry each play without touching the balance, and the balance can be settled without any of them.

### The idea it plays: telling is acting

The sourcebook's sharpest sentence is "Telling is acting. In the Corrow, information has physics." Every lever on
the mountain in this module is a person learning something:

- **The number.** The Registry, given heat, works the sum that nobody has asked it for: in midwinter one more link
  is the limit; two, and nothing rests. Told it, Ruth Teake stops the files; Esk of Harrow stops paying; Lene Tallow,
  who already knows that the cradles sit lower with every load, starts sending quarry stone up the hoists instead of
  wool down. Nobody is ordered to do anything.
- **The origin.** Hightown came out of the Socket. Any Counterweight who comes to hold that gives the mountain back
  a thousand tonnes and sinks it sixteen metres. The module offers "Tell {someone} where Hightown came from" for every
  Counterweight it can reach: a fifteen-year-old in the chapel, the Speaker, the Charge, the Grounders' hall, the
  people on the rim. The last two are crowds. One crowd brings the mountain down where it is; two drop it.
- **The method.** "Let one remember at a time," in Concord handwriting on a farmer's gatepost, or in Keld memory, or
  on the last plate in the sealed room. Given to Aron Fennimore, it becomes a roster: one Counterweight a day.
- **The name.** In the sealed room. Said on the rim, it is the strongest relation there is.

The company that learns the most is the most dangerous thing on the plateau, which is the setting's own first
principle.

## 2. The balance, as the module reckons it

The sourcebook's figures do not agree with one another (it says both that two midwinter cuts free the mountain and
that the tail rests with 4,300 t, the horn and one link; and that link 143's fall leaves 3,200 t). The module keeps
the quantities and their relationships and fixes one consistent set, which the Registry recites:

```
resting = links × 1,100 + horn 3,000 + 1,000 for every Counterweight who has come to hold its origin
          + ballast carried up by the hoists − lift
lift    = 154,000 t in the last of the autumn, rising 250 t a day to 158,500 t in midwinter
```

At 143 links the tail rests with 6,300 t on the first day and 1,800 t in midwinter; at 142, with 700 t; at 141, with
nothing. Twenty more Counterweights who hold the origin sink Hightown 320 m and the horn bites; a hundred and fifty
bring it down at a walking pace ("grounded"); four hundred and fifty, half of Hightown, close the relation and it
falls like the granite it is ("crashed").

Five great gales drive it toward the Socket (3.9 km): 400 m on a heavy tail (4,000 t and more), 800 m on a middling
one, 1,400 m on a light one, nothing once the horn has bitten.

### If the company does nothing

The sourcebook's eight weeks are compressed into four, in the same order:

| Day | What happens |
|---|---|
| 7 | First gale; Hightown 3.5 km from the Socket |
| 11 | Corin Webb steals the Letting record of the Short Grey from the hospice (his second syllable) |
| 14 | Second gale; 2.7 km |
| 15 | The runners file through link 143. Hightown rises twenty metres; the horn starts lifting in the gusts |
| 19 | Webb visits Keld for Mother Saska's syllable; she refuses; a Stray begins to settle into her household |
| 20 | Third gale, on a light tail; 1.3 km |
| 22 | Aron Fennimore finds the station-56 chain himself and starts a roster, too late |
| 24 | Fourth gale; 500 m |
| 25 | The Hartmark-paid second link falls |
| 27 | Fifth gale: Hightown over the Socket's south shore. The Grounders tell everyone to look down. It falls on the shore; 140 die |
| 29 | Midwinter. Webb goes down the Peleth stair, licensed for one |

### How it can stand at midwinter

| Ending | When | Told |
|---|---|---|
| Lost | Nothing rests (two cuts in midwinter, nothing to offset them) | Hightown goes up with its Chain and the horn, into the wastes beyond Imbar. No journey reaches it: left alone, Aron's late roster adds just enough weight before the second cut, and the fall comes first |
| Crashed on the shore | Half of Hightown at once, over the Socket | The sourcebook's default |
| Crashed on the plain | Half of Hightown at once, short of it (the name said on the rim) | On Hornwake's furrow |
| Grounded | A crowd of 150 to 449 at once | Down at a walking pace where it happens to be |
| Lowered | The roster: twenty or more, one at a time | Horn bitten, drift stopped, coming down by spring |
| Anchored | Enough rests to grip | Still drifting, still in the Corrow, still aloft |
| Slack | Little rests | Everyone has done the sum |

## 3. The country

87 rooms in eleven areas, 45 people and creatures, 53 topics, 20 actions and 55 rules and events, in one module of
eight files (about 1,400 lines of Kyr).

| Part | Places | What plays |
|---|---|---|
| The Scarp and the Stake ruins (`scarp.kyr`) | The eighth bend, the street of chimneys, the Collar, the Rope and Lantern, the Hold chapel, the cistern guild, the rim | Arrival; Agnes Ruddle; Tobin Reach, the drunk stone-reader who is right; the cistern ledger for the night of the Unfall; the Collar's tally (with a Keld); the return "not come back" |
| Wendhead (`scarp.kyr`) | The bridge, the pool, the hospice (hall, long ward, archive, cellars) | Prioress Rook and the anchoring rite; the nameless man; the Short Grey record (Webb's target, or the company's); the glossed prayer that teaches the grammar; the Lettings' door into the Commonplace |
| The Emptied Well (`well.kyr`) | The Registry (Fourth Gate, counting-houses, evidence gallery, contract archive, lowest gallery); the Ruined Ring (Forge, Gaol, an inner cell, the spill); the Glass Floor (edge, Diggings, trough, Chimed springs); the Underfloor (Breach foot, Lamplighter's Camp, the river, the sump); the low road (three way-marks, three airless decoys, the Fork, the Seam); the Root and the blank bright galleries | Licences; the reckoning bought with coal; the payroll, the Forge contract, the 2641 roll; a Gaol lock read by touch; the chimeflies and Ida Wishart; the Nail's negative; the journals; the Old Silver fed; the grammar of the marks; the Commonplace's gift; Wenna's band; blank deeds woken; the grey shore; syllables said where they should not be |
| Hornwake and the plateau (`hornwake.kyr`) | The horn, the hoist-feet, the horseshoe, the tail, the cookhouse, the Horn Watch, the Hartmark pavilion; the Askew gate, the farm below Hesk Dene, the toppled stations, the furrow | Shifting days; Lene and the hoists; Fen's bearing books; Ruth and the files; Esk; Tip; station 56; the Drag read where the horn knocked it down |
| The Socket (`hornwake.kyr`) | South shore, survey station, bollard shelf, north shore | Wil Fennimore's daily distance; the Hartmark scouts; the 2571 chart |
| The Chain (`hornwake.kyr`) | The runners' reach, a Concord rest-cradle in the cloud, the swing, the cable-cradles | The Long Climb; ice; Hask of the Sixty-First Link, who felt the 2641 rise and gives the number; the first link's tally |
| Hightown (`hightown.kyr`) | The hoist-house, the rim, the terraces, the Unasked chapel, the Grounders' hall, the Charge, the archive's outer room, the sealed room, the cradle gallery | Telling; Aron's roster; Cassen Vane's notebook of 2602; the sealed door read in the dark while the charge-holders sleep; the name |
| Keld (`keld.kyr`) | The green, Saska's hearth, Bede's forge, the chapel, the west field | Mother Saska (the grammar, the Hollow's missing son, the Lift as kept memory); Teshen, who joins; the Strays at dawn, named and given places; Bede and Drevka's hammer |
| Wendmouth (`wendmouth.kyr`) | The well square and the Lost Nail, the quay, the cemetery, the Keepstone Court, the consulate, the Ninepan House, the Coyle house | Judge Pennick and the blank deeds; Corin Webb, the dog that does not see him, and his own name given back; Bram Coyle's drawer and Wenna's lens; Clemence's coal and diving kits |
| Clocks and endings (`clocks.kyr`) | | The lift, the tail, the gales, the drift, the bite, the fall, midwinter |

### The Player Portfolio, in place

| Scene | Where it plays |
|---|---|
| Arrival | The eighth bend, on the first step |
| Ordinary Life | Hornwake's horseshoe and hoist-feet for a day after every gale (the move-bell, the oatcakes dearer on a shifting day) |
| A First Anomaly | The first time the company comes to the farm below Hesk Dene: Tip |
| A Dangerous Encounter | The Diggings with Ida Wishart in the company and a light lit |
| A Meaningful Discovery | The Askew gatepost, paid for, read by Teshen |
| A Return to a Changed Place | The Rope and Lantern, three days or more after going below by the stair and coming up some other way; it says it has blown if a gale came while the company was down |

### Additions the source did not specify

- **Names for a few people the sourcebook left unnamed**: Ida Wishart (the Chimed guide in the portfolio), Warden
  Sall of the cistern guild, Tobin Reach (the drunk stone-reader), the Sallows below Hesk Dene, Jory Askew, Bet Mawby,
  Hal Brack. Each was checked against the glossary for collisions.
- **The grammar puzzle's layout.** The sourcebook says the true path is marked *kept* and decoys *let*. The module
  puts three marks with two ways each, the true way left, right, left, and writes the marks in Calvessan so a reader
  who has learned the grammar (from Saska, or the glossed prayer) can choose. Destinations are called "the left-hand
  passage" and "the right-hand passage" until reached, so the choice is the mark's, not the label's.
- **Webb's undoing.** The sourcebook says a Stray named aloud by someone who means it, and given a place, stops
  taking; and that Webb is a man of Keld Hollow the 2606 expedition never found. The module puts the two together:
  Saska remembers a hundred and forty-one, and a hundred and forty came back; Teshen names Corin, son of the reeve,
  and gives him a house at Keld. Absalom Prew is remembered at once.
- **Saying the syllables at the Seam.** The anchoring manual's warning made into an act: the lake steams, the grey
  shore comes closer, and something listens and waits for the rest. Nothing crosses; see the table above.

### What the module leaves out, and why

- **Crossing into the Margin.** See *Thrume*, above.
- **Splitting link 97's replacement.** Forty days at the anvil outlasts the module's four weeks; Bede says "ask me
  again in the spring". The Forge contract and the scarf weld are there to be found.
- **The Chimed's exodus and the Registry's rack.** Pell can be warned; neither side acts within the module.
- **The fading Commonplace, month by month.** Its bright galleries are blank, the Root is clear; it does not shrink
  as play goes on.
- **Greybacks, the Wake-moot's vote, Hessa Pruett's strike, the Lusk consul, the Hartmark as a region.** The
  sourcebook itself names greybacks as texture and the Hartmark as thin.
- **The Socket floor and the name cut there.** The sealed room carries the name instead; 310 m of cold water would
  need magic the module does not model.

## 4. Act I: play it, test it

```sh
bin/kyrie lint data/campaigns/let-one-remember.campaign.json        # 0 errors, 0 warnings
bin/kyrie campaign data/campaigns/let-one-remember.campaign.json    # the terminal
bin/kyrie preview data/campaigns/let-one-remember.campaign.json     # the reader
bun test test/let-one-remember.test.ts                              # all 24 journeys (Act I's are below)
```

The campaign is listed on the title page (`web/scenarios.ts`), and the reader's bundle carries it.

| Journey | What it shows |
|---|---|
| Left alone | The default four weeks: the theft at the hospice, the first cut, the Grounders telling everyone, the fall on the shore, Webb going down the Well |
| The Drag and the roster | Teshen hired at Keld; station 56 paid for and read; Tip; the toppled stations read; the hoist; the method given to Aron; the horn bites and the drift stops short of the Socket |
| The number | Coal bought in Wendmouth; the Registry's reckoning; Ruth stops; Esk stops; Lene runs ballast; midwinter with 143 links and a tail that grips |
| The low road | Torches, a licence, the Glass Floor with Ida and the chimeflies, the Breach, the journals, the marks read left, right, left, Wenna's band, the deeds woken, the dive out, the judge, and Agnes: "not come back" |
| The secretary | The nameless man, Teshen's memory of a face, the payroll, the Hollow's missing son; the prioress warned; Webb named; Absalom Prew remembered; no theft |
| The Grounders' hall | Told all at once: Hightown grounded on the plain |
| The sealed room | Cassen's notebook; the door read in the dark; the name said on the rim; the mountain dropped |
| The climb | Up the Chain to the cloud; Hask gives the number |
| The Lettings' door | The prayer, the prioress's key, the blank galleries, the Root's gift, the Seam with the lights out |
| The chart and the lens | Wenna's lens from Bram's drawer, the 2571 chart from the survey station, compared at Hornwake |
| The Gaol and the Old Silver | A cell opened by touch; the eel fed at the neck of the sump |

Combat is incidental and was not balanced: the Old Silver ambushes an unfed company at its sump, and a company that
attacks a peaceable person gets what it gets.

## 5. What Kyr made hard, and how the module works round it

The full account, with a critique of the module, bugs, and what the language and tools could grow, is in
[friction.md](friction.md). In brief:

Nothing in `src/` or `data/rules/` was changed. These are the places the module had to bend.

| # | What the design wanted | What happened | What the module does |
|---|---|---|---|
| 1 | Ice on a long climb, met on the way | A passage with a dangerous thing on it is offered as a risk ("Elen goes first"), but a journey of more than one watch re-checks `passable` each watch, which excludes `hazardous`, so the company always turns back: "The way is no longer open." (`src/campaign/journey.ts`, `open`) | The ice strikes on arrival in the cloud, by a rule. This looks like an engine bug for any long hazardous way |
| 2 | `links × 1,100 + 3,000 + heard × 1,000 + ballast − lift` | Arithmetic runs strictly left to right, so the second product multiplied everything before it (160,146,000 t resting) | `heard × 1,000` is its own measure, worked out by its own rule first |
| 3 | The last stretch of a drift taking Hightown past the shore | A count that would go below zero throws (`Invalid quantity`) and stops the game | The drift is set aside in a measure and applied by two rules, one that subtracts and one that sets zero |
| 4 | The grey shore seen with the lights out | In an unlit room without a light the company perceives nothing, so an observation there is never told or learned. Nothing in the rules puts a light out, either | An action, "Put out every light and wait in the dark", tells the shore in its result and asserts what it teaches |
| 5 | Two ways out of a junction that look alike | Exits are grouped by destination; two destinations of the same name are two identical labels, never told apart | Each destination is `seen as` "the left-hand passage" or "the right-hand passage" until reached; the decoys then read "a sump with no air" |
| 6 | Levels in a settlement (Hightown's summit and the halls under it) | Levels may sit only in sites and buildings; buildings not in levels | Hightown is a settlement holding a site, "the rock of Hightown", holding the levels |
| 7 | A lamp's light on the Glass Floor | In my runs the shop sold lamps and oil, but the page offered only "light a flask of lamp oil" as an explore choice, and the item panel lit only torches; I did not dig further | The journeys buy torches; the prose says "your light" |
| 8 | A topic that teaches | The discovery's text is told, then the speech, so most revelations are said twice | Some discovery texts are written as the journal's summary; many still read as the same fact twice |
| 9 | Ending the book at midwinter | No ending construct (Thrume's F12, still open) | Endings are relations and observations near the company, told once with `teaches ending_told` |

## Renamed for one world

One generated world holds every authored adventure (Mission 16), so no two give one name to different people or
places (`test/adventure-names.test.ts`). The Collar is the Hawse: The Patient Star has its Collar.
