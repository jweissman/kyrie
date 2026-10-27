# The Patient Star in Kyr: an independent author's test

Written for: the Kyr builders, and anyone deciding whether an outside author can write an ambitious adventure in Kyr
today. Kyr at `main` 1316192; the work is on the branch `hold-one-season-authoring`.

*The Patient Star* is a five-tier campaign written without reference to Kyr: a fallen seed whose light stops time in
stone and slows it in flesh, on a plateau whose people hold their dying in the light; an inverted citadel built
downward out of stolen moments; a fastness lowering itself down the light from beyond the sky; a plane where every
moment of the past is kept as a place; and the citadel beyond the planes that is quarrying it. I wrote all five tiers
in Kyr, played them in the terminal and the browser, and kept a ledger of what resisted.

- [fidelity.md](fidelity.md): what the campaign must preserve, written before any Kyr, and what survived.
- [ledger.md](ledger.md): 38 findings, each reproduced by a probe or a journey.
- This report.

## 1. Assessment

**An independent author can write a campaign of this ambition principally in Kyr. Nothing in it required editing
TypeScript or a shared catalog, and all five tiers play from Quell to an ending.** No feature was outright blocking.
But the setting's two defining physical facts, that the light makes you *slow* and that the past is a place you
*walk through for weeks*, are exactly where Kyr is weakest, and the author spends a large share of the work on
bookkeeping and on discovering behaviour that only the source explains.

What Kyr made natural:

- **A law of the world's own.** "Touch gives time" is one action and one rule in a shared law file. Every stopped
  thing in four tiers (a flake of ash, a dead king, a shock-front, a bolt of green lightning, the Patient's own fall)
  is a thing marked `kept` with a rule for what its moment does. This carried the Undersun, the Corbel, the Keeping
  and the Masonry, and it is the best evidence that Kyr can host strange physics.
- **Knowledge as keys.** The Way's four gates open on facts gathered in five places; the Undersun is mapped by the
  transcripts found above it; the Keeping lets the jewel's wearer step out anywhere. The prayer that is a granary
  label, the Breach's culprits, the hour-names are all inferred from two observations, never handed over.
- **Mechanisms over many places, and a world that does not wait.** The mirror and the walking gardens; the Sluice's
  three consequences in three places; the crew's descent, Garret's walk home, Amaru waking by the week and carried
  up in the eighth, the Corbel coming down two metres a day.
- **Social machinery.** A Concord of six seats with stances, red lines and evidence that moves them, voted on.

What it did not, in order of cost:

1. **Pace** ([1](ledger.md#1-a-bodys-pace-cannot-be-changed-by-a-module)). A slowed person goes at half speed only
   through the engine's case for being overloaded, and the page says they are carrying too much.
2. **Time on the way** ([26](ledger.md#26-rules-about-where-the-company-is-are-silent-while-it-travels),
   [27](ledger.md#27-a-long-move-is-simulated-watch-by-watch)). Rules about where the company is are silent while it
   travels, so light on the filament and air on the Spine had to be restated as properties of each way. And a
   fortnight's walk inland through the Keeping is one click that takes 35 seconds.
3. **People acting alone** ([2](ledger.md#2-a-companion-cannot-leave-of-their-own-accord),
   [10](ledger.md#10-the-company-cannot-divide)). No companion can leave on principle, or go ahead; Saro holding the
   Heart while you go is played with the resolver for burying the dead.
4. **Perception** ([4](ledger.md#4-events-are-spent-unseen-and-the-dark-hides-everything),
   [31](ledger.md#31-a-scene-true-only-in-a-window-of-time-is-missed-by-any-wait-across-it),
   [32](ledger.md#32-an-unanchored-rules-words-reach-the-company-wherever-it-is)). Events are spent unseen; the dark
   hides speech; a dawn sighting is missed by a wait across it; news reaches the company sixteen hundred years deep.
5. **Silent traps** ([3](ledger.md#3-people-do-not-walk-unless-told-uses-go), [7](ledger.md#7-two-things-changes-worded-alike-only-the-first-is-offered),
   [25](ledger.md#25-an-item-sees-only-kinds-declared-in-its-own-file), [30](ledger.md#30-a-description-near-a-thing-on-a-passage-is-never-shown)).
   People who never move, a choice that vanishes, kinds that must follow their items from file to file, a
   description that never shows. None reported by lint.

**The measure the brief asks for.** Of the module's 145 rules, about 83 say something about the world (dose soaking
in, the Steam Stair's cycle, a riot given five seconds, the Corbel descending, air running out). About 40 keep two
facts in step, clear a latch or reset a counter. About 22 work around something missing: the pace lever and its
renewal, a clamp at zero, copying a dose from a person to the member he becomes, per-way dose and air, counters for
"has stood here an hour", a tally per seat. So roughly three fifths of the rules are fiction. In the 33-room opening
it was under half; the shared laws for the stilling and for kept moments are what raised it.

## 2. The supermodule

| Tier | Places | What plays |
|---|---|---|
| I, the Uplands | Quell, the North Well and West Gallery, the Shallows and Granaries, the Hour; Ennick and the glass; New Orrel, the Collar, the Pit floor, the dark glass, the Tovash wells and the Split Ear camp, the Sixty and the Ear; the Weirs, the Old Landing, the name-tomb cliff; Stairhead House | Garret held and freed; the mirror and gardens; the Neck; the Outfall and Sluice; Amaru waking, his seal, the Long Hour, the royal seed; the sounding lock and the Wall of the Stair; Selane's Veil; the Steam Stair; the Breach investigation; the quarry and Ennick's road; Lenna Marsh's logs and the dawn sighting; Halu; the Concord |
| II, the Undersun and the Way | The Crown, the Seridane Reach, the Silent Reach, the Listeners' Reach, the Tip; the Arbiters' Way and Vault | The Fall and the Splinter; the First Course; the Burning Wood; the Granary at Noon, Lirem and the gong; Selane's argument; the Riot Hall and its Grammar door; the Quarried Gallery; the Keystone Gallery; the Fair's drum door; the Masons' trade; the Delver; the Door, the Stair That Counts, the Gallery, the Ward; Ithmar, the Tally, the Remembrancer |
| III, the Corbel | The Standing Cloud, the Thick, the filament, C1 to C8 | Rime-bells and salt; the Long Hail; the Lintel; the Hall of Weathers and the upright sea; the Procession's warning (through Saro); Saro's niche; the Offers; the Rail; the Interlocutor in your own voice; the Seam |
| IV, the Keeping | The Tideline to the Outer Wall (a plane) | Scrying the present; setting into it; the murder at the Stair; the new moons; the fall and the Delver; the Quarried Reaches and Clea Keddle; the Separation and the sigils; Saro's absence; a memory struck for every step with the jewel |
| V, the Masonry | The Spine, a finished world, the Imbar Wing, the Nave, the Heart (a plane) | Air reckoned way by way; stillness laid; a world's beginning given time; quarried moments carried back; seating, rebinding, exile, bargain |

139 rooms on three planes, 46 people and creatures, 54 things, 22 hazards, 61 topics, 248 descriptions, 145 rules,
35 actions, in 2,536 lines of Kyr across eleven files and two shared laws
([data/adventures/patient-star](../../../data/adventures/patient-star)).

### Play it

```sh
bin/kyrie lint data/campaigns/the-patient-star.campaign.json        # 0 errors
bin/kyrie preview data/campaigns/the-patient-star.campaign.json     # the reader
bin/kyrie campaign data/campaigns/the-patient-star.campaign.json    # the terminal
```

*Hold One Season* (`data/campaigns/hold-one-season.campaign.json`) is the same module, pitched at the opening.

### Test it

```sh
bun test test/hold-one-season.test.ts   # 15 journeys through the opening
bun test test/patient-star.test.ts      # 9 journeys through all five tiers (about 3.5 minutes)
bun test test/patient-probes.test.ts    # 10 probes, one per language finding
```

The deep journeys play a company of level 8, as the source pitches the Undersun at 4 to 8 and the Masonry at 12 and
up. A first-level cutter dies to the Riot Hall's five seconds, and to the Outfall eels, as she should.

| Journey | What it shows |
|---|---|
| S1, the Hour | The hour-names put together from the children's plate and the Waking Ward copies open the sounding lock; the Wall of the Stair names Selane's murderers; the Veil |
| S2, the Undersun | The ash drifts along the safe line; the fourth Dane says his name at a touch; Selane argues a sentence a touch; speaking the door's syllable gives the riot five seconds; Doran in the Keystone Gallery; the drum door laid with Saro's trowel |
| S3, the Way and the Keeping | The four gates answered; the Tally lent for a true reason; five weeks inward to the Separation and back, the Corbel lower; Ithmar bound tighter with Saro's moment |
| S4, the Corbel and the Masonry | Eight points of dose up the filament in felt; the procession's warning through Saro; the Interlocutor in your own voice; across the Spine on held breath; Saro holds the Heart |
| S5, the Concord | Called when the Corbel is seen at dawn and the sinking proved; the Way shown; a sanctioned descent passes 4 to 1 |
| S6, the Breach | A herd-mark in the culvert and a sluice pin on the holder's door |
| S7, the fourth Dane | His name taken below, spoken at his tomb across the gorge; the Weirs' dispute settles |
| S8, the long clock | The Corbel two metres lower each day |
| S9, the king | Amaru from a sixth to a third by week five; carried up with a fever in week eight; Halu out of the wells |

## 3. The ledger

See [ledger.md](ledger.md). The severe entries are 1 (pace), 2 (companions leaving), 3 (`Uses go`), 4 (perception),
5 (negative measures crash), 26 (rules silent on the way) and 27 (long moves cost wall time).

## 4. Improvement agenda

### Immediate repairs

1. Clamp counts at nothing; add `min`, `max`, `/`; name the rule and line in every load and run-time error (5, 35).
2. Give every person `go`; size plans to the path; lint unreachable pursuits (3).
3. Key repeated choices by their target (7). Resolve `Buys` and `Item` kinds module-wide (24, 25).
4. A retracted `travelsWith` sends the companion home (2).
5. Lint: `near` an anchor that can never show (30), `says` with no anchor (32), and every campaign that includes a
   changed file (34).
6. Narration by passage kind and shelter (no dew in a tunnel, no owl in the Keeping); no article before kinship
   words; notes split outside quotations (17).
7. Document `Uses go` and `Plans`, inference by `Observe … teaches`, member ids, one rule pass per short action, `at`
   versus `beside`, `Resolve inter`, and that `Goal` is not an ending (3, 6, 8, 9, 28, 30).

### Semantic additions

```kyr
// Pace is a quantity (1). Laden becomes a rule that sets it.
Measure pace(group).
Rule slowed when dose(?m) >= 24 and memberOf(?m, ?c) { Set pace(?c) to 50. }

// On the way (26): rules see a company on its passage, and a passage may run through a place.
Passage filament "the filament" is path between pit_floor and lintel_room taking 32 hours through pillar.

// Told when seen (4), heard in the dark, and a scene that held during a wait (31).
Event comes_round near garret when seen and not asleep(garret) "…".
Observe voice near garret as sound when not asleep(garret) "…".

// An ending (28); a hazard on one member (29); a person immune to a harm (37); counting (38).
Ending rebound when rebound(corbel_site) "Ithmar is bound tighter than the Virina bound it…".
Assert strikes(stilled, ?m).
Person saro "Saro" at ward { … Immune fire. }
Rule motion_passes when count(?s: favours(?s, ?m) and at(?s, chapter)) >= 4 { … }

// A worn kind (11), a timed change (20), any-to-any changes (19), a keeper who sees (14), a stowed item (15).
Kind umber_felt "an umber felt cloak" is gear worn on cloak weighing 6.
Change cut_wife "Grind her out of the glass" from held to cut_free needing digging taking 20 days.
Change crank "Crank the mirror round to {to}" from any to any.
Change unhook "Unhook the chain-gate" from locked to unhooked watched by hal.
```

### Architectural

- **Time that skips** to the next moment anything can change, instead of every watch (27). The Keeping needs it;
  any campaign with sea voyages, sieges or long marches will.
- **Members who act apart**: send a companion somewhere, carry a person, wait for them (10).
- **Perception as channels** (sight, sound, touch), so that the dark, a wall or sleep hide what they would (4).
- **Rules to a fixed point** for short actions, and a trace of which rule changed what (9).

## 5. Creative fidelity review

See [fidelity.md](fidelity.md), "After the supermodule". In brief: the setting's physics, its history as evidence,
its strange places and its endings survived as play, not prose. Slowness survived only as half pace. The weeks of
walking in the Keeping survived at the price of long pauses. Companions acting on their own did not survive, except
by leaving for ever.

## 6. The authoring workflow

- **Preview and lint** are quick (the 139-room module lints in about three seconds, against the whole repository's
  vocabulary) and most declaration errors give file and line. Several did not: a duplicate observation, a reserved
  relation name, a rule writing a projection, a duplicate entity with no second declaration, and a kind missing at
  run time (35, 34).
- **Reading the engine.** Seven times I had to read TypeScript to learn a behaviour: `Uses go`, the horizon,
  member ids, `Resolve inter`, the travel gap, `Goal`, the de-duplication of choices.
- **Testing.** I built a journey harness twice (terminal driver; test class with a retrying move for the Steam
  Stair). Kyr should ship one. The phases of the deep journeys are data
  ([journeys.json](../../../test/fixtures/patient/journeys.json)).
- **Organisation.** Eleven files of one module plus two laws worked, once kinds followed their items (25). Two
  campaigns sharing files did not (34).
- **Balance.** Kyr's combat is Orsino's, and the source's level bands mean a first-level protagonist cannot survive
  the Undersun. The world says so honestly (the riot kills her); a campaign of this length needs advancement the
  module can see, which this test did not exercise.

## 7. Recommendations for the main Kyr builder

1. **Make time skip and let rules see the way** (26, 27). One change, and the Keeping, voyages and marches become
   writable and fast.
2. **Pace as a quantity** (1). Every setting with exhaustion, cold, wounds, burdens or strange physics needs it.
3. **People who act alone**: leaving, going ahead, carrying (2, 10). The memorable companion moments are these.
4. **Perception-aware events and endings** (4, 28, 31). "Told when seen" and "this is how it ended" are what authors
   mean almost every time.
5. **Default `go`, kinds module-wide, choices keyed by target, errors with locations** (3, 5, 7, 25, 35). Each is
   small; together they remove most of the archaeology.
6. **A shipped journey harness and a "why is this not offered / which rule did that" trace.**

## Renamed for one world

One generated world holds every authored adventure (Mission 16), so no two give one name to different people or
places (`test/adventure-names.test.ts`). Kerra Vane is Kerra Lowe, Annet Coyle is Annet Sorrel, Ruan Dace is Ruan Haldane, the Seam is the Selvage and the Listening Hall is the Waiting Hall: Let One Remember has its Vanes, its Coyles and its Seam, The House That Grows its Dace, and Low Water its Listening Hall.
