# Mission 20: the experience log

One short, prioritized list of what stands between a newcomer and a good first hour. Each row: what happens, how to
reproduce it, its state. M19 register ids are cross-references, not obligations. States: **open**, **fixed** (commit;
technically verified), **agent-played** (a clean-context agent met the fix), **accepted** (a person did).

Reproduce headlessly with `bun /var/tmp/kyrie/m20/tools/leads.ts <origin> <race/calling/Name> "<label>" … "map:<place>" …`
(prints what the page leads with at each step) or `bin/kyrie play --world kahitude --origin debt --as human/warrior/Ralf …`.

## Amendments from the owner

1. **10 November — the opening design.** Adds: design A of [opening-design.md](opening-design.md) (a town with
   trouble: one in front, threads tied, the decisive choice made in exchange, the road meetings kept). Supersedes, for
   the moment after the prologue only, M19's "start on the one full-screen map": the first screen is the place the
   origin puts the company in; the map stays the way to travel. Excludes B and C.
2. **10 November, evening — working expectation and priorities.** Adds: no pausing for approval at ordinary
   checkpoints (pause only for a consequential design choice outside the commission, a scope or resource conflict, an
   external action, or a blocker); agent-play builds immutable while played. Priorities, in order: (1) CI on `5a6618a0`
   green and a verified candidate; (2) fewer early aims, a clearer hierarchy, the golden path kept; (3) keys that name
   their locks, consequences told when they happen (the firebomb), creation glitches, repeated paintings; (4) an
   engaging opening: difficulty, preparation, danger, negotiation, retreat, consequence — fair, not lethal or padded;
   (5) the title, creation, introduction and key pages as one designed whole; (6) a third cold round on a frozen
   candidate, testing unfamiliar intentions, boredom, tactics and wish to go on. Then the other phases. Invite the
   owner's play when the candidate is worth it, and keep working meanwhile.
3. **10 November, evening — one app on main.** Supersedes the `m20` branch and any candidate workflow: Westernesse is
   one application, developed on `main` and deployed by GitHub Pages. Small verified increments go to main often;
   short-lived branches and worktrees only for isolated work. Restore Pages first and verify the deployed app loads and
   plays; show the deployed commit. Agents test a locally served build pinned to a commit (a fixture, not a product);
   the owner plays the Pages app. The owner keeps committing art to main; no freeze. If main breaks, restoring it comes
   first.

## Rounds of cold play

| Round | Build | Players | Outcome |
|---|---|---|---|
| 1 | `7302392c` (M19 freeze), prologue skipped | A: debt warrior; B: map, birdfolk ranger | A paid the debt by star-iron under the town, unled; B did the spiders, was locked out of the hobs' hold after a parley |
| 2 | `78c9b45c`, the real opening | A: debt warrior; B: debt, **elf thief** | **Both paid the debt**: A on Day 1 by the hobs' hold (bell, boy, loot sold to Tuck); B on Day 2 by ratsbane, the hold by the bell, the spiders and the catacombs. Both reloaded and kept their game |

## Barriers

Sources: the builder's probes (P), cold round 1 player A / B (screenshot numbers in their reports).

| # | Pri | What | Source / reproduce | State |
|---|---|---|---|---|
| E1 | P0 | After the prologue the first screen is the world map ("You stand at its gate — Enter Thornhaven") under a header naming Tuck's yard; two dozen far labels in the fog | P; A 09; B 17, 136 | **fixed** 306e9a0e (amendment 1: the place first) |
| E2 | P0 | Lapisrecs led from the landing as "further in" (M19-233) | P: leads.ts debt … "To the landing" | **fixed** 3e09b5e9 |
| E3 | P0 | After a parley the hobs' store led with the Gaffer's rings; taking them raises the hold (M19-233) | P | **fixed** bf62b137 |
| E9 | P0 | After a successful parley, no way into the hold: its rooms counted as another hex, left to the map | B 112–118, 127, 133 | **fixed** 84f6a444 |
| E10 | P0 | The bell routed the raiders, and they were put straight back by the fire, "beyond you" | P | **fixed** b4e39e0a |
| E11 | P1 | The decisive acts hidden under "Something else…": pay what you owe, hire Xyn, pay the players' reckoning | A 165, 73; B 58, 102 | **fixed** a8d4e689 (`talk-focus`) |
| E12 | P1 | The followed aim does not follow the player (pointed at Seolforfyrd with the debt's coin in hand); aims pile to 9–10 on day 1; done things linger as leads | A §3, 165; B 88, 90, 125 | partly fixed: 78c9b45c (the debt follows what is carried home), be74676b (Notes in sight), 7ce24d5c (aims by where they are: to hand in the town as aims, further off noted and counted, in talk, on the scene and in Notes) |
| E13 | P1 | Go… from the first place lists five places, not the town; the inn and corn-store appear only from the landing | A 18; B 23→44 | partly fixed 11c27557: the way toward the aim's place in town is led and gilded (the landing, for the inn); Go… itself unchanged |
| E5 | P1 | The landing tells eight threads in one paragraph at one weight | P; B 24 | partly fixed 3c81f363: the place and three goings-on at rest, the rest About the place under Look…; the column still runs past the fold with the new aims |
| E4 | P1 | The town's threads not tied (the inn names Seolforfyrd without the hobs) | P | partly fixed bf62b137 (the bell's line names the hold) |
| E7 | P1 | The stolen bell, which an aim says is in the hold, was not led to where it lies | P | **fixed** b4e39e0a |
| E14 | P1 | Fight forecasts and summaries wrong ("Easily won" at 9/16 poisoned; "unhurt" after 10 HP lost); "shrugs off the poison… is poisoned"; "true damage", "magic save" | A 27–50, 152; B 129 | partly fixed c2582c9f (hurt and healed is not "unhurt"); the forecast's words open |
| E15 | P1 | Words and pictures contradict the place: hillside and daylight underground, lit lanterns in sealed rooms, stags for a toll-house, a sunny card at midnight | A 107–110; B 75, 80, 91, 111, 137 | open |
| E16 | P2 | Prose repeated: the cart twice (the opening skipped); a creature's name five times in a danger box; a sentence in two rooms; "Hereabouts the place has a name…" | A; B 18, 80, 89 | partly fixed 3c81f363 (the naming line; the bell's line told twice) |
| E17 | P2 | Controls move under the pointer (Attack under "Press on"; the Go list under "Following"; the bottom-left control turns into a way) | A 49, 136, 153 | open |
| E18 | P2 | The pack omits lit lights and oil; waiting does not heal and nothing says so; herbs unexplained | A 42, 61, 80 | open |
| E19 | P2 | Fights mostly trivial (one in six with tension in A; none in B) | A, B §6 | open — measure first |
| E20 | P2 | The dead man's map ends in an empty box with no word of who emptied it (B's origin) | B 121 | open |
| E6 | P2 | A warrior led to "wrench the padlock's hasp" off the town corn-store, whose key the notice says Tuck has | P | open |
| E22 | P1 | After the hold the debt's coin is in finds (a music box worth 50, the Gaffer's chalice, rings) that must be sold, but nothing leads a company carrying treasure home to a buyer; the strongroom needs a crowbar or lockwork, which nothing said to bring | P: honest.ts | **fixed** 78c9b45c (`owing_laden`, sales advance a coin-short aim; honest-start's fourth journey) |
| E23 | P1 | In the hobs' hold the page led with "Attack (beyond you)"; the bell routed once and rung again did nothing; the bell was led in every room; the exhausted hold led nowhere | P: honest.ts | **fixed** e989a704 |
| E24 | P2 | Look… had no word of the stolen bell lying in the plunder: a led find was not named on the scene | CI tour 482c5f6f | **fixed** 11c27557 |
| E25 | P3 | Save size (M19-236): measured in the browser after a reload, the world is kept once (1.9 MB) and a state is a diff (61 KB after a few commands); both cold players reloaded without loss. The 22 MB is the downloadable whole-game file | P: preview /eval | deferred (no obstacle to play measured) |
| E26 | — | Story after a reload seemed to show only what happened since | P: preview | not reproduced: the log is kept and restored (EngineHost); the Story tells only what happened, and little had |
| E27 | P1 | After the parley a player searched the toll-house for the hobs (the gate-hobs "just inside the way in"); the Gaffer asks for "a pretty" but nothing can be given him | R2-A 82–100, 119 | partly fixed be12fc54 (the way in named); Give open |
| E28 | P1 | The bell hung back: nobody acknowledged it; Tuck, paid, pointed to Seolforfyrd "nobody has been inside it" | R2-A 145, 150 | **fixed** eecbd346 (the parish's purse), fa40d68b (the next place is another) |
| E29 | P1 | No challenge: every fight a free win, the debt paid on Day 1, the deadline never mattered | R2-A §8, R1-B §8 | open — measure before tuning |
| E30 | P2 | Creation: screen order differs between runs, BACK from ancestry jumps to the reason, a chosen calling once did not stick ("An elf thief") | R2-A 04–14 | partly: the order is fixed (reason, ancestry, calling, way, trade, name); the skipped screens were most likely clicks on a Continue under the Details veil; a sheet's clicks no longer bubble (58cb7761); the weapon screen's labels open |
| E31 | P2 | Paintings repeated in one site (one cellar image three times), a cathedral for the toll-hall, a barred cell for a muck pit; a painting's credit caption on the scene; the hireling's portrait is the player's | R2-A 82–129 | partly fixed 5a6618a0 (no two of the company share a face; the hireling wears his own likeness); rooms of one kind share one painting until there is more art |
| E32 | P1 | An act that brings on a fight is told as an attack: "Throw an oil firebomb through the crack into the brood-chamber" began a fight narrated "You attack the spiders in the old workings", and its own result (the mother dead, the eggs burned) was learned only from the reward afterwards | R1-B 82–91; R2-B 170 | **fixed** 63aa9ed5 (thrown and spoken acts take a minute, so the spiders do not cut them; an act cut by an onset has its result told before the fight) |
| E33 | P2 | A lock whose key the company carries offers "pick" and "wrench" and never says the key opens it, though Go… lets it through (PassageModel lets a keyholder by via `opens`; nothing carries that to the lock's pane) | R1-A 76–79; R2-B 154, 181 | **fixed** d8d23ffb (a keyed way says so on its lock) |
| E34 | P1 | The world does not notice what was done: the bell carried home under "Nobody has gone after it"; a second shepherd's boy telling of Silkholme beside the rescued one; the Gaffer "comes off his fleeces" after he was dead | R2-B 130, 123, §10.1 | partly fixed 87f1c799 (the frame waits for the bell; the herd-girl); the Gaffer's line open |
| E35 | P1 | A calling's own ways are buried: slipping past the gate-hobs was in Look… under the brambles, the main list only Parley and Attack; nobody reacts to ancestry (an elf, not even the other elf) | R2-B 88, §6 | partly fixed: cc5f84e3 (a thief led to slip past), 056e3ad0 (hasAncestry; the elf factor speaks to an elf) |
| E36 | P2 | Aiden's antidote on a poisoned hireling: "to no effect"; Aiden "will not take your money tonight", then charges for the bed | R2-B 164, 146 | the bed **fixed** ec2ceecc (the thanks gives it on the house); the antidote open |
| E8 | — | Headless scripts could not take a map journey | — | **fixed** bf62b137 (`map:<place>`) |
| E21 | — | Cold agents under automation skip the prologue; next rounds use `&opening` | P | noted (harness) |
