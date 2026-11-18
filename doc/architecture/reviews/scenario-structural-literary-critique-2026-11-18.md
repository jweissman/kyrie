# The world waits to be solved

## A ruthless structural critique of Kyrie's standing scenarios

**Date:** 18 November 2026  
**Scope:** the fictional material selected by `data/scenarios/*.scenario.json`, read primarily in its present `.kyr` sources under `data/goings-on/` and `data/situations/`. The large independent adventures under `data/adventures/` are a different class of work and are not silently used to improve the verdict on the standing scenarios. `caught-below` is included because it is a reusable situation in the same layer, though it is not currently selected by a top-level scenario manifest. Generated names and cosmetic variants are treated as variants, not as additional stories.

This is a cold structural reading. It asks what story the presented situation actually tells, not what its design history intended, what a test proves is reachable, or what a sympathetic reader can infer from comments.

---

## Executive verdict

The complaint is substantially correct.

Kyrie's scenario prose is frequently excellent at **premise**, **material texture**, and **the social fact**. It is much less reliable at drama. Too many scenarios consist of:

1. a picturesque abnormality;
2. one person who states the problem;
3. one hidden fact or missing object;
4. a short chain of retrieval, persuasion, or delivery;
5. a state flag which declares the matter repaired.

That is a quest-shaped transaction, not an arc. The world before and after it may differ in a database, but it has not necessarily undergone a dramatically intelligible change.

The strongest scenarios—**The Silent Lord**, **The Bound Howe**, **The last sea-gate**, the debt movement of **Wapshott's Circus**, and, on a smaller scale, **The drover who did not come home**—possess at least three of the following:

- a clock that changes the situation rather than merely failing the quest;
- several actors pursuing incompatible ends;
- revelations that revise the apparent story;
- a crisis at which prior choices become public and irreversible;
- an ending that answers the premise's moral question;
- a protagonist whose action changes relationships, not only object locations.

The weak majority lack most of these. Some are still useful as ambient incidents, services, sites, or vignettes. The literary mistake is to ask them to bear the word **story** without giving them the machinery of one.

The central diagnosis is:

> **Kyrie often confuses a situation with a story, a task chain with an arc, branching solutions with dramatic choice, and persistence with consequence.**

Sentence-level polish sometimes makes this harder to notice. A line about a cold pan, a tally stick, a grey dog, or a moved boundary stone can be wonderfully exact. Exactness gives the opening dignity. It cannot supply escalation, reversal, climax, or transformation.

---

## What a scenario needs in order to become a story

A standing scenario need not imitate a novel or force a three-act plot. It does, however, need a legible dramatic sentence:

> **Because** someone wants something and someone or something resists them, **the situation worsens or changes**, forcing the player to choose; **therefore** a human relationship, public order, or understanding of events becomes irreversibly different.

Six tests expose the current weaknesses.

### 1. The vector test

Who is doing what if the player never arrives? “The problem remains” is not a vector. Waiting is not action. A static quarrel, an indefinitely patient scholar, and undead who commute nightly forever are displays in a cabinet.

### 2. The revision test

What does the player believe at the beginning that later proves incomplete, compromised, or false? Finding the location of a lost part is information, but not necessarily a revelation. A useful turn changes the meaning of the original ask.

### 3. The pressure test

Does delay create new conduct and new relationships, or only flip `failed`? A deadline is dramatic when it makes people do desperate things before it arrives. It is merely a timer when everyone waits normally until catastrophe text fires.

### 4. The agency test

Does the player choose what ought to happen, or merely choose which skill or route produces the authored good state? “Fight, persuade, or fetch” is tactical plurality. It is not dramatic plurality if every route restores the same equilibrium.

### 5. The collision test

Do at least two live claims meet in the same scene? Much of Kyrie's information is serial: ask A, inspect B, tell C. Drama becomes visible when A and C are present for the disclosure and must react to each other.

### 6. The aftermath test

Can a reader describe the changed life of named people after the resolution? Coin, experience, a stale rumour, and a repaired predicate are not by themselves an ending.

---

## Corpus-wide structural failures

## 1. Too many stories begin after the interesting action has stopped

The boundary stones have already moved. The hall has already gone silent. The drover is already dead. The scholar is already waiting. The old coin dealer has already selected his prey. The bronze factor is already buying. The fever already exists. These can be good inciting facts, but the surrounding characters often enter a holding pattern until the player supplies the next verb.

The manifests make the stasis explicit. The scholar waits and “nothing comes of it for waiting”; the boundary quarrel persists until someone settles it; the fellowship's silent hall “does not grow worse in a season”; the den “grows no worse for being left”; the risen repeat the same walk “night after night” and “it comes to no head of itself.” These are honest implementation notes and devastating literary admissions. They remove the offstage life that makes a fictional world feel independent of the protagonist.

**Mitigation:** Give every scenario an **actor clock**, not merely a disaster clock. At two or three thresholds, a named person takes a consequential action: the merchant moves the stones again; the priest publicly blesses the disputed well; the scholar leaves with the dealer; the silent hall's apprentice burns the false accounts; the necromancer raises the wrong dead person; the fevered child's sister steals a dangerous remedy. Each action should alter available alliances and the meaning of the eventual choice.

## 2. The “story” is often only an objective pipeline

The common structure is:

`hear rumour → visit location → learn fact → retrieve/perform item → report → Goal(predicate)`

This is clearest in **The cold pans**, **The stranger who pays in old coin**, **The boundary stones**, **A fever on the green**, **A fellowship with halls in four towns**, and **The players on the green**. The objective text is admirably clear, but clarity reveals the absence of a dramatic turn. Once the premise is understood, the rest is execution.

A story arc is not synonymous with a sequence. Sequence answers “what happens next?” An arc answers “why does what happens next change what this was about?”

**Mitigation:** Require every authored story to contain at least one **meaning-changing turn**. Examples:

- The fuel boat's delay is not accidental; the pan workers stopped it because the salter adulterates salt, so saving the season also preserves an abuse.
- The scholar's coins are not merely evocative; they are the unpaid wages of the people buried at the site, and reading the inscription activates a present claimant.
- The silent hall has not failed institutionally; it has seceded for a reason the head concealed.
- The players' debt is enforceable, but the missing chain-man fled with evidence that the host engineered it.

The turn need not be a “twist.” It must force a reinterpretation and a changed decision.

## 3. Goals encode administrative closure, not dramatic closure

Many terminal conditions are thin predicates: `welcomed(party)`, `tallied(party)`, `read(scholar)`, `restored(trader)`, `fuelled(party)`, `mended(order)`, `told(wife)`. These are useful machine states. As statements of story, they are anaemic.

The especially revealing cases are **The drovers' hall at the pass** and **The Tower of the Scales**. Their goals are being welcomed and having a tally accepted. Those are orientation and transaction scenes. Calling them scenarios inflates the catalogue while lowering the reader's expectation of what a scenario will do.

**Mitigation:** Separate content types in both authoring and presentation:

- **institution/site** — a reusable place with services, customs, and hooks;
- **incident** — a short obstacle or human vignette with one local change;
- **story** — an escalating conflict with a turn, crisis, and aftermath;
- **campaign thread** — a recurrence whose meaning accumulates across places.

Do not repair an institution by stapling a villain to it. Reclassify it honestly. Let the drovers' hall be a superb hall and the Tower a consequential civic institution. Their hooks can lead into stories elsewhere.

## 4. Branches are commonly methods, not meanings

The prose often advertises several solutions: fight, persuade, carry, pole, heal, pay, read, sneak. This is good interactive design, but it is repeatedly mistaken for narrative choice.

In **A brood under the hill**, burn/fight/feed looks morally plural, yet the whole conflict has been compressed into a neat ecology problem: silk-gatherer versus shepherd, with the mother spider as a solvable balance. In **The unquiet tower**, kill the necromancer, break the lantern, lay the dead, or release the sister offer routes to `ended(necromancer)`; only the sister route begins to answer the emotional premise. In **The Bound Howe**, taking torcs, meeting the levy, keeping the howe, and dealing with rivals have more genuine moral independence, which is why it feels larger than its map.

**Mitigation:** For every branch, complete the sentence: “Choosing this says that ___ matters more than ___, and causes ___ to lose something they cannot recover.” If two branches cannot be distinguished in those terms, they are approaches, not endings, and should not be counted as narrative breadth.

## 5. NPCs explain themselves instead of colliding

Kyrie's talk is often beautifully economical, but the dominant scene form is the interview. The player asks; the NPC delivers a compact paragraph of motive and fact; a knowledge predicate changes. The NPC rarely lies under pressure, interrupts another NPC, changes tactics, misconstrues what the player has done, or demands a public commitment.

The result is a world of excellent witnesses and underpowered actors.

**Mitigation:** Move essential disclosures into **triangular scenes**. The priest should identify the old boundary while the merchant and innkeeper are present. The scholar and dealer should contest ownership at the inscription. The head and silent keeper should be forced into the same room or exchange letters whose incompatible claims the player must carry. The wife and son should disagree about pursuit before the son leaves. A collision converts lore into event.

## 6. Climaxes are disproportionately acts of delivery or reporting

Several stories end when an object reaches its intended socket or a fact reaches its intended NPC. This produces clean state transitions and weak emotional summits. A final report is denouement, not climax.

Even where the physical action is vivid—the sea-gate wound shut, the fuel boat poled through the cut—the scenario sometimes withholds the human confrontation that would make the act mean something. **The last sea-gate** is stronger because sabotage and the northbound tally open a wider political story, but its immediate arc still risks ending as successful maintenance.

**Mitigation:** Put the irreversible choice immediately before the mechanical resolution. Who controls the repaired gate? Who is accused of sabotage in public? Who gets the salt season's profit? Who owns the inscription once read? Who is recognized as keeper of the hall? Make the final physical verb enact a settled human claim.

## 7. Failure is catastrophe prose, not tragedy

The better deadlines can flood a fen or spoil a season. But the people involved often do little as the deadline approaches, so failure lands as a system announcement. Tragedy requires recognizable attempts, compromises, and preventable errors.

**Mitigation:** Write two intermediate deteriorations for every hard deadline:

- a **social deterioration**: accusation, desertion, price rise, unlawful seizure, panic;
- a **material deterioration**: a second hearth goes out, a bank leaks, a gate chain parts, a patient becomes delirious.

At least one NPC should make the situation worse while sincerely trying to help.

## 8. The protagonist is often a competent stranger with no dramatic vulnerability

Most scenarios make the player useful but not implicated. The company has no reason to care beyond money, kindness, or completion. Origins occasionally improve this, especially the drover's kin variant, but the core stories do not systematically exploit obligation, reputation, class, calling, or prior choices.

**Mitigation:** Give each story two entrances:

- a **commission entrance**, for the passing stranger;
- an **implication entrance**, in which an origin, debt, faith, fellowship, earlier resolution, or carried object makes neutrality costly.

The second should change at least one NPC's initial attitude and one ending, not merely substitute “your father” for “the drover.”

## 9. Generated variation changes nouns more often than dramatic structure

Several scenarios draw a kind, cause, location, or identity from tables. This improves replay texture but may leave the same dramatic skeleton untouched. **Fellowship** can be guild, garrison, or chapter; its silent hall can fail in several ways. Yet its spine remains a summons-and-tally circuit whose ultimate value—restoring the roll—is pre-decided. Cosmetic plurality cannot conceal a fixed moral conclusion.

**Mitigation:** Generate **conflict geometry**, not only dressing. A variant should change at least two of: who has legitimate authority, what the apparent victim concealed, what worsens with time, what sacrifice resolves it, and which relationship survives. If the same objective sentences and ending work after swapping all nouns, the variation is not narratively substantive.

## 10. The catalogue lacks a reliable scale grammar

`data/scenarios` places a 50-line institution, an 88-line errand, a 1,500-line contested barrow, a 1,700-line succession drama, and a 5,000-line recurring circus beside one another as equivalent selectable scenarios. The inconsistency makes weak material look unfinished and strong material hard to recognize.

**Mitigation:** Establish explicit size promises:

| Form | Expected dramatic payload |
|---|---|
| Texture | no arc promised; one memorable observation or custom |
| Incident | want, obstacle, local choice, visible after-effect |
| Story | competing agency, revision, escalation, crisis, aftermath |
| Major situation | several interacting arcs and an ending matrix |
| Recurring company | episodic spine plus relationship changes over time |

Then curate the reader accordingly. Variety of scale is good. Ambiguity of promise is not.

---

## Scenario-by-scenario findings

Ratings describe **current dramatic structure**, not prose quality or implementation sophistication.

## The drovers' hall at the pass — not a story

**What it is:** a strong piece of connective world texture and a gate into a dragon hook.  
**What it claims as closure:** Marged welcomes the party after hearing Bran sent them.  
**Structural failure:** nothing contests anything. There is no arc, turn, crisis, or changed relationship beyond hospitality. The interesting story—the burned pasture, the unpaid bounty, Marged's reluctance, Dai's knowledge—begins precisely where this module ends.  
**Repair:** reclassify it as an institution/hook. If it must be a story, make Marged's welcome cost her: the hall has sworn not to send another child over the tops, Dai intends to go, and the returning burned drove forces the issue that night.

## The Tower of the Scales — not a story

**What it is:** an institution that receives quarter tallies and locates economic authority.  
**Structural failure:** `Goal tallied(party)` is a service interaction. No desire meets resistance; no understanding changes.  
**Repair:** keep it as civic infrastructure. Attach stories to contested tallies: two legitimate tallies for one march, a price vote bought by the saboteur of the sea-gate, or a tally whose acceptance ruins the people who saved the crop.

## A den in the wild — a reusable encounter shell, not a story

**What it is:** a lair, a monster, spoor, and loot.  
**Structural failure:** “something takes what strays near it” and “clear it out” contain no particular human claim. The explicit promise that it grows no worse removes urgency. Kill/drive/lay are resolution modes, not an arc.  
**Repair:** label it an encounter. When promoted to story, bind the beast's conduct to a named mistake or dependency: it guards a stolen child, follows a seasonal route the village blocked, or is being fed by someone who profits from the fear.

## A fever on the green — a humane errand, not yet a story

**What it is:** fetch willow or substitute herbs for a sick child.  
**Strength:** immediate bodily stakes and an intelligible act of care.  
**Structural failure:** the answer is known at the outset. The road is friction, not complication. Nobody's view changes.  
**Repair:** preserve its smallness but add one turn: the sister used the last herbs on someone the town refuses to count; the mother rejects the dangerous correct dose; or the willow belongs to a household quarantining a second illness. End on a relationship, not `mended(mother)`.

## The cold pans — a competent timed logistics quest

**What it is:** get charcoal from a stranded fuel boat before brine spoils.  
**Strength:** material specificity, a real three-day clock, visible degradation, two physical methods.  
**Structural failure:** once Ianto explains the broken arm, no uncertainty or moral conflict remains. The scenario is a delivery problem with attractive industrial prose. The salter, workers, village, and boatman all want the same thing.  
**Repair:** introduce the absent opposing claim. Why will nobody take the boat through the cut? Make the “water went wrong” consequential. Let the full boat save the season but breach a sluice or deprive the fuel village; let two sacks preserve only one employer's pans; let workers demand that rescue be conditional on their arrears.

## The boundary stones — a static parable with a predetermined answer

**What it is:** prove the merchant moved the stones; restore them or take a bribe.  
**Strength:** instantly graspable social geometry; the priest's compromised witness is economical and good.  
**Structural failure:** the truth is literally in old holes under grass. The merchant is wrong, the innkeeper is right, the priest is cowardly, and the good ending is restoration. The bribe is not a serious competing claim. No discovery complicates ownership, need, or memory.  
**Repair:** make both boundary and remedy disputable. Perhaps the old line is clear but would take the merchant's only well; the innkeeper's father moved it a generation earlier; or the shrine roof really shelters the town and returning the land bankrupts its donor. Stage the disclosure before all three parties. Force an allocation, not a proof exercise.

## The stranger who pays in old coin — a moral toggle pretending to be intrigue

**What it is:** escort a scholar; either betray the destination to a dealer or preserve the inscription.  
**Strength:** a fine hook, a concrete object, and a clean visible consequence in the smashed stones.  
**Structural failure:** the dealer announces himself as corruption in a good coat. Eight coin versus intact history is not a balanced dramatic choice. The scholar waits indefinitely, the dealer acts only if handed the answer, and the buried tithe rewards virtue with more treasure. The scenario congratulates the expected choice.  
**Repair:** give the dealer a defensible claim and the scholar a compromising purpose. The “tithe” might be extracted wealth with living heirs; preservation may keep it in elite hands; sale may fund an urgent public good. Let the dealer independently trace the place, so secrecy buys time rather than immunity. Make the inscription say something that alters who owns the coins.

## The players on the green — a promising comic premise with a thin spine

**What it is:** a troupe's wagon is chained for debt after its chain-man fled with the takings.  
**Strength:** visible predicament, ensemble potential, public performance as a natural climax.  
**Structural failure:** in its small current form, the cast decorates a reckoning whose desired end is `reckoned(gosse)`. The missing man is backstory more than active antagonist. The town's stake in holding the company is narrow.  
**Repair:** make the company fracture over whether to perform, flee, expose the host, or abandon the Trial. The chain-man should send a message or return with a claim. Resolve the debt publicly through the play, with the content of the performance determining which relationship survives.

## The disputation on the green — an ingenious debate toy without a human arc

**What it is:** use the generated country's history as evidence in a contest between One and Flow, with a sophist for hire.  
**Strength:** unusually good integration of generated history; the player's knowledge can matter rhetorically.  
**Structural failure:** the terminal goal is making one philosopher reason and doubt. That is an intellectual state change, but the dispute has little cost beyond winning. The debaters are positions before they are people, and history becomes ammunition.  
**Repair:** attach the metaphysics to a decision due that day: succession, rebuilding, a marriage, a condemned custom. The argument should change a public act. Give each philosopher a personal exception to their doctrine, so the player's evidence can expose character rather than merely score a school.

## A fellowship with halls in four towns — procedural breadth, dramatic vacancy

**What it is:** carry a summons, diagnose why one hall stopped answering, recover its tally, return it to the head.  
**Strength:** superb institutional material; several generated failure modes; tactile documents; a satisfying geographic circuit.  
**Structural failure:** every variant is organized toward repairing the fellowship. The head's legitimacy is assumed. The silent keeper's possible pride, sale, death, or injury changes the method, not the moral shape. Four towns create travel, not escalation. The unclocked design guarantees that nobody has to decide anything without the player.  
**Repair:** make at least one variant a justified secession and another an attempted takeover. Let the other halls react while the player travels. Returning the tally should be one possible ending; recognizing a new fellowship, exposing the head's misreading, or dissolving the roll should be others. The last scene needs head and keeper in conflict, directly or by simultaneous public letters.

## The drover who did not come home — the best small scenario, but its climax is misplaced

**What it is:** follow the returned dog's evidence, find the dead drover, tell his wife, and perhaps recover the oxen with his son.  
**Strength:** the opening is precise; grief changes the register; the son has an independent clock and can leave alone; burial choices and the kin variant create implication; small observations give him an embryonic arc into his father's voice.  
**Structural failure:** `Goal told(wife)` makes notification the official ending even though the son, the den, the yoke, burial, and inheritance carry the real dramatic continuation. The wife initially refuses speech largely so information can be gated. The beast that caused the death belongs to a linked module, splitting cause from consequence.  
**Repair:** define the story around the household after the death: whether the son repeats, rejects, or understands the father; whether the body and yoke come home; whether the wife releases or loses him. The telling should be the midpoint turn. The climax is the son's decision at the den or grave, witnessed by the player.

## The factor who buys old bronze — a network with more exposition than event

**What it is:** trace apparently innocuous bronze buying through a carter, lieutenant, principal, seals, ledgers, and a wider ring.  
**Strength:** systemic scope and a good economic image: heritage and useful metal converted by a respectable supply chain.  
**Structural failure:** the investigation accumulates proof, but the immediate goal `carterGone(carter)` is dramatically arbitrary. The factor and chain are functions in a conspiracy more than changing characters. The player uncovers scale without necessarily reaching a scene in which competing claims collide.  
**Repair:** decide what the bronze is *for* and who suffers now. Give the carter a live decision about the next load, the factor a reason to defect, and a buyer who acts when exposed. End the first movement with an irreversible shipment, strike, seizure, or public accusation—not merely a departure. Make tracing the ring revise the initial moral picture.

## The held drove — a strong adjudication scenario

**What it is:** customs officers hold Bran over a discrepancy of four cattle; evidence can vindicate, implicate, or transform the case.  
**Strength:** immediate conflict, bounded stakes, institutions and livelihoods in contact, several interested people, and consequences that feed later Iscoed stories.  
**Weakness:** the case can still read as a puzzle whose correct evidence frees the deserving drover. If the customs side is only obstruction, the adjudication lacks tragic possibility.  
**Repair:** strengthen the clerk's legitimate fear and make the four missing cattle matter to someone other than Bran. A correct ruling should impose a cost. The best ending should be arguable, not merely discoverable.

## The last sea-gate — a real plot whose human antagonist arrives late

**What it is:** diagnose and repair an ancient gate before a six-day spring tide; discover that the pawl was sawn; connect sabotage to salt politics and a northbound tally.  
**Strength:** excellent physical stakes, a hard clock, staged discovery, sabotage that revises “old machinery failed,” and consequences beyond the hamlet.  
**Weakness:** much of the playable spine remains locate part → retrieve part → wind gate → report. The saboteur and political beneficiary are more sequel signal than pressure inside the repair story. Hamlet residents do not visibly divide over what to do.  
**Repair:** bring the cutter's interest into the six-day window. Someone obstructs repair, offers an alternative breach, spreads blame, or seizes the bank. Let the player decide whether to repair secretly, accuse publicly, or use the tide to expose the scheme. The gate shutting should settle a political claim, not only avert water.

## The drovers' Iscoed sequence as a whole — promising serialization, weak causal handoff

**What it is:** held drove → failing sea-gate → cold pans → Tower tally, with facts carrying forward.  
**Strength:** consequences and knowledge cross scenario boundaries; labour, customs, salt, water, and price occupy the same economy.  
**Structural failure:** linkage is often referential rather than causal. Completing one item unlocks information in another, but the player's prior judgment does not always reshape the next conflict's sides and possible endings.  
**Repair:** make each resolution create a beneficiary and loser who reappear. Freeing Bran on forged evidence should change who trusts the party at the gate. Saving one salter's pans should affect the tally and price vote. The Tower should reckon the actual chain of choices.

## A brood under the hill — a schematic “balanced ecology” problem

**What it is:** spiders take sheep; a silk-gatherer depends on them; kill, burn, or feed the mother and preserve peace.  
**Strength:** clear incompatible livelihoods and a nonviolent option grounded in creature ecology.  
**Structural failure:** the conflict is presented already abstracted into its design solution. “Feed their mother and keep the peace” tells the authorial answer. The spider mother has appetite, not agency; the shepherd and gatherer are stakeholder labels; one ewe a night repeats without escalation.  
**Repair:** personalize the losses and destabilize the equilibrium. The gatherer's child has entered the nest; the shepherd has begun poisoning carcasses; silk demand caused overharvesting; the mother is moving because the brood is hatching. A compromise must require an ongoing custodian or sacrifice, and one party must be capable of refusing it.

## Caught below — a strong emergency skeleton, barely a story

**What it is:** someone is pinned in old workings and the short way out is closing.  
**Strength:** immediate embodied pressure and spatial choices; no ornamental exposition.  
**Structural failure:** absent a particular relationship, error, or contested rescue, it is a procedural emergency. The captive is an object of rescue.  
**Repair:** generate why they entered, what they refuse to leave, and who benefits if they do not return. Let the short route require abandoning evidence, treasure, or another trapped person. Give the captive one decision that can endanger the rescue.

## The unquiet tower — complete adventure grammar, conventional emotional logic

**What it is:** an ex-acolyte raises the dead for his drowned sister; stop him by force, mechanism, or releasing her.  
**Strength:** coherent cause, spatial foreshadowing, several routes, a revelation about the sister, and an ending action that can answer motive rather than merely defeat threat.  
**Structural failure:** the premise is familiar enough to run on inherited sentiment. “He did it for her” arrives as explanation, but Maren mostly exists to request release and validate the merciful solution. The unclocked nightly loop makes necromancy oddly stable. The town suffers atmosphere rather than accumulating loss.  
**Repair:** give Maren a will that is not identical to the ethical answer. Perhaps she asked to return, lies about why, fears oblivion, or has unfinished responsibility. Make each night change who is raised and what the necromancer is willing to do. Force the shrine keeper to confront their role in his departure. The climax should put sibling, keeper, and town claim in one decision.

## The Numbered House — excellent site narrative, uncertain human story

**What it is:** an ancient counting house whose mechanisms, keepers, questions, waterworks, rivals, and town-facing consequences reveal themselves through exploration.  
**Strength:** the site has behavioural coherence; noise/hum is a genuine pressure system; being counted changes access; riddles and machinery create cumulative understanding; the failing spring gives exploration an outward consequence.  
**Structural failure:** it is strongest as archaeological/environmental narrative and weaker as a story about people. “Decide what the town below is to be told” is thematically promising but underweighted against the pleasure of mechanism. The objective chain privileges depth and access. Rivals risk feeling appended to make a dungeon dynamic rather than arising from a central human conflict. There is no single terminal question as legible as the site's rules.  
**Repair:** choose one human story the House makes unavoidable: allocation of its water, legitimacy conferred by being counted, or ownership of its records. Introduce that claim before entry, let rivals embody competing answers, and end with a public consequence in the town. Do not reduce the site's ambiguity; make the ambiguity expensive.

## The Bound Howe — genuinely dramatic, but overplotted and morally diffuse

**What it is:** four parties race over a week to open, exploit, defend, or reseal a royal barrow while a levy demands its gold and iron.  
**Strength:** active factions, a clock, offstage movement, competing legitimate pressures, rival company, warden, dead inhabitants, multiple entries, and endings whose meanings differ. This is one of the few scenarios that plainly continues without the player.  
**Structural failure:** it risks having too many stories rather than none. The salvage race, levy, old woman's guardianship, rival company, king's rest, plan fragments, torc economy, and undead ecology compete for the centre. The goal's disjunction—keep the howe **or** meet the levy—reveals two different terminal stories. “Decide what the country pays” is broad but not emotionally anchored in a single relationship.  
**Repair:** establish a dominant dramatic question in the first encounter: *may the living spend the authority of the dead?* Make the warden, clerk, rival captain, and barrow king each answer it. Tie the levy to a named present deprivation so preservation has a price. Reduce plan-fragment and dungeon business that does not sharpen that question. End with a reckoning among surviving claimants, not only state observations.

## The Silent Lord — the most complete story engine, with a protagonist-shaped hole

**What it is:** a dead lord concealed, a false herald raising a levy, an alleged royal rider in the oubliette, unpaid soldiers, a will, forged papers, household factions, and a feast at which control crystallizes.  
**Strength:** excellent compression in the opening; several actors act from distinct interests; routines and a feast clock create temporal shape; discoveries revise the political story; prior actions feed an ending matrix; the public feast functions as a real crisis; aftermath changes the levy and household.  
**Structural failure:** the party can become an omnipotent external auditor: collect keys, evidence, loyalties, money, and readiness predicates, then let the matrix calculate a regime. The protagonist has no inherent standing in the succession and may therefore manipulate everyone without paying a personal or constitutional price. The large number of solvable subproblems can turn tragedy into optimization. Some endings differ because prerequisites were ticked, not because a final conscious choice was made.  
**Repair:** make standing explicit. Who invited the party, who can accuse them of interference, and by what right can they speak at the feast? Require a public declaration or sponsorship that closes other alliances. Allow incomplete truth to be politically potent. At the feast, ask the player to choose whom to recognize or what document to read; do not let the final regime be only an automatic checksum of preparation.

## The Walk of the Milestones — rich thematic procession, blurred central conflict

**What it is:** a barefoot company walks four towns chalking milestones; the Bench wants it stopped, priests disagree, and an unknown patron pays for bread.  
**Strength:** movement supplies form; recurrence across towns can produce accumulation; ritual, authority, hospitality, and patronage are thematically coherent; the procession can change public meaning as it travels.  
**Structural failure:** the premise withholds not only the mystery but the dramatic proposition. What does chalking numbers *do* that makes stopping or supporting it urgent? “Decided(walk)” is abstract. Four towns can become four variations on reception rather than an escalating argument. The unknown payer risks becoming a lore answer instead of a turn.  
**Repair:** state the material consequence early: the Walk establishes an old right of way, counts erased villages, activates a tax claim, or prepares a mass refusal. Each town should force a harder version of the same choice, with a member lost or gained. The patron reveal must reverse the moral valence of support. End where continuing the walk crosses a line that cannot be uncrossed.

## Wapshott's Peregrine Circus — a strong recurring world carrying too many later books

**What it is:** a travelling ensemble with an ordinary-life loop, performance systems, training, menagerie, relationships, a debt crisis at the Goose Fair, and a very large body of later journeys and revelations.  
**Strength:** the debt movement has a true spine: note served, rival embodied, preparations and compromises, public contest, reckoning, three meaningfully different settlements. Wapshott and Sallow have opposed but credible accounts of their past. The final fall pays off character through action. The recurring circuit gives ordinary life a rhythm against which crisis registers.  
**Structural failure:** the corpus has outgrown the clarity of “Phase I.” Later voyages, revels, island material, court business, creatures, weddings, warrants, and deep lore make the circus a delivery vehicle for many stories. The original debt can be delayed by abundance. Player activity often improves show-quality meters and completes charming side arcs without forcing priorities. Warmth and density become structural camouflage. The company has arcs, but the player can remain a helpful supernumerary whose own desire is unspecified.  
**Repair:** divide the material into explicit seasons, each with one governing dramatic question and a limit on concurrent personal arcs. In the debt season, every side story should affect money, loyalty, artistic identity, or Sallow's claim; otherwise defer it. Make at least one beloved opportunity mutually exclusive with saving the circus conventionally. Give the player a possible role—performer, creditor, rival, keeper, partner—that creates a stake in what the circus becomes.

---

## Ranking: where revision effort should go

### Reclassify rather than inflate

- The drovers' hall at the pass
- The Tower of the Scales
- A den in the wild
- Caught below, unless a generated human conflict is attached

These are useful forms. Calling them texture, institution, or encounter would improve the corpus more than forcing each into a miniature plot.

### Rebuild from the dramatic premise outward

- A fever on the green
- The cold pans
- The boundary stones
- The stranger who pays in old coin
- The players on the green
- The disputation on the green
- A fellowship with halls in four towns
- A brood under the hill
- The factor who buys old bronze

These have strong images or systems but lack a changing conflict. Patching more dialogue or alternate skill checks will not solve them.

### Preserve the chassis; sharpen choice and collision

- The drover who did not come home
- The held drove
- The last sea-gate
- The unquiet tower
- The Numbered House
- The Walk of the Milestones

These already contain enough material for stories. They need better turns, public scenes, and aftermaths.

### Edit for hierarchy, not invention

- The Bound Howe
- The Silent Lord
- Wapshott's Peregrine Circus

These do not need more content. They need a stronger centre, fewer simultaneous promises, and final choices that are consciously enacted rather than inferred from accumulated state.

---

## A practical revision protocol

For each scenario currently presented as a story, write a one-page structural sheet before touching prose.

### The seven mandatory sentences

1. **Apparent story:** At first, the player thinks this is about …
2. **Moving actor:** If ignored, [named person] will … because …
3. **Opposing claim:** [named person] cannot allow that because …
4. **Turn:** The player learns/causes …, which means the original ask was incomplete because …
5. **Crisis:** These people meet or their actions collide at …
6. **Choice:** The player must put … above …, losing …
7. **Aftermath:** Afterwards, daily life visibly differs in these three ways …

If any sentence can only be filled with a location, object, skill check, or state predicate, the story is not structurally ready.

### The scene budget

Small scenarios need very little, but each scene must do dramatic work:

1. **Hook scene:** want plus disturbance, not just rumour.
2. **Complication scene:** an actor resists or acts first.
3. **Turn scene:** evidence changes what the hook meant.
4. **Collision scene:** claims meet in public or under pressure.
5. **Aftermath scene:** named lives and the place register the choice.

Exploration and tactical routes may sit between these scenes. They should not substitute for them.

### The branch test

For every proposed ending, record:

| Question | Required answer |
|---|---|
| Who gets what they wanted? | a named actor |
| Who loses? | a named actor, not “the town” in general |
| What value did the player privilege? | a noun more precise than “good” |
| What becomes impossible? | a relationship, institution, livelihood, or truth |
| What image closes it? | a changed recurring object or place |

### The clock test

A clock should have at least three beats:

- **warning:** someone changes tactics;
- **deterioration:** a relationship or resource breaks;
- **crisis:** choices collapse into an irreversible event.

If the only beats are “safe” and “failed,” it is a deadline, not dramatic time.

---

## Recommended first revision pass

Do not begin with the largest scenarios. Prove the structural discipline on four small cases:

1. **The boundary stones** — revise from proof puzzle into a genuine allocation of land, water, memory, and public trust.
2. **The cold pans** — retain the excellent material clock but add opposed labour and resource claims.
3. **The stranger who pays in old coin** — replace the virtue/bribe toggle with contested ownership and an independently acting dealer.
4. **The drover who did not come home** — move the official arc from notification to the son's decision about inheritance and danger.

Together these exercise social conflict, time pressure, revelation, and grief without requiring a major engine change. Then use the lessons to revise **Fellowship** and **Walk**, where generated structure must carry genuine conflict variation.

For the major scenarios, the next pass should be subtractive:

- give **The Bound Howe** one governing question;
- give the party explicit political standing and a conscious final declaration in **The Silent Lord**;
- divide **Wapshott's** into seasons and cut or defer material that does not serve the current season's crisis.

---

## Final judgment

The corpus does know what stories are. The evidence is present wherever the writing allows desire, time, knowledge, and public consequence to bear on one another: Sallow coming to reckon the note; a concealed death becoming a regime at a feast; rival parties climbing toward a barrow; a son taking his father's spear before anyone is ready.

But the corpus does not apply that knowledge consistently. It repeatedly settles for a beautifully described problem and calls the solution an ending. The remedy is not more lore, more routes, more checks, more generated names, or more closing-state prose. It is to decide, scenario by scenario, **whose life is changing, who resists that change, what happens without the player, what discovery changes the moral meaning of intervention, and what the final act makes impossible forever**.

Until those answers exist, many of these pieces should be valued honestly as texture, incidents, institutions, and adventure sites. Those are worthy forms. The damage comes from pretending they already possess arcs they do not.
