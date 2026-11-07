# Skeel (Fair Weather): ledger for the broad pass

Register: a coast town's moral comedy, going grave at the Wreck Court. Revised against `doc/imbar/14-bible.md`. Data only;
no `src/`, no shared files. This adventure had a keeper's bench, a lore file and a design set (`doc/adventures/fair-weather/`)
but no ledger file in `doc/imbar/adventures/`; this is that ledger, and the third pass (the ranger's reading of the Pulpit,
the ranger's ear, three papers from elsewhere) is recorded here. A setup that a test asserts rather than plays is labelled
**asserted**.

Files written this pass: `data/adventures/skeel/tracks.kyr` (added to `module.json` and `placed.json`),
`test/skeel-company.test.ts`, `test/five-links.test.ts` (shared), additions to `lore.kyr`, and one edit in `kerensa.kyr`
(the text of `hender_did`, below).

## The Account

| | |
|---|---|
| **Count** | The keeper's bench in the Holm's cell: a long stroke for every ship, a short one under it for every soul the sea gave back living (a flame cut in), a paw for a dog or cat, a ring for the dead; three hands, the last stopping forty years ago. *Neither man nor dog nor cat* in the charter is what the keepers counted. |
| **Keeper** | Loveday Kitto, who keeps the Lantern and is going blind; Parson Hosken, who has read the bench as a hermit's for twenty years. Hender Brask keeps the charter board. |
| **First page** | The cell's oldest notation, which nobody reads. |
| **Price of reading** | The charter *is* the plot: the Court decides by the Reeve's own words, and a ship with a living thing ashore of her is no wreck. The keeper's tally read to the Court has the Court decline to relieve a keeper it did not appoint (`skeel-keeper.test.ts`). |

## Acts and scenes

Four `Chapter`s in `endings.kyr`:

1. **Fair Weather** (day one): the coast road, Skeel Head and the huer's hut (Old Pender), Fore Street, the Admiral's taproom (Mother Jago), the church (Parson Hosken), the ropewalk (Bartle Tonkin), the quay and the Wreck-House (Jack Cawse, Hender Brask), the Slip (Cuddy Pascoe).
2. **Living Things** (day two): the Strand and the black dog, the Craigs (Ebrel and Piran Penhallow) and the Pulpit, the Holm and the Lantern (Loveday), Seal Skerry (Ewan Marrock, Nye Gallow), Inish Gall (Malachy Sennen), the loft (Kerensa Brask), the Gannet Supper.
3. **The Wreck Court** (day three, four o'clock): three matters in the net-loft: the call, the Lantern, the winter.
4. **The Third Ebb**: the Reach gives back the drowned; the packet sails.

## Before and after

| Checklist | Before | After |
|---|---|---|
| 1 Acts/scenes | As above | Unchanged |
| 2 Characterization | **Hender Brask**: *wants* Skeel fed; *fears* Loveday knowing; *lies* "it is nobody's fault; Loveday fell asleep; the Constancy had no dog" (`hender_wreck`, `hender_dog`); *surprise*: told to row out and tell Loveday himself he flinches and does not say no (`send_to_her`, played: "The Godson, sent"). **Loveday Kitto**: *wants* the Lantern kept; *fears* the town learning she cannot see it; *lies* "I'll keep it till I can't"; *surprise*: given spectacles, the first thing she sees is the sea in her oil (played: "Loveday's eyes"); she asks Hender, "Did you put the sea in my oil", and he says yes (`loveday_asks`). **Kerensa Brask**: *wants* to leave on the packet; *fears* what she saw her father do; *surprise*: she stands up in the loft, or walks (`ask_kerensa_loft`, played: "Kerensa, asked in the loft"). | Unchanged; all three were already shown in play. |
| 3 Companion arc | A company of one. Followers: the dog Admiral, Piran, Loveday, Kerensa, Nye, Constance. No calling-keyed voice and no calling-only way | **Voices:** four, for a ranger, at the Strand, the Holm's shore, the Craigs camp and the seals' haul-out (`heardSand`, `heardHolmShore`, `heardGannets`, `heardHaulout`; played in `skeel-company.test.ts`). **Unique solution:** the ranger reads the clay in the lee of the Pulpit and finds the Reeve (below). **Consequential companion choice:** Piran: take him up the Pulpit, promise him an account, tell his mother or leave him; left alone he climbs on the second night and falls (played: `skeel.test.ts`, "the Craigs" and "left alone, Piran climbs"). Unchanged, but it is the choice. |
| 4 Danger with two exits | The Cawse lads hunting the dog (warn, pay, fight); the Pulpit edge (a wind hazard); Ewan Marrock (persuade, the dog, force) | Unchanged |
| 5 Depth | The seals sing at evening on the haul-out; the keeper's bench; Cuddy's soft sand | The ranger's ear (four voices) is off the path; **Gannet Supper** is a convivial scene (see 7) |
| 6 Links | `lore.kyr`: Loveday reads the Prefect's table rubbing; the Lantern's night log reads `remainder_kept`; the taproom hears of the Slack; Jago's letter for the Tolleth packet; Cattermole | **New, all played in `five-links.test.ts`:** Parson Hosken reads the Mower's grey mask (Long Man), Bartle Tonkin the Collegium's letter (Low Water), Mother Jago the Ninth Valuer's note on a surety (Tessary). Skeel gives `tally_rubbing`, read by Ysolt (Long Man), **new:** Halm (Low Water) and the Ninth Valuer (Tessary). |
| 7 Contrast | A grave Court | The Gannet Supper on the Craigs (Ebrel, the crew, a song) and the Cawse lads with a herring net on a dog that does not want to be netted (existing, played) |
| 9 Playability | n/a | `skeel-company.test.ts` (5) |

### The ranger's reading

`read_pulpit_ground` (Pulpit, ranger only, once the new hook has been seen: `hook_found`): the clay in the lee of the back wall
keeps one left-boot print, iron-heeled, the third heel-nail missing, a tall man who stood a long time and then ran
(`boot_prints`). In the Reeve's parlour by the stove stand his boots with that heel (`boots_by_the_stove`, `boots_match`). With
the hook and the print and the boot, `put_together_boots` teaches `hender_did`, which opens the Reeve's three answers
(`confront_hender`: the purse, "row out and tell Loveday", or the Court), **without the boy on the Skerry and without the dog**.
The older route (the boy's account, `nye_saw`, joined to the Reeve's oil or Kerensa's night) is unchanged.

To make room for it the Discovery text of `hender_did` no longer carries the boy's half ("and saw a boy alive on a hatch, and
turned his back"); that half is said by the older rule's own text. No test reads either string.

**Played** (`skeel-company.test.ts`): the shipped campaign, Tamar alone, no give/put/assert: round the cliff road to the camp,
the Pulpit by the edge ("risk the wind along the edge"), look at the iron in the wall, read the clay, back, the Reeve's
parlour, the Wreck-House, the confrontation, "row out and tell Loveday himself". Nye and the dog are not known. A company of a
thief at the same Pulpit sees the hook and is not offered the reading. Walking to the parlour without the reading shows no
boots.

**Lone-company route.** The shipped company *is* a lone ranger, so the reading is the shipped route. The edge scramble needs
no climbing; it has the wind hazard (the test passes it, hit points not asserted).

## Links, in and out

- **Out (world event):** `remainder_kept` in the lamp-room, `slack_opened` in the taproom (played in `lore-links.test.ts`).
- **Out (item):** `pharos_rubbing` (Loveday, `lore-links.test.ts`); **new:** `keeper_mask`, `collegium_letter`,
  `surety_terms` (see above).
- **Gives:** `tally_rubbing` (Hosken), `map` (Jago's letter, played in `lore-links.test.ts` in a generated world).
- **Inward hook:** Cattermole's Michaelmas visit and the Parson's wax stub; a company with a keeper's rubbing is read by Ysolt
  and Halm.
- **Fish and flame:** on the lamp-stand foot and in the cell (the corpus's five, per 15-lore-ledger); not touched.

## Tests

`skeel.test.ts` (14), `skeel-keeper.test.ts` (1), `skeel-placed.test.ts` (2), `skeel-company.test.ts` (5, new),
`five-links.test.ts` (3 of its 10 cases are Skeel's), `lore-links.test.ts`. Lint: 0 errors, 0 warnings (seven advice items,
none new).

## Honest shortfalls

- The ranger's reading is a way to the Reeve, not to the Court's *call*: a ship with no living thing ashore is still wreck. The
  dog or the boy is still needed to make her no wreck.
- The convicted Reeve's end is unchanged: nothing here makes the Court kinder to a company that found him by his boot.
- The ranger voices are heard only by a ranger; no other voice exists in this adventure.
- Piran's arc is old; I only found it to be the companion choice and did not add a second.
- The `lore_jagoLetter`, `chestBought` and similar write-only relations stand as before.
