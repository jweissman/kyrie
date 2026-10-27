# Mission 17: the register

Mission 17 inherits [Mission 16's register](../mission-16/register.md): 203 findings, of which 105 were open or
partial when it ended. Every one of those 105 is carried here under its own identifier, with its source and its
Mission 16 disposition, the gate of this mission that answers it, and its disposition now. The Mission 16 register
stays the record of what was fixed there and with what evidence; nothing fixed there is re-proved here unless a
change threatens it. Findings new to this mission are added at the end under `M17-`.

**Dispositions** are Mission 16's: Fixed (with the commit and the test), Partial (what is done, what remains), Open
(the gate and what would count as done), Superseded, Not reproduced, Deferred (with the reason, and what would bring
it back). A finding a redesign makes moot is Superseded by name, never dropped.

## Accounting

| | Fixed | Partial | Open | Superseded | Deferred | Not reproduced | Total |
|---|---|---|---|---|---|---|---|
| Inherited, at the start | 0 | 42 | 63 | 0 | 0 | 0 | 105 |
| Inherited, now | 0 | 42 | 63 | 0 | 0 | 0 | 105 |
| New in Mission 17 | 2 | 0 | 0 | 0 | 0 | 0 | 2 |

## Gate A: foundations (correctness, contracts, verification)

| ID | Finding | Mission 16 | Now | Evidence, or what remains |
|---|---|---|---|---|
| ARV-A23 | Combat constants and ids hard-coded; field time lacks battle's dice and lapse | Open | Open |  |
| ARV-A24 | The download lacks the story log; autosaves re-serialize everything; a country can be drawn twice at once | Partial | Partial | 32c71e0: the download carries the story; a drawing under way is waited for, not drawn again. Open: autosave re-serializes all events; migrations scattered; transcript version |
| ARV-A5 | Cures by display name, stance endings that hit the attacker, stuns that cost nothing, a drainer healed after death | Partial | Partial | Fixed: a cure lifts what it names by id, the id it stands for, its kind of harm or its name (cure disease lifts the Diseased, the restorations Kyr's Poisoned); a stance that ends on answering a blow ends, from its holder, whether the blow lands; a condition … |
| ARV-H3 | The Kyr rule library is the engine's hidden ABI: names, feature detection, resolver vocabulary | Open | Open | Seen again on 26 October: a shared relation added for the camp's warning (`exposed`) took The Long Man's own `exposed(group)` for itself, and three of its tests failed; renamed `unsheltered`. Nothing yet stops a name added to the library from capturing a … |
| ARV-H5 | Presentation reads omniscient truth (foe HP in the dark) and re-derives rules incompletely (passage legality, rest labels, daylight) | Partial | Partial | 4a77120: a way is told barred or guarded as the rules have it for this company (a grate it holds the key to, a guard that lets it by, are no bar; a hazard not noticed is not named); in the dark, those heard are not shown with their health; the rest with … |
| ARV-H6 | Determinism asserted, not verified: locale-dependent combat AI, one combat stream, unchecked resume and replay | Partial | Partial | 741b004: ties broken by ids as written, not by the host's language (`test/tie-order.test.ts`); 6596e18: a game opened is the game played on, in every order (A11); c5c5e54: each step of a transcript keeps what the game was after it (the world's key, the hour, … |
| ARV-H7 | Process-global caches (item kinds, parse cache, concurrent loads) make meaning depend on process history | Partial | Partial | c4c317a: the item-use caches are kept by the kind and its use, the parse cache by the text and the kinds it was read among, and campaigns load one at a time through to their own kinds (`test/catalog-isolation.test.ts`); f5ba7e3: the planner's count of what a … |
| ARV-L2 | Identity encoded in id strings | Open | Open |  |
| ARV-L3 | Stale performance figures; per-command frontier work; the planner re-sorts its frontier | Open | Open |  |
| ARV-L4 | Reproducibility of installs (github: tarballs, TypeScript ranges) and of history (a force-push) | Open | Open |  |
| ARV-M5 | Combat has exactly two teams | Open | Open |  |
| ARV-M7 | Party membership has no public lifecycle; two companion systems; generated member ids in authored text | Open | Open |  |
| ARV-M8 | Exceptions swallowed where failures change the game or hide from lint | Partial | Partial | 8e6aa91: a save slot that will not read is listed as unreadable; an action whose grounding throws (for anything but its many bindings) is an error lint says; a game the engine could not keep is said to the page, which tells the player and offers the save, as … |
| COR-04 | Module kinds live in process-global catalogs; the parse cache is keyed by text over them | Partial | Partial | The same as the architecture review's H7 (see ARV-H7): c4c317a keys the item-use caches by kind and use and the parse cache by the kinds a text was read among, and loads campaigns one at a time through to their own kinds; fb78983 keys a module's own files so … |
| COR-05 | A module's actions range over the whole world, not its own places | Partial | Partial | Two actions worded alike are told apart (M15, AUD-F7). Scope to be re-checked when every adventure is installed in one world (E/XIII) |
| COR-06 | Saves trusted by format, not by build; a session's own save carries no stamp | Partial | Partial | The browser's kept game is stamped (M16, af3302e). Open (A): the session save and the downloaded save file carry the build |
| COR-12 | Presentation inside the authority boundary (perception decided by presentation code; prose stored in the log) | Open | Open | Architectural; no player-visible defect traced to it this mission. Brought forward if a defect is |
| COR-14 | Every offered action keeps state valid, its actor and costs truthful, its result non-empty and true | Open | Open | The autoplay laboratory's invariants over varied seeds and tempers, with every failure kept and shrunk |
| COR-18 | Tests teleport rather than journey | Partial | Partial | The autoplay laboratory plays only offered commands; this mission's new specs walk where they can (`test/weary-fights.test.ts` walks by the world's own passages). Open: an audit of the teleporting specs (F) |
| COR-20 | The generated Orsino catalog is behind its generator: regenerating it would give one summoning bombs, turrets, barriers and a phylactery … | Open | Open | A deliberate decision on what may be summoned, then regenerate; until then only edits made on purpose are taken from a regeneration |
| COR-22 | Once a second country is drawn, every command takes about a second (35 times as long) | Partial | Partial | Present before this mission's work (1009 ms a command at 69125e5). Profiled: most of it went on the NPCs' searches for plans that found nothing, watch after watch, chiefly The Patient Star's Garret trying to find his way up to Quell. A goal whose search found … |

## Gate B: the first fifteen minutes (the page)

| ID | Finding | Mission 16 | Now | Evidence, or what remains |
|---|---|---|---|---|
| CMB-02 | Defeat and casualty text misreports | Partial | Partial | M16 55a40fb fixed the fallen, counts and flight. Open (C): the last chosen act unseen before the end; bleeding begun and ended in one round; a member "infected" by their own miss; TS-W23 (the defeat told before the blows) |
| CMB-11 | A spell's hour of preparing unsaid; "Nothing lit" under Light | Partial | Partial | Light counted (bb89ad7). Open (C): preparation's time said |
| CMB-12 | Encounter strength not compared with the party's | Partial | Partial | The page reckons each danger; lint does not (E) |
| NAR-12 | Notes knowing what nobody said | Partial | Partial | A brood never heard of no longer listed (a0827fd). Open (D): the rest |
| NAV-02 | A chosen intention has no place of its own among the ways | Partial | Partial | A place known only by where it is said to be is set out *toward*: "Toward Magnustumul, as far as Bukitzayaar" goes by the ways known to the edge of the wild country it lies in and stops there, saying "You know no way on to Magnustumul" … |
| NAV-04 | Two places with one name (two roads "through Dorontaurelin"; two bridges over the Karnahar; two "old banks") | Partial | Partial | A landmark whose name an earlier wild country has is said with its own ("the great oak in Pharaiyaar"); a road whose proper name an earlier road has is told by the settlement it lies nearer ("the ford of the Āforex by Wǽtheald"), or by both its ends if that … |
| NAV-05 | The map draws the south road hanging from the Drowned Ox; labels cut on a phone | Open | Open | The map drawn from the places' own geometry, legible at 390 px |
| PRE-01 | The title page is dull | Open | Open |  |
| PRE-02 | The Character view needs refinement into a real character sheet | Open | Open |  |
| PRE-03 | Town, commerce and navigation pages intolerably busy | Open | Open | Situated grouping, not smaller type |
| PRE-04 | The map neither beautiful nor legible with duplicate names or on phones | Open | Open |  |
| PRE-07 | State names stand as notes ("worn", "hung") | Open | Open |  |
| PT-09 | About thirty peer links in a town square: people twice, destinations twice, far roads listed inside a ruin | Open | Open | Same as PRE-03: one button per person, destinations once, no far roads inside a site |
| PT-18 | A thing's use the interface withholds (moss that binds a wound) gives no reason | Open | Open | A withheld use says what it needs |
| PT-22 | One place, two names (Pluwalac, and "a square doorway in a hillside"), and it drops out of "Set out for" a leg away | Open | Open | Once its name is known, used everywhere; a known destination stays in the list |
| PT-25 | Notes is a ledger, not a plan: "Unfinished" drops threads (the philosophers) and keeps dead ones (willow bark) | Partial | Partial | 17ceefd: the disputation is unfinished until it is settled (arguing a philosopher down for the day had taken it out of the notes), and says so when neither will hear the company (`test/disputation.test.ts`). Open: Notes as a plan, ranked, with a way to set out |
| PT-27 | The map is not clickable, and its labels overlap | Open | Open | Same as PRE-04 and NAV-05 |
| PT-28 | Names hard to tell apart: two fords of the Tatharrant, two Emrics in one square | Partial | Partial | Same as NAV-04 (places told apart, M16); people of one name in one square open |
| PT-42 | A conversation's framing is most of the page's bookkeeping: in an instrumented session 14 of 24 interface operations opened or left one, … | Open | Open | Under 3 operations for each meaningful act, rerun with the driver on its seed, the portrait conversation kept |

## Gate C: the dense region (placement, perception, density, variety, renewal)

| ID | Finding | Mission 16 | Now | Evidence, or what remains |
|---|---|---|---|---|
| ADV-01 | Every completed adventure installed and discoverable in one continuing world | Partial | Partial | c5d85ed: every authored country in one world, each where its seed puts it (Countries.plan: the first country's marches as its folk always told, the rest one to a region further out, every one reachable; closed marches say where the way in is; far rumours tell … |
| ADV-05 | An authored country placed in a world tells of its own protagonist | Open | Open | The Patient Star's threads |
| ADV-07 | The Third Night integrated into the one world | Partial | Partial | 8165869: Wrayford, beyond the south march of a mountain country as its author put it, with its standalone campaign, its tests (46, on main) and its two engine changes; a far rumour of its own; two surnames it shared given up by the adventures that had them … |
| NAR-01 | Characters and institutions dramatically thin; generic people in a commons | Open | Open | Urban subspaces; people with places, activities and relations |
| NAR-04 | News word for word in two mouths; rumours alike but for a name | Open | Open | No two people of a settlement give the same line |
| NAR-14 | Exceptional events in the ordinary register (a body found, a betrayal, a revelation) | Partial | Partial | Chapter ends, levels, deaths set apart (M16). Open (D): authored forms for the rest |
| NAR-17 | Independent undertakings must leave traces and reports | Partial | Partial | The brothers (M16 3491ecd). Open (X): other world processes |
| NAV-01 | Too much wandering among towns without finding opportunities | Open | Open | The starting region's density: an ordinary player meets several kinds of opportunity within a short walk; measured by the laboratory's wanderer and by play |
| NAV-07 | The road across a march told from the far country's terrain list | Open | Open | The land between told by what it is |
| NAV-08 | A placed country's region sky does not join its storm | Open | Open | The running head's weather agrees with the country's own |
| NAV-09 | Generated sites may be shallow; a minor cave can be mistaken for the reward of a long journey | Open | Open | Sites differentiated by size and told so before the journey; at least one major authored adventure reached with real depth |
| NAV-10 | Hidden or unreachable authored content | Open | Open | Every installed adventure found and entered from ordinary play |
| NAV-17 | The way in, measured again once word leads somewhere: a page-only newcomer goes where the rumours go first | Partial | Partial | Across the ledger's eight worlds the lead to the authored adventure is found in 4 to 31 commands (was 12 to 17) and its march-stone reached in 6 to 35 (was 13 to 18), after the rumoured sites: wren's newcomer explores the old workings to the pump-room first, … |
| PT-01 | A resolution ends in "Nothing more is asked of you": no thread leaves a successor | Partial | Partial | d79e96e: a scenario can be linked to another's placement in the same country (`links`: no site is claimed, and no other placement moves), with modules installed only `when` the link is bound. The drover's successor is the first: found, the cart points on by … |
| PT-08 | A clue named in a place (the ruts) is reached only by the generic "Search here" | Partial | Partial | 008881f: the drover's ruts, which the road speaks of, are a thing to follow ("Follow the ruts over the edge"), and following them finds the cart as searching does (`test/oxen.test.ts`). Open: the raider holds' smoke-hole and souterrain draught, which their … |
| PT-15 | A third of each country's narrated sentences appear word for word in three quarters of the others; the same den, raiders, toll and buyer in … | Open | Open | Same as NAR-04: variants by terrain and seed; props once a site; the four common modules rotated |
| PT-16 | Journeys stop for a staged scene already seen, for "danger" from hobs parleyed with, for a "set upon" that was a light going out; they … | Partial | Partial | 17ceefd: a journey goes on past those who let the company by; stops for a staged scene only when something new is seen there; is set upon only by a fight fought; and does not take a way that goes one way (`test/play-structure.test.ts`). Open: warning before a … |
| PT-29 | Renewal depends on whether a country drew a clocked situation near the player | Open | Open | A renewal floor: one clocked situation within a day's walk, the next promoted when one ends, voiced at the inn |
| PT-31 | A route's estimate jumps fivefold once the way is told; a journey arrives at night despite "go in daylight" | Open | Open |  |
| PT-32 | A warn-off that succeeds changes nothing: the robbers stay, with the same options | Partial | Partial | 008881f: a band faced down or talked round says so beside its name, "letting you by" (`test/play-structure.test.ts`). Open: it stays where it was, as it was given leave to, and attacking it is still offered and reckoned as before |
| PT-33 | "Don't touch nothing" has no teeth: looting the forecourt draws no reaction | Open | Open |  |
| PT-35 | Wonderful objects with no use (the jar of noonlight, the bronze mirror) | Open | Open | A ruin's unique object has a use there |
| PT-40 | A quarter of first ruins hold no hostile band and nothing else to do inside (68 of 253 reached): the trip's reward is one reading | Open | Open | An errand's site holds a second thing to do there (a rival, a machine to work, a find) |

## Gate D: authoring (the studio, the language, Deem)

| ID | Finding | Mission 16 | Now | Evidence, or what remains |
|---|---|---|---|---|
| ARV-A19 | Generated "Ask … again" copies often dead, chosen by English wording; condition grammar from word endings | Partial | Partial | 16bbaa7: a copy no longer waits on what its asking taught, and only a question that did nothing but teach is asked again: no dead copy in Tessary or a generated country (`test/asked-again-live.test.ts`). Open: the choice of which topics are questions still … |
| ARV-A9 | The compiler accepts unbound and ill-typed effect variables; binding-check holes; query types depend on asking mode | Partial | Partial | 3a16d4a: a Rule writes only what its condition binds, an `or` binding only what both its sides bind (`test/rule-writes-bound.test.ts`: the probe's unbound, negated and one-sided cases); d78a6a5: `distinct` tests what is bound and binds nothing, so one asked … |
| ARV-H4 | Generators author plots in TypeScript that emits Kyr text | Partial | Partial | 80bc1e7: the generated argument's priest speaks only while able; a wanderer comes along the site's own passage, not "the gallery". Kept by decision: the willow topic stays the world's, not the fever's: willow bark is RegionGrowth's gatherable, good for any … |
| ARV-M2 | Kyr too large at the leaves, too small in the middle (no once-only rule, money, timers; dead Exit and Budget) | Partial | Partial | b89eed5: `Rule … once` happens the first time its condition holds, and never again, keeping its own latch (`test/rule-once.test.ts`; the guide's "The order things happen in"). Kept by decision: Exit and Budget are not dead; they are the forms the writer gives … |
| ARV-M3 | Five composition mechanisms; unfilled placeholders pass silently; .kyrt values unescaped | Partial | Partial | 869ccb5: a work's words go into its Kyr escaped (`test/failed-exposure.test.ts`). An unfilled placeholder that is no entity is already refused as the module is read ("Text names unknown entity"). Open: an unfilled placeholder that names an entity by chance; … |
| ARV-M4 | Closed English word lists and name regexes classify content in general code | Open | Open |  |
| ARV-M6 | Hidden registries and central edit points (work plans, region generators, rule modules, origins, the title page's list) | Open | Open |  |
| AUT-02 | `carries` reads only members' packs | Open | Open |  |
| AUT-03 | A topic cannot take an answer | Open | Open |  |
| AUT-04 | Spending one carried item of a kind | Open | Open |  |
| AUT-05 | Measures have no ceiling; arithmetic precedence; min, max, division | Partial | Partial | A floor: a count taken past nothing stops there (M15), and by one rule for a whole effect list (4361761, the review's A18). 5c6fd6f: a product is taken before a sum and parentheses group (`(fare(actor) - 1) * 2`), a roll in parentheses still Deem's … |
| AUT-06 | `carries(a, x) or carries(a, y)` never offered | Open | Open |  |
| AUT-07 | State names share the module namespace | Open | Open |  |
| AUT-08 | A thing's view does not show the place lines its change altered | Open | Open |  |
| AUT-09 | Counters against the clock; dates, periods, a module calendar | Partial | Partial | A placed country's days begin at a morning (a0827fd); 3835188: a late installation reads the watch as its own however it reads it (the review's A14); b89eed5: a Rule written `once` happens the first time and never again. Open (E): `day(clock)` and a calendar … |
| AUT-10 | `Buys` without coin; `Sells` by a non-trader | Open | Open |  |
| AUT-11 | Levels must sit in a site; ending precedence by order; a one-way way reported as a duplicate | Open | Open |  |
| AUT-12 | Journey driver gaps; a step label matching another's topic; a rule's says missing from `told` | Open | Open |  |
| AUT-14 | Handing an item over (`Gives`) | Open | Open |  |
| AUT-16 | An owner's objection that is not hostility | Open | Open |  |
| AUT-17 | A change that remembers its agent | Open | Open |  |
| AUT-18 | Creatures that guard a way | Open | Open |  |
| AUT-19 | Knowledge from a named source, and at a fixture's start | Partial | Partial | `toldBy`, hearsay (M16). Open (E) |
| AUT-20 | People who move on their own errands | Open | Open |  |
| AUT-21 | Senses beyond sight; a douse | Open | Open |  |
| AUT-22 | Alike things stacked with a count | Open | Open |  |
| AUT-23 | Lint that reads rules | Open | Open |  |
| AUT-24 | A promise construct | Open | Open |  |
| AUT-25 | Deem: module-local tables and templates, weighted and conditional selection, generated families, naming | Open | Open | Only what authors met |

## Gate E: progression, the early game, companions

| ID | Finding | Mission 16 | Now | Evidence, or what remains |
|---|---|---|---|---|
| CMB-01 | A lone level-1 protagonist dies in the first fight it meets | Partial | Partial | Measured: of 48 lone companies played recklessly 30 died, nearly all attacking bands the page had reckoned "beyond you". A careful player (takes on only what is reckoned winnable) still lost 18 of 32, 12 of them in fights that came to it. Traced: three were … |
| CMB-13 | A temperament that seizes rather than fights; warning patience spent silently; only warning tempers leave a turn | Partial | Partial | Documented (778328c and before): only a creature that warns leaves the company a turn for anything but a fight, and a warning should name its price and the alternative, since each thing done while warned spends its patience (the guide's "The company and the … |
| NAR-18 | One substantial companion, with a perspective, a memory and people of his own | Partial | Partial | The drover's son, beyond the cart: he keeps to the light underground ("Father would never go under a roof he could not see the end of"), binds a hurt in his father's voice, weighs a heavy purse, sits by his mother at the inn, says what he makes of another who … |
| PRE-05 | Portrait suitability | Partial | Partial | 42 refused, roles read by work (M16). Open (D): an editorial pass on what the new people are given |
| PT-02 | One ruin per country pays a median 3,789 coin and treasure (8.75 times every shop's stock) and 8,390 fight experience; errands pay 0 to 150 | Partial | Partial | 22982a2: the makers' valuables and a site's object at a fifth of their worth (the crown 300), room coin from (1 + d20 + 10·depth) to (1 + d6 + 3·depth), a town's buyer's purse 600 and a village's 120, a raising 150 (it was 300), a going-on 300 experience and … |
| PT-07 | A fight offers no use of a carried thing, though the foe is "vulnerable to fire" and the pack holds alchemist's fire | Open | Open | Consumables usable in a fight where the engine allows |
| PT-10 | A five-hit-point mage dies before acting; 55% of hostile groups fall on the company without a warning turn | Open | Open | The fragile-start audit (351 scripted runs to a first ruin) found a death before the player's first turn rare (5 runs, all one seed's situation); what kills the fragile is the trap (PT-20) and the night (PT-41). Done when the first assault gives the company a … |
| PT-11 | Alone at level 1, the big ruin's fights are won by a warrior 80% of the time, a cleric 25%, a thief and a mage never | Open | Open | Same as CMB-01: the opening offers non-warriors a companion; class viability rerun |
| PT-14 | No performance for a bard, no talking down a toll, no trade, no work at the inn | Open | Open | One non-combat loop each, starting with two |
| PT-20 | Every trap has the same two answers, trapwork or a ten-foot pole; a lone mage with neither walks into it: 9 of the 14 solo mages who fell … | Open | Open | More than one calling has an answer to a trap; the audit rerun, a solo mage's trap deaths fall |
| PT-23 | Fights against foes that resist weapons become grinds; a spell can show no effect at all | Open | Open |  |
| PT-24 | Flight fails again and again, and the foes fled from follow | Open | Open |  |
| PT-38 | Plate at the start makes ordinary foes harmless ("a common foe needs 20"); a site's worthiest band reads "no match for you" to a fresh … | Partial | Partial | 22982a2: a warrior starts in ring mail, scale or chain, never plate (in its place in the table, so every other draw is as it was; `test/play-structure.test.ts`). It showed a blow below nothing that threw mid-fight (a maul's die and a drained strength): … |

## New in Mission 17

| ID | Finding | Source | Disposition | Evidence, or what remains |
|---|---|---|---|---|
| M17-01 | Every command of a long game copied the whole log: the engagement's withdrawal read the campaign's `events`, a deep copy, to find where the company came from (17% of a long journey's time) | M17 profile (Gate A) | Fixed | It reads the log as it is kept (`history`). What Tessary Owes's 365-command journey: 40 ms a command, 25 after; 14.7 s of play, 9.2 s. The suite's pages are unchanged step for step (471 steps of four games compared with the tree before) |
| M17-02 | A city of many rooms spent three quarters of every command on its passages: the chart, the itineraries and the exits each asked again what every way from every known place was, through every fact the world holds | M17 profile (Gate A) | Fixed | Each place's ways are read once for each world (worlds do not change), through the relation's own index; a declared name is looked up, not searched for in a copy of every declaration; a test journey builds its page once a step, not two to four times. A Parliament of Books: 85 ms a command, 31 after; What Tessary Owes: 25, then 17. The suite: 975 s and 189.5 test-minutes at the start, 712 s and 130 after, 1,103 passing |
