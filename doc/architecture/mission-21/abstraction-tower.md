# Climbing the abstraction tower (the owner, 15 November)

A bounded investigation that runs beside M21's work, not instead of it. Its purpose is to inform surgical
improvements now and the architecture of M22. The principle: new kinds of game activity should increasingly be
expressible inside Kyrie, rather than requiring new categories of bespoke engine code.

The questions, each about how the boundary works today, where it costs coupling or performance, and the cheapest
improvement that gives real leverage:
1. **Kyr ↔ Deem composition.** Can a Kyr rule request or instantiate a Deem construction through a general,
   setting-independent interface? Can Deem read the loaded Kyr ontology, rules and constraints without duplicating
   their semantics in TypeScript?
2. **Deferred construction.** Can the world keep an unrealized generative specification and realize it
   deterministically later, persisting what becomes true? The specification includes its identity, generation
   context, dependencies, seed state and commitments. How does that meet changing state and module versions?
3. **Reflection.** Can the loaded Kyr namespace be queried as structured semantics? Could campaign metadata,
   organization and encyclopedia material be declared in Kyr and found by generic tools? What is a minimal useful
   reflection API, short of unrestricted metaprogramming?
4. **Commands and queries.** Is reading cleanly apart from authoritative change? Can any behaviour be exercised in a
   tiny world by submitting a command and inspecting the resulting changes and events? Does observation ever commit
   state without an explicit realization boundary?
5. **Authoring and debugging.** Could the same interface carry a CLI or privileged console that inspects rules,
   entities, knowledge, generation contexts, prerequisites and transitions, and later validated edits? It must use
   the real engine, not a second set of interpretations.
6. **Platform against setting.** Where does the implementation know more about Westernesse than it should, and what
   could move into Kyr declarations?

**What is already known** (this mission):
- Deem reaches Kyr as text rendered by TypeScript generators and parsed again (AX-04).
- Countries beyond the first are deferred, but by one bespoke path whose result depends on the order of
  exploration (AX-02 fixed the seeds; AX-07 is still open).
- The deep is eager (the deep-mine pin).
- The parser knows no setting (the Vocabulary inversion), but the compiler, grounding and `engine-owned.ts` still do
  (AX-08).
- The Encyclopedia is written from catalogs, not from the loaded module (loading-boundaries §5).
- The protocol (EngineHost, `serve`, the runner) separates requests, but no one has shown that observation is free of
  side effects.

**The first concrete target** (the lead, 15 November, on the owner's word that Kyr's expressivity matters most here).
The Paragon pins each found a capability the engine has that Kyr cannot name. The investigation starts by closing the
most general of them, through a general form and never a special case:
1. **A local kind declares what its use carries.** The engine runs item hooks (`onAttackHit`, `onAttacked`,
   `onCombatStart` …) in its effect language, and a module's own kind cannot say any of them. The proof is the fiery
   blade made as a new kind (`Kind flame_brand "a flaming greatsword" like greatsword` with its fire carried on a
   blow) in `test/small/pin-fiery-blade`, where today it borrows the catalog's wonder.
2. **The others, as findings with their smallest failing examples:**
   - an innate affinity on a person (by kind only, today);
   - riding (the mount pin);
   - a companion acting and perceiving apart (the familiar pin);
   - a plain valuable kind (the mine pin).

   Some may stay M22 design. Each is sized.

**Deliverables:**
- How each boundary works today, with measurements, in `mission-21/abstraction-tower.md` (this file).
- One or two tiny probes with the real compiler and runtime, for example:
  - a Kyr action that asks for a generated, persistent entity;
  - a query that enumerates a small setting's declared capabilities;
  - a screen built twice, with the world's key compared.
- The cheapest high-leverage improvements, each sized.

A failed probe that names an expressive limit precisely is a result. Nothing is made to pass by a special case.
