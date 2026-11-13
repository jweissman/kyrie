# Ordinary actions: where the wait went (M19-62)

The owner, 5 November: noticeable pauses before people answer and in other ordinary actions. Measured in the browser
(Chromium headless, software GL, the play server; a1, Millholm's camp, the reference company) as milliseconds from the
click to a page with nothing pending, three times over each, with the engine's own breakdown of each command (`engine`:
the rules doing it; `screen`: what the page is drawn from; `narrative`: what is told). Script:
`/var/tmp/kyrie/m19/latency.sh`; headless profile of the screen: `/var/tmp/kyrie/m19/prof/`.

| Action | Before (ms) | After (ms) |
|---|---:|---:|
| Talk to someone (their likeness touched) | 851–963 | 191–259 |
| Ask them something | 775–952 | 190–193 |
| Take your leave | 801–965 | 186–202 |
| Walk to another place in the town | 1 110–1 906 | 188–365 |
| Open Trade, open the explorer (no command) | 66–90 | 66–80 |

Of each command before, `screen` was 650–940 ms; after, 77–110. The engine's own share (50–90 ms) and what is told
(7–21 ms) did not change.

## What it was

A CPU profile of the screen being drawn at the camp put two thirds of it in finding who in the town sells what
(`Services.of` asking `TradeModel.at` of every room in the town, each of which copied every fact the world held), and a
third in finding who in the company would carry each thing that could be taken (`Carriers.carrier`, which went through
every fact for each). Both now read the world's indexes (`related`, `relatedTo`, `one`, `measured`): headless, the
screen at the camp went from 509–950 ms to 46–75.

## What is left

About 190 ms a command: the engine (50), the screen (80), the frame sent from the worker and drawn. Nothing waits on
the network, nothing regenerates the world, and no animation stands in for work. Opening Trade or the explorer is the
page's own (no command) and takes a frame. A journey across the land waits for the walk on the map, which is the
journey shown, not a delay.
