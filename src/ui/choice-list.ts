import type { Act, CombatScreen, ExitRow, ItemRow, MemberRow, Screen, TargetRow, Transition } from './screen-types';
import { Patience } from './patience'; import { Tending } from './tending'; import { Marks } from './marks';
import { Counted } from '../counted'; import { OutOf } from '../presentation/out-of';
import { SpellSchools } from '../presentation/spell-schools';
import type { Mark } from '../presentation/glance-types';
import { ChoiceWords } from './choice-words';
import { ChoiceTries } from './choice-tries';
import { TradeModel } from './trade-model';
import { WayNames } from './way-names';

export type Tone = 'way' | 'person' | 'creature' | 'thing' | 'company' | 'item' | 'member' | 'ability' | 'spell';
// One thing the player can choose. A choice either performs its command when chosen or opens a short list of
// further choices (who carries the torch, which goods to buy). A disabled choice says why it cannot be done.
export interface Choice {
  id: string; label: string; tone: Tone;
  command?: string; children?: Choice[];
  note?: string; about?: string; risk?: boolean; minutes?: number; disabled?: string; gutters?: string;
  // What it is called standing alone, out of its group (see Act.alone).
  alone?: string;
  // One question standing for many it folds (see Act.folds).
  folds?: true;
  // What kind of act it is, and what it is done to or with (see Act.does, Act.targets).
  does?: string; targets?: string[];
  // Whether doing it takes the company somewhere, or teaches it something (see Act.moves, Act.teaches).
  moves?: boolean; teaches?: boolean;
  // A way about the settlement or site the company is in, however long it takes (see ExitRow).
  local?: boolean;
  // What cannot be undone by it: the page says so, and asks again, before it is done.
  grave?: string;
  // What is read on turning to it, an opener: what bars a way, said whole (the speaking door's riddle), its rows the
  // answers (see Doable.Row.says).
  focus?: string;
  // An answer to the question just put (see Act).
  answer?: boolean;
  // One of the place's own (see Act), and one done, not said (see Act).
  own?: boolean; deed?: boolean;
  // What it risks, said on it before it is chosen (see Marks).
  marks?: Mark[];
  // The emblem drawn beside its words: a spell's school or domain (see SpellSchools), an icon in ink, never a tone.
  emblem?: string;
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
  // The tries anything might be given, by their words under the thing ("Look closely", "Listen at it").
  static readonly trying = Object.values(ChoiceTries.rules).map(r => r.path[0]!);
  static explore(screen: Screen): Section[] {
    const counter = TradeModel.laid(screen), things = screen.things.filter(t => !counter.has(t.id));
    return Marks.on(screen, this.waited(screen, [
      ...[...screen.people, ...things].map(t => this.subject(t, screen.fresh)),
      ...(screen.exits.length ? [this.ways(screen.exits)] : []),
      ...this.company(screen)]));
  }
  // What the company can do by itself: light a light in the dark, tend whoever is hurt (see Tending), camp, rest and
  // the rest, and prepare spells.
  private static company(screen: Screen): Section[] {
    const lighting = this.lighting(screen), lit = new Set(lighting.map(c => c.command));
    const choices = [...lighting, ...Tending.choices(screen), ...this.flatten([...screen.camp, ...screen.unplaced],
      'company', 'company').filter(c => !lit.has(c.command)), ...this.preparing(screen)];
    return choices.length ? [{ id: 'company', title: 'The company', tone: 'company', glyph: '○', choices }] : [];
  }
  // Warned off, whatever would take the company past the minutes they will wait says so (see Patience).
  private static waited(screen: Screen, sections: Section[]): Section[] {
    const warned = screen.warned;
    return warned ? sections.map(s => ({ ...s, choices: s.choices.map(c => this.marked(c, warned)) })) : sections;
  }
  // What is done toward whoever warns (a blow, a coin, a word) is no wait to them: the spiders' Attack read "will not
  // wait for it" (play 9). The warning stands in place of the plain note, one thing said beside the act, never two
  // run out of the row half-said (M22's OR-06: "the way yo… · The rats … wil…").
  private static marked(c: Choice, warned: { by: string; left: number; id?: string }): Choice {
    const toward = !!warned.id && new RegExp(`[(,]${warned.id}[,)]`).test(c.command ?? '');
    return c.children ? { ...c, children: c.children.map(k => this.marked(k, warned)) }
      : c.command && !toward && (c.minutes ?? 0) >= warned.left ? { ...c, note: Patience.note(warned.by) } : c;
  }
  // In the dark, whoever carries a light can light it: the first thing anyone would do. The choice is the act that
  // lights it, known by its command, not whichever of the thing's acts comes first (Thrume's B1 set the torch down):
  // a torch is lit, and a flask of lamp oil is spent on whoever carries it.
  private static lighting(screen: Screen): Choice[] {
    if (!screen.dark) { return []; }
    // The lantern first: it burns longest.
    return this.lamps(screen).concat(screen.items.filter(i => i.light).flatMap((i): Choice[] => {
      const acts = i.acts.flatMap(a => a.children ?? [a]);
      const own = acts.find(a => a.command?.startsWith('light_item('))
        ?? acts.find(a => a.command?.startsWith('use_item(') && a.bound?.includes(i.ownerName));
      // "a torch", "the lantern", but "Garth's spare torch" as it is named.
      const name = /^(the|a|an) /i.test(i.name) ? i.name.toLowerCase() : /^[A-Z]\w*'s /.test(i.name) ? i.name
        : `a ${i.name.toLowerCase()}`;
      return own?.command ? [{ id: `light:${i.id}`, label: `${i.ownerName}: light ${name}`, tone: 'item' as const,
        command: own.command, about: i.description }] : [];
    }).filter((c, n, all) => all.findIndex(o => o.label === c.label) === n), this.castLight(screen));
  }
  // A lantern, filled from a flask of its oil and lit: never offered in the dark, so a lantern given for the rats with
  // two flasks of oil could not be lit when a torch died in a barrow (Mission 20's third round, D 136).
  private static lamps(screen: Screen): Choice[] {
    const lamp = [...screen.items.flatMap(i => i.acts), ...screen.camp, ...screen.unplaced]
      .flatMap(a => a.children ?? [a]).find(a => a.command?.startsWith('light_lamp('));
    return lamp ? [{ id: 'light:lamp', label: 'Fill a lantern and light it', tone: 'item' as const,
      command: lamp.command! }] : [];
  }
  // And a caster with a spell that gives light casts it there, if it can now (see Illumination).
  private static castLight(screen: Screen): Choice[] {
    return screen.party.flatMap(m => m.acts.filter(a => a.light).flatMap((a): Choice[] => {
      const can = [a, ...a.children ?? []].find(x => x.command && !x.disabled);
      return can ? [{ id: `light:${m.id}:${a.key}`, label: `${m.name}: cast ${a.label}`, tone: 'spell',
        command: can.command!, ...a.about ? { about: a.about } : {}, ...SpellSchools.field(can.targets) }] : [];
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
    const dead = t.device ? 'broken' : 'dead';
    const note = [t.activity ?? t.note, t.state === 'dead' ? dead : t.state ? 'down' : ''].filter(Boolean).join(' · ');
    const about = [...t.says ?? [], t.look, t.activity ? `${t.name.split(', ')[0]}: ${t.activity}.` : '',
      t.reckoning?.text, t.reckoning?.help].filter(Boolean).join(' ');
    // A fight or a risk comes after the gentler ways with the same subject, so Enter on arrival is never a blow; an
    // attack says what the company makes of its chances.
    const choices = this.flatten(t.acts, t.id, tone).map(c => c.label === 'Attack' && t.reckoning ? { ...c,
      note: [c.note, this.chances[t.reckoning.danger]].filter(Boolean).join(' · '),
      about: [c.about, t.reckoning.text, t.reckoning.help].filter(Boolean).join(' ') } : c);
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
    const twice = this.alike(labels);
    const told = exits.map((e, i) => twice.has(labels[i]!) && !e.unmarked
      ? this.lead(labels[i]!, this.inline(e.destination.name)) : labels[i]!);
    // Ways that read alike still, to places of one name (from a road, its ways off into the stretches of one wood it
    // crosses, each "among the trees of Beorquudu": NAV-04), are each told by their own way.
    const still = this.alike(told);
    const choices = exits.flatMap((e, i) => {
      const label = still.has(told[i]!) && e.way ? `${told[i]!} by ${this.inline(e.way)}`
        : twice.has(labels[i]!) ? told[i]!
          : (e.several && e.transition === 'enter' || e.oneWay) && e.way && !WayNames.named(e.way, e.scope ?? e.destination.name)
            ? `${labels[i]!} by ${this.inline(WayNames.unrepeated(e.way, e.scope))}` : labels[i]!;
      return this.way(e, OutOf.once(label)).map(c => e.local ? { ...c, local: true } : c).map(c => e.oneWay && c.command
        ? { ...c, grave: ChoiceList.oneWay } : c);
    });
    return { id: 'ways', title: 'Ways on', tone: 'way', glyph: '→', choices };
  }
  // The word a way's label leads with, before another place's name: none for a place whose name says where it is.
  private static lead(label: string, room: string): string {
    return ChoiceList.whereabouts.test(label) ? this.upper(room) : `${label.split(' ')[0]} ${room}`;
  }
  private static alike(labels: string[]): Set<string> {
    return new Set(labels.filter((l, i) => labels.indexOf(l) !== i));
  }
  private static way(e: ExitRow, label: string): Choice[] {
    const about = this.wayAbout(e), id = e.id, minutes = this.longest(e.acts);
    // Where the company has not been is on the map; the note is how long the way takes.
    const note = minutes > 10 ? this.minutes(minutes) : '';
    const barred: Choice = { id, label, tone: 'way', disabled: e.blocked ?? 'Not possible from here right now.', about,
      note: 'barred', does: 'go' };
    if (!e.acts.length) { return [barred]; }
    // A way that is barred, with something to try on what bars it, is the way, barred, saying what bars it (and what
    // another way there would want), and then those tries: "Into the bailey" had opened on looking closely, pushing
    // and listening at a portcullis, nothing saying why it was no way in (play 8).
    // Where a try on it is grave (a word to press), what bars it is said whole on turning to it (its focus: the
    // speaking door's riddle, every word of it), and the way's own reason, one line, names it: the riddle had been the
    // way's reason, cut short to a line on the page, and turning to the door had said nothing of it (the owner, 18
    // November, CL-34). A grille to push is still done by its first try.
    if (e.blocked && !e.acts.some(a => this.moves(a))) {
      const tries = this.tries(e, label, about).map(c => ({ ...c, about: [...new Set([e.blocked!, c.about ?? ''])]
        .filter(Boolean).join(' '), ...c.children?.some(k => k.grave) ? { focus: e.blocked } : {} }));
      return [e.via && tries.some(c => c.focus) ? { ...barred, disabled: `${this.upper(e.via)} bars the way.` } : barred,
        ...tries];
    }
    // A way with one thing to do, and that thing is to go, is just the way; anything else (open the door, risk the
    // pit) is said, so a choice never pretends to lead somewhere it does not.
    const only = e.acts.length === 1 && !e.acts[0]!.children && this.moves(e.acts[0]!) ? e.acts[0]! : undefined;
    if (only) {
      return [{ id, label, tone: 'way', ...(only.command ? { command: only.command } : {}),
        ...(only.does ? { does: only.does } : {}), ...(only.targets ? { targets: only.targets } : {}),
        ...(only.moves ? { moves: true } : {}), about: only.about ?? about,
        ...(note ? { note } : {}), ...(only.minutes ? { minutes: only.minutes } : {}),
        ...(only.risk ? { risk: true } : {}), ...(only.gutters ? { gutters: only.gutters } : {}),
        ...(only.grave ? { grave: only.grave } : {}) }];
    }
    return this.tries(e, label, about);
  }
  // Several ways to act on one passage (go by the shaft or the postern; risk the pit or disarm it) each stand alone,
  // the way through first, as the page leads with it; a risk taken on something not yet looked at closely says so.
  // Play 9 risked a hidden switch whose answer, the cleric's insight, would have shown on a closer look (M17-56).
  private static tries(e: ExitRow, label: string, about: string): Choice[] {
    const unlooked = this.unlooked(e.acts);
    const acts = e.acts.flatMap(a => ChoiceWords.laid(a, !!e.blocked) ? ChoiceWords.parts(a).map(k => ({ a: k, id: `${e.id}/${a.key}` }))
      : [{ a, id: e.id }]);
    return acts.map(({ a, id }) => {
      const c = this.choice(a, id, 'way');
      const how = this.moves(a) && !a.label.startsWith('Go by ') ? label : a.label.startsWith('Go by ') ? `${label}, ${a.label.slice(3)}`
        : `${label} — ${c.label.charAt(0).toLowerCase()}${c.label.slice(1)}`;
      const blind = this.risky(a) && this.leaves([a]).some(k => (k.targets ?? []).some(t => unlooked.has(t)));
      return { ...c, label: how, about: c.about ?? about,
        ...blind ? { note: [c.note, ChoiceList.unexamined].filter(Boolean).join(' · ') } : {} };
    });
  }
  static readonly unexamined = 'not looked at closely';
  private static risky(a: Act): boolean {
    return !!a.risk || (!!a.children?.length && a.children.every(k => this.risky(k)));
  }
  // What could still be looked at closely, by its id.
  private static unlooked(acts: Act[]): Set<string> {
    return new Set(this.leaves(acts).flatMap(a => a.command && a.does === 'look_closely' ? a.targets ?? [] : []));
  }
  // Whether an act at a way is going by it: its action moves the company (Act.moves), never its label's word.
  private static moves(a: Act): boolean { return !!a.moves; }
  // A place whose name says where it is ("among the trees of Beorquudu", "under the bridge") is gone to without a
  // "to": the navigation review's march-stone had offered "To among the trees of …" (NVR-05).
  static readonly whereabouts = new RegExp(`^(${['among', 'amid', 'amongst', 'by', 'under', 'over', 'beneath', 'below',
    'above', 'beside', 'behind', 'beyond', 'across', 'along', 'inside', 'outside', 'within', 'between', 'near', 'past',
    'through'].join('|')})\\s`, 'i');
  static readonly leads: Partial<Record<Transition, string>> = { leave: 'Out', ascend: 'Up', descend: 'Down',
    cross_plane: 'Through' };
  static wayLabel(e: ExitRow): string {
    // An act, still without saying where (LOR-11): "By the door" had read as a row's note with no title to it (the
    // owner, 19 November).
    if (e.unmarked && e.way) { return `Go by ${this.inline(e.way)}`; }
    const room = this.inline(e.destination.name);
    if (e.bearing) { return `${e.bearing.charAt(0).toUpperCase()}${e.bearing.slice(1)}: ${room}`; }
    const into = this.inline(e.scope ?? room);
    if (e.transition === 'enter') { return ChoiceList.whereabouts.test(into) ? this.upper(into) : `Into ${into}`; }
    const lead = ChoiceList.leads[e.transition], where = ChoiceList.whereabouts.test(room);
    return lead ? `${lead} ${where ? '' : 'to '}${room}` : where ? this.upper(room) : `To ${room}`;
  }
  private static wayAbout(e: ExitRow): string {
    const minutes = this.longest(e.acts);
    if (e.unmarked && e.way) { return `${this.upper(e.way)}: where it goes, nothing here says.`; }
    const room = e.destination.name, to = ChoiceList.whereabouts.test(room) ? room : `to ${room}`;
    const span = minutes > 10 ? `, ${this.span(minutes)} away` : ', a few steps away';
    const how = e.way ? ` by ${e.way}` : '';
    // Inside another building or level, the room is named with it when the two names differ.
    const within = e.scope && e.scope !== room && !room.includes(e.scope) ? `, in ${e.scope}` : '';
    const where = { walk: `${this.upper(room)}${span}${how}.`, enter: `${this.upper(room)}${within}${span}.`,
      leave: `Out ${to}${within}${span}.`, level: `${this.upper(room)}${within}${span}.`,
      ascend: `Up ${to}${span}.`, descend: `Down ${to}${span}.`,
      travel: `Across country ${to}${e.scope ? `, ${e.scope}` : ''}${minutes > 10 ? ` (${this.span(minutes)})` : ''}${how}.`,
      cross_plane: `Across a planar threshold to ${room}.` }[e.transition];
    return [where, e.via && e.via !== e.way ? `The way runs past ${e.via}.` : '', e.hazard ?? e.blocked ?? '']
      .filter(Boolean).join(' ');
  }
  // A list of acts as choices. "Talk" is transparent: its topics are things to say, so they stand as choices.
  static flatten(acts: Act[], prefix: string, tone: Tone): Choice[] {
    return acts.flatMap(a => a.label === 'Talk' && a.children ? this.flatten(a.children, `${prefix}/${a.key}`, tone)
      : ChoiceWords.laid(a) ? this.flatten(ChoiceWords.parts(a), `${prefix}/${a.key}`, tone) : [this.choice(a, prefix, tone)]);
  }
  static choice(a: Act, prefix: string, tone: Tone): Choice {
    const id = `${prefix}/${a.key}`;
    if (a.children?.length === 1) {
      // A list of one is no choice: "Take › for Bran" is "Take for Bran", "Buy › A ration" is "Buy a ration", and
      // "Lift it › Bran takes the weight" is "Lift it — Bran takes the weight".
      const only = this.choice(a.children[0]!, id, tone);
      return { ...only, id, label: ChoiceWords.joined(a.label, only.label) };
    }
    if (a.children) {
      return { id, label: a.label, tone, children: a.children.map(c => this.choice(c, id, tone)),
        ...(a.about ? { about: a.about } : {}), ...(a.risk ? { risk: true } : {}) };
    }
    // A skilled choice names who does it; one the company cannot make says what it needs; a price is said beside it,
    // as a time is, not run into what is done ("A ration", 2 coin).
    // A night's sleep lasts until morning, however long that is from now; taken by day, until the hour it ends.
    // By day it is a sleep in the open, not a night's camp ("Make camp for the night, until 5:40 p.m.": Mission 19).
    const priced = / — (\d+ coin)$/.exec(a.label), named = priced ? a.label.slice(0, priced.index) : a.label;
    const label = a.until && !/^7:00 a\.m\./.test(a.until) && named === 'Make camp for the night'
      ? 'Make camp and sleep' : named;
    const span = a.until ? /^7:00 a\.m\./.test(a.until) ? 'until morning' : `until ${a.until}`
      : /^Make camp/.test(a.label) ? 'until morning' : a.minutes && a.minutes > 10 ? this.minutes(a.minutes) : '';
    // One that cannot be made now says why beneath it (the coin it costs, the skill it wants), not that no one can.
    const odds = a.reckoned ? this.chances[a.reckoned.danger] : '';
    const note = a.disabled ? '' : [priced?.[1], span, a.by?.join(', '), odds, a.ground].filter(Boolean).join(' · ');
    const about = [a.about, a.reckoned?.text].filter(Boolean).join(' ');
    return { id, label, tone, ...(a.command ? { command: a.command } : {}), ...(note ? { note } : {}),
      ...(a.minutes ? { minutes: a.minutes } : {}), ...(about ? { about } : {}),
      ...(a.risk ? { risk: true } : {}), ...(a.gutters ? { gutters: a.gutters } : {}),
      ...(a.disabled ? { disabled: a.disabled } : {}),
      ...(a.does ? { does: a.does } : {}), ...(a.targets ? { targets: a.targets } : {}),
      ...(a.moves ? { moves: true } : {}), ...(a.teaches ? { teaches: true } : {}),
      ...(a.grave ? { grave: a.grave } : {}), ...(a.answer ? { answer: true } : {}), ...(a.own ? { own: true } : {}),
      ...(a.deed ? { deed: true } : {}), ...(a.alone ? { alone: a.alone } : {}), ...(a.folds ? { folds: true } : {}),
      ...SpellSchools.field(a.targets) };
  }
  // Nothing is held (the owner, 23 November, OR-185: "No long presses"; a night's rest, a camp and a journey had been,
  // 16 and 18 November): every act is done at one press, and what one spends is said on its row before it is chosen,
  // by the engine for every client: a rest or a camp "until morning" or the hour it ends, a way or a journey how long
  // it takes (its note, above; the journey's card), and whether it ends after dark (Marks). What cannot be undone asks
  // once (Grave), as it always has.
  static journey(command?: string): boolean { return !!command?.startsWith('travel:'); }
  // The pack: each companion's things, and what each can do with them.
  static pack(screen: Screen): Section[] {
    const owners = [...new Set(screen.items.map(i => i.owner))];
    return [
      ...owners.map(owner => {
        const items = screen.items.filter(i => i.owner === owner);
        return { id: `pack:${owner}`, title: `${items[0]!.ownerName} carries`, tone: 'item' as const, glyph: '○',
          choices: Counted.together(items, i => i.kept ?? i.slot ?? '').map(({ item, count }) => this.item(item, count)) };
      }),
      ...this.tending(screen.party),
    ];
  }
  // Alike things are one row ("Eight torches"), and what is done with it is done with one of them.
  private static item(i: ItemRow, count = 1): Choice {
    const note = i.equipped ? `in use${i.slot ? ` · ${i.slot}` : ''}` : i.kept ?? i.slot ?? '';
    const label = this.upper(count > 1 ? Counted.many(count, i.name.replace(/^(a|an|the|some) /i, '')) : i.name);
    const base = { id: i.id, label, tone: 'item' as const, about: `${i.description}${i.points ? ` ${i.points}` : ''}${i.equipped ? ' In use.' : ''}`,
      ...(note ? { note } : {}) };
    return i.acts.length ? { ...base, children: this.flatten(i.acts, i.id, 'item') } : base;
  }
  private static tending(party: MemberRow[]): Section[] {
    const tenders = party.filter(m => m.acts.length);
    if (!tenders.length) { return []; }
    return [{ id: 'tend', title: 'Tend the company', tone: 'member', glyph: '✚',
      choices: tenders.flatMap(m => this.flatten(m.acts, `tend:${m.id}`, 'member')
        .map(c => ({ ...c, label: Tending.whom(c.label, m.name) }))) }];
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
    const titles: Record<string, string> = { strike: 'Strike', away: 'Get away', abilities: 'Abilities', spells: 'Spells',
      carried: 'What you carry', words: 'Words', other: 'Defend, wait or withdraw' }, dire = ['grave', 'deadly'];
    // A fight reckoned grave or deadly offers its way out beside the blow, not behind Other (OR-1391: each dangerous
    // fight wants a truthful witness and at least one response that is no attack).
    return Object.entries(titles).map(([id, title]): Section => {
      const list = c.abilities.filter(a => (dire.includes(c.danger ?? '') && a.id === 'flee' ? 'away' : this.kind(a)) === id)
        .sort((a, b) => (a.spell?.level ?? 0) - (b.spell?.level ?? 0)
          || this.last.indexOf(a.id) - this.last.indexOf(b.id));
      // And what cannot be used now, in its place, saying why (the completion plan, §2.4).
      const not = (c.unavailable ?? []).filter(u => (u.carried ? 'carried' : u.spell ? 'spells' : 'abilities') === id)
        .map(u => ({ id: `unusable:${u.id}`, label: u.name, tone: id === 'spells' ? 'spell' as const : 'ability' as const,
          disabled: u.why, ...SpellSchools.field([u.id]) }));
      return { id, title, tone: id === 'spells' ? 'spell' as const : 'ability' as const, glyph: id === 'spells' ? '✦' : '⚔',
        choices: [...['abilities', 'spells'].includes(id) ? this.fold(list, id, c) : list.map(a => this.ability(a, c)), ...not] };
    }).filter(s => s.choices.length).concat(this.pace(c));
  }
  // The fight's pace, as acts like any other (CN-04, CN-06: they had been the page's own buttons): the one whose turn
  // it is left to fight it by the company's own tactics, and a fight as good as won pressed on to its end, each turn
  // so, unless it turns (REV-16). Their commands are the fight's own (fight:auto, fight:through).
  private static pace(c: CombatScreen): Section[] {
    const choices: Choice[] = [{ id: 'fight:auto', label: `Let ${c.actorName} fight this turn`, tone: 'ability',
      command: 'fight:auto', note: 'by your own tactics' },
    ...this.decided(c) ? [{ id: 'fight:through', label: 'Press on to the end', tone: 'ability' as const,
      command: 'fight:through', note: 'as good as won: every turn by your own tactics, unless it turns' }] : []];
    return [{ id: 'pace', title: 'The fight\'s pace', tone: 'ability', glyph: '⚔', choices }];
  }
  // As good as won: every foe standing at half or less, every one of the company at more than half.
  static decided(c: Record<'foes' | 'allies', readonly { hp: number; maxHp: number }[]>): boolean {
    const standing = c.foes.filter(f => f.hp > 0);
    return standing.length > 0 && standing.every(f => f.hp <= f.maxHp / 2) && c.allies.every(f => f.hp > f.maxHp / 2);
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
  private static readonly kinds: Record<string, string> = { melee: 'strike', ranged: 'strike', demand: 'words',
    defend: 'other', wait: 'other', flee: 'other' };
  private static readonly onward: Choice = { id: 'onward', label: 'Go on', tone: 'way' };
  private static kind(a: CombatScreen['abilities'][number]): string {
    return ChoiceList.kinds[a.id] ?? (a.carried !== undefined ? 'carried' : a.spell ? 'spells' : 'abilities');
  }
  private static ability(a: CombatScreen['abilities'][number], c: CombatScreen): Choice {
    const tone: Tone = a.spell ? 'spell' : 'ability';
    // A levelled spell says how many castings are ready; a cantrip, that it is free.
    const cost = a.spell && a.spell.level > 0 ? `${a.spell.ready} ready` : a.carried === 1 ? 'the last'
      : a.carried ? `${a.carried} carried` : a.price;
    // Withdrawing ends the fight for all, a call to yield (Parley) if they yield, each said with how likely (sure, now,
    // as a fight comes at the company); what a technique does besides a blow, and when again (MechanicsText.gist).
    const ends = ({ flee: 'ends the fight for all', demand: 'ends the fight if they yield' } as Record<string, string>)[a.id];
    const scope = ends ? `${a.odds === undefined ? '' : a.odds >= 1 ? 'sure, now · ' : `${this.odds(a.odds)} · `}${ends}` : a.targets.length ? ''
      : ({ party: 'the whole company', allies: 'every ally', enemies: 'every foe', all: 'everyone' } as Record<string, string>)[a.scope] ?? '';
    const note = [cost, a.gist, scope].filter(Boolean).join(' · ');
    const base = { id: `ability:${a.id}`, label: a.name, tone, about: a.text, ...(note ? { note } : {}),
      ...SpellSchools.field([a.id]) };
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
