# IV. The King's Players

*A five-act continuation of Gosse's Company, played in Dun Rierdan, the City of Seven Towers. Each act is a different form; none ends in a civic settlement.*

Data: `data/adventures/gosses-company/{rierdan,rier_cast,act1..act5,rier_side}.kyr` (module `pentrice`, listed in `module.json` and `placed.json`). Specs: `test/kings-players.test.ts` (43 specs; the ending specs cover grave, seat, door, quiet and the eight Act III outcomes). Governing document: `forms.md`.

## Dun Rierdan is canonical here

The repository previously held only the catalog wonder `dun_rierdan_waystone` and a mention of Dun Rì. This adventure establishes **Dun Rierdan as the realm's metropolis**: a river-city of seven towers (Bells, Law, Coin, Dust, Lamps, Salt, and the King's Tower) on the Crown Road, reached from Pentrice by the King's Road once the writ is taken. Its institutions are setting and pressure, never plot resolutions.

## Treatment

After the Trial of the Wheel the Crown summons Gosse's Company to play for the King. They arrive in the wrong coat, under a false name (the Marchants' masquers), and in five acts become, accidentally and expensively, the King's Players.

| Act | Form | The night/day | What is played | How it can end |
|---|---|---|---|---|
| I. The Marchants' Men | farce | the gate, the Sparrow, the Chancellor's hall, the audition | lying to a sergeant; Kit taken for the Chancellor's daughter; Oriel unmasked; the audition | a comic fiasco in which the company gets a title by a slip of the pencil |
| II. The Mousetrap | suspense / horror | one night | the Duke's ghost leaves the roof at six and walks, an hour a step, toward the company | salt, a name, a play within a play; or the ghost walks the whole way and the party is struck |
| III. The Unburied | tragedy (Antigone) | the Edict: three days' exposure | a girl will bury the Marshal; there is **no hearing climax** | the default is tragic (sealed, the Warden's son follows); six non-tragic resolutions, all costed, one of which the playwright resents bitterly |
| IV. The Note | heist / caper | opening night at the Wick | a forged note of hand taken back from a strong-box while its holder watches the play | note burnt, note returned to the draper, or the company caught in the counting-room; the Tower of Coin goes on lending |
| V. The Command | glorious fiasco | the command performance | seven scenes with a chaos counter; Patience the bear takes the bow | eleven endings, one per way Act III ended (and one for the quiet night), with a coda for what Acts IV and V made of the night |

## Map

Region `reach` (Crown Road `crown_road`, settlement `rierdan`, plus `eastgate` in Pentrice). Rooms: river gate, concourse of the seven, Playhouse Row, print row, bell steps, exchange, Lamp Hill and its roof, dust gate, king's court, law steps, salt quay, the Field of Exposure, the draper's, Pardew's back room; the Brazen Sparrow (taproom, loft), the Rotunda (front, stage, wings, flies, box), the Wick (stage, ward, Lord Rask's box), the seven towers' interiors (King's audience, closet, terrace; law seats and debt yard; Pomfret's counting-room; bell nave and ringers' loft; sexton's hall; salt hall), and the Marchants' house.

## Cast and arcs

Every named troupe member has a want, a flaw, and three beats that resolve differently by play.

- **Gosse** (to be seen as a king; vanity) — gosse_audition ham/honest → the Chorus → the bow.
- **Hepzibah** (to be told; never says it) — plan-gatherer in IV; `hepzibah_heart`: tell him / stay silent → varies the last scene's bearing.
- **Ambrose Swale** (owed the Hamlet; forged the note) — `swale_ask` → tell Gosse / hide / blame the company; the lie matters in Act V.
- **Dorcas** (forty-eight; the best Cordelia) — the plan that keeps Pomfret in the box; `dorcas_rask`: stay or go.
- **Jem Pudding** (dull, singing clerk) — the false clerk of IV; `pudding_beat` side story.
- **Tam Hautboy** (built scaffolds, afraid of rooms) — the roof plan; `tam_beat`.
- **Kit Arden** (plays the girls) — taken for Oriel's double; `kit_oriel`: stay or go with her.
- **Clemency Orde** (the playwright) — the fifth act as it happens; furious if everyone is saved.
- **Recruitable beyond the troupe:** **Oriel Marchant** ("Orrin, a page of the Rotunda", the Chancellor's daughter), joined only on an oath of secrecy or help; **Cyprian Marchant** (her twin, a Watch lieutenant).

Interactive conversations: ~30 `Topic … answering` sets with skill-check Actions on the way (gate, Kit, Oriel, Hepzibah, auditions, Salt-Wives, Ambros, Verrall/Ysolt/Lucan/Ambros in III, Clemency, Swale, plan, Pardew, Mallam, three romance topics). The **repertoire** (`rep1..rep5`) grows through the acts and is posted on the Wick's board.

## How it mirrors

The anthology's three other adventures build a pressure and offer a verdict. This one builds the same pressure and withholds the verdict: Act III has no hearing and no civic ruling; Act IV's success changes nothing; Act V's endings are four ways an evening can have gone.

## The review, and what changed in answer

A hostile review said "do not ship". The specs had hidden the faults because they teleported with `assert`/`put`/`set`. The specs now play the natural route for each blocker.

| Blocker | What was wrong | What it is now | Played in |
|---|---|---|---|
| 1. Unreachable from Pentrice | The Pentrice Endings fired one watch after the verdict, before the herald could speak; Aubrey came after `verdictRead`; Endings stayed armed in Acts II–III | `pentriceCloses()` gates all eight Pentrice Endings: not `summoned`, not `royalCall`, and the herald either refused (`aubrey_refuse`), the writ taken, waited out (three hours, `herald_leaves`), or the book not yet read. Aubrey arrives in the `verdict_read` tick. | "from Pentrice by the natural route": Trial fixture, herald, writ, Westgate, Chepe, Guildhall Square, Close, Eastgate, King's Road, `royal_arrival` at the road head, River Gate; and the refusal. |
| 2. Act III softlock | `help_bury` success set no outcome | success sets `buriedUnseen`, `actIIIDone`, `lucanLives`, `verrallStays`; the Warden finds the white pebble and says nothing (`pebble_warden`) | "a quiet grave by the natural route" (Bells, Dust Gate, Field; the sextons are now peaceable until a hand is put to the turf, so the Field is not a combat standoff) |
| 3. Act V softlock | the nod had no upper bound | `next_scene` needs `sceneV < 7`, `take_the_bow` `sceneV >= 7`; unmanaged scenes cost chaos through the `sN_ignored` rules | every ending spec asserts the nod is gone before the bow |
| 4. Continuity | hard-coded roster, Dorcas and Swale resurrected, Fallow/Patent contradiction, Hepzibah unmarried, leaked Pentrice topics, Isidore Pomfret | `lodge_troupe` lodges whoever is `troupe(?p)`; Dorcas (gone to Fallow) and Swale (walked) are found at the Rotunda and the Sparrow and can be asked home; Observes branch on `patentWon`, `pensionTaken`, `proposed`/`emptyWing`, `kitVoiceHeld`; Hepzibah has a married topic; Clemency has a line about her father and the Office (two variants on `clemBowed`); Pentrice topics gate on `not royalCall`; the moneylender is Isidore Mauger; Oriel is "she" | found-and-asked-home spec for Dorcas and Swale |
| 5. Act II | the Marshal always died; "He tried to kill the Prince" | Verrall says what the *Watch* says; arrest now ends on the Dust's rope before nones; the Prince's sling is its own Observe on `lotharWounded`; `glove_names_him` sets `tarnExposed`; the Duke's murder is concluded at the roof | Act II specs (still partly teleported; see below) |
| 6. Act IV | two plans dead ends; charm failure still locked the moneylender; time not enforced | each plan has an entry: Pudding `walk_in_as_clerk`, Tam `enter_by_roof`, Oriel `present_the_summons` (asserts `clerkLured` and `inCounting`, box left on the latch), Dorcas `slip_in_while_dorcas_has_him`; charm failure sets `pomfretBack`; Mauger walks down at nine (`pomfret_walks`) and `pomfret_arrives` adds alarm when the party is still in his counting-room | one spec per plan, walked by label from the Wick, plus the failure spec |
| 7. Arcs | menus with write-only flags | each flag is read by something: `swaleHidden` blurts in scene 4, `swaleOwned`+`gosseTold` stands; `kitLeaves` removes him and changes scene 5; `dorcasLeaves`/`Stays` and `hepzibahSpoke`/`Silent` change the call; `tamBack`/`tamStood` and `puddingBrave`/`Fool` move chaos in scene 1; `cyprianWith` sorts the twins himself; Cyprian and Oriel have a three-beat arc (join, question, scene); `mallamKept`/`bookCorrected` are read at the call | Swale arc spec (blurts vs stands, with different chaos) |
| 8. Endings | five saves all `furious` | eleven endings keyed to how Act III ended (grave, door, seat, quiet, pebble, chain, shamed, sea, staged, exile, river) (`ysoltSealed`, `buriedUnseen`, `verrallResigned`, `verrallShamed`, `bodyTaken`, `bodyStaged`, `lucanFled`, `bodyRiver`); Acts IV/V speak in a coda (`coda_*`) whose threshold the repertoire moves (`standingR`) | eight Act V ending specs, one per ending |
| 9. Act III | saves cost a flag; quips; dialogue changed nothing | each save has a cost: the chain (resignation), the King overrules the Warden (`verrallShamed`), the boat takes Ysolt (`ysoltExiled`), the Dust bars the Wick (`gosseBanned`), the ford takes the Captain; stopping Ysolt leads to the river (`bodyRiver`); Lucan/Verrall/Ambros answers set flags the Observes read; the herring and king quips are gone from the failure lines | quiet grave spec; earlier Act III specs |
| 10. Dun Rierdan parallel | Seats, debtors' yard, Sextons' hall referenced nowhere | the lease and note are on the Seats' docket, the draper's husband is in the debtors' yard, the Marshal is on the Sextons' roll | Observes (not specced) |
| 11. Act I | `posing` not kept; audition needed neither Kit nor Oriel; no pointer to Lamp Hill; Mallam a boy | audition needs `kitTaken/kitProved` and `twinsMet/orielSworn`; a note in the loft names Lamp Hill; Mallam is a lanky cheerful twenty-two | the old Act I spec (teleports remain) |
| 12. Repertoire | cosmetic | two plays and four plays in it each forgive a point of chaos (`standingR`), read by the codas; the court Observes follow it | ending specs run with an empty repertoire |

Tics and anachronisms removed: "Michaelmas" is now "Haysel-tide"; tinfoil, programme and crossing oneself are gone; the Duke is "Aldie"; ten "a man who/like a man" similes were cut; the ten worst sentences were rewritten in spirit (the King, the herring, "it will matter in the fifth act", Swale's bravest thing, "I can't hear him"). Voices: Mallam is cheerful, Swale a ham, Lucan raw.

## Limits

**Works (played by label, no teleport inside the stage):** Pentrice, herald, writ, East Street, Eastgate, King's Road, River Gate; the refusal; Act III's quiet grave from the Bells to the Field; Act IV's four plans and the failure; Act V's eight endings, the nod bound, the Swale arc, and the found-and-asked-home Dorcas and Swale. Earlier specs: Act I from the gate to the title; Act II prepared and survived; Act III's tragedy default, the Warden-softened ending and the staged ending; Act V's fiasco and clean night; the romance topics; save/reload equality.

**Authored but unreachable or only specced from a staged start:** Act II is still entered by `assert/put` (no natural walk); Act III's `beg_verrall`, `ask_the_king`, `steal_body`, `get_them_out` are linted but the specs reach their *endings* by staging the outcome flag; Act I's later scenes remain teleported; Act V's ending specs stage the Act III outcome and skip Acts II–IV; the side quests; Cyprian's and Oriel's topic answers (read by Observes, not specced).

**Open after round four (honest list):** the Law tower's remaining rooms are read by Observes only; the printer, ghost-light and mummers side quests still feed only milestones and Observes; Act V's scenes are still driven by a seven-nod counter (what is done in them changes the coda, one ending split, a casualty and the Seal), but the ending is keyed first to how Act III ended; one unbroken natural-dice play exists (Pentrice to the last bow, on the quiet night) and the Antigone act is not played inside it; `put` still appears about 49 times and `assert` about 34 in the specs, mostly to enter an act (the Act II fly-loft and several Act III rooms) and the Act V ending specs stage the Act III outcome; the tic counts after the round-4 pass are: "I shall" 26 (kept for Swale, Gosse, Hepzibah, Verrall, Ambros, Clemency, the Chamberlain), "a long time" 11, "slowly" 7, "a man who" 8, "like a man" 3.

**The engine cannot represent:** a performance as an object with an audience; a crowd with opinions; a persuasion chain that remembers tone; a heist whose route is spatial (the counting-room is one room); a body as something carried; an ending built from several independent outcomes (an Ending is one text, so the Act III outcome selects it and Acts IV and V speak in a coda).

**Assets whose integration is incomplete:** no art or sound; the Seven Towers' bells have `as sound` only in the nave; the repertoire board is text only.

## Round two: what changed

| Finding | Fix | Played in |
|---|---|---|
| Act I: Miser plus honest Gosse (or Ghost plus Gosse-as-he-was) offered no audition | each mask has an ungated audition and a Gosse-specific variant (`audition_ghost_ham`, `audition_miser_honest`) with its own DC | "Act I (the honest road)": Miser, honest Gosse, walked to the King's Tower, auditioned |
| "Stop you" never stopped Ysolt (`night_comes` fired first) | `night_comes` needs `not ysoltStopped`; the Edict runs out and `bodyRiver` is reached | "Stop you stops her": plays the answer, waits three days |
| Company stranded in the Rotunda after Act II | `rot_home_*` rules send the troupe to the Sparrow on `nightOver`, and `troupe_to_wick_*` to the Wick on the grant | the Act II-to-IV spec |
| Act IV clock invisible | Chapter line, Hepzibah's chalk (`wick_clock`) and Mauger's own words say opening, nine and ten | read by every Act IV spec |
| Dominant plan | Oriel's plan needs `orielHelped/orielSworn`; the `coin_in` stair closes on `caughtInCounting`; a hint appears at the box | Act IV plan specs |
| Act II cast unplaced | the Marshal, Prince and King are placed in the box on the night | Act II specs |
| Marshal always dies; modes identical | the corpse needs an exposure (`tarnExposed`, `lotharWounded`, `tarnByGhost`, `tarnShaken`, `gloveFound`); the cancel branch ends with `marshalLives`, no Edict, and Act III skipped; `modePoint` arrests and `modeVague` shakes and strikes (`stage_mousetrap_vague`) | "from Act II's quiet night into Act IV" |
| Act I farce flavour | the verdict reads what happened (`king_verdict` vs `king_verdict_plain`); the real masquers confront a posing company (`masquers_meet`); "Prove Kit" costs thirty watches a try | Act I specs |
| Act III costs | Clemency has a line for each of grave, chain, shamed, sea, staged, exile and river; the clem_play topic closes with the act; the Warden's resignation is `dc_formidable` | Act III specs |
| Hinge hard to find | the crier announces the herald and his deadline (`herald_news`) | natural-route spec |
| Dead flags | sixteen removed, `gosseHam`/`gosseHonest2` and `ysoltStopped` now read, `clemFurious`/`clemSatisfied` read at the call, `favour` read by `standing_f`, `Increase … by 0` gone | lint |
| Continuity and name leaks | Clemency's father is the Lord Mayor; "Crake", "Pomfret", "Tarn" leaks cleaned; Mallam's Greets fixed; the coda no longer names runs that did not occur; the Eastgate has a scene | lint |
| Tam strike shared `holdingAct` | its own `tamPicket` | lint |

## Round three: what changed

| Item | Fix | Played in |
|---|---|---|
| `flyGuard` outlived the flies | `guard_lapses` clears it the moment the party leaves the flies; the signal for the play can now be given from the loft so the guard and the play can coexist; the bolt (`tarn_strikes`, and `tarn_strikes_unseen` when the party is elsewhere) can fall after midnight, which it could not before because the play ends at 00:25 | "keeps the guard only while the party is in the flies" |
| Chancellor ignored `posing` | `chancellor_posed` and `chancellor_plain` | "greets the company differently while it is posing" |
| Warden's turn was only a harder roll | a fact is required: `verrall_law` (the Marshal was named before the city, or the glove), asserting `wardenFact`; both begging actions need it | the Warden spec asserts the begging is not offered without it |
| `mallam_correct` changed only the book | correct: `mendPaid` adds two to the repertoire's standing at the call; keep: Pyke finds the wrong column in scene 3 (`slip_found`, two chaos) | two Mallam specs |
| Jem's funeral beat came early | it opens only when the Edict is on and Act III is not done; the pint is in the Row; payoffs at the Field (`jem_funeral_*`) and in the ringers' loft | the staged-tragedy spec plays the beat first |
| "Prove Kit" was an infinite re-roll | one try; failure sets `kitDoubted`, takes Kit out of the party's following and leaves him with the Chancellor until the audition (`kit_released`) | Kit's proof spec |
| Tics | "very" 49 to 4, "real" 12 to 6, "does not look at" 6 to 0, "says nothing" 6 to 0 (the remaining are "the real masquers" and a few emphases); Oriel's register is now precise and quick | lint |
| `herald_leaves` closed in 3 hours | window is 180 watches (a day and a half), `herald_warns` at 150, the crier says "till noon tomorrow" | "holds the hinge open for a day and a half" |
| Act V a counter | choices at scene 6 (`chorusPlayed`/`chorusCut`) and the bow (`bowCompany` vs `bear_alone`) change the codas; a sealed Act III ends `grave` only if the Chorus was played, otherwise `seat` (a ninth ending) | chorus and bear specs |

## Round four: what changed

| Finding | Fix | Played in |
|---|---|---|
| Quiet night reached `commandDone` with no Ending | tenth ending `quiet` ("The Marshal Rides By"), and an eleventh, `door`, when a sealed Act III meets a Warden who knew the fact and a played Chorus | the unbroken play, and the quiet/door ending specs |
| `shamed` unreachable; King in the box | `court_home` returns King and Prince to the Audience Chamber after the night; the King comes to the Wick for the Command and goes home | Act II spec continues into `ask_the_king` and asserts `verrallShamed` |
| "Stop you" was free | the answer only sets `stopTried`; `hold_ysolt` is a formidable roll, one try (`ysoltDefiant` on failure), and the success costs Ysolt the Bells (`ysoltBroken`) | the Stop spec plays the answer, shows it stops nothing, then rolls |
| Lie to Pardew closed three plans | `pardew_key`: twelve crowns or the truth, once, a recovery; the truth now incurs a debt (`pardewOwed`; if the note is burnt rather than returned, Pardew's door shuts) | the draper spec; plan costs are not otherwise rebalanced, only Oriel's plan now has a price (`sealUsed`, paid at scene 5) |
| Repertory tour ignored the troupe | `tour_gathers` uses `troupe(?p)` (Clemency excepted) | the tour spec (Kit sent to the Marchants stays) |
| Farce without cast; no Act I clock | `farce_hint` and `change_the_bill`; `name_day` after four days and a note under the loft door | the bill spec |
| Retried saves | `verrallRefused` latch (and Lucan is taken off the Gate), `outTried` latch for `get_them_out` | lint |
| Dead flags and rules | `finaleSet` rule removed; `signet_kind` and `herring_kind` are read (the King's favour, the Wives' cart); `lothalDoubt` has its own harder `ask_the_king_doubtful`; `pomfret_prevails` mentions Rask's box | lint |
| Act V altering outcomes | the `door` reversal, a casualty at ruin (`disaster_costs` removes Swale from the troupe), and the Seal | ending specs |
| Prose | "holds her tongue" and the other substitutions in six places, "a impertinent", "a old", the Mousetrap is "the Duke of Ashmere" on the stage and the board, "as a man" similes recast, "the size of" recast, "I shall" cut for the plainer speakers | lint |
| One unbroken play | `goes from the verdict through all five acts by labels alone`: the Trial fixture, herald, writ, road, gate, Sparrow, audition, terrace, Salt-Wives, night with salt, cancel, Wick, Pudding's plan, draper, opening night, Command, last bow, ending `quiet` | the spec |
