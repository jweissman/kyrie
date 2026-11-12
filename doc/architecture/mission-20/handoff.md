# Mission 20 → Mission 21 handoff (the cutoff, 12 November 2026)

**Status: implementation work, not acceptance.** No human has accepted the first hour. Nine rounds of cold play by
agents were run; their ratings are an agent's, not a player's. This page says what Mission 20 delivered and how each
part was checked, what is still wrong, and, apart from both, what was registered for later.

- 287 commits since Mission 19 closed (7302392c), at this writing.
- The log (`log.md`) runs to E182.
- The register (`../open-register.md`) holds every open item, with its source.

## Part 1. Mission 20 delivered and verified

### The first hour, as it stands

A new player makes a character in about two minutes. The shape of the opening:

1. **A reason, then a road.** They choose one of eight reasons for coming, are met on the road by someone with a
   decision to make, and come into a town whose trouble is in front of them.
2. **They choose what to follow.** Nothing is followed for them: the aim line offers their reason with a quiet "Follow
   this".
3. **Gold is one next step.** Once followed, one act at a time is gold: the aim's next step, recomputed after every act.
4. **People are the strongest part.** The conversations, the Notes (who told what, and when), the danger boxes with
   their odds, and the paintings and portraits are what every cold player praised.
5. **Plans are their own.** Cold players found their own plans from what people told them: the bell against the hobs,
   the firebomb in the brood, the players' hat, the jar of noonlight.

### Work since the draft of 11 November (the owner's player report, round 8, the gold)

| Row | What | Checked by |
|---|---|---|
| E153 | Gold only after Follow this; nothing followed for the player; one act gold; Follow this a quiet word | test/gold-follow; the specs of a player with an aim now follow explicitly |
| E154, E157 | The gold's thread from every origin. What an act makes so is typed by its effects and resolution: a thing taken is carried, a letter given ends an expectation. The aim's step here comes before any way on. A site the aim names is gone further into; a door is never guessed at; spoils, not anyone's goods, pay a debt; a journey waits while a site has an open way in | test/gold-thread; /var/tmp/kyrie/m20/tools/gold-survey.ts over eight origins in kahitude and a1: 10 of 13 runs see the aim through or pause at a danger the page leads with (from 2 of 13 before); the honest start's four journeys |
| E155 | A place in the company's own hex is never gone to across country (it had walked the company out of the town) | probed headlessly; not seen rendered |
| E156 | A reply that teaches is drawn as knowledge; the Look list marks what the Look control is lit for | test/teaches-marked |
| E159 | A bed for the night is led to only where it can be paid for; the wait panel says whose bed is here and why it cannot be had | test/sitting-out-the-night |
| E160 | The brothers' errand says what "copied" asks (the makers' history or fate, read) | order specs |
| E161 | No way on is led while someone of the company is down | test/glance-rules |
| E162 | In the Notes only the followed aim has a gold bar | — |
| E152 | A portrait's credit names its painter and does not shout | test/paintings |
| E148–E151 | Topics in their written order; true walking minutes; the castellan answered; the conversation log folded | specs named in the log |
| US-01, WM-03, UI-04, NM-09 | The sister asked after; a robbed wagoner not helped; an inn's bed named; walk minutes | specs named in the register |

### After round 8, and round 9 (12 November, small hours)

| Row | What | Checked by |
|---|---|---|
| E173 | **P0 (round 9, P):** at a keep's door the gold went in at the open gate-passage while the dead man's cross was under the door-stone. A thing the aim waits on that lies hidden is now searched for where it is found, as the aim's next step, before any way on | test/gold-thread; the gold survey over the map origin in ten countries |
| E163 | The debt's gold walk circled back to a spent Seolforfyrd; the debt now points on to the next place the innkeeper told of | test/gold-walk; the honest start |
| E170 | Underground in a site the map put the company nowhere and offered "Journey to Lapisrecs" (the way out by another name); now at the site's hex, never set out for where it is | test/map-in-site |
| E171 | A town job ("Ask Peren about the old quarry") had been folded under the crypt's aim in the Notes | test/aims-apart |
| E179 | A failed parley lengthened the deadline it said had run out; it now keeps a deadline already given | probed both ways; deep-expedition |
| E166–E169, E174, E175, E177, E178 | Hit points at a level as the engine rolls them; "1 minutes"; a bard's armour without the wonders; a killing blow's dice line; "one ration"; a fight's barks in the character's pronouns; small faces by the painting's head crop (a catfolk had read as human); "A fight: beyond you." | specs named in the log |
| E164, E165 | "Nothing to say to you now"; a withheld skill "no one in the company can use now" | test/still-likeness |
| E176 | CI on 81fedaac: one spec still expecting the errand's old words; a shard over its time on a slow runner | the spec mended |

### Earlier in Mission 20 (11 November and before; see the log)

- Routes: no doubling back, landmark by landmark.
- Town entrances.
- One safe zone, walked at five sizes.
- Undertakings followed into their next part.
- A fight told once.
- The atlas's one indicator.
- Headless CLI and terminal parity.
- Startup 11.8 s → 10.1 s.
- Round 7's fixes (E135–E147).

### The adventure branch: verified, not merged

`adventure/first-steps` was merged onto main in review (`review/first-steps`) and repaired where the faults were clear:
a treasurer's pronouns; the Walk's curate, an elf cleric who stopped every country loading; town rules told everywhere
at once; the Walk's silent baselines. Its CI still fails 18 or more specs, several of them on decisions only the owner
can make. Chief among those: whether its four standing modules belong in the first town, which they make markedly
busier (four more people, about 170–190 more words on the first green) and change what leads there.

Everything is in `integration-first-steps.md`. Main was kept stable; nothing of the branch was lost.

**Authors' requests satisfied in Mission 20:**
- R81: a killing blow told by its weight.
- R82: wounds said.

The rest are triaged in the register's §16 (AB-03 to AB-14) for Mission 21.

### Cold play: nine rounds, agents only

| Round | Players | Clarity | Beauty | Interest | Challenge | Continue |
|---|---|---|---|---|---|---|
| 7 (fa374a83) | K: catfolk thief, public start | 3 | 4 | 4 | 3 | 3 |
| | L: birdfolk bard, kahitude | 3 | 5 | 4 | 3 | 3.5 |
| 8 (da99bf2c) | M: birdfolk bard-apothecary, public start, cautious | 3 | 5 | 4 | 2 | 4 |
| | N: birdfolk bard-scribe, kahitude, social | 3 | 5 | 4 | 3 | 4 |
| 9 (505b002a) | P: dwarf warrior, the dead man's map, a fighter | 2 | 4 | 4 | 3 | 3 |
| | Q: catfolk illusionist, the dead man's map, an explorer | 3 | 4 | 4 | 3 | 3.5 |

Round 8's reports are in `cold/round-8/` (E158). Both players followed their reason, and both saw it through or nearly
(the fever nursed; Lapisrecs read). What round 8 found again, and where it stands:

- **No bed found:** E159.
- **Scene choices that hide the way up, or a trapdoor:** open, by the quiet scene's design. See Part 2.
- **Gold on the wrong gift:** by the fever's own rules any herbs serve; not changed.
- **Gold past a keeper or into an ambush, and on while a character is down:** E161 for the latter; the former is open.
- **Aims gone from the Notes without "seen through":** open.
- **Forecasts over-warned** (M) or fair (N): CB-02, open.
- **A bard's gifts unused in fights:** open.
- **Text against state:** NP-01, open.

Round 9's reports are in `cold/round-9/` (E172). P followed the dead man's map into a keep and was led room by room
while the cross was outside (E173, fixed); then took a widow's bounty on an outlaw knight, fought him though warned, and
ended penned in his fort. Q found the crypt job dead-ended at a foe no lore could pass, and turned to the rats, which led
three storeys down an undertown opened by Q's own lore: the session's best part. What round 9 found again:

- **The way back missing from the scene** (Q's crypt; P's bailey and fort): now three players in two rounds. Recurring,
  and the owner's to decide, since the settled contract keeps ways under Go… (register PR-08).
- **Gold off the aim** (on a hire, on the way back out, two at once): R9-09, open.
- **Text and paintings against state:** R9-07, R9-12, open.
- **Promises the world does not keep** (Peren's lodger; the crypt's lore): R9-01, R9-02, open.

Not one round has been clean, and no gate of successive clean reviews was reached.

### Tests at the cutoff

- The quick suite: 612 pass, 0 fail.
- Typecheck and lint clean.
- The full suite and browser specs on CI: see the closing note at the foot of this page, written at the last push.
- Specs added tonight:
  - test/gold-follow, test/gold-thread, test/teaches-marked;
  - test/entity-card, test/serve, test/prospects (prototypes);
  - test/castellan-answered, test/sister-asked, test/walk-minutes;
  - test/map-in-site, test/aims-apart, and new cases in test/gold-thread, test/voice and test/deep-expedition.

### Reproducible worlds and traces

- **The reference:** kahitude, the debt, a human warrior; the honest start's four journeys (`bun run test:honest`).
- **The gold's thread:** `bun /var/tmp/kyrie/m20/tools/gold-survey.ts` (SEEDS, ORIGINS, STEPS, V=1), which is
  test/gold-thread made broad.
- **The kept traces:** test/fixtures/traces/ (wren-tower-climbed, wren-turf-hut, hessel-into-the-two-poles).
- **Round 8's worlds:** M's was a random seed (not kept); N's was kahitude.
- **Round 9's worlds:** both random seeds, not kept (the play server's save went with its browser).

### Performance

- **A fresh country, headless:** 10.1 s (parse 5.5 s), 550–620 MB resident.
- **In the browser:** world creation about 4 s for M, near-instant for N; a reload about 5–6 s.
- **One game served a line at a time** (`bin/kyrie serve`): a 5.9 s start, then a median of 366 ms an act, the view
  included.
- **The glance:** within its 8 ms budget (test/glance-kite).
- **The gold survey:** 0.1–0.2 s for a prospect search on a small fixture.

### World quality (`census-2026-11-12.md`)

- Every room reached from the start (565 in kahitude, 531 in a1).
- The first green has 31–37 ways.
- 35–36 rooms are entered and never left by an offered way: the works' inner rooms.
- About 30 shared place names.
- 90 paintings mapped to kinds no sampled place names.
- Some scenarios fit everywhere and are placed in one world of four.

## Part 2. What is still wrong (ranked; the register has the rest)

1. **Fights:**
   - trivial with a warrior, and over-warned in places (CB-02, CB-08, R7-02);
   - a bard's gifts and spells rarely matter;
   - creature damage does not grow with level (AB-03).
2. **Scene navigation (recurring; the owner's decision):**
   - with an aim followed, the scene leads with its one gold way, and the way up or back is only under Go…, one step
     at a time (round 8, M; round 9, P and Q: penned in, no "Up");
   - the first green offers 31–37 ways;
   - inner rooms are dead ends to the page.
3. **The gold's thread is not yet everywhere:**
   - the order past the riddle door (no gold on the right word);
   - gold on a hire or the way back out, or two at once (round 9, R9-09);
   - gold past the keeper an aim is about, or into a signposted ambush (round 8, M);
   - aims ended silently, with no "seen through".
4. **The map:**
   - a touch, then another on a hex near the card, lands on another hex because the camera moves it out from under
     the card;
   - the route line was missed by one player; its data is present and was drawn in our screenshots.
5. **Promises unkept:** the crypt's lore cannot be acted on; a lodger told of is never found (R9-01, R9-02).
6. **Names** of the opening's works and countries come from mixed tongues (register PR-06, with a proposed rule).
7. **Paintings and text against state:**
   - sunsets at noon, hillsides underground, prose that contradicts what happened;
   - the owner's painting list (handoff §3 of the draft, kept in the register).
8. **The adventure branch** waits on the owner's decisions (above).
9. **Acceptance:** no human has played the first hour for acceptance (FH-01).

## Part 3. Architectural follow-ups for Mission 21 (the owner's atlas synthesis, 11 November night)

1. **Semantic typing.** Replace each remaining text inference in `text-inference.md`, each with its named typed source:
   - talk roles;
   - reading acts;
   - "too dear" reasons;
   - seen-through and level-gained moments;
   - panorama sights;
   - harm on arrival;
   - the fight's turning points;
   - an aim's places for "on the map".
2. **Facets from Kyr.** Authors cannot yet mark an act, a thing or a person as uncanny (violet), knowledge (blue) or
   payoff (green) in Kyr. Today facets come from reasons (`Aspects.by`) and marks. A typed facet on Kyr actions and
   entities is the missing authoring capability. Without it, violet in particular is never drawn.
3. **Distance-sensitive perception.**
   - `Perception.reach` has only companionship: base 1, Gregarious 3.
   - Add per-facet reach, provenance (which capability saw it) and confidence.
   - Example sensitivities: mage → uncanny; cleric or diviner → the followed aim along story nodes; thief → wealth;
     warrior or ranger → danger and tracks; bard → companions and motives.
   - Immediate danger stays visible to everyone.
   - Keep it efficient: the glance has an 8 ms budget (glance-kite).
4. **Story-node propagation.**
   - A followed undertaking perceived along a chain of known places and people, not only at the next place.
   - Destinations' known facets carried to their approaches beyond the town case. Sites in the company's own hex are
     not handled yet.
5. **Exhaustion as state.** Dim means nothing new, and is today derived per act (`known`, `idle`). It should be one
   projected state, so that repeatable useful acts never go dim.
6. **Formation modifiers.** Company formations change perception and access (see
   `../2026-11-11-adventure-to-career.md`).
7. **Road junctions.** Roads meet only at towns and way rooms, so a road out that leaves another road's hexes makes the
   walk go into the town and back out. This repeats at most two hexes over five seeds, in 16–23 ways a seed. A junction
   node where roads share hexes is the fix.
8. **Startup.**
   - Measured on 11 November night, a fresh country with no parse cache, headless: world assembly 0.6–0.7 s; session
     start 9.7–10.4 s, of which parsing is 5.5–5.6 s (about 135 parses), the rest compiling and checking.
     Resident memory 550–620 MB, heap 135–270 MB.
   - Tried and reverted: a read-only path letting a generated region's files be parsed once and not copied for
     composition and loading. A/B over three seeds showed no gain (10.26/9.89/10.36 s before, 10.26/9.69/10.26 s
     after), and it added an uncopied shared module (the risk review's R4). The copies are not the cost; the parse
     and the compile are.
   - Candidates: parse the generators' templates once and instantiate them, instead of parsing their output; or a
     compact intermediate form for generated regions.
   - Not a lazy-world rewrite.
9. **Tests.** Parity for combat; the atlas states (full, faint, dim, silver) as projected data in the engine's
   projection, not CSS; the safe-zone walk in CI at the five sizes.
10. **The architecture risk review** (`architecture-risk-mediation-2026-11-11.md`, log E133). Its immediate list:
    - lifecycle assertions around command execution and rollback;
    - cache and load telemetry;
    - cache-on/cache-off differential tests;
    - a replay lane for historical transcripts.

    Then:
    - planner budgets (R7);
    - cost lint for authoring (R8);
    - a save-compatibility policy and migration harness (R5);
    - explicit command phases (R1);
    - per-campaign catalog state (R2);
    - frozen shared structures in development (R4);
    - a drift review at each closure (R10).

    R9, the atlas's honesty, was M20's. Its proposed gate, a corpus of false promises from the cold rounds, was begun
    (test/gold-walk, test/gold-follow, test/gold-thread) and is still to complete.


## Part 4. Future design registered (not built; for Mission 21 and after)

Kept apart from what was delivered, as the owner asked.

- **`../2026-11-11-forward-design.md`**: the owner's six research directions and the 39-item feature inventory.
  - **Three narrow prototypes**, each with its findings, concept kept apart from feature:
    - an entity card in player and debug projections;
    - one game served a line at a time;
    - a prospect three decisions off, by a bounded search through hypothetical worlds.
  - **The finding:** the card, the promoted act and a tester's "what would this change" share one set of records: the
    entity, the company's knowledge, the typed action rows and the persistent World. They lack the same three
    contracts:
    1. which facts the company may know;
    2. every effect of an act typed;
    3. the campaign's tick as a function of a World.
  - **Preliminary notes** on counterfactual planning, the Book, perception, dramatic memory, institutional plans,
    literate authoring and careers.
- **`../2026-11-11-direction-review.md`**: the independent creative and technical direction review, kept whole. Its
  items are linked in the register's §18 to where they live.
- **`../2026-11-11-adventure-to-career.md`**: the owner's direction from adventure to career.
- **`../architecture-risk-mediation-2026-11-11.md`**: the risk review (R1–R10).

## Part 5. Houseclean: noted, nothing deleted

**Remote branches already contained in main (26),** which can be deleted when the owner wishes:

- **review/:** architecture-2026-10-26-d79cbbd, playtesting-2026-10-26.
- **adventure/:** winter-in-carth, grand-tour, fair-weather, half-the-hive, the-lull, behind-the-wainscot,
  quiet-in-the-sky, book-of-faces, quittance, quittance-grand-tour, anthology, imbar-deep-time.
- **claude/:** eloquent-bohr-8pyot3, exciting-keller-wig7bg, eager-volta-59xzw3, blissful-cray-3tt8ai,
  kyrie-metro-adventure-region-q496ij, westernesse-adventure-anthology-ji7zau.
- **Others:** art/bestiary, art/menagerie, fix/journey-steps, integrate/imbar, m19-close, m19-contracts.

**Superseded:**
- `claude/great-hamilton-xr4iyo`: its nine commits are in `adventure/first-steps` as rebased copies.
- `adventure/fs-expedition`, `fs-wonder`, `fs-social` and `fs-integrate`: all four are in `adventure/first-steps`.
- `review/fs-integrate`: the first scratch merge, replaced by `review/first-steps`.

**Unmerged and to decide:** `adventure/first-steps` and `review/first-steps` (above). `adventure/big-tent`
(preview-only, by the owner's earlier word). `wip/art-scenery`, `wip/journeys`, `wip/ux-opening` and the old `review/`
branches of 25 and 26 October, each one or a few commits ahead.

**Worktrees and scratch** (all outside the repository):
- `/var/tmp/kyrie/wt-m20`: Mission 20's worktree, branch m20-work.
- `/var/tmp/kyrie/wt-review`: the review merge.
- `/var/tmp/kyrie/wt-cold8`: round 8's build.
- `/var/tmp/kyrie/wt-base`: a baseline, detached.
- `/var/tmp/kyrie/m20/tools`: the scratch probes this page names.
- `/var/tmp/kyrie/m20/cold8`: round 8's notes and screenshots.

## Part 6. Round 7, for the record

Two cold players on fa374a83 (11 November night), reports in `cold/round-7/`, log E134–E147. Every finding is fixed or
carried in the register's §16 (R7-01 to R7-04).

## Closing note: CI at the last pushes (12 November, about 2 a.m.)

- **bba17f90** (round 8's small fixes, E164–E176): every job green, the six suite shards, both browser jobs, the long
  descents and the reference hour through the page.
- **f49d858e** (round 9's fixes, E177–E181, the register's §20, the bundle rebuilt): every job green but suite 1/6, where
  one test of Wapshott's Act IV passed its 290-second limit on a slow runner; it takes two minutes here, as it did
  before tonight's changes. Split into its five nights (E182) and pushed; that push's CI is the last word, and is
  recorded in the log when it reports.
- **505b002a** had been cancelled by the next push, not passed; and **81fedaac** failed one spec on the errand's old
  words (E176). Both are covered by the runs above.

