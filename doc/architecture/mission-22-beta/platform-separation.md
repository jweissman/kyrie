# Platform separation: packages and one workflow (TB-09)

A research note, 24 November, for the owner's question: how to organise TB-09 (workflows are the engine's) with the
extraction of packages, `kyr-lang`, `kyrie-runtime` and `kyrie-player`. The ruling is to do this without
interrupting the current Game and World work. What follows is measured on main (6f7b5a9a5) and proposes an order of
work, each stage held by a ratchet that may only fall.

## Where it stands

The layers are already drawn and held. `scripts/layers.ts` (MT-16) puts every file of `src` and `web/engine` on one
of four units:

- Kyr the language (`src/lang`);
- the runtime (`src/campaign`, `src/rules`, and the engine's root files in `src/*.ts`);
- a generic player (`src/session`, `presentation`, `ui`, `narrative`, `creation`);
- the setting (`src/world`, `canon`, `paintings`, `handbook`, `registry`, `data`).

The clients (`src/cli`, `src/autoplay`, `web/engine`, `web/reader`) stand over them. An import that goes the wrong
way is an edge. `test/small/layers` holds the baseline, which may only shrink.

Today's 154 edges:

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
- what a statement does (`src/effects.ts`: Assert, Set, Bring, Slay and the rest);
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
