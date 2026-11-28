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
| `test/acid-splash.test.ts` | Combat and catalog cases plus a single generated laboratory module. Its caster-generation check and the combat hit, miss and resistance cases must all survive any narrowing. |
| `test/acquainted.test.ts` | One `acquainted` fixture campaign, with a greeting followed by the changed name. A smaller fragment may prove the same behavior but has not been checked. |
| `test/action-hours.test.ts` | Parser fragments and one `the-hour` fixture campaign. The timed actions and narration in the campaign are required witnesses. |
| `test/aim-inside-site.test.ts` | A generated `kite` world with its actual tower and site placement. Its specific in-site aim and exit must both be present in any cheaper reproduction. |
| `test/aim-now.test.ts` | One Silkholme fixture campaign spanning the brood's related modules. The original and revised aim across both encounters are the claim. |
| `test/adventure-library.test.ts` | The authored adventure corpus and a generated world, with a province entered. Corpus-wide placement and name uniqueness are explicit claims; a fragment cannot replace them. |
| `test/all-in-one-world.test.ts` | A generated world and sequential installation of its placed provinces. This is intentionally a long, `KYRIE_LONG`-gated integration claim and must retain the multi-province sequence. |
| `test/activation-census.test.ts` | Calling plans, the ability catalog and a cross-tree source scan, without a running world. Its negative assertion has no positive witness that the named abilities exist; keep the scan and establish witnesses before narrowing. |
| `test/adventure-names.test.ts` | The adventure corpus's files and index, synthetic conflicting names and a named lint fixture; it does not start a world. Corpus-wide uniqueness is part of the claim. |
| `test/aim-on-map.test.ts` | A generated `kite` world with the kin origin and its actual bridge. The named bridge and its heard map mark are required witnesses. |
| `test/aim-strangers.test.ts` | A generated `a1` world with its tower, priest, shrine and town. Its before-and-after acquaintance and location claims span those generated modules. |
| `test/aim-targets.test.ts` | Every recommended campaign, loaded one by one for the corpus-wide lint. Its static world label understates that scope; `test/small/aim-target-lint` already proves the lint on a fragment. |
| `test/aims.test.ts` | A generated `kite` world with the order origin, the tower aim and its feedback, plus a pure place-id case. Both the actual aim transition and the pure case must remain. |
| `test/alias-names.test.ts` | One inline module and party. Retained as-is: several negative prose assertions need positive witnesses that the corresponding tellings were present before narrowing. |
| `test/alone-told.test.ts` | Generated `kite` worlds for two origins, including the actual first-town inn and traveller. The before-and-after talk and narration are required witnesses. |
| `test/act-budget.test.ts` | One generated `a1` world and Eogan's real four-question sequence. This is a timed integration budget; a fragment would measure a different workload. |
| `test/action-flat.test.ts` | Two `kahitude` generated-world starts and the actual shrine tower, corn-store door and padlock. The engine-to-page row wording and flattening remain integration claims. |
| `test/aim-return.test.ts` | One generated `a1` world and the runner's actual Eogan, shop and landing sequence. Its single gold exit after revisiting the landing requires the authored route. |
| `test/aim-successor.test.ts` | One generated `kahitude` world, the cellar rat-job chain and its light and warren exit. The held successor, absent separate aim and continuing row are distinct claims. |
| `test/aim-unasked.test.ts` | Generated `iscoed` and `kahitude` worlds, Gek's actual answers and the worlds' objective text. The offer has two positive witnesses; the objective-text loop would need nonempty witnesses before narrowing. |
| `test/aim-who.test.ts` | One generated `a1` world and its notice, shrine and father errand. The optional father lookup can pass if the errand is absent; establish that witness before narrowing. |
| `test/aims-apart.test.ts` | One generated `kahitude` world and its dead and spiders jobs. The spiders aim is witnessed, but the optional crypt `about` text needs a positive witness before narrowing its negative assertion. |
| `test/arcology-house.test.ts` | Generated `kahitude` worlds with the Numbered House, its inhabitants and linked town. Many authored mechanisms are played; any smaller fixture must preserve each mechanism and the town interactions. |
| `test/arcology-ways.test.ts` | Generated `kahitude` worlds and the House-to-town bindings. Its rescue, service way, marshal, sluice and owlbear scenarios cross those bindings; the ignored chain-pickup error needs a witness before narrowing. |
| `test/arcology.test.ts` | Generated worlds over seven seeds for placement, plus House discovery and mechanisms in play. The placement matrix and generated world cannot be replaced by a single fragment. |
| `test/as-rolled.test.ts` | Pure creation calculations and a generated `iscoed` world with its actual warrior and rats. It explicitly witnesses rats and checks combat odds, not just generated attributes. |
| `test/asked-again-live.test.ts` | A named authored campaign and one generated `s0` world. The generated copy count is witnessed; the authored empty-result claim needs a positive copy witness before narrowing. |

The shared arrivals fixture's action schemas, ids and labels were compared at each of its 12 places before and after
the change; they matched. Mutation checks are recorded in the accompanying pull request. The remaining files still
need individual examination, and the static census must not be reported as their actual needs.
