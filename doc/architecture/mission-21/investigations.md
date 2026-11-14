# Longer-term architectural questions: focused investigations

Preserved for the owner's direction of 15 November, without opening implementation programs. Each question has what
we know, the gap, and the smallest probe that would tell us something.

The owner's future-mission discipline applies here: **one sharply focused principal achievement, with measurable
stewardship** of defects, test performance, rules fidelity and architectural health. These investigations belong to
the stewardship.

## 1. Driving the engine without graphics: a stable command and query boundary

**The question:** can arbitrary authoritative behaviour be exercised through a stable command interface, and the
resulting state changes inspected, independently of the browser?

**What exists:**
- **Commands:** `bin/kyrie run --world <seed> [--origin] [--as] [--transcript]` (src/cli/runner.ts) speaks JSON lines
  of the terminal's own projection. It takes acts by their real ids, follows aims, opens lenses, and plays a fight
  turn by turn. Errors are said, not thrown. Creation goes through the engine protocol (`--create`).
- **Effects:** every act is a `CampaignEvent` carrying the full list of state changes the engine made
  (`event.changes`, e.g. `+ knows(party, x)`). Tiny worlds read them directly (`session.leg(command)`).
- **Branching:** a world can be forked and an act done without consequence (`campaign.save()`,
  `PlaySession.fromSave`; RunnerFidelity does this for every facet a glance draws).
- **Parity:** the page, the terminal and the runner lead with the same four from the same state
  (test/small/one-projection).

**The gap:**
- **The runner is player-safe by design.** It tells what a player may see, not the world's facts, and it says
  nothing of an act's state changes.
- **There is no query command,** so asking "where is the band now", or "does `tolerates(band, party)` hold", means
  writing TypeScript against `World`.
- **Commands are only offered acts.** There is no authoritative "set the hour" or "put the company there"; tests do
  these through support helpers (Placed, Keep).

**Smallest probe:** an **authoritative mode** of the runner, opt-in (`--authoritative`) and never the default:
- `{"query": "<Kyr predicate>"}` returns the bindings that hold, read through `World.solve`;
- every turn carries the act's full `changes`.

That is about 30 lines over existing pieces (ModuleParser.predicate, World.solve, event.changes). It would let an
agent, a script or a test drive any authored behaviour and check its effects by name, without the browser or new
TypeScript.

## 2. The Kyr compiler: semantics and correctness guarantees

**Known:**
- ModuleCompiler validates types, uniqueness, query acyclicity and predicates.
- The canon validator checks catalog fields and references.
- `bin/kyrie lint` advises on thirty campaigns (anchors, targets, write-only relations, roles).
- The parse cache keeps compiled texts by content.

**Gaps:**
- **No written semantics:** what an Action, a Rule, `once`, `exclusive`, or rule ordering mean, as a specification
  rather than as code.
- **No guarantee that validation is monotone across composition.** AX-03 needs it to validate by reference.
- **Rules are applied to a fixed point with no termination proof.** A cycle is caught only by its symptoms.

**Smallest probe:** a property test over tiny modules: compose module A with module B and check that every
declaration valid in A alone is still valid in A+B. It settles AX-03's precondition and is the first written
guarantee.

## 3. Kyr/Deem composition and deferred realization

**Known:**
- Deem draws a country in about 150 ms. Writing it out as Kyr, parsing and installing it costs most of a start.
- Modules install lazily as a place is reached (the canon, provinces, goings-on).

**Gap:** realization is per module, not per need. A place's detail, its inhabitants' facts and a hex's local
geography are all made when their module installs.

**Smallest probe:** in one drawn country, realize one hex's or one site's content only when the company first
perceives it, and measure the start before and after. This is also the precondition for the owner's middle-scale
direction (one geography realized on demand, without loading the whole world).

## 4. Setting-specific assumptions in the generic platform

**Known:** loading-boundaries.md §5 holds an inventory of where the platform assumes Westernesse.

**Gap:** no budget, and no lint, for new setting-specific code in `src/`.

**Smallest probe:** count, in `src/`, the references to setting ids (region__, Imbar, named canon), and keep the count
as a ratchet, the way the clause load and the empty words are kept.

## 5. Preserved directions (not M21 or M22 work)

- **The middle scale inside a hex:** a local landscape of roads, streams, POIs and paths; one geography, movement and
  clock at many resolutions; realized on demand; a gallery of hexes as a world-design instrument; a living-company
  diorama. If cheap, one experiment on one existing hex.
- **Books and practices as instruments:**
  - A bestiary's catalogue and the progress against it ("7 of 350 recorded", the denominator the book's).
  - Law by jurisdiction.
  - A cleric's Clarity governing how far and how strongly the gold path of the followed undertaking is perceived,
    the gold invariant kept strict.
  - Expressed as declarative catalogues, queries and observer capabilities, drawn by both clients with no logic of
    their own.
  - Two tiny fixtures if cheap: the book; the cleric.
