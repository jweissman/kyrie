# Cold play, round 12, player B: Sefa, an elf thief (a dead man's map), pine — headless

An agent's cold play through the terminal (`bin/kyrie adventure` / `resume`), not a human's and not the page. The
build was 35670028 (the integration branch, 12 November evening). The brief: a curious, slightly contrary explorer.
About 62 commands, day 1 from 8:00 a.m. to 6:51 p.m. Turn notes in `player-b-notes.md`; saves were kept outside the
repository (/var/tmp/kyrie/m20/review-b/). The agent's tool could not write this file; its returned report, condensed
by the builder, claims and turn numbers kept.

**Harness note:** piping all input at once ran only the first command, then spun about nine minutes without saving;
the agent drove the rest by a script that waits for each prompt.

## Summary
Mostly ignored the map (Gefeohtgaet); followed the town. Finished the catacombs (crypt, ossuary, the grave-robber with
the black candle and his raised dead, won at 1 HP; Griffin paid) and the corn-store rats (drain, centipede, the old
buck rat's nest, the rat-runs, up inside the locked corn-store; Adrik paid). Opened a third thread (Hesper Lowe gone
"under the Hall") and stopped in the quarry adit. The world is dense and well linked; the page and the inputs often
work against the player.

## Top problems
1. **Numbers fire the wrong action** (T2, T20, T11): `1` took the third line; a number sent the company 21 minutes to a
   shrine not on the page; `7` opened a talk beside a notice. *(Fixed after this build: numbers alone, T24-12.)*
2. **The best option could not be taken** (T36–38): "Creep round … pinch out the black candle" refused by its label,
   by its label with its cost, and by its number; only the old shortcut worked, straight into a fight.
3. **Turn-ins and key topics only in `all`** (T61, T1, T64), and the foreground often empty. *(Fixed after this
   build: a talk's leading question is offered, T24-14.)*
4. **Fights**: a table of internal ids, turn numbers that jump, the account only after the fight. *(Ids and order
   fixed after this build, T24-14.)*
5. **Empty talk**: the boy "waits to be told why he should", with nothing to tell him; "'We want no trouble,' one of
   him says" to a lone man.
6. **Times**: "Rest · 36 min" took six hours; "Search · 2 min" twenty minutes. *(The terminal printed ticks as
   minutes: fixed after this build, T24-15.)*
7. **Broken statements**: a hare "in your hands" never in the pack; the aim switched without a word and back;
   Hesper "asked yesterday" though met that morning.
8. **The page**: `all` runs to 60–108 lines, mostly far journeys; doubled labels ("Take the road to the Lull to the
   way into the Lull"); a view repeated on every shrine page; lines printed twice; raw markdown (`*habit*`); a cryptic
   "Need: Sefa: 1 of 6"; the sheet says "Drifter"; `q` prints a stack trace.

## Good
The prose and the chain of clues (the hobnails on the corpse, the sooty smear on the offering-box, Hesper's four-note
bell); the ossuary's stated odds and real stakes; both payoffs earned; the underground connecting sensibly; coming up
inside the locked corn-store as a thief.

## Ratings
Clarity 2 · Interest 4 · Challenge 2 · Wish to continue 3.
