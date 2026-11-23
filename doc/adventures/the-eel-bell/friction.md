# The Eel Bell — friction

## Creative intent
A craft adventure where the player is someone's ears. Perpetua Sount, a bell-founder gone deaf at the furnace, has three days to cast Quillet's tide-bell before the Silver Run, the one night of the year that pays for the fen. The player sources metal from people who each carry a grievance (the Warden who cracked the old bell by ringing it eleven hours, the eel-keeper who lost his son the same night, the child who is the only one alive who can hum the old bell's second voice), mixes it by Sount's reading of its colour, tunes it by ear, hangs it, and then finds ringers, because a tide-bell is rung for six hours. The bell's two voices (strike for warning, hum for eels) mean one object serves two competing needs, and the failures are different, not just "worse".

Connections: Iscoed's salt-and-eel economy and fuel/iron shortages; the failing Water-Wardens' sea-gates (Dyce is the last Warden; the gate has not closed in forty years); the Founders' Exchange and the Long Man's stolen bell-teeth (Sount's explanation of the price of bronze); the Rì's reeve taking iron from the Porthalen smithies for pikes (Wickens's rake).

Refinement pass: the one big change was composing the dawn out of what the player did. Endings carry outcome only; each person's fate (Maudlin reading the names with her thumb, Rushby and Dyce changing sides of the bell, Wickens's clamp burning out while he rang, Posy and the cat, Sount's ear on the stone) is a separate rule that fires only if the player earned it.

## What works
- The cast is a real puzzle with feedback in the fiction: Sount reads the charge's colour (red, gold, straw, lemon, white, grey scum for iron, grey bloom for lead). Bronze can be pared up but never down. A flat bell is recoverable; a sharp one is not.
- Two voices, two failures: right strike and wrong hum brings the boats and not the eels (a poor winter, Rushby's promise broken); right hum with a thin strike drowns men.
- The cracked-bell path is a full ending, not a dead end. It is seeded by Dyce's own account and paid off by him.
- Different people give different materials for different reasons, and several of those reasons cross: Posy hums only once the cat is found in Dyce's loft; Rushby's third kettle comes only if Dyce's night is told to him.
- Two approaches to the end: ringers recruited, or the player's own four turns on the rope; or no bell at all and a fire in the Warden's cresset.

## Incomplete or thin
- No browser screenshot was taken; `bin/kyrie preview` linted, built and served (HTTP 200), and the page was not looked at.
- No human has played it. Everything here is automated exploration and journeys I wrote.
- The "eleventh hour" refrain does not repeat in the night itself: the player takes at most four hours at the rope, so the player never feels what Dyce did.
- Kettles and pewter are limited, but there is no market for more; the only way to a second try after a bad pour is none. There is no re-melt. A botched pour is lived with, which is the intent but may feel harsh.
- Tuning is a three-choice loop (strike, listen, pare); the search is narrow. I would like the founder's voice to give odd, mistaken hints when the player's report is wrong.
- The tide-night cast of ringers never moves on the map (they are simply said to come). Rope hours are one measure, not people standing in the loft.
- The inscription choice (names, BISCUIT, plain) has consequences only for Maudlin's promise and a fate line. The bell never speaks its words.
- Not registered in `data/adventures/countries.json` (a shared registry I was told not to touch), so the adventure plays standalone from its campaign and `placed.json` is written but unreferenced.
- Day counts are relative to arrival (`begunAt`), so descriptions avoid clock hours; the "dusk" tide may arrive at noon if the company enters at midday.

## Authoring difficulties
- Names that look free are not: Quist, Orpe, Ashby, Fenn, Nell, Hale, Sedge were all taken; the `names` tool saved me, but only when I used it.
- No `If` in an effect. Every conditional outcome of the pour became a ladder of mutually exclusive rules over a measure, and `Result … when` variants only select text, not effects.
- Measures cannot go negative, so the alloy's balance is "20 + 3·tin − copper" rather than copper − 3·tin.
- `mass`, `fuel` and `spent` collide with the shared rules (the load error said so clearly). Everyone will hit this.
- A refrain test ("Wait an hour" ×N) is noisy in the journey trace. A `=+36` that says what it is waiting for would help.
- Ending epilogue vs rules: fates have to fire strictly before the ending, so I added a "grey hour" query six watches earlier than dawn. A `before ending` hook would be simpler.
- A `Change` on a thing is one step; a thing that needs two sacks needs three states.

## Proposed improvements
- Kyr: conditional effects (`When … { }` in On success), or computed `Set` expressions with `if`.
- Kyr: a built-in notion of a "craft batch" (ingredients, a recipe test, a result), so metal-working, brewing and baking do not each need a ladder of rules.
- Kyr: let a `Result when` variant also carry an effect.
- Journey: `=until` should accept a relation or query by its bare name in docs; I found tideOn() by trying it.
- Deem: a sound/voice table (hums, strikes, pitch words) so craft prose is not rewritten by each author.
- Lint: the "heard everywhere" advice fires for chapters and endings, which cannot be anchored.
