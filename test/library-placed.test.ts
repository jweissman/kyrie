import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { Frontier } from '../src/world/frontier';
import { Countries } from '../src/world/countries';
import { GeneratedWorld } from './support/generated';

// The last five adventures no world reached (OR-420), placed together as provinces of the first country, as every
// adventure is (Mission 18's Gate B): the Eel Bell and the Rain-Gourd by the sea to the east, A Voice for Hexworth on
// the Sour Edge to the north, the Warm Wall up the fell to the west, the Leaving Supper south at Haddle Cross. Each
// way in stands on the first country's own land, clear of every other; the Rain-Gourd, which had no placed form, is
// walked to, and its road comes onto the headland above Palla, where Oyelle Marre lives up the hill.
const five = ['eelbell', 'hexworth', 'warmwall', 'leaving', 'raingourd'];
describe('the last of the library, placed', () => {
  it('stands each way in on the first country\'s land, clear of the others', async () => {
    for (const id of five) {
      expect(Countries.provinces.map(c => c.id)).toContain(id);
      expect(Countries.marches.some(c => c.id === id)).toBe(false);
    }
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared), all = w.report.region.provinces ?? [];
    for (const id of five) {
      const province = all.find(p => p.country === id);
      expect([id, province?.name]).toEqual([id, Countries.list.find(c => c.id === id)!.name]);
      expect(all.filter(p => p.gate.cell === province!.gate.cell).map(p => p.country)).toEqual([id]);
    }
  }, 120000);
  it('walks to the Rain-Gourd, and its road comes onto the headland above Palla', async () => {
    const seed = 'kite', w = await WorldAssembler.assemble(seed, NodeBundleSource.shared);
    const s = await PlaySession.start(w.path, seed, w.source);
    await GeneratedWorld.travel(s, 'gate_raingourd');
    await new Frontier(seed, NodeBundleSource.shared).expand(s.campaign);
    expect(s.campaign.installed).toContain('praingourd');
    const road = PlayerView.choices(s.campaign).find(x => x.choice.id.endsWith(',praingourd__headland)'));
    expect(road?.choice.id).toBeDefined();
    await s.leg(road!.choice.id);
    expect(s.campaign.world.one('at', 'party')).toBe('praingourd__headland');
    expect(s.campaign.module.entities.some(e => e.id === 'praingourd__oyelle')).toBe(true);
  }, 900000);
});
