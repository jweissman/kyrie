# The long campaign: friction and unfinished work

The optional Sallowfield–Tallow thread is a partial campaign, not the four seasons. This record distinguishes
observed authoring friction from ambitions that have not yet been attempted.

## Met in play or implementation

1. **A chapter ending is not automatically a campaign ending.** Sallowfield's local endings must close its
   chapter without ending the shared campaign, but a broken company must still end play. The link module imports
   `companyBroken` and declares a campaign ending; `test/long-ford.test.ts` exercises the shared installation.
   Exporting the relation is supported, but putting it in the import manifest's `roles` failed role validation,
   which expects an entity. Relation imports would be easier to author with a documented role contract.
2. **Offscreen news is not player knowledge.** Sallowfield's outcome can happen while the company is in Swallet.
   It cannot be narrated there as if witnessed. The held outcome is taught locally or by a delayed carter;
   surviving Tib physically travels with relief after the burned outcome (`long-relief.kyr`). A rule cannot
   directly assert discovery knowledge, so the carter uses `says ... teaches`. This is a useful knowledge boundary,
   but the two mechanisms for local witness and reports need explicit authoring.
3. **A road guard's path and supply line take many individual rules.** `long-road.kyr` and `long-logistics.kyr`
   separately time each leg, check the gate, cancel interrupted moves, transfer food at a shared position and consume
   supplies. This is actual physical state, not a strategic planner: there is no general proof here that another
   organization can route, feed or revise its plans. Existing route and pursuit facilities should be tested against
   that obligation before inventing a second movement engine.
4. **Actor continuity is an authoring obligation.** The crew's excavation originally checked its position but not
   whether the crew was able, allowing dead masons to finish and be described working. The road rules now check both;
   `test/long-road-casualties.test.ts` isolates the death and its effect. This was an authored defect, not evidence
   that Kyr cannot express the rule. Other actors and offscreen transitions need the same scrutiny.
5. **Combat against the convoy did not initially make its food recoverable.** Its rations were real but no action
   transferred them after defeat. `long-logistics.kyr` now permits taking the remaining food from an incapacitated
   party at its actual position; `test/long-convoy-capture.test.ts` checks that the guard is not provisioned and
   eventually leaves. That test isolates defeat with `struckDead`; the separate logistics test exercises an actual
   fight, in which the initial company lost. Neither is evidence of fair difficulty across seeds.
6. **A bundle named `long-campaign.json` is mistaken for a campaign.** The repository lint discovers any name
   ending in `campaign.json` (`KyrLint.campaigns`), then reports the bundle as an invalid campaign manifest.
   Renaming the bundle to `long-module.json` fixes this installation. A more precise discovery rule or an authoring
   diagnostic could prevent the misleading error.
7. **A returning group can be defeated before its rearming rule runs.** The field's first restoration left an
   intermediate flag in place until the next watch. A second defeat before that watch could never start another
   return. The rearming now occurs in the restoration watch; `test/long-arena-return.test.ts` checks two consecutive
   cycles. This was an authored ordering defect, not proof that `Restore` itself cannot repeat.
8. **A custom weapon cannot yet be authored as a complete weapon in Kyr alone.** A named instance can use an
   existing item kind, and a local consumable can declare an effect, but Kyr's local kinds do not declare weapon
   figures. Rill's actual sword has a Kyr-authored opening strike that grows after her reunion and the pointer:
   it must be equipped, its damage happens before an actual fight, and its own cooldown and awakening survive a save.
   The effect is a field act against a warned opponent, not a new attack available inside battle; its ordinary
   longsword combat statistics do not grow. Changing a weapon's actual combat definition while preserving its
   identity remains unproved. Local weapon definitions are already tracked by OB-07.
9. **A proud creature without a declared tribute lets the player pay zero.** The young dragon's generic payment
   action said the company had paid while no money moved. Its author now sets a twelve-coin tribute and has the
   dragon name it; `test/long-dragon-fight.test.ts` checks the actual transfer and opened way. This was an authored
   omission enabled by a zero default. The generic wording and defaults are tracked as OR-1300.
10. **A deadline set by an action is measured from the action's start.** Landing an eel takes a watch. Setting
    the smoking deadline to the current watch plus 36 initially made the promised six hours only five hours and
    fifty minutes after the eel was landed. The fishing action accounts for its own duration; the spec checks the
    interval from the player's completed action. This is a timing convention an author must know, not an engine
    failure.
11. **Being at a place does not imply being alive.** A dead Ferryman could still accept food, and Merren could
    bargain with him after either of them had died. Linnet could share a meal after dying. Their actions now check
    that their participants are able; food set aside for the meal remains recoverable. The drawing buyer must also
    be able and present; if he dies, the company can still take the drawing to Merren. These are authored
    continuity defects, exercised in `test/long-road-casualties.test.ts`.
12. **A narrated payment needs a source as well as a destination.** The drawing buyer originally produced four
    coins without losing any. His purse now funds the purchase and he physically leaves after it; the Ferryman's
    rations also enter his actual stores rather than only a campaign measure. The source and destination of each
    transfer are checked in `test/long-road-casualties.test.ts`. Rations given to Merren remain in her keeping until
    the crew arrives, then transfer to the crew. If they are no longer there, the crew comes later without them.
13. **An offscreen decision cannot summon the crew or deliver a map.** The buyer's decision starts a slower scouting
    clock; selling can accelerate it only when the actual drawing passes from buyer to courier to Ferryman. The
    company can meet the buyer at the west road and buy that same drawing back before the handoff, or recover it
    from a fallen carrier at their location. The company can
    tell Merren in person, or pay a raven found in the reflected place to carry its decision. The crew's timetable
    starts when Merren hears it, independently of the raid. The courier now appears in the lane on her way to the
    green, where the company can buy the drawing back. A willow beside the handoff can report what it actually
    witnessed and point toward her. The buyer and raven still use timed moves, not simulated journeys through each
    intervening place; the courier's two legs are timed endpoint moves too. The dead-buyer route makes the decision
    and report together in the inn.
    The willow is a fixed scene interaction, not a creature with independently modelled health or movement.
14. **A helper's work must be invalidated by an interruption.** Mab takes two hours to reach the portal and must
    work for an uninterrupted hour before the crew's deadline moves forward. A guard arriving during that hour
    cancels it; after the guard leaves, a new full hour is needed. The test also checks her food, departure,
    return and a save during the work. Her two-hour journey is a timed move, not a simulated encounter along the
    west road.
15. **Timed action effects do not automatically wait for the stated duration.** The gate's counterweight now
    consumes rope when work begins but only becomes usable after thirty uninterrupted minutes; the fast lowering
    likewise finishes after ten. Tests put the guard at the wheel at the same time and check that it interrupts
    the unfinished work. The ordinary hour-long gate-lowering and bank-blocking actions had the same defect and now
    also wait for their work to finish. The bank interruption spec sets up pending work directly; it is not a
    naturally interrupted playthrough.
16. **Independent supply lines change an older starvation proof.** Once the Ferryman hears the road's course, his
    factor can buy two real rations from Cador and carry them to the guard. The company can pay Cador to refuse the
    order, or stop the carrier. Blocking only the armed convoy no longer starves a guard fed by the factor; the
    starvation journey now stops all three lines. The factor's trips are timed moves, not a pathfinding simulation.
17. **A promised hour must actually pass before Linnet's defense exists.** The ration enters her keeping first.
    She consumes it and completes the stonework only after the hour, if she remains able and the raid has not arrived.
    A test isolates death during the work; it does not simulate her brother or the individual stones.
18. **Legal ownership is not custody.** The basin keeper's bandages were declared as owned but remained at the
    house, so a conversation requiring the keeper to carry them could not appear. The flood's start now transfers
    the actual bandages to the keeper; the rescue test checks their later transfer to the company.
19. **Simultaneous rules need an explicit tie-break.** At the flood deadline the overflow could fire before the
    spill-opening rule, even when the second turn had just completed. Overflow now excludes a completed pair of
    turns, so finishing at the deadline saves the keeper. The spec checks that boundary, not just an early rescue.
20. **An opponent needs a witness, not remote knowledge.** A road scout now checks the western portal in person
    and must return to the living Ferryman before he can order a guard. Her patrol repeats if the road was not open,
    and the company can pay her to leave. Her timed legs have actual positions at their endpoints, not simulated
    encounters on the intervening road. A headless journey sends the actual crew to clear the portal before a
    later patrol discovers it and starts the guard's timetable.
21. **Healing another person needs their member, not their group, as the spell's target.** A group target is routed
    to hostile field casting, but `memberOf(patient, person)` binds the actual member and
    `Resolve invoke(cure, caster, patient)` works. The fragment and Nella's croft check real hit points and spell
    expenditure; this is existing Kyr capability, not a new resolver. It requires a caster who knows and can use Cure;
    Cure Minor Wounds is a separate, smaller treatment and obeys the ordinary cantrip limit.
22. **An accepted refusal must beat the purchase in the same watch.** Tavi could agree not to buy food just before
    the deadline, then buy it anyway because the purchase rule ran before the return rule. The purchase now checks
    the refusal itself; `test/long-gnoll.test.ts` exercises the exact deadline with the real money and food.

## Generation boundary and unbuilt requests

Deem can draw module-local facts and casting at installation (`data/situations/bound-howe/templates.json`;
`src/campaign/module-bundle.ts`), and the assembler can choose an authored group module from a table
(`data/kits/raider-hold/kit.json`). `Cast.group` materializes the declared people and honours authored fields before
generated ones. The optional campaign now draws a counting circle, travelling musicians or marauders and casts a
compatible two- or three-person supply cell with actual food. The circle can be persuaded to correct its account;
the players can exchange their food for a song. Both attempts can fail and leave the delivery in motion. The
marauders can be intimidated into turning back, at the risk of a fight. The circle's book also offers a one-chance
receipt comparison: a correct accusation diverts the actual food, while either wrong accusation leaves it on the road
to the guard. The circle takes the food back to Nella's croft and returns one ration to her only if both parties are
present and able; the rest stays with the circle. Nella can then show the company her grandmother's way into the
ring. A nail cuts her hand when she opens the sack: a company with Cure ready can really heal her; Cure Minor Wounds
can mend one point, and a company without either can still speak with her. A test walks from Swallet green to the interception and the croft, with the Ferryman's knowledge and presence
set up directly; it does not prove a complete journey from character creation. This is a fixed-purpose group made at installation, not a general institutional simulation or lazy
realization. Direct Kyr invocation of a Deem template is a proposal, not
an implemented language feature (`doc/architecture/deem-kyr-interop.md`). The related broader work is already in
AU-10, AB-12 and PA-08; no new defect is inferred merely from wanting it.

The drowned ring has a wagered fight, a dragon and a way to a field where fallen opponents return. A seeded fight
is dangerous enough to defeat the starting company; one seed is not a balance study. Its physical route has been
tested with isolated defeats. Three level-fifteen warriors beat the dragon in one seeded fight, and its named toll
has been tested, but a natural progression to that company has not been demonstrated; the dragon's generated
level-three body in another seed had 96 hit points and strength 33.
Three actual field fights, returns and the keeper's paid account have also been
exercised with an artificially toughened company, not a complete victorious expedition.
The keeper's tile game has real stakes, draws, a stop-or-risk decision, elapsed time and save continuity. Fishing
the pool has different observable bites and responses; a catch takes six hours to smoke into an actual ration.
The ring's balance is a third: three different weights must total nine; a wrong total starts an actual fight, while
either correct combination opens a physical route without it. A fourth, in the reflected place, uses three linked
shutters: turning one advances its neighbour, so the player must work out a sequence and can undo a wrong move.
It opens an actual second route to the field around the dragon; the field's fighters remain dangerous. These are four
minigames. A fifth is the raven's three-note call and response: the phrase is drawn, a wrong note costs an hour before
another try, and success reveals an actual coil of rope. Leaving or sending the raven away ends the unfinished game.
The receipt comparison is a sixth, a one-shot deduction rather than a repeatable game. A seventh is Merren's pebble
game: taking one or two in turn, the player tries to leave her the last stone. Winning earns a memory that can help
unlock a later negotiation; losing costs time and allows another game. An eighth is a spill-wheel beyond the
reflected water: its changing current must be followed before a flood, with a dangerous kick on a wrong turn.
Freeing the elemental starts the flood even if the company leaves; opening the spill saves Senn, the keeper, and their
bandages. Senn can join as an actual mage after the rescue and help lower the Calx Gate in thirty uninterrupted minutes.
They remember Ammerlin; this does not install Low Water.
Their approach is tested from an isolated ring placement, not a complete natural expedition. A ninth is a
timed musical exchange with the generated travelling players: two good turns before two misses earn one ration from
their actual pack, leaving the rest for the guard. Either performance or attentive listening can carry a turn;
leaving, conflict or the deadline ends the exchange. Its test sets the road order directly, then walks from the
green to the meeting, rather than proving the whole campaign from its beginning. A tenth is a wager with Cador
while the Ferryman's factor waits for food: two correct calls before two misses persuade him to refuse her order.
The company pays two real coins, and the factor's deadline continues while they play. A loss leaves the sale in
motion; departure or expiry ends the game. A test reaches it on foot from Swallet green after setting the road order
directly. The outcome tests inspect the seeded future draw to exercise both branches; they do not prove a player can
predict the stones.
The same principle can be applied to the Calx wheel using a rope. Beyond the balance a separate water-place holds
an actual elemental that can be freed or fought; its panes derive the road guard's and crew's visible positions
from their live locations. The panes are an environmental instrument, not a character's divination spell, and
the terraces they show are a clue rather than a realized visit to Ammerlin.
The field also has a shelter reached by a path through the fighting. Rill, a gnoll warrior, is looking for her sister
among the returning faces; a shared ration can persuade her to join the company. She is Orsino's gnoll, with its
actual racial modifiers and traits, not an SRD 3.5 gnoll stat block. An isolated shelter test checks the food transfer,
recruitment, her defenses and advancement, and her participation in a real fight. It does not prove a natural
starting-company expedition to the shelter. The new ancestry is not playable at creation and was not added to a
world-generation table. The campaign's cell can draw gnolls as accountants, musicians or marauders; seeded
installations prove the cast has a compatible calling and actual racial traits, not a general dispersal system.
Her sister Tavi is the Ferryman's factor: they can reunite only in the same place with Rill
awake. If they meet while Tavi is still at Cador's, Rill can ask her to return the actual money rather than buy food.
If the delivery is already made, their reunion does not reverse it. These cases use placed setups and directly start
the road order; they do not prove a whole campaign journey. Rill carries the same family sword before recruitment;
after the sisters meet, whoever equips it can use a small radiant opening strike once every 24 hours against a
warned opponent. Rill can awaken a stronger strike at the brass pointer after its door is opened. The tests exercise
both strikes before real fights, transfer and re-equipping, and save continuity; they use isolated placements and
road-order setup, not a complete expedition.
Beyond Rill's shelter, a minotaur guards a room whose door can be opened back to the Quiet Gallery. The keeper accepts
two actual rations or can be fought; an isolated test checks both approaches and the return after a save. Its adapted
body has the SRD minotaur's scores and Hit Dice, but its axe, horn, armour and saves are not the SRD's. Its working
charge is Orsino's two-action charge, not the SRD's powerful charge; scent and natural cunning are not implemented.
The catalog entry has no habitats, so generated dens do not draw it; the encounter laboratory enumerates all species.
The remaining seasons and finale, a weapon whose ordinary combat statistics grow, a faithful minotaur, a credible dragon progression,
encounter-table loop and further character-cast miracles are not implemented by this thread. The field's restoration is
an actual world effect, not a spell the company casts.
The existing warm/cold meal is a small activity, not one of ten proven minigames. Repeatable investigation and
encounter tables are already tracked by RI-01. No claim is made that the four seasons, balance, or human experience
have been accepted.

`bin/kyrie suggest adventure` currently reports 40 adventures: no wonder tranche, one combat gauntlet and two
perilous crossings. Its wonder classification has no declarable wonder yet (OR-440), so a zero is a limitation of
the instrument as well as a direction for authoring; it does not prove no existing adventure can inspire wonder.
