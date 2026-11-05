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
almost at once. A **new** world gained nothing at first: a module's files are parsed "among" the local kinds installed so
far, and the key of each parse includes all of them, so once a generated region's own kinds are installed even the
authored adventures' parses were particular to that world (the adventures alone are about half the parsing); the
next section is the cut that answered it.

## Then: a parse kept by the kinds a text names

A parse is now kept by the local kinds installed whose ids occur in the text, not by every kind installed
(`LocalKinds.seen`): what a text is parsed into depends on no others. The adventures' and the rules' parses are the
same in every country, and kept across them.

| In the browser, one build | Ms from Set out to the map |
|---|---:|
| The first world ever in this browser (a1) | 9 263 (was ≈ 12 400) |
| A new world after it (b2), the last page read for a few seconds | 217 |
| Another new world (kite) | 215 |
| The first again | 221 |

A new world's own files are still parsed, but while the last page of creation is read (the start is made ready in
advance), so the player waits for it only when they set out at once. Headless with no disk store, a second world in
the same process starts in 6.1 s where it took 10.5.

## And while waiting

The page says what the engine is actually doing, each step as it begins (drawing the world, placing its people,
telling where you are), with those done marked and no guessed share of the whole. The 3D map no longer draws its
drifting air for ever: fifteen seconds after the last movement it draws only when something changes (an idle map had
kept four cores busy in software GL, which also slowed every start begun beside it).

## The first visit, as a player makes it

Measured 5 November on the same machine, each run in a new browser with nothing kept (the play server restarted:
`/var/tmp/kyrie/m19/cold.sh <seconds>`), creation's pages gone through and the last one read for a while before
Set out. The world is drawn, placed and its modules parsed while creation is read, so the wait is only what is left
of that when the player sets out.

| Seconds on creation's pages before Set out | Ms from Set out to the map |
|---:|---:|
| 0 (straight through) | 9 300 |
| 10 | 843 |
| 25 | 2 455 |

A first visit is ready under three seconds after Set out for anyone who reads creation's pages for ten seconds; only a
player who sets out at once waits the whole of the parse. (The earlier table's runs had kept their parses between
visits: a page opened again in the same browser keeps its IndexedDB.)

