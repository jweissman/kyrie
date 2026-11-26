# Where a turn's time goes (a CPU profile, 26 November)

A foreground spike on the maturity track: one replay of the warrior's golden walk (`WalkTimings.played`, the quality
gate's own walk) under Bun's CPU profiler (`bun --cpu-prof`), on origin/main at 0daf27dc7. Its readings were start
7,860 ms, median turn 113, decision 34, leg 46, on a loaded machine. That is in line with CI's night (start 4,421, turn
94, decision 28, leg 53), so the shares below are trustworthy where the absolute numbers are not. The profile is
sampled, not wrapped, so it pays nothing for the costs it reads. (scripts/act-attribution.ts says why its own wrapped
times mislead.)

Of the 8.1 s the walk's turns took (the runner's `went`, 5.85 s, plus the engine's `perform`, 2.29 s), split by the
first frame in src/ below each:

| Part | ms | Share | What |
|---|---|---|---|
| The screen built (`ScreenModel.built`) | 2,844 | 35% | the frame: rows, groupings, parts, withheld readings, fight odds |
| The act itself (`Installed.during` under `PlaySession.perform`) | 1,834 | 23% | the command checked and done, the world's rules settled |
| The glance and its narration (`Narrator.leafed` → `Glance.of`) | 1,698 | 21% | the resting scene's reading: aims, the gold's routes, asides |
| What the company perceives (`PlayerView.observe`) | 1,404 | 17% | perceive 671, and the revision's offered actions 836 |
| Telling, resuming undertakings, the rest | ~360 | 4% | |

**The finding: presentation is three times the act.** About 73% of a turn is the player layer building what is shown
(the screen, the glance, the view), against 23% for the engine's act and its rules. AX-05 said "the screen costs
more than the turn" at 63%, and it has grown since. Today's rule-side repairs (RuleWakes, QuietWatches, the
one-operator check) were worth doing, but they act on the smaller part. The decision target (15 ms) and the turn
target (30 ms) are won or lost in the player layer.

## Inside the screen (2,844 ms)

| Part | ms | Note |
|---|---|---|
| The people present, each row (`screen-model.ts:72`) | 527 | of which the fight's reckoning 388 and the target row 102 |
| KeptParts (`kept-parts.ts:23`) | 412 | parts kept across worlds, re-checked each turn |
| Withheld readings (`withheld.ts:12`) | 321 | |
| ChoiceGrouping (`choice-grouping.ts:193`) | 301 | |
| The chart, the town plan, passages, talk weight, quarters | ~560 | |

- **The fight's reckoning** (`FightHelp.reckoning` → `DangerSense.reckon`) is a genuine re-simulation, not a lookup.
  Its key holds each fighter's hit points and the day's uses, which change from turn to turn, so the kept fights
  rarely match. And the kept map is cleared whole at 200 entries. A reckoning for every attackable person present, on
  every turn, though it is read only where a fight is offered and looked at.
  - Lever: reckon lazily, once the fight row is asked for (its aside or its focus), or key on what changes the odds
    in bands, not by every hit point.
  - Both change when the reckoning is known. The first is the smaller semantic change.

## Inside the glance (1,698 ms)

- `Glance.reading` (561 ms) is the gold's routing: aims named, whereabouts, the company's light and its sellers, aim
  routes and leads spent. `PlayerFrame.reading` takes 237 more.
- This is the knowledge door's reading, done again each turn whole.
- Lever: a WorldMemo per world for the routing's inputs that do not change with the act. Most turns change where the
  company stands and little of what it knows.

## Inside the view (1,404 ms)

- `PlayerRevision.of` → `Campaign.offered` (836 ms): the offered actions, reached first through the view's revision.
  Checked by counting: `offered` is called 20 to 160 times a world on the walk (2,364 calls over 53 worlds), but it
  is worked out once a world and read after, so this is the one real computation of the legal actions, not a
  duplicate. The decision's 28 ms includes it.
- `perceive` (671 ms): what the company perceives this turn.

## What this suggests, cheapest first

1. *(Checked, nothing to take: `Campaign.offered` is worked out once a world; its repeated calls are lookups. The
   profile's top self-time line, `structuredClone` at 825 ms, is almost all the start's: the parse cache, compiled
   modules and the vocabularies' reading. Of a turn's, only the checkpoint (40 ms) and the fork (65 ms).)*
2. **Reckon fights lazily** (FightHelp), only where the fight's row is opened or the fight is offered as led, under a
   spec that a fight the page shows is reckoned as before. ~5% of the screen.
3. **Memo the glance's routing inputs per world** (named people, whereabouts, the light's sellers) through WorldMemo,
   which already notes their reads for the kept views. ~half of the glance.
4. **KeptParts and Withheld:** profile their re-checks per turn the way OR-183's repair did for the groundings
   (staleness by picks, not by names). That is the structural lever, and the one the frame tree (OR-1071) will want
   anyway: a frame built incrementally from parts that know what they read.
5. **The frame tree is the performance plan, not only the trust plan.** A presentation that is 73% of a turn, built
   whole each time from parallel derivations, is what OR-1071's single tree, built from parts that know their reads,
   removes. The incremental frame should be planned as the tree's second increment, with incremental equal to full
   as its equivalence spec (as test/groundings-incremental holds the groundings).

## Not measured here

- The journey leg alone. A leg's share is inside `went` (`Travel.step`, 1,123 ms inclusive), and its frame is built in
  `went` too, so the leg's 5 ms target meets the same finding.
- The browser. The page's wait (OR-1138: 9.8–17 s to the opening) is a worker and bundle question this headless
  profile does not see.
- The start's 7.9 s here: 3.0 s of it parsing modules (`ModuleParser.parse`) and 3.0 s reading vocabularies
  (`Vocabularies.reading`). That is the compilation context's ground (the cloud builder's slices 2–3), and a parsed
  cache warm on the page would take most of it.

The profile and its two small aggregators (agg.py, under.py) are in the lead's scratchpad; run them on a fresh
profile to compare.
