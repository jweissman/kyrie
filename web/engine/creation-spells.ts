import type { Catalog, FirstSpell, Member } from './protocol';
import type { CreationCard, CreationStep } from './creation-flow';
import { SpellSchools } from '../../src/presentation/spell-schools';
import { Words } from '../reader/words';

type Way = Catalog['callings'][number]['specializations'][number];
export type SpellStepId = 'learn';

// A caster's first spells, chosen all at once (the owner, 18 November: "a multiselect is really the only path forward …
// you shouldn't have to page through all the spells three at a time"; OR-93 had asked them in turn, a step each): after
// the art or the god's keeping, one step that asks for as many first-level spells as the rules give a first-level
// specialist (SpellSelection: three for a mage or a cleric). Each spell open to the way is a row, its own art's first,
// every one in view; a press takes it or lets it go, and a full hand shuts the rest until one is let go. The spells set
// out with until then are the way's own picks (FirstSpells.picks), so a life set out at once has what it always had.
// The last row learns them (a hold, as every choice of creation), shut until the hand is full and has one of the way's
// own (SpellSelection.validate), drawn as a list (seventeen to twenty rows, two to a line, all in view on a laptop's
// screen, as one had not been in a column: OR-98's browser check); its entry is the instrument of what the way sets out
// knowing, the spells chosen among them (CreationSpells.shown). What is chosen is the protagonist's alone
// (member.spells); those drawn are unchanged. The spells known from the start of the second and third level are the
// way's own picks, as before.
export class CreationSpells {
  static readonly done = 'learned';
  static is(step: string): step is SpellStepId { return step === 'learn'; }
  // The step, for a first-level caster whose way has first-level spells to choose among; none for anyone else.
  static steps(m: Member, calling?: Catalog['callings'][number]): CreationStep[] {
    const way = calling?.specializations.find(t => t.id === m.traits?.[0]), first = way?.first;
    if (!way || !first?.count || (m.level ?? 1) !== 1) { return []; }
    const mine = CreationSpells.mine(m, way), cleric = calling!.id === 'cleric', noun = cleric ? 'prayer' : 'spell';
    const art = first.open.filter(s => first.school.includes(s.id));
    const open = [...art, ...first.open.filter(s => !art.includes(s))], n = Words.many(first.count, noun);
    return [{ id: 'learn', present: 'list', emblems: true, all: true, many: first.count, picked: mine,
      ask: `Which ${n} ${cleric ? 'were you taught' : 'did you learn'} first?`,
      cards: [...open.map(s => CreationSpells.card(s, mine, way)), CreationSpells.learned(mine, way, calling!, m)] }];
  }
  // A spell taken, or let go; or the hand learned (the flow goes on: see CreationFlow.choose).
  static settle(m: Member, catalog: Catalog, value: string) {
    const calling = catalog.callings.find(c => c.id === m.classId);
    const way = calling?.specializations.find(t => t.id === m.traits?.[0]);
    if (!way?.first?.open.some(s => s.id === value)) { return; }
    const mine = CreationSpells.mine(m, way), ids = new Set(way.first.open.map(s => s.id));
    const now = mine.includes(value) ? mine.filter(id => id !== value)
      : mine.length < way.first.count ? [...mine, value] : mine;
    m.spells = [...now, ...(m.spells ?? way.picks ?? []).filter(id => !ids.has(id))];
  }
  // Whether the hand may be learned: full, and one of the way's own among it.
  static ready(m: Member, way: Way): boolean {
    const mine = CreationSpells.mine(m, way);
    return mine.length === way.first!.count && mine.some(id => way.first!.school.includes(id));
  }
  // The first-level spells chosen so far.
  private static mine(m: Member, way: Way): string[] {
    const ids = new Set(way.first!.open.map(s => s.id));
    return (m.spells ?? way.picks ?? []).filter(id => ids.has(id));
  }
  private static card(s: FirstSpell, mine: string[], way: Way): CreationCard {
    const taken = mine.includes(s.id), full = mine.length >= way.first!.count, school = way.first!.school;
    const emblem = SpellSchools.emblem(s.id);
    return { id: s.id, name: s.name, say: `${Words.upper(s.line)}.`, ...emblem ? { emblem } : {},
      ...taken ? { aside: 'learned' } : full ? { shut: 'Hand full' } : {},
      entry: { facts: [['Level', 'First'], ...way.of && school.includes(s.id) ? [['Of', Words.upper(way.of)] as [string, string]]
        : []], rules: [`${Words.upper(s.does)}.`, ...s.rules] } };
  }
  // The row that learns the hand: its entry the way's instrument with the spells chosen.
  private static learned(mine: string[], way: Way, calling: Catalog['callings'][number], m: Member): CreationCard {
    const count = way.first!.count, short = count - mine.length, noun = calling.id === 'cleric' ? 'prayer' : 'spell';
    const shut = short > 0 ? `${Words.upper(Words.many(short, noun))} more to choose`
      : !mine.some(id => way.first!.school.includes(id)) ? `One must be of ${way.of || 'your way'}` : undefined;
    return { id: CreationSpells.done, name: `Learn ${count === 3 ? 'these three' : `these ${count}`}`,
      say: 'What you set out knowing.', ...shut ? { shut } : {},
      entry: { facts: [], rules: [], ...CreationSpells.shown(way, calling.name.toLowerCase(), m) } };
  }
  // The spells a way sets out knowing, as the reference beside its card shows them (OWN-15's strip, restored: OR-92):
  // those cast from the first, under when (at will; first level), each with the emblem of what it is for and what it
  // does in a line; then the calling's own and those known now and cast later, by name. The first-level spells are the
  // ones chosen, where they are this way's.
  static shown(way: Way, calling: string, m?: Member): Pick<NonNullable<CreationCard['entry']>, 'groups' | 'after'> {
    const spells = CreationSpells.known(way, m), now = spells.filter(s => s.level <= 1 && !s.own);
    const groups = ([[0, 'At will'], [1, 'First level']] as const).map(([level, heading]) => ({ heading,
      rows: now.filter(s => s.level === level).map(s => ({ id: s.id, name: s.name, line: s.line, emblem: s.kind })) }))
      .filter(g => g.rows.length);
    const own = spells.filter(s => s.own).map(s => s.name), later = spells.filter(s => s.level > 1).map(s => s.name);
    const after = [own.length ? `Every ${calling} knows ${Words.listed(own)} too.` : '',
      later.length ? `Later: ${Words.listed(later)}.` : ''].filter(Boolean).join(' ');
    return { ...groups.length ? { groups } : {}, ...after ? { after } : {} };
  }
  private static known(way: Way, m?: Member): FirstSpell[] {
    const shown = way.spells ?? [], first = new Map((way.first?.open ?? []).map(s => [s.id, s]));
    if (!m?.spells || m.traits?.[0] !== way.id || !way.first) { return shown; }
    return [...shown.filter(s => !first.has(s.id) || s.own), ...m.spells.flatMap(id => first.get(id) ?? [])]
      .filter((s, i, all) => all.findIndex(x => x.id === s.id) === i);
  }
}
