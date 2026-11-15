# The projection chain, audited (the owner, 15 November)

One action should have one identity, and doing it one outcome, whoever asks: the browser, the terminal or a headless run.
This audit lists the places the chain had a second path, what was cut, and what is left.

## The chain

world → `PlayerView.choices` (every legal act, by id) → `Affordances` (candidates, with reasons) → `Promotion` (the acts led,
each with why and aspects) → `Glance` (acts, ways, **offer**: the four and the rest, `Offers.scene`) → clients:
page (`MenuModel`, `GlanceStage.Acts`), terminal (`Terminal.offer`, `Terminal.led`), runner (`Runner.offer`), autoplay
(`AutoplayRun.led`). Doing an act: `PlaySession.leg` → `perform` (an action of the world) or `travel:` (a journey).

## Second paths found, and their state

| Second path | Found | State |
|---|---|---|
| **Follow** was a button in the prose (`Told.Follow`, `NextPull`) calling `app.follow` → host request `follow` → `Undertakings.follow`, with the terminal's own `follow <n>` and the runner's own `{follow}` doing `Undertakings.follow` directly | five inline buttons, three direct calls | **Cut.** `follow:<aim>` is a command of the session (`PlaySession.perform`, kept in its steps); the offer is the glance's (`HeldActs.follow`), so the page, the terminal's four, the runner's offer and the autoplay gold walker are all offered it by one id and do it by one call. The Notes list keeps its button, which now sends the same command. |
| The aim's offer was added by the host only (`Glance.held`) | a first attempt | **Cut** (moved into `Glance` proper, so no client lacks it). |
| Cross-hex roads were map-only on the page, and the offer's four dropped them for upkeep | PB-19 | **Cut for the offer and the page.** A crossroads leads with up to three roads (`Offers.roads`); the page keeps near and far roads as menu acts done as journeys (`MenuModel.roaded`), and a road taken from the scene is no walk on the map (arrival is the scene). |
| `view:map` ("Open the world map further in") stood in for a road among the acts | seen in the browser | **Cut** with the above. |
| Page-only handling of `travel:` and `unbind` in `ReaderApp.perform` | | **Left**: the page routes `travel:` to a `travel` request, as the terminal does through `leg`; one command, two doors. Parity is pinned by test/client-parity. |
| Map surface: its own ENTER card, its close cross, "Back out to the map" | | **Left** (PB-17): the map is still a separate surface with its own controls. |
| Action wording: the page's `GlanceStage.label`, the terminal's `Terminal.drawn`, the runner's names | | **Partly**: the offer's labels are identical (pinned); the page rewords some rows (`acted`, `Words.*`), which the pin does not cover. |

## Pinned

test/action-identity: from one world, the page's frame and the terminal's glance offer the same acts by the same ids,
commands, words and types, follow among them, and doing it in either comes to the same world and the same next offer.
test/client-parity: the same commands from one checkpoint come to one digest and the same led acts.
test/follow-offered-browser: the real page, title to the road.

## Not yet proven

- Identity over many states (the pin is the opening of one world); the matrix walker could assert it per step.
- Wording the page rewrites (a thing's look as its inner act) against the terminal's.
- `travel:` and `unbind` as session commands for all clients.
