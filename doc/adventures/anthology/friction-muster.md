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
