import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import type { CreatureStore } from '../../src/creature-store';

// A band is as many of it as still stand: three cave spiders are here, and down to the last of them it is one, "the
// last of the cave spiders is here", where review A had "a cave spiders… is here" (T24-17).
const den = `
  Place den "the den" is room at 0, 0.
  Company party "You" of 1 at den.
  Person spiders "cave spiders" at den { Role "spiders in the dark". Species spider. Numbers 3. }
  Goal false.`;
const slay = (t: Tiny, id: string) => {
  const lease = (t.campaign as unknown as { creatures: CreatureStore }).creatures.acquire([id]);
  try { lease.creatures[0]!.state.hp = 0; lease.commit(lease.creatures); } finally { lease.release(); }
};

describe('a band down to its last', () => {
  it('is told as many while many stand, and as one, the last of them, when one does', async () => {
    const t = await Tiny.start(den);
    expect(t.screen.people.find(p => p.id === 't__spiders')?.many).toBe(true);
    expect(t.leaf.presence).toContain('Cave spiders are here.');
    t.campaign.readout.inhabitants['t__spiders']!.slice(0, 2).forEach(id => slay(t, id));
    t.look();
    const band = t.screen.people.find(p => p.id === 't__spiders')!;
    expect([band.name, band.many]).toEqual(['the last of the cave spiders', undefined]);
    expect(t.leaf.presence).toContain('The last of the cave spiders is here.');
  });
});
