# The Dorothea (archipelago, the ring, the Lamp Below): prose quality pass

Editor's pass on `data/adventures/the-dorothea/*.kyr`, `data/goings-on/factors/ring.kyr` and `lamp.kyr`. Text only: no ids, conditions or mechanics changed.
Method: read the voyage, every island's openings and main persons, the House files, the ring and the whole of the Lamp Below; `bin/kyrie voice repeats`
for tics; every changed string was grepped against `test/` first.

## What I found

The archipelago is better than feared. The islands do have different registers (Antlers is noise and guano, Ashkeld sulphur and heat, Mangrow wet and
insects, Port Ness steam and scrip, the Holm bare and arranged), and the crew files (Bascom, Rune, Mab, Jago) are the strongest speech in the set.
The weak places were the *officials* (the House's ranks and the ring), who all talk in the same dry epigram about counting, and a handful of places where
a character explains the plot instead of doing something.

## Before / after

1. **The ledger leaves, summed (`house.kyr`, reckon_leaves).** Exposition of the conspiracy as the player's own thought.
   *Before:* "it is not a puzzle at all, only a sum. Every light the House leases is dark. Under every dark light there is a column of wrecks... Nobody wrecked a ship."
   *After:* the leaves are weighted down with a belaying-pin, a boot and a mug; the columns disagree (SALT, EGGS, SULPHUR) but the margins agree; a thumb down W.R. finds every figure dated the week its light went dark; the last leaf has a pin on a chart marked WAITING. The conclusion is left to the reader.
2. **The Principal's convenience (ring.kyr).** *Before:* "It is very efficient. It is not at all a crime if you look at it by the pound." *After:* the Principal turns the black book a quarter "so that you may see a column and not read it" and speaks in impersonal "one" throughout ("One does not call it a crime if one has weighed it"). This is now his habit; no other speaker uses it.
3. **R. on what the ring is for.** *Before:* a four-sentence statement of the House's whole scheme ("A dark light is a wreck. A wreck is a right."). *After:* he lifts a crate-lid and lets it fall: "Whatever a wreck puts ashore on this coast comes through this room on its way to a man who pays by the hundredweight. I do not ask what put it ashore... It is a good coat. It is the House's." The scheme is carried by the Principal and the leaves; R. keeps his own voice (a man who deflects).
4. **The factor takes the waybill.** *Before:* "She does not look pleased. She looks like someone who has done sums." *After:* a figure the factor cares about ("Nine pound of weir-metal short on that sheet, by my book"), the key swinging from her finger, "takes up the pen, and writes nothing with it."
5. **Marren Kestle opens the seal (lamp.kyr).** *Before:* "'A seal is brass,' she says, 'when the one who made it is afraid.'" (an aphorism that restates the scene). *After:* the padlock "drops into the dust like a dead bird" and she says to the hole, not to you, that she has carried oil to the top of the stair every autumn for thirty years "and never once gone down to see what I was feeding." A stake instead of a maxim.
6. **The cleric reads the chalk columns (lamp.kyr).** *Before:* ended on "It is, in a sense, a sexton." *After:* a thumb in the smear where OWED meets KEPT, comes away grey; "I know what to say to this. I'm not sure it will like being said to." Also fixed an error: the Governor's "eyes, which were two green stones" contradicted its face of "a round green lens"; the lens now "dulls like a pebble taken out of water."
7. **Marchbank at the quay.** *Before:* "Because a light is a free service, and a free service is a hole in a market..." and "loyalty to a lamp is chiefly a matter of what else is on offer." *After:* "A lit coast needs no pilot. No assurance. No salvage... I have never wrecked a ship. Put that in your copy, if you must have a line of mine." He now speaks in lists and sums and gives three prices in one even voice. "You are sensible, and the Reach will be ever so quiet" became "Forty. Counted twice."
8. **Greets that open with the name.** Nine of 33 Greets in the archipelago began `'Firstname Surname,' he says. 'Role.'` I turned nine into something the person would say or do first (Deane: "Excuse my not rising... Deane. The House's agent, here"; Hob Sedge: "'Sedge,' he says, to the splice."; Ansel Hallow: "You are standing in my light," with no light; Merrow Gantry: "I gather, I don't sell. Gantry. Merrow.").

## Descent

The Lamp Below read as a list of rooms. Added three short Observes (`lb_gate_tick`, `lb_gallery_air`, `lb_well_heat`) that carry one rising quantity through the levels: the tick (one to a breath at the head, "loud enough to count by... you have begun to breathe to it" at the gate, a murmur behind the rock at the gallery), and heat (warm stair, banked-fire sweetness, "a dry heat like the back of a baker's oven" at the well). Coin drift on the stair no longer says "nobody can say why".

## Patterns fixed (counts)

| Pattern | Before | After |
|---|---|---|
| "of black bronze" in the Lamp Below | 7 | 2 |
| "the lip of the well" | 7 | 3 (two action titles, one Tarn line) |
| Greets opening `'Name Surname,' he says` | 11 | 2 |
| dry quoted closing line on a House/ring speech | ~9 | 3 kept on purpose (Joss's "He's never held it in his life", Wick's "Hob's boys owe me eggs", Quillon's lighthouse) |
| "a thing that/which" as filler | 7 | 5 |
| "a face like a locked/shut door" (Bascom, Hob) | 2 | 1 |
| "That is all. It is enough." (Rune at the Combs) | 1 | 0 |

## Speaking habits (distinct, now)

Bascom (clipped, owes everyone, pipe as punctuation), Rune (apologises by being exact), Mab (gossip as accounting), Jago Pendry (courteous commerce), Sula Weir (insults as service),
Hester Gull (flat; "everybody owes everything"), Silas Quillon ("I count"), Ysolde Stannard (exact sums, church similes, not sorry in margins), the Principal (impersonal "one"),
R. (deflection, "I am told"), the cellar-men (prices), Marchbank (lists and prices, three at once), Tarn (breathless, parenthetical, wants a receipt).

## Still weak

- The five-rank speech (Pym at the Ness, Wick at the Antlers) says the same thing twice. Wick's version is shorter and funnier; Pym's could go.
- Every island has the same *rhythm*: arrival, four Observes, an Agent of the House who is ill or wronged, one check, one hazard. The registers differ; the shape does not. Antlers/Mangrow are the only two with a real physical set-piece.
- Deem-cast ring ranks mean the lieutenant's three secret branches (skim / school / watch) are formally the same scene with three nouns swapped. The school one is the best.
- The Dorothea still has "as if" about 22 times.

## What a structural fix would need

An island that does *not* have a House agent; one island where the conflict is among the islanders, with the company only a witness; one scene where the player cannot act (Ashkeld's cone, say, simply goes off). A second language for the ring's speech tables so Deem-cast officials differ in phrasing, not just in names and numbers.
