# 20. Handoff to the main builder

*Branch `adventure/imbar-deep-time` (one branch, no PRs opened). Written at the end of the fourth pass. This is my honest
reading of what is integrated, what is only present, and where the real work is. Read `13-critique-and-status.md` §13.8–13.9
for the history, `18-engine-spec.md` for the engine asks, and `friction.md` ("Start here, builder") for the short list.*

## 1. What is in the tree

- **23 adventures**, each with a ledger/friction/prose note in `doc/imbar/adventures/` (the series bible is `14-bible.md`;
  the cross-reference table is `15-lore-ledger.md`; an external review is `16-critical-review.md`).
- **The seagoing adventure** (`data/adventures/the-dorothea/`): a six-call archipelago run by the House of Marchbank (Skerrow,
  Port Ness, the Antlers, Wrack Holm, Ashkeld, Mangrow), a die-drawn sea-events table, five entry points, two threats
  (the Kestrel's hands, the lugger), and a descent (the Lamp Below) that opens when the ring falls.
- **The ring** (`data/goings-on/factors/`, `17-the-ring.md`): a Deem-cast, four-rank institution across three provinces with a
  moving Principal who answers interference and survives reload.
- **The meta-adventure** (`the-grand-tour/hours.kyr`, `remainder.kyr`): the black square, the Slack, the Remainder.
- **One experimental engine change** (`19-sea-region.md`): five opt-in terrain kinds and an archipelago chart.

## 2. Shared files this branch touched (merge attention)

`src/world/world-assembler.ts` (3 lines: heralds placed once per distinct scenario); `src/world/authored-land.ts` and
`data/rules/core.kyr` and `web/reader/board/board-{tiles,flora}.ts` (the opt-in terrain kinds and archipelago chart);
`data/catalog/items.json` (pharos_rubbing, prefects_writ, tally_rubbing, collegium_letter, surety_terms, pharos_lens,
watch_tally, and others added by authors: diff it); `data/imbar/events.kyr` and `module.json` (world events);
`data/adventures/countries.json` (the `tolleth` province and herald exports); `data/goings-on/factors/*` and
`data/scenarios/factors.scenario.json` (Exchange and ring); `web/bundles.generated.json` (regenerate: `bun run web:build`).

**Integration ritual** (every drawn world re-seeds when a province is added): rebuild the bundle (`bun run web:build`), re-record
`wren-tower-climbed` (`bun scripts/redigest-trace.ts wren-tower-climbed`), and expect `wild-meetings` and `exploration` seeds to
need moving. I did this for `tolleth`; a merge that adds another province on `main` will need it again.

## 3. What is verified, and what is not

Verified on the final tree, run file by file: lint (`eslint --max-warnings=0`) and `tsc --noEmit` clean; the Book of Faces
`ombra-*` tests, `low-water-replay`, `sea-region`, `repository`, `dorothea-routes`, `dorothea-sea`, `the-grand-tour` (all
green, see the log at the end of this file); the Let One Remember / Patient Star set (50 pass); Quittance (21 files);
the Dorothea family (about 42 across 7 files); `lore-links`, `gifts`, `exchange-responds`, `factors-handoff`.

**Not verified here, so run in CI:** the whole suite on the final tree (the last full run, on an earlier tree, had 6 failures,
all since fixed and re-run green individually; no whole-suite figure is claimed for the final tree); the two browser specs
(`board-browser`, `map-browser`) and any visual check of the new terrain palettes; `all-in-one-world` and `the-slack` if the
log below does not say pass.

## 4. The genuine gaps, in the order I would work them

1. **The sea is not on the map.** Tolleth is a "coast road" harbour placed with no sea requirement; a coast exists in roughly
   17% of worlds, so the voyage is a local story, not a place in the world. Fix: a forced-coast / shore gate in placement
   (`18-engine-spec.md` item 2/12; it re-seeds worlds with an east sea), then wire the Dorothea to the archipelago chart by
   adding a near-island `reach` region first (joining the existing islands in place would re-parent ids and move canonical
   strings and traces).
2. **The new terrain kinds were never seen.** Palettes for `jungle`, `volcanic`, `saltflat`, `reef`, `archipelago` exist in the
   three.js board, with no legend and no combat environment. Look at them in a browser; they may be ugly.
3. **A large share of the content needs deliberate choices.** The `bin/kyrie reach` audit of a curious random player reached,
   e.g., 27/106 rooms and 11/212 actions in the Book of Faces, 18/61 rooms and 24/98 actions in the Dorothea. That is not a
   bug, but the new material is easy to miss: signposting is thin (a notice-board at Tolleth is the model; copy it).
4. **Shipped parties are mostly one person.** Calling-unique beats were given weaker "lone company" routes in eight
   adventures, but the best versions need callings the shipped party lacks. Decide whether shipped campaigns should start
   with a fuller company (`company.kyr`), which would change every campaign.
5. **`hasCalling` voices never fire in a drawn world (found late; the biggest silent bug).** The party's `hasCalling` facts
   name the last-installed module's calling entities (`creature-facts.ts:115`), so `memberOf(?m, party) and hasCalling(?m,
   calling_x)` works in a one-module campaign and fails in any multi-module campaign and every drawn world. Every voice in the
   corpus has been rewritten to `brings(?m, <capability>)` (cleric rites, ranger woodcraft, warrior brawn, thief lockwork, bard
   performance, mage lore, monk tumbling), which fires in all three settings and keeps the member's name; verified by 24 test
   files and `calling-portability.test.ts` (29). The cost: `brings` is a skill, not a class, so a locksmith warrior speaks the
   thief's line. The real fix is in the engine (name the party's calling facts per module, or alias `calling_*` globally);
   see `calling-portability.md`.
6. **The ring's Principal cannot be met between places** (Pursuit does not cross hidden doors or uninstalled countries); the
   fight with him is not simulated (a level-1 company loses). The House of Marchbank is authored and does not plan.
7. **Prose.** Tics are reduced, not gone. Rewritten shares were under 10% of most adventures; the `_again` topics repeat
   verbatim in every adventure (~120 in Quittance alone); "which is…" and "as one…" clauses remain; the dry closing line is
   still the house finish. A `Says again` form and mood-tagged epilogues are the structural fixes. Nobody has read the new
   prose of all 23 as a player; sample it before trusting it.
8. **Several payoffs are tested with hand-set setups** (Thrume's Mouth, Quittance's unique-solution preconditions, Carth's
   Ash Day lantern); the ledgers label which. The Exchange still reacts and does not plan.
9. **Orsett is a name, not a place** (a province would re-seed every world).
10. **Tests to prefer over mine:** my tests lean on `put`/`give`/`assert` in places the ledgers label; where a ledger says
    "asserted", a real play is still owed.

## 4b. Playtests that now exist

`playtests/dorothea-archipelago-player.md` (five sessions plus the five entries; fixes applied), `playtests/shipped-first-hour.md`
(11 lone-novice openings scored 3-5; seven openings fixed), and `playtests/ring-and-lamp-player.md` (if present). Still weak
from them: fog fires on every passage (making it seed-dependent moves about fourteen tests' timelines), Ashkeld is a bare
errand, the Antlers/Ness scenes share one shape (agent refuses, expert helps, pay or prove), many shipped calling beats are
unreachable to a lone novice and their lone-company routes are not signposted, and Gosse's wagon "look closely" is a dead action.

## 5. Things that look like bugs and are not

Lint "no possible target in this world" warnings (Quittance, Wrayford, Gosse, Low Water) are topics that fire only after a
world event (`befell(...)`); they are inert standalone by design (the lore-links tests show some fire when the event is
asserted). The `unbound site` warnings in Quittance and Book of Faces predate this branch.

## 6. Verification log

Run file by file on the final tree (commit `5e40073`), each reporting 0 failures: `ombra-gate` 23, `ombra-maskers` 21,
`ombra-thief` 24, `ombra-counting` 15, `ombra-mage` 10, `low-water-replay` 2, `sea-region` 3, `repository` 4,
`dorothea-routes` 6, `dorothea-sea` 1, `the-grand-tour` 3, `the-slack` 14, `all-in-one-world` 1. Not run: the whole suite,
the two browser specs.
