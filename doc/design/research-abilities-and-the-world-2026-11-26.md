# Abilities and the world (research, 26 November)

The owner, today:

> I guess also wondering to what extent Kyr is succeeding at its most basic aim -- the core language is an ability and
> effects language. But somehow I was seeing lots of literal effects JSON objects in spell catalogues… I do think it
> would be crucial to making the spells/abilities/effects layer interact with the world more broadly somehow, but maybe
> that's worth research in its own right.

This is research. Nothing in code, data or the language is changed by it. The measurements were made with throwaway
scripts outside the repository, against origin/main at 2b02aca50.

## 1. Findings

1. **Kyr has two effect systems, and they barely meet.**
   - The *effect language* (src/lang/Abilities.ohm, read by src/lang/parse.ts) produces the typed `Effect`. Its
     interpreter (src/effects.ts, src/ability-use.ts) works on `Fighter[]` only.
   - Kyr's own *changes* (`Assert`, `Retract`, `Set`, `Increase`, `Decrease`: src/lang/module.ts:13) write the World:
     facts, relations, measures, states of things, knowledge and ways.

   An ability can say only the first kind. The world can read an ability only through a few projections (§2.3). The
   platform plan's line that src/effects.ts is "what a statement does (Assert, Set, Bring, Slay…)"
   (platform-separation.md:119) conflates the two. src/effects.ts is the combat interpreter. Kyr's statements are
   applied by the World and src/campaign/consequences.ts.

2. **The effect language is alive in authored Kyr but absent from the catalog.**
   - About 170 `Hazard … means "…"` declarations and some 50 item `use` fields are written as effect sentences, as
     are wonders (src/world/region-marvels.ts:118) and a kind's `using`.
   - Of the 411 catalog abilities, only 11 are sentences (`effect`); 400 are typed JSON (`effects`).
   - The 340 Orsino entries are generated. Emitting typed data from a generator is right under the medallion ruling
     (OR-408: "generators emit silver, not text parsed again").
   - The real gap is the 60 hand-written entries. 41 of them are JSON because the sentence cannot say what they need.
     19 could have been sentences and are JSON anyway.

3. **The effect language is a strict subset of the typed form.** Printed and parsed back, 215 of the 411 abilities
   round-trip exactly (52%). 196 cannot be printed, and nothing printed failed to parse or came back different
   (§2.1). So the language is faithful where it speaks, but it lacks about fourteen modifiers. Five of them
   (half-on-resist, remove by pattern, a weapon attack, a trait filter, a save's success) would bring it to 339
   (82%).

4. **Neither form can touch the world.**
   - Every `Target` is a combatant (`enemy`, `allies`, `self`…). The one exception is `Travel to <place>`.
   - The `If (…)` condition is a Deem expression over the fighter's values, not a Kyr predicate.
   - No effect can write a fact, a thing's state, a place, a way, a person's disposition, knowledge or the sky.

5. **Abilities reach the world today by four narrow bridges** (§2.3), all in runtime code:
   - conditions that grant a capability (2 abilities: Light and Knock);
   - fire and other elements let loose in a fight, which write `exposedTo(place, element)` (48 abilities; one
     authored reader in the whole corpus);
   - three field-casting whitelists in FieldUse: healing and wards on members (28), sleep and hold on a band (7), and
     Plane Shift (1);
   - `canCast(member, ability)`, which authored content reads by spell id.

   Out of 335 playable abilities, 84 have any reading outside a fight, and only 2 change what the world lets the
   company do.

6. **The world model already has almost everything a world-touching spell needs.** It has places lit and unlit, ways
   barred and opened, the states of things, `tried(entity, verb)` and its verbs (burning, prying, looking…),
   `revealedBy(entity, fact)` with `knows`, `tolerates`, `trusts`, `unseen`, and the sky's weather as `state(sky,
   weather_rainy)`. Authors already answer `tried(x, burning)` ("Hold a flame to the barrel" teaches `oil_watered`).
   What is missing is the arrow from an ability to those facts. The recommendation draws it mostly with kernel rules
   and runtime wiring, and with two small forms in the effect language.

## 2. Evidence

### 2.1 Round trip: every catalog ability printed as a sentence and parsed back

The method:
- a throwaway printer turns each typed `Effect` into the sentence Abilities.ohm would read;
- `parseAbility` reads it back;
- the result is compared with the typed form, keys sorted.

An effect carrying a field the grammar has no word for is counted as unprintable, with the field named.

| | count |
|---|---|
| abilities | 411 (340 Orsino, generated; 71 by hand) |
| written as sentences (`effect`) | 11, all of which parse |
| typed effects that print and parse back equal | 204 |
| **round-trip total** | **215 (52%)** |
| unprintable | 196, including 13 with no effects at all (Wait; Orsino's cascades, phantasms, `acquireItem`) |
| printed but failed to parse, or came back different | 0 |

Why the 196 fail, as the number of abilities blocked by each form the grammar lacks (an ability can be blocked by
several):

| what the grammar lacks | abilities | example |
|---|---|---|
| `onResist` (half or negate on a spell-resist save) | 78 | arrow_volley, acid_spray |
| `remove` by name pattern (Orsino's removeStatus) | 17 | backstab, revelation |
| `targetTrait` on apply (only undead, only animals) | 16 | charm, control_undead |
| `attack` (a weapon attack as an effect) | 15 | backstab, cleave |
| a save's `success` (half on a save) | 15 | breathe_fire |
| `summon … from` a list | 13 | summon_monster |
| a duration as an expression (`#castingLevel` rounds) | 11 | bless, barkskin |
| `summon` level | 8 | summon_monster_ii |
| `triggers: false` | 7 | cone_of_cold |
| a damage type on drain; onResist on drain | 6, 5 | siphon_life |
| `count` (how many random enemies) | 5 | magic_missile |
| `random` / `cycle` effect lists | 4 / 1 | chaos_bolt, prismatic_spray |
| the target `random enemies` (in the type, not the grammar) | 4 | lightning_bolt |
| `apply … amount`, `touch`, `hitDice`, `chain`, `save.again`, `save.lesser`, `revive.percent`/`traits`, `spillover`, `byAncestry` | 1 to 4 each | shield, sleep, hold_person |

If each form is added in the order that frees the most abilities, the round trip grows as follows:
- after onResist: 70 freed;
- after remove by pattern: 86;
- after attack: 100;
- after the trait filter: 113;
- after a save's success: 124, so 339 of 411 (82%);
- nine forms free 145 (88%);
- the long tail is one ability a form.

The hand catalog's 19 typed entries that print and parse unchanged include cure_minor, cure, the four other cures,
fire_ward, cold_ward, command, calm_emotions, kindle and holy.

Validation already makes the two forms exclusive: "needs exactly one of effect and effects"
(src/canon/canon-validation.ts:273). The runtime reads either (src/canon/canon-runtime.ts:38-39).

### 2.2 What each form can say

| | effect sentence | typed JSON | neither |
|---|---|---|---|
| harm, healing, drain, level drain, revival, kill | yes | yes | |
| conditions laid and lifted, turns or hours | yes | plus expression durations, `until-removed`, amounts | |
| saves, conditional (`If (deem)`) | attribute or kind save | plus half/negate, again, lesser | a condition on world facts |
| resources, teach an ability, summon, cast, travel | yes (gain, learn, travel unused by the catalog) | plus summon lists and levels | |
| targets | 9 combatant targets | plus `random enemies`, trait filters, touch, chain, count | **a thing, a place, a way, a person outside a fight** |
| world writes | `Travel to <place>` only | the same | **a fact, a state, knowledge, light, a way opened or shut, a disposition, weather, time** |

### 2.3 Inventory: where an ability's consequences leave the fight

**Ability → world (what an ability writes or enables):**

1. **Capability grants through conditions.** A condition's `grants` is projected into `capable(group, capability)`
   (src/campaign/party-capabilities.ts:31,53,84-88; src/campaign/creature-facts.ts:164-170). Only 5 of 212 conditions
   grant anything: `lit`, `lamplit`, `candlelit` and `torchlit` grant light (the last three flame too), and
   `unbarring` grants lockwork (data/catalog/conditions.json). So:
   - **Light** (`conjure_light`, "Apply lit to ally for 2 hours.") makes `benighted` false (data/rules/core.kyr:120-121),
     which gates searching, looking closely, prying, reading, making and taking (data/rules/discovery.kyr:43,82;
     probing.kyr:13-53; belongings.kyr:88-138; passages.kyr:149-168). The painting and the darkness observation
     follow it (src/presentation/player-view.ts:226-229,262; src/ui/scenery.ts:71,129). The light is on a person, not
     a place: the room stays `unlit`.
   - **Knock** ("Apply unbarring to ally for 1 hour.") grants lockwork, and 61 authored changes are `needing lockwork`.
     It does nothing in the reference game's dungeon, whose mechanisms need brawn, a crowbar, rope or lore
     (src/world/deep/deep-mechanisms.ts:28-44).
2. **Elements let loose in a fight.** After a `combat` resolve, every area damage of an element writes
   `exposedTo(place, element)` (src/campaign/exposure.ts). 48 abilities do this. One authored reader answers it:
   brood-hollow's webs (`Event spark … when exposedTo(nest, fire)`, data/situations/brood-hollow/situation.kyr:75).
   - Nothing writes it outside a fight, or for a single target.
   - Nothing marks a *thing* struck.
   - The damage types `electric` and `thunder` are not element entities (data/rules/elements.kyr), so Lightning Bolt,
     Thunderstorm, Maelstrom, Stormsurge and the thunder breath expose nothing. Their world shadow is silently lost.
3. **Field casting** (`Resolve invoke`: data/rules/care.kyr:37-45; src/campaign/field-resolver.ts:57-67) takes three
   whitelists, each decided in code:
   - `FieldUse.safe` (src/campaign/field-use.ts:223): heal, remove, or a lasting condition on a member; 28
     abilities;
   - `FieldUse.hostile` (:231): sleep and hold on a band outside a fight (CF-02, CF-03); 7 abilities, its sleepers
     not `able`;
   - `FieldUse.carries` (:265): Plane Shift's `Travel to plane` (GT-02).

   The field act's `Resolve` is opaque to the act's forecast. `Outcome` reads only the operator's `success` changes
   (src/presentation/outcome.ts:80-97), so no spell row can ever be blue for what it would teach.
4. **Telling.** A condition's `begins` and `ends` text ("A small steady light kindles over {target}'s shoulder") is
   told from the condition, not from a fact.

**World → ability (where the world reads an ability):**

1. `canCast(member, ability)`, projected. It is read by the field spell act, by Plane Shift's act
   (data/rules/canon.kyr:27) and by Gosse's Company, whose "throw a conjured light … onto the Ghost" asks
   `canCast(?m, conjure_light)` and spends nothing (data/adventures/gosses-company/night.kyr:198): content naming the
   spell, its cost unpaid. This is the casting-fiction invariant's case (CF-01, CF-05).
2. `capable(group, capability)` in authored Kyr. It is asked by name about 280 times: brawn 41, rites 33, lore 30,
   woodcraft 29, stealth 19, lockwork 17, light 11, flame 7 and others. Add 70 changes `needing brawn`, 61 `needing
   lockwork` and 33 `needing lore`. This is the one place where content reads a *kind* of power rather than a spell,
   and it is why Light and Knock work.
3. `granted(group, capability)` with `grantedUntil`: a timed capability written in Kyr (core.kyr:84-88).
4. The other direction, the world invoking an effect:
   - hazards (`Resolve expose(blow, victim)`, passages.kyr:133);
   - item uses;
   - wonders;
   - `law(place, law)` laid on everyone in a fight there;
   - `Teach <ability> to ally` in hazards and wonders.
5. Discovery reads `capable(party, perception)` beside a search (src/lang/discovery.ts:61-62).

**What does not reach the world, though its fiction does:**
- Fireball notes "Omitted: … setting things alight" (data/catalog/abilities.json).
- Daylight is radiant damage, and Create Darkness and Dancing Lights blind and distract.
- Augury, Foretelling and True Seeing are combat modifiers, and Mind Reading is `unsupported`.
- Charm Person is `changeAllegiance` with an encounter lifetime. 174 of 212 conditions last only for the encounter.
- The catalog has no Detect Magic, Speak with Animals, Identify or Comprehend Languages.
- Dispel Magic has no executable effect.

## 3. Recommendation: an ability is an act, and its effects are world writes

### 3.1 The model

An ability's effects are of two kinds, and an ability may have both.

- **Combat effects** (harm, healing, conditions, saves) stay as they are: the fantasy-rules domain's typed `Effect`,
  run by src/effects.ts on fighters.
- **World effects** are Kyr changes over the same World every act writes. They are lowered to `Change[]` and applied
  as an act's success is, so everything that reads changes sees them:
  - the forecast (`Outcome`), and with it the Atlas's inferred facets (AP-03);
  - the telling and the continuity census (OR-743);
  - the knowledge door (OR-527);
  - lint.

Between them is a **world shadow**: what a combat effect means for the place and the things it lands among. It is a
small map supplied by the rules domain. A fire harm in a room means the room is exposed to fire, and so are its
things that burn.

### 3.2 The vocabulary is the world's, not the spell's

Nothing new needs to name a spell. The kernel's rules (data/rules) gain a few general relations, most of them
already present:

- **Verbs, the kinds of effect.** `Kind verb` with `tried(entity, verb)` already exists (passages.kyr:43). Its verbs
  are burning, looking, prodding, prying, pushing and listening (probing.kyr:2-4). Kernel verbs would be added for what
  the old games' magic does to things:
  - lighting and darkening;
  - opening and sealing;
  - revealing;
  - soothing (a disposition eased).

  The fantasy domain maps its damage types to verbs (`elementVerb(fire, burning)`, cold to chilling). An author's hook
  then reads a kind of effect: `Event … when tried(bridge, burning)`. Hand torch, firebomb and Fireball all set it, so
  "when the bridge is struck by fire…" needs no spell id.
- **Light as a place's state.** `kindled(place)`, with a `kindledUntil` measure ended by a rule, as `granted` is
  (core.kyr:84-88). `benighted` reads `unlit(?p) and not kindled(?p)`. Light carried on a person stays the capability
  it is today. A lit *room* is a fact, and the painting, the darkness observation and the room's own Observe read it.
- **Ways opened and sealed.** `barred` (passages.kyr:72) gains `or warded(w)`. An opening verb on a thing makes the
  thing's own change that needs lockwork, by a kernel rule over the change declarations already written:

  ```
  Rule opened_by_art when tried(?t, opening) and changeOf(?c, ?t) and needs(?c, lockwork)
    and changeFrom(?c, ?s) and state(?t, ?s) and changeTo(?c, ?r) { Assert state(?t, ?r). }
  ```

  Rules with bound variables in their changes already exist (data/adventures/the-lull/clock.kyr:64, `Assert at(?x, ?p)`). Each of the 61 lockwork
  changes is reached with no author edit.
- **Revealing teaches.** A kernel rule teaches whoever is in a place where revealing was done every
  `revealedBy(x, fact)` of what is there (`revealedBy` and `knows` exist: passages.kyr:21, core.kyr:9). `Outcome`
  already counts a rule woken by an act's asserts as teaching (outcome.ts:87-97). The spell row is then blue by
  inference, never by tag.
- **Disposition.** Soothing or charming a person writes `tolerates(person, company)` (core.kyr:112) for a while.
  Topics and acts that read `tolerates` or `trusts` answer it. Invisibility outside a fight is `unseen(company,
  watcher)` (core.kyr:154), which `slip_past` and `perceives` already read.
- **Weather and terrain.** The sky is a thing with weather states (src/world/region-woods.ts:29-31). Shaping the
  weather is a verb tried on the sky, or a change on it that needs a capability, and region rules answer it.
- **Enabling spells stay capability grants.** "For an hour you can…" (Light carried, Knock as it is, water
  breathing, spider climbing, reading old letters) keeps the route that works: a condition `grants` a capability.
  Content reads `capable` and `needs`, never the spell.

So an effect does one of three things to the world:
- it **enables**: a capability for a while;
- it **acts on a target**: a verb tried on a thing, a place, a way or a person;
- it **lasts in a place**: a state with an end, kindled or warded.

Authored content answers verbs, capabilities and states. It never answers spell ids, so CF-05's 52 calling-gated
acts and Gosse's `canCast(?m, conjure_light)` have a better form to move to.

### 3.3 What Kyr's language needs, and what is only runtime

**The language** (src/lang; each needs the owner's leave):
- **L1, targets beyond combatants.** `Target` (Abilities.ohm:28) gains `it` (the thing, way or person the act names)
  and `here` (the place). The typed `Target` (parse.ts:5) gains the same. Field casting's `invoke` already admits a
  place as its third argument (src/campaign/runtime-capabilities.ts:23).
- **L2, one world statement.** `Try <verb> on <target>.`, typed `{ kind: 'try', verb, target }`, lowered to
  `Assert tried(target, verb)`. Its duration, where it lasts, is the kernel rule's, not the sentence's. For example:
  - Knock: `Try opening on it.`;
  - Light on a room: `Try lighting here.`;
  - Detect: `Try revealing here.`;
  - Charm Person outside a fight: `Try soothing on it.`.
- **L3, a capability grant by name** (optional sugar). `Grant <capability> to <target> for N hours.` is lowered to the
  existing `granted`/`grantedUntil`, or to a condition, as the domain chooses. Today's `Grant` takes only a
  `Resource` (Abilities.ohm:18).
- **L4, the round trip completed.** A form for each of the fourteen typed modifiers, starting with the five that free
  124 abilities. A printer is added beside the parser, held by a spec that every catalog ability prints and parses
  back equal. The generator keeps emitting typed silver, and the hand catalog is written as sentences.

**Only runtime and data:**
- the world shadow: Exposure generalized (outside a fight, single targets, and to things as `tried(thing, verb)`),
  with the electric and thunder types mapped to elements;
- a `Resolve` lowering port (`invoke` gives its world changes ahead of time), so `Outcome`, facets and telling see a
  spell's world effects. Of everything here, this does most for AP-03;
- FieldUse's three code whitelists replaced by one reading: an ability is usable outside a fight when its effects
  have a world reading or a lasting one;
- the kernel relations and rules of §3.2 (data/rules, not the language);
- the domain's verb map and a handful of hand abilities and conditions.

### 3.4 How it serves the platform separation

- **The kernel** (kyr-lang and the interpreter) owns verbs, `tried`, `kindled`, `warded`, the revealing and opening
  rules, the `try` statement and the target kinds. These are generic world words that an allotment society could use
  too: a rumour spread is a verb tried on a person.
- **The fantasy-rules domain** owns the 411 abilities, their combat effects, the conditions and their grants, the
  element-to-verb map, and src/effects.ts. These are its interpreter and its data.
- **The world shadow and the `Resolve` lowering are ports** that the kernel declares and the domain fills, the shape
  the conditions port proved (platform-separation.md §"The installed context").
- The compilation-context review's slice 4 (one symbol table) and slice 5 (lint as queries) gain natural queries:
  - a verb some ability tries that no content answers;
  - content that reads `canCast(?, <spell>)` where a verb or capability would do;
  - a `tried(x, v)` read whose verb nothing can set.

  Slice 6 (typed vocabulary) makes `tried(bridge, burnin)` a compile error.

### 3.5 Precedent

**Immersive sims** made magic one more input to systemic elements. In Thief and Deus Ex a water arrow douses any
torch, and in Breath of the Wild's "chemistry engine" fire, wind, electricity and ice act on every object of the right
material, whatever produced them. The lesson for Kyr is the verb: content answers *fire*, not *Fireball*. Then a torch,
a firebomb, a dragon and a spell all set the bridge alight, and an author writes the bridge once. Kyr's probing verbs
are already this, for hand acts.

**Ultima** made spells world verbs with costs. In Ultima V to VII, Light and Unlock Magic, Telekinesis and Create Food
act on the map and its objects, and reagents make the cost material and tradeable. Ars Magica's grammar (a Technique
times a Form: *Creo Ignem*, *Perdo Aquam*) shows how few verbs and kinds a spell system needs to touch everything.
That supports a small kernel verb set crossed with a domain's elements, rather than one effect form for each spell.

**Inform 7's rules** let a world answer kinds of action: "Instead of burning the bridge" and "After opening a
container". A spell implemented as "try burning the bridge" goes through the same rulebooks as the player's own
burning. That is L2 exactly: a spell *tries* a verb, and the world's rules for that verb, kernel or authored, decide
what follows. The tabletop's "spells as world verbs" (the old games' Knock, Light and Detect, each a sentence about a
door, a room or a secret) is where the reference game's player already stands.

## 4. The slices

Each slice is cheapest first, lands alone, and proves one world interaction in the reference game: the forest first
town, the old woods and the deep first dungeon under the fallen stones (OR-611, OR-644, OR-646;
test/features/world/the-reference-loop.pin).

| # | slice | proves | needs | language? |
|---|---|---|---|---|
| 0 | **The censuses.** A spec prints every catalog ability and parses it back (215 of 411 held as a ratchet that may only rise), and a world-reach census counts the abilities with a world reading (84 of 335) and those that enable or write a world fact (2). | the measurement | a test and support only | no |
| 1 | **Reading by art.** A hand `read_letters` (Comprehend Languages: "Apply lettered to ally for 1 hour.", `lettered` granting lore) for a mage, and sold as a scroll at Trader 1. In the dungeon, the seal's words and the written wards on its ways (`Change read … needing lore`, deep-mechanisms.ts:44; the counsel's "the old letters") are read by it, teaching the makers' fact. The read act is blue by inference. | a spell reveals a fact, and the Atlas's "learn" facet is inferred | data only | no |
| 2 | **Fire meets things.** Exposure generalized: any fire effect, in or out of a fight, on one target or an area, writes `exposedTo(place, fire)` and `tried(t, burning)` for each thing there that suits burning. The field act can be cast at a thing (invoke's target types, a runtime declaration). One burnable is placed in the dungeon (webs across a way, or the wrapped dead's linen on a bier) and answered by an authored Event that reads `tried(…, burning)`. Electric and thunder are mapped to elements. | authored content answers a kind of effect without naming a spell (torch, firebomb and spell alike) | runtime and data | no |
| 3 | **The spell foreseen.** A `Resolve` lowering port: `invoke` gives its world changes (a capability granted, things exposed) to `Outcome` before the act. The Light row in a dark room, and slice 1's spell beside the seal, are marked for what they open, by inference. | facets inferred from an ability's effects (AP-03); told from facts (OR-743) | runtime | no |
| 4 | **Light a room.** L1's `here` and L2's `Try lighting here`, the kernel's `kindled`/`kindledUntil` and `benighted` reading it. A Continual Flame or a lamp hung in a dungeon hall keeps the hall lit for the next descent. The painting, the darkness observation and the hall's Observe answer, and the level's savage are drawn by a light left burning. | the place, not the bearer, is changed; it persists across expeditions; the painting and telling answer | language (L1, L2), data, runtime | **yes** |
| 5 | **Open and seal.** `Try opening on it.` and `Try sealing on it.`, with the kernel's opening rule over existing lockwork changes and `warded` in `barred`. Knock is rewritten as a direct act on a door. A ward set on the stair holds the bone hounds below while the company rests. | a way opened or shut by a spell, the 61 lockwork changes reached with no author edit | language (L2), data | **yes** |
| 6 | **Revealing and soothing.** `Try revealing here` (Detect Secrets: the kernel rule teaching `revealedBy` facts), so the way down under the stones is found by art as well as by searching. `Try soothing on it` writes `tolerates`, and Trader 2's or the shrine-keeper's topics read it. | knowledge and disposition as world writes | language (L2 done), data | no further |
| 7 | **The round trip completed.** L4's forms, five first (339 of 411), the printer, and the hand catalog as sentences. The handbook and lint print Kyr for every ability. | the effect language as the one readable form of every ability | language (L4) | **yes** |
| 8 | **Weather and terrain.** The sky tried by a verb, or a change on it needing a granted capability, answered by the woods' weather rules (OR-641's woods by weather). | the world beyond one room | data, after 5 | no further |

**Dependencies on the platform plan's order:**
- Slices 1 and 2 depend on nothing in flight.
- Slice 3's port is the interpreter's (`kyr-interpreter`, platform-separation.md:110-135). It should be declared on the
  campaign-scoped installed context, not as another process-wide port (platform-separation.md:270-283, the third
  review). It lands after that context exists, or as a spike in place behind a declared port.
- Slices 4, 5 and 7 touch src/lang. They follow the compilation-context review's slice 1 (correct cache keys), since
  they change the grammar recipe's output. They are best placed after slice 4 (one symbol table), so that verbs are
  declared references and slice 5's lint queries can read them.
- Slice 7 is independent of world reach. It can go on the maturity track at any time once leave is given.
- Each slice keeps the verbs and rules in the kernel's data/rules and the abilities in the fantasy catalog, so none
  adds a core→fantasy edge to the lint's baseline.

## 5. Open questions for the owner

1. **Leave for the language.** Slices 4, 5 and 7 need small changes to Abilities.ohm: L1's targets `it` and `here`,
   L2's one `Try <verb> on <target>` statement, and L4's round-trip modifiers. Slices 0 to 3 need none and can begin
   now. Is that leave given, and in which order?
2. **Direct verbs, or capability grants, for Knock and Light?**
   - A grant makes two acts: cast, then use. The cost is paid once for an hour of use.
   - A verb makes one act on one target.

   The recommendation is both, by the fiction: "for an hour you can…" is a grant, and "this door opens" is a verb.
   Knock would move from the first to the second.
3. **Where a spell at a thing appears.** Should "Cast Fire Bolt at the webs" be a row by the thing? The probing verbs
   offer a try by the thing's look (`suits`), never by what it would answer, so offering reveals nothing. Spell rows
   by every thing would crowd the menu (the composition principle of 26 November). The proposal: by the thing, only
   where it suits the verb and the company can cast it, and in one flat level.
4. **Durations on world facts.** Either each lasting relation has its own `…Until` measure and ending rule, as
   `granted` does (no language change), or Kyr gains a general `Assert x for 2 hours` (a language change, and a
   semantic-tracing gain). The first is enough for slices 4 and 5.
5. **Generated abilities as data, or as Kyr text?** The recommendation is that the generator keeps emitting typed
   silver (OR-408, AX-04), with the printer making every ability readable as Kyr, rather than generated sentences
   parsed again at load. Is that the owner's reading of "literal effects JSON in spell catalogues", or should the
   catalog itself be Kyr?
6. **Which encounter-only conditions earn a world reading?** Charmed (to `tolerates`), invisible and hidden (to
   `unseen`), flight (to climbing), silence (no spell acts), petrified (a statue: a thing's state). This is SRD-faithful
   work under "SRD-accurate changes land", but each widens what is castable outside a fight.

---

*Measured on origin/main 2b02aca50 with throwaway scripts kept outside the repository:*
- *the round trip: a printer per effect kind, `parseAbility`, a sorted-key comparison;*
- *the reach census: `FieldUse.safe`, `hostile` and `carries` over `Content.abilities`, and conditions' `grants`;*
- *the counts of authored reads: by grep over data/ and src/world.*

*Not checked:*
- *whether the electric and thunder exposures are lost by design;*
- *whether a mage of the reference game can learn a second-level spell before the dungeon's second level;*
- *how often cold-play agents reached for a spell outside a fight.*
