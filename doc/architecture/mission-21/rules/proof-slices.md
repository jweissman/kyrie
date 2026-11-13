# The rules line's brief: proof slices, not a catalog import

The reviewer's advice to the rules line (14 November), adopted by the lead as its governing brief for the SRD tranche
(completion plan §4). The detailed handoff is the reviewer's atlas,
[shared-content-atlas-2026-11-13.md](../../../history/reviews/shared-content-atlas-2026-11-13.md); its "Explicit
deferrals" are scope boundaries, not lower-priority backlog.

> **The governing rule: never migrate a row unless the player can use or encounter its defining behaviour, the
> event/world account can explain it, and generation impact is known.**

## The first slice

One creature, one spell family, and one mundane item path, intentionally unglamorous. It exercises the important
seams without concentration, persistent areas, transformation or world magic:
- a fixed-stat `rat` SRD variant;
- `magic_missile`, then Burning Hands, Fireball and Cone of Cold;
- `rations`, and the class kits' references validated.

## Order

1. **Strengthen the fidelity audit before changing content.** Add measured fields:
   - the spell save DC;
   - the spell attack mode (none, melee touch, ranged touch, ordinary attack);
   - the creature's attack bonus or expected hit chance;
   - an explicit target and area conversion;
   - structural, resolution and play-identity verdicts.

   The current census can reward a numerically tidy but behaviourally false migration. The report stays generated
   from resolved canon, not raw JSON: overrides, reference-only records and unsupported conditions resolved first.
2. **Fixed saves on fixed-stat bodies.** A fixed SRD variant declares its Fortitude, Reflex and Will bonuses directly.
   - Only fixed-stat bodies or variations use them; ordinary Orsino creatures keep procedural saves.
   - No level bonus is added again at runtime.
   - Presentation and forecasts read the values resolution reads.
   - Provenance says whether the bonuses are exact or converted.
   - Add a fixed attack bonus in the same slice if the rat's hit probability cannot otherwise be represented: never
     fix the saves while leaving accuracy silently wrong.

   Accepted when the rat is made through the ordinary creature-generation path at several encounter ranks with HP,
   scores, attacks, attack bonus and saves identical, only the encounter's warning or challenge varying, and
   save/load reproducing it exactly.
3. **`castingLevel`** in the ability and effect context, in place of a generic `#level`: at first the effective class
   level after level drain.
   - Innate abilities need an explicit policy (source Hit Dice, authored value, or encounter level); never by accident.
   - Then one validated cap over the existing expression evaluator, not a second arithmetic language (as small as
     `cappedLevel(10)`), which validation understands, the handbook describes, and the fidelity report can evaluate.
   - Boundary tests at level 1, the cap, and one beyond.
4. **Magic Missile as the scaling proof:** no saves, areas, conditions or spell resistance in its basic resolution.
   - First a conversion note: the spell level; missiles by casting level; damage per missile; whether missiles share
     or split targets; what "automatic hit" means in Kyrie; how Shield or its like interacts.
   - Several missiles are never one larger die unless the adaptation chooses, on purpose, to discard allocation and
     per-missile interaction.
   - Tests: every missile-count boundary; one and several legal targets; deterministic allocation and replay; the slot
     spent once, not per missile; events that identify individual or aggregated missiles as the policy says.
5. **The simple elemental family:** Burning Hands, then Fireball, then Cone of Cold. They prove capped scaling, save
   for half, friendly fire, cone and burst topology, and forecast and resolution agreeing about recipients. No
   Lightning Bolt yet: `line` only after cone and burst are right under the new scaling and DC.
   - For each spell, test levels 1, 5, 10 and 20 and each cap boundary; a failed and a successful save; resistance
     and immunity; an ally caught in the area; the event trace and the displayed forecast; the exact slot spent.
6. **The rat as an unplaced SRD variant.** Do not replace `rat`: an explicit `rat/srd`, or a variation named for the
   setting, at first `unplaced`.
   - It gets fixed Hit Dice and HP, scores, an AC conversion, its attack, attack bonus and saves.
   - Compute the census; measure challenge at 48 or more fights a level; compare its envelope with the SRD's
     expectation and with the current rat.
   - Add it to one ecology row only after reviewing the resulting country samples. The first creature slice proves the
     machinery; it does not maximize the encounters changed.
7. **The mundane item and kit seam.** Add `rations`, decide `alms_bowl`, and validate every class kit's item ids.
   - Keep kit granting apart from item modelling: the item catalog says what an item is; the class says what kit it
     asks for; creation grants instances; generation and shops decide where replacements are found.
   - Tests enumerate the exact first inventory of all seven callings and fail on any unresolved kind.
   - Do not import class gold or consumable proficiency incidentally: each is its own adaptation decision.

## Do not cross yet

- Do not replace a placed Orsino creature with an SRD body.
- Do not add an `sr` field until spell resistance actually rolls, emits an event and affects resolution.
- Do not infer touch attacks from `range: touch`: beneficial touch spells are not attacks.
- Do not model persistent clouds or walls while adding a one-shot `line`.
- Do not make transformations a bundle of temporary modifiers.
- Do not implement world spells as combat effects.
- Do not add catalog fields solely so a source value has somewhere to sit.
- Do not bulk-import the absent SRD spell list.
- Do not add shared items without checking shop and treasure reachability.
- Do not hand-tune a migrated creature's HP after importing source damage: preserve the source scale, measure the
  envelope, then record any global conversion.

## Done, for each migrated entry: five pieces of evidence

1. **Provenance:** source id, conversion profile, behaviours preserved, adaptations and omissions.
2. **Executable semantics:** no unsupported defining behaviour, and no reference-only dependency.
3. **A focused rule test** that proves the entry's distinctive promise, not just that the catalog loads.
4. **A fidelity row:** its structural and resolution fields computed from resolved canon.
5. **A reachability review:** where the entry is learned, granted, sold, found, generated or placed, and what changed
   when it became reachable.

For creatures, also a combat envelope and a placement review; for persistent spells and items, save and reload; for
generator changes, representative seeded diffs.
