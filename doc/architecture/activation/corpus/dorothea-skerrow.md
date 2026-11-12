# The Dorothea and the Light on Scarth Holm

*Branch `adventure/p4-dorothea`. Read: all of `the-dorothea/skerrow.kyr`, `isle.kyr`, `holm.kyr`, `night.kyr`, `lamp.kyr`, `return.kyr`, `placed.*`; all of `skerrow/` (places, folk, caller, wake, lore, placed). The rest of the Dorothea was scanned.*

## Was the assessment right?

The assessment (section 5.1) said: consolidate; Skerrow is the Dorothea's destination; two rumours point at one place; the Dorothea has no ending. Checked against the files:

- **Wrong about the place.** The standalone module is called `skerrow` only by its folder. Its country is Scarth Holm: a mainland coast, a road, a village you can see, a causeway of numbered posts a mile long that dries from eleven to two, one keeper, six strangers. The Dorothea's Skerrow is an island three days' sail out past the Combs, with a hamlet of forty-one souls, a jetty, sheep, a hill and a tower. They cannot be one rock without rewriting one of them (the road, the village, the sail, the forty-one). They are not.
- **Wrong about the closest twin.** The Dorothea's nearest relation to Scarth Holm is not Skerrow but Wrack Holm at Port Ness (`holm.kyr`): a holm, a drowned causeway, a widow, a stump of an older lamp. It is left as it is.
- **Right about the kinship.** Both are a lamp "older than the roads" over water that keeps the tide; both are about keepers; the Pharos is the chimney of an engine that counts whoever is below (the Governor, the OWED and KEPT on the gallery wall), and the Scarth cistern is a tank that rises and falls with the tide and says the names of people nobody has closed the count on. The Pharos oil "smells of nothing" and the Scarth lamp burns longer than the Board's oil should.
- **Right that the Dorothea had no ending**, and that it needed one. Not right that Skerrow's nine were the model: the Dorothea is a voyage that repeats (five calls, turn-round), so only the Skerrow call ends it.

## What I decided

**Scarth Holm is not the rock off the Dorothea's island. It is the other end of the same works.** The Pharos is the chimney; the Scarth light is where an uncounted name comes ashore. A player who has done one will find the other the same *kind* of place from the far side: the same oil, the same device on the keystone and on the rail, keepers who write each other one word at Michaelmas.

Tone. The Pharos is proud and domestic (a sister, a brother, a ledger, a lamp that is for whoever is out there tonight); Scarth is hushed and procedural (boots by the range, say nothing if anyone calls). The cross-links keep each in its own register: Seddon speaks short and without adjectives; Marren, Quillon, Tarn and Jago each answer in their own trade.

## What was linked

| Direction | How | Where |
|---|---|---|
| Both | Three new world events: `pharos_lit`, `pharos_dark`, `pharos_fed`, asserted once as the ketch leaves Skerrow. `scarth_kept` and `scarth_lost` already existed and are now read by the Dorothea | `data/imbar/events.kyr`, `module.json`; `the-dorothea/scarth.kyr` |
| Scarth reads the Pharos | Seddon's three topics (told what became of the lamp; one-word letters); a notched rail on the gallery that differs in each case; a slow tick under the hum of the glass when the engine was fed | `skerrow/lore.kyr` |
| The Pharos reads Scarth | Marren Kestle (two topics, kept or lost), Quillon (not on his ledger), Tarn (the end of the pipe) | `the-dorothea/scarth.kyr` |
| Rumour, no event needed | Jago Pendry says where the mate's oil goes (a flat with a white tower); Seddon says the oil comes from a Tolleth cutter; Corrie sells line to a ketch that sails to a rock with a lamp | both |
| Country news | Tolleth's `after` gains two ways (`dark`, `fed`), words `word_dark`, `word_fed` in `the-dorothea/placed.kyr`; Tolleth and Scarth each mention the other once | `countries.json` |

The one persistent consequence that crosses is **what became of the Pharos lamp**: lit, dark, or fed. The Scarth light shows it (rail, tick, Seddon). I did not touch the `rumour` strings in `countries.json`, because those are told in the first town and the first hour is M20's.

No mechanic was added: the Scarth lamp does not burn longer because the Pharos was fed. It is said, not done.

## The Dorothea's endings

`the-dorothea/endings.kyr`, nine, all keyed on facts the voyage already produced, and all on the Skerrow call alone (`safeHome(hull)` with `bound(hull) == 1`): The Green Light (pilot fed), A Light With No Tower (fed, bronze sold), The Second Gun (brake thrown, the Reach paid), A Dark Hour (brake thrown, unfed), The Net on the Table (bronze sold, the boy lost), Sixty Down (bronze sold, the boy brought in), Tell Them It Was Kept (lamp kept, the lens given), What the Lamp Is For (lamp kept), The Tower on the Hill (came and went, asked nothing). The other calls end nothing and she is turned round as before.

## Prose

Only where weak: two lines in Hester Gull and Quillon's speeches (a muddled sentence about ships that see the lamp; two quotations run together). No other prose in the Dorothea was changed.

## Not done

Wrack Holm and Scarth Holm are the real structural twins; a later author might make them the second pair. The Dorothea's one-shot topics are untouched (see `deem-proposals.md`). No Kyr/Deem request was needed: R100 to R104 are unused.
