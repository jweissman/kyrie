# M22-beta: preparation report (23 November 2026)

A preliminary investigation, architectural reconciliation and sprint plan for M22-beta. It is not an authorization to
start implementation. It draws on the alpha documents (closeout, retrospective, acceptance record, hand-off), six
November studies (platform maturity, world-interaction evolution, the architectural review, Kyr language evolution,
Kyr authorability, defect centres), the register, targeted measurement made for this report, and an **independent
read-only audit** commissioned for it (§ Independent audit).

Every claim is marked: **[F]** observed fact, with its evidence; **[I]** architectural inference; **[D]** creative
direction (the owner's); **[P]** proposed work.

## The answer first

**Can beta deliver all three, together?** Yes, if it is scoped as convergence:

1. a trustworthy, more enjoyable small Westernesse experience;
2. a healthier, more expressive Kyr and Kyrie;
3. an enforced platform/product separation, with a first authoring workbench.

It can do this only because the three goals share one spine. The defects that break trust, the machinery that makes
Kyr hard to author, and most of the setting leaks have the same cause: **meaning is reconstructed downstream instead
of being owned once upstream** [I]. Beta should be five sprints of about a week, one lead and at most two agents.
Gamma takes the creative breadth.

**The smallest credible mission** [P]:

1. **One outcome per offered act, owned by the engine and verified.** Each row the player can choose carries a
   predicted outcome: what it teaches, advances, risks, ends, opens and costs. It is computed by a bounded speculative
   step, not by scanning effects, and checked against what actually happened when the act is taken. Every indicator
   reads it.
2. **One situation state.** The player is in exactly one of: the place, a conversation, an engagement (an occasion),
   the map, a journey, or a fight. Each has explicit transitions and one focus, and every client renders the state it
   is given.
3. **One atomic command, with its receipt.** Finish MT-24 with fault injection.
4. **One high-level Kyr construct taken all the way:** *Occasion* as the authored form of an engagement, with
   *Undertaking*'s reward and aftermath as its second step.
5. **One setting-independent proof:** a small non-Westernesse scenario through the public lifecycle, with the layer
   ratchet driven to zero for the runtime→setting edges it exercises.
6. **One reference loop made good:** Porthalen and its undertown as the integration laboratory, with combat that
   costs something, conversation that progresses, and paintings in its own weather.
7. **One authoring workbench:** an upgraded Deem with `deem browse`, templates made runnable blind, and a sample,
   compare and record loop.

**Reserve for gamma:**
- the three settlement typologies;
- the deep places (Dun Rìerdan, St. Thera's Reach, Babylon, the undersea);
- the Arcana and the perk stage;
- full conversation-as-dialectic;
- broad SRD conversion;
- a Studio application;
- package extraction;
- cross-setting characters and history.

**Capacity** [I]: this is about five focused weeks for one lead, plus one agent on the maturity track and one on the
world and authoring stream. If capacity is lower, drop item 7 to a demonstration and keep 1, 2, 3 and 6. Those four are
what the owner's acceptance depends on.

## A. Alpha-to-beta contract matrix

| Commitment | State | Evidence |
|---|---|---|
| One projection of the offer's rows, every client a renderer | **Implemented, incomplete** | [F] Doable is the engine's offer, and scripts/client-parity reports 0 divergences. But the parity tool does not measure the terminal or the talk drawer, and the page still decides focus, leading and tone from label text and id shapes (web/reader/stage/glance.tsx:430, :551, :588, :603, :646; menu-model.ts:65, :298, :344). The retrospective called this reliable; the audit is right that it is partial. |
| Every Atlas mark has a witness | **Structurally enforced** for its construction | [F] Attest issues witnesses from the glance (src/presentation/attest.ts). |
| Every Atlas mark is true | **Violated** | [F] Measured on the warrior's walk: 3 teaching replies unmarked, 1 marked reply teaching nothing (alpha-acceptance case 5). "Teaches" is predicted by two scanning heuristics OR'd together (choice-grouping.ts:289-301; teaching.ts:12). |
| Focus continuity (OR-177) | **Implemented for two cases, unverified generally** | [F] Engaged narrows the frame for a threat and for engaged_in (the window table and the riddle pins). Focus is still decided in src/ui (Attention) (OR-173). The map-in-view case is undiagnosed. |
| Undertaking continuity (OR-179) | **Scenario-proven only** | [F] test/weir-route leads the rats job to its payment. OR-176 (a rule on the clock) and OR-179 (a payoff as a separate aim) are open. |
| Command atomicity (MT-24) | **Implemented as labels, not as a guarantee** | [F] OpenCommand records phases and a receipt (src/session/open-command.ts; test/kept-at-receipt). The world commits before expansion, telling and settling. There is no fault-injection test. |
| Per-campaign catalogs (AR-02; review Finding A) | **Violated** | [F] LocalKinds.activate swaps a process-global catalog (src/canon/local-catalog.ts:151; campaign.ts:52, :103, :293). |
| Strict fact reads (MT-25) | **Implemented, incomplete** | [F] The strict preload exists; the whole-suite run under it is not clean (MT-25 open). |
| Layer direction | **Enforced as a ratchet, not satisfied** | [F] 154 wrong-way imports (runtime→setting 65, player→setting 76, setting→player 13), layers-baseline.json, held by test/small/layers. The audit's claim of no test gate is mistaken. |
| Dependency cycles | **Enforced as a ratchet, not satisfied** | [F] 641 cycle edges, cycles-baseline.json, held by test/small/cycles. |
| Saves, replay, compatibility | **Scenario-proven only** | [F] Checkpoints are version 1, with no migration (checkpoint-store.ts:55). Replays are by semantic id (MT-15 closed). Compat snapshot tools exist (src/cli/compat-*.ts). There is no cross-version load test and no save in each mid-command window. |
| Responsiveness | **Partly measured** | [F] A press is drawn taken within 100 ms at two sizes (test/input-answered-browser). The headless act median is 104–126 ms. A new world takes 5.4–5.8 s warm. Not yet measured: settled time per act in the browser, a new world from Set out now in the browser, and presses per intention. |
| Semantic retention (MT-30) | **Implemented** for Route, Promise, Occasion | [F] src/lang/semantic-record.ts, semantic-lowering.ts. `inspect --why process`. |

## B. Architectural synthesis

The six studies agree far more than they differ [F: their executive sections]. Their shared diagnosis has three
parts:

1. **Several owners interpret one meaning:**
   - platform maturity §3.1: "the authoritative projection stops too early";
   - the architectural review: "one immutable player-frame boundary";
   - defect centres, centre 1;
   - the Kyr review §3.1: "high-level declarations lose their identity";
   - the retrospective's Cause A.
2. **Fictional processes are rebuilt by hand from low-level facts:**
   - platform maturity §3.3: "dramatic intentions … implemented as collections of low-level rules";
   - the Kyr review §3.2: "authors build process machines by hand", hence a retained `Undertaking`;
   - defect centres, centre 5.
3. **Lifecycle and isolation are conventions, not guarantees:**
   - the architectural review's Findings A (process-global catalogs) and C (two command coordinators);
   - defect centres, centre 3.

**Where they differ, and how to resolve it** [I]:
- **How an act's meaning is owned.** The retrospective proposed a *transition summary* computed from declared
  effects. The independent audit shows this would still be a static scan: centralised, but blind to rule cascades,
  `told` gating and second-hop teaching, which is exactly the class behind case 5. Resolve towards **an outcome
  computed by bounded speculative execution and verified against observation**. The precedent already exists:
  src/presentation/coin-reading.ts:31 forks the world with `world.apply` to test affordability. The risk is cost,
  since every offered row is forked on every frame. It needs memoising per world and a measured budget before it is
  adopted.
- **Response contracts versus situation state.** Defect centres proposes typed response contracts (who learns of a
  deed, who answers it, what follows). The Kyr review proposes Undertaking and Occasion as language constructs. These
  are the same idea at two levels. The construct is what authors write; the response is what it lowers to.
- **Package extraction.** The world-interaction study sketches setting and adventure responsibilities. The
  architectural review and the owner both say to enforce the boundaries before moving anything. Follow the latter.

**Already superseded** [F/I]:
- "Register zero" as the mission measure, replaced by the planning views (21 November).
- The 2 ms / 20 ms engine targets as a gate, replaced by the perceptual budget in closeout.md.
- The static transition summary, per the above.
- Flag-by-flag `teaches` advice, superseded by doc/design/kyr-semantic-boundaries.md.

**Landed** [F]:
- keyed draws (MT-14);
- semantic replays (MT-15);
- mechanical closures (MT-17, MT-19);
- one projection for rows (MT-18);
- semantic retention (MT-30);
- the layer and cycle ratchets (MT-16, MT-29, as ratchets).

**Still open from the November reviews:**
- per-campaign catalogs (AR-02);
- command atomicity (MT-24);
- strict reads suite-wide (MT-25);
- the parser as sole source authority (MT-26);
- state-only saves (MT-27);
- immutable shared structures (MT-28);
- bounded social projection (MT-07) and qualitative placement (MT-08), both deferred.

**For every significant change: the failure it prevents, the authoring it unlocks, and its demonstration** [P]:

| Change | Prevents | Unlocks | Invariant | Demonstration |
|---|---|---|---|---|
| Engine-owned, verified **Outcome** per act | Lying marks (case 5), wrong gold, a promised reward not led to | Authors stop annotating `teaches`; new content shapes need no new heuristics | At every turn of the golden walks, the predicted outcome of the act taken equals the observed one (fights and chance marked uncertain) | The blue on Porthalen's people and their topics agreeing through a recorded walk |
| One **situation state** | Focus lost at the riddle, a map active and undrawn, a fight's reach | Occasions and conversations as places the player is *in* | Exactly one situation at every turn; every client draws that situation | The riddle, the card hand and the map, played on the page with no stray row |
| **Atomic command** with receipt (MT-24) | Half-applied acts, a save between windows, narration lost | Long-running commands (journeys) that can be interrupted safely | Fault injected at each phase leaves the last receipt's world | A journey interrupted at each phase and resumed |
| **Per-campaign catalog** (AR-02) | Two campaigns sharing a module corrupting each other | A second setting, and Studio sampling several worlds in one process | Two campaigns of different catalogs in one process give the same result as each alone | The non-Westernesse scenario running beside a1 in one test |

## C. Defect concentration

The 84 live P0/P1 rows of the supported slice, grouped by mechanism rather than ticket category. The audit's
grouping matches mine on mechanisms A and B [F: planning views; audit §6].

| Mechanism | What it produces | Rows (examples) | Retired by |
|---|---|---|---|
| **A. Meaning predicted by scans or words** | Lying marks, false promises, page text inference | OR-178, AP-18, AR-05, OA-14, OR-140, CO-19 | The Outcome per act |
| **B. No explicit situation state** | Focus lost; a map, conversation or engagement half-entered | OR-177, OR-173, OR-71, PB-29, AP-07, OR-149, R11-02, CO-20, OR-181 | The situation state |
| **C. Thread lost between achievement and reward** | Aims that end on a rule of the clock or a separate payoff | OR-179, OR-176, T24-27 | Undertaking's reward and aftermath, plus the Outcome's "advances" |
| **D. Content and difficulty** | Riskless fights; thin or narrated activity | CB-01, CB-31, CB-32, CP-19, DN-08, RI-*, HP-* | Separate treatment: tuning and the reference loop |
| **E. Startup and scale** | Slow new worlds, eager instantiation | AX-04, AX-05, SP-02, OR-23, OR-144, OR-145 | Separate treatment: the responsiveness epic |

[I] A and B account for most trust failures, C for the broken purpose, and D for the boredom. Repairs to A, B and C
retire families of rows. D and E need their own work and should not be expected to fall out of architecture.

## D. Authoring and platform proofs

1. **A Kyr construct to mature: Occasion, then Undertaking** [P].
   - *Occasion* exists (8 uses, semantic retention). The engagement model built at alpha's close (engaged_in,
     Engaged) is its runtime half, hand-written.
   - Make an Occasion declare its participants, its moves, its stakes (said before), and its endings (resolved,
     withdrawn, interrupted). Lower it to engaged_in and the existing rules, retaining its identity.
   - Prove it by rewriting the window table and the riddle as Occasions with less authored machinery: count the
     authored control facts before and after.
   - Then *Undertaking*: Objective (289 uses) with fulfilment, aftermath and reward retained, proved on the weir's
     rats job and OR-179's case.
2. **An independent authoring exercise** [P]. Someone other than the builder writes one new Occasion, a contested
   performance at the inn (the fiddle, as the focus audit asked), from the guide alone. Measure the time taken, the
   authored control facts, lint findings and play defects.
3. **A Deem/Studio experiment** [P].
   - [F] The pinned Deem (967deac) predates `deem browse`: the CLI offers init, run/gen, list and validate.
   - [F] Of the 9 templates `deem list` shows, 3 fail when generated blind: gemstone (needs `#rank`), settlement
     (`#_index`) and site (`#terrain`).
   - [P] The experiment: upgrade Deem; give every public template the defaults it needs to run alone; and serve
     `deem browse` over the project's templates.
   - [P] Then demonstrate one real authoring task: sample 50 seeded settlements, reject the weak, record why, and
     revise the template. The census tool (scripts/scene-census.ts) is the model for "measure what the world shows".
4. **A setting-independent execution proof** [P].
   - A small contemporary civic scenario: a community allotment society's annual meeting and its plots. It has
     money, not gold; no callings; weekdays and hours, not Imbar's calendar; and conversation and votes, not combat.
   - It runs through the same public lifecycle (PlaySession, Doable, the page), with no import from data/imbar or the
     Westernesse catalog.
   - [I] It would expose more hidden dependencies than Tethys, which shares Westernesse's fantasy assumptions. The
     audit names candidates it would hit: `'gold'` hard-coded in presentation (deeds.ts:28, glance.ts:218,
     coin-reading.ts:21), Dun Rì and knighthood in world/career.ts, seats and the Seven Towers in world/seats.ts.

## E. Experiential baseline

- **The best reference loop** [F/I]: Iscoed, with Porthalen as the town and its undertown as the dungeon.
  - The undertown runs: the corn-store's rats, the Hall cellar, the undercroft, the lettered flag's puzzle, the vault
    and its keeper, the crypt and ossuary.
  - It is reached by the gold, has guarded and shut ways that now say what they need, and the weir route walks end
    to end (test/weir-route).
  - It matches the owner's direction of a geographically limited settlement with one substantial nearby dungeon [D].
  - Gatesend's sea-gate is the second loop.
  - The authored adventures the owner rated best (The Long Man, The Lull) remain reference *content*, not the
    integration lab.
- **Combat** [F]: neither weir-route fight cost a hit point (test/weir-route; CB-01). Tactical legibility: the actions
  sit far from their targets (OR-181). Morale is unmodelled in the first hour [I].
- **Conversation** [F]: 4,511 `Topic` declarations make conversation a topic browser. People do not ask, press or
  remember beyond flags (R11-02, OR-165).
- **Play feel** [F]:
  - the page stays open to input while an answer takes 1.5 s (OR-145);
  - activities are narrated, not played (focus-activity-engagement.md);
  - half the first hour was unpainted until 21–22 November (now 60 of 756 places blank in Iscoed);
  - presses per intention are unmeasured.
- **Feasible in beta** [I]: fights on the reference loop that cost something (danger said before, morale and flight
  for the rats and the keeper); three Occasions done well (the card hand, the riddle, a performance); one conversation
  that progresses (Owain's or Morwen's, where questions open new ones and the person remembers); paintings for the
  loop's own places in every sky (the census shows which).
- **Not in beta**: a full combat system, conversation as dialectic, SRD completion.
- **The optional childhood sequence** [D]: a good test of everyday interaction, but it is content. It fits gamma,
  after Occasion exists to build its chores as engagements.

## F. Sprint plan

The three views stay distinct: the register is the record; the supported-slice debt is the 30–45 minute loop of §E;
the capped active queue holds 10 blockers and 3 platform rows. [P]

| Sprint | Goal | Demonstration (acceptance) | Depends on |
|---|---|---|---|
| **0. Baseline** (½ week) | Measure the truth before changing it | The three continuity invariants as walk-wide specs, run and failing with counts. Browser timings on CI at a phone's and a laptop's size: press to acknowledged, to settled, and a new world (the owner, 23 November: the browser is enough, no per-device timing). Presses per intention over the golden walks. The parity tool extended to the terminal and the talk drawer. One recorded unfamiliar player for 15 minutes. | none |
| **1. Outcome** | Marks that do not lie | An Outcome per offered act by bounded speculative step, memoised per world, within a measured cost budget. Attest, the gold and the Atlas read only from it. ChoiceGrouping.teaches and Teaching.shows deleted. Gate: predicted equals observed across the golden walks. | 0 |
| **2. Situation** | One state the player is in | Place, conversation, occasion, map, journey and fight as one engine state with transitions. Attention reads it; the page draws only it. The riddle, the card hand, the map and the fight's reach (OR-181) pass on the page. Gate: one situation at every turn, and parity holds over it. | 1 (the Outcome supplies what ends an engagement) |
| **3. Occasion and the loop** | Kyr construct and the game together | Occasion as a construct (window table, riddle and performance rewritten, control facts counted). Undertaking's reward and aftermath for OR-179/OR-176. The reference loop's fights tuned to cost something. One progressing conversation. | 2 |
| **4. Separation and commands** | The platform holds | MT-24 atomic with fault injection. AR-02 per-campaign catalog. The allotment scenario through the public lifecycle beside a1. Runtime→setting edges for its path driven to zero. | 1–3 |
| **5. Authoring and acceptance** | Prove it to people | The Deem upgrade and workbench demonstration. The independent author's Occasion. Several consecutive cold rendered plays of the slice. The owner's acceptance. | all |

**Mandatory beta outcomes:**
- sprints 0–3;
- MT-24 and the separation proof from sprint 4;
- the acceptance plays from sprint 5.

**Conditional** (drop to a demonstration if capacity is short): the full Deem workbench; AR-02 if the separation proof
can run in a separate process; the performance occasion.

**Gamma and delta:**
- the settlement typologies and the deep places;
- the childhood sequence;
- Arcana and perks;
- dialectic conversation;
- broad SRD conversion;
- Studio as an application;
- package extraction;
- Tethys and Aeneas, cross-setting characters, historical causality.

## G. Risks and alternatives

- **The speculative Outcome may be too slow or too clever** [I]. Forking every row every frame could blow the 300 ms
  budget, and cascades can be long.
  - Mitigation: bound the step (the act plus its immediate rules), memoise per world, and mark the rest uncertain.
  - Fallback: the static summary for most acts, with speculative execution only where it is cheap.
  - Decide in sprint 1 by measurement.
- **The situation state could collide with the many specs that pin today's frame shapes** [I]. Expect broad spec
  churn. Land behind the parity measure and the walk-wide invariants, not scenario by scenario.
- **Occasion could become a second plot engine.** The Kyr review's rule holds: lower into the one execution model,
  never a separate interpreter. Count authored control facts to prove it reduces machinery.
- **The separation proof may expose more than a sprint can fix.** That is acceptable. The deliverable is the measured
  edge count for one path at zero, not the whole ratchet.
- **Where the preferred approach may be wrong** [I]. The owner's acceptance may hinge on content and feel (mechanism
  D) more than on architecture. Sprint 0's unfamiliar player decides how much of sprint 3 goes to the loop's content
  rather than constructs.
- **Explicitly deferred**:
  - state-only saves (MT-27) and mutable shared structures (MT-28), unless a sprint-4 fault-injection test needs them;
  - bounded social projection (MT-07) and qualitative placement (MT-08);
  - a save migration path, while "no save promise" holds.

## H. Hand-off for beta's first builder

- **Read**:
  - doc/architecture/mission-22/handoff-beta.md, for the working practice;
  - this report;
  - doc/design/kyr-semantic-boundaries.md and doc/design/focus-activity-engagement.md.
- **Critical files**:
  - the offer: src/presentation/doable.ts, attest.ts, engaged.ts, glance.ts;
  - Attention: src/ui/attention.ts;
  - the scanners to retire: src/ui/choice-grouping.ts and teaching.ts;
  - the fork precedent: src/presentation/coin-reading.ts;
  - the command: src/session/open-command.ts and play-session.ts;
  - the catalog: src/canon/local-catalog.ts;
  - the language: src/lang/semantic-record.ts and occasions.ts;
  - the page's inference: web/reader/stage/glance.tsx and menu-model.ts.
- **Unresolved design decisions**, with the owner:
  - is a job offer knowledge or an undertaking (OR-178);
  - do rooms answer weather;
  - the design review's seven questions;
  - whether "no save promise" holds for the deployed alpha.
- **The first well-defined task**: Sprint 0's first item. Write the three continuity invariants (focus, opportunity,
  undertaking) as specs over every turn of the warrior's and the mage's golden walks, as test/one-world-map does, and
  record how many turns break each. Change no engine code. The count is beta's baseline and the gate sprint 1 must
  move.

## Independent audit

A read-only audit was commissioned for this report from an agent given the sources but not this report's
conclusions. Its findings are folded in above where it agreed. Where it differed:

- **It disagreed with the retrospective** that one projection is reliable (adopted here).
- **It disagreed with the static transition summary** (adopted: the Outcome by speculative step, verified).
- **It judged MT-24 underweighted** (adopted: atomic commands in sprint 4 as mandatory).
- **One of its claims was checked and found wrong**: that the layer and cycle baselines have no test gate.
  test/small/layers and test/small/cycles hold both.

Its open questions are carried into §H.
