# The hunter's career: phase 1 (CR-01)

The owner's commission is career-brief.md: royal posting → dragon venture → knighthood → royal game-warden → continuing
bounties. This is phase 1, which:
- reviews what exists for each part of the arc;
- names the engine primitives that are missing, each with a minimal executable proof;
- plans the smallest proof the brief asks for;
- builds that proof where no large system was needed.

**What was built.**
- **One engine primitive:** `felled`, the world's record of who brought a band down. It lives in
  `src/campaign/aftermath.ts`.
- **One tiny Kyr fixture:** `test/fixtures/career/career.kyr`, holding the posting, the dragon, the wolves' bounty,
  the game-warden and knighthood.
- **One spec:** `test/small/career-proof.test.ts`, with the four tests the brief names.

No new system was needed.

## 1. What exists, and what each part of the arc can reuse

### Bounty authoring
- **What exists:** `data/kits/bounty` ("A price on a power").
  - A kit composed against facts the world already holds. Its slots are read from `raids(?raider, ?victim)`,
    `power`, `chief`, `band` and `holds`.
  - The patron (a widow, the elders) is proposed from a Deem table by terrain.
  - The patron module offers the price as a Topic. A Rule marks it `met` when the chief is `not able` or `routed`.
    The claim is a `once` Topic that pays and retracts the widow.
- **What the career can reuse:**
  - the kit's slot pattern: a bounty that arises only where the world holds a real threat;
  - the issuer as a person with words of their own;
  - the claim as a once-only Topic.
- **What it lacks:**
  - **Evidence.** Any death or rout counts, by whoever's hand. The widow pays for a chief killed by someone else.
  - **Time.** It is placed when the world is assembled, never posted later.
  - **Expiry and relevance.** Nothing follows on once the threat changes.

### Monster placement and populations
- **What exists:**
  - **Dens** (`RegionEcology`, `data/generation/tables/ecology.json`): a beast by kind of country, the same throughout
    a region, after Orsino's monsterHome (dragons in mountains and caves).
  - **Rovers** (`RegionRovers`, `data/generation/wild/roving.kyrt`): up to six to a country, each roaming stretches
    near home and coming to the company by day on the watch's die. The wolves warn first.
  - **Meetings** (`RegionMeetings`).
  - **Deep sites' dwellers and placement** (`src/world/deep/`).
  - **Parties composed by habitat and challenge** (`Parties.compose`).
  - **Dragon species in the canon:** wyrmling, drake, dragon, wyrm. The dragon is Orsino's: strength 35, 99 hit
    points. In the fixture a lone level-14 warrior and a company of four at level 10 both lost to it. It is a real
    ambition.
- **What the career can reuse:**
  - dens and rovers as the authoritative population a bounty reads;
  - the species catalogue for quarry.
- **What it lacks:**
  - **Named individuals.** No den or rover is a named, persistent creature with activities of its own, such as a dragon
    that raids. Only authored modules have one.
  - **Changing populations.** Nothing counts a den's numbers as they change over time.

### Death and proof events
- **What exists:**
  - **Life and death as facts.** `able` and `dead` are projected from a creature's hit points (`CreatureFacts`).
  - **Slay.** `Slay` is `struckDead`, then `Consequences.slay`.
  - **Rout and surrender.** `routed` and `yielded` are recorded by `Aftermath` where a module declares them.
  - **Spoils.** The fallen leave their gear where they fell (`Spoils`).
  - **Experience.** It is given by `encounterXp` (`FieldUse.award`).
  - **The log.** The combat log holds each death; the Story reads deeds from the log.
- **What was missing:** the world's record of *who* brought a band down. Without it a deed could be claimed by
  picking up a trophy, or by a death the company had no part in.
- **Now built:** `felled` (section 2).

### Time-based incidents
- **What exists:**
  - Kyr Rules on the clock's measures: `day(clock)`, `hour(clock)`, `watch(clock)`, and the watch's die
    `dice(clock)`.
  - Events, Occasions, Pursuits and Routes on a person (AB-06).
  - The rovers' coming, a site's renewal over nights (`RegionRenewal`), the drover's death.
- **What the career can reuse:** all of it. A raid is a Rule that keeps its own measure, `lastRaid`, and changes the
  world once a day. A bounty is a Rule that arises from what the raids have done (proved in the fixture).
- **What it lacks for generated worlds:**
  - **An incident measure on dens and rovers.** Nothing counts what a den or rover has taken.
  - **An issuer that reads one.** No template posts a bounty from such a count.

  Both are template work (Kyr), not engine work.

### Recognition: titles, standing, reputation
- **What exists:**
  - `Milestone` (worth experience);
  - `styled(entity, entity)` in the fellowship situation;
  - `honored(group, shrine)` and the gods' favours (`devotion.kyr`);
  - a person's `Known as`;
  - endings and chapters;
  - "seen through" in the Notes.
- **What it lacks:**
  - **Titles.** No construct for a title or a form of address.
  - **Standing.** No standing of the company that the people of an institution read.

  Knighthood can be a fact the world's people read, line by line. That is proved in the fixture: `knighted(party)`
  opens the register and changes the reeve's words. A general form of address ("Sir", read by every greeting) would
  be a voice-level primitive, and is left (section 2, P4).

### Dun Rìerdan
There are two cities of Seven Towers, and they disagree.
- **The canon's city.** `data/imbar/dun-rierdan.kyr`, the canon's `dun_ri`.
  - It is the chief town of the first country's northern neighbour in every world (`data/imbar/shape.json`'s seat,
    `WorldShape.seat`), so it is reached by ordinary travel.
  - It names its seven towers: the Rì's, Doors, the Cauldron, the Judges, the Harp, the Scales and the Teulu.
  - It names its powers: the Llys, the College, the Keepers, the Judges, the Bards' Hall, the Exchange and the
    Teulu, the Rì's war-band.
  - Adventures are to lay their people and buildings over it (`seatOf(tower, building)`). None has yet: as a
    generated town, it holds the canon's identities and nobody of its court.
- **Gosse's Company's city.** `data/adventures/gosses-company/rierdan.kyr` builds its own "Dun Rierdan, the City of
  Seven Towers".
  - It has seven different towers: Bells, Law, Coin, Dust, Lamps, Salt and the King's Tower.
  - It is reached by the King's Road from Pentrice's east end once the verdict is read.
  - It has its own court and people.

The career needs its warden in the city a player reaches by ordinary travel, the canon's. Gosse's Company's city
predates the canon's and should be reconciled to it; that is the owner's decision (section 4).

## 2. Missing primitives, each with a minimal proof

| | primitive | built? | proof |
|---|---|---|---|
| P1 | **`felled(company, band)`**: the world's record that the company brought a band down, kept where a module declares the relation. It is asserted when a fight the company resolved ends in its foes' elimination. A death by any other means (a Slay, a trap, another's fight) is never recorded. (`Aftermath.felled`; a module's own `felled` is found by its name, as `willing` is.) | **yes** | `test/small/career-proof` ("knows the right creature's fate"): felling the adder records the adder only, a Slay records nothing, Scathe's fight records Scathe; three of four cases fail with it undone |
| P2 | A quarry's fate by others ("resolved by others") | no primitive needed | `dead(x) and not felled(party, x)` in Kyr |
| P3 | A bounty that arises from incidents over time | no primitive needed | the fixture's `wolves_raid` and `bounty_arises` Rules ("goes on while the commission is ignored") |
| P4 | A form of address that the world's people use (Sir, Dame) | not built | authored line by line in the proof (`knight_known`). A general one would be a voice table, read where people greet, from a fact such as `styled(party, knight)`. **Decision:** worth it only once a second honour exists |
| P5 | A trophy with a history (whose, where, when) | partly | the trophy is an authored item kind that appears only once its creature is felled (`hidden until head_seen`, taught by a Rule on `felled`), and is spent by the claim. Its history is in its kind's words; an item carrying a provenance of its own (the deed's place and day) would be a small Item field, not built |
| P6 | A Record of Deeds | not built | `felled` and `claimed` facts are the record. A modest projection of them (a Book page: hunts, places, honours) is presentation work for the lead's files |
| P7 | A generated dragon as a real inhabitant with activities | not built | the proof's Scathe is authored. For generated worlds, a dragon den's template would carry a raid Rule like `scathe_raids` (template work) |

## 3. The smallest proof (built): `test/fixtures/career/career.kyr`

- **The early posting.** A royal proclamation on Hollow Ford's post, read as a thing. It gives a real lead
  (`leadsTo(commission, crag)`: "the dragon of the Crag above Hollow Ford"), not a road to the lair. The aim is
  "Slay Scathe, the dragon of the Crag, and bring the proof to the royal game-warden at Dun Rìerdan: knighthood and
  five hundred crowns."
- **The real dragon commission.** Scathe is a `dragon` of the canon at its lair. It takes a ewe from the fold once a
  day while it lives, whatever the company does.
- **The deed and its proof.** Felled in a fight (the engine's record), Scathe leaves its head on the Crag, and the head
  is taken.
  - The game-warden, Master Cadell at Dun Rìerdan, keeps the register of quarry. He pays only where the head is held
    **and** the deed is recorded (`felled(actor, scathe)`), and only once; the head is spent by the claim.
  - A head alone (Scathe dead by any other hand) proves nothing: none is shown.
- **Knighthood.** `knighted(party)` is persistent and read by the world:
  - the warden's register opens to a knight ("a wyrm troubling the salt road, and a beast seen near Thornwick");
  - the reeve calls you Sir on the green.
- **The smaller bounty, arising over time.**
  - The wolves at the fold take a ewe a night.
  - When three are gone, the reeve posts thirty coin for them (`bounty_arises`), and it is an aim.
  - The bounty is irrelevant if the wolves die otherwise: its aim holds only while they are able.
  - Felled by the company, it is claimed once, and the fold is `spared`: mended, said so where it is, and kept in a
    save.

The spec's four tests, as the brief lists them:
1. **The world goes on while the commission is ignored.** Three nights after the proclamation is read, the fold has
   lost three or more ewes, the wolves' bounty has arisen and is an aim, and Scathe is alive at its lair.
2. **The right creature's fate is recognized.** Another beast's death is not Scathe's; a Slay records no deed and
   shows no head; the company's fight records Scathe's.
3. **Claims cannot be duplicated.** The warden pays 500 once, knights the company, and does not offer the claim again.
4. **A completed bounty has an enduring consequence.** Thirty coin once; the fold spared, kept in a save and told at
   the fold.

Where the spec fights Scathe to win, the fixture's dragon is read as a wyrmling. A deed is proved by the fight that
did it, whatever the odds; the commission's own Scathe is the canon's dragon, beyond a lone novice by a long way.

## 4. What needs the owner's (or the lead's) decision

1. **Which Dun Rìerdan.** The proof's warden sits in an office written into the fixture. For the real world the
   warden belongs in the canon's city, laid over a tower: the Teulu's, the Rì's war-band, or the Rì's own Llys.
   That means a module installed with the seat country that builds a building and its people there. Decide:
   - whether such "city modules" are installed by the seat (a new install route), or by a kit placed in the seat
     country;
   - what becomes of Gosse's Company's own city of other towers.
2. **The posting's home.** The first town's notice (the undertown's) or a second post. The proclamation is royal, so
   every first town could carry it, as a world-level fact naming one dragon of the world.
3. **Which dragon.** A generated world places dragons only as dens' beasts. The commission wants one named dragon per
   world, placed by rule: for example the nearest mountain or cave den beyond the first country, raised to a named
   individual with a raid Rule. That is template and placement work in `src/world`, no engine primitive, and is the
   next step if the owner wants it in generated worlds.
4. **Forms of address** (P4), the **trophy's provenance** (P5) and the **Record of Deeds page** (P6): built when a
   second honour exists. The page is in the lead's files.
5. **Rewards against the economy.** The proof's 500 crowns and 30 coin are placeholders. The expedition economy
   (CB-22, SI-07) should set them.
