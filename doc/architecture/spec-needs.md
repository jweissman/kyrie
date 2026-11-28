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
| `test/asked-again.test.ts` | The Long Man campaign and its people at the well. The original and repeated answers, changes and world key must remain; the before-and-after topic assertions have actual offered witnesses. |
| `test/author-path.test.ts` | A synthetic pair of scaffolded adventures, linked rules and the real CLI verification path. The conflicting names, unreachable topic, endings and lint findings are integration witnesses. |
| `test/authored-land.test.ts` | The Pellam authored campaign and its actual land chart, walked roads and map. The Lisk and Fair's geography is the claim, not merely a generic map. |
| `test/autoplay-engaged.test.ts` | One `turns-on` fixture module with `inhabitants`. Retained on full rules: bypassing engaged-row filtering makes its wait assertion fail, but bypassing the destination guard does not fail its no-journey assertion; a destination witness is needed. |
| `test/autoplay-tempers.test.ts` | Three generated worlds with distinct origins, parties and autoplay policies, plus pure invariant examples. The varied 60-step worlds are the claim and are not interchangeable with one fragment. |
| `test/autoplay.test.ts` | Pure draw and shrinking checks, catalog encounter runs and an `a1` world played and replayed. Each different layer is asserted; the replay and fight workload must remain. |
| `test/backstage-tabs-browser.test.ts` | A built site, a real browser at two viewport sizes and a generated `a1` world. The keyboard navigation and fixed-position checks are browser integration, gated by `KYRIE_BROWSER`. |
| `test/barrow-forewarned.test.ts` | The generated `iscoed` world and its actual barrow, innkeeper, jar and king. It compares warned and unwarned outcomes and the equipped-jar timing. |
| `test/barrow-walked.test.ts` | The generated `iscoed` world walked from the inn through barrow fights for warned and unwarned parties. The actual sequence, outcomes and fights are the claim. |
| `test/begin-flow.test.ts` | The real engine host, headless rendered title and generated countries, including checkpoint and replay paths. The title-to-play and per-life seed interactions are integration claims. |
| `test/bell-lead.test.ts` | The generated `kite` world with Brightbridge, Joygate, the hobs and the shepherd. It asserts the lead before and after each actual discovery. |
| `test/bell-walk.test.ts` | The generated `kite` world and a complete bell-and-shepherd expedition, including the planned travel, returned bell and persistent fled state. A fragment cannot replace the walk. |
| `test/board-update.test.ts` | An `a1` world and multiple actual town journeys, compared with newly built map models. The positive changed-board witness prevents the no-rebuild checks from being empty. |
| `test/borne-out.test.ts` | An `a1` world and real host frames, a teller and a walked site. Both heard-then-seen and seen-then-heard paths and the once-only notes must remain. |
| `test/broken-off.test.ts` | The Long Man campaign and its timed storm. The cut flag, storm response and begun narration are a single authored-time integration claim. |
| `test/calling-portability.test.ts` | Many shipped campaigns and generated provinces with different parties. Its cross-installation calling identity and authored voices are corpus-wide claims, not one module. |
| `test/capability-market.test.ts` | Generated `kite` worlds for a ranger and a mage, with the actual town's trainers and shops. The purchases, training and caster-specific availability are separate witnesses. |
| `test/castellan-answered.test.ts` | One generated `kahitude` world and its actual castellan encounter. The two offered answers and conditional response/state agreement must survive any narrowing. |
| `test/changed-once.test.ts` | The cold-5 golden walk and its gatehouse return. The arrival and sawn pin are positive witnesses for the no-duplicate narration assertion. |
| `test/checkpoint-race.test.ts` | The ordinary fixture campaign plus the Long Man campaign in the real engine host. Its controlled asynchronous command, save refusal and host serialization are essential. |
| `test/circus-phase2.test.ts` | The multi-module circus fixture and its timed, branching Fair and Revels stories. Each outcome's persistent state and played sequence are part of the authored claim. |
| `test/cleave.test.ts` | The authored Cleave campaign and its saved journey steps. Its lint, weather, choices and distinct endings span the actual adventure. |
| `test/client-parity.test.ts` | A generated `wren` world shared through a checkpoint between host and terminal. Some commands and travel are optional, so their witnesses must be made explicit before narrowing. |
| `test/cold-start.test.ts` | Two generated worlds and the real host, parse cache and start timings. This performance integration test cannot use a fragment without changing the workload. |
| `test/come-back.test.ts` | One `come-back` fixture campaign, with a returned-to room and a recruited boy. The boy's moved location witnesses the no-repeat assertion; any narrower setup must retain both sequences. |
| `test/command-atomicity.test.ts` | The ordinary fixture campaign plus a synthetic installable nook. Both expansion failure paths, the undo receipt and the clean replay comparison are necessary; narrowing must preserve installation before failure. |
| `test/command-contract.test.ts` | Pure combat and effect cases plus the multi-module Serewater March fixture. Its campaign cases require the actual hazard, offscreen hound, lodging and save/restore; they cannot be dropped to make the file cheaper. |
| `test/command-faults.test.ts` | The ordinary fixture campaign, with injected failures in each named post-act and watch phase. The reached-fault witness, rollback and clean replay comparison must remain for every phase. |
| `test/commitments.test.ts` | A drop fixture, all linted campaigns and two generated countries. The library-wide and generated-world checks make this broader than the static world label; the empty finding lists need witnesses before narrowing. |
| `test/community.test.ts` | Several generated countries with actual settlements, schedules, animals, wild growth and named people. The evening-drinker branch is conditional and the duplicate-name scan has no explicit nonempty witness; retain the world cases until those claims can be witnessed. |
| `test/companion-capability.test.ts` | One reader fixture campaign with Teshen, a capability and a carving. The offered-before and read-after sequence must both remain; a smaller fragment has not been verified. |
| `test/companion-lines.test.ts` | One inline module assembled through an overlay and played with different parties, not a loaded corpus. Retain the positive companion line and notice as well as the absent-line and downed-companion assertions; narrower rules and negative mutations have not been checked. |
| `test/companion-sensed.test.ts` | One generated `kahitude` world at three actual inn-adjacent locations, with and without a capability. The exact sensed neighbours, unchanged world facts and real companion row are the witnesses. |
| `test/company-across-adventure.test.ts` | One generated `thorn` world, a recruited brother, the Long Man frontier expansion and a restored checkpoint. The new entities and recruited party are positive witnesses for persistence. |
| `test/company-differences.test.ts` | The Serewater March fixture played by several shipped ready companies, plus catalog-based creation across seeds. The authored boar and store encounters and full company set are the comparison; this does not load a campaign corpus. |
| `test/company-portraits.test.ts` | Portrait metadata and web image paths, pure combat portrait cases, and one generated `kite` world with a save. The generated start-to-save portrait and existing web copies are distinct claims. |
| `test/company-range.test.ts` | Three company-range fixture campaigns, the authored Lull campaign with two parties, and parser fragments. Both named campaign configurations and range rejection are needed. |
| `test/compiled-modules.test.ts` | One synthetic, two-file module and a temporary campaign, started fresh and cached. The cache-count increase, equal checkpoint and separate catalog are the claim; no generated world is required. |
| `test/composed-creation-browser.test.ts` | A built site and browser, at two viewports, through character creation and into a generated world. Its page-shape, spell selection and start flow are browser integration and are gated by `KYRIE_BROWSER`. |
| `test/composition.test.ts` | The Fells fixture with real raider-hold and bounty kits, plus generated marsh, mountain and ember worlds. Fixed and open bindings, chained kits, payouts, band state and regional placement are separate integration claims. |

The shared arrivals fixture's action schemas, ids and labels were compared at each of its 12 places before and after
the change; they matched. Mutation checks are recorded in the accompanying pull request. The remaining files still
need individual examination, and the static census must not be reported as their actual needs.
