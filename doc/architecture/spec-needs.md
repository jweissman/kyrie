# Spec needs census

This is an **incomplete** examination of the world- and corpus-labelled specs at
`b7f3c2a1a0e1555a815d36886fc2ad9160f5d13f`. The static census had 444 world and 694 corpus files. A static label
is a reason to inspect a file, not proof that it loads a world or the corpus. Entries below describe the most
expensive evidence the claims actually require; an unlisted file has not been assessed.

| Spec | Need and decision |
| --- | --- |
| `test/small/arrival-attention.test.ts` | The single `arrivals.kyr` track and its narrated arrival matrix. Narrowed to the inhabitants, probing and services rules; the fixture path remains statically classified as world. |
| `test/small/perceived-rows.test.ts` | The same track, comparing each perceived row with the frame's own row. Narrowed with the shared fixture. |
| `test/small/player-choice-rows.test.ts` | The same track, including a cold revision cache and the real choice rows. Narrowed with the shared fixture without pre-building a page. |
| `test/small/rows-of-schemas.test.ts` | The same track, with its ways, fights, items and comparisons with the full frame. Narrowed with the shared fixture. |
| `test/small/player-revision.test.ts` | The same track and independent campaigns, exercising actual revision caching. Narrowed with the shared fixture without pre-building a page. |
| `test/small/talk-again.test.ts` | Two fragments and the named A Winter in Carth campaign. The Carth-specific claim needs that authored campaign; a fragment alone cannot replace it. |
| `test/small/clock-routes.test.ts` | Parses two named adventure source files and a fragment; it starts no world. Their exact authored routes are the evidence, so replacing them with copies would weaken the comparison. |
| `test/small/declaration-parses.test.ts` | Parses the rule, origin, kit and three adventure corpora, without starting a world. Its broad source coverage is the claim and must remain. |
| `test/small/bran-sent.test.ts` | One fixture campaign containing a stand-in country module, the hall scenario module and their cross-country binding. The interaction between those modules is the claim; one isolated module cannot replace it. |
| `test/small/fight-refresh.test.ts` | A tiny fight injected into an engine host, not a loaded corpus. Retained as-is: its conditional assertion for a removed row needs a non-vacuous witness before narrowing. |
| `test/small/origins-referenced.test.ts` | Two seeded country drawings and the origin catalog, not a running campaign. The seed-specific origin-placement claims need those drawings and catalog. |
| `test/small/every-adventure-placed.test.ts` | The adventure directory names and country index only; no world starts. Both are needed to check the index against the actual directories. |
| `test/small/fate-chain-lint.test.ts` | Synthetic fragments and the Warm Wall's named module, without a running world. The named module is needed for its authored-fates claim. |
| `test/small/sky-given.test.ts` | Setting-port, calendar and sky data, without a running world. The Imbar setting is needed to prove restoration after installing the other setting. |
| `test/small/kyr-symbol-table.test.ts` | Synthetic parsed modules and canon vocabulary contexts, not a running campaign. Its `data/adventures` filename in synthetic input causes the static corpus label. |
| `test/small/laboratory-knowing.test.ts` | The single generated laboratory fixture, played twice with different knowledge; no full world is started. Its knowing and blind paths both need to survive any narrowing, which has not yet been attempted. |
| `test/small/held-ways.test.ts` | One walk of the laboratory fixture, not a corpus. Retained as-is: its empty `broken` list needs a witness that relevant held and retreat ways were actually encountered before narrowing. |
| `test/small/war-stays-out-of-reference.test.ts` | A generated `s0` world and its opening walk. A fragment cannot replace the claim that generated reference play excludes the war. |
| `test/small/first-questions.test.ts` | The single generated laboratory town fixture, not a full world. The innkeeper, merchant, priest, notice and newly learned questions are all witnesses any narrowing must preserve. |
| `test/small/screen-once.test.ts` | One ford-road fixture campaign injected into an engine host. Its real combat and frame-cost claims need the fixture and host, not a loaded corpus. |
| `test/small/label-length.test.ts` | Creation cards plus the golden walk's authored campaign and captured steps. The walk-wide label census cannot be replaced with a fragment without changing the claim. |
| `test/small/pin-remembered-favour.test.ts` | One laboratory fixture, played through a favour and a later return. Narrowing must keep the actual fight, relationship and price transition. |
| `test/small/barred-means.test.ts` | One tower fixture module on the shared rules, not a corpus. The blocked way and the named chandler's rope are the positive witnesses. |
| `test/small/turn-attribution.test.ts` | Toy synchronous and asynchronous functions and an injected clock; it starts no world. Its imported measurement script also imports the golden-walk machinery, so splitting the reusable timer from that script is a possible further reduction. |
| `test/small/laboratory-retreat.test.ts` | One laboratory fixture with combat, retreat, a purchase and a second descent. The complete sequence and persistent enemy state are the claim. |

The shared arrivals fixture's action schemas, ids and labels were compared at each of its 12 places before and after
the change; they matched. Mutation checks are recorded in the accompanying pull request. The remaining files still
need individual examination, and the static census must not be reported as their actual needs.
