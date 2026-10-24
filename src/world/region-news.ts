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
  static of(region: Region, s: Settlement): Record<string, string> {
    const i = region.settlements.indexOf(s), f = Foundings.of(region, i);
    const gossip = (tables.gossip as Record<string, string[]>)[f.kind] ?? tables.gossip.farm;
    return { from: s.name, life: SettlementScenes.life(region, i) ?? '', gossip: new Draw(`${s.id}:gossip`).pick(gossip) };
  }
  // What someone of the place has heard of a neighbour, in the travellers' words, but not as come from it that morning.
  static heard(region: Region, near: Settlement, who: { name: string; pronoun: string; key: string }): string {
    const told = tables.news.filter(t => !/this morning/.test(t)), words = this.of(region, near);
    const text = new Draw(`${who.key}:news`).pick(told).replace(/\{Name\}/g, who.name)
      .replace(/\{(from|life|gossip)\}/g, (m, k: string) => words[k] ?? m);
    return Voice.render(text, { pronoun: who.pronoun });
  }
}
