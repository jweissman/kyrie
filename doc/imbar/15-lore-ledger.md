# 15. Lore ledger: the whole corpus, one table, and what the sweep changed

*Built by grepping `data/adventures/*` (not from the per-adventure ledgers). Data only; no `src/` change. `the-dorothea`
was not edited (another author owns it) and is described from its text. "Name-only" means a place, person or custom is
mentioned; "item" means a catalog kind is held or given; "event" means a `befell(...)` read. Mechanically exercised
links are marked in section 3 with the test that plays them.*

## 1. The twenty-three adventures

Calendar = `calendar.year` in `data/campaigns/*.campaign.json` (a local reckoning: never converted).
Collegium = which of the three colleges the text speaks of and with what verb. Fish = a fish with a flame over it.
E11 = eleven strokes/notches/bells and a blank. Light = a kept light.

| Adventure | Count | Keeper | First page (missing) | Price of reading | Calendar | Collegium verb | Fish | E11 | Light |
|---|---|---|---|---|---|---|---|---|---|
| The Long Man | the notches in the keeper's niche (41, the Hesk meant to come back) | the Mower; Aldous Venn for the Hall; Mother Ysolt for the chapel | the Hesk charter: gave the low houses to the water | the Mower's grey face is a standing; destroying it has a cost far off | 1312 | none | | niche notches | |
| Thrume | a wage: 108 smiths, seven bars a day | the Rememberer, the Gauge, the dead Paid | the contract on the pay-roll | a fight moves the needle toward waking | 1312 | none | | gauge: 11 hours, 12th blank | |
| The House That Grows | the Seventh's age in rooms | Cobble Ring's watchers, the chair, Sabe Orrel | why a girl dreams a house | whoever reads the Reckoning takes the blank | 3640 | none | **removed** (was a sixth) | the Reckoning, 11 and a blank | Sabe's lamp for Wenn |
| Let One Remember | who is held in mind | the Keld, the Registry, the Counterweights | what the Lettings let go in 412 | whoever says a name is said back | 2731 | Lesser Instruments (Corran) collects | | bucket, Finder's bell | niche lamp at Keld |
| The Patient Star | the held, by seasons | the Holdfolk of Ennick | the twelfth word | held man gets a day of a world forty years on | 380 | Veyra (schoolmaster); Lesser collects | | kept season | |
| Low Water | the Reckoner's nine wheels | Office of Measures, the Auditor | the hymn's meaning | the account closed is handed back | 1312 | Lesser Instruments (Halm); Measures "at Sennet" | | | |
| What Tessary Owes | the Long Muster's oaths, the Balance | the Ninth Valuer, the Scruples | the oath of Hethra | the note is called | 1144 | none | | | |
| Wrayford (The Third Night) | the dead on the rail; the Burning; the bridge-penny | the Bridge Company; Corbin the sexton | why a grave faces the water | three carters hang | 612 | none | | | Corbin's lamp |
| Calamy (Parliament of Books) | eleven stages and a twelfth never cut | the Undelivered | the Colophon is a relay | the tide | 1312 | none | | post.kyr | |
| Gosse's Company | the Office's notches | Abel Tunstall | the plate for the lamplighter's fall | a death the first joke cost | 1313 | none | | | lamplighter's lamp |
| Liberty of the Ice | the Book of Frosts | Gaffer Tredgold; Harker keeps his own | what the river did with what was shaken on it | a Reeve hanged | 1288 | Measures weighs, Veyra teaches | scale pivot | | the lantern at Davy's office |
| Hessel | the Season's dead, on a slate | the pumper, Mr Twiss, Mrs Scrope | why the music stops at eleven | the twelfth bar | 1121 | Lesser Instruments bought the pumps | | slate | |
| Winter in Carth | the Register of Gaunt | the Lady Penitentiary | the Bishop's keys, to keep and not to have | keeping turned to owing | 1121 | Veyra named | the first leaf | | |
| Skeel (Fair Weather) | the keeper's bench tally | Parson Hosken; Loveday Kitto | the cell's oldest notation | the charter *is* the plot | 1312 | none | lamp-stand, cell | Constance | Holm Lantern |
| Half the Hive | the Leavings (six remembered) | the Cappers | the seventh Leaving | Hannet stops dancing | 1312 | Measures named once | | | |
| The Lull | the sennight on the Fold-stone | the Fold-stone, the Old Shift | the war that wanted cloth | what is done unmeant comes apart | 1312 | none | | | |
| The Quiet in the Sky | the Daily | the halls, the Sitters, the bell | the Quarrel over who moves first | a man stays dead | 1312 | none | | notches over Jory's door | |
| Hollins (Behind the Wainscot) | days the Clock stood at ten past four | the Winders | a girl's twelfth notch | the Day ends | 1312 | none | | notches at the Clock's foot | the chart's lamp |
| Quittance | the Founders' Policy | the Fire; the Offices | clause 3, the Return | the Receipt fades | 1314 | Measures weighs | | stair notches (Hesk script) | the cold lamp |
| The Book of Faces | the Standard Pound | Measures: the Bursar | THIS IS NOT A WEIGHT. IT IS KEPT. | standard that was kept becomes owed | 1290 | Measures weighs; Veyra teaches; Lesser collects | | lintel XI | |
| The Grand Tour | the Roll; the Rose's four petals | the Rector (Veyra) | what is under the black square | the Door opened below | 1290 | Veyra keeps the House; Measures Fellows sit at the square | bracket on the mast | square: 11 and a space | the Remainder's ring |
| The Dorothea (not edited) | sailings; the Pharos lamp | the Gull's kin; the Kestles | the receipt of Lucanus | the lamp sold | 1312 | Measures (Odile Quint) | keystone, receipt, lamp | receipt strokes | the Pharos |

## 2. Link matrix, found by grep

### 2.1 Name-only (count of mentions outside the home adventure; `*` home)

| Term | Where |
|---|---|
| Sennet | Hessel 1, LOR 1, Liberty 5, Low Water 1, Dorothea 2, Grand Tour* 78, Carth 2, Wrayford 1 |
| Skerrow / Pharos | Dorothea*, Grand Tour 1 / 2 |
| Orsett | Dorothea*, Thrume 2 |
| Corran | BoF 4, Hessel 2, House 1, LOR 2, Low Water 12, Patient Star 2 |
| Founders' Exchange | House 1, Low Water 4, Dorothea 4, Long Man 1, Thrume 2 |
| Holm Lantern | Skeel*, Dorothea 1 |
| Collegium of Measures | BoF 12, Hive 1, Liberty 2, Low Water 1, Parl 1, Quittance 1, Dorothea 4, Grand Tour 3 |
| Lesser Instruments | BoF 2, Hessel 1, House 1, LOR 1, Low Water 8, Patient Star 1, Grand Tour 1 |
| Veyra | BoF 1, Liberty 2, Patient Star 1, Grand Tour 11, Carth 4 |
| Ysolt | Long Man*, Grand Tour 1, Thrume 1 |
| Lammas | Low Water 8, Parl 4, Dorothea 1, Long Man 3, Lull 6, Carth 1 |
| Quillon / Mab Hallam | Dorothea*, Parl 9, Tessary 4 (Hallam) |
| Odile Quint | Dorothea*, Grand Tour 1 |
| Tobias Kell | Thrume*, Carth 6 |
| Haskett | Lull*, Hive 1, Tessary 3 |
| Merrowdale | Long Man*, Low Water 2 |
| Remainder | Grand Tour* 24 (a ship), Low Water 69 (the Reckoner's ninth column), Parl 19, Gosse 1 |
| Penhallow | Skeel*, BoF 42 |
| Sabe / Orrel | House* (Sabe Orrel), Grand Tour (Orrel Sabe), Patient Star, LOR |
| Hesk | BoF 11, LOR 7, Low Water 2, Parl 2, Quittance 5, Long Man 7, Tessary 1 |
| Concord | BoF 114, Gosse 20, LOR 20, Parl 39, Patient Star 12 |

### 2.2 Catalog item kinds that cross

| Kind | Given by | Read / reacted to by |
|---|---|---|
| `bell_teeth` | Long Man | Low Water (Halm; Exchange) |
| `sluice_rod`, `keeper_mask`, `prefects_writ` | Long Man | Grand Tour (square, Quartermaster, Remainder); **new:** Hive (Brenna reads the mask), Low Water and Tessary (writ) |
| `tally_rubbing` | Skeel (Hosken) | BoF (tallyman), Grand Tour (square); **new:** Long Man (Ysolt), Hessel (pumper), Quiet (Jory) |
| `pharos_rubbing`, `pharos_lens`, `watch_tally` | Dorothea / Grand Tour | Grand Tour, Quittance (Fire), Dorothea (Kestle); **new:** Skeel (Loveday: rubbing), Patient Star (Lenna: lens) |
| `collegium_letter` | Low Water (Halm) | BoF (Bursar), Grand Tour (Remainder); **new:** LOR (Finder) |
| `surety_terms` | Tessary (Valuer) | Grand Tour |
| `old_glossary` | Low Water, Dorothea (follower) | Parl (post); **new:** Lull (Aldith) |
| `lamplighter_seal` | Gosse's (Abel's seal) | **new:** Wrayford (Corbin) |
| `exchange_ledger`, `map` | **new:** Tessary (Sault), Skeel (Jago): entry points | carried to the Tolleth quay (Dorothea) |

### 2.3 World-event reads (`befell(...)`), after the sweep

| Reader | Events read |
|---|---|
| Wrayford | slack_opened |
| Hessel | slack_opened, remainder_harboured |
| Thrume | slack_opened, cloudgate_fell |
| Liberty | slack_opened |
| Quittance | slack_opened (twice), **remainder_harboured, remainder_kept** |
| Parl | slack_opened |
| Gosse | remainder_harboured |
| BoF, Hollins | rose_made_whole |
| Carth | rector_taken |
| **Skeel** (new) | remainder_kept, slack_opened |
| **Low Water** (new) | slack_opened (Observe and Halm's topic) |
| **Tessary** (new) | remainder_harboured |
| **Long Man** (new) | slack_opened, remainder_harboured |
| **Lull** (new) | remainder_kept |
| **Half the Hive** (new) | remainder_harboured |
| **Quiet** (new) | cloudgate_fell |
| **Patient Star** (new) | cloudgate_fell |
| **Let One Remember** (new) | perrin_lives |
| **Grand Tour** (own events, read from its Hall) | remainder_harboured, remainder_kept |
| Dorothea, House That Grows | none (Dorothea not edited; the House is a dream) |

## 3. What the sweep added, and how it is exercised

All in a new `lore.kyr` per adventure (Quittance: `links.kyr`), listed in `module.json` and `placed.json`; `canon` extended.
`test/lore-links.test.ts` plays 23 cases in the standalone campaigns (fires with the event or item, silent without);
`test/lore-links-world.test.ts` hands two letters over in one generated world.

| Kind | Items | Played in |
|---|---|---|
| World-event reads | Skeel, Long Man, Low Water, Lull, Hive, Quiet (six, fired and silent) ; Tessary, Patient Star, LOR, Quittance, Grand Tour (written, **linted only**) | lore-links |
| Item hooks (visitor from elsewhere) | Loveday/pharos_rubbing, Ysolt/tally_rubbing, Aldith/old_glossary, Jory/tally_rubbing, Halm/prefects_writ, Valuer/prefects_writ (six, offered only when held) ; Hessel pumper, Hive Brenna, Patient Star Lenna, LOR Finder, Wrayford Corbin (**linted only**) | lore-links |
| Itinerants | **Jessamy Cattermole**, almanack woman (Skeel, Low Water, Long Man, Hessel, Wrayford: a ring, each place naming the next); **Orlando Pym**, surveyor of the Collegium of Measures (Tessary, Lull, Quiet: a line north). Each is *talk* in the place; no Person is declared. Each talk asserts a `knows` Discovery | lore-links (8 talks) |
| Entry points toward Tolleth | see 3.1 | lore-links, lore-links-world |
| Name echoes | Sabe/Orrel (House and Grand Tour agree it is a post held by an Orrel); the ship Remainder named for the Reckoner's ninth column (Tamsin) | not tested |

### 3.1 Entry points toward Tolleth (Captain Bascom, the Dorothea, the Orsett factors, the quay board)

| Where | Who | What | Hand-off |
|---|---|---|---|
| Skeel | Mother Jago | a letter for her man, cook on the Tolleth packet | `Give` an item of kind `map`; **tested in a generated world** |
| Tessary | Factor Sault | a sealed packet for Bascom; the Orsett factors have her money | `Give` an item of kind `exchange_ledger`; **tested in a generated world** |
| Hessel | Mrs Scrope | raiders on the Orsett shore; the packet is a week late | talk only (a `knows` Discovery) |
| Wrayford | Pell | the same, from the coast carters; the quay board's chalk | talk only |
| Low Water | the Office of Measures | a printed notice: the Collegium of Measures at Sennet calls surveyors to the Pharos, passage from Tolleth, apply to Odile Quint | Observe, no item |

Nothing sets a flag for the Dorothea to read by name; the hand-off is an ordinary item the company carries to the quay.

## 4. Contradictions and collisions found, and what was done

| # | Finding | Ruling / action |
|---|---|---|
| 1 | Aeneans as builders: the Grand Tour's ending said "an Aenean wheel"; Book of Faces' cistern comment said the Aeneans *built* the pump; Tamsin (Grand Tour) says "they built the stair", and Perrin says the House was built on the Aeneans' | Perrin and Tamsin are characters and stay as claims (Perrin corrects himself in the same breath: "I think they found it, and learned to start it"). **Fixed:** ending now "a wheel the Aeneans found"; cistern comment and scene now say found, started, plaque cut in afterward. Low Water already agreed |
| 2 | Three Collegia: Measures weighs (BoF, Liberty, Quittance), Veyra teaches, Lesser Instruments collects; but Measures is "at Sennet" in four adventures and BoF has a Measures Hall in Ombra | **Fixed:** the Bursar now says the Collegium of Measures' mother-house is at Sennet and this is its Hall. Hessel's "Lesser Instruments bought the pumps" is allowed (collects working things) |
| 3 | Concord named four bodies: LOR "Concord engineers", "the Concord's record"; Patient Star a council that "sanctions a descent"; BoF a ruling regime; Gosse's a fountain and pageant | **Fixed:** LOR's engineers are the Concord Warden's; Patient Star's is "the chorus of the seats". BoF is the treaty and its warrant; Gosse's fountain stays an allegory of the town's own concord |
| 4 | Hesk: the Long Man's register has a Hesk *family* (reeves); BoF has a Pen Hesk; LOR Hesk Dene and the Hallows of Hesk; Quittance a script "that Ianthe Corbett calls Hesk" | Consistent with 14.3 (a people, a script and the places they walked); left unexplained |
| 5 | Calendars: 1312 is shared by ten adventures; 1121 by Hessel and Carth; 1290 by BoF and the Grand Tour; the Grand Tour's events (1290) are read as fresh news in 1312, 1313 and 1121 | Not converted. Characters disagree on the year aloud: Cattermole's almanacks (Pell lists 1312, 1290, 1121, 612), Pask's "a hundred and seventy years later than hers" |
| 6 | The fish and flame appeared in six adventures (Skeel x2, Liberty, Carth, House That Grows, Dorothea, Grand Tour); the bible says at most five | **Fixed:** House That Grows' lamp now carries the name WENN. Five remain: Skeel, Liberty, Carth, Dorothea, Grand Tour |
| 7 | Eleven-and-a-blank appears in seventeen adventures | Not trimmed (each is a different object); flagged as the corpus's most worn motif |
| 8 | Sabe Orrel (House) and Orrel Sabe (Grand Tour), two lamp-keepers with the same two names reversed | **Fixed as an echo:** each says Sabe is the post and Orrel the name of its holders; each has heard of the other |
| 9 | "Remainder": the Grand Tour's ship, Low Water's ninth wheel, Parl's mentions | Linked: Tamsin says the ship is named for the leftover column of a count |
| 10 | Repeated lines across adventures (exact sentences of 60+ characters in any prose string) | Only hazard templates (`Deal (2d6) physical damage ... save against (13)`, in up to six adventures: engine text, not prose) and one deliberate echo, "A keeper wakes when it is given its face, and stops when it loses it" (Long Man, Grand Tour: the mask). Near-repeats (eleven strokes, the fish and flame, "owed/kept") are motifs, listed above |
| 11 | Quiet's 900/700/300 | Left, per 14.3 |

Not fixed: the Dorothea (not ours) states in `device_known` that the fish and flame is on the Holm Lantern too, and the
Grand Tour's bracket repeats it: two adventures explain where the device is found. Neither says what it means.
