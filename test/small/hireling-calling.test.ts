import { describe, expect, it } from 'bun:test';
import { Atlas } from '../support/atlas';
import { Runner, type Said } from '../../src/cli/runner';
import { RunnerOffer } from '../../src/cli/runner-offer';

// A hireling's calling is said before they are asked and while they go with the company, in the terminal and the
// runner as on the page's talk (RecruitSaid): cold play 2 met its ranger's bow and animal companion first in a fight's
// menu (CL-08).
const said = (out: Awaited<ReturnType<Runner['ask']>>): Said => {
  if ('error' in out || 'end' in out && !('scene' in out)) { throw new Error(JSON.stringify(out)); }
  return out as Said;
};
const offered = (s: Said, pattern: RegExp) => [...s.offer.primary, ...s.offer.rest]
  .find(o => pattern.test(RunnerOffer.act(o)));
describe('a hireling\'s calling', () => {
  it('is said once they would join, and in the company after', async () => {
    const r = new Runner((await Atlas.start('companion', 'green')).session);
    let s = r.said();
    for (const step of [/^talk_to\(t__wenna/, /wenna_come/]) {
      const o = offered(s, step);
      if (o) { s = said(await r.ask(JSON.stringify({ act: o.id }))); }
    }
    const lines = s.scene.lines.join('\n');
    expect(lines).toMatch(/Wenna would join the company: a human \w+ of level \d+, asking (nothing|\d+ coin)/);
    s = said(await r.ask(JSON.stringify({ act: offered(s, /^recruit\(/)!.id })));
    expect(s.company).toEqual([expect.stringMatching(/^Wenna, human \w+, \d+ of \d+$/)]);
  });
});
