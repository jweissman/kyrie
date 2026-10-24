import { Draw } from './land/draw';
import { RegionEcology } from './region-ecology';
import { RegionGeography, type Road } from './region-geography';
import type { Region } from './region-writer';

interface WayNames { land: string; way: string; out: string; on: string; kind: string; scene: string }

// A generated region's roads as Kyr. Each road is a stretch of country between two settlements: one way room, a
// passage out to it from each end, taking the time the land asks (a cell of open ground is half an hour on a road;
// woods, fen and fells slower). A road crossing a river crosses it by a ford, which a river in spate makes
// dangerous, or a bridge where the river is too deep to wade; a road over the fells crosses a pass, cold after dark,
// with the summit of its fells above it when they have one.
export class RegionRoads {
  static readonly minutesPerHour = 30;
  static lines(region: Region): string[] {
    return RegionGeography.roads(region).flatMap(r => this.road(r, region));
  }
  private static road(road: Road, region: Region): string[] {
    const q = JSON.stringify, { from, to, land, way, form } = road, [x, y] = road.spot, n = this.names(road, region);
    const [out, on] = this.halves(road);
    const lines = [`  Place ${land} ${q(n.land)} is wilderness within region at ${x}, ${y}.`,
      `  Place ${way} ${q(n.way)} is room within ${land} at 1, 1.`,
      `  Passage road_${from.id}_${to.id} ${q(n.out)} is road between ${from.id}_green and ${way} taking ${out}.`,
      `  Passage road_${from.id}_${to.id}_on ${q(n.on)} is ${n.kind} between ${way} and ${to.id}_green taking ${on}.`,
      `  Observe ${way}_scene at ${way} when true ${q(`${n.scene} ${RegionEcology.sign(this.habitat(road, region), way)}`
        .trim())}.`];
    if (form) { lines.push(`  Initially Assert landform(${land}, land_${form.form}).`); }
    if (form?.form === 'river' && road.route.crossings[0]?.kind === 'ford') { lines.push(...this.ford(road)); }
    if (road.route.over) { lines.push(...this.pass(road)); }
    return lines;
  }
  // The time each half of a road takes, in the minutes Kyr counts, to the nearest ten.
  private static halves(road: Road): [string, string] {
    const total = Math.max(40, Math.round(road.route.hours * this.minutesPerHour / 10) * 10);
    const first = Math.max(20, Math.round(total / 20) * 10);
    return [this.time(first), this.time(Math.max(20, total - first))];
  }
  static time(minutes: number): string {
    return minutes % 60 === 0 ? `${minutes / 60} hour${minutes === 60 ? '' : 's'}` : `${minutes} minutes`;
  }
  // What a road and its land are called, and how it looks, by what it crosses or runs through. Each half of it is
  // walked both ways, so it is named for neither end: the Karavor road, taken up from Gothgiba or down to Muzgkom.
  static names(road: Road, region: Region): WayNames {
    const { from, to, form } = road, name = form?.name ?? '';
    const draw = new Draw(`${road.way}:prose`), bridge = road.route.crossings[0]?.kind === 'bridge';
    switch (form?.form) {
      case 'river': return { land: `the vale of the ${name}`, way: `the ${bridge ? 'bridge over' : 'ford of'} the ${name}`,
        kind: bridge ? 'bridge' : 'ford', out: `the ${name} road`,
        on: `the ${bridge ? 'bridge over' : 'ford of'} the ${name}`,
        scene: `${bridge ? draw.pick(this.bridges) : draw.pick(this.fords)}`.replaceAll('{river}', name)
          .replaceAll('{to}', to.name) };
      case 'wood': return { land: name, way: `the road through ${name}`, kind: 'road',
        out: `the ${name} road`, on: `the ${name} road`,
        scene: draw.pick(this.woods).replaceAll('{wood}', name) };
      case 'pass': return { land: `the ${name}`, way: `the top of the ${name}`, kind: 'road',
        out: `the ${name} road`, on: `the ${name} road`,
        scene: draw.pick(this.passes).replaceAll('{pass}', name) };
      default: return { land: `the country between ${from.name} and ${to.name}`,
        way: `the road between ${from.name} and ${to.name}`, kind: 'road', out: 'the road', on: 'the road', scene: draw.pick(this.open[this.ground(road, region)] ?? this.open.meadow!)
          .replaceAll('{from}', from.name).replaceAll('{to}', to.name) };
    }
  }
  // The kind of country a road's animals are of: its river, wood or pass's; else the ground it crosses.
  private static habitat(road: Road, region: Region): string {
    return (road.form ? RegionEcology.forms[road.form.form] : RegionEcology.grounds[this.ground(road, region)])
      ?? RegionEcology.country(region);
  }
  // The ground most of a road crosses.
  private static ground(road: Road, region: Region): string {
    const cover = RegionGeography.atlas(region).land.cover, counts = new Map<string, number>();
    for (const c of road.route.cells) { counts.set(cover[c]!, (counts.get(cover[c]!) ?? 0) + 1); }
    return [...counts].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'meadow';
  }
  static readonly fords = [
    'The road comes down between alders to the {river} and crosses it on a ford of flat stones; on the far bank it climbs again toward {to}.',
    'At the ford the {river} spreads wide and shallow over gravel. A pole stands in the water, marked for the depth.',
    'The road goes into the {river} at a shelving beach and out the other side; carts have cut deep ruts on both banks.'];
  static readonly bridges = [
    'The road crosses the {river} by a bridge of old grey stone, three arches green with moss; the river runs deep and quick beneath.',
    'A timber bridge on stone piers carries the road over the {river}. Its planks are new; its piers are not.',
    'The bridge over the {river} is narrow and humped, with a cut stone at its crown too worn to read.'];
  static readonly woods = [
    'The road winds under the trees of {wood}, roots across it and the light gone green. It is slow going, and the wood is quiet on either hand.',
    'Through {wood} the road is a sunken lane, banks higher than your head, oak roots knotted in them.',
    'In {wood} the road narrows to a cart\'s width. Woodcutters have stacked cordwood along it, and left.'];
  static readonly passes = [
    'The road climbs to the {pass}, a saddle of bare rock between the heights, and goes over. Cairns mark the way where the snow lies. There is no shelter, and the wind never stops.',
    'At the top of the {pass} a cairn of stones stands higher than a rider, every traveller\'s stone added to it.',
    'The {pass} is a notch between crags, the road a ledge along one side of it, with a long fall on the other.'];
  static readonly open: Record<string, string[]> = {
    meadow: ['The road between {from} and {to} runs between hedges and fields, past a farm or two and a wayside cross.',
      'Open farmland on either hand: strip-fields, a mill-pond, cattle that lift their heads as you pass.',
      'A drove road, broad and rutted, between {from} and {to}, with thorn hedges and the odd byre.'],
    heath: ['The road crosses open moor between {from} and {to}, marked by standing posts where the heather would hide it.',
      'Heather and gorse either side, and the road a pale line over the moor toward {to}.'],
    wood: ['Woods close in on both sides of the road between {from} and {to}, and open again at clearings.',
      'The road between {from} and {to} goes through scattered woods and the clearings of charcoal-burners.'],
    fen: ['The road crosses the fen on a causeway of piled stone and black timber: open water on one hand, reeds on the other.',
      'Between {from} and {to} the road is a raised bank across the fen, with ditches either side full of still water.'],
    fell: ['The road climbs and falls over the shoulders of the fells between {from} and {to}, stone walls beside it.',
      'Between {from} and {to} the road keeps to the valley side, above the river, under the fells.'],
  };
  // A ford is crossed knee-deep; when the river is up it can be risked, and whoever goes first may be swept off it.
  private static ford(road: Road): string[] {
    const q = JSON.stringify, river = road.form!, water = `${road.way}_water`;
    return [`  Hazard ${road.way}_swept "Swept off the ford" means "Deal (1d6) physical damage to ally unless strength save against (12).".`,
      `  Thing ${water} ${q(`the ${river.name}`)} on road_${road.from.id}_${road.to.id}_on is scenery {`,
      `    State low ${q(`The ${river.name} runs knee-deep and clear over the ford stones.`)}.`,
      `    State spate dangerous ${q(`The ${river.name} is in spate: brown water runs fast and loud over the ford, thigh-deep and rising.`)}.`,
      `    Hurts with ${road.way}_swept when spate then spate.`, '  }'];
  }
  // A pass is a long climb, cold after dark.
  private static pass(road: Road): string[] {
    const q = JSON.stringify, pass = road.route.over!, chilled = `${road.way}_chilled`;
    return [`  Hazard ${road.way}_cold ${q(`The cold on the ${pass.name}`)} means "Deal (1d4) cold damage to ally unless constitution save against (12).".`,
      `  Relation ${chilled}(group).`,
      `  Rule ${road.way}_night when at(party, ${road.way}) and dark() and not ${chilled}(party) says ${q(`Night comes down on the ${pass.name}, and the cold with it. There is no shelter, and nothing to burn.`)} { Assert strikes(${road.way}_cold, party). Assert ${chilled}(party). }`,
      `  Rule ${road.way}_dawn when ${chilled}(party) and not dark() { Retract ${chilled}(party). }`];
  }
}
