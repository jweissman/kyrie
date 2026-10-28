import { readFileSync } from 'node:fs';
import { Journey } from '../../src/session/journey';

// A Winter in Carth (doc/adventures/a-winter-in-carth), played by the labels a player sees from the steps in
// test/fixtures/gaunt. The campaign starts at the Penitent's Cross at eight in the morning on watch 0, the Saturday
// before the Fast. Shrove Monday begins at six on watch 132; Fastens' Eve's licence runs from seven on the third
// evening (watch 330) to the Fast rung in at midnight (watch 360); the Consistory sits at noon on Ash Day (watch 456)
// and rises at two (468); the Gate of Ash is opened at dusk (480 to 492); the book closes at six (watch 492).
export const alone = 'data/campaigns/a-winter-in-carth.campaign.json';
export const build = (name: string) => `test/fixtures/gaunt/${name}.campaign.json`;
export const phases = (name: string): Record<string, string[]> => {
  const read = JSON.parse(readFileSync(`test/fixtures/gaunt/${name}.json`, 'utf8')) as Record<string, string[]> | string[];
  return Array.isArray(read) ? { all: read } : read;
};
export const steps = (name: string): string[] => Object.values(phases(name)).flat();
export const g = (id: string) => `gaunt__${id}`;
export class Gaunt {
  static async start(campaign = alone, seed = 'g1') { return new Gaunt(await Journey.start(campaign, seed)); }
  constructor(readonly j: Journey) {}
  async play(...labels: string[]) { await this.j.play(...labels); return this; }
  async fixture(name: string) { return this.play(...steps(name)); }
  // Waits on to the book's close, or to a watch, an hour at a time.
  async until(watch = 520) {
    while (!this.ending().length && this.j.watch() < watch && this.j.campaign.running) {
      const c = this.j.find('^Wait › An hour') ?? this.j.find('^Wait › A while');
      if (!c) { break; }
      await this.j.perform(c.command, c.label);
    }
    return this;
  }
  holds(name: string, ...args: string[]) { return this.j.holds(g(name), ...args.map(a => a === 'party' ? a : g(a))); }
  knows(fact: string) { return this.j.holds('knows', 'party', g(fact)); }
  measure(name: string, ...args: string[]) { return this.j.measure(g(name), ...args.map(a => a === 'party' ? a : g(a))); }
  state(thing: string, value: string) { return this.j.holds('state', g(thing), g(value)); }
  ending() { return this.j.campaign.world.related('reached').map(r => r.args[0]!.replace(/^gaunt__/, '')); }
  at(who: string) { return this.j.campaign.world.one('at', who === 'party' ? who : g(who))?.replace(/^gaunt__/, ''); }
  gold() { return this.j.measure('quantity', 'party', 'gold'); }
  get page() { return this.j.taken.map(x => `[${x.label}] ${x.page}`).join('\n'); }
}
