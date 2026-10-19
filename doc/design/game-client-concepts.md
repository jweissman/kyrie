# Three ways to play a text-first party RPG

> Historical Milestone A evidence. The Lantern interface has since become the primary Serewater game; see [the implemented campaign](../serewater-campaign.md). The screenshots and findings below describe the earlier prototype.

Status: interaction exploration. One implemented prototype, two design alternatives. None has been validated by first-time human players. These are structural alternatives, not three color themes for the current page.

## The alternatives

| | A. Lantern theatre — selected | B. Expedition window | C. Living atlas and camp journal |
|---|---|---|---|
| Core interaction | An illustrated stage, compact intention ribbon and party strip. Change mode rather than stack panels. | First-person room window, explicit exits and party command console. Town uses the same encounter/window structure. | Regional itinerary and room sketch beside a narrated expedition folio. Decisions become short entries rather than a permanent command list. |
| Creation | Meet three portrait-led companions; choose calling/ancestry, explain party coverage, then enter the world. | Create character sheets, assemble formation, buy starting kit. | A company charter with origins, commitments and portraits, then individual details. |
| Town | Place plate and present inhabitants; approach a person to enter conversation. | Walk a connected street/site graph by exit controls; services are particular doors and people. | Choose a destination on a town sketch; scene entries anchor people and services to real locations. |
| Conversation | Speaker response occupies the story space; limited topic/response intentions; step back returns to scene. | Portrait/text modal over the environment, with questions and offered items/claims. | Correspondence-like exchange; important commitments recorded in the folio. |
| Wilderness | Wider scene plate, route choices with known costs and risks; travel receipts, not a world-map dashboard. | Node-based movement with facing optional; encounter window interrupts travel. | Plan a leg, choose pace/provisions, observe intermediate sites; route and time are central. |
| Dungeon | Persistent room identity, visible exits, objects and party; examination changes the scene. | Strongest spatial immediacy: door/arch/stair navigation, inset discovered map. | Annotated room/level sketch; text distinguishes investigated, inferred and unseen connections. |
| Combat | Full-stage JRPG encounter; active companion, action, target, causal receipt, next actor. | Dedicated enemy window, formation and rows of commands; comparatively dense rules display. | Duel folio overlays the map, turning a party exchange into chronological beats. |
| Possessions/progression | Dedicated company/satchel modes; equip comparison and learned rewards return to play without dashboard clutter. | Classic inventory/character screens with explicit slots and detailed derived stats. | Load and utility matter in the expedition manifest; advancement happens around the camp ledger. |
| Time | Clock remains peripheral until a decision needs duration or urgency. | Clock and remaining light/supplies frame each movement. | Calendar/route budget naturally foregrounds long expeditions and recovery. |
| Strength | Supports people, atmosphere and abstract combat without promising spatial simulation. Works for both IF and party RPG. | Clear dungeoneering rhythm and geometry; strong retro RPG identity. | Best regional context, expedition planning, discoveries and persistent aftermath. |
| Risk | Can become a decorated action list; illustration must not imply unsupported manipulable objects. | Implies facing/spatial combat or pixel hunting; weakest fit for current abstract positions and mobile. | Can become another map inspector/management dashboard and distance the player from characters. |
| Initial cost | Low–medium: new renderer/modes over existing player projection and command controller. | Medium–high: scene topology/view-direction presentation, exit affordances and assets. | Medium: good knowledge-aware maps, itinerary/camp state and careful prose pacing. |

Choose A for the first prototype. Its essential bet is **rhythm**: observe → choose an intention → act or speak → see the result → return to a changed place. Combat should be a different mode, not a long card inserted into exploration. B remains worth reconsidering if dungeon navigation becomes the central pleasure. C's itinerary ideas belong in a secondary expedition map, not the main screen.

## Implemented prototype: The Lantern Road

Build with `bun run web:build`, then open **`site/folio.html`**. It is separate from `index.html` and `workbench.html`; neither reference interface was replaced. No parser, world schema, combat interpreter or effect behavior was changed for it.

The actual short journey is creation → Reedwake conversation → willow causeway → receiving hall conversation → stair → lower ossuary encounter → learned ember reward → return and six-hour recovery. Travel and retreat remain available; it is not a forced slideshow. A reward can be examined/claimed without killing the guardian: contested looting and guardian ownership are not implemented in this fixture. The full branching dungeon, salvage dispute, escort, equipment treasure and progression remain proposals in [the slice specification](rpg-vertical-slice.md).

This is intentionally not another proposed Saint Orra expansion. The fixture exists to compare client interaction, uses known adapted mechanics, and makes no claim to validate the new campaign's adventure quality.

### Backend and presentation boundary

```text
FolioApp → PlaySession.perform(public command, combat controller)
           → existing Campaign / World / Battle / AbilityUse / CreatureStore
           → PlayerView + ActionFeedbackView
           → FolioApp scene, dialogue receipt, encounter and company strip
```

`web/folio-app.ts` controls view mode, selection, drawers and rendering. It never sets HP, awards a mock item, advances time or fabricates an NPC answer. `web/folio-art.ts` contains original symbolic SVG plates; its town/wilderness/dungeon classifications are fixture-specific presentation bindings. They are not a generation or gameplay subsystem. A future client should read presentation bindings from authored content rather than expand this ID mapping. The prototype is not yet a universal renderer for arbitrary campaigns.

Actual NPC dialogue is `Topic`/`Says`/`On discuss` source. Feedback is the existing receipt projection. Combat is the existing Battle passed to the same controller contract, with legal actions/targets from `CombatChoices`; enemy behavior and rolls remain authoritative. Company creation uses the canonical DEEM path. Saves and exported transcripts use the existing session format under a separate local-storage key. Satchel displays actual campaign stock; it does not offer pretend equipment controls.

The source fixture reuses shared adventure/discovery/fieldcraft rules and Orra's existing company construction table. That legacy table dependency is explicit in its manifest. It is not the proposed final region-generation package. Its fully lowered source and canonical dossier are available in [the evidence directory](../playtests/lantern-road/README.md).

## What changed in interaction, and what did not

- The environment occupies the stage; one intention determines the current list. Exploration does not open with a path graph, health table and event dashboard.
- Conversation replaces the scene text with the committed reply, while the person and place remain visually present. It has an explicit step-back action. Current replies still use the common receipt styling; proper speaker portraits and turn-taking need evaluation.
- Encounter mode gives the opponent a stage and makes actor/action/target selection distinct. Per-action costs, cooldowns and exact effect source remain visible. Raw DEEM expressions still make some descriptions technical; a faithful player-language formatter is missing.
- Rewards choose a real recipient and appear in their actual learned abilities after return. This proves continuity, not an adequate treasure system.
- Mobile uses a scrolling scene and static party strip after the scene. An initial sticky strip covered combat choices; visual review caught that and it was removed. A production client needs a compact persistent companion control that does not obstruct content.

No background mechanics, inventory slots, meaningful equipment choices, animation timing, sound, formation system, full region map, custom rebinding or polished screen-reader/focus management are claimed. The portraits are placeholders; identical silhouettes weaken character identity. Current combat art is deliberately the one fixture opponent and is not a general creature portrait pipeline.

## Evaluate before selecting a production client

The [desktop/mobile evidence](../playtests/lantern-road/README.md) demonstrates that the prototype executes real commands. It does not show that the concept feels good to unfamiliar people.

Give 3–5 first-time participants a build without this specification. Ask them to create a company, explain Vesper's concern, decide whether to descend, identify who is acting in battle, interpret a save, return and explain what the reward changed. Observe hesitation, accidental actions, missed exits, unread feedback and premature assumptions. Ask for reasons, not whether they “like the interface.” Compare with a short paper/HTML room-window mockup before committing to A.

The critical questions are whether the stage creates a sense of place, whether intention switching hides useful choices, whether replies feel like a conversation, and whether the transition into battle preserves context. The current prototype may still feel like a sophisticated action list. That is a design risk to test, not a problem solved by its passing walkthrough.
