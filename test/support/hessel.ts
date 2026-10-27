import { readFileSync } from 'node:fs';
import { Journey } from '../../src/session/journey';

// The Banns at Hessel (doc/adventures/banns-at-hessel), played by the labels a player sees from the steps in
// test/fixtures/hessel. The campaign starts on the south road at eight in the morning on watch 0, the first day of
// the Season's last four; the third reading of the banns is at eleven on the third day (watch 306); the Closing Ball
// is the fourth night from seven (watch 498); the Season ends at noon on the fifth day (watch 600).
export const alone = 'data/campaigns/hessel.campaign.json';
export const build = (name: string) => `test/fixtures/hessel/${name}.campaign.json`;
export const steps = (name: string): string[] => {
  const phases = JSON.parse(readFileSync(`test/fixtures/hessel/${name}.json`, 'utf8')) as Record<string, string[]> | string[];
  return Array.isArray(phases) ? phases : Object.values(phases).flat();
};
export const h = (id: string) => `hessel__${id}`;
export class Hessel {
  static async start(campaign = alone, seed = 'h1') { return new Hessel(await Journey.start(campaign, seed)); }
  constructor(readonly j: Journey) {}
  async play(...labels: string[]) { await this.j.play(...labels); return this; }
  async fixture(name: string) { return this.play(...steps(name)); }
  // Waits on to the Season's end, or to a watch, an hour at a time: the book closes at noon on the fifth day.
  async until(watch = 700) {
    while (!this.ending().length && this.j.watch() < watch) {
      const c = this.j.find('^Wait › An hour') ?? this.j.find('^Wait › A while');
      if (!c) { break; }
      await this.j.perform(c.command, c.label);
    }
    return this;
  }
  holds(name: string, ...args: string[]) { return this.j.holds(h(name), ...args.map(a => a === 'party' ? a : h(a))); }
  knows(fact: string) { return this.j.holds('knows', 'party', h(fact)); }
  measure(name: string, ...args: string[]) { return this.j.measure(h(name), ...args.map(h)); }
  state(thing: string, value: string) { return this.j.holds('state', h(thing), h(value)); }
  ending() { return this.j.campaign.world.related('reached').map(r => r.args[0]!.replace(/^hessel__/, '')); }
  at(who: string) { return this.j.campaign.world.one('at', h(who))?.replace(/^hessel__/, ''); }
  gold() { return this.j.measure('quantity', 'party', 'gold'); }
  get page() { return this.j.taken.map(x => `[${x.label}] ${x.page}`).join('\n'); }
}
