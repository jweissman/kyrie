import { SettingPort } from '../setting-port';
import voice from '../../data/voice/instruments.json';
import { Calendar } from '../campaign/calendar';
import { PartyCapabilities } from '../campaign/party-capabilities';
import type { Campaign } from '../campaign/campaign';
import { CompanySenses } from './company-senses';
import type { Screen } from '../ui/screen-types';
import { Narrator } from './narrator';

// An instrument of observation, as the company has it now (the owner, 14 November: earned, contextual, optional,
// authoritative and honest): what it reads, in words no more precise than the company could know, the emblem it is
// drawn with, and whether it bears on the moment (a client shows a relevant one on a slow surface, Look, waiting,
// camp, and any the player has pinned; the rest stay out of sight). Its value and what the company may know of it are
// the engine's; a client draws it and estimates nothing.
// Its label and gloss say what it reports (data/voice/instruments.json), and what the sign named means where one is.
export interface Instrument { id: 'sky' | 'provisions'; label: string; gloss: string; said: string; emblem?: string;
  name?: string; relevant: boolean }
// A month of Imbar is a moon: thirty days from new to new.
const phases = ['a new moon', 'a thin crescent moon', 'the moon at its first quarter', 'a waxing moon, near full',
  'the full moon', 'a waning moon', 'the moon at its last quarter', 'an old crescent moon'];

// Two instruments that are earned differently. The sky is seen only in the open, its moon by anyone; the sign
// rising this month is named only by someone who reads the stars (wayfinding, or lore), and is otherwise just stars.
// The provisions are known exactly, for the company can count its own pack; they bear on the moment when they run
// short, or when night or the dark comes on.
// The night sky as the company reads it (see Instruments.night).
export interface Night { dark: boolean; moon: string; sign?: { id: string; name: string; line: string };
  own?: { name: string; alone: boolean } }
export class Instruments {
  static of(campaign: Campaign, screen: Screen): Instrument[] {
    return [...this.sky(campaign, screen), this.provisions(screen)];
  }
  private static named(id: Instrument['id'], extra?: string): Pick<Instrument, 'label' | 'gloss'> {
    const v = (voice.instruments as Record<string, { label: string; gloss: string }>)[id]!;
    return { label: v.label, gloss: extra ? `${v.gloss} ${extra}` : v.gloss };
  }
  // The night sky as the company reads it, the one reading the instrument says and the night's telling tells (Fun
  // Friday's night sky: src/narrative/night-skies.ts): out under the sky only; the moon by its phase; the sign rising
  // this month named only by one who reads the stars; and whose sign it is, of the company's (chosen at creation:
  // OR-13), one who came alone told of their own.
  // Of a place and the hour as the screen says them, never the screen itself: the night's telling reads it in the
  // middle of the act that watches the sky, when no frame may be built (MT-24).
  static night(campaign: Campaign, at: { place: string; daylight: string }): Night | undefined {
    const start = campaign.readout.calendar;
    // Under the sky as the narrator reckons it (Narrator.shelter): a town's green declares no shelter and is out of
    // doors (the instrument had read only places that declare themselves open: Porthalen's green had no sky at night).
    if (!start || Narrator.shelter(campaign, at.place) !== 'outdoors') { return undefined; }
    const date = Calendar.date(start, campaign.readout.elapsed);
    const dark = ['night', 'evening'].includes(at.daylight);
    const sign = this.reader(campaign) ? SettingPort.sky.signs.find(s => s.month === date.name) : undefined;
    const moon = phases[Math.floor(((date.day - 1) / 30) * phases.length) % phases.length]!;
    const own = sign && this.born(campaign, sign.id);
    return { dark, moon, ...sign ? { sign: { id: sign.id, name: sign.name, line: sign.line } } : {},
      ...own ? { own } : {} };
  }
  private static sky(campaign: Campaign, screen: Screen): Instrument[] {
    const n = this.night(campaign, { place: screen.place.id, daylight: screen.expedition.daylight });
    if (!n) { return []; }
    const whose = n.own && (n.own.alone ? 'your own sign' : `${n.own.name}'s own sign`);
    const said = !n.dark ? 'Daylight.'
      : `${n.moon[0]!.toUpperCase()}${n.moon.slice(1)}${n.sign ? `, and ${n.sign.name} rising${whose ? `, ${whose}` : ''}`
        : ''}.`;
    const told = n.dark && n.sign ? `${n.sign.name}: ${n.sign.line}` : undefined;
    return [{ id: 'sky', ...this.named('sky', told), said, ...n.dark && n.sign
      ? { emblem: n.sign.id, name: n.sign.name.replace(/^the /i, '') } : {}, relevant: n.dark }];
  }
  // Whose sign it is, of the company's, if one was born under it: by name, and whether they came alone.
  private static born(campaign: Campaign, sign: string): Night['own'] {
    const ids = campaign.readout.partyIds;
    const under = campaign.readout.creatures.find(c => ids.includes(c.id) && c.sign === sign);
    return under && { name: under.name, alone: ids.length === 1 };
  }
  // Whether anyone of the company reads the stars: trained in Astronomy (or the wayfinding and lore that read them
  // too), or granted the capability by the world (the old orrery turned: the company's, where training is one's own).
  private static readonly readers = ['astronomy', 'wayfinding', 'lore'];
  private static reader(campaign: Campaign): boolean {
    const ids = new Set(campaign.readout.partyIds), who = campaign.playerActor ?? 'party';
    return CompanySenses.capable(campaign, who, 'astronomy')
      || campaign.readout.creatures.filter(c => ids.has(c.id))
        .some(c => Instruments.readers.some(skill => PartyCapabilities.skilled(campaign.catalog, skill, c)));
  }
  private static provisions(screen: Screen): Instrument {
    const e = screen.expedition, days = e.rations;
    const food = days < 1 ? 'No food' : `Food for ${days} ${days === 1 ? 'day' : 'days'}`;
    return { id: 'provisions', ...this.named('provisions'), said: `${food}${e.light ? ` · ${e.light}` : ''}.`,
      relevant: days <= 1 || e.hungry || !!screen.dark || e.daylight === 'night' };
  }
}
