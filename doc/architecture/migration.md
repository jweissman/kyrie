# Migration: from many models to one

> The catalog rows below describe the state before the domain model reconstruction. The catalogs are now in
> `data/canon`; see [domain-model.md](domain-model.md#4-migration-map) and [its report](domain-model-report.md).

19 October 2026. This document classifies the repository's material against the canonical vocabulary in
[ontology.md](ontology.md) and sets out how legacy content moves over without losing what has been played and
recorded. The audit behind it is [audit.md](audit.md).

## The rule for new work

New worlds use only the **recommended** material below. Legacy material keeps working, and its golden histories keep
replaying, but nothing new is built on it. `kyrie lint` enforces this: it fails if a recommended campaign has any
finding, and it reports legacy campaigns so the migration can be measured.

```
bun bin/kyrie.ts lint              # every campaign; exits 1 only on findings in recommended worlds
bun bin/kyrie.ts lint --verbose    # include every legacy warning
bun bin/kyrie.ts lint --inventory  # concept inventory: every relation and measure, and the files declaring it
```

## Classification

### Recommended (canonical)

| Material | Where | Notes |
|---|---|---|
| World rules | `data/rulesets/world/{core,passages,people,needs,services,care,belongings}.kyr`, `data/rulesets/discovery.kyr` | One meaning per relation. Plain narration, no engine commentary |
| Language constructs | `Place`, `Passage … is kind … taking …`, `Thing`, `Item`, `Person` (with `Ancestry`, `Calling`, `Profession`, `Background`, `Offers`, `Sells`), `Company`, `Discovery`, `Event`, `Observe`, `Pursuit` | All lower to facts, rules and observations (`src/lang/world-constructs.ts`) |
| Catalogs | `races.json`, `classes.json`, `abilities.json`, `statuses.json`, `items.json`, `data/orsino/overlays.json` | Overlays and the new gear kinds carry their Orsino source |
| Sites | `data/sites/reedwake`, `data/sites/skellfold` | Region › settlement/wilderness › site › building › level › room, with typed passages |
| Situations | `data/situations/caught-below` | Roles only; no named places or people |
| Campaigns | `data/caught-below/{river,quarry}.campaign.json` | One situation installed in two sites, with a default company |
| Client | Mono (`web/mono-*.ts`) over `ScreenModel` and `ChartModel` (`src/ui`) | Two map scales, expedition resources, overlays on the company sheet |
| Tooling | `bin/kyr-lint.ts`, `bin/campaign-lint.ts` | `kyrie lint` |

### Legacy, kept as fixtures

These still load, play and replay. Their recorded histories are evidence and must not drift.

| Material | Why it is legacy | Migration path |
|---|---|---|
| Rulesets `adventure`, `dungeoneering`, `spatial`, `items`, `fieldcraft`, `expedition`, `affinities`, `site-capabilities`, `ecology`, `devotion` | Directed `route`/`gate`/`hazardPassage` traversal; flag-state objects; `restful` places; rule text that explains the engine | Re-author a campaign's places as `Passage` and `Thing`, then switch its bundle to the world rules |
| Serewater (`data/serewater`) | The town and hill re-authored as Reedwake; the original keeps its 8-NPC campaign and two browser histories | Already superseded for new work by `sites/reedwake` |
| Saint Orra, Frontier, Blackvein, Greenhollow, Sanctuary, Discovery orchard, Client study, bundle experiments | Legacy traversal and campaign-local vocabulary (see lint results) | Migrate one at a time, starting with the smallest; regenerate goldens only when the change is purely presentational |
| `data/backgrounds.json`, `data/capabilities.json` | Three campaign keys (`forager`, `surveyor`, `pilgrim`) mapped to Serewater puzzles | Kept so Serewater's recorded parties remain valid. New characters take Orsino overlays |
| Clients Folio, Wayfarer, `player-app`, workbench, parity harness | Built on `PlayerView.map`, which reads legacy route relations | Retire once their campaigns migrate. The parity harness stays as a test tool |
| Experiments (`data/experiments`, `data/modules/crossing.kyr`) | Redefine `at`, `quantity`, `watch`, `hungry` locally | Leave as language experiments; lint reports them as repository errors so they are not copied |

### Removed

| What | Why |
|---|---|
| `data/sites/shared/tables.json` | A fourth copy of the player company as a DEEM table (`marchCompany`). Sites now declare `Company`; campaigns give a default `party` |
| Party actor tables in the Reedwake and Skellfold templates | Same reason |
| `lever` item kind | Replaced by `crowbar` from Orsino's gear list |
| Authored fields that never took effect (Serewater's Nera `Race human`, Pell `Race human`, the roost hound `Level 2`; Greenhollow's guest and host `Race`) | Generation used to override them silently. Under the new precedence they would have won and changed recorded histories. Removing them keeps play identical and makes the source honest |

## Staged plan

1. **Done: vocabulary and precedence.** Canonical rules under `rulesets/world/`; authored > generated > default with
   provenance and recorded conflicts; canonical entity types (ability, skill, item kind, good, clock, passage kind,
   service kind) shared across installations.
2. **Done: one recommended vertical slice.** Reedwake and Skellfold sites, Caught Below installed in both, overlays,
   services, needs, measured travel time, two-scale maps.
3. **Next: migrate the smallest legacy world** (Sanctuary or the Discovery orchard): replace `route` facts with
   `Passage`, flags with `Thing` states, and its bundle's rules with the world rules. The test is `kyrie lint` reporting
   it clean with its golden history unchanged, or changed only in wording.
4. **Then Serewater's remaining content** (the salvager, the custodian and the deep return) as situations installed
   in Reedwake, so the original campaign becomes a composition rather than a monolith.
5. **Then Orra and Frontier**, which share a refuge and tower. Their campaign-local relations (`closesAt`,
   `rescued`, `supplied`) either become world vocabulary with one meaning or stay situation-local under a namespace.
6. **Retire legacy rulesets** once nothing installs them, and retire the clients that read legacy relations.

## Golden histories during migration

A golden history may be regenerated only when the replayed commands and outcomes are unchanged and the difference is
presentational. In this round, Serewater's `fellowship` and `hired` saves were regenerated for one reason: item events
now use an item's instance name ("Surveyor's line and pitons") instead of its kind's name ("Climber's harness"). The
transcripts are unchanged; six event labels differ; everything else matches. The played-history markdown
(`doc/playtests/serewater/*.md`) was regenerated from the same transcripts and still matches the CLI replay. The
frozen dossiers were not touched.

## Lint results at the end of this round

| Scope | Errors | Warnings | Findings by check |
|---|---:|---:|---|
| Repository vocabulary | 7 | 52 | 7 redefinitions of canonical `at`, `quantity`, `watch`, `hungry` (all in experiments); 43 campaign-local relations; 9 names declared with different signatures in different files |
| `caught-below/river`, `caught-below/quarry` (recommended) | 0 | 0 | — |
| Serewater (two campaigns) | 0 | 7 each | legacy traversal; 6 scene texts that explain mechanics |
| Greenhollow (two campaigns) | 0 | 6 each | legacy traversal; 5 scene texts that explain mechanics |
| Blackvein (two campaigns) | 0 | 12 each | legacy traversal; 11 places outside the containment tree |
| Frontier pine, Orra play | 0 | 14 each | legacy traversal; 12 places outside the containment tree; 1 explanatory text |
| Orra company and fellowship | 0 | 9 each | legacy traversal; 8 places outside the containment tree |
| Client study | 0 | 8 | legacy traversal; 5 places outside the tree; 2 explanatory texts |
| Discovery orchard, two-sites bundle, crossing bundle, Sanctuary | 0 | 3–6 | legacy traversal; 2–5 places outside the tree |

Checks performed per campaign: identity conflicts (authored versus generated), containment, passage ends, duplicate
passages, passage kinds that contradict their ends (a stair on one level, a road indoors), legacy directed traversal,
reachability from the company's start, actions with no possible target, item kinds missing from the catalog, and
prose that explains the implementation.

Checks not yet performed: unbound situation roles are caught at installation, not by lint; contradictory
observations (two descriptions of one thing true at once) and readable sources without text are not checked.
