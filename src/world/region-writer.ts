import { GenerationSetting } from '../generation-setting';
// A generated region (the Deem `region` generator's output, plus sites scenarios asked for) written as an ordinary
// Kyr module: settlements with an inn, a shrine and a shop, roads between them, and a track out to each site. Every
// entity it writes is exported under its own id, so scenarios bind to it like any other module.
// A generated name: what it is made of, and what it means in which tongue (see PlaceNames).
interface Naming { feature?: string; affix?: string; gloss?: string; tongue?: string }
export interface Settlement extends Naming {
  id: string; name: string; size: string; trade: string; inn: string;
  innkeeper: string; priest: string; merchant: string; traveller: string; calling: string;
  // What kind of merchant the settlement's trade supports (a smith where tin is mined, a salter where salt is
  // boiled): a row of the Deem table merchantType, which says what they stock and buy.
  merchantType?: string;
}
interface MerchantType { role: string; profession?: string; shop: string; stock: [string, number, number][];
  buys: [string, number][] }
interface Tables {
  merchantType: { groups: Record<string, MerchantType> };
  innStock: { groups: Record<string, { price: number; stock: number }> };
}
export interface Site extends Naming { id: string; kind: string; name: string; hours: number; near?: string }
export interface Region extends Naming {
  name: string; terrain: string; ancestry: string; domain: string; deity: string;
  settlements: Settlement[]; sites: Site[]; wonder: { kind: string; description: string };
}
// The region's people who pass news on, by the channel they carry it through.
export interface Carrier { id: string; settlement: string; channel: 'tavern' | 'temple' | 'market' | 'road' }
// A company member's old acquaintance, from their background: a carrier who passes on news of that channel heard
// anywhere in the region, and who is introduced where they are found.
export interface Contact {
  member: string; background: string; channel: Carrier['channel']; carrier: string; room: string; text: string;
}

export class RegionWriter {
  static readonly id = 'region';
  static carriers(region: Region): Carrier[] {
    return region.settlements.flatMap(s => [
      { id: `${s.id}_innkeeper`, settlement: s.id, channel: 'tavern' as const },
      { id: `${s.id}_traveller`, settlement: s.id, channel: 'road' as const },
      { id: `${s.id}_priest`, settlement: s.id, channel: 'temple' as const },
      { id: `${s.id}_merchant`, settlement: s.id, channel: 'market' as const }]);
  }
  // The settlement each site is reached from: the one it names, or one by turns.
  static near(region: Region, site: Site): Settlement {
    const index = region.sites.indexOf(site);
    return region.settlements.find(s => s.id === site.near) ?? region.settlements[index % region.settlements.length]!;
  }
  static source(region: Region, company: { size: number; contacts: Contact[] } = { size: 3, contacts: [] }): string {
    const q = JSON.stringify, lines: string[] = [];
    lines.push(`Module ${this.id} ${q(region.name)} {`,
      `  Description ${q(`${region.name}: ${this.terrain(region.terrain)} country of ${region.ancestry} settlements, where people keep the faith of ${region.deity}.${this.meaning(region)}`)}.`,
      `  Place region ${q(region.name)} is region.`, `  Initially Assert terrain(region, ${region.terrain}).`,
      `  Place wilds ${q(`the ${this.terrain(region.terrain)} of ${region.name}`)} is wilderness within region at 0, 2.`);
    region.settlements.forEach((s, i) => lines.push(...this.settlement(s, i, region)));
    // Each road runs through wild country, by a stretch where travellers can be met or waylaid.
    region.settlements.slice(1).forEach((s, i) => {
      const from = region.settlements[i]!, way = `${from.id}_${s.id}_way`;
      lines.push(`  Place ${way} ${q(`the road between ${from.name} and ${s.name}`)} is room within wilds at ${i}, 1.`,
        `  Passage road_${from.id}_${s.id} ${q(`the road from ${from.name} to ${s.name}`)} is road between ${from.id}_green and ${way} taking 1 hour.`,
        `  Passage road_${from.id}_${s.id}_on ${q(`the road on to ${s.name}`)} is road between ${way} and ${s.id}_green taking 1 hour.`,
        `  Observe ${way}_scene at ${way} when true ${q(`The road between ${from.name} and ${s.name}, with ${this.terrain(region.terrain)} country close on either side.`)}.`);
    });
    region.settlements.forEach(s => lines.push(...this.economy(s, region)));
    region.sites.forEach((site, i) => {
      const town = this.near(region, site);
      lines.push(`  Place ${site.id} ${q(site.name)} is room within wilds at ${i}, 0.`,
        `  Passage ${site.id}_track ${q(`the track to ${site.name}`)} is track between ${town.id}_green and ${site.id} taking ${site.hours} hour${site.hours === 1 ? '' : 's'}.`,
        `  Observe ${site.id}_scene at ${site.id} when true ${q(this.site(site, region))}.`);
    });
    company.contacts.forEach((c, i) => lines.push(`  Observe tie${i + 1} at ${c.room} when true ${q(c.text)}.`));
    const wonderSite = region.sites[0];
    if (wonderSite) {
      lines.push(`  Observe wonder at ${wonderSite.id} when true ${q(`Nearby you find ${region.wonder.description.replace(/\.$/, '')}. Nobody in ${region.settlements[0]!.name} can say why.`)}.`);
    }
    lines.push(`  Company party "Your company" of ${company.size} at ${region.settlements[0]!.id}_green.`,
      '  Initially Set quantity(party, gold) to 12. Initially Set quantity(party, rations) to 2.', '  Goal false.', '}');
    return lines.join('\n');
  }
  private static settlement(s: Settlement, i: number, region: Region): string[] {
    const q = JSON.stringify, x = i * 3;
    return [
      `  Place ${s.id} ${q(s.name)} is settlement within region at ${x}, 0.`,
      `  Place ${s.id}_green ${q(`${s.name} green`)} is room within ${s.id} at 1, 1.`,
      `  Place ${s.id}_inn ${q(s.inn)} is building within ${s.id}.`,
      `  Place ${s.id}_taproom ${q(`the taproom of ${s.inn}`)} is room within ${s.id}_inn at 1, 0.`,
      `  Place ${s.id}_shrine ${q(`the shrine of ${region.deity}`)} is room within ${s.id} at 0, 1.`,
      `  Place ${s.id}_shop ${q(`${s.merchant}'s ${this.trade(s).shop}`)} is room within ${s.id} at 2, 1.`,
      `  Passage ${s.id}_inn_door ${q(`the door of ${s.inn}`)} is door between ${s.id}_taproom and ${s.id}_green.`,
      `  Passage ${s.id}_shrine_door ${q(`the shrine porch in ${s.name}`)} is doorway between ${s.id}_shrine and ${s.id}_green.`,
      `  Passage ${s.id}_shop_door ${q(`${s.merchant}'s door`)} is door between ${s.id}_shop and ${s.id}_green.`,
      `  Person ${s.id}_innkeeper ${q(s.innkeeper)} at ${s.id}_taproom { Role "innkeeper". Profession innkeeper. Peaceable. ${this.inn(s)} }`,
      `  Person ${s.id}_priest ${q(s.priest)} at ${s.id}_shrine { Role ${q(`priest of ${region.deity}`)}. Profession priest. Peaceable. }`,
      this.merchant(s),
      `  Person ${s.id}_traveller ${q(s.traveller)} at ${s.id}_taproom { Role ${q(s.calling)}. Peaceable. }`,
      `  Observe ${s.id}_day at ${s.id}_green when not dark() ${q(`${s.name} is a ${s.size} of ${region.ancestry} folk that lives by ${s.trade}.${this.meaning(s)} Smoke rises from ${s.inn}; the shrine of ${region.deity} stands open across the green.`)}.`,
      `  Observe ${s.id}_night at ${s.id}_green when dark() ${q(`${s.name} is shuttered for the night. A lamp burns over the door of ${s.inn}.`)}.`,
      `  Observe ${s.id}_tap at ${s.id}_taproom when true ${q(`Benches, a long table, a fire. People who work ${s.trade} drink here.`)}.`,
      `  Observe ${s.id}_holy at ${s.id}_shrine when true ${q(`An altar to ${region.deity}, keeper of ${region.domain}. Offerings of ${s.trade} lie before it.`)}.`,
    ];
  }
  // The merchant a settlement's trade supports, with that kind of merchant's stock and what they will buy.
  private static trade(s: Settlement): MerchantType {
    const types = (GenerationSetting.tables as unknown as Tables).merchantType;
    return types.groups[s.merchantType ?? 'chandler'] ?? types.groups.chandler!;
  }
  private static merchant(s: Settlement): string {
    const t = this.trade(s);
    const sells = t.stock.map(([what, fee, n]) => `Sells ${what} for ${fee} coin from ${n}.`).join(' ');
    const buys = t.buys.map(([what, fee]) => `Buys ${what} for ${fee} coin.`).join(' ');
    return `  Person ${s.id}_merchant ${JSON.stringify(s.merchant)} at ${s.id}_shop { Role ${JSON.stringify(t.role)}.`
      + `${t.profession ? ` Profession ${t.profession}.` : ''} Peaceable. ${sells}${buys ? ` ${buys}` : ''} }`;
  }
  // Trade comes and goes by the roads. While anyone tolls a road into a settlement its inn's meal is dearer and
  // is not made good; when the roads are open, and the farms have not been robbed, the inn restocks a sack a day.
  private static economy(s: Settlement, region: Region): string[] {
    const ways = region.settlements.slice(1).map((t, i) => [region.settlements[i]!.id, t.id])
      .filter(([a, b]) => a === s.id || b === s.id).map(([a, b]) => `${a}_${b}_way`);
    if (!ways.length) { return []; }
    const { price, stock } = this.stock(s), keeper = `${s.id}_innkeeper`;
    const tolled = ways.map(w => `tolls(?collector, ${w})`).join(' or ');
    const open = ways.map(w => `not tolls(?collector, ${w})`).join(' and ');
    return [`  Rule ${s.id}_dear when (${tolled}) and goodsPrice(${keeper}, rations) < ${price + 1} {`
      + ` Set goodsPrice(${keeper}, rations) to ${price + 1}. }`,
    `  Rule ${s.id}_cheap when ${open} and goodsPrice(${keeper}, rations) > ${price} { Set goodsPrice(${keeper}, rations) to ${price}. }`,
    `  Rule ${s.id}_restock when untilLight(clock) == 1 and ${open} and losses(${s.id}_green) < 3`
      + ` and quantity(${keeper}, rations) < ${stock} { Increase quantity(${keeper}, rations) by 1. }`,
    `  Observe ${s.id}_tolled at ${s.id}_taproom when ${tolled} ${JSON.stringify(`Carters at the bar grumble about the toll on the road; the meal is dearer for it, and there is less of it.`)}.`];
  }
  private static stock(s: Settlement): { price: number; stock: number } {
    return (GenerationSetting.tables as unknown as Tables).innStock.groups[s.size] ?? { price: 2, stock: 6 };
  }
  // An inn sells what a place of its size can spare: plenty in a town, a little in a hamlet, dearer.
  private static inn(s: Settlement): string {
    const stock = this.stock(s);
    return `Sells rations for ${stock.price} coin from ${stock.stock}.`;
  }
  static terrain(t: string): string {
    return ({ forest: 'forest', marsh: 'fen', mountain: 'upland', frost: 'frozen', desert: 'desert' } as Record<string, string>)[t] ?? t;
  }
  private static site(site: Site, region: Region): string {
    const looks: Record<string, string> = {
      cave: 'A dark mouth opens in the hillside.', barrow: 'A long grassed mound with a stone-lined entrance.',
      ruin: 'Fallen walls in rough grass; someone built here once.', tower: 'A lone tower stands above the land.',
      grove: 'Old trees crowd close, and the light under them is green.', bog: 'Black water between tussocks; the path is a line of stakes.',
      mine: 'Spoil heaps and a timbered adit.', sinkhole: 'Grass runs to the edge of a round pit in the ground.' };
    return `${site.name}.${this.meaning(site)} ${looks[site.kind] ?? ''} ${this.terrain(region.terrain) === 'fen' ? 'Reeds hiss in the wind.' : ''}`.trim();
  }
  // What a name means, when it was given in the folk's own tongue: " The name is Westron for “cold hill”."
  private static meaning(place: { gloss?: string; tongue?: string }): string {
    return place.gloss && place.tongue ? ` The name is ${place.tongue} for “${place.gloss}”.` : '';
  }
  // The module manifest: the world rules, every place and person exported under its own id, and what the assembler
  // is told about it: the terrain, which rooms are on the roads, what kind each site is and which a scenario took.
  static manifest(region: Region, taken: Record<string, string> = {}): object {
    const ways = region.settlements.slice(1).map((s, i) => `${region.settlements[i]!.id}_${s.id}_way`);
    const ids = ['party', 'region', 'wilds', ...region.settlements.flatMap(s => [s.id, `${s.id}_green`, `${s.id}_taproom`,
      `${s.id}_shrine`, `${s.id}_shop`, `${s.id}_innkeeper`, `${s.id}_priest`, `${s.id}_merchant`, `${s.id}_traveller`]),
    ...region.sites.flatMap(w => [w.id, `${w.id}_track`]), ...ways];
    const commitments = [['terrain', 'region', region.terrain], ...ways.map(w => ['onRoad', w]),
      ...region.settlements.map(s => ['keeper', `${s.id}_innkeeper`, `${s.id}_green`]),
      ...region.sites.map(w => ['siteKind', w.id, w.kind]), ...Object.entries(taken).map(([w, by]) => ['taken', w, by])];
    return { version: 1, source: 'region.kyr', rules: ['world', 'elements'], globals: ['party'],
      exports: Object.fromEntries(ids.map(id => [id, id])), assembly: { commitments } };
  }
}
