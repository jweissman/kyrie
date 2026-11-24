import type { Campaign } from '../../src/campaign/campaign';
import { Canon } from '../../src/canon/canon';
import { EntityIndex } from '../../src/lang/entity-index';
import { ModuleWriter } from '../../src/lang/module-writer';
import { Spatial } from '../../src/lang/spatial';
import { EconomyMeasure } from '../economy-measure';
import { NoviceCountry, type Country } from '../novice-country';

// A level of a site as the first dungeon asks it: its strongest band (the boss) and what lies in it to carry home.
export interface Level { id: string; boss?: string; bossLevel: number; cache: number }
// The first dungeon as the owner defines it (24 November, OR-311): "significant/deep: at least two levels of serious
// resistance, each with a boss and a treasure cache; ideally a companion at the dungeon, and searchable gear near the
// secure entry". Its levels, how far its way in is from the first town, whether someone who would come along for
// hire stands at it, and what of a light, provisions and gear is to be found by searching near its way in.
export interface Dungeon {
  id: string; name: string; minutes: number; levels: Level[]; held: number; entry: string;
  companion: boolean; found: { light: boolean; provisions: boolean; gear: boolean };
}
export class QuantityDungeon {
  // Serious resistance: a band led by one of the second level or above, more than a first-level company is (a
  // she-bear, a barrow's captain, a vault's keeper), not a level's rats.
  static readonly boss = 2;
  // A cache: what lies in the level to be carried off, at what a dealer or buyer pays, worth a trip (a day's rations
  // and a light several times over).
  static readonly cache = 25;
  // Near the way in: within this many minutes of it, over the country's ways.
  static readonly near = 30;
  static readonly light = /^(torch|lantern|candle|hooded_lantern|bullseye_lantern|lamp)$/;
  static readonly provisions = /^(ration|rations|trail_rations|rashers|bread|cheese|bread_and_cheese|food)$/;
  // Every site of the country with two levels or more each with a boss and a cache, the nearest first.
  static all(c: Campaign, country: Country): Dungeon[] {
    const far = NoviceCountry.distances(c, country.start), byId = EntityIndex.of(c.module.entities).byId;
    const sites = c.module.entities.filter(e => e.space?.kind === 'site');
    const read = sites.map(s => this.read(c, { site: s.id, name: s.name, far, byId, country }));
    return read.filter(d => d.held >= 2 && Number.isFinite(d.minutes)).sort((a, b) => a.minutes - b.minutes
      || NoviceCountry.order(a.id, b.id));
  }
  static first(c: Campaign, country: Country): Dungeon | undefined { return this.all(c, country)[0]; }
  private static read(c: Campaign, at: { site: string; name: string; far: Map<string, number>;
    byId: ReturnType<typeof EntityIndex.of>['byId']; country: Country }): Dungeon {
    const { site, far, byId } = at, inside = QuantityDungeon.inside.bind(QuantityDungeon, byId);
    const places = c.module.entities.filter(e => e.space && e.id !== site && inside(e.id, site));
    const levels = places.filter(e => e.space!.kind === 'level').map(l => this.level(c, l.id, inside));
    const reached = places.filter(p => far.has(p.id)).sort((a, b) => far.get(a.id)! - far.get(b.id)!);
    const entry = reached[0]?.id ?? site, minutes = reached[0] ? far.get(entry)! : Infinity;
    return { id: site, name: at.name.split(', ')[0]!, minutes, entry, levels,
      held: levels.filter(l => l.bossLevel >= this.boss && l.cache >= this.cache).length,
      companion: this.companion(c, site, inside), found: this.found(c, entry) };
  }
  private static inside(byId: ReturnType<typeof EntityIndex.of>['byId'], id: string, of: string): boolean {
    return Spatial.ancestry(byId, id).some(e => e.id === of);
  }
  private static level(c: Campaign, level: string, inside: (id: string, of: string) => boolean):
    Level {
    const w = c.world, creatures = c.readout.creatures;
    // Every band standing in it, a site under a town's too (NoviceCountry's bands are those out of any town).
    const bands = Object.entries(c.readout.inhabitants).filter(([g]) => g !== c.playerActor
      && !w.test(ModuleWriter.call('peaceable', g)) && inside(w.one('at', g) ?? '', level)).map(([g, members]) => ({ id: g,
      level: Math.max(0, ...members.map(m => creatures.find(k => k.id === m && k.state.hp > 0)?.base.level ?? 0)) }))
      .sort((a, b) => b.level - a.level || NoviceCountry.order(a.id, b.id));
    const lying = w.related('itemKind').map(r => r.args[0]!).filter(i => {
      const where = w.one('at', i);
      return !!where && inside(where, level) && !w.test(ModuleWriter.call('forSale', i))
        && w.test(ModuleWriter.call('valuable', EconomyMeasure.kind(w, i)));
    });
    const cache = lying.reduce((t, i) => t + Math.max(0, w.number(ModuleWriter.call('dealerPays',
      EconomyMeasure.kind(w, i)))), 0);
    return { id: level, ...bands[0] ? { boss: bands[0].id } : {}, bossLevel: bands[0]?.level ?? 0, cache };
  }
  // Someone with a hire who stands at the site, or at its way in.
  private static companion(c: Campaign, site: string, inside: (id: string, of: string) => boolean): boolean {
    const w = c.world;
    return w.measured('hire').some(m => {
      const at = m.call.args[0] && w.one('at', m.call.args[0]);
      return !!at && inside(at, site);
    });
  }
  // What lies hidden to be found by searching (revealedBy) within reach of the way in: a light, provisions, gear
  // (arms, armour, tools, gear).
  private static found(c: Campaign, entry: string): Dungeon['found'] {
    const w = c.world, near = NoviceCountry.distances(c, entry);
    const kinds = w.related('revealedBy').map(r => r.args[0]!).filter(i => (near.get(w.one('at', i) ?? '') ?? Infinity)
      <= this.near).map(i => EconomyMeasure.kind(w, i));
    return { light: kinds.some(k => this.light.test(k)), provisions: kinds.some(k => this.provisions.test(k)), gear: kinds.some(k => ['weapon', 'armor', 'tool',
      'gear', 'equipment'].includes(Canon.items[k]?.category ?? '') && !this.light.test(k)) };
  }
}
