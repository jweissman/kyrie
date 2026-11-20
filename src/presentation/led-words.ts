import type { Campaign } from '../campaign/campaign';
import type { Promoted } from './glance-types';
import { PlayerView } from './player-view';

// The whole words of what each act is led for, as the world names the choice ("Ask Ebba for a lesson", where her
// talk's row says "Ask for a lesson"): the engine's to say, so that every client calls a talk led for it by what it
// does (TB-01, Doable.called), not the runner by the world's names and the page by its own (MT-18).
export class LedWords {
  static with(campaign: Campaign, acts: Promoted[]): Promoted[] {
    if (!acts.some(a => a.for || a.inside?.length)) { return acts; }
    const names = new Map(PlayerView.choices(campaign).map(r => [r.choice.id, r.choice.name]));
    return acts.map(a => {
      const led = [a.for, ...(a.inside ?? []).map(i => i.command)].filter((c): c is string => !!c && names.has(c));
      return led.length ? { ...a, words: Object.fromEntries(led.map(c => [c, names.get(c)!])) } : a;
    });
  }
}
