# Mission 13: performance and persistence

Measured on the development machine (WSL2), Chromium through Playwright, nothing else running. World `thorn`.

## Saves: the world kept once, the game kept as what changed

Before, every command wrote the whole game: the compiled world's definitions and facts with the state. Now
(`web/engine/kept-game.ts`) the world part (module, definition, base facts) is kept once under a key made from its
content, and each save keeps the state with an order-exact fact delta (base facts removed by index, then the facts
added). A save restores to the same play, checked by `test/kept-game.test.ts` (round trip, then the same moves after).

| After 30 commands | JSON | Packed | Cost per save |
|---|---:|---:|---:|
| Whole game (before) | 3081 KB | 314 KB | 21 ms stringify + 25 ms pack |
| State only (now, every save) | 390 KB | 35 KB | 7 ms + 3 ms |
| World (now, once per country) | 2694 KB | 279 KB | once |

A save is about a ninth of what it was, and four or five times cheaper to make.

## Begin: Go to the first screen

| | Mission start | After the Begin work (4e3b742) | Now |
|---|---:|---:|---:|
| Cold, Go pressed at once | 3.85 s | 2.83 s | 2.85 s |
| Go after reading the page 8 s | 2.88 s | 1.84 s | 2.33 s |
| Go after reading the page 15 s | — | — | 1.89 s |
| Reload to play (continue) | — | 0.95 s | 0.95 s |
| Node, world start, cold / warm | 3.16 s / 1.66 s | ~2.3 s / 1.0 s | 2.40 s / 1.07 s |

What made Begin faster: the joined module is checked once, not per installation; newcomers' records are projected
rather than rebuilt; creature records are shared rather than cloned per store; the rules are read while the player
is still on the protagonist page.

The frank part: the warm figure has slipped from 1.84 s to 2.33 s at eight seconds' reading, because there is more
to read ahead (the wonders' and traps' written looks, the founding tables, the travellers); at fifteen seconds it is
back to 1.89 s. Cold Begin is unchanged at 2.85 s. The profile's largest single cost is still Kyr's parser (Ohm),
about 1.4 s of a cold start; caching parsed modules by content would remove most of it, and is the next thing to do.

## Moves

Moves were not re-measured after the playthrough fixes. Settling what is perceived within an action adds a second
read of the place's observations only when something was learned, which is rare; the suite's timings did not move
(around 220 s for 525 tests).
