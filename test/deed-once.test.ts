import { describe, expect, it } from 'bun:test';
import { PlayerView } from '../src/presentation/player-view';
import { Glanced } from './support/glanced';

// What the company did for the wagoner is told once, as it is done: it had been told wherever he was, five times by
// the evening and again after a reload (round 7).
describe('the wagoner\'s wheel', () => {
  it('is told as done once, not each time the company is by him', async () => {
    const g = await Glanced.country('a1');
    const heave = PlayerView.choices(g.campaign).find(c => /heave/.test(c.choice.id))!;
    await g.perform(heave.choice.id);
    const deed = /meal is on the road again because of you/;
    const page = () => [...g.leaf.situation, ...g.leaf.presence, ...g.leaf.changed,
      ...(g.leaf.exchange?.lines ?? []).map(l => l.text), ...(g.leaf.exchange?.notes ?? [])].join(' ');
    expect(page()).toMatch(deed);
    const wait = PlayerView.choices(g.campaign).find(c => /^wait(\(|$)/.test(c.choice.id))!;
    await g.perform(wait.choice.id);
    expect(page()).not.toMatch(deed);
  }, 120000);
});
