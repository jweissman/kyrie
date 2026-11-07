# Let One Remember (The Road the Star Came Down): revision ledger

**Count.** Who is held in mind: a mountain's weight by its people, a hollow by its anchors, a man by a lamp.
**Keeper.** The Keld, who cannot forget; the Registry, which enters whatever it is brought; a chain of Counterweights.
**First page.** What the Lettings were paid forty weights of silver to let go of in 412 (the ledger does not say whose).
**Price of reading.** Whoever says a name at the Seam is, a little, said back; the ranger's shelf, the cleric's office and the Unsaid's house each cost something.

## Acts and scenes (faces in brackets)

| Act | Scenes |
|---|---|
| I, the Corrow | Stake ruins and the Rope and Lantern (Agnes Ruddle); Hornwake and the tail (Ruth Teake, Lene Tallow); Keld (Mother Saska, Teshen); the Well (Mattie Ninepan, Ida Wishart); Wendmouth (Judge Pennick, Bram Coyle, **Odo Pannick, the Finder**) |
| II, the Grey Country | the Margin, the Hollow (Iniry Calde), the Unsaid |
| III, the Kin | the Unfolded, the Forgetting of the Way Home |
| IV, the Voyage | Hightown steered by memory |
| V, the Road | the Nail's wake, Wenna Coyle, four endings |

## What changed (before, after)

- **The Nail's mystery.** Before: the Unsaid was named as the Nail's own name three times (the discovery, the Warden's-account scene, the library) and again by the Nail and Wenna in Act V. After: the discovery says only that a name was let go in 412 and has gathered forgotten things since; the account-book scene says forty weights of silver were paid to let go of a name "whose, the ledger does not say"; the library line is one sentence; the Unsaid no longer announces that its thing went after the jewel; the far side no longer tells the player what the black stuff is; the Nail speaks four sentences, not six. The tested lines are kept. What the player must now do is put the pieces together.
- **Voices (`witness.kyr`).** Six calling-keyed beats across all acts: a cleric reads the empty niche (Keld), a ranger reads the empty west field, a warrior reads the cut on the tail, a thief reads the secretary's chair at the consulate, a mage reads the mountain's place, a ranger reads the ledge at the Old Silver; a cleric hears the evidential grammar on the Keld green.
- **A calling-unique way through.** The Old Silver (previously: feed it or fight it): a ranger leads the company along the dry shelf, no rations spent. Fed, fought, or walked round: three exits.
- **A consequential choice.** The empty niche in the Hold chapel at Keld: `CORIN, aun` (let: told, not seen). A cleric may keep the vigil (trim the lamp) or say the office and close it. Closing frees Teshen from the wait (she goes for no wage) and ends the reeve's house as a waiting house, so the Unsaid can no longer be housed there; it can still be sent or unmade. Payoff when Corin is named: the mark is re-cut `calve`, the lamp put out; nobody will say who held the ladder.
- **Characterization.** Mother Saska: wants Keld unforgotten; fears the syllable and being a liar; lies to herself that she only knows things at second hand; pressed, she says a thing *kept* (she saw the Hollow's smoke at eight) and admits she has never told Teshen. Ruth Teake (twenty links; "Two," she whistles and the filing stops) and Corin Webb already show the rest in play.
- **Contrast.** The Finder of Wendmouth: a by-law of 1840 requires him to offer every returned thing to whoever lost it, and nobody wants anything back.
- **Depth.** The Finder's refusals; the eleven-pocket coat; the bell stamped with a long figure, held for a dale in the south (the strokes under the figure are cut); the Lesser Instruments man who "collects" notched brass; the grammar of the Keld green ("let, not kept: somebody told her").
- **Danger with exits.** Chimeflies: shutter every light / Ida takes the light. Old Silver: feed / ranger's shelf / fight. Airless sumps: read the marks.
- **Motifs, sparingly.** The kept light (the niche lamp at Keld, relit "every time anyone has looked"); eleven strokes and a blank is **cut** (second pass): the blue bucket now carries "a row of tally strokes" and the Finder's bell no longer has eleven strokes and a space under its figure, so the adventure's one kept light (the niche lamp) is its only motif. The fish-and-flame does not appear. "Collects" for the Lesser Instruments.

## Companion arc

Dori (cleric) carries the niche choice; Elen (ranger) the Old Silver, the field and the ledge; Bran (warrior) the tail; a thief reads the desk, a mage the place. Teshen is changed by the choice (hire 0 and "what am I for?" or the vigil intact).

## Links

Out: the Long Man (the bell's owner, a dale reeve far south); Corran and the Lesser Instruments (the tinker who collects); the Hesk script is not touched. In: a visitor with a lost bell or a returned thing comes to the Finder; a Lesser Instruments man looking for notched brass.

## Tests

`test/let-one-remember.test.ts` (24 pass, unchanged) and `test/let-one-remember-witness.test.ts` (6 pass): voices; cleric closes the niche (hire 0, other answer closed); trims the lamp (Saska says a thing kept); the Finder; the ranger's shelf; the housing exit gone with the niche closed (fixture `test/fixtures/corrow/act2c`). `witness.kyr` is also in the act fixtures' module.json.

## Honest shortfalls

- Thief and mage voices (consulate, mountain's place) are written and lint but are not played: the preset party is ranger, warrior, cleric.
- The Nail is still named in Act V's Wenna scenes and the endings; I trimmed, I did not rewrite them.
- Acts are named but their scenes are not re-cut; no Kyr scene was cut.
- Reading `befell(...)` of another adventure is untried in this module (no corrow module imports the canon events); links are by name and object.
