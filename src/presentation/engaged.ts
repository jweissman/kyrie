import type { Act, Screen } from '../ui/screen-types';
import type { Operator } from '../lang/module';
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
// The same narrowing holds for an engagement that is not a threat (OR-173: a hand of cards, a riddle, a performance;
// Screen.engaged, see Engagement): only its own moves, what is done on the place, and the ways out, which are its
// withdrawal; but no wait (nothing is coming on) and no light taken up. A threat comes first: one warning the company
// off cuts into a hand of cards.
// threat: who it is (or what the company is engaged in); here: the things of the place; about: the acts whose words
// name it.
interface At { threats: ReadonlySet<string>; here: ReadonlySet<string>; about: ReadonlySet<string> }
export class Engaged {
  // The one wait offered: standing where the company is, and letting the threat come on.
  static readonly stand = 'Stand your ground';
  static threat(screen: Pick<Screen, 'warned'>): string | undefined { return screen.warned?.id; }
  // Whether the frame is engaged at all, by a threat or an occasion (a riddle put, a hand of cards).
  static holds(screen: Pick<Screen, 'warned' | 'engaged'>): boolean { return this.subjects(screen).length > 0; }
  // Who or what the frame is narrowed to: the threats warning the company off, or else what it is engaged in.
  static subjects(screen: Pick<Screen, 'warned' | 'engaged'>): string[] {
    const by = screen.warned?.id ? screen.warned : screen.engaged;
    return by?.id ? [by.id, ...by.also ?? []] : [];
  }
  // The frame as it is engaged: every act that does not answer the threat taken out of it, and the ways beyond.
  // operators: the campaign's acts, by which an act whose own words name the threat is known for one that answers it
  // (keeping to the old drain's cold side, which the centipede then lets by: tolerates).
  static screen(screen: Screen, operators: readonly Operator[] = []): Screen {
    // Every one warning the company off here is a threat it answers (three dangers at one door).
    const subjects = this.subjects(screen);
    if (!subjects.length) { return screen; }
    const threats = new Set(subjects), named = subjects.map(t => `"${t}"`), fight = !!this.threat(screen);
    // An act on the place is a fight's answer (a way's hazard, a light); a hand of cards has none but its own.
    const at: At = { threats, here: new Set(fight ? screen.things.map(t => t.id) : []),
      about: new Set(operators.filter(o => this.naming(JSON.stringify([o.requires, o.success, o.failure]), named))
        .map(o => o.id)) };
    return { ...screen,
      camp: screen.camp.flatMap(a => a.command !== 'wait' ? this.acts([a], at) : fight ? [{ ...a, label: this.stand }] : []),
      people: screen.people.map(p => threats.has(p.id) ? p : { ...p, acts: this.acts(p.acts, at) }),
      // Engaged in something not a threat, a way out is a way to leave it, nothing done to the way (a padlock tried).
      ...fight ? {} : { things: screen.things.map(t => threats.has(t.id) ? t : { ...t, acts: this.acts(t.acts, at) }),
        exits: screen.exits.map(e => ({ ...e, acts: e.acts.filter(a => this.going(a) || this.names(a, at)) })) },
      items: screen.items.map(i => ({ ...i, acts: i.acts.filter(a => (fight && this.light(a)) || this.names(a, at)) })),
      party: screen.party.map(m => ({ ...m, acts: this.acts(m.acts, at) })),
      unplaced: this.acts(screen.unplaced, at),
      ...screen.aims ? { aims: screen.aims.map(({ follow: _f, ...a }) => a) } : {},
      destinations: [], roads: [], around: [], mapped: [], quarters: [] };
  }
  // Doable's rows as the frame is engaged: only those doing what the frame holds (the glance's offer is read from the
  // campaign, not the frame, and had kept its waits and its search), the short wait worded as standing; never a
  // journey, the world map or an aim.
  static rows(rows: Row[], screen: Screen): Row[] {
    if (!this.subjects(screen).length) { return rows; }
    const fight = !!this.threat(screen);
    const held = new Set(this.commands([screen.camp, screen.unplaced, ...[...screen.people, ...screen.things,
      ...screen.exits, ...screen.items, ...screen.party].map(x => x.acts)].flat()));
    return rows.flatMap(r => this.row(r, held, fight));
  }
  private static row(r: Row, held: ReadonlySet<string>, fight: boolean): Row[] {
    const opens = r.opens?.flatMap(o => this.row(o, held, fight));
    if (r.map || r.chart || /^(travel:|view:|follow:)/.test(r.does ?? '')) { return []; }
    if (r.does === 'wait') { return fight ? [{ ...r, label: this.stand, short: this.stand }] : []; }
    if (r.does && held.has(r.does)) { return [{ ...r, ...opens ? { opens } : {} }]; }
    return opens?.length ? [{ ...r, opens }] : [];
  }
  private static commands(acts: Act[]): string[] {
    return acts.flatMap(a => [...a.command ? [a.command] : [], ...this.commands(a.children ?? [])]);
  }
  private static acts(acts: Act[], at: At): Act[] {
    return acts.flatMap(a => {
      if (this.names(a, at) || (a.targets ?? []).some(t => at.here.has(t))) { return [a]; }
      const children = a.children ? this.acts(a.children, at) : [];
      return children.length ? [{ ...a, children }] : [];
    });
  }
  // Done to the threat: it is among what the act binds, or the act's own condition or changes name it.
  private static names(a: Act, at: At): boolean {
    const command = a.command ?? '';
    return (a.targets ?? []).some(t => at.threats.has(t)) || at.about.has(command.split('(')[0]!)
      || (/\(([^)]*)\)/.exec(command)?.[1]?.split(',') ?? []).some(x => at.threats.has(x));
  }
  private static going(a: Act): boolean { return /^(go|enter|leave|exit)\(/.test(a.command ?? ''); }
  private static naming(words: string, named: string[]): boolean { return named.some(n => words.includes(n)); }
  // What the company takes up against it: a light (what fears flame), a weapon or armour readied (the king-barrow's
  // bane, equipped as the king warns).
  private static light(a: Act): boolean { return /^(light_item|equip_item)\(/.test(a.command ?? ''); }
}
