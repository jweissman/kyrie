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

Since (17 November, later): the Abyss (−1), Nirvana (+1) and the Mount of the Exalted (+1) are under laws of their own,
spell DCs as Orsino's nine are (`plane_abyss`, `plane_nirvana`, `plane_exalted`, Kyr's own; their SRD counterparts'
alignment traits have no Westernesse rule); the spec holds every outer plane under a law. Death Ward stops the
Negative's harm (case 8).

Not done: the integration case through a generated world and the House of Doors; a forecast of the laws' harm
(DangerSense passes no laws).

### 5. Healing and regeneration

As recorded:
- Healing works in and out of a fight (test/effects, test/small/tended).
- Regeneration works in combat only (`src/kind-defenses.ts`).

### 6. The content the proving cases unblocked (16 November, later)

- **CF-02, adapted:** the undertown's rats are slept through case 1's route. "Have {caster} cast Sleep over the rats
  in the run" requires canCast and resolves `invoke`. Doing for the sleepers is a separate act. The job is cleared on
  death, never on sleep. It is not yet met in a generated first hour: no starting mage has a third-level slot.

### 7. Cone of Cold, by the SRD's numbers (17 November): adapted, the first elemental slice

Proof-slices.md's step 5 (the simple elemental family), taken from its far end. Cone of Cold is the one of the three
whose level Westernesse already shares with the SRD (fifth), so moving it changes no creation or level-up draw: every
pool of spells a calling draws from holds the same ids at the same levels. Burning Hands (2 → 1) and Fireball (4 → 3)
each move every mage's draws at creation, and are slices of their own. Spec: `test/cone-of-cold` (6 cases).

**The spell** (a hand entry over Orsino's, data/catalog/abilities.json):
- fifth level, arcane, evocation (exact);
- 1d6 cold a casting level, to 15d6 at the fifteenth: `roll(cappedLevel(15), 6)` (exact);
- a cone: the rules' areas (Positions), every place from the caster out to where it is aimed, friend or foe; the
  company's own warrior in the press is caught with the foes there (exact);
- a Reflex save for half, each caught saving on their own (exact);
- the save's difficulty: the SRD's 10 + the spell's level + the casting score's modifier, **and half the casting
  level** (converted). A Westernesse save adds the saver's whole level, where the SRD's base save adds about half of
  it; the half-level keeps a peer's chance to save near the SRD's. A ninth-level caster of 16 sets 22 (the SRD's 18);
  a plane's law moves it (`#bonusSpellDC`). Recorded in the concordance as the row's dc conversion;
- **`#castingScore`**, new in every actor's context (ActorValues): the score a caster casts with, its calling's (a
  mage's Intelligence, a cleric's Wisdom, a bard's Charisma), and Charisma for a calling that casts nothing or a kind
  of no calling, as the SRD's spell-like abilities read it. The handbook says the difficulty in words ("15 + the
  casting score's modifier + half the caster level + the caster's spell bonus").

**The tests:** the dice at casting levels 1, 5, 10, 14, 15, 16 and 20; the difficulty at three casters and under a
law; the area catching friend and foe, each saving at the one difficulty, the fifth-level slot spent once; a failed
save taking the whole and a success half, over six seeds, and a replay alike; a cold ward (waterproof) and a body's
own guard (the unicorn's flat 10) through the ordinary pipeline; the line said as rolled, and the aim naming whom it
would catch as the blow falls on them.

**Adapted, against the SRD:** no spell resistance (Westernesse has none). The world's rule for cold holds as for any
cold harm: a wound of it may leave its holder frozen (a save against 15), which the SRD's spell does not.

**Where it is met.** A mage learns it at the ninth level or after, one choice among the spells of the levels it
reaches (SpellSelection.grown: thirteen arcane spells of the fifth level); a hostile evoker or generalist of the ninth
level or more may prepare it (SpellSelection.prepare: an evoker's fifth-level spells are three, chaos_bolt,
cone_of_cold and disintegrate). No creature, item or authored act names it. In a1 and the six fidelity countries (kite,
thorn, wren, kahitude, mere, ember) as real play begins them, no installed creature knows it: their casters stand at
the third level at most. So it changes no first hour; it is met by a long career, or in a deep place's casters.
**The fidelity census** now grades it in structure, resolution and play identity: 2 spells pass in resolution
(Magic Missile, Cone of Cold) of the 119 with a counterpart.

### 8. Death Ward, what it wards (17 November): adapted

The SRD's Death Ward makes its holder immune to negative energy and to energy drain. Orsino's gave +5 to the death
save and nothing else. Specs: `test/death-ward` (2 cases), `test/small/planar-laws` (the Negative, warded).
- The condition (a hand entry over Orsino's, data/catalog/conditions.json): necrotic harm wholly turned (resistance
  1), `drain` immunity, and Orsino's +5 to the death save kept.
- `drain` is a new save kind (vocabulary.json), so that an immunity can name it: an enervate (a wraith's or a
  vampire's touch) at a warded holder takes no level, and is told as an immunity ("… cannot be drained.").
- So the Negative's law (1 necrotic a turn, a watch) does nothing to the warded (GT-01's "stopped by death ward").
- **Not changed:** the spell. It is still Orsino's second-level divine Death Ward of three turns (the SRD's is fourth
  level, a minute a level), so it wards a fight, not a watch on the Negative's threshold. Moving its level moves
  every cleric of Life's draws at creation: a slice of its own.
- **Where it is met:** a cleric of Life draws it at creation about one time in four (the first second-level pick is
  of Life's four: death_ward, minor_restoration, prayer, resist_fire), and casts it from the third level; hostile
  clerics of Life may prepare it. In a1 and the six fidelity countries as they begin, no installed creature knows it;
  the wraith's energy drain is met in five of the seven (thorn, wren, kahitude, mere, ember: one or two wraiths of the
  third to fifth level, hostile). So a warded company keeps its levels against the drainer it is most likely to meet.

### 9. The line, and Lightning Bolt by the SRD's numbers (17 November, later): adapted

Proof-slices.md: "`line` only after cone and burst are right under the new scaling and DC". Cone of Cold (case 7) was
that proof. Spec: `test/lightning-bolt` (7 cases; with the line taken out of Positions, three fail).

**The shape** (Positions, `Area` now `burst | cone | line`):
- A line runs from where the caster stands, through the one it is aimed at, and on to the far end of the field.
- It strikes that one, and the first who stands in each other place it crosses, on the way and beyond, friend or foe.
  The caster's own place is never struck.
- So it is narrow where a cone is wide:
  - a bolt aimed past the company's warrior into the press strikes the foe aimed at and the first in their rear,
    sparing the warrior and the foe beside it;
  - a bolt aimed over the press, at their archer, strikes whoever stands first in the press, the company's own
    warrior if he is first.
- It is aimed at a foe, not a place: where it runs depends on whom (`Positions.aims` offers every foe it can see; a
  cone or a burst is offered once a place).
- The handbook says it: "the one it is aimed at, and the first in each place its line crosses before and beyond,
  friend or foe". The aim's row names whom it would strike (CombatModel reads `Positions.caught`, as for any area).

**The spell** (a hand entry over Orsino's):
- 1d6 electricity a casting level, to 10d6 at the tenth (exact).
- The line (exact), and a Reflex save for half each (exact).
- The save's difficulty: case 7's conversion, for a third-level spell (converted, named in the concordance).
- **Its level is kept at Orsino's fourth** (structure fails, said so). The SRD's third moves every mage's third-level
  draw at creation: it goes with Burning Hands and Fireball, and their census.
- Gone: Orsino's two foes drawn at random and the paralysis on a second save, which the SRD's bolt has not.
- Omitted: spell resistance; the bolt setting things alight and breaking through what it cannot pass.
- The random draw that Orsino's bolt had exercised in `test/summoning` is kept there, on Orsino's record as a
  fixture: no catalogue spell now draws foes at random and saves them against a second effect.

**Where it is met.**
- A mage of the seventh level or more, as one of the fourth-level spells it may learn.
- A hostile evoker or generalist of that level, which may prepare it.
- The chimera's powers, and the air and storm element variations of elementals.
- The living book, a wonder of the generated works, which teaches it.
- In a1 and the six fidelity countries as they begin, no installed creature knows it. The chimera and the air and
  storm elementals are met in none of them (srd-fidelity.md's encounters).
- So no first hour moves. A creature installed later, deeper in a site, is not in this census.

### 10. The spell levels and the chain: stopped by the census (17 November, later), a decision for the lead

Two slices were asked for next:
- Burning Hands, Fireball and Lightning Bolt at the SRD's levels (1, 3 and 3, from Orsino's 2, 4 and 4);
- the `chain` shape, with the cascading spells.

Both were measured before anything was changed, and both stop here. Each moves the spells of drawn casters, and so
the recorded journeys that hold them. The rule was to stop and write up the decision instead of landing it.

**The census** (scratch: `/var/tmp/kyrie/srd-scratch/pools.ts`, `chain-pool.ts`). Each row is 200 humans of a calling
made at a level through `Content.createCreature`, the ordinary path; their spells drawn by seed, as creation and
generation draw them. The rates are the share knowing each of Burning Hands, Fireball, Lightning Bolt and Magic
Missile; "moved" is the share whose whole list of spells is not what it was.

| Calling, level | Moved | Before (bh / fb / lb / mm) | After (bh / fb / lb / mm) |
|---|---|---|---|
| mage, evoker, 1 | 96 % | .28 / 0 / 0 / .32 | .23 / .22 / .19 / .23 |
| mage, evoker, 3 | 98 % | .30 / 0 / 0 / .39 | .34 / .22 / .19 / .31 |
| mage, evoker, 7 | 100 % | .36 / .03 / .02 / .45 | .39 / .26 / .24 / .39 |
| mage, abjurer, 1 | 74 % | .08 / 0 / 0 / .19 | .09 / 0 / 0 / .12 |
| mage, abjurer, 7 | 100 % | .20 / .03 / .02 / .36 | .29 / .05 / .09 / .30 |
| mage, school drawn, 1 | 77 % | .10 / 0 / 0 / .17 | .14 / .02 / .04 / .15 |
| mage, school drawn, 7 | 100 % | .21 / .03 / .02 / .33 | .34 / .07 / .12 / .34 |
| bard, 1–7 | 0 % | none of the four | none of the four |

- **The SRD's levels.** A first-level evoker would know Fireball one time in five, where none does now. Three mages
  in four or more of every kind come out with other spells. The reason is that creation draws a spell as an index
  into the sorted list of a level's spells (SpellSelection.choose): one spell more or less in a level moves every
  draw after it.
- **The installed casters of a1, kite and thorn** (962 classed creatures as real play begins): none moves. Their
  casters prepare at most second-level spells, of other schools.
- **What moves is the player's own mage**, every hireling and companion drawn at creation, and every spec and
  recorded journey that makes a mage by seed. Examples: mage-play, mage-casts, the obituary and descent journeys with
  a mage, and the veterans company's Maeve (an evoker of the twelfth level, test/what-tessary-owes).
- **The chain.** It is not met in play without a spell, and every spell that would use it enters a draw:
  - shock_pulse, an evocation cantrip, which every evoker knows;
  - static_shock and bolt, the storm domain's cantrip and first level;
  - electric_arc at the third level; chain_lightning at the fifth.
  Chain Lightning alone, made castable, moves 36 % of drawn mages of the ninth level and 77 % of the twelfth (4 % of
  the twelfth then know it). Maeve is one of them.

**The decision** (for the lead, not taken here):
1. **Re-record once.** Land the three levels, or the chain, as one deliberate change: re-record the journeys and
   traces that move, and fight the descents again on CI. It costs a re-record now, and again at every later move of a
   spell's level or support.
2. **Decouple the draw first** (recommended). Creation would rank a pool's options by a hash of the seed and each
   spell's id, and take the first, so a spell added to a pool, or moved out of it, changes only the draws it wins or
   loses. That is one engine change and one re-record. After it, each spell slice moves only the casters who now know
   that spell, and the census measures exactly those.
3. **Keep Orsino's levels** (adapted, said in each entry's notes, as Lightning Bolt does now). The spells run by the
   SRD's numbers but for their level; the structure grade fails, honestly.

Until one is chosen, Burning Hands and Fireball keep Orsino's numbers, Lightning Bolt its fourth level, and the five
cascading spells stay unsupported. **Chosen (the lead, 17 November): option 2**, built as case 11.

### 11. The spell draw by rank (17 November, later): the lead's option 2, built

**The change.** A drawn caster's spells are now the least of their options, ranked by a hash of its spells stream's
seed and each spell's id (`SpellSelection.ranked`, used by TraitGrants for every chosen, grown and prepared draw).
The old draw was an index into a level's sorted list. A spell's rank is the same whatever else is offered beside it.
So a spell added to a level, or moved out of it, changes only the casters who gain or lose it, and each of them by
that one spell. Spells a player or an author chooses are untouched. The spells stream is a caster's own (Content's
`spells` stream), so nothing else it draws moves.

**Spec:** `test/spell-draw` (4 cases; put back the old draw and three fail). A dummy spell is added at a level, and
every caster made again for evokers, drawn-school mages and Life clerics. Each caster that moved gained the dummy and
lost at most one spell; the rest are as they were.

**The census** (`/var/tmp/kyrie/srd-scratch/dummy.ts`: 200 humans for each calling and level, before and after a
dummy first-level evocation):

| Calling, level | Old draw: moved | Old draw: gained it | New draw: moved | New draw: gained it |
|---|---|---|---|---|
| mage, evoker, 1 | 78.5 % | 26.5 % | 24.5 % | 24.5 % |
| mage, evoker, 7 | 95.5 % | 39.5 % | 29 % | 29 % |
| mage, abjurer, 1 | 68 % | 15 % | 18 % | 18 % |
| mage, school drawn, 3 | 79.5 % | 25 % | 23.5 % | 23.5 % |
| mage, school drawn, 7 | 94.5 % | 32 % | 25.5 % | 25.5 % |

**What moved once, and was re-recorded.** The new draw gives every drawn caster other spells once. The full suite,
the long descents and the browser specs were run on the branch `srd-draw` (CI 44109308782):
- **the long descents:** passed, nothing re-recorded;
- **`test/fixtures/traces/wren-tower-climbed.transcript.json`:** its digests (`scripts/redigest-trace`). The same three
  commands come to the same place, watch and words; the drawn world's casters hold other spells.
- **`test/tend-here`:** the cleric Dori's drawn spells now hold Cure Light Wounds, so Tend offers it before Cure Minor
  Wounds.
- **`test/march-journey`:** the Serewater fellowship's cleric knows Smite from the first. At the second level he learns
  Bless instead; the rest of the march plays as before.
- **`test/bound-howe`:** "the camp that can be fought" is now fought by the company of four at the fifth level. At the
  fourth, its drawn cleric without Entangle and Confuse, the crew downs all four; at the fifth the foreman falls and no
  one is downed.
- **`test/bound-howe-week-people`:** the pay-chest case has the crew suffer the company while it talks to the boy. The
  territorial hands had come at a company that lingered, and the case had passed only because that company won the
  fight its draw gave it. The fight is test/bound-howe's case.
- **`test/skeel-browser`:** the walk waits at the Slip until the page offers a walk over the sands (low water, when
  the dog quarters them), at most twelve times, instead of six fixed waits. Arriving on the open Strand the page now
  led with the map: the walk comes back to the place (`back-to-place`) before reading it, and the dog is there. Run in
  the browser locally, alone: pass. Played headless, the same walk had met the dog with both draws.
- **The balance shift** in the Bound Howe's camp is its own row: CB-27.

### 12. Burning Hands, Fireball and Lightning Bolt at the SRD's levels (17 November, later): adapted

Proof-slices.md step 5's rest, made a slice of its own by the draw by rank (case 11). Spec:
`test/burning-hands-fireball` (6 cases).

**The spells** (hand entries over Orsino's, data/catalog/abilities.json):
- **Burning Hands:** first level (Orsino's second), 1d4 fire a casting level to 5d4 at the fifth (exact), a cone
  (exact), a Reflex save for half at case 7's difficulty for a first-level spell (converted). Before: 2d6 on every
  foe, no save.
- **Fireball:** third level (Orsino's fourth), 1d6 fire a casting level to 10d6 at the tenth (exact), a burst
  (exact), a Reflex save for half at case 7's difficulty (converted). Before: 6d6, a magic save against 15.
- **Lightning Bolt** goes to the SRD's third level beside it (case 9 had kept Orsino's fourth), so its structure now
  passes.
- Omitted for each: spell resistance; setting things alight; Fireball's range and the bead's flight.

**The tests:** the dice at casting levels 1, 4, 5, 6, 10 and 20 (Burning Hands) and 1, 5, 9, 10, 11 and 20
(Fireball); the difficulty at a seventh-level caster of 16 (17 and 19); the levels and the evoker's pools; aimed into
the press, each catches the company's own warrior with the two foes there, each saving by Reflex, the one slot spent;
a failed save the whole and a success half, over six seeds, and a replay alike; a fire ward (fireproof) through the
ordinary pipeline; the line said as rolled, and the aim's catch (Positions.caught) the very ones burned.
`test/area-positions` now casts its fireball from a third-level slot, and its saves are Reflex.

**The census** (scratch: the lead's `pools.ts`, 200 humans for each calling and level, before and after):

| Calling, level | Moved | Before (bh / fb / lb / mm) | After (bh / fb / lb / mm) |
|---|---|---|---|
| mage, evoker, 1 | 65 % | .33 / 0 / 0 / .27 | .27 / .21 / .21 / .23 |
| mage, evoker, 7 | 64 % | .35 / .12 / .05 / .36 | .32 / .26 / .24 / .34 |
| mage, abjurer, 1 | 17 % | .07 / 0 / 0 / .14 | .15 / 0 / 0 / .13 |
| mage, abjurer, 7 | 28.5 % | .23 / .11 / .05 / .29 | .27 / .16 / .10 / .27 |
| mage, school drawn, 1 | 26 % | .09 / 0 / 0 / .17 | .17 / .04 / .04 / .14 |
| mage, school drawn, 7 | 33.5 % | .23 / .11 / .05 / .30 | .28 / .18 / .13 / .29 |
| bard, cleric, 1–7 | 0 % | none of the four | none of the four |

- Every caster who moved held or now holds one of the three, or a spell displaced from a level one of them left or
  joined. A first-level evoker now knows Fireball one time in five; it casts it from the fifth level, when its first
  third-level slot comes.
- **The installed casters** of a1 and the six fidelity countries as real play begins them (2,232 classed creatures):
  one moves, kahitude's s5 traveller. No first hour moves.

**Where they are met.** Burning Hands: a mage of the first level who draws it, and from the first level a hostile
evoker or generalist who prepares it. Fireball and Lightning Bolt: a mage from the fifth level (no longer the
seventh), and hostile casters of that level. The handbook's spell chapter now has Fireball reachable at the third
spell level (test/handbook names ice_storm for an unreachable one instead).

### 13. The calling kits (17 November, later): proof-slices.md step 7

Spec: `test/small/calling-kits` (3 cases). Before, `Overlays.classGear` kept only the kit kinds the item catalog had,
so the ranger's rations and the monk's alms bowl were dropped without a word.
- **Validation:** a calling's `startingGear` names items the catalog has, or the canon refuses to load ("carries
  unknown item", CanonValidation.classes).
- **The first inventory** of all seven callings, made by `Content.createCreature` on two seeds, is exactly its kit and
  the road's candle; arms and armour are drawn from the calling's own tables.
- **`alms_bowl`:** Orsino's monk starts with one that Orsino's item tables never define. Decided as Kyr's own plain
  gear (data/catalog/items/gear.json, `kyr: true`, worth 1): the monk owns it and may sell it; it has no use. Not sold
  anywhere, not in a loot table.
- **`rations`:** Orsino's is a consumable that heals 1d4. Kyr's rations are already the company's counted good
  (`Entity rations: good`, data/rules/core.kyr): a meal a day is eaten from them (needs.kyr), a rest wants one
  (care.kyr), inns sell them, and every company sets out with two. An item of the same name collides with the good
  (a region refuses a duplicate entity). So the ranger's kit names none apart, its class notes say why, and the
  ledger's `gear:rations` is `represented`, its healing not kept.
- **Not imported:** class gold, consumable proficiency (each its own decision, as step 7 says).
- **Generation:** no shop or loot table draws either kind; only the monk's inventory gains the bowl.

### 14. Sleep by the SRD's numbers, and a pool of Hit Dice (17 November, later): adapted

The SRD's Sleep is the first-level spell CF-02 waited on: at Orsino's third level no starting mage cast it, so the
undertown's rats could not be slept in a first hour. Spec: `test/sleep` (6 cases); `test/small/sleep-band` follows it.

**The mechanic built: a pool of Hit Dice** (`HitDicePool`, src/rules/hit-dice-pool.ts; an effect's `hitDice`).
- Of those an effect would fall on, the fewest Hit Dice first, in the fight's order among equals, as many as the pool
  holds. It stops at the first it cannot hold, so none of more than the pool is touched. A Kyr creature's Hit Dice are
  its level.
- Whoever is proof against the effect's save (the undead against sleep) takes nothing from the pool, and still saves,
  immune, as before.
- The fight offers such an ability only where it would hold someone (`HitDicePool.aims`, read by Battle's legal
  commands): never at a place where all are of five Hit Dice or more.
- The aim's row names only those it would hold (CombatModel reads the same pool).

**The spell** (a hand entry over Orsino's, data/catalog/abilities.json):
- first level, arcane, enchantment (exact);
- a burst (the rules' areas), everyone in the place it falls on, friend or foe (exact);
- four Hit Dice of them, fewest first, none of five or more (exact, by the pool);
- a Will save to negate: the sleep save, made with Wisdom, which immunities read (exact);
- the difficulty: case 7's conversion, 11 + the casting score's modifier + half the casting level (converted);
- **the duration: ten rounds, a minute, at every casting level** (converted: Kyr's durations do not grow with the
  caster; the SRD's is a minute a level). Outside a fight that is ten watches, by FieldUse's rule of as many watches as
  turns, where the SRD's minute is less than one: recorded as open below.

**The condition** (a hand entry over Orsino's asleep, data/catalog/conditions.json): a blow that wounds a sleeper and
leaves them standing wakes them (its `onAttacked` hook), as the SRD's does. Every other source of asleep (traps, a
pixie's or a sprite's Sleep) wakes the same way.

**The tests:** the level, the burst and the pool; the difficulty at three casters; the foes' four held before the
company's third-level warrior, and a first-level warrior held before a second-level foe; nothing offered against five
Hit Dice or more; a zombie in the place saving immune and taking nothing from the four; whoever fails asleep and
whoever saves awake over six seeds, and a sleeper wounded and standing woken; the aim's catch the pool's.
`test/small/sleep-band` casts it at the run's rats on the seed 'lull' (all three fail the SRD's lower difficulty;
on its first seed two of three saved), with the enchanter's spells by level (Sleep now first), and waits two hours for
them to wake (ten watches).

**Omitted:** spell resistance; the sleeper helpless (a blow at one is an ordinary blow); the nearest first among equal
Hit Dice (the fight's order); waking by a slap or a noise.

**Where it is met.** A first-level mage who draws it (enchanters and drawn-school mages), and every caster of the
first level or more who prepares it: the undertown's rats can now be slept by a starting mage who knows it (CF-02's
"not played in a generated first hour"). Innate casters (dryad, nymph, pixie, satyr, sprite, discerner, mind
destroyer, mouther, ooze) now cast a burst of four Hit Dice: a party of the fifth level or more is proof against it,
and a creature's innate spell rests twice its level in turns, so a first-level Sleep comes back after two turns
where the third-level one took six. The census is below.

**The census** (200 humans for each calling and level, before and after; rates of Sleep / Charm / Magic Missile):

| Calling, level | Moved | Before | After |
|---|---|---|---|
| mage, enchanter, 1 | 100 % | 1.00 / 1.00 / .12 | .49 / .52 / .12 |
| mage, enchanter, 7 | 99 % | 1.00 / 1.00 / .27 | .52 / .54 / .27 |
| mage, evoker, 1 | 10.5 % | 0 / .14 / .23 | .10 / .13 / .23 |
| mage, evoker, 7 | 19 % | .17 / .24 / .34 | .23 / .21 / .33 |
| mage, school drawn, 1 | 22.5 % | .14 / .24 / .14 | .17 / .16 / .13 |
| mage, school drawn, 7 | 27.5 % | .29 / .33 / .29 | .27 / .23 / .28 |
| bard, 1–7 | 0 % | 0 / 1.00 / 0 | 0 / 1.00 / 0 |

- An enchanter had known Sleep always, as the one third-level enchantment, castable from the fifth level; it now
  draws it or Charm at the first level, about one in two each, castable at once.
- **The installed casters** of a1 and the six fidelity countries (2,232 classed creatures): six move, each gaining
  Sleep and losing nothing. Among them a1's and wren's first-town undertown necromancer (the man with the black
  candle, `s1_u_raiser`), a hostile caster of the first hour: in a fight he may now lay four Hit Dice of the company
  asleep, and a blow wakes them. The others: a1's s1_iv and the Bound Howe's scholar, thorn's arcology quill and
  fellowship warden.


### 15. The chain, and Chain Lightning by the SRD's numbers (17 November, later): adapted

Proof-slices.md orders `chain` after the line (case 9). Orsino's five cascading spells had no effect Kyr could run;
the SRD's Chain Lightning is the one of them with a counterpart. Spec: `test/chain-lightning` (4 cases; with the chain
taken out, the first is struck alone and two fail).

**The mechanic built: a chain** (an effect's `chain: { count, ratio }`, src/rules/chain.ts).
- A harm aimed at one foe strikes them, then leaps to as many other living foes as its count says, each struck once,
  in the fight's order, never a friend. The SRD's caster chooses the secondary targets; the order chooses here.
- Each leap takes its share (the SRD's half) of what the first was dealt before its save, rounded down. Each struck
  saves on their own.
- It is not an area: nobody it does not name is caught, and it is aimed at a foe as any single-target spell is.
- The handbook says it ("leaping from them to 1 per caster level, to 20 other foes, each struck once, each taking
  half what the first took"). The census grades its target `chain` against the SRD's "one primary target, plus one
  secondary target/level" (SpellResolution).

**The spell** (a hand entry over Orsino's, data/catalog/abilities.json):
- sixth level (Orsino's fifth), arcane, evocation (exact);
- 1d6 electricity a casting level to 20d6 at the twentieth on the first (exact);
- a leap a casting level, to twenty, each half the first's (exact, by the chain);
- a Reflex save for half by each, at case 7's difficulty for a sixth-level spell (converted).

Omitted: spell resistance; the secondary targets within 30 feet of the first (Kyr's field has no distances).

**The census** (200 humans for each calling and level, before and after; Chain Lightning's rate):

| Calling, level | Moved | After |
|---|---|---|
| mage, evoker, 9 | 0 % | 0 (no sixth-level slot) |
| mage, evoker, 11 | 5.5 % | .06 |
| mage, evoker, 12 | 11 % | .11 |
| mage, evoker, 15 | 15.5 % | .15 |
| mage, school drawn, 11 / 12 / 15 | 5.5 / 11 / 15 % | .06 / .11 / .15 |
| mage, abjurer, 11 / 12 / 15 | 5.5 / 10.5 / 15 % | .06 / .10 / .15 |

Every caster who moved is one who gained it, and nobody lost another spell for it (the draw by rank, case 11). Of
2,232 installed classed creatures in a1 and the six countries, none knows it.

**Where it is met.** A mage of the eleventh level or more, as one of the sixth-level spells it may learn, and a
hostile evoker or generalist of that level who prepares it. No first hour moves; a long career, or a deep place's
casters.

**What stays unsupported of the cascading five:** bolt, electric_arc, shock_pulse and static_shock, Orsino's own,
with no SRD counterpart. Orsino's cascade jumps at random and halves again at each jump; the chain could run them
by a ratio of its own, but each would enter a draw (shock_pulse is an evocation cantrip every evoker knows): a slice
of its own, for Orsino's numbers.

### 16. The cure family by the SRD's numbers (17 November, later): adapted

The commonest spell of a first hour, a companion cleric's Cure Light Wounds, had healed 1d8 at every level. Spec:
`test/cure-wounds` (2 cases; with Orsino's dice put back, a fifth-level cleric heals what a first-level one does and
the second fails).

**The spells** (hand entries over Orsino's, data/catalog/abilities.json), each on one ally:
- Cure Light Wounds: 1d8 and a point a casting level, to +5 (exact); the SRD's first level (exact);
- Cure Moderate Wounds: 2d8, to +10; Serious: 3d8, to +15; Critical: 4d8, to +20 (exact);
- each the SRD's school, conjuration, beside its domain, Life (exact);
- the SRD's save is "Will half (harmless)": the living make none, and the save is an undead's against a cure's harm,
  which Kyr's cure does not do (converted, said in the concordance).

**Kept:** Orsino's levels for Moderate (3; the SRD's 2), Serious (4; 3) and Critical (6; 4). Structure fails for
the three, said. The preset companions' spells are chosen by level (data/rules' fellows, world-assembler's preset
cleric: cure, bless, anoint, prayer, minor restoration, cure moderate): moving Moderate to the second level breaks
the choice, and moves the companion every recorded journey plays with. A slice of its own.

**Omitted:** the harm a cure does the undead (the SRD's touch attack, Will half), spell resistance.

**The census.** No draw moves: no level changed. What moves is every healing by these spells: a first-level cleric's
Cure Light Wounds heals one more, a fifth-level's five more (test/cure-wounds: the same die, the difference exactly
the casting level to the cap). Every companion cleric, every hostile healer and the Tend lens heal more.

**The extraction it needed.** The SRD's pages for Moderate, Serious and Critical say they function like Cure Light
Wounds and name no header of their own; the census had read them as lasting "long" with no save. SrdPages.inherit
now gives such a page the header of the spell it names (107 of 605 records), a commit of its own before this one.

### 17. Bless on the whole company (17 November, later): adapted

Spec: `test/bless` (2 cases; with Orsino's one ally put back, the first fails).
- The caster and every ally (Kyr's `party`), where Orsino's blessed one ally: the SRD's "the caster and all allies
  within a 50-ft. burst" (converted: Kyr's field has no distances, so the whole company).
- First level, Life, and the SRD's school, enchantment, beside its domain (exact).
- A minute, ten rounds, at every casting level (converted, as Sleep's in case 14; the SRD's is a minute a level).
- **Kept:** Orsino's blessed, +1 to hit and +1 damage, which Divine Favor and Neptune's Blessing lay too. The SRD's
  +1 to saves against fear, and no damage, would change those two; a slice of the condition's own.
- **Where it is met:** a Life cleric draws it at creation as one of its first-level spells, and every hostile Life
  cleric may prepare it; the preset companion cleric knows it (world-assembler's spells). No draw moves (no level
  changed); every Bless cast now blesses the whole side for ten rounds.

### 18. Hold Person, and a hold shaken off (17 November, later): adapted

Spec: `test/hold-person` (2 cases; with the new save taken out, the second fails).

**The mechanic built: shaking off** (src/rules/shaking-off.ts; a save's `again`, a condition's kept `again`).
- A condition laid by a save marked `again` keeps that save's kind and difficulty on its holder.
- On each turn its holder loses to it, the holder saves again; a success ends it (told as it ending), and the turn is
  spent on the effort, as the SRD's full-round save is.

**The spell** (a hand entry over Orsino's):
- one humanoid (exact), second level, Law, and the SRD's school, enchantment (exact);
- a Will save to negate (exact), at case 7's difficulty for a second-level spell (converted), and again each turn;
- five rounds, a fifth-level caster's, at every casting level (the census's caster; the SRD's is a round a level).

Before: Orsino's three rounds against 20 + the caster's level, saved with Strength, once. A held company member now
has a fair save, and another each turn: a hostile Law cleric's hold is no longer three lost turns almost surely.
**Dropped:** the paralysis immunities (air affinity, illusory) no longer stop it: it is a Will save, as the SRD's
mind-affecting hold is. **Omitted:** spell resistance; the held helpless. No draw moves (no level changed).


### 19. Shield of Faith by the SRD's numbers (18 November): adapted

Spec: `test/shield-of-faith` (2 cases; with Orsino's entry put back, it is a second-level spell laying its shielded,
and both fail).

**The spell** (a hand entry over Orsino's, data/catalog/abilities.json):
- first level (Orsino's second), divine, Law, and the SRD's school, abjuration, beside its domain (exact);
- on the caster or one ally, never a foe (Kyr's `ally`: the SRD's creature touched; exact);
- two harder to hit (a new condition, `shield_of_faith`, `ac -2`), added to worn armour as the SRD's deflection is:
  Kyr's armour class adds every condition's `ac` to the body armour's (exact);
- **+2 at every casting level** (converted: the SRD's grows a point each six levels, to +5 at the eighteenth; Kyr's
  conditions do not grow with the caster, as case 14's durations do not);
- a minute, ten rounds, at every casting level (converted, as Bless's in case 17);
- its save the SRD's harmless one (converted: none is made by whoever takes it willingly).

**Dropped:** Orsino's shielded (one harder to hit, ten hit points more, +1 against magic) is no longer what Shield of
Faith lays; Orsino's abyssal shield still lays it. No new modifier: the condition is the existing `ac`.

**The census** (200 humans for each calling and level, before and after; Shield of Faith's rate):

| Calling, level | Moved | Before | After |
|---|---|---|---|
| cleric, oathkeeper (Law), 1 | 75.5 % | .56 | .59 |
| cleric, oathkeeper, 7 | 75.5 % | .58 | .60 |
| cleric, vitalist, 1 / 7 | 17 / 16 % | .07 / .23 | .15 / .28 |
| cleric, domain drawn, 1 / 7 | 21.5 / 16.5 % | .10 / .24 | .18 / .28 |
| cleric, the other ten domains, 1–7 | 12.5–25.5 % | .07–.23 | .14–.29 |
| mage, bard, every level | 0 % | 0 | 0 |

- An oathkeeper's first pick of its domain is now Shield of Faith or Protection from Evil, one in two each, where
  Shield of Faith had been one of its two second-level Law spells beside Hold Person (so its second-level Law pick is
  now always Hold Person): three in four oathkeepers move, a few more of them knowing it.
- Every other cleric may draw it among its open first-level picks, where it had been a second-level pick: each who
  moved gained or lost it, or a spell it displaced. A cleric who knew it could cast it from the third level; now from
  the first.
- **The creation cards** (FirstSpells.picks, what a player is shown): the oathkeeper's first-level picks now open
  with Shield of Faith, in Rejuvenate's place, and Healing Touch takes its second-level place; the deathspeaker's and the stormcaller's gain it
  in place of Barkskin and Anoint. The vitalist's, the first cleric way, does not move.
- **The installed casters** of a1 and the six fidelity countries (2,232 classed creatures): six move, each gaining
  Shield of Faith and losing nothing: a1's and wren's s1 Anselm, kite's and thorn's fellowship heir, thorn's keep
  chaplain and wren's fellowship head.

**Where it is met.** A first-level cleric who draws it (an oathkeeper one in two), the oathkeeper, deathspeaker and
stormcaller creation cards, and every Law cleric of the first level or more who prepares it. A hostile cleric's
companions are two harder to hit for ten rounds.

**Omitted:** spell resistance (harmless); its growth with the casting level (above).


### 20. Cause Fear, and a partial save (18 November): adapted

Spec: `test/cause-fear` (2 cases; with the lesser hold taken out, whoever saves is not afraid and both fail; with
Orsino's entry put back, its level and its aim fail).

**The mechanic built: a partial save** (a save's `lesser`: src/rules/save-outcome.ts, laid by
AbilityUse.effectOn).
- A save marked `lesser` still lays what it lays on whoever succeeds, for that many rounds: the SRD's "Will partial",
  where a success leaves a lesser effect, not none.
- Never on whoever is proof against the save (immune: nothing is laid, as before).
- Validated: only on an apply, a whole number of rounds below its own duration. The handbook says it ("a Wisdom save
  against 14 shortens it to a round"); the census reads it as the SRD's partial, a save that negates the most of it.

**The spell** (a hand entry over Orsino's Terror, data/catalog/abilities.json):
- first level (Orsino's second), divine, Death, and the SRD's school, necromancy (exact);
- one foe of five Hit Dice or fewer (exact, by case 14's pool of Hit Dice: five on one): it is not offered at a foe of
  six or more;
- a save against fear (made with Wisdom, the SRD's Will) at case 7's difficulty for a first-level spell, 14 at a first-
  level caster of Wisdom 16 (exact there);
- whoever fails is afraid three rounds, whoever saves one (converted: the SRD's 1d4, its mean rounded up, and its one
  round; Kyr's durations are not rolled).

**Kept:** Orsino's fear (Frightened: −2 to hit, −2 to every save, −1 to every roll, slower), the same for the failed
and the saved. The SRD's frightened flees and its shaken does not; Kyr's afraid never flee, and their penalties are
near the shaken's (−2 to attacks and saves). **Omitted:** the living only (Kyr's undead are not proof against fear,
Orsino's undead nature), and spell resistance.

**The census** (200 humans for each calling and level, before and after; Cause Fear's rate):

| Calling, level | Moved | Before | After |
|---|---|---|---|
| cleric, deathspeaker (Death), 1 / 7 | 60.5 / 60 % | .43 / .46 | .45 / .46 |
| cleric, vitalist, 1 / 7 | 10.5 / 9.5 % | .06 / .14 | .10 / .17 |
| cleric, domain drawn, 1 / 7 | 12.5 / 11 % | .07 / .15 | .12 / .17 |
| cleric, the other ten domains, 1–7 | 8.5–15.5 % | .04–.15 | .09–.17 |
| mage, bard, every level | 0 % | 0 | 0 |

- A deathspeaker's first pick of its domain is now Dark Bolt or Cause Fear, and its second-level Death pick always
  Life Drain: three in five move, about as many knowing it. Every other cleric may draw it among its first-level
  picks: each who moved gained or lost it, or a spell it displaced.
- **The creation cards:** the deathspeaker's now has Cause Fear at the first level (Barkskin, and case 19's Shield of
  Faith, give way to it) and Protection from Darkness at the second. No other card moves; the vitalist's does not.
- **The installed casters** of a1 and the six countries (2,232 classed creatures): six gain it and none lose (a1's
  s2 preacher, wren's and ember's keep chaplain, kahitude's and ember's s1 Anselm, ember's fellowship recorder). No
  installed creature of those worlds knows it by its kind.
- **Innate:** the balor, discerner, fiend, ifrit, marilith, mind destroyer, mouther and ooze cast it by their
  kind. Now a first-level spell, it rests two of their turns where it rested four, and it cannot be aimed at a foe of
  six Hit Dice or more. None is placed in a1; the ooze is met in two of the six countries' 543 den groups.

**Where it is met.** A first-level cleric who draws it (a deathspeaker more than one in two), the deathspeaker
creation card, and every Death cleric of the first level who prepares it; a hostile cleric's dread now falls only
on a company member of the fifth level or below, and a member who masters it is afraid one round.


### 21. Remove Fear by the SRD's numbers (18 November): adapted

Spec: `test/remove-fear` (2 cases; with Orsino's entry put back, the fear ends and nothing follows, and the second
fails).

**The spell** (a hand entry over Orsino's, data/catalog/abilities.json), on the caster or one ally, never a foe:
- first level, divine, Life, and the SRD's school, abjuration, beside its domain (exact);
- any fear on them ends (converted: the SRD's is suppressed for the spell's ten minutes, then returns if it is still
  running; Kyr's fear lasts a few rounds, so ending it is the same in play);
- then +4 against fear for ten minutes, a hundred rounds (a new condition, `heartened`: `saves: { fear: 4 }`, the
  existing save bonus, read by every fear save), ending with the fight as every condition of a fight does;
- its save the SRD's harmless one (converted).

**Omitted:** the SRD's one more subject each four casting levels (Kyr aims a spell at one ally or at the whole
company; a count of allies would be a target form of its own). Spell resistance (harmless).

**The census.** No draw moves: no level, domain or tradition changed (the school is read for arcane draws alone), and
the creation cards are the same (FirstSpells.picks, every way). What moves is every casting: the warded ally now also
saves 4 better against fear for the rest of the fight. A vitalist knows it a little under one in four (.23 at the
first level, .27 at the seventh), a cleric of a drawn domain .14 and .21; it is the vitalist creation card's, the first
cleric way's, so a player's first cleric knows it. Of 2,232 installed classed creatures, five know it (a1's w8 head and
fellowship keeper, kite's walk Wenna, thorn's fellowship keeper, wren's fellowship warden), as before. The tactics
weigh it a little higher where nobody is afraid (a condition the ally lacks, six, less its slot), still below a blow.


### 22. Mage Armor: stopped by the census, a decision for the lead (18 November)

Not migrated: it moves the first hour. The SRD's Mage Armor is a first-level conjuration on the creature touched, a +4
armour bonus of force (an armour bonus: it does not add to worn armour) for an hour a level, its save harmless.
Orsino's (`armor`) is an abjuration on the caster alone, four harder to hit (added to worn armour) and **twenty
temporary hit points**, for twenty rounds.

**What it would take:** a hand entry (the caster or one ally, Kyr's `ally`); a hand condition over Orsino's
`mage_armored` (it lays nothing else); and one small mechanic, an armour of force (a modifier read by
Fighting.armorClass as body armour of that much where it is better than what is worn, never added to it; the
character sheet and the forecasts read the same function). No temporary hit points.

**What it moves:**
- **The first mage way.** The abjurer is the first mage specialization, and its creation card's picks are Arcane
  Ward, Mage Armor and Magic Missile. A first-level abjurer has 4 to 7 hit points of its own (median 5, 200 seeds):
  Orsino's twenty temporary hit points are four times that, and the SRD's armour has none. Every first-hour fight a
  player's first mage casts it in moves.
- **The owner's pin of 15 November** (test/small/mage-casts, the P0 "could not cast Mage Armor on itself"): Mage Armor
  offered on the mage alone, "nothing to choose" (`armor>`), becomes two aims, the mage or its companion.
- **The school,** if the SRD's is taken: abjurers 43–44 % move (their first pick of the school becomes always Arcane
  Ward: Mage Armor .47 → .10), conjurers 22.5–26 % (.10 → .30), drawn-school mages 9–10 %; no other specialist. The
  abjurer's creation card loses Mage Armor (Hex takes its place, and Paralyzing Touch takes Slow's) and the
  conjurer's gains it (Blur gives way). Of 2,232
  installed classed creatures, eight move: a1's s3 traveller and ember's Bound Howe scholar lose it, six conjurers
  (a1's arcology quill among them) gain it.

**The options:**
1. **The SRD's whole:** conjuration, the caster or one ally, the armour of force, no temporary hit points. Moves all
   of the above.
2. **The SRD's resolution, Orsino's school kept** (abjuration; structure fails, said, as the cure family's levels in
   case 16): the caster or one ally, the armour of force, no temporary hit points. No draw or card moves; the pin's
   aim and the first mage's twenty hit points do.
3. **As 2, keeping Orsino's twenty temporary hit points** as Kyr's own adaptation for a first-level mage's frailty,
   said as a difference (the census does not grade temporary hit points, so it would read as a pass it is not).
4. **Orsino's, as it stands.**

Recommended: 2, after measuring the a1 first hour's fights (the rats, the undertown) with a first-level abjurer
before and after, so that the first mage's survival is a number before it is a change.


**The lead's decision (18 November):** Orsino's Mage Armor is kept for now, said so in the fidelity ledger. It is the
first mage way's card spell, and the elf mage is the golden route's alternate character (current-sprint.md), cold-played
in Sprint 1 (S1-4): its twenty temporary hit points against a first-level abjurer's four to seven would move that first
hour mid-sprint. Taken up again after S1-4, by the recommended option (the SRD's resolution, Orsino's school), measured
on a1's first-hour fights first.

### 23. Divine Favor: stopped by the census, a decision for the lead (18 November)

Not migrated: it moves every installed divine caster. The SRD's Divine Favor is a first-level evocation on the caster,
+1 luck to hit and to damage each three casting levels (to +3) for a minute. Orsino's (`divine_favor`) is a War
**cantrip**, Orsino's blessed (+1 to hit and damage) and keen (+2 to hit and damage, a telling blow on 18 or more) on
the caster for three rounds.

**What it would take:** a hand entry alone: Orsino's blessed is the SRD's +1 already (case 17), for ten rounds on the
caster; +1 at every casting level converted (the SRD's to the fifth), as case 19's Shield of Faith is.

**What it moves** (the census at the SRD's first level):
- **Warbringers** 100 %: every one knew it as a cantrip; now about one in two draws it (.51) and one in two Smite
  (1.00 → .53), their two first-level War spells.
- **Every other cleric** 11–23.5 % (drawn domains 21.5–29.5 %), each gaining it among their open first-level picks.
- **The creation cards:** the warbringer's, the deathspeaker's and the stormcaller's gain it (Shadow Cloak, Barkskin
  and Anoint give way, measured before cases 19 and 20).
- **The installed casters:** 48 of 2,232 classed creatures lose it and none gain it, for an installed caster
  prepares its spells, every cantrip of its tradition among them (SpellSelection.prepare). Seven are a1's: the s1 Anselm, the s2 preacher, the w8 head, the
  keep's chaplain, the tower's necromancer and the fellowship's keeper and head.

**The options:**
1. **The SRD's whole:** first level, blessed alone, ten rounds. Moves all of the above.
2. **The SRD's resolution, Orsino's cantrip kept** (level 0; structure fails, said): blessed alone, ten rounds. No draw
   moves; every divine caster's cantrip loses keen's +2 and its wider telling blow and lasts ten rounds, not three, so
   the 48 installed casters' fights move wherever they cast it (the tactics weigh a condition laid on oneself at six,
   below a blow, so they seldom do; not measured).
3. **Orsino's, as it stands.**

No recommendation: option 1 is the SRD's and its draw by rank moves only gainers and losers, but the 48 losers are
the installed divine casters of every country, seven of a1's among them; the lead's call, as case 10's was.


**The lead's decision (18 November):** Orsino's level is kept, and said so. At the SRD's first level 48 installed
divine casters would lose it and none gain it, seven of them in a1's first hour, for a level number the player does not
meet: the rule of the proof slices (a row only where its behaviour is met) is not served by the move. Its resolution may
be taken up on its own, at Orsino's level, as Cure Wounds' levels were kept (case 16).

### 24. Calm Emotions by the SRD's numbers (18 November): adapted

Orsino's Calm Emotions laid its calm on every foe: immune to fear and madness, +1 to hit and +2 to Will saves, a boon
to those it was cast at. Spec: `test/calm-emotions` (2 cases; with Orsino's entry put back, both fail).

**The spell** (a hand entry over Orsino's, data/catalog/abilities.json):
- second level, divine, Nature, and the SRD's school, enchantment, beside its domain (exact);
- a burst (the ability's own `area`): everyone in the place it falls on but the caster, friend or foe (exact);
- a Will save to negate (exact), at case 7's difficulty for a second-level spell (converted: 16 at a third-level caster
  of Wisdom 16);
- whoever fails is calmed (a new condition, `calmed`: `noActions`, and the asleep condition's `onAttacked` hook, so
  any harm or blow from another breaks it): it does nothing until then;
- three rounds, the census's caster's (the third level), at every casting level (converted: the SRD's lasts while its
  caster concentrates, up to a round a level; Kyr's casters do not concentrate).

**Converted:** the SRD's calmed creature may defend itself and do what is not violent; Kyr's does nothing, as a
sleeper does (Kyr's fight has no turn between a blow and none). **Omitted:** a blow on one calmed creature breaking
the calm on all of them; the fear, confusion and morale bonuses it suppresses; the undead's and constructs' proof
against the mind (its save is Will, as Hold Person's in case 18); spell resistance.

**The census.** No draw moves: no level, domain or tradition changed, and the creation cards are the same (the
wildcaller's has it at the second level, castable from the third). A wildcaller knows it one in three (.33 at the
first level, .34 at the seventh), a vitalist .04 and .12, a cleric of a drawn domain .08 and .15. Of 2,232 installed
classed creatures one knows it (thorn's tower necromancer), as before; no kind casts it by its nature, and no calling
teaches it. What moves is every casting: a hold on the place's foes and friends alike in place of a boon to the foes.
The tactics weigh a condition that takes turns at eighteen (as Sleep's and Hold Person's), where Orsino's calm on
foes weighed six; less fifteen for each friend the burst would catch (Tactics.friendly), so a caster whose own side
stands in the place seldom casts it, and one whose side does not casts it oftener than before.

## The creatures (18 November): SR-02

The creature slices follow the spell slices' rule (rules/proof-slices.md): a kind is moved only where the player meets
it, the fight's telling explains it, and what it moves is measured. **The census** for each: every hostile group of
a1, iscoed (the golden route, begun as its representative warrior) and the six fidelity countries, as real play
installs them (546 + 72 groups: `placed.ts`), and every group holding the kind fought where it is placed, by four
first-level human companies of 20 or 40 seeds each (a warrior alone, a warrior and a cleric, a thief alone, a mage
alone), both sides chosen by the battle's own tactics: placements.md's method and verdicts (**trivial**: a warrior
alone wins 90 % or more for 15 % harm or less and the pair 95 %; **lethal**: a warrior alone under half or the pair
under 70 %). Each cell is **win · median rounds · median harm · a death**. The scripts are in
/var/tmp/kyrie/srdc-scratch (scratch, not kept).

### 25. The ghoul (18 November): the barrow ghoul by the SRD's numbers; Orsino's ghoul stopped by the census

The most met kind with an SRD counterpart: 12 of a1's 88 hostile groups and 49 of the six countries' dens. Two bodies
answer to the SRD ghoul. **Orsino's ghoul** (`ghoul`) is every one of those meetings but one: ten hit points and three
a level, one claw of 1d4, cloth, and Curse, Scream, Life Drain and Paralyzing Touch. **The barrow ghoul**
(`ghoul/barrow`, a breed over it) is the SRD's stat block, placed by hand once in each country, alone: the keeper of
the sealed vault under the first town (`s1_u_keeper`, undertown.kyrt), the fight cold play 3's warrior died in.

**The barrow ghoul, moved** (spec: `test/barrow-ghoul` (4 cases; with the old breed put back, three fail)). Until now it
had the SRD's Hit Dice, scores, routine and paralysis, but wore hide (AC 6), clawed for the catalog's 1d4, struck by
its Strength and saved by its scores and level. Now, by the breed alone (data/catalog/variations.json, no new field):
- 2d12, thirteen hit points at every rank; its scores (exact, as before);
- a bite of 1d6 and two claws of 1d3 (exact: the breed's `damage`, dice of its own that no context moves, which
  test/stat-expressions now allows a placed record), each paralysing as it lands (Fortitude 12, three turns, as
  before);
- its blows struck at the SRD's +2 (exact for the bite: a fixed stat block's `attackBonus`, as rat/cellar's), so
  it hits SRD AC 15 two times in five where it had one in two;
- saves of +0, +2 and +5 (exact: the block's `saves`);
- AC 14 as Westernesse 7 (converted: the SRD's natural armour 2 and Dexterity 2 are Westernesse's Dexterity modifier of
  15 alone, so it wears nothing).

**Adapted:** the claws are struck at the bite's +2, where the SRD's secondary claws are at +0 (a fixed block has one
bonus). **Omitted:** ghoul fever (a disease by days the engine has no clock for: its play identity stays unassessed),
turn resistance, elves' immunity. The census grades it S✓ R✓ I–; with the rat, two of 71 creatures now pass in
resolution, and one of a1's 88 placed groups is SRD-faithful (1 % of the six countries' meetings).

**What it moves:** the vault alone, in all eight worlds; no other installed group holds it (it is `unplaced`). The
challenge table measures it again: 2 at its first level, 3 at its fifth (it had been 4 and 5), a second-level
warrior's match; test/srd-challenge follows. The vault, its keeper as placed (level 2, 13 hit points), 40 seeds:

| Company | Level 1, before | Level 1, after | Level 2, before | Level 2, after |
|---|---|---|---|---|
| Warrior alone | 28% · 3 · 100% · 73% | 43% · 4 · 100% · 57% | 35% · 4 · 100% · 65% | 68% · 4 · 17% · 33% |
| Warrior + cleric | 78% · 2 · 27% · 33% | 93% · 2 · 9% · 8% | 93% · 2 · 10% · 15% | 98% · 2 · 5% · 10% |
| Thief alone | 5% · 5 · 100% · 95% | 5% · 5 · 100% · 95% | 5% · 5 · 100% · 95% | 5% · 5 · 100% · 95% |
| Mage alone | 0% · – · 100% · 100% | 3% · 3 · 100% · 98% | 0% · – · 100% · 100% | 3% · 3 · 100% · 98% |

The first hour is kinder, not deadlier: the keeper that killed cold play 3's lone warrior now loses to a lone
first-level warrior two times in five, and the room's company (the second level the town's comment asks for) wins two
in three; still marked as a fight that could be lost, still warned and left by the stair (test/small/vault-told).
No kept trace or golden-route spec reaches the vault; test/traces' wren-tower-climbed fails at its first step on
origin/main as it stands, before this change, and is not this slice's.

**Orsino's ghoul, stopped by the census.** Put in its place everywhere it is met (the SRD's ghoul, as the barrow
ghoul now is), it moves 74 of the eight worlds' placed groups (a1 12, iscoed 5, kite 2, thorn 3, wren 8, kahitude 12,
mere 22, ember 2), and every one becomes lethal. 20 seeds:

| Placed as | Where (groups) | Orsino's: warrior / pair / thief | SRD ghoul: warrior / pair / thief | SRD body, no paralysis: warrior / pair / thief |
|---|---|---|---|---|
| 2 × ghoul L1 | 26: the dead and denned of w3–w6 and e1; iscoed's bone hall (the golden route's) | 65 / 100 / 15 % | 10 / 45 / 0 % | 25 / 75 / 0 % |
| 1 × ghoul L1–L3 | 24: the ossuary (`s1_u_dead`, every world), the newcomers of w5, w6, e1 | 90–100 / 100 / 0–45 % | 35 / 95 / 5 % | 80 / 100 / 5 % |
| 3 × ghoul L2–L3 | 8: the barrow halls' and haulage's newcomers, wren's household | 0–35 / 15–75 / 0 % | 0 / 15 / 0 % | 15 / 15 / 0 % |
| 4 × ghoul L4 | 8: the Bound Howe's household | 0 / 0 / 0 % | 0 / 0 / 0 % | 0 / 0 / 0 % |

The SRD ghoul's thirteen hit points do not grow with the level it is placed at, so the higher-level placements lose
hit points (19 → 13 at the third), but its three blows a round and its paralysis outweigh that wherever two are met.
Iscoed's bone hall, which the golden route's Wenna and Carlin won in cold plays 2 and 4, goes from a pair's 100 % to
45 %. This is the withdrawal of 13 November measured again on today's engine (srd-invariants.md, Withdrawn), and it
is the CB-01/CB-03 concern: the slice would make the first hour markedly deadlier for a lone first-level character.

**The options:**
1. **The SRD's whole** in Orsino's place: every ghoul placement lethal, the golden route's bone hall among them.
2. **The SRD's body without its paralysis** (Orsino's Paralyzing Touch dropped too): a single ghoul a fair fight
   (80 % for a warrior alone), every pair lethal (25 %). Its resolution would still fail (no paralysis is a special
   it lacks, which the census does not grade, but the body would pass): measured, not recommended.
3. **The SRD ghoul by number:** keep Orsino's ghoul in every brood and replace only the singles (the ossuary's one,
   the newcomers' one) with the barrow ghoul, each a placement review (placements.md's flag on w5/w6/e1's newcomers).
   A single SRD ghoul is a 35–43 % fight for a lone first-level warrior: the ossuary is the first town's first room.
4. **Orsino's ghoul as it stands** (the barrow ghoul the SRD's, placed once and alone).

Recommended: 4, now, with 3 for the newcomers' singles of w5, w6 and e1 (met by a second-level company) once their
placement is reviewed, never the ossuary's. **A decision for the lead.**

## What stays unsupported (the catalogue as it stands, 16 November)

**33 of the merged catalogue's 364 abilities** carry `unsupported` (34 of 363 until case 15). Orsino's file (data/catalog/orsino/abilities.json)
marks 36 of its 340, but hand entries replace two: detonation, and Plane Shift (17 November). Kyr refuses to run the
34, and the compiler says so (`ModuleCompiler.unrun`). By cause:
A spell may have more than one cause.
- **Cascading damage (4):** bolt, electric_arc, shock_pulse, static_shock. The chain is built (case 15, Chain
  Lightning by it); these are Orsino's own, each a draw's change, and wait for a slice of their own.
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
119 that have an SRD counterpart pass in structure, and 3 (Magic Missile, and since cases 7 and 9 Cone of Cold and
Lightning Bolt) pass in resolution. The rest run by Orsino's numbers.

That is the honest state: they run, and they are adapted, not faithful. Moving a spell to the SRD's numbers is a
proof slice of its own (met, explained, generation-measured), not a catalogue edit. Cone of Cold was the
first moved in M22 (case 7).

## Closing status (17 November)

The SRD migration is closed for M22 at what this record proves and what the list above names. Nothing more is to
be claimed from the catalogue.

- **Proved, by a route and a tiny-world spec:**
  - Sleep at a band outside a fight (case 1);
  - a check's one try (case 2);
  - Raise Dead outside a fight (case 3);
  - Plane Shift, and the inner planes' laws in and out of a fight (case 4), every outer plane under a law;
  - healing in and out of a fight (case 5);
  - Cone of Cold by the SRD's numbers (case 7), and Death Ward's wards (case 8);
  - the line, and Lightning Bolt by the SRD's numbers but its level (case 9).
  All are adapted, not faithful: each names its changes.
- **Unsupported:** the 34 above, by cause. None is offered, learned or granted, and the compiler refuses an act that
  names one.
- **Incomplete, by row:**
  - GT-01: the Water drowning, the Positive's overload, the outer planes' alignment traits, death ward lasting a
    watch (case 8);
  - GT-03: the integration case;
  - CB-05: a difficulty that reads a measure (OB-11);
  - regeneration out of a fight.
- **By the SRD's numbers in resolution:** Magic Missile, Cone of Cold, Lightning Bolt, Burning Hands and Fireball (srd-fidelity.md). Moving any other spell is
  a proof slice of its own.

## What remains of the migration, and why (17 November, later)

- **Burning Hands and Fireball, and Lightning Bolt's level:** done (case 12), by the draw by rank (case 11).
- **The chain and Chain Lightning:** done (case 15). Orsino's other four cascading spells (bolt, electric_arc,
  shock_pulse, static_shock) wait: each enters a draw, which since case 11 moves only the casters who gain one.
- **Spell resistance.** Not rolled anywhere. Proof-slices.md forbids an `sr` field until it rolls, is told and
  changes resolution: it is §4 of engine-pressure.md (one resolution pipeline), not a data edit.
- **The 33 unsupported**, by the causes above: each cause is an engine capability (statuses' modifiers, phantasmal
  summoning, item creation, target forms, world magic and transformations), and none may be faked as data.
- **The creatures.** 1 of 71 passes in resolution (rat/cellar); placed kinds keep Orsino's bodies by the lead's
  ruling (srd-invariants.md: the ghoul's withdrawal). Since 18 November they go by proof slices of their own (SR-02,
  cases 25 on). The challenge table's re-measure at 48 fights a level
  (CB-21) comes before any placed creature is moved.
- **DC conversion for every spell with a save.** Case 7's rule (the SRD's and half the casting level) is now the
  migration's: each spell moved takes it, and its census row says so.
- **Durations that grow with the caster** (cases 14, 17, 18 convert a minute a level, or a round a level, to a fixed
  count). An apply effect's duration is a number; a duration by `#castingLevel` is an engine change of its own
  (Effects.condition, the handbook's words, the census's grading), and with it Death Ward could last a minute a level.
- **The field's clock** (case 14): a hostile spell cast at a band outside a fight lasts as many watches as it would
  have lasted turns (FieldUse.cast), so Sleep's ten rounds are ten watches, where the SRD's minute is less than one.
  The rule is case 1's and Items.use's; changing it moves the undertown's sleepers and wants its own census.
- **Touch attacks** (Shocking Grasp, Ray of Frost, Acid Arrow and their like: the census's `attack` field). A spell's
  attack roll against a touch armour class (no body armour) would be a new effect before the harm, its miss ending
  the spell as a missed blow does; the fight's telling would need to say a touch, not a weapon.
- **The cure family's levels** (case 16): Moderate, Serious and Critical at the SRD's 2, 3 and 4 wait on the preset
  companion cleric's spells (world-assembler), which are chosen by level.
- **Charm Person**: the SRD's numbers would lower its difficulty and lengthen it to the fight, but Orsino's charmed
  changes allegiance, where the SRD's subject only takes the caster for a friend: a decision before a slice.

