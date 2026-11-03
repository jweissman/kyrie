# The Grand Tour: builds

*What each calling and background opens, the checks and gates, the two approaches to the Door compared, and a company
without charm or learning. Spoilers.*

## The rule held to

From the editorial: every petal has at least one approach that needs no charm and no learning; the Tour and the
Undertow each have at least one step only a skill opens, and at least one anyone can take. Below, **anyone** means a
level-1 commoner with nothing but time.

## The gates, by what opens them

| Gate | Anyone | Skill (class) | Background (craft) | Check |
|---|---|---|---|---|
| Up the chain | Basket 5 coin; capstan shift; laundry at dawn | climbing (monk): the anchor chain, 2h | — | — |
| Halyard House | A licence; Aubrey's company; the laundry hamper | stealth (thief): slip past Jem | court | — |
| Jem's testimony | A place below (Peg, Prue) | intimidation (warrior): the collar | — | intimidation, fair |
| The Air Door | Leave after the funeral; Aubrey; the Dowager; break the seal | — | — | — |
| The escritoire | (The Dowager gives the letter, once sorry) | lockwork (thief): by night, room empty | — | lockwork, fair |
| The Fish Stairs | Helm; Ha'penny; Mercy | — | water: "Salt and welcome" to the guards | — |
| The Hour Court | Mirror, geode, jar, Handbook, the ember | persuasion (bard): a song; brawn/combat: the Lists; stealth (thief): snatch | stage: a performance | persuasion fair; stealth hard |
| The Slow Assembly | Sit two days; Chert | lore (mage, bard): move the question; digging | learning; earth: dig | lore fair |
| No Admittance | Supper; her name; the third step | — | — | — |
| The Third Step | Pay; deposit; carry her; Bethan | persuasion: argue | — | persuasion, even |
| The bell | Ask Ha'penny; muffle | rites (cleric) | faith | — |
| Perrin's leg | — | mending (cleric, monk) | healing | — |
| The plaque | Perrin tells you; his notebook | lore | learning | — |
| The tide-engine | With the Whelm, by leave | lockwork (thief), mending | mechanisms | lockwork, fair |
| The tower door | Chert through the cat-flap; the Rector's key; (open behind her if she climbs) | lockwork | — | — |
| The funeral | — | insight (cleric, monk): her hand on the rail | — | — |
| Fire heat | Borrow Tench's cloak; buy one | — | — | constitution save |
| The landing | The North Wind's feather | — | — | dexterity save |

## The approaches compared

**The Grand Tour** (the Rose) is long, social, and moves through every storey and plane: about three and a half days
for a knowing player, five or six for a first-timer. It is the only approach that reaches A Present from Sennet. It
needs: a way into each court's game (all have no-skill ways); Prue saved (one conversation with the Rector, which puts
you in her debt); the North Wind's breath in a jar (one conversation, if you are let up); the keel (Aubrey). It is the
approach the city's satire is built for: every court's petal is got by playing that court's game.

**The Undertow** (the tide-engine) is short, physical, and moral: it can be done on the first day, by a company that
never enters the Tour. It needs: breath (Ha'penny), admission (supper), No Admittance's trust (the third step, her
name), Perrin's word about the engine (or the plaque, for a scholar), her leave, Perrin moved (Mercy), and hands on a
wheel. It skips Cloudgate entirely, and with it the mystery and the romance. A thief or a tinker can start it alone
without leave, at the price of the Whelm.

They differ in cost exactly as the editorial asked (E5): the Tour costs time and spends the Rector's patience, and
its last move threatens a city in the sky; the Undertow costs the Whelm a day of its light and threatens one man in
an air-bell.

## Five builds, played

| Build | Route | What it found | Evidence |
|---|---|---|---|
| **Tamsin, bard (fabulist)** | The whole Tour, four petals by four games, Prue's petal, the Door | Everything; the songs and stage do work in the Hour Court; persuasion helps with Pumphrey | `the-grand-tour.test.ts`; `playtest/tour.md` |
| **Brann, warrior (labourer)** | The Undertow in one day | No charm, no learning, no coin; Ha'penny's breath, supper, the joke of the name, the third step; hands on the wheel; bars the Rector at the Door | outcomes "Undertow"; `playtest/undertow.md` |
| **Ama, cleric (acolyte)** | Found Out in a day and a half, no petals | A capstan shift (Kittiwake), Tolley in the taproom (his own name), the dictated chapter: two witnesses to Bassett | outcomes "Found Out"; `playtest/found-out.md` |
| **Wren, thief (burglar)** | The Letter in one night | The escritoire picked at 23:10, the seal broken, gossip traded, the letter to the North Wind; the feather | outcomes "Letter"; `playtest/letter.md` |
| **Ines, monk (miner)** / **Ned, warrior (sailor)** | Smaller doors | The monk climbs the chain and keeps her coin; the sailor greets the guards and is breathed on | `the-grand-tour-builds.test.ts` |

Autoplay (`the-grand-tour-autoplay.test.ts`) took a bard, a thief, a warrior and a monk, each 300 offered commands
under a different temper (mixed, explore, fight, explore). All stayed sound and replayed identically; the warrior got
up the chain and into the Wind Court; the bard reached the Fire and the Earth; the thief and monk wandered the lower
city. None of them found a petal by chance, which is right; three of them reached the Second Whelming by waiting.

## A company without charm

The warrior-labourer's Undertow is the proof: no persuasion, no lore, no coin beyond the starting purse, and the Door
opened by nightfall on the first day. The acolyte's Found Out is the second: the case is made from three conversations
and a three-hour shift, and Bassett takes it as the Watch takes anything, by writing it down and reading it back.
Charm in Sennet is a shortcut (the bard's song in the Hour Court, the argument with Pumphrey), never a key.

## What is thin

- **The mage** has fewest doors of its own: lore moves the Assembly's question and reads the plaque; nothing in the
  Fire or the Air answers to magic. The House of Doors is a college of mages and the Tour offers a mage very little
  that a scholar background does not.
- **The ranger** has nothing of its own in Sennet. Woodcraft has no city, and the planes are not wild in its sense.
- **Combat** is narrow: the Lists (a salamander), the Rector at the keel if refused, the divers' raid if present. A
  warrior's strength is mostly the capstan.
- **The cleric's rites** close Bethan's story beautifully and do nothing else; insight shows one image at the funeral.
