import { readFileSync } from 'node:fs';
import { Journey } from '../../src/session/journey';

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
  static async start(campaign = home, seed = 'lisk') { return new Pellam(await Journey.start(campaign, seed)); }
  constructor(readonly j: Journey) {}
  async play(...labels: string[]) { await this.j.play(...labels); return this; }
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
