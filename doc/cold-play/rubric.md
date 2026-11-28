# Cold-play rubric: first-hour experience

**Accepted · id `first-hour` · version `1`** (the owner's delegation, 27 November; regimen.md). It is calibrated by its
first three rounds; a change is a new version, applied only to later rounds.
Earlier cold plays reported an overall score, but did not use a recorded criterion rubric.

An independent agent plays the rendered page without a route or source knowledge. Record its kind, revision, date,
viewport, choices and evidence. A session, even one involving several agents, is one round. Record the session only
after it is complete; do not score an interrupted session.

Score each criterion from 0 to 4: 0 means absent or blocked, 1 poor, 2 mixed, 3 good, and 4 excellent. Cite the
transcript or contact sheet for each judgment. Score what was actually encountered, not an imagined full hour.

| Criterion | Question |
|---|---|
| beginning | Could the player understand and begin acting? |
| agency | Were choices intelligible and consequential? |
| trust | Did the game behave as its offers and feedback promised? |
| discovery | Did attention uncover interesting things worth pursuing? |
| continuation | Would the player willingly make another expedition? |

Add the five scores and multiply by five for the 0–100 total. Do not equate an agent's judgment with human
acceptance. The careful reader, impatient presser, wanderer and aim-follower are examples of agent kinds.

## Round record

Save each completed round as `doc/cold-play/rounds/YYYY-MM-DD-kind.json`. Its JSON object has `date` (UTC date),
`sha` (full commit hash played), `kind`, a unique `session` identifier, `rubric` (`id` and `version`), `criteria`
(an object whose values contain numeric `score` and `max`), `total` (the sum of scores divided by the sum of maxima,
times 100), and `evidence` (nonempty repository-relative transcript or contact-sheet paths). Different kinds in the
same session must not be recorded as separate rounds. The evidence files must be checked in with the record.
The reader validates this rubric's five integer scores and rejects unknown rubric versions until their rules are
implemented.
