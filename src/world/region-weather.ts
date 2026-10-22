import { Expressions } from '../expressions';
import { GenerationSetting } from '../generation-setting';
import { Calendar, type CalendarStart } from '../presentation/calendar';
import { RegionGeography } from './region-geography';
import type { Region } from './region-writer';

interface Tables {
  regionClimate: { groups: Record<string, string[]> }; climateWeather: { groups: Record<string, string[]> };
  skyLine: { groups: Record<string, [string, string]> }; seasonLine: { groups: Record<string, string[]> };
}

// A generated region's weather, day by day, from Orsino's climates: a region has a climate for its terrain
// (terrainClimates) and each day draws weather from it (climateWeather), with snow for rain in a cold winter. The
// sky changes at dawn. A river runs in spate the day after rain or a storm, and its ford can then only be risked;
// the weather and the season are seen on the greens and the roads.
export class RegionWeather {
  static readonly days = 12;
  static get tables(): Tables { return GenerationSetting.tables as unknown as Tables; }
  // Each day's weather, from the first.
  static schedule(region: Region, start: CalendarStart): string[] {
    const rng = new Expressions(`${region.name}:weather`);
    const climates = this.tables.regionClimate.groups[region.terrain] ?? ['temperate'];
    const climate = climates[rng.number(`1d${climates.length}`) - 1]!;
    const kinds = this.tables.climateWeather.groups[climate] ?? ['fair'];
    return Array.from({ length: this.days }, (_, d) => {
      const kind = kinds[rng.number(`1d${kinds.length}`) - 1]!, season = Calendar.date(start, this.dawn(d + 1)).season;
      return (climate === 'tropical' && kind === 'rainy' ? kind : this.seasonal[season]?.[kind]) ?? kind;
    });
  }
  // What a climate's weather is in a season that will not have it: no close, fly-ridden days in winter, and snow
  // where it would have rained (except in a tropical one); no snow or frost in summer.
  static readonly seasonal: Record<string, Record<string, string>> = {
    winter: { rainy: 'snowy', humid: 'cold', hot: 'fair' }, summer: { snowy: 'rainy', freezing: 'fair', cold: 'fair' } };
  // The watch at which day n begins its weather: six in the morning (the first day's is the start).
  static dawn(n: number): number { return n <= 1 ? 0 : 144 * (n - 1) - 12; }
  static lines(region: Region, start: CalendarStart): string[] {
    const q = JSON.stringify, days = this.schedule(region, start), kinds = [...new Set(days)];
    const sky = this.tables.skyLine.groups;
    // The sky's states are named weather_rainy and so on, as "cold" and the like are the shared rules' own.
    const lines = ['  Thing sky "the sky" at region is scenery {',
      ...kinds.map(k => `    State weather_${k} ${q(sky[k]?.[1] ?? k)}.`), '  }'];
    lines.push(...this.changes('sky', days.map(k => `weather_${k}`)), ...this.river(region, days),
      ...this.seen(region, start, kinds));
    return lines;
  }
  // Rules that set a thing's state from day to day: each change holds from its dawn until the next change's.
  private static changes(thing: string, days: string[]): string[] {
    const at = days.map((k, d) => d > 0 && days[d - 1] !== k ? d : -1).filter(d => d > 0);
    return at.map((d, i) => {
      const until = at[i + 1] === undefined ? '' : ` and watch(clock) < ${this.dawn(at[i + 1]! + 1)}`;
      return `  Rule ${thing}_${d + 1} when watch(clock) >= ${this.dawn(d + 1)}${until} and not state(${thing}, ${days[d]}) {`
        + ` Assert state(${thing}, ${days[d]}). }`;
    });
  }
  // The river is up the day after rain or a storm, and down again the day after that.
  private static river(region: Region, days: string[]): string[] {
    if (!RegionGeography.roads(region).some(r => r.form?.form === 'river')) { return []; }
    return this.changes('river_water', days.map((_, d) => d > 0 && ['rainy', 'stormy'].includes(days[d - 1]!)
      ? 'spate' : 'low'));
  }
  // The weather on each green and road, by day; and the season on each green.
  private static seen(region: Region, start: CalendarStart, kinds: string[]): string[] {
    const q = JSON.stringify, sky = this.tables.skyLine.groups;
    const season = this.tables.seasonLine.groups[Calendar.date(start, 0).season]?.[0];
    const rooms = [...region.settlements.map(s => `${s.id}_green`), ...RegionGeography.roads(region).map(r => r.way)];
    return [...rooms.flatMap(room => kinds.map(k =>
      `  Observe ${room}_sky_${k} at ${room} when state(sky, weather_${k}) and not dark() ${q(sky[k]?.[1] ?? '')}.`)),
    ...season ? region.settlements.map(s => `  Observe ${s.id}_season at ${s.id}_green when not dark() ${q(season)}.`) : []];
  }
}
