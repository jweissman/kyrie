# Cold play 9 — the deployed page, triage (S3-1, OB-05)

The first blind robot cold play on the deployed build. The page at https://jweissman.github.io/kyrie/mono.html?world=iscoed
reported itself built from 937ff2fe (version.json, 20 November); the Pages deploy was at that sha. It was played in
one headless Chromium by `scripts/cold-play.sh --n 9 --page … --agent none` (scripts/cold-play/page-runner.ts: the
page's own controls, through MonoDriver, each turn written as the runner's JSON for the player's helpers). The life
was the one Set out now draws for iscoed, Aldith, a human warrior of the drove road. The player was a blind agent
held to the two helpers by its prompt: 114 turns, 130 lines, 16 of them refused. `claude -p`, the kit's own agent, was
refused by its API at once, so the agent was this session's own. Its report is cold-9-report.md, its log
cold-9-log.md, its lines cold-9-lines.txt.

## What is the robot's and what is the game's

The robot's driver could not work every control the page has. These failures are the harness's, so the last third
of the play does not measure the game. Leaving the town was impossible for the robot, not shown impossible for a
player:

- Fifteen of the sixteen refusals are `TimeoutError: click: Timeout 30000ms exceeded`. Each is MonoDriver.pick
  pressing a row the page holds under a lens or a view it had not opened: "Search here" (T32, T45); the onward aim's
  follow (T46, T48); "Open the world map" (T92, T108: the 3D board, which headless Chromium may not draw); the ways to
  the country, the salt-house, the fields and the waterside (T94–T130). The sixteenth is the same gap seen
  another way: "No choice exit:region__edge_east" (T126), asked from inside a talk.
- "Set out for Gatesend" was led and there was no row for it (T94–T95). On the page a journey is the map's: the Map key
  lights and the map opens with the way chosen (test/reference-hour). The driver offered only the menu's choices and
  never opened the map. The same gap explains Redkeep (T108).
- "aims: []" on every turn is the driver's. It does not write the aims down, so the player never saw them. The
  truncated aim titles (T43, T53, T85: "The old ways under Porthalen go") are the follow rows' own short labels as
  the page draws them, not the aims' text.
- ", for you" under a talk's first topic (T78, T96) is the row's aside, read into the page's text by innerText.
- "Over 50 R rows on the landing" (T0) is every choice of the menu as the driver lists them. The page draws four and
  its lenses.
- "fight:auto silently did nothing" after a won fight (T41–T42) was the driver pressing T on a fight already ended.
  "Go on" is the page's own way on.

Registered as GR-24 (the driver), so that the next page cold play can measure the whole hour.

## The game's own defects, by how likely the owner meets them this weekend

| Row | Pri | What | Turn |
|---|---|---|---|
| GR-16 | P1 | "Tend Aldith" at Holgar's said only "Holgar claps you on the shoulder. 'You know where I am.'" Nothing was tended and nothing said why. A row named for healing did a farewell. | T99–T100 |
| GR-17 | P2 | Fight prose contradicts the numbers. "it lands, for 4. The great centipede's armour holds." (T48). "The old buck rat's gnawing bite catches Aldith, to no harm." (T38). A rule leaks: "The first zombie cannot be infected." (T64). | T38, T48, T64 |
| GR-18 | P2 | Owain is "carrying water to them a bucket at a time" after the whole drove was watered. | T11 |
| GR-19 | P2 | "You take your time over it, by feel" when the tinker's daughter picked the lock. Her work is told as the player's. | T28 |
| GR-20 | P2 | "Call Mardle out to the reeve, and say what you found before her" was offered before the player had met or heard of Mardle. | T13 |
| GR-21 | P3 | "Creep round … pinch out the black candle" was told in the prose with no row until the candle was looked at. | T64–T69 |
| GR-22 | P3 | Looking at "a book of the dead" did not describe the book. | T66 |
| GR-23 | P3 | "bats, hundreds of them" were two bats of one hit point (cold play 5's "a whole nest" again). | T69 |

Seen before and registered elsewhere: the companion acting twice running (T37–T38: cold play 5's 20); the drowned
four with no way to tell Owain or Bran (T7: a design question, the find itself frees Bran by Mardle). What worked is
in the report: the drove, Mardle's grey, the dungeon under the town, light on a clock, the grave-robber's ways.

## Defect 1, after: the travel rows that did nothing (cold9-fix, 20 November)

The report's first defect, "To the customs-house" (T8–T9) and "To the shrine of Nodens" (T75) doing nothing, is the
driver's. Replayed headlessly on the deployed sha's lines, through EngineHost (the page's own engine: a `travel`
request) and through the runner, the walk from the Black Rhyne to the customs-house arrives. On the page a journey
(travel:) is held (Hold.holds), as every journey is (OR-111). MonoDriver.keyed brought the arrows to the row and pressed
Enter, down and up at once, which begins a hold and lets it go, so nothing was done and the same screen was read again.
T95's journey worked because it went by the hand's path, which already held. The keys now hold Enter on a held row
(test/support/mono-driver.ts). Folded into GR-24.
