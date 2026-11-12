# The starting region: diagnosis, treatment, and what is built

*11 November 2026. Phase One of the commission (adventure-writing and characterization), written against the world as the repository actually generates it. **Implemented** = in Kyr/Deem/data on this branch, compiled in every audited seed, and walked through the page's own choices by a spec. **Designed** = described here, not written. The two are never mixed in a heading.*

## 0. The world as it is (what "the starting town" is)

There is no single authored starting town. A new life begins in a **generated country** drawn from a seed (the reference is `kahitude`: Fernholt, a forest country of five settlements led by Thornhaven). Its first town carries, besides generated people and jobs, a few *authored* things: `data/generation/town/undertown.kyrt` (the corn-store, the first town's undertown and its jobs), `errands.kyrt`, `teachers.kyrt`, and (since 10 November) `outskirts.kyrt`, the Hall and the old stones. Its country holds a **drawn set of scenarios** (`data/scenarios`: den, brood-hollow, unquiet-tower, drover, fever, oldcoin, quarrel, disputation; the standing circus; the factors and the players as heralds), a **history** (first makers drawn by terrain, a successor kingdom, their works as Kyr from `data/generation/works/*.kyrt`), and, beyond its marches, 21 authored adventures installed as provinces (`data/adventures/countries.json`).

So "extend the adventure corpus" has three levers: **the first town's own authored places** (the Hall and the stones), **the works** (what the country's past left in the ground), and **the scenarios** that tie people to places. This branch pulls all three and adds a fourth the corpus lacked: **the Empire** — present in every country as a road, a stage, and a grant, and absent as a cause.

## 1. Editorial diagnosis (concise)

*Already promising.* The generated first hour is textured (a bear asleep on a wagon, a herd-girl with a rumour, a hobs' toll-house, a cart in a ditch). The works are real places with real doors. The authored adventures are the corpus's best writing (Quittance, Gosse's Company, the Grand Tour). The Aenean idea is mostly *right* in the repository's own history ledger: an administrative language, a law, a road, a failed explanation.

*Incomplete.*
- **Nothing in a first country is Aenean.** The makers of a generated country are drawn from five *pre-imperial* arts (water, deep, sky, bone, stone) and the successor kingdom from three (warlords, abbots, merchant-princes). The Empire — the single most important historical fact in the setting, "a civilization that governed actual people" — appears only inside authored provinces. A player who never leaves the first country never meets it.
- **Works are good rooms with no one in them who is not a monster.** Thirteen plans; most hold one person-group (a smuggler band, a hermit, rats). The *hooks* — a topic with the nearest innkeeper — are the whole social life.
- **The first town's two "places to look at" were thin.** The Hall: five rooms, one steward, one hidden theft trap. The stones: five rooms, one optional wisp-fight. Neither had anything *below* it, nor anyone but the steward.
- **No recurring people with lives.** The first town's generated townsfolk are well-drawn but *interchangeable by design*; the circus (Gosse's company) is the only standing cast.
- **A verbal tic.** "Nobody has [verb]ed … in living memory" ends 154 files, 258 times, mostly in the objective line each work plan writes. Real prose, repeated until it is wallpaper. (This branch's new rooms avoid it; the older plans are an editorial task listed under "retire/rewrite" below.)

*Where connections would add dramatic value.* The **oldcoin** scenario (a scholar pays in old coin and wants to read the old places) is an Aenean seed with no Aenean place to land on. The **hobs' toll-house** (`tollhouse.kyrt`) is a kingdom's toll-house with a tariff; its Empire-before has no trace. The **old stones** are "the first makers'", with writing that is read as the makers' own — but the generator *names* them in Aenean, which the repository's own history ledger explains (Aenean surveyors catalogued what they found) and no text yet shows.

## 2. What this branch adds

### 2.1 The Empire's posting-house (implemented): `data/generation/works/roadstation.kyrt`

One in every country (`arts.json`, `imperial`; the `e1` id; drawn last against copies of the cells and names taken, so no town is named differently and no other site's id moves). Twelve rooms, three entries, documents in three stationmasters' voices (a pedant, a widow, a love-struck clerk), four endings, six occupants (a copyist who can join, carters, boars, road-wardens, a lamp-keeper, wolves) and four successor residues. Its history is **never explained**: the day-book stops mid-line, or the keys are left "for the next", or a dispatch is sent and sent, or a stationmaster stays at the desk, and the last three words are the same in each. What it teaches the player to *do* (read, map-follow, weigh, seal, drain, wave) is the Empire's way of doing things; see the storyboard for the rooms.

**Aenean clues planted, none of them an answer:**

| Where | What the player finds | What it is a thread toward |
|---|---|---|
| Numbered post | A count of miles from "the sea-port" and the next stages | an Empire with a coast; a road system |
| Posting-hall: the tariff | letters "carried free in the Emperor's service"; disputes to "the Prefect of the District, and not to the countrymen" | administration, justice by appeal upward |
| Posting-hall: the painted road | red marks for places "OLDER THAN THE ROAD", and one grey blank the road bends round: **THE WORKS** | the Mathematical Age arcology (design only; `arcology.md`) |
| Office: the day-book | "the Prefect's detour round the Works costs him nine miles of paving" (pedant) / the Lady's bowl emptied into the poor-box (widow) / a clerk's wedding to a baker's daughter (clerk) | the Empire as people; a detour someone ordered |
| Fisc-chest | **a late coin**, bright, of a regnal year higher than any the day-book lists | either the Empire went on, or someone counted wrongly; *not* a hidden rump state |
| Shrine | the Lady of Wayfarers, "waved on, not worshipped"; folk still pay the post and do not know whose | surviving practice, misunderstood |
| The Hall's muniment: the grant | "fifty paces either side belong to the road, held by none" and a clause that stops "as far as the Works" | a legal fact that still binds a living quarrel |

### 2.2 The Hall, below stairs, and its papers (implemented): `outskirts-deep.kyrt`

Three rooms (kitchen, cellar, muniment room) and four people attached to the Hall that already stood; a tunnel from the cellar to a new undercroft below the old stones' dome. **Wystan Hale, the gamekeeper** stands at a chain across the road-wood; **Orla Pennick**, the cook, rules the kitchen and has the old press key on a nail; **Wimble**, the kitchen boy, went up the hill on a dare and hums four notes; **Aldous Fenn**, reeve of the wood-wardens at the green, wants his dead father's name cleared. A quarrel over who owns the timber along the old road is settled — or not — by a grant of the Empire that nobody has been able to read for a thousand years.

**Small / medium / long, all independent:**
- *Small:* the cook's rats; a boy's stolen cup; a chain.
- *Medium:* the road-wood (muniments → grant → reeve and steward → consequence); the undercroft (three occupants by draw).
- *Long:* the grant names the posting-house, which names the Works. A late coin in a chest. The player is asked to carry an unfinished question out of the little town.

**The institutions are the point.** The Hall (a landholder), the wood-wardens (a licensing body), the town green (a jurisdiction in dispute), the Empire's grant (a document older than any of them), and the steward's habit of counting spoons: a *civic* adventure, where nothing is a dragon, and a clerk's hand is the antagonist.

**The same fact is told four ways.** The steward says "the road-wood is the Hall's", the reeve says "it never was", the gamekeeper says "I would like to be told it was somebody else's business", and the grant says "no one's". The company is the only party with a reason to read it.

### 2.3 Cast, relationships, and what they want apart from the player (implemented)

| Person | Where | Wants | Relationships | Contradiction |
|---|---|---|---|---|
| **Orla Pennick**, cook | Hall kitchen | the boy well; the steward humbled by being thanked | feud with the steward (spoons); fond of Wimble; Wystan is the one man who wipes his boots | gruff; has hidden the key's whereabouts for years out of pure spite |
| **Wimble**, kitchen boy | kitchen | to not be found out (he took the cup) | the cook's; afraid of the steward | the only one who knows what happened, and the only one who cannot say it |
| **Wystan Hale**, gamekeeper | forecourt → *joins the company* | to be told the chain is not his job | the reeve's old friend (his father was Wystan's corporal); sworn to the Hall | loves the woods more than the family he serves |
| **Aldous Fenn**, reeve | green | the paper that clears his father | friend of Wystan, enemy of the steward | proud, and *wrong in one detail* |
| The steward | Hall (existing) | order; the family back | cook (feud); keeper (loyal); reeve (guilt) | never says she is sorry; will |
| **Stationmasters** (three) | posting-house | the road kept | — | each is a voice, not a villain |
| **The copyist** | posting-house (a quarter of countries) | the whole road, copied | — | brave in scholarship, afraid of everything else |
| **The lamp-keeper** | way-shrine (draw) | the lamp lit "if the Posts come again" | the carters | will not say why |

### 2.4 Companions (implemented: four; designed: arcs beyond)

- **Wystan Hale** (always present in the first town). *Why he travels:* the settled road-wood frees him; he says so. *What he brings:* a ranger's woodcraft and the Hall's knowledge of the stretch of country that is about to become interesting. *What he says as he goes:* remarks at the stones' hall (his mother's people would not come up), the undercroft (the hill was under him the whole time), the Hall kitchen (the cook), and, where the country has a posting-house, the yard ("I should like to have kept it properly") and the shrine ("wave on the tired"). *When he leaves,* he goes home to the Hall, which remembers him. *Designed, not built:* a second remark when he stands at the Bend; his reaction if the company took the grant to the Hall only (he is *not offered* — the refusal is the consequence, tested).
- **The copyist** (drawn: about a quarter of countries). *Why they travel:* the stage's painted road lists more stages, and they have run out of road. *What they bring:* reading — a capability, not an action (the engine's `lore` capability), so a warrior who would not otherwise read an old script, can. *What they say:* at the office (tagged pigeonholes, "somebody could find anything"), the shrine (she is *waving*), and the roof (the road bends round something). *Designed, not built:* their disagreement when the company chooses the crowbar over the seal; a request to be taken to the next stage; their choosing to remain at a stage for love of the books.

Both use the engine's own `willing` / `hire` / `Joins` / `Remarks` / `Leaves` — no new companion system.

### 2.5 Interconnection map

```
   the Hall's muniment grant ─────names──────► the posting-house ◄── hooks: carters' priest, merchant, teller
        │  ▲                                        │   │
        │  └── road-wood quarrel (reeve, steward,   │   └─ painted road teaches the nearest other place
        │      keeper, cook's key)                  │       (a keep, tower, barrow, ruin: any work)
        │                                           └─ the map's grey blank: "THE WORKS" ··► (arcology: designed)
   the Hall cellar ◄──tunnel──► the old stones' undercroft ──► cup, chime, boy (Wimble) ── the cook
        └─ the keeper joins the company; remarks at the stones, the kitchen, the yard, the shrine

   designed, not wired:  oldcoin scholar ··► the late coin in the fisc-chest   (needs request R5)
                          the toll-house's tariff board ··► the posting-house's tariff (an echo, in the same hand)
```

Every solid arrow is a shared id or a fact the world holds (`knows`, `teaches`, `leadsTo`), not a name match; the dotted ones are designed only.

### 2.6 Larger-campaign seeds (all unrevealed)

- **The Empire's end is not explained**, and each stationmaster's last day contradicts the others'. (*Do not resolve.*)
- **A late coin** in a sealed chest. (*Either* the Empire kept minting, *or* someone counted wrongly; the repository's later authors may choose either, or neither.)
- **A road that bends round a "Works"** whose milestone doubles. (*Mathematical Age, kept apart from the Aenean.*)
- **A living folk practice** (the dish on the post, the Lady's bowl) that nobody can attribute.
- **A legal instrument still in force** (the grant), and a *family* (the Hall) that holds title under something it cannot read: the "new king, royal family, court" thread has its first foothold in a steward who writes "to the family, in my own hand".
- **What is *not* planted:** a hidden imperial rump state, the cause of the Empire's disappearance, time travel, a Dark Lord, a cult.

### 2.7 The first town's neighbours (implemented): `neighbours.kyrt`

A third layer on the first town (written only where it has an inn, a shrine and a shop). It does two things the first layers did not: it gives **the generated people lives that touch the authored ones**, and it adds **three companions whose business is not the company's**.

*What the generated innkeeper, priest, merchant and traveller now say* (by reference, so their generated names stand): the innkeeper's slate of eleven months' ale chalked to two parties who each say the other pays; the priest's pride in and fear of the acolyte's question about the coins; the merchant's shame at the price of oak and pity for an apprentice with a drawing of a bell; the traveller's rivalry with the scholar ("take her to know where the road goes; take me to know where to stand when it comes").

| Person | Wants | Arc, in the engine's own terms |
|---|---|---|
| **Isaure Venn**, scholar (inn) | to read every inscription before the frost | earned by asking (not bought); remarks at the dais, the muniments, the undercroft chime ("four notes; I have seen four notes, in my teacher's margin"), the kitchen, and, where there is a posting-house, its hall, office and roof; disagrees about forcing the press; reads the grant as a *writ of keeping*; **chooses to stay** at the stage to copy it (a rule moves her; a letter appears on the taproom board: "DO NOT COME BACK WITHOUT THE WORKS. P.S. SEND PAPER") |
| **Brother Anselm Tarr**, acolyte (shrine) | to know whether the coins at the old post are idolatry or manners | counts the offering-book (the habit is two hundred years old, through plague and war); joins when told of the Lady of Wayfarers (or, with no posting-house, after the undercroft); insists the bronze cup be put back; is told the company took a wax from the dead's chime and says "do not ask me yet"; leaves a coin at the Lady's bowl and says it "does not refute me, and does not refute her" |
| **Hesper Lowe**, boat-wright's apprentice (landing) | to cast a bell | the town's bell was taken by hobs; she has a drawing and a sixth of the knowledge; **a wax impression of the undercroft's chime** is the pattern; she pays, casts it, and a new bell hangs over the well that says the four notes and the children hum them. (Anselm's objection to the same wax is the quarrel between them.) |

*Also here:* **a death at the landing** (Joss Hatherly, the wardens' scaler, laid out in the shrine: the bruise and the silt; the tally-stick behind the bar with the merchant's mark on every row; the innkeeper's "he was sober"; three readings, an accident for the daughter's sake, the merchant, or nothing proved: what is told to whom decides what the town says); **the old steward's papers on the reeve's father** (a dismissal for "sauce", a draft letter that says PLEASE, a note that says the grant was called a forgery by someone who knew it was not: tell the reeve the whole truth or only that his father was honest; a stone appears on the well-curb); **the fifteenth spoon** (the boy paid for the cup with the Hall's missing spoon; the steward laughs); **the family's answer** some days after the road-wood is shared (a rider; a letter; a postscript asking who read the Empire's grant: the first door left open at court).

The companions' business continues without the company: Isaure writes from the stage, Hesper's bell rings, Wystan goes looking for the reeve, the town's talk changes with the truth told.

### 2.8 Abstractions: ties and bonds (implemented)

Two situations were lifted out of one-off writing into **templates the author varies by table**, so the same shape can be written once and drawn many times.

**Ties — a settlement and its nearest place** (`ties.kyrt`, `src/world/region-ties.ts`). Written for *every* settlement and the nearest site that is not a great work, a deep site or the posting-house. One shape is drawn per settlement from three the author wrote: *kin* (the innkeeper's lamp in the window for someone who went out to the place; a hand-sewn pouch found there), *debt* (the merchant's brass-bound measure lent to a "surveyor" and left under a stone), *custom* (the children's bread carried to a cairn somebody has kicked over; build it up again). Every shape is the same situation told from both ends: someone in the town asks; the place holds a trace that sends the company back; the town changes when it comes (a stool carried onto the green, honest weights on the stalls, a clay bird chalked on the well-curb). A person in the countryside's trace therefore always leads *back* to a named town person. New shapes are new sections in the template.

**Bonds — what a companion asks and what is given for being understood** (`bond.kyrt`, `companions.json`, `src/world/region-bonds.ts`). For each companion the table gives three *questions of their own*, each with a condition that is the companion noticing something (reading the grant, the settled quarrel, the chime, a cup put back, a death told), three answers each, and what each answer *shows* (candour, mercy, thrift) and moves (regard). Conversation here runs both ways: the companion speaks unprompted (a rule says it), the company chooses what to answer, no answer is right, and the companion remembers which it was: an appraisal later says what they have made of you, in their own voice. At regard three a **paragon quest** opens at a place (Wystan ties a rag for his corporal; Isaure reads the scored-out word on the dais and finds the Empire *named* the hall a judgement-seat and the makers' figures hold rods, not scales; Anselm keeps a vigil in the undercroft and concludes the dead "are only kept") and ends in a **keepsake that grants the company a capability** (a whistle that knows the woods, a primer that teaches doubt of the old script, a lamp that lets you see what a person means). The keepsake is the companion's own, and grants what the company can then do whether or not they are with it.

*What is not possible today:* the commission asked for **feats** granted for rising in a companion's regard. A feat is taken at a level threshold by the engine (`featOpen` is derived from the member's level and calling), and Kyr has no effect that grants a trait. The capability-granting keepsake is the closest authorable thing (request R14). Regard here is a plain measure of this author's, not a shared "approval" system.

### 2.9 Small situations played, and a conflict with a person who means harm (implemented): `troubles.kyrt`, `conflict.kyrt`

The first-region rubric asks for situations that are *played*, not tasks that trigger reward text, and for tone beyond the gentle. These were added to close that.

| Situation | Shape | What is played | What changes |
|---|---|---|---|
| **Someone missing** | Hesper Lowe, after she has told the company of her bell, goes under the hill for her own pattern (a clock: she goes after 40 watches) | the apron on the well-curb; the merchant's last conversation with her; a rope into a passage that was not there; a girl with a broken leg and a strip of wax; splinting, the tunnel, the cellar | bell cast, a coin, and a girl on a crutch at the sheds who does not wish to be asked about wisdom |
| **An escort** | Osmund Pyle, an old man with a bad hip, will walk to where his wife left her coin (the posting-house's post, or the old tree) | he is slow; he will say when to stop; the engine's own "brought home" thanks | a widower's coin left |
| **Strange animals** | drawn per country: a vixen with kits in the Hall cellar wall (the geese, the hens), or the wind sounding the chime's four notes in the old passage (the dogs facing the hill) | the clue (tracks; the draught at the old wall); the cook who knows the house | hens left at the inn with a note, or cloth across the grating and a thing that is "two things" |
| **A theft with a culprit** | the shrine's offering-box emptied of its bronze; drawn per country: the apprentice (needed metal) or a traveller (left at dawn) | the box's evidence differs by culprit; the innkeeper's slip; **a wrong accusation has a cost** (the apprentice shunned at the sheds, or the traveller's pack by the door) | the acolyte repays, or a wrongly accused person is looked at |
| **A bailiff** | Maudlin Rooke collects "dues for the keeping of the road" from the first town and the two nearest settlements, with a lead seal that is a wheel and no wing | three dues-receipts to read in three towns; the grant's seal (or the posting-house's tariff) to compare; **three ways to answer** (report her through the reeve and the castellan's clerk and wait; buy her silence for half and be remembered for it; stand by the accusation, after a stated warning, against two deserters, which a lone starter can lose) | towns' purses, a chalk on a post (A WHEEL HAS A WING), or a hayrick burned and prices doubled **whether or not the company is watching** |

*Malice that is not a monster:* Rooke is intelligent, has read enough of the Keepers of the Road to know how a people will pay for a road they half-remember, and is exactly as dangerous to a hamlet as the company allows. The conflict has a clock (48 watches: the price rises; 120: a rick burns), three communities, a Hall and the wardens, and three outcomes, each with a different cost. The wrong answer is available and teaches something.

## 3. Tested routes through the opening region (exercised)

All by the page's own labels from a fresh character (`test/outskirts-deep.test.ts`, `test/roadstation.test.ts`; seed `kahitude`, a warrior unless said):

| Route | Result | Test |
|---|---|---|
| Landing → Hall kitchen → cook (rats) → cellar (fight) → cook pays → cook gives the key → press-door unlocks | muniment room opens; cook's thanks and coin | `pays a cook for her rats…`; whole route as a transcript `transcripts/road-wood.txt` |
| …→ steward reads the grant → reeve is told → steward is shown → keeper offered ("Ask Wystan Hale to join the company") → joins | road-wood shared; green changes; Wystan travels with the party | `settles the road-wood by the Empire's grant…` |
| A thief picks the press-door instead (no cook) | door `broken`, the page says the steward will not like it; she reads the grant all the same | `lets a thief in without the cook…` |
| …but the grant is given to the Hall *alone* | reeve sour at the green; Wystan *not offered* | `leaves the keeper at his chain…` |
| Cellar → search (tunnel) → undercroft → cup → set it in the niche | Wimble mended | `has an undercroft whose cup…` |
| Hall steward → "ask about the old road" → set out → pay the deserters' toll → posting-house → search (the culvert) → cistern → yard → hall → painted road → tariff → office → day-book → last page (a mage, by the page's labels) | the way is learned in the Hall, walked on the map, and read at the end | **transcript** `transcripts/posting-house.txt` (`bin/kyrie play`); not asserted in a spec (a travel meeting is brittle) |
| Posting-house in `h8` (a copyist is drawn there): a warrior who cannot read hears the day-book read aloud and the copyist joins | knows the Posts; the copyist travels with the company | `has, in one country in four, a copyist…` |
| Posting-house: read tariff (mage reads, warrior is not offered); follow the painted road (teaches the next place); weigh, take the seal, press it, open the chest; drain the cistern and flood the void | each of the above | `roadstation.test.ts` |

**Different orders and refusals exercised:** reeve before steward; steward before reeve; grant read by the steward vs. by the player (lore); press opened by key (not tested: lock and crowbar variants are in the Kyr); the cook's key before the rats (refused: the topic is not offered); a company that never meets the reeve still sees the quarrel at the green.

## 4. What is **designed only** (not implemented)

- A second hall person with a *relationship across towns* (Orla's sister keeps the inn in the neighbouring village).
- Persistent reaction of the *town* beyond the green's observation (the reeve's licence-stick: an actual gold-for-wood trade).
- **A way to make amends after theft.** A company that carries the Hall's silver past the steward is shown out and both doors are shut to it (the existing rule, `outskirts.kyrt`); this branch keeps that, and the kitchen door, which stays open, shows the cook's contempt for the steward but cannot undo it. The natural cure is the cook taking the box back by the kitchen; it needs an item-handing effect in a topic that this branch did not find in the language (see R12 in the requests).
- The arcology expedition (`arcology.md`).
- A hedge-priest *variant* of the lamp-keeper whose faith is "challenged without being refuted".
- A different first-town job whose reward is "a letter from the Hall".
- Four more stationmasters, and a fifth ending.
- Any wiring from the oldcoin scholar to the late coin (needs the engine request in `kyr-deem-requests.md`: a scenario that can bind to a work site).
