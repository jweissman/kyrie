# One command, one receipt (MT-24, Stage 2: a design note)

The architectural review of 20 November, Finding C: a command is carried out by two coordinators, and between them
the game is half done. The boundary test found it (test/campaign-boundary, 8ec70645e). A save made while a command
yielded held the command's world but not its step. That one is fixed narrowly (`Campaign.held`). A frame built at that
moment still shows half a command. This note says what replaces the two coordinators, and the smallest first step.

## Who does a command today

| Phase | Coordinator | Where |
|---|---|---|
| resolve the choice; check it is offered | session | `PlaySession.perform` (`PlayerView.resolve`) |
| carry it out: effects, a fight, the assault after it | campaign | `Campaign.executeAsync`, `complete` (commits the world, logs the event) |
| what came of it: the country beyond drawn and installed | session's expander | `Expander.expand` (Frontier, the host's widening) |
| what is told: rule words, voices | session | `RuleWords.tell`, `Telling.tell`, `campaign.told` |
| aims moved on | session | `Undertakings.after` |
| the step kept | session | `steps.push` (transcript, digest) |
| undo on failure | both | `campaign.undo` / `rollback` (from `begun`) |

The campaign commits the world after phase 2. Everything after that is the session's, and it can yield (the expander
awaits). Between the two there are three windows: a fight's await, phase 2's commit, and the expander's await.

## The design: a unit of work with a committed receipt

- **`Command`, one object per command.** It holds the begun checkpoint and goes through these phases in order:
  `resolved → executed → expanded → told → settled → committed`. It is the only owner of the phases, and it is what a
  failure at any phase rolls back.
- **A receipt, written once, at `committed`.** It holds the event as told, the voiced lines, the aims before and after,
  the step (command, combat, digest), and the revision it moves the game to. The world changes only at `committed`.
  The campaign keeps the new world as the command's draft until then, rather than committing it in phase 2.
- **A revision number on the campaign.** The receipt moves it by one. A frame or a save names the revision it was
  made at.
- **One coordinator.** The session runs `Command`. The campaign and the expander become phases it calls, and
  `executeAsync` stops committing.

## What refuses mid-command

- **A save refuses:** `Campaign.save` while a `Command` is open. This is what `held` does today.
- **A frame refuses:** `ScreenModel.build` and `Narrator.leaf` on a campaign with a `Command` open throw "frame only
  between commands". A client that needs to draw something meanwhile draws the last committed frame, which the host
  has already. This also keeps the frame from reading the fight's leased creatures.
- **`offered()` refuses outright,** where it now returns `[]`. An empty offer is a frame that lies.

## Which coordinators join it

- The session (perform, follow, leg's journeys, each leg a `Command`).
- The campaign (`executeAsync`, `complete`, `rollback`).
- The expander (Frontier, the host's widening).
- `Undertakings.after` and the tellers.
- `EngineHost.keep`, which saves only at a receipt, never on a timer that can land mid-command.

## The smallest first step

1. Rename `Campaign.held` to an open-command marker that the session sets from `resolved` to `committed`. It already
   covers execution and settling.
2. Make `ScreenModel.build` throw while it is set. Run the boundary test's new case: a frame built at the expander's
   await is refused.
3. Then move the world's commit from `complete` to the session's end. The receipt follows from it.

Each step is pinned in test/campaign-boundary and test/command-atomicity, with fault injection at each phase. No
client changes until the third step, and then only the host's keep.
