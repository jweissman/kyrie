# Friction met rewriting the Long Muster's Road

*7 November 2026.*

1. **The worktree began from main, not the branch it was told to branch from**; the fork had to `git reset --hard adventure/anthology` before it had any muster files.
2. **A Topic cannot roll**: a person's question answered by a check cannot be an `answering` Topic with `Resolve`; the lint is silent until load. Worked round with separate Actions; the interview's answers carry no dice.
3. **A person who asks the player a question needs three topics** (the ask, and one per answer) and the answers are visible only after the ask. The ask must be `once`, so a question cannot be put again.
4. **Names**: Marra Tellis → Tellis and Fenn Hallam → Hallam, Octa Brine → Millward, Lucilla Sarn → Merula (and Sarn is an island elsewhere): the corpus-wide surname check cost four renames. Hobbe's brother-in-law could not share a surname with Elpis.
5. **`Seen when dark()` wolves are met at once by `put`** (a staged move races the warning); tests walk instead.
6. **The clock of a standalone campaign starts at midnight**, so wolves are "visible" at watch 3.
7. **An item `in` a room is an error that reads as a missing container**: `Item x … in gold_cellar` instead of `at` was found only by a test that could not Take it.
8. **`Arrives at X when …` on a `nowhere` person with a multi-turn delay** works, but its Role advice ("wherever they are") is only advice.
9. **Rules cannot Assert `knows`**; every knowledge gain is an `Observe … teaches` or a topic's `On discuss`.
10. **Lint advice about write-only facts** pushed every companion and answer flag to be read somewhere: the `endings.kyr` Observes exist partly to satisfy it, and partly because a flag nobody reads is a consequence nobody sees.
11. **A Thing's description does not change by who is looking**: a place shows its blocking state text after the creature is placated (owlbear, slump in Tallow; the giant here).
12. **Shell restrictions in worktree agents**: compound commands (heredocs piped into `python3`, `source`-like strings) are refused; files had to be made with the Write tool and run singly.

## The second pass

13. **Answering topics can be written to feel like interaction and be monologues.** Fifty were; the review found them flags read by one Observe. Fixed by making answers open or close other topics (the Archive's years, Orsa's secret, the pardon). The authoring surface does not say which answers gate.
14. **`Ending` fires the moment its condition holds**, closing the page; the dispatch had to be held back by the ending's own condition so the last topic stayed reachable.
15. **`opening when` can close a passage in both directions**; there is no way to close only the return. The deadline closes the way out as well as in, which is the point, and the cost of testing it.
16. **A rule's `dice(clock)` is a different die at every watch**: an unroped fall needed two exclusive rules and a latch, not one roll.
17. **A `Seen when` person with `Buys` is the only way to gate a purchase** on what the player has said.
18. **The corpus-wide surname check** again cost three renames (Corrin to Pyke, Marcia to Ursa, Moll's real name used in text).
19. **Worktrees and patches**: tens of multi-line replacements were done by script with a "missing" report; three missed silently on first run because the text had been edited in between.

## The third pass

20. **`opening when` on a passage closes both directions**, so a deadline on a bridge strands whoever is already across; the remedy (close only the entries from one side, and write an ending for whoever is stranded) is a pattern the guide does not name.
21. **An `Ending` fires on any tick its condition holds**, so a late-game ending must test everything still pending (`waiting()` here) or it eats the moment it was meant to follow.
22. **A Topic `once` question has no retry; an Action check has unlimited retry** unless the author writes a latch relation; three obstacles had to be given one.
23. **A queried name can shadow a canonical query** (`home`): the vocabulary check says "redefines canonical query".
24. **Time**: a gauntlet's length is the sum of its passages; text and tests had to be reconciled to it, not the other way round. Doubling every road passage was cheaper than rewriting eleven descriptions.
25. **A companion who carries things takes them when she goes**: a pouch in Marra's pack was lost to the company when she stayed behind at the Pass.
26. **A closing passage must be audited for the occupant**: `opening when` closes both directions, so a party standing *on* the closed span has no exit; the parapet needed its far end left open.
27. **Narrow clock windows on rules are fragile**: `hour >= 18 and hour < 19` retracts only if a tick lands inside it. The gate's cooling now needs a night (`gateNight`) then a morning window; this relies on the clock ticking through, which the spec exercises only for the walk, not a long wait.
28. **No journey API for the clock's day**: the spec reads `measure('watch', 'clock')` in ten-minute units and reasons from 864 = the seventh day.
29. **A companion limit of one** (the party is four) made the Marra, Fenn, Dunya and Ione journeys incompatible; it also hides every second companion's beats from a single play-through. Specs had to choose.
30. **`needing climbing` is a gear check** (a worn climber's harness), not a skill of the party; a `Buy` option disappears from the page when the purse cannot meet it, which is how the harness became the gold hook.
31. **An ending that fires on arrival eats any beat that waits at the arrival place**; the cure was to hold the ending while the companion is still travelling.
32. **A weather rolled "at first light" must be read after first light**: reading at 04:00 saw yesterday's sky.
33. **A rule that moves a person into `Retract`/`Assert at` must name the new place**; `Retract` alone leaves the person where the rule found them for the next query.
34. **An ending that holds for a companion needs a rule that ends the hold**; otherwise any trust level the player cannot reach is a softlock (round 4's blocker).
35. **A Python replace on a string read earlier and never written back silently drops the edit**; four ending texts and two rules were lost this way and found only by grep.
36. **The "will wait ten minutes more" line is read from `warned`, which a bargain does not clear**; the engine's `Patience.of` is not edited, and every bargain Action retracts `warned` itself.
37. **There was never a companion cap**: what looked like one was the purse against each companion's `hire`. A limit that is really a price should be documented as one.
38. **A topic gated on `not annalsOpen` is re-offered when `annalsOpen` is retracted**; to shut a thing, gate its opener on a separate latch.
