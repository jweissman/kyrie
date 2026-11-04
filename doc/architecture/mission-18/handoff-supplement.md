# Handoff supplement: six answers

4 November 2026, beside [handoff.md](handoff.md). Facts first; where something is unverified it says so.

## 1. The reference adventure

The best end-to-end journey available is **the first town's first job in seed `a1`**. It was played through the
browser on 4 November at commit 25c12914 (the build of that commit), and it is held headlessly by
`test/first-town-job.test.ts`.

**Start.** Run `bun run web:build`, open `site/index.html?world=a1`, choose **Over the Hills** (the wanderer), then
**Set out now** with the default character: Hamo, a human warrior of level 1, once a soldier, with 15 hit points, a
battleaxe and 14 coin. Wait until the first page shows; drawing the world takes several seconds. The company starts on
the causeway into Lowmouth.

| # | Do | Expect |
|---|---|---|
| 1 | key **1**, "To the landing at Lowmouth" | the landing: Gosse's players, a chained wagon, the circus's bill, townsfolk as plates |
| 2 | **Read the notice on the well-post** | three jobs (rats, catacombs, spiders), each naming who holds the key; three "A new aim" lines |
| 3 | **Mik's salt-house**, in the glance's row of ways or under Every way | Mik as a plate saying TALK |
| 4 | touch Mik's plate; key **2**, "Ask about the rats in the corn-store"; **Esc** | "You take the corn-store key"; lead 1 becomes "To the old corn-store — your aim" |
| 5 | key **1** to the corn-store; key **1**, "Down to the corn-store cellar" | "It is pitch dark"; leads "Hamo: light a torch" |
| 6 | key **1** to light a torch; then **The rat-runs** | the cellar told; in the runs, two great rats, reckoned "Easily won: they are no match for you" |
| 7 | key **1** to attack; **t** to let the fight run; **Esc** | won in two rounds; 15 experience; the new aim "Stop the rats' run from the drain" |
| 8 | **Look at the rats' run**; **Pack the rats' run with brick and rubble**; **Esc** | "packed … wedged hard"; the new aim "Tell Mik … ten coin and a lantern" |
| 9 | key **2**, the cellar; key **1**, up; key **1**, "To Mik's salt-house" | back at Mik's around 9:00 on day 1 |
| 10 | touch Mik's plate; key **2**, "Tell Mik the rats … are dead, and their run … stopped" | "+10 coin (24 now)", "gains 1 Lantern", "gains 2 flasks of lamp oil" |

Where the journey is broken, awkward, or depends on knowing the system:

- **The aim followed disagrees with the job in hand.** The aim followed is fixed at the first page after the opening:
  "The innkeeper and the merchant are at odds over the boundary stones". It stays there throughout unless the player
  changes it in the Notes, so leads tagged "your aim" or "toward your aim" point at the stones while the player does
  the rats. In the cellar, lead 1 was "Up to the old corn-store — your aim".
- **The leads go stale or wander.** At Mik's, with the rats job open and Mik in the room, lead 1 was "To the taproom of
  the Lucky Phoenix". After the run was packed, lead 1 was still "Look at the rats' run — your aim".
- **Number keys do nothing while a sheet (Every way, Look about, More) is open.** This is by design, but nothing says
  so.
- **The wait after Set out now is unannounced.** A key pressed before the place shows is lost.
- **Developer knowledge is needed** to know the world's seed, that the wanderer origin begins on the causeway, and that
  this job is the one tuned on 3 November.
- **Beyond the town it is weaker.** Played headlessly, not in the browser: out to the charcoal-burner in the woods of
  Oakhurst (two steps east of the town), his directions to "a broken keep", back by the road toward Mistshaw, and up to
  Ísencepan (a portcullis to heave, wolves in the bailey, a glyph by the stair down). That stretch took seven in-game
  hours of walking across hexes. The keep's end and the return have not been played since 3 November.

## 2. Structural repair priorities

Root causes of the playability failures above, most consequential first, with the debt each depends on:

**Essential corrections.**

1. **Objectives have no identity, and the engine does not know the aim followed.** Kyr already gives each `Objective`
   an id. The screen exposes only its text (`screen.objectives: string[]`); the reader keeps the aim followed as text
   in `localStorage` (`web/reader/followed.ts`); and the glance ranks leads with `Stakes.here` and a tier table
   (`src/ui/promotion.ts`), knowing nothing of what the player follows. Every symptom in §1 (contradicting "your aim"
   tags, stale and wandering leads) comes from this.
   - Repair: objectives by id on the `Screen`; the aim followed as engine state, kept in saves; the glance leads toward
     it.
   - Small and local: `src/ui/stakes.ts`, `src/presentation/glance*.ts`, `screen-model.ts`, `followed.ts`.
   - Do it first.
2. **Navigation decided by id shapes.** Which ways are the map's (`MenuModel.stays` depends on `bearing`, which
   `headings.ts` adds only to ids matching `/__t\d+$/`), what a march-stone or province is (`itinerary.ts`), and what
   is a town or a site (`${id}_green`, `${id}_site`) are all read from ids.
   - Any content change to ids silently changes travel.
   - Repair: generators assert facts (`kind of place`, `stretch`, `province`), and the readers read those facts.
   - Depends on nothing, but touches every generator. Do the readers first, behind a function.
3. **The page shows the world's truth, not what the company knows** (ARV-H5). It is a correctness risk rather than
   today's most visible failure. Do it after 1 and 2.

**Worthwhile but deferrable.**

4. Content generators into data templates (`src/world/*-writer.ts` and others). This is an authorability matter, not
   a playability one, except that every content fix is a code change.
5. Prose re-parsing in the reader (panorama, aims to places, services). It is fragile but works today; it is fixed for
   free when the screen carries structure, which comes with 1.
6. Process-global catalogs and caches (COR-04, ARV-H7). These matter for running two campaigns in one process (tests,
   tools), not for players.
7. State names scoped to their thing (AUT-07), and one save format (ARV-A24).

Not recommended: a rewrite of the generators, the reader, or Kyr. Each debt above has a local repair.

## 3. Content inventory: exists, migrated, usable, editable

The Orsino source has 2,651 definitions in 79 families, of which 1,193 are executable in Kyrie and 16 are
play-validated (`doc/architecture/orsino-coverage.md`, generated by `bin/kyrie orsino report` from
`data/sources/orsino/registry.json`). Two kinds of catalog sit side by side:

- `data/catalog/*.json` is hand-written and editable.
- `data/catalog/orsino/*.json` is generated: do not edit it. A hand-written entry naming the same Orsino source
  replaces the generated one.

| Category | Exists | Usable in play | Editable by an author |
|---|---|---|---|
| Backgrounds | Orsino 215 (210 executable); `backgrounds.json` overlays | chosen at creation ("What did you do before this?"); 5 play-validated | hand overlays in JSON; Orsino's by regeneration only |
| Professions / kinds of life | `professions.json` 383 (Kyr's own), 598 kinds of life in towns | seen at work in towns; a trade chosen at creation | JSON |
| Species and monsters | 31 hand-written, 93 Orsino; temperaments 11; Orsino monster classes, ranks and npc types mostly not represented | yes, by `Species …` in Kyr; `Level` does not scale a fixed-stat species (QTC-21) | JSON (hand); Kyr `Species … like …` per module |
| Abilities and spells | 20 hand-written, 340 Orsino; arcane 131 (105 executable), divine 154 (139 executable) | casters prepare from their tradition; a module can now teach one (`Resolve teach`) | JSON; spells cannot be authored in Kyr, only taught |
| Effects and conditions | 28 hand-written, 162 Orsino; 149 Orsino status modifiers not represented | yes, in fights and the field | JSON |
| Equipment and treasure | 53 hand-written items, 356 Orsino (weapons 82 of 83 executable, armour 15, gear 62, junk 71 as treasure) | bought, carried, sold at half value; treasure tiers not represented | JSON; Kyr `Kind … like …` per module |
| Languages and names | the `languages` package (pinned git), `common-names.json`, `folk.json` by pronoun; `names.json` townsfolk lists not by sex | Common names in towns; goings-on names unsexed (OWN-51) | JSON; the package by its own repository |
| Generator templates | 15 `.kyrt` (the works, the undertown, the wild's meetings); ~35 TypeScript writers | yes | `.kyrt` by an author; the rest only in code |
| Orsino's generation tables (rooms, traps, wonders, riddles, shops) | catalogued (≈500 entries) | not used: 0 represented | — |
| Authored adventures | 21 under `data/adventures/`, all placed as provinces | each played by its own journeys; not played together by one protagonist | Kyr, the guide, `kyrie lint`, `kyrie new` |
| Encyclopedia | not built (E11); the generated handbooks (`doc/handbook/`: PHB, DMG, MM) are the nearest | no | regenerated by `bin/kyrie handbook` |

Missing sources and uncertain areas:

- The Orsino source checkout is needed to regenerate (CI checks it out at the registry's revision).
- Orsino's generation tables and NPC families are catalogued but unused.
- The coverage report's "play-validated" counts are low and not re-measured since October.
- The professions' Orsino lineage is not recorded per entry.

## 4. Top residual defects, by severity

**Hard correctness failures** (wrong behaviour in an essential interaction):

1. **Leads contradict the aim followed, or are stale** (§1). Rows: REV-08, Wishlist. *The Wishlist status hides a
   broken essential interaction.*
2. **The aim followed is lost** if its objective's wording changes, and is not in saves (it lives in browser
   storage).
3. **Lone casters die in ordinary fights**, and a fight can go against its reckoning (PT-11, SYS-05, Wishlist). *This
   is broken for solo mage and thief play, not an ambition.*
4. **Rules fire during a night's camp** as if the company were awake (LUL-02, Wishlist). It is a correctness defect.

**Severe usability friction:**

5. **Travel between town and site is one jump across the map**, with nothing to decide on the way (REV-03, REV-17;
   OWN-78 Partial).
6. **Generated towns are long lists.** The plan now sits above the list, but the list remains (OWN-77, OWN-81
   Partial).
7. **Silent waits and silent mode changes**: the world being drawn, keys off under a sheet.

**Contextual incoherence:**

8. **Repeated prose** across countries (PT-15), and **unsexed names** in the goings-on (OWN-51).
9. **Two vocabularies of aims on one page**: "Following X", while leads say "your aim" of something else.

**Larger design ambitions** (honestly Mission 19's):

10. The frame before an act (REV-05). Morale and surrender (REV-16). Companions with arcs. The library played by one
    protagonist (NAV-10).

## 5. Verification snapshot

- **Final commit pushed at writing: 25c12914.** Later commits in this mission are noted in git; this file and the
  handoff will be committed after it.
- **Typecheck** (`tsc --noEmit -p .`): clean at 25c12914.
- **ESLint**: every changed file clean before each commit. The full `bun run lint` passes on CI (lint and types green
  at 3d3af364).
- **Quick tests**: 570 pass, 0 fail at 25c12914.
- **Full CI**: the last complete run with every job green was **3d3af364** (five suite shards, browser specs, long
  descents, lint and types). CI for 25c12914 had not finished at writing: **unverified**. Commits since 3d3af364 changed
  the reader's leads and plates, the followed-aim default, OwnWords, ScenarioTowns, and the register.
- **Browser specs locally**: glance and opening (16) pass at 25c12914. The full browser set last ran locally before
  7b1dd04c (35 pass, 2 fixed after): **not re-run in full since**.
- **Player-facing end to end**: the §1 journey through the browser on 25c12914's build (driven by
  `scripts/play-server.ts`, by keys and clicks, screenshots kept outside the repository). The owner's last own play
  (3 November) was negative. No independent player has played.
- **Generated artifacts**:
  - The bundle index is current (its spec is in the quick suite and passes).
  - The handbooks were regenerated after the last catalog change.
  - The wren trace was re-digested after the last change to generated worlds.
  - `test/timings.json` is **stale in part**: twenty Book of Faces specs carry estimated times. Run
    `bun run test:timings` on a quiet machine.

## 6. What remains of Mission 18's commitments

**Explicit carryovers** (unfinished, still wanted, with rows):

- **Gate B**:
  - a placement report as one document: `kyrie world <seed>` lists placements and `kyrie countries --diff` the moves
    (B4);
  - one protagonist through three adventures (B✓, NAV-10).
- **Gate C**:
  - a loop that feels like a game (OWN-76 to 81);
  - balance by calling (PT-11);
  - morale (REV-16);
  - turns of travel (REV-03).
- **Gate D**:
  - no fiction from TypeScript emitters (D3: about 35 writers remain);
  - `kyrie stats`, `info`, `bench` (D6, D8);
  - a save continued across terminal and browser (D7);
  - the architecture rows (D9: ARV, COR, AUT, all Wishlisted with reasons);
  - an independent author's run (D✓).
- **Gate F**:
  - several adventures by one protagonist (F1.2);
  - a substantial NPC (F1.7);
  - character-specific progress (F1.8);
  - a civilization's consequences met (F1.9);
  - independent authoring (F1.10);
  - terminal and GUI parity (F1.11).

**Larger aspirations** (not blockers):

- The City of Seven Towers (B2).
- Imbar's atlas of lands (B3).
- Careers, companion arcs, supermodules, physical semantics, the Encyclopedia (E2, E3, E6, E9, E11).
- Art as play and the chronology, both begun (E7, E8).

**Superseded**:

- Separate countries joined by marches, replaced by provinces of one country (NVR-04).
- Travel on the page, replaced by travel on the map only (OWN-85).

**Genuine unresolved defects**: §4, items 1 to 4.

## The recommended order, and whether it makes a loop

The handoff recommends structured objectives first, then decisions on the way between town and site, then the frame
before an act.

**Why objectives first.** Their absence causes failures visible today: wrong and stale leads, two meanings of "your
aim". The fix is small, and every other piece of guidance depends on knowing what the player is doing.

**Why travel decisions second.** The stretch between the town and the site is where the loop is thinnest: a jump on the
map, with nothing to decide.

**Why the frame third.** It is the structural answer to "every page is a menu".

**Would that make a satisfying loop? Not by itself.** All three are structure. Built across the whole game, they would
add features to an experience that is still uneven in content and tuning. What the code lacks most is not a mechanism
but one adventure designed and tuned end to end as the standard for the rest: one town, one road, one site, and the
return, judged by the owner in the browser.

A better order for Mission 19:

1. Objectives with identity, and the aim followed in the engine (a few days; it removes active contradictions).
2. Design and build one vertical slice on the §1 route. Travel decisions go only on that road, the site gets depth, and
   difficulty is tuned for each calling there. Iterate on screenshots and play until the owner accepts it.
3. Only then generalise what the slice proved: travel decisions everywhere, the frame before an act if the slice's
   play shows decisions are confusing, the generator migrations the slice needed.

The risk to avoid is the one Mission 18 ran into: breadth (twenty-one adventures, a library, generated countries,
dozens of forms) ahead of one loop that is good.
