# Mission 16, deepened: the findings register

The working account of every finding Mission 16 carries, from every source, each with a stable identifier and a
disposition, kept as the work goes rather than written at the end. It continues the first delivery's
[reconciliation](reconciliation.md); where that table said a finding's state, this one says it again with evidence or
says what changed. The [ledger](ledger.md) keeps the running record of work; this keeps the findings.

**Dispositions.**
- **Fixed**: done and verified, with the commit and the regression that would catch it again.
- **Open**: scheduled, with the phase (A–F of the commission) and what would count as done.
- **Partial**: what is done, and precisely what remains.
- **Superseded**: overtaken by a later decision, which is named.
- **Not reproduced**: with the versions, seeds and scenarios tried.
- **Deferred**: on purpose, with the reason and what should bring it back.

**Sources**, by prefix:
- **OWN**, the owner's direct play and the commission of 26 October.
- **M15** and **M16**, those missions' reports, ledgers and reconciliation.
- **AUD**, the independent audit of `ab9055a`.
- **R25**, the independent review of `483e3af` and its readiness memorandum.
- **R26**, the architecture review of `0e066e5`.
- **CP**, the cold playtest of `2684952`.
- Authors' friction reports: **LW** (Low Water), **TS** (What Tessary Owes), **RD** (The Road the Star Came Down), **TH**
  (Thrume), **HG** (The House That Grows) and **PS** (The Patient Star).

A finding is something observed to fail or to read wrongly. A remedy a review suggested, or a design it proposed, is
noted beside the finding it answers, and is not itself a finding until play calls for it.

## 1. Correctness and authority (COR)

| ID | Finding | Source | Disposition | Evidence, or phase and acceptance |
|---|---|---|---|---|
| COR-01 | "Invalid creature conditions" attacking a raiding party | OWN; TS-E3 | Fixed | f911ff2. A fight wrote the weariness it was fought under back onto the fighters; the next weary fight added it again. Reproduced in wren's galleries (two fights by a weary company). `test/weary-fights.test.ts` fails without the repair |
| COR-02 | "Invalid creature conditions" navigating to a cave room | OWN | Fixed (same cause) | An arrival that brings an assault starts its fight through the same `Battle.encounter`; the walk-on-and-fight form is in `test/weary-fights.test.ts`. Open in part: an arrival assault while weary to be shown in a seed by the autoplay sweeps (A) |
| COR-03 | A weary fight left its fighters weary for good, and "needing care" for nothing, after they slept | found with COR-01 | Fixed | f911ff2: what a fight is fought under is held by the fight (`Battle.held`); old saves let it go on opening (`HeldConditions`) |
| COR-04 | Module kinds live in process-global catalogs; the parse cache is keyed by text over them | AUD-F1; R25-B2; R26-N7 | Open (E) | Done when two campaigns' kinds cannot meet in one process (kinds kept with each campaign), shown by the R26 probe |
| COR-05 | A module's actions range over the whole world, not its own places | R25-C2 | Partial | Two actions worded alike are told apart (M15, AUD-F7). Scope to be re-checked when every adventure is installed in one world (E/XIII) |
| COR-06 | Saves trusted by format, not by build; a session's own save carries no stamp | R26-N2; R25-G1 | Partial | The browser's kept game is stamped (M16, af3302e). Open (A): the session save and the downloaded save file carry the build |
| COR-07 | A kept game torn by the browser's quota, silently | R26-N1 | Fixed | M16 af3302e; `test/reader-store.test.ts` |
| COR-08 | A checkpoint taken mid-crossing is inconsistent | R25-A2 | Fixed | M15; `test/checkpoint-race.test.ts` |
| COR-09 | A learned fact blocked every later installation | R25-A1 | Fixed | M15 e0d2d04; `test/crossing-knowledge.test.ts` |
| COR-10 | `{?x}` printed; an observation near a variable taught nothing | R25 item 4; AUD-F5 | Fixed | M15 0efdc56; `authorability-probes` |
| COR-11 | Two changes worded alike: only the first offered | AUD-F7; PS-7 | Fixed | M15; `patient-probes` P4 |
| COR-12 | Presentation inside the authority boundary (perception decided by presentation code; prose stored in the log) | R25-B1; R26 | Open (deferred within D) | Architectural; no player-visible defect traced to it this mission. Brought forward if a defect is |
| COR-13 | A wait cut short is told as done ("You wait until first light", at night) | M16 | Fixed | The engine marks an activity broken off by what came (`cut` on the event); it is told as begun in the action's own words ("You begin to wait until first light."), and what broke it off follows. `test/broken-off.test.ts` (the standalone Long Man's storm cuts a long watch) |
| COR-14 | Every offered action keeps state valid, its actor and costs truthful, its result non-empty and true | OWN (II) | Open (A) | The autoplay laboratory's invariants over varied seeds and tempers, with every failure kept and shrunk |
| COR-15 | Choices grounded afresh in every new world (22 ms in the frontier) | M15 | Deferred | Throughput is not yet the limit on play; revisit with the laboratory's numbers (F) |
| COR-22 | Once a second country is drawn, every command takes about a second (35 times as long) | the laboratory (wren, kin, cleric: 335 s for one run of 150 steps) | Partial | Present before this mission's work (1009 ms a command at 69125e5). Profiled: most of it went on the NPCs' searches for plans that found nothing, watch after watch, chiefly The Patient Star's Garret trying to find his way up to Quell. A goal whose search found nothing is not searched again in a world that has written nothing it reads (the game unchanged: the same 105 commands give the same game, in 43 s rather than 84); and one that looked a long way and found nothing is tried again an hour later (26 s; the game changes only in when such a one tries again). Open (F): what remains is grounding the actions the NPCs still search with |
| COR-16 | `test/smoke-deem.sh` fails in its own verify step | M15 | Fixed | Its proof stepped every other fighter with "defend", which not every fighter has, and then let level-20 opponents kill the creature before its turn; they now hold back (defend, or act on themselves). The script passes |
| COR-17 | Two vacuous tests (`community.test.ts:151`, `wild-country.test.ts:103`) | R25 | Fixed | Each returned early in its seed, so neither had ever tested anything. Both now seek what they test (a willow-teller among the country's people; a wild country with a lookout) and assert it. The willow test then found a real fault: two wild countries' landmarks both called "the old bank" (NAV-04) |
| COR-19 | "Unresolved module import there: x1y0.edge_west": going out to thorn's eastern march-stone | the laboratory (thorn, kin, cleric, mixed; step 53 of 150, made small to four commands) | Fixed | The country beyond (Loftymoor, a mountain land) was drawn with no road west: its one western town had a wall of peaks between it and the edge, and `Borders.make` tried only the nearest town and the outermost cells. It now tries the next town, then cells a little further in; 2 of 160 lands lacked a side, none do now, and a land that has all four is drawn as before. Present at 69125e5. `test/lab-regressions.test.ts` |
| COR-20 | The generated Orsino catalog is behind its generator: regenerating it would give one summoning bombs, turrets, barriers and a phylactery among its constructs | found regenerating for CMB-05 | Open (E) | A deliberate decision on what may be summoned, then regenerate; until then only edits made on purpose are taken from a regeneration |
| COR-21 | A skill taken up with a level was lost at the company's next fight, or the next watch of a torch burning | found making CMB-08's test | Fixed | A creature made again from how it stands in a fight (`CombatProjection.creature`) kept every part of its state but the skills taken up. It keeps them now; `test/creature-lifecycle.test.ts` pins that a creature's whole state comes back from a fight as it went in, and `test/growth.test.ts` keeps climbing through an hour of torchlight |
| COR-18 | Tests teleport rather than journey | R25-H1; R26 | Partial | The autoplay laboratory plays only offered commands; this mission's new specs walk where they can (`test/weary-fights.test.ts` walks by the world's own passages). Open: an audit of the teleporting specs (F) |

## 2. Navigation and geography (NAV)

| ID | Finding | Source | Disposition | Evidence, or phase and acceptance |
|---|---|---|---|---|
| NAV-01 | Too much wandering among towns without finding opportunities | OWN | Open (B) | The starting region's density: an ordinary player meets several kinds of opportunity within a short walk; measured by the laboratory's wanderer and by play |
| NAV-02 | A chosen intention has no place of its own among the ways | OWN | Partial | A place known only by where it is said to be is set out *toward*: "Toward Magnustumul, as far as Bukitzayaar" goes by the ways known to the edge of the wild country it lies in and stops there, saying "You know no way on to Magnustumul" (`test/word-leads.test.ts`). Open (B): the next leg of an accepted undertaking set apart from local ways and roads out |
| NAV-03 | Ways sorted by time, so the gauge shaft and the Hall lane are among the roads out | M16 | Fixed | A way about the settlement or site the company is in is never a way out, however long it takes (`ExitRow.local`, `SceneModel.far`); a way out is one that leaves it, or one over ten minutes from somewhere that is in neither |
| NAV-04 | Two places with one name (two roads "through Dorontaurelin"; two bridges over the Karnahar; two "old banks") | M16; CP-10; RD-B4; COR-17 | Partial | A landmark whose name an earlier wild country has is said with its own ("the great oak in Pharaiyaar"); a road whose proper name an earlier road has is told by the settlement it lies nearer ("the ford of the Āforex by Wǽtheald"), or by both its ends if that is taken too. The first repair told it by where it went ("toward Wǽtheald"), which a newcomer standing in Wǽtheald was offered: a road is walked both ways. No seed of six keeps a duplicate road. Open (D): two people of one name in one place (Erevan and Erevan: a resident and a scenario's person, named by different draws), exits to places named alike (RD-B4) |
| NAV-05 | The map draws the south road hanging from the Drowned Ox; labels cut on a phone | M16 | Open (B/XI) | The map drawn from the places' own geometry, legible at 390 px |
| NAV-06 | The generated mine's galleries give shelter "outdoors" | M15 | Fixed | A deep site's rooms below the mouth are written `underground`; the narrator had climbed past the level and the site to the wild country they lie in. The rules already held them indoors; only the telling changes |
| NAV-07 | The road across a march told from the far country's terrain list | M16 | Open (B) | The land between told by what it is |
| NAV-08 | A placed country's region sky does not join its storm | M16 | Open (B) | The running head's weather agrees with the country's own |
| NAV-09 | Generated sites may be shallow; a minor cave can be mistaken for the reward of a long journey | OWN; CP | Open (B) | Sites differentiated by size and told so before the journey; at least one major authored adventure reached with real depth |
| NAV-10 | Hidden or unreachable authored content | OWN (XII) | Open (E/XIII) | Every installed adventure found and entered from ordinary play |
| NAV-11 | Each of the world's marches named; border knowledge | R25-E2 | Fixed | M15; `test/frontier.test.ts` |
| NAV-12 | Travel to known places, assisted | R25-E3; OWN | Fixed, to deepen (B) | M16 Gate B; `test/travel.test.ts`, `test/newcomer.test.ts` |
| NAV-13 | Passages hidden on any condition; per-end words; their own labels | TH-F5, F6; RD-F6; PS-30, 36; LW-18; TS-W16 | Open (E) | The label of a way into an area entered by more than one way says which way it is |
| NAV-14 | Word of a place leads nowhere: of seventeen things wren's first town told, only the two march-stones could be set out for; word of a lone tower or a pit in the ground named a place no known way went to | OWN (IV, "rumors with actual referents") | Fixed | A scenario's word says where its trouble is and the way there (`leadsTo`, and the new `leadsVia(fact, passage)`: the way in, the trails to where the site's track starts, the track); a site's "way there" carries its route; knowing the lie of a wild country is knowing its paths; a willow-teller's places are places. Asking everything in the first town: wren 2 → 8 places to set out for, a1 → 5, thorn → 7, with every teaching that names a place now leading to it. `test/word-leads.test.ts` |
| NAV-15 | A journey named its destination by its true name before the company knew it ("Frigidusturris" for "a lone tower") | NAV-14's probe | Fixed | Itineraries name a place as the company knows it (`ObservationText.label`); `test/word-leads.test.ts` |
| NAV-16 | A journey planned over a ford in spate, and stopped there saying only "the ford of the Āforex will not let you by from here", three times | the newcomer in mere | Fixed | Journeys are planned over ways open now where there are any, and over ways that ask something of the company (a hazard to risk, a rope, a watcher) only where there are not; a leg that cannot simply be taken is stopped in the words of what stands in the way ("The Āforex is in spate: …") |
| NAV-18 | A journey went on past what was said to the company where it came (the toll-reeve's bar), or stopped there saying only "There is danger here" | the laboratory (mere, thorn) | Fixed | A journey stops where the world says something to the company, in those words' own first sentence ("The bar stays down"); the reeve's words say what going on without paying is ("To go on along the road without paying is to run the lord's toll, and his men will know you again") |
| NAV-17 | The way in, measured again once word leads somewhere: a page-only newcomer goes where the rumours go first | the newcomer | Partial | Across the ledger's eight worlds the lead to the authored adventure is found in 4 to 31 commands (was 12 to 17) and its march-stone reached in 6 to 35 (was 13 to 18), after the rumoured sites: wren's newcomer explores the old workings to the pump-room first, thorn's is stopped by the risen dead on Meósdael's green and by the toll-reeve's men. Open (B): whether the authored adventure should be told of where the rumours are (a notice beside the gossip), judged by play rather than by the policy |

## 3. Combat and progression (CMB)

| ID | Finding | Source | Disposition | Evidence, or phase and acceptance |
|---|---|---|---|---|
| CMB-01 | A lone level-1 protagonist dies in the first fight it meets | OWN; CP-2; the laboratory (wren, step 24) | Partial | Measured: of 48 lone companies played recklessly 30 died, nearly all attacking bands the page had reckoned "beyond you". A careful player (takes on only what is reckoned winnable) still lost 18 of 32, 12 of them in fights that came to it. Traced: three were the toll-road's men after the company had walked on past the bar, unwarned that this was running the lord's toll (now said: NAV-18); three were Sir Hamo's men after a hold-up the laboratory did not answer (the page offers paying, an empty purse, or running); one the hobs on a night road; five were lingering beside a band reckoned deadly. Open (C): a careful player who answers demands, goes back from what is beyond it and keeps off the roads at night, measured again; then the dangers that still come unwarned |
| CMB-14 | Held up on the road by Sir Hamo's men, the company was attacked in the same breath as the demand, and could not pay | the laboratory (thorn, a careful cleric, step 96) | Fixed | The company had once gone up to the hold, where the sentry's horn roused Sir Hamo, and a roused hold's men turned out on whoever was with them, on the road too. The roused hold now turns out about the hold; on the road the band asks first. `test/lab-regressions.test.ts` (fails without it) |
| CMB-15 | A lone company told "you would likely beat them, but someone could fall", when the one who could fall was the one who plays | the laboratory (wren, a lone warrior and the hobs on the gate) | Fixed | Alone: "…but you could fall, with no one to get you up." `test/mage-play.test.ts` |
| CMB-02 | Defeat and casualty text misreports | CP-3 | Partial | M16 55a40fb fixed the fallen, counts and flight. Open (C): the last chosen act unseen before the end; bleeding begun and ended in one round; a member "infected" by their own miss; TS-W23 (the defeat told before the blows) |
| CMB-03 | Rolled qualities cannot be placed | CP-4; M16 | Fixed | The creation page shows six rolls of three dice, one on each quality; choosing one and then another changes them over, and "Roll again" rolls six more. Each quality shows what the people and the calling add, the score it comes to, what it is worth in a fight, and what it is for. The placed rolls go with the protagonist into creation (`rolled`, checked as six rolls of 3–18). `test/creation-choices.test.ts`; the generated-world browser spec places two |
| CMB-04 | A development option shown that cannot be taken, with no reason | M16 | Fixed | Only the skills the world has a use for are offered ("Reading the dead" is a skill only some adventures read); an option the engine does not offer just now says why ("Not while Hild sleeps"). `test/advancement.test.ts` |
| CMB-05 | Techniques in the rules' shorthand, under catalog names | M16 | Fixed | Said as a player would: "One enemy is taunted for 3 turns (a Wisdom save against 19 avoids it)", "You gain ghost touch", "Again after 4 turns", "An arcane cantrip, cast at will"; a save bonus by its harm ("+1 against charms"); what a condition does beyond its figures (Inspired's hit points, Charmed's change of sides, a braced spear's blow against a charge, a riposte against the attacker; a condition with no figures by its own words). Three of Orsino's names said plainly through the translator ("Set Spear", "Steel Yourself", "Marked as Prey"); Orsino's stay in the registry. Handbooks regenerated. `test/mechanics-text.test.ts` |
| CMB-06 | A calling's description against its repertoire (a cleric of death "heals") | OWN; M16 | Fixed | The specialty is named on the sheet (a0827fd); the cleric's words now say what every cleric's prayers are ("Prayers of the god they are sworn to, as that god's domain is: some heal and protect, others curse, drain or call down the storm"); and the creation page offers the specialty ("Sworn to"; "as it falls" if none is chosen) and says what it is and what the protagonist's first prayers or spells are of |
| CMB-07 | A recruit cannot be inspected before hiring | CP-4; OWN | Fixed | Someone willing to join shows, in conversation, what they are and ask ("a human ranger of level 1, asking 3 coin", or more than the company has), how they fight, their qualities, skills and techniques (`CharacterSheets.recruit`). `test/creation-choices.test.ts` |
| CMB-08 | Growth is numbers only; no new ability, spell or approach to acquire | OWN | Fixed | A level's development may be a skill the calling teaches, and the sheet says what it would open that the company has come to: wren's Neblawigil, past the seal-stone, has a drop that wants climbing; a lone warrior gains a level at the inn, sees "Climbing … Opens …", takes it, and goes down (`test/growth.test.ts`). Casters learn a spell each level; feats come at the fifth, tenth and fifteenth. Making it found a fault (COR-21) |
| CMB-09 | Each group of enemies reckoned alone | M16 | Superseded | The engine fights one group to a fight; the reckoning plays that fight |
| CMB-10 | The economy dissolves the stakes | CP-9 | Deferred | No economy simulation in this commission; revisit if rewards in the adventure library make it worse |
| CMB-11 | A spell's hour of preparing unsaid; "Nothing lit" under Light | CP-4, 11 | Partial | Light counted (bb89ad7). Open (C): preparation's time said |
| CMB-12 | Encounter strength not compared with the party's | LW-27 | Partial | The page reckons each danger; lint does not (E) |
| CMB-13 | A temperament that seizes rather than fights; warning patience spent silently; only warning tempers leave a turn | TS-W9, W14, W22; LW-2 | Open (E/VI) | Avoidance and negotiation have room before a fight |

## 4. Narrative and knowledge (NAR)

| ID | Finding | Source | Disposition | Evidence, or phase and acceptance |
|---|---|---|---|---|
| NAR-01 | Characters and institutions dramatically thin; generic people in a commons | OWN | Open (D) | Urban subspaces; people with places, activities and relations |
| NAR-02 | Philosophers: a doctrine and a charisma contest | OWN | Open (D) | A substantial authored intellectual scene, not decided by charisma alone |
| NAR-03 | A topic once asked is gone; inadequate follow-ups | M15; M16; OWN | Fixed | A question put once can be put again, for the same answer and nothing it did done again: "Ask the people at the well again about the Long Man" (`WorldConstructs.recall`, for every `once` topic that asks). A letter given is not given twice. `test/asked-again.test.ts`. (A driver's step "^To the valley road|Out" had matched "ab**out**" in it: anchored) |
| NAR-04 | News word for word in two mouths; rumours alike but for a name | CP-5 | Open (D) | No two people of a settlement give the same line |
| NAR-05 | Greetings fall back on a shared table line after the first meeting | TS-W18 | Fixed | Someone with their own words of greeting is given no stock line afterwards (Cantor Orr, met twice: `test/low-water.test.ts`, which fails without it). A `Greets again` for a return greeting of one's own is left until an author wants one |
| NAR-06 | Night greetings under the sea or indoors | TS-W19 | Fixed | Underground there is no hour for the voice tables; indoors above ground, night is still night (you go out into it). `test/voice.test.ts` |
| NAR-07 | A role is fixed text; who someone is now cannot be said | TS-W20 | Open (E) | `Role … when` alternatives |
| NAR-08 | A rule's words reach the company wherever it is | TS-W1; RD-F9; PS-32 | Partial | `Rule … at place` exists (M15). Open (E): words scoped to an area, told when the company is there |
| NAR-09 | A place told in full on every return | LW-10; TS-W2 | Open (E) | A return told briefly when nothing has changed |
| NAR-10 | A teaching rule puts the fact's text before its own words | LW-4; TS-W11; RD-F17 | Open (E) | The words stand for the fact in the moment |
| NAR-11 | A room not re-told when the company's light changes | TS-W24 | Not reproduced | On main, what a light shows in a room the company stays in is told as what happened (Narrator: "a room a torch shows"). The case met (Tessary's Hall of Oaths) is on its unmerged branch; to be tried there (E) |
| NAR-12 | Notes knowing what nobody said | CP-7 | Partial | A brood never heard of no longer listed (a0827fd). Open (D): the rest |
| NAR-13 | Something heard of and since taken stays "heard, not yet seen" | M16 | Fixed | A heard fact is borne out when what it showed (a thing or a way hidden until it was known) is in the company's hands or has been walked: the dyke-reeve's rod, heard of from Gammer Coller and taken, is "heard, and since seen". `test/the-long-man.test.ts` |
| NAR-14 | Exceptional events in the ordinary register (a body found, a betrayal, a revelation) | M16; OWN | Partial | Chapter ends, levels, deaths set apart (M16). Open (D): authored forms for the rest |
| NAR-15 | The feverwort given as "healing herbs" | M16 | Fixed | The herb-wife sends feverwort, and a willow gives willow bark, each its own item (Kyr's own catalog entries, healing as herbs do); the sick child's mother takes herbs, willow bark or feverwort. `test/origins.test.ts` gives the feverwort and the fever breaks; the world audit takes all three away to make the fever unfinishable |
| NAR-16 | The riddle "I always was, yet never will be" answered "Tomorrow" | CP-5 | Fixed | All 60 of Orsino's riddles read through: that one answered "Yesterday", and five that ask what another already asks left out (two lights, two silences, two stamps, two colds, and the hurricane beside the needle's eye), in an editor's layer of the generator (`OrsinoWorld.corrected`, `.repeated`) so regenerating keeps them. `test/riddles.test.ts` |
| NAR-18 | One substantial companion, with a perspective, a memory and people of his own | OWN (VIII) | Partial | The drover's son, beyond the cart: he keeps to the light underground ("Father would never go under a roof he could not see the end of"), binds a hurt in his father's voice, weighs a heavy purse, sits by his mother at the inn, says what he makes of another who joins, remembers home (the flood year, the eels), and says what he will do after. Said where the company is: his words at the grave, said where he stood, had never been heard while he went with you (anchored to him, who stands nowhere once he joins). `test/goings-on.test.ts`. Open (D): his part in a second adventure; what he remembers of fights and of the dead |
| NAR-17 | Independent undertakings must leave traces and reports | OWN; CP-8 | Partial | The brothers (M16 3491ecd). Open (X): other world processes |

## 5. Presentation (PRE)

| ID | Finding | Source | Disposition | Evidence, or phase and acceptance |
|---|---|---|---|---|
| PRE-01 | The title page is dull | OWN | Open (XI) | |
| PRE-02 | The Character view needs refinement into a real character sheet | OWN | Open (C/XI) | |
| PRE-03 | Town, commerce and navigation pages intolerably busy | OWN; CP | Open (XI) | Situated grouping, not smaller type |
| PRE-04 | The map neither beautiful nor legible with duplicate names or on phones | OWN; M16 | Open (XI) | |
| PRE-05 | Portrait suitability | OWN; M16 | Partial | 42 refused, roles read by work (M16). Open (D): an editorial pass on what the new people are given |
| PRE-06 | An unaffordable purchase invisible | TS-W21 | Fixed | Any choice that wants coin the company has not got (a purchase, a toll, a hire, a bed) is offered without its command: "It costs 7 coin, and you have 3." (`CoinReading`, read as `SkillReading` reads what wants a skill). `test/shops.test.ts` |
| PRE-07 | State names stand as notes ("worn", "hung") | M16 | Open (XI) | |

## 6. Adventure quality (ADV)

| ID | Finding | Source | Disposition | Evidence, or phase and acceptance |
|---|---|---|---|---|
| ADV-01 | Every completed adventure installed and discoverable in one continuing world | OWN (XIII) | Open (E) | Inventory, placement, leads, entry, validation, per adventure |
| ADV-02 | What Tessary Owes assessed and integrated by play | OWN (IX) | Open (E) | |
| ADV-03 | An ending in a placed country closes the whole game | LW-13; TS-E2 | Partial | Tessary's branch carries chapters; to be merged and verified (E) |
| ADV-04 | A company that does not grow in an adventure that is not fought through | TS-E1; RD | Partial | Tessary's branch carries milestones; to be merged and verified (E) |
| ADV-05 | An authored country placed in a world tells of its own protagonist | M15 | Open (E) | The Patient Star's threads |
| ADV-06 | Names shared between adventures found only by hand | TS-W25 | Open (E) | A lint over proper names across modules |

## 7. Authoring and generation (AUT)

| ID | Finding | Source | Disposition | Evidence, or phase and acceptance |
|---|---|---|---|---|
| AUT-01 | A way's opening checked before the module's rules; rules weighed in manifest order | LW-1, 23; TS-W10 | Open (E) | |
| AUT-02 | `carries` reads only members' packs | LW-3 | Open (E) | |
| AUT-03 | A topic cannot take an answer | LW-5 | Open (E) | |
| AUT-04 | Spending one carried item of a kind | LW-6 | Open (E) | |
| AUT-05 | Measures have no ceiling; arithmetic precedence; min, max, division | LW-7; TS-W7; RD-F1, F2; PS-5, 38 | Partial | A floor (M15). Open (E) |
| AUT-06 | `carries(a, x) or carries(a, y)` never offered | LW-8 | Open (E) | |
| AUT-07 | State names share the module namespace | LW-9; TH-F3; PS-35; RD-F21 | Open (E) | |
| AUT-08 | A thing's view does not show the place lines its change altered | LW-11 | Open (E) | |
| AUT-09 | Counters against the clock; dates, periods, a module calendar | LW-12, 19; TS-W6; TH-F9; RD-F11 | Partial | A placed country's days begin at a morning (a0827fd). Open (E) |
| AUT-10 | `Buys` without coin; `Sells` by a non-trader | LW-14, 15 | Open (E) | |
| AUT-11 | Levels must sit in a site; ending precedence by order; a one-way way reported as a duplicate | LW-16, 17, 21 | Open (E) | |
| AUT-12 | Journey driver gaps; a step label matching another's topic; a rule's says missing from `told` | LW-22, 24, 25 | Open (E) | |
| AUT-13 | Companion anchoring: `near` a companion never fires once they travel | TS-W4; RD-B5 | Open (E) | |
| AUT-14 | Handing an item over (`Gives`) | TS-W3 | Open (E) | |
| AUT-15 | No comparison between entities (`?p != x`) | TS-W5 | Open (E) | |
| AUT-16 | An owner's objection that is not hostility | TS-W8 | Open (E) | |
| AUT-17 | A change that remembers its agent | TS-W15 | Open (E) | |
| AUT-18 | Creatures that guard a way | TS-W17 | Open (E) | |
| AUT-19 | Knowledge from a named source, and at a fixture's start | TH-F1; RD-F20 | Partial | `toldBy`, hearsay (M16). Open (E) |
| AUT-20 | People who move on their own errands | RD-F10; TH-F2; HG-13 | Open (E) | |
| AUT-21 | Senses beyond sight; a douse | PS-4; RD-F5; RD-B3 | Open (E) | |
| AUT-22 | Alike things stacked with a count | TH-F14; RD-F18 | Open (E) | |
| AUT-23 | Lint that reads rules | TH-F7; RD | Open (E) | |
| AUT-24 | A promise construct | TS | Open (E) | |
| AUT-25 | Deem: module-local tables and templates, weighted and conditional selection, generated families, naming | M15 | Open (E) | Only what authors met |
| AUT-26 | Hiring adds the hired person's purse | RD-B6 | Fixed | What a recruit had of their own stays theirs: hiring costs the hire and no more or less (the company's coin is its members' purses together). `test/creation-choices.test.ts` |
| AUT-27 | Zero-argument queries need `()`; document it | TS-W13 | Open (E) | The guide says it |
