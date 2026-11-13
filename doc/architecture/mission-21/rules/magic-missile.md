# Magic Missile: the conversion note (Mission 21, rules, first proof slice)

Written before the spell is changed (proof-slices.md, step 4: the scaling proof). The SRD's spell, Westernesse's
record today, and the adaptation, clause by clause. No saves, areas, conditions or spell resistance enter its basic
resolution.

## The SRD's spell

Evocation [Force], Sor/Wiz 1, medium range, "up to five creatures, no two of which can be more than 15 ft. apart",
instantaneous, no save, spell resistance yes. A missile of magical energy darts forth and strikes its target unerringly
(it needs a line of effect and is not affected by concealment), dealing 1d4+1 points of force damage. For every two
caster levels beyond 1st, one more missile, to five at 9th: one at 1st, two at 3rd, three at 5th, four at 7th, five at
9th. With several missiles the caster may have them strike one creature or several, a creature struck by more than
one taking each; targets are designated before spell resistance is checked or damage rolled. *Shield* negates it.

## Westernesse's record today (Orsino's)

Level 1, evocation. One damage effect of `1d4 + floor(#level/3)` force, target `random enemies`, count
`2 + round(#level/2)`: the count is how many distinct living foes are drawn (Orsino's randomEnemies), so a lone foe
takes one missile of a level-five mage's four, and the missiles' damage grows with level where the SRD's does not.
Reached by: the evoker's and the generalist's first-level choices (orsino traits, spellAccess evocation and all), the
sprite's own powers (monsters.json), the Wand of Magic Missile (wonders.json: 20 charges, "Cast magic_missile on
enemy", in the treasure table and the den's finds), and Thole's lessons in The Fit (book-of-faces/mage.kyr).

## The adaptation

| Clause | Decision | Kind |
|---|---|---|
| Level | 1st, on the arcane list | exact |
| Missiles by casting level | `floor((cappedLevel(9) + 1) / 2)`: 1 at 1st, 2 at 3rd, 3 at 5th, 4 at 7th, 5 at 9th and beyond, by #castingLevel (a wand's: the wand's own, see below) | exact |
| Damage per missile | 1d4+1 force, each missile thrown and dealt on its own, so each is resisted, warded and told on its own | exact |
| Automatic hit | no attack roll and no save: a missile lands on any target the caster may choose; nothing about concealment yet (Westernesse has none for a spell) | exact |
| Allocation | the caster chooses one foe, and every missile goes to it; a missile still to come when it falls passes to the next foe standing, in the order the fight lists them. Deterministic: no draw, so a replay allocates alike. The SRD's free split among several is not offered (one chosen target is all a command names); a caster wanting two foes struck casts twice | converted |
| One or several legal targets | one foe: all its missiles; several: still all on the chosen one until it falls | converted |
| Events | one damage event a missile, each naming its target; the cast spends one slot, once | exact |
| Spell resistance | none rolled: Westernesse has no spell resistance yet (engine-pressure.md §4); recorded, not inert | omitted |
| Shield | no interaction: the catalog's `shield` is the SRD's Shield of Faith, and no Westernesse spell is the SRD's Shield yet; a ward absorbs each missile as it absorbs any harm | omitted |
| A wand's missiles | cast at the casting level of whoever uses it, as any item's spell is cast today; the SRD's wand casts at its own caster level, which wands do not yet carry | converted |

## What it changes, where it is reached

The evoker's and generalist's mage at the first level fires one missile of 1d4+1 where Orsino's fired two of 1d4 at
two foes (a weaker first level, the SRD's); at the fifth, three of 1d4+1 into one foe where Orsino's fired four of
1d4+1 at four (a stronger single-target spell, weaker against a crowd). The sprite casts at its Hit Dice (its level,
an Orsino creature). The wand fires as many as its user's casting level gives. Each reach is reviewed in the slice's reachability record
before the spell lands.

## Tests (the brief's)

Every missile-count boundary (casting levels 1, 2, 3, 8, 9, 10); one and several legal targets; the allocation when the
chosen foe falls mid-volley, deterministic and replayed alike; the slot spent once, not per missile; one event a
missile, naming its target; and the page's line agreeing with what is rolled.
