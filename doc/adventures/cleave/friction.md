# Friction: The Cradle Across the Cleave

## Creative intent
A wonder-and-crossing adventure with no villain, no ledger, no verdict. A gorge, a dead bridge that nine spiders
will not respin, and a woman in labour on the far side. The middle is one old midwife, frightened of something she
will not name. The central act is sitting up with something trying to be born, on both sides of a gap. The player
may carry the midwife over by the sure and joyless line, make a night's vigil with her on the hub so the road is
spun, or fly across alone with her three rules and a stranger's kitchen to manage. Each leaves a different
parish behind it. Lore ties are light by design (Imbar's gorge-country, the spiders as a canonical animal); nothing
here touches the registries.

## What works
- The Hesper chain: "it is not the basket", then "out to the hub" (she says `hub` first), then Cassia, then the
  Cassia-and-Hesper meeting, then the vigil. Each step is found by asking, and each pays.
- The consequence fork: the line gives a fast birth and a dead egg; the hub gives a road and a lowering of Cerise.
- The hub night, dark-gated hatching and a road spun two hours later. A late company really is late (watch 144).
- Wind is a rule on dice(clock): afternoons gust, the Stub walk then hurts, Ned will not run the basket and gives
  the fare back. Deem tables were not used; this is the only variation, and it is Kyr's dice, not Deem.
- 11 journey tests cover all six endings, the gust refusal, Cassia's gate and the flitter's refusal of Hesper.

## Incomplete or weak
- No browser look: Chromium was absent here (`playwright install` needed), so `preview` was only confirmed to
  serve (HTTP 200). No painting kinds were checked for "the Stub", "Toop's ledge", "the hub of the web".
- The hub route is hand-held: sit-up repeats one text four times; the night wants varied Results by hour.
- The line route is too cheap (five coin, one topic); it should cost something Hesper-shaped, e.g. her fear shown.
- Dov and Ned have no fates; endings are static strings and cannot read who followed. Ned's bitterness about the
  bridge never pays off except in the Grey Road ending.
- Gust hazard on the sag was never exercised in a test (dice-dependent).
- Endings tell "afternoon"/"dawn" regardless of when they fire.
- Hesper's generic "goes her own way" and "for a while, then" lines come from the engine and cut across her voice.
- Not played by a human.

## Authoring difficulties
- Surnames are scarce: four were taken (Wend, Marrick, Harl, Sallis, Tolliver); `names` is advisory per name, and
  `suggest names` gives given names only.
- `Objective` puts `toward X by Y` before the text; the guide's grammar shows it only in examples.
- A `Wonder` must have a Change on its Thing; I gave Cerise a "listen" nobody needs.
- Kind names get no article handling ("A hesper lunn's second bag", "You take midwife's second bag").
- Endings cannot be anchored, so every ending is flagged "heard everywhere".
- Clock start (08:00 day 1) is only discoverable by reading journey.ts.

## Proposed Kyr/Deem improvements
- Endings that can read prose fragments (`Fate` lines keyed by who followed), so Dov, Ned and Cassia can close.
- `Action ... Result` alternatives by clock, to vary a vigil.
- A `Vigil` form: stay, with named beats at hours, interrupted by a wind.
- `kyrie names` offering free surnames; Kind article/proper-name flag.
- A Deem table for spider-daughters' names and the lamp-code, so the two sides can say different things each game.
