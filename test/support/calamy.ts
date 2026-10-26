import { Journey } from '../../src/session/journey';
import type { BundleSource } from '../../src/campaign/bundle-source';
import type { CreatureGenerationContext } from '../../src/content';

// A Parliament of Books, played by the labels a player sees (doc/adventures/parliament-of-books). Steps are the page's
// own labels, or `go:room`, which walks the shortest way there through the passages as they stand, one exit at a time,
// by the command each exit offers: the city has eighty rooms, and a journey says where it goes, not every turning.
export const campaign = 'data/campaigns/parliament-of-books.campaign.json';
export const C = (id: string) => `calamy__${id}`;
export class Calamy {
  static start(seed = 'calamy', party?: CreatureGenerationContext[], source?: BundleSource) {
    return Journey.start(campaign, seed, { ...party ? { party } : {}, ...source ? { source } : {} });
  }
  static knows(j: Journey, fact: string) { return j.holds('knows', 'party', C(fact)); }
  static holds(j: Journey, rel: string, ...args: string[]) { return j.holds(C(rel), ...args.map(C)); }
  static said(j: Journey, from = 0) { return j.taken.slice(from).map(t => t.page).join(' '); }
  // The way from where the company stands to a room, by passages it can see and use now.
  static route(j: Journey, to: string): string[] {
    const w = j.campaign.world, here = j.at('party')!, goal = C(to);
    const edges = new Map<string, [string, string][]>();
    for (const r of w.related('connects')) {
      const [p, a, b] = r.args as [string, string, string];
      edges.set(a, [...edges.get(a) ?? [], [p, b]]);
    }
    const prev = new Map<string, [string, string]>([[here, ['', '']]]), queue = [here];
    while (queue.length) {
      const at = queue.shift()!;
      if (at === goal) { break; }
      for (const [p, b] of edges.get(at) ?? []) { if (!prev.has(b)) { prev.set(b, [at, p]); queue.push(b); } }
    }
    if (!prev.has(goal)) { throw new Error(`No way from ${here} to ${goal}`); }
    const hops: string[] = [];
    for (let at = goal; at !== here; at = prev.get(at)![0]) { hops.unshift(`@go(${prev.get(at)![1]},${at})`); }
    return hops;
  }
  // Plays steps, expanding each go:room as it is reached (the way is reckoned from where the company then stands).
  static async play(j: Journey, ...steps: string[]): Promise<string> {
    let told = '';
    for (const step of steps) {
      if (step.startsWith('go:')) {
        for (const hop of this.route(j, step.slice(3))) {
          if (!j.choices().some(c => c.command === hop.slice(1))) {
            throw new Error(`Cannot take ${hop} at watch ${j.watch()} from ${j.at('party')} toward ${step}`);
          }
          told += await j.play(hop);
        }
      } else { told += await j.play(step); }
    }
    return told;
  }
}
