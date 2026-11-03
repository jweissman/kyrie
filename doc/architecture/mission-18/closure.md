# Mission 18: closure report

Written 3 November 2026, at the owner's direction of 1 to 3 November: close Mission 18 as thoroughly as possible,
stabilise the playable experience, and carry nothing lightly. It answers the [brief](brief.md) (phases 0 to 6, gates A
to F, each requirement's status now written in the brief itself) and the [register](register.md): what is implemented,
what is verified in play, what remains defective, what of the reviewers' and authors' feedback is answered, and what
is carried, with why it could not be closed here.

## The owner's test

*Can someone begin playing Westernesse, understand what they are doing, undertake a worthwhile adventure, and return
wanting to play again?*

**In the first town and the country a day around it: yes, in the plays recorded below. Beyond it: partly.**

A fresh character, played in the browser by its visible controls only:

1. chooses why they came, their people, calling, school (and, a caster, their first spells), what they did before,
   and a name;
2. arrives at Brightbridge and reads the notice on the well-post: three troubles and who pays for each;
3. goes down through the corn-store to the rats, and comes up told who owes it and where;
4. goes down the churchyard's stair through the crypt and the ossuary, finds the lettered flag in the undercroft, then
   the stair to the sealed vault and its keeper, and below the vault the barrow of the country's first dead: three
   levels, and more to carry than one trip takes;
5. below ground opens the Map and sees the plan of where it is, what it has not yet walked, and the way up;
6. comes up, is paid at the shrine, and sells at the counter (each ware said beside what it would replace, each
   treasure at what it fetches);
7. has things worth spending on in the same town: the drill-yard's lessons, the smith's better weapons, the
   scrivener's spells, a mule to carry more;
8. sets out from the map (one ring of land known about the town), is stopped by the drovers' toll, finds Gaudumport,
   parleys with the hobs, answers the speaking door's riddle and goes in.

Every step was a visible choice doing what it said. Each fault a play exposed was repaired in a shared system and
played again.

What is not yet shown:

- a player new to the game playing an hour unaided;
- a long career (a second and third expedition, the wider country) balanced for money and growth.

These are the first things Mission 19 must measure rather than build.

## Evidence

- **Tests.** The quick suite (1,362 tests) and the slow suite (601 tests), both green. The slow suite is now run
  locally before any push that changes text or labels: two pushes went to CI red on slow journeys this week, and the
  quick suite alone cannot see them.
- **Browser plays.** Through the reader's visible controls (scratch drivers for the town loop and for creation), every
  page scanned for raw identifiers, unfilled blanks, `undefined` and `NaN`.
- **Measures.** [economy.md](economy.md): the coin a company can bring home is a median 1.93 times all a country sells
  and teaches; it was 8.75. [novice-viability-closure.md](novice-viability-closure.md): every calling alone at level
  one, against the first country's bands.
- **The register.** 441 rows, every finding of every review and author's report. 150 are fixed with their evidence,
  27 merged into the rows that answer them, 2 not reproduced, and 262 open or partial (17 of them P0). Each row left
  open says what remains.

## Phase by phase

### Phase 0: reconcile and baseline. Done

- The register reconciled the 105 inherited findings at the start.
- During this closure, every review and friction report not yet in it was carried: 110 rows on 2 November, and the
  owner's four requests of 3 November (OWN-59 to 62).

### Phase 1: the interface (Gate A). Built and played; the owner's verdict outstanding

- **Played:** the stage, the lantern, the title, every choice one control, asking first before anything grave, the
  narrator in the second person, arrivals and returns told apart, the hex map, portraits.
- **New this pass:**
  - the plan below ground (NVR-15);
  - creation's "What did you do before this?" with an emblem for each kind of life (OWN-61);
  - choosing first spells (OWN-62);
  - the title's marks alike on both sides of the chosen way (OWN-59);
  - creation centred in its frame (OWN-60).
- **Not done:** a real tablet; advancement as a composition of its own; the owner's assessment.

### Phase 2: one country, the library, the City of Seven Towers (Gate B). Partly

- **Done:**
  - every authored adventure a province of the first country, Behind the Wainscot and the Grand Tour among them;
  - one Imbar canon installed first, its planes world-owned, the laws of the Fire and the Air written there for every
    author;
  - rumours say where each adventure lies;
  - knowledge from heard of to been.
- **Not done:**
  - two adventures sharing one town;
  - the City of Seven Towers (B2);
  - Imbar's atlas (B3);
  - a placement report (B4);
  - the Grand Tour's outcomes read by other modules (OWN-36 to 38, partial).

### Phase 3: the ordinary loop (Gate C). The core of this closure; played

- **Density (C1):** an undertown, catacombs and a barrow under the first town; works with dens and caches.
- **Physical interaction (C3):** clues, puzzles that ask first, traps.
- **A deep dungeon (C4):** the barrow under the first town; deep sites in every country.
- **The economy (C5):** tolls; sinks in the first town; treasure half its worth in coin and a quarter in experience;
  measured in the target band.
- **Combat (C7):** fight experience ten for each foe, not the square of their number.
- **Conversation (C8):** deeds beside talk.
- **Renewal (C10):** owed jobs say where to be paid.
- **Remains:** morale and surrender (REV-16); a noncombat character played (C9); the 10× density baseline measured;
  the wilderness worth exploring for its own sake (OWN-27).

### Phase 4: Kyr, Deem, tools, architecture (Gate D). Partly

- **Done this pass, from the authors' friction:**
  - Kyr: `Leaves "…" to <place>`; several `opening when` clauses on a way; text `at ?place`; a rule heard
    `near ?who`; one-argument exclusive relations;
  - errors that name what is allowed;
  - lint advice to authors (a tame greeting, a bare first place, nothing to grow by, a measure lowered unasked);
  - tools: `kyrie transcripts` and `kyrie prose`; `kyrie play --choices` folded.
- **Done earlier in the mission:** the undertown as a Kyr template in data; generated Kyr read by parsing, not
  patterns; the authorability audit.
- **Not done:**
  - `kyrie stats`, `info` and `bench` (D6, D8);
  - a save continued across the terminal and the browser (D7);
  - the 22 content-writing generators the audit lists, still in TypeScript;
  - the ARV and COR architecture rows.

### Phase 5: careers, culture, cosmology (Gate E). Not begun as scoped

- **Only what served the loop:** one Imbar, its planes and House of Doors, the Grand Tour on them, seasons, the
  handbooks.
- **Not begun:** careers, companion arcs, supermodules, art as play, and the Encyclopedia.

### Phase 6: the register, play, the report. This report

The register is current. The owner's evaluation and an independent player's hour are outstanding.

## The reviews' and authors' feedback

| Source | Rows | Closed or merged | Open, in the main |
|---|---:|---:|---|
| The owner (OWN) | 62 | 50 | Wilderness worth exploring; the Grand Tour's outcomes and demonstrations; Common as a tongue; terrain variety |
| Cold and systemic reviews (REV, SYS, IND) | 39 | 7 | An expedition contract; a decision frame; morale; economic tiers; acceptance tests |
| Navigation review (NVR) | 22 | 3 | Ways into other countries from the map; interior grids and ordering |
| The Grand Tour, Wapshott's Circus (GTR, WPC) | 94 | 45 | Portable places; people offstage; module-scoped kinds; once-and-later texts; tool gaps |
| The other authors (TTN, LOR, LWR, HTH, FWR, LUL, QIS, BTW, GOS) | 130 | 35 | Language forms (computed measures, cycles, temperature); non-lethal bouts; farewells |
| The IF review (IFR) | 10 | 0 | A causal trace ("why is this not offered"); typed transformations; one knowledge model |

The authors' rows are mostly language and tooling. A third were found already answered by the work of Missions 15 to
17, cited in the code under the adventures' earlier names (Let One Remember as "The Road the Star Came Down"), and are
now closed with that evidence.

## What is carried into Mission 19, and why

Each of these needs more than a closure pass: a design decision, a measurement over many plays, or a new subsystem.

1. **Play for longer, and by someone new.** An hour unaided, the independent review's seven acceptance tests (IND-07),
   and the viability of every calling alone (PT-11, measured in
   [novice-viability-closure.md](novice-viability-closure.md)).
2. **The wilderness and the wider country** (OWN-27, REV-03, REV-08, NVR-01 and NVR-06): exploration that uncovers
   destinations of its own; the map taking you to other countries.
3. **Combat that ends when decided** (REV-16) and non-lethal bouts (FWR-17, QIS-04).
4. **The Grand Tour's outcomes as canon** (OWN-36 to 38), and two adventures sharing a town (B1, COR-05).
5. **Authorability**:
   - the 22 generators into data templates;
   - the IF review's causal trace;
   - the language forms the authors still ask for: portable places, people offstage, once-and-later texts, computed
     measures, module-scoped kinds.
6. **Tools:** `kyrie stats`, `info`, `bench`, and a browser play driver in the CLI.
7. **The City of Seven Towers and the Encyclopedia** (B2, E11), once the loop above is proved at length.
