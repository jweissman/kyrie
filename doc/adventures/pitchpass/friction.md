# The Pitch of the Glass: friction

## Creative intent
A perilous crossing with a wonder at its heart, and no villain worth the name. A five-foot telescope mirror must be carried over the Organ Stair
to a Star-Readers' tower. The glass hums, because its grinder tuned it by ear. The Cut, a rock gorge with four stone pipes in its wall, plays whenever
the wind is up, and the glass and the wind would shake each other apart. Four people want four things: Marta Vellacott a crossing with no dead mules,
Nesta Wennick not to be asked how she ground it, Tobiah Lintern to hear his pipes played as a chord once, Dunstan Lathe an oil trade that does not shrink.
The best crossing is the one nobody planned: set the pipes to the glass's note so wind and mirror agree. It needs the grinder's secret, the keeper's wish,
and a pipe the player has to find (which of four pipes matches the glass is rolled with Deem's `(1d4)` at install, so the answer differs per game).
Links: the Star-Readers' towers and rape-oil versus whale-oil (the same economy as The Calf in the Tail-Race, from the other end; the lamp-boy in the lower tower of
Dun Rìerdan is the closing image); Aenean pipes cut into rock, unexplained. Deliberately not a ledger, a bell, or a debt.

## What works (as far as automation can say)
- Five endings (The Chord, A Year's Silence, The Wool, The Seam, Forty Crowns), each with a journey test; one extra grey-hour fate (Marta and Lintern) with a test.
- A real clock in play: the Cut plays from ten to six, so arriving at the cairn at ten forces a choice (wait for dusk, wool, plug the pipes, tune them, or rush). Plugging the Cut and then waiting for fog is refused: nobody takes mules into a dumb Cut in a fog.
- The wrong pipe costs ten minutes and is told as sour; the right one gives the wonder. Hearing the note from Nesta removes the guesswork, so the secret pays.
- Six checks (names, lint, reach, repeats, 14 journey tests) hold; `bin/kyrie verify pitchpass` says every check holds.
- Lathe's money can be taken, and the mirror still delivered (it is a choice with a fate line); or the lashing cut (Forty Crowns).

## Incomplete or thin
- **Never looked at on the page.** `bin/kyrie preview` started a server but there is no browser here. I cannot say how the cairn, the Cut or the Saddle paint. No paintings were commissioned or matched.
- **Reach is shallow on this one.** The greedy explorer stops at the Seven Turns (Gnomon's block needs a ration, which it does not choose). reach reads 3/7 rooms and no endings; the journey tests are the only evidence for everything above the fourth turn.
- **Not registered in countries.json** (shared registry; not touched). It plays from its campaign; `placed.json` is written but nothing places it. Suggested entry: id `pitchpass`, province, mountain, entry `road`, name "Stairfoot", topic "Stairfoot, where a crate hums".
- **No companion beats.** Nothing reads the company's calling (a musician hearing the note without Nesta, a ranger reading the fog). A bard or cleric ought to have a way of their own.
- **Marta, Nesta and the crate are followers by rule**, not a Kyr "train". Eighteen generated follow-rules in pass.kyr say where they are.
- The mules are prose. Alidade appears in two lines, Gnomon blocks one passage. Eleven mules deserve a mule-by-mule moment.
- Lathe never pursues; his consequence is one fate line and an ending. The oil factor is a sketch.
- The chord is told, never heard: the page has no way to play a pitch. The player takes the writing's word.
- The Saddle unveiling happens at dawn only because of the camp wait; nothing marks the dawn as the moment.

## Authoring difficulties
- **Shared names are claimed silently by the rules**: `shelf` and `shut` were taken by data/rules; the lint says so, which is good, but only after writing.
- **A Result with only `when` variants and no plain one worked** but I did not find that stated; I wrote it that way for the pipe actions and the guide never promised it.
- **A rule's `says` fires once.** My "sour pipe" rule told only the first wrong pipe, silently. I moved the telling into the action's `Result … when` variants. A repeatable telling rule would help.
- **No conditional effects** (again): one crossing is three actions (chord, safe, rash) with mutually exclusive Requires, and one more rule per follower per place. Eighteen rules just to say "the mule train walks with you".
- **Label prefix collisions**: "Lead the train through the Cut" also matches "…in the wind". It caught a real timing bug in my test (the wind runs to six and I had fog at five), but it is an easy trap for journey authors.
- **Four near-duplicate actions** for four pipes: the repeats tool correctly flags them. A parametrised action ("Unstop pipe {n}") would remove 90 lines.
- **Deem usage is thin**: one `(1d4)` roll said through `{pitch(crate) in words}`. No per-play variation of people, weather or mules; no table for the mule names. I used Deem for one meaningful variation and say so.

## Proposed improvements
- Kyr: a first-class follower ("travels with the company") for people and things.
- Kyr: parameterised actions or a repeat-for-each (`for n in 1..4`) in a module.
- Kyr: repeatable telling rules (`says` every time), and a documented `Result … when` with no plain.
- Kyr: conditional effects in an action, so one crossing is one act with three outcomes.
- Deem: a table an authored adventure can draw from at install, for mule names, the weather on the day, the pitch and the keeper's stops.
- Reach: let the greedy player spend a ration when a mule blocks the road, so it climbs.
- Tooling: `verify` should read the journey tests' endings and count them as reached.
