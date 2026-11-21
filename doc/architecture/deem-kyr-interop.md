# Deem / Kyr generation interop

*21 November 2026. A grounded proposal for making selected Deem templates directly usable by Kyr.*

## Conclusion

Use the template name as the opt-in. A Deem template named `@village` is public to Kyr; an ordinary template such as
`settlement`, `fl_casting`, or `_creature_complete` remains an implementation detail. Kyr code conceptually saying

```kyr
generate place "@village" with { ... }
```

asks Deem to generate `@village`, checks the returned value as a Kyr place declaration, lowers it through Kyr's
ordinary place path, and receives the new place's reference.

The `@` says only **Kyr may call this template directly**. It does not need to encode the result type. The invocation
already says `place`, so that is the expected type against which the result is checked. If tooling later needs to list
templates by result type without inspecting a call site, the smallest sufficient addition is:

```json
"@village": {
  "__kyr": "place",
  "name": "=...",
  "kind": "settlement"
}
```

That field should be optional at first. A larger metadata protocol, schema version language, phase list, or special
Kyr-side registry is not needed to prove the boundary.

The hard part is not exposing the template. It is defining what a generated `place`, `person`, or `item` must contain,
which surrounding values Deem receives, and how the result enters Kyr without bypassing existing validation and
ownership.

## What exists now

### Deem already has almost all of the invocation machinery

`Generator.gen(type, options)` looks up a template or table by its string name and assembles a JSON-like result.
`Template.bootstrapDeem` already supports nested `gen`, inherited context, scoped parameter overrides, tables,
selection, and one seeded runtime. No new Deem expression mechanism is required.

`Content.generate(type, context)` is Kyrie's existing call boundary. It supplies the merged setting and a seeded
runtime, but returns an unchecked record. It rejects a list only. This is the right place to add public-template
discovery and result validation rather than adding a second generator service.

The setting is currently closed but extensible in two useful ways:

- `GenerationSetting` merges the shared tables and templates in `data/generation`;
- `Content.settingWith` adds a bundle's local definitions and refuses to replace shared names.

Therefore `@village` can work both as a shared template and as a bundle-local template without changing how settings
are assembled. The existing no-replacement rule is a good initial namespace rule.

### Kyr currently uses Deem in three different, untyped ways

1. `WorldGrid` generates `region`, then casts the result to `Region` before `WorldAssembler` enriches and lays it.
2. `WorldAssembler.newSite` generates `site`, casts it to `Site`, then replaces its id and situates it.
3. `ModuleBundle.generated` generates a bundle's declared type and casts the result to `AdventureManifest`.

These paths demonstrate that Deem can already produce useful Kyrie-side records. They also show the actual defect:
the boundary is expressed with `as unknown as`, so compatibility is a convention checked later and incompletely.

The first useful work is to validate these existing results. Direct invocation from Kyr should reuse that validator,
not introduce a more abstract system first.

### Kyr already has construction paths, but no general construction value

Kyr parses declarations into module IR:

- `Place` becomes an `Entity` with a `PlaceDefinition`;
- `Person` becomes a `Person`, a group entity, facts, words, states, and creature-generation constraints;
- `Thing` is lowered by `WorldConstructs` into entities and facts;
- items are split between item kinds and unique instances;
- creature bodies and mutable state are materialized later by `Cast` and `Content.createCreature`.

There is no common runtime “Kyr object” that a Deem record can simply be assigned to. Each type needs a small adapter
to its existing declaration/lowering path. That adapter should accept the same information an author can write, not
the final `World` representation and not raw Kyr source.

## What `@village` should mean

The name convention can be implemented narrowly:

1. Deem continues to regard `@village` as an ordinary template name.
2. Kyr refuses to invoke a template directly unless its name begins with `@`.
3. The Kyr invocation supplies the expected result kind (`place` in `generate place`).
4. Deem receives explicit options plus ambient context.
5. Kyr validates the completed result as that kind.
6. Kyr assigns declaration identity and lowers the result by the normal path.

The prefix prevents helpers such as `fl_casting`, `attributes`, or `scenario_choice` from accidentally becoming part
of Kyr's public surface. It is deliberately not a type system.

`__kyr: "place"` buys two things only:

- `deem list` or Kyr tooling can say which public templates make places;
- a mismatched call can fail before generation (`generate person "@village"`).

It does not remove the need to validate the generated value. Deem expressions are dynamic, so a template declaring
`place` can still return a missing name or an invalid kind. For that reason the annotation should not be treated as
proof and need not block the first implementation.

## The actual result shapes

Do not validate directly against today's final interfaces. They contain fields owned by later stages.

For example, the current `Site` result includes generated `id`, `kind`, `name`, and `hours`, while later assembly adds
`cell`, `zone`, `part`, old names, works, and exact placement. A Kyr-generated place likewise should not manufacture
atlas coordinates or committed parentage unless the invocation permits it.

Define small input shapes beside the existing parsers, beginning with places:

```ts
interface GeneratedPlace {
  name: string;
  kind: PlaceKind;
  shelter?: Shelter;
  depth?: number;
  description?: string;
}
```

The Kyr declaration supplies the id. Its lexical site supplies `parent` unless explicitly overridden by the language.
Placement supplies coordinates where the containing generator owns geometry. `description` lowers to the same
observation or description construct an authored declaration would use.

Subsequent shapes should follow the same rule:

- `GeneratedPerson`: authored `Person` fields such as name, role, ancestry/species or creature constraints, calling,
  level, background, profession, traits, gear, temperament and words; never `creatureId`, HP, projected facts, or
  actor state.
- `GeneratedItem`: a canonical item-kind id plus instance-facing details the item system actually supports; never an
  inventory mutation disguised as data.
- `GeneratedThing`: the input to `WorldConstructs.thing`, including states and changes, not already-lowered facts.

Player characters, NPCs, monsters, and companions need not be four materializers. They are different presets or
constraints over `GeneratedPerson` followed by the existing `Cast` / `createCreature` pipeline. “Companion” additionally
needs an explicit Kyr relationship or placement step; Deem should not assert membership itself.

Treasure similarly separates selection from commitment. `@loot` can return one or more canonical item-kind ids and
gem details. Kyr's item path creates unique instances and assigns them to a place or holder.

## Context: use what the repo already passes

There is already substantial assembly context, but it is fragmented:

- region generation receives explicit `given`, world-shape values, and strategic-atlas values;
- scenario selection receives region context;
- scenario module generation receives terrain/folk/domain-style context assembled by `WorldAssembler`, module-local
  context, names already taken, and `now`;
- nested Deem templates inherit their parent's active context;
- `Person Creature ...` already stores constraints later consumed by creature generation.

The immediate recommendation is not a new universal context object. It is to expose the context available at the
invocation site as ordinary Deem fields, using the current names where they already exist (`terrain`, `folk`,
`ancestry`, `domain`, `taken`, `now`). Explicit `with` values win.

For a village being generated while a region or drydock module is assembled:

```text
shared/setting values < enclosing generation context < lexical Kyr context < explicit with values
```

The first proving implementation should define only a few lexical fields:

- `parent`: the enclosing Kyr place id;
- `placeKind`: its kind;
- `terrain`: if known from the enclosing region;
- `folk` and `peoples`: if known from the enclosing settlement/region;
- `domain`: if known from the region;
- `now`: if the invocation occurs after campaign start.

Use `folk` for the local naming/cultural pool because that is the name existing scenario generators already use.
Keep `ancestry` for an individual or a region's dominant generated ancestry. Do not silently rename both to
`population`: current templates and tables distinguish them, and a migration would add work without improving the
interop boundary.

### Runtime context is a query, not “all facts”

At runtime the current place can be found from `at(party, place)`, but terrain, settlement, region, folk, and domain
are not one generic record hanging off that entity. They are represented across containment, generated region data,
module bindings, and facts. Passing “whatever the runtime knows” would make templates depend on unstable internal
relations and could leak omniscient information.

Add one read-only `GenerationContext.at(campaign, subject)` projection when runtime generation is attempted. It should
initially answer the same small vocabulary above by walking containment and consulting authoritative region/module
metadata. Missing values remain absent, so the Deem template may choose them. Do not expose the raw solver or an
arbitrary fact lookup to Deem in the first version.

The dwarvish-city case then has an observable rule:

```text
explicit with.folk
else lexical folk during assembly
else current settlement/region folk at runtime
else undefined, and @village chooses
```

Record which branch supplied each value in the generation trace. This is more useful than a large context schema.

## Where invocation belongs

There are two distinct insertion points.

### 1. Declaration-time generation

This is the right first feature. The module compiler encounters a generated declaration, calls a supplied generation
callback, validates the result, and appends the same IR that the corresponding parser would have produced. It happens
before module compilation and installation, so existing reference, type, vocabulary, and semantic checks still run.

Do not make `ModuleParser` import `Content` or Deem. The parser should represent a `generate` declaration; the bundle
or compilation composition root supplies the callback and setting. This preserves the ability to parse Kyr without
loading the canon and all generation tables.

Do not render the result as Kyr text and parse it again. The repo already identifies that text boundary as a source of
lost provenance and authoring difficulty. Add a small IR constructor beside each parser instead. A useful refactor is
for authored `Place` parsing and generated places to call the same `Places.add(module, input)` function.

### 2. Runtime generation

Defer general runtime generation until one entity type has succeeded at declaration time. The current `World` holds
facts immutably, while creature bodies, installation, namespaces, and persistence are owned by the campaign. Creating
a place at runtime is module installation/topology change, not an ordinary `Change` like `Assert` or `Set`.

When runtime generation is added, begin with an item or a bounded person operation already supported by a campaign
service. The operation must be transactional and its generated result recorded in campaign history/save state. It
must not rerun against changed tables on restore. Runtime `place` generation should remain an explicit module/frontier
installation operation until the campaign has a general dynamic-topology service.

## Concrete implementation sequence

### Step 1: make today's boundaries honest

Add validators for the existing `Region`, `Site`, and `AdventureManifest` results and replace their
`as unknown as` casts. This will reveal the real field conventions and error quality needed for public templates.
It also improves current code independently of new Kyr syntax.

### Step 2: expose public template names

Add to `Content`:

```ts
generateForKyr(expected: 'place' | 'person' | 'thing' | 'item', template: string, context: ...)
```

It should require `template.startsWith('@')`, call the existing `generate`, validate the completed value, and include
the template name in errors. If `__kyr` is present, check that it matches `expected`; otherwise rely on value
validation. No Deem output change is needed for that annotation: `Template.assembleProperties` already removes every
property beginning with `_` from the completed result, while the original `Template.props` remains available for
discovery before generation.

### Step 3: prove `place` at declaration time

Add one generated-place declaration to Kyr, leaving exact surface syntax open until the grammar change is made.
Refactor authored and generated place construction through a shared IR helper. Supply lexical parent, terrain, folk,
peoples and domain where the compiler actually knows them. Test:

- `@village` with no explicit options;
- the same template in a dwarvish enclosing context;
- an explicit option overriding the ambient value;
- no `@` prefix;
- missing name, unknown place kind, wrong primitive type and a `__kyr` mismatch;
- stable output after an unrelated generator is added.

### Step 4: prove a canonical reference value

Before generated people, add `generate itemkind` or `generate gem`. It exercises custom tables and type checking but
returns a catalog reference rather than mutating topology or the creature store. This distinguishes generator
invocation problems from object-materialization problems.

### Step 5: add people through the existing creature path

Have `@npc`, `@monster`, `@player`, or `@companion` return `GeneratedPerson`. Feed its creature fields through the same
`Person` -> `Cast.group` -> `Content.createCreature` path used now. Do not accept computed HP, inventory ownership, or
projected capabilities from Deem. Test that an authored person and an equivalent generated person produce the same
creature and facts.

### Step 6: only then add runtime commitment

Define a campaign command/service for the first runtime-safe type, a stable invocation key, saved generated value,
and replay behavior. Add `GenerationContext.at` only for fields that the proving generator actually needs.

## Specific problems this solves

- **Templates that work without options.** `@village` can generate every required `GeneratedPlace` field internally;
  `with` is optional and ambient values merely constrain it.
- **More Deem templates without exposing helpers.** The prefix makes the public surface explicit without a registry
  file or a large metadata block.
- **Custom and richer tables.** A bundle-local `@` template already travels with its local tables through
  `Content.settingWith`; validation gives its final result a Kyr meaning.
- **Dwarvish and other ambient coherence.** Existing `folk`, `terrain`, `domain`, and region context become available
  to direct invocations instead of being manually threaded by each TypeScript generator.
- **Players, monsters, NPCs and companions.** They reuse the authoritative person/creature constructor instead of
  reviving the retired Deem-owned creature definition pipeline.
- **Loot and gems.** Deem chooses canonical definitions and descriptive dimensions; Kyr creates instances and
  ownership.
- **Assignment back into Kyr.** Declaration-time generation returns the id Kyr declared. Runtime assignment waits for
  a campaign service capable of committing that entity type; it is not faked as assignment of a JSON object.

## Boundaries to keep

1. `@` exposes a Deem template; it does not grant Deem access to arbitrary Kyr evaluation.
2. The Kyr invocation supplies the expected result type; optional `__kyr` is an early check and discovery aid only.
3. Generated values use authored-input fields. Engine-owned state is never accepted across the boundary.
4. Explicit options override ambient values. Absent ambient values are not errors unless the template fails to
   generate a required result.
5. Deem selects; existing Kyr constructors lower; the assembler places; campaign services commit runtime state.
6. Declaration-time and runtime generation share template invocation and validation, but not commitment semantics.
7. The first implementation should improve the three unchecked generation boundaries already in the repo.

This is enough machinery to make `@village` meaningful. Anything more should be justified by a concrete generator
that cannot be expressed through this path.
