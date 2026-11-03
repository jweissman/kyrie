import { readFileSync } from 'node:fs';
import { Journey } from '../../src/session/journey';
import type { CreatureGenerationContext } from '../../src/content';

// The Grand Tour (doc/adventures/the-grand-tour): Sennet in three storeys, seven days, played by the labels a player
// sees from the steps in test/fixtures/sennet. Steps are the page's own labels, or >sennet__room, which walks the
// fewest ways there by the ways open now. The company comes down the coast road at eight on the first morning
// (watch 0); each day begins at watch (day - 1) * 144 from eight, so the Night of Lanterns (the fourth night, from
// seven) opens at watch 456, and the book closes at nine on the morning after the Door of Doors is opened or
// Cloudgate comes down, or on the eighth morning (watch 1009).
export const home = 'data/campaigns/the-grand-tour.campaign.json';
const fixture = (name: string): Record<string, string[]> =>
  JSON.parse(readFileSync(`test/fixtures/sennet/${name}.json`, 'utf8')) as Record<string, string[]>;
export const steps = (name: string, ...phases: string[]): string[] => {
  const f = fixture(name);
  return (phases.length ? phases : Object.keys(f)).flatMap(p => f[p]!);
};
const shared = new Set(['party', 'state', 'at', 'knows', 'travelsWith', 'following', 'asleep', 'reached', 'tolerates', 'able',
  'believes', 'conviction', 'quantity', 'gold', 'willing', 'carries', 'heardOf', 'promiseKept', 'promiseBroken', 'dead']);
export const s = (id: string) => shared.has(id) ? id : `sennet__${id}`;
export class Sennet {
  static async start(campaign = home, seed = 'sennet', party?: CreatureGenerationContext[]) {
    return new Sennet(await Journey.start(campaign, seed, party ? { party } : {}));
  }
  // One person, alone, of a calling and a background (the build journeys).
  static one(classId: string, backgroundId: string, raceId = 'human', name = 'Sam'): CreatureGenerationContext[] {
    return [{ name, raceId, classId, backgroundId } as CreatureGenerationContext];
  }
  constructor(readonly j: Journey) {}
  async play(...labels: string[]) { await this.j.play(...labels); return this; }
  async fixture(name: string, ...phases: string[]) { return this.play(...steps(name, ...phases)); }
  holds(name: string, ...args: string[]) { return this.j.holds(s(name), ...args.map(s)); }
  knows(fact: string) { return this.j.holds('knows', 'party', s(fact)); }
  measure(name: string, ...args: string[]) { return this.j.measure(s(name), ...args.map(s)); }
  carries(item: string) { return this.j.holds('carries', 'party', s(item)); }
  gold() { return this.j.measure('quantity', 'party', 'gold'); }
  ending() { return this.j.campaign.world.related('reached').map(r => r.args[0]); }
  at(who: string) { return this.j.campaign.world.one('at', s(who)); }
  get page() { return this.j.taken.map(x => `[${x.label}] ${x.page}`).join('\n'); }
  get running() { return this.j.campaign.running; }
  get watch() { return this.j.measure('watch', 'clock'); }
  // Plays to the watch, or as far as the book goes.
  async until(watch: number) {
    try { await this.j.play(`=${watch}`); } catch (e) { if (this.running) { throw e; } }
    return this;
  }
}
