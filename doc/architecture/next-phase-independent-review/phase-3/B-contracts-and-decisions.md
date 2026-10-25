# B. Architectural contracts and decision records

Phase III, snapshot `483e3af`.

**Admission rule for this document:** a contract appears here only if at least two meaningfully different, concrete
uses justify it. Each use is named, and most are evidenced by a probe or by shipped content.

---

## Contracts

### K1. Placement: an adventure and the world

| | |
|---|---|
| responsibility | where an adventure can be met, how it is joined to the world, how it is heard of, and what the company must be for its premise to hold |
| justified by | (1) The Long Man as a country beyond a march (`countries.json`, `placed.json`); (2) Thrume and Let One Remember installed into a generated world (`phase-2/probes/all-in-one-world.out`); (3) the scenario library's hooks (`fever.scenario.json`) |
| inputs | `entry` (an exported place); `attach` (march side and terrain today; a city place later); `hooks[]` (`{fact, topic, channels, opens}`, as scenarios have now); `compat` (era, premise); `arrival` (what is granted on entry, replacing the company declaration) |
| guarantees | (a) the adventure is installed inside the command that first brings the company to its horizon, or refused with a reason before the game starts; (b) one answer to "what is beyond this march" (Phase I E2); (c) every placed adventure has at least one hook reachable by ordinary play (a reachability audit); (d) clocks start at installation (`ClockShift`) |
| must not assume | that the adventure is installed at Begin; that it is placed in every seed; that the company has any particular size, class or gold, beyond what `arrival` checks |
| validation must detect | an entry that is not an exported place; an incompatible `compat`; an Arrival asserting campaign-owned state (`admit`'s list); no hook reachable; two adventures claiming one march |
| evolution | new `attach` kinds (city place, service stop) are additive; an adventure without `compat` is treated as `any`; the old `countries.json` entries lower to K1 entries |

### K2. Exported surfaces: authors and each other

| | |
|---|---|
| responsibility | what one module offers others: places to build onto, people and groups to refer to, and (if any) kinds |
| justified by | (1) the tower's back stair onto the academy's exported stair (`phase-3/probes/companion-reaction.out`); (2) the Long Man's `exports` (`road_end`, `green`) used by the frontier's road; (3) generated regions' exports used by kits (`ModuleBundle.imports`, `RoleRequirements`) |
| inputs | `exports: {name: localId}`; imports by `owner.export` with role contracts (`type`, `conditions`) |
| guarantees | an exported name is stable within a major version of the module; what is not exported is private and may change freely |
| must not assume | an exported place's contents (rooms within it, its people), only its type and the conditions declared; another module's private names |
| validation must detect | an import of a non-exported name; an unmet role condition (both exist today); **new:** a module that removes or retypes an export used by any module in the library (library-wide lint) |
| evolution | modules version their exports (`exportsVersion`); removal requires a major version; the library lint runs in CI over every authored module, which also answers Phase I H1's "no lint of shipped adventures" |

### K3. Shared vocabulary: the medium of interaction

| | |
|---|---|
| responsibility | the relations whose names mean the same thing to every author: `keeps`, `holds`, `covets`, `pursues`/`stage`, `believes`, and a small curated lore set (`forbidden`, `ancient`, …) |
| justified by | (1) the two-institutions probe: the academy's rule found the tower's keeper through `keeps` + `forbidden`; (2) the companion probe: Ferrand reacted through `forbidden`; (3) today's `data/rules/*` used by every module |
| inputs | curated rules files (`data/rules/*.kyr`, plus any shared file a module lists in `rules`) |
| guarantees | additive growth never breaks a module: `ModuleShadow` already renames a module's clashing local names; a relation's arity and meaning never change once published |
| must not assume | that any other module uses a given term; that a term's presence implies a story |
| validation must detect | a module redeclaring a shared name with another arity (`ModuleShadow` handles same-name local declarations; arity drift in the shared files themselves needs a check); a shared term used by no module (dead vocabulary) |
| evolution | append-only; deprecation by documentation; **governance by one curator** (decision DR9) |

### K4. Installation and persistence: the world and the command record

| | |
|---|---|
| responsibility | that everything that changes the world happens inside a command, is undone with it on failure, and is reproduced by replaying the transcript |
| justified by | (1) frontier crossings (`PlaySession.perform` with the expander, `Campaign.undo`); (2) adventure placement (K1); (3) saves and the browser's keeping |
| inputs | an install request from the instantiator (frontier, K1); a checkpoint request |
| guarantees | (a) installation validates **only what it installs** (the Phase I A1 repair); (b) no checkpoint while a command is in flight (Phase I A2); (c) saves and transcripts carry the engine, rules and content hashes and the dependency pins (Phase I G1); (d) replaying a transcript in a fresh process gives the same canonical state (this holds today: wren hashes reproduced cross-machine) |
| must not assume | that the world is the same for two playthroughs of one seed that take different routes (today it is not: DR1); that a save opens under changed content |
| validation must detect | a validation failure caused by state the incoming module did not bring; a checkpoint whose transcript and state disagree (the Phase I probe); a hash mismatch on resume |
| evolution | the save envelope gains fields additively; a content change is handled by policy (DR6), not by migration code, until a migration is needed |

### K5. Knowledge: what holders know, believe and were told

| | |
|---|---|
| responsibility | who knows which established facts, who holds which claims and from whom, and what a speaker can therefore say |
| justified by | (1) Ferrand's reaction (Slice 5); (2) the institution's information discipline (the probe's instant omniscience); (3) investigation: the hidden ruin of Slice 3, and Phase I D1's testimony case |
| inputs | perception (per member: new); topics and reading (exist); carriers (exist) |
| guarantees | `knows ⊆ established` (exists); rules may not write `knows` or `established` (exists); a speaker's topic that teaches F requires the speaker to know F (new); bound variables in text render (new) |
| must not assume | that the company's knowledge is any member's; that a claim is true |
| validation must detect | a topic teaching what its speaker cannot know (lint); unbound or unrendered `{?x}` in any text (compile: today it prints "?x"); a fact taught but neither established nor declared hearsay |
| evolution | `knows(company, f)` remains, as the union of members' knowledge, so existing adventures keep working |

### K6. Routes and destinations: geography and the player's knowledge of it

| | |
|---|---|
| responsibility | which places the player can name, which ways they know, and what assisted travel may do |
| justified by | (1) a city destination, a regional road and a ship (Slice 3); (2) hidden ways opened by hooks (`way-in.test.ts`) |
| inputs | `connects` with times (exists); `visibleTo`, `revealedBy`, `named`, `found` (exist); the chart's known ways (`ChartModel.ways`); a service as a vehicle actor with stops and times (new) |
| guarantees | assisted travel expands into offered `go` commands only, and is recorded as that expansion; an unnamed place is never listed; an interruption stops the expansion with a reason |
| must not assume | geographic reachability means the player knows a route |
| validation must detect | an expansion step not offered; a listed destination the company has not been told of; a placed destination with no route anyone can learn (the reachability audit) |
| evolution | services and routes are additive vocabulary; nothing changes in `go` |

### K7. Telling: simulation and narrative

| | |
|---|---|
| responsibility | narrative reads the game record and chooses what to say; it never writes authoritative state |
| justified by | (1) companion lines selected by state (Slice 5); (2) "said once" de-duplication (`Telling`, which today reads back rendered prose); (3) the browser and CLI telling the same game |
| guarantees | line ids and bindings are what the log stores; rendering happens at view time; a voice-table edit changes no canonical hash |
| must not assume | that a line was seen because it was rendered |
| validation must detect | presentation code imported by simulation code (`campaign → presentation`, Phase I evidence/deps.txt); the hash invariant |
| evolution | migrate `voiced` from text to ids. Old saves' text is kept as legacy, read-only |

### Not made contracts (insufficient use cases yet)

- `preserve`, `mayVary`, `worldMay`, `owns`: Phase II.
- City sockets and lots.
- Public faces for strategic actors.
- Tags as a separate mechanism: shared vocabulary covers them.
- Remarks.

Each waits for a second concrete case.

---

## Decision records

Each record states the decision, its alternatives and their trade-offs, a recommendation, and what would reverse it.
"Irreversible" means the cost grows with the amount of authored content.

### DR1. World identity: path-dependent or planned *(irreversible)*

- **(a) Path-dependent, as today.** The country beyond a march depends on what is already installed (`frontier.ts:77-78`). Replay is exact; two routes give two worlds.
- **(b) Planned.** A world plan fixes every region's contents and every adventure's place at Begin, from the seed and the content hash.
- **Trade-offs:**
  - (b) gives stable placements, guides and directions that can be true before the region is drawn, and shareable seeds; but it costs the plan and constrains generation.
  - (a) is free and already works; but march-stone text and rumours can only describe what is already drawn.
- **Recommendation:** (b), but only for **placements and named routes** (a small ledger). Region interiors stay drawn on demand, as long as they respect the ledger's commitments.
- **Reverse if** Slice 1 shows (a)'s path dependence never surfaces to a player.

### DR2. Eager or lazy installation of placed adventures

- **(a) Lazy at the horizon** (the frontier's way).
- **(b) Eager at Begin, with authored clocks gated on entry** (`begun(adventure)`).
- **Trade-offs:**
  - (a) needs Slice 0's repair and A2, and keeps worlds small.
  - (b) removes mid-play installation entirely, but runs every adventure's rules every watch (measured: 88 ms a wait with two adventures; it grows linearly), and requires authors to gate clocks. That is an authoring burden, and a likely source of errors.
- **Recommendation:** (a) for adventures. Run Slice 1's eager variant to measure (b); choose (b) only if mid-play installation keeps producing defects.

### DR3. Kinds of thing: shared or namespaced *(irreversible)*

- **(a) Today:** global ids; a collision is an error (Phase I C1).
- **(b) Namespaced by default,** with exported kinds.
- **(c) Shared catalog plus namespaced locals,** with an explicit `Kind … shared`.
- **Trade-offs:** the city's goods and an academy lens carried elsewhere must be *one* kind (against (b)); independent authors' `brass_bell`s must not collide (against (a)).
- **Recommendation:** (c), decided before more authors write kinds.

### DR4. Scope of player-offered actions

- **(a) World-wide, as today.**
- **(b) Module scope by default** (the Phase I recommendation).
- **(c) World-wide, with lint against unconstrained offered actions, and disambiguated wording.**
- **Recommendation:** (c). Rules stay world-wide: that is how institutions interact (the two-institutions probe).

### DR5. Compatibility policy *(irreversible in effect)*

- **(a) Refuse incompatible adventures** (separate games).
- **(b) Require authored placed variants.**
- **(c) Place and warn.**
- **Recommendation:** (a) by default, and (b) when the author wants it. The House That Grows (year 3640, a named protagonist) is the test case.

### DR6. Save compatibility under changing content

- **(a) A save is bound to its content hash,** and refused otherwise.
- **(b) Replay the transcript onto the new content.**
- **(c) Migrations.**
- **Recommendation:** (a) now (cheap), with (b) offered as "start again from your choices" when a replay succeeds. (c) only for a specific need.

### DR7. Knowledge granularity *(irreversible: authored content binds to it)*

- **(a) Per company, as today.**
- **(b) Per member, with the company as the union.**
- **(c) Per member, with sources and claims.**
- **Recommendation:** (b) now; claims (`belief.kyr`) for hearsay; sources only where a slice needs them.

### DR8. The city model

- **(a) One hand-authored city module exporting wards and landmarks,** with contributions by import.
- **(b) Skeleton, sockets and lots** (Phase II).
- **(c) A procedural street grid.**
- **Recommendation:** (a) until two contributors compete for one position. Reject (c): no use case, and it creates the "miles of empty navigation" problem.

### DR9. Shared vocabulary governance

- **(a) A curator** (the city's author or the project owner) owns `data/rules` and the lore file.
- **(b) Authors coin shared terms freely.**
- **Recommendation:** (a). Shared terms are the cross-author API; they must be few and stable.
