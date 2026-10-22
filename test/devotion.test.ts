import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import { Canon } from '../src/canon/canon';
import { RegionFaith } from '../src/world/region-faith';
import { GeneratedWorld } from './support/generated';
import { RegionGeography } from '../src/world/region-geography';

// A shrine as Orsino's shrine is: coin left and the observance kept, and the god's favour (its faith's blessing) goes
// with the one it was asked for into their next ten turns of fighting; a good god heals a little, another hurts a
// little. Once a day at each shrine. Thorn: Merscheald keeps Belenus (light); Wǽtwaeter, by the ford of the Wīdex,
// keeps Boann of the waters.
class Shrine {
  static async start() {
    const w = await WorldAssembler.assemble('thorn', NodeBundleSource.shared);
    return { w, s: await PlaySession.start(w.path, 'thorn', w.source) };
  }
  static offers(s: PlaySession): string[] {
    return PlayerView.choices(s.campaign).map(c => c.choice.id).filter(id => id.startsWith('make_offering('));
  }
  static offer(s: PlaySession, member: string) { return s.perform(this.offers(s).find(id => id.includes(member))!); }
  static gold(s: PlaySession) { return s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold')); }
  static member(s: PlaySession, id: string) { return s.campaign.state.creatures.find(c => c.id === id)!; }
}

describe('a shrine in a generated region', () => {
  it('is a god of the land kept in a form, with a practice and a history', async () => {
    const { w } = await Shrine.start(), region = w.report.region, cults = RegionFaith.cults(region);
    expect(cults[0]).toMatchObject({ name: 'Belenus', domain: 'light' });
    // Wǽtwaeter's road fords the Wīdex, and it keeps the river's goddess.
    const i = cults.findIndex(c => c.name !== 'Belenus'), town = region.settlements[i]!;
    const river = RegionGeography.roads(region).find(r => r.form?.form === 'river'
      && (r.from.id === town.id || r.to.id === town.id))!.form!.name;
    expect(cults[i]).toMatchObject({ name: 'Boann', title: 'Goddess of Oceans', form: 'fountain' });
    // Its history is the river's: how the shrine came to stand by the ford.
    const told = RegionFaith.tables.shrineHistory.groups.river!.map(t => t.replaceAll('{land}', `the ${river}`)
      .replaceAll('{town}', town.name).replaceAll('{country}', 'fen'));
    expect(told).toContain(cults[i]!.history);
  }, 60000);
  it('gives the god\'s favour for an offering, once a day', async () => {
    const { s } = await Shrine.start();
    GeneratedWorld.put(s, 's1_shrine');
    await s.perform('wait');
    const gold = Shrine.gold(s);
    expect(Shrine.offers(s)).toHaveLength(3);
    await Shrine.offer(s, 'member_party_1');
    expect(Shrine.gold(s)).toBe(gold - 2);
    const favour = Shrine.member(s, 'region__party_1').state.conditions.find(c => c.id === 'favor_light')!;
    expect(favour.remaining).toBe(10);
    expect(Canon.conditions.favor_light!.modifiers).toEqual(Canon.domains.light!.blessing!.modifiers);
    expect(Shrine.offers(s)).toEqual([]);
    // The next morning the observance can be kept again.
    while (s.campaign.state.elapsed < 140) { await s.perform('wait_hour'); }
    GeneratedWorld.put(s, 's1_shrine');
    await s.perform('wait');
    expect(Shrine.offers(s)).toHaveLength(3);
  }, 60000);
  it('hurts a little at a god\'s shrine that is not good', async () => {
    const { w, s } = await Shrine.start(), cults = RegionFaith.cults(w.report.region);
    const i = cults.findIndex(c => Canon.domains[c.domain]?.alignment !== 'good');
    GeneratedWorld.put(s, `${w.report.region.settlements[i]!.id}_shrine`);
    await s.perform('wait');
    const e = await Shrine.offer(s, 'member_party_2');
    expect((e.combat ?? []).some(x => x.type === 'damage' && x.target === 'region__party_2')).toBe(true);
    expect(Shrine.member(s, 'region__party_2').state.conditions.map(c => c.id)).toContain(`favor_${cults[i]!.domain}`);
  }, 60000);
});
