# A Winter in Carth: character builds

*What each kind of company can do in Gaunt and at Carth, read from the module's checks and gates
(`Resolve check(…)`, `capable(…)`, `needing …`) and played with the builds in `test/fixtures/gaunt`. Wren the bard is
the campaign's own (`data/campaigns/a-winter-in-carth.campaign.json`).*

| Build (fixture) | Capabilities that matter here | Played in |
|---|---|---|
| Bard, Wren | persuasion, lore | *from above* (the byre fire, Annis at the cob, the masked Lady, Quist, witness: **The Bearer**, by Thackray); *the letter*; *the Lady's words* (**The Recantation**); *left alone* |
| Thief | deception, lockwork, stealth | *from below* (the hearth lit, Heb's forgery past the porter, the Ladder raised, the Row out: **The Fast**); the lie to Raistrick |
| Warrior | brawn | *the window* (the box-bed, Bess and Hern, the serjeants fought, the bars out: **The Flight**) |
| Cleric | mending, rites, insight | *the company bears it* (the beadle's foot, the fever nursed, Ralph laid out, a barefoot mile, put out: **The Bearer**, by the company) |
| Ranger | woodcraft | *nothing done at Carth* (Hern's coat, never tended: **Put Out**, in a coffin); the beasts brought in |
| Mage | lore, a conjured Light | the cold light at Carth |
| Monk | mending, climbing, insight | the Barefoot soles |

## Where a build matters

**Checks** can be tried by anyone, and training makes them likelier. **Gates** need the capability, or there is no
offer. Nearly every gate has a way round that costs something else, usually time, money, a body, or someone else's.

| Moment | Check or gate | Strong builds | Everyone else |
|---|---|---|---|
| The beadle's foot | bind it: mending gate | cleric, monk | leave it; he sits on at the Cross (a fate line) |
| Into Carth with a lantern | the door refuses **flame** | mage (Light has none) | put the torch out at the door, or stay outside |
| The child's fever | nurse it: mending gate | cleric, monk | the box-bed (a cold-side hazard); the byre fire; the beasts; Hern's confession; or the hearth, and the debt |
| The beasts in | woodcraft gate, **or** Old Mother Scaife's memory | ranger | ask her who the Guest is |
| Will lights it | persuasion check (hard) | bard | Hern's confession, which makes Annis order it |
| Raistrick at the warm hearth | deception check (hard) | thief | the letter (rake, snow, relight), or the byre, so there is nothing to lie about |
| Ralph laid out | rites gate | cleric | sit with the old woman, or bring her in |
| The porter and Heb's tally | deception check (fair); failure is three more pains | thief | a proxy, your own body, the ring, the lodge, the wall, the Ash Day crowd |
| The Close wall | climbing, at nightfall | monk | the masons' lodge (tell Joby), a clean tally |
| The Row out | persuasion check (fair), after a night for the Hall or a sledge of wood | bard | corner Bess with the Ladder's buying-out, which calls the strike without a roll |
| The gaol bars | lockwork **or** brawn gate | thief, warrior | there is no other way out of the window; *the Flight* needs one of them, or the Drove Fork |
| Hern failing in the cell | tend him: mending gate | cleric, monk | the Lady sends her physician if she is moved |
| The serjeants in Gaol Lane | a fight (two commoners) | warrior | pay Prudence's six shillings, and nobody comes |
| The Fabric's night-men | a fight (four warriors) in the scaffold-yard, nine till four | a strong warrior, perhaps | watch from Gaol Lane; come at dusk; go back when warned; Joby's masons on Fastens' Eve; the canon silenced |
| The woodmen | pay four shillings, or fight three | warrior | come when the right is open |
| The wolves | a fight (five) at the deadfall from dusk | — | come by day |
| The Barefoot soles | a barefoot mile and a night on the Steps, having walked with Hern | anyone with the time and the feet | — |

## The two approaches compared

The two principal approaches are not the same ending reached by two corridors. They do different things to the city.

**From above (the Close)** asks the company to *get clean* first: pay a proxy, or bear its own pains on its own body,
or be remitted. With a clean tally the Close opens, and with it the institutions: the Lady Penitentiary at her desk,
the Divinity Schools (a contrary Determination), the Master of the Fabric, the witness's place at the Consistory.
Thackray is reached through his own yard and his own people (Annis, his cousin, a children's rhyme). The ending it
reaches is **the Bearer**: the city's law used exactly as written until it says what Hern says, in public, and is
written down. It is a reformer's ending: the Commerce "has not fallen; it has only been seen".

**From below (the Row)** asks the company to *stay dirty*, or to forge it. Heb's tally, the Stand, the Ladder's two
rivals raised against each other until they have bought every proxy in the city, the Barefoot Hall, the Bishop's
Wood, the gaol window from the lane, the masked woman at the copper. The endings it reaches are **the Fast** (the
Commerce stopped by the people it runs on: nobody can be clean if nobody will be hired) and **the Flight** (Hern out
of a window). It is a striker's or a smuggler's ending: the Commerce is not argued with, only interrupted.

The test pair that proves they differ is `from above` (bard) against `from below` (thief), both seed `g1`
(`test/winter-in-carth.test.ts`): different rooms (the thief never enters the Penitentiary or the Schools; the bard
never enters Heb's cellar or the brewhouse), different people moved (Thackray and the Lady; Bess, Dinsdale, Sowerby),
different debts at the end (clean; eighteen pains still notched), different verdicts, different closing accounts.

**The Lady belongs to both.** At her desk she is reached from above, masked at the copper from below, and moved only
by things the company carries in from somewhere else: Carth, Hern's word about the soup, the end of the rhyme. She is
where the approaches meet, and the only person whose mind every good ending needs.

## A company without charm or learning

The warrior (*the Flight*), the ranger (*Put Out*, in a coffin) and the monk (the soles) have no persuasion and no
lore. Every principal ending is reachable without them:

- Carth: the box-bed, the beasts, Hern's confession, or the byre fire need no roll.
- Thackray: Annis to his face, the rhyme from the ditch, a night of his own at Carth, or Joan's laughter: none rolls.
- The Lady: three reasons, each a thing carried, not a speech.
- The Row: cornering Bess with the Ladder calls the strike without persuasion.

What charm buys is speed and the option of not paying: Will lights the hearth himself, the Row is talked out in one
evening.
