# Westernesse delivery plan after the three planning views

**Planning date:** 20 November 2026  
**Planning horizon:** the remainder of Sprint 3, three one-week delivery sprints, and one conditional broadening sprint  
**Sources of truth:** the register and archive for the record; `planning.json` for the supported slice and active queue  
**Supersedes for current planning:** `planning-report.md` (17 November); that report remains the forecast and history
of Sprints 0–3.

## 1. Executive judgment

The next plan should no longer be organized around global register zero. The new tools distinguish three different
questions which the old plan allowed one count to answer badly:

| View | Question | Current reading | Planning use |
|---|---|---:|---|
| Register | What is honestly known to be wrong, owed or wanted? | 1,095 rows; 479 live | portfolio record, never a sprint target |
| Supported first hour | What known P0/P1 can a player meet in the declared release slice? | 87 of 89 declared rows live | release gate and burn-up denominator |
| Active queue | What have we actually chosen to work on now? | 10 blockers; 3 platform items | capacity and ownership |

The kind view sharpens the distinction again. Of 433 live, non-deferred rows, 381 are defects, 29 requirements and 23
directions. Seventy-eight defects are P0/P1 release-blocking; the wider 109 live P0/P1 count includes obligations and
directions which must remain visible but should not all masquerade as failures of shipped software.

This gives a clearer strategy:

1. finish Sprint 3 as a bounded trust-repair increment, using the active queue rather than the entire first-hour set;
2. stabilize the platform beneath the same two played routes, so a fix made in one client cannot drift in another;
3. burn down the supported first-hour gate in causal groups, repeatedly replaying the composed hour;
4. freeze a candidate and seek independent human and owner acceptance;
5. broaden only if the bounded hour is accepted.

The product judgment of the 17 November report still holds: prove one first hour before broadening the game. What has
changed is that the project can now say precisely which ledger, gate and queue prove which part of that claim.

## 2. What has changed since the first plan

### 2.1 The control sprint succeeded

The two register readers now share one parser. They agree on all 1,095 rows and their states; there are no duplicate
IDs, unknown leading dispositions or closed rows which still say open. The original report's chief control risk is
therefore closed.

### 2.2 Sprints 1 and 2 produced a route, but not acceptance

The project now has two explicit Iscoed acceptance routes and eight named beats: desire, first step, preparation,
departure, danger, discovery, choice and consequence, and return. Their strongest claims have been re-walked and
pinned, including preparation changing the barrow and rat fight, consequences through save/resume, and the held drove
and sea-gate stories.

That is meaningful construction evidence, but cold-player evidence remains poor. Recent blind plays scored 5 and 6;
the deployed cold play on 20 November scored 5/10. A trace which the author can complete is not yet a first hour a cold
person will understand, trust or want.

### 2.3 Sprint 3 has completed its investigation

Sprint 3 has already delivered:

- a clean recorded warrior and mage run with all eight beats;
- a deployed blind play and its triage;
- a false-promise corpus from cold plays 2–8;
- golden-route narration and painting checks;
- return and consequence checks through save/resume;
- stronger revisits of the barrow preparation and the actual route's mage and hireling.

The sprint is no longer primarily an investigation. Its remaining job is to repair the causes now known: responsiveness,
conversation, world response, marked action, map and setting-out coherence, the opening passage, and the options page.

### 2.4 The global count is allowed to grow

Honest play and splitting added rows while work closed others. That is not failure. The register is an expanding record;
the first-hour denominator is a declared gate; the queue is a deliberate limit. Future reports must print all three and
must not use one as a proxy for another.

## 3. Planning model

### 3.1 The three views

**The register is evidence memory.** Discoveries enter it even when the queue is full. A row closes only when its own
claim is proved. Requirements and directions retain their priority and provenance but are counted apart from defects.

**The supported slice is the release contract.** It includes creation, opening, the warrior's drove route, the mage's
weir route, ordinary travel, a first fight, return, save/resume and the deployed page. A P0/P1 row in that experience
stays in its denominator after closure. A live P0/P1 outside it needs a written reason.

**The active queue is the plan of record.** It contains at most ten player-facing blockers and three platform items.
Every item has one owner and one acceptance statement. An urgent breach may displace an item, but the displacement is
recorded and reversed when the urgent row closes.

### 3.2 Work kinds

For planning, use three durable register kinds and three temporary sprint activities:

| Kind | Meaning | May block release? |
|---|---|---|
| Defect | observed behaviour violates a current contract | yes, at P0/P1 in the slice |
| Requirement | a committed promise or acceptance remains unmet | yes as a gate, but report apart from defects |
| Direction | future design or research | no, until commissioned as a bounded requirement |
| Investigation | sprint activity whose product is evidence and a decision | only through the defect or gate it examines |
| Verification | sprint activity which proves an existing claim | only through the row it verifies |
| Chore | preservation or delivery work required by another item | never independently |

### 3.3 Capacity

The queue limit replaces the earlier five-item fiction: several active rows are different faces of one causal repair.
Within each sprint, group the queue into no more than three approaches. Work in progress remains two implementation
threads and one evidence thread.

Allocate capacity as follows:

- 60% to the sprint's two or three causal approaches;
- 20% to platform work which directly preserves those approaches;
- 10% to deployment, replay and evidence;
- 10% to newly discovered blockers and register reconciliation.

Registration is unlimited. Promotion is not. Ordinarily promote at most three findings from a cold play; override that
only for an act which lies, lost state, an irreversible softlock, a blank selectable row or a comparable breach of basic
trust.

## 4. Definitions of ready and done

### Ready for the active queue

An item is ready only when:

1. it is a live register row;
2. it belongs to the supported slice, or is one of the three named platform enablers;
3. the present failure is reproducible or the unmet obligation is explicit;
4. its owner and smallest convincing acceptance are written in `planning.json`;
5. its dependency is named and active, or already met;
6. it can be advanced materially inside one sprint; and
7. it is not merely an ambition hidden in a P1 row.

Closed rows cannot remain active or urgent. The planning checker treats that as a fault.

### Done for an active item

An item is done when the observed failure no longer occurs, a check which would have failed before passes, the composed
route still passes, the deployed page has been exercised where relevant, and the register cites the evidence. A causal
repair is not done merely because its new abstraction exists; the observed examples which justified it must pass.

### Done for a sprint

A sprint is done when its outcome is demonstrated on one named deployed revision and every active item is completed,
transferred or re-scoped with a reason. Ticket completion without the composed demonstration is not sprint completion.

### Done for the first-hour gate

The release gate is reached only when:

- the supported-slice view prints `0 / N` live P0/P1 rows;
- a fresh deployed robot play finds no new P0/P1 blocker;
- both acceptance routes pass through save/resume on the deployed candidate;
- an independent human either accepts the hour or creates a new blocker;
- owner prose review passes or leaves a precisely named blocker; and
- register, queue, sprint report, STATUS and closeout agree.

## 5. Sprint 3 remainder — repair the known breaches of trust

### Goal

On the supported first hour, every input is acknowledged, the opening becomes play without machinery showing, the map
and conversation expose coherent choices, and the world visibly answers the player's deed.

### Why this is the right remainder

The earlier Sprint 3 goal—words, marks, paintings and consequences can be trusted—remains correct. Its investigations
are complete and have localized the remaining causal classes. Starting a new thematic sprint before repairing them
would preserve the old habit of learning more than the project finishes.

### Committed queue

Player blockers: OR-91, OR-145, OR-144, OR-149, CL-32, CL-33, OR-152, OR-151, OR-143 and OR-23.  
Platform: MT-18, MT-24 and AX-04.

OR-159 is closed and leaves the queue. OR-143 returns to the place it temporarily yielded.

### Approach A — immediate, atomic interaction

**Rows:** OR-91, OR-145, MT-24; AX-04 and OR-144 where startup is the cause.

The player must receive acknowledgement within 100 ms, and a committed choice must close the old page to further
input until the answer arrives. Treat acknowledgement, commitment and completed response as three measured moments.
Give each command one receipt and one commit boundary; do not solve double input with a longer debounce.

Sequence:

1. instrument touch and mouse from pointer event to acknowledgement, receipt and next actionable screen;
2. reproduce the long-press double commitment and a1's slow third act;
3. land the command receipt at the narrowest existing command boundary;
4. make the page render pending commitment from the receipt rather than infer it locally;
5. take the largest post-commit cost first, preserving full/incremental equality;
6. measure warm creation and Set out now separately from an ordinary act.

Acceptance:

- every tested input acknowledges within 100 ms on touch and mouse;
- one gesture yields one receipt and one committed command;
- the old actionable page cannot accept a second choice after commitment;
- a1's third act is under 300 ms;
- a warm new world and Set out now each meet their declared three-second budgets;
- mutation or forced-delay checks prove the timing and atomicity tests can fail.

Stop rule: do not hide latency with animation, optimistic state not backed by a receipt, or a client-only lock.

### Approach B — one authoritative choice surface

**Rows:** OR-152, OR-151, CL-33, MT-18; OR-143 as the same information-design discipline.

The engine's journeys and acts must be the rows every client renders. From indoors, setting out first reaches the world
outside unless the map truthfully explains another rule. The consequential act among several choices is marked from
authoritative semantics, not guessed from its words.

Sequence:

1. record full offers, IDs, words and marks for the golden walks in engine, page, runner and terminal;
2. make the parity baseline monotonic: no new divergence may land;
3. replace the page map's reconstructed rows with `DoableJourneys` rows;
4. preserve old command IDs only as replay aliases, never as a second product offer;
5. make indoor setting-out an explicit engine workflow;
6. prove the marked consequential act in the browser;
7. apply the same hierarchy test to options: fewer distinct choices, proper grouping and icons, no handbook masquerading
   as a game option.

Acceptance:

- every engine destination is reachable by keyboard and the page invents none;
- the same golden checkpoint exposes semantically identical offers across clients;
- indoor departure either goes outside first or explains why it cannot;
- the act which matters is distinguishable among the four without opening an unexplained fragment;
- options pass at laptop and phone widths.

Stop rule: do not build a universal natural-language intent system. This sprint needs one projection of existing acts.

### Approach C — opening, conversation and response as one played passage

**Rows:** OR-23, OR-149 and CL-32; OR-144 where the opening wait is involved.

These are not three independent cosmetics. The opening promises a literary world, conversation should feel like talking
to someone, and the return must show that someone and their place have changed. Prove them as one passage from title to
Owain, Mardle, the Rhyne and the return to the green.

Sequence:

1. show the prologue painting and first sentences while the world is made; remove the checklist and black frame;
2. render one conversation as a scrolling page of what was said, keeping executable choices clear;
3. walk Owain and Mardle's exchanges aloud and in the browser;
4. complete the drove response audit: Owain at the Rhyne, Bran's fate and the green's memory;
5. save after the consequential choice, resume and return through the ordinary page;
6. replay the same passage on the deployed revision.

Acceptance:

- creation's wait contains the world rather than exposing construction;
- Owain's and Mardle's conversations read as dialogue, preserve what was said and remain operable;
- the return visibly answers the three named deeds after save/resume;
- no line, mark or painting in the passage contradicts authoritative state.

Stop rule: do not commission the M23 conversation programme; OR-149 is its bounded M22 slice.

### Sprint demonstration and exit

Record both golden routes on the deployed page. The warrior demonstration must include the opening, a conversation, the
Rhyne decision and changed green. The mage demonstration must include creation, setting out, map use, preparation and
return. Print the register, slice and queue views beside the recordings.

Sprint 3 closes when the three approaches pass, every queue row has a disposition, and a fresh blind play has no new
urgent breach. Other live slice rows remain honestly in the gate backlog; they do not silently enter this sprint.

## 6. Sprint 4 — stabilize the platform under the played hour

### Goal

The two acceptance routes use one projection and one committed command boundary in every supported client, and remain
responsive under the size of a real placed world.

### Forecast queue

The exact queue is selected at Sprint 3 review. Expected platform core: MT-18, MT-24 and the surviving performance cause
from AX-04/SP-02/AX-05. Expected player-facing witnesses: AR-05, TR-21, CO-20, PB-29 and any Sprint 3 item retained with
a precise remainder.

### Approach A — finish one projection

Move divergences one causal family at a time: journey rows, conversation rows, led rows, focus and fragments. The engine
owns legality, ordering, words and marks; clients own layout, input mechanics and accessible presentation. Maintain a
counted parity baseline which may only shrink.

Acceptance is offer parity zero on both golden walks, including IDs, semantics and marks, with no client exception.

### Approach B — finish the command receipt

Extend the receipt from Sprint 3's first step until one command maps to one atomic unit of work with a committed outcome,
typed refusal or explicit continuation. Save/resume must never capture a half-command. Browser pending state and runner
reporting consume the same receipt.

Acceptance is one receipt per golden command, no lost or doubled commitment under induced delay, and equivalent refusal
semantics across page, runner and terminal.

### Approach C — scale only the supported world

Measure startup and screen construction on the actual Iscoed worlds, largest cost first. Separate data placement,
projection, serialization, worker transfer and rendering. Preserve equality and causal extent whenever work becomes
incremental.

Acceptance is a warm new world under three seconds, ordinary input acknowledgement under 100 ms, the declared act
budgets held on a1, and no regression in the recorded routes.

### Sprint demonstration and exit

Run the same checkpoint and semantic trace through page, terminal and runner. Retain the offer-parity report, command
receipts and timings. Then run both routes on the deployed page. Sprint 4 is not a general client rewrite: work outside
the traces remains registered for later.

## 7. Sprint 5 — burn down the supported first-hour gate

### Goal

Remove every known P0/P1 blocker from the declared supported first hour without narrowing the slice or confusing an
unmet requirement with a software defect.

### Queue selection

At Sprint 4 review, regenerate the slice and select the next ten by this order:

1. live P0 defects;
2. P1 defects reproduced on the composed routes;
3. requirements needed for the gate demonstration;
4. causal repairs which close several reproduced rows;
5. verification needed to dispose a partly row truthfully.

Directions do not enter merely because they are P1. A direction must first become a bounded requirement with a named
demonstration.

### Approach A — first-hour dramatic core

Expected families: CB-01/CB-30/CP-19 and SI-01 for a fair first fight; OA-12, HP-03 and DN-08 for one compact emotional
expedition; ST-03/ST-11 for the sea-gate and the road which follows. Repair the composed experience, not isolated counts.

Acceptance is one viable fight for each route, preparation which changes it, a three-beat resolution, and a return whose
next desire arises from the consequence.

### Approach B — legibility and discovery

Expected families: AP-03/AP-07/AP-18, RI-01/02/03/05, BO-05/07/11/12, CO-19 and OA-14. Make an ordinary act reveal
something, distinguish looking from sustained investigation, and ensure a learned or found capability matters later.

Acceptance is a played sequence in which two characters discover meaningfully different information, one learned verb
or lesson changes what can be done, and no promise-corpus contract fails.

### Approach C — page composition and travel

Expected families: TO-03/06, OR-37/71/125/126/137/140/142/160/161/162/163, FM-01/03 and TR-21. Select only the causal
group which remains after Sprint 4; do not commit the whole list at once. Prefer a composed opening or journey repair
which disposes several observations.

Acceptance is the full hour at laptop and phone widths, keyboard and touch, reduced motion on and off, with journeys
walked leg by leg and no unexplained focus, numbering, colour or engagement transition.

### Tribunal beside implementation

Verification is read-only until a row's evidence is understood. For each live gate row: close, split, duplicate or retain
with a current reproducer. Never lower priority to make the denominator fall. Publish defects, requirements and directions
apart, then print the one gate numerator over the fixed declared denominator.

### Sprint demonstration and exit

Sprint 5 ends only when `planning-views` prints zero live P0/P1 rows in the declared slice, or when the review explicitly
states which rows prevent that outcome and forecasts another burn-down sprint. A calendar boundary cannot manufacture
zero. Once zero is reached, freeze the candidate except for urgent regressions.

## 8. Sprint 6 — independent acceptance and mission close

### Goal

Obtain independent evidence that the supported first hour is comprehensible, trustworthy and worth continuing, then
close Mission 22 with every claim labelled as implemented, verified, deployed, independently reviewed or accepted.

### Approach A — freeze and rehearse the candidate

Record revision, environment and known limitations. Run the two golden routes, relevant browser suites, parity report,
command atomicity checks and the three planning views. Fix only release-blocking regressions; other findings enter the
register without destabilizing the candidate.

### Approach B — independent human session

Run one uncoached hour on the deployed page with consented screen and voice recording. Before showing prior findings,
ask what the player wanted, believed possible, found consequential, saw remembered, stopped trusting, and whether they
would continue. Preserve behaviours and timestamps, not only a synthetic score.

Acceptance requires a self-chosen purpose, preparation which the player notices changing a later outcome, one visible
persistent consequence, and voluntary interest in continuing. A failure creates a blocker; it is not averaged away.

### Approach C — owner prose and product judgment

Read the reference corpus aloud in the page at the states which produce it. Separate grammatical correctness, state
fidelity, literary quality and product taste. The owner either accepts it or names a bounded blocker with examples.

### Approach D — closeout and next commission

Reconcile register, archive, slice, queue, STATUS and evidence. Every unfinished queue item is completed, transferred or
re-scoped with a reason. State separately what is implemented, verified, deployed, independently reviewed and accepted.
Choose one next-mission outcome from evidence, not from the size of its backlog.

### Exit

Mission 22 closes when the first-hour gate is zero, the human and owner gates are passed or honestly block closure, and
no active item is abandoned. If either acceptance gate fails, reopen only the causal repair needed and repeat the gate;
do not broaden the product.

## 9. Conditional Sprint 7 — vary the accepted grammar

Schedule this only if Sprint 6 accepts the hour but finds it too narrow.

### Goal

Prove the accepted grammar survives one contrasting origin, calling and route without copying Iscoed's content or
weakening consequence.

### Approaches

1. **Choose one contrast:** social rather than martial, urban rather than wild, or service/debt rather than expedition.
2. **Reuse contracts, not plot:** the eight beats, semantic promises, receipt, one projection and persistent return stay;
   verbs and dramatic shape may differ.
3. **Protect difference:** record what the new route teaches that Iscoed cannot and reject a reskin.
4. **Cold confirmation:** a new independent play must form a different purpose and still trust the same interface laws.

If Sprint 6 does not accept the bounded hour, cancel this sprint and repair the failed outcome.

## 10. Backlog and interruption policy

Every finding receives an ID and a disposition within one working day: urgent interruption, queue candidate, later
mission, investigation/decision, duplicate, direction or obsolete/by design. Registration does not imply commitment.

An urgent finding interrupts only for lost state, an irreversible softlock, an act which lies, a blank selectable row,
security/corruption, or inability to deploy or play. It displaces a named queue item. When it closes, remove its urgent
record and restore or explicitly re-triage the displaced item.

At most one evidence investigation runs beside implementation. It needs a question, time budget, evidence, decision and
terminal output. Research without a decision does not occupy the queue.

Partly rows are split only when completed and remaining clauses genuinely have different evidence, owners, priority or
mission homes. Splitting is for truth, never denominator management.

## 11. Measures and reporting

Every sprint review prints:

- register rows total and live, by defect/requirement/direction;
- supported-slice live P0/P1 over its declared denominator;
- active blockers and platform items against their limits;
- urgent additions and named displacements;
- the deployed revision and composed demonstration;
- time to usable title and first confident unprompted choice;
- input acknowledgement and next-action latency;
- requests for help, self-chosen purpose, noticed preparation and persistent consequence;
- whether the player would continue, and why;
- unfinished work and its explicit disposition.

Closed-row count, test count and mechanism coverage remain diagnostic. None substitutes for a player finding the game
coherent, beautiful, intelligible and worth continuing.

## 12. Required artifacts

1. **This report:** the current horizon and sprint approaches; revise only when evidence changes the sequence.
2. **`planning.json`:** declared supported slice and capped active queue.
3. **`current-sprint.md`:** operative sprint outcome, approaches, active IDs, demonstration and decisions; older sprint
   boards remain history below it until they are extracted.
4. **Register and archive:** authoritative rows, kinds, states and evidence.
5. **Sprint review:** one compact account of outcome, deployed revision, evidence, dispositions and changed forecast.
6. **Mission closeout:** release claims, acceptance results and the next single commission.

## 13. Immediate decision

Adopt the Sprint 3 remainder queue and its three approaches. Do not open Sprint 4 merely because the calendar advances;
close, transfer or re-scope every active item first. Thereafter use the generated slice, not the global register, to
select each queue.

The controlling choice remains: **prove one first hour before broadening Westernesse**. The new tooling makes that choice
operational. The register can remain unlimited and honest, the queue can remain small, and the standard of acceptance
can remain demanding without pretending that all three are the same number.
