import { Emphasis } from '../presentation/emphasis';
import { Signs } from '../presentation/signs';
import { Typography } from '../presentation/typography';
import { TerminalColour } from './terminal-colour';
import type { Instrument } from '../presentation/instruments';
import type { Aspect, Lens } from '../presentation/glance-types';
import type { Menu, Row } from './terminal-picker';
import type { Signed } from './terminal-signs';

// A choice as the terminal lists it (see Terminal): its id, words, minutes, and what the page draws on it.
export interface Listing { id: string; name: string; time: number; aspects?: Aspect[]; signed?: Signed }
// What a scene's picker is made of: the few led with and every legal act, the lens looked through (or the talk), the
// instruments that bear on the moment, and the row the focus was on.
// with: whom the company is speaking with, by name.
export interface Scene {
  first: Listing[]; all: Listing[]; lens?: Lens; with?: string; instruments?: Instrument[]; focus?: string;
}

// The human mode's menus (TP-01), made from what the terminal already lists: a scene's four and the rest of the legal
// acts behind More, an aim to follow, a fight's moves. Nothing is chosen or ranked here: the order and the four are the
// engine's (Glance.offer), and a row says only what the act's own fields say.
export class TerminalMenus {
  // The keys that are commands at rest: the lenses by the page's names for them (GRAMMAR.md: Talk, Go, Look, Wait),
  // the place looked at whole, the map, the company, the aims, a save.
  static readonly lenses: Record<string, Lens> = { t: 'people', g: 'places', l: 'things', w: 'time' };
  private static readonly lensSaid: Record<Lens, string> = { people: 'talk', places: 'go', things: 'look',
    time: 'wait' };
  static scene(s: Scene): Menu {
    const shown = new Set(s.first.map(c => c.id));
    const keys = Object.fromEntries(Object.entries(this.lenses).map(([k, lens]) => [k,
      { command: s.lens === lens ? 'here' : lens, said: this.lensSaid[lens] }]));
    return { rows: s.first.map(c => this.row(c)), rest: s.all.filter(c => !shown.has(c.id)).map(c => this.row(c)),
      info: (s.instruments ?? []).filter(i => i.relevant).map(i => this.instrument(i)),
      ...s.lens ? { title: `${this.lensSaid[s.lens][0]!.toUpperCase()}${this.lensSaid[s.lens].slice(1)}`, back: 'here' }
        : s.with ? { title: `With ${Typography.plain(s.with)}` } : {},
      keys: { ...keys, o: { command: 'look', said: 'look about' }, m: { command: 'map', said: 'map' },
        c: { command: 'character', said: 'company' }, a: { command: 'aims', said: 'aims' },
        s: { command: 'save', said: 'save' } },
      ...s.focus ? { focus: s.focus } : {} };
  }
  // One act as a row: its words, its indicator, and under it what it costs and risks; its whole on asking: what it is
  // to the company (each aspect's word, its colour's first), what it risks, and how it is done.
  static row(c: Listing): Row {
    const signed = c.signed ?? {}, aspects = Emphasis.ranked(c.aspects ?? []);
    const note = [...c.time ? [`${c.time} min`] : [], ...signed.tags ?? [],
      ...signed.sensed && !aspects.length ? [Signs.sensed(signed.sensed)] : [], ...signed.idle ? [Signs.idle] : []];
    const about = [...aspects.length ? [aspects.map(a => Emphasis.words[a]).join(', ')] : [],
      ...signed.crosses ? [Signs.crossing.said] : [], ...signed.hold ? [Signs.hold.said] : []];
    return { id: c.id, label: Typography.plain(c.name), aspects: c.aspects ?? [], signed,
      ...note.length ? { note: note.join(' · ') } : {}, about,
      ...signed.grave ? { ask: this.asked(signed.grave) } : {} };
  }
  // What a grave act says when it is chosen once (the page's Act.asked, its last words the terminal's key).
  private static asked(said: string): string {
    const whole = Typography.plain(said);
    return `${whole.charAt(0).toUpperCase()}${whole.slice(1)}${/[.!?]$/.test(whole) ? '' : '.'}`;
  }
  // An instrument as a row to read, not choose: its emblem, its label and what it reads; its gloss on asking.
  static instrument(i: Instrument): Row {
    const sign = i.emblem ? Signs.emblem(i.emblem) : undefined;
    return { id: `instrument:${i.id}`, label: `${sign ? `${sign} ` : ''}${i.label}: ${Typography.plain(i.said)}`,
      info: true, about: [Typography.plain(i.gloss)] };
  }
  // The aims held, as the Notes list them: one followed by choosing it, the one followed let go by choosing it again.
  static aims(aims: { text: string; followed?: boolean }[]): Menu {
    return { title: 'Aims', back: 'here', rows: aims.map((a, i) => ({ id: a.followed ? 'unfollow' : `follow ${i + 1}`,
      label: Typography.plain(a.text), ...a.followed ? { aspects: ['undertaking' as const],
        note: 'Followed. Choose it to let it go.' } : { note: 'Choose it to follow it.' } })) };
  }
  // The company's state in a fight, in one quiet line each: who, their hurts, what holds them.
  static fighters(state: { combatants: { name: string; hp: number; maxHp: number; team: string;
    statuses: { id: string }[] }[] }, depth: Parameters<typeof TerminalColour.dim>[1]): string[] {
    return state.combatants.map(f => {
      const line = `${f.name} ${f.hp}/${f.maxHp}${f.statuses.length ? ` · ${f.statuses.map(s => s.id).join(', ')}` : ''}`;
      const placed = f.team === 'fighters' ? line : `  ${line}`;
      return f.hp <= 0 ? TerminalColour.dim(placed, depth) : placed;
    });
  }
}
