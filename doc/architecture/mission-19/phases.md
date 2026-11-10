# Mission 19: the phases, honestly

**Closed 10 November 2026** as an implementation mission with player-experience acceptance unmet: see
[closure.md](closure.md) for the final account, and [../mission-20/opening-brief.md](../mission-20/opening-brief.md)
for what comes next.

The brief's eight priorities and six journeys (brief.md §XII), each with what has been shown through the interface,
what has not, and what is in hand. Kept beside the register; a priority is not done while its journey has not been
played through the interface. The owner, 7 November: "the adventuring loop isn't close to acceptable yet". PD-14
(five cold players) is unmet.

| Priority | Journey | Shown through the interface | Not yet | In hand |
|---|---|---|---|---|
| III. The adventuring loop | 1, 3, 4 | Fresh agent sessions of 7 November reached a fight from an opening quest in two worlds, and went on a quest-less expedition and back (doc/playtests/) | The owner's own play stalls in the first steps: gold that means nothing, Go… and quarters incoherent, Look… empty and stranding, bland place prose; journeys 1, 3, 4 not acceptable | ux/nav-gold, ux/rest-scene, prose/narratology |
| IV. The player-facing product | 1, 4 | Shops sell; inns as rooms; aims say whom and where; places aims name on the map; portraits whole | Resting scene busy (M19-85); inventory a list; paintings unfitting; the first goal unsaid; danger reckoning unreliable (M19-122); fight log jargon (M19-121) | the three UX branches; commission list |
| V. Identity consequential | 2 | Journey 2 played through the page, 7 November ([journeys.md](journeys.md)): the same opening in Fernholt as a cleric (deacon) and a thief (burglar). The cart, the padlock, the crypt door, the black candle (rite of rest; after a fix, the thief's stealth) and the father's burial (after a fix, the rite said) differ by calling, with screenshots | Talk does not know a calling (M19-141); plants the same to everyone (M19-144); a scholar and a warrior not played; not accepted by anyone but the builder | — |
| VI. Content activation | 6 | Journey 6 played, 7 November ([journeys.md](journeys.md)): the ghoul, the minor potion of healing and the dandelion traced from Orsino's registry through the catalog to play and to the Encyclopedia; Thrume, an authored province, entered (after M19-138's fix, without which it could not be) | Authored adventures contribute no Encyclopedia entries (M19-148); nothing in play leads to an entry (M19-147); new kinds without plates (M19-145) | — |
| VII. Human-scale authorship | 5 | Journey 5 played, 7 November ([journeys.md](journeys.md)): a plant and its item (betony), a spell (Hornet Swarm) and a wild meeting (the honey-hunter) added by data alone, validated, found by `bin/kyrie world` (now listing meetings, M19-140), and used in play; the trail's pages 5 and 6 say how | Prose generators in TypeScript (M19-44); a new kind has no plate (M19-145); a template option's weight has no preview across seeds | prose/narratology moves place prose to tables |
| VIII. World coherence | 3 | World shape, Dun Rìerdan seated, geology and ecology, names from tongues | Dun's towers not places (M19-107); the sea passage (M19-101..103); a quarter and its places at odds (owner, 7 November) | ux/nav-gold |
| IX. Architectural integrity | — | Engine declarations from the AST; typed contracts | ModuleShadow rewrites text (M19-69, open risk) | — |
| X. The Encyclopedia | 6 | Exists (M19-15 partial); journey 6 found its entries agree with play for an Orsino monster, an item and a plant, and an author's new plant and spell in it at the next build; scores and grounds now read as words (M19-139) | Reached from the title only, and from nothing in play (M19-147); no authored adventure's entries (M19-148); not reviewed as a product | — |
| Closure (§XIII) | — | A draft of the seven accounts, 8 November ([closure.md](closure.md)), not accepted | The owner's acceptance; PD-14's cold players; journey 4 (a dungeon and back) end to end | after the loop is acceptable |

## Since 7 November (8 November)

| Priority | What changed | Where |
|---|---|---|
| III. The adventuring loop | The undertown leads on from a job done to the undercroft, a puzzle at its flag, the vault's keeper and four levels below; each wing three or four rooms; the undercroft restful; a full clearance worth the second level, slept on at the inn; a remedy given with the quarry job. Walked headless from the green to the stair below in three worlds (two cleared, one lost to the ossuary's dead) | M19-155, M19-158 |
| IV. The player-facing product | Gold for the aim followed alone, the Map key lit for an aim reached by a journey; the fallen drawn fallen; forty of the owner's scene paintings matched to places by kind; the fight's telling without THAC0; Look… tells first what the story turns on, and a used-up thing's result apart; means held listed apart from skills | M19-152, M19-154, M19-121, M19-142, M19-144, M19-159 |
| V. Identity consequential | Unchanged; talk that knows a calling deferred | M19-141 |
| VI. Content activation | The book on the bones is there; a band named many is spoken of as many | M19-143, M19-149 |
| VII. Human-scale authorship | doc/authoring/forms.md: the forms the anthology's authors wrote around | M19-127 |
| VIII. World coherence | Aims name their places by id (the order's work, the debt's inn); a journey of the player's own kept when an aim moves on | M19-151, M19-156 |
| IX. Architectural integrity | Engine and language gaps deferred to Mission 20 with a reason each | register |
| X. The Encyclopedia | Reached from a thing in the pack, at its entry | M19-147 |
| Closure (§XIII) | The seven accounts drafted; every open row of both registers decided | [closure.md](closure.md) |
