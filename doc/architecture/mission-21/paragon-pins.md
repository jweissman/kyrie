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

## The deep mine

`test/small/pin-deep-mine`: a pit-head and a stope under it, joined by a shaft, in the fast lane.

**The journey:** light a torch, go down the shaft, search the stope (a seam is found and a lump of star-iron comes to
light), take it, climb out. The company is then saved and restored, and goes back down: the ore is still gone and the
seam still known.

**Findings:**
- **The kernel and content support it whole:** a shaft, the underground dark, a discovery found by searching, a
  hidden item, and persistence across a save, all through the player's own acts. It passed on the first try.
- **Depth is realized eagerly.** A drawn country's deep (src/world/deep) is written out whole when the country is
  drawn; nothing is made only when reached. The fantasy does not need lazy depth, but cost does. This is the
  architecture review's AX-07, design for M22.
- **The ore's kind is borrowed** (`like cell_key worth 20`). A module has no plain "valuable" kind to be like, which
  is a small gap beside the fiery blade's first.

## The remembered favour

The playability line's `test/small/pin-remembered-favour`:
- **Expressible, but unreached until now.** `grateful`, the voice's friend bond, timed topics and gifts all existed,
  but no content made a job's giver grateful.
- **The undertown now does:** a day after the rats, Mik gives a candle and oil, "No charge".
- **One generic rule was missing:** gratitude never touched a price. It is fixed as CO-16, where a grateful seller asks
  a coin less (test/small/thanks-priced).

## The ranger's mount

`test/small/pin-ranger-mount`: a yard, a lane and a far field, a ranger, and a bay gelding named Bran.

**The journey:** "Ask Bran to come with you"; the company goes to the far field and Bran is there with it. "Let Bran
make his own way"; the company walks back to the yard, waits an hour, and returns: Bran is in the far field, the same
horse, and can be asked along again.

**Findings:**
- **Expressible, as an animal that is led:** the escort rules (`lead`, `part_ways`, `acceptsEscort`) give a named,
  persistent animal that travels with the company and is found where it was left.
- **Riding is a missing generic capability.** No act mounts or dismounts. A led horse does not change how long a
  journey takes, what can be carried, or how a fight goes. The smallest failing example: the same yard to the far
  field, with Bran led and without, takes the same time, and nothing offers "Mount Bran". This needs a design (a
  `mounted` state, travel time by the mount's pace, a carrying load, dismounting before a narrow way) and is noted for
  M22. It is not built here.

## Familiar scouting (not expressible: a finding)

**Findings:**
- **A missing generic capability.** Perception and knowledge belong to the company as a whole: what it notices
  (`noticed`), what is shown to it (`visibleTo`), and what it knows (`knows(party, …)`). No act sends a companion
  somewhere apart: `lead`, `part_ways` and `send_off` only follow, release or dismiss. Nothing lets a creature apart
  learn a fact and bring it back.
- **The smallest failing example:** a mage with an owl at a gate, and a sentry in the next room unseen. There is no act
  "send the owl into the next room", and no rule by which what the owl sees becomes `knows(party, sentry_there)`.
- **What it wants, as a design note for M22:**
  - a member or companion acting apart, with a place and a perception of its own;
  - knowledge it gains, passed to the company by an act or on rejoining;
  - the owner's view, not the familiar's, deciding what is told.

  This is the same capability a scout, a split party or a messenger would use.
- **The fixture, kept failing** (`test/small/pin-familiar-scouting`, `it.failing`, at the owner's word): a mage's owl
  is to be sent over a barred gate into a yard, and the company is to learn from it that a sentry stands there. It
  fails at the missing act ("Send Hob …" is not among the choices). When the capability is built, it begins to fail
  as a failing spec, which is the signal to make it an ordinary one.

## The planar gate (partial: a finding)

**Findings:**
- **What exists:**
  - the House of Doors, one per world, reached from the first country;
  - each plane's laws as conditions on whoever is there (`plane_fire`, `plane_air`, … in the catalog);
  - the canonical ids across lazy install (M18, OWN-31..38).
- **What is missing** is the threshold as a thing with real prerequisites (a key, a rite, a season), interactions (it
  can be opened, sealed, guarded or paid), traversal (who may pass, what crossing costs) and consequences (what follows
  the company back). This is the deferred grand tour (register GT-01..03, M22). No pin is written here.

## Listening at a door (the owner's own pin, 15 November)

`test/small/pin-listen-at-the-door`: a dark passage, an oak door shut on its way, and goblins at dice beyond it, or no
one.

**The journey:** in the dark, the company puts an ear to the door ("Listen at it") and hears low voices and dice where
the goblins are, and nothing, not a breath, where they are not. Hearing passes the shut door, as sight and the sense
of who would join do not.

**Findings, two of them defects fixed:**
- **Listening wanted light** (`not benighted`): an ear to a door in the dark was refused. It now wants none.
- **What was heard was said nowhere.** An observation `near` a thing set on a way (a door) resolved to no place, so
  the Quittance's rent-office door, written exactly so, had never told what an ear to it heard. A thing on a way is
  now near both its ends (LocalObservations.near).
- **Listening is once per door, ever** (`not tried(target, listening)`). In the old games it is done again after time
  has passed and things have moved. Making it repeatable after a while is small, and wanted.
- **What is heard is the author's text**, conditioned on who is there if the author writes it so. Deriving it from
  what is actually beyond (who, how many, doing what) is a generic capability for M22, which also serves passive
  hearing and the familiar's report.

Both fixes are mutation-checked: putting either back fails the pin.

## Against the owner's rubric (15 November)

| Pin | Rubric | State |
|---|---|---|
| Fiery greatsword | equipment, damage composition, visible consequences | **passes** with the catalog's longsword of flames; Kyr cannot make a new magic weapon |
| Ranger's mount | acquire, travel with, dismount, find again | **partly:** led along and found again; riding and dismounting do not exist |
| Familiar scouting | perceive what the owner cannot, communicate a discovery | **missing:** no companion acts or perceives apart from the company |
| Deep dwarven mine | descend, discover, return, revisit; lazy depth optional | **passes**; drawn depth is realized eagerly (AX-07) |
| Planar gate | prerequisites, interactions, traversal, consequences | **partly:** the House of Doors and the planes' laws exist; the threshold as a thing does not (GT) |
| Remembered favour | help, leave, return to a changed relationship or opportunity | **passes**, after content made gratitude and a shared rule made it count in trade (CO-16) |
| Listening at a door (the owner's) | hear through a shut door, in the dark, what is beyond | **passes**, after two defects fixed; repeatable listening and derived hearing open |

## Next

- **The remembered favour:** help someone, leave, and return to a changed relationship. It belongs in the
  laboratory; the playability line owns it.
- **The adventure-density pin** is the laboratory's own question, judged by Gate 1's walks: opportunities reached
  through ordinary decisions, not counted.
