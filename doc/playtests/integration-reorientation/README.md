# Reorientation and the first causal integration slice

19 October 2026. Developer playtests in the existing **Mono** client. No unfamiliar human tested this increment;
these checks do not establish enjoyment or first-time usability.

## Start playing

```sh
bun run web:dev
# Open http://localhost:8080/ (Mono, canonical Caught Below / Reedwake).
# Legacy reference: /mono.html?campaign=data/serewater/campaign.json
```

No new player client was built. Mono's maps, bottom horizontal activity strip and exploration/dialogue/pack/combat
modes remain. The shipped root and Mono default now select canonical content; old clients and campaigns remain
available. No broad migration or catalog import occurred.

The [integration diagnosis](../../architecture/integration-diagnosis.md) records the source audit and proposed
Stages 2–7. [Orsino coverage](../../architecture/orsino-runtime-coverage.md) separates actual formulas, adaptations
and unsupported mechanics.

## What was played

Before changing mechanics, the current canonical Caught Below and legacy Serewater were played through Mono using
real keyboard/pointer input. `stage1-browser.json`, the two `*.transcript.json` files prefixed `canonical` and
`serewater`, and their screenshots record that baseline. Both reached home without page errors. The baseline
semantic suite exercised alternative rescue routes, overlays, services/needs, typed effects and persistence.

After integration, two new Mono histories use the **same seed and party**:

| History | What actually happened | Lasting difference |
|---|---|---|
| `valve-and-rescue` | Get the bar; turn the pipe valve; take/equip the blade; talk to Hesta; calm Ash; lever Pell free, lead him and return by the ridge | Pipe shut; Ash alive and calm; Pell and Wren reunited; Hesta still serves the company |
| `risk-and-violence` | Risk the pipe with Bran leading; take/equip the blade; hear Hesta's warning; attack Ash; return | Pipe vented; Ash dead; Hesta witnessed the attack and refuses supplies/healing; Pell remains below |

Both saves preserve ordinary inventories, bodies, knowledge, world state and consequences. In the browser's risk
history Bran **passed** the save: that is not evidence of scald damage. Controlled reducer tests cover damage and
ward mitigation; this history demonstrates actual actorless source binding and a saving throw. The blade's first
piercing component killed the already-wounded Ash, so its fire component was not applied to a corpse. The separate
controlled defense probe below demonstrates both components against a surviving target. Neither result is hidden
or recast as a more dramatic outcome.

`slice-browser.json` records the final screens/errors/layout metrics. `*.browser-storage.json` contains actual
browser checkpoints and `*.transcript.json` the exported commands, including chosen combat commands. These are
separate from `careful`/`violent` headless records, which use an Abjurer company and prepare Fireproof before leaving.
Those headless histories also return, pay Maud for lodging and continue in the changed world. Each is re-executed
and resumed with strict full canonical equality by the recorder.

Reproduce the headless traces:

```sh
bun bin/record-causal.ts
bun bin/kyrie.ts replay doc/playtests/integration-reorientation/violent.replay.json
```

The recorder is developer evidence, not campaign orchestration. Production decisions are declared in
`data/sites/reedwake/site.kyr`, existing world rules and catalogs.

## Six required demonstrations

1. **Multi-component weapon.** `data/items.json:longsword_of_flames` grants
   `data/orsino/mechanics.json:orsino_flame_blade` only while equipped. Its source is the owned instance, not an
   invented actor. `components.trace.json` is a controlled probe using DEEM-generated bodies through Battle and
   CreatureStore: piercing roll **5 → 2** after 50% resistance, then fire roll **3 → 1** after 50% resistance.
   The warden's canonical HP changes **61 → 59 → 58**. Feedback reports each component and defense. This is a
   semantic probe, not an additional played adventure. Orsino weapon accuracy/criticals remain unsupported.
2. **Defense.** The same probe applies the revenant's existing broad physical resistance to piercing and a
   prepared Fireproof ward to fire. `test/causal-integration.test.ts` also resolves poison damage against the
   existing bronze guardian's **100% poison-damage resistance**, leaving HP unchanged, and radiant roll **4 → 5**
   under its 25% vulnerability. This does not claim poison-*condition* immunity. Zero damage now remains visible
   in action feedback; Mono labels immunity and resistance instead of suppressing the result.
3. **Timed spell.** `mechanics.json:orsino_fireproof` is a typed apply effect. In both headless histories Una spends
   **2 mana**, Bran receives a source-keyed attachment with **10 owner turns**, and travel does not tick it.
   Entering/advancing combat consumes its owner-turn boundaries. Tests execute the actual field spell and verify
   the canonical remaining duration, rather than manually creating the status and calling that a cast.
4. **Environment.** `Thing steam_pipe … Hurts with foundry_steam …` binds the physical pipe as source. The typed
   effect rolls **1d6 fire**, with **Dexterity DC 11** negating it. The browser record shows the source ID, selected
   leader and save; its canonical aftermath is `state(pipe,vented)`. The resolver has no fake fighter, HP, mana or
   inherited victim attributes. Invalid creature-only effects from a non-creature source reject before mutation.
5. **Object.** `Change close … from leaking to shut needing crowbar` is an ordinary Thing change. The careful
   history carries the real bar, changes the pipe's exclusive state to `shut`, and the same two-sided passage is
   thereafter safe. No scenario TypeScript opens it, and its active warning is replaced by the shut description.
6. **Witness and reaction.** `witnessedAttack(hesta,party,hound)` is committed only for a present surviving witness
   when the combat actually resolves damage. The authored `Event hesta_refuses` asserts
   `refusesService(hesta,party)`. Shared service/trade preconditions then withdraw *actual* options. Nera, elsewhere,
   acquires no witness fact and remains available. The player sees Hesta's specific refusal in the bottom strip;
   it is not omniscient reputation or a general moral judgment about fighting animals.

`careful.trace.json` / `violent.trace.json` contain each command's mechanical events, canonical body/world state
and player-safe feedback. The controlled damage probe retains the exact authored typed definition and final
canonical creature snapshots. No source string is interpreted as arbitrary natural language at execution time.
Legacy ability text is parsed at catalog load; consumable text now compiles once per catalog kind.

## Problems discovered and corrected

- **Profession loss:** the old combat projection dropped `professionId`. It now preserves it; a real overlay
  survives body changes and combat. Generated base statistics are not rewritten by equipment.
- **Equipment leakage:** granted attacks are now explicitly source-bound. Commit excludes equipment-only grants
  from learned abilities, while retaining a genuinely learned copy of the same technique.
- **Dead Ash guarding:** state-based descriptions and a `guarding · dead` label contradicted body death. Active
  person-state descriptions now require an able body; down/dead labels take precedence over active state/activity.
- **Invisible refusal:** combat XP lines hid Hesta's event in the four-line strip. The strip now puts witnessed
  developments after combat bookkeeping, in their causal order.
- **Invisible immunity:** action feedback removed zero-valued damage. It now retains zero damage and Mono explains
  the defense.
- **Catalog order regression:** a typed replacement initially moved Fireproof later in the catalog, disturbing
  historical fact order. Replacements now keep their original position. No golden histories were rewritten.
- **Test-driver assumption:** the first careful browser attempt tried “Free them” on Pell, using a legacy grouping.
  Canonical rescue operates the visible rack. The corrected journey selects the rack and levers it. This was a
  driver mistake, not evidence that rescue had no executable option.

## Friction and open gaps

Mono is more spatially legible than the old player, but still austere and menu driven. The map and object list
can compete for attention. Long names truncate. A bar appears under inventory while its effect is selected through
the pipe or rack; this is coherent, but discovering the affordance still depends on reading the scene. Side-room
loot beside an inactive guardian remains mechanically permissive. The flame blade is powerful against ordinary
opposition; this increment is not a combat-balance pass.

The witness rule sees only the same room, after a fight completes. It has no hearing, line of sight, memory decay,
reported accusations, interrupt timing or retaliation AI. Bodies and physical object state still have distinct
reducers coordinated by Campaign; general object/area magic is not implemented. Caught Below's broken leg is a
situational state, not a mechanical body injury; generic HP healing does not set it. Services still use shared
full recovery, including mana. Typed periodic damage, condition immunities, hit/critical rules and true-damage
semantics remain gaps. Existing simple food/ward clocks are not physiological simulation.

No legacy engine or entire ruleset was retired. The synthetic hazard branch was removed, the active entry point
now selects canonical content, and old fixtures/adapters remain for regression. This establishes one bounded
causal extension and exposes the next dependencies; it does not complete Stages 2–7 or establish a satisfying RPG.

## Final verification

`bun run check` passed: lint, both type checks, and the full automated suite. Ten opt-in browser cases were skipped
in that invocation; the actual baseline and new Mono journeys described above were run separately in Chromium.
`verification.json` records strict full-canonical equality between **both exported browser checkpoints and fresh
headless replay**, plus save/resume equality. The two headless histories each conserve the same **28 coins across
all creature purses** and contain no duplicated item instance IDs. The original Serewater histories passed without
regenerating their fixtures.

Remaining authoring friction exposed by this work: `State spent` collides with the generic schema parameter
`spent` and is rejected by the compiler's global-shadow restriction. This site calls its aftermath `vented`;
proper local scoping remains to be addressed. The current source, not a prettier separate adventure DSL, is the
inspectable definition:

```kyr
Thing steam_pipe "the split steam pipe" on boiler_arch {
  State leaking dangerous "A split pipe hisses over the boiler arch.".
  State shut "The valve is shut.".
  State vented "The old pipe has spent its pressure.".
  Change close "Turn the steam valve with a bar" from leaking to shut needing crowbar.
  Hurts with foundry_steam when leaking then vented.
}
Event hesta_refuses near hesta when witnessedAttack(hesta, party, hound)
  "Hesta draws the linen basket to her chest. 'Find your salve elsewhere.'"
  then { Assert refusesService(hesta, party). }
```

The full source in `data/sites/reedwake/site.kyr` includes the warnings, motives and alternative approaches;
`data/orsino/mechanics.json` holds typed numerical effects and provenance. No scenario-specific TypeScript makes
Hesta refuse, calms the hound, turns the valve, moves Pell or awards the blade.

A third, unexpected browser history is recorded in `retreat.transcript.json`: on a 390×844 phone viewport the
company begins an encounter, then withdraws without striking Ash. Hesta still offers help; no witnessed-attack
or service-refusal fact is created. This specifically checks that an old poison tick or an enemy's blow is not
misattributed to the company. `retreat-browser.json` records no page errors or document overflow. The mobile
regional map limitation remains. `verification.json` includes this third browser/headless comparison as well.
