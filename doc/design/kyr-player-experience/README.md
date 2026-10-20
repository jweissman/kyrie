# Kyr player experience — product specification for review

**Kyr should feel like leading a small, capable company into places that exist for reasons beyond the company: learn who and what matters, prepare a particular approach, take risks together, and return to people and routes changed by what happened.** Character growth expands ways of inhabiting that world; the world's people, institutions and changing conditions keep making those capabilities matter.

This is a design and research commission, not a client implementation. No replacement client, scenario or tactical rules have been implemented. The intended product is broader than today's engine. “Must” below describes the recommended product contract **for review**, not a claim of current support or approval to build it.

## Deliverables

| Deliverable | Document |
|---|---|
| **A. Player Experience Vision** | [vision.md](vision.md) — intended game, identity, principles and bounded product targets. |
| **B. Product Specification** | [product-specification.md](product-specification.md) — loops, player-known world, interactions, party, time, narration, continuity; [combat-model.md](combat-model.md) — intended encounter rules and spatial decision. |
| **C. Representative Player Journeys** | [player-journeys.md](player-journeys.md) — complete expedition, social return, catastrophe/recovery, progression and continuation, with current versus proposed behavior marked. |
| **D. Annotated Interface Concepts** | [interface-specification.md](interface-specification.md) — small view hierarchy, desktop/narrow wireframes, transitions, action/focus behavior and alternatives. |
| **E. Capability Gap Analysis** | [capabilities-and-authoring.md](capabilities-and-authoring.md) — observed support, partial engine mechanisms, missing capabilities, and what authors must express. |
| **F. Prioritized Roadmap** | [roadmap.md](roadmap.md) — dependencies, owners, scopes, acceptance gates, risks and explicit non-goals. |
| **G. Additional Playtest Evidence** | [additional play record](../../playtests/product-2026-10-19/README.md), [97 captures](../../playtests/product-2026-10-19/evidence-index.md), nine checkpoints and exact text. |

## Evidence and decision notation

- **O — observed:** directly seen in exploratory browser play. `N21` means additional-play capture 21; `C25` means original cold capture 25.
- **I — inspected:** supported by current source or recorded events, not independently played. Engine extensibility is not shipped gameplay.
- **D — desired:** product behavior proposed here. It may require new rules/content/client work.
- **V — validation needed:** a design hypothesis or unsupported/unplayed capability; not acceptance evidence.

Capability tables separately use **supported / partial / absent / unverified** and specify the layer. These distinguish authored play from generic engine representation.

The earlier [cold review](../../playtests/cold-2026-10-19/README.md) remains evidence. This commission moves beyond its repair-first scope. In particular, the intended RPG is not permanently restricted to nonspatial combat; it recommends small feature-based tactical zones, subject to a bounded experiment and explicit new spatial rules. The current game must continue to display abstract combat honestly until those rules exist.

## Decisions recommended now

1. Three active companions, differentiated through combat and expedition capabilities; no mandatory tank/healer/thief composition.
2. Four complete loops: intention, encounter, expedition, evolving campaign. A recovered object or dead enemy is not automatically an adventure outcome.
3. Single-player, pause-on-inspection world; time passes through committed actions/waits, not while reading or when the app is closed.
4. Adventure-led presentation, explicit site/region maps, focused encounters; Party and Notes are supporting views, not permanent dashboards.
5. One authoritative world with bounded party/NPC knowledge, durable causes, explicit clocks and saved consequences.
6. Minimum intended tactical model: a small graph of authored physical zones, clear action economy, visible committed threats, protection and objective/disengagement rules. One-zone abstract encounters remain valid where no finer geometry is authored. No tactical tile grid in the baseline.
7. Zero HP means incapacitated; death requires an explicit event/disposition. Recovery, abandoned companions and possessions need physical locations and clear rules.
8. Validate one complete expedition and return before expanding a campaign. Then validate two linked expeditions with an actual advancement and a situation developing without intervention.

Numerical progression curves, final ability balance and institutional breadth remain content/rules decisions to review. Builders must not fill those gaps by silently inventing rules; the roadmap identifies where definitions and experiments precede implementation.
