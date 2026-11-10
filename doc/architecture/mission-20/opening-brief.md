# Mission 20: opening brief

A starting sequence, not a mission specification. The owner will set M20's acceptance criteria in its own commission.

## Objective

**One enjoyable, comprehensible, reliably playable first hour on a fixed reference build**, then the five-person cold
acceptance (PD-14) on that build.

- **The reference.** The generated world kahitude; an ordinary character (a lone warrior, and one other calling);
  the debt and the first town's jobs.
- **The first hour.** Arrive, find something worth doing, go there, enter, face danger, get something, come back, see
  what changed, save and reload.

**During this period:**
- No new adventures, and no integration of further authored content.
- Environment artwork and long-range design may continue off the main path.
- Nothing enters main that does not serve the first hour.

## Sequence

1. **Fix the known first-hour blockers** (register rows in [mission 19's register](../mission-19/register.md)):
   - **Lethal danger without warning (M19-233).** The inn no longer tells of deep halls, but at the hobs' toll-house
     the page leads with taking the hobs' own plunder, which brings their raiders on a lone company. A lead must not
     walk a newcomer into what kills them unwarned.
   - **Light.** It runs out within the hour (M19-170), and a trap was led to in the dark.
   - **Conversation's dead ends.** Talk with nothing but leave is withdrawn (M19-227, partial), but the people of the
     first hour still offer topics, not an exchange.
   - **Jobs found without an aim (M19-234).** With nothing followed, the page never points to the notice of the town's
     jobs. A fix (the notice as an aim held) was reverted at M19's closure: in campaigns with no origin it displaced the
     aim taken up. The cure must not let a heard-of aim become the followed one.
2. **Complete one ordinary public-action journey through an actual adventure**, from Begin to the debt paid or a job's
   pay, its consequences seen, and a save and reload, by the page's leads, rendered. Fix on the way what that journey
   meets:
   - Notes and Story as separate records (M19-228).
   - Narration bound to where the company is (M19-229; an attempt with the fever's house was reverted at closure;
     M19-126's lint).
   - The fight's remaining engine words (M19-121).
3. **Authored-world travel and the knowledge boundary, where ordinary play meets them.**
   - Decide country by country which authored walks are journeys (the hex rule now holds only over generated land).
   - Test that an aim's target is not shown in the journal or local choices before it is learned.
4. **Improve the fast loop by measurement, not construction.**
   - Shard balance first (six shards run 22 to 41 minutes).
   - Then whatever the player contracts and the honest-start journey show is slow or blind.
5. **Freeze a candidate. Run PD-14 with five cold players.** Their notes, not the builder's, decide what is done.

## Backlog, not the gate

These are prioritized architecture work, to be taken up only if the first-hour gate needs them:
- content-addressed reusable fixtures;
- changed-test selection from recorded dependencies;
- checkpoints for long authored specs;
- a seven-stage world census;
- per-adventure integration manifests;
- the setting's coupling into the engine (Imbar's planes, calendar, world shape);
- a scheduled corpus gate and trend benchmarks;
- the ~200 legacy objectives without `toward`, migrated as each is touched.

## Definition of done for any first-hour change

- **A test that plays as a player does.** A failing honest-start step (public leads, no ids, no teleport) that passes
  after the change.
- **Evidence through the page.** Rendered, as the reference-hour tour's pictures or a person's play.
- **"Accepted" only when a person accepted it.** A green suite proves the commands work, not that the page is
  understood.
