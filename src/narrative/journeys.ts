import type { Campaign } from '../campaign/campaign';
import type { CampaignEvent } from '../campaign/campaign-types';
import type { LandChart } from '../lang/module';
import { ModuleWriter } from '../lang/module-writer';
import { FictionalTime } from '../presentation/fictional-time';
import { Voice } from './voice';
import { Editor } from './editor';
import { Narrator } from '../presentation/narrator';
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
    // A way within one town sets out from the place, not the town ("You go out of Merrow" from the Hall yard to the
    // green).
    const [town, there] = [this.settlement(campaign, from), this.settlement(campaign, to)];
    const values = { from: Editor.called(campaign, town && town !== there ? town : from),
      to: Editor.called(campaign, there ?? to), way: this.way(campaign, way) };
    const sky = world.related('state').find(r => /(^|__)sky$/.test(r.args[0]!))?.args[1]?.replace(/^.*weather_/, '');
    // A way taken before is not told again: setting out and the light going, not the land it runs through nor coming
    // in sight of its end (the follow-up review read familiar journeys in full).
    const again = campaign.history.some(e => e.elapsed < event.elapsed && e.result === 'success'
      && /^go\(/.test(e.action) && e.action.split(',')[1] === way);
    // Under the ground the hour and the sky are not seen: a way between underground places is told as it is there.
    if (this.below(campaign, way, from, to)) {
      return this.going(campaign, event, from, start) ? [] : this.voiced({ moment: `${campaign.readout.seed}:${event.elapsed}`,
        used, values }, [['journey-depart', { shelter: 'underground' }]]);
    }
    const kinds: [string, Record<string, string>][] = [
      ...this.going(campaign, event, from, start) ? [] : [['journey-depart', { time: FictionalTime.part(start),
        sky: this.skies[sky ?? ''] ?? 'fair', ...FictionalTime.early(start) ? { light: 'early' } : {} }] as
        [string, Record<string, string>]],
      ...chart && !again ? [['journey-land', this.ground(campaign, chart, { way, from, to })] as
        [string, Record<string, string>]] : [],
      ...!FictionalTime.dark(start) && FictionalTime.dark(event.elapsed) ? [['journey-dark', {}] as [string, Record<string, string>]] : [],
      ...again ? [] : this.arrival(campaign, to, ticks)];
    // The land is not told again as it was told a leg or two back (the river crossed twice over in one journey).
    const recent = new Set(campaign.history.filter(e => e.elapsed < event.elapsed).slice(-4)
      .flatMap(e => (e.voiced ?? []).map(v => v.id)));
    return this.voiced({ moment: `${campaign.readout.seed}:${event.elapsed}`, used, values, recent }, kinds);
  }
  // Whether a way runs under the ground: both its ends are, or it is a tunnel, culvert, crawl, shaft or drift.
  static below(campaign: Campaign, way: string, from: string, to: string): boolean {
    const kind = campaign.world.one('passageKind', way)?.replace(/^.*way_/, '') ?? '';
    return ['tunnel', 'culvert', 'crawl', 'shaft', 'drift'].includes(kind)
      || [from, to].every(p => Narrator.shelter(campaign, p) === 'underground');
  }
  private static voiced(at: { moment: string; used: Set<string>; values: Record<string, string>; recent?: Set<string> },
    kinds: [string, Record<string, string>][]): Voiced[] {
    const { moment, used, values, recent } = at;
    // The closest fit not yet said; a looser fit not yet said before a close one said again.
    return kinds.flatMap(([kind, context]) => {
      const tiers = Voice.tiers(kind, context), pool = tiers.find(t => t.some(l => !used.has(l.id))) ?? tiers[0] ?? [];
      const line = Editor.choose(pool, `${moment}:${kind}`, used);
      if (!line || (kind === 'journey-land' && recent?.has(line.id))) { return []; }
      Editor.said(used, line.id);
      return [{ id: line.id, kind, text: Voice.render(line.text, { values }) }];
    }).slice(0, 3);
  }
  // Going on from where the last way brought the company, in the same part of the day, it is still on its way, and
  // does not set out again (the M16 free play read "You set out from … and the rain sets out with you" on four legs
  // running).
  private static going(campaign: Campaign, event: CampaignEvent, from: string, start: number): boolean {
    const last = campaign.history.filter(e => e.elapsed < event.elapsed).at(-1);
    const [, , way, , to] = /^go\(([^,]+),([^,]+),([^,]+),([^)]+)\)$/.exec(last?.action ?? '') ?? [];
    // A journey's leg, not a step out of a door.
    const came = last?.result === 'success' && to === from
      && campaign.world.number(ModuleWriter.call('travelTime', way!)) >= 3;
    return came && FictionalTime.part(last!.elapsed) === FictionalTime.part(start);
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
  // The land a way runs through, and how it crosses water when it does: by the bridge, ford or ferry the road comes to,
  // the way itself or the next from its room in the wild (the M16 free play crossed the bridge over the Karnahar
  // "with your boots full").
  private static ground(campaign: Campaign, chart: LandChart, leg: { way: string; from: string; to: string }):
    Record<string, string> {
    const land = this.land(chart, this.cells(chart, leg.from, leg.to));
    if (land !== 'river') { return { land }; }
    const room = [leg.to, leg.from].find(p => !this.settlement(campaign, p));
    const next = room ? campaign.world.related('connects').filter(r => r.args[1] === room).map(r => r.args[0]!) : [];
    const crossing = [leg.way, ...next].map(p => this.kind(campaign, p)).find(k => ['bridge', 'ford', 'ferry'].includes(k));
    return crossing ? { land, crossing } : { land };
  }
  private static kind(campaign: Campaign, passage: string): string {
    return campaign.world.one('passageKind', passage)?.replace(/^.*way_/, '') ?? '';
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
