import { Draw } from './land/draw';
import { Foundings } from './founding';
import { SettlementScenes } from './settlement-scenes';
import { Voice } from '../narrative/voice';
import type { Region, Settlement } from './region-writer';
import tables from '../../data/generation/scenes/traffic.json';

// The news of a place, as those who go about the country tell it: how life goes there, and the gossip of a place of
// its kind. A traveller on the road tells it of where they came from; someone whose work takes them round the roads
// (a tinker crying "news for nothing") tells it of a neighbouring place.
export class RegionNews {
  // The gossip is the teller's own, drawn for them, and while a country is written (see writing), none that anyone in
  // it has told already, of that place or another of its kind, while there are others: two travellers come from one
  // place told the same, word for word, and two places had the same rumour but for the name (NAR-04).
  // One who tells of a place again tells the same news of it.
  private static readonly told = new WeakMap<Region, Map<string, string>>();
  static writing<T>(region: Region, write: () => T): T {
    this.told.set(region, new Map());
    try { return write(); } finally { this.told.delete(region); }
  }
  static of(region: Region, s: Settlement, teller = ''): Record<string, string> {
    const i = region.settlements.indexOf(s), f = Foundings.of(region, i), told = this.told.get(region);
    const kind = (tables.gossip as Record<string, string[]>)[f.kind] ?? tables.gossip.farm, key = `${teller}:${s.id}`;
    const order = new Draw(`${s.id}:${teller}:gossip`).shuffle([...kind]), used = new Set(told?.values());
    const gossip = told?.get(key) ?? order.find(line => !used.has(line)) ?? order[0]!;
    told?.set(key, gossip);
    return { from: s.name, life: SettlementScenes.life(region, i) ?? '', gossip };
  }
  // What someone of the place has heard of a neighbour, in the travellers' words, but not as come from it that morning.
  static heard(region: Region, near: Settlement, who: { name: string; pronoun: string; key: string }): string {
    const told = tables.news.filter(t => !/this morning/.test(t)), words = this.of(region, near, who.key);
    const text = new Draw(`${who.key}:news`).pick(told).replace(/\{Name\}/g, who.name)
      .replace(/\{(from|life|gossip)\}/g, (m, k: string) => words[k] ?? m);
    return Voice.render(text, { pronoun: who.pronoun });
  }
}
