import { describe, expect, it } from 'bun:test';
import { Laboratory } from '../../scripts/laboratory';
import { PlayTool } from '../../src/cli/play-tool';
import { FirstQuestions } from '../support/first-questions';

// The player knows too much (OR-423), at the cheapest horizon that proves it: the laboratory's town, written by the
// generators every town is (data/generation/town/undertown.kyrt and TownMatters), its innkeeper, merchant and priest
// spoken with before anything is learnt. Each offers a few broad questions (what the matter is, news, a room), none
// about the town's particular troubles; asked what the matter is, or the notice on the green read, those open, in the
// engine, for every client. test/first-questions holds the same across seeds' whole worlds (the world canary's).
const most = 4;
const town = ['lab__low_taproom', 'lab__low_shop', 'lab__low_chapel'];
const start = async () => (await PlayTool.start(PlayTool.parse([Laboratory.file, '--as', 'human/warrior/Brann'])))
  .journey;
const asked = (j: Awaited<ReturnType<typeof start>>, place: string) =>
  FirstQuestions.at(j.session, place).flatMap(a => a.questions);

describe('the first questions in a town', () => {
  it('are few and broad before anything is learnt, and the town\'s troubles open on being told them', async () => {
    const j = await start();
    for (const place of town) {
      const said = FirstQuestions.at(j.session, place);
      expect(said.filter(a => a.questions.length > most)).toEqual([]);
      expect(said.flatMap(a => a.questions).join(' | ')).not.toMatch(/old quarry|old drain|rats|noises/);
    }
    j.put('party', 'lab__low_taproom');
    await j.play('Ask Eamon what the matter is');
    expect(asked(j, 'lab__low_taproom').join(' | ')).toMatch(/old drain/);
    // The notice read says whom to ask: the merchant's rats are asked of him then, unasked what the matter is.
    expect(asked(j, 'lab__low_shop').join(' | ')).not.toMatch(/rats/);
    j.put('party', 'lab__low_green');
    await j.play('Read the notice');
    expect(asked(j, 'lab__low_shop').join(' | ')).toMatch(/rats in the corn-store/);
  }, 20000);
});
