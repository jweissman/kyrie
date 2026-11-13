# 2. How it is built

*The authoring trail, page 2 of 9. [Start](../README.md) · previous: [What Westernesse is](01-westernesse.md) · next:
[A first encounter](03-first-encounter.md)*

Four layers with fixed responsibilities; the longer account, with one authored line followed to a remembered
consequence, is [How Kyr works](../../history/architecture-2026-10/overview.md) (its "Where a change belongs" table is the rule of thumb
for page 9).

| Layer | What it owns | Where | What it must not do |
|---|---|---|---|
| **Kyr** | Meaning: places, passages, people, things and their states, knowledge, actions, rules, endings | `data/**/*.kyr`, the shared rules in `data/rules/*.kyr`; grammar `src/lang/Kyr.ohm` | decide order of execution, persistence or layout |
| **Deem** | Choosing: seeded, weighted, compatible selection from tables and templates | the `deem` package (pinned in `package.json`); `data/generation/**` tables (`.json`) and Kyr templates with holes (`.kyrt`) | anything after generation: what it draws is data until Kyr accepts it |
| **Kyrie** (runtime) | Truth: one world state, time, people's plans, bodies, combat, history | `src/lang/world.ts`, `src/campaign/*`, `src/battle.ts`, `src/world/*` (the generated world's assembler) | wording or emphasis |
| **Presentation** | What the player can see, choose and remember | `src/presentation`, `src/ui`, `web/` | any rule: it offers only the runtime's legal choices (`PlayerView.choices`) |

**The canon.** `data/catalog/*.json` is the one fantasy domain every world shares: ancestries, classes, abilities,
conditions, items, materials, devices, plants, animals and monsters, habitats, variations, backgrounds and
professions (read only through `src/canon`, validated by `bin/kyrie validate`). `data/imbar/*.kyr` is the canonical
world: Imbar, its planes, the College of Dun Rì and its House of Doors; a module names what it uses in its manifest's
`canon` and never declares it again (page 6).

**One persistent world.** A new life draws a country from a seed (`src/world/world-assembler.ts`): its towns, people,
wild country, ruins and deep sites from Deem tables and Kyr templates; its scenarios from `data/scenarios`; and every
authored adventure as a *province* beyond a march, installed lazily the first time the company stands at its gate
(`src/world/frontier.ts`, `src/world/provinces.ts`). Each installed module's ids are namespaced by its installation
(`planternwell__square`), so two adventures never collide and an id is stable across loads.

**Persistence.** The game is saved as a checkpoint: the transcript of every command and the world's state
(`PlaySession.checkpoint()` and `PlaySession.resume()`, `src/session/play-session.ts`); the browser keeps it locally
(`web/reader/reader-store.ts`). Randomness is keyed by identity, not by order, so the same seed and the same choices
give the same history, and a kept trace (`test/fixtures/traces`) proves a change moved nothing it should not
(`bun scripts/redigest-trace.ts <name>` says whether play itself changed). Known debts: one save format and a single
autosave path (ARV-A24), process-global caches (ARV-H7, COR-04), determinism verified only by traces (ARV-H6).

**Where the layers leak today** (open obligations, in the [findings index](../../history/findings/index.md)):
generators author plots in TypeScript that emits Kyr text (ARV-H4), so most generated content is not yet data an
author can change; some presentation code reads truth the company cannot perceive (ARV-H5, COR-12); a module's own
relation that shares a name with a shared one is renamed by rewriting its text (`src/campaign/module-shadow.ts`,
M19-69); the record of what the company has heard, the leads it holds and the routes it knows is not yet kept apart
(PD-08).

*Next: [A first encounter](03-first-encounter.md).*
