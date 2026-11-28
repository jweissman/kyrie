# The Empty Seat: literary and authoring assessment

27 November 2026. An author's assessment, not human acceptance.

## Judgment and scope

**Kyr can express this drama. It does not yet make this whole drama easy to
author, integrate or judge.** The best results came from declaring a concrete
thing that changes, then letting the scene reveal its emotional meaning.
The weakest results came from writing a moral, teaching it as a fact, and
promising its importance in a later act.

This review covers the standalone court and mathematical expedition, the
provincial witness exchanges, the world-backed Guild and mathematical material,
and the latest Wrong Boat, Mab and heath vignettes. It distinguishes them from
the proposed forty-character convergence, High City quests and final war act.
Those proposals are not finished adventures.

The branch has been rebased onto main. At the initial assessment it had
**not been pushed**. The first post-rebase small suite reports three failures: canonical city
placement, the new specs' rule-horizon count, and an unexpected world-cost
reading in an aim-successor test. Typechecks, lint and the browser build pass.
The cost reading needs isolation before being called an engine regression.
The [friction log](friction.md) records these limits rather than declaring the
branch merge-ready.

**Publication follow-through:** the four added whole-rule fragment files now
declare their horizons. After the newer main rebase, the ratchet holds 28 horizon files and 233 whole-rule
files, without a widened allowance. The final targeted run passes **68 tests,
799 assertions, across 16 files**, in a shared process. It includes the
aim-successor case, which also passed in the earlier isolated run. The original
broader-suite cost reading is therefore unreproduced, not explained or
silently waived. The whole small suite was not rerun after this port.

Typechecks, lint and the browser build pass; regenerated handbooks contain
3,242 entries and still report four problems. Canonical-city placement remains
a landing blocker. This material is for a **review branch**, not a main landing.
The code and these reports are published on
[`copilot/empty-seat-saga`](https://github.com/jweissman/kyrie/tree/copilot/empty-seat-saga).

## What the language did well

### Causes can survive changes of scene

Keeping the letters preserves documentary evidence but exposes their carrier
on a betrayed route. Burning them removes that identifying packet but makes a
present, freely confiding witness necessary. Rescuing a detained visitor costs
an escort that cannot also muster at the wall. These are good dramatic causes:
the later difficulty is intelligibly the earlier choice coming back.

[The court gathering](../../../data/adventures/theemptyseat/gathering.kyr)
expresses this with facts, locations, resources and an Occasion. The
[pressure proofs](../../../test/small/theemptyseat-pressure.test.ts) exercise
the different paths. No client needs a separate act machine.

### A change need not be new information

Cadi can believe Tarian and still refuse to wait behind a sealed gate.
Naming the approach helps the watch without cancelling its sale. Nerys makes
a default decision when the company does not intervene. A meal changes whether
a visitor stays. These are stronger than a sequence of correct answers:
conduct, obligation and circumstances move people.

The smaller vignettes sharpen that lesson:

- **Mab:** accepting practical care earns confidence; the scar stays.
- **Mrs Brabant:** quiet work earns shelter without buying a confession.
- **Bess:** the returned box is not the same gift after its private verse has
  become public. Her thanks and closed window are the consequence.
- **The kite-maker:** an old ribbon, an expected visit and a repair supply a
  human reason to stop. The real buried stair repays the help without becoming
  the whole meaning of the encounter.

The [native vignette proof](../../../test/small/corpus-aftercare.test.ts)
checks those consequences, not whether the writing is affecting.

### The world can remain larger than the protagonist's knowledge

The Equivalence Engine exchanges a real bowl with a station in Earth.
Occupancy is learned there, not awarded by an earlier proof. The demonstrated
exchange does not explain the third socket or lower door. An ordinary explorer
can measure, withdraw and return without a mathematical perk.

The military use removes one support before a deadline. It does not erase the
enemy army. This restraint gives a wonder more force than an all-purpose
solution would. See the [Act IV storyboard](../../../data/adventures/theemptyseat/ACT-IV.md)
and [expedition proofs](../../../test/small/theemptyseat-expedition.test.ts).

### Deem can vary a situation coherently

One installation draws a visitor's identity, difficulty and practical aid
together. Another draws station occupancy and its corresponding deliveries.
Kyr makes those possibilities into events and keeps the result.

The Act IV measure is 33 procedural delivery slots out of 38, or 86.8%.
**That is not 86.8% procedural plotting.** Most of the causal graph remains
authored. Tables supply considerable expressive variation; they do not yet
prove a varied dramatic architecture.

## What did not work as well

### The kingdom is advertised more fully than it is delivered

Provincial witnesses have earned local reflections. Most do not yet have their
promised reunion payoff. Seeded standalone appearances are not the same as
importing the person the player met, with their losses, employment and history.
The canonical metropolis overlay remains the largest architectural constraint.

Likewise, the Guild queries actual finds and accepts new installations, but a
finite unchanged catchment can be exhausted. Its safehouse network, specific
requests and funny-story commission repertoire are not implemented.

### Too many people can become mouthpieces

An exchange about a local event followed by a maxim about kingship is a useful
bridge once. Repeating it forty times risks making the cast sound like one
author. The final pass removes a repeated succession footer from the generic
far-country hooks; bespoke warnings and actual gossip remain.

The next improvement is not another universal royal clue. A person should
occasionally misunderstand the event, decline its political meaning, want to
change the subject, or make a joke at the wrong time. Such a beat can be
consequential without teaching a secret.

### Emotional change is legal but laborious

Kyr can encode embarrassment, loyalty, fear and fatigue as conditions and
effects. I mostly used bespoke flags and trust increments. That proves
expressibility, not a mature vocabulary for social change.

One trust point is not an arc. Mared's caution needs an experience that costs
her pride; Tarian needs to choose a limit without the company supplying every
reason; Cadi needs interests beyond adjudicating his redemption.

### Pressure is more developed than modulation

The clocks produce urgency and missed opportunities. The attacking force is
still a bounded strategic comparison, not a fully played tactical battle.
The quiet Act IV recovery helps, but repeated warnings about what the engine
does not prove can become procedural disclaimers rather than suspense.

The player should sometimes discover a limit through a surprising, harmless
experiment, not another person explaining it. Unknown rooms need distinct
temptations, not merely additional UNKNOWN labels.

## The effect-sentence spike

The owner-provided *One effect sentence (OR-1333)* spike is research, not
implemented syntax. Its most immediately useful proposal is conditional act
consequences: one act could express a shared gesture with different
state-dependent consequences instead of splitting into near-duplicate acts
or a ladder of rules.

I support its small first slice, with the spike's safeguards: unchanged corpus
semantics, deterministic draws, and honest Outcome prediction. A common clock
would also reduce hand-built deadline arithmetic. Neither change would supply
motives, good dialogue, metropolitan identity or falling action automatically.
Those remain different obligations.

## Deepen before extending

I would **not add another great act yet**. First finish three small arcs:

1. **Mared meets the person her calculation omitted.** Give her an initially
   reasonable plan, a resident's contrary need, and a revision she makes
   without being defeated by a higher check. Her changed practice should alter
   a later preparation, not just her dialogue.
2. **Tarian refuses a second sale.** After useful reparation, let someone offer
   him the familiar bargain in a more respectable form. His refusal should
   cost something. Cadi may respect it without returning to him.
3. **A return that is allowed to be small.** Revisit the kettle and missing
   places. Let a companion decide who needs supper. Give the saved object, lost
   person or changed habit a final image. Do not turn every quiet ending into
   the next quest advertisement.

Then integrate one actual provincial reunion, with preserved identity and
state, before expanding the whole council. For procedural growth, try two
coherent station situations with different needs and solutions, not ten more
descriptions of the same clerk.

For mathematical exploration, make one genuinely different second instrument.
Another counting glass is not another permanent faculty. The three-dimensional
stellar map and eclipse prediction require a world model the current drawings
do not provide; they should not be promised by a pretty display.

These are recommendations, not newly implemented scenes or commissions.

## Final scoring rubric

Scale: **0** absent or blocked; **1** poor; **2** mixed; **3** good;
**4** excellent. This uses the repository's 0-4 judgment scale but answers the
five literary questions requested here, not the accepted
[first-hour cold-play rubric](../../cold-play/rubric.md). This is not a cold-play
round, a rubric-version change or human acceptance.
Scores below judge the executable standalone material and revised vignettes.
They do **not** award the unimplemented kingdom finale its proposed payoffs.

| Criterion | Score | Why | What would earn the next step |
|---|---:|---|---|
| **Dramaturgy**: distinct acts; causes drive subsequent choices | **3/4** | Evidence, supper, incursion and expedition have different purposes. Betrayal and hospitality return as practical constraints. | One integrated provincial arc must change the council's available action; the final war needs an actual causal resolution. |
| **Humanity**: independent wants, companionship, humour and tenderness | **3/4** | Cadi can love and leave. Care need not cure Mab. Bess's privacy matters. A mule can be a better royal candidate than a grand speech suggests. | Mared and another companion need consequential private interests that are not functions of the main quest. More contrasting voices; fewer universal morals. |
| **Movement**: circumstances and minds change, beyond accumulating evidence | **2/4** | People move, resources disappear, promises break, and conduct changes trust. Some personal changes remain threshold flags. | A character should initiate a costly change of course from shame, affection, exhaustion or pride; later play must read that choice. |
| **Dynamism**: modulation, reversals, rising action and sustained form | **2/4** | Independent clocks create pressure. The meal and experimental descent supply contrast. Siege resolution remains compressed. | A played tactical reversal and an enemy response to the company's conduct, followed by a quiet interval that earns renewed tension. |
| **Satisfaction**: setups repay attention; falling action is compelling | **2/4** | The goose title, escorts, rubbings, private song and kept scar have local returns. The largest promised reunions and final victory remain absent. | A full return scene with changed relationships, not a summary or new hook; a completed finale paying at least two earlier sacrifices differently. |

No average: strength in humour cannot compensate for an unpaid-off finale.
The material has real dramaturgy and humanity. It is **not yet a finished
kingdom saga**, and a passing native proof is not evidence that someone will
willingly play its fifth expedition.

Further evidence: [current implementation notes](../../../data/adventures/theemptyseat/NOTES.md),
[High City design](../../../data/adventures/theemptyseat/HIGH-CITY.md),
[conversation programme](../../architecture/open-register.md),
and [the detailed friction log](friction.md).
