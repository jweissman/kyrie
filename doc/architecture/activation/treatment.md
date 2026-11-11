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

Three rooms (kitchen, cellar, muniment room) and four people attached to the Hall that already stood; a tunnel from the cellar to a new undercroft below the old stones' dome. **Wystan Hale, the gamekeeper** stands at a chain across the road-wood; **Orla Pennick**, the cook, rules the kitchen and has the old press key on a nail; **Tam**, the kitchen boy, went up the hill on a dare and hums four notes; **Aldous Fenn**, reeve of the wood-wardens at the green, wants his dead father's name cleared. A quarrel over who owns the timber along the old road is settled — or not — by a grant of the Empire that nobody has been able to read for a thousand years.

**Small / medium / long, all independent:**
- *Small:* the cook's rats; a boy's stolen cup; a chain.
- *Medium:* the road-wood (muniments → grant → reeve and steward → consequence); the undercroft (three occupants by draw).
- *Long:* the grant names the posting-house, which names the Works. A late coin in a chest. The player is asked to carry an unfinished question out of the little town.

**The institutions are the point.** The Hall (a landholder), the wood-wardens (a licensing body), the town green (a jurisdiction in dispute), the Empire's grant (a document older than any of them), and the steward's habit of counting spoons: a *civic* adventure, where nothing is a dragon, and a clerk's hand is the antagonist.

**The same fact is told four ways.** The steward says "the road-wood is the Hall's", the reeve says "it never was", the gamekeeper says "I would like to be told it was somebody else's business", and the grant says "no one's". The company is the only party with a reason to read it.

### 2.3 Cast, relationships, and what they want apart from the player (implemented)

| Person | Where | Wants | Relationships | Contradiction |
|---|---|---|---|---|
| **Orla Pennick**, cook | Hall kitchen | the boy well; the steward humbled by being thanked | feud with the steward (spoons); fond of Tam; Wystan is the one man who wipes his boots | gruff; has hidden the key's whereabouts for years out of pure spite |
| **Tam**, kitchen boy | kitchen | to not be found out (he took the cup) | the cook's; afraid of the steward | the only one who knows what happened, and the only one who cannot say it |
| **Wystan Hale**, gamekeeper | forecourt → *joins the company* | to be told the chain is not his job | the reeve's old friend (his father was Wystan's corporal); sworn to the Hall | loves the woods more than the family he serves |
| **Aldous Fenn**, reeve | green | the paper that clears his father | friend of Wystan, enemy of the steward | proud, and *wrong in one detail* |
| The steward | Hall (existing) | order; the family back | cook (feud); keeper (loyal); reeve (guilt) | never says she is sorry; will |
| **Stationmasters** (three) | posting-house | the road kept | — | each is a voice, not a villain |
| **The copyist** | posting-house (a quarter of countries) | the whole road, copied | — | brave in scholarship, afraid of everything else |
| **The lamp-keeper** | way-shrine (draw) | the lamp lit "if the Posts come again" | the carters | will not say why |

### 2.4 Companions (implemented: two; designed: arcs beyond)

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
   the Hall cellar ◄──tunnel──► the old stones' undercroft ──► cup, chime, boy (Tam) ── the cook
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

## 3. Tested routes through the opening region (exercised)

All by the page's own labels from a fresh character (`test/outskirts-deep.test.ts`, `test/roadstation.test.ts`; seed `kahitude`, a warrior unless said):

| Route | Result | Test |
|---|---|---|
| Landing → Hall kitchen → cook (rats) → cellar (fight) → cook pays → cook gives the key → press-door unlocks | muniment room opens; cook's thanks and coin | `pays a cook for her rats…`; whole route as a transcript `transcripts/road-wood.txt` |
| …→ steward reads the grant → reeve is told → steward is shown → keeper offered ("Ask Wystan Hale to join the company") → joins | road-wood shared; green changes; Wystan travels with the party | `settles the road-wood by the Empire's grant…` |
| A thief picks the press-door instead (no cook) | door `broken`, the page says the steward will not like it; she reads the grant all the same | `lets a thief in without the cook…` |
| …but the grant is given to the Hall *alone* | reeve sour at the green; Wystan *not offered* | `leaves the keeper at his chain…` |
| Cellar → search (tunnel) → undercroft → cup → set it in the niche | Tam mended | `has an undercroft whose cup…` |
| Hall steward → "ask about the old road" → set out → pay the deserters' toll → posting-house → search (the culvert) → cistern → yard → hall → painted road → tariff → office → day-book → last page (a mage, by the page's labels) | the way is learned in the Hall, walked on the map, and read at the end | **transcript** `transcripts/posting-house.txt` (`bin/kyrie play`); not asserted in a spec (a travel meeting is brittle) |
| Posting-house in `h8` (a copyist is drawn there): a warrior who cannot read hears the day-book read aloud and the copyist joins | knows the Posts; the copyist travels with the company | `has, in one country in four, a copyist…` |
| Posting-house: read tariff (mage reads, warrior is not offered); follow the painted road (teaches the next place); weigh, take the seal, press it, open the chest; drain the cistern and flood the void | each of the above | `roadstation.test.ts` |

**Different orders and refusals exercised:** reeve before steward; steward before reeve; grant read by the steward vs. by the player (lore); press opened by key (not tested: lock and crowbar variants are in the Kyr); the cook's key before the rats (refused: the topic is not offered); a company that never meets the reeve still sees the quarrel at the green.

## 4. What is **designed only** (not implemented)

- A second hall person with a *relationship across towns* (Orla's sister keeps the inn in the neighbouring village).
- Persistent reaction of the *town* beyond the green's observation (the reeve's licence-stick: an actual gold-for-wood trade).
- The arcology expedition (`arcology.md`).
- A hedge-priest *variant* of the lamp-keeper whose faith is "challenged without being refuted".
- A different first-town job whose reward is "a letter from the Hall".
- Four more stationmasters, and a fifth ending.
- Any wiring from the oldcoin scholar to the late coin (needs the engine request in `kyr-deem-requests.md`: a scenario that can bind to a work site).
