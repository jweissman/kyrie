# Spike: where a new life's start goes (AX-04, SP-02)

24 November, the lead, on main 6f7b5a9a5. Owned by the lead as maturity work (the owner, 24 November).

## Measured

A fresh world (a new seed, as a player gets) started headless by `PlayTool.start`, its stages read from `Costs` and
a CPU profile. On a quiet machine: about 8 s to the first page; the first act after that, 75 ms.

| Where | Time | What it is |
|---|---|---|
| Region composition (`Composition.region`, kits placed) | 2.3 s | the country drawn and its kits placed |
| Kyr parse (`ModuleParser.parse`, chunked) | 2.2 s | 56 modules, 1.4 MB of generated Kyr parsed again |
| Installs (`Campaign.install`, 38) | 1.8 s | each module composed onto the shared rules (AX-03: 15–20 ms each) |
| The first projection (`CreatureFacts.project`) | 0.67 s | every actor's facts, 279 actors |
| The tick's prime (`CampaignTick.prime`) | 0.4–0.6 s | every rule asked once (OR-145) |
| Writing the regions' text (`RegionWriter`) | 0.58 s | half of it Deem news (`region-news`) |
| The first screen | 0.5 s | |
| Creatures made | 0.2 s | 607, most of them far from the company |

## What it says

AX-04's own remedy, generating to the AST instead of to text, removes the parse at most: about a quarter. Most of the
start is the whole country being made, parsed, installed and projected before the player has seen any of it. The
larger lever is SP-02's: content made lazily, as the company comes near it.

- Compose and install the starting region and what touches it.
- Keep the rest as placements (seeded, deterministic, identity-keyed), materialised on approach.
- Prove lazy equal to eager on seeded journeys.

That cuts the parse, the installs, the projection and the creatures together. It also helps a returning player, who
pays the same today.

## Tried and dropped

Holding a rule idle by its failing part only from its second asking, to spare the prime. The profile had attributed
361 ms to that narrowing, but timed alone the prime was the same with and without it (367 against 368 ms). Reverted:
no change without a measured gain.

## Next spike

Count, for each seed, which of the 56 modules the first hour actually touches. That is the upper bound on what lazy
materialisation saves. Then make one module kind lazy behind an eager-equals-lazy spec.
