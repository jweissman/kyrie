import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Laboratory } from '../../scripts/laboratory';
import { PlayTool } from '../../src/cli/play-tool';
import { Runner } from '../../src/cli/runner';
import { Costs } from '../../src/costs';

// The laboratory (M21's consolidated priority 3): the first town's undertown alone on a host of a few lines, played
// on the production engine. Its file is the template's render, current; it starts in about a second, drawing no
// country; and it plays the same way every time.
describe('the laboratory', () => {
  it('is the undertown as its template and host write it now', () => {
    expect(readFileSync(Laboratory.file, 'utf8')).toBe(Laboratory.text());
  });
  it('starts drawing no country, and says the same first turn every time', async () => {
    const said = async () => {
      const mark = Costs.mark();
      const { journey } = await PlayTool.start(PlayTool.parse([Laboratory.file, '--as', 'human/thief/Haze']));
      const costs = Costs.since(mark);
      return { costs: [costs.region, costs.world], first: new Runner(journey.session).said() };
    };
    const a = await said(), b = await said();
    expect(a.costs).toEqual([undefined, undefined]);
    expect(a.first.offer.primary.map(o => o.id)).toEqual(b.first.offer.primary.map(o => o.id));
    expect(a.first.offer.primary.map(o => o.label)).toContain('Read the notice on the well-post');
  });
});
