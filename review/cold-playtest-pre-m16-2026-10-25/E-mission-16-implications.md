# E. Mission 16 implications

I haven't read any M16 planning. My understanding of "joined-world expansion" comes only from the commit history visible on the played branch (`e6f69c1`: authored countries held beyond the march of a generated world, "and its folk speak of it"). The recommendations below assume that M16 extends the joining of authored adventures and generated regions into one playable world. Weigh them against the actual M16 brief.

Proportionality: two cold journeys, one reload and one seed (`zadiweno`). Findings marked *high confidence* reproduced or were directly diagnosed. The rest is labelled.

## Should block M16's joined-world expansion

| Finding | Why it blocks | Minimum to unblock | Confidence |
|---|---|---|---|
| **C1. Authored adventures are unfindable from ordinary play.** | Joining the world is pointless if the joined adventures can't be found. In my seed, Thrume and Merrowdale sat beyond the edges and no one in the first town named them. | An ordinary player, starting cold, hears of at least one joined adventure from a person in the first settlement, with a route, inside the first hour. Verify by cold play, not only by test. Decide whether the title page should offer the authored campaigns directly (today they need `?dev`). | High |
| **C2. A first expedition is usually a wipe.** | Expanding the world multiplies places that a level-1 party of two can't survive. Players will never reach the joins. | Set what a starting company is (the handbook says three; one recruit was available). Make sure the region's first deep site is survivable and finishable by an ordinary starting party, with difficulty labels consistent for the same encounter. | High for the observation; medium on the remedy |
| **C3 (narrow). Defeat text misreports.** | Joined content will produce more endings. Each currently lies about party size and omits the protagonist. | Fix `src/narrative/obituary.ts:38`'s party count; name all of the fallen, the protagonist first; show the final action before the end screen. | High (diagnosed) |

## Should be incorporated into M16 because they directly affect its player experience

- **Seams between generated and authored text (C5).** Players will meet generated folk next to authored ones. Templated repeats (identical "news", rumours and greetings), map-name collisions and data-record inscriptions will be most visible right at the joins. At minimum: no two NPCs in one settlement give identical lines; generated rumours of the same kind differ by more than the place name; no placeholder strings ("You carry out the action.") in any player-facing view.
- **Consequences of rival bands and joined clocks must reach the player (C8).** Commit `e6f69c1` says a joined adventure's clock "runs from when it is reached". The player needs to *see* clocks: a Notes thread when a rival band departs, a trace the same day, and the sponsoring NPC reacting.
- **Notes provenance (C7).** Joined worlds have more sources of truth. Stop thread summaries from asserting what no one said ("the bear"; willow bark), and file reports as heard, not seen.
- **Story history across load (C7).** Longer joined campaigns will be saved and reloaded more often. The Story shouldn't start over at the load point.
- **Route and name distinctness (C10).** Joined worlds add roads. Two exits from the same place shouldn't share a name, and quest destinations (Gibagabar) should appear on the map once heard of.
- **"Begin again in this country" semantics (C8).** Either the joined world continues after a wipe or the text stops saying it does.

## Defer to later missions

- Feature-zone tactics, Protect and the six-second shared clock (atlas R10).
- Advancement curves and training (R11): needed, but only after a party can complete a site.
- Institution breadth (R12) beyond what joined adventures already author.
- Casualty carrying and bulk rules (R3's carrying part). The narrow truthfulness fixes above come first.
- Economy re-balance (C9). Note it now, because joined adventures that pay large sums will make it worse.
- Spell and ability text visible without hover, and the statistics/calling mismatch (C4). These matter a great deal for new players but are independent of the join. Do them early, but they needn't ride with M16 unless M16 touches creation.

## Investigate before committing engineering effort

1. **Are generated deep sites completable?** Run a batch of seeds with a standard starting party (the repository has an `arena` script) and record how often each site's bottom is reached. I never got past the second level.
2. **Difficulty-label basis.** The same 1-HP bats were "A HARD FIGHT" one day and "EASILY WON" the next at full health. Find out what the rating reads.
3. **Riddle-bank audit.** "I always was, yet never will be" → Tomorrow is inverted. Check every riddle against its answer.
4. **Play *The Long Man* cold.** It's marked `recommended`, but I couldn't reach it in ordinary play. If it's much stronger than the generated content, that argues for making it the default first experience while generation matures.
5. **Whether Kildrak's threat is kept.** If the stair is opened, does the shrine actually refuse healing? That would be the atlas's best institution example, and I didn't test it.
6. **The retry rule for failed checks** (deterministic per seed/skill/actor/topic). Decide whether the player should be told the result is final.
