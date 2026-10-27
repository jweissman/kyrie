import type { Act, CombatScreen, ExitRow, ItemRow, MemberRow, Screen, TargetRow } from './screen-types';
import { Patience } from './patience';

export type Tone = 'way' | 'person' | 'creature' | 'thing' | 'company' | 'item' | 'member' | 'ability' | 'spell';
// One thing the player can choose. A choice either performs its command when chosen or opens a short list of
// further choices (who carries the torch, which goods to buy). A disabled choice says why it cannot be done.
export interface Choice {
  id: string; label: string; tone: Tone;
  command?: string; children?: Choice[];
  note?: string; about?: string; risk?: boolean; minutes?: number; disabled?: string;
  // A way about the settlement or site the company is in, however long it takes (see ExitRow).
  local?: boolean;
  // What cannot be undone by it: the page says so, and asks again, before it is done.
  grave?: string;
}
// What the choices are about: a person, a creature, a thing, the ways out, the company itself.
export interface Section {
  // Something about the subject the company has not seen before, at a place it has been before.
  fresh?: boolean;
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
    return this.waited(screen, [
      ...[...screen.people, ...things].map(t => this.subject(t, screen.fresh)),
      ...(screen.exits.length ? [this.ways(screen.exits)] : []),
      ...(screen.camp.length || screen.unplaced.length || this.preparing(screen).length || this.lighting(screen).length ? [{ id: 'company',
        title: 'The company', tone: 'company' as const, glyph: '○',
        choices: [...this.lighting(screen), ...this.flatten([...screen.camp, ...screen.unplaced], 'company', 'company'),
          ...this.preparing(screen)] }] : []),
    ]);
  }
  // Warned off, whatever would take the company past the minutes they will wait says so (see Patience).
  private static waited(screen: Screen, sections: Section[]): Section[] {
    const warned = screen.warned;
    return warned ? sections.map(s => ({ ...s, choices: s.choices.map(c => this.marked(c, warned)) })) : sections;
  }
  private static marked(c: Choice, warned: { by: string; left: number }): Choice {
    return c.children ? { ...c, children: c.children.map(k => this.marked(k, warned)) }
      : c.command && (c.minutes ?? 0) >= warned.left
        ? { ...c, note: [c.note, Patience.note(warned.by)].filter(Boolean).join(' · ') } : c;
  }
  // In the dark, whoever carries a light can light it: the first thing anyone would do. The choice is the act that
  // lights it, known by its command, not whichever of the thing's acts comes first (Thrume's B1 set the torch down):
  // a torch is lit, and a flask of lamp oil is spent on whoever carries it.
  private static lighting(screen: Screen): Choice[] {
    if (!screen.dark) { return []; }
    return screen.items.filter(i => i.light).flatMap((i): Choice[] => {
      const acts = i.acts.flatMap(a => a.children ?? [a]);
      const own = acts.find(a => a.command?.startsWith('light_item('))
        ?? acts.find(a => a.command?.startsWith('use_item(') && a.bound?.includes(i.ownerName));
      // "a torch", "the lantern", but "Garth's spare torch" as it is named.
      const name = /^(the|a|an) /i.test(i.name) ? i.name.toLowerCase() : /^[A-Z]\w*'s /.test(i.name) ? i.name
        : `a ${i.name.toLowerCase()}`;
      return own?.command ? [{ id: `light:${i.id}`, label: `${i.ownerName}: light ${name}`, tone: 'item' as const,
        command: own.command, about: i.description }] : [];
    }).filter((c, n, all) => all.findIndex(o => o.label === c.label) === n).concat(this.castLight(screen));
  }
  // And a caster with a spell that gives light casts it there, if it can now (see Illumination).
  private static castLight(screen: Screen): Choice[] {
    return screen.party.flatMap(m => m.acts.filter(a => a.light).flatMap((a): Choice[] => {
      const can = [a, ...a.children ?? []].find(x => x.command && !x.disabled);
      return can ? [{ id: `light:${m.id}:${a.key}`, label: `${m.name}: cast ${a.label}`, tone: 'spell',
        command: can.command!, ...a.about ? { about: a.about } : {} }] : [];
    }));
  }
  // A caster's spells can be prepared from wherever the company is: an hour of study or prayer.
  // What a companion can do with study: spend a level gained, or prepare a different spell.
  private static preparing(screen: Screen): Choice[] {
    return screen.party.flatMap(m => m.acts.filter(a => ['Advance', 'Prepare spells'].includes(a.label))
      .sort((a, b) => a.label.localeCompare(b.label))
      .map(a => this.scored({ ...this.choice(a, `${a.label === 'Advance' ? 'advance' : 'prepare'}:${m.id}`, 'spell'),
        label: `${m.name}: ${a.label.toLowerCase()}` }, m)));
  }
  // A quality to raise says what it is now and what it would be.
  private static scored(c: Choice, m: Screen['party'][number]): Choice {
    const score = m.attributes[c.label.toLowerCase()];
    const note = score !== undefined && !c.children ? { note: `${score} → ${score + 1}` } : {};
    return { ...c, ...note, ...(c.children ? { children: c.children.map(k => this.scored(k, m)) } : {}) };
  }
  static subject(t: TargetRow, fresh: string[] = []): Section {
    const tone: Tone = t.kind === 'person' ? 'person' : ['creature', 'animal'].includes(t.kind) ? 'creature' : 'thing';
    const glyph = t.state ? '✝' : tone === 'person' ? '☺' : tone === 'creature' ? '◆' : t.kind === 'feature' ? '▣' : '·';
    const note = [t.activity ?? t.note, t.state === 'dead' ? 'dead' : t.state ? 'down' : ''].filter(Boolean).join(' · ');
    const about = [...t.says ?? [], t.look, t.activity ? `${t.name.split(', ')[0]}: ${t.activity}.` : '',
      t.reckoning?.text].filter(Boolean).join(' ');
    // A fight or a risk comes after the gentler ways with the same subject, so Enter on arrival is never a blow; an
    // attack says what the company makes of its chances.
    const choices = this.flatten(t.acts, t.id, tone).map(c => c.label === 'Attack' && t.reckoning ? { ...c,
      note: [c.note, this.chances[t.reckoning.danger]].filter(Boolean).join(' · '),
      about: [c.about, t.reckoning.text].filter(Boolean).join(' ') } : c);
    return { id: t.id, title: t.name, tone, glyph, ...(note ? { note } : {}), ...(about ? { about } : {}),
      ...(t.says?.some(x => fresh.includes(x)) ? { fresh: true } : {}),
      choices: [...choices.filter(c => !c.risk), ...choices.filter(c => c.risk)] };
  }
  static readonly chances: Record<NonNullable<TargetRow['reckoning']>['danger'], string> = { slight: 'easily won',
    fair: 'should be won', hard: 'a hard fight', grave: 'could be lost', deadly: 'beyond you' };
  // What a way that goes one way only says before it is taken (a mage and a bard went down the great pipe at
  // Pluwalac, feet first, and could not come back up it: the play-structure investigation's PT-17).
  static readonly oneWay = 'There is no coming back this way.';
  static ways(exits: ExitRow[]): Section {
    const labels = exits.map(e => this.wayLabel(e));
    // Two ways from here into the same enclosure (a tower by its door and by its well) are told apart by where they
    // arrive; a way into one that other ways lead into from elsewhere, by its own name (What Tessary Owes' two ways
    // into the Strongrooms, W16).
    const twice = new Set(labels.filter((l, i) => labels.indexOf(l) !== i));
    const choices = exits.flatMap((e, i) => {
      const label = twice.has(labels[i]!) ? `${labels[i]!.split(' ')[0]} ${this.inline(e.destination.name)}`
        : (e.several && e.transition === 'enter' || e.oneWay) && e.way ? `${labels[i]!} by ${this.inline(e.way)}`
          : labels[i]!;
      return this.way(e, label).map(c => e.local ? { ...c, local: true } : c).map(c => e.oneWay && c.command
        ? { ...c, grave: ChoiceList.oneWay } : c);
    });
    return { id: 'ways', title: 'Ways on', tone: 'way', glyph: '→', choices };
  }
  private static way(e: ExitRow, label: string): Choice[] {
    const about = this.wayAbout(e), id = e.id, minutes = this.longest(e.acts);
    // Where the company has not been is on the map; the note is how long the way takes.
    const note = minutes > 10 ? this.minutes(minutes) : '';
    const barred: Choice = { id, label, tone: 'way', disabled: e.blocked ?? 'Not possible from here right now.', about,
      note: 'barred' };
    if (!e.acts.length) { return [barred]; }
    // A way that is barred, with something to try on what bars it, is those tries; what bars it is said with each.
    if (e.blocked && !e.acts.some(a => this.moves(a))) {
      return this.tries(e, label, about).map(c => ({ ...c, about: [e.blocked, c.about].filter(Boolean)
        .filter((x, i, all) => all.indexOf(x) === i).join(' ') }));
    }
    // A way with one thing to do, and that thing is to go, is just the way; anything else (open the door, risk the
    // pit) is said, so a choice never pretends to lead somewhere it does not.
    const only = e.acts.length === 1 && !e.acts[0]!.children && this.moves(e.acts[0]!) ? e.acts[0]! : undefined;
    if (only) {
      return [{ id, label, tone: 'way', ...(only.command ? { command: only.command } : {}), about: only.about ?? about,
        ...(note ? { note } : {}), ...(only.minutes ? { minutes: only.minutes } : {}),
        ...(only.risk ? { risk: true } : {}), ...(only.grave ? { grave: only.grave } : {}) }];
    }
    return this.tries(e, label, about);
  }
  // Several ways to act on one passage (go by the shaft or the postern; risk the pit or disarm it) each stand alone.
  private static tries(e: ExitRow, label: string, about: string): Choice[] {
    const id = e.id;
    return e.acts.map(a => {
      const c = this.choice(a, id, 'way');
      const how = this.moves(a) && !a.label.startsWith('Go by ') ? label : a.label.startsWith('Go by ') ? `${label}, ${a.label.slice(3)}`
        : `${label} — ${c.label.charAt(0).toLowerCase()}${c.label.slice(1)}`;
      const told = c.note;
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
    // Inside another building or level, the room is named with it when the two names differ.
    const within = e.scope && e.scope !== room && !room.includes(e.scope) ? `, in ${e.scope}` : '';
    const where = { walk: `${this.upper(room)}${span}${how}.`, enter: `${this.upper(room)}${within}${span}.`,
      leave: `Out to ${room}${within}${span}.`, level: `${this.upper(room)}${within}${span}.`,
      ascend: `Up to ${room}${span}.`, descend: `Down to ${room}${span}.`,
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
      // A list of one is no choice: "Take › for Bran" is "Take for Bran", "Buy › A ration" is "Buy a ration", and
      // "Lift it › Bran takes the weight" is "Lift it — Bran takes the weight".
      const only = this.choice(a.children[0]!, id, tone), article = /^(A|An|The|Some) /.test(only.label);
      const runs = /\b(on|for|to|with|by|at|from|into)$/i.test(a.label) || !/^[A-Z]/.test(only.label) || article;
      const rest = article ? `${only.label.charAt(0).toLowerCase()}${only.label.slice(1)}` : only.label;
      return { ...only, id, label: `${a.label}${runs ? ' ' : ' — '}${rest}` };
    }
    if (a.children) {
      return { id, label: a.label, tone, children: a.children.map(c => this.choice(c, id, tone)),
        ...(a.about ? { about: a.about } : {}), ...(a.risk ? { risk: true } : {}) };
    }
    // A skilled choice names who does it; one the company cannot make says what it needs; a price is said beside it,
    // as a time is, not run into what is done ("A ration", 2 coin).
    // Camp lasts until morning, however long that is from now.
    const priced = / — (\d+ coin)$/.exec(a.label), label = priced ? a.label.slice(0, priced.index) : a.label;
    const span = /^Make camp/.test(a.label) ? 'until morning' : a.minutes && a.minutes > 10 ? this.minutes(a.minutes) : '';
    // One that cannot be made now says why beneath it (the coin it costs, the skill it wants), not that no one can.
    const note = a.disabled ? '' : [priced?.[1] ?? '', span, a.by?.join(', ') ?? ''].filter(Boolean).join(' · ');
    return { id, label, tone, ...(a.command ? { command: a.command } : {}), ...(note ? { note } : {}),
      ...(a.minutes ? { minutes: a.minutes } : {}), ...(a.about ? { about: a.about } : {}),
      ...(a.risk ? { risk: true } : {}), ...(a.disabled ? { disabled: a.disabled } : {}),
      ...(a.grave ? { grave: a.grave } : {}) };
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
    const base = { id: i.id, label: this.upper(i.name), tone: 'item' as const, about: `${i.description}${i.equipped ? ' In use.' : ''}`,
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
    // A fight that has ended is held on its page, how it ended and what it was worth, until the player goes on.
    if (c.outcome) { return [{ id: 'onward', title: '', tone: 'way', glyph: '→', choices: [this.onward] }]; }
    if (!c.ours) { return []; }
    const titles: Record<string, string> = { strike: 'Strike', abilities: 'Abilities', spells: 'Spells',
      other: 'Defend, wait or withdraw' };
    return Object.entries(titles).map(([id, title]) => {
      const list = c.abilities.filter(a => this.kind(a) === id)
        .sort((a, b) => (a.spell?.level ?? 0) - (b.spell?.level ?? 0)
          || this.last.indexOf(a.id) - this.last.indexOf(b.id));
      return { id, title, tone: id === 'spells' ? 'spell' as const : 'ability' as const, glyph: id === 'spells' ? '✦' : '⚔',
        choices: ['abilities', 'spells'].includes(id) ? this.fold(list, id, c) : list.map(a => this.ability(a, c)) };
    }).filter(s => s.choices.length);
  }
  // A long list of abilities or spells shows the three that would do most good now, in their usual order, and folds
  // the rest under one choice, a tap away.
  private static fold(list: CombatScreen['abilities'], id: string, c: CombatScreen): Choice[] {
    if (list.length <= 4) { return list.map(a => this.ability(a, c)); }
    const best = new Set([...list].sort((a, b) => (b.rank ?? 0) - (a.rank ?? 0)).slice(0, 3));
    const rest = list.filter(a => !best.has(a));
    const tone: Tone = id === 'spells' ? 'spell' : 'ability';
    return [...list.filter(a => best.has(a)).map(a => this.ability(a, c)),
      { id: `more:${id}`, label: id === 'spells' ? 'Other spells' : 'Other abilities', tone,
        note: `${rest.length} more`, children: rest.map(a => this.ability(a, c)) }];
  }
  private static readonly last = ['defend', 'wait', 'flee'];
  private static readonly onward: Choice = { id: 'onward', label: 'Go on', tone: 'way' };
  private static kind(a: CombatScreen['abilities'][number]): string {
    if (['melee', 'ranged'].includes(a.id)) { return 'strike'; }
    if (this.last.includes(a.id)) { return 'other'; }
    return a.spell ? 'spells' : 'abilities';
  }
  private static ability(a: CombatScreen['abilities'][number], c: CombatScreen): Choice {
    const tone: Tone = a.spell ? 'spell' : 'ability';
    // A levelled spell says how many castings are ready; a cantrip, that it is free.
    const cost = a.spell && a.spell.level > 0 ? `${a.spell.ready} ready` : a.price;
    // Withdrawing is the whole company's: it ends the fight for everyone. An ability on oneself needs no note.
    const scope = a.id === 'flee' ? 'ends the fight for all' : a.targets.length ? ''
      : ({ party: 'the whole company', allies: 'every ally', enemies: 'every foe', all: 'everyone' } as Record<string, string>)[a.scope] ?? '';
    const note = [cost, scope].filter(Boolean).join(' · ');
    const base = { id: `ability:${a.id}`, label: a.name, tone, about: a.text, ...(note ? { note } : {}) };
    if (!a.targets.length) { return { ...base, command: `${a.id}>` }; }
    const fighters = [...c.foes, ...c.allies];
    // With only one possible target there is nothing to choose: the choice names it and acts at once.
    if (a.targets.length === 1) {
      const t = a.targets[0]!, joined = [this.odds(t.odds), base.note, t.against].filter(Boolean).join(' · ');
      return { ...base, label: `${a.name} → ${t.name}`, command: `${a.id}>${t.id}`, ...joined ? { note: joined } : {} };
    }
    return { ...base, children: a.targets.map(t => {
      const f = fighters.find(x => x.id === t.id);
      const note = [this.odds(t.odds), f && `${f.hp}/${f.maxHp}`, ...new Set(f?.statuses ?? []), t.against]
        .filter(Boolean).join(' · ');
      return { id: `ability:${a.id}/${t.id}`, label: t.name, tone, command: `${a.id}>${t.id}`, ...note ? { note } : {} };
    }) };
  }
  // A blow's chance as people put it: "1 in 4", "2 in 3", "almost always".
  static odds(p?: number): string {
    if (p === undefined) { return ''; }
    if (p >= 0.93) { return 'almost always'; }
    if (p <= 0.07) { return 'almost never'; }
    const fractions: [number, number][] = [[1, 10], [1, 6], [1, 5], [1, 4], [1, 3], [2, 5], [1, 2], [3, 5], [2, 3],
      [3, 4], [4, 5], [9, 10]];
    const [a, b] = fractions.reduce((best, f) => this.off(f, p) < this.off(best, p) ? f : best);
    return `${a} in ${b}`;
  }
  private static off(f: [number, number], p: number): number { return Math.abs(f[0] / f[1] - p); }
  // Every choice in a list of sections, in display order (what digits and arrow keys walk through).
  static all(sections: Section[]): Choice[] { return sections.flatMap(s => s.choices); }
  static find(sections: Section[], id: string): Choice | undefined { return this.walk(this.all(sections), id); }
  // The choice that does this command, among these and theirs.
  static command(choices: Choice[], command: string): Choice | undefined {
    for (const c of choices) {
      if (c.command === command) { return c; }
      const inner = c.children && this.command(c.children, command);
      if (inner) { return inner; }
    }
    return undefined;
  }
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
