import { readFileSync } from 'node:fs';
import { Alone } from './alone';
import type { CreatureGenerationContext } from '../../src/content';

// Any situation whose imports are the country's ordinary roles (the land and the place outside it, a town's green or
// gossip, taproom, shrine and the people who keep them, the first town's and a far one's), alone: its own module on a
// host written from what it imports (see Alone), a few lines where a generated country took minutes. The host's names
// are `host__<role>`; the green its company starts on is the near town's (`gossip`, where a country's news is heard).
// A situation that imports rooms of its own site (brood-hollow, caught-below) has its own host.
const towns: Record<string, string> = { town: 'Hythe', first: 'Thornbury', far: 'Farham' };
export class SituationAlone {
  // The town a role belongs to: `first_…`, `far_…`, else the near town.
  private static town(role: string): string { return /^(first|far)_/.exec(role)?.[1] ?? 'town'; }
  private static room(role: string): string { return role === 'gossip' ? 'green' : role; }
  static host(roles: string[], size: number): string {
    const lines = ['Place land "the downs" is wilderness at 0, 0.', 'Place outside "below it" is room within land at 0, 0 outdoors.'];
    const rooms = new Set(['green', ...roles.filter(r => /(green|gossip|taproom|shrine)$/.test(r)).map(r => this.room(r))]);
    for (const r of roles) {
      if (/keeper$/.test(r)) { rooms.add(r.replace(/keeper$/, 'taproom')); }
      if (/priest$/.test(r)) { rooms.add(r.replace(/priest$/, 'shrine')); }
    }
    for (const [town, name] of Object.entries(towns)) {
      const mine = [...rooms].filter(r => this.town(r) === town);
      if (!mine.length) { continue; }
      lines.push(`Place ${town} "${name}" is settlement.`);
      mine.forEach((r, i) => lines.push(`Place ${r} "the ${r.replace(/^(first|far)_/, '')}" is room within ${town} at ${i}, 0${
        /green$/.test(r) ? ' outdoors' : ''}.`));
    }
    const people: [RegExp, string, string][] = [[/keeper$/, 'taproom', 'who keeps the inn'], [/priest$/, 'shrine', 'the priest'],
      [/trader$/, 'green', 'a merchant']];
    for (const r of roles) {
      const [, at, role] = people.find(([p]) => p.test(r)) ?? [];
      if (at) { lines.push(`Person ${r} "${r}" at ${r.replace(/(keeper|priest|trader)$/, at)} { Role "${role}". Ancestry human. Peaceable. }`); }
    }
    lines.push(`Company party "You" of ${size} at green.`);
    return lines.join('\n  ');
  }
  static roles(situation: string): string[] {
    const m = JSON.parse(readFileSync(`data/situations/${situation}/module.json`, 'utf8')) as { imports: string[] };
    return m.imports.filter(r => r !== 'party');
  }
  static async start(situation: string, id: string, o: { party?: CreatureGenerationContext[]; seed?: string } = {}) {
    const roles = this.roles(situation), party = o.party ?? [{ name: 'Mira', raceId: 'human', classId: 'warrior' }];
    const exports = [...new Set([...roles.map(r => this.room(r)), 'green', 'outside', 'land'])];
    return Alone.start({ id, bundle: `../../data/situations/${situation}/module.json`, host: this.host(roles, party.length),
      exports, imports: Object.fromEntries(roles.map(r => [r, this.room(r)])), party, seed: o.seed });
  }
}
