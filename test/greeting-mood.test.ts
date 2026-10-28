import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';

// Someone is greeted as they are now, where what they are doing says it: Odile, pacing the terrace and frightened for
// her spiders, said "Now then! A new face." as the jovial do (play 9: M17-88).
describe('a greeting', () => {
  const ridge = ['go(march__shop_door,march__shop_floor)', 'go(march__shop_door,march__quay)',
    'go(march__causeway_path,march__causeway)', 'go(march__ridge_track,march__ridge)'];
  it('is taken as they are, fretting, whatever their manner', async () => {
    const s = await PlaySession.start('test/fixtures/march/silkholme.campaign.json', 'silk', NodeBundleSource.shared);
    for (const c of [...ridge, 'go(sink__sink_path,sink__lip)', 'go(sink__terrace_steps,sink__frames)']) {
      await s.perform(c);
    }
    const e = await s.perform('talk_to(brood__odile)');
    const greeting = (e.voiced ?? []).find(v => v.kind === 'address' && v.actor === 'brood__odile');
    expect(greeting?.id).toMatch(/^address\.troubled\.first\./);
  }, 60000);
});
