# The Lantern Road: client study evidence

> Historical Milestone A evidence. The Lantern interface has since become the primary Serewater game; see [the implemented campaign](../serewater/README.md). The screenshots and findings below describe the earlier prototype.

**Status:** real-simulation interactive prototype and developer walkthrough. It is not the completed Serewater campaign, an independent human study, or evidence that the game is enjoyable.

Build with `bun run web:build`, then open **`site/folio.html`**. Existing Saint Orra remains at `site/index.html`; the workbench remains at `site/workbench.html`. The prototype has its own saved-journey key and never replaces those saves.

## Actual short journey

The recorded run creates elf ranger Elen, human fighter Bran and dwarf cleric Dori through canonical DEEM generation. It asks Vesper about Censer Hill, travels the willow causeway, speaks to Oren in the receiving hall, descends the singers' stair, fights the White Hound, reads the ember instructions, grants the learned invocation to Bran, returns to Reedwake and recovers.

Fourteen world commands plus recorded combat choices take the campaign from Day 1, 8 a.m. to Day 1, 4:10 p.m. The Hound remains dead; Bran retains Cinder; all three surviving companions recover to their own generated maximum HP. The browser checkpoint was compared against the CLI replay's complete canonical state and matched. Reloading the page and continuing the saved journey returned to the same town/state.

### Screenshots from Chromium

| Mode | Desktop | Mobile / supporting evidence |
|---|---|---|
| Company creation | [Create the company](01-company-desktop.png) | [Mobile creation](01-company-mobile.png) |
| Town | [Reedwake scene](02-town-desktop.png) | [Return, mobile](08-return-mobile.png) |
| NPC conversation | [Vesper's concern](03-conversation.png) | [Oren below ground](05-dungeon-conversation.png) |
| Wilderness | [Willow causeway](04-wilderness.png) | [Dungeon approach, mobile](05-dungeon-mobile.png) |
| Encounter | [White Hound encounter](06-combat-desktop.png) | [Encounter, mobile](06-combat-mobile.png) |
| Reward and continuity | [Choose a recipient](07-reward.png) | [Learned invocation on the company sheet](09-learned-ability.png) |
| Return/recovery | [Town after recovery](08-return.png) | [Mobile return](08-return-mobile.png) |

These were captured at desktop 1440×960 and mobile 390×844. [Browser results](browser-results.json) record no page exceptions or mobile horizontal overflow. The initial sticky mobile company strip covered ability choices; screenshot review caught it and the strip now stays in normal flow. This is a concrete visual correction, not proof of overall usability.

### Reproduction and authoritative artifacts

- [Actual browser command/combat replay](journey.browser.replay.json).
- [Actual browser checkpoint](journey.browser.save.json).
- [Initial author-only dossier](fixture.dossier.json): canonical creatures, references, initial facts, actors and package source index.
- [Initial lowered Kyr](fixture.lowered.kyr): explicit world construction and action schemas.

```sh
bun run web:build
# Open site/folio.html and choose Set out for Reedwake.
bun run kyrie replay doc/playtests/lantern-road/journey.browser.replay.json
bun run bin/record-client-study.ts
bun test test/client-study.test.ts
```

The recorder regenerates the initial dossier and lowered source, and verifies the actual saved browser checkpoint against CLI replay. Its provenance is package-level source indexing, not an invented complete DEEM expression trace. The full proposed region has no instantiated dossier yet: it is a design, not generated content.

Engineering checks: **150 tests passed, 3,229 assertions**, one optional Chromium parity test skipped in the normal suite. Lint, TypeScript and the static build passed. The new focused test exercises the ordinary journey, reward identity, save/resume and deterministic replay. Actual Chromium separately exercised the prototype UI and its CLI equivalence. Those checks establish correctness of this fixture, not atmosphere or enjoyment.

## Game-feel assessment from inspection

| Question | Observed improvement / unresolved issue |
|---|---|
| Does the place lead? | Yes: illustration, location title and one prose space precede actions; no primary graph/table dashboard. Symbolic art remains sparse, and objects in the plate are not independently clickable. |
| Is there an interaction rhythm? | Intent tabs limit the list; speaking replaces scene prose; encounter mode changes the layout; rewards select a real companion. Tab discovery and the step-back action still need first-time testing. |
| Does it feel like a party? | Companions stay visible and a particular member acts in combat. Identical placeholder faces and absent background/equipment choices weaken identity. |
| Are results legible? | Authored responses, resource changes and causal combat logs are visible. Long receipts compete with scene prose; some ability descriptions still expose `max`/`statMod`/DEEM references. |
| Are choices meaningful? | Real travel/retreat, combat selection, resource use and reward recipient exist. This fixture has no substantive route branch, negotiated ownership, contested looting or equipment progression. It must not be evaluated as the finished adventure. |
| Is it accessible? | Native controls, visible focus and reduced-motion styles are present. Modal focus containment, keyboard shortcuts, screen-reader sequencing and touch pacing are not fully evaluated. |

The presentation is a more game-shaped hypothesis. It can still feel like an action list over an illustration. There is no animation/audio timing study, independent human test or comparison against the unimplemented room-window concept. Before replacing the existing client, test unfamiliar players' understanding of motives, exits, active combatant, save results, retreat and reward utility. The complete branching-dungeon specification must provide the actual play depth; this renderer cannot manufacture it.

## Important scope boundaries

This fixture uses an adapted existing frost-wolf/rime-beast encounter and existing learned-spell service; it is not an Orsino monster port, equipment system, new campaign or Custodian boss implementation. The seal can be taken without fighting: no stealth/ownership contest is simulated. The complete region's traps, load/light rules, custody permissions, escort, salvage rights, equipment and advancement remain proposed. The authoring source says what executes; no NPC response is generated by an LLM.

Read [the coordinated review](../../design/classical-rpg-review.md), [client alternatives](../../design/game-client-concepts.md), [causal audit](../../design/causal-architecture.md), [Orsino inventory](../../design/orsino-generative-audit.md) and [full slice design](../../design/rpg-vertical-slice.md).
