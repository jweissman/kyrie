# Kyr modules as authored, evolving situations

Design investigation, 17 October 2026. This document proposes semantics and illustrative syntax; it does not describe implemented language features. No runtime or crossing source changes accompany it.

**Recommendation:** author a bounded conflict with explicit decision policies, evidence, deadlines, and aftermath. Use short NPC plans to execute those policies. Recognize dramatic developments from committed consequences. Do not make an act graph the authority over events.

The information a human GM extracts from an adventure is not just its map and statistics. It includes **why the conflict matters, whose concessions are possible, which information changes which decisions, what happens without intervention, and which consequences must survive a convenient ending**. Kyr needs a small executable account of those things, not a procedure for producing whatever scene seems dramatic next.

## 1. What the current implementation can and cannot provide

The existing [crossing](../data/modules/crossing.kyr) supplies grounded actions, one objective, and a deadline. `parley` consumes a ration and asserts an alliance and an open bridge. Those consequences are declared by the solution operator; they are not inferred from a captain's interests, authority, or agreement. `recover` moves cargo without modeling a carrier's decisions. The example has alternative paths but little independent human causality.

The earlier design memo repaired logistics but left a product gap: a physically coherent route, inventory, and exchange system does not explain why someone keeps a blockade after receiving food, why a true accusation changes an institution, or why saving the grain might still leave a bitter village.

What is worth retaining:

- [World](../src/lang/world.ts) provides structured facts, exclusive relations, quantities, acyclic derived queries, and copy-before-apply changes. A published claim, an obligation balance, or a discovered document can use that storage.
- [Planner](../src/campaign/planner.ts) performs bounded uniform-cost search over explicit preconditions and success changes. It can find a short means to a supplied objective. It cannot invent meaningful objectives, preferences, concessions, actions, evidence, or consequences.
- [ModuleCompiler](../src/lang/module-compiler.ts) validates references and resolves generation-time DEEM values once. Preserve that distinction from runtime rolls.
- Creature generation, stable identities, leases, and combat commit now preserve PCs and inhabitants. A central character's death can be a real fact with continuing consequences; an act transition must never regenerate them.

Current limitations relevant here:

1. Actions are grounded; only queries have typed parameters. There are no actor action schemas, NPC controllers, perception model, world clock scheduler, or dramatic monitors in the module language yet.
2. Search assumes every operator's success branch. Combat, persuasion, and uncertain evidence are not guaranteed transitions merely because search finds a path.
3. Search omits no-op transitions. Waiting cannot currently advance a pressure unless clock state actually changes. Including elapsed time in the search key does not itself run external deadlines.
4. Absent relations mean false. That works for declared objective facts; it is unsafe for an NPC's incomplete knowledge. Not knowing a document exists cannot mean knowing it does not exist.
5. [Campaign](../src/campaign/campaign.ts) stops accepting actions after its single success/failure outcome. That is a demo controller policy, not a suitable definition of an adventure's aftermath.
6. [Modules.generate](../src/campaign/modules.ts) selects named solution approaches and rejects candidates without an optimistic symbolic plan. That constructs solvable puzzles. A dramatic module may intentionally offer no cost-free resolution, and its validity should not depend on a favored player plan.

## 2. Three architectures, with different products

| Model | Author supplies | Engine responsibility | Strength | Principal cost |
|---|---|---|---|---|
| A. Situation plus autonomous agents | People, beliefs, resources, competing goals, action capabilities and preferences | Select goals, plan, perceive, negotiate and continue offscreen | Consequences can propagate beyond anticipated scenes | Social behavior and salience become a large simulation problem; mechanically reasonable actions can be repetitious, inert, or implausible |
| B. Authored dramatic progression | Situations/acts, guarded transitions, developments, contingencies and outcomes | Recognize eligible transitions and execute explicitly authorized consequences | Strong control over what the adventure is about; relatively easy to inspect and test | Contingencies multiply; scenes become brittle if progression secretly assumes a living villain or an unrevealed secret |
| C. Authored situation with bounded agency | Conflicts/stakes, finite NPC decision policies, evidence, pressures, optional developments and outcome predicates | Execute ordinary actions, short plans and scheduled rules; classify consequences | Supports recognizable authored conflicts without prescribing player commands | Requires disciplined separation of observation, institutional rules and NPC initiative; can become B disguised as A |

A is attractive for a persistent sandbox where broad systemic play is the product. It differs from an ordinary roguelike only if goals, beliefs, obligations and constrained choices actually affect decisions; naming monsters and adding a faction reputation number is insufficient. It is not the smallest route to a reliable GM for a particular adventure.

B is appropriate when a module promises designed set pieces or primarily conversational scenes. It differs from a quest state machine when predicates recognize many causally equivalent histories and situations may overlap, fail, or never activate. It remains scripted interactive fiction if a transition requires a particular dialogue line, restores the antagonist, or withholds a physically present exit until the confrontation scene.

C is preferable **for the bounded-adventure goal stated here**, because the crossing's essential decisions are authorable and few, while combat, payments, disclosure and delivery should remain open to general actions. This recommendation would change if compelling play primarily required unbounded faction strategy or highly staged scenes. A hybrid with an unrestricted NPC planner and an elaborate act director would combine the costs of A and B; reject that version.

The proposed hybrid has no obligation to produce a climax. A player who quietly pays the debt can prevent the confrontation entirely. The result is a changed situation, not a failed story generator.

## 3. Minimal executable model

Most proposed narrative nouns do not need new kernel constructs.

| Authoring concept | Exact meaning | Minimum representation / novelty |
|---|---|---|
| Goal / priority | An actor's desired predicate, activation predicate, priority and allowed methods; selects an intention, never changes the world | Controller configuration around existing predicates; actor binding and selection policy are new, the predicate is not |
| Belief | An actor holds a grounded proposition as true or false with a source, or has no position | Ordinary records plus a new restricted-view adapter; private world facts are not automatically copied into it |
| Claim | A speaker asserted a proposition to specified recipients | A dated communication record; neither truth nor audience belief follows automatically |
| Secret / evidence | A private truth, established carriers of information, and rules by which inspecting/presenting those carriers supports a proposition | Mostly ordinary facts. A typed proposition/reference and evidence-validation procedure are needed; no universal `revealSecret()` primitive |
| Obligation | Debtor, creditor, outstanding quantity, due time and authorized representatives; payments/waivers amend it through rules | Typed facts and reusable procedures; it does not force obedience or cause future money to appear |
| Conflict / stakes | Named competing objectives and outcome dimensions, with explanatory text | Annotation and queries. The machine uses explicit objectives and policies, not prose interpretation |
| Pressure | A clock-dependent need, announced intention or established hazard | Scheduler plus ordinary state. A dramatic label alone has no effect |
| Phase / act | A current classification predicate | Derived query, potentially overlapping. A historical entry needs a monitor latch, not an exclusive story-state variable |
| Development | Record the first committed state satisfying a condition, with supporting event/state references | Small new observer facility: persistent once/per-instance key and provenance; no physical writes |
| Outcome | A predicate over current state and/or recorded deadline snapshots | Query/report. Several may hold; none automatically ends simulation |

Only three genuinely new orchestration contracts are proposed: **a bounded actor controller, a knowledge-view adapter, and a once-only development observer**. They depend on reusable actions and a minimal clock boundary; those foundations remain necessary. Do not add eleven unrelated runtime subsystems because eleven readable nouns appear in a module.

### Decisions, not personality simulation

An NPC policy contains:

- Why a goal matters, in prose for presentation and author review.
- A small ordered list of activated goals, unacceptable methods, and actual acceptance policies.
- Named sources of authority and constraints on using resources.
- A fallback if the next action is impossible: observe/report the obstruction, choose another applicable goal, or wait.

Motives and fears are not magical latent variables. “Fears another civilian death” matters here because Mara will not authorize violence against civilians and will end her cargo blockade at watch 6. Without a constraint or decision attached, it is characterization text only. Do not imply that the runtime reasons freely from it.

A bridge-control objective becomes meaningful through an unpaid obligation, a creditor's authorized representative, a limited coercive tactic, a threatened civilian need, and a willingness to compromise at a personal cost. The planner supplies none of those relationships by itself.

### Knowledge sufficient for this experiment

Keep three spaces separate: objective world facts, actor-held propositions, and player-visible observations. A false belief is permitted. A claim has a source and recipients; trust rules may make a recipient adopt it, but speech cannot directly change objective truth.

Initially support finite grounded propositions and explicit inspection/communication effects, not nested beliefs about other beliefs. Planning sees an actor-local projection. Unknown preconditions, including negations, are ineligible; absence from that projection is not negative knowledge. Trusted but false beliefs can produce a plausible plan whose first action is rejected by authoritative reality. Reveal the observable obstruction and replan; do not give the actor the hidden explanation automatically.

A public revelation is local publication plus delivery to a declared audience/channel. It is not instantaneous global knowledge. The narrator must not describe an NPC's private reasoning to a player without an observation or an explicitly chosen omniscient presentation mode.

### Causality and scheduling

Use a simple watch clock for the design exercise. At each watch: the player gets one major command or chooses to wait; present its committed visible consequences; each active NPC then gets at most one command in declared roster order (Mara, Sella, Iven, Dain, Eda, Nera here); check deadlines; then record developments. Quick offer acceptance can be an atomic response inside an agreement transaction, rather than five free NPC turns. Observe committed substeps, but defer resulting NPC initiative to the next scheduled opportunity. Resolve combat through its own existing turns, with a declared one-watch campaign cost for this bounded fixture.

NPC planning uses a horizon of two major commands. It proposes the next command only, then validates it against the real world. Replan after observed relevant changes or a failed precondition. Equal priority uses authored goal order and stable action bindings. Offscreen NPCs use the same budgets, locations and inventories as visible ones; their successful actions cannot be merely summarized into existence.

The order is deliberately simple and can bias ties. Log it and test boundary cases. A future simultaneous scheduler is not required to investigate whether the authoring model works.

## 4. The crossing: money, duty, and a dangerous concession

Alderwick needs all ten sacks of grain at the east landing before winter accounting at watch 8. The former guard company blocks cargo to obtain eight coins in withheld wages. The council has eight coins, allocated to a levee repair costing eight before watch 10. The party has four coins and one ration. There is enough money to resolve the immediate blockade by compromise; there is not enough to pay every obligation now and fund the repair.

The council's public claim is that wages were already paid. A concealed ledger records the cancelled wage payment and diversion of its appropriation to the levee. It is authentic, not a random rumor. The secret is culpable concealment of a real allocation conflict, rather than proof that the village's safety concerns were invented.

| Character / institution | Wants and fears | Concrete capability / constraint |
|---|---|---|
| Mara, guard captain | Recognition and payment; fears causing civilian deaths | Represents the wage creditor; controls the cargo embargo; accepts a specified installment settlement; releases civilian grain at watch 6 even without payment |
| Sella, guard medic and named deputy | Keep the company alive without becoming extortionists | Can heal through existing abilities; succeeds Mara as representative if able; cannot invent money or undo a death |
| Iven, hungry hardliner | Food now; believes only visible pressure gets results | At watch 4, if still hungry, requests one sack from the carrier; has no authority to sign away the company's debt |
| Dain, council steward | Finish the levee and keep office; fears the fiscal lie becoming public | Can spend the council purse while authorized; accepts a private installment acknowledgement that spends no current council cash; refuses to empty the levee fund for immediate full wages |
| Eda, clerk and named deputy | Preserve records and discharge the council's lawful liabilities | Knows the ledger location; gives that lead on request; succeeds an unavailable/disqualified steward and prioritizes full wage payment over repair |
| Nera, grain carrier | Deliver the shipment; protect her crew | Holds and transports actual grain; may use one sack as emergency provisioning; delivers whatever remains when passage becomes possible |

Sella and Eda are existing individuals, not replacements spawned if a protagonist dies. The guard company and council survive individual deaths as legal/resource-owning entities. All six people have persistent creature IDs.

The adventure's essential local exceptions are explicit:

1. Alderwick's charter disqualifies a steward from unilateral spending once an authentic contradiction of their public fiscal declaration is entered in the village register. It does not establish a universal rule that exposure topples governments.
2. The charter lists Eda as council deputy and Sella as guard representative successor. A vacancy remains if no named eligible person is available. Office does not transfer assets or keys by teleportation.
3. Nera's consignment permits one sack for emergency provisioning. It is a limited authority over this stock, not a generic permission to steal food.

Mara's watch-6 concession and Iven's watch-4 demand are **authored decisions**, not general laws of hungry guards. They should be visible in the module, not hidden in an engine's “dramatic escalation” function.

## 5. Proposed action-library contracts

The following small proposed library defines the mechanics used in the illustrative source. These actions are reusable; they are not implemented in current Kyr. This specification makes the example complete enough to inspect without pretending a negotiation engine exists.

| Procedure/action | Preconditions and committed effects |
|---|---|
| `inspect(actor, document)` | Actor has discovered and can physically access the carrier. Reads its established evidence record into the actor's knowledge. Does not publish it. Destroyed carriers cannot be inspected. |
| `ask(actor, person, topic)` | Contact and an authored disclosure policy. Delivers only the registered propositions/leads. Eda's records response discloses the ledger location, not the ledger's contents. |
| `search(actor, site)` | Co-location; one watch; a DEEM-backed check against declared discovery DCs. A success discovers existing objects. A failed roll never moves the clue elsewhere. |
| `publish(actor, evidence, register)` | Actor has inspected qualifying evidence and can access the register. Appends a verified local record and delivers it to living local subscribers. Unverified accusations remain claims. The chosen fixture treats inspection and publication as separate major commands. |
| `offer(actor, contract)` | Actor may propose a typed bundle of transfers, obligation amendments and requested undertakings. The transaction happens only if all affected parties' authorized representatives consent under their declared acceptance policies. Recheck balances/authority; debit, credit, record receipts/amendments and agreed undertakings atomically. Refusal spends the action but transfers nothing. No natural-language persuasion is assumed. |
| `pay(actor, obligation, amount)` | Authorized payment or voluntary payment on behalf; accessible payer funds and creditor account. Conserves currency and reduces outstanding balance by the receipted amount. A promise changes a due date only with creditor consent; it is not payment. |
| `request(actor, person, request)` | Contact; issues a request record. Receiver's own policy chooses an ordinary subsequent action. This is how Iven requests provisioning; it does not itself transfer the sack. |
| `transfer`, `consume`, `travel`, `contribute` | Check location, custody/permission, quantities and route access; conserve resources except explicitly consumed goods. A carrier brings its held cargo. Contribution satisfies a need only by depositing goods. The fixture's route journey takes one watch. |
| `liftEmbargo(rep, company, route)` | Current representative with authority; removes that company's enforcement order. Guards obey their charter's command rule. It neither unlocks an unrelated physical lock nor makes Iven friendly. The crossing fixture has no locked physical barrier. |
| `fundAndRepair(officer, repair)` | Authorized spending, repair crew present, required purse balance. Pays the crew eight actual coins and commits one watch of completed work. Partial funds do not count as a repaired levee. |
| `attack` / encounter commands | Ordinary combat eligibility and persistent creature resolution. Success is never predicted by the story layer. An enforcement group with no capable participating guards cannot enforce an embargo; that is an access query, not a story award. |

A contract is data describing what someone accepts, not a declaration that the player follows that solution. Initial policies recognize full wage settlement or a specific installment arrangement. Other offers are explicitly unsupported unless additional valuation/acceptance clauses are authored. “Negotiate successfully” in the traces means getting this inspectable agreement accepted, not passing an undefined social roll.

Coins in this proposal have one inventory ledger for each purse; the party purse is not a second independently mutable copy of each creature's gold. Connecting that ledger to today's separate symbolic quantities/creature gold needs an adapter and is not solved by the sketch. Mana/HP remain canonical creature state. The same boundary applies to any future implementation of these actions.

## 6. Complete illustrative module

This is **proposed Kyr**, not accepted by `Kyr.ohm`. `Use` imports typed schemas and the contracts above. `Goal`, `Policy`, `Office`, `Evidence`, `Need`, and `Observe` are authoring declarations lowering to facts/controller/observer records, not opaque English commands. Prose in `Motive` is explanatory only. Calls and fields below have the specified library meanings; no bespoke player action is declared.

A procedural variant should use DEEM to assemble these same structured records from authored cast roles, stock tables, obligation terms and generation context, including nested calls to the shared `creature` template. Resolve identities, budgets, evidence truth and policy parameters once at instantiation; validate cross-references and conservation constraints. Do not sample a different acceptance threshold whenever an offer is made, move a secret to wherever the player searches, or select a subset of named player solutions. Requiring every stake to be simultaneously satisfiable would erase this module's central conflict.

The `consignedCargo` embargo applies to commercial consignments, including the winter grain; personal provisions and unladen people may pass. Communication is possible across the checkpoint. Village archive, council office, and checkpoint are amenities within one village location. Contact with the enforcing representative is possible from either endpoint of its route. This intentionally coarse geography needs no tactical grid.

```kyr
Module crossing "The wages of winter" {
  Use bounded_adventure.inventory, bounded_adventure.contracts,
      bounded_adventure.evidence, bounded_adventure.offices,
      bounded_adventure.controllers, bounded_adventure.observers,
      fantasy.combat.

  Clock watches starts 0.  // Timings below are absolute watches.
  Place village "Alderwick".
  Place landing "The east landing".
  Route bridge between village and landing { duration 1; public true; }
  Site archive in village { publicAccess true; }
  Register village_record in village { localSubscribers mara, sella, dain, eda; }

  Group council.  Group guards.  Group convoy.  Group levee_crew.
  Import party as visiting_company.  // Existing canonical creatures and purse.
  Creature mara from creature with { name "Mara"; raceId human; classId fighter; level 2; }.
  Creature sella from creature with { name "Sella"; raceId human; classId cleric; level 1; }.
  Creature iven from creature with { name "Iven"; raceId human; classId fighter; level 1; }.
  Creature dain from creature with { name "Dain"; raceId human; classId commoner; level 1; }.
  Creature eda from creature with { name "Eda"; raceId human; classId commoner; level 1; }.
  Creature nera from creature with { name "Nera"; raceId human; classId commoner; level 1; }.
  Initially At visiting_company, mara, sella, dain, eda in village.
  Initially At iven, nera in landing.
  Initially Member mara, sella, iven of guards.
  Initially Member dain, eda of council.
  Initially Member nera of convoy.
  Initially At levee_crew in village.
  Initially Purse council at village has 8 gold.
  Initially Purse guards at village has 0 gold.
  Initially Purse levee_crew at village has 0 gold.
  Initially visiting_company brings 4 gold and 1 ration.
  Initially Hungry iven; Nutrition one_ration_or_one_grain clears hungry.
  Initially Embargo guards on bridge for consignedCargo.

  Stock winter_grain { owner council; custodian nera; goods grain; quantity 10; }
  Authority nera may provision at most 1 grain from winter_grain in emergency.
  Need winter { owner village; goods grain; amount 10; due 8; recordDeficit true; }
  Repair levee { at village; payer council; crew levee_crew; cost 8 gold; due 10; }
  Obligation wages { debtor council; creditor guards; remaining 8 gold; due 0; }

  Proposition unpaid means remaining(wages) > 0.
  Proposition fiscal_lie means cancelledWagePayment(council) and claimedPaid(council).
  Initially cancelledWagePayment(council), claimedPaid(council).
  Claim paid_notice { speaker dain; proposition not unpaid; audience village; }
  Initially Believe mara, sella, iven, dain, eda that unpaid.
  Initially Believe nera that not unpaid from paid_notice.
  Initially Know dain, eda that fiscal_lie.
  Initially Know mara, sella, dain, eda, nera of winter, wages, levee.
  Initially Know iven of wages and winter_grain.
  Initially Know visiting_company of village, landing, bridge, archive, winter, wages, levee.
  Evidence ledger at archive {
    discovery searchDC 10;
    authentic true; supports fiscal_lie;
    knownTo dain, eda; inspectAccess public;
  }
  Disclosure eda on ask(records) { disclose location(ledger); }

  Office guard_rep for guards { holders mara then sella; eligible canAct; }
  Office steward for council { holders dain then eda; eligible canAct and not disqualified; }
  Charter alderwick {
    Disqualified(person) means person = dain and registeredVerified(village_record, fiscal_lie).
    // LOCAL governance clause; reads evidence, changes spending eligibility only.
  }

  Agreement full_wages(who: Entity) {
    pay who -> guards toward wages: remaining(wages);
    undertake guard_rep: liftEmbargo(guards, bridge);
  }
  Agreement installment(sponsor: Entity) {
    pay sponsor -> guards toward wages: 4 gold;
    amend residual wages: due 12, acknowledgedBy steward;
    undertake guard_rep: liftEmbargo(guards, bridge);
  }
  Consent guard_rep {
    accept full_wages if remaining(wages) > 0;
    accept installment if remaining(wages) = 8;
  }
  Consent dain as steward {
    accept installment if sponsor != council;
    refuse full_wages paidBy council;
  }
  Consent eda as steward {
    accept full_wages or installment if affordable;
  }

  Policy mara {
    Motive "Win recognition without sacrificing village families.".
    Goal preserve_civilians priority 100
      when now >= 6 and embargo(guards, bridge)
      seek not embargo(guards, bridge) using liftEmbargo.
    Goal end_paid_blockade priority 90
      when remaining(wages) = 0 and embargo(guards, bridge)
      seek not embargo(guards, bridge) using liftEmbargo.
    Otherwise hold position and respond to offers.
    Forbid initiating attacks on noncombatants.
  }
  Policy sella {
    Motive "The company must survive with its obligations and conscience intact.".
    Inherit guard_rep consent and humanitarian/paid-blockade goals when holds(sella, guard_rep).
    Otherwise hold position; provide requested legal healing if resources permit.
  }
  Policy iven {
    Motive "We cannot eat another council promise.".
    Goal get_food priority 100 when hungry(iven) and now >= 4
      seek not hungry(iven) using requestProvision, consume.
    requestProvision target nera, stock winter_grain, amount 1 grain.
    Otherwise hold position; respond to a voluntary ration transfer by consuming it.
  }
  Policy nera {
    Motive "Bring the shipment home without risking the crew.".
    Goal provision priority 100 when pendingProvisionRequest(iven) and hungry(iven)
      seek provisioned(iven) using emergencyTransfer limit 1 grain total.
    Goal deliver priority 80 when remaining(winter) > 0 and accessible(bridge, convoy)
      seek remaining(winter) = 0 using travel, contribute, horizon 2.
    If insufficient stock, contribute available amount once and report obstruction.
    Otherwise hold position.
  }
  Policy dain {
    Motive "The levee is necessary; an audit would destroy my authority.".
    Goal repair priority 80 when now >= 6 and holds(dain, steward)
      seek completed(levee) using fundAndRepair.
    Otherwise hold position and respond to offers.
  }
  Policy eda {
    Motive "The record and lawful liabilities must survive their author.".
    Goal settle priority 100 when holds(eda, steward) and remaining(wages) > 0
      seek remaining(wages) = 0 using offer(full_wages(council)), horizon 1.
    Goal repair priority 80 when now >= 6 and holds(eda, steward)
      seek completed(levee) using fundAndRepair.
    Otherwise hold position and answer registered disclosures.
  }

  Conflict winter_dispute {
    Stakes delivery winter, debt wages, protection levee, authority steward.
    Text "Which duty can be met now, who pays, and who bears the unfinished duty?".
  }
  Phase standoff means embargo(guards, bridge) and remaining(wages) > 0.
  Phase accountability means registeredVerified(village_record, fiscal_lie).
  Phase emergency means now >= 6 and remaining(winter) > 0.
  Observe settlement once when agreementCommitted(wages).
  Observe exposure once when registeredVerified(village_record, fiscal_lie).
  Observe divided_company once when emergencyProvisionUsed(winter_grain).
  Observe leadership_loss(person: Character) once per person
    when member(person, guards or council) and dead(person).
  Observe supply_crisis once when deadlineDeficit(winter) > 0.

  Outcome supplied means deadlineDeficit(winter) = 0 and deadlineRecorded(winter).
  Outcome compromise means due(wages) = 12 and remaining(wages) > 0.
  Outcome paid means remaining(wages) = 0.
  Outcome exposed means registeredVerified(village_record, fiscal_lie).
  Outcome winter_loss means deadlineDeficit(winter) > 0.
  Outcome unprotected means deadlineMissed(levee).
  Outcome bereaved means any initial named creature is dead.
  Continue world after outcomes; report unresolved wages and repair.
}
```

Semantic details that prevent suggestive syntax from doing hidden work:

- The party's starting purse is an admission constraint on a new fixture, not a grant applied whenever the module is loaded. An existing campaign binds its actual inventory; DEEM validates or reports a mismatch rather than overwriting it.
- `Initially Know ... of X` discloses identities, public locations and advertised terms of the named records, not disputed true balances or secrets nested inside them. Everyone also observes their own resources and local physical circumstances before their controller acts. `Know fiscal_lie` is private. Normal local observations and contact channels provide the other physical preconditions needed for a command.
- `then` office holders are a fixed list, evaluated against living/capable individuals. Refusal is not incapacity. Death or disqualification can remove authority; neither erases the debt. An office command uses its holder's actual location and capacity.
- Agreement signatures and access undertakings are resolved atomically after all consents. The installment pays four real coins, reduces wages from eight to four, and dates the residual; it does not settle all eight. Guard consent also authorizes the agreed removal of their embargo. A player may instead pay the full debt personally if they acquire eight coins by valid rules.
- `requestProvision` is the ordinary request schema bound to a provisioning payload; `emergencyTransfer` is transfer constrained by Nera's stock authority. `provisioned` records the authorized transfer, not eating. Iven must still consume the grain. These are policy bindings, not new engine operations for Iven and Nera.
- `agreementCommitted(wages)` is a query over accepted obligation transactions; it is not tied to the English word “negotiate.” Direct payments also reduce the same obligation. Mara/Sella's paid-blockade goal then releases the embargo at the next eligible decision; it does not inspect which action paid the debt. The full-payment agreement bundles that undertaking atomically.
- There is no barrier lock, toll teleporter, automatic morale model, general persuasion, or automatic hostility forgiveness. Attack defenders remain hostile after the immediate blockade ends. Conditions or injuries that make a character incapable change their action eligibility through canonical creature state.
- A deadline freezes the deficit or missed-completion flag at that boundary. `deadlineMissed(levee)` records whether the repair was incomplete at watch 10, even if repaired later. Late grain improves present inventory but does not retract the recorded winter shortfall. If a need was satisfied early, it does not become unsatisfied merely because grain is later eaten; subsequent provisioning is a separate need.
- Observer labels do not appear in NPC policy predicates. Exposure affects authority through the authored charter reading an actual registered record, not through an “Act II” flag.

This is a complete bounded fixture under the stated library contracts, not a complete social ruleset. The compiler should reject unsupported capabilities instead of letting an LLM improvise missing semantics.

## 7. Counterfactual traces

Notation: **R** reusable rules, **N** authored NPC decision/controller (possibly using a short plan), **D** observational development, **L** explicit local charter/permission. Times refer to the watch scheduler above; routine waiting NPC slots are omitted. These are conditional executions, not promises about combat dice.

### 1. Successful negotiation: peace bought with someone else's generosity

- Watch 1: party proposes `installment(party)` at the checkpoint. **R** validates four party coins and both representatives' consent. **N** Mara accepts immediate food-independent payment plus a written residual; Dain signs because no current council cash is spent. Party 4→0; guard purse 0→4; wages 8→4 due 12; embargo lifted. **D** settlement recorded.
- Nera's next slots: **N** plans travel then contribute; **R** moves the same ten sacks to village and satisfies winter need. No scripted `recover` or `deliver` solution fires.
- Before watch 4: player gives Iven the ration by ordinary transfer; **N/R** he consumes it. Without this optional step Iven might still request emergency grain if stock remains in his reach; wage settlement does not magically feed him.
- Watch 6: **N/R** Dain pays eight council coins for the levee work. Watch 8 records zero winter deficit; watch 10 records repair completed.
- Lasting state: party is poorer; the guard claim is only partly paid; council owes four at watch 12; the fiscal lie remains private. Peace, accountability and justice are separate outcome dimensions.

The supported concession was authored. The planner found Nera's means of delivery; it did not invent Mara's willingness to accept installments.

### 2. Immediate attack: tactical success can leave the reason for the violence intact

- From watch 1: party attacks the guards. **R** resolves encounters admitted by actual contact and commits injuries/deaths. Choose a trace where all capable enforcers are defeated in time for delivery and Mara dies; this may require multiple encounters. A losing or retreating battle is a different valid continuation.
- **R** access query finds no capable enforcing guards, so cargo can travel despite the outstanding enforcement order. **D** leadership loss records Mara's death. No observer awards eight coins or declares the debt settled.
- **N/R** Nera uses the opening to deliver. Dain still has the repair fund and can complete work at watch 6. Eda does not assume office merely because the guard captain died.
- Lasting state: the grain and levee may both be safe, wages remain eight owed to the company/estate, survivors retain injuries and hostility, and Mara stays dead. The module reports provision plus bereavement and unresolved wages, not a universal “victory.”

If surviving guards still enforce the route, Nera waits. The dramatic layer cannot turn a partial combat win into free passage.

### 3. Discover and reveal the lie: public justice has a material cost

- Watch 1: party asks Eda about records. **R/N** her disclosure identifies the ledger's site. Watch 2: inspect the accessible ledger; **R** establishes evidence in party knowledge. A player who searches successfully can bypass Eda entirely. Discovery and proof are different operations.
- Watch 3: party publishes the inspected ledger. **R** records verified evidence and delivers it to the village subscribers; **D** exposure is recorded. **L** the charter disqualifies Dain; Eda becomes the already-existing eligible steward.
- Eda's next slot: **N** prioritizes lawful wage settlement and proposes `full_wages(council)`. **R** transfers council 8→0, guards 0→8, wages 8→0 and lifts the embargo after consent. Dain cannot spend those coins later.
- In the declared roster order, Eda acts before Nera. **N/R** Nera can therefore travel in watch 3 and contribute in watch 4. Iven cannot obtain an emergency sack from a carrier no longer at the landing. If publication is delayed until watch 4, his request can precede departure: Nera's provisioning priority diverts one sack, then delivery completes by watch 6 with a deficit of one unless the party supplied its ration. Exposure guarantees neither perfect timing nor full provision.
- Watch 10: repair remains unfunded unless someone supplies new actual resources. **D/report** unprotected aftermath. No gold is fabricated to make honesty a universally optimal choice.

This path exposes a real scheduling consequence. It should be tested, not edited out of narration because it spoils a neat reward structure.

### 4. Ignore the dispute: NPCs make imperfect progress without the player

- Watches 1–3: party waits or leaves. The module's clock still advances when campaign time advances. No forced scene summons them back.
- Watch 4: **N/R** Iven requests food. **L/N/R** Nera uses her one-sack authority and transfers grain; stock 10→9. Watch 5: Iven consumes it. **D** divided-company development records the resource-consuming incident, not a claim that all guards changed allegiance.
- Watch 6: **N/R** Mara ends the embargo to avoid harming civilians. Dain funds and completes repair using the eight council coins. Nera begins her delivery plan; after any provisioning slot has completed she travels and contributes nine sacks by watch 7.
- Watch 8: **R** the need records deficit one. **D** supply crisis is recorded. The continuing debt is eight; the council's lie remains undisclosed. The player can learn about the shortfall on return through the consignment receipt and villagers' testimony, not telepathic access to offscreen turns.
- Lasting state: village has nine sacks and a winter shortfall, levee repaired, wages unpaid, guard company still aggrieved. Later aid can help people but cannot make the missed delivery history disappear.

The NPCs do not freeze when ignored, and the engine does not arbitrarily burn the bridge to punish inaction.

### 5. Unexpected central death: the steward dies before the secret is revealed

- Watch 1: an otherwise valid combat or hazard kills Dain; **R** commits his death. For example, the party attacks him rather than visiting the bridge. This is not one of the module's suggested solutions, but uses existing capabilities.
- **D** leadership loss records a death. **L** Eda is the named eligible deputy. Dain's coins belong to the council, so they do not vanish or become loot in his personal pockets. If he had personally carried a key, recovery would require an ordinary action.
- Eda's next slot: **N/R** pays wages through the full agreement, empties the repair fund, and opens passage. She does not need the player to reveal a secret she already knows. Nera can deliver early; Iven's provisioning opportunity disappears if the stock has left before watch 4.
- Lasting state: Dain remains dead, wages paid, grain potentially supplied, repair unfunded. The evidence remains at the archive; accountability may remain private because death did not publish it. The player has not been awarded moral legitimacy for killing him.

If Eda is dead too, nobody acquires her decision policy. The council's unilateral-spending role stays vacant; Mara's watch-6 concession, donations, full payment from another source, or ordinary force remain possible. If Mara dies but Sella survives, her named authority activates; if both die, no new compromise can be signed by their nonexistent representative. Debts, documents and people continue to have independent existence.

### Additional bypasses and failures

- Deliver grain by a valid new capability before any revelation: winter need can be met while the wage and governance conflict remains. Do not fire exposure or force a confrontation. A ford would need declared topology and usable travel mechanics; the director cannot invent one in response to a clever suggestion.
- Destroy or remove the ledger: discovery/proof becomes harder or impossible through that carrier. Eda knowing the truth is not automatically equivalent to a surviving authenticated record under this charter. The secret may stay unresolved.
- Pay the guards unsolicited: the ordinary payment rule changes the debt; the representative's paid-blockade goal reacts to the resulting zero balance. Paying one coin does not buy the full concession. There is no requirement to invoke a specially named bargaining action.
- Incapacitate every decision-maker or exhaust all food/money: a good outcome may become unreachable. Record that state; do not spawn a sympathetic successor, refill the purse, or declare the player chose an invalid story path.

## 8. Dramatic progression without a mandatory sequence

`standoff`, `accountability` and `emergency` are overlapping current-state queries. A module can pass directly from standoff to provision with no exposure; enter accountability after a violent resolution; or enter emergency with no blockade at all. Derived phases can become false again. Development records are historical and remain true once recorded.

Use an explicit finite-state phase only when the world itself has an exclusive procedure: an assembly has not started/is voting/has adjourned. That is a social process with rules, not evidence that all stories need acts. A partially ordered development graph can document expected relationships, but should be a validation aid: “publication requires inspected evidence,” not “exposure must occur before resolution.”

If future modules need a development to cause something, require it to name an ordinary authorized intention or scheduled rule, its actor, resource source and preconditions. Mark it as causal in source. Do not hide writes under an observational `Observe` block. Previously established content may become discoverable by a changed condition, but its identity, location and truth must predate the revelation unless an ordinary generation/creation action actually creates it.

Module exit should freeze a report, not the world. Record outcome dimensions, outstanding obligations, survivors, ownership and scheduled deadlines in persistent campaign state. Fast-forwarding an offscreen module must execute its bounded scheduler or a separately validated equivalent summary. Simply declaring the most dramatic aftermath would violate the causal contract.

## 9. How the existing planner can participate

Keep the current search algorithm initially. Supply adapters rather than replacing it with an autonomous-agent framework:

1. Select the highest-priority activated, unsatisfied authored goal from the actor's view. Priorities are lexicographic; do not treat a life-saving goal as merely two coins more expensive than a trivial one.
2. Lazily ground a finite set of permitted action schemas over known IDs and small quantity domains. In the prototype, pre-ground the few commands into ordinary `Operator`s. Grounding is missing functionality, not something `Planner.search` already does.
3. Build a detached planning world containing known propositions and resources. Admit only actions whose relevant preconditions are known. Supply negative knowledge explicitly. Goal activation cannot inspect private truth that the actor has not received.
4. Invoke existing search with its node limit and a two-step horizon. A true depth limit needs a small option added; elapsed-time budget only approximates it if every action has unit duration.
5. Execute only the first action through the authoritative ruleset. Replan from fresh observations. A plan is neither a reservation of resources nor a guarantee of another character's cooperation.

Nera's travel/contribute plan is an excellent use. An officer funding a declared repair is another. Selecting a contract from a finite known consent catalog is possible. A planner cannot discover a social bargain not represented in that catalog, prove an opponent's hidden willingness, or use a combat success branch as a reliable prediction.

The first prototype should use positive known predicates and deterministic operations only. Observer absence must not change action admission; controllers consult ordinary facts, not development latches. Defer richer false-belief action failure to a later knowledge experiment rather than quietly applying closed-world negation to unknowns. Do not put all characters' goals into one global search for a “good story”; they are competing controllers, not a cooperative planning party.

## 10. Small executable experiment to propose next

**Uncertain claim:** a few authored decision constraints plus existing short symbolic plans can produce distinguishable, coherent histories without a player-solution graph or a phase director.

Do not implement the entire illustrative library first. Build a tiny headless harness over existing `World` and `Planner`, with declarations assembled in a fixture rather than a new grammar:

- Six actor IDs referencing existing persistent creature records; one bridge, two purses, one obligation and ten grain.
- Pre-ground only offer-installment, offer-full-payment, lift-embargo, provisioning request/transfer/consume, Nera travel/contribute, fund-repair, inspect and publish. Reuse the same action definitions across all runs; actor policies choose candidates. Contracts must debit real amounts and obey named authority.
- A watch scheduler with fixed actor order, four or five policy clauses and read-only once observers. Initial knowledge can be positive-only; publication makes a specific new proposition known. Use the real battle/creature result for a central-death input, not a second narrative HP system.
- Feed external command tapes for the five counterfactuals. They are test inputs, never an authored list of module solutions. Search should choose Nera's next steps; deterministic policy bindings can handle one-step requests/offers.

Assertions should test the architecture, not just expected dialogue:

1. No observer can write physical facts; disabling all observers leaves the same world history and NPC commands.
2. Replacing “negotiation path” with an equivalent sequence of authorized transfers/accepted undertakings produces the same classifications where facts are equivalent. No check looks for a particular player action ID.
3. Kill the steward before publication: the existing deputy can act, the corpse stays dead, the unspent purse is conserved, and exposure does not appear without publication.
4. Hide the ledger from the player: NPCs without its knowledge never choose publication. Publishing updates only the declared audience. Knowing its location is not proof of its contents.
5. Change treasury 8→3 or remove the deputy in a second fixture: the same rules yield an obstruction or unresolved debt, never fabricated money or an unnamed successor.
6. Ignore everything: clocks/NPC budgets still advance, deficits are recorded at the correct boundary, and late provision cannot erase them.
7. Re-run the same seed, initial state and command tape: compare all committed states, NPC commands, random draws actually used, and development records.

A first pass can omit stochastic discovery and use a successfully inspected fixed ledger. That tests the critical causal/interpretive separation without building a general evidence or social system. Passing these tests would justify implementing a small module authoring surface; failing them should lead to simplifying the model before expanding grammar.

### An author-facing validation checklist

A module reviewer should be able to trace every consequential behavior to one of four sources: a reusable action, an NPC policy, an observer, or a named local exception. Flag policies with no feasible methods, public claims accidentally treated as truth, outcomes that erase earlier deficits, and office succession without an existing eligible person. None of these checks proves an interesting adventure; they make the author's dramatic commitments inspectable.

## 11. Deferred capabilities and open risks

Deferred: general negotiation or natural-language adjudication; unrestricted agent planning; nested epistemic logic; universal faction utility; full legal/political simulation; a universal quest/act director; automatic dramatic pacing; a comprehensive event bus; spatial combat; offscreen mortality simulation; broad Orsino mechanics; new equipment/form systems; and an entire procedural adventure generator.

Open decisions worth product testing:

- Does explicit acceptance-policy authoring feel like useful character design or like writing dialogue branches in disguise? Count the number of world-equivalent offers the system genuinely accepts.
- Is a two-step controller sufficiently purposeful? If it fails, first add authored intermediate goals, not unlimited search.
- Is the fixed watch scheduler legible and fair? The exposed-ledger trace intentionally identifies a timing race rather than claiming every ordering produces identical outcomes.
- How much institutional causality belongs in reusable rules, and how many local charter exceptions remain reviewable? Their number and scope should be visible in module tooling.
- Can an author explain a refused action using actual knowledge, authority and resources? If the answer is “the act is not ready,” the design has failed.
- How much unmodeled interpretation should the interface allow? A free-form proposal may be translated into supported commands or returned as an unsupported request; an LLM must not manufacture acceptance, evidence or consequences.

The proposed executable authoring unit is therefore a **conflict with accountable decision policies and consequence-bearing facts**. The engine need not understand drama as a human does. It needs to preserve the specific reasons, constraints and information dependencies that make this adventure worth playing, while allowing ordinary rules to defeat the author's expectations.
