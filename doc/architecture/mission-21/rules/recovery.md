# Recovery between fights: a diagnosis (R10-12, R11-05)

The brief's "recovery" and "scarcity". The rounds' reports: healing between fights is Wait → Tend → cast, again and
again, and an at-will heal makes hit points meaningless. Diagnosed, not built: a rule waits on the lead.

## What restores what

| Means | What it restores | Time | Cost |
|---|---|---|---|
| **A field heal** (`field_spell`, care.kyr: Tend's spells) | what the spell heals | 2 minutes | its slot, if it has one; **a cantrip (a level-0 spell) costs nothing** (`Spellcasting.affordable`: a spell needs a slot only above level 0) |
| **Rest and recover** (`rest`, care.kyr) | all health, **every spell slot**, every use a day, bleeding stopped (`camp_recovery`) | 6 hours | a ration, a restful place (the corn-store under the first town is one) |
| **A healer's service** (`take_healing`, services.kyr) | the same as a rest, slots and uses included (`recover`) | 1 hour | its fee |
| **A night at an inn** (`take_lodging`) | the same | until morning | its fee |
| **A night in the open** (`camp`) | 1d6 + 2 health, one slot, one use | until morning | none |
| **Waiting** (Wait › …) | nothing: no slot, use or health comes back by waiting alone | as chosen | none |

So waiting itself restores nothing. What makes the loop is the **cantrip**: a cleric of Love's Kindle (1d3 + Wisdom
modifier), or of Cure Minor, heals someone every two minutes for nothing, without end. And where slots matter, a
**six-hour rest** (or an hour and a fee at a healer) gives back every spell, as often as the company likes in a day.

## Measured: a first-level cleric between two fights an hour apart

The engine's own field use (`FieldUse.perform`, as Tend performs it), a first-level human cleric and a first-level
warrior both brought to 1 hit point, each two minutes a heal on whichever is lower, hurt again whenever both are whole
(to count what the hour can give, not only what one fight took). Six clerics, six seeds
(`/var/tmp/kyrie/steps/heals.ts`):

| Cleric | Heals it knows | In the hour | Hit points mended | Against the two's whole (≈ 24) |
|---|---|---|---|---|
| a (Love: Kindle) | kindle, rejuvenate | 30 heals, none by a slot | 74 | three times over |
| f (Cure Minor) | cure minor, cure moderate | 30 heals, none by a slot | 48 | twice over |
| b–e (no heal known: the calling's spells drawn otherwise) | none | 0 | 0 | — |

A cleric with a healing cantrip mends the company whole in five or six casts (ten or twelve minutes), and between two
fights an hour apart has time to do it two or three times over. Four of the six drew no healing
spell at all, and mend nothing but by a rest; and a rest, six hours and a ration, gives back everything. Hit points cost time only, and very little of it.

## The smallest rule (proposed, not built)

**Healing cantrips mend between fights once a rest.** A cantrip that heals may be used in the field on each member
once; that member is then *tended* until the company next rests (a rest, a night, a healer). In a fight, cantrips are
at will as now. One condition (`tended`, lifted by `recover` and `rough`) and one clause in `field_spell`'s Requires
(`not tended(recipient)` for a level-0 heal); no change to slots, rests or prices. A cleric of Kindle still closes the
small cuts after a fight (once each: 1d3 + Wisdom), and the rest is a rest's, or a healer's, or a potion's.

If that is not enough scarcity, the second rule, also small: **spells come back once a day.** A rest restores slots
and uses only if none has since the last morning (the `restedAt` and `lastSlept` measures are already kept); a second
rest the same day restores health and stops bleeding, and gives back no spell. This is the OSR's "spells by a
night's rest", without making the six-hour rest a night.

Neither touches a stat block or a fight. Both would be fought again where they bite: the first hour's undertown and
first sites, for a company with a cleric and one without (placements.md's companies).
