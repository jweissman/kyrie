import { Expressions } from '../expressions';
import { GenerationSetting } from '../generation-setting';
import { Calendar, type CalendarStart } from '../campaign/calendar';
import { RegionGeography } from './region-geography';
import { RegionZones } from './region-zones';
import { SettlementWriter } from './settlement-writer';
import { CampaignTick } from '../campaign/campaign-tick';
import type { Region } from './region-writer';

interface Tables {
  regionClimate: { groups: Record<string, string[]> }; climateWeather: { groups: Record<string, string[]> };
  skyLine: { groups: Record<string, [string, string]> }; seasonLine: { groups: Record<string, string[]> };
  skyAt: { groups: Record<string, Record<'green' | 'road' | 'wild' | 'roof', string>> };
}

// A generated region's weather, from Orsino's climates: a region has a climate for its terrain (terrainClimates)
// whose weathers it has (climateWeather), with snow for rain in a cold winter and no frost in summer. The weather
// goes on as long as the campaign does: at each first light the day's die decides whether the sky holds or turns,
// and to what, weighted by the climate. A river runs in spate the day after rain or a storm, and its ford can then
// only be risked; the weather is seen on the greens and the roads, and the season, as the calendar turns, on the
// greens.
export class RegionWeather {
  static get tables(): Tables { return GenerationSetting.tables as unknown as Tables; }
  // Out of every hundred mornings, how many the sky holds as it was.
  static readonly holds = 45;
  // What a climate's weather is in a season that will not have it: no close, fly-ridden days in winter, and snow
  // where it would have rained (except in a tropical one); no snow or frost in summer.
  static readonly seasonal: Record<string, Record<string, string>> = {
    winter: { rainy: 'snowy', humid: 'cold', hot: 'fair' }, summer: { snowy: 'rainy', freezing: 'fair', cold: 'fair' } };
  static climate(region: Region): string {
    const rng = new Expressions(`${region.name}:weather`);
    const climates = this.tables.regionClimate.groups[region.terrain] ?? ['temperate'];
    return climates[rng.number(`1d${climates.length}`) - 1]!;
  }
  // What a kind of weather is in a season, in a climate.
  static inSeason(kind: string, season: string, climate: string): string {
    return (climate === 'tropical' && kind === 'rainy' ? kind : this.seasonal[season]?.[kind]) ?? kind;
  }
  // Every kind of weather the region's sky can have, in any season.
  static kinds(region: Region, start: CalendarStart): string[] {
    const climate = this.climate(region), kinds = this.tables.climateWeather.groups[climate] ?? ['fair'];
    const first = this.inSeason(kinds[new Expressions(`${region.name}:weather:first`).number(`1d${kinds.length}`) - 1]!,
      Calendar.date(start, 0).season, climate);
    return [...new Set([first, ...CampaignTick.seasons.flatMap(season => kinds.map(k => this.inSeason(k, season,
      climate)))])];
  }
  static lines(region: Region, start: CalendarStart): string[] {
    const q = JSON.stringify, climate = this.climate(region), sky = this.tables.skyLine.groups;
    const kinds = this.tables.climateWeather.groups[climate] ?? ['fair'], all = this.kinds(region, start);
    // The sky's states are named weather_rainy and so on, as "cold" and the like are the shared rules' own.
    return ['  Thing sky "the sky" at region is scenery {', ...all.map(k => `    State weather_${k} ${q(sky[k]?.[1] ?? k)}.`),
      '  }', ...this.river(region, all), ...this.turns(kinds, climate), ...this.seen(region, all)];
  }
  // At first light the sky turns, unless it holds: the rest of the die's hundred shared among the climate's
  // weathers (a weather it has often holds more of it), each as it is in the season.
  private static turns(kinds: string[], climate: string): string[] {
    const span = (100 - this.holds) / kinds.length;
    return kinds.flatMap((kind, i) => {
      const lo = Math.floor(this.holds + span * i) + 1, hi = Math.floor(this.holds + span * (i + 1));
      const when = `untilLight(clock) == 1 and dice(clock) >= ${lo} and dice(clock) <= ${hi}`;
      const changed = CampaignTick.seasons.map((season, n) => ({ n: n + 1, k: this.inSeason(kind, season, climate) }))
        .filter(x => x.k !== kind);
      return [{ id: `sky_${i}`, also: changed.map(x => ` and season(clock) != ${x.n}`).join(''), k: kind },
        ...changed.map(x => ({ id: `sky_${i}_${x.n}`, also: ` and season(clock) == ${x.n}`, k: x.k }))]
        .map(r => `  Rule ${r.id} when ${when}${r.also} and not state(sky, weather_${r.k}) { Assert state(sky, weather_${r.k}). }`);
    });
  }
  // The rivers are up the morning after rain or a storm, and down again the morning after that: at every ford.
  // These come before the sky's turning, so they read the day that is ending.
  private static river(region: Region, kinds: string[]): string[] {
    const rains = kinds.filter(k => ['rainy', 'stormy'].includes(k)).map(k => `state(sky, weather_${k})`);
    if (!rains.length) { return []; }
    const wet = `(${rains.join(' or ')})`;
    return RegionGeography.roads(region).filter(r => r.form?.form === 'river' && r.route.crossings[0]?.kind === 'ford')
      .flatMap(r => [`  Rule ${r.way}_rises when untilLight(clock) == 1 and ${wet} and not state(${r.way}_water, spate) {`
        + ` Assert state(${r.way}_water, spate). }`,
      `  Rule ${r.way}_falls when untilLight(clock) == 1 and not ${wet} and state(${r.way}_water, spate) {`
        + ` Assert state(${r.way}_water, low). }`]);
  }
  // The weather as it is where the company stands: seen on a green, a road or in wild country, heard and felt under a
  // roof; and on each green, the season as the calendar turns. Where a kind of weather has nothing to show (a fair day
  // indoors), nothing is said.
  private static seen(region: Region, kinds: string[]): string[] {
    const q = JSON.stringify, at = this.tables.skyAt.groups;
    const places: [string, 'green' | 'road' | 'wild' | 'roof'][] = [
      ...region.settlements.map(s => [`${s.id}_green`, 'green'] as [string, 'green']),
      ...region.settlements.filter(s => SettlementWriter.rooms(region, s).taproom)
        .map(s => [`${s.id}_taproom`, 'roof'] as [string, 'roof']),
      ...RegionGeography.roads(region).map(r => [r.way, 'road'] as [string, 'road']),
      ...RegionGeography.atlas(region).zones.flatMap(z => RegionZones.rooms(region, z).map(r => [r, 'wild'] as [string, 'wild']))];
    return [...places.flatMap(([room, kind]) => kinds.filter(k => at[k]?.[kind]).map(k =>
      `  Observe ${room}_sky_${k} at ${room} as weather when state(sky, weather_${k})${kind === 'roof' ? '' : ' and not dark()'} ${q(at[k]![kind])}.`)),
    ...region.settlements.flatMap(s => CampaignTick.seasons.flatMap((season, i) => {
      const line = this.tables.seasonLine.groups[season]?.[0];
      return line ? [`  Observe ${s.id}_season_${season} at ${s.id}_green as weather when not dark() and season(clock) == ${i + 1} ${q(line)}.`] : [];
    }))];
  }
}
