# Places and portable situations: the implemented boundary

This increment supplies a typed physical world, two extracted situations, contextual construction, reusable ecology/devotion rules, and the **Wayfarer** game client. It does not replace Kyr's world, planner, effect reducer, creature store or campaign runtime. Saint Orra, Blackvein, Sanctuary and Serewater remain available. `serewater.html` preserves the previous primary client; `workbench.html` remains the developer interface.

## What is now authored together

[Greenhollow source](../../data/greenhollow/greenhollow.kyr) contains the physical site, people, motives, local topics, item placement, warnings, environmental constraint and changing observations. It is a new reusable site, not a conversion of Serewater's room IDs. A house has a shop, cellar and lower archive, a searchable drain creates a return loop, and separate outdoor paths connect two settlements and habitat rooms. The site supports taking a real key, unlocking then opening a door, descending, rescue/escort, searching, disarming or accepting a trap, optional combat, collecting/equipping a relic, returning and revisiting.

The rescue and charter content are **separate installed situations**. They bind actual people/places rather than creating copies or regenerating inhabitants. Neither declares a unique rescue/deliver/victory command. Their independent outcomes do not terminate the campaign.

| Layer | Author's responsibility | Executable owner |
|---|---|---|
| DEEM construction | Biome context, weighted name/population/species/supply/relic tables; nested construction | Existing `Content`/DEEM runtime; instantiated once |
| Physical site | Containment, directional exits, physical door, ordinary object placement | Kyr compiler → typed entities/ordinary action schemas |
| Situation | Bound role requirements, knowledge, topics, commitment, outcomes | Installed module in the existing campaign |
| Reusable fantasy rules | Saves, conditions, blessing, equipment, identification, gathering, restraint | Existing `AbilityUse`/`Effects`, World and CreatureStore |
| Perception | Grounded conditional prose, known exits, visible people/objects | Existing PlayerView and action feedback |
| Game interaction | Scene, object selection, thresholds, conversation, inventory, encounter | Wayfarer consumes PlayerView/PlaySession; no frontend rules |

## The source and its lowering

Before, a location was a flat `Entity …: place`, and two `route` assertions made a building entrance indistinguishable from an overland journey. The author also manually registered action permissions and metadata to explain movement.

Now:

```kyr
Place town "Greenhollow" is settlement within vale.
Place house "Hearthleaf" is building within town.
Place street "Apothecary street" is room within town.
Place shop "The shop" is room within house.
Place basement "Cellar level" is level within house.
Place cellar "Drying racks" is room within basement.
Exit entrance "Enter Hearthleaf" from street to shop by enter.
Exit stairs "Cellar stair" from shop to cellar by descend through cellar_door.
```

These remain `place` entities, with typed `space` metadata. Each exit is a typed passage and compiles to a parameterized ordinary action: living actor at origin; destination not closed; traversal not denied; named door open; required route fact known. Its effect asserts the single authoritative `at(actor,destination)` relation. There is no second movement interpreter. Searches compile to one room action revealing its authored findings without putting secret names on the button. Escort variants reuse the exit guards and move both real groups. Local steps take ten minutes, overland travel one hour, planar transitions two hours; these are deliberately fixed defaults, not a physical distance simulation.

Parent-kind errors, containment cycles, unknown doors/facts and invalid transition scales fail validation. `walk` cannot cross building/level/region boundaries. Cross-plane traversal is typed and tested, but this region has no playable planar destination. Object location still uses `at`; arbitrary containers, capacities, reach and line of sight are not implemented. `inside` is only a typed relationship, not a promised inventory subsystem.

A door uses `lockedDoor`, `openedDoor`, `doorHere` and `keyFor(real_item,door)`. Unlocking requires an awake carrier in the company and preserves its owned key. Opening is separate. Delving offers a deterministic thirty-minute lock-picking alternative for explicitly pickable locks. This is a bounded capability, not a faithful Orsino skill-check system.

## Two extractions, without an enormous Adventure wrapper

| Existing content | Extracted package | Explicit requirements | Preserved / deliberately bounded |
|---|---|---|---|
| Serewater's Pell | [trapped-traveler](../../data/situations/trapped-traveler/module.json) | Guest group already trapped at bound room; restraint mounted there and actually restraining guest; safe home and party | Free and escort through real thresholds; canonical death and separate freed/returned/dead outcomes. Pell's personal map and salvage rewards remain in Serewater. |
| Sanctuary's Cira | [founding-charter](../../data/situations/founding-charter/module.json) | Keeper at forecourt; closed shelter; mounted admission mechanism; party | Read privately, communicate through trust, keeper honors the established charter. The portable bounded commitment is a World rule; original Sanctuary retains its planner. This is not a new test of general NPC agency. |

The manifest `roles` block is an installation-time contract, not a second ontology. Types and predicates refer to ordinary Kyr state; the existing typed import binds each role. Requirements are checked before installation commits and remain inspectable in the saved module record. They are not invariant requirements: rescuing the guest must be allowed to make `trapped(guest)` false.

```json
"roles": {
  "guest": {"type":"group", "conditions":["trapped(guest)","at(guest,captive_room)"]},
  "captive_room": {"type":"place"},
  "restraint": {"type":"mechanism", "conditions":["mounted(restraint,captive_room)","obstruction(restraint)"]}
}
```

Original campaigns are retained and tested, rather than deleted or silently replaced. Blackvein's discoveries already reuse the information library; its spreading contamination remains local rules. Orra's guardians/custody, Frontier's pressure selection and Serewater's commission/training are candidates for later extraction, not claimed as portable here.

## Construction in two contexts

[The same region template](../../data/greenhollow/templates.json) is installed by [riverbank](../../data/greenhollow/campaign.json) and [woodland](../../data/greenhollow/woodland.campaign.json) manifests. The nested constructors draw names, ancestries, plant and animal independently; neither table holds a complete situation profile. People still use the canonical `creature` generator. `_plant` and `_animal` are genuine intermediate choices, reused by generated habitat and signs facts; they are omitted from public output. Nested person names deliberately use `>name`, avoiding accidental inheritance of the region constructor's name.

```json
"_plant": "=lookup(habitatPlant, #biome)",
"_animal": "=lookup(habitatAnimal, #biome)",
"casting": "=gen(region_casting)",
"facts": "=concat(gatherEntries(terrainConstraint, #biome), gen(plant_habitat), gen(plant_sign), gen(animal_habitat), gen(animal_sign))"
```

The small generic `facts` manifest output accepts only typed initial relation assertions; compiler validation still applies. It permits DEEM to construct structured habitat and traversal constraints instead of only numbers and prose. These assertions become frozen world state; inspecting or returning does not regenerate them. Arrays of DEEM expressions are **not** implicitly evaluated: the fact constructor uses `args: "=concat(wood, #_plant)"`.

The riverbank context has weighted river populations, alder/yarrow, otter/deer signs, larger supplies and a later rain pressure. Its direct raised-road departure is cut, so the habitat approach matters. The woodland context has a different population mix, pine upland names, yarrow and deer/wolf signs, reduced supplies, earlier weather and a cut onward woodland trail; the direct raised road matters. These are independently composable constraints. The two contexts reuse the site's floorplan and situation roles: they are not independently generated town layouts, ecosystems or economies.

## Effects, content fidelity and remaining friction

See [the content compatibility account](../content/ecology-devotion.md) for exact Orsino sources and adaptations. Life Cleric and Abjurer are explicitly separate Kyr class variants. Luminous Touch and Cure Minor preserve the inspected healing expressions; Fireproof preserves 50% fire resistance. Costs, attribute saves, fixed owner-turn durations and chassis remain Kyr adaptations. Existing class identities are not silently relabeled faithful ports.

The same ability/effect reducer handles field wards, shrine blessings, consumed remedies, trap exposure and creature abilities. New persistent attachments retain source IDs; identical shrine bonuses do not stack. Combat turns consume their explicit lifetimes; walking and resting do not. Equipment modifies effective values through canonical owned/equipped item attachments, leaving generated base statistics unchanged. Item-kind equip/use eligibility is now inferred from ItemCatalog for actual instances, removing a manual synchronization obligation discovered in browser playtesting.

The current author still writes imports/exports and shared rule lists in manifests, some low-level placement/relationship assertions and local weather rules. Habitat table suitability is checked by corpus tests, not a dependent type system. Rescue sources assume a single party controller; institutional `closed(place)` remains different from a physical door. No universal social law, arbitrary persuasion, strategic ecology, distance simulation, passive hostile AI or new planner is implied. The cave hound is an optional encounter; permitting theft beside an inactive monster is a real remaining fiction/mechanics gap.

The new scene client improves scale, entry history and object/exit selection; schematic icons are not physical positioning. It is a working alternative, not evidence that the RPG now meets human usability or game-feel goals. Browser walkthroughs, screenshots and concrete friction are in [Wayfarer playtests](../playtests/wayfarer/README.md).
