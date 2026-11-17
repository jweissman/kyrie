# M22 Phase 4A: the SRD and engine proving cases

Hand-kept beside the generated concordance (`mission-21/rules/srd-fidelity.md`, written by `bun scripts/srd-fidelity.ts`
and not to be edited by hand). That report grades catalogue rows against the SRD in structure and resolution. This
record says which *engine routes* a spell's defining behaviour runs through, each proved by a tiny-world spec.

A spell in the catalogue does not prove it works. Note too that `capability-audit.md`'s "241 faithful" means faithful
to Orsino, not to the SRD. Each case below is one of four classes:
- **faithful**: the SRD's behaviour, by the SRD's numbers;
- **adapted**: the SRD's behaviour, by numbers or a route changed on purpose, the change named;
- **incomplete**: part of the defining behaviour runs, the rest is named as missing;
- **unsupported**: the catalogue has it and nothing runs it.

## The cases (16 November)

### 1. Sleep over a band outside a fight (CF-03): adapted, its route proved

`Resolve invoke(sleep, caster, band)` now takes a group as its target (its signature's third kind is `member|group`, a
union the compiler checks). Spec: `test/small/sleep-band` (4 cases).

**The route.** It runs through `FieldResolver` and `FieldUse.cast`:
- The caster is a named member who knows the spell and can cast it now: awake, the slot ready, the level within reach.
- The slot is spent as in a fight (`AbilityUse.perform` → `Spellcasting.spend`).
- Each of the band saves as in a fight (`Effects.save`). Immunity holds: undead never sleep.
- What the spell lays on the band lasts as many watches of the world's clock as it would have lasted turns (the rule
  `Items.use` already had for a thrown thing), and wears off as time passes.

**The state.** A sleeping band is *not able* (the engine's `able` fact: no member up and acting), not dead.
- The ordinary fight is not offered against it.
- Killing the sleepers is a separate authored act: `Resolve combat(band)` when `not able(band) and not dead(band)`.
- A save and a reload keep the state.
- A spell that leaves any of the band able rouses them: the author asserts `assails(band, actor)`, and the engine's
  Engagement makes the fight there and then. A band that sleeps comes at the company when it wakes.

**`canCast`** is projected for such a spell (`FieldUse.hostile`: a spell whose every effect lays a condition that takes
its holder out of the fight, asleep or held, on enemies), and for the player's company alone.

**What is adapted**, against the SRD's Sleep:
- level 3, not 1;
- DC 16 + level, not 11 + Intelligence modifier;
- every enemy, not a burst;
- 3 rounds, here 3 watches, not 1 minute a level;
- no 4 Hit Dice limit.

These are the catalogue's (Orsino's) numbers. The proof is the route, not the numbers. A first-level mage cannot cast
it at all, so the undertown's rats cannot yet be slept by a starting mage.

**Not done:**
- The undertown's `_u_rats_slept` still slays rather than invokes (CF-02: converting it moves generated content and its
  job rule, which counts a not-able band as cleared).
- No forecast reads a field cast.
- A damage spell at a band outside a fight is refused (`Unsupported field effect`): its ordinary route is the fight.

### 2. A try limit on a check (CB-05): faithful to the intent

`Resolve check(…) once.` is a try spent whatever comes of it. Spec: `test/small/check-once` (2 cases).
- `WorldConstructs.tried` latches it as a fact of the world, kept in a save: `tried_<action>` over the act's own
  parameters, so a plea made of one keeper may still be made of another.
- A failed or a successful try is not offered again.
- The offer says "· one try": the engine already reads an act that a failure ends.
- The shared rules' checks had grown hand-made latches meanwhile: `haggled`, `haggledItem`, `singsAgain`, `spokenTo`.
  They are left as they are; new authored checks use `once`.

### 3. A party cleric's Raise Dead outside a fight: adapted, its route proved

Spec: `test/small/raise-afield` (2 cases).

**The route.** It is the same as a healing's: `field_spell` → `Resolve invoke` → `FieldUse.perform`.
- A raising of the dead as themselves is now a field technique. Raise Dead and Resurrection qualify. Animate Dead does
  not: its revive carries the undead trait.
- `field_spell` takes a recipient who is awake or slain.
- `treatable` offers only a raising to the dead: a healing does not mend the dead.
- The slot is spent, and the dead come back with the spell's share of their health (Raise Dead 50%).

**What is adapted**, against the SRD:
- no 5,000 gp diamond;
- no level lost;
- level 4 divine, not 5;
- no time limit since death.

Resurrection shares the route (100%); no spec names it apart.

### 4. Plane Shift and planar laws (GT-01..03, 17 November): Plane Shift adapted, its route proved; laws incomplete

Spec: `test/small/planar-laws` (7 cases), a tiny world with the canon (data/imbar) installed (`Tiny.start(…, { canon })`).

**Plane Shift (GT-02).** The kernel's typed `travel` effect is now consumed.
- The catalogue's hand entry (`data/catalog/abilities.json`, replacing Orsino's by its source) is `Travel to plane.`,
  arcane 7, conjuration.
- The canon offers one act (`data/rules/canon.kyr`): "Have {caster} cast Plane Shift to {plane}". It requires canCast,
  and the plane's threshold (`thresholdOf(plane, room)`, asserted in data/imbar for the six inner and twelve outer
  planes). It resolves `invoke(plane_shift, caster, threshold)`: `invoke` now takes a place.
- `FieldUse.shift` spends the slot as in a fight and binds "plane" to the threshold named. `PlaneLaws.carry` reads the
  travel event and sets the caster's company down there (`at`, a world fact like any other).
- `canCast` is projected for such a spell for the player's company alone (`FieldUse.carries`).
- Adapted: no forked rod; the threshold, not a place of the caster's choosing; Imbar has no threshold, so no Plane
  Shift home (a company comes back by a door). In a fight the travel effect ends the fight as an escape, as before.

**Laws (GT-01).** Every inner plane now has a law, and a law's `onTurnEnd` runs in and out of a fight.
- In a fight it runs at the end of each holder's turn (`PlaceLaws.tick`; laws are held `until-removed`, which no tick
  had read). Out of one, it runs on the player's company each watch it stands under the law (`PlaneLaws.watch`).
- Both go through the ordinary damage pipeline, so resistance and immunity hold, and the page tells each harm.
- By plane:
  - the Fire: 1 fire, stopped by fireproof (Fire ward, Resist Fire);
  - the Water: 1 cold, stopped by waterproof, which nothing in the catalogue yet lays;
  - the Negative: 1 necrotic, stopped by protected or darkproof (Protection from Evil, from Darkness);
  - the Positive: heals 1;
  - the Earth (judged): no harm, +1 spell DC;
  - the Air: no harm, its −1 DC as before.
- Adapted, against the SRD: the Water's harm is its cold, not drowning (the engine has no rule for breath). The
  Negative takes health, not levels, and death ward does not stop it. The Positive has no overload. The outer planes
  keep only their spell DC. A plane's own people do not feel its law between fights.

**The census (GT-03, partly).** The spec holds:
- every inner plane has a law;
- the harmful laws' elements are fire, cold and necrotic;
- of those, only cold has no ability that lays its ward;
- one hour on each inner threshold harms, mends or does nothing as its element says;
- a matching ward stops the Negative's and the Water's harm;
- a fight in the Fire burns both sides.

Not done: a law for the Abyss, Nirvana and the Exalted (the canon's three planes beyond Orsino's ten); the integration
case through a generated world and the House of Doors; a forecast of the laws' harm (DangerSense passes no laws).

### 5. Healing and regeneration

As recorded:
- Healing works in and out of a fight (test/effects, test/small/tended).
- Regeneration works in combat only (`src/kind-defenses.ts`).

### 6. The content the proving cases unblocked (16 November, later)

- **CF-02, adapted:** the undertown's rats are slept through case 1's route. "Have {caster} cast Sleep over the rats
  in the run" requires canCast and resolves `invoke`. Doing for the sleepers is a separate act. The job is cleared on
  death, never on sleep. It is not yet met in a generated first hour: no starting mage has a third-level slot.

## What stays unsupported (the catalogue as it stands, 16 November)

**34 of the merged catalogue's 363 abilities** carry `unsupported`. Orsino's file (data/catalog/orsino/abilities.json)
marks 36 of its 340, but hand entries replace two: detonation, and Plane Shift (17 November). Kyr refuses to run the
34, and the compiler says so (`ModuleCompiler.unrun`). By cause:
A spell may have more than one cause.
- **Cascading damage (5):** chain_lightning, bolt, electric_arc, shock_pulse, static_shock. This wants a `chain`
  topology, which proof-slices.md orders after `line`, cone and burst.
- **Statuses Kyr cannot run:** major_insight (4), major_focus (3), invulnerable (2), spellturn (2), disabled (1). These
  are the divinations, wards and turnings: foresight, foretelling, greater_augury, mind_reading, invulnerability,
  spellturning, perfect_turning, disable, and their like. Each wants its status's modifiers defined in Canon.
- **Phantasmal summoning (3):** image, minor_image, weird. This wants an illusory aspect in Summoning.
- **Item creation (2):** create_poison, goodberry. This wants a use effect that makes an item (OB-07's path).
- **Targets Kyr does not take (3):** chaos_hammer (its enemy targets as written), dispel_magic (self, ally or enemy)
  and zephyrwild (self and allies).
- **World magic and transformations:** maze, time_stop, heteraeos, polymorph, shapechange, shadow_form. Proof-slices.md
  says not to implement a world spell as a combat effect, nor a transformation as a bundle of temporary modifiers.

**Beyond the unsupported list,** the generated concordance (srd-fidelity.md) grades spells against the SRD. 17 of the
119 that have an SRD counterpart pass in structure, and 1 (Magic Missile) passes in resolution. The rest run by
Orsino's numbers.

That is the honest state: they run, and they are adapted, not faithful. Moving a spell to the SRD's numbers is a
proof slice of its own (met, explained, generation-measured), not a catalogue edit. None was moved in M22.

## Closing status (17 November)

The SRD migration is closed for M22 at what this record proves and what the list above names. Nothing more is to
be claimed from the catalogue.

- **Proved, by a route and a tiny-world spec:**
  - Sleep at a band outside a fight (case 1);
  - a check's one try (case 2);
  - Raise Dead outside a fight (case 3);
  - Plane Shift, and the inner planes' laws in and out of a fight (case 4);
  - healing in and out of a fight (case 5).
  All are adapted, not faithful: each names its changes.
- **Unsupported:** the 34 above, by cause. None is offered, learned or granted, and the compiler refuses an act that
  names one.
- **Incomplete, by row:**
  - GT-01: the Water drowning, death ward against the Negative, the Positive's overload, the outer planes' traits;
  - GT-03: laws for three planes, the integration case;
  - CB-05: a difficulty that reads a measure (OB-11);
  - regeneration out of a fight.
- **Faithful by the SRD's numbers:** Magic Missile alone (srd-fidelity.md). Moving any other spell is a proof slice
  of its own, outside this record.

