# The Imbar Campaign-Scenario Workbook

*For authors of Kyr scenarios. It is a tool for deciding what makes a story belong to Imbar, with enough concrete
material to start from. It is not an encyclopaedia, and it does not ask you to invoke any of it. Companion
documents: `02-history.md` (the working history, with epistemic labels), `01-audit.md` (what the corpus does),
`04-authorability.md` (what the tools can do). Status labels: **[E]** established in the text, **[I]** intended,
**[P]** provisional, **[D]** disputed, **[N]** new on this branch, **[X]** a proposal.*

## 0. How to use it

A scenario is Imbarish when the past **changes what someone wants, believes or can do.** Not when it mentions the
past. The test, which you should apply before writing any scene, is the *causation chain* (§10, four worked examples):

> historical event → surviving material or institution → later interpretation → present conflict or opportunity →
> player-facing situation

If you cannot write the last link as something a person in the scene wants, drop the history. Many good scenarios
(Hessel, a fair, a marriage) have no deep past, and that is a fact about *their place*, not a gap. Imbar is large
enough for places the Age did not touch.

---

## 1. Historical orientation (short; full in `02-history.md`)

| Layer | Status | What it leaves, in one line |
|---|---|---|
| Primordial cosmology (prima materium, Virina, Varakiiri, Kiritarun, planes) | **[E/I]**, **tradition** | A cosmos with barriers; a peace brokered by High Arbiters; calamity-spawn beyond; nine jewels bound to the foundations of the planes. Said by priests, scholars, an Auditor: not directly established. |
| The Mathematical Age | **[E/I]** | Works shaped like questions; a Reckoner counting by water for ~3,000 years; exact joints; marks that are not letters; works still running. |
| The Fall(s) | **[I/D]** | Not one event. Remade ecology and geography; explanations differ by speaker. |
| The long darkness | **[P]** | ~1,500–2,000 years of craft-survivals, taboos, liturgies, local custom; uneven recovery. |
| The Aenean reformation | **[E]**/**[P]** | A Latinate administration that found, fenced and wrote law about working things it did not make. |
| The Aenean disappearance | **[D]** | Four traces: drowned city, writs without issuers, fenced machines, inscriptions read two ways. |
| The present | **[I]** | Successor claims, repudiators, independents, a gathering adversary; restoration is a political question. |

## 2. The evidence: what each age leaves that a person can touch

| Age | Ruins | Roads, works | Institutions | Language | Machines, objects | Ritual, custom | Ecology |
|---|---|---|---|---|---|---|---|
| **Cosmological** | thresholds, doors to planes | the House of Doors | Collegium, Rector | Aenean + Common names for planes | Kiritarun (said), the Door of Doors | Virina's Tally, Arbiters' Way | – |
| **Mathematical** | the Undercroft under Sennet; the Reckoner's hall | culverts, shafts, cages | the Collegium of Lesser Instruments (collects) | marks that are not letters | question-engines; the Reckoner; counting wheels | none yet: it is *not* ritual | salt wells; ebbing meres; fens made by pumps |
| **Hesk (undetermined)** **[E]** | the drowned town under Hollow Water | the Long Man; the culvert; the gauge-shaft | the reeve of the waters **[N]** | the notch-script; Aenean *Hesci* **[N]** | keepers of fired clay, woken by a face | the font as gauge; the rhyme | a lake that is a dam |
| **Darkness** | beehive cells, cells with tallies | withy-ways, leading marks | keepers, reeves, hermit-orders | folk-worn names (*Merrow*) | rods that match no measure | third-ebb sitting; cutting willows; Gauge-days | local fisheries |
| **Aenean** | theatre rings; temples built over things; city drowned | bridges, causeways, fenced culverts | Prefects' writs; custodia; weights-and-measures offices; Collegia | Latin: *custodia, murus, vallis, aqua, pons, via* | tide-engines (kept); pumps (started); plaques | pontage; liberties; sheaf-tithes | Aenean drains, canals |
| **Successor** | keeps, abbeys, tollhouses | the old roads | Registers, Companies, Offices, Concords, Consistories | worn Aenean + Common | bells, ledgers, rods, tally-sticks | Bridge Feast; Ash Day; Michaelmas | commons, tolls |

## 3. Languages and transmission

The engine's languages are real data (`languages` package: `westron`, `quenya`, `khuzdul`, `aenean`). **Aenean is
Latin** (e.g. `aqua`, `via`, `custodia`, `vallis`, `pons`); generated works are named in it and *worn down* by the
folk (`src/world/history/wearing.ts`). Use it as the engine does.

**How the past reaches the present, in ascending reliability:**

| Channel | Distortion | Example |
|---|---|---|
| Place names | folk-wear, false etymology | *Merrow* < *murus*; *the Long Man* < *murus longus* **[N]**; *Wrayford* < ford of Wade |
| Legal formulae | the form outlives the reason | *neque homo neque canis neque felis*: the keeper's columns, kept as "an old law" **[N]**; *custodia* read as holding **[N]** |
| Inscriptions | two readings | "WHO SPEAKS HERE IN THE MASK IS NOT ANSWERED FOR": a curse / a price list (Gosse's) |
| Chronicles and registers | what a clerk chose | Merrow's register has *Hesk* as a surname for 200 years before anyone reads it as a people **[N]** |
| Letters | local, partial | Dame Isolde's weekly letters **[N]**; the Lord's counsel |
| Technical custom | right without reasons | Gammer Coller's rod; the font's notches; the Gauge |
| Scholarship | claims cut from wholes | Halm: "this is Mathematical"; Perrin: "I think they found it" **[N]** |

**Rules of thumb.** (1) An Aenean inscription on a Mathematical work is **a gloss, a claim or a fence**, not a
signature. (2) An older notation under an Aenean one is how you show continuity (Fair Weather's bench, §10 example 2). (3) A pun is
cheaper than an etymology table and survives. (4) Never give a player a complete translation in one go.

## 4. Institutions and power

| Kind | Imbarish shape | Examples in play | What they claim |
|---|---|---|---|
| **Keepings** | an office with a duty and a wage whose reason is lost | the Hall of Merrow (the wall); the Holm Lantern; the Register of Gaunt | continuity |
| **Liberties** | a bank where the writ ends | Overbridge, the Soke, the Ice | custom older than the charter |
| **Collegia** | collectors, teachers, weighers, inspectors | Lesser Instruments (Corran), Veyra (Sennet), Measures (Ombra) | knowledge |
| **Companies/Offices** | corporate bodies that ran out of reasons | the Bridge Company; the Offices of Quittance; the Dorrance Board | succession |
| **Faith-as-maintenance** | a saint who carries; a bell | Wade; Oswy; the Ford | stewardship |
| **Merchant houses and exchanges** | trade without cosmos | the Founders' Exchange **[N]** | nothing: it buys by the pound |
| **Dynasties and successors** | disputed genealogies, writs without issuers | the Lord of Merrow's suit | legitimacy |
| **Criminal/secret** | *use sparingly*: every cult is not a Varakiiri cult | – | – |

**Legitimacy** in Imbar comes from *documents that are partially misread*. The strongest scenes turn on two
institutions each holding half a charter.

## 5. The material world

- **Water first.** The Long Man (a dam), Hollow Water (a lake), the Mere (a falling lake), the Reach (tides),
  Quittance (a river-port), Pellam (a frozen river), Hessel (canals), Wrayford (a ford and a bridge). The Mathematical
  Age and the Aeneans were hydraulic; the present is *a dispute about water* in all its forms.
- **Metal.** Bronze is the Age's visible metal: bell-teeth, Hesk weirstone, green fittings from the plough. It is the
  material that moves goods between adventures (the Exchange **[N]**, the Collegium).
- **Crops and tithes.** A sheaf in forty **[N]**; the Seridane granary jars; the Hive's wax.
- **Trade and tax.** Tolls (*A FOOT-PASSENGER: ONE FARTHING (SINCE THE RIOT)*); the Admiral's third; the watch-tax.
- **Logistics.** Barges (the Heron), carts, tides, drove-roads. A scenario that ignores how bronze gets downriver is
  a scenario that did not ask how the past got here.
- **Technology and magic** are not interchangeable: a spell is a catalog entry (Kyr cannot define one); a
  Mathematical work is a *Kyr state and rule*. Keep the vocabulary of the second out of the first.

## 6. Cosmology and mystery

**Prima materium** — what binds; the Reckoner counts it. **Planes** — real, doors are canonical, the outer planes
carry Orsino's laws; the Grand Tour's courts are regions in them. **Virina** — Arbiters; a Tally; a Way; a gate.
**Varakiiri** — incursion, citadels of steel, glass, void-stuff or living flesh (Low Water's Citadel; Patient Star's
fastness). **Kiritarun** — nine jewels; at least one fell and made the Bowl (Low Water) **[E, in one hostile
voice]**.

Rules: (1) Use at most one in a scenario, and let it disagree with another scenario's version. (2) The
cosmological and the Mathematical are not the same story; their relation is *a discovery*, and so far is made
nowhere. (3) Distinguish who says it: the Auditor, a Cantor's hymn, the Wise, a Parson.

## 7. Dramatic possibilities (a set of premises, in different keys)

| Premise | Genre | Scale |
|---|---|---|
| A bridge penny that is owed to the ferry the bridge replaced; the dead on the bridge are the ferry's **[X]** | tragedy, law | local (Wrayford) |
| A hermit's cell that is a ledger; the one who sits the third ebb | elegy, mystery | local (Skeel **[N]**) |
| A card that says *holds* where the writ says *keeps*; a widow in Chancery | comedy of manners, civic | dale (Merrow **[N]**) |
| A lot of looted bronze, handed up a river, sold to a collector who wishes he hadn't paid | picaresque, procedural | cross-regional (**[N]**) |
| A road between two places that no longer acknowledge each other; a milestone with a number nobody uses | exploration | regional **[X]** |
| A water-right dispute where three parties each hold a true half of a charter | investigation, comedy | local **[X]** |
| A mother whose son's name is on a stone of the Acre as A SAILOR; a keeper who sat the ebb in her mother's day | romance/elegy | intimate **[X]** |
| A family heirloom with an inscription in a language *older* than Aenean | scholarly | household **[X]** |
| A cult that mistakes a working device for revelation; a rival church that has the manual | satire, horror | regional **[X]** |
| A war supplied by one bronze ring's carter | epic through logistics | continental **[X]** |

## 8. Scale and continuity

- **Three scales, one world.** *Hearth* (a house, a dale, a dog), *Region* (a country with a market and a Court),
  *Realm* (a power that spans countries and acts while you are elsewhere). A good scenario is complete at its scale
  and has one *handle* that reaches the next. The Long Man's handle is a sack of bronze.
- **Handles are objects and offices, not flags.** Bronze, a letter, a rod, a writ, a bell. Prefer ones that are
  *in a catalog kind* or a canonical relation; those pass between authors without a new registry.
- **Don't build the supercampaign first.** The Exchange is a trade that happens to carry a thing from a dale to a
  collector. If a war ever needs bronze, the Exchange is already there; it is not made *for* that.
- **A scenario is allowed to be over.** The Long Man ends on its third morning. The world moves on.

## 9. Authoring practice: what is possible now, and what is not

(Full: `04-authorability.md`.)

| You want | Use | Do not |
|---|---|---|
| a place with a past | a `Discovery` with a `Source … readable by party` and a `Found by searching … with lore`, spread over **several people** | give the whole translation in one block |
| a custom with a lost reason | an `Observe` that names the custom; a `Topic` with an NPC whose version is *wrong*; a later `Discovery` that changes it | say what the Age was |
| an institution that acts while you're away | a `Rule` with a clock measure and a place the member goes; make it observable (**a place on a map**) | assert `established(…)` from a rule: refused |
| a Deem-cast organisation | a `goings-on` module with `generation`, a scenario, a herald in `countries.json` | try to put a kit in your adventure: not possible yet |
| a handoff between adventures | custody of a thing of a **catalog kind** (`keeps`, `itemKind`), a **place** the carrier stands in, an optional import | write a flag the other module can read |
| a local item or creature | `Kind … like …`, `Species … like …` | add a catalog row |
| a companion's remark | a recruited `Person … Remarks at …` | rely on the preset party |

### Register of Imbar-defining elements

*Not a mandate. Each row: status; source; its most important consequence; where it is used; what is open.*

| Element | Status | Source / provenance | Consequence worth building on | Existing use | Opportunities |
|---|---|---|---|---|---|
| Prima materium | **[E]** | Orsino lore; ATLAS | souls and bodies are bound; workings are manipulation | Low Water (the Reckoner counts it) | a *local* binding (a village's oath); a scholar who denies it |
| Planes and barriers | **[E]** | `data/imbar` | doors are real and cost | Grand Tour; Parliament; Quiet | a door that is a *custom* (a Gate of the Hours) |
| Virina | **[E]** (tradition) | ATLAS; adventures | "owed upward"; peace as a settlement | Patient Star, LOR, Low Water | a Virina-claim in a boundary dispute |
| Varakiiri | **[E]** (tradition) | ATLAS | incursions; citadels | Low Water, Patient Star | *absent*: a scenario in which they are only a rumour used by a politician |
| Kiritarun | **[E]** (tradition) | ATLAS | nine; bound to the planes | Low Water | a Kiritarun that is an *inherited debt* |
| The Mathematical Age | **[E]** | Low Water | works shaped like questions; unfathomable joins | Low Water, Grand Tour, Tessary | a *botched/abandoned/patented* work; a Fall of lesser works |
| The Fall(s) | **[I]** | VISION | ecology remade | Long Man (a lake that is a dam); Skeel (a salt well) | a contaminated valley and its empirical custom |
| The long darkness | **[P]** | this document | craft-survival, liturgy-as-maintenance | Merrow's font; the Holm's tally | a scenario *in* the darkness (a flashback chapter) |
| The Hesk | **[E]** (name) / **[N]** | Long Man | undetermined builders; reeves; *Hesci* | Long Man, Low Water (Halm: weirstone) | the Hesk plateau (LOR) and Pen Hesk (BoF) are the same word: a clue [X] |
| The Aeneans | **[E]** | many | custodia; law-hand; plaques | Grand Tour, Long Man **[N]**, Skeel **[N]**, Gosse's | a surviving writ that nobody in power has read |
| Aenean as language | **[E]** | `languages` | Latin; worn by folk | everywhere | an inscription in a language *older* than it |
| The Aenean disappearance | **[D]** | corpus | four traces | Tessary (drowned city) | the vanished road [X] |
| The Collegium(s) | **[E]**/**[D]** | LW, GT, BoF | collect/teach/weigh | Halm | one border dispute among three colleges [X] |
| The House of Doors | **[E]** | Grand Tour; `data/imbar` | the opened Door is a world event | Grand Tour | what a *traveller* from the upper House costs a village [X] |
| The Founders' Exchange | **[N]** | this branch | trade in old bronze; the carter's run | Long Man → Low Water | a rival ring; a smuggler's road; a war's supplier [X] |
| Custodia / the sheaf in forty | **[N]** | Long Man | a keeping is not an ownership | Long Man | any tithe in any adventure is a candidate fossil |
| The keeper's tally | **[N]** | Skeel | neither man nor dog nor cat | Skeel | a keeper's tally elsewhere (a lighthouse; a ford; a ferry) |
| Keepers of fired clay | **[E]** | Long Man | woken by a face; stopped by losing it | Long Man, Low Water (mask) | a keeper that wanted to be taken apart |
| Bronze (bell-teeth, weirstone) | **[E]** | catalog | the traded metal | Long Man, Low Water | an Aenean mint using it [X] |
| Liberties | **[E]** | Wrayford, Gosse's, Pellam | the writ ends | three | Aenean? customary? ecclesiastical? differentiate |
| Bridges and tolls | **[E]** | Wrayford | pontage; the dead cross free | Wrayford | see §10 worked example 4 |
| The tide | **[E]** | Skeel | clock as a landscape | Skeel | a Strand in a different country |

## 10. Four worked causation chains

**1. Ordinary life (implemented): the sheaf in forty.** Event: a people (the Hesk) drowned their own low houses to
keep the fields dry and built a wall with a keeper to hold it. → Surviving: the wall; a rod with notches for a measure
no one uses; a font in the chapel whose notches are the flood heights. → Later interpretation: the Aeneans fenced it
and wrote *custodia* (a keeping, not a holding) into a writ; the House that got the writ kept it as a *holding*; the
parish read the wall as a barrow and the font as a king's tally of sins. → Present conflict: the steward is in
debt to the widow of a Lord who is fighting a lawsuit; the "old metal" is the only unused asset on the estate; the
reeve thinks she keeps ditches. → Player-facing situation: *you can read Venn his own card, and Gammer Coller will
take her rod to him.* Nobody needs the lake to understand why a woman of seventy-one stands in a study. (The Long
Man, `charter.kyr`.)

**2. Later discovery changes an earlier encounter (implemented): neither man nor dog nor cat.** Event: the keepers of
the Light on the Holm certified each ship that gave back a living soul, counting men with a flame, dogs and cats
with a paw. → Surviving: a bench in a cell, cut underneath in three notations, the oldest unreadable, the middle in
Aenean numerals, the last in the Holm's own marks. → Later interpretation: the Admiral's grandfather's clerk bought
the wreck-right and kept the words as a charter's whim; the town paints the board weekly. → Present conflict: the
Court is to relieve the keeper it did not appoint. → Player-facing: *the board you saw on your first morning turns
out to be a bench's heading.* (Fair Weather, `keeper.kyr`.)

**3. A scale-crossing chain (implemented): a sack.** Event: the Hesk poured twelve bronze teeth for a wheel that holds
a lake shut. → Surviving: a wheel with twelve empty sockets. → Later interpretation: the steward sells them as "old
metal"; the barge-master buys at eight and sells at twelve; the Exchange's factor buys at nine. → Present conflict: a
dale may drown; a collector in the south wants things that ring. → Player-facing: *you can see, in Low Water, the
lot you did not stop, on a cloth, rung by a man who regrets it.* (Long Man → Exchange → Low Water; `04-authorability.md`
§4.3.)

**4. A proposal (not implemented): the bridge penny.** Event: a ford kept by a saint who carried the drowned was
replaced by a bridge; the ferry-keepers were bought out for a penny a cart, and the bridge's builders conceded that
*the dead cross free, for the ferry always carried them.* → Surviving: the penny paid to the Abbess "since the bridge
was built"; the toll-board's FREE clauses; the Liberty of the ford. → Interpretation: the Bench reads the penny as a
tribute and the FREE clauses as ancient privilege; the Abbess reads both as a debt. → Conflict: three bodies on a
gatehouse rail; the reeve's writ ends at the foot of the bridge. → Player-facing: *whose bodies are they on the third
night?* (The Third Night; would touch `bridge.kyr:24` and `aftermath.kyr:42-47`. I judged an eleven-ending tragedy too
delicate to alter without a cold read.)

## 11. What remains deliberately unknown

Do not close these.

- What the Mathematical Age was for, and whether it was one civilisation.
- Whether the Hesk were its late hands, its survivors, or a people who learned its craft without its premise.
- Why the Aeneans vanished, or whether they did.
- What the Virina decided; whether it was a peace; whom it favoured.
- Whether the Kiritarun are objects or accounts.
- Whether the Mathematical Age and the cosmology are one story.
- Why the Hive swarms and who the Seventh Leaving were.
- What the Fabric did in Gaunt, and where the Bishop went.
- Which war the Lull's elders won.
- What the Brothers of the dead order who wrote the glossary were, and why they died.
- Whether any *other* keeper of fired clay is awake.

## 12. A checklist before you write a historical detail

1. Who in the scene believes something false about it, and what does that make them do?
2. What does it let the player do that they could not do without it?
3. Is there a way for the player to be *wrong* about it and still progress?
4. Does another adventure already say something that conflicts? Which of us is the better liar?
5. If this detail were removed, would a person still want something? If yes, keep the person and cut the detail.
