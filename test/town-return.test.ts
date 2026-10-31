import { describe, expect, it } from 'bun:test';
import { ModuleWriter } from '../src/lang/module-writer';
import { Glanced } from './support/glanced';
import type { Change } from '../src/lang/module';
import type { CreatureStore } from '../src/creature-store';
import type { PlaySession } from '../src/session/play-session';

// Back in town with what was won, the page leads with what it can be put to: someone here who buys a treasure the
// company carries, someone who teaches what it has earned and can pay for (a company back from a site was shown
// nothing to do with its winnings: the owner, 31 October, OWN-56).
class Back {
  static async at(room: string, won: { rings?: boolean; gold?: number; experience?: number }) {
    const g = await Glanced.country('kite'), c = g.campaign, s = (g as unknown as { s: PlaySession }).s;
    const member = c.module.entities.find(e => c.world.test(ModuleWriter.call('memberOf', e.id, 'party')))!.id;
    const store = (c as unknown as { creatures: CreatureStore }).creatures, lease = store.acquire(c.state.partyIds);
    try {
      lease.creatures[0]!.state.gold = won.gold ?? 0; lease.creatures[0]!.state.experience = won.experience ?? 0;
      lease.commit(lease.creatures);
    } finally { lease.release(); }
    await s.perform('wait');
    const k = c as unknown as { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    k.commit(k.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', room) },
      ...won.rings ? [{ kind: 'retract' as const, call: ModuleWriter.call('at', 'tower__rings', c.world.one('at', 'tower__rings')!) },
        { kind: 'assert' as const, call: ModuleWriter.call('ownedItem', 'tower__rings', member) }] : []]));
    return Glanced.of(s).glance.acts.map(a => `${a.why}: ${a.label}${a.note ? ` — ${a.note}` : ''}`);
  }
}

describe('back in town with what was won', () => {
  it('leads with whoever buys a treasure the company carries, and what it fetches', async () => {
    expect((await Back.at('region__s1_shop', { rings: true }))[0]).toBe('spoils: Talk to Falkor — sell a cord of grave rings, 15 coin');
  }, 120000);
  it('leads with a lesson the company has earned and can pay for, and not one it cannot', async () => {
    expect((await Back.at('region__s1_drill', { gold: 80, experience: 60 }))[0]).toBe('means: Talk to Saer — a lesson in Dirty Trick');
    expect((await Back.at('region__s1_drill', { gold: 5, experience: 60 })).some(a => a.startsWith('means'))).toBe(false);
  }, 180000);
});
