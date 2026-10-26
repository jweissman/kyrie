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
| COR-13 | A wait cut short is told as done ("You wait until first light", at night) | M16 | Open (A) | The action contract: a result agrees with what happened |
| COR-14 | Every offered action keeps state valid, its actor and costs truthful, its result non-empty and true | OWN (II) | Open (A) | The autoplay laboratory's invariants over varied seeds and tempers, with every failure kept and shrunk |
| COR-15 | Choices grounded afresh in every new world (22 ms in the frontier) | M15 | Deferred | Throughput is not yet the limit on play; revisit with the laboratory's numbers (F) |
| COR-16 | `test/smoke-deem.sh` fails in its own verify step | M15 | Open (A) | Runs, or is removed with its reason |
| COR-17 | Two vacuous tests (`community.test.ts:151`, `wild-country.test.ts:103`) | R25 | Open (A) | Each asserts what it claims |
| COR-18 | Tests teleport rather than journey | R25-H1; R26 | Partial | The autoplay laboratory plays only offered commands; this mission's new specs walk where they can (`test/weary-fights.test.ts` walks by the world's own passages). Open: an audit of the teleporting specs (F) |

## 2. Navigation and geography (NAV)

| ID | Finding | Source | Disposition | Evidence, or phase and acceptance |
|---|---|---|---|---|
| NAV-01 | Too much wandering among towns without finding opportunities | OWN | Open (B) | The starting region's density: an ordinary player meets several kinds of opportunity within a short walk; measured by the laboratory's wanderer and by play |
| NAV-02 | A chosen intention has no place of its own among the ways | OWN | Open (B) | "Toward your destination": the next leg of an accepted undertaking set apart from local ways and roads out |
| NAV-03 | Ways sorted by time, so the gauge shaft and the Hall lane are among the roads out | M16 | Open (B) | A road out is a way that leaves the place's site or settlement |
| NAV-04 | Two places with one name (two roads "through Dorontaurelin"; two bridges over the Karnahar) | M16; CP-10; RD-B4 | Open (B) | Names distinct within a country, or told apart by what is beyond |
| NAV-05 | The map draws the south road hanging from the Drowned Ox; labels cut on a phone | M16 | Open (B/XI) | The map drawn from the places' own geometry, legible at 390 px |
| NAV-06 | The generated mine's galleries give shelter "outdoors" | M15 | Open (B) | Underground places report underground |
| NAV-07 | The road across a march told from the far country's terrain list | M16 | Open (B) | The land between told by what it is |
| NAV-08 | A placed country's region sky does not join its storm | M16 | Open (B) | The running head's weather agrees with the country's own |
| NAV-09 | Generated sites may be shallow; a minor cave can be mistaken for the reward of a long journey | OWN; CP | Open (B) | Sites differentiated by size and told so before the journey; at least one major authored adventure reached with real depth |
| NAV-10 | Hidden or unreachable authored content | OWN (XII) | Open (E/XIII) | Every installed adventure found and entered from ordinary play |
| NAV-11 | Each of the world's marches named; border knowledge | R25-E2 | Fixed | M15; `test/frontier.test.ts` |
| NAV-12 | Travel to known places, assisted | R25-E3; OWN | Fixed, to deepen (B) | M16 Gate B; `test/travel.test.ts`, `test/newcomer.test.ts` |
| NAV-13 | Passages hidden on any condition; per-end words; their own labels | TH-F5, F6; RD-F6; PS-30, 36; LW-18; TS-W16 | Open (E) | The label of a way into an area entered by more than one way says which way it is |

## 3. Combat and progression (CMB)

| ID | Finding | Source | Disposition | Evidence, or phase and acceptance |
|---|---|---|---|---|
| CMB-01 | A lone level-1 protagonist dies in the first fight it meets | OWN; CP-2; the laboratory (wren, step 24) | Open (C) | Danger made intelligible before commitment, and early danger calibrated to the actual company; measured by the encounter laboratory across companies |
| CMB-02 | Defeat and casualty text misreports | CP-3 | Partial | M16 55a40fb fixed the fallen, counts and flight. Open (C): the last chosen act unseen before the end; bleeding begun and ended in one round; a member "infected" by their own miss; TS-W23 (the defeat told before the blows) |
| CMB-03 | Rolled qualities cannot be placed | CP-4; M16 | Open (C) | Allocation at creation, previewed |
| CMB-04 | A development option shown that cannot be taken, with no reason | M16 | Open (C) | Every option either takeable or says why not |
| CMB-05 | Techniques in the rules' shorthand, under catalog names | M16 | Open (C) | Every technique said in plain words, with its figures |
| CMB-06 | A calling's description against its repertoire (a cleric of death "heals") | OWN; M16 | Partial | The specialty is named (a0827fd). Open (C): the calling's own words agree with what it can do |
| CMB-07 | A recruit cannot be inspected before hiring | CP-4; OWN | Open (C) | A recruit's page, as a member's |
| CMB-08 | Growth is numbers only; no new ability, spell or approach to acquire | OWN | Open (C) | At least one form of capability growth that opens play |
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
| NAR-03 | A topic once asked is gone; inadequate follow-ups | M15; M16; OWN | Partial | "asked" marked within a conversation. Open (D) |
| NAR-04 | News word for word in two mouths; rumours alike but for a name | CP-5 | Open (D) | No two people of a settlement give the same line |
| NAR-05 | Greetings fall back on a shared table line after the first meeting | TS-W18 | Open (D) | An authored return greeting, or none from the table for one who has their own words |
| NAR-06 | Night greetings under the sea or indoors | TS-W19 | Open (D) | No hour for the voice tables where none is seen |
| NAR-07 | A role is fixed text; who someone is now cannot be said | TS-W20 | Open (E) | `Role … when` alternatives |
| NAR-08 | A rule's words reach the company wherever it is | TS-W1; RD-F9; PS-32 | Partial | `Rule … at place` exists (M15). Open (E): words scoped to an area, told when the company is there |
| NAR-09 | A place told in full on every return | LW-10; TS-W2 | Open (E) | A return told briefly when nothing has changed |
| NAR-10 | A teaching rule puts the fact's text before its own words | LW-4; TS-W11; RD-F17 | Open (E) | The words stand for the fact in the moment |
| NAR-11 | A room not re-told when the company's light changes | TS-W24 | Open (D) | Lighting a dark room tells it |
| NAR-12 | Notes knowing what nobody said | CP-7 | Partial | A brood never heard of no longer listed (a0827fd). Open (D): the rest |
| NAR-13 | Something heard of and since taken stays "heard, not yet seen" | M16 | Open (D) | |
| NAR-14 | Exceptional events in the ordinary register (a body found, a betrayal, a revelation) | M16; OWN | Partial | Chapter ends, levels, deaths set apart (M16). Open (D): authored forms for the rest |
| NAR-15 | The feverwort given as "healing herbs" | M16 | Open (D) | |
| NAR-16 | The riddle "I always was, yet never will be" answered "Tomorrow" | CP-5 | Open (A) | Every riddle checked against its answer |
| NAR-17 | Independent undertakings must leave traces and reports | OWN; CP-8 | Partial | The brothers (M16 3491ecd). Open (X): other world processes |

## 5. Presentation (PRE)

| ID | Finding | Source | Disposition | Evidence, or phase and acceptance |
|---|---|---|---|---|
| PRE-01 | The title page is dull | OWN | Open (XI) | |
| PRE-02 | The Character view needs refinement into a real character sheet | OWN | Open (C/XI) | |
| PRE-03 | Town, commerce and navigation pages intolerably busy | OWN; CP | Open (XI) | Situated grouping, not smaller type |
| PRE-04 | The map neither beautiful nor legible with duplicate names or on phones | OWN; M16 | Open (XI) | |
| PRE-05 | Portrait suitability | OWN; M16 | Partial | 42 refused, roles read by work (M16). Open (D): an editorial pass on what the new people are given |
| PRE-06 | An unaffordable purchase invisible | TS-W21 | Open (C) | Offered, disabled, with its price |
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
| AUT-26 | Hiring adds the hired person's purse | RD-B6 | Open (C) | |
| AUT-27 | Zero-argument queries need `()`; document it | TS-W13 | Open (E) | The guide says it |
