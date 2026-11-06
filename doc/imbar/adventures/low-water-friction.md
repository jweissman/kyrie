# Low Water: friction

| # | Tried | What happened | Cost | Smallest repair | Status |
|---|---|---|---|---|---|
| 1 | `j.holds(L('carries'), ...)` in the new test | `Nothing in the world is called lowwater__carries`: `carries` is the shared relation; only this module's own are prefixed | one cycle | Unprefixed `carries`; the Item id still prefixed | worked round |
| 2 | `t.at('isaura')` after the Topic moved her | Journey's `at()` takes the full id; the unprefixed name returned undefined | one cycle | `t.at(L('isaura'))` | worked round |
| 3 | Page text regex with `Thale's` | The page curls its quotes | trivial | Match on the words after the apostrophe | worked round |
| 4 | Make the Isaura choice cost her presence | `Retract travelsWith(isaura, party)` and `Retract willing(isaura, party)` work; nothing in the Kyr lets the company re-ask her the same night | none | none | works; her `isaura_hello_office` re-ask topic is `once` and was already spent in the shipped test path |
| 5 | Lint after adding the module | Two warnings (`lore_halm_black`, `lore_halm_black_again`: "no possible target") | none | They exist at the previous commit; the slack events they read are not in a Bowl-only world | **not mine; left** |
| 6 | Rename two Tamsins | `Tamsin Reed` (Sounding) renamed `Merrin Reed` in display strings in three files; the id `tamsin` is unchanged because the module and the Grand Tour's own `tamsin` are separate. No test mentions either name. The Grand Tour's `Tamsin Quaye` is pinned by `gifts.test.ts` and `the-slack.test.ts` and is not renamed | trivial | none | **done** |
