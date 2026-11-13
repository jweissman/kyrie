import sky from '../../data/imbar/sky.json';
import { Calendar } from '../campaign/calendar';
import { PartyCapabilities } from '../campaign/party-capabilities';
import type { Campaign } from '../campaign/campaign';
import type { Screen } from '../ui/screen-types';

// An instrument of observation, as the company has it now (the owner, 14 November: earned, contextual, optional,
// authoritative and honest): what it reads, in words no more precise than the company could know, the emblem it is
// drawn with, and whether it bears on the moment (a client shows a relevant one on a slow surface, Look, waiting,
// camp, and any the player has pinned; the rest stay out of sight). Its value and what the company may know of it are
// the engine's; a client draws it and estimates nothing.
export interface Instrument { id: 'sky' | 'provisions'; said: string; emblem?: string; relevant: boolean }
// A month of Imbar is a moon: thirty days from new to new.
const phases = ['a new moon', 'a thin crescent moon', 'the moon at its first quarter', 'a waxing moon, near full',
  'the full moon', 'a waning moon', 'the moon at its last quarter', 'an old crescent moon'];

// Two instruments that are earned differently. The sky is seen only in the open, its moon by anyone; the sign
// rising this month is named only by someone who reads the stars (wayfinding, or lore), and is otherwise just stars.
// The provisions are known exactly, for the company can count its own pack; they bear on the moment when they run
// short, or when night or the dark comes on.
export class Instruments {
  static of(campaign: Campaign, screen: Screen): Instrument[] {
    return [...this.sky(campaign, screen), this.provisions(screen)];
  }
  private static sky(campaign: Campaign, screen: Screen): Instrument[] {
    const start = campaign.readout.calendar;
    if (!start || !screen.place.open || screen.place.underground || screen.place.indoors) { return []; }
    const date = Calendar.date(start, campaign.readout.elapsed);
    const dark = ['night', 'evening'].includes(screen.expedition.daylight);
    // By day there is no moon to read nor stars to name; by night the moon, and the sign to one who knows it.
    const sign = this.reader(campaign) ? sky.signs.find(s => s.month === date.name) : undefined;
    const moon = phases[Math.floor(((date.day - 1) / 30) * phases.length) % phases.length]!;
    const said = !dark ? 'Daylight.' : `${moon[0]!.toUpperCase()}${moon.slice(1)}${sign ? `, and ${sign.name} rising` : ''}.`;
    return [{ id: 'sky', said, ...dark && sign ? { emblem: sign.id } : {}, relevant: dark }];
  }
  // Whether anyone of the company reads the stars.
  private static reader(campaign: Campaign): boolean {
    const ids = new Set(campaign.readout.partyIds);
    return campaign.readout.creatures.filter(c => ids.has(c.id))
      .some(c => PartyCapabilities.skilled('wayfinding', c) || PartyCapabilities.skilled('lore', c));
  }
  private static provisions(screen: Screen): Instrument {
    const e = screen.expedition, days = e.rations;
    const food = days < 1 ? 'No food' : `Food for ${days} ${days === 1 ? 'day' : 'days'}`;
    return { id: 'provisions', said: `${food}${e.light ? ` · ${e.light}` : ''}.`,
      relevant: days <= 1 || e.hungry || !!screen.dark || e.daylight === 'night' };
  }
}
