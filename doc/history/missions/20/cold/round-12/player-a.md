# Cold play, round 12, player A: Wynn, a human warrior (coming home), a1 — headless

An agent's cold play through the terminal, not a human's and not the page; build 35670028 (the integration branch). Fixed
after this build: the numbers (T24-12), the foreground's missing questions and the fight's ids and order (T24-14), the
times (T24-15). Open: T24-16..18.

## What I did
I played about 94 commands, about 20 of them `all`, `look`, `map` and `character`. I followed every aim the game set.
- **Opening aim, completed (about turn 25):** helped the wagoner, recruited my brother Odo, asked Odo about the road, followed the ruts to my father's body, buried him, and told my mother.
- **Notice jobs, two completed and one nearly done:**
  - Rats in the corn-store: completed, 10 coin and a lantern.
  - Catacombs under the churchyard: completed, 15 coin, a charm and potions.
  - Spiders in the quarry: the mother is killed and the eggs burned; I stopped before reporting to Corrin.

Harness note: the per-turn `resume` method never finished. A piped "cmd / save / q" hung until the 500 s timeout and nothing was saved. I switched to a single persistent session fed line by line (`tail -f cmds.txt | bin/kyrie resume`). There every command answered in about 2 s and saving was instant.

## Top 8 problems, worst first
1. **The foreground leaves out the step the aim asks for.** This happened at least 8 times. The talk topic the aim needs, or the way back to whoever you must report to, only appears in `all`, which runs to 50-120 lines. Examples: "Ask Odo about the road your father took" (T13, s-t14.json), "Tell your mother what you found" (T24, s-t27.json), "Ask Perrin about the noises" (T59), and "Tell Perrin..." (T79, s-t75.json). In the corn-store and the nest the only offered moves lead deeper, away from the aim (T46, T50, s-t49.json). A player without `all` gets stuck.
2. **The numeral 1 runs the wrong line.** Typing `1` did line 3, the "[1]" shortcut (T61, s-t61.json: chose the chandlery and went to the churchyard). When there was no line 3 it was refused (T5, s-t4.json).
3. **Combat menus renumber every turn.** Option 1 was Cleave, then Defend, then Flee, so pressing the same key made Wynn flee mid-fight (T75, s-t75.json). The combat table shows internal ids ("region__s2_u_rats_person_2"). Nothing is narrated until the fight ends, and abilities are never explained.
4. **Talking says nothing.** "Talk to the wagoner" printed no line at all and simply opened hidden topics (T1). Other greetings do print, but their follow-up topics stay hidden (see 1).
5. **Time costs are wrong.**
   - The 8-minute road took about 90 minutes (T15, s-t14.json).
   - "Bury him · 1 min" took "the best part of two hours".
   - 1-minute moves cost 10 minutes and 2-minute searches cost 20.
6. **Contradictions:**
   - Odo "has said nothing since the ditch" right after telling a grinning flood-year story (T20-21).
   - The aim says "the dead are laid" while more dead stand in the next room (T72).
   - In the churchyard I'm told to shoulder open a stone door I hold the key to (T76).
   - In the cellar the hole is offered while "you can see nothing" (T39).
   - "Odo binds the hurt" when no one is hurt (T40).
   - The second half of the rat aim, "find where they get in", is dropped without a word.
7. **Pages are hard to read.**
   - Millholm has about 22 paragraphs, with two dogs at one door, two notices "by the well", and Odo described and then listed again (T6).
   - The road lists 20 plants ("Bamboo grows along the road...", "Ofbit...") above the one line that matters (T15).
   - The cart is described twice at the start.
   - The full page is reprinted after every reply.
   - `map` is a flat list of 36 names with no direction.
8. **Grammar and promises:**
   - "a cave spiders... is here", "a dead things raised", "Wynn fills Lantern / fills a lantern" printed twice.
   - Searching the nest reports nothing at all (T48).
   - The "burn the spiders out" aim has no burn action until the eggs.
   - The antidote I was handed for the bite was never offered when Odo was poisoned (T91, s-t89.json).
   - I'm still level 1 at 660 XP, and the sheet says "Herdsman", not warrior.

## What was good
- The opening story is excellent: the ruts from the out-of-true wheel, the body, the cairn, "I knew. The dog knew." It is moving and well paced.
- Odo is a real companion, with lines that react to Ambrose and to the dark.
- The notice board gives three clear jobs. Each giver hands over a key and a short, flavourful briefing, and the aims update cleanly.
- Social checks show their odds and the roll ("d20 13 + 2 + 2 = 17 against 13"). The black-candle man scene was the high point.
- The "Need: No light" and "Need: Odo 5 of 14" lines are useful, and so are the "in 8 minutes they will be on you" warnings.

## Ratings (1-5)
- Clarity: 2
- Interest: 4
- Challenge: 1. Three of the five fights were trivial; only the spider mother hurt anyone.
- Wish to continue: 3

## Larger adventure
Partly. Every notice job is a small dungeon of 2-4 rooms:
- the corn-store, rat-runs and nest;
- the crypt, ossuary and charnel passage, with an undercroft I didn't enter;
- the quarry adit, gallery and brood-chamber.

The catacombs were resolved with a single social roll. The bigger hooks are still ahead: Odo's lead about whatever took the oxen ("a grassed mound north-west of Mossminster", but the map says "east of Mistshaw"), "the green light in a lone tower", and about 30 far-off rumours from Corrin (Frost Fair at Pellam, Grand Tour at Sennet...). I didn't reach any of them. The game never makes one of them the aim; after each job it moves on to the next notice.

Files: /var/tmp/kyrie/m20/review-a/notes.md; saves s-t4, s-t14, s-t27, s-t37, s-t49, s-t61, s-t75, s-t89, s-t94 (= s.json).
