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
| `review.json` | **Recorded live**: `JourneyReviewV1` ([src/cli/review-types.ts](../../../../src/cli/review-types.ts)). It holds the revision, the run's arguments, the lines file and the revision it was first played at, and the session transcript. It then holds every scene shown, the opening first, each with its time, place, lines (in order, each with its part and its makers), offer (in order: next, the four, led among them, the rest; each of the four the glance led with keeps its reason, `why` and `note`), the rows withdrawn since the scene before (`withdrawn`: the world's choices offered there, at the same place, that the world no longer allows and the step did not take), aims, purse, company and digest. `--roll pass` or `--roll fail` among the run's arguments has every check come out so, in the recording and its replay. Each step records the line sent, the scene before it and what the line was in that scene (label and where it stood), the events, the scene after, whether it was consequential, the semantic delta, and each change by what made it. Each choice's makers are kept once, by its id. It is never written over (`--force` records anew). |
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

## The reference route: the drove opening (Phase A's report, 18 November)

`drove-opening/` holds the reference route the brief's §9 and §11 ask for. It is cold play 6's own lines
([../cold/cold-6-lines.txt](../cold/cold-6-lines.txt), all 43 of them, first played at c7fa2382):
`--world iscoed --as human/warrior/Wenna`. The route runs from the landing through Owain's count, the Black Rhyne,
Bran let out and the reeve, then the shrine, the catacombs and the black candle, to the keeper of the vault, where Wenna
dies. It was recorded live at f4daf813, a clean tree. The review names that revision and keeps the session transcript.

```sh
bin/kyrie review record doc/architecture/mission-22/review/drove-opening doc/architecture/mission-22/cold/cold-6-lines.txt \
  --played-at c7fa2382 --world iscoed --as human/warrior/Wenna
```

Two of the cold play's lines are no longer offered at this revision. They are kept as refused steps with nothing
changed:

- step 11: `drove__clerk#talk`, the page's talk row, which the runner does not take;
- step 34: reading the black candle's book, once it is in hand.

A replay at the same revision (`bin/kyrie review replay`, not kept) came out the same in all 43 steps on state, offer
and presentation.

### Provenance on the route

| shown | exact | producer only | unknown |
|---|---|---|---|
| narration lines (94) | 67 (71%) | 23 (24%) | 4 (4%) |
| narration words (2,022) | 1,838 (91%) | 148 (7%) | 36 (2%) |
| all lines, headings and reference included (121) | 70 (58%) | 47 (39%) | 4 (3%) |
| choices offered (1,857, over 42 scenes) | 1,339 (72%) | 518 (28%) | 0 |

**Producer only:**

- 17 blows of the keeper's fight (the narrator's fight lines);
- 4 of the glance's "You see…" contents lines;
- 2 signs of life the glance made with no declaration of their own;
- among all lines, the place headings and the aim and need lines.

The choices known only by producer are the engine's own: talking, following, journeys by road and beginning again.

**Unknown (4 lines, 36 words):** each is an event line the engine wrote after it had dropped the declaration's id.
ActionFeedback's `immediate` and `events` are plain strings:

- step 13, the experience line ("Wenna gains 150 experience: saw Bran ap Ifor let out of the customs-house.");
- step 23, a key given by a Topic ("You take the crypt key.");
- step 31, a warning's wait ("The man with the black candle will give you a few minutes, no more.");
- step 38, a light lapsing ("Wenna's torch gutters out.").

**The world's changes (577 over the route):**

| made by | changes |
|---|---|
| a rule, as it fired | 115 |
| the act's own effects | 69 |
| a perception that teaches | 14 |
| the clock | 107 |
| unknown | 272 |

The unknown are the engine's own writes outside any rule or act:

- 138 `canTrain` on Wenna's level-up;
- the item and capability bookkeeping (`relieves`, `treatable`, `brings`, `capable`);
- the journey's own movement (`at`, `been`, `tookWay`);
- `witnessed`, from the perceptions settled.

The world's own doings are attributed without the player. In the first step alone the rules move Owain to the pens
(`drove__owain_to_pens`), flood the tower's well (`tower__well_floods`), break the Bound Howe's seals and raise the
rations' price at two inns. Each is shown with its rule and its changes.

Size and cost: `review.json` is 394 KB, one scene or step to a line. The offers are about half of it (some 44 choices a
scene); each choice's makers are kept once by id (184 of them). The steps' deltas are about a fifth, most of it the
level-up's `canTrain`. A recording takes 17.2 s, about 8 s of which is drawing the world. The whole process peaks at
772 MB resident, which is the world, not the review.

### The exit: a bad line found, its surroundings, its choice, its maker

Step 7 tells "You search the Black Rhyne, behind the pens with care, a little at a time." The place's name runs into
the clause without a comma. `bin/kyrie review step drove-opening 7` shows:

- the scene before it: the Rhyne's own observation `drove__rhyne_scene`, the aim "Search the Black Rhyne behind the
  pens for the four that went in";
- the whole offer, with "Search here" (`search(drove__rhyne)`, primary) marked as chosen;
- the event;
- the line itself, made by `Action search (module rules, by result)`: the rules' search Result,
  `data/rules/discovery.kyr`, "You search {site} with care, a little at a time.", filled with a place name that has a
  comma of its own;
- the next line, `Observe drove__found_drowned__found`;
- the knowledge gained (`drove__found_drowned`), the aim retired and taken, and two watches passed.

### The brief's §14 questions, as this route answers them

1. **Which Screen fields are needed.** The runner's turn is enough to read a step as the player met it: the terminal's
   projection of `ScreenModel` and the glance. A frame keeps:

   - the place's id and name, the elapsed watch and the clock;
   - the lines in order, each with its part (prologue, heading, prose, reference);
   - the offer, each choice with its id, label, group, whether it is led, its aspects and its aside, and of the four
     the glance led with, its `why` and `note`;
   - what was withdrawn since the scene before, untaken (`withdrawn`);
   - the aims, what is needed, the purse, who goes with the one who plays, any ending, and the digest.

   `Screen` itself is read only for provenance: `observed`, and `says` of the people and things. No UI object is
   serialized. The page's own composition (prologue page, painting, card order) is not in a frame. For that the
   journey reader's `read scene` opens the step's checkpoint in the real page.
2. **Whether `CampaignEvent.changes` is enough for the delta.** It is enough for what changed, but not for what made
   it. It carries the act, the rules and the perceptions together, unattributed. Attribution needed three things:

   - the act's own effects, from its operator's `success` or `failure`. `resolution.world` is the whole step, and only
     where the world is causal;
   - rules, from a new optional `CampaignTick.witness`, unset in play;
   - other people's acts, from the event's `npc`.

   Two more categories need a before and after comparison:

   - the net change of a step of several events (a journey's legs), which comes from the worlds before and after;
   - the aims and the time, which come from the frames, since following is campaign state outside the world.

   Hit points and experience are outside the world's facts. They show in the frames' "you" and "with" lines and in the
   digest, not yet in the delta.
3. **Where provenance can be attached once.** It already is attached, on the engine's own records:

   - `CampaignEvent.perceptions` (id), `voiced` (table, entry), and the operator of the act's result;
   - `Screen.observed`;
   - the glance's `sight` and `life`.

   The narrator's turns of these words are deterministic: second person, the hour in prose, the capital, and the
   budget's cut to the first sentences. So the join is exact at the review's edge, with no change to a presentation
   type. The one place ids are lost is `ActionFeedback`: its `immediate`, `events`, `lapsed` and the gift lines are
   strings. That is the narrow producer to instrument next, if the 2% matters.
4. **Whether action results can have stable declaration IDs.** They have them already, without any change to action
   identity or saves. The result's maker is the operator's schema (a Topic's or Action's id, or the rules' own act such
   as `search`), read through `campaign.operator(event.action)`. One caveat remains: where the engine puts its own
   words in place of an action's result (a shelter made unsafe, a company that can no longer act, a hazard's downing,
   an interruption), the event does not say so. A result would then be put down to an action that has words of its
   own. None occurs on this route.
5. **The smallest artifact that keeps the order.** At this revision that is 394 KB for 43 steps: one line per frame or
   step, offers in order and makers kept once. A first hour of about 150 steps would come to about 1.4 MB. If that is
   too much, the next cut is each offer kept as its change from the scene before. It is not needed yet.
6. **Which producers remain unknown, and their share.** These are the four event lines above: an experience gained,
   an item given, a warning's wait and a light lapsing. They are 4 of 94 narration lines and 36 of 2,022 narration
   words (2%). Of the world's changes, 272 of 577 (47%) are the engine's own writes outside rules and acts (the level-up,
   item and capability bookkeeping, the journey's own movement, perceptions settled), each grouped in `findings.md` by
   what it writes.

### Not done, for Phase B and after

- No Story, Incident or Beat: that is Phase B.
- The opening budget (§5.3) is counted (`consequential`, `consequence`). It is not yet measured against a declared
  Beat.
- Hit points and experience are not in the delta.
- The engine's own world writes, and the four ActionFeedback lines, are not attributed.
- The browser scene view is the journey reader's, by checkpoint. It is not this artifact's.
