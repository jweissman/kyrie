import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import type { CreatureStore } from '../src/creature-store';
import { GeneratedWorld } from './support/generated';

// A companion who falls is dead, and rest does not mend death. Their gear can be taken from them; and a town's priest
// can call them back (Orsino's Raise Dead) for a night's vigil and a great price, with half their health.
class Fallen {
  static async start() {
    const w = await WorldAssembler.assemble('a1', NodeBundleSource.shared, { scenarios: 0, towns: 0, framework: null });
    const s = await PlaySession.start(w.path, 'a1', w.source);
    const store = (s.campaign as unknown as { creatures: CreatureStore }).creatures;
    const lease = store.acquire(s.campaign.state.partyIds);
    try {
      lease.creatures[0]!.state.hp = 0;
      lease.creatures[1]!.state.gold = 400;
      lease.commit(lease.creatures);
    } finally { lease.release(); }
    return { w, s };
  }
  static choice(s: PlaySession, pattern: RegExp) {
    return PlayerView.choices(s.campaign).find(x => pattern.test(x.choice.name));
  }
}

describe('a fallen companion', () => {
  it('can be relieved of what they carried, and raised by a town\'s priest for 300 coin', async () => {
    const { w, s } = await Fallen.start(), town = w.report.region.settlements.find(t => t.size === 'town')!;
    const elen = () => s.campaign.state.party.find(m => m.name === 'Elen')!;
    GeneratedWorld.put(s, `${town.id}_shrine`);
    await s.perform('wait');
    // She cannot hand anything over; the others take it from her.
    const given = PlayerView.choices(s.campaign).map(x => x.choice.id);
    expect(given.some(id => id.startsWith('transfer_item(region__party_1__'))).toBe(false);
    expect(given.some(id => id.startsWith('transfer_item(region__party_2__'))).toBe(true);
    const take = Fallen.choice(s, /^Take a coil of rope from Elen for Bran$/);
    expect(take).toBeDefined();
    expect((await s.perform(take!.choice.id) as { response?: string }).response).toContain('Bran takes a coil of rope from Elen');
    const gold = s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold'));
    const raise = Fallen.choice(s, /^Ask .* to raise Elen from the dead/)!;
    expect(raise).toBeDefined();
    await s.perform(raise.choice.id);
    expect(elen().hp).toBe(Math.floor(elen().maxHp / 2));
    expect(s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold'))).toBe(gold - 300);
    expect(Fallen.choice(s, /^Ask .* to raise Elen/)).toBeUndefined();
  }, 60000);
  it('can be laid to rest, and leaves the company', async () => {
    const { w, s } = await Fallen.start(), town = w.report.region.settlements[0]!;
    GeneratedWorld.put(s, `${town.id}_green`);
    await s.perform('wait');
    const rest = Fallen.choice(s, /^Lay Elen to rest$/)!;
    expect(rest).toBeDefined();
    await s.perform(rest.choice.id);
    expect(s.campaign.state.party.map(m => m.name)).toEqual(['Bran', 'Dori']);
    expect(Fallen.choice(s, /Elen/)).toBeUndefined();
    // Kept and opened again, the company is still the two of them.
    const back = PlaySession.resume(JSON.parse(JSON.stringify(s.checkpoint())));
    expect(back.campaign.state.party.map(m => m.name)).toEqual(['Bran', 'Dori']);
  }, 60000);
  it('is not raised by a village priest', async () => {
    const { w, s } = await Fallen.start(), village = w.report.region.settlements.find(t => t.size !== 'town')!;
    GeneratedWorld.put(s, `${village.id}_shrine`);
    await s.perform('wait');
    expect(Fallen.choice(s, /to raise Elen/)).toBeUndefined();
  }, 60000);
});
