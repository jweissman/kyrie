# The living world

The Serewater March is no longer a set of troubles that wait for the company. Powers in it pursue their own aims
on their own clock, through the same actions, facts and rules as everything else, and the company finds out what
they did by what it sees, what it finds and what it is told. This note says how that is built, what was decided and
why, and what it does not yet do.

## The register of names (`data/conflicts/register-of-names`)

Sorgen, once an acolyte of the keepers' shrine, keeps the dead he raised in Holt keep. His drowned sister came
back empty: the dead answer only to the names the keepers wrote, and hers is in the keepers' register, lost in the
flood refuge under Censer Hill. With the register he could give her back her voice, and with it call up the named
founders of the old compact.

Left alone, from the first morning:

| When | What happens | Where the company can see it |
|---|---|---|
| Day 1, morning | Sorgen sends Corvin, his digger, down the smugglers' path for the register | The refuge's shelves, gone through |
| Night 1 | Sorgen calls the churchyard's first warden up out of his grave; the warden holds Brackenholt churchyard and Agnes the sexton flees across the river | The green (the lychgate open, someone tall among the stones), the roof of the keep, Agnes at the Reedwake shrine |
| Night 1 | Iven hears it from Agnes and sends to the Ecumenon | Sister Morwen at the shrine next morning |
| Day 2 | Corvin brings the register home; Sorgen calls his sister back by her name | Her voice through the stones of the keep; she speaks when found |
| Day 2 | Sister Morwen crosses to hallow the churchyard; the first warden drives her off before she can finish | Morwen back at the shrine, hurt; she tries again two days later |
| Night 2 | Sorgen walks the corpse road and reads the compact's founders up from their plinths | The founders' gallery under Censer Hill |
| Night 3 on | The founders walk the downs and stand across the drove road and the ridge track | The ridge by night, and its trodden turf by day |

What the company can do about it, each tested: take the register first (Corvin searches the name room in vain and
is sent to steal it back from Iven); give it to Iven and keep watch (a night's wait in the shrine is broken off
when Corvin comes); speak the keepers' rites over the founders before Sorgen reads them, or while he does (his rite
breaks, with its aftermath); kill or name the first warden (the churchyard is freed, Agnes goes home, and Morwen can
hallow the ground); give the drowned girl her rest, or carry her request to her brother (he puts out his own
lantern). Defeating Sorgen does not undo what he did: founders already raised still walk the roads.

## The vocabulary it needed

Each piece is general and small; together they are the strategic layer. There is no separate simulator.

- **Operations are actions** with parameters, preconditions, time and consequences (`raise_warden`,
  `take_up`, `complete_rite`, `hallow`, `drive_off`). A power's people plan with them toward **pursuits**, ranked
  goals with a condition (`Pursuit rite for necromancer … when scheming(necromancer) and … seeks holds(necromancer,
  founders) using depart, arrive, begin_rite, complete_rite.`). `using` adds operations to an actor for that pursuit;
  a pursuit for a person another module declared extends that person at installation.
- **Obstruction.** An undertaking longer than a watch is checked again when its time is up. If its preconditions no
  longer hold it is obstructed, and its `On failure` changes are the aftermath. The party's rites break Sorgen's
  rite this way, and the first warden breaks Morwen's hallowing: two powers' incompatible undertakings settled by one
  rule, without NPC combat.
- **Dominion** (`data/rules/dominion.kyr`): `holds`, `keeps`, `covets`; `byway`s with their own times, known per
  agent (`knowsWay`), along which `depart` and `arrive` carry an agent out of sight; `keepsKind`.
- **Allegiance** (`core.kyr`, `passages.kyr`): `serves` and `allied`; a guard does not bar its own side
  (`watchedAgainst`).
- **Evidence and provenance.** `Observe … teaches fact` makes a scene teach what it shows, marked `witnessed`; a
  topic that teaches records who said it (`toldBy`); a source read records what it came from (`learnedFrom`). The
  journal says, for each thing known, "you saw it", "from the garrison roll" or "Agnes told you", and when.
  Objectives are conditioned on what the company knows, never on what happened out of its sight.
- **Requests and trade.** `Wants <kind>` and the standard `give`; `Buys <kind> for <n> coin` and the standard `sell`.
  What a person does with what they receive is an event on `keeps`.
- **Interruptible activities.** `Interrupted when threatened(actor).` on waits, rests, camps and rites: time passes a
  watch at a time, and someone arriving, or something perceived happening where the company is, ends it early; its
  success changes apply only if it runs its course.

## Decisions

- **No parallel simulation.** Every power acts through legal actions of the one world; save, replay and determinism
  come for free (a campaign saved while Corvin is on the smugglers' path resumes to the same world).
- **People plan on the true world.** The planner is omniscient, so missions are staged into pursuits whose
  conditions are what the actor would know (Corvin lurks by night until the shrine is quiet, rather than planning
  around a company he could not see coming).
- **The planner does not simulate the clock.** Time-of-day conditions belong in a pursuit's `when` (Sorgen sets out
  for the founders only when the night is long enough to arrive in the dark).
- **Parameters must be bound by positive facts** (`covets(actor, thing)`), or grounding enumerates every entity of a
  type; one unbound parameter made each choice take nine seconds.
- **Contest without NPC combat.** Fights are the company's. Powers contend by obstructing each other's undertakings;
  "driving off" is an operation with consequences, not a battle.
- **Rejected:** a faction dashboard, announced omniscient news, a scripted timeline. The timeline above is what the
  actors' choices produce when nobody interferes, and the tests check its outcomes, not its script.

## Holt keep

The unquiet tower (`data/situations/unquiet-tower`) is now a keep on five floors: a walled bailey with a chapel and
a stable, the tower's hall, library, study and roof, and the garrison's undercroft (crypt, bone store, sealed cell,
drowned cellar, strongroom). Its several ways in (postern, well, breach, a gate that opens only from inside), its
hidden back stair, the drowned drift (swum at a cost or drained by someone who learned where the sluice is), the
captain who answers to his name, the strongroom, and Sorgen's sister make it worth more than one expedition; its dark
undercroft makes torches the measure of each delve. Generated regions situate the same keep, and a keep drawn in
marsh country stands drowned, its well flooded.

## Costs

`bun bin/bench.ts` on the March (October 21, after the conflict and the keep): a watch costs about 10 ms when no
one is planning; a power's first long plan costs more once (Corvin's eight-step errand, about 130 ms). An hour's walk
measures about 220 ms including that, an eight-hour camp about 490 ms, a cold load 3.2 s. The conflict and the
expanded keep made the world bigger (3,509 facts, 116 schemas, 74 rules); nothing is grounded that is not asked for.

## Not yet

People do not start fights; a power's agents never ambush the company. The dragon of the Red Crag is a regional
power by its toll on the highlands, but it is not a planning actor. Factions do not bargain with each other, and
the company cannot yet ally with Sorgen or trade the register to him. Rumours are told as facts by whoever tells
them; the journal says who, but does not weigh them.
