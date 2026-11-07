# The Long Man: friction

| # | Tried | What happened | Cost | Smallest repair | Status |
|---|---|---|---|---|---|
| 1 | Test the quarrel between warrior and cleric by asserting its text on arriving at the green | The text never appeared. `quarrel_over_bounty` is written `at green` (heard there) but its condition had no `at(party, green)`, so it fired in the galleries the moment the notches were read, with nobody at the green to hear it. The earlier test had only walked to the quarrel and never asserted on it. Lint had said so all along (the "anchor" advice) | a cycle, and a shipped beat that had never been heard | Add `at(party, green)` to the condition | **fixed** (`voices.kyr`) |
| 2 | Journey step `>steward` | `No way from road_end to region__steward`: `>` takes a place id (`study`), not a person | trivial | Use place ids | worked round |
| 3 | A pattern for the sermon's last line with an apostrophe (`a child's capitals`) | The page curls its quotes; `told` is straight and `page` is curled. Patterns that straddle one fail | trivial | Match on the words either side of the quote | worked round |
| 4 | `Give rod to actor` for the reeve's gift when the rod had already been lent | Works: the item changes hands again and `holding` is true; no error | none | none | none |
| 5 | A ranger-only passage in a company of one | `hidden until drain_known` hides it from the `>` router until the reading is done; the router then walks it | none | none | worked |
| 6 | Rename duplicate-sounding names (`Josiah Pumphrey` in the Grand Tour, `Josiah Quire` in Tessary) | Both ids are referenced by tests (`quire`, `pumphrey`), so by the brief neither was renamed | none | Rename `Quire`'s first name when a test next touches him | **not done** |
