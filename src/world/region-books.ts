import { buildSetting, Generator, Template } from 'deem';
import data from '../../data/generation/scenes/antique-books.json';
import { Draw } from './land/draw';
import { RegionKey } from './region-key';
import { RegionGeography } from './region-geography';
import { RegionSites } from './region-sites';
import { SettlementWriter } from './settlement-writer';
import type { Region, Site } from './region-writer';

interface Volume { title: string; cover: string; index: string; proof: string }

export class RegionBooks {
  private static readonly setting = buildSetting(data.tables, data.templates);
  static lines(region: Region, taken: Record<string, string>): string[] {
    const sites = region.sites.filter(s => taken[s.id] === 'arcology'
      || (!taken[s.id] && (s.work?.deep || s.work?.great))).sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
    if (!sites.length) { return []; }
    return region.settlements.filter(s => SettlementWriter.rooms(region, s).taproom).flatMap(s => {
      const seed = `${RegionKey.of(region)}:${s.id}:antique-book`;
      const site = new Draw(`${seed}:destination`).pick(sites);
      const room = SettlementWriter.standing(region, s, 'innkeeper');
      const seat = RegionGeography.seats(region).find(candidate => candidate.site === site);
      if (!seat) { throw new Error(`Antique book destination ${site.id} has no mapped seat`); }
      return this.volume(seed, `${s.id}_antique_book`, { room, keeper: `${s.id}_innkeeper`, site,
        country: RegionKey.of(region),
        where: RegionSites.where(seat, region), arcology: taken[site.id] === 'arcology' });
    });
  }
  private static profile(seed: string): Volume {
    const runtime = Template.bootstrapDeem({ seed: Draw.seed(seed) }, this.setting);
    const value = Generator.gen('antiqueBook', { __setting: this.setting, __deemRuntime: runtime });
    if (Array.isArray(value) || !['title', 'cover', 'index', 'proof']
      .every(k => typeof value[k] === 'string' && value[k].trim())) {
      throw new Error('Invalid generated antique book');
    }
    return { title: String(value.title), cover: String(value.cover), index: String(value.index),
      proof: String(value.proof) };
  }
  static volume(seed: string, id: string, { room, keeper, site, where, arcology, country }:
    { room: string; keeper: string; site: Site; where: string; arcology: boolean; country: string }): string[] {
    const v = this.profile(seed), q = JSON.stringify;
    const registry = Draw.seed(`${country}:source-registry`).toString(36).toUpperCase();
    const stamp = `${arcology ? 'ARC' : 'SUR'}-${registry}-${site.id.toUpperCase()}`;
    const title = `${v.title} (${stamp})`;
    const reach = 'carries(actor, target)';
    return [
      `  Kind ${id}_kind ${q(title)} is gear worth 3 weighing 1 described ${q(`${v.cover} Its source designation is ${stamp}, in ${site.name}.`)}.`,
      `  Item ${id} ${q(title)} is ${id}_kind at ${room}.`,
      `  Initially Assert owns(${keeper}, ${id}).`,
      `  Topic ${id}_loan with ${keeper} ${q(`Ask to borrow ${v.title}`)} when not lends(${keeper}, ${id}, party) {`,
      '    Says "\'Bring it back dry. The last borrower said the damp was historical.\'".',
      `    On discuss { Assert lends(${keeper}, ${id}, actor). }`,
      '  }',
      `  Relation ${id}_target(item). Initially Assert ${id}_target(${id}).`,
      `  Action ${id}_index(actor: group, target: item) ${q(`Read the itinerary in ${v.title}`)} {`,
      `    Requires able(actor) and ${id}_target(target) and lends(${keeper}, target, actor) and ${reach}`,
      `      and not benighted(actor) and not knows(actor, ${site.id}_found).`,
      '    Time 5 minutes.',
      `    On success { Assert knows(actor, ${site.id}_found). }`,
      `    Result ${q(`${v.index} The plate ${stamp} points to ${site.name}: ${where} The route is readable without solving the mathematics.`)}.`,
      '  }',
      `  Entity ${id}_dc: difficulty "the book's mathematical appendix". Initially Set toBeat(${id}_dc) to 30.`,
      `  Action ${id}_study(actor: group, target: item) ${q(`Resolve the mathematical appendix of ${v.title}`)} {`,
      `    Requires able(actor) and ${id}_target(target) and lends(${keeper}, target, actor) and ${reach}`,
      `      and not benighted(actor) and knows(actor, ${site.id}_found) and not knows(actor, ${site.id}_named).`,
      `    Time 10 minutes. Resolve check(actor, mathematics, ${id}_dc).`,
      `    On success { Assert knows(actor, ${site.id}_named). }`,
      `    Result ${q(`${v.proof} The source is ${site.work?.made ?? site.old ?? site.name}, now called ${site.name}.`)}.`,
      '    Otherwise "The itinerary remains usable. The appendix has not resolved.".',
      '  }',
    ];
  }
}
