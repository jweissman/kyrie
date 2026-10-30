import { Journey } from '../../src/session/journey';

// The Lull (doc/adventures/the-lull), played by the labels a player sees from the steps in test/fixtures/the-lull.
export const home = 'data/campaigns/the-lull.campaign.json';
export const k = (id: string) => `lull__${id}`;

export class Lull {
  private constructor(readonly j: Journey) {}
  static async start(campaign = home, seed = 'lull'): Promise<Lull> { return new Lull(await Journey.start(campaign, seed)); }
  // Every phase of a fixture, in the order written.
  async fixture(name: string, ...only: string[]) {
    const file = await Bun.file(`test/fixtures/the-lull/${name}.json`).json() as Record<string, string[]>;
    for (const [phase, steps] of Object.entries(file)) {
      if (only.length && !only.includes(phase)) { continue; }
      await this.j.play(...steps);
    }
  }
  async play(...steps: string[]) { return this.j.play(...steps); }
  holds(name: string, ...args: string[]): boolean {
    return this.j.campaign.world.test({ kind: 'call', name: k(name), args: args.map(a => a === 'party' ? a : k(a)) });
  }
  knows(fact: string): boolean { return this.j.campaign.world.test({ kind: 'call', name: 'knows', args: ['party', k(fact)] }); }
  at(who: string): string | undefined { return this.j.campaign.world.one('at', who === 'party' ? who : k(who)); }
  measure(name: string, ...args: string[]): number { return this.j.measure(k(name), ...args.map(a => a === 'party' ? a : k(a))); }
  ending(): string[] { return this.j.campaign.world.related('reached').map(r => r.args[0]!); }
  carries(item: string): boolean {
    return this.j.campaign.world.test({ kind: 'call', name: 'carries', args: ['party', k(item)] });
  }
  get gold(): number { return this.j.measure('quantity', 'party', 'gold'); }
  get page(): string { return this.j.page; }
}
