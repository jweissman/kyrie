import { describe, expect, it } from 'bun:test';
import { GlanceStage } from '../web/reader/stage/glance';
import type { Promoted } from '../src/presentation/glance-types';

// In the dark, the light the company carries is on the page, first, however many dangers press (round 5: the bats and
// a warded vessel's count took both places, and "No light" stood over two attacks with a candle in the pack).
describe('what presses, in the dark', () => {
  const act = (choice: string, why: string) => ({ choice, why, tier: 0 }) as unknown as Promoted;
  it('leads with the light, beside two dangers', () => {
    const acts = [act('attack:bats', 'danger'), act('attack:vessel', 'warned'), act('light:candle', 'dark')];
    expect(GlanceStage.pressing(acts).map(a => a.choice)).toEqual(['light:candle', 'attack:bats', 'attack:vessel']);
  });
  it('is two at most where nothing is to be lit', () => {
    const acts = [act('attack:bats', 'danger'), act('attack:vessel', 'warned'), act('answer:x', 'answer')];
    expect(GlanceStage.pressing(acts)).toHaveLength(2);
  });
});
