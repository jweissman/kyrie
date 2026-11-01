import { Journey } from '../../src/session/journey';

// Behind the Wainscot (doc/adventures/behind-the-wainscot), played by the labels a player sees from the steps in
// test/fixtures/hollins. The company comes down the moor road into Bootscrape at eight on the first morning (watch 0).
export const home = 'data/campaigns/hollins.campaign.json';
export const k = (id: string) => `hollins__${id}`;

export class Hollins {
  private constructor(readonly j: Journey) {}
  static async start(campaign = home, seed = 'h1'): Promise<Hollins> { return new Hollins(await Journey.start(campaign, seed)); }
  // Every phase of a fixture, in the order written (or only those named).
  async fixture(name: string, ...only: string[]) {
    const file = await Bun.file(`test/fixtures/hollins/${name}.json`).json() as Record<string, string[]>;
    for (const [phase, steps] of Object.entries(file)) {
      if (only.length && !only.includes(phase)) { continue; }
      await this.j.play(...steps);
    }
  }
  async play(...steps: string[]) { return this.j.play(...steps); }
  holds(name: string, ...args: string[]): boolean {
    return this.j.campaign.world.test({ kind: 'call', name: k(name), args: args.map(a => a === 'party' ? a : k(a)) });
  }
  state(thing: string, s: string): boolean {
    return this.j.campaign.world.test({ kind: 'call', name: 'state', args: [k(thing), k(s)] });
  }
  raw(name: string, ...args: string[]): boolean {
    return this.j.campaign.world.test({ kind: 'call', name, args: args.map(a => a === 'party' ? a : k(a)) });
  }
  knows(fact: string): boolean { return this.j.campaign.world.test({ kind: 'call', name: 'knows', args: ['party', k(fact)] }); }
  at(who: string): string | undefined { return this.j.campaign.world.one('at', who === 'party' ? who : k(who)); }
  measure(name: string, ...args: string[]): number { return this.j.measure(k(name), ...args.map(a => a === 'party' ? a : k(a))); }
  ending(): string[] { return this.j.campaign.world.related('reached').map(r => r.args[0]!); }
  offered(pattern: string): boolean { return this.j.matches(pattern).length > 0; }
  get gold(): number { return this.j.measure('quantity', 'party', 'gold'); }
  get page(): string { return this.j.page; }
}
