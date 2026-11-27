import { ReferenceSettlement } from './reference-settlement';
import { RegionFaith } from './region-faith';
import { RegionUndertown } from './region-undertown';
import { SettlementWriter } from './settlement-writer';
import tables from '../../data/origins/tables.json';
import type { OriginBound } from './origins';
import type { Region, Settlement } from './region-writer';

type Start = OriginBound['start'];
// What Origins lends the reference game's lives: how a settlement is come into (its start and the approach imported)
// and the words of its way in.
export interface Arrive {
  arriving(region: Region, s: Settlement): { start: Start; approach: [string, string] };
  approach(region: Region, s: Settlement): Record<string, string>;
}
// A life's reason, in the reference game's country, leads to the deep place under the old woods and nowhere else (the
// owner, 26 November: "we're being sent on random pointless fetchquests that don't have meaningful combat or
// resistance; … ideally in the starting area, I'd like the First Town and the Big Dungeon and not much else around at
// all"). Every life the first country offered had been sent away from it: a dead man's map and a lost sister to the
// nearest of the makers' works two hexes off, the brothers' errand to another, the debt to the old places the inn
// counted off, the sealed letter to the next town; and come over the hills, to an inn that had no work to tell of. Here
// each is the same story told of the stones in the old woods: what the map marks, where she went down, where the old
// writing is cut, what pays the debt. The way down is seen there, between the stones (RegionWoods). The sealed letter
// is a road to another town, and is not offered here; it is told as ever in a country whose first town is not this one.
// undefined: the country has no reference settlement (Origins binds as ever); null: the life is not begun here.
export class ReferenceOrigins {
  static bind(binder: string, region: Region, by: Arrive): OriginBound | null | undefined {
    const s = ReferenceSettlement.of(region);
    if (!s) { return undefined; }
    switch (binder) {
      case 'map': case 'lost': return this.delve(region, s, by, binder === 'lost');
      case 'order': return this.order(region, s, by);
      case 'debt': return this.debt(region, s, by);
      case 'wanderer': return this.wanderer(region, s, by);
      case 'courier': return null;
      default: return undefined;
    }
  }
  // The deep place under the woods: its stair (the room come down to between the fallen stones), the facts of its name
  // and of where it is, and the deer-path to the stones known, so that the aim is on the map as far as the stones.
  // at: where what the life looks for lies (the stones themselves, where the way down is found by searching, or the
  // stair below them); door: the way down between the stones known too (told by the shrine-keeper, who knows it).
  static down(s: Settlement, at: 'stones' | 'stair', door = false): Record<'delving' | 'named' | 'found', [string, string]> {
    const t = s.id, w = `${t}_ud`;
    return { delving: [`region.${at === 'stones' ? `${t}_wood_stones` : w}`, 'place'], named: [`region.${w}_named`, 'fact'],
      found: [`region.${t}_wood_${door ? 'door' : 'stones_known'}`, 'fact'] };
  }
  // Where it is, said after its name: not "the old dead under the old woods, out in the old woods above" a town.
  static where(region: Region, s: Settlement): string {
    return `${/woods/.test(RegionUndertown.called(region, s)) ? 'the' : 'the old'} woods above ${s.name}`;
  }
  private static delve(region: Region, s: Settlement, by: Arrive, lost: boolean): OriginBound {
    const { start, approach } = by.arriving(region, s);
    // The map marks the stones; her letter, the place she went down to.
    const work = lost ? RegionUndertown.called(region, s) : 'the fallen stones';
    return { values: { ...by.approach(region, s), work, where: this.where(region, s) }, start,
      imports: { approach, ...this.down(s, 'stones'), ...lost ? { keeper: [`region.${s.id}_innkeeper`, 'group'] as [string, string] } : {} } };
  }
  // The brothers want the makers' marks at the door under the stones copied, which the shrine-keeper shows the way to.
  private static order(region: Region, s: Settlement, by: Arrive): OriginBound {
    const makers = RegionUndertown.makers(region), holy = `${s.id}_shrine`;
    const cult = RegionFaith.cults(region)[region.settlements.indexOf(s)]!;
    return { values: { ...by.approach(region, s), work: RegionUndertown.called(region, s), cult: cult.name,
      where: this.where(region, s), priestly: SettlementWriter.called(region, s) }, start: { place: holy },
    imports: { shrine: [`region.${holy}`, 'place'], priest: [`region.${s.id}_priest`, 'group'], ...this.down(s, 'stair', true),
      history: [`region.history_${makers.art}`, 'fact'], fate: [`region.history_${makers.art}_fate`, 'fact'] } };
  }
  // The debt is paid from what lies with the old dead under the stones: asked about the old woods (the stones then
  // known), the aim is the deep place. No load to carry to another town, nor an old place two hexes off.
  private static debt(region: Region, s: Settlement, by: Arrive): OriginBound {
    const owing = 'owed(loan) > 0 and not called(party) and (spoke(party) or not at(party, shop)) and quantity(party, '
      + 'gold) < owed(loan) and not worthSelling(party) and knows(party, told)';
    const out = ['  Entity door: fact "The way down".',
      `  Objective owing_work when ${owing.replace(' and knows(party, told)', '')} and not knows(party, told)`
      + ' toward keeper "You owe {creditor} {owed(loan)} coin by market day. Whatever pays that comes out of the old woods:'
      + ' ask {keeper} at {inn} about them.".',
    // Between, the woods' own aims lead: to the shrine-keeper, who knows what is under the stones (RegionWoods).
    '  Place near "the old place" is room.',
    `  Objective owing_out when ${owing} and knows(party, door) toward near "You owe {creditor} {owed(loan)} coin by`
      + ' market day. Under the fallen stones in the old woods a stair goes down to the old dead: what lies with them would'
      + ' pay it.".'].join('\n');
    return { values: { ...by.approach(region, s), merchant: s.merchant, after: '', out: `${out}\n`,
      lost: (tables.lost as Record<string, string>)[s.trade] ?? 'a cartload of goods' },
    start: { place: `${s.id}_shop` }, imports: { shop: [`region.${s.id}_shop`, 'place'],
      inn: [`region.${s.id}_taproom`, 'place'], keeper: [`region.${s.id}_innkeeper`, 'group'],
      told: [`region.${s.id}_wood_stones_known`, 'fact'], near: [`region.${s.id}_ud`, 'place'],
      door: [`region.${s.id}_wood_door`, 'fact'],
      creditor: [`region.${s.id}_merchant`, 'group'] } };
  }
  // Come over the hills: the work is heard of at the house of the one who buys what the woods give: it is the woods.
  private static wanderer(region: Region, s: Settlement, by: Arrive): OriginBound {
    const { start, approach } = by.arriving(region, s), keeper = `${s.id}_innkeeper`;
    const incident = ['  Entity keeper: group "Whoever keeps the house". Entity stones: fact "Where the old stones are".',
      '  Objective work when not been(party, inn) toward inn "Go to {inn} and ask after work: there is work'
      + ' in {home} for someone who will do what others will not.".',
    '  Relation workTold(group).',
    '  Rule work_told when at(party, inn) and not knows(party, stones) and not workTold(party) says "‘Work?’ says {keeper}. ‘Nobody in {home}'
      + ' pays for work. What pays is what comes out of the old woods, and what lies under them. Ask me about the woods,'
      + ' if you’ve the boots for it.’" { Assert workTold(party). }',
    '  Objective work_woods when been(party, inn) and not knows(party, stones) toward inn "Ask {keeper} about the'
      + ' old woods: whatever pays in {home} comes out of them.".'].join('\n');
    return { values: { ...by.approach(region, s), incident }, start,
      imports: { approach, inn: [`region.${s.id}_taproom`, 'place'], keeper: [`region.${keeper}`, 'group'],
        stones: [`region.${s.id}_wood_stones_known`, 'fact'] } };
  }
}
