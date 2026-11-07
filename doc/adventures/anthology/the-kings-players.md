# IV. The King's Players

*A five-act continuation of Gosse's Company, played in Dun Rierdan, the City of Seven Towers. Each act is a different form; none ends in a civic settlement.*

Data: `data/adventures/gosses-company/{rierdan,rier_cast,act1..act5,rier_side}.kyr` (module `pentrice`, listed in `module.json` and `placed.json`). Specs: `test/kings-players.test.ts` (11, on the Pentrice city campaign). Governing document: `forms.md`.

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
| V. The Command | glorious fiasco | the command performance | seven scenes with a chaos counter; Patience the bear takes the bow | four endings (fiasco, grave, unproved, furious) |

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
| 8. Endings | five saves all `furious` | eight endings keyed to how Act III ended (`ysoltSealed`, `buriedUnseen`, `verrallResigned`, `verrallShamed`, `bodyTaken`, `bodyStaged`, `lucanFled`, `bodyRiver`); Acts IV/V speak in a coda (`coda_*`) whose threshold the repertoire moves (`standingR`) | eight Act V ending specs, one per ending |
| 9. Act III | saves cost a flag; quips; dialogue changed nothing | each save has a cost: the chain (resignation), the King overrules the Warden (`verrallShamed`), the boat takes Ysolt (`ysoltExiled`), the Dust bars the Wick (`gosseBanned`), the ford takes the Captain; stopping Ysolt leads to the river (`bodyRiver`); Lucan/Verrall/Ambros answers set flags the Observes read; the herring and king quips are gone from the failure lines | quiet grave spec; earlier Act III specs |
| 10. Dun Rierdan parallel | Seats, debtors' yard, Sextons' hall referenced nowhere | the lease and note are on the Seats' docket, the draper's husband is in the debtors' yard, the Marshal is on the Sextons' roll | Observes (not specced) |
| 11. Act I | `posing` not kept; audition needed neither Kit nor Oriel; no pointer to Lamp Hill; Mallam a boy | audition needs `kitTaken/kitProved` and `twinsMet/orielSworn`; a note in the loft names Lamp Hill; Mallam is a lanky cheerful twenty-two | the old Act I spec (teleports remain) |
| 12. Repertoire | cosmetic | two plays and four plays in it each forgive a point of chaos (`standingR`), read by the codas; the court Observes follow it | ending specs run with an empty repertoire |

Tics and anachronisms removed: "Michaelmas" is now "Haysel-tide"; tinfoil, programme and crossing oneself are gone; the Duke is "Aldie"; ten "a man who/like a man" similes were cut; the ten worst sentences were rewritten in spirit (the King, the herring, "it will matter in the fifth act", Swale's bravest thing, "I can't hear him"). Voices: Mallam is cheerful, Swale a ham, Lucan raw.

## Limits

**Works (played by label, no teleport inside the stage):** Pentrice, herald, writ, East Street, Eastgate, King's Road, River Gate; the refusal; Act III's quiet grave from the Bells to the Field; Act IV's four plans and the failure; Act V's eight endings, the nod bound, the Swale arc, and the found-and-asked-home Dorcas and Swale. Earlier specs: Act I from the gate to the title; Act II prepared and survived; Act III's tragedy default, the Warden-softened ending and the staged ending; Act V's fiasco and clean night; the romance topics; save/reload equality.

**Authored but unreachable or only specced from a staged start:** Act II is still entered by `assert/put` (no natural walk); Act III's `beg_verrall`, `ask_the_king`, `steal_body`, `get_them_out` are linted but the specs reach their *endings* by staging the outcome flag; Act I's later scenes remain teleported; Act V's ending specs stage the Act III outcome and skip Acts II–IV; the side quests; Cyprian's and Oriel's topic answers (read by Observes, not specced).

**Open from the review (not done):** `holdingAct` is still shared between Tam's strike and Act II's `tarn_falls`; the Law tower's remaining rooms are read by Observes only; the Chancellor still greets everyone as the masquers (`posing` is set but not maintained); `mallam_correct` changes only the book; the tic counts ("Word," openers, "quite", "real") were not re-counted; voices are improved on the ten worst lines and four named characters, not audited across the corpus.

**The engine cannot represent:** a performance as an object with an audience; a crowd with opinions; a persuasion chain that remembers tone; a heist whose route is spatial (the counting-room is one room); a body as something carried; an ending built from several independent outcomes (an Ending is one text, so the Act III outcome selects it and Acts IV and V speak in a coda).

**Assets whose integration is incomplete:** no art or sound; the Seven Towers' bells have `as sound` only in the nave; the repertoire board is text only.
