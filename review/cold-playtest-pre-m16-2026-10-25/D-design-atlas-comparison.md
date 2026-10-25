# D. Design-atlas comparison

Atlas read **after** sealing the cold record (`doc/design/kyr-player-experience/`: README, vision, product specification, combat model, roadmap, journeys; interface and capability documents skimmed). On the left is what I observed (cold, unchanged). On the right is what the atlas intends. My observations weren't revised.

One framing fact first. The atlas was written from play of the **hand-authored** campaigns of its time (Reedwake/Pell, the quarry/Tamsin, the dragon Calder). The ordinary entry point I played is a **generated** country (Silverfells). Most of the gap below comes from that difference in what's being played.

## 1. Atlas goals already convincingly realized

| Atlas goal | Observed |
|---|---|
| **PX04 safe inspection.** Opening a noun doesn't spend time or commit anything. | Clicking people opened conversations. Clicking objects opened look panels. Examine and listen didn't move the clock. The goblins opened a choice rather than a fight. Services are labelled with price and duration ("2 coin · 1h"). The atlas's headline R1 failure (clicks that buy healing or start fights) did **not** reproduce. |
| **PX02 provenance in Notes.** | "Heard, not yet seen — Kildrak, priest of Gwyn ap Nudd, told you, Day 1, 8:10 a.m." plus *Unfinished* and *Known before you set out*. Close to the atlas's target. |
| **Visited vs. known on the map.** | Hollow nodes for places heard of, filled for visited; dashed local nodes for unvisited; etymologies. |
| **Readable threat and resolution** (combat model §2). | Committed enemy intents, listed resistances and vulnerabilities, per-target odds and HP, dice and modifiers shown (and hideable). |
| **Explicit requirement language** (PX03). | "Needs digging or a shovel, and the company has neither." |
| **Situations develop without the player** (PX13). | The brothers set out at first light after I dawdled. Orsik's deadline. A five-day extension offered as an explicit choice. |
| **Narrow-screen layout** (interface §9). | Clean reflow at 390 px, no horizontal scroll. |

## 2. Partially realized but undermined by presentation or content

| Atlas goal | What undermines it |
|---|---|
| **PX10/11 truthful narration and results.** | The epitaph omits the protagonist and says "one against one" (`obituary.ts:38`). My final action wasn't shown. "Bleeding / not bleeding" in one round. "Infected" attached to the wrong beat. Placeholder "You carry out the action." in the Story and in a look-panel. |
| **PX02 bounded knowledge.** | Notes asserts facts nobody told me (willow bark; "the bear"; the philosophers as a solvable task). Tavern gossip is filed as "seen for yourself". |
| **PX09 durable history across save/load.** | The save restores the world exactly, but the Story starts at the load point. |
| **PX13 consequences reach the player.** | The rival band runs and leaves a trace by day 14 (P). But on the same day there's no trace, the prior is silent, there's no Notes thread and no news for four days. |
| **Combat model: readable, tactical.** | Information is readable. Outcomes are dominated by level-1 fragility and two-person parties. Taunt was the one decision that clearly mattered. Difficulty labels contradicted themselves. |
| **Withdrawal** (combat model §2). | Flee works and is clearly labelled "ends the fight for all". It isn't the previewed company withdrawal the atlas wants. With the protagonist down it led straight to death without saying why. |
| **PX05 creation previews capabilities.** | Incompatible combinations are blocked at selection (good: "not for a dwarf"). But there are no statistics, HP or spell text, and no sheet at all until a companion joins. |
| **PX06 equipment as preparation.** | Shovel, crowbar, pole, torches and Light do change what's possible ("Needs a shovel"). But the ten-foot pole's generic "Prod" does nothing while its specific "push" works, and Light isn't offered where darkness blocks you. |
| **Conversation.** | Characters have real one-line voices. Templated repeats (identical news, rumours, greetings) and topics that vanish after one ask undercut them. |

## 3. Important goals still absent from ordinary play

- **A complete expedition with a changed return** (Vision; Roadmap A1/R8). In two attempts I never finished a dungeon. The "return" I did achieve (paying Orsik) came from floor loot, not from completing anything.
- **A three-companion company** (Decision 1; handbook "a company is three companions"). I could recruit exactly one.
- **Substantial authored adventures in ordinary play** (Roadmap R8). They exist but sit behind `?dev` or beyond the region's edge-stones without signposting (finding C1).
- **Experienced advancement** (PX07/R11). I reached 294/1000 XP. No level-up was within reach of two journeys.
- **Casualty location and carrying rules** (PX06/R3). Not observable. A total wipe ends play, and "Begin again" resets the world.
- **Return views showing what changed** (PX13). "SINCE YOU WERE LAST HERE" exists but reported the weather.
- **Institutions acting on the player** (R12). Kildrak's threat to withhold the rites is promised in dialogue. I didn't test whether it's kept.

## 4. Failures the atlas doesn't adequately anticipate

1. **Discoverability of authored content.** The atlas assumes the player is in an adventure. It has no requirement that the ordinary entry point *lead* to the adventures (C1).
2. **Generated-content quality.** Template repetition, name collisions on the map, assembled noun phrases, data-record inscriptions, a riddle inverted relative to its answer, placeholder strings. The atlas's prose standards (PX10) target authored scenes and event narration, not generators (C5).
3. **Level-1 lethality and party size as the first barrier.** The atlas treats danger as something to make *readable*. Readability already exists here. Survival is the problem: a 5-HP protagonist knocked out before acting, 16 → 1 in one round (C2).
4. **Rolled statistics that contradict the chosen calling** (C4).
5. **Economy calibration**: a single floor item clears the opening debt, and full healing costs 2 coin (C9).
6. **What "begin again" means**: a restart resets the world while the text claims continuity (C8).
7. **Verb-over-noun emptiness.** The atlas warns against implied physics (PX03) but not against a uniform Look/Listen/Prod set that mostly answers "Nothing comes of it" (C6).
8. **Notes as a leak of generator truth.** The atlas guards against leaks from the planner. The leak I saw comes from authored thread summaries written in the author's voice (C7).

## 5. Atlas proposals that look unnecessarily elaborate given the actual experience

- **Feature-based tactical zones (R10/C2), Protect, a shared six-second round clock.** In every fight I played, the decisive problems were HP margins, party size and truthful outcome text. None of my decisions needed position. Defer until a party can survive two fights and finish a site.
- **The full structured-result contract (PX11)** as a prerequisite. The specific falsehoods I saw (obituary count, missing protagonist, unshown last action, bleed contradictions) look fixable with targeted repairs. Don't gate them on the whole contract.
- **Paper/fixed-event modality experiments with five participants (Roadmap Step A)** before fixing obvious defects. The issues here are visible to one careful player. Fix them, then run the participants.
- **Carry and bulk rules for casualties (PX06)** before a survivable first expedition. With two-person parties and instant wipes, carrying rules rarely come up.
- **Elaborate route itinerary previews (R5).** Exits already show durations. The real problem was the repetition and sameness of routes, not missing previews.

These are valid long-run goals. They're just not where an unfamiliar player currently gets stuck.
