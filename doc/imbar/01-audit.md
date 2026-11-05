# 1. Comparative audit: literary quality, setting coherence, and what is actually integrated

*Branch `adventure/imbar-deep-time`, from `main` at `fb24f94`. Method: four parallel read-only readers (each took a
group of the adventures' Kyr, design documents, campaign files, tests and transcripts), then my own reading of the
adventures I revised, of `data/imbar`, `doc/design/{ATLAS,VISION}.md`, `doc/architecture/mission-18/one-universe.md`,
the 3 November repertoire survey (`doc/adventures/repertoire-2026-11-03.md`), and the generator code
(`src/world/history/*`, `src/campaign/*`). Line references are to `fb24f94` unless marked.*

The corpus is not what the brief's phrase "existing authored adventures" might suggest. It is 23 modules and one
standing scenario, from 659 lines (*The Long Man*) to 11,863 (*The Book of Faces*), nearly all with a campaign file,
a `placed.json` form that installs them as a country or province of a generated world, and a body of tests. The
3 November survey already did most of the *literary-form* audit. I do not repeat it. This document adds what it did
not do: a ledger of the **historical and linguistic material actually in the Kyr**, the contradictions and
duplications among those claims, and an honest account of which of them exert pressure on what a player can do.

## 1.1 The corpus, by how much history it carries and how it uses it

"Pressure" means a historical fact changes what someone wants, believes, or can do. "Decoration" means it is a good
sentence. Scale is Kyr lines.

| Adventure | Lines | History layer present | Pressure or decoration | Notes |
|---|---:|---|---|---|
| **The Long Man** | 659 | Hesk (builders), notch-script, keepers of fired clay, a drowned town, an iron grate "a thousand years" newer than the arch, a register 200 years deep | **Pressure, strongly**: notches = flood heights is evidence that moves a priest; the rod is a key; the bounty is the wrong reading | Best compact example. Thin on the *middle* (nothing between Hesk and the Hall's steward), and its lord, charter and tithe were absent |
| **Low Water** | 2,917 | Mathematical Age ("question-engines"), Reckoner "three thousand years", Aeneans as copyists/temple-builders, Varakiiri/Kiritarun/Virina in the late acts | Pressure (hymn is code; the Hearing depends on it) but **over-explained** late (Auditor, Citadel) | The one adventure that states a theory of the Mathematical Age ("nobody knows" at `halm.kyr:42`, then explains it at `citadel.kyr:132`) |
| **What Tessary Owes** | 2,365 | Aenean city drowned "eleven hundred years ago" by a broken oath; Oath Stone; Balance; Valuer | **Pressure, strongest**: history *is* the plot | Era "of the Drowning" |
| **The Patient Star** | 2,568 | Unlidding, the Seridane granary formula misread as prayer, Concord, Masonry | Pressure (the Breach has named perpetrators) | Best single piece of concrete history in the set is the misread granary formula (`ennick.kyr:78`) |
| **Let One Remember** | 2,091 | 412 the Lettings, Calvessan evidential grammar, Concord Warden's account book, Registry | Pressure, heavy | Most over-explained module (the Nail is explained three times) |
| **The Grand Tour** | 2,893 | Aeneans as tide-engine engineers; House of Doors "built on top of the Aeneans' own"; Collegium of Veyra | One route (the engine) is pressure; the rest labelled decorative in the text (`history.kyr:3-6`), honestly | Contradicted Low Water on who built the black stone (see §1.4) |
| **Quittance** | 5,928 | The creditor-fire; the Founders' Policy; Assize of Marks; "words older than the room" | Pressure (clause 4, clause 44 decide endings) | No Aeneans, no Mathematical Age; juridical, not archaeological. Good that way |
| **A Parliament of Books** | 3,594 | An empire "nobody remembers the name of" (courier script), Kindling, Colophon | Mostly texture | Literary, not archaeological |
| **The Book of Faces** | 11,863 | Aenean pump set going "after some centuries"; Aenean law-hand; the Concord | Lever (the Siphon, the valve) | Agrees with the Grand Tour, not Low Water, on the black stone |
| **The Third Night** | 2,672 | Saint Wade and the ford; the Michaelmas Burning, 31 years ago; the Liberty of Saint Wade's | Pressure from recent history (the Burning) | **Open**: who built the bridge; why the Liberty is owed a penny |
| **Gosse's Company** | 3,250 | The Wheel stands on an Aenean theatre ring ("WHO SPEAKS HERE IN THE MASK IS NOT ANSWERED FOR"); a riot 40 years ago | Both: the Aenean stone justifies the Soke's liberty; "a curse / a price list" is the best two-line history in the corpus | Left half-read, correctly |
| **Liberty of the Ice** | 2,934 | Book of Frosts: seven frosts in 200 years with causes; the Statute of Servants | Pressure | Wolves-after-frost unexplained, correctly |
| **Hessel** | 2,351 | Ordinary: canals, a snow, a marriage | Decoration (Saint Ebba) | Its lack of deep time is a strength |
| **A Winter in Carth** | 2,221 | The Register of Gaunt, "the year the Bishop went away"; the missing second tower | Pressure (the proxy-penance trade); one very good open seam | |
| **Fair Weather (Skeel)** | 1,688 | Wreck law "older than the Admiral"; the pilot station; a beehive cell with "a fish and a flame" | Pressure (the charter *is* the plot) | **Open**: the cell was never explained, and was the best seed in the batch |
| **Half the Hive** | 1,788 | The 7th Leaving, 81 years dead in the Gallowtree | One reveal | The Leaving's *origin* is unexplained, nearly a virtue |
| **The Lull** | 1,983 | The Long Shift; Rhiannon; "which war nobody now remembers" | Pressure (the origin *is* the plot) | Its best line is a refusal to name the war |
| **The Quiet in the Sky** | 1,765 | "Nine hundred years" of the Daily; Sitters; the Mending Bell inscription | Pressure | Internal chronology 900/700/300 does not reconcile |
| **Behind the Wainscot** | 2,133 | The Whitbread gentry; the Winders and the stopped Clock | Pressure | Family name was Whitbread in 38 lines and Whitlock in 4 (fixed, §1.5) |
| **Thrume** | 1,194 | Titans; Hollow Smiths paid by "the young gods"; the Keepers' song | One mechanic (the song) | D&D-module lineage |
| **The House That Grows** | 843 | Ithren lamps, Undal letters | Decoration; the vote is local pressure | Calendar 3640 |
| **Wapshott's Circus** | ~3,860 (module) | The Royal Progress, a vacant Mastership of the Revels | Mostly comic dressing | A standing scenario, not a province |

## 1.2 Which are substantial and distinctive, which thin, which repeat

**Substantial and distinctive (history as pressure, voice of their own):** The Long Man, What Tessary Owes, Fair
Weather, The Third Night, Gosse's Company, Quittance, The Patient Star, The Lull.

**Thin where it counts for this commission:** *The Long Man* (compact and strong, but it jumps from the Hesk straight
to a steward: no middle ages), *Half the Hive* (a custom without a past), *Hessel* (ordinary on purpose), *Thrume*
and *The House That Grows* (history stays in the sourcebook). Thinness is not a fault; it is where an author may
decide to put *one* thing.

**Repeating (intentionally or not):**
- **The ancient machine under a place** — Low Water's Reckoner, the Grand Tour's tide-engine, The Book of Faces'
  pump, Tessary's Oath Stone, The Long Man's wall. Five is a pattern. They are saved by different tonal treatments of
  deep time (awe / comedy / municipal / juridical / ecological), which should be preserved.
- **The creditor who counts**: Low Water's Auditor and Quittance's Fire say nearly the same thing ("I do not complain.
  I count." / "I have checked it."). Do not tie them together; they are the same *shape* by coincidence of house style.
- **The lawless bank across the water**: the Liberty of Overbridge (Wrayford), the Soke (Gosse's), the Ice (Pellam).
  Three Liberties, same device. Differentiate (customary / ecclesiastical / Aenean); do not add a fourth origin.
- **The tally-stick / notch ledger**: four adventures, one prop. House style, harmless.
- **The honest clerk companion** (the repertoire's recommendation: rest it).

## 1.3 What was and was not in the runtime

All 23 are installed by `data/adventures/countries.json` as countries or provinces of a generated world, have a
campaign file, and have journey tests. The compositional claims worth noting:

- **Items cross modules; almost nothing else does.** *Low Water* already had `halm_mask` and `halm_teeth` events that
  fire when the *company* brings a Hesk keeper's mask or bell-teeth of kind `bell_teeth` to Halm. That is the only
  pre-existing authored→authored consequence through a shared catalog kind (`test/merrow-to-ammerlin.test.ts`).
- **World events** (`befell`) exist only for the Grand Tour's outcomes (`data/imbar/events.kyr`).
- **`stale(word)`** is how a country tells the first region it is over.
- **Companions**: a campaign's preset party (the Long Man's Elen, Bran, Dori) cannot be given authored `Remarks`
  because `Remarks` belongs to a declared `Person`. Only recruited persons (Loveday, Ned in *Quiet*, Sorrel in
  *Hollins*, Ivo in *Half the Hive*) have lines. This is a finding, not a defect of any adventure.

## 1.4 Contradictions found

1. **Who built the black stone** (the central one). *Low Water*: the Mathematical Age built it ("older, this is
   Mathematical", `halm.kyr:36`), the Aeneans were *copyists* who cut a temple over it and sang the hymn without
   understanding it (`undercroft.kyr:230`, `library.kyr:67-84`). *The Grand Tour* and *The Book of Faces*: the Aeneans
   *built* the tide-engine and the pump, in near-identical diction ("square and plain… precision that hurts the
   eye", `whelm.kyr:35`, `cisterns.kyr:168`). Resolution below.
2. **Low Water against itself**: the Aeneans are "before everybody" yet later than the Mathematical Age
   (`halm.kyr:42`).
3. **"Collegium"** in three incompatible forms: Lesser Instruments (Corran, a collector of working things, LW), Veyra
   (a magic-school-and-chapel, GT), Measures (a weights guild, BoF). Dun Rì appears only in one GT comment.
4. **Chronology**. Tessary dates the Aenean city's drowning to "eleven hundred years ago" (`lowtide.kyr:3`) with a
   present of 1144 "of the Drowning"; Low Water's Reckoner is "three thousand years"; The Long Man's grate is "a
   thousand years" newer than the arch; campaign calendars run 612, 1121, 1288, 1290, 1312, 1313, 2731, 3640. No
   adventure states a link between reckonings. (I treat them as local reckonings; see `02-history.md` §2.)
5. **Names**: *Hesk* is the Long Man's drowned builders, a "Hesk plateau"/"Hesk Dene" in Let One Remember, and "Pen
   Hesk" in the Book of Faces. *Concord* names three different bodies. *Whitlock/Whitbread* inside *Hollins*.
   *Carth*: Hessel's Carth House and the Gaunt country called Carth.
6. **Inside *The Quiet in the Sky***: the Daily is "nine hundred years" old; the Sitters "refused it seven hundred
   years ago" while being "from before the halls".

## 1.5 Reconciliations made (and refused)

| Problem | Decision | Where |
|---|---|---|
| Aeneans: builders or inheritors of the black stone | **The Aeneans found, learned to start, fenced, and wrote law about works they did not make.** Low Water's view stands; the Grand Tour and the Book of Faces read as *Aenean-kept* | Grand Tour `whelm.kyr:35` ("The Aeneans called it theirs, and cut their plaque on it") and `undertow.kyr:12` (Perrin: "I don't think they built the engine… the plaque says this wheel turns, not we turned it"); the Book of Faces was already compatible ("set the Aenean pump going, after some centuries" is learning to start it). Low Water untouched |
| Whitlock / Whitbread | One family, Whitbread | `hollins/{cellar,hall,lady,bootscrape}.kyr` |
| The Long Man had no middle ages and its lord's title had no basis | An Aenean writ of keeping; the Hesk named in it (*Hesci*); the reeve of the waters as the dale's auditor of the keeping | `the-long-man/charter.kyr` |
| Fair Weather's cell | A keeper's tally in three notations; the charter's "neither man nor dog nor cat" is the keeper's columns | `skeel/keeper.kyr` |
| **Refused**: tie Quittance's Fire to Low Water's Auditor | Preserve difference | – |
| **Refused**: one Collegium | Three bodies (Lesser Instruments collects, Veyra teaches, Measures weighs) remains the recommendation; not edited, because only a map of the north would make three colleges a feature rather than a smear. Recorded in the workbook | `06-workbook.md` |
| **Refused**: explain Hesk plateau / Pen Hesk / the Long Man's Hesk | A name on three maps is a *clue*, not a continuity error. Recorded as an open thread | `06-workbook.md` |
| **Refused**: reconcile the Quiet's 900/700/300 | Tearing out the first page of the ledger is the adventure's best line; the arithmetic is the mystery | – |

## 1.6 Targets chosen for deep revision, and why

1. **The Long Man** — the only adventure that already has a complete *pre-Aenean* layer and no *Aenean* one, and the
   best-built mechanism (a wall whose failure the player can see coming) for turning inherited institutions into
   decisions. Also the one with the right size for a mid-corpus handoff (it already hands bronze to Low Water).
2. **Fair Weather** — the strongest *ordinary life* adventure (a fishing town, a lamp-keeper, a dog) with exactly one
   unexplained old thing, so a historical addition could be small and could change an interpretation the player has
   already formed.
3. **The Exchange handoff** (not an adventure; a generated institution) — the discovery objective.
4. **Reconciliations** to the Grand Tour and *Hollins* — a few sentences each; no new scenes.

**Considered and not done:** The Third Night's bridge penny (a better ordinary-life candidate than I could responsibly
add to an eleven-ending tragedy in the time; a proposal is in the workbook, §7); Half the Hive's Leaving; Carth's
missing Bishop and tower (the cheapest open seam in the corpus; should be done by someone who has read the whole
satire); Quiet's chronology. I did not touch Thrume, the House That Grows, or the Patient Star.
