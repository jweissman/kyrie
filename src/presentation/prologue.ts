import type { Campaign } from '../campaign/campaign';
import type { Screen } from '../ui/screen-types';
import { FictionalTime } from '../campaign/fictional-time';
import { Typography } from './typography';

// What an opening told before the first place, by id: the place's telling then leaves it out (see Narrator.leaf).
export interface Opening { apart: ReadonlySet<string> }
// The opening as the page tells it: the chapter, and its beats in order.
export interface Told { title: string; beats: string[] }

// A new game's opening, as a page tells it apart before the first place (the owner's OWN-17): the chapter the
// company's origin names, and a beat or two in the origin's own words for the first moment. First why the company
// came (the letter, the errand, what is owed); then the arrival, naming the town: the way in coming out of the trees,
// or for one who begins under a roof, the walk in to the shop or the shrine. Nothing is written for it: these are the
// lines the origin tells as the game opens. The place under it tells neither again (it had opened on the second beat
// word for word, shortened: the critique of the first opening), but what is there as the company comes: the life of
// the town on the way in, a trouble met there, the creditor at the counter. A campaign whose origin says nothing as it
// opens (an authored one) has no opening.
export class Prologue {
  static readonly arrival = 'origin__arrival';
  static of(campaign: Campaign, screen: Screen, title: string): { told: Told; opening: Opening } | undefined {
    const seen = new Map(screen.observed.map(o => [o.id, o.text]));
    // Why: the first of the origin's features where it begins, but the arrival (one over the hills may see the town's
    // trouble after it, which is the place's, happening as the company comes in).
    const why = (campaign.module.observations ?? []).find(o => o.id.startsWith('origin__') && o.id !== this.arrival
      && o.aspect === 'feature' && o.anchor !== 'near' && seen.has(o.id));
    if (!why) { return undefined; }
    const way = seen.get(this.arrival), beats = [seen.get(why.id)!, ...way ? [way] : []]
      .map(t => Typography.curl(FictionalTime.prose(t)));
    return { told: { title, beats }, opening: { apart: new Set([why.id, ...way ? [this.arrival] : []]) } };
  }
  // The opening as the story keeps it, before anything done: under the chapter, its beats (the herb-wife's errand had
  // been told in the opening and then nowhere, the Story saying "Nothing has happened yet"). It stands apart from the
  // place it was told at, which the story heads by its own name when something is done there.
  static entry(told: Told, screen: Screen) {
    return { id: 0, at: screen.clock, elapsed: screen.elapsed, place: `${screen.place.id}${this.mark}`,
      placeName: told.title, lines: told.beats, notes: [], tone: 'note' as const, title: told.title };
  }
  // Whether a story's entry is its opening, and nothing done.
  static kept(entry: { place: string }): boolean { return entry.place.endsWith(this.mark); }
  private static readonly mark = '#opening';
}
