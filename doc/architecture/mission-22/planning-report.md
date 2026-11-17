# Westernesse delivery plan after Mission 22

**Planning date:** 17 November 2026  
**Planning horizon:** five one-week sprints, preceded by a two-day control sprint; a sixth sprint is conditional  
**Source of truth:** `doc/architecture/open-register.md`  
**Purpose:** turn the mission record, register and experiential evidence into a small sequence of demonstrable outcomes.

This report does not enlarge Mission 22's commission. It gives the existing work a delivery shape. It is deliberately
more restrictive than the register: the register records everything owed, broken, questioned or imagined; a sprint
records the few things the project has chosen to finish next.

The central planning fact is uncomfortable but useful. Mission 22 produced real structural and performance gains, yet
three independent reviews did not perceive an improvement in the opening. The third review scored coherence 5/10,
legibility 4/10, beauty 6/10, restraint 5/10 and responsiveness 6/10. No person has played and accepted the first hour
(FH-01). Therefore the next unit of progress cannot be another count of mechanisms landed or register rows touched. It
must be a controlled player outcome.

## 1. Current portfolio condition

At this revision `scripts/register-tickets.ts` reads 736 rows, 403 live; 359 of the live rows are classified ready.
`scripts/register-state.ts` reads 700 rows and classifies 200 open and 154 partly. The difference comes from the scripts'
different row and state semantics. Recent commits have also fixed work whose register rows still look live: PA-03, for
example, is repaired by the family-name and household work but is still selected as a ready P1. Until these differences
are reconciled, neither count is a dependable sprint measure.

The portfolio has four further planning pathologies:

1. **Priority is not sequence.** There are more than ninety live P0/P1 rows. They cannot all be the next thing.
2. **A row is often too large.** DN-06, OR-60 and R10-01 each contain several independently deliverable outcomes.
3. **“Partly” hides the remainder.** A partly completed row may describe a landed fix, an open defect and an ambition in
   one status cell.
4. **Missions mix three cadences.** A commission, an engineering phase and a sprint have all been called mission work.
   This makes scope changes hard to see.

The remedy is not another ledger. The register remains canonical. Epics and sprint plans are selections and views over
register IDs, with no duplicate defect descriptions.

## 2. Planning model

### 2.1 Levels

| Level | Purpose | Completion test |
|---|---|---|
| **Mission** | The owner's release-level commission | Its acceptance claims are evidenced honestly |
| **Epic** | One player or production outcome | An outcome-level demonstration passes |
| **Sprint** | One fixed-capacity increment | Its sprint goal is demonstrated on a deployed revision |
| **Register item** | One defect, story, obligation, investigation or decision | Its own evidence is attached and the row disposed |

Mission 22 should close rather than expand indefinitely. The first two sprints below finish its unproved central outcome;
the remaining work should open the next mission under a short commission derived from what those plays establish.

### 2.2 Work kinds

Every item selected for a sprint should be labelled, in the sprint view, as one of:

- **Defect:** observed behaviour violates a current contract.
- **Story:** a player, author or operator gains a coherent capability.
- **Obligation:** an explicit owner or mission promise remains to be discharged.
- **Investigation:** the deliverable is evidence and a recommendation, not production code.
- **Decision:** alternatives and a recommendation require a ruling.
- **Chore:** internal work needed to deliver or preserve another item.
- **Ambition:** a valid direction not yet committed; ambitions do not enter a sprint directly.

Severity and scheduling priority must remain separate. Severity says what happens when a defect is encountered. Sprint
priority says why it belongs in this outcome now.

### 2.3 Epics for this horizon

| Epic | Outcome | Primary evidence |
|---|---|---|
| **E1 — Accepted first passage** | A cold player can enter, make a life, set out and take the first meaningful action without help or visible machinery | Recorded moderated and unmoderated plays; player account; timing |
| **E2 — Compelling first-hour slice** | One representative route contains desire, preparation, danger, discovery, consequence, recovery and a reason to continue | Golden-route play, replay and independent cold play |
| **E3 — Trustworthy world response** | Words, pictures, opportunities and consequences agree with authoritative state | Focused scenario suite plus player observation |
| **E4 — One player-intent boundary** | Page, terminal, runner and future agents resolve the same player-level intents through one authoritative projection | Parity specs and one cross-client trace |
| **E5 — Sustainable stewardship** | The register, documentation and evidence say the same thing and make the next choice visible | One parser, clean status, bounded ready queue, closeout |

SRD breadth, careers, planes, new continents, generalized dramatic topology and large authoring-language additions remain
valuable. In this horizon they enter only when required by E2's chosen slice or as a single budgeted proof. They are not
parallel epics with equal claim on capacity.

## 3. Cadence, capacity and controls

Use one-week sprints after Sprint 0. One week is short enough to stop an attractive investigation from becoming a new
program and long enough to deploy and observe one coherent change.

Assuming one lead-equivalent delivery stream, plan no more than **five committed outcome items** per sprint. A large item
counts as two. Capacity is allocated as follows:

- 60% sprint goal and its necessary code/content;
- 20% direct defects discovered while exercising that goal;
- 10% verification, evidence and deployment;
- 10% register and reference-document reconciliation.

The 20% defect reserve is not a general support queue. A new defect may interrupt the sprint only if it blocks the sprint
demonstration, causes loss/corruption, or is a regression in a protected invariant. Everything else is registered and
triaged for a later sprint.

Each sprint has one goal, one deployed demonstration and at most two active epics. Work in progress is limited to two
implementation items plus one investigation. Do not begin another item merely because one awaits a long test; use that
time for its evidence or register disposition.

## 4. Definition of ready and done

### Ready for a sprint

An item is ready only when:

1. the current behaviour or obligation is stated without historical narrative;
2. its work kind and epic are named;
3. the smallest convincing acceptance example is named;
4. its relevant owner ruling and authoritative contract are known;
5. unresolved design is either settled or the item is explicitly an investigation;
6. dependencies are met;
7. it can finish inside the sprint; and
8. the row does not bundle an already completed part with a different remainder.

If a row fails item 8, close the completed scope with evidence and split the remaining obligation into a new or existing
row before committing it.

### Done for an item

An item is done only when:

- the behaviour, content or document has changed;
- a check that would have failed before now passes, where automation is appropriate;
- an experiential claim has experiential evidence;
- browser, terminal and headless parity has been checked when the command surface changes;
- the deployed revision has been exercised;
- the register links the evidence and leads with its new state; and
- affected reference documents are reconciled in the same change.

“Implemented”, “verified”, “deployed”, “reviewed” and “accepted by a player” are different facts and must not substitute
for one another.

### Done for a sprint

A sprint is done when its goal, not merely its tickets, is demonstrated. Unfinished committed work returns to triage; it
does not silently roll over. The review records what was learned and the retrospective changes at most one process rule.

## 5. Sprint 0 — Restore planning control (two days)

### Goal

Produce one trustworthy live-item view and choose the exact first-hour test route before further implementation.

### Why first

The current scripts disagree, STATUS names the wrong active mission, and recent fixes remain live in the parsed register.
Selecting a sprint from this state would reward stale paperwork and obscure actual scope.

### Committed work

1. **One canonical register parser and state model (E5, chore).**
   - Make `register-state` consume the same parsed rows and state rules as `register-tickets`, or replace both entry
     points with one library and two views.
   - Count all supported table layouts.
   - Report malformed status leads, rows that say both closed and open, duplicate IDs and unclassified states as
     actionable hygiene failures.
   - Preserve historical prose; normalize only the leading current disposition.

2. **Reconcile work landed after the M22 report (E5, obligation).**
   - Audit every live PA, OR and Phase A row against commits since the report.
   - Begin with PA-03, OR-69 and OR-71, whose implementation evidence is visible in the recent log.
   - Close completed scope, split genuine remainders and remove stale priority claims.

3. **Repair current navigation (E5, defect).**
   - Rewrite `doc/STATUS.md` to say whether M22 is closing or extended for acceptance.
   - Link this plan and the current M22 report.
   - Do not change historical mission documents except for broken links or explicit supersession notices.

4. **Select the golden first-hour route (E1/E2, decision).**
   - Choose one seed, origin, ancestry and calling for repeatable comparison.
   - Prefer a route that naturally exercises creation, an ordinary action, conversation, travel, preparation, danger,
     discovery, return and consequence.
   - Name one alternate character to expose calling-specific failure; do not create a full matrix yet.
   - Record the expected dramatic beats without scripting the player's choices.

5. **Prepare the player protocol (E1, chore).**
   - Recruit or identify three cold participants: one for diagnosis, two for later confirmation.
   - Write a neutral prompt, consent/recording procedure and observation sheet.
   - Capture time to usable title, first confident choice, first confusion, first self-chosen goal, first consequence and
     whether the player wants to continue.
   - Do not teach controls unless the player asks; record the request.

### Explicitly not in Sprint 0

No visual redesign, career system, SRD expansion, new interaction framework or bulk register burn-down.

### Exit evidence

- Both register commands report the same row population and state totals.
- No landed PA/OR item remains “ready” solely because its register status is stale.
- STATUS points to the current planning truth.
- The golden route, alternate character and player protocol are committed.
- The Sprint 1 ready queue contains no more than eight candidates, five of which are committed.

## 6. Sprint 1 — Observe a person; repair the first passage

### Goal

A cold player reaches the first meaningful action without accidental interruption, unexplained control changes or a
transition that breaks confidence.

### Principal register scope

- **FH-01** — the unperformed first-hour player gate; this sprint begins it but does not close it on one participant.
- **PA-01/PA-02 and TO-03/TO-06** — studio/title/creation passage and creation flicker, after reconciliation identifies
  the still-live rows.
- **OR-23** — setting-out machinery between choosing and playing.
- **OR-44/OR-65 and related review rows** only where the cold observation reproduces them.
- **DN-06** only for prose encountered in the first passage; do not claim the omnibus writing problem closed.

### Sequence

1. **Baseline play before code.** Run one cold participant on the deployed revision. Observe through at least the first
   twenty minutes even if the first passage fails. Record interventions and distinguish a control failure, comprehension
   failure, aesthetic rejection and content indifference.
2. **Triage within 24 hours.** Select at most three causal defects. Prefer the earliest cause that changes later
   behaviour. Do not implement every comment.
3. **Studio/title invariant.** If reproduced, ensure the studio mark either completes or is explicitly skipped; it may
   never be pre-empted by load timing. Any skip is held, input-equivalent, reduced-motion safe and cannot activate the
   title's first row.
4. **Creation continuity.** Remove the cause of flicker or reflow. Keep one authoritative choice set. If selection cards
   are tested, make them a presentation of the same acts, not a new command system; use an experiment flag until compared
   in motion.
5. **Passage into play.** Remove unexplained loading/checklist/near-black beats that remain. Preserve honest progress when
   a cold start genuinely cannot be hidden.
6. **Prose sample.** Rewrite only the opening lines shown to be generic, contradictory or obstructive. Compare aloud and
   in the moving page, not in a prose document alone.
7. **Deploy and replay.** The same participant may verify repaired mechanics, but their aesthetic verdict is no longer
   cold and must be labelled accordingly.

### Acceptance

- The participant reaches a usable title and understands how to begin without instruction.
- Studio, title, creation, setting out and first scene form one uninterrupted recording with no accidental pre-emption,
  flicker, white flash, swallowed input or unexplained black interval.
- The first gameplay choice is visible and its result perceptible.
- The passage works by keyboard and touch-sized pointer simulation; reduced motion is checked.
- Every fix has a regression pin where deterministic; the full passage has a deployed recording.

### Stop rule

If the player rejects the premise, prose or first offered purpose rather than the controls, stop surface iteration and
carry that evidence into Sprint 2. Do not polish the transition to unwanted play.

## 7. Sprint 2 — Make one first hour worth completing

### Goal

The selected route gives the player a clear desire, an intelligible first step, meaningful preparation, a consequential
expedition and a reason to return or continue.

### Principal register scope

- **OR-60** — shallow play and hooks that do not onboard.
- **FH-03/FH-05** — thin opening on replay and aim glut.
- **HP-01/HP-02** — opportunities commissioned before desire and overstuffed exposition.
- **WD-08 or OA-12** — choose one route shape, not both as independent projects.
- **BO-07/R11-02** — conversation only if it prevents the selected route from becoming intelligible.
- **CB-01/CB-03/BP-07** — danger and novice viability only for the selected route and alternate character.
- **US-09/US-10** — rendered route, depth and reward as acceptance observations, not a promise to solve every dungeon.

### Product slice

The hour should contain these beats, expressed by the world rather than a tutorial checklist:

1. **Desire:** the player sees something they personally choose to care about.
2. **First step:** the world names a nearby, concrete action without choosing the entire quest for them.
3. **Preparation:** one ordinary act—asking, buying, examining, recruiting or learning—materially changes the odds or
   understanding of what follows.
4. **Departure:** the route is legible and no false opportunity signal is required to find it.
5. **Danger:** there is a reason to assess, avoid, negotiate, prepare or retreat; standing and fighting is not the only
   valid proof of play.
6. **Discovery:** attention reveals something not already stated by the commission.
7. **Choice and consequence:** at least one decision changes a person, place, resource or future opportunity.
8. **Return or continuation:** the outcome opens a specific next desire rather than merely another notice.

### Sequence

1. Play the chosen route headless and manually with the representative and alternate characters. Produce a beat map of
   offers, selected acts, new telling, aim changes, resources, harm and persistent facts.
2. Remove aim and exposition overload before adding content. A new aim appears only when the player has encountered its
   desire or deliberately sought work.
3. Make one preparation act genuinely useful. Prefer existing verbs and systems.
4. Balance or warn the route for both characters. A warning must name actionable help, and that help must be obtainable.
5. Ensure the expedition is more than a chain of rooms or one fight. Use existing substantial-site work where possible.
6. Make reward alter what the player may do, know or pursue; money alone is insufficient if there is nothing meaningful
   to buy.
7. Return to a changed reception or changed place. Pin the persistent fact and its projection.

### Acceptance

- A clean run can complete the eight beats without privileged commands or labels unavailable in the page.
- The alternate character has a viable route: different preparation, avoidance or help is acceptable.
- No more than four foreground actions appear in ordinary situations; the route does not depend on hunting through an
  unexplained secondary menu.
- Each styled promise maps to a legal action or an explained state.
- A replay and resumed checkpoint preserve the consequence.
- One internal play completes the route; the second cold participant is reserved for Sprint 3 so the route is not tuned
  entirely to its author.

### Stop rule

Do not add a generalized career, faction, crafting or procedural-quest system to repair a missing beat. Implement the
smallest world fact and response that makes this route convincing, then record the generalization opportunity.

## 8. Sprint 3 — Earn trust in the world

### Goal

A second cold player can rely on what Westernesse shows and says: opportunity marks, prose, paintings, danger and
consequences neither contradict nor over-promise the state beneath them.

### Principal register scope

- **AP-01/AP-07/PB-24** — promise fidelity and actions hidden a menu deep.
- **NP-01/NP-02/CO-17/OA-13** — perception, prose and painting against the moment.
- **WM-01/FH-08** — consequences and threads remembered.
- **SI-08** — danger perceived along a way.
- **OR-69/OR-71** — verify landed narration constraints rather than reopening them wholesale.

### Sequence

1. Run the second cold participant through the selected hour. Ask no leading questions during play. Afterward ask what
   each colour/mark meant, which facts they trusted, what changed because of them and where the game promised something
   it did not deliver.
2. Build a small false-promise corpus from this play plus the existing cold rounds. Each case records observed state,
   presented signal, offered act, result and violated contract.
3. Repair causes in the authoritative projection. Do not hide a false signal in CSS or rewrite prose around an absent
   state.
4. Bind narration to perception for the chosen cases; explicitly preserve intentional unanchored narration rather than
   changing the language default casually.
5. Make painting selection respect the state dimensions the selected route actually changes, or remove the contradicting
   painting from that moment. Do not commission a universal conditional-art system in this sprint.
6. Verify the return: dead people do not speak, completed facts do not reset, and the player's deed is attributed to the
   player at the right time.
7. Re-run the promise-fidelity and first-hour traces; add compact regression fixtures for each causal class.

### Acceptance

- The player can explain the selected route's opportunity marks in their own words well enough to act on them.
- Every marked action in the golden trace is legal, visible or deliberately one focus step away, and produces or explains
  the promised kind of response.
- No recorded line or painting contradicts time, light, life/death, location or the changed state in the trace.
- The return consequence survives save/resume and is visible without consulting debug state.
- Findings outside the slice are registered but do not expand the sprint.

## 9. Sprint 4 — One player-intent boundary

### Goal

The page, terminal and automated runner use one authoritative resolution path for the intents needed by the proven
first-hour route.

### Why now

The M22 thread audit found multiple clients independently translating offers into commands, two agent protocols, several
pathfinders and client-only focus. This duplication makes every experiential fix harder to preserve. It should be reduced
only after the intended route is known, so the API is extracted from real use rather than imagined generally.

### Principal register scope

- **TB-01/TB-09/TB-10** — semantic parity and engine-owned workflows.
- **OR-11** — obsolete press pipelines, if any remain after reconciliation.
- **OB-05** — a deployed blind-agent gate.
- **AR-05** — presentation inference only where it affects the selected intents.
- The M22 `audit/intent-runner.md` proposal, bounded to the golden route.

### Committed intent vocabulary

Start with only what the slice proves necessary: `continue`, `go`, `look`, `talk`, `ask`, `acquire`, `follow`, `fight`,
`rest` and `return`. An intent resolves against the current authoritative projection and returns:

- the observed act or workflow selected;
- the command actually performed;
- the resulting authoritative state identity; or
- a typed refusal naming the layer that could not satisfy it.

It must never invent an act, read hidden state to choose one, or bypass the same legality the player faces.

### Sequence

1. Record page, terminal and runner traces for the same seed and route; identify semantic rather than textual divergence.
2. Extract one resolver beside the authoritative projection for the committed vocabulary.
3. Move one workflow at a time, beginning with `continue`, `go`, `talk` and `follow`; keep each change bisectable.
4. Replace duplicated client logic only after the shared trace passes. Do not redesign every client in one landing.
5. Run the blind agent against the deployed build using player-visible state and the new boundary.
6. Remove superseded experimental pipelines whose only purpose is now served by the shared path.

### Acceptance

- The same intent trace on the same checkpoint selects semantically identical acts in page, terminal and runner.
- Refusals are explicit; no client silently falls back to hidden identifiers or its own route planner.
- A deployed blind run enters play and attempts the golden route through supported inputs.
- Existing direct command APIs remain available for deterministic low-level tests, but product clients no longer
  reimplement the selected workflows.

### Stop rule

Do not make natural-language understanding, a universal planner or autonomous play an acceptance condition. This is a
small stable boundary for known player intents.

## 10. Sprint 5 — Confirm the first hour and choose the next mission

### Goal

Obtain an independent verdict on the improved first hour, close Mission 22 honestly and commission the next mission from
evidence rather than accumulated possibility.

### Principal register scope

- **FH-01** — close only if the evidence genuinely supports acceptance; otherwise leave open with a sharper diagnosis.
- **DN-06/OPR-01** — reassess the remaining P0s against actual play and split their actionable remainders.
- **AI-07/US-09/US-10** — evidence of completion and depth where the selected run bears on them.
- **E5 stewardship rows** generated by Sprint 0.

### Sequence

1. Freeze the candidate except for release-blocking defects. Record revision, environment and known limitations.
2. Run the third cold participant for a full hour without coaching. Preserve the unedited recording and state trace.
3. Collect the participant's account before showing earlier findings:
   - What did you want?
   - What did you believe you could do?
   - Which choice felt consequential?
   - What did the world remember?
   - Where did you stop trusting or caring?
   - Would you continue voluntarily, and why?
4. Compare with the Sprint 1 and Sprint 3 plays using behaviours and timestamps, not a synthetic score alone.
5. Run the golden route's automated evidence, push lane and relevant long/browser suites.
6. Reconcile every committed item. Close only what the evidence proves; split remainders; record superseded proposals.
7. Write the closeout around the five epics. State what was implemented, verified, deployed, independently reviewed and
   accepted as separate claims.
8. Choose the next mission's primary outcome. Candidate directions are:
   - broaden the compelling route into varied first hours;
   - careers and a world that answers resolved deeds;
   - world identity and communities;
   - authorability and the shared intent boundary;
   - rules fidelity required by actual play.
   Select one, not a portfolio of all five.

### Acceptance

- One unedited, independently played hour and its state trace are retained.
- The participant reaches a self-chosen purpose and at least one persistent consequence, or the exact failure is stated.
- All sprint commitments have evidence and a register disposition.
- STATUS, the register, the closeout and the next commission agree.
- The next mission has one primary outcome, no more than five candidate epics and a first sprint selected from a bounded
  ready queue.

## 11. Conditional Sprint 6 — Vary without breaking the slice

Do not schedule this sprint now. It is the first sprint of the next mission only if Sprint 5 establishes that the golden
route is genuinely good but too narrow.

### Goal

Prove that the successful first-hour grammar survives a second origin, calling and route without copying the first
route's content or weakening its consequence.

The sprint should select one contrast: social rather than martial, urban rather than wild, or service/debt rather than
expedition. It should reuse the same outcome beats and trust contracts while permitting different verbs and dramatic
shape. Acceptance requires a fourth cold play. If the golden route was not accepted, this sprint is cancelled; repair the
failed outcome instead of multiplying it.

## 12. Backlog policy during the horizon

### New findings

Every new finding receives an ID and one initial disposition within one working day:

- sprint blocker;
- candidate for the next sprint;
- later mission;
- decision/investigation required;
- duplicate;
- deliberate ambition;
- obsolete or by design.

Registration does not imply commitment. No item becomes P0 merely because it is the owner's most recent observation;
P0 is reserved for inability to obtain the mission's primary outcome, destructive failure or an acceptance gate that
cannot otherwise run.

### Ready queue

Maintain a ready queue of no more than twice one sprint's capacity: roughly eight to ten items. Other live rows remain
triaged but not “ready next”. Readiness should expire when its governing contract changes or after two sprints without
selection; recheck before commitment.

### Research and proof cases

At most one investigation is active in a sprint. It needs a question, a time budget, evidence to collect, a decision it
will inform and a terminal output. “Continue investigating” is not an acceptable disposition.

One small SRD or authorability proof may use the 10% stewardship/research allowance when it does not threaten the sprint
goal. Prefer a proof required by the golden route. Do not count catalogue coverage as executable behaviour.

### Defect triage

Use these severity definitions:

- **S0:** data loss, unrecoverable corruption, security or inability to deploy/play.
- **S1:** blocks the sprint outcome or causes an ordinary player to fail without a viable recovery.
- **S2:** materially damages comprehension, trust or play but has a viable route around it.
- **S3:** local quality, polish or uncommon inconsistency.

Delivery priority is then decided by severity, frequency, mission relevance, causal leverage and cost of delay.

## 13. Measures that matter

Do not use register closure count as the primary success measure. Track:

### Outcome measures

- time to usable title;
- time to first confident, unprompted gameplay choice;
- number and timing of requests for help;
- whether the player forms a purpose in their own words;
- whether preparation changes a later outcome;
- whether at least one choice creates a visible persistent consequence;
- voluntary continuation at twenty minutes and one hour;
- player-reported trust in words, marks and pictures.

### Flow measures

- committed items finished within the sprint;
- unplanned work as a share of capacity;
- work-in-progress age;
- items reopened because evidence was inadequate;
- ready-queue size and age;
- live rows whose state is unparseable or contradicts their prose.

### Guardrails

- cold and warm startup;
- input-to-acknowledgement and act-to-next-choice latency;
- browser/terminal/runner semantic parity;
- four-foreground-action invariant;
- save/resume consequence fidelity;
- push and nightly health.

Headless opportunity counts, test totals and closed register rows remain diagnostic measures. They are not proxies for a
person finding the game beautiful, intelligible or worth continuing.

## 14. Required planning artifacts

Keep the artifacts small:

1. **This horizon report:** stable intent; revise only when evidence invalidates the sequence.
2. **`current-sprint.md`:** goal, dates, committed IDs, capacity, dependencies, demonstration and decisions. Rewrite each
   sprint; do not accumulate history in it.
3. **Register:** canonical item descriptions, status and evidence.
4. **Sprint review:** one page or less, stored with the mission history: outcome, demonstration revision, evidence,
   unfinished work and changed forecast.
5. **Closeout:** mission-level claims and next commission.

Suggested `current-sprint.md` form:

```md
# Sprint N — outcome

Dates:
Goal:
Deployed demonstration:

| ID | Kind | Why in this sprint | Acceptance | Owner | State |
|---|---|---|---|---|---|

Capacity reserve:
Dependencies and decisions:
Evidence links:
Not in scope:
```

## 15. Decision requested from the owner

Adopt the two-day Sprint 0 and one-week cadence through Sprint 5. Treat the first three cold participants as scarce
acceptance evidence, not continuous design collaborators. Authorize the lead to split omnibus rows and close stale scope
with repository evidence while preserving their provenance.

The plan's controlling choice is simple: **prove one first hour before broadening the game again**. If a person accepts
that hour, the project has a stable unit to vary and generalize. If they do not, their failure is more valuable than
another hundred completed register rows, because it tells the next mission what must actually change.
