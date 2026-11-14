# Paragon pins (the owner, 14 November)

Tiny, concrete player fantasies, each expressed in real Kyr and exercised through the production engine. They are
authoring and integration probes, not gates. Each pin has a tiny fixture, a short player journey through the
authoritative acts, and an honest finding: what the kernel supports, what Westernesse's content makes available, and
whether it is satisfying to play.

The owner's candidates:
- a fiery greatsword;
- a ranger's mount;
- familiar scouting;
- a deep dwarven mine;
- a planar gate;
- a remembered favour;
- adventure density in a compact authored region.

Chosen for M21, by diagnostic value and fit with existing work:
- **the fiery blade** (the lead, below);
- **the remembered favour** (the playability line, inside the laboratory's FF-06 work).

## The fiery blade

`test/small/pin-fiery-blade` is a knight and two elementals in one yard, using about 1 s of the fast lane. It is
mutation-checked: without the weapon's on-hit hook it fails.

**The journey:** the knight takes the blade ("a longsword of flames: Take"), equips it, and attacks. The fight's own
events show fire riding each landed blow:
- at half on the kiln-wight, an elemental of the fire variation (`fire_element`, fire affinity);
- at more than full on the rime-wight, an elemental of the air variation (fire vulnerability).

**Findings:**
- **The kernel supports it.** An equipped item's `hooks.onAttackHit` effects land on every hit (AbilityUse), and
  `Effects.damage` applies the target's resistances by damage type.
- **The content partly supports it.** Westernesse already has the weapon, `longsword_of_flames`, an Orsino wonder.
  Its base blow is piercing, which is a fidelity slip for a longsword. Resistance comes from creature variations
  (`fire_element`, `air_element`), which Kyr reaches with `Species elemental. Variant fire_element.`
- **There are two authoring gaps,** each with its smallest failing example:
  1. A module cannot make a new magical weapon. `Kind flame_brand "a flaming greatsword" like greatsword …` has no
     form for what its blow carries. A local kind may say `like`, `worth`, `weighing`, `described`, `granting`,
     `teaching` and `worn`, but not riders. The engine part exists (item hooks), and only Kyr's surface lacks it.
  2. A person cannot be given an innate affinity directly: `Trait fire_affinity.` is refused ("an affinity trait,
     which is not chosen"). Affinities come from a kind or a variation. This is arguably right, since it keeps the
     setting's natures coherent, but it should be said in the authoring guide.
- **A rules question:** the rime-wight took fire at resistance −2, three times the harm, because two vulnerabilities
  summed. Orsino's resistances add, while the SRD's vulnerability does not stack. This is for the rules line's
  elementals slice to decide, and the pin asserts only "more than full".
- **Playability is not judged here.** Whether a player meets such a blade in the first hour is content placement,
  not capability.

## Next

- **The remembered favour:** help someone, leave, and return to a changed relationship. It belongs in the
  laboratory; the playability line owns it.
- **The adventure-density pin** is the laboratory's own question, judged by Gate 1's walks: opportunities reached
  through ordinary decisions, not counted.
- **The ranger's mount and the deep mine** probe persistence and lazy realization (AX-07). They are candidates for
  M22.
