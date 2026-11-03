# Quittance — Stage 3: what Kyrie can bear, and what was planned

Written after reading `doc/authoring/guide.md`, the architecture notes (overview, generated-worlds, living-world), the shared
rules in `data/rules`, `src/rules/checks.ts`, `src/world/{frontier,countries}.ts`, and the finished adventures (Low Water,
the Liberty of the Ice, Hessel, Wrayford) for idiom. Nothing here required an engine change; where the design asked for
something Kyr does not have, the plan is the idiom that stands in for it, and the gap is recorded in
`friction.md`.

## What the design asked for, and what carries it

| Design ambition | Carried by | Notes |
|---|---|---|
| A metropolis of eight districts and a buried city | `settlement` per district inside one `region`; `site` with three `level`s for the Sunk City; ways typed by kind and timed | ~110 rooms; district boundaries are ways of 10–20 minutes, so the city has distance. |
| Five ways in through a gate | `Passage … opening when inCity(party)`; `Thing … on` passage with `blocking` states; Speaker actions with `Resolve check(…)` and skill-gated alternatives (`capable(actor, brawn)`) | The portal is a puzzle of *what is recorded*, not a lock. Entering one way leaves a relation the rest of the book reads (`entered_*`, `onTheRoll`, `aliased`). |
| The Honest Bell: rings for a lie | A `Resolve check(deception)` whose failure rings the Bell, charges the company and refuses retry; a Rule-Five route that needs a *discovery* (the pencilled notice) and a lore or persuasion check | Clue → Discovery → option is the engine's own pattern; nothing special was needed. |
| Small adventures with consequence | Each in its own file with prefixed ids; the contract in `kernel.kyr` (factions as groups with `regard`, arcs, witnesses, discoveries, ward keepers, coals) | No global catalogue; the contract is a handful of relations in the *module*. |
| Arcs where people are moved by something other than evidence | `Measure arc(person)`; Actions with a `Speaker` and a lever-specific `Requires` (a coal, a witnessed street, a better sum); `Known as`, `Greets`, `Greets again` | Each lever is a distinct Action that increments the arc once. |
| A hearing with votes | `Occasion` with `Matter`s; votes are Rules over `regard`, `arc`, `witnessCount`; absent players are handled by the Occasion's clock | The Hearing happens whether the company attends; its result reads what the Offices think of them. |
| Scarce resources for the civic finale | A good (`coal`) with a gutter-out Rule keyed on a measure; `hearthAt` / `keeper` relations per ward; `lay_coal` as one general action | The budget problem is real: sources are earned in quests, and carriage lasts a day. |
| A descent as an environment game | `Hazard`, `Thing` states, a heat measure, glass-men as a species-like opponent, a notarial lock, a mood measure for the Fire | Owned by the Descent author; see its quest card. |
| An authored city inside a generated world | `data/adventures/countries.json` province entry (`quittance/placed.json`), `placed.kyr` with `Entity party`, `entry: arch_road`, a marker entity (`reckoning`) no other adventure declares | The folk of the first country tell of it; the road in is the same road every other province has. |
| Persistence | All state is relations and measures; `Chapter`/`Ending`/`Milestone` are engine constructs | Saves hold the whole world. |

## What was deliberately not built

- **A reputation system.** `regard` is a measure on a group; there is no decay, no propagation, no rumour. The Offices
  remember what the company did *to them*, and what other people said of it is carried by persons (`witness`).
- **A scheduler for NPC lives.** Where someone has to be somewhere at an hour (Skelter out at noon, Prewitt at Gasket Yard in
  the small hours, the torchmen at the Court) a Rule moves them. `Pursuit` was used where a walk across the city mattered (the
  small adventures' authors choose).
- **Per-company dialogue variants by build.** Builds change what is *offered* (a Speaker action with a skill or an item),
  not what a line says; the check line names who spoke.
- **A pathfinding "Hearing UI".** The Hearing is Actions the company takes from the floor of the Hall during a Matter.

## The order of work (and why)

1. Kernel: city, scenes, contract, Arch, Slate, shared people. Frozen first, because every author depends on its ids.
2. Parallel authors in isolated worktrees, one file per quest. The risk was id collision and style drift; the brief and the
   `quittance__` prefix control the first, the quest cards the second.
3. Spine, Hearing, Hearth Night, endings: written against the kernel only, so they lint before the quests land.
4. Merge, then wire what the spine reads from the quests (the Mark Street Rule, the forged marks, Fusby the witness).
5. Placement and the ordinary-player journey; the build matrix; the exploratory offered-action fuzz.
6. Editorial pass against `02-review.md`'s findings; the change log.
