import { Journey } from '../../src/session/journey';
import { ModuleWriter } from '../../src/lang/module-writer';
import { readFileSync } from 'node:fs';

// The King's Players (doc/adventures/anthology/the-kings-players.md): Gosse's Company in Dun Rierdan, played by the
// labels a page offers, on the Pentrice city campaign with the Trial's verdict staged as read. Each act is a spec of
// its own; Act III has both its tragic path and a path on which everyone is saved.
export const city = 'test/fixtures/gosse/city.campaign.json';
export const p = (x: string) => ['party', 'hour', 'day', 'watch', 'clock', 'quantity'].includes(x) ? x : `pentrice__${x}`;
export const nod = 'Give Hepzibah the nod for the next scene';
export type Staged = { campaign: { world: { apply(c: unknown[]): unknown }; commitWorld(w: unknown): void } };
export class KP {
  constructor(readonly j: Journey) {}
  static async start(seed = 'kp') { return new KP(await Journey.start(city, seed)); }
  async play(...labels: string[]) { await this.j.play(...labels); return this; }
  assert(name: string, ...args: string[]) { this.j.assert(p(name), ...args.map(p)); return this; }
  set(name: string, ...rest: string[]) {
    const value = Number(rest.at(-1)), args = rest.slice(0, -1).map(p);
    const c = this.j as unknown as Staged;
    c.campaign.commitWorld(c.campaign.world.apply([
      { kind: 'set', call: ModuleWriter.call(p(name), ...args), value: ModuleWriter.number(value) }]));
    return this;
  }
  retract(name: string, ...args: string[]) {
    const c = this.j as unknown as Staged;
    c.campaign.commitWorld(c.campaign.world.apply([
      { kind: 'retract', call: ModuleWriter.call(p(name), ...args.map(p)) }]));
    return this;
  }
  get pages() { return this.j.taken.map(x => `[${x.label}] ${x.page} ${x.told}`).join('\n'); }
  put(who: string, place: string) { this.j.put(p(who), p(place)); return this; }
  holds(name: string, ...args: string[]) { return this.j.holds(p(name), ...args.map(p)); }
  knows(f: string) { return this.j.holds('knows', 'party', p(f)); }
  measure(name: string, ...args: string[]) { return this.j.measure(p(name), ...args.map(p)); }
  at(who: string) { return this.j.at(p(who)); }
  // The Trial over and the writ taken: the road to Dun Rierdan, and the city's gate.
  async toTheRoad() {
    this.assert('verdictRead', 'pentrice').set('tday', 'pentrice', '6').put('party', 'moon_yard');
    await this.play('Wait › An hour', 'Wait › An hour', "Take the King's writ");
    this.put('party', 'eastgate');
    await this.play('To the King\'s Road', 'To the River Gate');
    return this;
  }
}

// The natural route, played by labels with no teleport: the Trial's own fixture to the verdict, then the herald, the
// writ, the East Street, the Eastgate and the King's Road. `Trial` returns a KP standing in the Moon's loft with the
// verdict read; `toTheGate` walks it to Dun Rierdan.
export const steps = (name: string): string[] => {
  const ph = JSON.parse(readFileSync(`test/fixtures/gosse/${name}.json`, 'utf8')) as Record<string, string[]> | string[];
  return (Array.isArray(ph) ? ph : Object.values(ph).flat()).slice(0, -1);
};
export const reached = (k: KP) => k.j.campaign.world.related('reached').map(r => r.args[0]);
export async function fromTrial(fixture = 'bow', seed = 'g1') {
  const k = await KP.start(seed);
  await k.play(...steps(fixture));
  return k;
}
export async function toTheGate(k: KP) {
  await k.play('Wait › An hour', 'Out to the yard of the Painted Moon', "Take the King's writ", 'Out to the Westgate', 'To the Chepe',
    'To Guildhall Square', 'To the Minster Close', 'To the Eastgate', "To the King's Road");
  return k;
}
