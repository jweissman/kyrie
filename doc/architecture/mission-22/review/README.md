# The journey review

Phase A of the owner's [adventure-structure brief](../adventure-structure-brief.md) (§6, §10, §11; register row
ST-08): **observe without new language**. A played journey kept step by step as the player met it, so that a reviewer
can find a bad line, see what surrounded it, see which choice brought it about and find what produced it. There is no
Story, Incident or Beat here. Those belong to Phase B.

It plays no game of its own. The lines are sent to the runner (`bin/kyrie run`,
[src/cli/runner.ts](../../../../src/cli/runner.ts)), which plays them through the same PlaySession the page and the
terminal use. An observer around each line ([src/cli/journey-review.ts](../../../../src/cli/journey-review.ts)) reads:

- the runner's turns;
- the campaign's history and its worlds before and after;
- the narrator's leaf;
- `CampaignTick.witness`, an optional hook that is unset in play and sees each rule fire with what it changed.

It writes nothing back. [test/journey-review.test.ts](../../../../test/journey-review.test.ts) holds that the turns,
the offers and the transcript's digests come out the same whether the game is observed or not.

## A review

A review is a directory:

| file | what it is |
|---|---|
| `review.json` | **Recorded live**: `JourneyReviewV1` ([src/cli/review-types.ts](../../../../src/cli/review-types.ts)). It holds the revision, the run's arguments, the lines file and the revision it was first played at, and the session transcript. It then holds every scene shown, the opening first, each with its time, place, lines (in order, each with its part and its makers), offer (in order: next, the four, led among them, the rest), aims, purse, company and digest. Each step records the line sent, the scene before it and what the line was in that scene (label and where it stood), the events, the scene after, whether it was consequential, the semantic delta, and each change by what made it. Each choice's makers are kept once, by its id. It is never written over (`--force` records anew). |
| `journey.md` | The chronological reading, to read aloud. It is grouped by place. For each step it shows what was told (each line quoted as shown), what was learned, who moved, what came and went, the aims and the time, and what the world's rules and people did. |
| `findings.md` | How much is known by its making, the lines whose maker is unknown, and the world's changes grouped by what made them. |
| `replay.json`, `replay.md` | **Replay**: the review's lines played again under the code as it is now, in a game of its own. The review's own transcript is first held to its digests by `PlaySession.replay`, which refuses a step that comes out otherwise. Each step then gets three verdicts of its own: state (digest), offer (the act still offered under its words) and presentation (the lines shown). Both revisions are named. The live recording is untouched. |

```sh
# Record (the lines are bin/kyrie run's JSON lines; --played-at names the revision they were first played at)
bin/kyrie review record <dir> <lines.txt> --played-at <commit> --world iscoed --as human/warrior/Wenna
# One step whole: the scene before, the full offer (the chosen marked), the line, the events, the scene after,
# the delta, and each line's and choice's makers
bin/kyrie review step <dir> 13
# After a code or prose change: the same lines again, apart, compared
bin/kyrie review replay <dir>
bin/kyrie review step <dir> 13 --replay
# The pages again from what is kept (no game played)
bin/kyrie review render <dir>
# Played and shown at once, nothing kept
bin/kyrie review <lines.txt> --world iscoed --as human/warrior/Wenna [--step n]
```

## Where a line was made

Provenance is attached at the review's edge from what the engine itself recorded about each step
([src/cli/review-provenance.ts](../../../../src/cli/review-provenance.ts)). Nothing is searched for in the sources,
and equal words are never matched there (the brief §6.4 and §15.14). These records carry their makers:

- each perception of the step's events carries the declaration that made it (an `Observe`, a `Rule`'s say, a
  Discovery learned);
- each voiced line carries its table and entry;
- the act's result carries its action (a `Topic`, an `Action`, or one of the rules' own acts by its schema), when the
  action has words of its own;
- the scene's observations carry their ids;
- the narrator's glance carries its sight and sign of life.

A line is made of these in one way only. It is either exactly one of them, or several in order, as the narrator turns
them: second person, the hour in words, a sentence's capital, or cut to its first sentences by the scene's budget.
Three outcomes follow:

- **exact**: one declaration or table entry wrote it.
- **producer**: only what made it is known. That is the engine (the place's heading, a blow of a fight, the glance's
  "You see…"), or the person or thing a line is of.
- **unknown**: either no producer of the step made it whole, or two could each have made it. The reason is given.
  Unknown is never guessed.

Some records relay another's words: an answer voiced, a rule's words kept as told, what someone is seen as, the
glance's relaying of what changed and who is here, and a Discovery learned. These give way to the maker of the words
where that maker is there too, so a Topic's answer is the Topic's and not the voice table's record of it.

A choice's maker is the declaration whose command it is. Talking to someone, following an aim, a journey by road,
beginning again and the company's turn in a fight are the engine's.

What a step changed is the world after it set against the world before it, in `CampaignEvent.changes`' own words
([src/cli/review-delta.ts](../../../../src/cli/review-delta.ts)). Each change is put down to the last thing in the
step that wrote it:

- the act's own effects (its operator's success or failure changes);
- a rule, as the witness saw it fire;
- someone else's act (the event's npc decisions);
- a perception that teaches a fact;
- the clock.

Anything else is unknown.

A step is **consequential** (the brief §5.3) when it passes time, changes the world, teaches something or changes an
aim. Moving is a change of the world. An aim followed, a look, a lens and a talk turned to do none of these, so they
are not counted.
