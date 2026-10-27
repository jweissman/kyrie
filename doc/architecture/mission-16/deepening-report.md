# Mission 16, deepened: report

The second commission of Mission 16 (26 October) asked to go from one successful journey to a robust, densely
playable world: to find and repair the fault behind "Invalid creature conditions", to build an autoplay laboratory
that plays the game as a player does, to reconcile every finding under a stable name, to make the starting country
and its towns worth walking, to give the adventurer a real sheet and real growth, and to put every completed adventure
into one continuing world (its section XIII). While the work went on, the owner asked for four more things: that the
independent architecture review of `d79cbbd` be taken into the record and closed where it could be; that two new
adventures waiting on branches, *The Third Night* and *A Parliament of Books*, be brought in; that every open finding
be closed where it could be; and that the play-structure investigation of `6596e18` (an investigation of what keeps
an ordinary session from being worth repeating, made on a review branch) be read for more to do, and folded into the
register so that nothing in it is lost.

The running record is the [register](register.md), where every finding has a stable identifier and a disposition.
This report says where each part of the commission stands. No one outside this session has played this build. Every
play described here is mine, or that of a policy I wrote.

## In short

| Part | Stands |
|---|---|
| 1. Invalid creature conditions | Found and repaired at its cause (f911ff2): a fight wrote the weariness it was fought under back onto its fighters, and the next weary fight added it again. Both reported routes had the one cause |
| 2. The autoplay laboratory | Built (44b1be4) and in use: generated worlds played through offered commands only, by several tempers, every step checked, every failure kept with what makes it again and made small. It found eight faults that play had not. A sweep of 12 games (2,496 commands, 159 journeys, 11 countries entered, 186 days of the world in six minutes) broke nothing; its deaths are measured, and one taught the way onto a pass after dark to ask again |
| 3. Every finding | 203 findings under stable names: 93 fixed and verified, 42 partial with what remains, 63 open and scheduled, 2 deferred, 1 superseded, 2 not reproduced |
| 4. Density and navigation | Word leads somewhere: what a town tells is a place to set out for, by a way it names. A page-only newcomer finds the authored adventure in 4 to 31 commands in eight worlds. The starting country's density is still the commission's open question |
| 5. Character and combat | Qualities placed by hand, a specialty sworn to, techniques in a player's words, developments that say why not, growth that opens play, a recruit seen before hiring. The economy put on a village's scale (one ruin was 13 times every shop's stock; it is 4) and experience to each who stood, so a companion is no cost. Survivability measured, the unwarned deaths traced. A lone first-level character is still fragile |
| 6. Adventures in one world | Nine authored countries in one generated world, each where its seed puts it, each told of, each reachable: one career entered all nine by offered commands (seed kite: 386 commands, 786 hours, 28 regions), and was the same game kept and opened again. None yet played to its end inside one career |
| 7. Towns, companions, talk | One substantial companion (the drover's son, who now reads the trail to the den and wants his grandfather's yoke back), talk that keeps, greetings of a person's own for a return, rules that speak where the company is. Two scenes of thought not decided by charisma: the disputation by reasons, and A Parliament of Books. The towns' people are still thinly drawn |
| 8. A continuing world | One career through nine countries (the tour); six expeditions into one mine, re-recorded under the new prices; a resolution that leaves a successor |
| 9. Independent play | None of this build. The play-structure investigation played `6596e18`, before its findings were answered |
| 10. What remains | Below: the page first (the square's links, the conversation's bookkeeping, Notes as a plan, the map), renewal for the other origins and goings-on, the early game (traps, flight, a first assault, things worth buying), sameness, the engine contract, and the authors' language requests |

## 1. "Invalid creature conditions"

**The cause.** `Battle.encounter` adds what a fight is fought under (the laws of the place, `weary`, `ready`) to its
fighters as conditions that last until they are removed. `Battle.commit` then wrote every such condition back onto
the creatures. The next fight fought while weary added `weary` again. Two conditions with one identifier and one
source fail the creature store's validation, and the command stopped with "Invalid creature conditions".

**The repair** (f911ff2). What a fight is fought under is held by the fight (`Battle.held`) and never written back.
A game kept before the repair, with the doubled condition already on its creatures, opens and lets it go
(`HeldConditions`). The two reported routes (attacking a raiding party; walking into a cave room where an assault
waited) both start their fight through `Battle.encounter`, and both are in `test/weary-fights.test.ts`, which fails
without the repair. The same fault had left weary fighters weary for good, and "needing care" for nothing, after
they slept (COR-03).

**Trust in what a creature is, beyond that.** The architecture review found more of the same family, and they are
closed: a companion raised in a fight stayed slain (its A4); cures matched by display name, a stance's end struck the
attacker, stuns cost nothing, and a drainer was healed after death (A5, the catalog-wide check of every ability
still open); one foe fleeing ended the whole fight as a win (A15); a skill taken up with a level was lost at the next
fight (COR-21).

## 2. The autoplay laboratory

**What it is** (44b1be4; `src/autoplay`, `scripts/autoplay.ts`). A run draws a world from a seed, makes a protagonist
of an origin, a people and a calling, and plays it through the game's own offered commands and journeys: no
teleports, no injected facts. Its players have tempers (a wanderer; one who travels toward what it has heard of; a
fighter who withdraws when the page says a fight is beyond it; an investigator; one who rests, equips and recruits;
one who goes out on an expedition and comes back; and deviations from all of these), drawn from a seeded stream.
Every step is checked against what play must keep true: every creature as the rules allow, the result of every
command non-empty and true, the game kept and opened again the same game. A failure is written out with its seed,
the build, the world's draw, every command, the move that failed and the game as last kept, and is shrunk by delta
debugging to the fewest commands that make it again. A separate encounter laboratory fights a thousand battles on
the engine alone, fast.

**What it found** that play had not: a country drawn with no road west, which stopped a crossing (COR-19); the
roused hold's men falling on a company on the road in the same breath as their demand (CMB-14); a lone company told
"someone could fall" when the one who could fall was the player (CMB-15); a journey that went on past the toll-reeve's
bar, or stopped saying only "There is danger here" (NAV-18); the measured survivability of lone and careful players
(CMB-01); and the second of a second's cost of every command once a second country was drawn, nearly all of it the
NPCs searching for plans that found nothing (COR-22, from a second to a quarter of one).

**Throughput,** reported as play had rather than commands per second. A sweep at the end of the mission: 12 games (seeds wren, kite and seed2; the wanderer's and the debt's
origins; a warrior and a mage of each seed's peoples; the mixed temper; 200 steps each, kept and opened again every
25). No invariant was broken. They played 2,496 commands of 12 kinds, arrived at the end of 159 journeys, entered 11
countries beyond the first and 337 places, and lived 186 days of the world's time, in 353 seconds: 7.1 commands a
second, a month of the world in a minute. Five companies ended, every one of them alone: two in fights, and three
mages without one. One of those walked onto a pass after dark with two hit points left, and the pass's cold took
them; the way onto an unsheltered place after dark now asks again, as the camp there does (PT-41).

## 3. Every finding

The [register](register.md) carries every finding from every source, each under a stable identifier: the owner's
own play and commission, the earlier missions, the independent audit, two independent reviews, the cold playtest, the
authors' friction reports for Low Water, What Tessary Owes, The Road the Star Came Down, Thrume, The House That Grows
and The Patient Star, and, since the owner asked, the independent architecture review of `69125e5` and its addendum
at `d79cbbd`, and the play-structure investigation of `6596e18`. Of its 203 findings, 93 are fixed and verified,
each with the commit and the test that would catch it again; 42 are partial, with what remains; 63 are open, with
the phase and what would count as done; 2 are deferred and 1 superseded, with the reason; and 2 were not reproduced,
with the runs tried.

### The architecture review

The review (`doc/architecture/next-phase-independent-review/`, merged at `0d48c89`) found seven high, eight medium
and four low findings in its first part and twenty-five more in its addendum, each with a probe. They are section 8
of the register under the review's own names. Closed, with the probe's case as a test:

- **Correctness of what happens.** A count taken past nothing is one rule, kept by `apply` and `admits` alike: the
  changes an effect list makes to a count are summed and the sum stops at nothing (A18). Text says what its condition
  bound (A17). A Kyr string reads every escape (A25). A module installed late reads the clock as its own however it
  reads it, through a query or in arithmetic too, and an action's times are no longer moved twice (A14). A rule writes
  only what its condition binds (A9, in part). A Rule can be written `once` (M2, in part).
- **Determinism.** A game opened from its save is the game played on, in every order a rule or a receipt can read
  (A11), and each step of a transcript keeps a digest of the game after it, which a replay and a game opened by its
  own build are held to (H6, in part). What a campaign means no longer turns on what else the process has done (H7,
  in part). The worker plays one game, one command at a time, and keeps a state only beside its world (A2, A3).
- **Boundaries.** What the engine writes is named once, and no module may write it (A8). Only the named rules are
  shared; a module's own rules file is its own (A7). Any action the rules offer can be done by its id, and what was
  done is worded by the engine (H2). The world's time and what the company perceives are the runtime's, and the layer
  order of `src` is a test with its debt listed (H2, A10).
- **The page telling truth.** A way is told barred or guarded as the rules have it; those heard in the dark are not
  shown with their health; the rest with nothing to eat is said as what it is (H5, in part). Real names no longer leak
  where the page shows an alias (A13). The company is told what it saw, as it happened (A6).
- **Smaller defects:** a summon's id, milestones met far off, a key shared by outcomes and resolutions, a group a
  recruit left (A22); a failed exposure's fixed English (L1); failures said rather than swallowed (M8, in part).

Open, with what they need: the engine contract the rule library has become (H3); generators that write Kyr in
TypeScript (H4, beyond its smallest fixes); combat with exactly two teams (M5, which the commission's "no armies"
leaves); closed English word lists in general code (M4); hidden registries (M6); party membership's lifecycle (M7);
identity in id strings (L2); stale performance figures and the planner's frontier (L3); the reproducibility of
installs (L4); the catalog-wide test of every ability's text against its execution (A5); and the rest of A9, A16,
A19, A23 and A24.

### The play-structure investigation

The investigation (`doc/playtests/play-structure-2026-10-26/`, merged at `3b19f13`) played the real page with offered
choices only, measured the economy, class viability, renewal and sameness across 12 to 24 countries, and proposed
concrete numbers. Its findings are section 9 of the register, PT-01 to PT-42, each cross-named with any earlier row
it saw again. Answered, each with a test that fails without it:

- **The economy** (22982a2), by its direction's numbers: the makers' valuables at a fifth of their worth, room coin
  smaller, buyers' purses on a village's scale, a raising 150, a going-on 300 experience. Measured with its census over
  12 seeds: a big ruin's coin and treasure, median 3,534 to 1,142; the richest site against every shop's stock, 13 to
  4. A won fight is half of Orsino's reward to each who stood, not the whole shared, so a companion costs nothing; a
  lone character's fight experience in a big ruin, 8,562 to 4,281: the third level, not the fifth. The origins' debt
  and errand are seen through and worth 300. Warriors start in mail. Two long descents were played on from where the
  new prices broke them (the glossary waits for the second return; one trip buys a raising or the glossary).
- **Honest ways and words** (17ceefd, 4ae70c1): a one-way way says so and asks again; a journey goes on past those
  who let the company by and stops before a one-way way; a failed risk says who fell and to what; a trap set off from
  a pole's length says it went off on nothing; the fallen say what follows, which no cure changes; warned off, every
  choice that would spend the patience says so; a night where the cold comes down asks before the camp is made; in the
  dark a caster's light is offered where the dark is.
- **Talk and threads** (17ceefd, d79e96e, 008881f): the hire is asked for as itself; a reason told badly is not lost;
  a dispute stays in the notes until settled; Feverwort's mother knows the herb-wife's errand; the brood's feeding is
  found where the world says; a game taken up again opens on what the company was about; the drover's ruts are a
  thing to follow; a band that lets the company by says so.
- **A successor** (d79e96e): found, the drover's cart points on. His son read the trail to the den nearest the town,
  and wants the yoke back; dealt with, the den gives it up, and it hangs over the hearth. A scenario can now be linked
  to another's placement in the same country without claiming a site, so no other placement moves.

Open from it, with what each needs: the other origins' successors and a renewal floor (PT-01, PT-29); things worth
buying (PT-02's sinks); the town square's thirty links and the conversation's bookkeeping (PT-09, PT-42, with
PRE-03); consumables in fights (PT-07); class viability and a first assault's moment (PT-10, PT-11); non-combat loops
(PT-14); sameness across countries (PT-15); more than one calling's answer to a trap (PT-20); flight and grinds
(PT-23, PT-24); one place's two names (PT-22); the map (PT-27); and the rest of section 9.

## 4. Density and navigation

**Word that leads somewhere** (f25d8d1). Of seventeen things wren's first town told, only the two march-stones could
be set out for. Now a scenario's word says where its trouble is and the way there, by the passages the world itself
holds; a journey sets out toward a place known only by where it is said to be, goes by the ways the company knows to
the edge of the wild country it lies in, and stops there saying what it does not know. A journey stops where the
world says something to the company, in those words, and is planned over ways that are open before ways that ask
something of the company.

**Measured.** A page-only newcomer policy, across the ledger's eight worlds, finds the lead to the authored adventure
in 4 to 31 commands and reaches its march-stone in 6 to 35, after the rumoured sites (NAV-17).

**Place clarity.** Two places of one name are told apart (NAV-04, in part); ways about a settlement or site are never
listed among the roads out (NAV-03); two ways into one enclosure are told by where they arrive, or by their own names
(NAV-13); a place come back to is recalled, not told again in full (NAR-09).

**Open.** Whether the starting country holds enough to do within a short walk (NAV-01) is still the commission's
open question, measured by the laboratory's wanderer but not settled by play. The map's legibility on a phone
(NAV-05), the road across a march told from the far country's terrain list (NAV-07), a placed country's sky (NAV-08),
and telling a minor cave from the reward of a long journey (NAV-09) are open.

## 5. Character, progression and combat

**The sheet and its choices.** Qualities are rolled and placed by hand, each saying what it is worth in a fight and
what it is for (CMB-03); the specialty is sworn to on the creation page and named on the sheet (CMB-06); techniques
are said as a player would say them (CMB-05); a development that cannot be taken now says why (CMB-04); a recruit
shows what they are, ask and can do before being hired (CMB-07); what costs more coin than the company has is shown,
with its price (PRE-06).

**Growth that opens play** (CMB-08). A level's development may be a skill the calling teaches, and the sheet says what
it would open that the company has come to. Experience comes from what a company resolves, not only from fights:
`Milestone … worth N when …` (ADV-04), and a module seen through. A milestone met by others far from the company is
not the company's (the review's A22).

**The economy and experience** (22982a2). See section 3: one ruin no longer buys the shop twice over, and a
companion no longer halves what one earns.

**Combat.** Of 48 lone companies played recklessly, 30 died, nearly all attacking bands the page had reckoned "beyond
you"; a careful player still lost 18 of 32, 12 of them in fights that came to it (CMB-01). The unwarned deaths were
traced and repaired where they were the game's fault (the toll, the hold-up, the lone company's warning). What remains
is that a first-level character alone is fragile, which is partly the game's old-school intent and partly not yet
settled.

## 6. The adventures in one world (XIII)

**Inventory.** Nine authored adventures are installed in the codebase, each as a standalone campaign and as a country
a generated world can hold: *The Long Man* (Merrowdale), *Thrume*, *The House That Grows* (the Strewnfield), *Let One
Remember* (the Corrow), *The Patient Star* (the Ghessil Uplands), *Low Water* (the Bowl of Ammerlin), *What Tessary
Owes* (the Ossel delta), and, brought in at the owner's word, *The Third Night* (the vale of the Wray) and *A
Parliament of Books* (Calamy).

**One world.** Every one is placed in one generated world (c5d85ed). The first country's marches lead where its folk
have always told: the Long Man north, Tessary east of a fen, Wrayford south of a mountain country, and the one
independent adventure its seed chose. Every other lies one to a region further out, beyond a country drawn from the
seed that is the way into no other, with every way in still reachable. A march toward a country entered from
elsewhere says so ("no road goes over into it from this side. The way in is from Highfells, they say"), and the folk
speak of countries further off.

**Validated.** The library tour (`scripts/library-tour.ts`; seed kite, Wenna, a human warrior) is one career through
all nine authored countries by offered commands only, each heard of from someone in a taproom before it is entered:
Merrowdale at command 14 (hour 14), the Corrow at 35 (hour 53), the Strewnfield at 117 (221), Thrume at 189 (352), the
Ossel delta at 213 (397), Calamy at 243 (453), the Ghessil Uplands at 295 (587), the vale of the Wray at 353 (734) and
the Bowl of Ammerlin at 385 (786): 386 commands, 786 hours of the world's time, 28 regions drawn, no fight. Kept and
opened again, it is the same game. Its first run stopped at Calamy: two adventures had declared one kind of thing
(ADV-10), repaired. Entered is not the same as played through: each adventure's own tests play its outcomes, its
saves and its continued play in its standalone campaign, and, for Tessary, The Long Man and Low Water, placed in a
generated world (ADV-02 to ADV-08). No adventure has yet been played to its end inside one continuing career.

**Editorial.** A lint keeps every surname, one-word name and proper place-name to one adventure (5f730ca), and now
every kind of thing too (d7bc674: the tour found What Tessary Owes and A Parliament of Books each declaring a
`letter_kind`, and a career could not go from one to the other). Bringing in the two new adventures cost seven names
(Clea Keddle, Sella Quenby, Copyists' Row, the Stationers' Hall, the Tansleys, Signature XVII, the Fore-edge) and one
kind. Tessary and Calamy were both introduced as a tidal city of paper; where they are told side by side, Calamy is
told by its books (3f3cf4e).

**Kyr and Deem.** What the authors could not say, and can now: news that waits for the company (`Rule … within`),
who someone is now (`Role "…" when P`), a way opened by a rule open at once, a Rule that happens `once`, a return
greeting of a person's own (`Greets again`), arithmetic with precedence and parentheses, `distinct` for "a place
other than the Ranks", braces and quotes in strings, a late country's clock as its own. A module's own rules file is
its own. Deem's module-local tables (AUT-25) were not needed by any author this mission and were not built.

## 7. Towns, companions, dialogue and visuals

**A companion with a perspective** (e84e49f). The drover's son, beyond the cart: he keeps to the light underground,
binds a hurt in his father's voice, weighs a heavy purse, sits by his mother at the inn, and says what he makes of
what the company does. Words said near a companion are heard once they have joined (79f650c).

**Talk.** A question once asked can be asked again (NAR-03); a person with their own greeting is not given the
tables' line afterwards, and can have their own for a return (NAR-05); a rule's words are told where the company is
(NAR-08); a teaching rule's words stand for what it teaches (NAR-10); who someone is now can be said (NAR-07).

**Two scenes of thought** (NAR-02). The disputation on the green is decided by reasons, what the country's own history
says, told with lore or seen with an eye for people; arguing a philosopher down wins the day and is gone by morning.
*A Parliament of Books* is a substantial authored intellectual scene: the Parliament of the Bound puts and polls its
clauses by what its members hold, with no persuasion roll in it. Neither is a debate engine.

**Open.** The towns' people are still generic in a commons (NAR-01); news word for word in two mouths (NAR-04); exceptional events in the ordinary register (NAR-14). The title page, the
character view as a real sheet, the busy town pages, the map, and state names standing as notes (PRE-01 to PRE-07)
are open.

## 8. A continuing-world journey

**One world, one company.** On kite, the tour's career begins as a stranger at the first town's inn and
ends at the lip of the Bowl of Ammerlin a month of the world's time later, having crossed into every authored country
by its own march: *"Up the north road there is Merrowdale,"* says the innkeeper Sable, and the south road comes up out
of the willows into a dale of black earth; *"East over the march, where the cold country comes down to the sea …
there is Calamy, at the mouth of the Calam"*, and a raised causeway of black stones crosses the saltings toward a town
of roofs and masts. Twenty-eight countries are drawn as it goes; the game is kept and opened again at the end and is
the same game.

**One expedition, kept.** The wren descent, re-recorded this mission under the new prices and callings: a warrior,
a dwarf minstrel who comes as a cleric now (dwarves are no bards), and later a dwarf mason, go down into the Delvers' mine six times from
Gothgiba. Thoradin falls in the first expedition and is raised for 150 coin at the shrine; the glossary of the old
script has to wait for the second return, because one trip buys a raising or the glossary and not both; the heart of
the vein comes up into daylight at first light on the eighth day, with all three standing (`test/descent.test.ts`,
KYRIE_LONG=1, with thorn, d4 and a1).

**One resolution, and what follows it.** In kite the drover who did not come home is found under his cart; his son,
who read the trail from the ditch, says what took the oxen dens at Thorn Hole, the cave nearest the town and wants his
grandfather's yoke back; the den dealt with, the yoke comes up from among the bones and hangs over the hearth again
(`test/oxen.test.ts`).

## 9. Independent play

None of this build. The play-structure investigation played `6596e18` on a review branch, before its findings were
answered here; like the cold playtest and the reviews, it is evidence of what this mission set out to repair, not of
whether it did. The autoplay laboratory, the library tour and the investigation's own lab scripts, run again here
(its census, its fragile-start audit), are policies, not independent evaluation.

## 10. What remains, and what next

By the register, 63 findings are open and 42 partial. The largest, in the order the evidence argues for:

1. **The page.** A town square of thirty links, people and destinations twice, far roads listed inside a ruin
   (PT-09, PRE-03); a conversation that costs an operation to open and another to leave, 3.2 operations for each
   meaningful act (PT-42); Notes as a ledger rather than a plan (PT-25); the map neither legible nor to be clicked
   (PRE-04, NAV-05, PT-27); the title page and the character view (PRE-01, PRE-02); state names as notes (PRE-07).
   The investigation's direction drafts the remedy (an intention strip, conversations without bookkeeping, Notes as a
   ranked plan). This is the next mission's first work.
2. **Renewal.** One successor is built, the drover's, with the links that make more cheap; the debt, the errand, the
   fever and the wanderer have none, and no country is held to a floor of clocked situations near the company
   (PT-01, PT-29). Errand sites hold one reading and nothing else (PT-40).
3. **The early game.** A first-level character alone is fragile (CMB-01, PT-10, PT-11); every trap has two answers,
   trapwork or a pole (PT-20); flight fails and foes resistant to weapons grind (PT-23, PT-24); a carried thing cannot
   be used in a fight (PT-07); the economy's other half, things worth buying, is not built (PT-02).
4. **Sameness.** A third of a country's sentences recur word for word in most others; the same den, raiders, toll
   and buyer in every country (PT-15, NAR-04); two people of one name in a square (PT-28).
5. **The engine contract.** The rule library's names are still the engine's hidden interface: this mission a shared
   relation added for the camp took an adventure's own of the same name (ARV-H3). With generators that write Kyr in
   TypeScript (H4), English word lists in general code (M4), hidden registries (M6), party membership (M7), identity in
   ids (L2), the catalogs still the process's (H7), and the remaining parts of A5, A9, A19, A23 and A24.
6. **The authors' language.** Nineteen requests from the friction reports are open (AUT-02 to AUT-24): each small,
   together a language mission (a topic that takes an answer, spending one of a kind, `Gives`, people on their own
   errands, senses beyond sight, lint that reads rules).

**Next missions:** the page, as above; renewal, by the links, for every origin and going-on; the early game; and the
engine contract, a declared rule library whose names a module cannot capture and a catalog the campaign owns.
