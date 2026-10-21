# Composition: how Deem and the assembler build a world together

Generation proposes possibilities; assembly establishes coherent commitments; Kyrie governs what happens after.
This note describes the assembly layer (`src/world/compose`) and the kits it places (`data/kits`).

## Commitments

The assembler keeps a **ledger**: facts about the world being built, written in a small Kyr vocabulary of their own
(`data/assembly/vocabulary.kyr`): `settlement(x)`, `wilds(x)`, `waypoint(x)`, `square(town, room)`,
`landmark(x)`, `chokepoint(x)`, `hours(a, b)`, `power(p)`, `holds(p, x)`, `ambushes(p, x)`, `raids(p, x)`,
`taken(x, kit)`. Every commitment records where it came from (`region:varrow`, `kit:raider_hold#knot`, or "fixed by
its author"). Commitments are only ever added. A placement that would need one changed is refused instead.

Geography is read from region modules, authored or generated, by the same code (`Geography.read`): every exported
settlement, stretch of wild country and room; which rooms adjoin; and the hours between every two exported places
by the quickest way. A hidden way still counts: what the company knows is its own affair. A region's manifest may
fix facts the module cannot express, under `assembly.commitments` (the Varrow names its terrain, its landmarks and
the Toll gate as a chokepoint).

## Kits

A **kit** (`data/kits/<name>/kit.json`) is a reusable structure: what it needs from the world, what Deem may decide,
what it establishes, and the modules it installs.

- **Slots** are bound in order. `is` names what can fill one, as a Kyr predicate over the slot's own variable.
  `requires` are hard constraints, which may name earlier slots. `prefers` add weight to candidates that meet them.
  Candidates are ordered by weight, then by a seeded draw. If a later slot cannot be filled, the next candidate for
  an earlier one is tried, within a budget of 600 checks.
- **Proposals** are dimensions Deem fills: a weighted draw from the kit's table for the region's context (its
  terrain). A row may carry `_requires`, Kyr predicates over the bound slots. A row whose requirements fail is
  refused and the draw is made again without it, so each row is considered at most once.
- **Implications** come with a proposal: a row may name more slots (`_implies`) that must be bound, against what is
  committed, before the row is accepted. Hobs imply the settlement whose bell they stole. If nothing can be that
  settlement, the hobs are refused and Deem's next proposal is weighed. Implied slots join the placement's bindings
  and can be imported by its modules.
- **Provides** are the facts a placement commits, with `?slot`, `#dimension` and `@entity` filled in.
- **Modules** are installed when their `when` matches the proposals. Their imports name slots, `@party`,
  `@region`, or each other's exports. The raider-hold kit's hold modules (ring-fort, cave) and folk modules (hobs,
  outlaws) meet at one role interface: `gate`, `yard`, `hall`, `den`, `pens`, `store`, `lookout`, `bolt`,
  `chest`, `heap`, `backway_known`. Any hold can house any folk.

An author asks for a kit in a campaign manifest and may fix anything:

```json
{ "kit": "../kits/raider-hold/kit.json", "id": "knot",
  "fix": { "approach": "varrow.knot_foot", "road": "varrow.barrows", "prey": "varrow.ford_green",
           "hold": "ringfort", "folk": "hobs" } }
```

Anything left open is bound or proposed with the campaign's seed when the campaign loads. Kit entries are composed
in order against the regions listed before them. The same seed and the same manifest give the same world.

## Kits that build on kits

A placement's facts are commitments like any other, so a later kit can require them. The raider-hold kit provides
`chief(@band, $folk.chief)` and `band(@band, $folk.raiders)`, where `$module.export` is the ledger's name for
something one of its own modules exports. The bounty kit (`data/kits/bounty`) asks for a settlement some power
raids, that power, its chief and its band:

```json
"victim": { "is": "raids(?raider, ?victim)", "requires": ["not bountyOn(?victim, ?raider)"] },
"power": { "is": "raids(?power, ?victim) and power(?power)" },
"chief": { "is": "chief(?power, ?chief)" },
"band":  { "is": "band(?power, ?band)" }
```

Its patron modules (a widow who pays for the chief, elders who pay for the band broken and then feed whoever broke
it) import the chief and the band as ordinary groups (`knotFolk.chief`). Listed after a raiders' hold, in the Varrow
or in the frontier framework, it binds to whatever hold that region got. Listed alone, it is refused ("no place is
raids(?raider, ?victim)").

## The trace

Every decision is recorded: each candidate weighed for a slot, and the requirement that ruled it out; what Deem
proposed and whether it was accepted; each fact committed; each module installed; or the reason for a refusal. The
Varrow's Hob-Knot, fully fixed:

```text
raider_hold#knot: raider_hold with approach=varrow.knot_foot, road=varrow.barrows, prey=varrow.ford_green, hold=ringfort, folk=hobs fixed
  approach = varrow__knot_foot (fixed)
  road = varrow__barrows (fixed)
  prey = varrow__ford_green (fixed)
  hold: fixed ringfort, accepted: an old earth ring on a spur
  folk: fixed hobs, accepted: hobs, who raid by night and cannot abide a bell
  + power(knot__band)
  + holds(knot__band, varrow__knot_foot)
  + ambushes(knot__band, varrow__barrows)
  + raids(knot__band, varrow__ford_green)
  + taken(varrow__knot_foot, raider_hold)
  installs knotHold (data/kits/raider-hold/ringfort/module.json)
  installs knotFolk (data/kits/raider-hold/hobs/module.json)
```

A fixing that breaks a hard requirement is refused with its reason, for example "nothing can be approach: the fixed
varrow__market does not meet the requirements". The campaign then does not load, rather than load wrong.

## Later introduction

`Composition.introduce(manifest, kit, seed)` composes the campaign again (the same seed gives the same ledger) and
places a new kit against it. The new kit can take nothing already taken, and nothing already committed changes.
Its modules install into the running campaign with `Campaign.install`. `test/composition.test.ts` introduces a
second raiders' hold into the Varrow an hour into play: it binds elsewhere than the Hob-Knot, and every fact about
where anyone is stays as it was.

## What it is not

The assembler is not a solver. It binds slots greedily, in an order the author chose, with backtracking bounded by
a fixed budget. Deem proposes from finite tables, and each row is tried at most once. Every refusal is final and
says why. Nothing is retried in a loop, and nothing already committed is rewritten. Kits ask only for what their
modules need.
