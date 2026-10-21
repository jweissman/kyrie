import type { Act, CombatScreen, ExitRow, ItemRow, MemberRow, Screen, TargetRow } from './screen-types';

export type Tone = 'way' | 'person' | 'creature' | 'thing' | 'company' | 'item' | 'member' | 'ability' | 'spell';
// One thing the player can choose. A choice either performs its command when chosen or opens a short list of
// further choices (who carries the torch, which goods to buy). A disabled choice says why it cannot be done.
export interface Choice {
  id: string; label: string; tone: Tone;
  command?: string; children?: Choice[];
  note?: string; about?: string; risk?: boolean; minutes?: number; disabled?: string;
}
// What the choices are about: a person, a creature, a thing, the ways out, the company itself.
export interface Section {
  id: string; title: string; tone: Tone; glyph: string; note?: string; about?: string; choices: Choice[];
}

// The play screen as direct choices, built only from the screen model's legal commands. It never adds, removes or
// reinterprets a command; it decides how they read and in what order: who and what is here first, then the ways
// on, then what the company can do by itself.
export class ChoiceList {
  static readonly glyphs: Record<string, string> = {
    walk: '→', enter: '⇥', leave: '⇤', level: '⇅', ascend: '↑', descend: '↓', travel: '⇢', cross_plane: '✶',
  };
  static explore(screen: Screen): Section[] {
    const merchants = screen.people.some(p => p.acts.some(a => a.label === 'Buy'));
    const things = screen.things.filter(t => !(merchants && t.acts.length && t.acts.every(a => a.label.startsWith('Buy from'))));
    return [
      ...[...screen.people, ...things].map(t => this.subject(t)),
      ...(screen.exits.length ? [this.ways(screen.exits)] : []),
      ...(screen.camp.length || screen.unplaced.length ? [{ id: 'company', title: 'The company', tone: 'company' as const,
        glyph: '○', choices: this.flatten([...screen.camp, ...screen.unplaced], 'company', 'company') }] : []),
    ];
  }
  static subject(t: TargetRow): Section {
    const tone: Tone = t.kind === 'person' ? 'person' : t.kind === 'creature' ? 'creature' : 'thing';
    const glyph = t.state ? '✝' : tone === 'person' ? '☺' : tone === 'creature' ? '◆' : t.kind === 'feature' ? '▣' : '·';
    const note = [t.activity ?? t.note, t.state === 'dead' ? 'dead' : t.state ? 'down' : ''].filter(Boolean).join(' · ');
    const about = [t.look, t.activity ? `${t.name.split(', ')[0]}: ${t.activity}.` : ''].filter(Boolean).join(' ');
    return { id: t.id, title: t.name, tone, glyph, ...(note ? { note } : {}), ...(about ? { about } : {}),
      choices: this.flatten(t.acts, t.id, tone) };
  }
  static ways(exits: ExitRow[]): Section {
    const labels = exits.map(e => this.wayLabel(e));
    // Two ways into the same enclosure (a tower by its door and by its well) are told apart by where they arrive.
    const twice = new Set(labels.filter((l, i) => labels.indexOf(l) !== i));
    const choices = exits.flatMap((e, i) => {
      const label = twice.has(labels[i]!) ? `${labels[i]}: ${e.destination.name}` : labels[i]!;
      return this.way(e, label);
    });
    return { id: 'ways', title: 'Ways on', tone: 'way', glyph: '→', choices };
  }
  private static way(e: ExitRow, label: string): Choice[] {
    const about = this.wayAbout(e), id = e.id, minutes = this.longest(e.acts);
    const note = [minutes > 10 ? this.minutes(minutes) : '', e.visited ? '' : 'new'].filter(Boolean).join(' · ');
    if (!e.acts.length) {
      return [{ id, label, tone: 'way', disabled: e.blocked ?? 'Not possible from here right now.', about,
        note: 'barred' }];
    }
    // A way with one thing to do, and that thing is to go, is just the way; anything else (open the door, risk the
    // pit) is said, so a choice never pretends to lead somewhere it does not.
    const only = e.acts.length === 1 && !e.acts[0]!.children && this.moves(e.acts[0]!) ? e.acts[0]! : undefined;
    if (only) {
      return [{ id, label, tone: 'way', ...(only.command ? { command: only.command } : {}), about: only.about ?? about,
        ...(note ? { note } : {}), ...(only.minutes ? { minutes: only.minutes } : {}),
        ...(only.risk ? { risk: true } : {}) }];
    }
    // Several ways to act on one passage (go by the shaft or the postern; risk the pit or disarm it) each stand alone.
    return e.acts.map(a => {
      const c = this.choice(a, id, 'way');
      const how = this.moves(a) && !a.label.startsWith('Go by ') ? label : a.label.startsWith('Go by ') ? `${label}, ${a.label.slice(3)}`
        : `${label} — ${c.label.charAt(0).toLowerCase()}${c.label.slice(1)}`;
      const told = c.disabled ? c.note : [c.note, e.visited ? '' : 'new'].filter(Boolean).join(' · ');
      return { ...c, label: how, about: c.about ?? about, ...(told && !c.children ? { note: told } : {}) };
    });
  }
  private static moves(a: Act): boolean { return a.label === 'Go' || a.label === 'Walk'; }
  static wayLabel(e: ExitRow): string {
    const room = this.inline(e.destination.name);
    switch (e.transition) {
      case 'enter': return `Into ${this.inline(e.scope ?? room)}`;
      case 'leave': return `Out to ${room}`;
      case 'ascend': return `Up to ${room}`;
      case 'descend': return `Down to ${room}`;
      case 'cross_plane': return `Through to ${room}`;
      default: return `To ${room}`;
    }
  }
  private static wayAbout(e: ExitRow): string {
    const room = e.destination.name, minutes = this.longest(e.acts);
    const span = minutes > 10 ? `, ${this.span(minutes)} away` : ', a few steps away';
    const how = e.way ? ` by ${e.way}` : '';
    const where = { walk: `${this.upper(room)}${span}${how}.`, enter: `Into ${e.scope ?? room}: ${room}.`,
      leave: `Out of here, to ${room}${e.scope ? ` in ${e.scope}` : ''}.`, level: `To ${e.scope ?? 'another level'}: ${room}.`,
      ascend: `Up to ${room}.`, descend: `Down to ${room}.`,
      travel: `Across country to ${room}${e.scope ? `, ${e.scope}` : ''}${minutes > 10 ? ` (${this.span(minutes)})` : ''}${how}.`,
      cross_plane: `Across a planar threshold to ${room}.` }[e.transition];
    return [where, e.via && e.via !== e.way ? `The way runs past ${e.via}.` : '', e.hazard ?? e.blocked ?? '']
      .filter(Boolean).join(' ');
  }
  // A list of acts as choices. "Talk" is transparent: its topics are things to say, so they stand as choices.
  static flatten(acts: Act[], prefix: string, tone: Tone): Choice[] {
    return acts.flatMap(a => a.label === 'Talk' && a.children ? this.flatten(a.children, `${prefix}/${a.key}`, tone)
      : [this.choice(a, prefix, tone)]);
  }
  static choice(a: Act, prefix: string, tone: Tone): Choice {
    const id = `${prefix}/${a.key}`;
    if (a.children?.length === 1) {
      // A list of one is no choice: "Take › for Bran" is "Take for Bran".
      const only = this.choice(a.children[0]!, id, tone);
      return { ...only, id, label: `${a.label} ${only.label}` };
    }
    if (a.children) {
      return { id, label: a.label, tone, children: a.children.map(c => this.choice(c, id, tone)),
        ...(a.about ? { about: a.about } : {}), ...(a.risk ? { risk: true } : {}) };
    }
    // A skilled choice names who does it; one the company cannot make says what it needs.
    const note = a.disabled ? 'no one can' : [a.minutes && a.minutes > 10 ? this.minutes(a.minutes) : '', a.by?.join(', ') ?? '']
      .filter(Boolean).join(' · ');
    return { id, label: a.label, tone, ...(a.command ? { command: a.command } : {}), ...(note ? { note } : {}),
      ...(a.minutes ? { minutes: a.minutes } : {}), ...(a.about ? { about: a.about } : {}),
      ...(a.risk ? { risk: true } : {}), ...(a.disabled ? { disabled: a.disabled } : {}) };
  }
  // The pack: each companion's things, and what each can do with them.
  static pack(screen: Screen): Section[] {
    const owners = [...new Set(screen.items.map(i => i.owner))];
    return [
      ...owners.map(owner => {
        const items = screen.items.filter(i => i.owner === owner);
        return { id: `pack:${owner}`, title: `${items[0]!.ownerName} carries`, tone: 'item' as const, glyph: '○',
          choices: items.map(i => this.item(i)) };
      }),
      ...this.tending(screen.party),
    ];
  }
  private static item(i: ItemRow): Choice {
    const note = i.equipped ? `in use${i.slot ? ` · ${i.slot}` : ''}` : i.slot ?? '';
    const base = { id: i.id, label: i.name, tone: 'item' as const, about: `${i.description}${i.equipped ? ' In use.' : ''}`,
      ...(note ? { note } : {}) };
    return i.acts.length ? { ...base, children: this.flatten(i.acts, i.id, 'item') } : base;
  }
  private static tending(party: MemberRow[]): Section[] {
    const tenders = party.filter(m => m.acts.length);
    if (!tenders.length) { return []; }
    return [{ id: 'tend', title: 'Tend the company', tone: 'member', glyph: '✚',
      choices: tenders.flatMap(m => this.flatten(m.acts, `tend:${m.id}`, 'member')
        .map(c => ({ ...c, label: `${m.name}: ${c.label}` }))) }];
  }
  static party(screen: Screen): Section[] {
    return [{ id: 'party', title: 'The company', tone: 'member', glyph: '☺', choices: screen.party.map(m => ({
      id: m.id, label: m.name, tone: 'member' as const, note: `${m.line} · level ${m.level}`,
      ...(m.hp ? {} : { about: `${m.name} is down.` }),
      ...(m.acts.length ? { children: this.flatten(m.acts, m.id, 'member') } : {}) })) }];
  }
  // The acting companion's options in the order a player reaches for them: strike, abilities, spells, then defend,
  // wait or withdraw. Targeted options open the list of eligible targets.
  static combat(c: CombatScreen): Section[] {
    if (!c.ours || c.outcome) { return []; }
    const titles: Record<string, string> = { strike: 'Strike', abilities: 'Abilities', spells: 'Spells',
      other: 'Defend, wait or withdraw' };
    return Object.entries(titles).map(([id, title]) => ({ id, title,
      tone: id === 'spells' ? 'spell' as const : 'ability' as const, glyph: id === 'spells' ? '✦' : '⚔',
      choices: c.abilities.filter(a => this.kind(a) === id)
        .sort((a, b) => (a.spell?.level ?? 0) - (b.spell?.level ?? 0)
          || this.last.indexOf(a.id) - this.last.indexOf(b.id))
        .map(a => this.ability(a, c)) })).filter(s => s.choices.length);
  }
  private static readonly last = ['defend', 'wait', 'flee'];
  private static kind(a: CombatScreen['abilities'][number]): string {
    if (['melee', 'ranged'].includes(a.id)) { return 'strike'; }
    if (this.last.includes(a.id)) { return 'other'; }
    return a.spell ? 'spells' : 'abilities';
  }
  private static ability(a: CombatScreen['abilities'][number], c: CombatScreen): Choice {
    const tone: Tone = a.spell ? 'spell' : 'ability';
    const note = [a.price, a.targets.length ? '' : a.scope === 'self' ? 'self' : a.scope].filter(Boolean).join(' · ');
    const base = { id: `ability:${a.id}`, label: a.name, tone, about: a.text, ...(note ? { note } : {}) };
    if (!a.targets.length) { return { ...base, command: `${a.id}>` }; }
    const fighters = [...c.foes, ...c.allies];
    // With only one possible target there is nothing to choose: the choice names it and acts at once.
    if (a.targets.length === 1) {
      const t = a.targets[0]!;
      return { ...base, label: `${a.name} → ${t.name}`, command: `${a.id}>${t.id}` };
    }
    return { ...base, children: a.targets.map(t => {
      const f = fighters.find(x => x.id === t.id);
      return { id: `ability:${a.id}/${t.id}`, label: t.name, tone, command: `${a.id}>${t.id}`,
        ...(f ? { note: `${f.hp}/${f.maxHp}${f.statuses.length ? ` · ${[...new Set(f.statuses)].join(', ')}` : ''}` } : {}) };
    }) };
  }
  // Every choice in a list of sections, in display order (what digits and arrow keys walk through).
  static all(sections: Section[]): Choice[] { return sections.flatMap(s => s.choices); }
  static find(sections: Section[], id: string): Choice | undefined { return this.walk(this.all(sections), id); }
  private static walk(choices: Choice[], id: string): Choice | undefined {
    for (const c of choices) {
      if (c.id === id) { return c; }
      const inner = c.children && this.walk(c.children, id);
      if (inner) { return inner; }
    }
    return undefined;
  }
  private static leaves(list: Act[]): Act[] { return list.flatMap(a => a.children ? this.leaves(a.children) : [a]); }
  private static longest(acts: Act[]): number { return Math.max(0, ...this.leaves(acts).map(a => a.minutes ?? 0)); }
  static upper(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }
  // A name inside a sentence: "The Returning Oar" reads "the Returning Oar".
  static inline(name: string): string { return name.replace(/^(The|A|An) /, m => m.toLowerCase()); }
  static span(m: number): string {
    const words: Record<number, string> = { 20: 'twenty minutes', 30: 'half an hour', 60: 'an hour', 90: 'an hour and a half',
      120: 'two hours' };
    return words[m] ?? this.minutes(m);
  }
  static minutes(m: number): string {
    return m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ''}` : `${m}m`;
  }
}
