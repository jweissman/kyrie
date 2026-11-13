# SRD adaptation as engine invariants (Mission 21, rules)

Working record of the rules line: what the [SRD adaptation briefing](../../mission-20/srd-adaptation-briefing-2026-11-12.md)
asks for that the engine can now say directly, the specs that hold it, and what is left. The briefing's increments A–C
are this line's remit; this pass delivers A whole, B's Hit Dice, and C's typed defenses. Branch `m21-rules`.

## What is now expressible

### Dice wherever a number is wanted (§1)

- A species' `statistics.hitDice` is an Amount (`"2d12"`, `"3d8+4"`), read by the Deem grammar every effect amount is
  read by (`Amounts.of`, `src/rules/amounts.ts`; ability resist difficulties now go through the same path).
- Its hit points are the **listed average**: the expression's exact mean, worked out from the expression's own parse
  tree (a die of n is (n + 1)/2; sums, products of independent throws, division by a constant), rounded down as the
  SRD prints it. Never sampled. Functions, tests and powers have no exact mean and are refused.
- `hitPoints: 'rolled'` in a creature's generation context throws the same expression from the creature's own seed.
- `#hitDice` is in every effect's Deem context: a fixed stat block's own count (2d12+3 is two), else one a level. It is
  never reconstructed from hit points or level (`CanonRuntime.hitDice`).
- A kind with Hit Dice is a **fixed stat block**: no level it is met at grows its hit points or its qualities; a
  variation's `health` is taken once, not per level; a drained level costs a Hit Die's worth. Validation refuses Hit
  Dice that are not dice, and Hit Dice beside `growth` or fixed `hitPoints`.

### Typed defenses with bypasses (§3)

`Species.defenses` (`src/rules/defenses.ts`):

| Kind | Fields | Meaning |
|---|---|---|
| `immunity` | `to` | no harm of those kinds |
| `resistance` | `to`, `amount`, `mode: flat \| fraction` | a flat amount off each blow (fire 10), or Orsino's fraction |
| `reduction` | `amount`, `unless` (tags), `to` (default physical) | off each blow, unless the attack carries a tag in `unless` |
| `regeneration` | `amount`, `stoppedBy` | mends at its turn's end unless harm of a `stoppedBy` kind struck since |

Selectors are damage types, `physical` or `all`. Amounts are numbers or dice. **Resolution order** is explicit:
true damage passes everything; immunity; the summed fraction (every source, as Orsino adds them); the best flat
resistance; the best reduction the blow does not pass (Orsino's untyped `damageReduction` competes as one more, so
reductions never stack); then temporary hit points, hit points, and regeneration's eligibility.

A blow carries its damage type, its weapon's `tags` (`WeaponStats.tags`: silver, cold_iron, adamantine, magic), and
`natural` or `manufactured`; a spell's harm carries `spell` and `magic`. The vocabulary is
`vocabulary.json` → `combat.defenses.attackTags`, and the telling's words are `combat.defenses.told`.

The damage event's `modifiers.guarded` names what each defense kept off and `modifiers.bypassed` which tag passed
which reduction; a regeneration stopped is a heal of nothing with `stoppedBy`. The telling says it: "Silver passes the
unicorn's guard.", "The unicorn's guard turns 5 of the blow.", "The fire stops the troll's mending."

A body's old `resistances` map becomes fraction defenses as the canon loads (`Canon.defended`); nothing reads the old
map after. Conditions', traits', items' and variations' `resistances`/`damageReduction` modifiers stay modifiers and
are summed as before.

### The honest catalog (increment A, §14)

- **Unknown fields fail the canon's load** in every record of every family (species, devices, abilities, conditions,
  traits, items, ancestries, classes, skills, plants, deities, domains, materials, habitats, variations), as the
  canon resolves them, and in what they hold: a body's statistics, a weapon's and armour's stats, every source, every
  defense (`src/canon/catalog-fields.ts`, `CanonValidation.defenses`). Found by it: the unicorn's `dr` and `resist`
  (migrated to defenses), and the items' real but undeclared `mass` and `carries` (now declared fields).
- **Reference only**: an ability whose record has no executable effect, and that is no move the rules resolve
  themselves (`wait`), is `CanonRuntime.referenceOnly`: never offered in a fight, learned, prepared or granted. A
  calling feature, trait or item that grants a non-playable ability fails validation.
- **Provenance**: `Source.srd35` names an SRD entry; it requires `conversion` and `notes` (what is kept, adapted and
  omitted).
- **The ratchet**: no playable ability does nothing; the unsupported ledger may not grow past 100.

## The specs that hold it

All pure or tiny-world; times are `bun test --no-isolate` on this machine, warm.

| Spec | Proves | Time |
|---|---|---|
| `test/srd-hit-dice.test.ts` | means (3d8+4 = 17.5, listed 17; 2d12 = 13; refusals); a table of every amount field taking `2d4+1` through its own path (compact and typed effects, save and resist difficulties, the three dice modifiers, tempHp, turn-end ticks, weapon damage, Hit Dice); the ghoul at levels 1/3/7/12 is 13 with fixed qualities; rolled mode varies by seed and repeats; `#hitDice` is 2 at level 5 | 0.26 s (23 tests) |
| `test/small/hit-dice-met.test.ts` | a ghoul written into a Kyr module at level 5 is 13 in the world and its first wound falls on 13 in the fight the company walks into | 0.5 s |
| `test/srd-defenses.test.ts` | 15 rows: each defense against an attack it holds and one that passes it (immunity, flat, fraction, 10/silver against steel/silver/fire, 10/magic against a spell, 5/bludgeoning, best-of with Orsino's reduction); every catalog kind's translated fractions equal its record's; every kind mitigates every damage type × five blows exactly as the old formula (≈12 000 comparisons); regeneration mends a blade's harm, not fire's (nor while it burns), told; the telling names silver passing and a flat resistance | 0.45 s |
| `test/honest-catalog.test.ts` | no unknown field anywhere; the unicorn as written fails with `unknown field dr`, `resist`; nested unknowns fail; malformed defenses fail; the twelve reference-only abilities, never offered, learned, granted or prepared; the ratchet | 0.25 s |
| `test/srd-slices.test.ts` | the ghoul's record and its bite-claw-claw routine in one action; the unicorn's 42 and its guard told blow by blow | 0.4 s |
| `test/srd-envelope.test.ts` | the combat envelope, reported not gated (below) | 2 s |

Existing specs re-run against the changes: `monster-powers`, `quarry`, `daily-uses` (all ghoul-dependent) pass;
`bestiary` passes once the golem slice was withdrawn (below).

## The slices

| Creature | Source values kept | Adapted | Omitted |
|---|---|---|---|
| Ghoul (`monster:ghoul`) | 2d12 (13), scores, bite + claw + claw | AC 14 → 7 (hide + Dex, for a first-level warrior's d20); claws 1d4 (the catalog's) for 1d3; paralysis as its Paralyzing Touch act, not an on-hit rider (§4) | ghoul fever, turn resistance, elves' immunity; Orsino's Curse, Scream, Life Drain, regeneration removed |
| Unicorn (`monster:unicorn`) | 4d10+20 (42), scores, horn 1d8 + two hooves 1d4, immune to poison | AC 18 → 3 (the catalog's shell, ac 4, standing in for natural armour, §2); hooves take no Strength; the record's 10 vs acid/cold/lightning and 10/magic kept (they are the celestial template's, not the SRD unicorn's) | magic circle, teleport, the cure/neutralize suite beyond Heal, charm/compulsion immunity, wild empathy |

**Combat envelope** (20 seeds, a reference party of four humans: warrior, cleric, thief, mage):

| Creature | Party | Party wins | Rounds to defeat (median, range) |
|---|---|---|---|
| Ghoul (CR 1) | four of level 1 | 20/20 | 1 (1–7) |
| Unicorn (CR 3) | four of level 3 | 3/20 | 6 (5–14) |
| Flesh golem (CR 7, withdrawn) | four of level 7 | 2/20 | 12 (5–12) |

Read candidly: the ghoul at SRD scale is trivial for four (13 hit points against four first-level blows: PL-07's
"trivial early fights" is the party side of this, not the ghoul's). The unicorn, with 10/magic and no magic blades in
the party, wins seventeen of twenty: the 10 off every blow is the record's, not the SRD unicorn's, and is the whole
divergence. Both are reported, not tuned.

**The golem slice was withdrawn.** A `flesh_golem` species (9d10+30, two 2d8 slams, 5/adamantine) was built and fought
(the envelope row above), but the bestiary forbids a per-material golem chassis (the owner, 6 November: one
archetype, its materials as variations; `test/bestiary.test.ts`) and the challenge table has no measure for a new kind.
An SRD golem needs one of: Hit Dice and defenses on a material variation (a composed kind that is a fixed stat block),
or an exception for named SRD stat blocks. That is a design decision, not a slice.

## What changed behaviour

- **Ghoul**: fixed 13 hit points and fixed qualities at any level (it had been 10 + 3 a level: 25 at the fifth); new
  scores; bite-claw-claw in place of a claw; AC 7 in place of 10; loses Curse, Scream, Life Drain and regeneration.
  The challenge table (`data/catalog/challenge.json`) still holds the old ghoul's measure; ecology asking for a
  higher-level ghoul now gets the same ghoul (the briefing's decoupled encounter rank, B), so the measure is stale.
- **Unicorn**: fixed SRD scores (was rolled), 42 hit points (was d10 a level), horn and hooves, AC 3, and the defenses
  it had only claimed (inert `dr`/`resist`) now act.
- **Every other kind**: identical mitigation, proved blow for blow. The damage event gains `guarded`/`bypassed` only
  where a typed defense acted; Orsino's untyped reduction is told as before.
- **Reference-only abilities**: the twelve were all `unsupported` already and never offered; nothing playable changed.
- Handbook regenerated (`doc/handbook/mm.md`).

## Counts (resolved canon, before and after)

| | Before | After |
|---|---|---|
| ability records | 363 | 363 |
| playable | 328 | 328 |
| offered in a fight (with blessings, procedures, aliases) | 331 | 331 |
| reference only | (no such state; 12 zero-effect records, all unsupported) | 12, enforced |
| unsupported ledger (keys) | 100, uncounted | 100, ratcheted (abilities 52, conditions 25, traits 15, items 8) |
| species with an unknown field | 1 (unicorn) | 0, and load fails on any |

## What remains

- **Increment B**: decoupled encounter rank (Hit Dice vs level vs challenge: re-measure the ghoul and unicorn);
  natural armour (§2: the unicorn wears "shell"); attack riders (§4: the ghoul's paralysis on a hit); declared
  scaling (§8).
- **Increment C**: spell resistance and spell interaction (golem magic immunity); the attack/SR/save pipeline and
  dispel (§10). A source of `magic`/`silver` blades in the catalog (none exists, so 10/magic is all but absolute).
- **The golem**: the decision above.
- **Defenses on variations** (a frost wolf's cold proof is still an Orsino fraction on its variation).
- **D–F**: movement permissions and richer areas; auras, gazes and suppression; lifecycle conditions, concentration,
  transformations; anchors and field procedures. An ability with a field procedure is the exemption the
  reference-only rule leaves open; none exists yet.
- Unknown-field checks stop at a record's own fields and the nested stats named above; an effect's or a hook's own
  fields are checked by `Effects.validate` only for their kinds and amounts.

## Withdrawn: the ghoul's SRD stat block (the lead, 13 November)

The full suite on 76fa804f failed where Orsino's ghoul had been placed: a brood of SRD ghouls (2d12, bite, claw and
claw each turn) in the first town's ossuary killed a first-level warrior who had won that fight before (turn 14, six
of twelve hit points left; now turn 5, none), and the king-barrow's mage and the Howe's household went the same way.
Content was balanced against the old chassis, and the slice changed it under them. The ghoul's record is Orsino's
again; the mechanisms (Hit Dice, typed defenses, the honest catalog) and the unicorn stay, and the Hit Dice specs read
the unicorn. The SRD ghoul comes back as a variant (the golem decision: a material or kind variation may carry Hit
Dice and defenses) once the challenge table is measured again and each placement reviewed: a slice that changes a
placed creature's numbers must be fought where it is placed, not only in an arena.

## The SRD ghoul and golem as variations (13 November, after the lead's decision)

A variation may carry Hit Dice, defenses, a natural routine and hide, and what of its base it goes without
(`Overlay.hitDice` and its neighbours; `Canon.stated`); a kind given one is the kind composed with it (golem with flesh
is `golem/flesh`), and one that says `unplaced` is never drawn into a country. The SRD ghoul is `ghoul/barrow` (the
`breed` axis) and the SRD flesh golem `golem/flesh` (a material, one archetype as the bestiary keeps it); both are
placed nowhere. Orsino's ghoul is unchanged. The challenge table is measured again for the unicorn (24, it had been
measured as the rolled beast, 0.5), `ghoul/barrow` (2, 4) and `golem/flesh` (24). Where each could be placed is
[placements.md](placements.md). Specs: `test/srd-variations.test.ts` (a fixture variation, 0.25 s),
`test/srd-slices.test.ts`, `test/srd-challenge.test.ts` (3.8 s: it fights).

## Attack riders, and silver deferred (13 November, batch 4)

**Attack riders** (§4): a body's natural weapons may carry effects that land with a hit (`Statistics.riders`, or a
variation's, by the weapon's id), resolved after that blow's harm, against the rider's own save, and never on a miss
(`AbilityUse.ride`; a weapon in hand carries none). Validation refuses a rider on a weapon that is no natural weapon,
or one that lands on anyone but what was struck. The barrow ghoul's bite and claws paralyse (Fortitude 12, three
turns) in place of Orsino's touch. Spec: `test/attack-riders.test.ts` (0.3 s, mutation-checked: the ride taken out
fails it). Not yet: riders that depend on several hits (rend), held/grab (§4's `held`), and riders on manufactured
weapons (poisoned blades).

**Silver weapons: deferred out of M21** (the lead). The bypass works (a weapon's `tags`, a reduction's `unless`), and
wonders' blades are magic; but a silvered blade is a new kind of arms, and a new arms item is made a fine make for the
capability market and drawn into loot by its worth, which changes what generated countries sell and hide. Adding one
needs the loot and market owners' review of where silver is had, not a catalog line.
