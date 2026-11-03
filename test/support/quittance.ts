import { Journey } from '../../src/session/journey';

// Quittance, played by the labels a player sees (doc/adventures/quittance). Every id a module declares is prefixed
// quittance__ in the world; Q('d_bell_rule') is the world's name for it.
export const campaign = 'data/campaigns/quittance.campaign.json';
export const Q = (id: string) => `quittance__${id}`;
export class City {
  static start(seed = 'quittance', party?: Parameters<typeof Journey.start>[2]) { return Journey.start(campaign, seed, party); }
  static knows(j: Journey, fact: string) { return j.holds('knows', 'party', Q(fact)); }
  static state(j: Journey, thing: string, state: string) { return j.holds('state', Q(thing), Q(state)); }
  static has(j: Journey, relation: string, ...args: string[]) { return j.holds(Q(relation), ...args.map(a => a === 'party' ? a : Q(a))); }
  static regard(j: Journey, who: string) { return j.measure(Q('regard'), Q(who)); }
  static arc(j: Journey, who: string) { return j.measure(Q('arc'), Q(who)); }
  static gold(j: Journey) { return j.measure('quantity', 'party', 'gold'); }
  static said(j: Journey, from = 0) { return j.taken.slice(from).map(t => t.told).join(' '); }
  static page(j: Journey) { return j.taken.at(-1)?.page ?? ''; }
  static pages(j: Journey, from = 0) { return j.taken.slice(from).map(t => t.page).join(' '); }
  // The honest way in: the Declarations Hall, the truthful declaration, out through the Arch to Gate Plaza.
  static readonly honest = ['^To the Declarations Hall', 'Declare yourselves truthfully', '^Out to Gate Plaza'];
  // Straight to the Bell & Slip with a licence, for adventures that begin there.
  static readonly slip = [...City.honest, '^To the Brokers', '^To Policy Row', "^Into the Bell & Slip", '?Take out an adjuster'];
}
