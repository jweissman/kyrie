import { ScreenModel } from '../ui/screen-model';
import { LandCrossing } from '../ui/land-crossing';
import type { PlaySession } from '../session/play-session';

// The terminal's books, said as text where the page opens a page: the map's places and journeys, and who the company
// is. Read from the same screen the page draws (ScreenModel).
export class TerminalBooks {
  // The places known; and, typed, the journeys and crossings in a line each (the human mode picks among them).
  static map(session: PlaySession, journeys = true) {
    const screen = ScreenModel.build(session.campaign);
    console.log(`\nMap — ${screen.place.name}`);
    for (const p of screen.map) { console.log(`${p.here ? '*' : p.visited ? '·' : '?'} ${p.name}${p.zone ? ` — ${p.zone}` : ''}`); }
    if (!journeys) { return; }
    const destinations = [...screen.destinations ?? [], ...screen.around ?? [], ...screen.roads ?? []];
    if (destinations.length) { console.log(`Journeys: ${destinations.map(d => d.name).join(' · ')}`); }
    const across = LandCrossing.offers(screen);
    if (across.length) { console.log(`Across country: ${across.map(x => x.name).join(' · ')}`); }
  }
  static dossier(session: PlaySession) {
    const screen = ScreenModel.build(session.campaign);
    for (const m of screen.party) {
      // Who they are first, as the page draws it (people and calling), then the level and what they were before: an
      // elf thief had been "level 1, Drifter", a mage "Trader" (round 12, B; M21's cold mage).
      console.log(`\n${m.name} — ${m.line}, level ${m.level}${m.background ? ` · ${m.background}` : ''}`);
      console.log(`HP ${m.hp}/${m.maxHp} · mana ${m.mana}/${m.maxMana} · XP ${m.experience}`);
      console.log(Object.entries(m.attributes).map(([k, v]) => `${k} ${v}`).join(' · '));
      if (m.conditions.length || m.boons?.length) { console.log(`Conditions: ${[...m.conditions, ...m.boons ?? []].join(', ')}`); }
      if (m.spells?.length) { console.log(`Spells: ${m.spells.map(s => `${s.name}${s.ready ? '' : ' (spent)'}`).join(', ')}`); }
    }
    console.log(`Coin ${screen.purse.coin} · rations ${screen.purse.rations}`);
  }
}
