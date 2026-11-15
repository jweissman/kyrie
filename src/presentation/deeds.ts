import type { Campaign } from '../campaign/campaign';
import type { CampaignEvent } from '../campaign/campaign-types';
import { SeenThrough } from '../ui/seen-through';
import type { Screen } from '../ui/screen-types';
import type { PlayerSnapshot } from './player-view';

// Deeds (the owner, 15 November: achievements): what the world already records of the company, said as things done,
// once each, and no more: no reward, no counter shown but what the deed names. Read from the log as it grows (as
// VisitedPlaces is), never rescanned, so that the screen built at every step pays nothing for them.
export interface Deed { id: string; title: string; text: string }
export interface Doings { won: number; camps: number; visited: number; done: number; party: number; coin: number }
interface Rule extends Deed { of: keyof Doings; atLeast: number }

export class Deeds {
  private static readonly read = new WeakMap<readonly CampaignEvent[],
    { at: number; last?: CampaignEvent; won: number; camps: number }>();
  static readonly table: Rule[] = [
    { id: 'first_blood', title: 'First blood', text: 'You have won a fight.', of: 'won', atLeast: 1 },
    { id: 'blooded', title: 'Blooded', text: 'You have won five fights.', of: 'won', atLeast: 5 },
    { id: 'afield', title: 'Afield', text: 'You have been to eight places.', of: 'visited', atLeast: 8 },
    { id: 'seen_through', title: 'Seen through', text: 'You have seen an undertaking through.', of: 'done', atLeast: 1 },
    { id: 'open_sky', title: 'Under the open sky', text: 'You have made camp and slept out.', of: 'camps', atLeast: 1 },
    { id: 'fellowship', title: 'Fellowship', text: 'Three of you go together.', of: 'party', atLeast: 3 },
    { id: 'well_found', title: 'Well found', text: 'You hold a hundred coin.', of: 'coin', atLeast: 100 }];
  // What has been seen through, and the deeds, as the screen carries them.
  static seen(campaign: Campaign, view: PlayerSnapshot): Pick<Screen, 'done' | 'deeds'> {
    const done = SeenThrough.of(campaign), { won, camps } = this.counts(campaign);
    const coin = view.resources?.find(r => r.id === 'gold')?.amount ?? 0;
    return { done, deeds: this.earned({ won, camps, done: done.length, coin,
      visited: view.map.places.filter(p => p.visited).length, party: campaign.readout.partyIds.length }) };
  }
  static earned(doings: Doings): Deed[] {
    return this.table.filter(r => doings[r.of] >= r.atLeast).map(({ id, title, text }) => ({ id, title, text }));
  }
  // What the log says: fights won (a combat that ended for the company's side) and camps made, counted from where
  // the last reading stopped.
  static counts(campaign: Campaign): { won: number; camps: number } {
    const log = campaign.history;
    let t = this.read.get(log);
    if (!t || log.length < t.at || (t.at > 0 && log[t.at - 1] !== t.last)) {
      t = { at: 0, won: 0, camps: 0 };
      this.read.set(log, t);
    }
    for (; t.at < log.length; t.at++) {
      const e = log[t.at]!;
      if (e.combat.some(x => x.type === 'end' && 'outcome' in x && x.outcome === 'fighters')) { t.won++; }
      if (/^camp\b/.test(e.action)) { t.camps++; }
    }
    t.last = log[t.at - 1];
    return { won: t.won, camps: t.camps };
  }
}
