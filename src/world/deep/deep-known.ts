import type { DeepLayout, DeepLevel, DeepLink, DeepRoom } from './deep-layout';

// A level's way through, once known (OR-1448, the economy review's routine, OR-1395): a company that has been in every
// room between where it comes onto a level and where it goes down from it may cross that ground again in one act,
// taking as long as the rooms would, while nothing there has changed. Where something has (a band come in or come up
// that does not let the company be, a trap set again), the way is shut, its words saying so, and the rooms are met one
// by one as any.
export interface Through { level: DeepLevel; rooms: DeepRoom[]; ways: DeepLink[] }
export class DeepKnown {
  static readonly q = JSON.stringify;
  static readonly said = {
    name: 'the way you know',
    known: 'You know this level now, from end to end. While nothing changes on it, you can cross it without stopping.',
    shut: 'Something has changed along the way you know since you came through. You will have to go room by room.',
  };
  static lines(layout: DeepLayout): string[] {
    return layout.levels.flatMap(level => {
      const t = this.through(layout, level);
      return t ? this.level(t) : [];
    });
  }
  // From where the company comes onto the level (the way in, or the way down into it) to where it goes down from it,
  // by the level's own plain ways, and with a room between; none on a drowned level.
  static through(layout: DeepLayout, level: DeepLevel): Through | undefined {
    if (level.flooded) { return undefined; }
    const ids = new Set(level.rooms.map(r => r.id)), entry = this.entry(layout, level);
    const down = layout.links.find(l => l.between && ids.has(l.a)), exit = level.rooms.find(r => r.id === down?.a);
    if (!entry || !exit || entry === exit) { return undefined; }
    const plain = layout.links.filter(l => !l.between && ids.has(l.a) && ids.has(l.b) && !l.oneWay && !l.needs
      && !l.mechanism);
    const came = new Map<string, DeepLink | undefined>([[entry.id, undefined]]);
    for (const queue = [entry.id]; queue.length && !came.has(exit.id);) {
      const here = queue.shift()!;
      for (const l of plain.filter(x => (x.a === here || x.b === here) && !came.has(x.a === here ? x.b : x.a))) {
        const to = l.a === here ? l.b : l.a;
        came.set(to, l); queue.push(to);
      }
    }
    if (!came.has(exit.id)) { return undefined; }
    const ways: DeepLink[] = [], rooms = [exit];
    for (let at = exit.id; at !== entry.id;) {
      const l = came.get(at)!;
      ways.unshift(l); at = l.a === at ? l.b : l.a;
      rooms.unshift(level.rooms.find(r => r.id === at)!);
    }
    return rooms.length > 2 ? { level, rooms, ways } : undefined;
  }
  // Where a company comes onto a level: the way in, or the first way down into it.
  static entry(layout: DeepLayout, level: DeepLevel): DeepRoom | undefined {
    const ids = new Set(level.rooms.map(r => r.id)), into = layout.links.find(l => l.between && ids.has(l.b));
    return level.index === 0 ? level.rooms[0] : level.rooms.find(r => r.id === into?.b);
  }
  private static level(t: Through): string[] {
    const q = this.q, id = `${t.level.id}_through`, known = `${id}_known`, ends = [t.rooms[0]!, t.rooms.at(-1)!];
    const been = t.rooms.map(r => `been(party, ${r.id})`).join(' and ');
    const clear = [...t.rooms.slice(1, -1).map(r => `not stirs(${r.id}, party)`), ...t.ways.map(w => `not armed(${w.id})`)];
    const minutes = t.ways.reduce((n, w) => n + w.minutes, 0);
    return [`  Discovery ${known} ${q(this.said.known)}.`,
      `  Rule ${id}_learned when ${been} and not knows(party, ${known}) says ${q(this.said.known)} teaches ${known} { }`,
      `  Passage ${id} ${q(this.said.name)} is tunnel between ${ends[0]!.id} and ${ends[1]!.id} taking ${minutes} minutes`
        + ` hidden until ${known} opening when ${clear.join(' and ')} ${q(this.said.shut)}.`];
  }
}
