import { readFileSync } from 'node:fs';
import { Journey } from '../../src/session/journey';

// Fair Weather (doc/adventures/fair-weather): each journey plays by the labels a player sees, from the steps in
// test/fixtures/skeel, and checks what the world did. The company comes down the coast road at eight in the morning
// of the first day (watch 0); the Wreck Court sits at four on the third (watch 336).
export const home = 'data/campaigns/skeel.campaign.json';
const fixture = (name: string): Record<string, string[]> =>
  JSON.parse(readFileSync(`test/fixtures/skeel/${name}.json`, 'utf8')) as Record<string, string[]>;
export const steps = (name: string, ...phases: string[]): string[] => {
  const f = fixture(name);
  return (phases.length ? phases : Object.keys(f)).flatMap(p => f[p]!);
};
const shared = new Set(['party', 'state', 'at', 'knows', 'travelsWith', 'following', 'reached', 'tolerates', 'able', 'willing']);
export const k = (id: string) => shared.has(id) ? id : `skeel__${id}`;
export class Reach {
  static async start(campaign = home, seed = 'reach') { return new Reach(await Journey.start(campaign, seed)); }
  constructor(readonly j: Journey) {}
  async play(...labels: string[]) { await this.j.play(...labels); return this; }
  async fixture(name: string, ...phases: string[]) { return this.play(...steps(name, ...phases)); }
  holds(name: string, ...args: string[]) { return this.j.holds(k(name), ...args.map(k)); }
  knows(fact: string) { return this.j.holds('knows', 'party', k(fact)); }
  measure(name: string, ...args: string[]) { return this.j.measure(k(name), ...args.map(k)); }
  ending() { return this.j.campaign.world.related('reached').map(r => r.args[0]); }
  at(who: string) { return this.j.campaign.world.one('at', k(who)); }
  get page() { return this.j.taken.map(x => `[${x.label}] ${x.page} ${x.told}`).join('\n'); }
  get running() { return this.j.campaign.running; }
  // Plays to the watch, or as far as the book goes.
  async until(watch: number) {
    try { await this.play(`=${watch}`); } catch (e) { if (this.running) { throw e; } }
    return this;
  }
}
