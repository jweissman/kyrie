import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';

// Come over the hills to no trouble in particular (thorn's Misthythe), the first aim is the inn, where work is heard
// of; and at the inn the work is told. The aim had been seen through on the threshold with nothing said of any work,
// only that a recruit there was looking for some (round 9's diagnosis of the owner's OR-60): now the keeper sends the
// company to the notice on the well-post, and each job on it is an aim.
describe('the wanderer come to the inn', () => {
  it('is told where the work is, and holds the notice\'s jobs as aims', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'thorn', '--origin', 'wanderer',
      '--as', 'human/warrior/Wenna']));
    const r = new Runner(journey.session);
    let s = r.said() as Said;
    expect(s.aims?.map(a => a.text))
      .toEqual([expect.stringMatching(/^Go to the taproom of the Laughing Flame and ask/)]);
    for (const label of [/^To the landing at/, /^Into the Laughing Flame/]) {
      const o = [...s.offer.primary, ...s.offer.rest].find(x => label.test(x.label))!;
      s = await r.ask(JSON.stringify({ act: o.id })) as Said;
    }
    expect(s.scene.lines.some(l => /‘Work\?’ says .*The notice on the well-post has jobs on it/.test(l))).toBe(true);
    expect(s.aims?.map(a => a.id)).toEqual(expect.arrayContaining(['region__s1_u_rats_job_sought',
      'region__s1_u_dead_job_sought', 'region__s1_u_spiders_job_sought']));
  }, 120000);
});
