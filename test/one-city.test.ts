import { describe, expect, it } from 'bun:test';
import { Campaign } from '../src/campaign/campaign';
import { Spatial } from '../src/spatial';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import { ProvincePlay } from './support/province-play';
import { readFileSync } from 'node:fs';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { CityResidents } from '../src/world/city-residents';
import { Countries } from '../src/world/countries';
import { Quarters } from '../src/ui/quarters';

// One city shared by two adventures (the owner, 6 November: one persistent metropolis, never a copy). The quarrel
// over the boundary stones, a goings-on any generated town may have, is set in Hessel by naming it (city:hessel,
// data/scenarios/cities.json): installed when Hessel is, its garden behind Hessel's own inn, its feud between
// Hessel's own innkeeper and shopkeeper, the priest who knows Hessel's; nothing of Hessel copied or remade.
describe('one city, two adventures', () => {
  it('sets the quarrel over the boundary stones in Hessel\'s Old Town, among Hessel\'s own people', async () => {
    const { c, rid, k } = await ProvincePlay.enter('h14', 'hessel',
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'bard' }] });
    expect(c.installed).toContain(`${rid}quarrel`);
    const byId = new Map(c.module.entities.map(e => [e.id, e]));
    // Its garden is a room of Hessel, behind the Two Poles.
    expect(Spatial.ancestry(byId, `${rid}quarrel__garden`).map(e => e.id)).toContain(k('hessel_town'));
    expect(c.world.related('connects').some(r => r.args.includes(k('two_poles'))
      && r.args.includes(`${rid}quarrel__garden`))).toBe(true);
    // In the Old Town, the quarter of the inn it is behind.
    const quarters = Quarters.of(c.world, byId, `${rid}quarrel__garden`) ?? [];
    expect(quarters.find(x => x.here)?.name).toBe('the Old Town');
    expect(quarters.map(x => x.name)).toEqual(expect.arrayContaining(['Upper Hessel', 'the Baths', 'the Old Town']));
    // Hessel's own people take it up, and keep what they had.
    const asked = (who: string) => c.module.actions.filter(a => a.speaker === k(who)).map(a => a.id);
    expect(asked('gully')).toContain(`${rid}quarrel__keeper_stones`);
    expect(asked('hetty')).toContain(`${rid}quarrel__trader_stones`);
    expect(asked('pyne')).toContain(`${rid}quarrel__priest_stones`);
    expect(asked('pyne')).toContain(k('pyne_dream'));
    // One Hessel: no settlement copied for the second adventure.
    expect(c.module.entities.filter(e => e.space?.kind === 'settlement' && e.name === 'Hessel').length).toBe(1);
    // Kept across a save, by the same ids.
    const restored = Campaign.restore(c.save());
    expect(restored.installed).toContain(`${rid}quarrel`);
    expect(restored.module.actions.some(a => a.id === `${rid}quarrel__keeper_stones` && a.speaker === k('gully')))
      .toBe(true);
  }, 240000);
  it('is played there: asked at the Two Poles, the old holes found in its garden, and Hetty brought to set them back', async () => {
    const { s, c, rid, k } = await ProvincePlay.enter('h14', 'hessel',
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'bard' }] });
    const q = (x: string) => `${rid}quarrel__${x}`;
    const take = async (part: string) => {
      const row = PlayerView.choices(c).find(x => x.choice.id.includes(part));
      if (!row) { throw new Error(`No ${part} among ${PlayerView.choices(c).map(x => x.choice.id).join(' ')}`); }
      return s.perform(row.choice.id);
    };
    c.commitWorld(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', k('two_poles')) }]));
    await take(q('keeper_stones'));
    await take(`,${q('garden')})`);
    await take(`search(${q('garden')})`);
    c.commitWorld(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', k('hetty_shop')) }]));
    expect((await take(q('trader_holes'))).response).toContain('I will set them back');
    expect(c.world.test(ModuleWriter.call(q('restored'), k('hetty')))).toBe(true);
  }, 240000);
  it('names only a city whose country exports every part of it its scenarios import', async () => {
    for (const entry of await CityResidents.library(NodeBundleSource.shared)) {
      for (const [role, need] of Object.entries(entry.manifest.places)) {
        const city = /^city:(.+)$/.exec(need.settlement ?? '')?.[1];
        if (!city) { continue; }
        const country = Countries.provinces.find(x => x.id === city);
        expect([entry.manifest.id, !!country]).toEqual([entry.manifest.id, true]);
        const exports = (JSON.parse(readFileSync(`data/adventures/${country!.bundle}`, 'utf8')) as
          { exports: Record<string, string> }).exports;
        const parts = entry.manifest.modules.flatMap(m => Object.values(m.imports))
          .flatMap(v => new RegExp(`^@${role}(?:\\.(\\w+))?$`).exec(v) ?? []).filter((_, i) => i % 2 === 1)
          .map(part => part ? `${CityResidents.prefix}_${part}` : CityResidents.prefix);
        expect(parts.filter(p => !exports[p])).toEqual([]);
      }
    }
  });
});
