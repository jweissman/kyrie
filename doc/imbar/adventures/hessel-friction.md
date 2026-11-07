# The Banns at Hessel: friction

| What I tried | What happened | Cost | Smallest repair |
|---|---|---|---|
| `Observe n at place when befell(slack_opened)` | `Invalid argument slack_opened`. The module's `canon` list must **name each event entity** (`"canon": ["imbar", "slack_opened"]`) | one lint cycle | document it in the Kyr guide |
| `Observe` with a calling in the condition (`memberOf(?m, party) and hasCalling(?m, calling_bard)`) | works (the unbound `?m` is fine) | none | worth a doc line |
| `Observe n at place "text"` | needs `when true` | trivial | none |
| `Hum the bar` as a one-time tune choice | the Ball's `afterEleven()` and `twissFavour` were enough | none | none |
| A second ending line after `last_dance` | Journey prints "last_dance and morning_after held at once" (existing) | none | an `Ending` ordering note, already given |
| Testing the peal for a non-bard | had to wait to watch 282 at the Abbey Yard in the thief's campaign | slow | a `=day 3 06:00` step as in Hollins' `Journey` (Hessel's fixtures use raw watches) |
| Signposting the peal and the Ball | An Observe `when true` on the Pump Room board is enough; it needs no new fact. | One Observe. | None. |
| Cutting the slate | The pumper's rubbing reaction in `lore.kyr` and three test lines read it. | Removed both. | None. |
