# The starting company of each shipped campaign

The owner's ruling (7 November): start with the company appropriate to each authored campaign, ordinarily two or
three where the story establishes them; preserve genuine lone-character starts, recruitment and travelling alone; do
not populate the party artificially just to activate authored beats.

Each one-person campaign was read for its `pitch` (`data/campaigns/*.campaign.json`), its opening module (the
`company.kyr` and the first room's scene), its treatment under `doc/adventures/`, and its ledger under
`doc/imbar/adventures/`. The question for each was: does the story put companions beside the protagonist at the start
(named travelling companions, a household that sets out, a crew, a troupe the player belongs to, kin who come too)?
None of the seventeen does. Every one is written for one protagonist arriving alone, or for a premise that belongs to one
person (a debt, a homecoming, an apprenticeship, a legal standing). The people who might travel with them (Hern,
Ivo Fairweather, Linnet, Ned Noone, Tobu, Mirel, Ursel, Sorrel, Gosse's players) are the story's own, met and recruited in play. So all seventeen
stay one, and their lone-company routes remain the shipped path.

| Campaign | Start | Why |
|---|---|---|
| a-winter-in-carth | 1 (Wren, bard) | The beadle "offers a stranger two shillings to walk his prisoner" (treatment); the companion is the prisoner Hern, met at the Cross. |
| gosses-company | 1 (Wren, bard) | "You have a little coin and no particular plans": a stranger who meets the players on the green and may take service with them (`joined`); the troupe is the ensemble, not the party. |
| half-the-hive | 1 (Wren, ranger) | "The protagonist arrives as anyone does, hears the Searchers want hands" (revised design): one hired hand; Ivo Fairweather of the Escort can join. |
| hessel | 1 (Tamsin, bard) | "A stranger comes over Lim Bridge", "no letters of introduction": one meddler, whose courtship of Mopsa can end in marriage. |
| hold-one-season | 1 (Tamsin, thief) | The indebted-cutter origin: the debt, the knife and the uncle Garret are the cutter's own (`inDebtTo(party, dagny)`, `kin(party, garret)`); Mirel and Saro are met. |
| the-patient-star | 1 (Tamsin, thief) | The same module and origin as Hold One Season. |
| hollins | 1 (Wren, warrior) | "WANTED, A RATCATCHER": one post, for which Pyecroft interviews rival applicants; Sorrel and Fennick are recruited. |
| parliament-of-books | 1 (Wren, bard) | The pitch is "Someone for Calamy"; its builds are played "one protagonist alone each time". |
| skeel | 1 (Tamar, ranger) | "Walked the coast road for a week with a little money and no reason to stop"; the matrix: "the protagonist is one person". |
| the-book-of-faces | 1 (Wren, warrior) | The law hires "a Bare, a stranger who is no one" under the Stranger's Warrant: the premise is one person's legal standing. |
| the-grand-tour | 1 (Tamsin, bard) | A traveller with eighteen coin; the Handbook's bear-leader and the rivals' party are offers inside the story. |
| the-house-that-grows | 1 (Isa Wennu, monk) | Kezu's stare-student (`stareTrained(party)`); the household is Kezu's kin, Hanu at her post and Tobu, who is asked to come. |
| the-liberty-of-the-ice | 1 (Tamsin, bard) | "A face nobody would ever suspect of anything": one con-artist, whom Ursel offers a partnership in play. |
| the-lull | 1 (Wren, warrior) | No companions in pitch or prologue; the Lingering ending is "the protagonist stays (with Linnet, or alone)". |
| the-quiet-in-the-sky | 1 (Wren, warrior) | "The protagonist comes up the pass alive. Theirs is the only breath on the Field that steams"; Ned Noone can go with them in Ysgard. |
| the-third-night | 1 (Joan, ranger) | Wat Pardoe's elder child coming home alone on their mother's letter (`homecomer(party)`, `kin(party, maudie)`); the household is at home, not on the road. |
| what-tessary-owes | 1 (Ivo, thief) | "The protagonist arrives at the Landgate on the notice of a mother", "a little coin and no particular plans". |

The six that begin with three say so in their own pitch ("A company for Merrowdale/Saltgrave/the Corrow/Ammerlin/
Quittance", "Choose three companions", the Dorothea's passage for three) and are unchanged: let-one-remember, low-water,
quittance, the-dorothea, the-long-man, thrume.

## Open

- A one-person module (`Company party "You" of 1`) refuses a larger chosen company ("Choose 1 companions";
  `CompanyChoices.apply`). Declaring them `of 1 to 3`, as the Dorothea is, would let a player bring a company to a lone
  story without changing its shipped start. That is a choice about the creation screen, not the story, and is left to
  the owner.
- The calling-unique beats a lone protagonist cannot reach still want signposted lone-company routes
  (`playtests/shipped-first-hour.md`); a company is not the fix for that.
