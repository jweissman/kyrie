# Generative kernel recovery

The comparison uses `/home/jweissman/work/orsino/settings/fantasy/templates.json` (26 templates), its tables, Kyr's shared Deem setting, ModuleBundle/ModuleAssembly, Cast, Creation, WorldConstructs, and the actual combat executor. Repository changes present at takeover are the baseline, not results of this mission.

| Family | Orsino evidence | Kyr baseline: generative / static / executable | Recovery priority |
|---|---|---|---|
| Characters | pc, line, equipment; ancestry/class/background tables | Creation composes ancestry/class/background/traits/spells/kits; four Deem templates handle population/name/scores. Most core class effects execute, unsupported definitions filtered. | Isolate generation streams; retain constructor. |
| Animals/monsters | animal, monster; type/aspect/terrain/rank overlays | Species + variantOf; extensive literal statistics from registry extraction. Natural weapon/armor, traits and resistances execute. No general terrain or rank generator. | Shared environmental adaptation and dragon dimensions. |
| Dragons | dragon + dragonColors | One base and red variant; hardcoded fire breath; base lacks breath. | Lineage selects executable breath, maturity determines power. |
| Encounters | encounter; distribute budgets; roles; companions/devices | Party/actor membership supports encounters, but authored groups, not reusable budgets. | Deem budget distribution and class roles. Budgets are level accounting, not a balance guarantee. |
| Sites | room, boss_room, dungeon | Strong authoritative Place/Passage/Thing/Discovery/Person constructs; Censer Hill authored by hand. | Generate native entities and PassageSpec through existing lowering; attach authored situations at exported roles. |
| Settlements/institutions | hamlet, town, tavern, shop, townHall | Serewater geography, shops, services, stock and keeper society execute but are authored. | Bounded geographic profiles and causal names; reuse existing institutions. |
| Treasure | loot, gemstone, equipment | Large item catalog; actual inventory, equipment, trade and field use. Little shared procedural selection. | Contextual usable treasure; preserve ownership. |
| Religion | deity, shrine | Domains/deities/traits, shrine effects and keeper society; no locality-wide religious generator. | Attach an existing tradition, not independent random gods. |
| Hazards/discoveries | trap, riddle, wonder | Things, hazards, discovery sources and state changes execute. Riddles/wonders largely authored. | Generate placement with safe alternatives; reuse runtime. |
| Adventures | module | Campaigns install regions, institutions, sites and situations with typed imports/exports. Stronger persistence than old module. | Compose these structures; do not revive old dungeon/module architecture. |
| Names | terrain-sensitive town names | Forename lists; settlement names authored. Extracted languages sibling has Dictionary.translate and Conceptory. Conceptory uses Math.random. | Reuse semantic vocabulary; deterministic Deem selection, recorded assembly. |

Highest leverage: native world-construct lowering shared by authored/generated content; existing class constructor for encounter roles; traits as executable adaptation; existing area damage/save/cooldown rules for breath; stable purpose-specific random streams. No grammar replacement or new combat model is needed.

The current bounded creature recovery now includes weighted kind/body selection, terrain eligibility, generated ancestry/class, dragon lineage/maturity, construct material/role, and compatible adaptation. See [the choice grammar](choice-grammar.md) and [installed-CLI proof](choice-space-proof.json). These restore creature-generative capability and executable special actions; encounter/site/locality generation and the complete expedition remain separate unfinished capabilities.
