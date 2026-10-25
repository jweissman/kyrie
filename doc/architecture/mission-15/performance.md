# Performance: what a sustained game costs, and why

Written for: whoever decides where Mission 15's performance work goes next, and anyone checking a claim in the
report. Every number here is measured, with the command that measures it; where something is reasoned rather than
measured, it says so. All on one desktop machine (WSL2, bun 1.4.3), nothing else running unless said.

## How it is measured

Four layers, measured separately on the same commands:

- **A. The simulation alone.** `bun scripts/sim-bench.ts <seed> --layers A`: the campaign carrying out commands
  already resolved to actions (its watches, rules, townsfolk, creature facts, fights by its own tactics).
- **B. A headless session.** `--layers B`: the session's command with its telling, what the company perceives
  before and after, the feedback, the next choices; no screen, no narration's page, no keeping of the game.
- **C. The browser's engine, in one process.** `bun scripts/journey-profile.ts <seed>` plays the commands through
  `EngineHost`, the engine the page's worker runs, and times its parts: `engine` (B, as the engine does it),
  `screen`, `narrative`, and `save` (keeping the game as the page keeps it after every command).
- **D. The browser.** `bun run web:build`, then `bun scripts/journey-browser.ts <steps.jsonl> <seed>` plays the
  same commands by id in the built page at a tablet's size and reads the page's own timing of each choice. Real
  iPad Safari is not measured; Chromium's numbers are not taken for it.

The journeys:

- **wren**: a kept record of 335 choices (`test/fixtures/descent/wren.choices`): six expeditions into the Delvers'
  mine over eight days, with travel, shops, rests, a raising from the dead and fights; one region, 17 modules,
  17,300 to 18,600 facts.
- **the frontier segment**: 15 commands from step 91 of a wander across a march (seed a1), in the country beyond:
  33 modules, 104,000 facts. `--resume ck-a1/step-90.json --replay a1-91.jsonl`, both kept by the profile itself
  (`--checkpoint-every`, `--out`), so the slow commands are reproduced without the road to them.

Each change is shown to change nothing that happens. The profile prints a hash of the session's canonical state, of
the world's facts in sorted order, and of what the company is shown (the observation and chronicle). For wren they
are canonical `5eae0f91a0ce6203`, facts `2693c7793aa85ef4`, told `6926d284f15e9327`; for the frontier segment
`eb6ac02ac5682a37`, `4ab647d0a7e25702`, `3cdbcc0fd65d7bfb`. The one change of hash came with copy-on-write worlds
(131fa15): facts are kept grouped by relation, so the canonical form's order changed. The sorted facts are the same,
and a diff of what the company is shown found only the order of one unused measure (`--dump`).

## Where it started (main at 7e8cfde)

wren through the engine (C), in milliseconds per command:

| part | p50 | p90 | p99 | max |
|---|---|---|---|---|
| command (engine + screen + narration) | 244 | 653 | 5,280 | 7,952 |
| engine | 148 | 591 | 5,154 | 7,888 |
| save | 38 | 112 | 155 | 198 |

The simulation alone (A, measured at b0a05b8): 5.4 commands a second; a rest, a bed or a raising 2.4 s at the
median and 4.4 s at worst. In the country beyond a march, every command cost what the whole world cost: the engine's
median was 753 ms at 104,000 facts.

## What it costs now

The simulation alone (A) and a headless session (B), wren, 334 commands, ms per command:

| class | n | A p50 | A p99 | A max | B p50 | B p99 | B max |
|---|---|---|---|---|---|---|---|
| local | 146 | 6.4 | 74 | 100 | 29.6 | 218 | 238 |
| travel | 167 | 4.1 | 106 | 122 | 33.5 | 222 | 229 |
| time (rest, bed, wait, raise) | 14 | 112 | 243 | 243 | 210 | 348 | 348 |
| fight | 7 | 59 | 126 | 126 | 69 | 186 | 186 |
| all | 334 | 5.8 | 191 | 243 | 32.0 | 262 | 348 |

That is 63.7 commands a second for A (from 5.4) and 18.4 for B (from 3.9). In the frontier segment, A's travel is
71 ms at the median and B's 151 ms; the engine's median is 133 ms (from 753).

Through the engine (C), each change in turn, wren:

| change | commit | command p50 | p90 | p99 | max | engine p50 | engine p99 |
|---|---|---|---|---|---|---|---|
| baseline | 7e8cfde | 244 | 653 | 5,280 | 7,952 | 148 | 5,154 |
| environment read by index | 037ba96 | 222 | 578 | 3,525 | 6,063 | 131 | 3,428 |
| no copies for presentation | 323c46c | 200 | 522 | 3,571 | 5,829 | 137 | 3,474 |
| world key kept as facts are written | d80e453 | 201 | 499 | 3,173 | 5,581 | 133 | 3,137 |
| a rule's world kept, not rebuilt | da39079 | 176 | 403 | 2,666 | 4,411 | 113 | 2,575 |
| copy-on-write worlds | 131fa15 | 156 | 365 | 2,478 | 4,119 | 106 | 2,408 |
| map read by relation | 0defc44 | 142 | 352 | 2,434 | 4,287 | 99 | 2,412 |
| the campaign keeps its world | b70d462 | 116 | 322 | 2,363 | 4,047 | 73 | 2,341 |
| only changed actors projected, idle rules unasked | c18a3b2 | 79 | 188 | 457 | 716 | 45 | 394 |
| the observation once per world, read by index; queries propose | ab9055a | 61 | 151 | 411 | 630 | 33 | 287 |

The frontier segment through the engine:

| change | engine p50 | p90 | max |
|---|---|---|---|
| before copy-on-write (b0a05b8) | 753 | 1,593 | 1,932 |
| copy-on-write worlds | 662 | 1,151 | 1,364 |
| the campaign keeps its world | 306 | 471 | 471 |
| only changed actors projected | 289 | 400 | 451 |
| idle rules unasked; light, gold and journeys by index | 254 | 395 | 455 |
| the observation once per world, read by index | 151 | 233 | 385 |
| queries propose candidates; second-argument index | 133 | 197 | 363 |

## What was wrong, by mechanism

Each was found by a CPU profile (`bun --cpu-prof`, summarized by function and by caller), and each is the same
mistake: work in proportion to the whole world for a change to a small part of it.

- **The whole world copied or listed for a local change.** A world forked by copying every fact; the campaign built
  the list of every fact at every commit; a rule's firing kept a copy of the facts for the next reading to rebuild a
  world from; a world's key sorted every fact. Now a world shares each relation's facts with the world it was forked
  from until it writes that relation; the campaign keeps the world itself and writes its facts out only for a save;
  the key is kept as sums as facts are written.
- **Every creature's facts projected again for any creature's change.** On every watch of a rest, every actor's
  creature facts were projected again because a torch burned down. Now only the actors whose members' records were
  replaced, whose environment changed, or whose projected facts something else wrote are projected again
  (`Projection`); a creature's record is replaced when it changes, so identity tells.
- **Every rule asked on every watch.** A rule that held nowhere is now not asked again until a world of its line has
  written something its condition reads, through the queries it asks (`Reads`, `World.stamped`/`agrees`).
- **Every relation read afresh by every world.** Read views (lists, indexes by first or second argument) are kept
  with the relation's map, so forked worlds share them until they write the relation (`RelationViews`).
- **Scans hidden in reading.** Finding a creature's environment, who has a light burning, whose gold changed, where a
  journey starts, the company's own facts, who is present, which names it knows, the band a creature belongs to: each
  went through every fact, creature or entity. Each now reads an index.
- **The same thing worked out several times.** The engine observes the company four times a command over one new
  world; it is now worked out once per world and handed out frozen, so no reader can change it under another.
- **Candidates proposed without locality.** Grounding a schema joined only its facts, so an attack's opponents were
  every able group in the country, each tested in turn. A query now proposes candidates too, by a solver that never
  trusts a negation over what is not yet bound (`Candidates`), and every candidate is still tested in full.

## Not yet explained or done

- **The player's choices are still grounded afresh in every new world**: 1,199 schemas in the frontier, 25 ms warm,
  mostly one per townsperson per conversation, each asking whether that person is where the company is.
  Grounding by where people are, rather than schema by schema, is the next step for the frontier.
- **Keeping the game** is 32 ms at wren's median and 102 ms in the frontier, on the engine's thread after every
  command, and grows with the game; the kept game in localStorage was 700 kB at wren's end. Not yet coalesced, moved
  off the thread, or written to IndexedDB.
- **The heap after a full collection** grew by about 0.35 MB a command at the baseline; a long session against a
  fresh restore of the same game has not yet been compared.
- **Layer D** (the page) was measured only at the baseline: a median of 296 ms from choice to frame painted. It has
  to be measured again. Safari is not measured at all.
- **Time advancement** still runs watch by watch: a bed of eight watches is 112 ms at the median in A. Bulk or
  scheduled advancement has not been designed.
- **The screen** is 14 ms at wren's median and 41 ms in the frontier, and has not been profiled since the first pass.
