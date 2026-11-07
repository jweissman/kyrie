# The Liberty of the Ice: friction in the broad pass

| # | What I tried | What happened | Cost | Smallest repair |
|---|---|---|---|---|
| 1 | Test voices for a mixed party (cleric, warrior, mage, bard, ranger) | `Company party "You" of 1` in `company.kyr`; `Pellam.start(home, 'lisk', party)` throws "Choose 1 companions" | Every calling tested in its own journey; thief-plus-cleric interaction tested by asserting the affront | A campaign (or test helper) that may declare a larger party; or a fixture campaign with a Company of 5 |
| 2 | `Rule … when befell(slack_opened)` | Lint error: "Invalid argument slack_opened in befell(slack_opened)" | One lint cycle | A canonical id must be named in the module manifest's `canon` array (`module.json` and `placed.json`); the error could say so |
| 3 | Check an `Observe` by `g.page` after `put` + wait | Observes appear on `screen().prose` (arrival and the room), not in the step's `page`; the wait page only says "An hour passes" | Tests for Observes read `go:` arrival pages (city rooms) or the screen | A `Journey.seen()` helper |
| 4 | `go:black_reach` from the North Road | "No way from north_road to black_reach": the ice is behind the penny-a-stair plank | Used `j.put` for ice rooms | Fine; a `go:` that explains the plank would help |
| 5 | Wait to the end of the book with the company standing at the North Road | The morning's news never fired (`inPellam()` is false on the North Road) | One failing test; add `go:cheaping` first | None needed; worth a comment in `aftermath.kyr` |
| 6 | Lint advice `anchor` on a `Rule … at <place>` | Not hit here, but voices must put `at(party, place)` in their condition as well as `at <place>` | None | – |

| 6 | Lone-company office (review item 1) | The cleric's office for Davy Saffery is locked for the shipped bard | Added `sing_office` (wake-song, three coin, widow affronted, no second light); played in `liberty-of-the-ice-shipped` | – |
