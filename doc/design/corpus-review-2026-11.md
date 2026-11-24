# The corpus, read for what to prune and what to enrich

*November 2026, for BRIEF §7 ("corpus review informs what to prune and enrich"). It covers the 27 authored works that
lie as provinces of a first country (data/adventures/countries.json), and The Eel Bell. The goings-on the towns draw on
are covered too: afoot, troubles, the undertown and the wild meetings. This is creative evidence for the owner, not a
defect list. No broken contract was observed; one promise not kept is named at the end.*

**How it was read.**

- **The earlier survey.** It starts from *After the inheritance*
  ([repertoire-2026-11-03.md](../adventures/repertoire-2026-11-03.md)), which read 21 of these works closely on 3
  November. That survey's judgments are not repeated, only tested and extended.
- **The new works.** Seven works have been written since: The Book of Faces, The Dorothea, Tallow Deep, The Long
  Muster's Road, The Wrong Boat, The Light on Scarth Holm and Three Nights at Sallowfield. These, and The Eel Bell, are
  read here for the first time.
- **Each work's own spec**, run alone on 24 November (§4). Every one passes.
- **Its size.** Lines of Kyr, the people in it, its acts and its topics.
- **How much of its prose is ledger.** This counts words of debt, dues, tolls, oaths, accounts and bargains, per
  thousand words of the strings a player reads.
- **What its authors wrote** in its critique and friction pages.
- **Which countries hold it.** The supported fixture, Iscoed, holds five of the 27 (data/imbar/atlas.json): Merrowdale
  (The Long Man), the Strewnfield (The House That Grows), the Ossel delta (What Tessary Owes), Tolleth (The Dorothea)
  and Scarth Holm. A first country drawn without the atlas holds all 27.
- **The towns' generated goings-on**, sampled fifty times each with the Deem workbench (`bin/kyrie deem sample
  kyrt:…`).

## 1. In brief

1. **The collection is strong, and it is no longer one story.** The earlier survey was right that the newer works
   moved depth from cosmology toward social life. The anthology of 7 November moved it again: toward country that
   does not care who walks through it, and toward forms other than the hearing. Those forms are:
   - a pursuit (The Wrong Boat);
   - a defence (Sallowfield);
   - a siege by the tide (Scarth Holm);
   - a crossing (the Muster's Road);
   - a cave system with an ecology (Tallow Deep);
   - a craft (The Eel Bell).
2. **The ledger is a minority, but it sits where the player begins.**
   - **Most of the corpus is not ledger.** Across the 28 works the median is under one ledger word in a thousand.
   - **The ledger works are dense.** What Tessary Owes is 5.6 in a thousand, The Third Night 2.5, The Wrong Boat 2.4,
     The Dorothea 2.2 and Low Water 1.8.
   - **The ledger is in the supported fixture and its first hour.** Iscoed's five provinces include Tessary (debt as
     physics, 5.6) and the Dorothea (2.2). Its first town's undertown is a set of jobs paid in coin. Its stock
     opening's drove is held for a count four short.
   - **The result.** A player of the supported slice meets "what is owed" more than the corpus as a whole would make
     them.
   - **The ledger as an object is everywhere, even where the plot is not about owing.** 23 of the 28 works name a
     ledger three times or more: The Book of Faces 114, What Tessary Owes 68, Low Water 54, Quittance 53, A Parliament
     of Books 47, The Dorothea 35. The earlier survey put "an honest ledger-holder companion" under a moratorium. The
     prop outlived the moratorium. One grep over a draft (`ledger`) is a cheap editor's check before it is handed in.
3. **Size is not quality, and the largest works are the hardest to enrich.**
   - **The largest.** The Book of Faces is 12,131 lines and 173,000 words of prose, nearly a fifth of the whole
     corpus (915,000). Quittance is 6,172 lines and Gosse's Company 6,377.
   - **The two smallest.** Scarth Holm is 782 lines and The Eel Bell 610, and both have a form nobody else has.
   - **Recomposable variation comes most cheaply from the small works.** Each has one law and one form, so it can
     become a kit.
4. **The generated goings-on are thinner than the authored corpus around them** (§5).
   - Every first town's undertown has the churchyard's dead and the quarry's spiders (50 of 50).
     (Since 24 November each has a second cause, the sexton's bone-pickers and the quarry's she-bear, drawn about half
     the time; Iscoed's first town keeps its own. The heath is left for a later slice.)
   - (Corrected, 24 November: the pilgrim's trouble is two options, the road where the country has a posting-house and
     the tree where it has none. The sample was drawn with no station, so every draw was the tree.)
   - A heath's meeting is always yarrow (50 of 50).
   - The provinces vary a great deal; the town that frames them hardly varies.

## 2. The worst fifth: prune, salvage or decompose

Six works. Each is named with what to do and why, and with what should survive it.

| Work (country) | Do | Why, by evidence | What survives |
| --- | --- | --- | --- |
| **Thrume** (Thrume) | **Decompose** | Six parts in 1,494 lines, with 38 people: about 385 words of prose a person, the thinnest of any work in the corpus (the median is about 800). The earlier survey found large designed branches unwritten. Its spec (thrume-depth, 16) proves depth, not the parts between. | **Saltgrave**, the salt town where people pay to sleep, is a town no other work has. It belongs as its own province. **The Shoulder Hall** belongs as a giants' hall in the deep-site kit. The dream palace and the abyss are summaries; let them go. |
| **Let One Remember** (the Corrow) | **Salvage the first act** | Four of its five acts are planar summary at a scale the engine cannot inhabit (its own friction page). Its whole campaign is one 415-step journey in its spec: proof that it can be walked, not that the later acts are played. | **"Telling is acting":** knowledge is weight, and Hightown sinks or rises by who knows its name. This is one of the most original mechanisms in the corpus. Keep the civic first act as a province. Make the mechanism an Occasion other towns can use (§3). |
| **Hold One Season** (the Ghessil Uplands) | **Salvage the opening, prune the tiers** | A five-tier campaign written without reference to Kyr (its README). It opens on debt enforcement, the ledger again. The slowness it advertises is said more than played (the earlier survey; its own 38-finding ledger). | **The light that slows whatever drinks it,** with people standing in it alive since autumn. That is a wonder and a dilemma in one image. Keep the plateau and its held dying as one province, not five tiers. |
| **Quittance** (Quittance) | **Decompose into a casebook** | 6,172 lines and 92 people; 259 acts, the most after The Book of Faces. Nineteen specs, the most of any work. Its Hearing is its own weakest scene (its own critique). Its settlement descends to the creditor-fire, an obligation again. | **The thirteen insurance cases** are the corpus's best breadth of small moral situations. They should be a kit: a case is a claimant, a loss, a truth and a lie, and an Office's rule. Cases drawn by seed would then serve any city of offices, not one. |
| **The Book of Faces** (Ombra) | **Prune for length, keep the face system** | Ten authors, one tone, turns of 100 to 135 words against a 90-word cap. Its Hearing and its finale are its own named weaknesses (06-status-and-critique). It is nearly a fifth of the corpus's prose and the largest load. | **The face system:** a Bare in a city that answers faces, every conversation in two registers with a price in heat. The Concord's rules are done to the player, never explained. Its critique already asks for it to be made structural ("a Face system the next adventure can read"). Do that, and cut the prose by a third. |
| **The Wrong Boat** (the Aldwater) | **Salvage the form, re-premise the stake** | The pursuit is the corpus's only one, and it works (its spec). But its engine is a box taken against a debt, chased by a toll-clerk's widow who is owed. At 2.4 ledger words a thousand it is the third most ledgered work, in 1,023 lines. Its own page lists what pursuit cannot yet show: the pursuer at a distance, a search, the moving boat. | **The two barges nobody can tell apart,** and a chaser on a timetable the company can only learn of. Give the box another reason to be wanted (a love token, a stolen song) and the pursuit stands on its own. |

What does *not* belong here, though it is ledger:

- **What Tessary Owes** is the purest ledger in the corpus, and it is excellent: obligation as physics, an honest alien
  clerk, a tidal dungeon (26 pass). It is the reason the others should not be ledger. It is also one of Iscoed's five,
  so the supported slice should hold it beside works that are not about owing (§4).

## 3. The best fifth: deepen into recomposable variation

Six works. Each has a form or law that could carry many places. For each, the kit or template that would carry it.

| Work | What it does that nothing else does | The kit that would carry it |
| --- | --- | --- |
| **The Eel Bell** | A craft with feedback in the fiction. The founder reads the charge by its colour. Bronze can be pared up but never down. The bell has two voices, with two different failures. A botched pour is lived with. Ledger 0.0 a thousand. The doctrine's "one excellent focused activity". | **A craft trial (an Occasion):** a material gathered from people with reasons; a reading by a master; an adjustment that is irreversible one way; a result with two qualities that serve two needs. A charm-maker, a dyer, a brewer, a boat-builder, a bell for any town with a tide or a fire. |
| **The Light on Scarth Holm** | A presence that is a Thing, not a Person: it cannot be fought, and has three states and a position. No combat anywhere. The company is held on the rock by the tide until the next low water. 782 lines. | **A night held in** (a template): a place cut off by tide, snow or flood for one night; a presence with positions that every rule reads; a household of strangers each with a reason to be there. Lighthouses, inns in snow, a ferry stranded, a manse in flood. |
| **The Liberty of the Ice** | Lying as a craft with consequences: a false identity and a flock, entry by confidence or by hiring. The earlier survey's strongest expansion of agency. | **A con** (an Occasion): a persona, a flock of hired believers, a mark's tells, a ledger of claims that must agree (the one ledger that earns its keep). A fair, an auction, a court of a minor lord. |
| **Half the Hive** | A community dividing and leaving, not restored. The swarm's dance learned as a language. Sensuous and warmer than the house voice. Ledger 0.2. | **A community's choice** (a template): two futures and a sign-language to read them, and people who surrender something for each other. Migrations, a village to be drowned by a dam, a guild choosing to leave a city. |
| **Three Nights at Sallowfield** | A defence nobody asks the company to make. Their time is spent on the village. The adversary reads the party rather than moves. | **A defence by preparation** (a kit): posts, measures and people who can be steadied, the night told as movements. Its friction page names what the engine lacks for it to deepen: a battlefield, a moving adversary, survivors as states. Those are engine rows, not authoring. |
| **The Long Man** | The corpus's original miniature. Watch the weather and the water, read traces, persuade people to put back what they took. One of Iscoed's five. | **A custodian's situation** (a template): a commons and its negligent but comprehensible keepers; a physical sign that something was taken; persuasion, not combat. The earlier survey says it supplied the template repeated after it. It is the right one to make explicit, so the repeats become variation, not copies. |

Close behind:

- **The Lull** (one day in seven).
- **Behind the Wainscot** (scale as a social fact).
- **The Third Night** (the two mothers).
- **Tallow Deep**, the corpus's real dungeon. Its ecology (spiders eat the bats and the rats; the slump eats guano) is
  what the generated undertown lacks. It should be the model for deep sites' ecology rules, not a seventh kit.

## 4. The works, briefly

The spec is the work's own, run alone on 24 November. Lines are Kyr; ledger is words a thousand.

| Work (country) | For | What works | What is thin | Ledger? | Kyr lines / people | Spec (pass, time) |
| --- | --- | --- | --- | --- | --- | --- |
| **The Long Man** (Merrowdale; in Iscoed) | danger, wonder | the miniature: weather, water, traces, persuasion | its courage is scale; the template others copied | the steward's forty crowns, lightly | 985 / 13 | the-long-man: 14 pass, 14 s |
| **Thrume** (Thrume) | danger, wonder | Saltgrave, a town where people pay to sleep | six parts at 385 words a person | no | 1,494 / 38 | thrume-depth: 16 pass, 8 s |
| **The House That Grows** (the Strewnfield; in Iscoed) | wonder | a law that plays: it grows where nobody watches | the sourcebook around the teacher and apprentice | no (0.1) | 1,170 / 17 | house-that-grows: 17 pass, 11 s |
| **Let One Remember** (the Corrow) | wonder, civilizational difference | telling is acting: knowing is weight | four planar acts told, not inhabited | no | 2,322 / 54 | let-one-remember: 24 pass, 130 s |
| **Hold One Season** (the Ghessil Uplands) | wonder | a light that slows whatever drinks it | five tiers; slowness said more than played | opens on debt enforcement | 2,843 / 48 | hold-one-season: 15 pass, 21 s |
| **Low Water** (the Bowl of Ammerlin) | civilizational difference | a measurement and a hearing: Act I is a high point | a creditor-horror Interval ten times the size | yes: a creditor (1.8) | 3,065 / 24 | low-water: 16 pass, 72 s |
| **What Tessary Owes** (the Ossel delta; in Iscoed) | comedy, civilizational difference | obligation as physics; an honest alien clerk | solvable early, then waited out; the Board a vote | the ledger itself (5.6) | 2,487 / 34 | what-tessary-owes: 26 pass, 116 s |
| **The Third Night** (the vale of the Wray) | danger, grief | the two mothers; eleven outcomes grown from acts | the middle sags; Maudie's agency narrow | a toll rising (2.5) | 2,870 / 38 | the-third-night: 19 pass, 65 s |
| **A Parliament of Books** (Calamy) | comedy, wonder | books as political persons; the Stacks | a polity solved by the right readings | bonds of books (1.3) | 3,777 / 84 | parliament-of-books-arcs: 8 pass, 31 s |
| **Gosse's Company** (the vale of the Arle) | comedy | the wing scene; a theatre as a workplace | the play itself mostly watched | no (0.5) | 6,377 / 91 | gosses-company: 31 pass, 154 s |
| **The Liberty of the Ice** (Pellam on the Lisk) | comedy, appetite | lying as a craft with consequences | the conspiracy still laid before authority | bondhouse labour (1.5) | 3,161 / 39 | liberty-of-the-ice: 10 pass, 26 s |
| **The Banns at Hessel** (the Lim valley) | romance, comedy | households, matchmaking, embarrassment | the Ball an authored convergence | no (0.6) | 2,526 / 28 | hessel: 31 pass, 107 s |
| **A Winter in Carth** (the Levels of Gaunt) | comedy, danger | the farm against the city; a funny heretic | the trial returns to hearing grammar | penance bought and sold (1.2) | 2,438 / 36 | winter-in-carth-callings: 9 pass, 27 s |
| **Fair Weather** (the Gannet Reach) | danger, civilizational difference | a town that lives off wrecks; the dog | a culprit mystery ending in a court | wreck law (1.1) | 1,842 / 18 | skeel-placed: 2 pass, 71 s |
| **Half the Hive** (the Wold of Hume) | romance, civilizational difference | a community leaving; the bee dance | the swarm's choice still a climax | no (0.2) | 1,968 / 26 | half-the-hive-revised: 5 pass, 13 s |
| **The Lull** (the Lull) | wonder, civilizational difference | one day in seven; work and rest at odds | the world-law outweighs its people | no (0.2) | 2,098 / 31 | the-lull: 25 pass, 57 s |
| **The Quiet in the Sky** (Larum and the Pass) | grief, wonder | the first wound the player gives | middle days uneven; fear underdeveloped | no (0.6) | 1,887 / 26 | quiet-in-the-sky-revised: 4 pass, 8 s |
| **Behind the Wainscot** (the Hollins country) | wonder, comedy | the Lady meets the people in her walls | the middle week empties after the discovery | no (0.6) | 2,255 / 33 | hollins: 20 pass, 69 s |
| **The Grand Tour** (Sennet) | comedy, wonder | planes as satires with rules | one witty register; the mystery deduced | no (0.3) | 3,368 / 39 | the-grand-tour: 3 pass, 32 s |
| **Quittance** (Quittance) | comedy, civilizational difference | thirteen insurance cases | the Hearing; people recur less than a city needs | yes: the city owes the fire (1.4) | 6,172 / 92 | quittance-world: 1 pass, 9 s |
| **The Book of Faces** (Ombra) | civilizational difference, danger | a city that answers faces; a price in heat | ten authors, one tone; long turns; thin Hearing | no (1.1) | 12,131 / 100 | the-book-of-faces-revision: 12 pass, 20 s |
| **The Dorothea** (Tolleth and the Skerrow passage; in Iscoed) | danger, wonder | a passage that is a place: the company walks her decks | routes listed as built and not played (the critical review) | the ship's ledger and bonds (2.2) | 2,549 / 39 | dorothea-routes: 6 pass, 14 s |
| **Tallow Deep** (Tallow Edge) | danger | a dungeon with an ecology, four ways in | bargains must take no time; creatures have no errands | tolls and smuggling (0.8) | 1,290 / 20 | tallow: 10 pass, 26 s |
| **The Long Muster's Road** (the Hesper Fells) | danger, civilizational difference | a crossing; a question at the far end | a companion's death a dice rule; no deadline | no (0.6) | 1,951 / 39 | muster: 3 pass, 20 s |
| **The Wrong Boat** (the Aldwater) | comedy | the only pursuit | the stake is a debt; the pursuer unseen | a box taken for a debt (2.4) | 1,023 / 20 | wrongboat: 27 pass, 29 s |
| **The Light on Scarth Holm** (Scarth Holm; in Iscoed) | danger, romance | a presence that cannot be fought; held by the tide | the Caller cannot name your own dead | no (0.5) | 782 / 8 | skerrow: 42 pass, 57 s |
| **Three Nights at Sallowfield** (the vale of the Brimble) | danger | a defence nobody asks for | the battle a table; most branches unspecced | the soldiers unpaid (0.5) | 1,105 / 19 | sallowfield: 49 pass, 146 s |
| **The Eel Bell** (not placed) | appetite, civilizational difference | a craft with feedback: colour, two voices | a narrow tuning loop; no market for more metal | none (0.0) | 610 / 8 | eelbell: 12 pass, 26 s |

## 5. What the towns draw on

The towns' goings-on, fifty seeds each (`bin/kyrie deem sample kyrt:<file> … --n 50`, then `compare`):

| Kyr template | Group: options drawn in 50 |
| --- | --- |
| town/undertown.kyrt | store: rats 43, runaway 4, apprentice 3 · yard: dead 50 · pit: spiders 50 · hand: acolyte 20, tinker 16, sellsword 14 |
| town/afoot.kyrt | afoot: cow 17, feud 14, wedding 12, and one other |
| town/troubles.kyrt | pilgrim: tree 50 with no station given (the road where there is one) · thief: Hesper 26, traveller 24 · animals: tune 26, vixen 24 |
| wild/meetings.kyrt | heath: yarrow 50 · fell: shepherd 35, wolf 15 · fen: eeler 27, lights 23 · wood: four · meadow: two · any: three |

- **The authored provinces vary enormously and the frame does not.**
  - **The undertown is every first town's dungeon, and two of its three ways down never vary.**
  - **The cheapest enrichment in the whole corpus** is a second option for each one-option group. That means the yard,
    the pit and the heath (not the pilgrim: see §1). Each is an afternoon's authoring in a template already written, and it changes
    every first hour.
- **Two of the best fifth are kits for exactly these groups.**
  - A craft trial (§3) is an afoot.
  - A night held in is a trouble.

## 6. One promise not kept

No broken contract was observed: every work's spec passes. One promise was made and not kept:

- **The Eel Bell is not in data/adventures/countries.json**, so no first country holds it. It plays only
  standalone. This is already in the register as AU-60: placing it changes every new world's generation, so it waits
  for a migration of the golden walk taken in one go. It is not a new defect. But it is the best small work in the
  corpus, and no player can meet it in a world.
- **The cheapest single act of enrichment is to place it.** It needs a province with a fen and a tide-bell; Iscoed's
  fen and firth suit it. Do it with the next migration of the golden walk, as AU-60 says.
