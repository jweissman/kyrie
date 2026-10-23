import { Draw } from '../land/draw';
import type { DeepConnector, DeepLevelSpec, DeepPurpose } from './deep-purposes';

// A room of a deep site: where it is (its level and its place on that level's grid), what it is for, and how it is
// told.
export interface DeepRoom {
  id: string; level: number; role: string; x: number; y: number; name: string; scene: string; lit: boolean;
}
// A way between two rooms: on a level (a gallery, a crawl) or between levels (a cage, a stair); how long it takes,
// what it needs, whether it goes one way only, and what works it.
export interface DeepLink {
  id: string; a: string; b: string; kind: string; name: string; minutes: number;
  oneWay?: boolean; needs?: string[]; mechanism?: string; between?: boolean;
}
export interface DeepLevel { id: string; index: number; name: string; flooded: boolean; rooms: DeepRoom[] }
export interface DeepLayout { site: string; levels: DeepLevel[]; links: DeepLink[] }

// How a deep site lies, drawn from its purpose: each level a spine of rooms from where it is entered, with branches
// off the spine and loops back into it, every room at its own place on the level's grid; then the ways between
// levels. Optional rooms (?role) are there or not by the draw; a connector whose rooms are not there is not made,
// and every level is reached by at least one.
export class DeepLayouts {
  static make(purpose: DeepPurpose, site: string, key: string): DeepLayout {
    const draw = new Draw(`${key}:layout`), links: DeepLink[] = [];
    const levels = purpose.levels.map((spec, index) => this.level({ purpose, spec, index, site }, draw, links));
    for (const c of purpose.connectors) { this.connect({ levels, links, c, site }); }
    return { site, levels, links };
  }
  private static level(at: { purpose: DeepPurpose; spec: DeepLevelSpec; index: number; site: string }, draw: Draw,
    links: DeepLink[]): DeepLevel {
    const { purpose, spec, index, site } = at, rooms: DeepRoom[] = [], taken = new Set<string>();
    const ctx = { purpose, site, spec, index };
    let x = 0, last: DeepRoom | undefined;
    for (const token of spec.spine) {
      const role = this.drawn(token, draw);
      if (!role) { continue; }
      const r = this.room(ctx, { role, x, y: 1 }, rooms);
      taken.add(`${x},1`);
      if (last) { links.push(this.walk(last, r, purpose, draw)); }
      last = r; x++;
    }
    for (const branch of spec.branches ?? []) {
      const from = rooms.find(r => r.role === branch.at);
      if (!from) { continue; }
      for (const token of branch.roles) {
        const role = this.drawn(token, draw);
        if (!role) { continue; }
        const [bx, by] = this.free(taken, from.x, from.y);
        taken.add(`${bx},${by}`);
        links.push(this.walk(from, this.room(ctx, { role, x: bx, y: by }, rooms), purpose, draw));
      }
    }
    for (const loop of spec.loops ?? []) {
      const a = rooms.find(r => r.role === loop.from), b = rooms.find(r => r.role === loop.to);
      if (!a || !b || draw.next() >= loop.chance) { continue; }
      links.push({ id: `${a.id}__${b.id}`, a: a.id, b: b.id, kind: loop.kind, name: draw.pick(loop.names), minutes: 6 });
    }
    return { id: `${site}_${spec.id}`, index, name: draw.pick(spec.names), flooded: !!spec.flooded, rooms };
  }
  // "?forge" is there one time in two.
  private static drawn(token: string, draw: Draw): string | undefined {
    return token.startsWith('?') ? (draw.next() < 0.5 ? token.slice(1) : undefined) : token;
  }
  private static room(at: { purpose: DeepPurpose; site: string; spec: DeepLevelSpec; index: number },
    where: { role: string; x: number; y: number }, rooms: DeepRoom[]): DeepRoom {
    const { purpose, site, spec, index } = at, role = purpose.roles[where.role];
    if (!role) { throw new Error(`Deep site ${purpose.plan.id}: no role ${where.role}`); }
    const n = rooms.filter(r => r.role === where.role).length;
    const draw = new Draw(`${site}:${spec.id}:${where.role}:${n}`);
    const r: DeepRoom = { id: `${site}_${spec.id}_${where.role}${n ? n + 1 : ''}`, level: index, role: where.role,
      x: where.x, y: where.y, name: role.names[n % role.names.length]!, scene: draw.pick(role.scenes),
      lit: !!role.lit };
    rooms.push(r);
    return r;
  }
  // The nearest free cell above or below a room, then further out.
  private static free(taken: Set<string>, x: number, y: number): [number, number] {
    for (let d = 1; d < 6; d++) {
      for (const [dx, dy] of [[0, -d], [0, d], [1, -d], [-1, d]] as [number, number][]) {
        if (!taken.has(`${x + dx},${y + dy}`)) { return [x + dx, y + dy]; }
      }
    }
    return [x, y + 6];
  }
  // The way between two rooms on a level: the purpose's own word for a gallery, a few minutes' walk.
  private static walk(a: DeepRoom, b: DeepRoom, purpose: DeepPurpose, draw: Draw): DeepLink {
    const name = draw.pick(purpose.walks ?? ['the passage']);
    return { id: `${a.id}__${b.id}`, a: a.id, b: b.id, kind: 'tunnel', name, minutes: 2 };
  }
  private static connect(at: { levels: DeepLevel[]; links: DeepLink[]; c: DeepConnector; site: string }) {
    const { levels, links, c, site } = at;
    const a = levels.find(l => l.id === `${site}_${c.from[0]}`)?.rooms.find(r => r.role === c.from[1]);
    const b = levels.find(l => l.id === `${site}_${c.to[0]}`)?.rooms.find(r => r.role === c.to[1]);
    if (!a || !b) { return; }
    links.push({ id: `${a.id}__${b.id}`, a: a.id, b: b.id, kind: this.kinds[c.kind] ?? c.kind, name: c.names[0]!,
      minutes: c.minutes, between: true, ...c.oneWay ? { oneWay: true } : {}, ...c.needs ? { needs: c.needs } : {},
      ...c.mechanism ? { mechanism: c.mechanism } : {} });
  }
  // A connector's kind as a passage's: a cage goes down a shaft, an ore pass is a shaft too.
  static readonly kinds: Record<string, string> = { cage: 'shaft', chute: 'shaft' };
}
