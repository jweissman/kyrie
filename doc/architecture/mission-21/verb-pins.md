# Player-verb pins

From the owner, 15 November: more experiential pins grounded in **player verbs**, each a chain with a checkable end
state. They are orientation and test cases, not a feature program: each is to be a tiny executable program on the real
rules, and where Kyr cannot express it, the smallest generic missing capability is reported, not hardcoded.

| Pin | The chain | Where it stands |
|---|---|---|
| **The Eye** | A mixed party (warrior, rogue, mage) fights a high-danger opponent (a discerner, a dragon) | **pinned** (test/the-eye) |
| **The Landholder** | Acquire a parcel, commission a change, leave, return, find the change part of the world | expressible today in Kyr; fixture next |
| **The Alchemist** | Collect three plants, experiment, discover a preparation, reproduce it, use or sell it | a library pattern is missing (recipe knowledge); fixture after it |
| **The Befriender** | Bond with a recruitable animal, travel together, a consequential event, separate, reunite intact | needs a probe: animals as company, a bond that persists apart |
| **The Commander** | Recruit a small group, issue an order, resolve a conflict by the rules, keep its consequences | needs design: "issue an order" has no verb |

## What the engine already has, per pin

- **Eye.** The rules kernel and the game's own tactics (test/support/gauntlet, a mixed party since this pass), the forecast
  (DangerSense), and both monsters (`discerner`: tentacles, Terror, Curse, Sleep, Charm Person, Mind Melt, Confuse, Flesh to
  Stone, Paralyzing Touch, Scream; `dragon`, a lineage kind).
- **Landholder.** Time (`watch(clock)`, used by the ratsbane rule), persistent state facts (`state(x, built)`), authored
  observations by state, spending gold, and `holds(group, place)` (dominion.kyr, today a power's). All authored with existing
  constructs: an `acquire` action, a `commission` that sets a due watch, a rule that completes it, an observation that
  changes with the state; and save/reload keeps it.
- **Alchemist.** `gather` from a stand (growing.kyr), `make_remedy` and `make_plain` (making.kyr) from a recipe's
  `takes`/`takesWith`/`makes` facts, resolved by `check(actor, mending, dc_fair)` and able to spoil, and selling through
  trade. **Missing:** a recipe is known to everyone and nothing discovers one: there is no `knowsRecipe` and no experiment.
  **The smallest generic capability:** a `knowsRecipe(member, recipe)` relation, an `experiment` action (two owned items and a
  check) that asserts it on success, and `make_*` requiring it; a library pattern in Kyr, not a kernel operation. The existing
  recipes would start known (initial facts), so nothing existing changes.
- **Befriender.** `pet` (inhabitants.kyr) makes a tame animal tolerant and greeted; a ranger's animal companion exists
  (Orsino traits; it fought in the headless review). **Unknown:** whether an animal can be a *member* of the company that
  travels with it and stays where it is left; and a `bonded(member, animal)` fact that outlasts separation. A probe, not a
  guess: a tiny world with a tame animal, `pet`, a recruit, a journey, a separation, a return.
- **Commander.** Hiring (CompanyChoices) and the planner's agents exist; a creature's `obedient` temperament holds its post.
  **Missing:** a verb for the player to order a hired member or group (hold here, go there, guard that), and the rule that
  makes the order what they then do.

## The Eye, measured (a dozen-plus seeded fights a cell, the real kernel, 15 November)

A warrior, a thief and a mage, one monster of its own level:

| | party level 5 | 8 | 12 | 16 |
|---|---:|---:|---:|---:|
| dragon, won | 0 % | 0 % | 7 % | 86 % |
| discerner, won | 64 % | 100 % | 100 % | 100 % |

The forecast agrees: the dragon at the fifth and twelfth "more than the company can take" (deadly), at the sixteenth "you
would likely beat it, but Nell could fall" (hard); the discerner at the fifth "likely beat it, but Nell could fall", at the
eighth "should beat it, though not unhurt" (fair). Held by test/the-eye (a forecast that under- or over-calls fails it).

**Findings, not mended:**
1. **The dragon's level does not scale it.** Its hit points are 99 at levels 1, 3, 5 and 9 alike, and the fights are the same
   length: a `dragon` of the base kind is a fixed block. The high-danger fight is a fixed-difficulty fight, and the party's
   level alone decides it.
2. **A discerner at the party's level is a long fight**: 22 to 40 rounds at the fifth. That is a grind to play by hand and
   an argument for the pressing-on control (HP-05).
3. **Differentiation is not what the fantasy says.** Replacing the thief or the mage with a cleric takes the fifth-level
   party's win rate against the discerner from 64 % to 100 %, and against the dragon at the twelfth from 7 % to 71 % (no
   thief): a healer carries the fight. That is a legitimate finding about the cleric, and a question for what the thief and
   mage are *for* against a boss (character differentiation, PF family).

## Next, one at a time

1. **Landholder fixture** (Kyr only, a tiny world): the cheapest, and it proves the "change becomes part of the world" claim
   including through save and reload. If it needs anything the kernel lacks, that is the finding.
2. **Alchemist**: the `knowsRecipe` pattern and an experiment fixture.
3. **Befriender** probe.
4. **Commander** design question to the owner before anything is built.
