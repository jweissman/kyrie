# Time: what a watch costs, and the way to advancing many at once

Written for: whoever takes up time advancement next, in this mission or later, and anyone weighing what cities,
armies or an ecology would cost. Every number is measured on one desktop machine (WSL2, bun 1.4.3), with the program
named; what is proposed is marked as proposed.

## What a watch does

A command's time passes a watch at a time (`WatchLoop.pass`). Each watch the campaign:

1. advances the clock and the conditions that run on it (a torch burning down), and projects the creatures' facts
   again for any actor whose part changed (`Campaign.advanceWatch`, `Projection`);
2. lets every townsperson continue what they are doing or choose afresh (`CampaignTick.npcs`, `Agency.choose`);
3. asks every rule of every module whether it holds, in authored order (`CampaignTick.rules`);
4. strikes what hazards strike, checks pressures and outcomes, and whether anyone falls on the company, whether its
   way is still open, and whether its activity is interrupted.

## What it costs now

Per watch, the simulation alone, from a checkpoint (`watch-phases.ts`, a scratch timer of each phase; inclusive times,
so nested phases overlap):

| | wren, step 151–175 | the frontier segment |
|---|---|---|
| facts, modules, rules | 18,000; 17; — | 104,000; 33; 1,496 |
| watches | 126 | 181 |
| a watch | 7.8 ms | 10.3 ms |
| the clock and conditions | 1.7 ms | 0.3 ms |
| projecting creatures' facts | 1.7 ms (457 projections) | 1.3 ms (421) |
| rules | 0.7 ms | 3.1 ms |
| townsfolk | 0.2 ms | 0.8 ms |
| whether the way is still open | — | 0.6 ms |

At Mission 15's start a rest of eight watches took 2.4 s at the median in wren; it now takes 112 ms. What was removed
on the way: every actor projected on every watch (34% of all time), every rule asked whatever had changed, the world
copied for every write, and the environment of each creature read by going through every fact (see
[`performance.md`](performance.md)).

## Where the time goes

**Rules are asked by breadth.** In the frontier segment all 1,496 rules are asked on every watch: 867 asks a watch,
about 2 µs each. A rule that held nowhere is skipped while nothing it reads has been written (`World.stamped`), but
nearly every rule reads the clock (`watch`, `hour`, `untilLight`) or the watch's die (`dice`), which change every watch.
The commonest are one per deep site's group of dwellers: "each watch, with this chance, they wander". Skipping a rule
by a part of its condition that names no variable and was false costs more than it saves (tried and withdrawn: rules
went from 560 to 807 ms over the segment), because the false part is mostly the die.

**Projection follows real change.** The 421 projections of the segment are the ones whose inputs changed (a torch, a
townsperson's gold); asking for one before every townsperson, as the loop did, cost little beside them.

## The way to many watches at once (proposed)

Advancing many watches as one must not skip what would have happened in them: a threat arriving, a rule firing, a
pressure falling due, a light going out, an interruption. So the step is not "skip", but "go to the next watch at
which anything can happen, and run that watch in full".

1. **A horizon from each source of change.** Each says the earliest watch it could change anything:
   - a townsperson's undertaking: its `until`; one choosing afresh: never, while nothing it reads changes (its reads
     can be named as rules' are; `Reads`);
   - a condition on the clock: when it runs out;
   - a pressure: its `at`;
   - a rule: never, while nothing it reads changes, except the clock and the die. The clock's readings are known in
     advance (dark at nine, first light at six). So is the die: `dice(x)` at watch w is drawn from the campaign's seed,
     the watch and x (`World.die`), so the first watch at which "the die under twenty" holds can be found by drawing
     forward, without running the watches between;
   - the company's activity: its interruption and its end.
2. **Advance to the least horizon.** The clock measures are set to that watch's readings directly, and the watch is run
   in full. Nothing between could have changed anything, so nothing is skipped.
3. **The oracle is the watch-by-watch run.** Both modes must come to the same canonical state on the descents, the
   kept journeys (wren, the march wander) and generated rests; a difference names the source whose horizon was wrong.

## Towards cities, armies and an ecology (proposed)

Breadth is the cost that grows: every actor and rule of every module, every watch. Beyond horizons, the way is the one
the independent audit sets out (its section 8):

- **Activation by consequence.** Distant actors and institutions decide at their own horizons (a project due, a
  caravan arriving), not every ten minutes; what they do is applied when it would be observed, or when it changes what
  the near world reads.
- **Aggregation, refined on encounter.** A distant population is a few measures (numbers, stores, morale) advanced in
  bulk, and made individuals again when the company comes among them, deterministically from the seed and the history.
- **The same oracle.** A coarse run and a fine one must agree wherever the company can see.

None of this is built yet. The measured need now is modest (at about 10 ms a watch in the frontier, a night's sleep of
48 watches is half a second); it grows with every region drawn.
