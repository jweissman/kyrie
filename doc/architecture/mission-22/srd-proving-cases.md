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
- **The cascading five** (chain_lightning, bolt, electric_arc, shock_pulse, static_shock). These want `chain`, a
  new shape after the line (case 9). Every one of them enters a draw, which since case 11 moves only the casters who gain one.
- **Spell resistance.** Not rolled anywhere. Proof-slices.md forbids an `sr` field until it rolls, is told and
  changes resolution: it is §4 of engine-pressure.md (one resolution pipeline), not a data edit.
- **The 34 unsupported**, by the causes above: each cause is an engine capability (statuses' modifiers, phantasmal
  summoning, item creation, target forms, world magic and transformations), and none may be faked as data.
- **The creatures.** 1 of 71 passes in resolution (rat/cellar); placed kinds keep Orsino's bodies by the lead's
  ruling (srd-invariants.md: the ghoul's withdrawal). The challenge table's re-measure at 48 fights a level
  (CB-21) comes before any placed creature is moved.
- **DC conversion for every spell with a save.** Case 7's rule (the SRD's and half the casting level) is now the
  migration's: each spell moved takes it, and its census row says so.

