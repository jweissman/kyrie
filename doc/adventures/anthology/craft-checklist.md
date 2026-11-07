# Craft checklist: what every hostile review found, so the next piece does not need finding

*Distilled 7 November 2026 from nine adversarial reviews of the anthology (Tallow x2, Muster, Wrong Boat x2, Fourth Act, King's Players...). Run it before asking for a review.*

## Structure and play
1. **A clean run must need decisions.** If doing nothing, or the shortest walk, reaches an ending, the piece has no engine. Give every shortcut a cost, every hiding place a way of being found, every dominant strategy a counter. (Wrong Boat: a 12-click walk skipped the chase; hiding re-upped forever; an unopened hamper was invulnerable.)
2. **Clocks must bite.** A resource that cannot run out before its gate is decoration (water casks, rations, torches). Hunger, fever and cold need an effect the player sees.
3. **Chasers and hunters must be on the page.** A threat that strikes wherever the party is, or that is never described, is a button.
4. **Every ending is reachable by honest play, and every state reaches an ending.** Check: arrival with no flags; the unopened box; the long wait; pressing "next" past the last. Add a spec that plays each ending *by labels*.
5. **No softlocks:** stranded after a timer; a scene counter without an upper bound; a one-way passage; a stage that closes.
6. **Specs play, they do not teleport.** `assert`/`put`/`give` may set up a branch, never replace the route to it. At least one spec plays from the true start to each act with no teleport.
7. **Bargains with a warned creature are `Time 0`**, or the creature's patience ends the bargain with a fight.
8. **A threat that kills needs a telegraph in the room where it kills.**

## State and continuity
9. **No write-only flags.** Every `Assert` must have a reader that changes text, a choice, an ending or a person's location, not only a flavour Observe or the topic that sets it. If an answer does not matter, cut the question.
10. **One fact, one place, one number.** Chronology, distances, counts and names are stated in different files and drift. Choose and grep: years, miles/days, the number of dead, how many are in a pack, a weir's name.
11. **Carry the base forward.** A continuation reads the epilogue facts of what it continues (who won, who married, who left) and branches its greetings on them. Never teleport hard-coded names; gate on membership.
12. **A thing that moves, moves everywhere.** Hatchlings, companions, a body: their location in the tent scene and the island scene must agree.
13. **Leftovers:** relations declared and unused; comments citing removed passages; docs that count species/endings/tests wrongly.

## People, voices, prose
14. **Companions are arcs, not menus:** three beats at three places, a want and a flaw, an ending variant for each state, a way to leave.
15. **Questions put to the player must matter later:** the answer changes a price, a door, a line in an ending, or a person's position.
16. **Voices:** boisterous, laconic, chatty, formal, raw, foolish. If five lines can swap speakers, rewrite three. Nobody explains the significance of what happened unless it is a joke.
17. **Prose tics to grep and cut:** "the way a man does who", "as a man", "the size of", "slowly", "quietly", "very", "quite", "does not look at", "says nothing", "a long time", closing aphorisms, "you know that…", lists of three. Show one concrete sensory fact, not a mood.
18. **Anachronism:** Michaelmas, crosses herself, programme, tinfoil, christening, bugle, Aye, apex predator, thermals. The world has its own months and gods.
19. **Names:** unique corpus-wide (`test/adventure-names`); no M- or J- pile-ups; check before choosing, not after.

## Engine hygiene (see friction.md)
Reserved words; `Time 0`; `Observe … as sound when`; `Initially Assert state(...)`; `at(party, X)` in every rule that says something; `Observe … teaches` for knowledge; `once` with `answering`; the patience of warned creatures.
