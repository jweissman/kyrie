# What Tessary Owes — authoring friction

*What Kyr, Deem and the engine made hard to express; what was changed in the engine, and why; what the module works
round; what would be worth building. Every engine change is small, general, tested on its own probe, and justified by
a scene of this adventure that could not be written without it.*

The adventure is about 1,950 lines of Kyr in eleven files: 53 rooms on two planes, 30 people and creatures, 81 topics,
39 actions, 154 rules, 33 events, 118 observations, 49 discoveries, 19 milestones and 7 endings. Almost everything
the design asked for could be said in Kyr. The places where it could not are below.

## Changed in the engine

| # | The adventure needed | What happened | What was changed | Tested by |
|---|---|---|---|---|
| E1 | A company that grows over a fortnight in which it mostly finds things out, persuades people and carries papers | A module awards experience once, when its single Goal holds. A thorough player of this adventure would have finished it at level 1 having fought perhaps twice. (The Road's report said the same: "a company does not grow".) | **`Milestone id "what was done" worth N when …`** lowers to an entity of kind `milestone`, a `merit` measure and a once-only rule asserting `achieved`; `Progression.milestones` gives the worth once, said for what it was ("gains 300 experience: read the terms of the War Note"). Old-school experience is for what is resolved, not only what is killed. | `test/milestones.test.ts`; the Kept Promise journey (≥ 3,000 experience) |
| E2 | An ending that closes the adventure's story when the country is played as a chapter of a continuing generated world | `Ending` stops play: `Campaign.running` was false once any ending was reached. A placed country with endings would have ended the player's whole world. No placed adventure before this one used `Ending` for that reason. Endings also latched on *any* ending (`not reached(?ending)`), so a second country could never reach its own. | A module installed into a world already under way carries **`chapter`** (the frontier sets it); `Endings.reached` and `running` consider only endings of the campaign's own modules. Endings now latch per installation (a module-local `concluded()`), keeping "the first of a module's endings to hold". A chapter's epilogue is told as it happens, and the world goes on. | `test/milestones.test.ts` (an ending in a chapter); `test/ending.test.ts`; the world-entry journey checks the flag |
| E3 | A weary company set upon mid-fight by the ebb-runners | `Invalid creature conditions`: `Battle.encounter` added `weary` to a fighter who already carried it (laws were de-duplicated; weariness and readiness were not). Any weary company could crash a fight. | Each of law, weariness and readiness is added once. | The ebb-runner failure journey |
| E4 | "Deckle puts the casket in your arms." | The page said "Ivo gains 1 the deeds of the held." | A single named thing taken reads "Ivo takes the deeds of the held." | journeys |
| E5 | "Ivo and the Ninth Assessor each gain 300 experience" | Merged experience lines kept each name's sentence-initial capital: "Ivo and The Ninth Assessor". | Names after the first keep their articles in lower case. | narration tests |

## Worked round in the module

| # | The design said | What Kyr made me write | Proposed remedy |
|---|---|---|---|
| W1 | News of the city reaches the protagonist in the city, not under the sea (the Road's F9, still open) | A rule's `says` is told wherever the company is: under the sea, in the Holding. Every news rule now carries `and inTessary()`, a query over a `cityRoom` fact asserted for 26 rooms, so a company that was below hears it when it comes up. | `says … to whoever is within tessary`, scoping a rule's words to an area, deferred until the company is there |
| W2 | A place described in full the first time and briefly on return ("don't replay unchanged paragraphs") | `been(company, place)` is already true on the first arrival (the rule that sets it runs before the description), so nothing distinguishes a return. The module keeps `visitedNow`/`visitedBefore` itself with two rules, and gives thirteen places a short form. | A `returned(company, place)` fact, or a narrator that tells a place shortly when nothing in it has changed since it was last told |
| W3 | Pounce sells the draft; Nan hands over the coat; Deckle puts the casket in your arms | An item `hidden until` a fact appears on the floor and needs a separate bare "Take". To hand it over, each action takes a `recipient: member` parameter and `Resolve acquire(item, kind, recipient)`. | `Gives item to actor.` in an action's success, choosing the member as `take_item` does |
| W4 | A companion who remarks on a place (`Observe … near tally`) | Observations and events anchored `near` a companion never fire once the companion has joined: a travelling companion has no `at`. Lint says nothing (the Road's B5). Rewritten `at <room> when travelsWith(tally, party)`. | Treat a travelling companion as being where the company is, for anchoring; or lint the pattern |
| W5 | "a place other than the Ranks" | No comparison between entities (`?p != ranks`): a helper relation `heldRoom(ranks)` and `not heldRoom(?p)`. | `?p != ranks` in predicates |
| W6 | The fortnight's calendar | `day(clock)` counts from the campaign's start, not the country's arrival, and a placed country's clock is shifted by its installation time only for watch comparisons. The module keeps its own night counter, ticking at the two o'clock ebb, with a five-hour grace after arrival. | `day(clock)` relative to installation for a chapter, or a module calendar |
| W7 | "You said a minute. It has been forty minutes." | Arithmetic runs left to right: `watch(clock) * 10 - tallyWaitFrom(ossel)` works only because the start is stored already multiplied. | Precedence and parentheses (the Road's F1) |
| W8 | The Factor sees her own letter in your hand and says nothing | `owns(sault, sault_letter)` made her object and become *hostile*, which closed every conversation with her and turned her lightermen; the compromise ending became unreachable. Ownership was dropped and an observation says what she does instead. | An owner's objection that is not hostility (`Objects mildly`, or a separate `Resents`) |
| W9 | The Weights, bailiffs who seize the forsworn and cannot be fought | Two level-8 bronze constructs were dismantled by a level-3 companion cleric. A combat cannot express "irresistible"; the seizure is now a rule that carries the company up and bars the black wall to it. | A `Seizes` temperament: an assail that resolves as capture without a fight |
| W10 | A wall that shuts on the forsworn at once | `opening when` is maintained by rules, in file order; the seizure rule is in a later file than the wall's, so the wall shuts one watch later. | Openings evaluated after every module's rules, or on demand |
| W11 | News latched once, without a journal entry | A rule that `teaches` a fact puts the fact's text on the page before the rule's own words: "The Board of Moieties has voted on the Veterans' Settlement. At two in the afternoon the Board of Moieties votes…" (the Road's F17). Pure news now latches on a `spread(fact)` relation; only facts other content reads are knowledge. | Let a rule's words stand for the fact it teaches in the moment, keeping the fact's text for the journal |
| W12 | A seed-dependent lore check that a journey must pass | Failure can be retried at once (costing tide time and torch-light, which is the point), so journeys retry and relight. | none needed; noted for authors writing tests |
| W13 | Zero-argument queries (`lowWater()`) | Must be called with `()`: `lowWater(ossel)` fails "Unknown function or arity". Clear once known. | Document it in the guide |

## Bugs and surprises reported, not fixed

- **A placed country that joins the independent adventures changes which country an undrawn march holds.** The
  seed chooses among the independents that fit a terrain by hash modulo their number; adding a fourth that fits a fen
  reshuffles fen worlds. Existing tests pass, but a *saved* fen world whose east, south or west march has not yet been
  drawn could find a different country there after this branch is merged. See [07-integration.md](07-integration.md).
- **The headless driver performs a `Grave` action on the first choice.** The page asks first; journeys and the play
  tool do not. Harmless, but a test written against the page's double click will fail.
- **The narrator drops scene observations from the told exchange.** A remark that appears in the scene ("Are you in
  anyone's employ?") is not in the step's telling; tests should check what is offered, not the telling.

## What would be worth building next

1. **Scoped speech** (W1): the single change that would most improve every adventure's sense of an inhabited world.
2. **Returns told briefly** (W2): either a fact or a narrator policy.
3. **Gives** (W3) and **companion anchoring** (W4): both remove repeated boilerplate from every adventure with a
   companion or a handed-over object.
4. **Seizure as a temperament** (W9): bailiffs, tides, guardians, the law.
5. **A promise construct.** This adventure is about promises, and every registered promise is hand-written: a
   relation, a deadline rule, a "kept" rule, a "broken" rule and a forsworn consequence. `Promise id by party to x
   "…" until …, kept when …, broken: …` would make obligation a first-class thing an author can give a character,
   which several other adventures (Dagny's debt, the Road's licences) also needed.
