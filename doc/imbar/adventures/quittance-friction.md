# Quittance: friction

| # | Tried | What happened | Cost | Smallest repair |
|---|---|---|---|---|
| 1 | `befell(slack_opened)` read in a `when` | `lint`: "Invalid argument slack_opened in befell(slack_opened)". The event entity must be named in the manifest `canon` list, not just `imbar` | one lint cycle | Document in 04-authorability that a *reader* must list the event in `canon`, as the writer does. Worked round: added `slack_opened` to `module.json` and `placed.json` canon |
| 2 | `holding(actor, <Item id>)` for a local item | Invalid argument: `holding` takes the **Kind** id; the Item id is for `Give` | one cycle | Lint message could say "this is an Item; holding takes its Kind" |
| 3 | Test: `j.holds('holding','party', Q(kind))` | Local Kinds are unprefixed in `holding`, though every other id is `quittance__x` | two failed runs | Note in `test/support/quittance.ts` header |
| 4 | Test: two-calling preset party | `Choose 3 companions`: the preset party size is fixed | trivial | Pass three callings |
| 5 | Test: wait through a burn with the company standing in the Yard | The burners arrive at 816 and the fight interrupts `play('=...')` at 819 | one cycle | In tests, move the company before jumping; real players get the fight (intended) |
| 6 | Reader of an event in a one-province world | Lint warning "no possible target in this world" for the Fire's Slack topic | none | Acceptable; reachable in all-in-one |
| 7 | A shared event for a Fire/Auditor link | No event exists for "the Auditor has left"; Low Water asserts none | none | Left as a phrase, as the audit wanted |
| 8 | Review item 5: replace asserted payoffs in `quittance-voices` with plays | `d_gasket_next` (Skelter's thirty coin), the Tithe men (clock rules), the burning of Candlewick and the Hearthkeeper term can be played from a placed company. `ds_accord` = 5 and `following(auberon)` and the placements themselves (`Ds.at`) are still asserted: reaching the Fire with accord 5 by play is a long descent. `j.give('watch_tally')` and `befell(slack_opened)` are other provinces' and stay asserted. | a cycle | A `Ds.walkToFire` helper. | **partly** (see quittance.md, row 9) |
| 9 | Display names: `Hester Peascod` and `Hester Grindle` | Renamed `Ada Peascod` and `Nan Grindle` (ids unchanged; one test label updated). Hester Tamsett stays: the coal is named for her. | trivial | none | fixed |
