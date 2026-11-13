# Authorability: where the world's content lives, and where it should

The owner, 2 November 2026: Westernesse's world structures, content categories, generative templates, narrative
rules, effects, languages, ecology and other extensible systems should be authorable and data-driven wherever
practicable; generated literal prose and generated or "blessed" Kyr audited; regular-expression manipulation of Kyr
replaced by AST or IR where structure is involved; clear boundaries between authored definitions, generative
templates, generated instances, compiled artifacts and persistent state, with provenance and human editability. Not
an indiscriminate rewrite: a coherent architecture in which ordinary creative extensions need no engine change.

This audit records where things stand, what Mission 18 changed, and the order Mission 19 should take the rest in.

## The five layers, as they are

| Layer | Where | Editable by an author | Notes |
|---|---|---|---|
| Authored definitions | `data/adventures/*` (Kyr), `data/catalog/*` (items, species, classes), `data/rules/*.kyr`, `data/imbar` (canon), `data/origins`, `data/kits`, `data/situations`, `data/goings-on` | Yes | 378 Kyr files. Adventures are wholly authored and installed as modules. |
| Generative templates | `data/generation/works/*.kyrt` and `deep/*.json` (makers' works, deep sites), `data/generation/tables` (Deem tables), `data/generation/scenes` (prose banks), `data/generation/town/undertown.kyrt` (new), kits' `kit.json` slots | Yes, partly | 14 Kyr templates. Works and the undertown are templates with sections and placeholders. |
| Generators | `src/world/*.ts`, 93 files | No | 22 files still *write* Kyr statements as TypeScript strings, several with literal prose (below). |
| Generated instances | A region's Kyr, written at assembly (`world-<seed>/region/*.kyr`, in memory in the browser) | No (regenerated) | Provenance is the seed and the template; no record of which template line produced which statement. |
| Compiled artifacts | `web/bundles.generated.json`, the module JSON a campaign loads | No | Rebuilt by `AssetCatalog.write`. |
| Persistent state | Saves (`CampaignSave`: the compiled module and world facts), the browser's kept world | No | A save keeps the module it was played with, so a regenerated template does not rename a saved world's places. |

## Generators that still write content (the M19 migration list)

Counted 2 November: Kyr statements written as TypeScript strings, and literal prose of sixty characters or more.

| File | Kyr | Prose | What it writes | Proposed home |
|---|---:|---:|---|---|
| region-undertown.ts | 0 (was 53) | 0 (was 11) | Moved this mission: `data/generation/town/undertown.kyrt` | Done |
| community/community-writer.ts | 33 | 0 | Households, kin, goats | A household template |
| deep/deep-sites.ts, deep-mechanisms.ts, deep-rivals.ts, deep-rooms.ts, deep-argument.ts, deep-sounds.ts | 104 | 23 | Deep sites' structure and mechanisms; words already in `deep/*.json` | Mechanism templates (pump, seal, vent) as `.kyrt` sections |
| region-zones.ts | 24 | 2 | Wild country's tracts | A tract template |
| settlement-writer.ts | 23 | 0 | A settlement's rooms and people | A settlement template keyed by founding |
| region-market.ts | 20 | 1 | Drill-yard, scrivener's curtain | A market template (as the undertown) |
| region-traffic.ts | 18 | 0 | Travellers on the roads | Kit-like template |
| region-sites.ts | 14 | 1 | Ordinary sites | Site templates |
| region-borders.ts, region-gates.ts | 14 | 0 | Marches and provinces | Keep in code (structural), wording to data |
| region-roads.ts | 12 | 24 | Roads; 24 prose literals | Prose to `data/generation/scenes` |
| region-recruits.ts | 6 | 10 | Recruits | Prose to data |
| region-renewal.ts | 8 | 2 | Dens retaken | A renewal template |
| others (fellows, tracts, marvels, riddles, stock, scenario-word) | ~60 | few | | As above |

The structural writers (roads, borders, gates, the writer itself) should stay code: they compose the country's
graph. What should leave code is *content*: rooms, people, troubles, what is said. The undertown is the pattern.

## Reading generated Kyr as structure

| Where | Was | Now |
|---|---|---|
| region-stock.ts | A regex for `Place … is room` and another for who is at each | `WrittenKyr`: the written lines parsed, rooms and dwellers read from the module |
| region-renewal.ts | A regex over template text for `Person {w}_…{…}` and `Peaceable` inside it | `WrittenKyr`: people and `peaceable` facts |
| region-riddles.ts, region-marvels.ts | Find the `Passage` line by substring, its ends by `between (\w+) and` | `WrittenKyr.ends(passage)`: the `connects` fact |

`src/world/written-kyr.ts` parses once per written work (cached). The template filler (`KyrTemplates.fill`) still
substitutes placeholders textually; that is the template's own syntax, not structural manipulation, and is kept.

Remaining text-over-Kyr reads to retire in M19: label-matching in the presentation (`MenuModel.stays`'s `/_way$/`,
`ChoiceList`'s label regexes, `WaysPane.tile`'s act words), where the engine should give the presentation a kind,
not a string to read. These are listed under ARV-M4 (closed word lists) and ARV-L2 (identity in id strings).

## Boundaries and provenance (proposals for M19)

1. **A template registry in data.** `data/generation/<kind>/*.kyrt` read by kind, not imported one by one in code
   (works are imported file by file today); an author adds a file, nothing else.
2. **Provenance in generated Kyr.** Each generated statement carries the template and section it came from (a
   comment, or a field on the parsed entity), so the inspector can say "from undertown.kyrt, section store/rats".
3. **Instances kept apart from saves.** A save already keeps its compiled module; a version stamp on generators
   would say when a regenerated world differs from a saved one.
4. **Prose banks.** Every generated sentence in `src/world` moved to `data/generation/scenes` with its conditions.
5. **No regex over Kyr.** A lint check that `src/world` does not match `Passage|Person|Place …` in strings.
