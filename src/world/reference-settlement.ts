import { SettlementWriter } from './settlement-writer';
import { SettlementScenes } from './settlement-scenes';
import { RegionFaith } from './region-faith';
import { RegionRecruits } from './region-recruits';
import { RegionShops } from './region-shops';
import { Herbals } from './herbals';
import { Foundings } from './founding';
import { TownMatters } from './town-matters';
import { RegionGeography } from './region-geography';
import { RegionRoads } from './region-roads';
import { RegionZones } from './region-zones';
import { Atlases } from './land/atlas';
import { StrategicAtlas } from './strategic-atlas';
import { Communities } from './community/community';
import type { Region, Settlement } from './region-writer';

// The reference game's settlement (the owner, 25 November: doc/design/direction-2026-11-25-reference-game.md §2;
// register OR-611): the first town of the first country, made almost absurdly small. It works three ways and has
// nothing else: one trader for provisions and equipment, who buys what is brought back; one for what the country itself
// gives, who buys what is gathered and hunted, hears everything, and has someone at the fire who would come along; and
// a shrine to rest, recover and reflect at. No decorative businesses, no large roster of people to talk to, no list of
// errands: the old woods are beside it (see RegionWoods), and what lies under the woods is found there.
//
// One terrain done thoroughly first (§6: "implement one terrain thoroughly, with contracts that let a second be tried
// cheaply"): the forest, the terrain the first country draws most often. A second terrain is one more entry here.
export class ReferenceSettlement {
  static readonly terrains = new Set(['forest']);
  // Whether a settlement is the reference game's: the first town of the first country of a world, of a terrain done.
  static is(region: Region, s: Settlement): boolean {
    const at = (region as Region & { at?: [number, number] }).at;
    return !!at && at[0] === 0 && at[1] === 0 && region.settlements[0] === s && this.terrains.has(region.terrain)
      && !StrategicAtlas.keepsFirstTown(region.world);
  }
  // Whether a world's country, at its place on the world's grid and of its terrain, has the reference game's first
  // town: as is() asks of a region once it is drawn.
  static country(world: string, at: [number, number], terrain: string): boolean {
    return at[0] === 0 && at[1] === 0 && this.terrains.has(terrain) && !StrategicAtlas.keepsFirstTown(world);
  }
  // What lies within two hexes of the reference game's town (Atlas.clear), as facts a kit reads (quiet(?place)): the
  // town and its heart, the rooms of the roads and of the wild country there, so that no raiders' hold, toll or price
  // is set about it (the owner, 26 November: "the First Town and the Big Dungeon and not much else around at all").
  static quiet(region: Region): string[][] {
    const s = this.of(region);
    if (!s || s.cell === undefined) { return []; }
    const atlas = RegionGeography.atlas(region), clear = { ...atlas, clear: [s.cell] };
    const ways = RegionGeography.roads(region).filter(r => !Atlases.clear(clear, r.route.cells[RegionRoads.room(r)]!))
      .map(r => r.way);
    const wild = atlas.zones.flatMap(z => z.parts.flatMap((cells, i) => cells.every(c => Atlases.clear(clear, c)) ? []
      : [RegionZones.room(z, i)]));
    return [s.id, `${s.id}_green`, ...ways, ...wild].map(id => ['quiet', id]);
  }
  // The country's settlements but the reference game's.
  static others(region: Region): Settlement[] { return region.settlements.filter(s => !this.is(region, s)); }
  static of(region: Region): Settlement | undefined {
    const s = region.settlements[0];
    return s && this.is(region, s) ? s : undefined;
  }
  // Trader 1's goods: provisions, light, the gear for going under ground, and plain arms and armour, enough to be
  // ready for the woods and the dark.
  static readonly provisions: [string, number, number][] = [['rations', 2, 8], ['torch', 1, 8], ['candle', 1, 6],
    ['lantern', 7, 2], ['lamp_oil', 1, 6], ['rope', 1, 4], ['crowbar', 3, 2], ['pole', 1, 2], ['sack', 2, 4],
    ['bedroll', 1, 3], ['waterskin', 2, 3], ['chalk', 1, 4], ['iron_spikes', 1, 4], ['bandages', 1, 4], ['oil_firebomb', 2, 3],
    // And one scroll, for a company with no one to read the old letters under the woods (OR-1099).
    ['scroll_of_comprehend_languages', 10, 1]];
  static readonly arms: [string, number, number][] = [['dagger', 2, 2], ['club', 1, 2], ['spear', 2, 2],
    ['javelin', 1, 4], ['sling', 1, 2], ['handaxe', 6, 1], ['shortbow', 15, 1], ['hide_armor', 10, 1],
    ['leather', 12, 1]];
  // Trader 1's dearer shelf, the economy's first rung (OR-1124, OR-1127; the owner, 26 November: "an economy that can
  // only support 200 gold in purchases is not a serious adventuring economy"): arms and armour a company saves a trip
  // or two below for, at the catalog's worth (Canon.items), one of each, up to plate. The rest of the store is had from
  // the start's purse; these are two to eight times it.
  static readonly dearer: [string, number, number][] = [['longbow', 30, 1], ['greatsword', 30, 1], ['scale', 40, 1],
    ['healing_potion', 40, 1], ['chainmail', 50, 1], ['banded', 60, 1], ['splint', 70, 1], ['plate', 100, 1]];
  // Trader 2's chest (OR-1124's ladder above the first rung): the SRD's wonders, come up out of the old places and
  // bought by the house, one of each at the catalog's worth. The first rung's top (a cloak, a greater potion, a wand),
  // the second rung (300 to 1,200: a ring of protection to one of spell turning) and the long haul (a belt of giant
  // strength), each a few expeditions on from the last. The deep's own treasure stays rolled on its tables.
  static readonly chest: [string, number, number][] = [['cloak_of_protection', 100, 1],
    ['major_healing_potion', 120, 1], ['wand_of_magic_missile', 250, 1], ['ring_of_protection', 300, 1],
    ['wand_of_wonder', 500, 1], ['ring_of_regeneration', 800, 1], ['ring_of_spell_turning', 1200, 1],
    ['belt_of_giant_strength', 2500, 1]];
  // Trader 2's: what the country gives (the settlement's own trade's stock) and the woods' remedies.
  static readonly remedies: [string, number, number][] = [['herbs', 1, 4], ['yarrow_poultice', 2, 2],
    ['antidote', 3, 2], ['minor_healing_potion', 18, 1]];
  // The three working places off the heart, and where each of its three stands (SettlementWriter.standing reads these).
  static rooms(): { taproom: boolean; shrine: boolean; shop: boolean } {
    return { taproom: true, shrine: true, shop: true };
  }
  static lines(s: Settlement, i: number, region: Region): string[] {
    const q = JSON.stringify, t = s.id, cult = RegionFaith.cults(region)[i]!, f = Foundings.of(region, i);
    return [
      `  Place ${t} ${q(s.name)} is settlement within region at ${this.cell(region, i)}.`,
      `  Initially Assert townSize(${t}, size_${s.size}).`,
      `  Place ${t}_green ${q(f.heart)} is room within ${t} at 1, 1.`,
      `  Place ${t}_shop ${q(`${s.merchant}'s store`)} is room within ${t} at 2, 1.`,
      `  Passage ${t}_shop_door ${q(`${s.merchant}'s door`)} is door between ${t}_shop and ${t}_green.`,
      SettlementWriter.observe(`${t}_shop_scene`, `${t}_shop`, { aspect: 'fixture', when: 'true',
        text: `A long low room under the eaves, sacks and coils of rope along one wall and arms on pegs along the other. A lamp burns over the counter, and the scales on it are kept bright.` }),
      `  Place ${t}_taproom ${q(this.house(s))} is room within ${t} at 1, 0.`,
      `  Passage ${t}_inn_door ${q(`${s.innkeeper}'s door`)} is door between ${t}_taproom and ${t}_green.`,
      SettlementWriter.observe(`${t}_tap`, `${t}_taproom`, { aspect: 'fixture', when: 'true',
        text: `A fire in the middle of the floor, and the smoke going up through the thatch. Bunches of herbs hang from the rafters, and skins are stretched on frames by the door. Whoever comes out of the woods comes here first, to sell what they found and say what they saw. What the house has bought of them is kept in an iron-bound chest under the bench.` }),
      `  Place ${t}_shrine ${q(`the shrine of ${cult.name}`)} is room within ${t} at 0, 1.`,
      `  Passage ${t}_shrine_door ${q('the shrine\'s doorway')} is doorway between ${t}_shrine and ${t}_green.`,
      `  Initially Assert restful(${t}_shrine).`,
      this.trader(s, f, region), this.dealer(s, f, region), this.keeper(s, f, region),
      ...TownMatters.plain(s),
      // Someone at the fire who would come along: the country's own traveller, at Trader 2's.
      ...RegionRecruits.traveller(s, i, region, `${t}_taproom`),
      SettlementWriter.observe(`${t}_day`, `${t}_green`, { aspect: 'fixture', when: 'not dark()',
        text: SettlementScenes.green(region, i, cult.name), teaches: `${t}_why` }),
      SettlementWriter.observe(`${t}_night`, `${t}_green`, { aspect: 'fixture', when: 'dark()',
        text: SettlementScenes.night(region, i) }),
      `  Entity ${t}_why: fact ${q(`${f.why} ${this.oldest(region, s)}`.trim())}.`,
      ...RegionFaith.lines(s, cult, `${t}_shrine`),
    ];
  }
  // The settlement's place on its country's atlas, as SettlementWriter writes it.
  private static cell(region: Region, i: number): string { return RegionGeography.town(region, i).join(', '); }
  // Trader 2's house, by what the place lives by.
  static house(s: Settlement): string { return `${s.innkeeper}'s house`; }
  private static oldest(region: Region, s: Settlement): string {
    const family = Communities.plan(region, s).residents[0]?.family;
    return family ? `The oldest house in ${s.name} is the ${family}s'.` : '';
  }
  private static sells(wares: [string, number, number][]): string {
    return wares.map(([what, fee, n]) => `Sells ${what} for ${Herbals.fee(what, fee)} coin from ${n}.`).join(' ');
  }
  // Trader 1: provisions, equipment, buying and selling. They buy back what they sell (at half its worth: sell_ware),
  // and whatever of value comes up out of the ground, as far as their purse goes.
  private static trader(s: Settlement, f: ReturnType<typeof Foundings.of>, region: Region): string {
    const q = JSON.stringify, t = s.id;
    return `  Person ${t}_merchant ${q(s.merchant)} at ${t}_shop { Role "keeper of the store at ${s.name}, who sells what the woods`
      + ` ask for and buys what comes out of them". ${SettlementWriter.of(s, 'merchant', region)}`
      + ` Peaceable.${SettlementWriter.pronoun(s, 'merchant', f)} ${this.sells([...this.provisions, ...this.arms, ...this.dearer])}`
      + ` Buys grave_rings for 8 coin. Buys chapel_plate for 12 coin. }\n`
      + `  Initially Assert buysValuables(${t}_merchant). Initially Set purse(${t}_merchant) to 600.`
      + ` Initially Set quantity(${t}_merchant, gold) to 600.${RegionShops.dealsIn(`${t}_merchant`, 'general')}`
      + `${RegionShops.dealsIn(`${t}_merchant`, 'arms')}`;
  }
  // Trader 2: what the country gives, and exchange; whatever is gathered or hunted in the woods is bought here, and
  // everything heard of them is told here (the rumours of the country are this one's, as an innkeeper's are).
  private static dealer(s: Settlement, f: ReturnType<typeof Foundings.of>, region: Region): string {
    const q = JSON.stringify, t = s.id, own = SettlementWriter.trade(s);
    const have = new Set(this.remedies.map(([w]) => w));
    const local = own.stock.filter(([w]) => !have.has(w) && !this.provisions.some(([p]) => p === w));
    const buys = [...new Map([...own.buys, ...Herbals.buys()]).entries()]
      .map(([what, fee]) => `Buys ${what} for ${fee} coin.`).join(' ');
    return `  Person ${t}_innkeeper ${q(s.innkeeper)} at ${t}_taproom { Role "${own.role} at ${s.name}, who trades in what`
      + ` the woods give and hears what is seen in them". ${SettlementWriter.of(s, 'innkeeper', region)}`
      + ` Profession herbalist. Peaceable.${SettlementWriter.pronoun(s, 'innkeeper', f)} ${this.sells([...local, ...this.remedies, ...this.chest])}${buys ? ` ${buys}` : ''} }\n`
      + `  Initially Assert buysValuables(${t}_innkeeper). Initially Set purse(${t}_innkeeper) to 200.`
      + ` Initially Set quantity(${t}_innkeeper, gold) to 200.${RegionShops.dealsIn(`${t}_innkeeper`, 'remedies')}`;
  }
  // The shrine: rest (a pallet by its fire for a coin, or a night on its floor for a ration), recovery (a dressing,
  // and the old learning of a restoration) and reflection, at its altar (RegionFaith).
  private static keeper(s: Settlement, f: ReturnType<typeof Foundings.of>, region: Region): string {
    const q = JSON.stringify, t = s.id;
    return `  Person ${t}_priest ${q(s.priest)} at ${t}_shrine { Role ${q(SettlementWriter.called(region, s))}. ${SettlementWriter.of(s, 'priest', region)} Profession priest. Peaceable.${SettlementWriter.pronoun(s, 'priest', f)}`
      + ` Offers lodging "a pallet by the shrine's fire, and a bowl of what is in the pot" for 1 coin.`
      + ` Offers healing "a dressing, and a prayer said over it" for 2 coin.`
      + ` Offers restoring "a restoration" for 100 coin. }`;
  }
}
