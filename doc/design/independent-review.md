# Kyr: an independent technical review

18 October 2026. This review is based on reading the source, running Serewater by hand (CLI and browser, seed `serewater`,
Fellowship and forked histories), and building a new client against the real simulation. It does not continue the
earlier roadmap, and it does not treat the earlier implementation reports as evidence.

## Verdict

**Does Kyr model situations that make sense, or just maintain valid predicates?** Mostly the latter. The executor is
honest and careful: one admission path, atomic commands, deterministic replay, and conservation checks. But what it
executes is a set of author-latched flags over a directed room graph. The people in it have no intentions, and the
obstacles in it work in one direction only. When a situation feels coherent, it is because the author wrote prose that
asserts coherence. That prose often explains the engine instead of the world: "no one teleports home", "it is not a flag
that ends the adventure", "generated characteristics stay unchanged".

**Can the player understand where they are, what is happening, what they can do, and why it matters?** Not in the old
clients. A large part of that is fixable in projection and interface, and the new Mono client shows it: spatial
hierarchy, grouped intentions, and explained blocked ways. But the rest is not an interface problem. The player cannot
learn why the hound ignores them, why Pell will follow them anywhere forever, or why nobody in Reedwake reacts when they
murder the shopkeeper. There is nothing to show, because the simulation has no answer.

**Can a compact game interface make this immediate without hiding deeper problems?** Partly. Mono makes play faster and
easier to read. It also makes the simulation's gaps *more* visible, because it shows exactly what the model knows: an
exit that is "a few steps away" back past an armed trap, a person row whose only verbs are Give coin, Give ration and
Attack. That is the right outcome. The remaining problems are in the world model, the authoring and the content.

## Method and reproduction

- `bun run kyrie campaign data/serewater/campaign.json serewater` dumps `InformationView` JSON. It is not a playable text
  interface, so the manual play used a small `PlaySession`/`PlayerView` stepper that prints scenes, choices and
  `ActionFeedbackView` after each command. The same commands replay through `PlaySession.replay`.
- Party: the Fellowship preset (Elen, elf ranger, forager; Bran, human fighter, surveyor; Dori, dwarf cleric, pilgrim).
- Browser runs used Playwright Chromium against the built `site/`. The new client's journey is
  [doc/playtests/mono](../playtests/mono/README.md).
- Every quoted output below is actual output, not paraphrase.

## Prioritized defects

Severity is player impact multiplied by how much of the system the defect constrains. "Cause" names the primary layer.

### 1. People are scenery with dialogue attached (critical; cause: simulation and authoring)

- Of the eight Serewater NPC actors, seven have **zero goals**. Only Edda has goals: two pursuits around her permit
  deadline ([serewater.kyr:286-288](../../data/serewater/serewater.kyr)). The NPC agency system
  ([agency.ts](../../src/campaign/agency.ts)) can plan, but nobody is given anything to want.
- The cave hound "scavenges at the hoist entrance" and the boar "bars the drain path". Neither ever acts. You can stand
  beside either indefinitely. Hostility exists only as a precondition of the player's `attack`.
- Pell, once freed, waits in the vestibule forever. His line "I do not follow people who walk away without me. If you go
  deeper, I will wait here" ([serewater.kyr](../../data/serewater/serewater.kyr), `pell_free`) is the engine's
  limitation, voiced by a character.
- **Murder without consequence.** `attack(march__nera)` in her own shop: "Nera falls. Your company wins the encounter."
  Nothing in Reedwake changes. Iven's topics continue unchanged and no rule observes it. Her antidotes stay `forSale`
  on the counter, so they can neither be bought nor taken.
- Nobody notices that the party left, returned, or brought something back. Edda waits in the workshop until her permit
  deadline, then walks home. She never seeks the party out or asks about the bearing.

Why it matters: an RPG is about people with motives. Without intention, every "consequence" has to be pre-written as an
`Observe … when <flag>` line.

### 2. Situations are permanent flags, not states with causes (critical; cause: state semantics plus projection)

The example from the brief, *"The rescued traveler has reached safety and remains here. The place where they were
trapped stays changed."*, comes from [trapped-traveler/situation.kyr:22](../../data/situations/trapped-traveler/situation.kyr),
installed in Greenhollow. Its causes:

1. **A latch where there should be state.** `rescued(guest)` is asserted once and never retracted
   ([dungeoneering.kyr:69-82](../../data/rulesets/dungeoneering.kyr)). The escort precondition was just "rescued, not
   trapped, co-located". So after Pell reached the quay, the party could keep "escorting" him back to the causeway, the
   ridge and the dungeon:

   ```
   >>> escort(march__pell,march__quay)        … "Pell is back at the river, alive because someone actually escorted him out."
   >>> march__pell_home                       … "You brought me out. …"
   >>> escort(march__pell,march__causeway)    "You travel together. Your companion remains at the actual destination; no one teleports home."
   ```

   Nothing models "being escorted", "wanting to go home" or "being home". `home(pell, quay)` was declared but **never
   read by any rule**.
2. **No intention after the latch.** The freed person has no goal. Their "behavior" is whatever escort lets the player
   do with them.
3. **Portable text can't name the physical things it is bound to.** `ObservationText` interpolates only numeric
   measures ([observation-text.ts](../../src/lang/observation-text.ts)). A reusable situation therefore cannot say "the
   fallen drying racks lie levered against the wall", because it has no way to refer to `{restraint}`. It falls back to
   "the place where they were trapped stays changed".
4. **There is no physical state to describe.** Freeing someone only retracts `trapped(guest)`. The restraint is not
   moved, broken or repositioned in any modeled way, so a projection could not describe it even with better text.

Rewording the message would fix none of these. This increment fixed the first one: escort now refuses to move someone
away from their declared home (both the ruleset escort and spatial typed-exit escorts; see
[test/serewater.test.ts](../../test/serewater.test.ts)). Causes 2 to 4 need the changes listed under recommendations.

### 3. Obstacles belong to directed edges, so they guard only one way (high; cause: ontology and authoring)

Passages are not things. A route is a fact `route(a, b)`, and each obstacle is attached to *one direction* of travel:

- **The boar** "bars the drain path" via `gate(marshfang, causeway, drain)`, but `route(drain, causeway)` is plain
  ([serewater.kyr:176-177](../../data/serewater/serewater.kyr)). Coming up out of the drain, you walk straight past it.
- **The hoist counterweight** threatens only the descent. From the landing (reachable by the dry stair), the party
  walks back up into the hoist shaft past the still-armed counterweight without effect (verified: armed before and
  after, no damage). The cause is `route(landing, hoist)` at [serewater.kyr:192](../../data/serewater/serewater.kyr).
- **The Mortuary Custodian** guards court→vault and court→founders with `gate`. But
  `hazardPassage(shutters, court, founders)` is a separate edge, so the party can read the scratches, brace the burial
  shutters and walk into the founders' gallery while the Custodian stands on its dais. It does not react.
- `route(founders, court)` is asserted twice. 55 hand-written directed route facts carry a geography that a single
  `Exit` table with two sides would express.

The typed spatial model in Greenhollow (`Place … is room within …`, `Exit … by descend through door`) is a real
improvement. But it is still directional (one `Exit` per direction), and hazards and guardians still are not properties
of the passage.

### 4. The verb space is a Cartesian product (high; cause: language, then projection)

Serewater grounds **8,785 operators from 57 schemas** (`ActionSchemas.ground`, capped at 20,000 bindings per schema).
Kinds are the only applicability filter, so legal commands include:

- "Give Reedbank boar, floodplain wildlife one coin", "Give Mortuary Custodian one ration": `pay`/`give_food` accept any
  `group` ([adventure.kyr:53-66](../../data/rulesets/adventure.kyr)).
- "Attack Pell, surveyor" while he is pinned under a timber; "Attack Nera" in town.
- "Use Nera's first antidote on Elen", who is not poisoned.
- About 25 inventory commands at every location once the party carries five items (item × recipient × verb).

The old clients render these as flat lists or category tabs. The new client groups them under targets, so the noise
disappears from the screen. But it is still in the game: the simulation permits paying a bronze construct.

### 5. Two sources of truth, three names per object (high; cause: architecture)

- World facts and `CreatureStore` are separate authorities, reconciled by `CreatureFacts.project` after every step
  ([creature-facts.ts](../../src/campaign/creature-facts.ts)). Gold exists as `quantity(party, gold)` *and* per-creature
  purses, and `commitMoney` back-propagates deltas. It works (the conservation checks hold), but every new property
  needs another projection rule.
- An item has a world entity name, a catalog name and an inventory display name: "Nera's healing draught" becomes
  "Minor healing potion", "Surveyor's line and pitons" becomes "Climber's harness", "Bronze tram bearing" becomes
  "Bronze censer bearing". Commands use one, inventory shows another, and the old feedback shows a third ("Bran gains 1
  Climber's harness").
- `Person nera … Race human` ([serewater.kyr:107](../../data/serewater/serewater.kyr)) is silently overridden by
  generation (`"nera": "=gen(march_person)"`), and she is a dwarf in play. The declaration reads as authoritative but
  is not.

### 6. The shared effect bridge is fighter-shaped (medium; cause: architecture, acceptable for now)

- A trap is executed by cloning `fighters[0]`, renaming it "Hazard", giving it stat 10 and 999 mana, and putting it on a
  team ([items.ts:114](../../src/campaign/items.ts)). Trap effects target `ally`, so the hazard is the victim's *teammate*.
- Rest is `Heal 9999 health to party. Grant 9999 mana to party.` ([abilities.json:117](../../data/abilities.json)).
- Field use strips every non-persistent condition after resolution. Consumables are parsed from English-like text at
  use time.

This is a bounded and test-covered accommodation, and reusing the combat effect executor for item and trap effects is
sound in principle. It is not a foundation for environmental effects: there is no area, no object or place target, no
lasting environmental state, and no source that is not a creature.

### 7. Narration defends the implementation instead of describing the world (medium; cause: authoring)

- Action results: "You travel together. Your companion remains at the actual destination; no one teleports home." "The
  companion equips the item. Another item in the same slot is put away; generated characteristics stay unchanged."
  "You follow the route and arrive at the next place. People and dangers continue while you travel."
- Scene prose works as a strategy guide: "You can fight, use ranger woodcraft to leave it unprovoked, or return through
  the stores to the dry refuge stair. Its survival does not reset when you leave." "Taking the line gives a real tool to
  a particular companion; it is not a flag that ends the adventure."
- Static prose contradicts state: the drain says "The tide board's red notch means the culvert is under water" while
  the culvert is open.
- Base descriptions are conditioned on unrelated flags. `scene_gallery … when able(roost)` holds the room's only
  physical description, so after the hound dies, the moulds and collapsed roof vanish from the description. The
  vestibule works the same way.

### 8. Scale and time are uniform (medium; cause: authoring, plus a simulation default)

Every Serewater `route` takes one tick (10 minutes): crossing the quay to the inn, the causeway to the ridge, the yard
into the dungeon. A conversation takes 10 minutes, and so does picking up each of 4 coins separately. The typed spatial
model fixes some of this (overland travel is 1 hour), but Serewater predated it.

### 9. Combat and character identity are thin (medium; cause: content and Orsino adaptation)

- A level 1 party on auto tactics killed the level 5 Mortuary Custodian in one command with no losses. In both recorded
  fights the cave hound (11 HP) died in a few blows without wounding anyone.
- No weapons or armor; damage is `statMod(strength) + 1d6` for everyone using "Weapon attack". The ranger gets
  "Backstab" and "Mend wounds"; the cleric's healing is the same ability.
- Backgrounds are Serewater puzzle keys: surveyor grants delving to disarm *these* traps, pilgrim grants burial lore for
  *this* Custodian. They are campaign-specific capabilities presented as character identity.
- On Orsino fidelity, I agree with [orsino-compatibility.md](../orsino-compatibility.md), which is candid. Most
  executable content is adaptation, not port: a different `statMod` divisor, six attribute saves instead of fifteen
  categories, flat armor instead of AC, and no feats, perks, equipment proficiencies or planar modifiers. The DEEM
  creature constructor and the item tables are where the corpus is actually reused.

### 10. Observability is a hand-written policy (medium; cause: projection)

`PlayerView` decides what the player perceives with a documented locality heuristic
([player-view.ts:52-56](../../src/presentation/player-view.ts)) and an `ownHidden` list of predicate names. That rule
already leaked. `PublicChoice.targets` exposed hidden fact ids, such as `orchard__mirror_prisons` before examination.
The existing test `player-safe campaign view > keeps discovery facts private…` was **failing on arrival**. It is fixed
here by excluding fact-typed bindings from public targets
([action-presentation.ts](../../src/presentation/action-presentation.ts)). Without declared observability, every new
predicate risks a similar leak.

### 11. Persistence: sound, but heavy (low)

Command-level checkpoint and rollback is correct ([campaign.ts `execute`/`rollback`](../../src/campaign/campaign.ts)):
a throwing command commits nothing, combat damage included. Replay is deterministic. The Mono browser transcript replays
in Node to the same world state ([test/mono-browser.test.ts](../../test/mono-browser.test.ts)), and the existing parity
tests pass. But each checkpoint embeds the compiled module: 139 KB of a 254 KB save at the start of a game. Rules run as
one ordered pass per tick with no fixpoint, and authors must latch facts by hand. That is defensible, but it is why so
much state is one-way flags.

## Where the system works well

- **One admission path.** `PlayerView.resolve → Campaign.available → execute`. No second movement or rules interpreter
  exists in any client, and the new client did not need one.
- **Transactions and replay.** Rollback on failure, deterministic seeds, CLI/browser parity, conservation checks.
- **Discovery and knowledge** (`knows`, sources, `informedPassage`) are coherent and drive real play. Reading the
  register and lantern letters opens the secret stair.
- **The typed spatial model and the role contracts** for portable situations are the right direction. Serewater adopts
  the hierarchy in this increment with no command or golden-history changes.
- **The tests** are many and meaningful (about 190 cases). They catch real regressions, and caught one here (a place count).

## Representative command traces

| Command | Path | Observation |
|---|---|---|
| Travel | ground `travel(party,a,b)` → `Requires … route(a,b) …` → `at` exclusive assert → per-tick NPC/rule pass | 10 min at every scale; obstacles only on the forward edge |
| Conversation | `Topic` → speaker action, `Says` → `report` | Costs 10 min, repeats verbatim forever, never exhausts |
| Trap | `risk_passage` → `Resolve expose(blow, victim)` → `Items.expose` → fake "Hazard" fighter → `AbilityUse` | One companion is hurt and the whole party crosses; return route unguarded |
| Item | `use_item` → `consume` → parse catalog `use` text → `AbilityUse` | Allowed on healthy targets; three names per item |
| Spell (field) | `field_spell` → `FieldUse.perform` → same executor | Sound; restricted to safe ally effects |
| Combat | `attack` → `encounterBattle` → `Battle` loop driven by `CombatController` | Whole fight is one command; XP via `encounterXp` measure |
| Rescue/escort | `free_obstruction` → `rescued` latch; `escort` moves both groups | Escort-from-home allowed before this increment; no NPC intention |
| Purchase | `buy_item` → `purchase` resolver: gold lease, item into inventory | Correct and conserved; item × recipient × merchant grounding |

## Diagnosis by layer

| Problem | World model | Authoring | Content | Projection | UI |
|---|:-:|:-:|:-:|:-:|:-:|
| NPCs without intention or reaction | ● | ● | | | |
| Latched situations, generic aftermath | ● | ● | | ○ | |
| One-directional obstacles | ● | ● | | | |
| Nonsensical legal verbs | ● (no applicability) | | | ○ | ○ (hidden in Mono) |
| Disorientation (room vs building vs region) | ○ | ● (Serewater fixed) | | ● | ● (fixed in Mono) |
| Engine-defensive narration | | ● | ● | | |
| Thin combat identity | | | ● | | ○ |
| Info leaks | | | | ● (fixed) | |

● primary cause, ○ contributing cause.

## Authoring, DEEM and reuse

Serewater is 333 lines: 55 directed routes, 27 district facts, 41 observations, 10 topics, 7 item instances with
separate kind, wearable and price facts, and 17 globals in the manifest. Most of it is bookkeeping a better ontology
would derive: two-sided passages, a containment-derived district, and item instances defaulting to their kind's name.

DEEM is used well for numbers, names, inhabitants and seasonal tables. It does not generate geography, institutions or
situations. The two extracted situations prove that role binding works, but each still depends on ruleset predicates
(`trapped`, `rescued`, `restrainedBy`) and cannot describe the entities it binds. **Contextual zoology, botany, religion
or settlement generation would hit the same wall:** generation can choose *which* boar, but nothing in the model lets a
boar want, fear, feed or guard. The feasible next slice is a small creature-behavior vocabulary (territory, feeding,
flight threshold) over the existing planner, not more tables.

Planar travel exists only as a validated exit mode (`cross_plane`). Building on it is premature until passages are
first-class.

## Recommendations

### Done in this increment

1. Serewater declares its spatial hierarchy with the existing `Place` syntax: region, settlement, wilderness, the
   Censer Hill site, three levels, four buildings and 27 rooms. Command ids and both golden histories are unchanged.
2. Escort refuses to move a rescued person away from their declared `home`, in both the ruleset escort and typed-exit
   escorts.
3. Fixed the hidden-fact leak through `PublicChoice.targets` (the failing test now passes).
4. Fixed "Dori gains 0 equipped Sepulchral lantern" (`CombatPresenter` formatting of unquantified gains).
5. A renderer-independent screen model ([src/ui](../../src/ui)) and the Mono client
   ([doc/playtests/mono](../playtests/mono/README.md)).

### Next, small and contained

- **Two-sided passages.** Make `gate` and `hazardPassage` apply to both directions unless declared one-way, or lower
  them from a single passage declaration. Remove the 55 hand-written routes from Serewater.
- **Name interpolation** in observation text (`{name(restraint)}`), so portable situations can describe what they bound.
- **Replace `rescued` with state.** `following(guest, party)` set by the player and cleared at home, plus a pursuit
  `seeks at(guest, home)` once the guest is left alone. Escort becomes "lead", and the traveler can also walk home alone.
- **Applicability on social verbs.** `pay`/`give_food` should require a recipient that can use goods (`trades`,
  `eats`). Attacking a non-hostile person should assert hostility in witnesses at the site, with a town reaction rule.
- **Separate base descriptions from state details**, and remove engine commentary from `Result` text and scene prose.
  Treat it as a content lint (flag "flag", "teleport", "generated", "the engine").
- **One name per item instance**, defaulting to the kind's name unless authored. Make `Person` race and class either
  honored by generation or removed.

### Longer-term language and architecture work

1. **A Thing/Passage ontology:** passages as entities with two sides, open, closed or locked state, obstacles, and
   observability, so that guardians and traps belong to things and places, not edges.
2. **NPC needs, schedules and reactions:** goals derived from roles (keeper guards, merchant trades, animal feeds or
   flees), and reaction rules triggered by observed events (witnessing an attack, a return, a delivery).
3. **Declared observability:** perception rules in Kyr instead of `PlayerView` heuristics.
4. **Effect targets beyond creatures:** an environmental effect executor with object, place and area targets and
   non-creature sources, replacing the cloned "Hazard" fighter.
5. **A single authority for creature-held state**, or a declared projection, instead of hand-synced money and items.
6. **Saves that reference the module by content hash** rather than embedding it.
7. **Scale-aware time** derived from the containment hierarchy (room, site, region).

### Legacy campaigns

Keep Serewater (now spatially typed) as the reference integration target and Greenhollow as the typed-exit example.
Move the crossing, two-sites, pantry and orchard experiments into test fixtures. Freeze Orra, Blackvein, Sanctuary and
Frontier as regression histories. Don't extract more situations from them until the passage and NPC-intention changes
exist, or the extractions will carry the same latches.

## What has not been established

No unfamiliar human has played either the old clients or Mono for this review. Automated journeys show that the
interface works and stays within the screen; they do not show that it is enjoyable or easy to learn. The input-count
comparison measures one scripted route, not usability.
