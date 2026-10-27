import { readFileSync } from 'node:fs';
import { Journey } from '../../src/session/journey';
import type { CreatureGenerationContext } from '../../src/content';

// The Liberty of the Ice (doc/adventures/liberty-of-the-ice): each journey plays by the labels a player sees, from the
// steps in test/fixtures/pellam, and checks what the world did. The company comes down the North Road at eight in the
// morning on watch 0. Pellam's days turn at dawn: the second day begins at watch 132, the third at 276; the Landing
// opens at watch 324 (two on the third day), the ice goes out at 378 (eleven that night), and the morning after, when
// the book closes, is watch 420.
export const home = 'data/campaigns/the-liberty-of-the-ice.campaign.json';
export const build = (name: string) => `test/fixtures/pellam/${name}.campaign.json`;
const fixture = (name: string): Record<string, string[]> =>
  JSON.parse(readFileSync(`test/fixtures/pellam/${name}.json`, 'utf8')) as Record<string, string[]>;
export const steps = (name: string, ...phases: string[]): string[] => {
  const f = fixture(name);
  return (phases.length ? phases : Object.keys(f)).flatMap(p => f[p]!);
};
const shared = new Set(['party', 'state', 'at', 'knows', 'travelsWith', 'following', 'asleep', 'reached', 'tolerates', 'able',
  'believes', 'conviction', 'quantity', 'gold', 'willing', 'acceptsEscort']);
export const p = (id: string) => shared.has(id) ? id : `pellam__${id}`;
export class Pellam {
  static async start(campaign = home, seed = 'lisk', party?: CreatureGenerationContext[]) {
    return new Pellam(await Journey.start(campaign, seed, party ? { party } : {}));
  }
  // One person, alone, of a calling and a background (the build journeys).
  static one(classId: string, backgroundId: string, raceId = 'human'): CreatureGenerationContext[] {
    return [{ name: 'Sam', raceId, classId, backgroundId } as CreatureGenerationContext];
  }
  constructor(readonly j: Journey) {}
  // Steps are the page's own labels, or go:room, which walks the shortest way there by the ways open now, one exit
  // at a time, each by the command the page offers for it: the city is forty rooms, and a journey says where it goes.
  async play(...labels: string[]) {
    for (const step of labels) {
      if (!step.startsWith('go:')) { await this.j.play(step); continue; }
      for (const hop of this.route(step.slice(3))) {
        if (!this.j.choices().some(c => c.command === hop.slice(1))) {
          throw new Error(`Cannot take ${hop} at watch ${this.watch} from ${this.at('party')} toward ${step}`);
        }
        await this.j.play(hop);
      }
    }
    return this;
  }
  route(to: string): string[] {
    const w = this.j.campaign.world, here = this.at('party')!, goal = p(to);
    const edges = new Map<string, [string, string][]>(), closed = new Set(w.related('unopened').map(r => r.args[0]));
    for (const r of w.related('connects')) {
      const [way, a, b] = r.args as [string, string, string];
      // A way the company can see and use: not one it does not know of, nor one that needs what it has not, nor one
      // shut against it (a barred door).
      const usable = w.test({ kind: 'call', name: 'equippedFor', args: ['party', way] })
        && w.test({ kind: 'call', name: 'visibleTo', args: [way, 'party'] })
        && !w.test({ kind: 'call', name: 'barredFor', args: [way, 'party'] });
      if (!closed.has(way) && usable) { edges.set(a, [...edges.get(a) ?? [], [way, b]]); }
    }
    const prev = new Map<string, [string, string]>([[here, ['', '']]]), queue = [here];
    while (queue.length) {
      const at = queue.shift()!;
      if (at === goal) { break; }
      for (const [way, b] of edges.get(at) ?? []) { if (!prev.has(b)) { prev.set(b, [at, way]); queue.push(b); } }
    }
    if (!prev.has(goal)) { throw new Error(`No way from ${here} to ${goal}`); }
    const hops: string[] = [];
    for (let at = goal; at !== here; at = prev.get(at)![0]) { hops.unshift(`@go(${prev.get(at)![1]},${at})`); }
    return hops;
  }
  async fixture(name: string, ...phases: string[]) { return this.play(...steps(name, ...phases)); }
  holds(name: string, ...args: string[]) { return this.j.holds(p(name), ...args.map(p)); }
  knows(fact: string) { return this.j.holds('knows', 'party', p(fact)); }
  measure(name: string, ...args: string[]) { return this.j.measure(p(name), ...args.map(p)); }
  gold() { return this.j.measure('quantity', 'party', 'gold'); }
  ending() { return this.j.campaign.world.related('reached').map(r => r.args[0]); }
  at(who: string) { return this.j.campaign.world.one('at', p(who)); }
  get page() { return this.j.taken.map(x => `[${x.label}] ${x.page} ${x.told}`).join('\n'); }
  get running() { return this.j.campaign.running; }
  get watch() { return this.j.measure('watch', 'clock'); }
  experience() { return this.j.campaign.fighters.map(m => m.experience).reduce((a, b) => a + b, 0); }
  // Plays to the watch, or as far as the book goes: an ending closes it on the morning after the ice goes out.
  async until(watch: number) {
    try { await this.play(`=${watch}`); } catch (e) { if (this.running) { throw e; } }
    return this;
  }
}
