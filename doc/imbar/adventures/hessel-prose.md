# Hessel: prose quality pass

Editor's pass on `data/adventures/hessel/*.kyr` (about 190 KB of dumped prose, `bin/kyrie prose data/campaigns/hessel.campaign.json`), text only. No ids, conditions,
items, persons or places touched; no test asserts any changed string (grepped under `test/` before each change).

## What I found

Hessel is the strongest-voiced of the four. It is genuinely comic, and the comedy is made of things the reader could not have guessed: a stuffed pike
presiding over a parlour, thirty gentry bobbing in canvas hats with floating handkerchief-trays, a pump-room whose lost-property box holds forty left gloves,
a Master of Ceremonies who closes his eyes when the violinist arrives. Scenes have stakes and a turn (the banns pause, the ball's dances, the hall of clocks),
and the secondary persons have different mouths:

- **Mopsa**: exact, unhurried, never says "I think"; reads a person like a page she means to read twice.
- **Mr Twiss**: capitalised Rule, ceremony as grammar ("regret", never "sorry").
- **Mrs Scrope**: "my dear", "I never repeat anything", every rumour with its chain of custody.
- **Big Lanyon**: speaks for the bench ("we"), short, slow, a laugh like a cart on a bridge.
- **Ottery**: questions and bluntness, a physician who tells the truth and cannot say whether he is sorry.
- **Mrs Cherrett**: canal-gang similes, bargains with God and the furniture.
- **Rupert**: flustered, ends sentences by leaving the room.

So the weak places were small, and nearly all the same tic: **a beat of silence announced instead of shown** ("looks at you for a long moment", "is quiet a long
while", "for what feels like a long time") and a few **verdict sentences** that tell the reader what a moment meant. I did not manufacture rewrites of passages that
worked: roughly 20 passages changed, not a quarter of the file. The text does not have a weak quarter.

## Before / after

1. **The wedding on the steps (`banns.kyr`).** *Before:* "He stands there in front of the whole Season for what feels like a long time." *After:* "He stands there in front of the whole Season until the sexton coughs." The pause now has a sound in it and an owner.
2. **Watching Ismay (`cherretts.kyr`, read_ismay).** *Before:* "...and does not know she has. It is not a puzzle. It is the plainest thing in the room." *After:* "...and does not know she has. Below, the young chairman turns his page again, and she loses her place in the column." The verdict is replaced by the thing it was a verdict on.
3. **The peal (`season.kyr`, peal_understood).** *Before:* "...eleven bars played and a twelfth rung wrong, which is what a bar sounds like when the people who learned it have forgotten the tune it ended." *After:* the final clause is cut; the bible's "twelfth" motif is left as a sound, not a gloss.
4. **Mrs Brannagh and the knock (`carth.kyr`).** *Before:* "Mrs Brannagh is quiet for a long time. Then she takes off her spectacles." *After:* "Mrs Brannagh takes off her spectacles, which she has never done in front of you." A fact about the housekeeper replaces a fact about the clock.
5. **Mrs Cherrett finds the drops watered (`cherretts.kyr`).** *Before:* "She looks at you for a long moment. 'Mopsa,' she says, not loudly..." *After:* "She looks at the bottle, and at you." She has noticed the object first; it is what she would do.
6. **Ottery before the answer (`orm.kyr`).** *Before:* "Ottery is silent a long time. 'Yes,' he says at last." *After:* "Ottery walks four paces before he answers. 'Yes,' he says." Walking is Ottery.
7. **Lanyon on the knock (`oldtown.kyr`).** *Before:* "Big Lanyon is quiet a long while." *After:* "Big Lanyon waits until the bench has gone quiet." He speaks for the bench; now he waits for it.
8. **The stile (`city.kyr`).** *Before:* "there is only grass and sky and larks, and the road going on." *After:* the same, plus "on the top bar of the stile a row of snail shells that someone has lined up by size." A room that was a list of weather gets one detail nobody would have guessed.

Also: Rob's finished poem "holds it for a moment as if it were warm" became "holds it a moment against his chest"; Rupert "stands up too, as if pulled" became "hauled up by something"; Celia's hall shutters "for the first time in nine years" (used twice, once on the hall, once on the Crescent) is now "after nine years" on the second.

## Patterns fixed (counts across `data/adventures/hessel`, before to after)

| Pattern | Before | After |
|---|---|---|
| "a long time / a long while / a long moment" | 17 | 6 |
| "for the first time" | 9 | 7 |
| "as if" | 61 | 58 |
| announced-silence beats replaced by an action or object | - | 10 |
| verdict sentences cut or turned into an image | - | 3 |

## Characters with a distinct speaking habit (already present, kept, sharpened where touched)

Mopsa (exact, no hedges), Twiss (the Rule, never "sorry"), Scrope (custody of rumour), Lanyon (the bench), Ottery (questions, then walking), Mrs Cherrett (navvy
and canal similes), Rupert (leaves the room). Lanyon and Brannagh gained one concrete beat each.

## Still weak

- **The "again" topic variants** (`_again`, about 40 pairs) repeat the first answer verbatim. It is correct mechanics but dead reading on a second visit; nothing changes in the character. Many could carry a fresh sentence ("Ismay has moved the ledger to the other hand").
- **"as if" simile density** is still about 58. In a comic register most earn their place, but the Crescent and Carth scenes (13 in `carth.kyr`) use it as their default figure.
- **Mrs Scrope variants** (`scrope_public_*`) share one shape: quoted rumour, then the person she tells it to. Good joke, used six times.
- **The "unexplained custom"** is used for the Cross Bath pillar, the left-hand gloves and the peal. All three are good; three is a set.
- **Fates** are written as a chain of "which"-clauses. They read as a list of wry codas; the best ones (Ede, Mopsa's lodgers, Rob's poem) show the others are capable of more.

## What a structural fix would need

- Variant-aware repeat topics: an `Ask again` that is only offered when something in the world changed, or whose text is conditioned on the clock (a Rule that selects a second text), so the second answer is new.
- The three windows (third-morning peal, ball after 23:00, Ede's night) are unsignposted (see `16-critical-review.md` section 5); a prose-only signpost is not enough without a clue in the player's path.
