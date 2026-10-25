import type { Campaign } from '../campaign/campaign';
import type { CampaignEvent } from '../campaign/campaign-types';
import type { LandChart } from '../lang/module';
import { ModuleWriter } from '../lang/module-writer';
import { FictionalTime } from '../presentation/fictional-time';
import { Voice } from './voice';
import { Editor } from './editor';
import type { Voiced } from './telling';

// A way across country, told as it goes (data/voice/journey.json): setting out, by the hour and the sky; the land the
// road runs through, by what its cells are; the light going on the way; and coming in sight of where it ends. Only a
// way that takes half an hour or more is a journey; a sentence or two of it, never a wait.
export class Journeys {
  static readonly skies: Record<string, string> = { rainy: 'rain', stormy: 'rain', cold: 'cold', freezing: 'cold',
    snowy: 'cold', foggy: 'fog', windy: 'wind', dusty: 'wind', cloudy: 'grey', hot: 'hot', humid: 'hot',
    ashfall: 'ash', smoky: 'ash' };
  static tell(campaign: Campaign, event: CampaignEvent, used: Set<string>): Voiced[] {
    const m = /^go\(([^,]+),([^,]+),([^,]+),([^)]+)\)$/.exec(event.action), world = campaign.world;
    if (!m || event.result !== 'success') { return []; }
    const [, , way, from, to] = m as unknown as [string, string, string, string, string];
    const ticks = world.number(ModuleWriter.call('travelTime', way));
    if (ticks < 3) { return []; }
    const start = event.elapsed - ticks, chart = this.chart(campaign, from, to);
    const values = { from: Editor.called(campaign, this.settlement(campaign, from) ?? from),
      to: Editor.called(campaign, this.settlement(campaign, to) ?? to), way: this.way(campaign, way) };
    const sky = world.related('state').find(r => /(^|__)sky$/.test(r.args[0]!))?.args[1]?.replace(/^.*weather_/, '');
    // A way taken before is not told again: setting out and the light going, not the land it runs through nor coming
    // in sight of its end (the follow-up review read familiar journeys in full).
    const again = campaign.history.some(e => e.elapsed < event.elapsed && e.result === 'success'
      && /^go\(/.test(e.action) && e.action.split(',')[1] === way);
    const kinds: [string, Record<string, string>][] = [
      ['journey-depart', { time: FictionalTime.part(start), sky: this.skies[sky ?? ''] ?? 'fair',
        ...FictionalTime.early(start) ? { light: 'early' } : {} }],
      ...chart && !again ? [['journey-land', { land: this.land(chart, this.cells(chart, from, to)) }] as [string, Record<string, string>]] : [],
      ...!FictionalTime.dark(start) && FictionalTime.dark(event.elapsed) ? [['journey-dark', {}] as [string, Record<string, string>]] : [],
      ...again ? [] : this.arrival(campaign, to, ticks)];
    // The closest fit not yet said; a looser fit not yet said before a close one said again.
    return kinds.flatMap(([kind, context]) => {
      const tiers = Voice.tiers(kind, context), pool = tiers.find(t => t.some(l => !used.has(l.id))) ?? tiers[0] ?? [];
      const line = Editor.choose(pool, `${campaign.readout.seed}:${event.elapsed}:${kind}`, used);
      if (!line) { return []; }
      Editor.said(used, line.id);
      return [{ id: line.id, kind, text: Voice.render(line.text, { values }) }];
    }).slice(0, 3);
  }
  // What the way is to walk on: a road (and its bridges, fords and causeways), or a path.
  private static way(campaign: Campaign, way: string): string {
    const kind = campaign.world.one('passageKind', way)?.replace(/^.*way_/, '');
    return !kind || ['road', 'bridge', 'ford', 'causeway', 'ferry'].includes(kind) ? 'road' : 'path';
  }
  // Coming in sight of a settlement, by its size; or, after a long day on the road, saying so.
  private static arrival(campaign: Campaign, to: string, ticks: number): [string, Record<string, string>][] {
    const town = this.settlement(campaign, to);
    const size = town && campaign.world.module.relations.some(r => r.name === 'townSize')
      ? campaign.world.one('townSize', town)?.replace(/^size_/, '') : undefined;
    if (size && /_green$/.test(to)) { return [['journey-arrive', { size }]]; }
    return ticks >= 18 ? [['journey-long', {}]] : [];
  }
  // The settlement a place is in, if it is in one.
  private static settlement(campaign: Campaign, id: string): string | undefined {
    const place = campaign.module.entities.find(e => e.id === id);
    const parent = place?.space?.parent ? campaign.module.entities.find(e => e.id === place.space!.parent) : undefined;
    return parent?.space?.kind === 'settlement' ? parent.id : place?.space?.kind === 'settlement' ? place.id : undefined;
  }
  private static chart(campaign: Campaign, from: string, to: string): LandChart | undefined {
    return Object.values(campaign.module.charts ?? {}).find(c => c.roads[from] || c.roads[to]
      || (c.places[from] !== undefined && c.places[to] !== undefined));
  }
  // The cells the way runs over: half the road from the end it leaves, or from one place to the other.
  private static cells(chart: LandChart, from: string, to: string): number[] {
    const road = chart.roads[to] ?? chart.roads[from];
    if (road) {
      const half = Math.ceil(road.length / 2);
      return chart.roads[to] ? road.slice(0, half) : road.slice(-half);
    }
    return [chart.places[from], chart.places[to]].filter((c): c is number => c !== undefined);
  }
  // What the land along the way is, the most telling thing first: water crossed, then the high ground, the fen, the
  // wood, the lake shore; else open fields.
  static land(chart: LandChart, cells: number[]): string {
    const rivers = new Set(chart.rivers.flat()), cover = cells.map(c => chart.cover[c] ?? '.');
    const W = chart.width, shore = cells.some(c => [c - 1, c + 1, c - W, c + W].some(n => chart.cover[n] === 'o'));
    if (cells.some(c => rivers.has(c))) { return 'river'; }
    if (cover.includes('p')) { return 'peak'; }
    if (cover.filter(c => c === 'f' || c === 'h').length * 2 >= cover.length) { return 'fell'; }
    if (cover.filter(c => c === ',').length * 2 >= cover.length) { return 'fen'; }
    if (cover.filter(c => c === 'w').length * 2 >= cover.length) { return 'wood'; }
    return shore ? 'lake' : 'meadow';
  }
}
