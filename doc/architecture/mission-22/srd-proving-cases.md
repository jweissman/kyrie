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
`test/cure-wounds` (3 cases; with Orsino's dice put back, a fifth-level cleric heals what a first-level one does and
the second fails).

**The spells** (hand entries over Orsino's, data/catalog/abilities.json), each on one ally:
- Cure Light Wounds: 1d8 and a point a casting level, to +5 (exact); the SRD's first level (exact);
- Cure Moderate Wounds: 2d8, to +10; Serious: 3d8, to +15; Critical: 4d8, to +20 (exact);
- each the SRD's school, conjuration, beside its domain, Life (exact);
- the SRD's save is "Will half (harmless)": the living make none, and the save is an undead's against a cure's harm,
  which Kyr's cure does not do (converted, said in the concordance).

**Levels (26 November):** Moderate is second, Serious third and Critical fourth, as in the SRD (Orsino's were third,
fourth and sixth). The preset companion cleric's choice must still have two second-level spells and one third-level
spell: it keeps Prayer and Cure Moderate, takes Cure Serious, and gives up Lesser Restoration. It can cast the three
cures at cleric levels 3, 5 and 7 respectively, the last after learning it. This trades the preset's restoration
for earlier healing; generated clerics' picks change too.

**Omitted:** the harm a cure does the undead (the SRD's touch attack, Will half), spell resistance.

**The original census.** No draw moved then: no level changed. What moved was every healing by these spells: a first-level cleric's
Cure Light Wounds heals one more, a fifth-level's five more (test/cure-wounds: the same die, the difference exactly
the casting level to the cap). Every companion cleric, every hostile healer and the Tend lens heal more.

**The level-change sample.** For each row, 200 seeded human Life clerics were generated before and after, comparing
their sets of known spells. Player picks use the ordinary specialist draw; hostile picks use `prepared: true`.
These are samples, not a census of installed encounters:

| Cleric level | Player spellbooks changed | Hostile spellbooks changed | Moderate known before → after | Serious known before → after | Critical known before → after |
| --- | --- | --- | --- | --- | --- |
| 1 | 110/200 | 0/200 | 67 → 55 (player) | 0 → 60 (player) | 0 → 0 |
| 3 | 122/200 | 85/200 | 76 → 44 (player), 0 → 85 (hostile) | 0 → 81 (player) | 0 → 0 |
| 7 | 124/200 | 81/200 | 81 → 67 (player), 102 → 93 (hostile) | 15 → 72 (player), 82 → 77 (hostile) | 0 → 12 (player), 0 → 81 (hostile) |

First-level player clerics know later spells but cannot cast them until they have slots. Other domains draw from the
common divine pool as players, while hostile casters draw from their own domain. No installed-encounter census or
world-balance walk was run for this change.

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

**Done (18 November, the owner's word: option 2).** Measured first: the first-level abjurer of today's creation does not
know Mage Armor (its picks are Ward, Minor Ward, Spark and Magebane), and alone it won 90.5 % of 200 fights against three
rats, with a warrior beside it 100 %; it cast Mage Armor in none, so no first-hour fight of a made mage moves. Built: an
armour of force (`force`, src/rules/modifiers.ts: body armour of that much where it is better than what is worn, never
added to it, of two the better; Fighting.armorClass), the hand condition `mage_armored` (+4 of force, no temporary hit
points), and the hand spell on the caster or one ally, Orsino's school kept, the fight its duration; its harmless save
declared. Spec: `test/mage-armor` (2); the owner's pin of 15 November (test/small/mage-casts) now offers it on the mage
or its companion, as Arcane Ward. The census: structure, resolution and identity pass.

**Read again (20 November, S3-R4).** The 90.5 % was of made human abjurers, not of the golden route's mage, who is
a diviner (Ilse, the weir life); and it does not reproduce on today's rules: 200 made abjurers against three rats win
44.5 %. The route's mage's own odds, against the corn-store's two rats, are pinned by test/weir-mage-odds (CB-03).

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

**Done (18 November, the owner's word: "I agree with your recommendations"):** its resolution by the SRD's numbers at
Orsino's level, a hand entry over Orsino's: blessed alone (the SRD's +1, case 17) on the caster for a minute, ten
rounds, at every casting level (converted, as case 14's); the SRD's evocation beside its domain; Orsino's keen and
three rounds gone. Spec: `test/divine-favor` (2; Orsino's entry put back, both fail). The census: structure,
resolution and identity pass, its level and duration conversions declared. No draw, card or installed creature moves:
its level is Orsino's.

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

**Update, 26 November:** the bite is at +2 for 1d6+1 and both secondary claws at +0 for 1d3; their paralysis riders
remain. Kyr's critical policy remains an adaptation. The census now compares each strike's hit chance and
noncritical weapon damage.
**Omitted:** ghoul fever (a disease by days the engine has no clock for: its play identity stays unassessed),
turn resistance, elves' immunity. The census grades it S✓ R✓ I–; with the rat, two of 71 creatures now pass in
resolution, and one of a1's 88 placed groups is SRD-faithful (1 % of the six countries' meetings).

**What it moves:** the vault alone, in all eight worlds; no other installed group holds it (it is `unplaced`). The
following challenge and encounter measurements predate the strike update and need to be repeated in CI. The
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

### 26. The zombie (18 November): stopped by the census, a decision for the lead

Not migrated: it makes the first hour's commonest undead fight markedly deadlier for a lone first-level character.
The second most met kind: 12 of a1's groups and 34 of the six countries' dens; 49 placed groups in the eight worlds
(a1 12, iscoed 3, kite 3, thorn 7, wren 9, kahitude 3, mere 3, ember 9), iscoed's undertown shamblers among them.
Kyr's zombie (`zombie`, an author's own kind) is rolled scores, a d6 a level (6 to 9 hit points at the first, 10 to
15 at the third), claws of 1d4 by its Strength, cloth, and Orsino's Rage and Infect. The SRD's human commoner zombie
is 2d12+3 (16), a slam of 1d6+1 at +2, AC 11, damage reduction 5/slashing, single actions only, saves +0/-1/+3.

**What it would take:** the record alone, nothing new. Fixed scores (12, 8, 10 for the Constitution it has none of,
1, 10, 1), Hit Dice 2d12+3, the catalog's slam (1d6), its blows at +2 and its saves (a fixed stat block's, as the
barrow ghoul's), hide for its natural armour 2 (Westernesse 10, as AC 11 is), a reduction of 5 unless slashing
(srd-invariants.md's typed defenses), and Rage and Infect dropped. So written, the census grades it exact in every
field it grades (S✓ R✓); single actions are moot in a fight without movement.

**What it moves** (20 seeds; the warrior's battleaxe is slashing, the thief's shortsword slashing, the cleric's staff
bludgeoning, the mage's dagger piercing):

| Placed as | Where (groups) | Kyr's: warrior / pair / thief / mage | SRD's | SRD's without the reduction | Kyr's body, the SRD's slam and reduction |
|---|---|---|---|---|---|
| 2 × zombie L1 (the dens, the undertown's shamblers, the halls' gallery) | 21 | 90 / 100 / 35 / 15 % | 60 / 95 / 5 / 0 % | 60 / 95 / 5 / 0 % | 80 / 85 / 5 / 5 % |
| 2 × zombie L2–L3 (the newcomers, the Howe's iron caps) | 16 | 80 / 100 / 20–30 / 0–5 % | 60 / 95 / 5 / 0 % | 60 / 95 / 5 / 0 % | 60 / 90–95 / 5–10 / 0 % |
| 1 × zombie L1 (a den's leader) | 4 | 100 / 100 / 80 / 70 % | 100 / 100 / 5 / 10 % | 100 / 100 / 25 / 10 % | 100 / 100 / 15 / 20 % |
| 3 × zombie L3 (the Howe's drowned) | 8 | 35 / 80 / 10 / 0 % | 25 / 50 / 0 / 0 % | 25 / 65 / 0 / 0 % | 25 / 45 / 5 / 0 % |

A lone first-level warrior against the commonest pair: a win nine times in ten becomes six, and a death one in ten
four in ten (median harm 20 → 59 %). The cause is the SRD's sixteen hit points at every rank, not its reduction
(without it the warrior's column is the same; it is the staff's and the dagger's). The challenge table would measure
it 0.5 at its first level and its fifth (Kyr's 0.25 and 0.5), within a first den's "two of a kind of challenge one or
less" (RegionStock.numbers), so the dens would keep their pairs.

**The options:**
1. **The SRD's whole**, as above: every pair of the first hour deadlier, a lone thief's and mage's zombie fights all
   but hopeless (5 % and 0 %).
2. **The SRD's whole, one where two are now** (number, not the kind's numbers: placements.md's lesson read the other
   way): the denned singles are trivial for a warrior (100 %) and hopeless for a thief (5 %). A change to RegionStock
   and the undertown's template, each a placement review.
3. **The SRD's blows and reduction on Kyr's body** (its rolled d6 a level kept, slam 1d6, 5/slashing; saves and to-hit
   by its level, for a fixed save wants Hit Dice): the warrior's pair 90 → 80 %, the warrior and cleric's 100 → 85 %
   (the staff is turned). Structure and resolution still fail; not recommended.
4. **Kyr's zombie as it stands.**

Recommended: 4 for now; 2 if the lead wants the SRD's zombie met, after the denned-numbers review. **A decision for the
lead.** The barrow ghoul (case 25) is a single placed by hand; the zombie is drawn into every barrow and ruin den.

### 27. The rat (18 November): stopped by the census, a decision for the lead

Not migrated: the SRD rat is kinder to nobody and much harder on a lone thief or mage. Orsino's rat (`rat`) is met in
5 of a1's groups and 30 of the dens; plain rats are 24 of the eight worlds' placed groups (the manor's three, the
adits' and barrows' fours and fives), beside the runts, the great rats and the buck, which are variations of it (the
SRD's dire rat is another row). It has two hit points, a gnawing bite of 1d3 struck by its level (one in five against
SRD AC 15), fur. The SRD rat is `rat/cellar` already (proof-slices.md, step 2, unplaced): one hit point, its bite at
+4 (one in two), its saves.

**What it would take:** the cellar rat in the plain rat's placements (an ecology row naming it, or the breed made the
rat's own), and its bite's harm: the SRD's 1d3 − 4 is one point a bite, where Westernesse floors a blow's Strength at
none, never below, so the cellar rat bites for 1d3 (a placed record's literal dice, as the barrow ghoul's claws, would
make it 1, exact).

**What it moves** (20 seeds; warrior / warrior and cleric / thief / mage):

| Placed as | Groups | Orsino's rat | The cellar rat (1d3) | The cellar rat, a bite of 1 |
|---|---|---|---|---|
| 3 × rat L1 (the manor's, the cistern's) | 10 | 95 / 100 / 65 / 35 % | 75 / 100 / 15 / 20 % | 90 / 100 / 15 / 30 % |
| 4 × rat L1–L2 (the adits') | 7 | 85–90 / 100 / 40 / 20–35 % | 70 / 100 / 0 / 10 % | 90 / 100 / 5 / 20 % |
| 5 × rat L1–L2 (the barrows' recesses and vents) | 7 | 90–95 / 100 / 0–10 / 15 % | 60 / 90 / 0 / 10 % | 80 / 95 / 0 / 20 % |

Its one hit point does not outweigh hitting two and a half times as often: with the SRD's one-point bite the warrior
is where he was and the thief's manor rats go from 65 % to 15 %. CB-01 and CB-03's concern (and placements.md's open
decision 6, the lone thief): a lone first-level thief or mage would lose most of the first town's rat fights.

**The options:**
1. **The cellar rat with a bite of one** in the plain rat's placements: faithful; the warrior's first hour unmoved,
   the thief's and mage's markedly harder.
2. **The same in one placement** (proof-slices.md, step 6: "one ecology row only after reviewing the resulting
   country samples"): the barrows' fives, where a thief already loses (0–10 %).
3. **Orsino's rat as it stands** (the cellar rat named, unplaced).

Recommended: 3 until the lone thief's decision (placements.md, 6); then 2. **A decision for the lead.**

### 28. The cave spider (18 November): stopped by the census, a decision for the lead

Not migrated: every pair becomes lethal. The great cave spider (`spider/great/cave`, Orsino's spider great and of the
dark) is met in 3 of a1's groups and 35 of the dens, and spiders in 44 of the eight worlds' placed groups (the
undertown's spider room and brood-mother in every world, the adits', the broods, the dens). It is rolled scores, a d4
a level and the great breed's health (8 or 9 at the first), a bite of 1d6 by its level (two in five against SRD AC
15), chitin, and Orsino's venomous bite and Ensnare. The SRD's medium monstrous spider is 2d8+2 (11), its bite of 1d6
at +4 (one in two), AC 14, poison (Fortitude 12, 1d4 Strength), web, saves +4/+3/+0.

**What it would take:** a breed carrying the block (Hit Dice, its bite at +4, its saves), as the barrow ghoul's; its
poison and web as Orsino's venomous bite and Ensnare, as now. Measured as such a breed in place of every spider
(20 seeds; warrior / warrior and cleric / thief / mage):

| Placed as | Groups | Orsino's | The SRD's |
|---|---|---|---|
| 1 × spider L1 (the undertown's spider room) | 10 | 85 / 100 / 50 / 25 % | 80 / 100 / 15 / 10 % |
| The brood-mother L2 (19 hit points) | 8 | 75 / 100 / 15 / 0 % | 80 / 100 / 10 / 10 % (11) |
| 2 × spider L1 (the dens, the winze foot) | 11 | 50–70 / 90–100 / 10 / 10–20 % | 25 / 70 / 0 / 0 % |
| 2 × spider L2–L3 (the newcomers, the winze head) | 8 | 5–25 / 55–80 / 0 / 0 % | 20–25 / 70 / 0 / 0 % |
| 3 × spider L1 (the broods, the barrow's ossuary) | 7 | 10–30 / 50–75 / 0 / 0 % | 0 / 30 / 0 / 0 % |

The undertown's room (one spider for a company of one) moves little for the warrior and much for the thief; every
first-level pair halves for him; the brood-mother, a fixed block, loses her size. The spiders are already the first
hour's deadliest kind (placements.md: "poison in threes is the barrow's real killer").

**The options:** the SRD's spider everywhere (every pair lethal); in the singles alone (the undertown's room: the
thief 50 → 15 %); or Orsino's as it stands. Recommended: Orsino's as it stands. **A decision for the lead.**

### 29. The wolf (18 November): stopped by the census, a decision for the lead

Not migrated: a pack of three becomes lethal. The wolf is met in 2 of a1's groups and 17 of the dens, and in 25 of the
eight worlds' placed groups (the packs of w5–w7 and e1, iscoed's w5 among them; the dens' pairs; a wandering one). It
is rolled scores, a d8 a level (6 to 9 at the first), a bite of 1d6 by its level (three in ten against SRD AC 15),
Orsino's Howl. The SRD wolf is 2d8+4 (13), its bite of 1d6+1 at +3 (nine in twenty), AC 14, trip, saves +5/+5/+1.
Measured as a breed carrying the block (Hit Dice, the bite at +3, its saves; its trip not carried), in place of every
wolf (20 seeds; warrior / warrior and cleric / thief / mage):

| Placed as | Groups | Orsino's | The SRD's |
|---|---|---|---|
| 3 × wolf L1–L2 (the packs) | 5 | 25–60 / 75–95 / 0–5 / 0–5 % | 15 / 50 / 0 / 0 % |
| 2 × wolf L1–L3 (the dens, the newcomers) | 13 | 60–80 / 90–100 / 5–25 / 0–15 % | 50 / 100 / 5 / 0–5 % |
| 1 × wolf (a wanderer; ember's frost wolves) | 7 | 95–100 / 95–100 / 25–75 / 10–70 % | 80 / 100 / 50 / 30 % |

A pack of three first-level wolves, which a lone warrior wins three times in five, he would win one in seven; his
death in a pair's fight goes from one in five to one in two. **The options:** the SRD's wolf everywhere; in the
singles alone; or Orsino's as it stands. Recommended: Orsino's as it stands. **A decision for the lead.**

### What the creature census says, across cases 25–29

Each SRD body hits more often than the Westernesse kind it would replace (two in five to one in two against SRD AC
15, where Kyr's first-level kinds strike one in five to two in five by their level), and a fixed block does not
shrink at the first level. The SRD prices its CR 1/2 and CR 1 creatures for a party of four; Kyr's first hour is one
life (an origin keeps one), and a lone thief or mage already loses most fights (placements.md, decision 6). So
every SRD body met in pairs or more makes the first hour markedly deadlier, and the migration can move a placed kind
only where it is met alone and by hand (the barrow ghoul), or after the ecology prices a company of one (CB-01, CB-03)
and the lone thief is decided. Until then, the next creature slices are the kinds met deeper than the first hour
(the mummy that keeps the great barrow, srd-invariants.md's case for damage that does not grow), each fought where it
is placed.

### 30. The mummy (18 November): the king under the mound by the SRD's numbers; the halls' mummies stopped by the census

The first kind met deeper than the first hour (the lead's decisions on cases 25–29). Two kinds of placement answer to
the SRD mummy, 13 of the eight worlds' placed groups, every one alone. **The king under the mound** keeps the
king-barrow (data/generation/deep/barrow.json's keeper, level 12), in all eight worlds: a1's and iscoed's `w8_keeper`
(the golden route's crown, CL-44: he comes when it is lifted), kahitude's and mere's `w9_keeper`, and the barrow under
the first town in kite, thorn, wren and ember (`s1_ud_keeper`). **The halls' mummies** are drawn as dwellers by the
barrow habitat: four of the third level (kite, thorn, wren and ember's embalmers' halls) and one of the first
(kahitude's gallery). Orsino's mummy (`mummy`) is ten hit points and three a level (48 at the twelfth), two slams of
1d6 a turn struck by its Strength and level, cloth, half of every blow turned and fire half again, regeneration, and
Curse, Scream, Life Drain, Mass Curse and Reckless Attack. The SRD's is 8d12+3 (55), one slam of 1d6+10 at +11, AC 20,
damage reduction 5/-, vulnerability to fire, despair (Will DC 16 or paralysed with fear 1d4 rounds) and mummy rot,
saves +4/+2/+8, CR 5.

**The king, moved** (spec: `test/royal-mummy` (6 cases)). A breed over Orsino's mummy, `mummy/royal`, placed by hand
as the barrow's keeper (the keeper's `variations`, which a deep site's keeper now takes as its dwellers do), unplaced
otherwise. By its record (data/catalog/variations.json):
- 8d12+3, fifty-five hit points at every rank; its scores 24, 10, 10 (for the Constitution it has none of), 6, 14, 15
  (exact);
- one slam a turn (a breed's `actions`, new: Orsino's mummy acts twice) of 1d6+10: the breed's 1d6+3 and its
  Strength's 7 (exact), struck at the SRD's +11 (exact: seventeen in twenty against SRD AC 15, where it had two in
  five);
- AC 20 as Westernesse 1 (converted: its natural armour 10 as a hide bonus of 9 over its wrappings);
- damage reduction 5/- (exact), and fire half again (its base's, the SRD's vulnerability: exact), without its base's
  half of every blow (`forgoes.resistances`, new: a variation now drops its base's fractions of a harm it names, as
  engine-pressure.md §2 said the mummy would need) or its regeneration;
- saves of +4, +2 and +8 (exact);
- **despair**, a hand ability (data/catalog/abilities.json): every foe saves against fear at 16 (the SRD's Will DC,
  exact; fear's save, so Remove Fear's heartened answers it, as Cause Fear's) or is paralysed two rounds (converted
  from 1d4), once a day.

**Adapted:** despair is the king's act on his turn, where the SRD's is at sight and costs nothing; once a day, where
the SRD's spares for a day whoever saved. **Omitted:** mummy rot (a disease by days, ghoul fever's case). **Kept from
its base:** the undead's nature (radiant harms it double), Orsino's slam's kind (piercing). The census grades it S✓ R✓
I– (specials differ by mummy rot); 3 of 72 creatures now pass in resolution, 2 of a1's 88 placed groups are faithful
(the keeper the second), and 2 % of the six countries' meetings (data/sources/srd35/encounters.json measured again; one
rat group fewer in the dens is the commit before's, measured there too).

**What it moves:** the eight keepers, nothing else (the census of the eight worlds' installed hostile groups, before
and after: only `w8_keeper`, `w9_keeper` and `s1_ud_keeper` change, 48 → 55 hit points). Its challenge is measured: 14
at its first level and its fifth (Orsino's mummy 1 and 4 at those levels, and the keeper is placed at the twelfth).
Fought where it is placed, by companies of one to three at the first to third levels (40 seeds; won · a death):

| Company | Orsino's king L1 / L2 / L3 | The SRD's king L1 / L2 / L3 |
|---|---|---|
| Warrior alone | 0 · 100 / 5 · 95 / 10 · 90 % | 0 · 100 / 0 · 100 / 0 · 100 % |
| Warrior + cleric | 10 · 95 / 30 · 78 / 48 · 63 % | 10 · 90 / 18 · 88 / 23 · 78 % |
| Thief alone, mage alone | 0 · 100 % at every level | 0 · 100 % at every level |
| Warrior, cleric and mage | 30 · 83 / 53 · 68 / 63 · 57 % | 20 · 88 / 28 · 85 / 45 · 68 % |

Fled from (every try Flee, 100 seeds; got away without anyone down):

| Company | Orsino's king L1 / L2 / L3 | The SRD's king L1 / L2 / L3 |
|---|---|---|
| Warrior alone | 74 / 86 / 95 % | 67 / 78 / 84 % |
| Warrior + cleric | 84 / 92 / 99 % | 81 / 92 / 98 % |
| Thief alone | 49 / 60 / 68 % | 53 / 54 / 59 % |
| Mage alone | 37 / 40 / 48 % | 49 / 49 / 49 % |
| Warrior, cleric and mage | 87 / 94 / 100 % | 94 / 98 / 99 % |

The king was a fight no company of the first three levels should take, and stays one (the three of the third level
win 63 → 45 %); getting away from him moves within a few seeds either way (his one slam lands harder and his despair
can hold a fleer, but he strikes once a turn where he struck twice). **The golden route**, played by cold play 4's own
lines to the crown lifted (Wenna, a first-level warrior, and Carlin): fled, both get away at the second try, before
and after; fought to the end, both are down, before and after (the king's guard now "turns 5 of the blow"). Not
markedly deadlier: the slice lands. iscoed-cold-four, deep-barrow, loot-in-reach (the crown offered once the king has
fallen), placed-told and play-structure hold; test/traces' wren-tower-climbed fails before and after, as case 25 found.

**The halls' mummies, stopped by the census.** The same body in place of the five dwellers (the third level's four,
kahitude's one of the first) makes each lethal: a warrior and cleric of the first level who win 80 % against Orsino's
third-level mummy (90 % at the third) win 10 % (25 %), and the three of the first level 95 → 20 %. The options:
1. **The SRD's mummy** in the halls: every one of the five a fight the companies that reach it lose.
2. **Orsino's mummy as it stands** in the halls (the royal mummy the barrow's king alone).

Recommended: 2. **A decision for the lead.** The SRD prices its CR 5 for four of the fifth level; the halls are met by
the first to third.

### 31. Entangle by the SRD's numbers (18 November): adapted

Orsino's Tangling Vines (`entangle`, a first-level spell of Nature) was a burst (the rules' areas make it one) that
held whoever failed a Reflex save against 15 and the caster's whole level for three rounds. The SRD's Entangle is the
same level and the same save, a minute a level. Now (data/catalog/abilities.json, a hand entry over Orsino's; spec:
`test/entangle` (2; Orsino's entry put back fails both)):
- first level, its school transmutation beside Nature (the SRD's druid and ranger spell; Kyr's nature clerics cast it);
- a burst on friend and foe, as it was;
- a Reflex save at case 7's difficulty for a first-level spell (11, the casting score's modifier and half the casting
  level: 15 for a third-level cleric of Wisdom 16, where Orsino's was 18);
- whoever fails entangled (Orsino's condition, kept: two worse to hit, Dexterity five less, slower to act; the SRD's
  is −2 and −4) for a minute, ten rounds at every casting level (converted: case 14's rule).

**Omitted:** the plants it needs (Kyr's field does not say what grows there); the vines trying again each round at
whoever slipped them (a persistent area: proof-slices.md, do not cross yet); the half speed of whoever saved and the
check to tear free (Kyr's fight has no movement). The census grades it S✓ R✓ I✓ (its difficulty exact at the
census's caster): 30 of 119 spells pass in structure, 19 in resolution.

**What it moves:** no draw (its level and domain are as they were: 0 of 19,200 drawn casters move, and 0 of 2,233
installed classed creatures in a1 and the six countries; a third of wildcallers and a sixth of other clerics know it,
as before), and no creation card (the wildcaller's offers it, as before). Four installed casters know it, none of them
a foe the first hour meets alone (a1's fellowship head, kite's traveller, kahitude's keep chaplain, mere's preacher).
Fought with it cast at the caster's first turn (a warrior and a cleric who knows it against two zombies of their
level, and a lone warrior against two zombies and such a cleric; 40 seeds): the company wins 100 → 98 % at the first
level and 100 % at the third; the lone warrior 25 % and 30 %, before and after. The longer hold and the easier save
weigh about even.

### 32. Protection from Evil by the SRD's numbers (18 November): adapted

Orsino's Protection from Evil (`protection_from_evil`, a first-level spell of Law, on the caster or one ally) laid
protected and courage for three rounds: proof against charm and fear, half of necrotic harm, +2 to every save, and no
ward against blows. The SRD's is the same level, on the creature touched, a minute a level: +2 to armour class by a
deflection and +2 to saves against the evil, and proof against mental control. Now (data/catalog/abilities.json, a
hand entry over Orsino's; data/catalog/conditions.json, `warded_from_evil`, new; spec: `test/protection-from-evil`
(2; Orsino's entry put back fails both)):
- first level, its school abjuration beside Law;
- on the caster or one ally, its save the SRD's harmless one (made by none who takes it willingly, as Shield of
  Faith's, case 19);
- warded: two harder to hit by a deflection added to worn armour (Shield of Faith's `ac`), +2 to every save
  (`saveVersusAll`, the SRD's resistance bonus), proof against charm (the SRD's mental control);
- a minute, ten rounds, at every casting level (converted: case 14's rule).

**Adapted:** against every foe, where the SRD's is against the evil (Kyr's fight does not ask a foe's alignment); its
deflection adds to Shield of Faith's, where the SRD's two deflections do not stack. **Omitted:** the summoned
creatures' touch it keeps off. Orsino's proof against fear and its half of necrotic harm are gone (the SRD's has
neither). The census grades it S✓ R✓ I✓: 31 of 119 spells pass in structure, 20 in resolution.

**What it moves:** no draw (its level and domain are as they were: 0 of 19,200 drawn casters and 0 of 2,233 installed
classed creatures move; two in five oathkeepers and one in ten other clerics know it, as before), and no creation
card (the oathkeeper's and the veneficium's offer it, as before). Seven installed casters know it: a1's and wren's
Anselm, kite's and thorn's fellowship heirs, wren's fellowship head, thorn's keep chaplain, and wren's tower
necromancer.
Fought with it cast at the caster's first turn on its warrior (a warrior and a cleric who knows it against two wolves of
their level, and a lone warrior against two wolves and such a cleric; 100 seeds): the company wins 97 → 98 % at the
first level and 100 % at the third, as before; the lone warrior against it 28 → 25 % at the first level and 32 → 24 %
at the third (the warded companion is two harder to hit for the whole fight, where Orsino's ward did nothing to a
blow and lasted three rounds). A little harder against a warded foe, never markedly.

### 33. Command by the SRD's numbers (18 November): adapted

Orsino's Command (`command`, a fifth-level spell of Law) laid fleeing for two rounds on one foe that failed a Will save
against 20: the foe gone from the fight when the next round began. The SRD's is a first-level enchantment, one round,
Will negates, one of five words: approach, drop, fall, flee, halt. Now (data/catalog/abilities.json, a hand entry over
Orsino's; spec: `test/command-fall` (2; Orsino's entry put back fails both)):
- first level (Orsino's fifth), its school enchantment beside Law;
- one foe, a Will save at case 7's difficulty for a first-level spell (15 for a third-level cleric of Wisdom 16);
- "Fall": whoever fails is prone (Orsino's condition: Dexterity two less, and it loses its turn) for one round, its
  next turn lost whether that comes in this round or the next, and it stays in the fight.

**Adapted:** the one word of the five Kyr's fight can hold (approach, drop, flee and halt want movement, things in hand,
or a flight that is not leaving the fight). **Omitted:** the language it needs and the mindless's proof (its save is
Will, as Hold Person's); spell resistance. The census grades it S✓ R✓ I✓: 32 of 119 spells pass in structure, 21 in
resolution.

**What it moves:** the draw, by the draw by rank (case 11): only the casters who gain it, 1,545 of 19,200 drawn clerics
(an oathkeeper in three, a seventh to a sixth of the other ways at the third level and above, a sixteenth at the
first), each giving up the spell it displaces; mages and bards none. Seven of 2,233 installed classed creatures gain
it and lose none (a1's and wren's Anselm, kite's and thorn's fellowship heirs, wren's fellowship head, thorn's keep
chaplain, wren's tower necromancer). **The oathkeeper's creation card moves:** Shield of Faith, Command, Protection
from Evil, Hold Person, Holy Wrath and Consecrated Ground, where it offered Heat Drain and Healing Touch in place of
Command and Holy Wrath (FirstSpells.picks). The mind destroyer, the deep mine's keeper at the ninth level, knows it by
nature: a company of the first three levels loses to it before and after (20 seeds). Fought with it cast at the
caster's first turn (100 seeds), the company of a warrior and a cleric against two wolves of their level wins 99 %
before and after (someone down 12 → 9 % at the first level, 11 → 3 % at the third); a lone warrior against two wolves
and such a cleric 21 → 22 % and 18 → 23 % (the word costs the cleric its turn). test/reactions' flight is now proved
by Turn Undead, the one spell left that turns a foe to flight.

### 34. The still water, the waterworks' keeper (18 November): stopped by the census, a decision for the lead

The next keeper met deeper than the first hour after the mummy: the waterworks' (data/generation/deep/waterworks.json,
"the still water", level 8, alone), Orsino's water elemental (`elemental/water_element`) in a1's and iscoed's `w7` and
kite's and thorn's `w8` (four of the eight worlds; the cisterns' dwellers of the same kind at the third and fifth
levels beside them). Orsino's is 44 hit points at the eighth level, one slam of 1d6 by its Strength and level, scale,
Dexterity 20 (AC 1), the water's affinity (half of cold, double fire, lightning and bludgeoning, proof against Will)
and Drench. The concordance answers it with the SRD's Medium water elemental (CR 3); a keeper of the eighth level is
nearer the Large (CR 5). Neither is written; both measured as a breed over it (Hit Dice, scores, slams, the bonus they
are struck at, saves, AC as Westernesse reads it, the Large's 5/-, the water's affinity and Orsino's elemental nature
forgone through `forgoes.traits`; water mastery and the vortex not carried). Companies of one to three at the first to
third levels (fought, 40 seeds; fled, 100 seeds):

| Company (won at L1 / L3 · got away at L1) | Orsino's keeper (44 hp) | The SRD's Large (68 hp, two slams of 2d8+5 at +10, AC 1, 5/-) | The SRD's Medium (30 hp, one slam of 1d8+4 at +6, AC 2) |
|---|---|---|---|
| Warrior alone | 0 / 3 % · 85 % | 0 / 0 % · 48 % | 15 / 43 % · 90 % |
| Warrior + cleric | 5 / 43 % · 92 % | 3 / 10 % · 59 % | 55 / 88 % · 91 % |
| Thief alone | 0 / 0 % · 59 % | 0 / 0 % · 35 % | 0 / 0 % · 68 % |
| Warrior, cleric and mage | 28 / 78 % · 93 % | 5 / 10 % · 72 % | 68 / 93 % · 93 % |

The Large makes the keeper markedly deadlier, and getting away from it most of all (a lone first-level warrior 85 →
48 %); the Medium makes a fight the companies that reach it should not take one a first-level pair wins one time in
two. The options:
1. **The SRD's Large** as the keeper (the level it is placed at), every company of the first three levels markedly
   likelier to die in its rooms.
2. **The SRD's Medium**, the concordance's: faithful to its mapping, the keeper a fair fight from the second level.
3. **Orsino's as it stands.**

Recommended: 3, the keeper's danger being the deep site's design (it is told, it flinches from the Wardens' oath,
and it is to be outwitted rather than fought), until the keepers' levels are reviewed against what the SRD would
place there; then 2 or 1 by that review. **A decision for the lead.** The other keepers met deeper (the deep mine's
mind destroyer at the ninth level, the singing hall's golem at the eighth) have no SRD counterpart in the concordance,
or none placed (the iron golem of ember's smith is CR 13).

### 35. The touch, and Shocking Grasp by the SRD's numbers (19 November): adapted

The migration strategy's first engine tranche names the melee and ranged touch (attack.meleeTouch,
attack.rangedTouch) beside spell resistance, and "What remains of the migration" below named touch attacks as a new
effect before the harm. Shocking Grasp is the touch spell a player's first evoker meets: it is on the evoker's
creation card. Spec: `test/shocking-grasp` (4 cases).

**The mechanic built: the touch** (`Touch`, src/rules/touch.ts; an effect's `touch`, `melee` or `ranged`).
- Before what the effect does, the caster's d20 against the one touched, as a blow's (Fighting.touch): by Strength
  for a touch, Dexterity for a ranged one, the caster's level as for any blow.
- The one touched is struck as though it wore nothing: worn armour, a kind's hide and an armour of force (Mage
  Armor, case 22) do not count; what it dodges by (`ac`, Shield of Faith's two, Blur's evasion) does. This is the
  SRD's touch armour class.
- A miss ends the spell on that one, as a missed blow ends a weapon's; a hit lets the effect fall as written. The
  slot is spent either way.
- It is told as the spell's own attack, no weapon named ("uses Shocking Grasp on the goblin, and misses"), and the
  attack event carries `touch`. The aim's odds are the touch's (CombatModel), the plate not counting.
- The census reads it (SpellResolution.attack: `melee touch`, `ranged touch`); the manifest has both capabilities,
  so seven unmapped records become ready (71 → 78).

**The spell** (a hand entry over Orsino's, data/catalog/abilities.json):
- first level, arcane, evocation (exact; Orsino's second);
- 1d6 electricity a casting level to 5d6 at the fifth (exact);
- one foe, a melee touch (exact);
- its harm Kyr's electric, as Lightning Bolt's (case 9): Orsino's lightning may paralyse (its status trigger), which
  the SRD's grasp does not.

**Omitted:** spell resistance; the +3 against a foe in metal armour; a touch's critical (Kyr's criticals are a
weapon's weight); holding the charge. Before: Orsino's 2d6 lightning on one foe, no attack roll, at the second level.
The census grades it S✓ R✓ I✓: 24 of 119 pass in resolution now.

**The census** (the lead's pools, 200 humans for each calling and level, before and after; scratch:
/var/tmp/kyrie/srd5-scratch):
- Only gainers and losers move, by the draw by rank (case 11): 711 of 19,200 drawn mages (3.7 %). Evokers move
  26.5–29.5 % (a first-level evoker now knows it .14, where .26 knew it at the second level), other specialists and
  drawn schools 5–13.5 %; no bard or cleric.
- **The evoker's creation card moves:** its first-level picks are Burning Hands, Spark and Magic Missile as before,
  and its second-level picks lose Shocking Grasp for Prismatic Spray beside Ray of Frost and Sound Lance. A player's
  first evoker chooses among every first-level spell open to the way (case 13's hand), Shocking Grasp now among them.
- **The installed casters** of a1 and the six fidelity countries (2,233 classed creatures): one moves, kahitude's s5
  traveller, who gains it in place of Burning Hands. No a1 creature moves.

**Where it is met.** A mage of the first level who chooses or draws it, castable from the first slot (Orsino's needed
the third level); a hostile evoker or generalist who prepares it. A lone first-level mage who opens with it lands it
about one time in two on the first hour's rats and zombies, for 1d6: no better than its dagger, as the SRD's grasp is
at the first level (100 seeds each, the spell cast whenever it can be: three rats 20 %, two zombies 9 %, a ghoul 12 %,
where a mage opening with Magic Missile wins 42 %, 13 % and 29 %). It grows a die a level to the fifth.

**What it unlocks next:** Ray of Frost, Acid Arrow and Ghoul Touch (Paralyzing Touch) want only the touch now, each
with a level of its own to measure (Ray of Frost a cantrip, Acid Arrow the second level, from Orsino's second and
first); Vampiric Touch (Life Drain) and Ray of Enfeeblement (Weakness) likewise.

### 36. Ghoul Touch by the SRD's numbers (19 November): adapted

Orsino's Paralyzing Touch is the SRD's Ghoul Touch, at the SRD's level already (the second), so it moves no draw or
card: it is a second-level pick on the illusionist's, the generalist's and the necromancer's creation cards. It is
case 35's touch put to a hold. Spec: `test/ghoul-touch` (3 cases).

**The spell** (a hand entry over Orsino's, data/catalog/abilities.json):
- second level, arcane, necromancy (exact);
- one humanoid (exact: the SRD's living humanoid, read as the `humanoid` it wants), a melee touch attack (exact);
- a Fortitude save to negate (exact: made with Constitution, where Orsino's paralysis save was made with Strength),
  at case 7's difficulty for a second-level spell (converted: 16 at a third-level caster of Intelligence 16);
- paralysed six rounds (converted: the SRD's 1d6+2, its mean rounded up, as Cause Fear's 1d4 in case 20).

**Omitted:** spell resistance; the stench about the paralysed that sickens whoever stands beside them. Before:
Orsino's three rounds against 14 + the caster's level, saved with Strength, no attack roll. A miss now lays nothing
and asks no save. The census grades it S✓ R✓ I✓: 25 of 119 pass in resolution now.

**The census.** No draw or card moves: its level, school and tradition are Orsino's. A drawn mage knows it about one
time in ten at the first level and one in five at the seventh, a necromancer two in five, as before. None of the
2,233 installed classed creatures of a1 and the six fidelity countries knows it. What moves is every casting, and the
kinds that have it as their own: Orsino's ghoul (and the spirit and the discerner), and the wand of paralyzing touch
(its user's touch). The ghoul's placements fought by the four first-level companies, 20 seeds each, before and after
(placements.md's method):
- the first hour's ghouls, of the first and second level (the ossuary's one, the dens' pairs, the newcomers' one, the
  barrow halls' threes: 53 of the eight worlds' placed groups): unchanged in every cell. A ghoul of those levels
  does not cast a second-level spell (its casting level is its own);
- a single third-level ghoul (a1's w6 and e1 newcomers, mere's): a lone warrior 90 → 85 %, a lone mage 10 → 5 %, the
  pair 100 % as before, a death for the lone warrior 10 → 15 %;
- the Bound Howe's four fourth-level ghouls: the pair 0 → 5 %; thorn's three of the third level at the kings' door:
  a lone warrior 0 → 5 %, the pair 20 → 35 %.
So no first-hour fight moves; deeper, a ghoul that touches and misses holds nobody, where Orsino's touch always
reached its save.

### 37. Ray of Frost and Acid Arrow: stopped by the census, a decision for the lead (19 November)

Both want only case 35's touch now (a ranged touch), and both are on a first-hour creation card. Neither is migrated:
each moves a level, and the level moves a card and every caster of a school.

**Ray of Frost.** The SRD's is a cantrip: a ranged touch for 1d3 cold. Orsino's (`ray_of_frost`) is a second-level
evocation, 2d6 cold, no attack roll, a second-level pick on the evoker's card.
- At the SRD's cantrip level, **every evoker** knows it (an evoker knows every cantrip of its school: .53 → 1.00 at
  every level), every other specialist loses it from its draws (.07–.20 → 0), drawn-school mages .13–.24 → .13; 1,786
  of 19,200 drawn mages move.
- **38 of the 2,233 installed classed creatures gain it** (an installed caster prepares every cantrip of its
  tradition: SpellSelection.prepare), 6 of them a1's: the s1 undertown's raiser, the s1 iv's mage, the s3 traveller,
  the arcology's quill, the Bound Howe's scholar and the fellowship's warden. The first town's raiser and the iv's mage
  are first-hour fights, and each would have a free 1d3 shot to spend its turns on.
- The evoker's card loses it at the second level (Prismatic Spray and Mind Blank beside Sound Lance).
- At Orsino's second level by the SRD's resolution, 1d3 for a second-level slot is worth less than the cantrips the
  evoker already has: not recommended.

**Acid Arrow.** The SRD's is second level: a ranged touch for 2d4 acid, and 2d4 more each round for a round each
three casting levels. Orsino's (`acid_arrow`) is first level, 1d4 acid, no attack roll, **the conjurer's first
pick**.
- At the SRD's second level, conjurers move 58.5–59 % (.49–.51 know it → .33–.36), drawn-school mages 16–20.5 %;
  1,178 of 19,200 drawn mages move.
- **The conjurer's card loses its first-level harm**: its first-level picks become Summon Vermin, Thunderclap and
  Blur, and Acid Arrow goes to the second level in place of Summon Monster. A player's first conjurer could not
  cast it until the third level.
- 6 installed classed creatures lose it (one each in a1, kite, thorn and ember, two in kahitude): the s1 iv's mage of
  four worlds and the arcology's quill.
- Its lingering acid wants a duration by casting level (a round each three), which conditions do not have (case
  14's open item): a fixed one more round at every level would be converted.
- Orsino's acid sets off its acid burn (a Fortitude save against 15, 1d6 a turn) on whoever it hurts, as its
  lightning sets off paralysis (case 35); the SRD's arrow has none. Kyr has no second acid, as it has electric beside
  lightning, so either option carries Orsino's burn or wants the trigger's exception named.

**The options, for each:**
1. **The SRD's whole** (Ray of Frost a cantrip; Acid Arrow second level, its lingering acid converted to one round).
   Moves the cards and draws above, and the installed casters named.
2. **The SRD's resolution at Orsino's level** (the ranged touch and the SRD's dice; structure fails, said, as
   Divine Favor's in case 23). Ray of Frost: not recommended (1d3 for a second-level slot). Acid Arrow at the first
   level: 2d4 acid on a ranged touch (about one in two lands on the first hour's foes, for 5 where Orsino's sure 1d4
   was 2.5), no lingering acid at the first and second casting levels, as the SRD's has none there; no card or draw
   moves.
3. **Orsino's, as they stand.**

Recommended: Acid Arrow by 2 (the conjurer keeps its first pick, and the touch and dice are the SRD's); Ray of Frost
by 3 until the installed casters' cantrips are reviewed (a free 1d3 shot for every hostile arcane caster of the first
town is a change of the first hour's fights, not a slice). **A decision for the lead.**

### 38. Resist Energy against fire, and a flat resistance laid by a spell (19 November): adapted

Orsino's Resist Fire is the SRD's Resist Energy chosen against fire, at its level already (the second). A typed flat
resistance existed for a creature's kind (the SRD adaptation briefing's defenses: fire 10), never for a condition, so
a spell could only lay Orsino's fraction. Spec: `test/resist-energy` (3 cases).

**The mechanic built: a flat resistance in the modifiers** (`resist`, src/rules/modifiers.ts), `{ fire: 10 }`:
- that much off each blow of the kind, after any fraction, as a kind's flat resistance is (Defenses.mitigate reads
  both: `Defenses.flat`);
- of two sources the better for each kind, never summed (the SRD's rule; ModifierSet.sum takes the greater);
- told as a defense that held ("…keeps off 10"), the event's account naming it (DefenseTelling);
- a condition, a trait or a thing worn may carry it; the canon refuses one that is not a whole number off a known harm.

**The spell** (a hand entry over Orsino's, data/catalog/abilities.json; the hand condition `fire_resistant`):
- second level, divine, Life, and the SRD's school, abjuration, beside its domain (exact);
- on the caster or one ally (exact: the creature touched), its save the SRD's harmless one (converted, as case 32's);
- ten off each blow of fire (exact at the first six casting levels);
- the fight, twenty rounds (the census's long: the SRD's ten minutes a level). It persists past a fight for what is
  left of its rounds, as the fireproof ward does, so it may be laid before one (FieldUse, as before).

**Converted:** ten at every casting level, where the SRD's is twenty from the seventh and thirty from the eleventh (a
condition's amount does not read its caster); fire alone, where the SRD's caster chooses the energy (Orsino's spell
is the fire one: a cold or acid one would be a spell of its own). **Adapted:** the twenty rounds are rounds of
fighting, however long between them. **Omitted:** spell resistance. Before: Orsino's fireproof, half of fire's harm,
for three rounds. Against a blow of 14 fire, Orsino's ward let 7 through and the SRD's lets 4; against 30, 15 and 20;
with both, 5. The census grades it S✓ R✓ I✓: 26 of 119 pass in resolution now.

**The census.** No draw or card moves (its level and domain are Orsino's; a divine spell's school draws nothing). A
vitalist knows it about one time in five (.19 at the first level, .23 at the seventh), every other cleric .06–.14.
None of the 2,233 installed classed creatures of a1 and the six fidelity countries knows it, and no creation card
holds it. What moves is every casting, and the specs that cast it as a cleric's preset spell: `test/domain-model` and
`test/causal-integration` now read `fire_resistant` (twenty rounds, ten off) where they read Orsino's `fireproof`.
The Fire's law (case 4: one fire a turn) is still held off by it.

### 39. Bane by the SRD's numbers (19 November): adapted

Orsino's Mass Curse is the SRD's Bane, a first-level cleric spell kept at Orsino's third. Moved to the SRD's level by
the draw by rank (case 11), as Command was (case 33). Spec: `test/bane` (2 cases).

**The spell** (a hand entry over Orsino's, data/catalog/abilities.json; the hand condition `baned`):
- named Bane; first level (Orsino's third), divine, Death, and the SRD's school, enchantment, beside its domain
  (exact);
- every foe (converted: the SRD's are the foes within fifty feet; Kyr's field has no distances, as Bless's in case
  17);
- a Will save to negate (exact: the fear save, made with Wisdom, so a ward against fear, Remove Fear's, helps against
  it, as the SRD's morale bonus does) at case 7's difficulty for a first-level spell (exact at the census's caster);
- whoever fails is baned: −1 to hit and −1 on saves against fear (exact);
- a minute, ten rounds, at every casting level (converted, case 14's rule).

**Omitted:** spell resistance; the SRD's Bane dispelling Bless. Before: Orsino's cursed (−1 to every score) for
three rounds on every foe against 15 + the caster's level, at the third level. The census grades it S✓ R✓ I✓: 27 of
119 pass in resolution now.

**The census** (the lead's pools, 200 humans for each calling and level; scratch /var/tmp/kyrie/srd5-scratch):
- 1,989 of 19,200 drawn casters move (10.4 %), all clerics, none a mage or bard. A cleric of any other way gains it
  at the first level, one time in ten (.10–.14, where none knew it before the fifth); a deathspeaker, whose domain it
  is, moves 60 % (.52 knew it as a third-level spell from the first, .35–.38 now draw it among the first level's).
- **The deathspeaker's creation card moves:** Bane among its first-level picks with Darkbolt and Cause Fear
  (Rejuvenate gives way), and Healing Touch at the second level in place of Protection from Darkness.
- **The installed casters** of a1 and the six fidelity countries (2,233 classed creatures): six gain it and none lose
  anything: a1's s2 preacher, wren's and ember's keep chaplains, kahitude's and ember's s1 Anselm, ember's fellowship
  recorder.
- **The kinds that know it:** Orsino's mummy (the halls' five of the dens) and the balor. The mummies' placements fought
  before and after (20 seeds, the four first-level companies): every cell the same but a pair's death against the
  third-level embalmers, 45 → 40 %.
- **Fights:** a first-level cleric beside a warrior casts it in every fight against three rats (won 100 %) or two
  zombies (95 %); a fifth-level one against three zombies or two wolves wins as with Orsino's curse (100 %), and a
  hostile one against a lone warrior is as deadly as Orsino's (33–35 %): −1 to hit for a minute weighs about what −1 to
  every score weighed for three rounds.
- **A kept trace re-digested:** `test/fixtures/traces/wren-tower-climbed.transcript.json`, three digests
  (scripts/redigest-trace): wren's keep chaplain now knows Bane, so the drawn world underneath is other from the first
  step; the same commands come to the same place, watch and words. test/traces passes (3), as before the slice.

### 40. Mirror Image, and figments that take blows (19 November): adapted

Orsino's Mirror Image was a bundle of numbers (two harder to hit, +2 to every save, an evasion of 15: four hits in
five turned aside, for three rounds), which the census passed in structure and failed only for its duration. The
SRD's is a count of images, each one blow's worth. A second-level pick on the illusionist's creation card, and taught
in two adventures (the Parliament of Books' mirror, the Book of Faces' Thole). Spec: `test/mirror-image` (3 cases).

**The mechanic built: images** (`Images`, src/rules/images.ts; a condition's `images` modifier, dice thrown as the
condition is laid by its caster's values, as temporary hit points are; the instance keeps the count):
- each attack roll made at the holder, a weapon's blow or a touch (case 35), first falls at random on the holder or
  on one of its images, each as likely;
- one that falls on an image is struck at it as though it wore nothing (the SRD's image AC is 10, its size and its
  maker's Dexterity); a hit puts that image out, a miss does nothing; the holder is not struck either way;
- when the last is gone the condition ends, told as it ends ("Bram's images vanish");
- harm without an attack roll (a burst, a missile, a save) passes them by;
- told as the blow's own: "Dain strikes at Bram, and it falls on an image, which vanishes"; "… uses Cleave on Bram,
  and it falls on an image and misses it". The aim's odds on the holder are the blow's share that reaches it.

**The spell** (a hand entry over Orsino's, and over its condition):
- second level, arcane, illusion, on the caster (exact);
- 1d4 images and one each three casting levels, to eight (exact: thrown as it is cast);
- a minute, ten rounds, at every casting level (converted, case 14's rule).

**Omitted:** the images' moving within five feet; a foe that cannot see being fooled the less; spells cast at an
image. The census grades it S✓ R✓ I✓: 28 of 119 pass in resolution now.

**The census.** No draw or card moves (its level and school are Orsino's). Of the 2,233 installed classed creatures
of a1 and the six fidelity countries one knows it, kahitude's Bound Howe scholar. A hostile third-level mage who casts
it beside two third-level zombies against a warrior and a mage of the company: the company wins 60 % (Orsino's, 68 %);
a company's mage who casts it is as safe as before (98 %). What moves is every casting: a few blows absorbed, then
none, where Orsino's turned four hits in five for three rounds.

### 41. The first hour's other low spells: stopped by the census, decisions for the lead (19 November)

Every first- and second-level cleric and mage spell with an SRD counterpart that a first-hour creation card holds, and
that the engine can now run, has been taken (cases 35, 36, 38–40) or written up (case 37) but these six. Each moves a
card, a cantrip every caster of a way knows, or a recorded journey; none is migrated. The census is the lead's pools
(200 humans for each calling and level, before and after; scratch /var/tmp/kyrie/srd5-scratch) and the creation cards
(FirstSpells.picks).

| Spell | The SRD's | Orsino's | What moving it moves |
|---|---|---|---|
| Blur | second level; one creature touched; concealment, one blow in five missing (Kyr's evasion 3); a minute a level | first level; on the caster, three rounds; `blurred`: one harder to hit, +2 against magic, evasion 10 (eleven hits in twenty turned) | **two cards:** the illusionist's first pick (every illusionist knows it: 1.00 → .47) and the conjurer's (Mage Armor takes its place); 13–23.5 % of other mages |
| Barkskin | second level (druid); one creature touched; +2 natural armour, +1 each three levels past the third, to +5; ten minutes a level | first level, Nature; on the caster, two harder to hit, three rounds | **two cards:** the wildcaller's first-level pick and the oceanist's (Rejuvenate and Shadow Cloak take their places); wildcallers 50 %, other clerics 12.5–15.5 % |
| Hold Animal | second level (druid); one animal; Will negates; a round a level | a Law cantrip; one animal paralysed three rounds, saved with Strength against 15 + level | **every oathkeeper** (1.00 → .53, its card's second level gains it); 17.5–23 % of other clerics gain it |
| Cure Minor Wounds | a cantrip; one point | a Life cantrip; 1d4 | every vitalist (the first cleric way) and the 51 of 2,233 installed classed creatures who know it (8 of a1's) heal 1 where it healed 2.5, in a fight and at Tend (a cantrip spends no slot); test/tend-here and test/small/tended read it |
| Lesser Restoration | second level; ends magical penalties to scores (Kyr's weakened, cursed, fatigue), repairs ability damage, ends fatigue | ends poison, cursed and blinded | the vitalist's second-level pick **loses its cure for poison**, the first hour's spiders' killer; the march's three recorded campaigns (test/fixtures/march) hold it |
| Darkness (Create Darkness) | second level; an object sheds shadow, concealment to all about it; no save; ten minutes a level | blinds every foe, a Reflex save against 15 + level | **four cards** hold it at the second level (shadowmancer, stormcaller, veneficium, warbringer): a hold on every foe becomes a shadow over both sides |

**The options, for each:** the SRD's whole (moves the above); the SRD's resolution at Orsino's level (Blur and
Barkskin: no card moves, as Divine Favor in case 23; Hold Animal a cantrip by the SRD's numbers; not open to Cure
Minor Wounds, Lesser Restoration or Darkness, whose level is the SRD's already); or Orsino's as they stand.

Recommended: Blur and Barkskin by their resolution at Orsino's level (Blur: evasion 3 on one ally, ten rounds;
Barkskin two harder to hit, adding to armour, on one ally for the fight); Cure Minor Wounds the SRD's (one point is
what a cantrip is for, and Tend's healing is a rest's to give, not a cantrip's) only with Tend measured first; Lesser
Restoration and Darkness as they stand until the first hour has another cure for poison and the shadow's concealment
is a fight rule (the field has no light in a fight); Hold Animal as it stands. **Decisions for the lead.**

### 42. Remove Disease by the SRD's resolution (19 November): adapted

Orsino's Cure Disease already did what the SRD's Remove Disease does: it ends every condition whose harm is disease
(Effects.removes reads a pattern by a condition's kind of harm as well as its name, so the dead's Infected goes with
the Diseased). What it lacked was the SRD's school, and its harmless save declared. Spec: `test/remove-disease` (3
cases): on a companion in a fight it ends the Diseased and the Infected and leaves poison and a blessing; out of a
fight it is cast from the third level's slot (FieldUse) and ends the Infected.

**The spell** (a hand entry over Orsino's): third level, divine, Life, and the SRD's conjuration beside it (exact);
on the caster or one ally (exact); at once (exact); its save the SRD's harmless one (converted, as case 32's). Kept:
Orsino's name, which the dens' Scroll of Cure Disease bears (the scroll's own use ends the Diseased alone, and is not
this spell). Omitted: the parasites and green slime it kills. The census grades it S✓ R✓ I✓: 29 of 119 pass in
resolution now.

**The census.** No draw or card moves: its level and domain are Orsino's, and a divine spell's school draws nothing.
A vitalist knows it .37 at the seventh level, every other cleric .14–.18; none of the 2,233 installed classed
creatures knows it. The Parliament of Books teaches it (Orme's leaf). Nothing that is cast moves: the removal is
Orsino's.

### 43. Spell resistance (19 November): built, the resist stage

The capability the manifest found most wanted: `resist.spell` blocked 197 of the unmapped SRD records, 129 of them
alone. Proof-slices.md forbade an `sr` field until it rolls, is told and changes resolution; it now does all three.
Engine-pressure.md §4's resist stage, in the SRD's order (attack, spell resistance, save, effect). Spec:
`test/spell-resistance` (5 cases).

**The mechanic built** (`SpellResistance`, src/rules/spell-resistance.ts):
- a creature's spell resistance is a typed defense of its kind (`{ "kind": "spellResistance", "amount": 15 }`, beside
  reduction and regeneration; a variation may carry one), the best of them; the canon refuses one that is not a whole
  number;
- a spell allows it by its `spell.resistance` (the SRD's "Spell Resistance: Yes": never a harmless one, never one of
  objects alone);
- such a spell is checked once a casting against each creature it would fall on that has some, after its touch lands
  (case 35) and before any save: the caster's d20 and casting level against the resistance (exact);
- a check that fails leaves that one untouched by every effect of the spell; one that succeeds lets it fall as written;
- told as the caster's try ("The pixie resists the mage's spell, untouched by it"), the event (`resist`) carrying the
  die, the level and the resistance; the chronicle gives the dice;
- the monster manual says it ("Defenses: resists spells (19)").

**The data:** the fourteen migrated spells the SRD lets spell resistance answer now say so (Burning Hands, Calm
Emotions, Chain Lightning, Command, Cone of Cold, Fireball, Hold Person, Lightning Bolt, Magic Missile, Bane, Ghoul
Touch, Shocking Grasp, Sleep, Cause Fear), each one's note rid of its "Omitted: spell resistance". Plane Shift, whose
SRD entry allows it, keeps none (Kyr's casts it only on a willing company). The eight kinds whose SRD counterpart has
spell resistance carry the SRD's (exact): the pixie 15, the pseudodragon 19, the xill 21, the marilith 25, the balor
28, the astral deva 30, the solar and the titan 32.

**The census.** A new graded field, `resist`, in a spell's resolution (srd-fidelity.md): the fourteen exact, and no
spell that passed in resolution fails (29 of 119, as before). The creatures' defences read the SRD's spell resistance
(no longer the census's E): the pseudodragon and the xill now pass in defences (4 of 72 where 2). The manifest's
present capabilities gain `resist.spell`: **E0 records ready for a family adapter 78 → 207** (control 8 → 69, damage
23 → 74, protection 30 → 42, movement 8 → 13).

**What it moves:** nothing met in the first hour. None of the eight kinds is placed in a1 or the six countries' dens
(each met 0/0); a creature of the company has no spell resistance, so no spell cast at the company moves. A spell
cast at one of the eight now asks the check: a first-level mage gets past a pixie's 15 seven times in twenty (d20 +
1), a ninth-level one three times in four; a balor's 28 wants a 19 or a 20 from a ninth-level caster. No trace, card
or draw moves.

### 44. A duration by the caster, and Acid Arrow by the SRD's numbers (19 November): adapted

Case 37's Acid Arrow, held for the lead, taken by the owner's ruling of 19 November (an SRD-faithful slice lands
though it moves a card). It wanted case 35's ranged touch and a duration by casting level, "Kyr's durations do not
grow with the caster" (case 14's open item). Spec: `test/acid-arrow` (4 cases).

**The mechanic built: a duration by the caster** (`Lasting`, src/rules/lasting.ts). What an effect lays may last a
number of turns, as before, or an expression its caster's values settle as it is laid, as temporary hit points and
images are thrown (the SRD's "1 round/level" is `#castingLevel`, "1 minute/level" `10 * #castingLevel`). One that comes
to no turns lays nothing. A book's line says it at the first casting level and the tenth ("no turns at the first
casting level, 3 turns at the tenth"); the census reads it at its caster, the fifth; what a creature reads of a
condition it holds reads it there too. The canon refuses one that never comes to a turn.

**And a harm that sets off nothing** (an effect's or a turn-end tick's `triggers: false`): Orsino's kinds of harm lay
conditions by themselves (acid its acid burn, cold its freezing); the SRD's do not. Case 37 found that either option
for Acid Arrow carried Orsino's burn; now neither does.

**The spell** (a hand entry over Orsino's; the hand condition `acid_clinging`):
- second level (Orsino's first), arcane, conjuration (exact);
- one foe a ranged touch attack lands on (exact), 2d4 acid (exact);
- the acid clinging, 2d4 acid at the end of its holder's turn, for a round every three casting levels to six at the
  eighteenth (exact: none at the first and second);
- no spell resistance (the SRD's), no acid burn.

**Omitted:** its range. Before: Orsino's sure 1d4 acid at the first level, and its burn (a Fortitude save against
15, 1d6 a turn). The census grades it S✓ R✓ I✓: 30 of 119 pass in resolution, 39 in structure.

**The census** (the lead's pools, 200 humans for each calling and level; scratch /var/tmp/kyrie/srd6-scratch):
- 1,178 of 19,200 drawn mages move (6.1 %): conjurers 58.5–59 % (.49–.51 knew it, .33–.36 now), drawn-school mages
  16–20.5 %, other specialists 8–16 %; no cleric or bard. As case 37 measured.
- **The conjurer's creation card moves:** its first-level picks are Summon Vermin, Thunderclap and Blur (Acid Arrow
  gives way), and Acid Arrow is a second-level pick in place of Summon Monster. A player's first conjurer casts it
  from the third level.
- **The installed casters** (2,233 classed creatures of a1 and the six countries): six lose it and none gain it: the
  s1 iv's mage of kite, thorn, kahitude and ember, and the arcology's quill of a1 and kahitude.
- **A lone first-level conjurer**, fighting with its first-level harm in every slot (100 seeds): Orsino's Acid Arrow
  against three rats 36 %, two zombies 17 %, a ghoul 20 %; Thunderclap, the card's harm now, 66 %, 16 %, 26 %. The
  first hour is no deadlier for a player's conjurer; the four worlds' iv mages are a little kinder.

### 45. Ray of Frost by the SRD's numbers (19 November): adapted

Case 37's other held slice, taken by the owner's ruling of 19 November. Spec: `test/ray-of-frost` (2 cases).

**The spell** (a hand entry over Orsino's): a cantrip (Orsino's second level), arcane, evocation (exact); one foe a
ranged touch lands on (exact), 1d3 cold (exact); spell resistance answers it (case 43); its cold sets off none of
Orsino's freezing (case 44's `triggers: false`). **Omitted:** its range. Before: Orsino's sure 2d6 cold at the second
level. The census grades it S✓ R✓ I✓: 31 of 119 pass in resolution, 40 in structure.

**The census** (the lead's pools; scratch /var/tmp/kyrie/srd6-scratch):
- 1,761 of 19,200 drawn mages move (9.2 %): **every evoker knows it** (an evoker knows every cantrip of its school:
  .53–.55 → 1.00 at every level), other specialists lose it from their draws (.06–.20 → 0), drawn-school mages
  .12–.24 → .13; no cleric or bard.
- **The evoker's creation card moves:** its second-level picks are Prismatic Spray, Mind Blank and Sound Lance (Ray
  of Frost gives way); a first-level evoker has it from the first, as a cantrip.
- **38 of the 2,233 installed classed creatures gain it** (an installed caster prepares every cantrip of its
  tradition), five or six in each world: the first town's undertown raiser and its iv mage in all seven, the Bound
  Howe's scholar and the arcology's quill in all seven, wren's and ember's tower necromancer, kite's and thorn's
  fellowship warden, and a traveller or a scholar here and there. None loses anything.
- **The first-hour fights** that hold the two the first town meets, a1's undertown raiser (a second-level mage) and
  iv mage (first level), fought as installed by first-level companies (60 seeds each, won / someone down): before
  and after alike, the raiser 95/5 % for a lone warrior, 100/2 % a warrior and cleric, 55/45 % a thief, 18/82 % a
  mage; the iv mage 92/8, 98/2, 52/48 and 25/75 %. The battle's tactics spend a hostile caster's turns on its other
  spells, so a free 1d3 shot moves none of them.
- **A kept trace re-digested:** `test/fixtures/traces/wren-tower-climbed.transcript.json` (scripts/redigest-trace):
  wren's casters who gain the cantrip make the drawn world underneath other from the first step; the same commands
  come to the same place, watch and words. test/small/spell-school-glyphs reads the evoker's cantrips (Frostbite,
  Ray of Frost, Scald), and test/srd-fidelity Ray of Frost's ranged touch.

### 46. A minute a level, by the caster (19 November): six conversions made exact

Case 14's rule converted the SRD's "1 minute/level" to ten rounds at every casting level, because Kyr's durations did
not grow with the caster. Case 44 built that (Lasting), so the six migrated spells that took the conversion now last
ten rounds a casting level (`10 * #castingLevel`), the SRD's own: Bless, Bane, Shield of Faith, Protection from Evil,
Entangle and Mirror Image. The concordance's six duration conversions are gone; the census grades each duration exact
(each still S✓ R✓ I✓; 31 of 119 pass in resolution, as before). Their specs read thirty rounds at the third casting
level where they read ten.

**Left as they are:** Sleep (its ten rounds become ten watches cast at a band outside a fight, FieldUse.cast, case 14:
a minute a level would hold the undertown's sleepers fifty watches at the fifth); Hold Person (a round a level, five at
the census's caster, and likewise cast at a band); Divine Favor (the SRD's is one minute at every level, exact); Mage
Armor (an hour a level, the fight as converted).

**What it moves:** each of the six lays a condition of a fight (lifetime encounter), ended when the fight ends, so
only a fight past its tenth round at a caster of the second level or more is touched; no draw, card or installed
caster. The kept traces, march-journey, march-told and tend-here hold. Not run here (each over thirty seconds, CI's):
hessel, ombra-mage, ombra-cleric, deep-barrow, advancement, parliament-of-books-stacks.

### 47. The bone hound, and the skeleton's template (19 November): mapped; its defenses stopped by the census

Two placed kinds had no concordance entry: the bone hound (`hound/skeletal`, the hound under Orsino's skeletal
template, the bone_hound of the dens, the barrow halls and the mines) and the cave hound (`hound/cave`). Each now has
one: the bone hound the SRD's **wolf skeleton** (the nearest of its skeletons to a hound), the cave hound the riding
dog, as the hound is. The census grades both (74 creatures where 72): the bone hound differs in armour (Westernesse 8,
the SRD's 6), its chance to hit (50 %, the SRD's 40 %) and its defences (none, the SRD's damage reduction 5/bludgeoning
and immunity to cold); its blows and saves are the SRD's already.

**The skeleton's defenses, measured and not landed.** The SRD's skeleton template gives every skeleton reduction 5
unless bludgeoning and immunity to cold. Kyr's `skeletal` variation is that template for every kind it is laid on (the
bone hounds and the Bound Howe's mounts), so the defenses would go on the variation. Fought where placed (the eight
worlds' groups; 40 seeds; won · median harm · a death, for a lone first-level warrior, then a first-level warrior and
cleric):

| Placed as | Groups | As it stands | With 5/bludgeoning and cold |
|---|---|---|---|
| 2 × bone hound L1 (iscoed's w3–w6 and e1 dens: the golden route's country) | 5 | 93 % · 8–15 % · 8 %; 98–100 % | 57–60 % · 33–50 % · 40–43 %; 93–95 % |
| 2 × bone hound L2 (iscoed's newcomers) | 3 | 80 % · 19 % · 20 %; 95 % | 55 % · 58 % · 45 %; 85 % |
| 3 × bone hound L2 (the halls, the ossuary, the haulage) | 5 | 50 % · 100 % · 50 %; 85 % | 18 % · 100 % · 83 %; 68 % |
| 3 × skeletal horse L4 (the Bound Howe's mounts) | 8 | 28 % · 73 % dead; 73 % | 23 % · 78 % dead; 43 % |

A warrior's battleaxe is slashing; only the cleric's staff passes the reduction. A lone first-level warrior's death
against iscoed's denned pairs would go from one in twelve to two in five: markedly deadlier in the first hour, so by
the brief (keep the first hour survivable) it does not land. **For the owner:** the SRD's answer to a skeleton is a
blunt weapon (a mace, a staff, a club); whether the first hour should teach that (a warning before a barrow's dens, a
club to hand at the first town) is a design choice, not the SRD's. Until then the bone hound keeps Orsino's template. (Decided 19 November: landed, the first den's pairs held; case 53.)

### 48. An effect's kind read from a body, and Hold Animal by the SRD's numbers (19 November): adapted

Case 41's Hold Animal, held for the lead, taken by the owner's ruling. Looking at it found that **Orsino's Hold Animal
fell on no one**: an effect's `targetTrait` (the SRD's "one animal", "one humanoid", "undead") was read only from a
creature's traits, and no Kyr animal bears an `animal` trait (people bear `humanoid` by their ancestry, the dead
`undead`). Spec: `test/hold-animal` (3 cases).

**The mechanic built** (`Targeting.bears`, src/targeting.ts): a creature is of the kind an effect wants if it bears it
as a trait, or if its body is of that kind or type (a wolf is an animal and a beast). Read by what an ability is
offered against and by whom it falls on, one route. Besides Hold Animal it wakes Orsino's Animate Animal (a dead
animal of the caster's own side raised), which had likewise fallen on none; and the one body of the humanoid type,
the yuan-ti, now answers the twelve spells that want a humanoid (Hold Person, Charm Person, Ghoul Touch among them).

**The spell** (a hand entry over Orsino's), Hold Person's for an animal:
- second level (the SRD's druid's; Orsino's a cantrip), divine, Law, and the SRD's school, enchantment (exact);
- one animal (exact), a Will save to negate at case 7's difficulty, saved again each turn it loses (case 18's
  shaking off), spell resistance answering it (case 43);
- paralysed a round a casting level (exact: Lasting, case 44).

**Omitted:** the held helpless. Before: Orsino's Law cantrip, three rounds against 15 + the caster's level saved with
Strength, which nothing could be aimed at. The census grades it S✓ R✓ I✓: 32 of 119 pass in resolution, 41 in
structure.

**The census** (the lead's pools; scratch /var/tmp/kyrie/srd6-scratch):
- 2,003 of 19,200 drawn casters move (10.4 %), all clerics: **every oathkeeper** loses it as a cantrip (1.00 → .53,
  a second-level spell now drawn by rank), other clerics gain it at the second level (.04 at the first, .08 → .20 for
  drawn domains by the seventh).
- **The oathkeeper's creation card moves:** Hold Animal at the second level in place of Holy Wrath (Shield of Faith,
  Command and Protection from Evil at the first, Hold Person and Consecrated Ground beside it).
- **The installed casters:** 51 of 2,233 lose the cantrip (3–12 in each world), none gain it. It had fallen on no
  one, so none of their fights moves.
- **The first hour:** a lone first-level oathkeeper as drawn never cast Orsino's (the tactics never found a target):
  against two wolves 41 %, three rats 79 %, two zombies 63 % before, and its cantrips no longer include it. The first
  town's raiser and iv mage, who know Animate Animal, fought as installed (60 seeds): every cell as before.
- **A kept trace re-digested:** wren-tower-climbed (wren's installed clerics lose the cantrip, so the drawn world
  underneath is other from the first step); the same commands come to the same place, watch and words.

### 49. Blur by the SRD's numbers (19 November): adapted

Case 41's Blur, held for the lead (it moves two creation cards), taken by the owner's ruling. Spec: `test/blur` (2).

**The spell** (a hand entry over Orsino's; the hand condition `concealed`, so Orsino's `blurred`, which two of its
other abilities, an animal's and the Book of Faces lay, is untouched):
- second level (Orsino's first), arcane, illusion (exact);
- on the caster or one ally (exact: the creature touched), its save the SRD's harmless one (converted, as case 19's);
- concealment, one blow in five that would land going astray (converted: Westernesse's evasion of 3, a hit turned on
  d20 at or above 17, where the SRD rolls its 20 % before the attack);
- a minute a casting level (exact: Lasting).

**Omitted:** whoever sees through it. Before: Orsino's first level, on the caster alone, three rounds of one harder to
hit, +2 against magic and an evasion of 10 (eleven hits in twenty turned). The census grades it S✓ R✓ I✓: 33 of 119
pass in resolution, 42 in structure.

**The census** (scratch /var/tmp/kyrie/srd6-scratch):
- 1,556 of 19,200 drawn mages move (8.1 %): illusionists 98–100 % (every one knew it, .47–.48 now), drawn-school mages
  18.5–24 %, conjurers at the first level 13.5 %; no cleric or bard.
- **Two creation cards move:** the illusionist's first-level picks are Firebolt, Mage Armor and Drench (Blur gives
  way), and Blur is a second-level pick beside Mirror Image and Confusion (Ghoul Touch gives way); the conjurer's
  first-level picks are Summon Vermin, Thunderclap and Mage Armor (Blur gives way).
- **The installed casters:** three of 2,233 lose it and none gain it: thorn's fellowship head, wren's first-town iv
  mage and mere's undertown raiser.
- **A lone first-level illusionist or conjurer** as drawn (100 seeds, before → after): against three rats 43 → 48 %
  and 42 → 42 %; two zombies 3 → 5 % and 4 → 4 %; a ghoul 3 → 4 % and 22 → 21 %; two wolves 2 → 3 % and 3 → 3 %.
  The tactics did not spend a turn on Orsino's Blur; the first hour is no deadlier.
- **Where play goes moves once:** the Book of Faces' Master of Measures (Thole) teaches Mage Armor, Blur and Mirror
  Image; a first-level mage who takes Blur from him now learns it for later, as Mirror Image, and the lesson prepared
  at once is Mage Armor. test/ombra-mage trains Mage Armor and then Blur (learned, not prepared). wren-tower-climbed
  re-digested (wren's iv mage loses Blur): the same place, watch and words.

### 50. Barkskin by the SRD's numbers (19 November): adapted

Case 41's Barkskin, held for the lead (it moves two creation cards), taken by the owner's ruling. Spec:
`test/barkskin` (2).

**The spell** (a hand entry over Orsino's; Orsino's condition `barkskin` kept, which a consumable lays too):
- second level (the SRD's druid's; Orsino's first), divine, Nature, and the SRD's school, transmutation (exact);
- on the caster or one ally (exact: the creature touched);
- two harder to hit, added to worn armour (the SRD's natural armour +2, which stacks with armour worn);
- ten minutes a casting level, a hundred rounds (exact: Lasting); it lasts the fight (the condition's lifetime).

**Converted:** +2 at every casting level, where the SRD's grows a point each three levels past the third to +5 at the
twelfth (a condition's amount does not read its caster; +2 is the census's caster's). Before: Orsino's first level, on
the caster alone, three rounds. The census grades it S✓ R✓ I✓: 34 of 119 pass in resolution, 43 in structure.

**The census** (scratch /var/tmp/kyrie/srd6-scratch):
- 1,647 of 19,200 drawn clerics move (8.6 %): wildcallers 49.5–51 % (.40–.45 → .33–.36), drawn domains 13.5–19 %,
  oceanists at the first level 10.5 %; no mage or bard.
- **Two creation cards move:** the wildcaller's first-level picks are Hornet Swarm, Entangle and Rejuvenate
  (Barkskin gives way) and Barkskin is a second-level pick in place of Healing Touch; the oceanist's are Aqua Bolt,
  Rejuvenate and Shadow Cloak (Barkskin gives way).
- **The installed casters:** four of 2,233 lose it and none gain it: a1's fellowship head, kite's s2 traveller,
  kahitude's keep chaplain and mere's s2 preacher.
- **A lone first-level wildcaller or oceanist** as drawn (100 seeds, before → after): against three rats 92 → 95 %
  and 87 → 87 %; two zombies 76 → 80 % and 65 → 65 %; two wolves 50 → 56 % and 38 → 38 %. No deadlier.

### 51. Cure Minor Wounds: stopped by the census (19 November)

Case 41's Cure Minor Wounds, the vitalist's (the first cleric way's) cantrip, tried by the SRD's numbers under the
owner's ruling: a cantrip, one point on one ally, conjuration beside Life (Orsino's 1d4). Written and measured, not
landed. A lone first-level vitalist as drawn (100 seeds, before → after, won · someone down):

| Against | Orsino's 1d4 | The SRD's one point |
|---|---|---|
| Three rats | 89 % · 11 % | 80 % · 20 % |
| Two zombies | 67 % · 33 % | 56 % · 44 % |
| Two wolves | 42 % · 58 % | 36 % · 64 % |

The cause is the battle's tactics, not the point: a hurt vitalist spends its turn on its healing cantrip whatever it
heals (97–156 casts in a hundred fights, where it struck 193–288 times), so a cure of one point is a turn lost. A lone
first-level vitalist's first hour would be markedly deadlier (a death against two zombies one in three → near one in
two), so by the brief it does not land. **What would let it land:** the tactics weighing a heal by what it mends
against what a blow would do (an engine change of the tactics', to be measured over every caster), after which the
SRD's point costs a lone vitalist nothing. Out of a fight, Tend (case 41's concern) would mend each member one point
between rests where it mends 1d4.

### 52. Vampiric Touch by the SRD's numbers (19 November): adapted

Orsino's Life Drain is the SRD's Vampiric Touch, named in case 35 as waiting for the touch. It is a power of nine kinds
of the dead (the ghoul, the spirit, the wraith, the revenant, the banshee, the mummy, the lich, the vampire, the
wendigo) and of the vampiric template, and a Death spell of clerics. Spec: `test/vampiric-touch` (2).

**The spell** (a hand entry over Orsino's, named Vampiric Touch):
- third level (the SRD's wizard's; Orsino's second), divine, Death, and the SRD's school, necromancy (exact; Kyr's
  casts it as a cleric of Death, and the dead as their own);
- one foe a melee touch lands on (exact), 1d6 negative energy (Kyr's necrotic) every two casting levels to 10d6
  (exact: nothing at the first casting level), no save (exact), spell resistance answering it;
- its harm sets off none of Orsino's necrotic disease (case 44's `triggers: false`, now read by a drain too).

**Converted:** what it draws mends its caster (Kyr's drain), where the SRD's gives as many temporary hit points for an
hour. Before: Orsino's 1d6 necrotic at every level, no touch, a magic save against 15 negating it. The census grades it
S✓ R✓ I✓: 35 of 119 pass in resolution, 44 in structure.

**The census** (scratch /var/tmp/kyrie/srd6-scratch):
- 2,073 of 19,200 drawn clerics move (10.8 %): every deathspeaker (it is their domain's: 1.00 → .53–.54, now drawn by
  rank among the third level's), drawn domains 17.5–25 % (.17–.27 → .05–.15); no mage or bard.
- **The deathspeaker's creation card moves:** Vampiric Touch is a third-level pick (Protection from Darkness takes
  its second-level place).
- **The installed casters:** none of the 2,233 moves.
- **The kinds that know it**, every placement of the eight worlds fought by the four first-level companies (20 seeds,
  won · someone down for a lone warrior / a warrior and cleric / a thief / a mage): the first hour's ghouls (first and
  second level) as before, in every cell (a kind casts at its own Hit Dice, and those do not reach a third-level
  spell). Deeper, most are kinder: a single third-level ghoul 85·15 / 100·10 / 10·90 / 5·95 → 90·10 / 100·0 /
  20·80 / 20·80; the spirits' third-level pairs 30·70 / 90·70 → 65·35 / 100·10 for the warrior and the pair; the
  wraiths' pairs 5 → 25 % for a lone warrior; a single fifth-level revenant 45 → 80 %; the halls' third-level mummy
  35 → 60 %. One is deadlier: the thirteenth-level revenant of eight worlds' deep sites, which a first-level warrior
  and cleric won 70 % of the time against Orsino's drain, wins 25 % against the SRD's 6d6 touch (a lone warrior
  10 → 0 %); it is met by no first-hour company.
- test/monster-powers fights its vampire at the fifth level, where it casts a third-level spell.

### 53. The skeleton's defenses (19 November): adapted, a first-hour pair held

Case 47's measured slice, landed by the lead's ruling of 19 November: the SRD skeleton template's damage reduction
5/bludgeoning and immunity to cold on every skeletal kind, but the first hour's denned bone-hound pairs on Iscoed's
golden route, **adapted: first-hour pair held until a blunt weapon is on offer in the first town**. Spec:
`test/skeletal-defenses` (3).

**The variation** (`skeletal`, data/catalog/variations.json):
- damage reduction 5 unless bludgeoning, and immunity to cold (exact: a club's blow passes, a blade's and a point's
  lose five, cold does nothing);
- Orsino's Bone Resilience (half of a point's blow, twice a club's) given up for them: the SRD skeleton has neither,
  and keeping both would have taken a spear's blow to nothing. Its proof against bleeding it keeps, as a Kyr trait of
  its own (`bloodless`);
- its Hit Dice, armour and blows stay Orsino's template's (the census's other differences, armour 8 → 6 and hit
  50 → 40 %, are left).

**The route:** a template that is a stat block now makes the kind composed with it, as a variation that is one does
(Content.created, CreatureVariants.borne): the Bound Howe's mounts (`Species horse. Undead skeletal.`) are the
skeletal horse, with its defenses, where the template had laid only its traits and scores.

**The hold** (`skeletal_held`, the same template without the SRD's defenses and with Orsino's Bone Resilience, never
drawn as a template; `bone_hound_held` in aliases.json): a work's den at the first level (RegionStock.den, `Level 1`)
of a skeletal kind is written as its held twin (RegionStock.held), and a skeletal kind with no twin there is an error.
Only Iscoed's five denned pairs are such dens in the eight worlds. The newcomers who take a cleared work later
(RegionRenewal, second and third level) are not held.

**The census:** the bone hound passes in defences (5 of 74 where 4); Orsino's skeletal template is graded adapted
in the coverage report.

**What it moves** (placed-dr against placed-base, the eight worlds; 40 seeds; lone first-level warrior won · a death,
then a first-level warrior and cleric won · a death):

| Placed as | Groups | Before | After |
|---|---|---|---|
| 2 × bone hound L1, denned (iscoed w3–w6, e1) | 5 | 93 % · 8 %; 98–100 % · 5–8 % | held: the same, to the seed |
| 2 × bone hound L2, newcomers (iscoed w3, w4, w6) | 3 | 80 % · 20 %; 95 % · 8 % | 55 % · 45 %; 88 % · 15 % |
| 2 × bone hound L3, newcomers (iscoed w5, e1) | 2 | 78 % · 23 %; 93 % · 13 % | 38 % · 63 %; 85 % · 28 % |
| 3 × bone hound L2 (the halls, the ossuary, the haulage) | 5 | 50 % · 50 %; 88 % · 23 % | 18 % · 83 %; 68 % · 43 % |
| 3 × bone hound L3 (ember's kings' door) | 1 | 40 % · 60 %; 73 % · 38 % | 15 % · 85 %; 48 % · 55 % |
| 1 × great bone hound L5 (the embalmers' halls) | 2 | 78 % · 23 %; 95 % · 15 % | 43 % · 57 %; 90 % · 20 % |
| 3 × skeletal horse L4 (the Bound Howe's mounts, all eight) | 8 | 28 % · 73 %; 75 % · 35 % | 23 % · 78 %; 50 % · 63 % |

**21 placed groups move, 5 are held.** A lone first-level thief or mage, already near-certain to lose to each moved
group (0–8 %), now loses every one. The warrior's battleaxe is slashing; the cleric's staff passes the reduction. Not
placed in the eight worlds and moved where they are: the unquiet tower's watchdog (a second-level bone hound) and any
den's dead beasts drawn skeletal in a barrow or a ruin (RegionEcology.variant; none in the eight). The second-level
newcomers of Iscoed's golden route are the move nearest the first hour (a lone warrior's death one in five → nearly
one in two), met only once a company has cleared a work and some nights have passed.

**The Bound Howe moves.** Fought in the howe itself (test/bound-howe-under, kahitude, four of warrior, cleric, thief
and mage), the mounts take long enough to put down that the bells wake the king's riders (two sixth-level revenants)
into the fight: four of the fourth level, who had taken the horse-hall with no one down, now all go down, and so do
four of the fifth; four of the sixth take it with one down. In the arena alone (no riders), four of the fourth level
still win 98 % (100 % before). The spec now says four of the sixth; the howe's asking level was already register
§45's balance question. **For the lead:** if the howe should still be taken at the fourth level, its mounts could be
held as the first den's are (`Undead skeletal_held`), a non-SRD choice.

### 54. A heal weighed by what it mends, and Cure Minor Wounds by the SRD's point (19 November): adapted, landed

Case 51's way through, built and measured, held for a green main, then **landed by the lead's decision** the same
day (its own commit, the measures re-run on the branch as it then stood: every cell the same as first measured).

**The tactics' change** (Tactics.score): a heal on an ally weighed by the least of the ally's hurt, ten, and **what it
mends on the average** (its dice at their mean at the caster's values, `Tactics.mends`), three a point, where it was
weighed by the hurt alone. A cure of 1d8+1 weighs as before on anyone five down; a cantrip of 1d4 weighs six, less
than a blow (ten), and is cast only when nothing else is.

**Cure Minor Wounds by the SRD's numbers** (case 51's hand entry: a cantrip, one point, conjuration beside Life):
under the weighed tactics it is never chosen over a blow in a fight, so the SRD's point costs the vitalist nothing:
every cell below is the same with Orsino's 1d4 and with the SRD's one point.

**Every caster way, before → after** (a lone first-level caster as drawn, 100 seeds, won %; then beside a first-level
warrior; the eight mage schools, twelve cleric ways and the bard; only the cells that move by more than two points):

| Way | Alone | Beside a warrior |
|---|---|---|
| vitalist | three rats 89 → 84; two zombies 67 → 74; two wolves 42 → 49; a ghoul 94 → 93 | as before (±1) |
| cherubist | three rats 92 → 88; two zombies 71 → 76; a ghoul 98 → 95 | three wolves 92 → 87 |
| lightbringer | three rats 85 → 82; two wolves 50 → 47 | as before (±1) |
| every other way, the mages, the bard | within two points | within two points |

The heals cast fall to a tenth for the vitalist (156 → 19 in a hundred fights against two wolves) and to none for the
lightbringer, whose healing is a cantrip. **The worst move is five points** (the vitalist against three rats, the
cherubist and a warrior against three wolves), at the edge of the lead's "a few"; against the harder groups the
vitalist gains seven. **Moved besides:** a warrior's choice to drink a healing draught weighs the same way (ItemCatalog.used reads as an
ability), so test/novice-covenant's warrior against one man in arms wins 17 of 20 where it won 16 (67 of 100, its
'grave' band 25–60 % and its slack of 20): the spec now fights forty of each, 31 of 40 won. Out of a fight, Tend
(FieldUse) is untouched by the tactics, so the SRD's point heals one between rests where 1d4 healed 2.5; test/tend-here
and test/small/tended hold. The census grades Cure Minor Wounds S✓ (conjuration beside Life); its harm to the undead
omitted.

### 55. Flesh to Stone by the SRD's numbers (19 November): adapted, a slice that moves nothing

Chosen under the lead's stabilization (prefer a slice that moves nothing): a sixth-level spell whose level and school
are the SRD's already, so no draw moves, and that no installed creature of the eight worlds knows. Spec:
`test/flesh-to-stone` (2).

**The spell** (a hand entry over Orsino's): sixth level, arcane, transmutation (exact, as Orsino's); one foe (exact);
a Fortitude save to negate (exact) at case 7's difficulty (16 + the casting score's modifier + half the casting
level); spell resistance answering it (exact).

**Converted:** the SRD's instantaneous stone, which lasts, is Kyr's petrified for the fight it is laid in (the
condition's lifetime ends with the fight; Stone to Flesh ends it sooner); written as a thousand rounds, so cast at a
band outside a fight (FieldUse.cast) it holds them a thousand watches, near enough the SRD's for good. **Omitted:** the
stone kept past a fight, and the gear turned with its wearer. Before: Orsino's ten rounds against 18 and the caster's
whole level, no spell resistance. The census grades it S✓ R✓ I✓: 36 of 119 pass in resolution, 35 proved in play.

**What it moves:** no drawn caster's spells (its level and school unchanged), no creation card (a sixth-level spell),
no installed creature (none of the eight worlds' knows it), no first-hour fight. Met only by a mage of the eleventh
level who has learned it (the Orsino world's scene that teaches it), and by the discerner (a cave kind, which casts at
its own Hit Dice: never below the eleventh).

### 56. The earlier elemental spells' harm, setting off nothing (19 November): adapted; Burning Hands held

Case 44's `triggers: false` (the SRD's harm lays no condition by its kind, where Orsino's fire burns and its cold
freezes) on the elemental spells migrated before it. Ray of Frost, Acid Arrow and Vampiric Touch had it already.

**Landed** (each a hand entry's harm, its note saying so): Fireball (no burning), Cone of Cold (no freezing), and
Lightning Bolt, Chain Lightning and Shocking Grasp, whose electricity set nothing off already (Orsino's paralysis
answers its `lightning`, not Kyr's `electric`), declared so. **What it moves:** no draw, card or installed creature
(none of the eight worlds' installed creatures knows Burning Hands, Fireball or Cone of Cold), no first-hour fight.
A caster who knows only the spell, every slot spent on it (100 seeds, won %, before → after): a fifth-level mage's
Fireball against three fifth-level rats 100 → 100, two wolves 25 → 27, two ghouls 9 → 2; a ninth-level mage's Cone
of Cold against three rats 100 → 100, two wolves 45 → 38, two ghouls 12 → 11. The specs of each spell hold.

**Held** (the lead's stabilization: it moves a first-hour caster): **Burning Hands**, a first-level evoker's.
Measured the same way at the first level: three rats 77 → 68 %, two wolves 6 → 1 %, two ghouls 0 → 0 %; Orsino's
burning (a Fortitude save or 1d3 a turn for the fight) is a share of a first-level evoker's harm. To land with a
green main and the lead's word.

### 57. Concealment as a fight rule, and Blur's miss chance by the SRD (19 November): built; Blur exact

Named by the last report as the route that unblocks Darkness and Blur's miss chance as the SRD has it. Spec:
`test/concealment` (3).

**The mechanic built** (`concealment`, a modifier: Fighting.attack, Fighting.chance):
- a holder's concealment is the chance in a hundred that a blow which lands at it misses after all (the SRD's miss
  chance: Blur's 20, Darkness's 20, total concealment's 50); of two sources the better holds, never summed (the
  SRD's rule; ModifierSet.sum);
- thrown on d100 once a blow or a touch has landed (the SRD rolls it beside the attack; Kyr throws it only on a hit,
  so a fight with no one concealed throws nothing more), a throw at or under the chance a miss;
- the forecast on the aim multiplies by what is left (Blur: four in five of what would land);
- told as the blow's: "Brann's battleaxe goes wide of the wolf, hard to make out" (the event's `concealed`); the book
  says it ("a blow that lands at them misses 20 times in a hundred"), and the handbook's rules of the fight.

**Blur** (case 49) now lays the SRD's concealment exactly (`concealed`: 20), where it had been converted to
Westernesse's evasion of 3 (four hits in twenty turned: the same one in five). The census already graded it
S✓ R✓ I✓; its note's conversion is gone.

**What it moves:** no odds anywhere (Blur turns one hit in five, as it did). A fight in which a blurred one is hit
throws d100 where evasion threw a d20, so its later dice differ; two installed casters know Blur (iscoed's tower
necromancer and kahitude's howe scholar, both of the third level), and their specs hold (bound-howe-under,
unquiet-tower-talk). No draw or card moves. Orsino's own `blurred` (an evasion of 10) is untouched.

**What it unblocks:** Darkness (case 41's Create Darkness): a second-level burst laying concealment 20 on everyone in
it, friend and foe, ten minutes a level. Not taken here: it moves the four cards that hold it at the second level
(shadowmancer, stormcaller, veneficium, warbringer) from a hold on every foe to a shadow over both sides, and the
tactics would cast it at foes as if concealing them helped (they weigh any condition laid on a foe as a gain); a
decision for the lead, with the tactics' weighing of a boon laid on a foe.

### 58. A condition's amount by its caster, and Ray of Enfeeblement by the SRD's resolution (19 November): adapted

Named by the last report as the route Ray of Enfeeblement waited on (case 35's list; "What remains"). Spec:
`test/ray-of-enfeeblement` (4).

**The mechanic built** (`ConditionAmount`, src/rules/condition-amount.ts): an apply effect may name an `amount`,
thrown by its caster's values as it is laid (as temporary hit points and images are) and kept with the condition held;
a condition's `perAmount` modifiers are counted that many times beside its own (scores, saves and the numeric
modifiers only: the canon refuses any other kind there). Gathered modifiers are gathered again when an amount differs.
The book says it ("one enemy is enfeebled by 1d6 + min(5, half the caster level) for 10 turns at the first casting
level…").

**The spell** (a hand entry over Orsino's Weakness, named Ray of Enfeeblement; the hand condition `enfeebled`, so
Orsino's `weakened`, which Mass and Major Weakness lay, is untouched):
- one foe a ranged touch lands on (exact), no save (exact), spell resistance answering it (exact);
- 1d6 off its Strength and a point each two casting levels, to five more at the tenth (exact), Strength never below
  one;
- a minute a casting level (exact: Lasting).

**Level:** first, the SRD's (Orsino's was second). **Omitted:** its range. The first-level placement moves it from
second- to first-level necromancer picks. Before: Orsino's Weakness, Strength two less and two less harm a blow for
three rounds, a Fortitude save against 14 and the caster's level. The census grades it S✓ R✓ I✓: 37 of 119 pass in
resolution.

**What it moves:** two installed casters know it, thorn's and mere's howe scholars (third-level mages of the Bound
Howe's camp); no first-hour fight. A fifth-level caster's ray at a first-level wolf: 3 to 8 off its Strength for fifty
rounds where the touch lands.

### 59. Barkskin and Shield of Faith growing with the caster (19 November): two conversions made exact

Cases 19 and 50 converted the SRD's growing bonuses to +2 at every casting level, because a condition's amount did
not read its caster. Case 58 built that (ConditionAmount), so each now lays its +2 and a point more for each of an
amount its caster throws (the condition's `perAmount`, ac −1):
- **Barkskin:** a point each three casting levels past the third, to +5 at the twelfth (the SRD's natural armour
  bonus, exact): `min(3, floor(max(0, #castingLevel - 3) / 3))`. Orsino's barkskin is laid by a consumable too, which
  lays the two alone; the hand entry over Orsino's condition says so.
- **Shield of Faith:** a point each six casting levels, to +5 at the eighteenth (the SRD's deflection, exact):
  `min(3, floor(#castingLevel / 6))`.

Specs: test/barkskin and test/shield-of-faith read the growth (two at the fifth level, three at the sixth, five at
the twelfth and the eighteenth). **What it moves:** nothing below the sixth casting level, where both are +2 as
before: no first-hour fight, no installed caster (all of the third level or lower), no draw or card. Each still S✓ R✓
I✓ in the census.

### 60. Divine Favor growing with the caster (19 November): its conversion made exact

Case 23 kept Divine Favor's +1 at every casting level, the SRD's growing a point each three. By case 58's amount it
now lays Orsino's blessed (+1 to hit and damage) and as much again for each of `max(0, min(2, floor(#castingLevel / 3)
- 1))`: +1 to the fifth casting level, +2 from the sixth, +3 from the ninth (the SRD's luck bonus, exact). Orsino's
blessed is a hand entry naming it, with its perAmount; Bless and Neptune's Blessing lay the one alone. Counting a
number in a dice modifier (bonusDamage) is allowed where it is a number. Spec: test/divine-favor reads the growth.

**What it moves:** nothing below the sixth casting level: Divine Favor is a War cantrip, cast by first-hour warbringers
at +1 as before; no installed caster (all of the third level or lower), draw or card moves. Still S✓ R✓ I✓.

### 61. The concordance's placed gaps (19 November): the mouther mapped; the rest have no SRD counterpart

Every kind placed in the eight worlds' hostile groups (a1, iscoed, kite, thorn, wren, kahitude, mere, ember; 724
groups) was read against the concordance. One more has an SRD counterpart: **Orsino's Mouther, the SRD's gibbering
mouther** (a1 once, the six countries' dens six times). The census grades it (75 creatures where 74): S✗ R✗, its
armour (Westernesse 5, the SRD's 2), chance to hit (55 %, 50 %), defences (none; the SRD's 5/bludgeoning) and saves
differ; not moved (its SRD body, 4d8+24 and six bites, is no first-level meeting).

The others placed and unmapped, by how often met, have none in the SRD: the revenant (94), hook-claw (70),
sail-wing (42), spirit (38), hollow stalker (33), the jewel, crystal, mud and ice elementals (32: the SRD has only the
four elements), the eel (28), the skeletal horse (24: the SRD has no horse skeleton), the curlew (16), the bomb (16),
the slump (14), the wisp (14: a summoned mote, not the will-o'-wisp), the banshee (14), the phylactery (9), the
automaton (8), the marl pike and the shore brooder (7 each), the mind destroyer (6), and a few birds and devices. The
young owlbear is a module's own kind (the circus menagerie).

### 62. The fell owlbear (20 November): the SRD owlbear as a breed, placed where it can be gone round

**The owlbear on the fidelity table:** the most-met kind with an SRD counterpart that no slice had moved. Orsino's owlbear (`owlbear`) is 9 hit points and three a level. It has one claw of 1d4 and wears hide. It has Maul, Charge, Enrage, Poison Bite, Stomp and the wild aspect, and grades S✗ R✗.

**The fell owlbear** (`owlbear/fell`, a breed over it, data/catalog/variations.json; spec `test/fell-owlbear` (4)) is the SRD's stat block, through the barrow ghoul's fields alone:
- 5d10+25, fifty-two hit points at every rank;
- its scores (21, 12, 21, 2, 12, 10);
- two claws of 1d6 and a bite of 1d8 with its Strength, struck at the SRD's +9, so it hits SRD AC 15 three times in four at any rank (exact for the claws);
- saves of +9, +5 and +2 (exact);
- AC 15 as Westernesse 6 (converted: natural 2 and Dexterity 1).

It goes without Orsino's five powers and the wild aspect, which had added +2 to hit, +1 to every roll, evasion, bonus damage and a tenth off all harm. **Update, 26 November:** its two claws are at +9 for 1d6+5 and its bite at +4 for 1d8+2, carried as individual fixed strike bonuses into combat. Kyr's criticals remain different. **Omitted:** improved grab, scent. The census grades it S✓ R✓ I–, comparing each strike's hit chance and noncritical weapon damage, not criticals or all special qualities.

**Its challenge before the strike update**, measured (bin/kyrie bestiary challenge, test/srd-challenge): **8.** A lone warrior needed the eighth level to beat it; it is the SRD's challenge 4 for a company of four. Orsino's owlbear measured 1 at its first level and 6 at its fifth. These measurements predate the weaker secondary bite and must be repeated in CI.

**What it moves:** two placements, chosen because each is warned of and has a way round:
- **Tallow's scrub,** the she-owlbear: baited with a ration of meat. Tallow's own fight table (scripts/tallow-fights.ts, its fresh company, 20 seeds): won 12/20 → 3/20, all three members down in 16.
- **a1's arcology foot:** baited with rations, or gone round by woodcraft along its run.

There, the fight is the fear the place promises and a choice the player is told of. Half the Hive's dell and the circus's menagerie keep Orsino's owlbear until those placements are fought (their ways round are unread). It is `unplaced`: never drawn into a den. Kept: data/sources/srd35/encounters.json still lists the arcology's group as `owlbear` until the slow `--encounters` measure runs again.

### 63. The long centipede (21 November): the SRD Medium monstrous centipede as a breed, and a poison's ability damage

**The centipede on the fidelity table:** the old drain under every first town (undertown.kyrt) kept Orsino's great
centipede (`great_centipede`, a compound kind: centipede/great). It is Orsino's body grown by its level, with chitin
and Orsino's Venomous Bite, and grades S✗ R✗. It was also one of the compound kinds OR-158's lint holds in its baseline.

**The long centipede** (`centipede/long`, a breed over Orsino's centipede, data/catalog/variations.json; spec
`test/long-centipede` (6)) is the SRD's stat block:
- 1d8 Hit Dice, four hit points at every rank;
- its scores (9, 15, 10, 10, 2; mindless, its Intelligence left as Orsino's);
- a bite of 1d6 with its Strength, struck at the SRD's +2 (exact);
- saves of +2, +2 and +0 (exact);
- AC 14 as Westernesse 7 (converted: its Dexterity of 15 alone, so it wears nothing, as the barrow ghoul).

It goes without Orsino's Venomous Bite. **Its poison** rides on each bite that lands, and is the save the opening's
fights most often ask for:
- a poison save against 10, or 1d3 off Dexterity (**Numbed**, a new condition: a point off for each point laid, on the
  world's clock for a day, beyond the fight and in a saved game);
- and, whatever came of the first, the venom working (`centipede_venom`): a watch later a second save against 10, or
  1d3 more.

**What it needed of the engine:** ability damage that stacks. A condition's `stacking` may now be `accrue`
(ConditionAmount.prior): a second laying adds its amount to the one held, for its own time from then, where any other
condition laid again replaces the one held. Numbed accrues, so a second bite or the second dose adds to the first, as
the SRD's ability damage does. The venom working is a poison by its kind of harm, so Cleanse, whose pattern is poison,
ends it before it works, and leaves the Numbed it has laid (the SRD's damage already dealt stays). The antidote names
the poisoned it ends, and does not.

**Adapted:** the second save a watch after the bite, where the SRD's is a minute (the first watch after the fight); the
Dexterity all back at the end of the day, where the SRD's comes back a point a day; and no Dexterity of nothing, which
would leave the SRD's holder unable to move (Effects.scores keeps a score at one). **Omitted:** darkvision, vermin
traits. The census grades it S✓ R✓ I✓, its poison carried (5 of 77 creatures pass in resolution, 2 in play identity).

**Its challenge,** measured (bin/kyrie bestiary challenge, test/srd-challenge): **1/3** at the first rank, the SRD's
challenge 1/2. Orsino's great centipede measures 1/4 at its first level and 1/2 at its fifth.

**What it moves:** the one placement, the old drain's centipede under the first town. It is in every world, alone, and
warned of: the innkeeper tells where it lies up, and one who keeps to the cold side does not wake it. undertown.kyrt
now names the base and the breed (`Species centipede. Variant long.`), so OR-158's baseline loses a compound kind. Its
fight in the laboratory (Lowmouth's undertown, a fresh company of one taking "Attack", 40 seeds), Orsino's → the SRD's:
- a warrior wins 34 → 39;
- a mage wins 12 → 20;
- a thief wins 21 → 26.

The SRD's centipede is a quarter of Orsino's at the second level, and its bite hurts less. What it leaves is the
venom: nine of the forty warriors leave the drain Numbed. **Cards that move:** the centipede's (four hit points, AC
7, no Venomous Bite), and the card of anyone it bit, who carries Numbed for a day with Dexterity the lower for it (their
armour, and their Reflex save). Kept: data/sources/srd35/encounters.json still lists the drain's group as
`great_centipede` until the slow `--encounters` measure runs again.

### 64. The midden rat (21 November): the SRD dire rat as a breed, and a disease that comes on days later

**The buck rat on the fidelity table:** the old buck rat that keeps the corn-store's nest under every first town (the
first job's second fight) was Orsino's great rat made old (`great_rat`, a compound kind: rat/great, with the elder
variation). Its body grows by its level, AC 11 in fur, a bite of 1d3, and it grades S✗ R✗.

**The midden rat** (`rat/midden`, a breed over the catalog's rat; spec `test/midden-rat` (6)) is the SRD's stat block:
- 1d8+1 Hit Dice, five hit points at every rank;
- its scores (10, 17, 12, 1, 12, 4);
- a bite of 1d4 struck at the SRD's +4 (exact);
- saves of +3, +5 and +3 (exact);
- AC 15 as Westernesse 6 (converted: its Dexterity of 17 alone, in the rat's fur).

**Its filth fever** rides on each bite that lands: a disease save against 11, or the fever is caught (`filth_fever`,
"Filth fever coming on"). It comes on after 1d3 days on the world's clock (its incubation, 144 watches a day), and then
lays **Fevered**: 1d3 off Dexterity and Constitution for a day, accruing as Numbed does (case 63). The fever coming on is
a disease by its kind of harm, so Remove Disease and Orsino's Cure Disease end it before it comes on. Fevered is the
damage done, not the disease, and stays when the disease is cured, as the SRD's does. Nothing new was needed of the
engine: a rider's duration is already a Deem amount (`144 * 1d3`), and a condition's onExpire already lays another.

**Adapted:** one throw for both scores, where the SRD throws each; the toll taken once, where the SRD's comes each day
until two saves in a row are made; the scores back at the end of the day, where the SRD's come back a point a day.
**Omitted:** low-light vision, scent, Climb and Swim. The census grades it S✓ R✓ I✓, its disease carried (6 of 78
creatures pass in resolution, 3 in play identity).

**Its challenge,** measured: **1/3**, the SRD's. Orsino's great rat measures 1/6 at its first level and 1/3 at its fifth.

**What it moves:** the one placement, the buck in the nest. undertown.kyrt names the base and the breed
(`Species rat. Variant midden.`), so OR-158's baseline loses great_rat. The elder variation goes with it: an age laid
over a fixed stat block would make it no longer the SRD's, and the buck's grey muzzle is in its role. The buck is told of
by the rats' run up from the nest, and can be gone round: a firebomb thrown from the runs ends it without a fight
(test/small/laboratory-retreat). Its fight in the laboratory (a fresh company of one taking "Attack", 40 seeds), Orsino's
→ the SRD's:
- a warrior wins 40 → 36;
- a mage wins 16 → 15;
- a thief wins 33 → 15.

The SRD's rat is harder to hit (AC 6 where Orsino's was 11) and bites harder, so the first job's second fight is a
real fight for a thief alone (CB-01: the first hour's fights had been trivial). The fever is the other change: a third of
those who fight it leave with it coming on (13 warriors, 16 mages and 16 thieves of the 40). **Cards that move:** the
buck's (five hit points, AC 6, saves +3/+5/+3, no longer old), and the card of anyone it gave the fever, who carries it
for one to three days and then Fevered for a day. **A pin that moved:** test/features/world/under-the-town walks by the
gold to the vault's keeper. Its warrior is now of the fourth level: at the third the barrow ghoul is an even fight
(BestiaryTool.won: 5 of 12), and the walk's dice changed once the buck was the SRD's.

**Replays that moved:** the kept plays' lines (the cold plays' and S3-0's, test/iscoed-cold-five, test/hall-answers,
test/golden-road-home) had killed the buck in two melee lines. Against the SRD's buck, on the elf mage's weir route
with Gesk hired, the two blows miss, Gesk is at 8 of 17 and the buck still stands. The company still wins when it
presses on: a replay now fights a fight its lines no longer end to its end by the game's tactics ("Press on to the end",
test/support/as-meant), as a player would, before the line after it. The buck does not beat that route; it costs it
more.

### 65. The wild boar (21 November): a breed's own scores over a rolled base, and the SRD boar where it warns

**The boar on the fidelity table:** Orsino's boar (`boar`) rolls its scores, so no breed of it could be the SRD's: a
breed's attributes are added to its base's, and a rolled base gives each boar its own Dexterity (its armour) and
Strength (its blow). It grows by its level in hide, and grades S✗ R✗. The spider, the wolf and the bear are rolled too.

**What it needed of the engine:** a stat block's own scores. A variation that is a stat block may say `scores`, the
six in place of its base's, rolled or fixed (Canon.stated lays them as the composed body's attributes, so creation reads
them as any fixed kind's). Validation holds them to the six, each a whole number of one or more, beside Hit Dice and with
no attributes of the breed's own beside them.

**The wild boar** (`boar/wild`, a breed over Orsino's boar; spec `test/wild-boar` (5)) is the SRD's stat block:
- 3d8+12 Hit Dice, twenty-five hit points at every rank;
- its scores (15, 10, 17, 2, 13, 4), the same for every boar of the breed;
- a gore of 1d8 with its Strength (the tusks', 1d8+3: exact), struck at the SRD's +4 (exact);
- saves of +6, +3 and +2 (exact);
- AC 16 as Westernesse 5 (converted: its natural armour 6 as the boar's hide and a bonus of 4).

**Omitted:** ferocity (the SRD's boar fights on while disabled or dying, which Westernesse's fallen do not), low-light
vision, scent. The census grades it S✓ R✓ I–, ferocity the one special it lacks (7 of 79 creatures pass in resolution).

**Its challenge,** measured: **2**, the SRD's 2. A lone warrior of the first level wins 2 of 12 against it, one of the
second 9 of 12 (BestiaryTool.won). Orsino's boar at the first level is beaten by every lone first-level warrior: 12 of 12.

**What it moves:** one placement, the old boar of the open country's wood meetings (meetings.kyrt, `--- wood boar`):
`Species boar. Variant wild.` Over generation, the eight countries' open country (a1, iscoed, kite, thorn, wren,
kahitude, mere, ember) draws 156 meetings, and 10 of them are the boar (a1 1, kite 2, thorn 2, wren 2, kahitude 3).
A danger is met only away from the roads and the towns. The ground rooted up is seen first, then the boar warns
("It does not mean to go round you"), and while it warns the company may answer it or take the way across country out
of its stretch (OR-163). So the fight is the fear the place promises: a pack dropped by someone running lies past it.
**Cards that move:** the boar's (twenty-five hit points, AC 5, saves +6/+3/+2), and its reckoning: for a novice alone it
reads as a fight to lose. The roadstation's three boars and the ecology's dens keep Orsino's.

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
- **Spell resistance:** built (case 43): rolled, told, and a failure leaves its creature untouched.
- **The 33 unsupported**, by the causes above: each cause is an engine capability (statuses' modifiers, phantasmal
  summoning, item creation, target forms, world magic and transformations), and none may be faked as data.
- **The creatures.** 3 of 72 pass in resolution (rat/cellar, the barrow ghoul, the royal mummy); placed kinds keep Orsino's bodies by the lead's
  ruling (srd-invariants.md: the ghoul's withdrawal). Since 18 November they go by proof slices of their own (SR-02,
  cases 25 on). The challenge table's re-measure at 48 fights a level
  (CB-21) comes before any placed creature is moved.
- **DC conversion for every spell with a save.** Case 7's rule (the SRD's and half the casting level) is now the
  migration's: each spell moved takes it, and its census row says so.
- **Durations that grow with the caster:** built (case 44, Lasting). Before it, cases 14, 17, 18 converted a minute a
  level, or a round a level, to a fixed count. An apply effect's duration is a number; a duration by `#castingLevel` is an engine change of its own
  (Effects.condition, the handbook's words, the census's grading), and with it Death Ward could last a minute a level.
- **The field's clock** (case 14): a hostile spell cast at a band outside a fight lasts as many watches as it would
  have lasted turns (FieldUse.cast), so Sleep's ten rounds are ten watches, where the SRD's minute is less than one.
  The rule is case 1's and Items.use's; changing it moves the undertown's sleepers and wants its own census.
- **Touch attacks:** built (case 35, Shocking Grasp by it); Ghoul Touch (case 36), Acid Arrow (case 44) and Ray of
  Frost (case 45) by it, and Vampiric Touch (case 52). Ray of Enfeeblement by a condition's amount thrown by
  its caster (case 58), at Orsino's second level.
- **The cure family's levels** (case 16): Moderate, Serious and Critical at the SRD's 2, 3 and 4 wait on the preset
  companion cleric's spells (world-assembler), which are chosen by level.
- **Charm Person**: the SRD's numbers would lower its difficulty and lengthen it to the fight, but Orsino's charmed
  changes allegiance, where the SRD's subject only takes the caster for a friend: a decision before a slice.

### The lead's decisions on cases 25–29 (18 November)

The census's recommendations are taken: Orsino's ghoul, the zombie, the rat, the cave spider and the wolf stay as they
stand, said so in the fidelity ledger; no placed SRD kind met in pairs moves until the ecology prices a company of one
(CB-01, CB-03). The barrow ghoul (case 25) runs by the SRD's numbers. The next creature slices are kinds met deeper than
the first hour, each fought where it is placed (the great barrow's mummy first); the barrow ghoul for the newcomers'
single ghouls (w5, w6, e1) only after a placement review, never in the ossuary.

### The lead's decisions on cases 30–34 (18 November)

The royal mummy (case 30) runs by the SRD's numbers, as landed: on the golden route a company that flees gets away and
one that fights goes down, before and after. The halls' five mummies stay Orsino's (as the SRD's, a first-level warrior
and cleric win 80 → 10 %); the waterworks' keeper stays Orsino's until the keepers' levels are reviewed (case 34).
The oathkeeper's creation card offering Command and Holy Wrath (case 33) is accepted: what a first-level oathkeeper
knows is the SRD's first level.

### 67. The drover's dog (26 November): a fixed working dog without a new encounter

The drover's existing, peaceable grey dog now uses `dog/drove`, a named variant of Kyr's working dog with the SRD
dog's six scores, 6 hit points, AC 15 converted to 6, saves +4/+5/+1 and one bite at +2 for 1d4+1. The fixed body
does not scale with rank. It is not selected for random dens. `test/drove-dog.test.ts` checks the combat projection
at three ranks and loads the authored situation in a small world: petting the dog still produces dog narration and
teaches the ditch-mud clue.

The SRD's scent, low-light vision, skills, movement and size rules are not modeled for her; Kyr's critical and
piercing-wound rules differ. The placement is not hostile. In an illustrative 12-trial combat sample against one
first-level warrior, the warrior wins all 12 against either the old or the new dog, including dog retreats. This
does not measure a generated-world encounter. The census gives the new mapping S✓ R✓ I? on selected fields; it
does not prove the missing senses. It is a second mapping of the dog, not another distinct SRD creature.
### 68. Fixed bodies in Hit Dice pools (26 November)

An encounter level is not a fixed body's Hit Dice. The shared `HitDicePool` now reads the body's source count through
the same projection as `#hitDice`, while characters and growing creatures retain their level-based count. Combat
target legality, affected targets and the combat model's forecast all use that pool; the field spell resolves through
the same ability path. `test/sleep.test.ts` exercises a high-level one-HD dog, a low-level five-HD owlbear, and
selection order; `test/small/sleep-band.test.ts` exercises the field path. The interpretation of fractional Hit Dice
and Sleep's other adaptations are not thereby settled. Fixed-body eligibility has changed, so affected encounter
balance still needs CI.
