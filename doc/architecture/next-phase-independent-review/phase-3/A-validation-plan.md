# A. Validation plan

Phase III of the independent review, snapshot `483e3af`. The critique that revised Phases I and II is `../report.md` §13.

This is a small set of vertical slices. Each says:
- what a player or author should experience;
- the hypothesis it tests;
- what it needs;
- how it is set up and observed;
- what counts as success and failure;
- what it costs;
- what success would authorise.

They are ordered by what they teach, not by size.

**Three kinds of success are kept apart throughout:**
- **Technical:** it installs and runs correctly.
- **Experiential:** an ordinary player can find, understand and reach it.
- **Literary:** the authored work keeps its identity.

None substitutes for another.

**Rule for every slice: no teleports.**
- Every player-side observation is made through `PlayerView.choices` and `PlaySession.perform` (or the built page), from Begin.
- Fixtures may *author* content; they may not write `at(party, …)`, `knows`, or hit points.
- Phase I counted 58 test files that do. These slices exist to prove what those tests cannot.

---

## Slice 0: the precondition ("cross after learning")

| | |
|---|---|
| experience | a player who has learned things can still cross into new country |
| hypothesis | mid-play installation validates only what it installs (Phase I A1) |
| needs | the A1 repair; nothing else |
| setup | `probes/crossing-knowledge.probe.ts` (Phase I), made a spec; plus one walk per generated fact class (`probes/taught-unestablished.probe.ts` lists 9–10 per world) |
| accept | for seeds a1, thorn and wren, after learning each listed fact by its observation, the next two march crossings succeed through `perform` |
| fail | any "Invalid initial knowledge", or any crossing undone for a reason unrelated to the command |
| performance | none |
| authorises | every later slice. Lazy installation is unsafe without it |

---

## Slice 1: one game, two authored adventures, one generated country

**The composition experiment.**

| | |
|---|---|
| experience | a new character begins in an ordinary generated settlement, hears of two authored adventures, travels to each, and plays its opening as written, without choosing a campaign or using `?dev` |
| hypothesis | the existing placement machinery (authored countries, placed variants, hooks, frontier installation inside a command) plus **one** small placement declaration is enough for coexistence, reachability and discoverability. A full world compositor is not required for this |
| content | **The Long Man** (already placed: `the-long-man/placed.json`). **Thrume**, with a placed variant *written by Thrume's author*: `company.kyr` replaced by an import, and an Arrival granting what the company declaration did. Thrume is chosen because it differs in mechanics (hush and attention, dreams, a 1296-watch clock) and in assumptions (two regions, one of them "the Between", off the grid). A generated start region from the `wanderer` origin |
| needs | Slice 0. One placement declaration per country: `{ entry, side or terrain, hooks[] }`. This is `countries.json` plus hooks, *not* the Phase II manifest. One answer to "what lies beyond" (Phase I E2). Thrume's off-grid region declared `elsewhere`, or simply never on the grid: today it is only reachable by Thrume's own passages, which may already suffice; **verify**. Checkpoints refused while a command is in flight (Phase I A2) |
| setup | a spec and a headless journey script that, for 10 seeds: (1) starts from Begin; (2) acts only through offered choices, by a policy that may prefer topics, then known ways toward named destinations, but never reads facts the player cannot see; (3) records the transcript |

**The policy is part of the evidence.** It may use only what `PlayerView.observe` and `PlayerView.choices` show.

**Evidence to collect and accept:**

| property | evidence | accept |
|---|---|---|
| coexistence | both installed in one campaign; each adventure's full scripted play (Thrume's `thrume.test.ts` route; Long Man's) replayed *inside* the joined world from its entry | every scripted step offered and succeeds |
| identity and namespacing | `installed` ids; no `Duplicate entity` or kind collision; the composition probe (Phase I) re-run with both | both adventures' entity ids prefixed by their installation id; no warnings |
| placement | the plan fact (or `Countries.fits` result) and the march-stone text, across 10 seeds | they agree in every seed |
| reachability | the journey policy reaches each entry | ≥ 8 of 10 seeds reach both within a step budget (say 400). Each failure is a classified reason (no hook heard, way not opened, interrupted), not a timeout |
| discoverability | the step at which each adventure is first *named* to the player, and by which channel | named before reached, every time; never shown before heard |
| authored mechanics preserved | the **literary diff** (below) | identical |
| persistence | checkpoint at random steps; resume; continue | final hashes equal to the uninterrupted run |
| replay | the transcript, through `bin/kyrie replay` in a fresh process | canonical hash equal |
| not-yet-visited material | world facts and log before reaching each entry | no fact of the adventure in the world before its horizon; its clocks not started (`ClockShift` evidence: deadline measured from entry) |

**The literary diff** (the objective proxy for "not flattened"):
- Play Thrume's scripted route standalone (`data/campaigns/thrume.campaign.json`) and inside the joined world from its entry.
- Compare the sequences of **authored** observation texts, topic texts and rule `says` texts shown at each step, ignoring generated text.
- **Accept:** identical, except where a difference is explained by an Arrival, a different starting company, or the world's calendar.
- Then a **human reading** of the first hour of each by someone who knows the standalone version: does it read as Thrume?

**Failure criteria:**
- Any adventure reachable only through the policy reading hidden facts.
- A seed where an entry exists but no hook names it.
- A literary diff showing generic text (a generated green or inn description) inside an authored place.
- Replay divergence.

**Performance (measured base, projected slice):**
- Installing an adventure takes 0.33–0.60 s (measured, `phase-2/probes/all-in-one-world.out`). Crossings take 1.2–2.1 s (the builder's figure).
- Accept: a crossing into an authored country under 2.5 s on the builder's reference machine; command p99 within 1.5× of the wren baseline (engine p99 260 ms here).

**Authorises:**
- The placement declaration as a contract.
- Writing placed variants of further adventures.
- Moving on to the city.

**Does not authorise:** the Phase II manifest, sockets, or any strategic layer.

**Variant to run if time permits (discriminating):** the same slice with **eager** installation of both adventures at Begin, with authored clocks gated on entry. Compare command latency and the number of mid-play installations; the second is zero by construction. This decides DR2 (contracts document).

---

## Slice 2: a small city that others can build into

**The living metropolis experiment.**

| | |
|---|---|
| experience | the player begins in a recognisable city of a few wards around landmarks; meets a scholarly institution, a merchant house with a ship to somewhere distant, and hints of a secret society; and can tell what is where without a street map |
| hypothesis | a hand-authored city module exporting landmarks, wards and a few public rooms, with contributions that *import* those exports and add places, people and rules, gives urban coherence without sockets, lots or a city compositor. **A single enormous map is not necessary:** wards as places connected by transit passages with times ("the Long Stair, 10 minutes") are enough |
| content | (1) **City** (author 0): 3 wards (the Stair, the Quay, the Old Market), 4 landmarks, transit passages between wards, a city watch, the rumour carriers. (2) **Academy** (author 1): a *ward-sized* contribution attached by a passage to the Stair's exported square. (3) **Ellisant house** (author 2): a *building within an existing ward*, the Quay (`Place counting_house … within quay`, the quay imported), with a ship service to a distant destination. (4) **The Lanterns** (author 3): *no places*; people placed in the Old Market's exported tavern and the Quay's exported warehouse, rules over shared vocabulary, using landmarks without modifying them |
| needs | today's import model (probe 2 shows a door onto another's place); kind sharing for the city's goods (DR3); identical-wording disambiguation (Phase I C2, narrowed); the ship as a service (Slice 3) |
| setup | four modules by four authors, if possible (see the author experiment, Slice 4); else by the reviewer, recording every friction. Each author lints and plays against the city alone. Installed together in both orders |

**Accept:**
- **Technical:**
  - all four install in either order, with equal fact hashes for the sorted facts;
  - a deliberate conflict (two contributions both declaring `Place university … within stair`, or the same `Entity salt: good` with different names) is refused with a message naming both files.
- **Experiential:**
  - From Begin in the city, a player who reads only what is shown can answer three questions after 30 choices: where the academy is; what the Ellisant house trades with; that something is wrong at the Old Market.
  - Measure **choices to reach each of 6 named destinations** in the ward-and-landmark model. Accept: ≤ 4 choices each, once known.
- **Literary:**
  - each contribution's authored scenes shown verbatim (the literary diff);
  - a human reading: three authors' styles remain distinguishable.

**Fail:**
- A contribution that could not be written without editing the city module.
- Two contributions' content visible in each other's places by accident: an unconstrained offered action (Phase I C2's real case).
- More than 4 choices to reach a known destination.

**Performance:**
- Projected 25–40k facts (a city of three wards plus four modules), from the measured joined world (37.8k facts: wait 88 ms).
- Accept: engine p50 < 60 ms and p99 < 400 ms on the city journey.

**Authorises:**
- The city module as the default start.
- An export-stability rule (contracts document, K2).

**Deferred unless this fails:** sockets and lots.

**What would justify sockets later:** a fourth or fifth ward contribution that two authors both want in the same position, or a city that must be rehosted on another seed.

---

## Slice 3: getting somewhere you know, and not to somewhere you don't

**The travel and discoverability experiment.**

| | |
|---|---|
| experience | four destinations: (a) the academy, in the city; (b) a town up a known regional road; (c) a distant port served by the Ellisant ship; (d) a hidden ruin whose position must be investigated. The player can pursue (a)–(c) without fighting the interface, and can tell that (d) is unknown on purpose, not broken |
| hypothesis | assisted travel can be a **macro over offered moves** (each `go` offered in turn, recorded as its expansion); a service can be **boarding a vehicle actor**; movement semantics need no change |

**What each layer must know:**

| | game knows | character knows | interface shows |
|---|---|---|---|
| (a) academy | where it is | yes, from the start (city knowledge) | listed as a known destination with a time |
| (b) town | the road | the road once heard of (hook `opens`) or walked | known destination, its route, "about 2 days" |
| (c) port | the ship's route and schedule | the service once seen at the quay | "by the Ellisant ship, departs at the 7th hour, 6 crowns" |
| (d) ruin | where it is | a rumour of it ("north, past the fells"), then a found way | "rumoured: north", **with the reason**: "no one has told you the way" |

**Minimum affordances, each tied to a gameplay requirement:**
1. **Orientation.** The place and its ward or region, plus named exits to their far ends. Today exits name the next room (navigation investigator F6).
2. **A current destination.** One the player chose. Shown until reached or abandoned.
3. **A known route.** The known-ways graph that `ChartModel.ways` already computes. Shown with its time and cost.
4. **Follow a familiar route.** "Go on toward X": the macro. Each leg is a real `go`.
5. **Join a service.** Board at a stop; disembark at a stop.
6. **Recognise an interruption.** The macro stops and says why (an encounter, a closed way, a fork into unknown ways).
7. **Resume.** "Go on toward X" again from where it stopped.
8. **Why something is not marked.** Rumoured destinations show a direction and the reason they are unrouted.

**Setup:**
- The city of Slice 2, a generated region beyond its north gate, the Ellisant ship, and a hidden ruin placed by an existing scenario mechanism (a hidden way opened by hearing or searching: `way-in.test.ts`).
- The journey policy of Slice 1, but using only the macro and the services.
- Then one human session (Slice 4's protocol) on the same build.

**Accept:**
- (a)–(c) are each reached with ≤ 3 player decisions once known.
- A forced interruption (a scripted encounter on the road) stops the macro with a reason, and the player resumes with one decision.
- (d) is reached only after the investigation step. Before it, the interface never shows its position.
- A human tester asked "why is the ruin not on your route list?" answers correctly.
- **The mysterious/inaccessible distinction is demonstrated by a control:** a deliberately broken variant (the ruin's way never opened by anything) is flagged by a **reachability audit**. That audit is an extension of `world-audit.ts` (no hook or search reaches it). The intended mystery is not flagged.

**Fail:**
- The macro takes a step the player could not have taken.
- A destination revealed before it is heard of.
- The broken control passes the audit.

**Performance:**
- A macro of N legs costs N commands. Measured: about 26 ms for a headless travel command in wren (sim-bench B).
- A 2-day road is roughly 288 watches inside a few legs. Projected by `time.md`'s figure (7.8–10.3 ms a watch): 2–3 s for a long assisted leg.
- Accept: under 5 s, with progress shown. Horizon advancement (`time.md`) only if it fails.

**Authorises:** the route and destination-knowledge contract (K6) and services.

**Does not authorise:** a transport simulation (capacity, markets, schedules beyond fixed times).

---

## Slice 4: a writer who is not us

**The independent author experiment.** This is the most important human test.

| | |
|---|---|
| experience | a writer unfamiliar with the engine writes a small, distinctive adventure, connects it to the city or a service, and sees a stranger find it |
| hypothesis | Kyr, its documentation (`doc/authoring/`, the authoring guide) and lint are enough to author, connect and debug a module without touching `src/` |
| participant | **at least one real writer** who has not read Kyrie's source: ideally two, one literary and one technical. The reviewer only observes |
| brief given to the writer | write a location with character; one interaction with a nontrivial state change; one investigative discovery; a connection to the city (an exported place, or the ship's port); one thing that matters outside the adventure (an item, a fact in shared vocabulary, a person who can join) |

**Protocol:**
1. The writer gets the docs and the city's export list only, plus a time box (two sessions of 3 hours).
2. **Think-aloud log**, kept by the observer. Record every time the writer:
   - consults code;
   - cannot understand a diagnostic;
   - works around the language;
   - asks the observer.
3. **Artefacts:**
   - the module;
   - every lint run's output, with the writer's interpretation of it, written down before the observer comments;
   - their playtest transcripts.
4. Installation alongside Slices 1–3 content. Then **a second person**, who has never seen the module, plays from Begin until they find it or give up.
5. **Fix round.** The observer reports what the stranger did. The writer fixes problems with no engine changes.

**Measures** (friction, not compilation):
- time to first module that loads;
- time to first "it does what I meant";
- the number of diagnostics misread, and which;
- the number of times code was consulted;
- constructs wanted but missing (each one quoted);
- whether the stranger found it, and how;
- the writer's own rating of whether the result is *theirs*.

**Accept:**
- The writer finishes without code access or engine changes.
- Every diagnostic they hit named the file, line and a fix they could act on.
- The stranger finds the adventure through ordinary play.

**Fail:**
- Any engine change needed.
- A diagnostic misread twice.
- The stranger cannot find it after 60 minutes, while the reachability audit says it is reachable. That is an experiential failure the audit cannot see.

**Watch for Kyr becoming less approachable:**
- variables in Topics and Observations;
- the JSON manifest (`roles`, `imports`, `exports`, `globals`), which is a second language beside Kyr;
- reserved vocabulary (four lists, Phase I L1);
- any new construct proposed from this phase.

**Rule:** a construct must be explainable on one page of the authoring guide with one example, or it waits.

**Authorises:**
- Freezing the author-facing contracts (K1–K3) at version 1.
- Recruiting more authors.

---

## Slice 5: Ferrand and the tower

**The persistent companion and cross-campaign institution experiment, combined.**

| | |
|---|---|
| experience | Ferrand, a junior lecturer in old tongues from the academy, joins the company. In an independently authored ruin the company finds forbidden research. Ferrand has a view of it that is his: specific, plausible, situated and consequential. Separately, the academy comes to take an interest in the ruin's keepers over days, and the player can find out |
| hypothesis | existing constructs (Topics with variables over a shared vocabulary, rules, `ambitions.kyr`, belief) give a *sustainable* first version. Two additions are needed: variables rendered in Topic text, and per-member witnessing. And one discipline: institutions act on what they have heard, not on world facts |
| evidence so far | `phase-3/probes/two-institutions.probe.ts` and `companion-reaction.probe.ts`: the interaction and the reaction work today without either author naming the other, and survive save, restore and replay. The line cannot name what was read ("?f") |
| content | the academy (Slice 2), with Ferrand authored in full: a personal history, a competence (old tongues: `capable(member, oldtongue)` reads inscriptions), loyalty to the masters, a debt to one of them, a long conversation. The tower or ruin, by another author, which tags facts with the shared vocabulary (`forbidden`, `ancient`). The shared vocabulary file: **five relations, no more**, written by the city's author |

**The six layers, and who decides each:**

| layer | decided by | mechanism |
|---|---|---|
| what Ferrand **knows** | the simulation | `knows(member, fact)` from what he witnessed (per-member perception: needed) |
| what he **believes** | the author's priors, then evidence | `believes(ferrand, claim)` with conviction; `refutes`; already in `belief.kyr` |
| what he **says** | the author's lines, chosen by the narrative | Topics over shared vocabulary, with bindings rendered |
| what he **does** | the author's rules, gated by his commitments | e.g. loyalty high → he insists the codex goes to the masters; debt → he hides it for his creditor |
| what the author **wrote** | the author | all lines and all decision rules |
| what the system may **infer** | nothing about personality; only *which* authored line or rule applies, from tags, knowledge and commitments | this is the line not to cross |

**Accept:**
- **Specific:** his line names the thing found (bindings rendered) and refers to his own history (authored).
- **Plausible:** a reader who knows Ferrand from the long conversation judges it in character. This is a human judgement.
- **Situated:** it is offered only if *Ferrand* witnessed it or was told it, not merely the company.
- **Consequential:** his authored rule changes state (where the codex goes, or what the masters learn), and later play shows the result.

Also:
- The institutional thread advances only through a carrier (a hop with delay: the masters hear from the porter, who heard on the Quay). It produces a discoverable change, and does not alter either adventure's central authored scenes (the literary diff over both).
- It survives save, restore and replay.

**Fail:**
- Ferrand reacts to something he could not know.
- A generic line contradicts his authored stance.
- The masters act on a fact no carrier brought.
- The tower's authored climax changes because of the academy.

**Performance:** negligible at this scale. Measured: rule cost about 2 µs an ask (`time.md`).

**Authorises:**
- Per-member knowledge and bound Topic text as contracts (K5).
- Carriers as the information path for institutions.

**What would justify a strategic layer later:**
- three or more institutions whose authored rules cannot express their interaction without per-pair scripting; or
- per-watch rule breadth from distant institutions measurably exceeding budget (more than 30% of a watch).

---

## Literary depth as an acceptance criterion

**What architecture must support** (testable):
- **Prose respects observation.** Observations recompute from the live world (they do), and Topic lines bind what the speaker knows. Test this by the literary diff and by "said only if seen" properties.
- **Authored text is never overwritten by generation:** the literary diff.
- **Choices have intelligible consequences:** the feedback a command reports equals the state it changed (`ActionFeedbackView` against `changes`). This is a property test over the journey corpus.
- **Distinct styles survive composition:** the literary diff per adventure.
- **Told lines come from records, not from rendered prose** (Phase I B1): a voice-table edit changes no canonical hash.

**What must remain criticism**, decided by people reading transcripts:
- characterisation against exposition;
- intellectual and emotional identity;
- whether philosophy emerges from drama;
- tonal range;
- distinctiveness.

**[Rec] An editorial review step per slice.** Two readers read the transcript of the journey corpus and answer five fixed questions, in prose, not scores:
1. Whose voice is this?
2. What did the player learn and how?
3. What did a choice cost?
4. Where did it feel generic?
5. Where did it surprise?

**Demanding test material** (existing, or to be written for the slices):
1. Thrume's thrall market purchase of Col Dunmore (`thrume/hush.kyr`, `buy_col` and `col_snatched`): money, consequence, an authored aftermath that must not be flattened.
2. The disputation's glance (`data/goings-on/disputation/situation.kyr:36`): a passive insight that teaches a refuting fact. It is also the fact that triggered Phase I A1.
3. Kezu's lie about her dreams (The House That Grows' premise): knowledge the player must not be told outright.
4. Ferrand's line on reading forbidden research (Slice 5): the companion test.
5. A deep site's document read after its fact is known (Phase I K4): provenance and repetition.
6. The Long Man's storm three days off: time, season and authored dread under a world calendar.
