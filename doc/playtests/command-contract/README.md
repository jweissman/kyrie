# Reedwake command/effect playtest

Developer playtest, not independent human-usability evidence. No client layout work or new campaign.

The desktop history was entered through real Chromium keyboard/pointer events in Mono, with its actual Campaign/CreatureStore runtime. Seed `serewater`, default Elen/Bran/Dori party. The 24-command journey asks Wren about Pell, acquires and equips the ward focus, casts on Bran, risks the steam, takes and equips the flame blade, defeats the resistant boiler sentinel, speaks to Hesta, attacks Ash, picks the stores lock, collects a bar and returns to Reedwake. It deliberately leaves Pell unresolved. Returning to town does not terminate or reset the situation.

- [Complete readable transcript](transcript.md)
- [Exact command/combat replay](browser-transcript.json)
- [Authored-command effects, receipts and feedback](trace.json)
- [Saved browser session](browser-storage.json)
- [Canonical browser/headless equality and resource checks](verification.json)
- [Desktop client measurements and final scene](browser-progress.json)
- [Mobile retreat counterfactual](retreat-browser.json), [save](retreat.browser-storage.json)
- [Fatal hazard counterfactual](fatal-hazard.json)

## What actually happened

Bran's first blade attack: d20 13 + 2 against 10, hit. Piercing roll 6 → floor(6 × .65) = 3; fire roll 4 → 4. The sentinel falls from 20 to 13 HP. A later roll 3 + 2 misses and produces neither component. When the sentinel guards, piercing roll 4 → floor(4 × .65) = 2 → guarded 1; fire roll 6 → guarded 3. These are materially different damage components, not cosmetic labels. The sentinel eventually dies and remains dead.

Dori pays two mana for the focus-granted ward; both the action source and the condition retain the actual focus instance id. It gives Bran half fire damage and expires through elapsed campaign time. In this history Bran **saves against steam** (13 + 1 against 11); the ward is not evidence of reduced scald damage in this particular playthrough. Resistance arithmetic is separately exercised by semantic tests.

Ash dies after the company attacks him. Hesta is present, observes the company's blows and refuses further service. Nera does not receive an offscreen witness fact. The refusal is executable access loss, not just dialogue text. The stores lock changes state through Bran's lockwork capability. All three adventurers return alive, injured: Elen 3 HP, Bran 10, Dori 11. Dori has 4/6 mana. The ward is gone; equipped items remain. Total personal coins stay 30. Pell has not been freed or brought home.

In the actual mobile counterfactual, the company withdraws before delivering a blow to Ash. Hesta still talks and serves; no witnessed-attack fact is fabricated. Screenshot at 390×844 has no page overflow. This does not establish mobile usability.

The fatal counterfactual starts from an explicitly injured, valid saved state (1 HP each), not from the full-health browser history. The ordinary, unchanged steam definition rolls 6 fire damage; Elen's save is 11 − 1 = 10 against 11. Actual applied damage is 1 because HP is capped at zero; death is emitted. The command reports failure, leaves the company in the workshop, vents the pipe, retains the death and advances time. Two companions survive. This is a genuine resolved failure, not rejected validation or a fake hazard combatant.

## Screenshots

[Reedwake](01-reedwake.png) · [equipment](02-focus.png) · [timed ward](03-world-ward.png) · [steam](04-steam.png) · [resistant encounter](05-resistant-sentinel.png) · [battle result](06-defenses.png) · [witness reaction](07-witness.png) · [opened lock](08-physical-padlock.png) · [return](09-return.png) · [mobile retreat](retreat-phone.png).

## Friction and limits

The ward menu says “on Bran” while inventory says “for Bran.” An NPC with only attack available starts combat immediately, whereas Ash opens a menu: a dangerous interaction inconsistency. The bottom activity strip summarizes a long battle into too few lines to expose its component arithmetic; the encounter screen and journal preserve it. Source status identifiers remain visible in party/combat state. The abandoned inspector reuses the adapted mortuary construct chassis, rather than faithfully porting an Orsino monster. It is optional and does not block the rescue route.

These tests demonstrate coherent causality and persistent consequences. They do not establish that the scenario is fun, tactically balanced, or legible to a new player. The ward focus adds a mechanically useful interaction but not a new dramatic situation. No claim of human playtesting is made.

## Reproduce

Build the static client with `bun run web:build`; open `site/mono.html?campaign=data/caught-below/river.campaign.json`.
Replay the exact recorded choices through the ordinary CLI:

```sh
bun run bin/kyrie.ts replay doc/playtests/command-contract/browser-transcript.json
bun test test/command-contract.test.ts test/causal-integration.test.ts test/shared-item-effects.test.ts
```

The focused contract tests cover hit/miss/critical components, legacy versus typed mitigation, pre-cost rejection,
explicit area recipients, half-save partial resolution, fatal ordinary steam, world and owner clocks, source-keyed
field equipment, offscreen privacy, save/resume, and removal of a granted ability without erasing an already cast ward.
A further semantic test poisons all three adventurers during delayed lodging: the deaths, time and paid service persist, and the attempt fails instead of raising an exception and undoing the fatal clock.
The shared-item tests cover the trap/antidote/charm acceptance fixture and rollback after rejected World changes.

Final validation: `bun run check` passed lint, both typechecks, and 253 tests (3986 assertions), with 10 opt-in browser tests/hooks skipped and no failures. The desktop and mobile client histories above were exercised separately in real Chromium. No historical Serewater fixtures were regenerated. Full-suite output is retained in `check.log`.
