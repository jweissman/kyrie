# Saint Orra playtest record

Play locally with `bun run web:dev`, then open `http://localhost:8080/`. The root is the new player interface; `workbench.html` retains the developer tool. The site remains static and can be served under a GitHub Pages subpath. Choose a company and seed `orra`.

These are developer playtests, not independent human usability studies. No claim of “fun” follows from completing the histories.

## Browser session

Real headless Chromium, 1440×1000 and 390×844, executing the built static page from `file://`:

1. Choose Fellowship; inspect the arrival scene and contextual actions.
2. Read the analysis, travel to the porch, tell Mere, enter the now-open guest house. The player sees a fact, an NPC response, then a real newly available route.
3. Reload and resume. The guest-house location, knowledge and NPC developments persist. Open the journal.
4. Choose hired company. Feed the wolf, allow it to eat/release passage, approach the tower, initiate the guardian encounter through the violence disclosure.
5. Exercise the dedicated encounter interface and auto-resolve. The battle journal records persistent victory; 68 action/effect/save/status/end events were emitted in this seed. No page errors were reported. Mobile journal had no horizontal overflow.

Screenshots: [arrival](arrival.png), [opened hearing](hearing.png), [journal](journal.png), [encounter](encounter.png), [battle aftermath](battle-journal.png), [mobile](mobile.png).

The first browser run exposed a real bug: selecting a new company from the journal left the new campaign on that tab. The fix resets to the journey on starting/resuming. The repeated run completed successfully. A later pass reordered waiting below active choices and hid the violence disclosure when there is no target.

## Contrasting authoritative histories

| History | Final watch | Meaningful result |
|---|---:|---|
| [Investigator](investigator.md) | 16 | accusation withdrawn, kiln cold, water preserved, siphon stopped, Ys home, guardians alive |
| [Expedition](expedition.md) | 11 | siphon stopped, Ys home, accusation unresolved, kiln still discharging; later loss remains possible |
| [Violent company](violent.md) | 5 | warden dead, stair open, Nell dead and Bran at 5 HP, neither hazard repaired; campaign continues |
| [Unattended](unattended.md) | 38 | water reserve emptied, Tamsin expelled, tower approach flooded; alternate entrance still available if discovered |

[Machine-readable state comparison](histories.json). The corresponding `.replay.json` files reproduce commands and recorded party combat selections. For example:

```sh
bun run kyrie replay doc/playtests/orra/violent.replay.json
```

Focused tests also continue the expedition to watch 30 (rescue succeeds while accusation and water safety fail), preserve collected water through spoilage, return after flooding through the flue, destroy one evidence source and use the independent other, verify canonical party identity and restore/replay complete state. Browser-targeted bundle/CLI parity includes both the investigator and violent histories.

## What still feels weak

* The analysis is a reliable conclusion, not a playable chemical deduction. Reading it can feel like acquiring an accusation-canceling token. Further evidence interpretation needs player testing before new machinery.
* The warden's oath is a narrow authored commitment; communicating it is reliable. It is not a general social interaction model. The hidden flue can make the encounter optional with little cost.
* The timing is very readable but generous in the investigator route. There is no calibrated difficulty claim.
* The wolf now has a distinctive save-resisted bleeding bite, but no pack behavior or wildlife simulation.
* Heat and lost work are stated consequences of the dismantled kiln, without a hunger/employment subsystem. Water loss and route collapse alter real resources/access.
* Both starter companies are authored presets, not a full party creator. Recovery, loot equipment and progression are missing. There is no convincing reward loop yet.
* The “map” is a discovered connectivity list, not an illustrated regional map. Encounter logs show roll totals and mitigation but not a complete expression-evaluation explanation tree.

A [matched-command Fellowship battle](fellowship-battle.md) also kills the warden, but all three companions survive (Bran at 10/15 HP); the ranger and cleric spend their mana. The [hired-company battle](violent.md) loses Nell and leaves Bran at 5/15. These are distinct seeded histories with the same world commands and automatic tactics, not a controlled balance study or evidence of good player decision-making.

Bleeding survives encounters but currently ticks only on the bearer’s combat turns; it does not simulate ongoing blood loss while traveling. Field treatment and world-time durations remain gaps.

These limit the release. The campaign is playable through investigation, expedition and combat histories, but the three requested waves are not declared finished.

## Final verification

`bun run check`: lint and both typechecks passed; **141 tests passed, 1 opt-in browser test skipped, 0 failed** (3,159 assertions). The separate `KYRIE_CHROMIUM=… bun test test/browser-parity.test.ts` run passed **11 tests**, including actual Chromium replay of all nine histories. `bun run web:build` produced the static player, workbench and parity pages. The final death/key history waits past watch 28 and verifies that a dead Mere cannot execute her expulsion order.
