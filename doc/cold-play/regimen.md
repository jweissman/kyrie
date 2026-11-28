# Cold-play regimen, version 1

**Approved by the owner, 27 November**, with the amendments below. Rubric `first-hour` v1 (rubric.md) is accepted
under the same delegation.

**The purpose:** independent play as a continuous source of product truth, not another ceremony for demonstrating
test coverage.

## Two regimens, reported apart

| | Standard round | Longitudinal expedition |
|---|---|---|
| What it tests | The first experience, and whether the player wants to go on | Whether repeated play grows richer or more repetitive |
| One round is | One new life, about 80–120 moves | One persistent life through repeated town, wilderness and dungeon excursions, ideally five |
| How often | After each experience landing; otherwise every other day, so evidence never expires | Less often: after a change to the reference loop, or weekly |
| Scored by | Rubric `first-hour` (rubric.md) | Its own record (below), not the rubric |
| Reported in | The project health meter's cold-play component | Separately, for now: never averaged into the first-hour score |

## A standard round

- **Where:**
  - The rendered page: the deployed build, or one built at the revision under test, in one headless Chromium
    (`scripts/cold-play.sh --page`).
  - The terminal runner is a lead's tool, not a cold-play surface.
- **How it starts:** as a player meets it: Play, roll, the stock opening.
  - Ordinary creation choices vary from round to round where that is practical.
  - No seeds, routes or ids are given.
- **Blind by tools, not only by prompt:**
  - The agent sees the page's text and screens through its two helpers and nothing else: no source, register,
    earlier rounds or scores.
  - A familiar scripted route must never pass for independent cold play.
- **Length:** about 80–120 moves. The record gives the actual move count, and the elapsed fictional time separately.
  A move is never equated with a fixed span of game time.
- **Blocked early:** the round stops at the real stopping point and scores the experience it met. Moves are never
  manufactured, and a short round is never reported as the full regimen.

### Player kinds: dispositions, not scripts

The four kinds rotate, so three rounds are three independent readings. Each is a disposition the agent starts from,
and free to depart from:

- **Careful reader:** reads everything, and follows what the world suggests.
- **Impatient presser:** takes the first promising row, and skims.
- **Wanderer:** does not follow the gold, and looks for what is there to be found. A wanderer may become interested
  in an undertaking and take it up.
- **Aim-follower:** follows the gold, to see where the game is taking them. An aim-follower may turn aside for an
  unexpected discovery.

### Scoring

1. The agent scores rubric v1's five criteria from 0 to 4, each citing transcript lines.
2. **Continuation needs a concrete reason grounded in what happened:** what the player wants to return to, discover,
   overcome or accomplish, named from the play. A generic declaration of enthusiasm scores no higher than 1.
3. The lead audits the citations. A score must be backed by the evidence it cites. The lead adjusts a score only with
   a written reason, kept in the record, and never toward a target.
4. The round is recorded in `rounds/<date>-<kind>.json` (rubric.md's format) with:
   - the agent's configuration (model, tools, prompt revision);
   - the viewport;
   - the full sha played;
   - a unique session identity;
   - the move count and the fictional time elapsed.

   Its transcript and screens are checked in beside it.
5. **Freshness:** the health meter counts the last three rounds of different sessions within 21 days. A round older
   than that is expired, never reused.

### Calibration

The first three rounds calibrate rubric v1:

- every score and its evidence are kept;
- where agent scores and the owner's own experience disagree badly, the anchors or the protocol are wrong, and are
  revised.

A change to the rubric is explicit and versioned *prospectively* (v2, its own id). It is never applied silently to
earlier results, which keep the version they were scored under.

## A longitudinal expedition

One persistent life, saved and resumed between excursions, plays town to wilderness to dungeon and back, ideally five
times. Its record measures, from the transcript:

- **persistence:** what the world kept between excursions: things left, people changed, rooms refilled;
- **preparation:** what the player did in town before setting out, and why;
- **strategic change:** how the player's plan differed from one excursion to the next, and what caused it;
- **meaningful returns:** what came home and what it bought, learned or changed;
- **richer or more repetitive:** the excursion-by-excursion judgement, with its evidence;
- the move count and fictional time of each excursion.

It is reported on its own until its measures settle, the reference game's question answered with evidence: would a
player willingly make a fifth expedition?

## What a round produces besides a score

Every finding is checked against main, deduplicated into the register, tagged by its criterion, and made durable by
the mechanism that fits it:

| Finding | Made durable as |
|---|---|
| A mechanical defect (a row that lies, a softlock, a wrong number) | An inexpensive regression test, at the lowest rung that catches it |
| A behavioural gap (a missing offer, an unreachable act) | A feature pin or a census |
| A literary or dramatic failure (prose, pacing, an empty scene) | An editorial fixture, or independent comparative play |

No meaningless automated test is invented for a subjective quality.

## What is never claimed

- **Agent rounds** are never reported as human acceptance.
- **The owner's plays** are human evidence, recorded apart and never averaged into the score.
- **Lead plays** (the lead driving the runner by hand) find defects, but are never scored.
