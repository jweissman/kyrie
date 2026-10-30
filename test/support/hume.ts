import { readFileSync } from 'node:fs';
import { Journey } from '../../src/session/journey';

// Half the Hive (doc/adventures/half-the-hive), played by the labels a player sees from the steps in
// test/fixtures/half-the-hive. The campaign starts at the drove road at eight in the morning on watch 0; the Calling
// is at six on the second evening (watch 138); Squire Corve uncorks his flask at dawn on the fourth day (watch 286);
// the Mother goes, at the latest, between ten and one that day; the book closes at eight on the evening of the
// second day after she goes.
export const alone = 'data/campaigns/half-the-hive.campaign.json';
export const build = (name: string) => `test/fixtures/half-the-hive/${name}.campaign.json`;
export const steps = (...names: string[]): string[] => names.flatMap(name => {
  const read = JSON.parse(readFileSync(`test/fixtures/half-the-hive/${name}.json`, 'utf8')) as Record<string, string[]> | string[];
  return Array.isArray(read) ? read : Object.values(read).flat();
});
export const h = (id: string) => `hume__${id}`;
export class Hume {
  static async start(campaign = alone, seed = 's') { return new Hume(await Journey.start(campaign, seed)); }
  constructor(readonly j: Journey) {}
  async play(...labels: string[]) { await this.j.play(...labels); return this; }
  async fixture(...names: string[]) { return this.play(...steps(...names)); }
  // Waits on to the book's close, or to a watch, an hour at a time.
  async until(watch = 900) {
    while (!this.ending().length && this.j.watch() < watch && this.j.campaign.running) {
      const c = this.j.find('^Wait › An hour') ?? this.j.find('^Wait › A while');
      if (!c) { break; }
      await this.j.perform(c.command, c.label);
    }
    return this;
  }
  holds(name: string, ...args: string[]) { return this.j.holds(h(name), ...args.map(a => a === 'party' ? a : h(a))); }
  knows(fact: string) { return this.j.holds('knows', 'party', h(fact)); }
  measure(name: string, ...args: string[]) { return this.j.measure(h(name), ...args.map(a => a === 'party' ? a : h(a))); }
  state(thing: string, value: string) { return this.j.holds('state', h(thing), h(value)); }
  ending() { return this.j.campaign.world.related('reached').map(r => r.args[0]!.replace(/^hume__/, '')); }
  at(who: string) { return this.j.campaign.world.one('at', who === 'party' ? who : h(who))?.replace(/^hume__/, ''); }
  gold() { return this.j.measure('quantity', 'party', 'gold'); }
  get page() { return this.j.taken.map(x => `[${x.label}] ${x.page}`).join('\n'); }
}
