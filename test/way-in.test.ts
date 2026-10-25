import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { GeneratedWorld } from './support/generated';

// A scenario's way in stays hidden until someone hears of the trouble, or until the company looks about where it
// starts. Found by the follow-up independent review: a company that came on cov7's pit by itself searched it and
// found no way down, because only the rumours opened the sink path.
describe('a hidden way in', () => {
  it('is found by searching where it starts, without hearing of the trouble', async () => {
    const w = await WorldAssembler.assemble('cov7', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const brood = w.report.placements.find(p => p.scenario === 'brood-hollow')!;
    const s = await PlaySession.start(w.path, 'cov7', w.source);
    GeneratedWorld.put(s, brood.bindings.approach!);
    const names = () => PlayerView.choices(s.campaign).map(c => c.choice.name);
    expect(names().some(n => n.startsWith('Take the sink path'))).toBe(false);
    const search = PlayerView.choices(s.campaign).find(c => c.choice.name.startsWith('Search'))!;
    const e = await s.perform(search.choice.id);
    expect((e.perceptions ?? []).map(p => p.text).join(' ')).toContain('trodden into a path going down');
    expect(names().some(n => n.startsWith('Take the sink path'))).toBe(true);
  }, 120000);
});
