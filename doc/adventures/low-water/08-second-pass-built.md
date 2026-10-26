# Low Water — the second pass, as built

*2026-10-26, on branch `adventure/low-water`. [07](07-second-pass.md) is the plan; this is what came of it, what
changed on the way, and what is still short of it. [09](09-critique.md) criticises it and [10](10-final-revision.md)
revises it; the Auditor's voice and the Mere standing up quoted here were rewritten there.*

## What the adversary turned out to be

The plan's Auditor was a Varakiir reading the count to find a *seam* in the settlement. Building the wheel-rooms
changed it. Behind the ninth arch the smallest wheel has nine sockets, and in one of them a jewel breathes. Once that
was there, the seam idea was weaker than what the room was already showing:

* **The Auditor is owed.** The Kiritarun in the ninth wheel is its own heart, one of the nine the Varakiiri lost. The
  Mathematical Age found it at the bottom of the Bowl and built the Reckoner around it to count everything it holds
  fastened: makers, beasts, the dead, the living, the waters, the unborn, the planes. The count is *the account of
  what was taken*. WHAT IS COUNTED IS GIVEN: when the account is whole, the heart goes back.
* **The Bowl is the hole.** In the citadel's model of the nine circles, the ninth pin sits under the innermost ring
  and the crack round it is the Bowl of Ammerlin seen from above. The jewel fell out of the world and pinned it where
  it fell. The terraces are the crack's edges and the Mere is what pooled. If the heart goes home, the Bowl opens on
  the dark. That is the chilling revelation the plan asked for, and it re-reads every scene before it: the city lives
  in the dent.
* **The account was addressed upward.** Aun's stones in the Ear's Library say the count is owed to those who settled
  the world. The opening in the citadel's dome reads *TO THOSE WHO SETTLED THE WORLD, FROM THE NINTH*. The makers of
  the wheel were honest: they addressed it to a court, not to a creditor. The Auditor has been standing under a door
  that was never meant for it, and it says so.

So the adversary is a claimant, not a monster. It is patient, tired and honest in its own way. It was wronged, and it
will empty a city to be repaid. This is a stronger antagonist for this adventure than a seam-finder. The whole work
is about measuring honestly, and here the creditor's case is good.

## The instruments, all playable

| Instrument | Where | What it does |
|---|---|---|
| `approach(bowl)` | auditor.kyr | A nightly clock, faster past seven ninths and below 30 spans, slower while the Fourth is sung; zero when the count is broken or falsified |
| The Reflected | auditor.kyr | Figures of water, left for right, out of the Mere after dark. At approach 2 they climb to the Ward landing, at 3 to the Ninth Lock, where they sing the Rising and raise the Deep Gate, and at 6 into Measures Square. Their cold is a hazard. Annet Kettle is among them if the diggers drowned, and Isaura's double if she is with you |
| The marked hymnal → Pell → the cipher | auditor.kyr, halm.kyr | The Short Hymn's cuts were suggested, in a hand nobody can place. Halm's patron the Second Reader is named, his footnotes are broken by Isaura, and *MERROW NEXT* carries it out into Imbar |
| The fifth voice | auditor.kyr | The column answers in a voice that is none of the company's |
| The doubles | interval.kyr | Stay among the Reflected in the mirror Ward and they make copies of you, and the copies walk up into the Bowl. Dov has seen you on the landing at night |
| The Mere stands up | citadel.kyr | Unchecked to approach 14, the Long Silence again: the whole Mere rises in the shape of a woman and sings the hymn backward |
| The heart taken | citadel.kyr | The night the count closes unheld, the Reflected take the heart from the ninth socket and carry it up the stair, which takes them a day. If it arrives: **The Open Bowl** |

## Acts V and VI

**V. Ammerlin in the water** (interval.kyr). There are two ways in. One is the round door, when the count is whole and
the door unheld. The other is the Mere itself, at night, following the Reflected down, for a company carrying the
Lector's bell. Past the still water stands the copied city: the Rim, the square with its fountain falling upward, the
Sounding where an image of Aun kneels and practises the Fourth *backward*, the Office with the ledger of water, which
takes your fingerprint, and the Ward full of boats afloat and Reflected waiting on the steps. At the edge of the Ward
the still water stands up into the stair that goes up.

**VI. The Glass Citadel** (citadel.kyr). The rooms, in order:

* **The top of the stair.**
* **The glass gate.** The Assayers admit a company carrying the bell, or one whose fingerprint is already on the
  account.
* **The hall of receipts.** Every cupful the Reckoner drank is kept in a jar, and in each jar is the face of whoever
  stood at the water's edge when it was drawn, Annet newest.
* **The hall of the nine circles.**
* **The seat.** An empty glass chair, rings in the water round it, and the fifth voice. Six conversations with the
  Auditor: what it is, what it is owed, what becomes of Ammerlin, Pell, Aun, and why the account is addressed
  upward.

## The climax: seven ways it can end at the top

| Ending | How |
|---|---|
| **The Open Bowl** | Count whole, door unheld, nobody takes the heart back within a day: the Mere goes through the bottom of the Bowl, then the Ward, then the terraces |
| **What Is Counted Is Given** | Carry the heart to the seat and give it. The nail is drawn gently, the Bowl settles a hand, and the Reflected stop. Debt or theft: nobody can say |
| **The Account Delivered** | Let the heart go up through the opening in the dome to those who settled the world. The Auditor waits for judgement; the city stands on its nail |
| **The Ninth Jewel** | Leave the Bowl carrying the heart. The Reflected face north every night, the way you went |
| **The False Measure** | Before the count is whole, take Isaura down and up; she writes one ninth that is not there into the Auditor's account in front of it. The Auditor withdraws. Isaura never measures again |
| **The Long Watch** | Knowing Aun's words, stay at the seat and sing the Fourth; the Auditor sings it with you, backward, for ever |
| *The census endings* | Leaving before the heart arrives (census heard, song ended, count closed alone) now ends with Isaura's letter: *Received, it said, in every room. I am measuring it. It has no number* |

The heart can be taken back from the Reflected wherever they stand with it at night, by ringing the Lector's bell.
On the stair in the water you can climb after them. When the door *was* held, the grille of the ninth arch opens on
the socket, and the heart can be lifted out and carried to any of the same ends. Seventeen endings in all.

## Evidence

Seven new journeys in `test/low-water.test.ts`, with shared steps in `test/support/low-water.ts`:

1. **To the Auditor.** The bell from the Ear's Library, the Mere at night, Ammerlin in the water (the ledger, the
   doubles), the stair, the Assayers, the receipts, the circles, and four conversations with the Auditor.
2. **What Is Counted Is Given.** Wait for the count to close, ring the heart out of the Reflected's hands on the Ward
   landing, take it down the Mere and up the stair, and give it.
3. **The Account Delivered.** The same, sent up through the dome.
4. **The Ninth Jewel.** The same, carried out by the north road.
5. **The False Measure.** The nine wheel-rooms, then Halm on the heart, the bell, the mirror ledger, Isaura's decision,
   the false figure, and home through the water.
6. **The Long Watch.** Halm on the Lector's stones, the climb, the Auditor on Aun, and the watch kept.
7. **The Open Bowl.** The "goes on without the Assessor" journey now ends here; it used to end in the quiet *Low
   Water*.

The census journey now waits for the count, makes the round trip through the water, and leaves before the heart
arrives. The Open Bowl journey also checks that the Mere stood up on its way to the count.

Not yet journeyed: the held-door grille, and lifting the heart from the socket; climbing the stair after the light.
Both are linted, and are the same item and actions the journeys above use.

## What resisted (added to [05 §3](05-implementation-report.md))

16. **A way's `opening when` is checked by a rule placed before the module's own rules.** A rule that makes the
    condition true in the same pass, such as the Assayers' admission or a teaching rule, leaves the way shut until the
    next pass. The page therefore shows no exit at the moment the story says the gate is open. I met it twice. In both
    places I made the way's condition the underlying fact (`carries(party, ear_bell) or knows(...)`, and
    `tried(circles, looking)`) rather than a relation a rule asserts. Remedy for Kyr: evaluate openings after the
    module's rules, or rerun them once at the end of a pass.
17. **`carries(group, item)` reads only the members' packs.** `Assert keeps(party, x)` is accepted, but the company
    then does not carry `x`. I set the heart down at the party's feet (`Assert at(ninth_heart, site)`) and let the
    player take it, which reads better anyway. Remedy for Kyr: lint `keeps` asserted on a group, or file the item with
    the group's first member.

## Still short of the plan

* **Scale.** About 71 rooms over four planes, against a plan of 150 to 200. The wheel-rooms are nine rooms, not nine
  galleries. The citadel is five rooms, not a fortress.
* **Act IV unchanged.** The Hearing does not yet hear about the Auditor. The plan's council of war is unbuilt: Quill's
  sophistry as the weapon, and the city choosing among the false number, the Fourth, the break and going through.
* **The Collegium in Imbar.** *MERROW NEXT* is a line, not a thread. Nothing in The Long Man responds to it.
* **No fight.** The Reflected are a cold, not a combat, and the Assayers are peaceable. Kept that way deliberately:
  this antagonist is out-sung, out-witted or paid, never cut.
