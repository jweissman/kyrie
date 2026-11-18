# A record of what has been told (lever 2)

The second of the six shared mechanisms (the owner, 18 November, approved). Rows: DN-01, DN-02, DN-04, OR-69, OR-71,
TB-04, TB-08, BO-08, BO-09, BO-10, CL-37 (barks), CL-39, CL-42, CL-47, HP-04, HP-05.

## What exists

The record half-exists already: each event in the campaign's history keeps the voice lines it said
(`CampaignEvent.voiced`, set by `Campaign.told`), and the save keeps the history. `Telling.tell` reads it
(`Editor.recency`) so a greeting, a parting or a thanks is not said again too soon, and `VoiceContext` reads who has
been met from it. Everything else narration says has no memory:

- a companion's barks (`Barks`) remember one fight only ("Pathetic." in three fights: CL-37);
- the morning ("The sky greys, then lightens", BO-08), a rule's line every morning (BO-09), an answer given again
  word for word (BO-10), a place's history sentence twice in one look (CL-47, CL-39);
- nothing checks a sentence against what is so before it is said (a cup "in a ring of dust" and "lifted", CL-39).

## The design

1. **One record, the one that exists.** `voiced` becomes what every teller writes: each sentence's line id (or its
   text's hash where it has no id), its kind (voice, bark, rule, morning, answer, history), who it is of, and the turn.
   It stays in the history, so it is in every save, deterministic, and replayed with the transcript.
2. **Every teller reads it before saying.** Barks, the day's turns, rule lines and answers each take the recency
   `Editor` already gives the voice tables: a line said within its kind's interval is not said again, another of its
   kind is chosen or nothing.
3. **What a sentence claims.** Authored lines that state a fact about the world (a thing present, a state) carry what
   they claim (Kyr `Observe … when …` already guards most); the telling drops a sentence whose guard no longer holds,
   rather than the page composing around it.

## Order of work

1. Barks through `voiced` (the smallest proof: CL-37 closed, a pin across two fights and a save).
2. Mornings and rule lines (BO-08, BO-09).
3. Answers given again (BO-10) and the look's repeats (CL-47, CL-39).
4. Claims checked (CL-39's contradictions), with the prose census as the measure.
