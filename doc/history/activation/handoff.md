# Handoff: merging this branch, and what it leaves

*11 November 2026. For the M20 builder and the owner. Nothing here is required by M20; the branch is a coherent, independently tested increment that can be taken whole, in part, or not at all.*

## 1. Implemented and exercised, vs designed

| | Implemented (in Kyr/Deem/data, compiled in the audited seeds, walked by a spec) | Designed only |
|---|---|---|
| **Aenean** | the posting-house (`roadstation.kyrt`; `e1`; 12 rooms, 3 entries, 3 stationmasters × 4 endings × 6 occupants, hooks, a painted road that teaches the next place, a late coin) | the arcology expedition; four more stationmasters; a hedge-priest lamp-keeper; the oldcoin scholar's landing (needs R5) |
| **Hall / stones** | kitchen, cellar, muniment room, undercroft, tunnel; Orla, Wimble, Wystan, Aldous; a cook's job, a boy's cup, a road-wood quarrel with three outcomes | a letter from the Hall as a reward; a town licence-trade; relationships across towns |
| **Companions** | Wystan Hale (always) and the copyist (a quarter of countries): both use `willing`/`hire`/`Joins`/`Remarks`/`Leaves` | a disagreement when the company breaks the seal-lock; Wystan at the Bend; remaining at a stage for love of its books |
| **Authoring** | `@count` in plans; `if`/`unless` in Kyr templates | R1–R14 (kyr-deem-requests.md) |
| **Activation** | 50 paintings imported and 36 newly mapped (21 new scene kinds); the census and its ledger | the owner's newest 8 paintings (left for M20's batch); `scene-infinite-library` for the Infinite Library place; city paintings (need a city-only selection) |

**Not done, said plainly:** no browser (Playwright) session and no independent cold player has played any of this; the route tests are specs that play by the page's own labels. The posting-house is reached on foot by a `map:` set-out in the transcript (`transcripts/posting-house.txt`: a meeting on the road, "the deserters' toll", is paid); the specs set the company down inside it. The paintings were checked by the registry/scenery specs and by `scripts/rooms-painted.ts`, not by eye on the page.

## 2. Every shared file this branch touches, and why

All edits are small, backward compatible, and mechanical. If you merge only the add-only files (§3) and the **minimum** below, the world draws the posting-house and the Hall's deeper layer and nothing else changes.

**Minimum to make the new content load** (three one-line registrations):

| File | Change |
|---|---|
| `src/world/region-works.ts` | `import roadstation …` and its name in `texts`; one line in `sight()` so non-imperial works never "see" the posting-house |
| `src/world/region-outskirts.ts` | imports and parses `outskirts-deep.kyrt`; `station()` finds the posting-house for the template; `sight` skips imperial works |
| `src/world/kyr-template.ts` | `if`/`unless` on sections (needed by `outskirts-deep.kyrt`'s `road` and `keeper` groups) |
| `src/world/history/histories.ts`, `world-assembler.ts`, `region-writer.ts` | `data.imperial.plans` are drawn last, as `e1…`, against *copies* of the taken cells and names; the scenario-generated site numbering counts non-imperial sites only; the `imperial` flag travels onto the site |
| `data/generation/history/arts.json` | the `empire` art (never drawn: no terrain weights) and the `imperial` list |

**Keeping the first hour unmoved** — each of these one-line filters says "not an imperial work" so the posting-house takes no part in what the first town's people say and do: `founding.ts` (`ancient`), `origins.ts` (three places), `region-fellows.ts` (two), `region-meetings.ts`, `region-rumours.ts`, `region-traffic.ts`. *If M20 wants the posting-house told of by the first town's people generally, delete the filter.*

**What the full suite found, and how each was resolved** (the first full run on this branch failed five specs; all five are explained, none was skipped):

| Failure | Cause | Resolution |
|---|---|---|
| `bounty-lead`, `composition` ("Sir Hamo's men … the speaking door") | a *kit* (the raiders' hold) may take any free ruin-kind site, and took the posting-house instead of the toll-house, so the hold was told as "a walled yard of dressed stone beside the old road" | `region-writer.ts`: the posting-house is written `taken` by `empire` in the manifest's assembly commitments, so no kit claims it (scenarios already could not). **A kit that took a work would have been a design question; this branch says the Empire's house is nobody's hold.** |
| `kept traces › wren-tower-climbed` | the first town's landing text changed (the reeve; the swineherd's grievance) so every step's digest moved | `bun scripts/redigest-trace.ts wren-tower-climbed`: "rewrote digests; it comes where it came" (same place, watch and words). The updated transcript is in this branch. |
| `decision-frame › …brother who would now join it` | a kin's name is drawn from the folk's given names *minus every name in the country* (`FantasyRules.another`: `free[hash % free.length]`), and the cast of `kite` gained my kitchen boy, "Tam", a bare name in that pool: the pool shrank by one and the brother became Hamo (also the raiders' chief). Found by renaming each new person in turn: only the bare pool name moved it | the boy is **Wimble**, a name outside the pool and unused anywhere in the corpus ("Tam" was also the Dorothea's preset and Quittance's Tam Ridd). Nothing pinned needed to change. *A general sensitivity: see R13.* |

**Migration** (`@count`): `work-plans.ts` parses it; `histories.ts` reads it; six `.kyrt` files carry it; `Histories.counts` is deleted.

**Data**: `data/paintings/{seen,scenery,registry,likeness}.json` and `doc/paintings/registry.md`; `web/reader/paintings/*.webp` and `assets/portraits/scene-*.jpeg` (50 new images). Nothing in `data/rules`, `data/imbar`, the opening, the first-hour quest guidance, the undertown, the errands or the teachers is touched.

## 3. Add-only files (cannot conflict)

`data/generation/works/roadstation.kyrt` · `data/generation/town/outskirts-deep.kyrt` · `data/generation/town/neighbours.kyrt` · `data/generation/town/ties.kyrt` · `data/generation/town/troubles.kyrt` · `data/generation/town/conflict.kyrt` · `data/generation/town/threads.kyrt` · `src/world/region-threads.ts` · `doc/architecture/activation/campaign-seeds.md` · `data/generation/town/bond.kyrt` · `data/generation/town/companions.json` · `src/world/region-ties.ts` · `src/world/region-bonds.ts` · `scripts/{activation-census,dump-region,play-at,rooms-painted}.ts` · `test/{roadstation,outskirts-deep,neighbours,ties,troubles,authorable-generation}.test.ts` · `test/support/placed.ts` · `doc/architecture/activation/*` · 50 painting files each in three sizes.

## 4. How to merge without duplicating people, places or systems

1. **Identities are fixed.** The Hall's new people and rooms have ids on the existing town's prefix: `s1_manor_kitchen`, `s1_manor_cellar`, `s1_manor_muniments`, `s1_stones_under`; `s1_manor_cook` (Orla Pennick), `s1_manor_boy` (Wimble), `s1_manor_keeper` (Wystan Hale), `s1_reeve` (Aldous Fenn); `s1_iv` (Isaure Venn), `s1_anselm` (Brother Anselm Tarr), `s1_hesper` (Hesper Lowe). The posting-house is `e1` (`e1_hall`, `e1_office`, …). Do not add a second reeve, cook, keeper or road-house under another id; `bin/kyrie world <seed>` shows `e1` and the specs fail if there is not exactly one.
2. **Paintings: regenerate, do not merge.** `data/paintings/registry.json`, `likeness.json` and `doc/paintings/registry.md` are produced by `bun scripts/paintings.ts assets/portraits`. If both branches added paintings, take either side and re-run it. Take `scenery.json` by hand: this branch's additions are 21 new `kinds` lines (inserted before `home`, and before `road`/`vault`/`pump` for a few), three `views` appends (`wild:lake`, `wild:peak`, `wild:pass`, `wild:river`, `night`), words on four existing kinds (`counting-room`, `library`, `pump`, `chandlery`), and one painting each appended to `ruin`, `toll-house`, `tower`, `cistern`, `villa`, `nymphaeum`, `riches`. Appending to a list changes which painting each existing place of that kind is given (the choice is a hash of the id over the list's length); `test/scenery-kinds.test.ts` and `test/page-paintings.test.ts` catch the ones M20 pinned and pass here.
3. **The owner's newest paintings** (auditorium, cafe, salon, vintner, shipwright, cathedral, well, fortune-teller) are not imported here, on purpose: they belong to M20's current batch, and importing them twice makes two different JPEGs of one name.
4. **Re-digest kept traces** after merging if M20 keeps traces that pass through the first town's Hall (`bun scripts/redigest-trace.ts …`): the Hall's forecourt now offers a kitchen door, a gamekeeper and a reeve at the green.
5. **No quest engine, no companion engine, no relationship score was added.** Every consequence is a relation or a state in the authored Kyr (`s1_roadwood_shared`, `s1_boy_well`, the press door's state), read by observations and topics.

## 5. Unresolved blockers and requests (precise)

All in [kyr-deem-requests.md](kyr-deem-requests.md) §C with reproductions: R1 cross-section conditions; R2 a template function to find a site by plan; R3 `@riddle no`; R4 an author's painting for a room; R5 a scenario that binds a work site (so the old-coin scholar can go to the posting-house); R6 the `ownedItem` doc line; R7 a posted weight limit; R8 a name hole from the town's folk; R9 duplicate words in a way's label; R10 the state-name error noise; R11 a painting that depends on the state of the place; R12 a topic that takes an item from the company; R13 one name added to a country re-picks every kin's name (`FantasyRules.another`); R14 a feat a companion's regard can open.

Observed on the way, not mine to fix:
- **A deserters' toll on the road** (`Sergeant Mawr`: "Pay the deserters' toll, four coin") meets the `map:` set-out toward the posting-house in `kahitude`; the transcript pays it (four coin). It is existing content, and well made; it means the way to the first new Aenean place has a fight-or-pay in it that this branch did not put there, and a company too poor to pay was not tried.
- **Dark rooms.** The new rooms that are dark (cellar, muniments, undercroft, strong-room, stokehold, cistern) need a light the player has; one torch is an hour (M19-170). The page does not say, on standing in a dark room, that a torch is cheap and where it is sold.
- **The auto-fight is one button** (see storyboard §4): a scene with three kinds of danger plays as three presses of *Attack*.

## 6. What I would do next, in order

1. Play it in the browser (`site/index.html?world=kahitude`): the Hall's kitchen door, the cook, the cellar, the muniment room, the road-wood; then `map:` to the posting-house and read what it tells. Fix whatever a person finds before anything below.
2. Write the older work plans' objective lines as `aim` variants (the "nobody has … in living memory" tic; editorial-map §2, 4).
3. R5, so that one scholar, one coin and one grant meet.
4. The arcology, if the owner wants it; the paintings listed in the storyboard §6 first.
