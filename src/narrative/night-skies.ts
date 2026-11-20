import type { Campaign } from '../campaign/campaign';
import type { CampaignEvent } from '../campaign/campaign-types';
import { Instruments } from '../presentation/instruments';
import { ScreenModel } from '../ui/screen-model';
import { Voice } from './voice';
import { Editor } from './editor';
import { Journeys } from './journeys';
import type { Voiced } from './telling';

// The night sky as it is tonight, told when the company lies back to watch it (watch_sky; Fun Friday, 20 November:
// doc/design/fun-fridays.md), read from the sky instrument and nothing else (Instruments.night): the moon by its phase,
// the sign rising this month only where one of the company reads the stars, and whose sign it is. So the telling and
// the instrument the page shows never disagree (the owner, 20 November: does the night sky use our sky instrument?).
// Written once in data/voice/day.json (kind sky) and chosen by what is so, the weather too (Journeys.sky); not the
// same line twice running while another fits (see Days).
export class NightSkies {
  static readonly kind = 'sky';
  static tell(campaign: Campaign, event: CampaignEvent, used: Set<string>): Voiced[] {
    if (campaign.operator(event.action)?.schema !== 'watch_sky' || event.result !== 'success') { return []; }
    const night = Instruments.night(campaign, ScreenModel.build(campaign));
    if (!night) { return []; }
    const at = campaign.world.one('at', campaign.playerActor ?? 'party') ?? '';
    const context = { sky: Journeys.sky(campaign, at, event.elapsed), ...night.sign ? { riding: 'yes' } : {},
      ...night.own ? { own: night.own.alone ? 'mine' : 'yes' } : {} };
    const tiers = Voice.tiers(this.kind, context);
    const pool = tiers.find(t => t.some(l => !used.has(l.id))) ?? tiers[0] ?? [];
    const line = Editor.choose(pool, `${campaign.readout.seed}:${event.elapsed}:${this.kind}`, used);
    if (!line) { return []; }
    Editor.said(used, line.id);
    const values = { moon: night.moon, ...night.sign ? { sign: night.sign.name, signline: night.sign.line } : {},
      ...night.own ? { who: night.own.name } : {} };
    return [{ id: line.id, kind: this.kind, text: Voice.render(line.text, { actor: '', values }) }];
  }
}
