# Authoring cost: construction and selection

See [the public grammar](choice-grammar.md) for standalone category generators and native scoped `gen(type, parameters)` calls. Missing parameters select compatible variants; category templates express assembly rules rather than species presets.

| Request | Declarative additions | Public generator |
|---|---|---|
| Bear | `creatureBody.bear`, a weighted `creatureKinds.animal` eligibility row, canonical species and provenance | `animal` |
| Copper dragon | `dragonLineage.copper`, including key/habitats; automatically joins unspecified lineage selection | `dragon` |
| Frost bear | No additional definition: bear + existing frost adaptation and compatibility data | `animal` |
| Stone guardian | `constructMaterial.stone`, `creatureRole.guardian`; reuse golem body and eligibility | `construct` |

None adds a species-specific construction template or TypeScript generator. A new habitat may also require broadening the category's terrain-pool entries; eligibility is authored geography, not inferred from catalog presence. The small body/class/ancestry rows still mirror canonical facts, with drift tests. That duplication is acknowledged rather than hidden in a runtime adapter.

[authoring-additions.json](authoring-additions.json) contains the exact rows and canonical/provenance additions. [authoring-cli-outputs.json](authoring-cli-outputs.json) contains complete outputs and commands. [choice-space-proof.json](choice-space-proof.json) proves direct category generation, constrained calls, diversity and a further data-only extension with boar and jade lineage. The automated dimension-extension test adds a watchful dragon contribution without editing `creature`.

Copper deliberately uses existing acid breath; Orsino's original blinding breath remains unsupported. Bear uses claws, fur and Smash. Stone contributes Constitution and HP; guardian contributes Formidable. These are existing rules rather than new combat mechanics.

```sh
bash test/smoke-deem.sh > /tmp/creature-proof.json
bash test/smoke-deem-choices.sh > /tmp/choice-space-proof.json
```
