# Serewater: complete campaign playtest evidence

Build with `bun run web:build`, then open **`site/index.html`**. These are developer playtests of the primary Lantern game client, not an independent first-time human usability study. Completion and passing tests do not establish fun.

## Two actual browser histories

Both histories were played in Chromium through the player controls, not the workbench or a hidden gameplay implementation. They created different parties with different seeds, spoke to Nera/Iven/Pell/Edda/Jory, purchased and consumed real medicines, escorted Pell home, explored branches and the furnace loop, fought the cave hound, risked both the counterweight and poison crock, equipped recovered line and lantern, discovered the hidden stair and chalk exit, recovered, trained, reloaded a save, and undertook a second expedition. The later route used the learned surface connection and climbing equipment. Both equipped a relic and used the trained strike against surviving wildlife afterward.

| History | Result |
|---|---|
| [Fellowship: 92 commands](fellowship.md) | Elf ranger, human fighter, dwarf cleric with practical backgrounds. Obtains Iven's writ and lawful Custodian passage; guardian remains alive. Everyone survives and recovers. Elen learns measured strike and equips a generated Warden's blade. |
| [Hired company: 91 commands](hired.md) | Human thief/fighter/mage; forager backgrounds provide woodcraft without a ranger, but no burial-lore/Fellowship admission. Defeats the Custodian; Mira dies and remains dead after recovery. Nell retains equipment and training for future play. |

The [comparison](comparison.json) contains exact outcomes, canonical party state, currency totals and autonomous NPC decisions. Both histories return on Day 2 after approximately 28 fictional hours. Edda actually walks out when her permit expires; flood timing changes entry access while the party is elsewhere. There is no dungeon reset or module-success termination.

Each history has `.browser.replay.json`, `.browser.save.json` and `.browser-results.json`. Both actual browser checkpoints matched complete CLI replay. Total currency—including party, merchants and finite stock caches—was conserved: 42 coins in the Fellowship world and 43 in the hired world. The worlds have different generated initial totals; no equality across different seeds is claimed.

A [further salvage history](salvage.replay.json) continues the same Fellowship world: climbs into the hoist using the equipped reward, collects the actual bearing, visits the sluice/lower landing, disarms the third trap using discovered warning plus delving, and transfers the bearing to Edda for six coins from her purse. Its [checkpoint](salvage.save.json) retains Edda's ownership. Across this continuation all eighteen interior rooms are visited. This additional history is headless evidence, not an extra browser walkthrough.

## Desktop and mobile screenshots

Captured at desktop 1440×1000 and mobile 390×844. The final browser runs report no page errors or horizontal overflow and successfully resume after reload.

| Experience | Evidence |
|---|---|
| Meaningful creation | [Fellowship desktop](fellowship-creator-desktop.png), [hired mobile](hired-creator-mobile.png) |
| Town orientation | [Reedwake](fellowship-town.png), [Nera's motives](fellowship-dialogue.png) |
| Actual preparation costs | [Posted prices before purchase](posted-prices.png) |
| Room-level navigation | [Discovered dungeon map](fellowship-dungeon-map.png), [mobile map](fellowship-map-mobile.png) |
| Persistent equipment | [Line and lantern inventory](fellowship-equipment.png), [hired inventory](hired-equipment.png) |
| Physical hazards | [Counterweight resolution](fellowship-trap-counterweight.png), [poison exposure](hired-trap-poison.png) |
| Ordinary encounter | [Cave hound](fellowship-combat-1.png), [mobile encounter](fellowship-combat-mobile.png) |
| Significant adversary | [Custodian combat](hired-combat-2.png) |
| Return and growth | [First recovery](fellowship-first-return.png), [trained company](fellowship-trained-company.png) |
| Persistent death | [Hired company after the second recovery](hired-second-return-mobile.png), [character sheet](hired-trained-company.png) |

The tested commands averaged about 0.34 seconds for the Fellowship and 0.39 seconds for the hired company, including encounters and screenshots interleaved with actions; these are environment-specific walkthrough measurements, not a performance guarantee. Filtering impossible controller/effect bindings reduced creation from roughly 13 seconds to about 2.6 seconds in the tested browser. Visual review also caught enemy HP beneath the translucent command console; the final encounter layout keeps it visibly above the controls. The initial creator exposed a blur/render reentrancy error; it was fixed and both complete histories were rerun. Purchases initially destroyed coins rather than crediting Nera; the conservation check caught it, and both histories were rerun after the fix.

## Frozen generated worlds

- [Autumn, seed `serewater`](autumn.dossier.json) and [lowered Kyr](autumn.lowered.kyr).
- [Same context, seed `drizzle`](drizzle.dossier.json) and [lowered Kyr](drizzle.lowered.kyr).
- [Late autumn, seed `downpour`](late-autumn.dossier.json) and [lowered Kyr](late-autumn.lowered.kyr).

The dossiers expose author-only facts, roles, canonical creatures, schedules, item bindings and package provenance. They are not player journals. The early seeds differ in inhabitants, threats and resource draws; both happen to draw a blade. The late-autumn context draws a charm and changes stock/flood constraints. The topology and executable rules remain shared. Provenance is a source-package index and resulting stable references, not a fabricated complete expression trace.

```sh
bun run bin/record-serewater.ts
bun run kyrie replay doc/playtests/serewater/fellowship.browser.replay.json
bun run kyrie replay doc/playtests/serewater/hired.browser.replay.json
bun test test/shared-item-effects.test.ts test/serewater.test.ts
bun run check
```

The recorder verifies both actual checkpoints against CLI replay and checks currency conservation. Focused architecture tests cover common ability/trap/item saves and effects, immutable base values, equipped modifiers, single-use consumption, repeated seeds, transfer from dead companions, and complete command rollback after a later world failure. Integrated tests exercise both full browser histories, eighteen-room/three-level construction, independent generation inputs and player-safe map visibility. The stable-source full check passed **161 tests with 3,321 assertions**, with one optional Chromium parity test skipped and zero failures. Actual primary-client Chromium play and CLI equivalence were verified separately for both histories; the salvage continuation also matches CLI replay.

## Acceptance and honest evaluation

All ten requested activities are implemented in the primary game client: different parties; informed preparation; three levels with branches, a loop, secret and alternate entrance; shared physical hazard resolution; ordinary encounters and Custodian combat/noncombat passage; consequential equipment; persistent return/recovery/training/reentry; seeded regional variation; saves/replay; game-oriented browser modes. The headless salvage continuation broadens route/disarm/commission coverage beyond the two browser histories.

This is now a recognizable, sustained expedition loop, rather than a one-room engine example. That is a structural assessment from developer play, not proof of enjoyment. The game still exposes too many recipient-specific item choices, and some interactions remain menus of legal commands. Room prose is specific, but most rooms reuse a small set of illustrations. The map is an expedition notebook of connections rather than a polished spatial diagram. Search often grants certainty immediately. The noncombat writ is an intentionally coarse institutional rule; it risks feeling like a knowledge gate. Equipment lacks encumbrance, durability and proficiency, the lantern consumes no fuel, and flat damage modifiers are not Orsino AC/hit rules. Custodian defeat does not yet cause a wider political response. No arbitrary dialogue, recruitment or town resurrection is supported.

A first-time-player task evaluation should now use this actual campaign: explain the competing interests, select preparation, choose a route, recognize a hazard, interpret a save, decide when to retreat, and explain how the second expedition changed. Absence of those testers was not used to stop implementation.

See [the implemented campaign](../../serewater-campaign.md), [actual authoring source and friction](../../authoring/serewater-package.md), and [compatibility distinctions](../../orsino-compatibility.md).
