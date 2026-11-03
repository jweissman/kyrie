import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { ModuleParser } from '../src/lang/module-parser';
import { ModuleWriter } from '../src/lang/module-writer';
import { readFileSync } from 'node:fs';

// Wapshott's Circus's 4 (WPC-04): those not yet in the story were parked in a real room and met there (Madame Sallow
// in a hedge on the road). Quittance's 29 (QTC-29): the Phoenix's wardens, declared at their house, warned every
// company that came in from the first minute. Someone declared nowhere is nowhere until they come.
describe('someone nowhere until they come', () => {
  const probe = 'test/fixtures/probes/offstage/probe.campaign.json';
  it('is not met where they will come, before they come', async () => {
    const j = await Journey.start(probe);
    expect(j.at('p__wardens')).toBeUndefined();
    await j.play('^To Phoenix House$');
    expect(j.latest).not.toMatch(/wardens|brass helmets/i);
    expect(j.choices().map(c => c.label).filter(l => /wardens|Sallow|one who left/i.test(l))).toEqual([]);
  }, 60000);
  it('comes, said in their own words, and warns after', async () => {
    const j = await Journey.start(probe);
    await j.play('^To Phoenix House$', 'Wait › An hour');
    expect(j.latest).toMatch(/Three wardens in brass helmets come in from the yard/);
    expect(j.at('p__wardens')).toBe('p__house');
    await j.play('Wait › An hour');
    expect(j.latest).toMatch(/stand their ground/);
    expect(j.at('p__ghost')).toBeUndefined();
  }, 60000);
  it('is written nowhere again', () => {
    const module = ModuleParser.parse(readFileSync('test/fixtures/probes/offstage/site.kyr', 'utf8'));
    expect(ModuleWriter.write(module)).toMatch(/Person ghost "the one who left" nowhere \{/);
  });
});
