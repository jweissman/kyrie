import type { Campaign } from '../campaign/campaign';
import type { CampaignEvent } from '../campaign/campaign-types';
import { Calendar } from '../campaign/calendar';
import { SettingPort } from '../setting-port';
import { Voice } from './voice';
import { Editor } from './editor';
import { Journeys } from './journeys';
import type { Voiced } from './telling';

// The night sky as it is tonight, told when the company lies back to watch it (watch_sky; Fun Friday, 20 November:
// doc/design/fun-fridays.md). Written once in data/voice/day.json (kind sky) and chosen by what is so: the weather
// (Journeys.sky), the sign that rides this month by the campaign's calendar (the setting's sky, through its port),
// and whether it is the sign one of the company was born under. Not the same line twice running while another fits
// (see Days).
export class NightSkies {
  static readonly kind = 'sky';
  static tell(campaign: Campaign, event: CampaignEvent, used: Set<string>): Voiced[] {
    if (campaign.operator(event.action)?.schema !== 'watch_sky' || event.result !== 'success') { return []; }
    const at = campaign.world.one('at', campaign.playerActor ?? 'party') ?? '';
    const riding = this.riding(campaign, event.elapsed), born = riding && this.born(campaign, riding.id);
    const context = { sky: Journeys.sky(campaign, at, event.elapsed), ...riding ? { riding: 'yes' } : {},
      ...born ? { own: 'yes' } : {} };
    const tiers = Voice.tiers(this.kind, context);
    const pool = tiers.find(t => t.some(l => !used.has(l.id))) ?? tiers[0] ?? [];
    const line = Editor.choose(pool, `${campaign.readout.seed}:${event.elapsed}:${this.kind}`, used);
    if (!line) { return []; }
    Editor.said(used, line.id);
    const values = { ...riding ? { sign: riding.name, signline: riding.line } : {}, ...born ? { who: born } : {} };
    return [{ id: line.id, kind: this.kind, text: Voice.render(line.text, { actor: '', values }) }];
  }
  // The sign riding the sky this month, where the campaign keeps a calendar and the setting a sky.
  static riding(campaign: Campaign, elapsed: number): { id: string; name: string; line: string } | undefined {
    const start = campaign.readout.calendar;
    if (!start) { return undefined; }
    const month = Calendar.date(start, elapsed).name, sign = SettingPort.sky.signs.find(s => s.month === month);
    return sign && { id: sign.id, name: sign.name, line: sign.line };
  }
  // Who of the company was born under that sign, by name, if any: the first of them.
  private static born(campaign: Campaign, sign: string): string | undefined {
    const company = campaign.playerActor ?? 'party', world = campaign.world;
    const members = [company, ...world.related('memberOf').filter(r => r.args[1] === company).map(r => r.args[0]!)];
    const ids = members.flatMap(m => campaign.readout.inhabitants?.[m] ?? []);
    return campaign.readout.creatures.find(c => ids.includes(c.id) && c.sign === sign)?.name;
  }
}
