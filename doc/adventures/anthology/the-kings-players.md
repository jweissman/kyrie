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

## Limits

**Works (played by spec):** Act I from gate to title by accident; Act II prepared and survived, and its horror variant; Act III's tragedy default, the Warden-softened ending, the staged-over-the-body ending; Act IV's caper and its caught variant; Act V's fiasco and clean night; the romance topics; save/reload equals live state at the end of Act V.

**Authored but unreachable or unplayed in a spec:** Act II's alternate rings (avenging, midnight) and cancelled-play branch; Act III's beg_verrall, ask_the_king, steal_body and get_them_out resolutions (gated and linted; the tragic, softened and staged paths are the ones specced); Act IV's roof plan, Dorcas plan, and the sealed-summons plan are authored but only the Pudding plan is played end-to-end; return_note_to_pardew; Act V's Duke seating, twins sorting, and the `grave`/`furious` endings (endings are conditioned on state the Act III specs reach but Act V does not reload); the side quests (ghost-light, printer, herring, mummers, Cyprian) are linted but only lightly played.

**The engine cannot represent:** a performance as an object with an audience (all performances are Actions with checks and counters); a crowd with opinions (the "house" is prose and a chaos number); a chain of persuasion that remembers tone (answers set flags); a heist whose route is spatial (the counting-room is one room); free rehearsal of lines; a dead body as something carried (the Marshal's body is a Thing that stays).

**Assets whose integration is incomplete:** no art or sound; the Seven Towers' bells have text but no `as sound` coverage beyond the bell nave; the repertoire board is text only; Dun Rierdan is not yet placed in any generated world's map beyond the placed module's own region.
