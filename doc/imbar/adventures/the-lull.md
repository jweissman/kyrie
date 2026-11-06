# The Lull: ledger for the broad pass

*New data: `data/adventures/the-lull/fellowship.kyr` (about 90 lines), added to `module.json` and `placed.json`. The Old Shift's refusal to name the war is untouched; the new text goes round it ("FOR THE WAR. NOT TO BE SOLD." on a ticket nobody has asked about).*

## The ledger (14.1)

| | |
|---|---|
| **Count** | The sennight, notched on the Fold-stone in sevens; Sixways keeps it for the Lull. |
| **Keeper** | The Fold-stone and the Old Shift (eleven strikers left). Inside, Tobias Lindsell keeps the *telling*. |
| **First page** | The war that wanted cloth, which no one remembers and no one will name; and the stroke of a T cut from behind on the strikers' beam, the fifty-second name. |
| **Price of reading** | What is done without meaning it comes apart at sunset; the telling costs Tobias his place on the beam; Hester's Monday costs someone a hand. |

## Acts and scenes

1. **Sixways** (the Waiting Woman, Ruth Coll, Rooke's yard, Haskett's loft, Exiles' Row): Dorcas, Ruth, Abel, Simeon, Mercer Haskett. *New:* the curtains that must be given and not bought; the eighth notch fenced on the stone; the oldest bolt, FOR THE WAR.
2. **The First Lullday** (Linger green, the Open Hand, Gift Hall, Glossary, Almshouse, the Lindsells): Hester, Tobias, Corin, Aldith, Mabyn, the Old Shift. *New:* the cleric's Office; the voices.
3. **The Second Lullday** (Spurling's, the Gardens, the Hangers, the tarn): Wenna, Jenet, Hob, the Old Brock. *New:* the Hume candles on Wenna's rack; the sett read by a ranger.
4. **The Sixnight** (the Mill in the dark): the Hands, the Overseer, the pay-chest, the loom. *New:* the unfinished T under the beam.
5. **The Working Day** (the Shift Bridge, the Table, the Watching). Unchanged. *New:* Nell Lumb's lantern on the Strike Post, lit by whichever child most lately lost a tooth.

## What changed, before → after

* **Characterization in play.** Tobias: want, to be forgiven without being asked; fear, his own price ("what he would do for wages"); lie, "I was at the window"; surprise, the notched shilling and the bolt. The new beats put him in front of cloth he recognises and an Office he cannot refuse (he stands in the door and does not speak).
* **Companion arc.** Five voices: warrior (the piers are sound, it wants oak), ranger (the Old Brock is old, hurt, remembered, and has been fed once), thief (the T under the beam, begun by someone crouching), cleric (Hester is well nursed; what she lacks is leave), bard (the starlings hold the hymn with the end taken off).
  * **Calling-unique way through:** the cleric's **Office for the Easing** (`ease_hester_office`). Tobias will not buy physic and, left alone, does it himself on the first night. Ruth's poppy and phial are bought. The Office is a third road that buys nothing, eases without ending, and leaves Hester clear enough to ask again at the Watching (she does; the company must live with having been asked).
  * **Choice with consequence:** the bolt of the Long Shift's cloth, woven in the Sixnight: sell it to Haskett (twenty coin) or give it to Tobias, who knows the weave, says that is what holds ("not the wage; the leaving off"), and is raised two trust, which opens his confession of the window sooner.
* **Danger with two exits.** Already present: the Hands (lie open, work the loom, leave by the Gap), the Overseer (the hymn, lying open, the pay-chest left shut), the Old Brock (honey, flame). Checked, not added.
* **Depth.** Curtains that cannot be bought; the fenced eighth notch; FOR THE WAR on the oldest ticket; Nell's lantern; the T.
* **Links.** Out: the Wold of Hume (the Haskett cart carries candles *unlit*; mirrored in Hume's slate), Larum (winter wool for lamp-oil; the quiet wants warm things), the sea (Dorcas, "I would not say the sea is any better for it"). In: the cart is the visitor's road; the Hume and Larum carters are the people who would bring a company here.
* **Tone.** The Lull is gentle-comic; the contrast is the lantern, a grave thing a child carries and no one explains.
* **Foreshadow and payoff.** Early (Sixways): the ticket FOR THE WAR; the eighth notch. Payoff in the last act: Tobias with the bolt on his knee. Only if you looked: the T from behind, which tells you what he will say before he says it.

## Tests

`test/the-lull-revised.test.ts`: voices (five callings, plus the lantern and the candles), the thief in the dark Mill, the Office and the lone-warrior control; fixture `test/fixtures/the-lull/revised*`.

## Honest shortfalls

* The bolt-to-Tobias topic and `tobias_office` follow-up are *not* played through in a test (the first needs the whole Sixnight loom journey with a company of five). Lint is clean and `carries(party, shift_bolt)` is the same condition Haskett's topic uses.
* No mage or monk voice. The Office's "she asks again" is an Observe, not a decision point; nothing reads `hesterAsksAgain` yet.
* I did not read a world event (`befell`): a standalone module cannot (friction 5).
