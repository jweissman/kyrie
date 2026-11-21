import type { Act, Screen } from '../ui/screen-types';
import type { Row } from './doable';

// An engagement, as the engine's state (OR-163; the owner, 17 November and 20 November late: with a live threat the
// company may only respond to it, not carry on as before). The threat is whoever is warning the company off where it
// stands, until they come on (Screen.warned: Patience, data/rules/inhabitants.kyr's warned). While it stands the
// frame offers only the responses to it: what is done to the threat itself (an attack, a spell, a price paid, a
// word), an act on the place (on a thing here, a way's hazard, a light: what fears flame is driven off by it), flight
// (a way out of the place, within its hex), and standing one's ground (the short wait, which lets the threat come
// on). No other wait, no search, no camp, no aim taken up, no talk with anyone else, no journey beyond the hex, and no
// world map: the company resolves what is in front of it. Read into the Screen itself (ScreenModel), so that the scene,
// the glance, Doable and every client built on them offer the same few and none can offer more.
export class Engaged {
  // The one wait offered: standing where the company is, and letting the threat come on.
  static readonly stand = 'Stand your ground';
  static threat(screen: Pick<Screen, 'warned'>): string | undefined { return screen.warned?.id; }
  // The frame as it is engaged: every act that does not answer the threat taken out of it, and the ways beyond.
  static screen(screen: Screen): Screen {
    const threat = this.threat(screen);
    if (!threat) { return screen; }
    const here = new Set(screen.things.map(t => t.id));
    return { ...screen, camp: screen.camp.flatMap(a => a.command === 'wait' ? [{ ...a, label: this.stand }] : []),
      people: screen.people.map(p => p.id === threat ? p : { ...p, acts: this.acts(p.acts, threat, here) }),
      items: screen.items.map(i => ({ ...i, acts: i.acts.filter(a => this.light(a) || this.names(a, threat)) })),
      party: screen.party.map(m => ({ ...m, acts: this.acts(m.acts, threat, here) })),
      unplaced: this.acts(screen.unplaced, threat, here),
      ...screen.aims ? { aims: screen.aims.map(({ follow: _f, ...a }) => a) } : {},
      destinations: [], roads: [], around: [], mapped: [], quarters: [] };
  }
  // Doable's rows as the frame is engaged: only those doing what the frame holds (the glance's offer is read from the
  // campaign, not the frame, and had kept its waits and its search), the short wait worded as standing; never a
  // journey, the world map or an aim.
  static rows(rows: Row[], screen: Screen): Row[] {
    if (!this.threat(screen)) { return rows; }
    const held = new Set(this.commands([screen.camp, screen.unplaced, ...[...screen.people, ...screen.things,
      ...screen.exits, ...screen.items, ...screen.party].map(x => x.acts)].flat()));
    return rows.flatMap(r => this.row(r, held));
  }
  private static row(r: Row, held: ReadonlySet<string>): Row[] {
    const opens = r.opens?.flatMap(o => this.row(o, held));
    if (r.map || r.chart || /^(travel:|view:|follow:)/.test(r.does ?? '')) { return []; }
    if (r.does === 'wait') { return [{ ...r, label: this.stand, short: this.stand }]; }
    if (r.does && held.has(r.does)) { return [{ ...r, ...opens ? { opens } : {} }]; }
    return opens?.length ? [{ ...r, opens }] : [];
  }
  private static commands(acts: Act[]): string[] {
    return acts.flatMap(a => [...a.command ? [a.command] : [], ...this.commands(a.children ?? [])]);
  }
  private static acts(acts: Act[], threat: string, here: ReadonlySet<string>): Act[] {
    return acts.flatMap(a => {
      if (this.names(a, threat) || (a.targets ?? []).some(t => here.has(t))) { return [a]; }
      const children = a.children ? this.acts(a.children, threat, here) : [];
      return children.length ? [{ ...a, children }] : [];
    });
  }
  private static names(a: Act, threat: string): boolean {
    return (a.targets ?? []).includes(threat) || (/\(([^)]*)\)/.exec(a.command ?? '')?.[1]?.split(',') ?? [])
      .includes(threat);
  }
  // What the company takes up against it: a light (what fears flame), a weapon or armour readied (the king-barrow's
  // bane, equipped as the king warns).
  private static light(a: Act): boolean { return /^(light_item|equip_item)\(/.test(a.command ?? ''); }
}
