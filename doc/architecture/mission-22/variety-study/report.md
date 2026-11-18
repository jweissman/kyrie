# Story-shape variety: a design study (M22, 18 November 2026)

This answers the owner's commission in [brief.md](brief.md). It is a study: nothing in `src/`, `data/` or `test/` was changed. Supporting counts are in [inventory.md](inventory.md). The one headless proof is `/var/tmp/kyrie/variety-scratch/shape-proof.ts` (output in inventory §D). Evidence was read on branch m22 at 275f15f8.

The evidence read:
- the boredom census and its brief;
- the opportunity-depth census;
- the atlas study;
- the adventure-structure brief (untracked in the owner's checkout);
- cold plays 2 and 3 on Iscoed's drove road;
- the goings-on, kits, situations and generation templates;
- `src/world/compose/` and `src/world/world-assembler.ts`;
- `doc/history/architecture-2026-10/composition.md` and `doc/history/activation/deem-variation.md`.

## The judgment in brief

1. **What repeats is the shape of the problem, not mainly its words.**
   - The census's line-level fixes (BO-02, BO-03, BO-08) were right, and repeat % fell in every region.
   - What remains is structural. A generated first hour is mostly one situation shape, "a creature at a locked place, paid by a stock townsperson". That shape has one cause, no development of its own, and the same consequence whatever the approach.
   - Across worlds, the first town is close to one authored town under different names. Its three jobs, its cast and its quarrel are the same in every seed (inventory §A, §C).
2. **The variation that would help most is causal and developmental, not surface.**
   - Causal: a different underlying problem, discovered rather than told.
   - Developmental: the problem changes if the company delays or leaves.
   - Each causal variant should move the *crux* of the situation into a different family of intention, so that it calls for a different kind of act.
   - Capability differences then matter naturally: a thief, a mage and a warrior find different ways into the same cause.
3. **Most of this can already be written.**
   - The fellowship (four causes, four cures, drawn by Deem facts) is the working precedent.
   - The works' histories (fall, successors, present) are a second precedent.
   - Kit modules meeting at a role interface (hold × folk) are a third: these are composable sub-scenarios.
   - The iscoed goings already pass consequences between modules by imported facts (`iscoed-gate.scenario.json` imports `drove.altered`).
4. **The key genuine limitation is that the assembler cannot see people.**
   - The ledger knows places, roads and powers only (`data/assembly/vocabulary.kyr`; `Geography.read`).
   - So the owner's two example requests cannot be asked of a real world, although the binder and proposer answer them correctly once the facts exist (proof, inventory §D).
   - The second limitation: the ledger is an assembly-time record. Nothing the player does reaches it, so no situation placed later can be built on a consequence.
5. **The experiment is data only.**
   - Give the undertown's corn-store two more causes, beside the rats, as options of the existing `store` group.
   - Measure whether blind players and the headless census see different situations: a different crux family, a different consequence, readable without contradictions.
   - Keep Iscoed's golden route on the rats so the cold-play loop is not disturbed.
   - Only if that succeeds, test the one new capability: people and relationships projected into the ledger.

## 1. Diagnosis: what is actually repeating

The brief's eight causes, each with what the evidence shows.

| Cause | Present? | Evidence |
|---|---|---|
| Repeated narration | Reduced, still present | BO-02 (journey lines 84 → 37), BO-08 (mornings), BO-09 (the bell), BO-10 ("Ask … again") in `boredom-census.md` |
| Repeated scenery, objects, characters | **Yes, across worlds** | the first town's cast is fixed by name in every generated world: Isaure Venn, Brother Anselm Tarr, Hesper Lowe (`neighbours.kyrt:8-13`); Orla, Wimble, Wystan, Aldous Fenn (`outskirts-deep.kyrt:8-13`). Within a town, two different "tally-sticks" (`data/origins/drove/origin.kyr:8`, `neighbours.kyrt:136`; cold-2 T72) |
| Repeated situations with different names | **Yes: the dominant cause** | the undertown's three trouble groups have one option each (`undertown.kyrt` `store[rats] yard[dead] pit[spiders]`). Every generated first town has the same three jobs, paid by the same three stock roles (merchant, priest, innkeeper). Dens (two instances), brood-hollow, unquiet-tower and most works' `present` options are the same shape again (inventory §B) |
| Repeated choices and action sequences | Yes, within the job grammar | notice → ask the payer → key → locked way → fight → deeper fight → search → paid (inventory §C). Cold-2: "Jobs loop feels good: notice -> ask -> descend -> fight -> loot -> paid." Good the first time; by the third it is a procedure |
| Repeated outcomes regardless of approach | **Yes** | rats fought, poisoned, slept or burned: the same 10 coin, lantern, oil and `grateful` (`undertown.kyrt:201-208`). Two remarks remember the method (ratsbane smelt, a door docked). The drove: freed by evidence, by the altered book or by paying, and Bran goes the same way; `turned(clerk)` is read only by a milestone and by the gate's reeve topic |
| Empty interactions | Yes, partly product | 138 `talk_to`, one taught; 13 searches, 2 found anything (census baseline). Influence is 16% of authored acts and almost never reaches the four (atlas §3.1, §6.1) |
| No consequential development over time | **Yes** | 13 of 18 situation modules have no rule on the clock (inventory §B). The rats, the dead and the spiders wait for ever. The iscoed goings have one clock each, with one outcome. Cold-2's best structural moment was a development: "the world moved without me … Now I feel a race". It then failed to be enacted: the diggers were never met (cold-2 defect 18) |
| No new abilities or kinds of challenge | Yes | new verbs come from places (252), tools (20) and companions (2); none from a lesson (census, BO-04). Wonder is never offered (opportunity depth: 2.38% of runs) |

### The three dominant causes

1. **One shape, many places.**
   - A generated hour is built mostly from "creature at a locked place". Its variations are nouns: species, count, the payer's name, the key's name.
   - The fellowship is the only module in the corpus with more than one cause (inventory §B).
   - Deem tables and `.kyrt` options were built to vary nouns, and they do that well. Nothing yet varies the problem.
2. **Static problems.**
   - A problem that does not change while the player is away leaves no anticipation and no reason to choose between jobs; order does not matter.
   - Consequences that do not differ by approach remove the point of choosing the approach.
3. **The same first town everywhere.**
   - This is felt less in one cold play than across the owner's many plays: the owner meets Isaure in every country.
   - Its writing is good (cold-3: "The writing in this town is genuinely good"), which is why its sameness is a waste.

### Not boredom, but read as boredom

The cold plays complained less of repetition than of incoherence:
- aims arriving all at once (cold-3 T1);
- the pursuit not leading (cold-2 defects 2–3);
- a job paid while its foes still stand (cold-3 T64);
- clues arriving after the fact (cold-3 T73);
- combat that a warrior keeps losing.

Incoherence makes a situation unreadable. An unreadable situation cannot become interesting through variation, because the player cannot tell one variant from another. **Coherence is a precondition of variety, not a competitor of it.** The first-hour work in hand is therefore the right first step. §10 lists the coherence defects this study met.

### When repetition is good

Recognising the job grammar is mastery. By the second job the player knows to ask, take the key and bring a light. That familiarity should be kept.

Repetition becomes boredom when the recognised pattern also predicts the *answer*. "It is rats; rats are fought" is an answer the player already knows. "It looks like rats; is it?" asks a question.

So a recognisable shape should keep its surface and its first step, and vary what lies under them. That is the rule the examples below follow.

## 2. The variation that would most improve the experience

Ranked by expected effect on felt variety per unit of authoring:

1. **Cause, discovered.**
   - The same visible trouble, with two to four authored explanations. One is plain and common; the others put the crux in a different family of intention:
     - investigating (who did it);
     - influencing (who must be persuaded);
     - protecting (who is in danger);
     - exchanging (what it costs);
     - confronting (who must be stopped).
   - The player learns which explanation holds by acting. This is the fellowship's pattern (`deem-variation.md` §3).
2. **Development on a clock, with a visible sign.**
   - One or two autonomous steps if the company delays: the merchant sells the store; the drove is sold; the culprit flees.
   - Each step is said where the company will be, and changes what can be done.
   - This gives anticipation and makes order a choice.
3. **Consequence by approach.**
   - Different persistent facts depending on how the problem was solved, read later by another situation. For example: the merchant who was told the truth about his apprentice; the reeve told of Mardle.
   - The iscoed reeve topic is the precedent (`iscoed-gate/situation.kyr:81`).
4. **Participants from the world, not from the module.**
   - The culprit, creditor or rival is someone already there: a generated resident, a fellow, a stock role.
   - Repetition then becomes relationship ("Auron again").
   - This is the one that needs new capability (§4).
5. **Surface.**
   - Species, loads, names. It is already well served. Its marginal value is low, and it is the only scale whose effect the census can see.

### Through the atlas of intentions

A variant counts as a different gameplay variant if, and only if, it changes at least one of these:
- the *family of the crux act*: the act that resolves the problem (the atlas's twelve families, `atlas-study/report.md` §3.2);
- what is shown before the choice;
- the persistent consequence.

Under this test, the undertown's three jobs are one variant three times: crux family confronting, consequence coin and gratitude. The fellowship's four causes are four variants:
- proud: influencing;
- sold: exchanging and investigating;
- lapsed: conversing and understanding;
- fallen: protecting and tending.

Capabilities then matter without the module having to target them. A cause whose crux is influence favours a bard or an aristocrat. A cause whose crux is a night watch favours a thief or a ranger. The warrior is not shut out, because the plain cause is always there. This answers the brief's §5: the same circumstances, different possibilities recognised.

## 3. What the existing system already makes possible

| Capability the brief asks for | Status | Where |
|---|---|---|
| Roles that must be filled | **Supported** for places and powers | kit `slots` with `is`/`requires`/`prefers` (`compose/kit.ts:6`, `binder.ts`); scenario `places` (`world-assembler.ts:41`) |
| Constraints among roles | **Supported** over ledger facts | slot `requires` naming earlier slots; backtracking within 600 checks (`binder.ts:14`) |
| Preconditions for meaning | **Supported** | a kit is refused with a reason when unmet (`composer.ts:44`); scenario `context` and `fits` |
| Alternative causes or configurations | **Supported, two ways** | kit proposals with `_requires`/`_implies` (`proposer.ts`); module Deem `facts` choosing among guarded Kyr branches (fellowship) |
| A cause bringing its own participant | **Supported** at assembly | `_implies` (hobs imply the chapel they robbed) |
| Processes on their own | **Supported** in Kyr | `Rule … when watch(clock) >= n`, `Pursuit`, `Event`, `Occasion`, `Interruption` |
| Interventions and consequences | **Supported** in Kyr | Actions with `Resolve check/combat/invoke`, Topics, Milestones, Endings; facts exported and imported |
| What the player can discover | **Supported** | `Discovery … Found by`, `Observe … teaches`, signs, hooks (`KitWord`) |
| Composable sub-scenarios | **Supported, by convention** | kit modules installed `when` a proposal matches, meeting at a role interface (raider-hold's `gate, yard, hall, den …`: any hold houses any folk); module imports of another's exports (`iscoed-gate` ← `drove.altered`); scenario `links` (the drover's trail to the nearest den) |
| Surface variation | **Supported, abundantly** | Deem casting and labels; `.kyrt` options; ecology-drawn creatures |
| Several alternatives written once, chosen by the draw | **Expressible, inconvenient** | every topic and action of each cause guarded by its fact (fellowship). A variable count of people means parking extras in "Nowhere" (R47–R55) |
| A sub-scenario reusable without knowing its insides | **Expressible, inconvenient** | roles and exports in `module.json` say *what* is exchanged, not what an export *means* (an outcome, a failure, a fact learned). The parent must read the child's Kyr to know which export to react to |
| Kits for town and first-town content | **Expressible, unused** | kits are used only by the frontier framework (raider-hold, toll-road, bounty). The scenario library and the first town use the older `WorldAssembler.settle` and TypeScript-written `.kyrt`. These are two placement systems with two selector languages |
| Cross-world variety of the first town | **Expressible, not written** | add options to `--- store`, `--- yard`, `--- pit` and the cast; nothing in the engine needs to change (`undertown.kyrt:8-10` says so) |

## 4. Genuine architectural and authoring limitations

1. **The assembler cannot see people, possessions or relationships.**
   - The vocabulary has `power`, `holds`, `raids`, `tolls`, `buysFrom`, `chief`, `band`, and nothing about persons.
   - The runtime rules do have the vocabulary: `owns`, `lends`, `kin`, `inDebtTo`, `owes`, `credit`, `dealsIn`, `homeOf`, `believes`, `wants` (in `data/rules`). Generated towns assert little of it, mainly `dealsIn` and fellows' `kin`.
   - "Find a merchant between two settlements with something at risk and a conflict with an authority" is therefore unaskable. The proof shows the binder and proposer answer it correctly over twelve added relations, and refuse without rewriting where no such merchant exists.
   - **Needs:** generated people, trades, debts and quarrels committed to the ledger with provenance, as `Geography.read` does for places. Today the region is written as Kyr text by TypeScript (`RegionWriter`) before kits compose. The projection has to run either at writing time or by reading the written modules, as `Composition.region` already does for places.
2. **Assembly does not see play.**
   - `Composition.introduce` recomposes from the manifest and seed (`composition.ts:58`). It cannot require "a merchant the company made an enemy of" or "a town whose granary was saved".
   - A consequence can open a new possibility only if it was authored into the same module, or imported by a module written for it.
   - **Needs:** a read-only projection of chosen runtime facts into the ledger at introduction time. This is the capability that would let consequences create situations, and the owner's governing ambition depends on it.
3. **Kyr predicates cannot say that two variables differ.**
   - `?a != ?b` does not parse (found by the proof).
   - Any shape with two distinct participants of one kind (two claimants, two rivals) must carry the difference by a fact.
   - **Needs:** a small grammar addition.
4. **Deem chooses among authored structure; it cannot add structure.**
   - It cannot add a topic, action or room, or call a `.kyrt` (R51); nor choose an item's kind (R52).
   - **This is mostly right.** It keeps the author in control of every line the player reads, and it should stay.
   - The cost is that each cause is written in full. That is acceptable for two to four causes and not for twenty.
5. **No declared outcome contract for a sub-scenario.**
   - A reusable complication (a pursuit, a betrayal) needs to say what it requires (roles), what it can end in (named outcome facts: caught, escaped, bargained) and what it tells the parent while running.
   - Exports are untyped names today, and outcome meaning is a convention in comments.
   - **Needs:** at least a manifest field naming which exports are outcomes, so a parent and a review tool can treat the child as a black box.
6. **Per-instance context is thin.**
   - Deem sees one settlement's folk (R48); news travels to one neighbour (R49); one instance per country (R50).
   - Two instances of one scenario now draw differently: the module seed is keyed by the module id at `module-bundle.ts:329`, which appears to address R47. Not verified in play.

## 5. Three worked examples

Each example starts from an existing situation and asks it to become a shape. For each, five things:
1. the existing form;
2. surface variation;
3. causal variation;
4. dramatic variation;
5. compositional variation.

Then a few turns of play, and a judgment on whether the variants would feel different.

### 5.1 "Something gets in from below" (from the undertown's rats)

**1. Existing form.** `undertown.kyrt` `store rats`:
- the merchant's corn-store is locked, and rats come up from a nest over the old drain;
- two fights, ratsbane, Sleep or a firebomb; a hoard of grave rings;
- 10 coin, a lantern and oil;
- the same in every generated world.

**2. Surface.** Rats or ferrets; the corn-store or the wool-loft; grain or fleeces. Cheap, already supported. The player would not notice the difference.

**3. Causal.** The visible trouble is the same: losses from the store, gnawing, a trapdoor.

| Cause | Crux family | Who knows | What differs in play |
|---|---|---|---|
| **rats** (the plain one, most common) | confronting | the merchant | as now |
| **taken by the trapdoor**: the merchant's apprentice lets a buyer's men up the drain by night and blames the rats | investigating, then influencing | the apprentice; the innkeeper has seen sacks on the landing at dawn | the cellar has few droppings and a swept path; a night watch sees lantern-light; the apprentice can be confronted, shielded or bargained with |
| **driven up**: something larger has moved into the drain (the works' `present`), and the rats are fleeing it | protecting, venturing | nobody; the rats' run is reversed, they come *up* in daylight | killing rats does not stop it; the trouble is below, and the merchant's job grows |

**4. Dramatic.** One development each, on a clock:
- rats: none needed;
- trapdoor: on the third night the buyer stops coming, and the apprentice flees with his pay unless spoken to;
- driven up: on the second day the thing below takes the merchant's dog, and the notice gains a line.

Consequences by approach:
- the apprentice shielded becomes a contact who knows the drain;
- the apprentice exposed is dismissed, and the merchant is `grateful` with a harder price for the company that shamed his house;
- the buyer (the pierced-circle merchant already in `neighbours.kyrt`) is now `known` to the company.

**5. Compositional.** The same sub-scenario under the Water-Wardens' gatehouse at Gatesend. The gate-well's lost pawl was not dropped; it was taken up the outfall by eel-poachers, who use the gate-well as their way in, and the "rats" in the well are the poachers' noise. Here it is a complication inside the sea-gate's larger story, which keeps its own clock (the spring tide) and its own ending.

**Play (the trapdoor cause, a thief):**

> The corn-store smells of mice, but the floor by the trapdoor is swept, and the dust on the sacks is printed with a boot, not a paw. *Look closely at the trapdoor*: its bolt is greased. Ellis the merchant shrugs: "Rats. Ten coin." The company takes the key and waits in the dark of the cellar (*Watch the trapdoor until something comes*). Near midnight the trapdoor lifts from below. A lantern, two men with sacks, and behind them the apprentice, Coll, holding the light. A choice the rats never offered: step out; follow them down the drain; or let them go and tell Ellis in the morning. The thief follows. At the drain's mouth on the river, a boat with a pierced circle painted on its bow.

**Play (the same cause, a warrior):**

> The warrior does not notice the boot-print (perception fails), goes down, and finds three rats, which are killed. Ellis pays half. Two nights later the notice has a new line in Ellis's hand: "MORE GRAIN GONE. TWENTY COIN." Now the plain answer has failed in public, and the warrior must find out why. The innkeeper, asked, mentions sacks on the landing at dawn.

**Would it feel different?** Yes.
- The trapdoor variant changes the crux family (investigating, then a social choice about Coll), what is shown first (a swept floor), and the consequence (a contact or a dismissal, and the buyer known).
- The warrior is not shut out. The plain approach fails visibly, and the development tells them so.
- The "driven up" variant is weaker: it is still a fight, only deeper. It differs in protection and in the job's scope, and should be the rarest of the three.

### 5.2 "Held on a charge" (from the held drove)

**1. Existing form.** `goings-on/iscoed-drove`:
- Mardle holds Bran on a count of forty against thirty-six;
- the boy Owain knows of the four drowned bullocks; the tally-book shows a written-over figure;
- pay twelve crowns, show the drowned beasts, or show the altered figure;
- on the clock (576 ticks) Bran is sent north and the drove is sold;
- the reeve can be told afterwards (the gate module).

It is the best-made situation in the first hour: cold-3 called "telling the reeve" its best payoff before the ossuary.

**2. Surface.** Cattle or sheep or salt-carts; a customs clerk or a toll-reeve; the march-stone or a bridge. Supported by labels. Unnoticed.

**3. Causal.** Roles:
- the accused, held;
- the accuser, an authority's agent;
- a dependent witness;
- a place of evidence;
- the goods at stake;
- a superior authority.

| Cause | Crux family | What the evidence shows |
|---|---|---|
| **fraud** by the accuser (as now) | investigating → influencing (the superior) | drowned beasts; altered book |
| **honest miscount** (the accuser counted strays that joined the drove at the ford) | understanding; conversing | four beasts in the pens carry another farm's brand; Mardle is not lying, and is embarrassed, not dangerous |
| **the accused is guilty** (Bran sold four on the way to pay a debt to the Guldríce factor, and the boy lies for him) | influencing; protecting (the boy) | no beasts in the rhyne; the boy's story changes when asked twice; the factor's receipt in Bran's cloak |

**4. Dramatic.**
- The clock stays. A second step is added for the guilty cause: on the second day the factor comes to the customs-house to buy the drove cheap, and the boy goes missing.
- Consequences differ in kind:
  - fraud: Mardle turned, and the reeve audits (as now);
  - miscount: Mardle grateful, and the customs-house a friend that tells the company of the next drove;
  - guilty: the company either pays Bran's fine knowing he is guilty (Brynach welcomes them, the reeve does not) or lets him go north (the boy becomes the company's charge, a companion candidate).

**5. Compositional.** The same shape in the pans. Ianto the boatman is held by the reeve's men for carrying ridge wood that is the reeve's (the cold players found "the ridge wood is the reeve's" already said). The fuel boat is late not because of his arm but because he is in the reeve's lock-up. Here "held on a charge" is a sub-scenario inside "a delayed delivery" (5.3), and its outcome (Ianto freed, fined or condemned) is the parent's fact of whether fuel can come.

**Play (the honest miscount, a commoner):**

> Owain says thirty-six; Mardle says forty, and turns the book so you can see it: the ink is even, the figure plain. In the pens, *Look over the drove*: four of the bullocks are smaller, red-coated, a ring cut in each ear — not the Brynach brand. Owain flushes. "They came on at the ford. We couldn't drive them off in the dark." *Tell Mardle the four are strays from the ford*. Mardle looks at the ears a long time and laughs, once. "Then they're not Bran's, and they're not hidden, and I've a farmer at Hafod to find." Bran is let out. Mardle, at the door: "If you're going up the drove road, the farmer at Hafod will pay for his beasts brought back." A new aim, from an authority who is now on the company's side.

**Would it feel different?** Yes, and it is the clearest test of the approach.
- The fraud variant is about exposing a man in power.
- The miscount is about understanding a situation in which nobody is a villain.
- The guilty variant is about whether to help someone who is in the wrong.
- These are three moral situations, not three puzzles.

One caution. The drove is the *golden route* and the cold-play baseline. It should stay fraud in Iscoed until the first-hour gate is passed. The shape is better proved in a generated town (§8).

### 5.3 "A journey interrupted" (from the cold pans; the owner's stranded cart)

**1. Existing form.** `goings-on/iscoed-pans`:
- the fuel boat from Reedbridge is two days late;
- Ianto the boatman has broken his arm;
- pole the boat down yourself, or carry the charcoal;
- the brine spoils at three days;
- Holgar pays and is grateful.

The crux is handling and venturing. The cause is told by the first person asked.

**2. Surface.** Boat, cart or pack-train; charcoal, salt or oil; ox, pony or mule. This is the owner's "different load, traveller, animal". It is unnoticed unless the animal is itself an act (an ox that will not cross the ford is a small handling puzzle; that is surface turned into an approach, and worth having).

**3. Causal.** Roles:
- the sender, the carrier and the receiver with a deadline;
- the route;
- the cargo;
- an interested party.

| Cause | Crux family | Who knows |
|---|---|---|
| **accident** (as now) | handling, venturing | the carrier |
| **coercion**: a band has made the river its own and takes a toll in cargo (the existing toll-road kit's power, bound to the waterway) | confronting or exchanging (pay, fight, or find the back channel) | the carrier, afraid to say; the band itself |
| **held on a charge** (5.2's sub-scenario: Ianto carried the reeve's wood) | influencing the authority | the reeve's men |
| **sabotage**: the factor who wants the pans cold, to buy the season's salt cheap, has paid the burners not to sell | investigating; exchanging (outbid him) | the burners at the ridge; the factor's clerk |

**4. Dramatic.**
- The three-day clock stays.
- Under sabotage, on day two the factor offers Holgar a price for the salt, and Holgar, desperate, considers it. Said in the salt-house, where the company will be.
- Consequences differ:
  - the band on the river either broken (the river road safe for the region: a ledger fact other kits can use) or paid (it grows);
  - the factor exposed (he leaves Porthalen; the crown-buying thread elsewhere changes price) or outbid (Holgar in the company's debt).

**5. Compositional.** "A journey interrupted" inside the dragon commission. The royal proclamation's supply cart to Dun Rìerdan is late. Its cause, drawn from the same three, decides whether the road west is held by a band (a fight before the dragon), closed by the reeve (a permit to win), or simply broken (a wheel to mend at a hamlet that then becomes a place to rest).

**Play (coercion, a mage):**

> At Reedbridge staithe the boat is full and tied up. Ianto's arm is not broken. He will not look at the river. "I'm not going down while they're on the bend." *Ask Ianto who is on the bend*. Three men with a chain across the water at the old weir, taking a sack in four. The mage cannot fight three men alone, and the chain is iron. But the weir has a mill-race, and the race a sluice: *Have Wenna cast Knock on the sluice-gate*. The race opens, the boat goes down the mill-channel behind the weir, and the men on the bend shout after it. The pans are lit by nightfall. The band is still on the river, and now it knows the company.

**Would it feel different?** Yes, for coercion and sabotage. Accident and "held on a charge" are close kin in feel (an obstacle and a person to deal with). That suggests three causes is the useful ceiling here.

### What the three examples show together

- **The variants that feel different are the ones whose crux moves family.** A variant that keeps the crux family and changes only scope or scenery (5.1's "driven up", 5.3's two near-kin) is weak, and should be rare or cut.
- **The plain cause must stay, and stay common.** It keeps the shape recognisable and gives every calling a way in.
- **Sub-scenarios compose where their roles are filled by the parent's people and their outcome is a fact the parent reads.** "Held on a charge" fits inside "a journey interrupted" with no new machinery: the parent imports the child's `freed`/`sent`, as `iscoed-gate` imports `drove.altered` today.
- **The literary identity stays with the parent.** Iscoed's voice, its brine and charcoal, its customs-men in the Rì's blue, belong to the module that installs the shape. The shape owns only its roles, causes, clock and outcome facts.

## 6. The proposed relationship among Kyr, Deem, assembly and world facts

Four layers, each authoritative for one thing:

1. **Persistent world facts are authoritative.**
   - These are region modules, histories, generated people and what play has made true.
   - Nothing below may rewrite them.
   - They should be projected (read-only, with provenance) into the assembly ledger. That means people, possessions, debts, claims and quarrels as well as places and powers.
2. **Assembly constraints decide *whether and where* a shape can stand.**
   - A shape's roles are kit slots: Kyr predicates over the ledger.
   - It may *establish* only facts that contradict nothing committed: a new debt, a new rivalry between people with none.
   - It is refused, with a reason, when its roles cannot be filled. "Refused, never rewritten" is the existing contract (`ledger.ts`, `composition.md`) and must stay.
3. **Deem decides *which authored configuration* holds.**
   - It chooses the cause, among the author's two to four, constrained by `_requires` on the bound roles (a seizure only if there is a debt), and possibly bringing a participant by `_implies`.
   - It also chooses surface particulars.
   - It never writes structure or prose the author did not write.
4. **Kyr modules are the dramatic machinery and the voice.**
   - The shape is a module (or kit modules installed `when` the cause matches), with roles in and outcome facts out.
   - Each cause's discoveries, acts, clock and consequences are authored Kyr.
   - The installing adventure supplies the voice through labels and its own surrounding text, and reads the outcome facts.

### The boundary between machinery and identity

The reusable shape owns:
- its roles and their constraints;
- the set of causes and which family each puts the crux in;
- the clock and its steps;
- the outcome facts;
- the minimum each cause must let the player discover before the crux. That is the brief's "requirements for what the player can discover", and it maps onto the Story/Incident brief's `shown by`.

The adventure owns:
- every sentence a player reads that carries tone;
- who its people are, where it binds them;
- which causes it allows: an adventure may fix one, as Iscoed should fix fraud;
- its ending.

**A shape is never installed on its own.** It always sits inside an adventure, a town or a going-on that gives it a voice and a reason. That is the guard against "interchangeable procedural pieces".

### Relation to the adventure-structure brief

That brief proposes a non-runtime `Story` block with one `Incident` and its `Beat`s, checked against a played journey. The two fit:
- each cause of a shape is a different Incident with its own revelation Beat;
- the journey-review artifact is how two variants are compared (what was shown before each choice, what was chosen, what changed).

This study adds no syntax to that proposal. It asks only that the brief's later `Approach` element, when it comes, record the family of intention of the crux act. Then "do these variants differ?" can be read from two journeys.

## 7. The authoring experience

- **Defining a shape once.** An author writes the roles (kit slots), two to four causes (each a guarded branch or a kit module), one clock, and outcome exports. The fellowship took one data-only branch (`deem-variation.md`, "no TypeScript changed"). The cost is prose per cause, which is where the author's care should go.
- **A reusable complication others can use.** Possible today by convention. It would be practical with one small addition: a manifest list of which exports are outcomes, with a sentence each. Then a parent author imports `pursuit.caught` without reading the pursuit's Kyr. The trace (`compose/trace.ts`) already tells an author why a shape was placed or refused; that is the right explanation tool and needs no change.
- **Telling variants apart.** A "variant diff" over the journey-review artifact: the same shape, two seeds, side by side. It shows the first-shown beat, the crux act and its family, the consequence facts, and the line count unique to each. Variants that share a crux family and a consequence are flagged as one variant. The boredom census could add one column for this: distinct situation signatures (shape, cause, crux family, consequence) met per hour.
- **Control.** The author may fix any cause, slot or dimension (kit `fix`, already supported). An adventure that needs its story exact simply fixes it. Variety is opt-in per situation, never imposed on authored adventures.

## 8. A small experiment

**Name:** three causes under the corn-store.

**What changes (data only):**
- Two new options in `data/generation/town/undertown.kyrt`'s existing `store` group, `store trapdoor` and `store driven`, beside `store rats`.
- Each about 120–180 lines of Kyr, written as 5.1 describes. Each has its own notice line, its own discoveries before the crux, one clock step, and a consequence fact the merchant and one other townsperson read.
- `rats` keeps the highest weight.
- No TypeScript, no grammar, no new kit.
- The golden route is held: Iscoed is kept on `rats` by a section condition (`if`/`unless` on a value the region writer already passes, or one added there). The first-hour cold-play loop is not disturbed.

**Fixtures:** five generated worlds (a1, kite, thorn, b2, ember: the census's). Three callings (warrior, thief, mage), at seeds that draw each cause at least once. Make the draw fixable for the test, as kits' `fix` does.

**Measures, before and after:**
1. *Distinct signatures:* the store job's (cause, crux family, consequence fact) across fixtures. Success: three signatures, two crux families besides confronting.
2. *Capability difference:* for each cause, whether at least two callings resolve it by different crux acts (headless journeys, `bin/kyrie read record`). Success: yes for both new causes.
3. *Readable cause:* blind cold readers, given two transcripts of the store job (names normalised), say what the problem was and what they did. Success: they describe different problems and different solutions for different causes, and the same for the same cause, in at least four of five pairs.
4. *Development seen:* in journeys that delay, the clock step is shown where the company is, before the consequence lands. Success: shown in every delaying journey.
5. *Coherence:* zero contradictions. This is a journey invariant: no payment while any person the job names is still able, and no clue offered after the thing it points at is resolved. It also fixes the two defects in §10.
6. *Cost:* lines of Kyr per cause and the author's hours, recorded. Success: under a day per cause, including a pin.
7. *No regression:* census repeat % and dead % not worse in any region. Iscoed's cold-play transcript unchanged.

**Adopt** (and write causes for `yard` and `pit` next) if measures 1–5 succeed.
**Drop** if readers cannot tell the variants apart (3), or if the new causes are resolved by the same crux act as the rats (1, 2).

**Only then, phase two:** project generated people and a few relations (`dealsIn`, `kin`, `inDebtTo`, a new `quarrels`) into the ledger, and place one kit ("merchant with something at risk", as in the proof) in one generated region. This is the one new capability; it should be measured the same way.

## 9. Risks

- **Over-abstraction.**
  - A shape so general that its prose becomes "the {pest} in the {store}".
  - Guard: a shape owns no tonal prose. Every cause is written by an author for a register. A shape always sits inside something with a voice.
- **Procedural sameness at a higher level.**
  - If every trouble has three causes and the plain one is never true, players learn "it is never what it seems", and the twist becomes the new predictable answer.
  - Guards: keep the plain cause the most common; let many troubles have one cause; keep causal variety to the situations where the crux really changes.
- **Hidden variation.**
  - A cause drawn but shown the same way until the end is wasted, and reads as arbitrary when revealed.
  - Rule: a cause must change what is shown *before* the crux (the swept floor, the red ear-ring), or it does not count.
- **Contradiction across modules.**
  - Independently authored modules already collide in names (two tally-sticks) and in claims about the same people. More shapes binding the same residents will collide more.
  - Guards: the ledger's refusal, plus a `taken`/`engaged` fact per participant (the proof's `engaged`), so one resident is not the villain of two shapes at once.
- **Aims all at once.**
  - More situations with clocks multiply cold-3's first complaint: unrelated aims arriving together.
  - Guard: shapes are placed to be *met*, not announced (hooks, signs), and OR-74's stories-apart ordering must hold.
- **Golden-route instability.** Variation on the route the cold-play loop measures would confound it. Fix the route's causes until the first-hour gate is passed.
- **Test and review burden.** Each cause is a path to pin. Keep causes few. Pin each by one narrow feature pin (`test/features/<pillar>/…`), not by journeys over every combination.
- **Displacing first-touch work.** Phase one is a few hundred lines of Kyr. Phase two is the first point at which engine time is spent, and should wait for the first-hour gate.

## 10. Defects worth fixing now (first hour)

Met while reading, each at its cause. These are coherence defects, and a precondition of any variety.

1. **The charnel passage's dead stand after the candle is out.**
   - `{t}_u_dead_lie` (`undertown.kyrt`, the yard section) lays only `{t}_u_dead`. The `{t}_u_shamblers` in `{t}_u_charnel` (`undertown.kyrt:476`), described as "the raiser's first tries", keep standing.
   - The priest pays for "the dead under the churchyard are laid" all the same (cold-3 T60–T64: "the charnel zombies are still standing; paid anyway").
   - Fix: lay the shamblers with the candle, or say in the snuffing line that the first tries were never the candle's, and name them in the job.
2. **A clue offered after the thing it points at is resolved.**
   - `{t}_u_dead_lodger_ask` (`undertown.kyrt:279`) has no `not {t}_u_done({t}_u_raiser)` guard. The innkeeper tells of the lodger with grave-dirt on his boots after the company has already sent him away (cold-3 T73).
   - Fix: guard it, or give a done-form ("The lodger in the back room left before light, and owed nothing").
3. **Two "tally-sticks" in one town.**
   - Bran's (`data/origins/drove/origin.kyr:8-9`) and the dead man's "notched tally-stick" in the taproom (`neighbours.kyrt:136`). Cold-2 T72 confused them.
   - Fix: rename the taproom's ("a stick notched in oak-counts", or "the scaler's tally").
4. **The paid job tells what the player never learned.**
   - `{t}_u_dead_job_paid` ("…and who raised them") is offered when the raiser was talked down, though nothing in that path teaches who he was (cold-3: "I never learned who the raiser was").
   - Fix: require the lodger fact or the book read, or word the topic without the claim.
5. **Not a play defect, for the record.**
   - Kyr predicates cannot express `?a != ?b`.
   - The binder's refusal reason says "no place is …" for slots that are not places (`binder.ts`, `reason`).
