# Mission 12: performance, measured

All numbers are from one machine: a desktop CPU running Linux under WSL2, Chromium (Playwright) for the page, Bun
1.4.3 for the engine alone, with nothing else running. **No Safari, no iPad and no phone were available.** The
390×844 runs are Chromium with a phone-sized viewport and touch input on the same desktop CPU: they show layout,
not a phone's speed. Chromium's CPU throttling (`Emulation.setCPUThrottlingRate`) was tried, and does not reach the
engine, which runs in a Web Worker: the engine's times were unchanged at 4× throttling, so it gives no estimate of a
slower device and none is quoted.

## In the page (Chromium, world `thorn`)

Input to the second frame painted after the engine's answer, as the page measures it (`kyrieMono.inspect().timings`).

| Step | 1280×800 | 390×844 |
|---|---:|---:|
| Cold load to the protagonist page | 1146–1186 ms | 1131 ms |
| Begin, pressed the moment the page appears | 3873 ms | — |
| Begin, after reading the page for 2.5–3 s | 2327–2355 ms | 2327–2358 ms |
| First move (to the green) | 274–301 ms | 294–364 ms |
| Ask someone about their work | 103–132 ms | 113–190 ms |
| Make much of a dog | 120–140 ms | 126–209 ms |
| Take a road (one stage) | 191–253 ms | 191–275 ms |
| Reload to play (continue) | 933–1166 ms | 946–1150 ms |

Of a near move, the engine takes 53–65 ms, building the screen 16–40 ms, narration 2–4 ms and rendering 15–30 ms. The
diagnosis measured 2914 ms for Begin and 142–240 ms for a near move before this mission. Pressed at once, Begin is
now slower (3.9 s), because the country holds far more: households, animals, what grows, wonders and traps. Read
first, as a player reads it, it is faster (2.3 s), because the country is parsed while the page is read.

## In the engine (Bun, world `thorn`)

| Measure | Before | After |
|---|---:|---:|
| Begin to first screen, nothing parsed before | 2851 ms | 2287–2354 ms |
| Begin to first screen, the country parsed while the protagonist page was read | — | 1368–1508 ms |
| Parsing the country (279 KB of Kyr) | 800 ms | the same, but in eight files while the page is read |
| Serialising a save, after every command | 41–43 ms | 14–16 ms |
| Compressing a save | 22–26 ms | 22–26 ms |
| A save, as JSON / packed | 2553 KB / 270 KB | 2553 KB / 270 KB |

What changed:

- **The country is the same whoever comes into it.** The region is written as the files of one module: the country
  in parts of about 40 KB, and who comes into it (`company.kyr`) apart. While the protagonist page is open the engine
  parses the country, the world's rules and what is set in the country, one file at a time with a pause between, so
  the page answers meanwhile (`ModuleBundle.warm`, started from `Creation.generate`). Setting out finds them parsed.
- **A save is written from the campaign itself**, not from a deep copy of it made only to be written out
  (`Campaign.save(…, live)`).
- **Validation looks entities up by id**, where it searched the whole list for each observation; merging a module's
  files keeps entities by a set, where it compared every pair.

## What was not done

- **The compiled module is still in every save.** The diagnosis proposed keeping it once per revision. Each save
  is still 2.5 MB of JSON before compression, serialised and compressed after every command (about 40 ms of the
  worker's time, after the frame is shown).
- **Begin pressed at once is slower than before the mission.** Ohm parses the country at about 350 KB a second;
  writing the generated country as a syntax tree rather than as Kyr text would remove that cost, and was not done.
- **The first move is twice a near move** (about 290 ms against 110–140 ms). It was not investigated.
- **No device was measured.** The numbers above are a desktop's.
