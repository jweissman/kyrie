# 8. Testing reachability, consequences, save and reload

*The authoring trail, page 8 of 9. [Start](../README.md) · previous: [Contributing to a settlement or a city](07-settlements.md)
· next: [When the contracts are not enough](09-extending.md)*

Run against the Lantern Well of page 3 on `fbf38d58`; each answers a different question.

## Does a curious player reach it?

```sh
bin/kyrie reach data/campaigns/lanternwell.campaign.json
```

```text
lanternwell  rooms 2/2  people 1/1  topics 1/1  acts 0/0  seen 3/24  mute 0  sellers 0 wares 0  idle 1/900
  ended: steps
  unvisited rooms: -
  unmet people: -
  topics never offered: -
  endings never reached: answered
```

`reach` plays a curious, undirected player and says what it never got to: rooms, people, topics, endings. The ending
was not reached because the wanderer never lifted the lid, which is a fair warning that nothing invites it. `bin/kyrie
reach --all` runs every adventure (and finds anyone mute). `bin/kyrie inspect <campaign>` names the condition each
unoffered act waits on.

## Did the act change what it should?

`--probe` asks the world a fact after the steps. Ids are namespaced by installation, so ask with the full id: `state
lid` answers `no`, `state lanternwell__lid lanternwell__open` answers `yes`.

```sh
bin/kyrie play data/campaigns/lanternwell.campaign.json --probe "state lanternwell__lid lanternwell__open" "To the square" "Lift the lid off the well"
```

```text
state lanternwell__lid lanternwell__open: yes
```

In a spec, `Journey.start(campaign, id)` and `j.play(...labels)` walk the page's own labels, `j.page` is what the page
told, and `c.world.one('state', k('lid'))` reads a fact (`test/lanternwell.test.ts` as scaffolded; page 4's spec).

## Does it survive a save and a reload?

`s.checkpoint()` is what the browser keeps; `PlaySession.resume(checkpoint, { trusted: true })` takes it up again and
refuses one that is not what its own record says it was (`src/session/play-session.ts:52-61`). Page 4's spec saves in
the placed adventure and reloads: the company stood where it was and the lid stayed open. `test/cold-resume.test.ts`
reloads into a page that has played nothing yet (a game carrying a kind of its own). `bin/kyrie keep
<transcript.json> <name>` turns a game saved from the browser into a kept trace, and `bin/kyrie replay
<transcript.json>` replays one and prints its state.

## The adventure as a whole

```sh
bin/kyrie verify lanternwell        # lint, its specs and its kept traces
bun run test:changed                # the specs a change touches, by its code and the data it names
bun run test:quick                  # about half a minute; the full suite and the browser specs are CI's
```

`bin/kyrie forecast <campaign> --callings warrior,mage` sets each band against novices of each calling, and
`bin/kyrie transcripts` writes journeys as the page told them. In the browser: `bun run web:build`, then
`bin/kyrie preview <campaign.json>`.

**What none of these prove** (the process audit's lesson, 4 November): that a player discovers it, understands it, or
wants to go on. Builder play and specs show it is implemented and reachable; only an independent player can say it
is usable and enjoyable (PD-14, open). An adventure's spec that plays it standalone with its preset party proves the
standalone shape, not the shared world's (page 4).

*Next: [When the contracts are not enough](09-extending.md).*
