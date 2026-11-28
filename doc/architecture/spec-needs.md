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

The shared arrivals fixture's action schemas, ids and labels were compared at each of its 12 places before and after
the change; they matched. Mutation checks are recorded in the accompanying pull request. The remaining files still
need individual examination, and the static census must not be reported as their actual needs.
