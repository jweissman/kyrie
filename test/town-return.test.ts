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
  // Told where something is, the company is led toward it: an aim names a work's rooms, not the place it is set out
  // for by, and nothing had led toward Lunalac once the factor named its reading-glass (OWN-56).
  it('leads toward a work once an aim names what is in it', async () => {
    const { WorldAssembler } = await import('../src/world/world-assembler');
    const { NodeBundleSource } = await import('../src/campaign/node-bundle-source');
    const { PlaySession: Session } = await import('../src/session/play-session');
    const { PlayerView } = await import('../src/presentation/player-view');
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared,
      { party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await Session.start(w.path, 'kite', w.source);
    await s.perform(PlayerView.choices(s.campaign).find(x => /^Ask .*old cisterns/.test(x.choice.name))!.choice.id);
    expect(Glanced.of(s).glance.acts[0]).toMatchObject({ label: 'Set out for Lunalac', why: 'named' });
  }, 120000);
});
