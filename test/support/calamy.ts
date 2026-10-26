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
  static holds(j: Journey, rel: string, ...args: string[]) { return j.holds(C(rel), ...args.map(a => a === 'party' ? a : C(a))); }
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

// The steps of the journeys (test/parliament-of-books*.test.ts), as a player takes them.
export const Steps = {
  // The first hour: the causeway, the quay, the Lamb and its almanack, and a copy bought on the bridge.
  arrive: ['go:taproom', 'Talk to the Almanack', 'what it is', 'how it came', 'kitchens of the Hithe', 'Take your leave',
    'Talk to Moll', 'about the Kindling', 'Take your leave', 'go:bridge_north', 'Buy.*penny almanack'],
  // Two pieces of the Colophon found in the city: the skipping rhyme, and the Ninth Plea read by the clerk.
  pieces: ['go:bridge_middle', 'Talk to the children', 'what they are singing', 'Take your leave', 'go:court_hall', 'Pay Abel Snow'],
  // Old Hennet's letter, read to her: the codex opens, and the Archivist will teach.
  hennet: ['go:rag_market', 'Talk to Old Hennet', 'rag trade', 'read Old Hennet', 'Take your leave'],
  quarles: ['go:quarles_room', 'Talk to Ottoline', 'Tell the Archivist what you have found', 'teach you the Inward', 'any word for anyone',
    'Take your leave'],
  // The Chained Room's key, by the Provost's cheese.
  key: ['go:buttery', 'Talk to Mistress Bunce', 'cheese', 'Take your leave', 'Talk to the Almanack', 'who takes the cheese',
    'Take your leave', 'go:provost_room', 'Talk to Provost', 'where Mistress Bunce', 'Take your leave'],
  // Calam-ink: reed-heart cut at the evening's dead low water, and Widow Gallon's pot.
  ink: ['go:gallon_shop', 'Talk to Widow Gallon', 'Calam-ink', 'Take your leave', 'go:mudbank', '=48', 'go:reed_edge', '=60',
    'go:reed_heart', 'reed-heart: Take', 'calamus root: Take', 'go:gallon_shop', 'Give an armful', 'Calam-ink: Take'],
  // The reading inward.
  read: ['go:chained_room', 'Open the Ambery Codex', 'Write your own entry', 'Read the Catalogue aloud', 'shelfmark: Take'],
  // Corvell's empty library, the lamplighter, and the truth told: Crake's trust, and his ribbon.
  corvell: ['go:old_gate', 'Talk to Wat', 'will not light', 'Take your leave', 'go:corvell_hall', 'Talk to Sir Gideon', 'what has happened',
    'why he suspects', 'Take your leave', 'go:corvell_library', 'empty shelves: Examine', 'Search here'],
  crakeTrust: ['go:corvell_hall', 'Talk to Sir Gideon', 'left of their own accord', 'Take your leave', 'go:crake_front',
    'Talk to Absalom', 'Tell Absalom Crake you told', 'take you where the books go', 'Take your leave', 'Ask Absalom Crake to join',
    'go:crake_parlour', 'ribbon: Take', 'go:remainder_market'],
  // The night sluice, and the wedding.
  sluice: ['go:brannock_floor', 'Talk to Old Brannock', 'what the Widow Teague', 'Take your leave', 'go:teague_floor', 'Talk to the Widow',
    'what Old Brannock', 'Take your leave', 'go:millrace', '=102', 'Talk to Coddy', 'why he shuts', 'one hour at slack', 'Take your leave',
    'go:brannock_floor', 'Talk to Old Brannock', 'never the Widow', 'Take your leave', 'go:teague_floor', 'Talk to the Widow',
    'never Old Brannock', 'Take your leave'],
};
