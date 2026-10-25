import { RegionGeography } from './region-geography';
import { RegionSites } from './region-sites';
import { RegionWriter, type Contact, type Region } from './region-writer';
import { SettlementWriter } from './settlement-writer';
import { WorldAssembler, type Placement, type ScenarioManifest } from './world-assembler';

// The module that spreads word of a placed scenario: each hook is an established fact, known to carriers in the
// settlement nearest it and its neighbour along the road, offered as something to ask about; any of them reveals
// the way in, and so does looking about where it starts, when the scenario says what is found there.
export class ScenarioWord {
  static of(s: ScenarioManifest, placement: Placement, at: { region: Region; contacts: Contact[] }) {
    const { region, contacts } = at;
    const hooks = s.hooks ?? [];
    if (!hooks.length && !s.route) { return undefined; }
    const q = JSON.stringify;
    const firstSite = Object.entries(s.places).find(([, p]) => p.site)?.[0];
    const site = region.sites.find(w => w.id === placement.bindings[firstSite ?? '']);
    const home = site ? RegionWriter.near(region, site)
      : region.settlements.find(t => Object.values(placement.bindings).includes(t.id)) ?? region.settlements[0]!;
    // Word goes from the settlement nearest the trouble to its neighbour along the road.
    const road = RegionGeography.roads(region).find(r => r.from.id === home.id || r.to.id === home.id);
    const towns = [home, road ? (road.from.id === home.id ? road.to : road.from)
      : region.settlements[(region.settlements.indexOf(home) + 1) % region.settlements.length]!];
    const imports: Record<string, string> = { party: `${RegionWriter.id}.party` }, lines: string[] = [];
    lines.push(`Module word_${placement.instance} ${q(`Word of ${s.name}`)} {`, '  Entity party: group "Your company".');
    // Local names are prefixed so they cannot shadow a rule's parameter names (site, way…).
    if (s.route) { lines.push('  Entity route_in: passage "The way in".'); imports.route_in = WorldAssembler.ref(s.route, placement); }
    const carriers = new Set<string>();
    if (s.route && s.found && site) { this.searched(s.found, `{${firstSite}}`, { placement, lines, imports, declared: carriers }); }
    for (const [index, hook] of hooks.entries()) {
      const fact = `h${index + 1}`;
      lines.push(`  Entity ${fact}: fact "What people say".`);
      imports[fact] = WorldAssembler.ref(hook.fact, placement);
      if (s.route && hook.opens !== false) { lines.push(`  Initially Assert revealedBy(route_in, ${fact}).`); }
      // Carriers in the towns nearest the scenario, and members' contacts anywhere who hear that kind of news.
      const tellers = new Map<string, string>();
      for (const town of new Set(towns)) {
        for (const channel of hook.channels) {
          const speaker = WorldAssembler.speakers[channel] as 'innkeeper';
          tellers.set(`${town.id}_${speaker}`, SettlementWriter.standing(region, town, speaker));
        }
      }
      for (const c of contacts.filter(c => hook.channels.includes(c.channel))) {
        tellers.set(c.carrier, c.room);
        c.concern ??= this.plainly(hook.topic, placement, region);
      }
      for (const [carrier, room] of tellers) {
        const topic = `${fact}_${carrier}`;
        if (!carriers.has(carrier)) {
          lines.push(`  Entity ${carrier}: group "Someone".`); carriers.add(carrier);
          if (!carriers.has(room)) { lines.push(`  Place ${room} "Where they are" is room.`); carriers.add(room); }
        }
        imports[carrier] = `${placement.rid}.${carrier}`; imports[room] = `${placement.rid}.${room}`;
        lines.push(`  Entity ${topic}: source ${q(this.named(hook.topic, placement, { lines, imports, declared: carriers }))}.`,
          `  Initially Assert knows(${carrier}, ${fact}). Initially Assert testimony(${carrier}, ${topic}).`,
          `  Initially Assert reveals(${topic}, ${fact}). Initially Assert noticeable(${topic}).`,
          `  Initially Assert at(${topic}, ${room}).`);
        (placement.carriers[hook.fact] ??= []).push(carrier);
      }
    }
    lines.push('  Goal false.', '}');
    const names = Object.keys(imports);
    const types = Object.fromEntries(names.map(n => [n, { type: n === 'party' ? 'group' : n === 'route_in' ? 'passage'
      : /^h\d+$/.test(n) ? 'fact' : /_(taproom|shrine|shop|green)$|^at_/.test(n) ? 'place' : 'group' }]));
    return { source: lines.join('\n'), imports,
      manifest: { version: 1, source: 'word.kyr', rules: ['world'], globals: ['party'], imports: names, roles: types } };
  }
  // A hook's topic as a stranger would say it, with each place it names as it looks: "trouble at the fallen walls".
  private static plainly(text: string, placement: Placement, region: Region): string {
    return text.replace(/\{(\w+)\}/g, (whole, role: string) => {
      const id = placement.bindings[role], seat = RegionGeography.seats(region).find(x => x.site.id === id);
      return seat ? RegionSites.seenAs(seat, region) : region.settlements.find(t => t.id === id)?.name ?? whole;
    });
  }
  // A hook's topic names the places it is about by role: {den} becomes a reference to the bound place, so it is said
  // as the company knows it (a grassed mound, until someone names it).
  private static named(text: string, placement: Placement,
    at: { lines: string[]; imports: Record<string, string>; declared: Set<string> }): string {
    return text.replace(/\{(\w+)\}/g, (whole, role: string) => {
      const id = placement.bindings[role];
      if (!id) { return whole; }
      const local = `at_${role}`;
      if (!at.declared.has(local)) {
        at.lines.push(`  Place ${local} "Where it is" is room.`);
        at.imports[local] = `${placement.rid}.${id}`; at.declared.add(local);
      }
      return `{${local}}`;
    });
  }
  // The way in is found by looking about where it starts, as well as by hearing of the trouble: a company that came
  // on the place by itself is not shut out of it (the follow-up review searched a pit and found no way down into it).
  private static searched(found: { known: string; told: string }, role: string,
    at: { placement: Placement; lines: string[]; imports: Record<string, string>; declared: Set<string> }) {
    const place = this.named(role, at.placement, at).slice(1, -1), q = JSON.stringify;
    at.lines.push(`  Discovery way_found ${q(found.known)} {`, `    Found by searching ${place} ${q(found.told)}.`, '  }',
      '  Initially Assert revealedBy(route_in, way_found).');
  }
}
