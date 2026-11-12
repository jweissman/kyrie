# Final report: what was implemented, what was verified, what was experienced

*Branch `adventure/first-steps`, 11 November 2026. Independent of M20: nothing here is merged into `main`, and no first-hour opening text, `data/rules` or TypeScript engine file was changed. (`scripts/activation-census.ts` and the test specs are tooling, not engine.) The three sections below are kept apart on purpose: they are three different levels of evidence.*

## 1. Implemented (authored, loaded, in the repository)

**Phase One and Two foundations** (see [README.md](README.md)): the Empire's posting-house, the Hall below stairs and the old stones, the first town's neighbours and troubles, ties and bonds, the activation census, the editorial map, 27 corpus reviews with 113+ new return greetings, `@count` and template `if`/`unless` migrations, and the Fellowship (a drawn institution with members in the first country).

**Four exemplary modules**, each a different dramatic engine, all standing in every first country:

| Module | Engine | Doc |
|---|---|---|
| *The Silent Lord* (a keep) | A dated decision among factions, with a quiet-watch assault, a poisoned cup and a comic misunderstanding; the town reacts before the company arrives. | [modules/keep.md](modules/keep.md) |
| *The Numbered House* (a ruined arcology) | A rival survey (Quill's Collegium, Brannock's hands) running on its own clock; eight visible stages; ally, race, robbery, fight. | [modules/arcology.md](modules/arcology.md) |
| *The Bound Howe* (an expedition) | An escalating crisis with a rival company, a levy, a breach and four ground states; the Lantern Company reaches the torc by dice or by the player's help. | [modules/barrow.md](modules/barrow.md) |
| *The Walk of the Milestones* (a movement) | A pilgrimage that crosses four towns through shared state; six end states, each visible in all four towns' chalk, notices and shop rations. | [modules/walk.md](modules/walk.md) |

**Corpus and variation:** 27 adventure reviews in [corpus/](corpus/README.md); a dramatic assessment ([dramatic-assessment.md](dramatic-assessment.md)); six new cross-adventure events; Deem draws for the Fellowship and the Walk ([deem-variation.md](deem-variation.md)).

**Encounters:** an audit and band tool, and data tuning of the barrow, deep sites and the arcology ([encounters.md](encounters.md)).

**Activation:** 24 newly arrived paintings imported (0 awaiting), six Numbered House rooms and several lookouts, wells and yards mapped; a census that now also says which module writes each authored-only creature into a scene; a ledger of intentional dormancy ([census.md](census.md), [dormant.json](dormant.json)).

**Requests:** 95 numbered, with a triage of the ten that matter at the top of [kyr-deem-requests.md](kyr-deem-requests.md).

## 2. Automatically verified

- Every country gate loads with all standing modules installed (`test/standing-modules-gates.test.ts`, 27 gates). This caught cross-module item-kind collisions four times; the kinds are now module-prefixed.
- A player in each of seven seeds can be told of, and offered, each standing module through ordinary play, by an overheard line, a notice, a cart or a camp (`test/standing-modules-found.test.ts`, 14 tests; `test/walk-seeds.test.ts`).
- Each module's end states, clocks and unattended courses are exercised by public labels (`walk-clock`, `walk-ends`, `bound-howe-week`, `arcology-rivals`, `silent-lord-malice`). "What happens if the player does nothing" is a spec for the Walk (riot by day 10), the Howe (breach, raid, sacked), the Numbered House (wedged, drawer prised, Roll chalked by day 7) and the keep (usurped and levy raised by day 13).
- Kept traces still come where they came, after four regenerations; the last full focused run of gates, kept traces, scenery, arcology and the new specs was 65 of 65.
- Painting mapping: `scenery-kinds`, `page-paintings` (a portrait collision between two new people and first-country folk was found by this spec and fixed with explicit `Likeness` lines).
- The census is reproducible: `bun scripts/activation-census.ts --seeds kahitude,a1,b2,thorn,c3,d4`.

**Not run:** the full suite (CI will), a full-branch `bun run lint` (the machine kept it from finishing; the authors' spec files are lint-clean), and a browser check of the web map. One known weakness remains: the `silent-lord-turns` "forged remission" spec fails when rain puts a ford in spate, because the test helper `Journey.way` ignores `hazardous`.

## 3. Actually experienced

Three fresh agents played blind, by the page's own labels only (no teleports, no `>` ids, no reading of the repository), over about ten game days each: a ranger in `kahitude`, a mage in `b2`, a thief in `thorn`. Their journals are in the session scratchpad. **This is the weakest evidence in this report, and the most honest.**

- **Cold discovery of the new modules is partly working.** One of three players reached a new module (the mage walked to the Numbered House and met Prior-Surveyor Quill). The other two never entered one, though both heard of the Walk, the Howe's diggers, the keep and the barrow. In all three games the world visibly reacted to what the new modules were doing: the Walkers' camp of forty barefoot people filled the green, the circus left, a king's muster and hearth tax appeared, and the diggers came back with three of twelve. That is the clock-without-the-player claim seen from outside, but only as texture: the players followed older leads that were nearer or more direct.
- **What the players liked:** the Hall's paper trail and the reactive town (all three); the lore-based solution in the crypt; the writing and voices (Orsik, Quill, Isaure, Fenn's reply and the monk's question about what to tell the grieving). The best single moment, named by two players, was the Hall's undercroft and the new bell humming the four notes.
- **What they found:** a missing signpost on the dome's slab stair, which needs brawn or a bar and never said so (fixed in this commit, prose only); a stair that appears and does not lead; a south-road dead end past the Exchange's yard; thin thief play (no pickpocket verb, a debt with no consequence); and long, repeated room text.
- **What the players could not judge, and this is not ours to fix:** there is no HP display, no warning before a fight that one round can kill, an empty menu after death, one "Attack" as the only choice against watching undead, 60 or more "Ways on" lines in the hub, and replays that take two minutes by day 13. These made danger feel arbitrary and are the main reason I would not claim that credible, learnable danger has been *experienced* rather than built.

**Not experienced:** nobody has played any module to a real ending on foot without a script; nobody has fought Hask, Gaunt, the Lantern Company or Thole's Hands; nobody has checked the web map in a browser; the arcology and the keep have not been entered by a cold player on their own.

## M20 coordination notes

1. Standing scenarios change the first town's hooks and therefore kept-trace digests. Re-record with `bun scripts/redigest-trace.ts` after any first-town text change.
2. Shared files touched: `data/paintings/scenery.json`, `data/scenarios/standing.json`, `data/generation/*/sites.json`, `places.json`, `web/bundles.generated.json` (regenerate, do not merge).
3. Adding a standing scenario shifts every later scenario's Deem draw. Specs should name no cast.
4. The first-hour issues listed above (HP display, fight warning, death menu, `>` ids, menu length, replay time) are the largest obstacle to anything in this report being felt.
5. The top ten authoring requests, in order of how many modules pay for them, are at the head of [kyr-deem-requests.md](kyr-deem-requests.md).

## What remains unintegrated, and why

- 19 imported paintings, dormant with reasons in [dormant.json](dormant.json). The owner should resend the city overlook, which was a duplicate of the secret-passage image.
- The yuanti has no habitat; adding one would change every first country's ruin den draw, which M20 owns.
- Quittance, Muster, Quiet in the Sky and Parliament had no prose pass. Book of Faces and Gosse's Company had none either. Let One Remember, Hollins and Patient Star remain thin.
- Consolidation candidates the assessment listed but I did not act on: fold Skerrow into the Dorothea, rotate out some of the eight "altered law" modules, fold `oldcoin` and `quarrel` into one shared-state conflict.
- Fellowship limits: members can only be folk of the seat town (R72), news reaches two towns (R73), none lives in another country (R74), and Deem cannot invoke a Kyrt (R75).
