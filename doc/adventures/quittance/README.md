# Quittance

*A metropolitan adventure for Kyrie. Branch `adventure/quittance-grand-tour`. Authored as an independent commission and merged
for review; it adds `data/adventures/quittance/`, one entry in `data/adventures/countries.json`, `data/campaigns/quittance.campaign.json`
and `test/quittance*.test.ts`, and changes no engine code.*

Quittance is a river-port metropolis of eighty thousand, burned to the ground ninety-four years ago and rebuilt on credit. Every
house wears a fire-mark; each mark names the Office of Assurance whose brigade will save it. Under the Exchange lives something
that has not been paid, and this year's Receipt is nearly blank. You have nine days.

**Reading order.** [01-design](01-design.md) (the original treatment) → [02-review](02-review.md) (the first severe review, R1–R12) →
[03-engine-plan](03-engine-plan.md) → this file (the work as built) → [04-critique](04-critique.md) (the second, harsher review, and
what it changed) → [05-changes](05-changes.md) (design → final) → [friction](friction.md) → [playtests/](playtests/).
The thirteen small adventures have a card each in [quests/](quests/).

---

## 1. Where it is and how a player finds it

Quittance is a **province of the first country** (`countries.json`, id `quittance`, side north). In any generated world, whoever
keeps travellers tells of it ("Up the north road there is Quittance… I should insure your hat before you go in"); the company
walks the road to the `Declaration Road` and stands before the Arch. It is not a scenario selector: the ordinary game goes on
beside it, and a company that has been through it is spoken of in the country below (`after`: the keeper takes the notice
down). Played ordinarily from seed `wren`: `test/quittance-world.test.ts`. Played alone: `bin/kyrie campaign data/campaigns/quittance.campaign.json`.

## 2. The region: districts, sites, connections

Eight districts, each a `settlement` of its own, a ninth place under the Exchange, and the approaches. About 100 rooms.

```
                         the Declaration Road (arrival)
         gap-path ─(gap boys)─┐     │ ─(towpath)─ Water-Stair ─┐        Mortmain road ─(hearse)─┐
                              │     ▼                          │                                │
   ┌──────────────┐     ┌─────┴──────────┐   Brokers' Stair   ┌─▼────────────┐             ┌──────▼───────┐
   │ BRICKFIELDS  │─────│ THE GATE       │───────────────────│ POLICY ROW & │─────────────│  MORTMAIN    │
   │ Mark Street  │     │ QUARTER        │                   │ THE EXCHANGE │             │ cemetery,    │
   │ Brick Lane   │     │ Arch, Hen,     │                   │ Bell & Slip  │             │ almshouse,   │
   │ drill-yard   │     │ Booths         │                   │ Phoenix Hs   │             │ Annuitants'  │
   │ Tolliver's   │     └─────┬──────────┘                   │ Hall of Five │             │ Row, Sovereign│
   │ Dyers' Alley │           │                              │ Tables Room  │             └──────┬───────┘
   └──────┬───────┘     ┌─────▼──────────┐                   └──┬─────────┬─┘                    │ catacomb stair
          │             │ LIGHTERING     │                      │         │ Surety Hill road      │
          │ road        │ REACH (wharves)│                      │ cellar  ▼                       │
   ┌──────▼───────┐     │ Mere Wharf,    │                      │ stair  ┌────────────┐           │
   │ GLASS        │─────│ salvors, Skell │                      │        │ LANTERN    │           │
   │ QUARTER      │road │ Lamprey House, │──diving shaft──┐     │        │ HILL       │           │
   │ Gasworks,    │     │ the bell       │                │     │        │ Hearn Hs,  │           │
   │ Lamp-house,  │     └────────────────┘                │     │        │ Guild,     │           │
   │ Lamplighters │                                       ▼     ▼        │ Teague Hs, │           │
   └──────┬───────┘                              ┌────────────────────┐  │ Belvedere  │           │
          │ Cinderwall road                      │   THE SUNK CITY    │◄─┘            └───────────┘
   ┌──────▼───────┐                              │ cellars · the Queue│
   │ THE BARE     │◄───────── First Flue ────────│ Glass City · slag  │
   │ WARDS        │      (opens from below)      │ galleries · Vault  │
   │ Salt Lane,   │                              │ · the Hearth Below │
   │ Night Market,│                              └────────────────────┘
   │ Cinder Ward, │
   │ Gasket Yard  │
   └──────────────┘
```

| District | Character | Significant sites | Ways in |
|---|---|---|---|
| Approaches | Walls, carts, a hearse, a gap | the Declaration Road, towpath, outer wall, Mortmain road | — |
| Gate Quarter | Declarations, brokers, cheap marks | the Arch and the Honest Bell, the Wayward Hen, the Policy Booths, the Brokers' Stair | Arch; Water-Stair; roads to the Brickfields, Reach, Row |
| Policy Row & Exchange | The five Offices; the Slate | Bell & Slip, Phoenix House (the Chief Underwriter, the Tables Room), the Hall of the Five, the Exchange court (the Receipt, the statue, the Founders' Glass) | Brokers' Stair; roads to Surety Hill and Mortmain; the cellar stair down |
| Brickfields | Respectable, fire-marked, watched | Mark Street, the fire-house yard (two brigades), Tolliver's bakery, Dyers' Alley (the forger; the Pargeters) | Brick Lane |
| Lightering Reach | Docks, salvors, tide | Mere Wharf, Salvors' Yard, Skell's yard and loft, the Sluice-tap and its cellar, Lamprey & River House, the diving-bell cradle | Reach road; Water-Stair |
| Glass Quarter | Furnaces, gas, cold-lamps | Foundry Row (the Smokeless board), the Gasworks, the Lamp-house, the Lamplighters' Hall, the four stops of the Round | Glass Quarter road; Cinderwall road |
| Lantern Hill | The rich; the last Hearthkeeper | Hearn House and its hearth-room, the Surveyors' Guild, the Teague house, the Corbetts', the Belvedere | Surety Hill road |
| Bare Wards | Unmarked, warm, lit, loud | Salt Lane, the Penny Mutual, the Night Market, Pip's stair, Candlewick Court, Skelter's rent-office, Gasket Yard, the Cinder Ward, the First Flue | the gap; Cinderwall road |
| Mortmain | Garden-cemetery of the Sovereign | the lodge, Annuitants' Row, the almshouse, Mrs Oakes's cottage, the Sovereign's life-office, the catacomb stair | the Mortmain road (hearse); Policy Row road |
| Sunk City | The burned city, fused | the Exchange cellars, the Queue, the Glass Street, the slag galleries, Furnace Row (glass men), the Strongroom, the Hearth Below | four ways down: cellar stair, catacomb stair, diving shaft, First Flue |

The **four ways down** are each a gate owned by one quest: the cellar door (a key from Auberon Hearn, picks, or a shoulder), the
catacomb grate (the rite, the sexton's leave, the Oakes key), the diving-bell hatch (Dree's leave, a forged writ, the Teague
combination, or force — which wrecks the bell), and the First Flue (opens only from below). Every way but the Flue passes **the Queue**.

## 3. The small adventures and how they relate

Thirteen cases, a person, a place, a misunderstanding, more than one way through, a complication, a consequence. Cards in `quests/`.

| # | Case | District | Kind | Dilemma | Feeds |
|---|---|---|---|---|---|
| 1 | **Mark Street** | Brickfields | comic emergency, clocked | save the house or win the precedent | the Mark Street Rule (Hearing); Garrity's arc; Tobias |
| 2 | **The Bakery Inspection** | Brickfields | local, practical | pass the Ordinance and lose the oven's coal, or keep it | a Lent coal; `keeper(brick)` |
| 3 | **The Mark-Forger** | Brickfields | skulduggery | report her, join her, improve her marks, turn the hunter | the forged writ (Barge hatch); `fg_network` (Hearing) |
| 4 | **The Scuttled Barge** | Reach | claims, salvage, fraud | whose salvage, whose fraud, whose girl | Dree's arc; the bell hatch; `keeper(reach)` |
| 5 | **The Lamplighter's Round** | Glass | intimate, local | how to retire a man who knows | `d_pilots_step`; `keeper(glass)` |
| 6 | **The Cold-Lamp Demonstration** | Glass | engineering, theatre | whose failure to stage | Gaunt's arc; the salamander lantern; a coal |
| 7 | **The Annuitant** | Mortmain | claims, family comedy | protect seven with a lie or tell a man who will use it | Cray's arc; the catacomb gate; `keeper(mort)` |
| 8 | **The Queue** | cellars | ghost comedy and pathos | pay fairly, break the line, or wait | the Ledger of the Unpaid; the gate of the Descent |
| 9 | **The Penny Mutual** | Wards | communal, practical | bring the fund home or let the club find the culprit | the evidence of the Appointed Losses; `keeper(wards)` |
| 10 | **Pip's Tin** | Wards | tender, with a clock | sit with a dying coal or carry it away | a coal; the name the Fire will hear |
| 11 | **Mr Teague's Wake** | Hill | funeral comedy | which Rosalind; a parrot | the Teague combination; Fusby as witness |
| 12 | **The Surveyor's Daughter** | Hill/Brickfields | romance | integrity vs. love; three assignations | the Roll extract; Tobias; Ianthe's arc |
| 13 | **The Arch** | Gate | the portal | what to declare to a Bell that listens | how the company is recorded for the rest |

Purely local stories (personal, comic, practical rather than cosmic): the Bakery, the Lamplighter, the Wake, Pip's Tin, the
Penny Mutual, the Annuitant. Cosmic stakes are never mentioned in them except as rumour.

## 4. The dramatic shape

**Premise.** Dame Honora Hearn, a notary, found the Fire in the burning cellars of the Exchange and drafted it a contract: it
will spare the city, and every hearth in it that keeps a *Lent coal*; once a year the coals are carried home and returned. A
hundred years of honest people turned the coal into a mark, the carrier into a brigade, the Return into a banquet. The Smokeless
Ordinance took the hearths out of the inner wards. The Fire has been starving politely for forty years. Sedley Prewitt, Chief
Underwriter of the Phoenix, found the papers six years ago, and concluded as an actuary must: it is owed a **tithe**, and a tithe
paid in a controlled form is cheaper than the arrears. Each year a block of the Bare Wards — where the coals are still kept — burns on an
*Appointed Night*. This Reckoning the Cinder Ward (3,000 people) is to go.

**Acts** (chapters open on the clock):
- **I — Assessment (days 1–3).** The Arch; the Slate; Mark Street at ten; the first claims. Three clues from three directions say
  the Tables are wrong. In the small hours of day 4 Candlewick Court burns, unless it was warned or stopped.
- **II — Adjustment (days 4–6).** The Offices and the Gas Company take sides; the Receipt loses its words; the company learns the
  Fire is real, that Prewitt's hand is on the list, what a Lent coal is. Gasket Yard burns in the small hours of day 7.
- **III — Settlement (days 7–9).** Coals may be laid. The Hearing of the Five sits at two on Reckoning Day. The Great Tithe is
  prepared at 22:30. At midnight the Receipt is hung — and twelve small chapters tell what became of the people in it.

**The two principal approaches (both complete, either enough, neither alone the whole story):**

| | **The Hearth Night** (civic) | **The Descent** (private) |
|---|---|---|
| Game | standing, logistics, nerve | route, attrition, attendance |
| Means | six wards each need a coal, a hearth, a keeper; coals are *scarce* (Auberon 2, Tolliver's oven, Pip's gift, Wynne's freed spark, the Fire itself); the Hearing's five votes; Prewitt's levers | four ways down; the Queue; heat; glass men; the Strongroom's lock; the Treaty read in any order; the Fire's mood |
| Counts | `wardsLit` (4+ ends the Tithe), `ayes` (3+, 4 if Gaunt unmoved), witnesses | `ds_accord` 0–10, slights, terms: a Night, a Hearthkeeper, a General Average |
| Fails by | time, trust, a ward left dark, a vote lost | heat, a bribe or threat (the Fire warns twice, then burns), too few offerings |

**Endings** (tried in order; the first two are immediate, the rest at midnight):
*The Burning* · *The Slaying* · *General Average* (the Fire consents *and* the Five carry it: the Ward emptied and burned in daylight, the loss shared) ·
*The Hospitality Renewed* (terms, a Hearthkeeper or a yearly Night) · *Quittance* (four wards lit, motion carried, Prewitt turned) ·
*Quittance, Contested* (the same, Prewitt unmoved) · *The Ward Without Its People* (the Tithe burns, but the Ward was emptied) ·
*The Controlled Loss* · *The Lapse*.

**Principal people and their arcs** (an `arc` measure each; the world remembers the stage):
- **Sedley Prewitt** — hard · shaken · open · turned (or hardened). Four levers, none a document: *witness* (stand with him at Gasket Yard while the
  people he did not count are on the street), *kin* (Ottoline sees the ruin and speaks to him), *arithmetic* (Miss Pettifer's General Average),
  *grief* (light Margery's cold lamp with a Lent coal — which costs a coal). Threaten him and he hardens, and the Phoenix's wardens come.
- **Captain Garrity** — rival · *asked* (not argued) · partner. **Captain Dree** — rival · out-bargained · willing.
- **Cornelia Pettifer** — silent · speaks (a promise to stand beside her in the Hall; the Promise can be broken).
- **Ianthe Corbett and Tobias Pargeter** — the example, the honest word, or time; five outcomes. **Pennington Cray** — a bonus, his mother, an ally.
- **Auberon Hearn** — lost · lucid for as long as his coal has kindling · the Return learned. **Lord Gaunt-Halloran** — flattered, then bought in; never moved by the poor.
- **The Fire** — owed · lonely · tender · wary · wrathful. Courteous as a bailiff; it burned Cindermouth and is not sorry.

## 5. Environmental design

- **The city's own clocks.** The Slate (rewritten each morning); the Exchange bells at nine and four; the Arch closing at ten; the dusk lamplighter;
  the dawn drill; the tide (the Reach's wreck and bell work at low water only); the Night Market (exists only after dark); shift changes at the Gasworks;
  Skelter out collecting from noon to two; the Receipt decaying by the day; the children's counting-rhyme; the pageant on Reckoning Day.
- **Foreshadowing, planted early and paid late.** The Receipt fades (days 1→9); the Exchange paving warms; the plaster behind the Hall's dais goes warm and then shows a
  line of red; the gulls on the Furnace Wharf face the wrong way; the pilots breathe in step; Honora's small pencil hand turns up at the Arch (*sufficient to what?*), the
  Mortmain gate, the lintel at Hearn House, the first Slate, and — answered — the Strongroom (*sufficient, my dear, to the guest*). The Founders' Glass shows, at dusk, a woman
  walking into a street of fire, writing.
- **Combat, always with a way round it.** Skell's sons (talk, pay, show a licence, or name Dree); the torchmen at Candlewick and Skelter's men at Gasket (warn the court, bribe, fight, or be early);
  the glass men (a Policy of Passage, a licence, a fee, a quiet slip, or a fight); the Tithe men (evacuate the Ward, bring both brigades in one line, read the book aloud, turn the foreman, or fight);
  the Phoenix's wardens (pay, ask Ottoline, or fight); the Fire (never necessary, always possible: a level-6 thing that beats an ordinary company).
- **Hazards that are places.** Heat in the slag galleries (shade, water, the Fire's leave, a warding focus); foul air in the shaft; the splintering door; the cellar draught that leans every flame toward the Hearth.

## 6. Character-build interaction matrix

Skills come from classes and backgrounds (`src/rules/checks.ts`, `data/catalog/classes.json`); a company's best member makes each check, and companions
fill gaps (Tobias: brawn; Pettifer: lore; Ottoline: woodcraft). "Plain" = no relevant skill, only coin, time and a lantern.

| Build (skills) | Doors of its own | Doors it must buy, borrow or recruit | Cannot do alone |
|---|---|---|---|
| **Warrior** (brawn, intimidation) | the winch (Water-Stair), bucket-line at Mark Street, the flue and the diving crank, Skelter's men, the cellar door by shoulder, glass men and the Slaying, the Tithe men, Skell's sons | persuasion at the Arch, the Hearing's speech, the Return | the Rule-Five declaration, the parrot, the Strongroom's seal |
| **Thief** (lockwork, trapwork, stealth, deception) | the false declaration, the wicket and the stair, Skell's yard, the plate at Mark Street, Skelter's desk, the Roll, the Strongroom lock, glass men slipped, the boiler | the Return, the Queue's rite | the Hearing's votes without allies |
| **Cleric** (mending, rites, insight) | the Queue's office, the catacomb grate rite, the Return, Cray's mother, the Rosalinds, the foreman, the wounded at Candlewick, Auberon | forcing doors, persuasion | the diving crank, the glass men |
| **Bard** (lore, persuasion, performance) | Rule Five (two ways), the gap boys, the funeral, the parrot, Gaunt, the Hearing, Garrity asked, Dree out-bargained, the wording | brawn, locks | the cellar door |
| **Mage** (lore) | Rule Five, the manifest, the wording, the Policy's seal, the cold-lamp's glass, the curves | locks, force | the persuasion-heavy Hearing |
| **Ranger** (woodcraft) | the trail to Ouseley, the Penny Mutual, Ottoline as companion | — | most social doors |
| **Monk** (climbing, mending, insight, tumbling) | the gap wall, the Belvedere drainpipe, Cray, the wake, tumbling past the drill | brawn, persuasion | the Queue's rite |
| **Plain** | coin (Policy of Passage, hearse, handling, the Queue's penny, glass men's fee), time (the ticket in the Queue; sitting with Pip's coal; sitting with the Fire), kindness (rations at the almshouse, bread for the surveyor), Auberon's kindling, the Booths' pencil for Miss Pettifer, a companion | everything else | the Slaying |

The test suites exercise the doors named above; `playtests/` has three full plays.

## 7. High-level rewards: mechanics and meaning

| Reward | How | Mechanical | Narrative weight |
|---|---|---|---|
| **Adjuster's licence** | Arch / Slate | lets the company *certify* a mark, enter premises named in a claim, show to the glass men | the city's only honest document |
| **Policy of Passage** | honest declaration | shown to the glass men; marks the company *on the Roll* (known to the Phoenix) | being insured means being visible |
| **A Lent coal** | Auberon (2), Tolliver's oven, Pip's gift, Wynne's freed spark, a clerk's lamp, the Fire | a good that gutters in a day; lays a ward, lights Margery's lamp, is offered to the Fire (named for a grandmother, a child or no one) | the whole book's currency |
| **Salamander lantern** | Wynne, if the company showed her another way | light without oil; ignores heat | something that was freed asked to stay |
| **Ledger of the Unpaid, Skelter's book, Roll extract, the Treaty** | Queue, Wards, Hill, Strongroom | read aloud at the Hearing, to the Tithe men, to the Fire | the burned counted by name |
| **Companions** | Tobias (brawn), Pettifer (lore), Ottoline (woodcraft, and her father) | fill the party's missing skills; Pettifer has a Promise that can be broken | people who changed because someone stood beside them |
| **Fusby** | settling the wake | the only witness who cannot be bribed | a joke that turns out to be load-bearing |
| **Experience** | milestones (≈ 2,300 in all) and each quest's own | levels at a sheltered rest | — |
| **Standing** | `regard` with the five Offices, the Gas Company and the Wards; `arc`s | decide the Hearing's votes and who stands up in the Hall | a company that comes back is recognised |

## 8. Playthrough evidence

`playtests/` holds transcripts written by `scripts/quittance-transcript.ts` from the scenarios in `playtests/scenarios/`:
`arch-honest`, `arch-gap` (two of the five ways in), `descent-sit` (three fighters, no licence, no key, no friends: they force the cellar door,
pay the Queue, show a Policy to the glass men and sit with the Fire for three hours — **and it is not enough**: accord 3 of 5, no terms, so the Great
Tithe burns and the book ends *The Controlled Loss*). The suites: 292 tests across 18 files (see friction.md for the seed-pinning caveat).
`scripts/quittance-fuzz.ts` takes random offered actions and checks invariants (arcs in range, no negative gold, ≤ 6 wards, ≤ 5 ayes, no terms and
slaying together): findings are in 04-critique.

## 9. Authoring friction

[friction.md](friction.md) (lead) and `friction/*.md` (one per author; 100+ items). The worst: surnames unique across the whole repository and found only at lint;
engine-reserved words found only at load with no file:line; `day(clock)` 1-based against every comment; measures floor at zero (no negative regard);
`Pursuit` silently inert for a person who does not `Uses go`; `Promise` kept-clauses with no effect; observations told once so persistent change must live in Things;
checks pinned to seed and clock so tests are seed lotteries; a test cannot give the company an item.
