import type { Journey } from '../../src/session/journey';
import { Kept } from './kept';
import type { CreatureGenerationContext } from '../../src/content';

// The Book of Faces (doc/adventures/the-book-of-faces): Ombra, nine days to the Drawing, played by the labels a player
// sees. The company comes to the end of the delta road at eight on the first morning (watch 0); day n begins at watch
// (n - 1) * 144 from eight. Dusk's Bare Hours begin at eight in the evening (watch 72 of the day).
export const home = 'data/campaigns/the-book-of-faces.campaign.json';
const shared = new Set(['party', 'state', 'at', 'knows', 'travelsWith', 'following', 'asleep', 'reached', 'tolerates', 'able',
  'believes', 'conviction', 'quantity', 'gold', 'willing', 'carries', 'heardOf', 'promiseKept', 'promiseBroken', 'dead']);
export const o = (id: string) => shared.has(id) ? id : `ombra__${id}`;
export class Ombra {
  // Journeys begun alike are played alike once (see Kept): the walk to the Row and the days' waiting.
  static async start(campaign = home, seed = 'ombra', party?: CreatureGenerationContext[]) {
    return new Ombra(await Kept.start(campaign, seed, party ? { party } : {}));
  }
  // One person, alone, of a calling and a background (the build journeys).
  static one(classId: string, backgroundId?: string, raceId = 'human', name = 'Sam'): CreatureGenerationContext[] {
    return [{ name, raceId, classId, ...(backgroundId ? { backgroundId } : {}) } as CreatureGenerationContext];
  }
  constructor(private readonly kept: Kept) {}
  get j(): Journey { return this.kept.journey; }
  async play(...labels: string[]) { await this.kept.play(...labels); return this; }
  holds(name: string, ...args: string[]) { return this.j.holds(o(name), ...args.map(o)); }
  knows(fact: string) { return this.j.holds('knows', 'party', o(fact)); }
  measure(name: string, ...args: string[]) { return this.j.measure(o(name), ...args.map(o)); }
  carries(item: string) { return this.j.holds('carries', 'party', o(item)); }
  gold() { return this.j.measure('quantity', 'party', 'gold'); }
  ending() { return this.j.campaign.world.related('reached').map(r => r.args[0]); }
  at(who: string) { return this.j.campaign.world.one('at', o(who)); }
  get page() { return this.j.taken.map(x => `[${x.label}] ${x.page}`).join('\n'); }
  get running() { return this.j.campaign.running; }
  get watch() { return this.j.measure('watch', 'clock'); }
  // Plays to the watch, or as far as the book goes.
  async until(watch: number) {
    try { await this.kept.play(`=${watch}`); } catch (e) { if (this.running) { throw e; } }
    return this;
  }
}
