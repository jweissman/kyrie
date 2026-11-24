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

## What the first hour touches (measured)

The warrior's golden walk on Iscoed (55 lines, the first hour and more), each module counted as touched when an act of
its is done or a place of its is stood in:

- 39 modules installed; the walk touches 6: the country (`region`), the drove, the pans, the gate, the adit and the
  life's origin.
- 33 modules installed and never touched: the howe (605 entities), the arcology (442), the tower (170), the factors,
  the raiders' folk and hold, the toll-keepers, the dens, the word kits, the travelling tinkers… In all, 44% of the
  world's 9,532 entities.
- The country module is touched and holds the other 56%, all its hexes at once.

So lazy materialisation has two levels:

1. Whole modules: install and parse a placed module only when the company comes within reach of where it is placed.
   This is cheap and clean, since a placement is already seeded and keyed by identity. It would spare most of the 38
   installs, their parses and their creatures.
2. The country by hex. This is harder, because the country is one module today.

Level 1 first, behind a spec that a seeded journey lazy and eager is the same history, screen by screen.

## Next spike
## Next spike

Level 1 for one kit kind (the word kits, or the dens): installed on approach, with the eager-equals-lazy spec on the golden
walk and the gold-follower; then measure the start again.
