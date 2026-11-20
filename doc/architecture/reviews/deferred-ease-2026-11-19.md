# Deferred rows: easier than recorded? (19 Nov, lead's read-only pass)

41 deferred rows. Most are honestly new systems. Probed the ones whose cost might have fallen since the deferral:

| row | recorded as | finding | verdict |
|---|---|---|---|
| CP-10 | "Low Water never played Begin to ending" | test/low-water-beyond.test.ts:77,172 and low-water.test.ts:131 reach `reached(ending)`; circus has act4/journeys specs | **stale in part**: re-word to what is truly unplayed (a cold player, the anthology's endings, the library tour) |
| KX-03 | (new) relation exports | ExportRole + ModuleBundle.imports already the path (module-exports.ts:10, module-bundle.ts:193) | **small**, maturity step 3 extension |
| PA-09 | sending: a new system | Topics bind `with` a person; `travelling` topics already follow a company (person-parser.ts:193, local-observations.ts:31). A sending = an action asserting a temporary reach relation the topic gate reads | **medium spike**: depends on how topic presence is gated; worth one probe |
| PA-07 | compass as equipment-verb system | the Wayfinder (KnownWays) is one way-finder; a compass kind exists as prose (parliament-of-books/kinds.kyr:31). A held-item condition on a wayfinder bearing row is the whole of a first slice | **medium-small**, but needs the engine-owned row (page invents no controls) |
| CP-17 | module-authored Encyclopedia entries | Encyclopedia reads catalog/generation json (encyclopedia-lore.ts); no Kyr construct | medium: a new declaration, but a reading one (no runtime) |
| CB-26 | more than two sides | Team = 'fighters' \| 'goblins', ~104 references across ~20 files | **not easier**: keep deferred |
| AU-14 | spells defined in Kyr | KX-01 showed item use effects authorable; spells stay catalog entries | still large; KX-01 result narrows it to "a spell as an item-kind-like use" |
| TS-03 | continue as a relative | runner restarts in the same country (CL-53 partly) | medium: a successor drawn from the party's kin facts; kept |

Recommend: CP-10 re-word now (burn-down); KX-03 on the maturity track; PA-09 and PA-07 one probe each when an
agent slot frees (they touch the Atlas/row contract, so after AT P0s). The rest stay deferred as recorded.

# Low-hanging live rows (discovery, same evening)

| row | finding | next |
|---|---|---|
| DC-04 | 3 of 5 facts undocumented (Deem draw order, `_gathered`, marker uniqueness); Guards covered (guide.md:619); topic-purse to verify | **text staged** /var/tmp/kyrie/m22/dc04-docs.md; apply → close DC-04 + AU-10's draw-order clause |
| US-06 | Gosse/Hepzibah's topics nearly all gated on royalCall(pentrice) (asserted rier_cast.kyr:37, on reaching Rierdan); before it, one `once` topic each (history.kyr:23, :93) | small content: a pointer topic naming the road to Rierdan; one walk to confirm |
| CP-13 | five countries' notices, each its own Source (region-borders.ts) | folded into HP-01 already (S3-3): leave |
| T24-09 / CB-11 | both "wants a spec" | small fast specs; CB-11 needs a ruling (persuaded foe: drawn on the company's side only if it joins) — my call: only if it joins |
| AU-15 | 117 of 241 `Objective` lines in data lack `toward` on the line (continuations not counted) | recount with the parser before re-wording the "about 200" |
| AI-06 | `oldcoin`/`quarrel` still used in 10+ files (wanderer arrivals, brood-hollow, bound-howe, quittance, parliament) | not small: leave |
