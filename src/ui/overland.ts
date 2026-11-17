import type { Campaign } from '../campaign/campaign';
import type { LandChart } from '../lang/module';
import { ObservationText } from '../lang/observation-text';
import { ActionTime } from '../campaign/action-time';
import { Spatial } from '../spatial';
import { VisitedPlaces } from '../presentation/visited-places';
import { ChartModel } from './chart-model';
import { LandModel } from './land-model';
import type { WayInfo } from './passage-model';
import tables from '../../data/generation/scenes/tracts.json';

interface Reckoned {
  chart: LandChart; prefix: string; known: Set<number>; tracts: Map<number, string>; placed?: Set<string>;
}

// The open country as a journey across it reckons it: what the company knows of it as it is, and the rest as a
// traveller who has not seen it would (the owner, 16 November: "for country you don't know it should offer the shortest
// visible path regardless of obstructions; then as you encounter/learn about obstructions you should route around
// them"; OR-35). A stretch not yet known is reckoned passable at its own going (woods and fells as slow as the
// country's folk know them to be, and the time a journey shows the time it takes), and the water there is reckoned
// land, a stretch with no place (`unseen`), until it is seen; then it is gone round. Reckoning every stretch not known
// open ground had laid the way to Joygate in kite straight over fells, three and a half hours shown and six and a half
// walked, where the way by the wood's path known took five.
export class Overland {
  // What a stretch of water not yet seen is reckoned to take: open ground (RegionTracts' meadow).
  static readonly ordinary = (tables as { land: Record<string, { minutes: number }> }).land.meadow!.minutes;
  static readonly way = 'the way across country';
  static readonly unknown = 'country not yet seen';
  private static readonly read = new WeakMap<object, { at: string; land?: Reckoned }>();
  // The company's country, read once for each state of the world and of where the company has been.
  static of(campaign: Campaign): Reckoned | undefined {
    const actor = campaign.playerActor!, world = campaign.world, at = `${actor}:${campaign.history.length}`;
    const kept = this.read.get(world);
    if (kept?.at === at) { return kept.land; }
    const land = this.reckon(campaign);
    this.read.set(world, { at, ...land ? { land } : {} });
    return land;
  }
  private static reckon(campaign: Campaign): Reckoned | undefined {
    const actor = campaign.playerActor!, chart = new ChartModel(campaign.world, actor,
      ObservationText.presented(campaign.world)).land(VisitedPlaces.of(campaign, actor));
    const tracts = new Map(Object.entries(chart?.chart.places ?? {}).filter(([id]) => LandModel.tract.test(id))
      .map(([id, c]) => [c, id] as const));
    const one = tracts.values().next().value;
    return chart && one ? { ...chart, prefix: one.replace(/\d+$/, ''), tracts } : undefined;
  }
  // Whether a place is drawn on the company's country: it stands at a cell of it, or along a road on it, or something
  // within it does (the edge of a province, at its way in).
  static placed(campaign: Campaign, id: string): boolean {
    const land = this.of(campaign);
    if (!land) { return false; }
    const entities = ObservationText.presented(campaign.world);
    land.placed ??= new Set([...Object.keys(land.chart.places), ...Object.keys(land.chart.roads)]
      .flatMap(p => Spatial.ancestry(entities, p).map(e => e.id)));
    return land.placed.has(id) || new LandModel(land.chart, entities).cell(id) !== undefined;
  }
  // The stretches not yet known that are no place (the water of a lake or the sea, unseen), reckoned land: a way
  // across country into each from every stretch about it, and between them. Never the first way of a journey (the
  // stretches about where the company stands are known), so never a way it is sent along unseen.
  static unseen(campaign: Campaign): WayInfo[] {
    const land = this.of(campaign);
    if (!land) { return []; }
    const { chart, known, tracts, prefix } = land, ways: WayInfo[] = [];
    for (let c = 0; c < chart.width * chart.height; c++) {
      if (tracts.has(c) || known.has(c)) { continue; }
      for (const n of LandModel.round(chart, c).filter(m => tracts.has(m) || !known.has(m))) {
        const way = { passage: `${this.mark}${c}_${n}`, name: this.way, oneWay: false, status: 'open' as const };
        ways.push({ ...way, from: `${prefix}${c}`, to: tracts.get(n) ?? `${prefix}${n}` });
        if (tracts.has(n)) { ways.push({ ...way, passage: `${this.mark}${n}_${c}`, from: tracts.get(n)!, to: `${prefix}${c}` }); }
      }
    }
    return ways;
  }
  static readonly mark = 'unseen:';
  // Whether a way is one reckoned across country not yet seen (see unseen).
  static reckoned(passage: string): boolean { return passage.startsWith(this.mark); }
  // Whether a way reckoned across country not yet seen (see unseen) is now seen to be no way: the stretch it was
  // reckoned over is known, and is no place (the water of a lake).
  static found(campaign: Campaign, way: Pick<WayInfo, 'passage' | 'from' | 'to'>): boolean {
    const land = this.reckoned(way.passage) ? this.of(campaign) : undefined;
    return !!land && [way.from, way.to].some(id => {
      const cell = Number(/\d+$/.exec(id)?.[0] ?? NaN);
      return !land.tracts.has(cell) && land.known.has(cell);
    });
  }
  // How long a way is reckoned to take: across water not yet seen, as open ground; else as it takes.
  static minutes(campaign: Campaign, way: Pick<WayInfo, 'passage'>): number {
    return this.reckoned(way.passage) ? this.ordinary : ActionTime.passage(campaign.world, way.passage);
  }
}
