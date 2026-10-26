import { readFileSync } from 'node:fs';
import { Journey } from '../../src/session/journey';

// The Third Night (doc/adventures/the-third-night): each journey plays by the labels a player sees, from the steps in
// test/fixtures/wrayford, and checks what the world did.
export const home = 'data/campaigns/the-third-night.campaign.json';
export const build = (name: string) => `test/fixtures/wrayford/${name}.campaign.json`;
const fixture = (name: string): Record<string, string[]> =>
  JSON.parse(readFileSync(`test/fixtures/wrayford/${name}.json`, 'utf8')) as Record<string, string[]>;
export const steps = (name: string, ...phases: string[]): string[] => {
  const f = fixture(name);
  return (phases.length ? phases : Object.keys(f)).flatMap(p => f[p]!);
};
const shared = new Set(['party', 'state', 'at', 'knows', 'travelsWith', 'following', 'asleep', 'captured', 'reached', 'kin']);
export const w = (id: string) => shared.has(id) ? id : `wrayford__${id}`;
export class Wrayford {
  static async start(campaign = home, seed = 'wray') { return new Wrayford(await Journey.start(campaign, seed)); }
  constructor(readonly j: Journey) {}
  async play(...labels: string[]) { await this.j.play(...labels); return this; }
  async fixture(name: string, ...phases: string[]) { return this.play(...steps(name, ...phases)); }
  holds(name: string, ...args: string[]) { return this.j.holds(w(name), ...args.map(w)); }
  knows(fact: string) { return this.j.holds('knows', 'party', w(fact)); }
  measure(name: string, ...args: string[]) { return this.j.measure(w(name), ...args.map(w)); }
  ending() { return this.j.campaign.world.related('reached').map(r => r.args[0]); }
  at(who: string) { return this.j.campaign.world.one('at', w(who)); }
  get page() { return this.j.taken.map(x => `[${x.label}] ${x.page} ${x.told}`).join('\n'); }
  get running() { return this.j.campaign.running; }
  experience() { return this.j.campaign.fighters.map(m => m.experience).reduce((a, b) => a + b, 0); }
  // Plays to the watch, or as far as the book goes: an ending closes it at the verdict.
  async until(watch: number) {
    try { await this.play(`=${watch}`); } catch (e) { if (this.running) { throw e; } }
    return this;
  }
}
