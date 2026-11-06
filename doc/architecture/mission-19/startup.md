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


## The first world ever, 6 November: its critical path, and the cure not yet built

The 9.3 s the first world takes when a player sets out at once (the architecture review asks for its critical path)
is parsing: a world's start parses about 123 Kyr texts (its rules, its region's own files and the adventures it
installs), about nine seconds of V8 in the browser, and nothing else on the path is above half a second (drawing the
world 0.2–0.4 s, the first screen 0.5–0.6 s). Every later start reads those parses from IndexedDB in ≈ 0.4 s.

Measured headless over the whole bundle (`/var/tmp/kyrie/m19/parse-size2.ts`): 472 texts, 8.8 MB of source, parse to
21 MB of JSON in ≈ 20 s. So shipping parsed Kyr with the site in place of parsing it on a first visit costs about 2.4
times the source's size (gzipped far less), a few megabytes for a world, and turns nine seconds of parsing into well
under one of reading JSON.

The cure is a build step: the site writes each text's parse, under the same key `ParseKeep` uses, as a static file;
the engine reads it before it would parse. The key is the text with the local kinds whose ids it names
(`LocalKinds.seen`), so the build must parse each text among exactly the kinds a start would have installed when it
reaches it: the rules and the adventures name only their own kinds, and can be built; a generated region's own files
are particular to its seed, and keep being parsed while the last page of creation is read. Not built yet.
