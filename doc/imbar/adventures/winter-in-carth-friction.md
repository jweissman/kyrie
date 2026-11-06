# A Winter in Carth: friction in the broad pass

| # | What I tried | What happened | Cost | Smallest repair |
|---|---|---|---|---|
| 1 | Make the wolves' exits leave them gone for the night | `wolves_come` re-fires every tick at limbo between 16:00 and 07:00; putting them at `limbo` brought them straight back | Edited `row.kyr`: `wolves_come` now needs `not wolvesTurned(deadfall)`; a reset at 07:00 in `voices.kyr` | A `Refuge`/`Fears` that holds for the night, as Pellam's `Refuge limbo`; or `routed` settable by authors |
| 2 | A fire as a wolf exit (`capable(actor, flame)`) | No starting calling has `flame`; the Scaifes' tinderbox is not carried | Dropped the fire; used woodcraft and the Row's rhyme | A cheap `flame` grant (a torch for sale at the Exchange) |
| 3 | Wait at a place with night danger to read a rule | Standing at the tower foot or deadfall through the dark: the night-men or wolves down the party, and every later wait is a no-op ("watch 81") | Tests assert `pellowGone`, or stop at the dusk watch | A test helper that warns when the company is down |
| 4 | Check an `Observe` by `g.page` after `put` | Only `screen().prose` shows the place (see Liberty friction 3) | Helper `seen()` in the test | `Journey.seen()` |
| 5 | Action `Result` apostrophes | Action results and topic text come back with curly quotes (’); rule `says` kept straight in Pellam | Regexes use `.` or `’` | – |
| 6 | Licence start | `test/support/gaunt.ts` says the licence runs from watch 330; by `clock.kyr` (seven in the evening on the third day) it should be about 354; I tested at 360 and it fired | None; not corrected in the shared support file | Check and fix the comment |
| 7 | Companion party for a cleric-only unique reading | The standalone campaign's party is a lone bard | The leaf is not reachable without a cleric in the company | Offer a cleric in the standalone party picker, or add a second reading for any party that carries a copy of the first line |
| 8 | Lone-company leaf (review item 1) | The cleric's whole reading is locked for the shipped bard | Added `recite_first_leaf` / `grant_to_woodmen_ear` (ear-taken, imperfect, woodmen only) and played it in `winter-in-carth-shipped` | – |
