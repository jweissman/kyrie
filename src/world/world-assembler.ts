import type { DeemValue } from 'deem';
import { Content, type CreatureGenerationContext } from '../content';
import { RandomStreams } from '../random-streams';
import type { BundleSource } from '../campaign/bundle-source';
import type { BundleRequest } from '../campaign/module-bundle';
import { OverlayBundleSource } from '../campaign/overlay-bundle-source';
import { Expressions } from '../expressions';
import { Overlays } from '../overlays';
import { RegionWriter, type Carrier, type Contact, type Region, type Site } from './region-writer';

// A scenario a generated region may include: where it belongs, the places it needs, its modules and bindings, the
// way in that stays hidden until someone hears of it, and what people say about it.
export interface ScenarioManifest {
  version: 1; id: string; name: string; instances?: number; weight?: number;
  context?: Record<string, string[]>;
  places: Record<string, { site?: string[]; settlement?: string }>;
  modules: { id: string; bundle: string; imports: Record<string, string>; context?: Record<string, DeemValue> }[];
  route?: string;
  // A hook is a fact the scenario establishes (module.export) that people pass on through some channels; unless it
  // `opens: false`, hearing it reveals the way in.
  hooks?: { fact: string; topic: string; channels: Carrier['channel'][]; opens?: boolean }[];
}
export interface Placement {
  scenario: string; instance: string; bindings: Record<string, string>; generated: string[];
  modules: string[]; carriers: Record<string, string[]>;
}
export interface WorldReport {
  seed: string; region: Region; context: Record<string, string>;
  eligibility: { scenario: string; fits: boolean; why?: string }[]; placements: Placement[]; contacts: Contact[];
}
interface Entry { path: string; manifest: ScenarioManifest }

// Builds a playable campaign from a seed: Deem generates the region; scenarios are selected by the contexts they
// declare (a Deem select over the library); each is bound to the region's places, given any sites it needs, and
// spread by word of mouth. The result is an ordinary campaign manifest over generated and authored modules.
export class WorldAssembler {
  static readonly speakers: Record<Carrier['channel'], string> = { tavern: 'innkeeper', road: 'traveller',
    temple: 'priest', market: 'merchant' };
  static readonly rooms: Record<Carrier['channel'], string> = { tavern: 'taproom', road: 'taproom', temple: 'shrine',
    market: 'shop' };
  static readonly heard: Record<Carrier['channel'], string> = { road: 'News from the roads reaches them first.',
    tavern: 'They hear everything said across their tables.', temple: 'The faithful bring them their troubles.',
    market: 'Traders tell them what they have seen.' };
  static readonly party: CreatureGenerationContext[] = [
    { name: 'Elen', raceId: 'elf', classId: 'ranger', backgroundId: 'hunter' },
    { name: 'Bran', raceId: 'human', classId: 'warrior', backgroundId: 'locksmith', traits: ['toughness'] },
    { name: 'Dori', raceId: 'dwarf', classId: 'cleric', backgroundId: 'medic', traits: ['vitalist'],
      spells: ['cure', 'bless', 'anoint', 'prayer', 'minor_restoration', 'cure_moderate'] }];
  static async assemble(seed: string, base: BundleSource, options: {
    library?: string; scenarios?: number; region?: Record<string, DeemValue>; party?: CreatureGenerationContext[];
  } = {}): Promise<{ path: string; source: BundleSource; report: WorldReport }> {
    const region = new Content(RandomStreams.key(seed, 'world', 'region'))
      .generate('region', options.region ?? {}) as unknown as Region;
    const context = { terrain: region.terrain, ancestry: region.ancestry, domain: region.domain };
    const library = await this.library(base, options.library ?? 'data/scenarios/library.json');
    const eligibility = library.map(e => this.fits(e.manifest, context, region));
    const placements: Placement[] = [], claimed = new Set<string>(), count = new Map<string, number>();
    for (let round = 0; round < (options.scenarios ?? 3); round++) {
      const open = library.filter((e, i) => eligibility[i]!.fits && (count.get(e.manifest.id) ?? 0)
        < (e.manifest.instances ?? 1) && this.placeable(e.manifest, region, claimed));
      const chosen = this.choose(open, context, RandomStreams.key(seed, 'world', 'scenario', round));
      if (!chosen) { break; }
      const n = (count.get(chosen.manifest.id) ?? 0) + 1;
      count.set(chosen.manifest.id, n);
      placements.push(this.place(chosen.manifest, { n, region, claimed, seed }));
    }
    const party = options.party ?? this.party, contacts = this.contacts(region, party, seed);
    const slug = seed.replace(/[^A-Za-z0-9]/g, '').slice(0, 24) || 'world', root = `world-${slug}`;
    const files: Record<string, string> = {
      [`${root}/region/module.json`]: JSON.stringify(RegionWriter.manifest(region)),
      [`${root}/region/region.kyr`]: RegionWriter.source(region, { size: party.length, contacts }) };
    const modules: BundleRequest[] = [{ id: RegionWriter.id, bundle: `${root}/region/module.json` }];
    placements.forEach((placement, i) => {
      const entry = library.find(e => e.manifest.id === placement.scenario)!;
      modules.push(...this.requests(entry, placement, base, context));
      const word = this.word(entry.manifest, placement, { region, contacts });
      if (word) {
        files[`${root}/word-${placement.instance}/module.json`] = JSON.stringify(word.manifest);
        files[`${root}/word-${placement.instance}/word.kyr`] = word.source;
        modules.push({ id: `word${i + 1}`, bundle: `${root}/word-${placement.instance}/module.json`, imports: word.imports });
      }
    });
    const path = base.resolve(`${root}.campaign.json`);
    files[path] = JSON.stringify({ version: 1, name: region.name, modules, party,
      pitch: { heading: `A company in ${region.name}`, text: `${region.name} is ${RegionWriter.terrain(region.terrain)} `
        + `country of ${region.ancestry} settlements under ${region.deity}. Nobody hires a company for nothing: listen `
        + 'in the taprooms, at the shrines and on the roads, and go where the trouble is. Choose three companions.' } });
    return { path, source: new OverlayBundleSource(base, files),
      report: { seed, region, context, placements, contacts,
        eligibility: library.map((e, i) => ({ scenario: e.manifest.id, ...eligibility[i]! })) } };
  }
  // Each member whose background brings a contact knows someone of that channel in one of the region's settlements.
  private static contacts(region: Region, party: CreatureGenerationContext[], seed: string): Contact[] {
    return party.flatMap((member, i) => {
      const tie = member.backgroundId ? Overlays.catalog[member.backgroundId]?.contact : undefined;
      if (!tie) { return []; }
      const name = member.name ?? `Member ${i + 1}`, n = region.settlements.length;
      const town = region.settlements[new Expressions(RandomStreams.key(seed, 'world', 'contact', name)).number(`1d${n}`) - 1]!;
      const carrier = `${town.id}_${this.speakers[tie.channel]}`;
      return [{ member: name, background: member.backgroundId!, channel: tie.channel, carrier, room: `${town.id}_${this.rooms[tie.channel]}`,
        text: `${tie.text.replaceAll('{contact}', `{${carrier}}`).replaceAll('{member}', name)} ${this.heard[tie.channel]}` }];
    });
  }
  private static async library(base: BundleSource, index: string): Promise<Entry[]> {
    const path = base.resolve(index);
    const list = JSON.parse(await base.read(path)) as { scenarios: string[] };
    return Promise.all(list.scenarios.map(async file => {
      const at = base.resolve(file, path);
      return { path: at, manifest: JSON.parse(await base.read(at)) as ScenarioManifest };
    }));
  }
  // Context fit, decided by the same Deem selection the assembler uses, and whether its sites can exist here.
  private static fits(s: ScenarioManifest, context: Record<string, string>, region: Region) {
    if (!this.choose([{ path: '', manifest: s }], context, 'fit')) {
      const wants = Object.entries(s.context ?? {}).map(([k, v]) => `${k} ${v.join('/')}`).join(', ');
      return { fits: false, why: `wants ${wants}` };
    }
    return this.placeable(s, region, new Set()) ? { fits: true } : { fits: false, why: 'no site it needs can stand here' };
  }
  // One weighted pick among scenarios whose declared contexts include the region's: a Deem select over a table.
  private static choose(open: Entry[], context: Record<string, string>, seed: string): Entry | undefined {
    if (!open.length) { return undefined; }
    const keys = Object.keys(context);
    const rows = open.map(e => ({ _key: e.manifest.id,
      ...(e.manifest.weight && e.manifest.weight > 1 ? { __weight: e.manifest.weight } : {}),
      ...Object.fromEntries(Object.entries(e.manifest.context ?? {})
        .map(([k, v]) => [`_${k}`, Object.fromEntries(v.map(x => [x, true]))])) }));
    // Deem's negation binds loosely, so each clause is parenthesized.
    const predicate = keys.map(k => `((!dig(#__it, "_${k}")) || dig(#__it, "_${k}", #${k}))`).join(' && ');
    const setting = Content.settingWith({ scenarioLibrary: { discriminator: 'any', groups: { default: rows } } } as never,
      { scenario_choice: { __no_id: true, _pick: `=select(scenarioLibrary, default, '${predicate}')`, id: "=dig(#_pick, '_key')" } } as never);
    try {
      const id = new Content(seed, setting).generate('scenario_choice', context).id;
      return open.find(e => e.manifest.id === id);
    } catch { return undefined; }
  }
  private static placeable(s: ScenarioManifest, region: Region, claimed: Set<string>): boolean {
    return Object.values(s.places).every(p => !p.site || p.site.some(kind =>
      region.sites.some(w => w.kind === kind && !claimed.has(w.id)) || this.newSite(region, kind, 'probe') !== undefined));
  }
  private static newSite(region: Region, kind: string, seed: string): Site | undefined {
    try {
      const site = new Content(seed).generate('site', { terrain: region.terrain, kind }) as unknown as Site;
      return { ...site, id: `w${region.sites.length + 1}` };
    } catch { return undefined; }
  }
  // Binds each place a scenario needs: a free region site of a kind it accepts (or a newly generated one), or the
  // settlement nearest one of those sites.
  private static place(s: ScenarioManifest,
    at: { n: number; region: Region; claimed: Set<string>; seed: string }): Placement {
    const { n, region, claimed, seed } = at;
    const instance = `${s.id.replace(/[^A-Za-z0-9]/g, '')}${n > 1 ? n : ''}`, bindings: Record<string, string> = {};
    const generated: string[] = [];
    for (const [role, need] of Object.entries(s.places)) {
      if (need.site) {
        let site = need.site.map(kind => region.sites.find(w => w.kind === kind && !claimed.has(w.id))).find(Boolean);
        if (!site) {
          site = need.site.map(kind => this.newSite(region, kind, RandomStreams.key(seed, 'world', 'site', instance, role)))
            .find(Boolean)!;
          site.near = region.settlements[region.sites.length % region.settlements.length]!.id;
          region.sites.push(site); generated.push(site.id);
        }
        claimed.add(site.id); bindings[role] = site.id;
      } else if (need.settlement) {
        const near = need.settlement.startsWith('near:')
          ? region.sites.find(w => w.id === bindings[need.settlement!.slice(5)]) : undefined;
        bindings[role] = near ? RegionWriter.near(region, near).id : region.settlements[0]!.id;
      }
    }
    return { scenario: s.id, instance, bindings, generated, carriers: {},
      modules: s.modules.map(m => this.install(m.id, n)) };
  }
  private static install(module: string, n: number): string {
    return `${module.replace(/[^A-Za-z0-9]/g, '')}${n > 1 ? n : ''}`;
  }
  // A scenario reference: @party, @region, @role, @role.part (a settlement's green, a site's track…), module.export.
  private static ref(value: string, placement: Placement): string {
    if (!value.startsWith('@')) {
      const [module, name] = value.split('.') as [string, string];
      return `${this.install(module, Number(placement.instance.match(/\d+$/)?.[0] ?? 1))}.${name}`;
    }
    const [role, part] = value.slice(1).split('.') as [string, string | undefined];
    if (role === 'party' || role === 'region') { return `${RegionWriter.id}.${role}`; }
    const bound = placement.bindings[role];
    if (!bound) { throw new Error(`Scenario reference ${value} names no bound place`); }
    return `${RegionWriter.id}.${part ? `${bound}_${part}` : bound}`;
  }
  private static requests(entry: Entry, placement: Placement, base: BundleSource,
    context: Record<string, string>): BundleRequest[] {
    return entry.manifest.modules.map((m, i) => ({ id: placement.modules[i]!,
      bundle: base.resolve(m.bundle, entry.path),
      imports: Object.fromEntries(Object.entries(m.imports).map(([name, value]) => [name, this.ref(value, placement)])),
      context: { ...context, ...m.context } }));
  }
  private static localize(this: void, roles: string[], text: string): string {
    return roles.reduce((t, r) => t.replaceAll(`{${r}}`, `{p_${r}}`), text);
  }
  // The module that spreads word of a placed scenario: each hook is an established fact, known to carriers in the
  // settlement nearest it and the next one along, offered as something to ask about; any of them reveals the way in.
  private static word(s: ScenarioManifest, placement: Placement, at: { region: Region; contacts: Contact[] }) {
    const { region, contacts } = at;
    const hooks = s.hooks ?? [];
    if (!hooks.length && !s.route) { return undefined; }
    const q = JSON.stringify;
    const firstSite = Object.entries(s.places).find(([, p]) => p.site)?.[0];
    const site = region.sites.find(w => w.id === placement.bindings[firstSite ?? '']);
    const home = site ? RegionWriter.near(region, site) : region.settlements[0]!;
    const towns = [home, region.settlements[(region.settlements.indexOf(home) + 1) % region.settlements.length]!];
    const roles = Object.keys(s.places).filter(r => hooks.some(h => h.topic.includes(`{${r}}`)));
    const imports: Record<string, string> = { party: `${RegionWriter.id}.party` }, lines: string[] = [];
    lines.push(`Module word_${placement.instance} ${q(`Word of ${s.name}`)} {`, '  Entity party: group "Your company".');
    // Local names are prefixed so they cannot shadow a rule's parameter names (site, way…).
    const local = WorldAssembler.localize.bind(undefined, roles);
    if (s.route) { lines.push('  Entity route_in: passage "The way in".'); imports.route_in = this.ref(s.route, placement); }
    for (const role of roles) { lines.push(`  Place p_${role} ${q(role)} is room.`); imports[`p_${role}`] = this.ref(`@${role}`, placement); }
    const carriers = new Set<string>();
    for (const [index, hook] of hooks.entries()) {
      const fact = `h${index + 1}`;
      lines.push(`  Entity ${fact}: fact "What people say".`);
      imports[fact] = this.ref(hook.fact, placement);
      if (s.route && hook.opens !== false) { lines.push(`  Initially Assert revealedBy(route_in, ${fact}).`); }
      // Carriers in the towns nearest the scenario, and members' contacts anywhere who hear that kind of news.
      const tellers = new Map<string, string>();
      for (const town of new Set(towns)) {
        for (const channel of hook.channels) { tellers.set(`${town.id}_${this.speakers[channel]}`, `${town.id}_${this.rooms[channel]}`); }
      }
      for (const c of contacts.filter(c => hook.channels.includes(c.channel))) { tellers.set(c.carrier, c.room); }
      for (const [carrier, room] of tellers) {
        const topic = `${fact}_${carrier}`;
        if (!carriers.has(carrier)) {
          lines.push(`  Entity ${carrier}: group "Someone".`); carriers.add(carrier);
          if (!carriers.has(room)) { lines.push(`  Place ${room} "Where they are" is room.`); carriers.add(room); }
        }
        imports[carrier] = `${RegionWriter.id}.${carrier}`; imports[room] = `${RegionWriter.id}.${room}`;
        lines.push(`  Entity ${topic}: source ${q(local(hook.topic))}.`,
          `  Initially Assert knows(${carrier}, ${fact}). Initially Assert testimony(${carrier}, ${topic}).`,
          `  Initially Assert reveals(${topic}, ${fact}). Initially Assert noticeable(${topic}).`,
          `  Initially Assert at(${topic}, ${room}).`);
        (placement.carriers[hook.fact] ??= []).push(carrier);
      }
    }
    lines.push('  Goal false.', '}');
    const names = Object.keys(imports);
    const types = Object.fromEntries(names.map(n => [n, { type: n === 'party' ? 'group' : n === 'route_in' ? 'passage'
      : /^h\d+$/.test(n) ? 'fact' : n.startsWith('p_') || /_(taproom|shrine|shop)$/.test(n) ? 'place' : 'group' }]));
    return { source: lines.join('\n'), imports,
      manifest: { version: 1, source: 'word.kyr', rules: ['world'], globals: ['party'], imports: names, roles: types } };
  }
}
