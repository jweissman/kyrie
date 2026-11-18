import type { Campaign } from '../campaign/campaign';
import type { CampaignEvent } from '../campaign/campaign-types';
import { Voice } from './voice';
import { Editor } from './editor';
import { Journeys } from './journeys';
import { Narrator } from '../presentation/narrator';
import type { Voiced } from './telling';

// The day's turn as a wait comes to it (data/voice/day.json): first light, or dark, told by where the company waits
// and the sky over it, and not as it was told the last time while another line fits (the boredom census, BO-08: "The
// sky greys, then lightens. It is morning." 23 times in eight walks). What the campaign has told (used, from its
// history: see Telling) is the record; the line told stands for the wait's own result (see ActionFeedbackView).
export class Days {
  static readonly kinds: Record<string, string> = { wait_for_light: 'day-dawn', wait_for_dark: 'day-dusk' };
  static tell(campaign: Campaign, event: CampaignEvent, used: Set<string>): Voiced[] {
    const kind = this.kinds[campaign.operator(event.action)?.schema ?? ''];
    if (!kind || event.result !== 'success' || event.cut) { return []; }
    const at = campaign.world.one('at', campaign.playerActor ?? 'party');
    const shelter = (at && Narrator.shelter(campaign, at)) ?? 'outdoors';
    const context = { shelter, ...shelter === 'outdoors' ? { sky: Journeys.sky(campaign, at ?? '', event.elapsed) } : {} };
    // The closest fit not said yet, else a looser one not said yet, else the closest said longest ago.
    const tiers = Voice.tiers(kind, context), pool = tiers.find(t => t.some(l => !used.has(l.id))) ?? tiers[0] ?? [];
    const line = Editor.choose(pool, `${campaign.readout.seed}:${event.elapsed}:${kind}`, used);
    if (!line) { return []; }
    Editor.said(used, line.id);
    return [{ id: line.id, kind, text: line.text }];
  }
  // The day's turn told of a command, if one was: what the wait came to, in place of its own words.
  static told(event: CampaignEvent): string | undefined {
    return event.voiced?.find(v => v.kind.startsWith('day-'))?.text;
  }
}
