import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import type { CreatureStore } from '../src/creature-store';
import { GeneratedWorld } from './support/generated';

// The family come home to are not called by the protagonist's own name (the fresh playtest of 7 November): a dwarf
// warrior Harbek came home to kite's second town to a brother Harbek, and with two of the company called alike, the
// shops' "Buy … for Harbek" could not be told apart and nothing on their counters could be bought.
describe('the family come home to', () => {
  it('are named apart from the one who comes home, and the shop sells to them', async () => {
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared,
      { origin: 'kin', party: [{ name: 'Harbek', raceId: 'dwarf', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'kite', w.source);
    const store = (s.campaign as unknown as { creatures: CreatureStore }).creatures;
    const kin = ['drover__wife', 'drover__son'].flatMap(g => s.campaign.state.inhabitants[g] ?? [])
      .map(id => store.get(id).name);
    expect(kin.length).toBe(2);
    expect(kin).not.toContain('Harbek');
    GeneratedWorld.put(s, 's1_general');
    await s.perform('wait');
    expect(PlayerView.choices(s.campaign).some(c => /^Buy a blanket for Harbek/.test(c.choice.name))).toBe(true);
  }, 120000);
});
