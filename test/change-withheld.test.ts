import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Journey } from '../src/session/journey';
import { InspectTool } from '../src/cli/inspect-tool';
import { Tiny } from './support/tiny';

// The Grand Tour's friction 7 (GTR-07): the escritoire's lock was offered to be picked with the footman standing over
// it. A thing's change written `when` something holds is made only while it does, and what its author says of it is
// told beside the thing while it does not (test/fixtures/probes/withheld).
describe('a change withheld until something holds', () => {
  it('is not offered, and says why, until it holds', async () => {
    const t = await Tiny.start(readFileSync('test/fixtures/probes/withheld/site.kyr', 'utf8'),
      { horizon: ['probing'], seed: 'w', party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] });
    const j = Journey.of(t.session);
    const seen = () => j.screen().observed.map(o => o.text).join(' ');
    expect(j.offers("Pick the escritoire's lock")).toBe(false);
    expect(j.offers('Ease the bureau open')).toBe(true);
    expect(seen()).toMatch(/Pargeter stands over the escritoire/);
    expect(InspectTool.report(j.campaign, 'Pick the escritoire').join('\n'))
      .toMatch(new RegExp(String.raw`fails: not \(withheld\(withheld__escritoire_pick\)\), `
        + String.raw`which holds until not \(at\(withheld__footman, withheld__drawing\)\)`));
    await j.play('Send Pargeter for tea');
    expect(seen()).not.toMatch(/Pargeter stands over/);
    expect(j.offers('Ease the bureau open')).toBe(false);
    await j.play("Pick the escritoire's lock");
    expect(j.holds('state', 'escritoire', 'open')).toBe(true);
  }, 30000);
});
