# Setting out: where the wait goes (M19-49)

Measured 4 November 2026, night, on WSL2 (Chromium headless with software GL through the play server; Bun for the
headless runs). From Set out on the last page of creation to a playable page, generated worlds, the Coming Home
origin. Scratch tools: `/var/tmp/kyrie/m19/startup.ts` (headless), `/var/tmp/kyrie/m19/time-start6.sh` (browser).

## Headless (Bun), one process: cold, the same world again, another world

| | Draw the world | Start the session | First screen | Whole |
|---|---:|---:|---:|---:|
| Before, cold | 517 | 8 435 | 631 | 9 598 |
| Before, same world again | 334 | 3 270 | 538 | 4 149 |
| Before, another world | 342 | 10 891 | 580 | 11 820 |
| After, cold | 362 | 3 131 | 597 | 4 105 |
| After, same world again | 206 | 3 051 | 532 | 3 797 |
| After, another world | 226 | 3 242 | 551 | 4 024 |

Starting the session was nearly all of it, and most of that was copying: every module of a world (27 for a1) joined
the same shared rules again, each rule file copied out of the parse cache and then the joined whole copied again. The
shared rules are now joined once for each set and kept (`ModuleBundle.shared`); each module's composition still gets
its own copy.

## In the browser: the first time, and after

| | Ms from Set out to the map | Of which: starting the session |
|---|---:|---:|
| Before and after, first world ever in this browser | ≈ 12 400 | ≈ 12 000 |
| After, the same world again (its parses kept) | 220 – 2 100 | — (made ready while the last page was read) |
| After, another new world | ≈ 12 900 | ≈ 12 600 |

The browser had no store for parsed Kyr between visits (a process with a file system keeps one on disk), so every
start parsed every module afresh: about ten seconds of V8 for 123 texts. Parsed Kyr is now kept in IndexedDB by
edition (`web/engine/parse-keep.ts`), read in as the engine starts (≈ 0.4 s), so a world set out in again is ready
almost at once. A **new** world gains nothing yet: a module's files are parsed "among" the local kinds installed so
far, and the key of each parse includes all of them, so once a generated region's own kinds are installed even the
authored adventures' parses are particular to that world. That is the next cut: key an authored module's parse by the
kinds it can see (its own and the shared catalogs), not by every kind any module of the world has installed; the
adventures alone are about half the parsing.

## And while waiting

The page says what the engine is actually doing, each step as it begins (drawing the world, placing its people,
telling where you are), with those done marked and no guessed share of the whole. The 3D map no longer draws its
drifting air for ever: fifteen seconds after the last movement it draws only when something changes (an idle map had
kept four cores busy in software GL, which also slowed every start begun beside it).
