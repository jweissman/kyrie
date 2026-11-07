# Friction: building The King's Players

New frictions only; earlier ones are in the other friction documents.

1. **`=+N` is relative to the current watch.** A staged "wait to the next night" needs `=+225`, not an absolute; I lost an hour assuming the other. Absolute `=HH:MM` only moves forward within the day.
2. **`at` is exclusive, and Rules cannot Retract with unbound variables.** `Retract at(x, ?x)` fails to compile unless `?x` is bound in the condition; simply `Assert at(x, new)`.
3. **Rules cannot Assert `knows`.** Knowledge can only be taught by `Observe … teaches`; I rewrote four rules into Observes.
4. **Persons placed at start act at start.** A hostile ghost on a roof killed the test party before Act II; it needs `nowhere` until the rule that releases it.
5. **Warned patience vs timed actions.** A sexton's patience counted down while a long resolution action ran; `Time 0` on stage-the-tragedy fixed it, but it is a trap for any scheduled confrontation.
6. **A `Speaker` must be where the action is.** `stop_fallow` was silently never offered because `fallow_moves` kept putting him back at the front; a diagnostic ("Speaker not present") would have saved an hour.
7. **A person's label comes from `Known as`, not the Role.** "Ask Orrin to join" read wrong until the person was renamed and `Known as` carried the page's cover name.
8. **Names lint is corpus-wide** (surnames and places): Dray, Tallis, Tarn, Crake, Fenn, Pennick, Lantern and `bell_loft` all clashed with existing adventures and had to be renamed.
9. **A design test rejects `Decrease` of anything but coin and honey** (`gosses-company.test.ts`, "only coin and honey are spent"). I had modelled disfavour and distrust as decrements; the rule is a good one but unlisted anywhere I read before writing.
10. **`roll(undefined)` is not failure.** The Journey's default is natural dice; forcing a failure needs `roll('fail')`. My first "fiasco" spec passed by luck on the other tests.
11. **A finished campaign shows no choices**, so a spec that waits after an Ending throws `Unoffered`; assert the state instead.
12. **Compound shell commands are refused in a worktree-isolated agent** (heredoc plus test run in one call). Use Write/Edit and plain commands.
13. **Write-only flags are advised but not tied to Observes.** Flags that gate only an Observe's text count as read; flags that gate only a later flag chain do not. I had to add Observes to make arcs "readable" to the linter, which pushes authors toward prose-for-the-linter.

## Added in answer to the review

14. **Specs that teleport hide the real path.** `assert`/`put`/`set` make a spec pass while the route a player takes is closed (the Pentrice Endings fired before the herald; Aubrey came after the book had closed). The harness should make a teleport a flagged exception, not the default idiom.
15. **A Pentrice Ending is a poor way to leave a book.** Eight Endings gated on `cameForTrial` and a tick end the campaign; a continuation needs those Endings conditioned on the world not having moved on. I added `pentriceCloses()`; the original gate should have been the continuation's concern from the start.
16. **Waits stop at the first change.** `Wait › A while` ends when anything notable happens, so a spec that needs two rule passes must wait twice. Staging a boundary and waiting once left the company in the wrong room.
17. **Rules racing in one tick.** Two rules that move the same person in one tick (lodge to the Sparrow, move to the Wick) race; staging must mimic the real order (arrive, tick, then act three).
18. **`Decrease` in Actions is policed by a design test; in Rules it is not.** I spent favour and trust in Actions and was refused; the same moves are legal in Rules. That asymmetry should be written down.
19. **`Temperament territorial` plus `Lair` makes a place a fight.** The Field became a combat standoff where a level-1 party died; `Peaceable` with a `Greets` that says the same thing is the fix. A temperament on a Lair should draw a lint advice.
20. **Relation arguments are arity-checked, not type-checked at assert.** `assert('posing', 'rierdan')` compiled and did nothing.
21. **Gating a continuation's Endings changes every existing Pentrice test.** Twelve tests that ended at the verdict needed the herald sent away; a helper in the test class (`fixture`) was the right place.
22. **A sed over a block can eat adjacent rules.** I replaced a region by index and deleted two rules I had added at its edge; the spec caught it only because Act IV's company stayed in the Sparrow.
