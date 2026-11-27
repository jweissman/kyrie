# Platform separation: packages and one workflow (TB-09)

A research note, 24 November, for the owner's question: how to organise TB-09 (workflows are the engine's) with the
extraction of packages, `kyr-lang`, `kyrie-runtime` and `kyrie-player`. The ruling is to do this without
interrupting the current Game and World work. What follows is measured on main (6f7b5a9a5) and proposes an order of
work, each stage held by a ratchet that may only fall.

## Where it stands

The layers are already drawn and held. `scripts/layers.ts` (MT-16) puts every file of `src` and `web/engine` on one
of four units:

- Kyr the language (`src/lang`);
- the runtime (`src/campaign`, `src/rules`, `src/shared`, and the engine's root files in `src/*.ts`);
- a generic player (`src/session`, `presentation`, `ui`, `narrative`, `creation`);
- the setting (`src/world`, `canon`, `paintings`, `handbook`, `registry`, `data`).

The clients (`src/cli`, `src/autoplay`, `web/engine`, `web/reader`) stand over them. An import that goes the wrong
way is an edge. `test/small/layers` holds the baseline, which may only shrink.

The installed presentation resources now carry voice tables and painting fit and observations per installation
(`src/ports/presentation.ts`). A setting may supply none: voice has no lines and painting fit has no restrictions.
Emblems, likenesses and the remaining painting and voice resources are not yet behind this port.

At the review's measurement, 154 edges:

| From | To | Edges | Where most of them are |
|---|---|---|---|
| player | setting | 76 | `src/narrative/voice` 13, `src/ui/screen-model` 7, `src/ui/combat-model` 4, creation's entries 3, portraits 3 |
| runtime | setting | 65 | `src/canon/canon` (the Westernesse ontology: classes, ancestries, traits, conditions) imported 55 times from campaign, rules and the root engine files |
| setting | player | 13 | the handbook and the encyclopedia reading presentation's words |

Of the 154 edges, 65 are imports of one module, `src/canon/canon`. The runtime and the player read the setting's
catalog directly. Nearly every other wrong-way import is the setting's words or paintings read by the player.

**Kyr is already separable.** `src/lang` (64 files, 6,140 lines) imports nothing else of `src`: only `ohm-js`,
`deem`, and `node:fs`, `path`, `crypto` and `v8`, in three files (`module-compiler.ts`, `parse-store.ts`,
`parse.ts`). AX-08's "the compiler imports the catalog, the parser imports Deem" is half stale: the catalog edge is
gone. A `kyr-lang` package needs its node-only parse store behind an adapter, and is otherwise a move.

**The seam the runtime needs exists in small.** `src/setting-port.ts` is what the runtime asks of its setting and is
given, never reads: today the reckoning of days and the sky's signs. `src/canon/setting-install.ts` fills it at each
composition root (the terminal, the browser's worker and pages, and every `bun` run via bunfig's preload). Canon is
the same problem at a larger scale, and the same remedy applies.

**TB-09, the workflow half, is partly done** (doc/architecture/mission-21/workflow-parity.md):

- Creation is the engine's on both clients. `EngineHost`'s protocol carries it, and `test/creation-conformance`
  makes a life as the terminal plays and as the page's worker is asked, and requires the same life.
- `test/client-parity`, `client-parity-fight` and `offer-parity` hold the same commands to one digest, and the
  offers to one list.
- Still decided in one client only:
  - the terminal's own travel (set-outs from the screen's destinations, done by `session.leg`, where the page uses
    `travel` and `plan`), its fights by `Battle` directly, and the talk's and fight hand's fours (TB-10);
  - the page's text inference (AR-05): the exchange's notes parsed back from "Noted:", "Aim:" and "Borne out:"
    prefixes, talk roles, "too dear", and 32 regex tests on labels or text left in web/reader, src/ui and
    src/presentation at the last census;
  - the conversation (OR-149), the fight as a mode of the scene (R10-01), the fight's reach (OR-181), path groups
    (PB-29), the map's verbs by cell (CO-20), the page's half of travel (TR-21), and death ending the runner's game
    with nothing to do (CL-53). These ten P0/P1 defects are what the feature map's blockers section counts under
    TB-09.

## The packages, as the owner envisions them

| Package | Holds | Depends on | Blocking it now |
|---|---|---|---|
| `kyr-lang` | the language: parser, compiler, World, solving, reads (`src/lang`) | ohm-js, deem | the node-only parse store (an adapter) |
| `kyrie-runtime` | the campaign, the shared rule mechanics, the engine's root files (battle, creature, effects, expressions, model) | kyr-lang | Canon read directly (55 edges); `content.ts` and `item-catalog.ts` are a rules domain's, not the kernel's |
| `kyrie-player` | the session, presentation, screen model, narrator, creation flow: the player model every client draws | kyrie-runtime | the voice and the screen model reading setting words and paintings (76 edges) |

The tree beyond those three:

- **A rules domain**, `fantasy-rules`: SRD/Orsino, its catalog, Canon's ontology. AGENTS.md already names it "an
  installable fantasy-rules domain, distinct from the kernel and from Imbar". It is the provider behind the port
  Canon becomes. BX-02, the shared rules taken in part, belongs here too: a kernel of places, ways, people and talk,
  and the rest as rule packages with declared dependencies.
- **Settings**: Westernesse (canon's words, world generation, paintings, handbook, registry, data) and Tethys, each
  installing a rules domain and its own parts.
- **Clients**: the web (reader and engine) and the terminal.
- **Tools**: most of `src/cli`'s 117 files are authoring tools (lints, review, why-*, srd-*, journeys), not the
  terminal client. A `kyrie-tools` package would leave the terminal client small.

## TB-09 as the player package's contract

`kyrie-player`'s public surface is what TB-09 asks for: the engine's question, its options and render hints, for
every activity. That covers talk, the fight hand, travel and its legs, creation, the map's verbs and an ending. A
client renders that surface and invents no control.

The page frame (OR-305) belongs here too. The frame's placement and behaviour are the web client's. What goes in the
menu, and in what order, comes from this surface.

The package boundary makes the parity contract checkable. A client that imports only `kyrie-player`'s types and the
host protocol cannot decide gameplay, because it has nothing to decide it with. `test/small/creation-four` already
holds the terminal to "imports nothing of creation but types", for creation alone. Extended to the whole package, it
is the mechanical form of "full parity across clients".

## Facets inferred, not declared (AP-03, reworded)

The owner's ruling, 24 November: authors are not to decorate acts with indicators. A facet is inferred from what the
Kyr does:

- an act whose effects give the company something to know (a `knows` it did not have) is something to learn;
- one that teaches an ability or a calling is something taught;
- a way into somewhere unvisited is somewhere to discover;
- a topic or story node that leads toward such an act is someone with something to tell;
- an act that hands over something is a payoff.

The engine already does part of this: "What an act would teach" is blue exactly where the company would know
something after it (`test/features/interface/teaching-outcome`). The work is one derivation of facets from operators'
effects and reads, for every facet, which the Atlas's marks and the glance's leading both read. That is what retires
the marks that contradict their acts (OR-302, OR-303). It sits in the player package, over the runtime's operators,
and asks nothing of authors.

## Kyr's interpreter, a thin package in the runtime's kernel (the owner, 24 November)

`src/lang` imports nothing outside itself (only ohm-js, deem and Node's own), and it sits on no wrong-way edge.
The owner: "it's interesting that Kyr is so pure; it suggests that more things should move into it, or that it should
become deeper", and then, "maybe this is just a thin layer package, an *interpreter*, that the runtime can use as part
of its kernel to evaluate Kyr code".

What is pure today is the language's statics: parsing, compiling, lowering, the World and its solving. Its dynamics are
in the runtime:
- what a statement does (the World and src/campaign/consequences.ts apply Kyr's changes: Assert, Set, Bring, Slay and the rest; `src/effects.ts` is the combat interpreter of the effect language, over fighters only: doc/design/research-abilities-and-the-world-2026-11-26.md, finding 1);
- rules fired until nothing changes (`src/campaign/campaign-tick.ts`: prime, settle, the idle hold);
- an act checked, applied and settled (the runtime's Outcome path).

Those are where the runtime's setting edges meet the language.

**The call: `kyr-interpreter`, a package of its own.** It is not kyr-lang made deep.
- `kyr-lang` stays the statics: text to a module, a World, a query answered. It is a parser and compiler that tools,
  lints and the browser's parse load without running anything.
- `kyr-interpreter` is the dynamics: given a module, a World and an act, the next World and a trace of what fired and
  why. It is pure functions over kyr-lang's types, and it depends on kyr-lang alone.
- Whatever a setting must supply (a calling's capability, a creature's figures, a rules domain's dice) the interpreter
  asks through ports it declares, as kyr-lang's `Vocabularies` port already asks a setting for its kinds.
- `kyrie-runtime`'s kernel uses it. The runtime keeps the campaign, sessions, persistence, generation and installation,
  and fills the ports.

The trade-off: a fourth package and its ports, against a kyr-lang that stays small and loadable alone. The gains:
- **A semantics with a contract.** The interpreter can be specified and tested construct by construct.
- **Cheap, strong tests.** A conformance suite takes a Kyr fragment, a World and an act, and gives the next World and
  its trace in milliseconds, with no setting and no campaign. That is OR-407's horizon for most of what specs now boot
  a world to see. Contract tests at its ports, run against a fake setting (the allotment society is one already), are
  the extension-boundary tests every setting must pass.
- **The runtime lift made smaller.** Of the runtime's 65 setting edges, those inside the statement and rule paths become
  port asks, and what is left is orchestration's.

And (the owner, the same day): "levelling up the language has to be part of this". A thin interpreter shell around
the parser that does only the minimum work needed would be good for testing, "and ideally it can be the same path that
the actual engine uses (though it needs a 'warmed' interpreter, and maybe we can do this at game setup)". So:
- **One path.** The engine evaluates Kyr through the interpreter, and the conformance specs drive the very same entry
  point. There is never a test-only evaluator beside the engine's.
- **A cold interpreter and a warm one.** Cold: a module and a World, nothing kept, for a fragment under test, paying
  only for what it evaluates. Warm: the same interpreter with what a game's setup prepares once kept beside it. That
  is the compiled module, the rule index (AX-10's which-rules-a-fact-can-wake, today rebuilt or scanned), the kept
  readings and the settle loop's held rules (CampaignTick's `stays`). Warming is an explicit step at setup (install,
  then warm), and its result is a value the runtime holds. Eager-equals-warm is then a property spec: the same act on
  the same World gives the same next World and trace, cold or warm.
- **Levelling the language up.** Constructs whose meaning lives in the runtime today come into the interpreter as
  Kyr's own semantics: an act's legality, application and settling; Occasion, Promise and Route as first-class traced
  objects (AGENTS.md's semantic tracing ruling); and the Wonder (OR-440). Each is a named construct with a
  conformance spec, and the language reference states its meaning.

The order:
- The interpreter is first a spike in place: effects and the settle loop behind declared ports, in `src/lang`'s
  neighbour `src/interpreter`. It is measured by the setting edges it removes and by the conformance specs it makes
  possible (about twenty constructs first).
- The packages' physical move (stage 2 below, with the interpreter beside kyr-lang) waits for a quiet point between
  batches. It re-points imports in nearly every file, and it should not land under two streams' open branches.

## The root blocker: an implicit installed domain (an external analysis, 24 November, adopted)

The owner shared an analyst's reading of the extraction path. The lead adopts it: it names what a folder move cannot
answer. The runtime and the player do not receive their domain; they reach for it. `Canon` and the global catalogs act
as an ambient service locator for callings, ancestries, abilities, conditions, items, calendars, vocabulary and
presentation, so the generic runtime's contract is defined, unstated, by Westernesse's fantasy domain. Extracting now
would either keep that coupling under aliases or publish a huge, unstable API. The second blocker is an incomplete
player protocol (TB-09): a kyrie-player extracted now would institutionalise the clients' heuristics.

**What changes in the plan:**
- **Classify before replacing.** Every direct Canon read is classified by its intended owner before any is moved:
  - parsing and type declarations: kyr-lang's vocabulary;
  - applying Kyr effects: an interpreter capability port;
  - generic campaign lifecycle: kyrie-runtime;
  - fantasy mechanics, and the creation rules: the fantasy-rules domain;
  - Westernesse's names and defaults: the setting;
  - labels, paintings and voice: a setting presentation provider;
  - package selection: the composition root.

  Then one category at a time, each with a shrinking edge ratchet. Replacing `Canon.x` with `context.canon.x`
  everywhere would keep the problem under another name.
- **Small ports owned by the lower layer.** The runtime declares what it needs (a condition's definition, an ability,
  a calendar's reckoning, an entity's name). The fantasy rules implement them; Westernesse installs the fantasy rules
  and its own content; another setting installs others or omits what is optional. Never one grab-bag
  `InstalledDomain`.
- **Campaign-scoped installed context, proved by coexistence.** `LocalKinds.activate/reset/reclaim` (correctness by
  whichever campaign installed last) gives way to an immutable installed context compiled with each campaign, passed
  where needed, its ids namespaced by installation. The proof is Westernesse and the allotment society alternating
  commands in one process with nothing changed by the order, a stronger proof than two settings in separate tests.
- **One public lifecycle:** install → create or resume → frame → submit → receipt and frame → checkpoint. Every
  composition root (terminal, worker, tests, scripts) goes through it.
- **Presentation in three parts:** the semantic frame (kyrie-player); the setting's presentation resources, resolving
  stable references (paintings, voice, terms); and the renderer (the reference web UI). Neither the player nor the
  renderer searches the setting's folders or reads weather from a file's name.
- **Typed identities at package boundaries**, parsed once where they cross. No universal id rewrite.
- **Text as protocol** ("Noted:", "Aim:", "too dear") replaced by typed fields as each activity migrates, the count
  held as a ratchet.
- **Creation is an installed capability:** the lifecycle needs a playable actor, not a fantasy character sheet.

**The sequence:**
1. Logical boundaries enforced before anything moves: wrong-way imports ratcheted by intended package; client-side
   workflow decisions and text inference counted and ratcheted; public entry points in place; no new deep imports
   across intended boundaries.
2. kyr-lang extracted: the parse store behind an adapter, stable exports, imports re-pointed. Package mechanics proved
   on the cleanest unit; no runtime execution added to make it feel substantial.
3. The interpreter seam in place (`src/interpreter`): evaluation in and out with a causal trace, one existing path
   routed through it, cold equal to warm, capability ports owned by it.
4. The fantasy-rules domain separated: Canon's consumers classified and moved behind installed capabilities, rule
   packages' dependencies declared (BX-02), the allotment society installing only its kernel, both domains running
   together. The decisive stage.
5. kyrie-player stabilised: frame, question, command, receipt and checkpoint, migrated activity by activity as the
   town–dungeon loop needs it (opening and place, travel, then talk, fight, map, creation, ending).
6. Runtime and player moved physically, only when the runtime's setting edges are near zero, the player's setting
   reads go through resources, clients use the protocol, coexistence passes and the declared-horizon tests exist.

Saves stay as they are for beta (no compatibility promise). Separating installation identity, generator inputs,
mutable state and durable history from reconstructible compiled artifacts is later work, not a prerequisite.

## Avoiding the ninety-day regret (the analyst's second note, 24 November)

The regret to avoid is not that the folders moved late, but that behaviour kept being added before dependencies,
identities and execution boundaries were explicit, so that every change rediscovered what the system relied on. The
lead adopts three investments, in this order of value, and five working rules.

**Three investments:**
1. **One public lifecycle and a semantic player frame.** install → create or resume → frame → submit → receipt and
   frame → checkpoint. Existing behaviour is placed behind it without rewriting. The browser's worker, the terminal,
   the allotment proof and one test fixture consume it. No new product entry point is added; lower-level APIs stay
   for focused tests.
2. **A campaign-scoped installed context instead of ambient Canon and global catalog state.** Small ports owned by
   the layer that needs them, assembled at the composition root. Start with what already uses a port (the calendar
   and the sky), then one coherent group (conditions or abilities). The alternating Westernesse and allotment test
   is its proof. No new process-global catalog reads from today (held by the canon-reads ratchet).
3. **One shared change set and dependency vocabulary, with declared test horizons.**
   - A command yields a typed change set (relations, keyed facts, reorders, the module).
   - Every memoised computation states what it depends on (a key, a relation, the module, everything) and can say
     why it was recomputed or reused.
   - The performance map (doc/architecture/performance-map.md) says where it pays first: the screen (41% of a turn),
     then journey legs and the rules' wake-ups (AX-05, AX-10). It is used there before anywhere else.
   - Tests declare their horizon: a bare Kyr fragment, the places-and-people kernel, the allotment society, a tiny
     fantasy encounter, the opening, the full Iscoed loop.

Receipts grow typed, compactly: what changed materially, what was spent, what was learnt, which authored processes
fired, the narration shown, the situation after. The Atlas, undertakings, replay, Deem's inspection and bug reports
then read one causal record, not each its own reconstruction.

**Five working rules for platform work:**
- **A layer header before building.** Authored in, executed by, projected by, rendered by, persisted as. A feature
  that cannot fill it in coherently is not ready to build.
- **A second consumer before a generalisation.** A port has Westernesse and a second or fake domain; a construct
  serves two authored cases; a player question renders in page and terminal; a cache has its cold oracle.
- **Deletion as completion.** Every architectural slice names what it deletes (Canon reads, a client's regex
  inference, duplicated workflow state, private control facts, full-world test setup, redundant screen builds) and
  counts it. A new layer whose old readers stay authoritative is not progress.
- **The game gets better each time.** Every platform batch shows at least one of: lower latency, fewer continuity
  breaches, a smaller fixture horizon, behaviour in a second domain, clearer authored source, or a client heuristic
  removed.
- **Architecture as executable counts.** Ratchets for runtime→setting and player→setting imports, client gameplay
  decisions, text and regex inference, process-global setting access (canon-reads), tests by horizon, full frames
  built per command, rules examined per settlement, and product execution paths.

## The installed context before more ports, and performance by the map (a third review, 25 November)

A third review, shared by the owner and adopted by the lead, answered three questions the lead put: the order of the
ports, the first performance investment, and what beta finishes. It changes the order below in two places.

**The ports' lifetime before their number.**
- The conditions port proved the shape: a small capability the runtime declares, the canon and a fake domain each
  answering it, Canon reads falling, no cycle closed. Abilities, traits and callings followed it.
- Those four are the last process-wide ports. Each further one would be a "current domain" chosen by the last install,
  rework when it is scoped, and progress in the Canon count without isolation proved.
- **Next:** a minimal campaign-scoped installed context, immutable, owned by the installation, built at the
  composition roots (the worker, the terminal, the tools and test fixtures alike). The four ports move onto it and
  their static install is deleted. A missing capability fails plainly.
- **Its proof:** a Westernesse campaign and a made-up domain's alternate in one process with no reset between turns,
  each compared with a run where the other never existed: the legal commands, the answers, the frame, the receipts,
  the draws and the save's digest equal. The globals it exposes (LocalKinds, SettingPort, Vocabularies, caches keyed
  without the installation) are taken one by one. Parse-time vocabulary may want a parsing context of its own.
- A ratchet holds process-wide domain installs to fall.
- **Then the canon by groups:** abilities, traits, skills and callings as one rules-domain slice (separate ports where
  their consumers differ, proved together: a fantasy character, a civic actor with no calling, an ability used, a
  trait in a check); then what the runtime asks of a body, an ancestry and a species; then creatures; then items,
  materials and the economy (currency an installed capability; the allotment's pounds its second consumer). The last
  two may go on into gamma where they block neither the supported loop nor the two domains' proof.

**Performance by the map, cheapest named cost first.** A general change set for the screen is not the first step:
- an ordinary turn's unattributed 36 ms is larger than its whole 30 ms target;
- journey legs are the furthest from theirs (some 14 times).

The order:
1. Name the unattributed time: the session's coordination, the transcript and digest, checkpoints, copies, the
   runner's reading, receipts, undertakings settled. Under a tenth of a turn left unnamed.
2. A journey leg without a full frame: the passage's own grounding and what can interrupt it; the frame built on
   arrival or interruption.
3. Itineraries only when asked: the map open, destinations drawn, a journey planned.
4. One set of rows per frame revision, passed to the screen, the leaf and the glance, equal to today's in commands,
   labels, order, bindings, focus, facets and destination; one frame per revision, counted.
5. Caches for scans whose inputs are the module or the installation (as `originated`'s took 12%).
6. Measure again. Then the shared change set (investment 3 above), first for whatever is still dear, as named
   sections each with its fresh-computation oracle.

**What beta finishes:**

| Work | Beta | Gamma |
|---|---|---|
| `kyr-lang` | the public entry and the language's purity enforced; the physical move optional, at a quiet point | the move, if not done |
| The player protocol | complete for every activity of the supported loop, riding with the game's own work | the wider product |
| Medallion assembly | two paths end to end and enforced: the opening and the allotment society | the whole repository |
| `data/` | an inventory of its readers, logical identities and provenance; nothing moved that no beta contract needs | `settings/` and `scenarios/` |

Beta's exit is behavioural: fast, trustworthy play through one loop, and a second domain shown to share the lifecycle.

## The trust thread (the lead and the analyst's fourth note, 25 November)

**The cause.** Recurrent trust defects share a structural cause: player-facing meaning is derived more than once, from
different inputs or at different times. Its instances:
- an Atlas mark derived apart from its row;
- the page reading meaning back out of labels (AR-05);
- the page and the terminal planning journeys themselves (OR-514, OR-515, TR-21);
- the glance and the rows grounding acts each on its own;
- a screen kept past the state it was built from;
- the player layer reading the world as it is, not as the company knows it (OR-423).

Each repair made where a promise broke leaves the second derivation alive. So each repair from now on deletes the
redundant derivation that allowed the defect, not only the symptom, and a defect's analysis names that derivation.

**The thread.** For each player revision, the engine and player boundary computes legal rows once. A designated
projector derives, from the authoritative state, what the company may know and perceive. The screen, the glance, the
Atlas, the narrator and every client consume the resulting semantic frame without reading or grounding the world
again. Activities stay engine-owned questions (TB-09).

1. **A player revision is more than the world's.** A talk opened or paged, a lens, the map put away, an aim taken up,
   a fight's actor or hand, a question advanced, a command pending or committed: each changes the frame with the world
   unchanged.
   - The revision is the world's, the session's and the question's, under one installation.
   - The same revision always gives the same frame, and anything that can change the frame advances it.
2. **The frame is built in one direction:** runtime legality → the epistemic projection → the rows and the question →
   the scene and screen → narration and render hints → the immutable frame.
   - Each stage receives what the stages before it made, and none reaches back into the campaign.
   - Consumers read the finished frame, and none calls `PlayerView.choices` again.
   - It is done when one row computation happens per player revision, each row has one identity, label, set of facets
     and command, and a second request for a revision recomputes nothing and equals a fresh build.
3. **The knowledge boundary has one door (OR-527).** Only the projector reads authoritative world facts.
   - **What the projection distinguishes:** what is perceived now, what was perceived and is remembered, what was
     learnt, what is inferred or uncertain, and what is mechanically available without being narratively known.
   - **Legality stays the runtime's,** since a hidden fact may rightly refuse an act. Rows join authoritative legality
     with wording and facets the projection warrants, and execution checks the command again against the world.
   - **Proved by noninterference:** two worlds differing only in a fact the company neither knows nor perceives give
     identical projections and frames; once it is learnt or seen, the frames may differ. Cases: a hidden person, an
     undiscovered way, an unknown property of an item, an unseen enemy, an unheard fact of talk, a secret condition of
     an undertaking, a concealed danger.
   - **Moved feature by feature:** knowledge and the Atlas's marks first; then who and what is in view, ways and
     destinations, talk, danger and fights, undertakings' guidance, the character and the pack; then the rest by the
     census.
4. **Three authorities, linked and checked, never conflated:**

| Consumer | Its authority | The receipt's part |
|---|---|---|
| The Atlas and facets | the prospective Outcome: what an offered row may do | checks the prediction after |
| Undertakings | the durable world and semantic state: what is true now, followed or not, after a restore | explains the progress |
| Notes and history | the durable narration the player saw | carries or refers to it |
| Replay | the commands, versions and keyed draws | compares what came of them |
| Diagnostics and performance | the receipt and its trace | the explanation itself |

**The order** (the analyst's, adopted, around the review of the same day):
1. the campaign-scoped installed context (OR-520);
2. the turn's unattributed time named, a journey leg without a full frame, routes only when asked (OR-521);
3. one row set and one semantic frame per player revision, moved in order: the runner, the engine host, the screen,
   the glance, the narrator, the clients, with parity at each step;
4. the knowledge boundary, incrementally (OR-527);
5. TB-09, activity by activity (travel done; talk, the fight, the map and endings), each reading the one projection and
   rows;
6. typed receipts enriched once the frame is stable: the revisions before and after, what changed, what it cost, what
   was learnt, the trace, the narration, the next question;
7. further Canon groups, as the supported loop asks for them.

Frame consolidation should cut turn cost, but the map does not show it alone closes the gaps (4.7 times an ordinary
turn's target, 14 times a leg's), so it comes after the cheaper named costs.

**The ratchets,** structural causes as against outcomes:
- **World reads outside the projector:** from the player, presentation, page and terminal into the campaign's world,
  the creature store, or the module's rules read to reconstruct a hidden meaning. Exceptions only in a checked manifest
  (the projector, diagnostic tools, tests), with the exported APIs through which authoritative state crosses. The
  count may only fall.
- **Independent row derivations:** `PlayerView.choices` outside the frame builder, grounding from presentation or a
  client, rows a client makes, scans adding facets, labels, grouping or destinations outside the row builder. Zero on
  product paths.
- **Frames per revision:** full frames built, sections built, row computations and reuses, by reason. One full frame
  per player revision; none for an uninterrupted journey leg.
- **Noninterference:** the hidden-fact cases holding, and the known leaks counted.
- **One source per claim:** each visible mark, focus, destination and undertaking step records its authority
  (prospective, projected, durable, committed); a claim with two live derivations fails.

## Seams or authorities? (the fifth review, 25 November, read from the code)

An external review shared by the owner read the code rather than the plans. Its question: which new seams are genuine
authorities, and which are caches wrapped around the old omniscient design? The lead adopts its findings and order.

**What it found:**
- **PlayerFrame caches rows, nothing more.** It is keyed by the world and the offered list, and holds no question,
  session, narration or hints. Expanded without a complete revision, it would gather invalidations by hand.
- **The knowledge door is declarative.** ScreenModel still takes the campaign and hands it to dozens of helpers, and
  Knowing is worked out lazily during presentation, not finished before it. A falling census is not enough: the APIs
  must stop accepting `Campaign`.
- **Isolation is half done.** The runtime's capabilities are scoped; parse-time vocabulary and local kinds are still
  ambient. Campaign.install restores the catalogs after an await, a race recovered rather than removed (OR-540's
  `LocalKinds.read/aside` added to that state).
- **A leg without a frame needs an engine-owned account of attention.** Travel's stop rules read screen output
  (`Travel.weighty`); a fast leg without that account would become a second definition of "the player is needed".
- **OpenCommand recorded its phases without enforcing them,** and command state was split across `PlaySession.busy`
  and `Campaign.command`, `executing` and `fighting`.
- **ScreenModel is the monolith to decompose,** by authority rather than by section: projection, opportunity,
  situation, resources, then a pure composition over those four that cannot read the campaign. Packaging it as it
  stands would only package the coupling.

**The order, adopted.** Trust and performance are one project here: the journey's cost is exposing the missing
semantic boundary.
1. A complete player revision: the world, the offers, the question, the session and the installation.
2. An engine-owned settled situation: rows, the reasons attention is needed (a new threat, an answer owed, a
   discovery, a changed undertaking, a crisis, a route invalidated, arrival), any interruption, what was newly
   perceived.
3. AX-05 through it: a leg continues where nothing needs attention, and the screen renders the same value.
4. OpenCommand's transitions enforced, command state one lifecycle (begun 25 November: the phases enforced, the
   session's busy derived from it; the campaign's own flags remain, OR-545).
5. A compilation context: vocabulary and local kinds passed into parsing and compilation and their cache keys,
   `LocalKinds.activate/reset/reclaim/aside` gone from production loading. Proved with module loading interleaved
   between campaigns.
6. The knowledge door as a capability boundary, slice by slice, each removing direct reads from downstream APIs:
   ways and destinations first, since they serve travel's speed and hidden ways' correctness together.
7. ScreenModel pure over the projected inputs: the true prerequisite of `kyrie-player`.
8. TB-09, activity by activity, each consuming the one situation and question.
9. Declared test horizons.
10. Packages moved last.

**The immediate queue** (the same reviewer's action list, relayed by the owner the same day). It makes steps 1–3
concrete:
1. **Finish the attribution of a turn.**
   - Time resolution, execution, narration, aims, digest, receipts, transcript, frame and the runner's overhead,
     until less than a tenth of a turn is unexplained.
   - Remeasure the same golden walk before choosing what comes next.
2. **No page built for a journey leg.**
   - One shared reading answers whether an arrival needs the player's attention. It is taken from the authoritative
     rows, the projection and the event consequences, and both Travel and Glance use it.
   - Comparison tests keep every existing stop.
   - Done when an uninterrupted leg builds no screen and no narration leaf.
3. **Strategic routes on demand.**
   - Every scene keeps its immediate exits.
   - The followed aim's route is computed only when guidance needs it.
   - The whole list of destinations is computed only when the map opens.
   - Done when an ordinary turn away from the map works out no itinerary at all.
4. **Finish PlayerFrame's migration.**
   - Its rows go into perception, the screen, the glance, narration, travel and the clients.
   - Product paths stop calling `PlayerView.choices` on their own.
   - Done when each campaign revision has one immutable row set, with page and terminal output unchanged.
   - PlayerFrame is not widened beyond rows without a typed player revision (step 1 above).
5. **Remeasure:**
   - read the medians and tails of a decision, an ordinary turn, a journey leg and a world's start;
   - the largest cost then measured chooses the next work.
6. **Incremental computation only where it is still needed.**
   - The dominant remaining computation gets explicit dependencies and a fresh oracle.
   - Its cached output must equal the fresh output, and stay isolated between campaigns.
   - Perception, legal grounding or rule wake-ups are the likely candidates, but the new profile decides.
7. **Broad restructuring waits:**
   - no package extraction, general interpreter, wholesale Canon migration or fact-key rewrite yet;
   - packages move only once both clients use the logical boundaries and wrong-way access has nearly gone.

**Every landing in the queue:**
- improves one measured latency;
- deletes one redundant derivation or full computation;
- adds a behavioural equivalence test;
- lowers a structural count;
- lands on its own before the next slice begins.

## An order of work that does not interrupt

Each stage is small, lands alone, and is held by a ratchet. None needs the Game or World streams to stop. They are
work for the maturity stream when an agent slot frees: the quantity gate first, then these in order.

1. **Ratchets per package, before any move.** Report `scripts/layers.ts`'s edges by package as well as by kind.
   Re-take AR-05's census of client-side text inference (regex tests on labels, prefixed strings parsed back) as a
   counted ratchet, and add a census of client-side workflow (page-side step or phase state). Each is held at today's
   count. Cost: small. Retires nothing; measures everything that follows.
2. **`kyr-lang` as a workspace package.** Move `src/lang` to `packages/kyr-lang`, put the parse store behind an adapter
   the node composition roots fill, and re-point the imports (a codemod; the 191 imports from `src/campaign` alone
   are mechanical). Cost: one batch with the full CI run. Proves the package mechanics on the cleanest unit.
3. **Canon behind the setting port.** Extend `SettingParts` with the rules domain's ontology (callings, ancestries,
   traits, conditions, as data the runtime asks for), filled by the setting install. Then re-point the 55 runtime
   imports. This is the largest single step, about 65 of the 154 edges, and it is what makes the runtime
   setting-independent in fact, not only in the allotment society's proof (BX-01).
4. **TB-09's remaining workflows, one activity at a time, each with its conformance spec:**
   1. the terminal on the host's travel frames (TB-10);
   2. the talk's and the fight hand's offers from the engine;
   3. the exchange's notes typed (AR-05's prefixes), and the rest of the page's text inference;
   4. the map's verbs (CO-20).
   Each closes rows the feature map lists under TB-09.
5. **The player's setting reads behind the same port** (the voice's 13, the screen model's 7, portraits), and the
   setting's reads of presentation words (13) reversed. This takes the edge count to near zero.
6. **`kyrie-runtime` and `kyrie-player` as packages**, the fantasy-rules domain and BX-02's rule packages beside them,
   and the tools split from the terminal. By then the packages are the layers the lint already enforces, and the
   move is a move.

Stages 1 and 2 are cheap, and safe to start while everything else runs. Stage 3 is where the architecture changes;
it wants its own short design note, the one asked of every port: what the runtime asks, what a setting answers, and
how a second setting answers it (Tethys, and the allotment society).

## Within the packages: the reviewer's consolidations

The external reviewer's [orthogonal extraction and consolidation plan](orthogonal-extraction-consolidation-plan.md)
(24 November) is the work inside these packages, and it agrees with the order above. Its rule 7, "enforce an import
boundary before considering a directory or package extraction", is stage 1. Each of its four consolidations has a
home here.

| Its extraction | Package | Rides with | Notes |
|---|---|---|---|
| 1. Typed Kyr predicate and value traversal | `kyr-lang` | stage 2, or any compiler or lint task | The reviewer's recommended first. It also cures a defect found today: `World.variables` (QueryModes) does not see a variable inside a comparison, which the rules' idle hold had to work around (test/small/idle-held) |
| 2. Identity- and dependency-aware memoisation | `kyr-lang` (WorldMemo, KeptReading), used by the runtime and the player | OR-183, and AX-10's rule index | `KeptParts`, `WorldMemo`, `PassageModel`'s lasting map and `KeptGroundings` are today's consumers. The reviewer's warning about length-checked indexes applies to `EntityIndex.of` |
| 3. A checked monotone command lifecycle | `kyrie-player` (the session) | MT-24's remainder | MT-24 closed on fault injection (test/command-faults), but `OpenCommand.reach` still accepts any phase in any order (src/session/open-command.ts:13). The enforcement is still to do, and cheap |
| 4. An engine-owned question protocol | `kyrie-player`, as TB-09's contract | stage 4 | The reviewer's contrasting second consumer (a riddle, a card hand or a dialectic) can be OR-149's conversation, or the old woman's riddle already pinned |

The reviewer's rejection of a general state-machine framework and of a generic projection pipeline is adopted here.
TB-09 asks that each activity's questions be the engine's, not that they share one machine.

## The web client, later

The owner, 24 November: ideally everything in `web` becomes part of `packages/kyrie-player`, as a longer-term
transformation. On this plan, `web/engine` (the host, its worker and protocol) is the player package's own host, and
moves with it at stage 6. `web/reader`, the page, becomes the player package's reference renderer once TB-09 leaves
it nothing to decide: its frame, its stage and its instruments over the engine's questions. Until then it stays a
client, because moving it before the protocol is all it draws would carry its interpretations into the package.

## Assembly in medallion layers, and horizons for evaluation

The owner, 24 November, framed world assembly as a data engineer would, filed as OR-408:

| Layer | In Kyrie | The contract at its boundary |
|---|---|---|
| Bronze, raw sources | Kyr text, Deem tables and templates, catalog JSON, the generators' output | none read past it: a generator emits silver, not Kyr text parsed again (AX-04) |
| Silver, conformed | the compiled, namespaced, linted module: declared relations, typed reads | the runtime reads only silver and gold, never the raw catalog (the setting port; Canon's 65 edges); a read of what is not declared fails (MT-25) |
| Gold, facts and views | the world's facts, and what is derived from them: indexes, kept readings, the projection, the screen model, the quantity gate's and the feature map's analytics | the player reads only gold, and infers nothing from text (TB-09, AR-05; facets inferred from what Kyr does, AP-03) |

The layers already exist. The defects sit where a boundary leaks, and the stages above close those leaks one at a time.

The simpler and more pressing ask is horizons for evaluation, filed as OR-407: "just testing a tiny rule doesn't pull in the universe". Of 1,511 specs, 694 start a whole world or campaign and 274 work at a fragment. Even the fragment harness installs the canon and all fifteen shared rule packages (0.22 s warm, 0.53 s cold), because the shared rules read one another (BX-02). The remedy:

- the rules as packages with declared dependencies;
- the fragment harness taking a declared horizon, failing on a read beyond it;
- a census of specs by horizon, held as a ratchet toward the cheapest.

It needs no reorganisation of the data. It is BX-02 with a change to the harness, and it lowers CI's minutes, one of the quality gate's five numbers.

## What this buys

- **Parity known, not hoped for.** A client cannot decide gameplay if its package gives it nothing to decide with.
  The conformance specs then say the clients agree activity by activity.
- **The trust contracts on one model.** Marks, leading and the menu all read the one player model, and facets come
  from consequences.
- **A second setting as a real test** of the kernel, not a proof carried by exceptions (BX-01's allotment society
  needed `CompanyChoices.refused` to allow any calling when canonless).
- **Faster builds and smaller browser bundles** once the packages' graph is explicit: the page's worker would not
  carry the tools.
