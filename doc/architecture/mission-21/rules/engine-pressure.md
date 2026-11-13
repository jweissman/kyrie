# SRD accuracy as design pressure on the engine (Mission 21, rules)

What the SRD slices ran into (srd-invariants.md, placements.md, recovery.md, common-names.md), each read as a
capability the engine lacks. For each: the capability, the smallest change that delivers it, what it unblocks, its
ripple, and how it is tested. M21 builds only enablers that change no world as it plays (marked **built**); the rest
is design for M22.

## 1. Quantities fixed when the country is written → late binding; identity apart from the name

**Seen as:** the undertown's `Numbers` are fixed for the company that arrives (one), so a company that grows meets a
band written for one (placements.md, batch 4); a country's name seeds 49 of its draws (`${region.name}:…`), so it
cannot be called by a Common name without re-drawing the country (common-names.md).

**Capability.** Two separations. (a) A band's size as an expression the engine evaluates when the band is met, not a
number written into the module: `Numbers (1 + #company / 2)`. (b) A country's identity (its seed key) kept apart from
what it is called: `region.key` drawn once; `region.name` only said.

**Smallest change.** (a) `PersonCount` takes a Deem expression; `ModuleInstallations` makes the members when the
company first comes where the band lairs, with `company` bound to the party's size then (members past the first made
lazily, as summons are). (b) `region.key = region.name` at drawing; every `${region.name}:` draw key becomes
`${region.key}:` (49 sites, mechanical); the name is then free to be Common.

**Unblocks.** The undertown for a company that grows (M22 note); T24-20's human country in Common; any authored band
that scales with the party.

**First authored use.** Low Water's doubles (data/adventures/low-water/interval.kyr): one for each of the company, as
the prose says ("each one is looking at the one it was made from"). They had been written four for a company of
three; the lead's ruling (14 November) makes them three, the company the adventure is written for, until a band can
read the company's size when it rises (`Numbers (#company)`).

**Ripple.** (a) None until a template writes an expression: then the worlds that use it, their placements and the
traces that cross them. (b) Renaming `region.name → region.key` changes nothing (the key is the same string); calling a
human country by a Common name then moves every spec that names a country (a handful: riddles, scenery-kinds,
march-told, frontier, foundings) and nothing drawn.

**Tests.** A tiny world whose band is `Numbers (#company)`: met by one, one; by three, three (`small/`). A census over
ten seeds that the key is unchanged and every draw keyed by it (a scan of `Draw(`/`Expressions(` keys).

## 2. Stat blocks as fixed numbers → Deem expressions over context in any numeric stat

**Seen as:** a level-12 mummy bites for 1d4 (AB-03): Orsino's natural weapons have one die at every level, and a grown
kind's level adds only hit points; an SRD block cannot scale at all.

**Capability.** A stat block's numbers (hit dice, a natural weapon's damage, its natural armour) as Deem expressions
over the creature's context: `level`, `company`, its scores.

**Smallest change (built, enabler a).** `Statistics.hitDice` already takes dice; it now reads `#level` and `#company`
at the creature's making (`company` from the generation context, one if unsaid). A stat block (a species' statistics,
or a variation's) may name `damage` by natural weapon (`{ "slam": "1d6 + #level" }`), thrown per blow with the
fighter's context, and `armorBonus`, an expression over `#level` added to its natural armour. The honest catalog
refuses any name an expression reads that the engine does not bind. No placed creature's record changes.

**Unblocks.** The SRD mummy and other high-level kinds as blocks that do not need a level-scaled rule; an Orsino kind
whose blows grow (AB-03's first answer) by data alone.

**Ripple.** None as built. Writing an expression into a placed kind moves its challenge measure and every fight with
it: measured again (§6) and re-fought where placed.

**Tests (built).** `test/stat-expressions`: an unplaced fixture kind's hit points, blow and armour at levels 1, 4 and
9 and for companies of 1 and 3; an unknown name refused; mutation-checked. **Not built: the SRD mummy** as an
unplaced variation (8d12+3, slam 1d6+10 and mummy rot, 5/—, fire half again). It is not small: a variation adds to
its species' defenses and cannot take one away, and Orsino's mummy carries `physical: 0.5` (half from every blow)
where the SRD's is 5/—. It needs `forgoes` to reach a base's defenses as it reaches abilities (a defense named is
dropped before the variation's own are laid on): a change to `Canon.stated` and `KindDefenses`, with an equivalence
over every variation. M22, with §4.

## 3. Silver blocked by loot and market coupling → items as form × material

**Seen as:** a silvered blade would be a new arms item, made a fine make for the market and drawn into loot by its
worth (srd-invariants.md, silver deferred).

**Capability.** A weapon's material as a property of the thing carried, not a kind of its own: a longsword of silver
is the longsword (its form) made of silver (a material of `materials.json`), and what the material is to a guard
(silver, cold iron, adamantine) is the material's.

**Smallest change (built, enabler b).** A material may say the attack tag a blade of it carries (`passes`: silver,
cold_iron, adamantine); an item carried may name its material (`ItemInstance.material`); the wielded weapon's profile
carries that tag beside its own, into the existing `tags`/`unless` bypass. No arms item, no loot table, no market.

**Unblocks.** Silver, cold iron and adamantine blades placed by hand (a reward, a quest's blade) without touching the
catalog's loot or markets; the unicorn's 10/magic and a golem's 5/adamantine answered.

**Ripple.** None as built. Selling or dropping material makes is the loot and market owners' (a price rule by
material, a table of where silver is had): then the worlds' shops and caches.

**Tests (built).** `test/materials-bite`: a longsword carried as silver passes a 10/silver reduction and is told so;
the same longsword of plain iron does not; a material with an unknown `passes` refused; mutation-checked.

## 4. Riders only on one natural weapon's hit → one typed resolution pipeline with hooks

**Seen as:** riders exist only as a natural weapon's on-hit effects (the barrow ghoul's paralysis); rend (two claws
hit), grab/held, a poisoned blade (a rider on a carried weapon), spell resistance, and the SRD's order attack →
spell resistance → save → effect have no home; the venom's two chances (CB-14) came of two paths each laying the
same condition.

**Capability.** An ability's resolution as declared stages over one recipient set: `attack` (natural or carried,
with its riders), `resist` (spell resistance against a caster check), `save` (per effect or per ability),
`effects`, each stage a typed hook (`onHit`, `onCritical`, `afterRoutine` for rend), each writing one event.

**Smallest change.** Lift `AbilityUse.attack`'s riders to a `resolution` list on the ability, defaulting to today's
order; riders on a weapon carried (`ItemInstance.coating`: a poison's dose, spent on a hit); `afterRoutine` effects
on a natural routine with a count (`rend: 2 hits`); a `held` condition with its holder (the briefing's §4).

**Unblocks.** Rend, grab/held, poisoned blades, spell resistance, Acid Arrow and Disintegrate as written.

**Ripple.** Every ability fought: the default must reproduce today's order exactly (an equivalence spec over every
ability, as the defenses had), so no world moves until a record declares a stage.

**Tests.** The equivalence over every ability × a table of targets (same events, seed for seed); one spec per stage
with a fault put back.

## 5. Rest restoring everything, as often as you like → recharge declared on abilities

**Seen as:** a six-hour rest, an hour at a healer, a night at the inn all give back every spell and use; and a healing
cantrip was at will (recovery.md; rule 1 built).

**Capability.** What a recovery gives back, by what the ability says of itself: `recharges: rest | night | day`.

**Smallest change (built, enabler c).** `Ability.recharges`, read by the existing recovery path: a use of an ability
that recharges by `night` comes back only from a night (a night at an inn, or in the open), not a six-hour rest or a
healer's hour; one by `day` only from the first night of a new day; one by `rest` (or saying nothing, as every
ability does today) from any. The recovery says which it is (`FieldResolver`, from the action resolved).

**Unblocks.** recovery.md's rule 2 (spells once a day) as data: an author or a calling marks its spells `day`.

**Ripple.** None as built (no catalog ability declares it). Declaring it on a calling's spells moves every fight
after a rest: re-fought as expeditions (recovery.md's gauntlet).

**Tests (built).** `test/recharges`: a fixture ability by `rest`, `night` and `day`, each restored or not by a rest, a
night and a second night the same day; mutation-checked.

## 6. Challenge by twelve fights, placed creatures caught only by the full run → a nightly measure and placement invariants

**Seen as:** the table at twelve fights a level is noisy (the barrow ghoul's levels came out 5, 2, 8 of twelve); a
change to a placed creature (the SRD ghoul in the ossuary) was caught only by the full suite (srd-invariants.md,
Withdrawn).

**Capability.** (a) The challenge table as a nightly artifact: 48+ fights a level, with a confidence interval per
kind, diffed against the kept table, a kind whose interval moves flagged. (b) Placement invariants in the push lane:
over a starting country's placed hostile groups at real play's numbers, every lethal one told and escapable.

**Smallest change.** (a) `bin/kyrie bestiary challenge --fights 48 --out` writing the interval beside the value; a
scheduled CI job; the table written only by a deliberate commit. (b) **Built:** `test/placed-told` (below).

**Ripple.** (a) None until the table is written (M22, decided). (b) None: it reads.

**Tests.** (a) The job's own diff. (b) `test/placed-told` (about 12 s, so the push lane): a1 assembled as real play
writes it (debt, one warrior), each placed hostile group fought ten times by a lone first-level warrior; of those he
beats less than half the time, a temper that warns first or bars a way tells itself (its escape is leaving before it
closes), and any other must be heard or seen from a place beside it without a capability and must leave him Flight
on his first turn in every fight. Mutation-checked: its sound taken away, its sound left only to a reader of sign, a
warning keeper made savage, Flight closed. Found: three warning keepers (the barrow recess raider, the halls' mummy,
the vault's barrow ghoul) end a lone warrior before his first turn in one to three fights of ten; warned, he need not
stay, so this holds, but none of them may be made to fall on unwarned.

## 7. Conditions triggered implicitly by damage kind → typed provenance for effects

**Seen as:** a blow for nothing made its target bleed (R9-06), a venom poisoned on two saves (CB-14): a damage kind
lays its conditions on whatever deals it, whoever meant what.

**Capability.** Every effect knows what it came of (an ability, a weapon's blow, a rider, a hazard, a condition's tick)
and every condition it lays is laid by a declared source, so a kind's trigger is one declared effect of the blow, not
a side effect of the number.

**Smallest change.** `EffectContext.applies` (built for CB-14) generalised to a `provenance` on each event and each
condition instance; a damage kind's trigger becomes a rider the blow carries by its kind (`physicalRiders` in the
vocabulary), resolved by §4's pipeline, so it is one rider among the rest and cannot double.

**Unblocks.** Event accounts that say why a condition came; balance by provenance; §4.

**Ripple.** Every fight, if the triggers move: an equivalence spec first (today's rules, both fixed bugs included).

**Tests.** Equivalence over a table of blows; a condition's provenance read back from its instance.

## Order

§5, §3 and §2's enablers are built now (they change no world). §6(b) is built. M22: §1(b) (mechanical), §4 with §7
(one pipeline, equivalence first), §1(a), §6(a), then the placed SRD slices that need them.
