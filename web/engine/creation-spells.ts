import type { Catalog, FirstSpell, Member } from './protocol';
import type { CreationCard, CreationStep } from './creation-flow';
import { SpellSchools } from '../../src/presentation/spell-schools';
import { Words } from '../reader/words';

type Way = Catalog['callings'][number]['specializations'][number];
export type SpellStepId = `spell-${number}`;

// A caster's first spells, chosen (the owner, 18 November, OR-93: "explicit starting-spell selection for casters
// again, even if it's another screen"): after the art or the god's keeping, one step for each first-level spell the
// rules give a first-level specialist (SpellSelection: three for a mage or a cleric), each asked in turn ("Which spell
// did you learn first?"). Each offers every first-level spell open to the way, its own art's first; the spell set out
// with until then is the way's own pick (FirstSpells.picks), so a life set out at once has what it always had. One
// chosen that is held at another step changes places with it; one that would leave none of the way's own is shut, as
// SpellSelection.validate asks. What is chosen is the protagonist's alone (member.spells); those drawn are unchanged.
// The spells known from the start of the second and third level are the way's own picks, as before.
export class CreationSpells {
  static readonly id = /^spell-(\d+)$/;
  static is(step: string): step is SpellStepId { return CreationSpells.id.test(step); }
  // The steps, for a first-level caster whose way has first-level spells to choose among; none for anyone else.
  static steps(m: Member, calling?: Catalog['callings'][number]): CreationStep[] {
    const way = calling?.specializations.find(t => t.id === m.traits?.[0]), first = way?.first;
    if (!way || !first?.count || (m.level ?? 1) !== 1) { return []; }
    const mine = CreationSpells.mine(m, way), noun = calling!.id === 'cleric' ? 'prayer' : 'spell';
    const verb = calling!.id === 'cleric' ? 'were you taught' : 'did you learn';
    const art = first.open.filter(s => first.school.includes(s.id));
    const open = [...art, ...first.open.filter(s => !art.includes(s))];
    return Array.from({ length: first.count }, (_, i): CreationStep => ({ id: `spell-${i + 1}`, present: 'rows', emblems: true,
      ask: `Which ${noun} ${verb} ${CreationSpells.order(i, first.count)}?`, ...mine[i] ? { chosen: mine[i] } : {},
      cards: open.map(s => CreationSpells.card(s, i, mine, way)) }));
  }
  // A spell chosen at the i-th step (spell-1 the first), in place of the one there.
  static settle(m: Member, catalog: Catalog, step: SpellStepId, value: string) {
    const calling = catalog.callings.find(c => c.id === m.classId);
    const way = calling?.specializations.find(t => t.id === m.traits?.[0]);
    const i = Number(CreationSpells.id.exec(step)![1]) - 1;
    if (!way?.first?.open.some(s => s.id === value)) { return; }
    const mine = CreationSpells.mine(m, way), ids = new Set(way.first.open.map(s => s.id));
    const now = CreationSpells.put(mine, i, value);
    if (!now.some(id => way.first!.school.includes(id))) { return; }
    m.spells = [...now, ...(m.spells ?? way.picks ?? []).filter(id => !ids.has(id))];
  }
  // The first-level spells chosen so far, in the order of their steps.
  private static mine(m: Member, way: Way): string[] {
    const ids = new Set(way.first!.open.map(s => s.id));
    return (m.spells ?? way.picks ?? []).filter(id => ids.has(id));
  }
  // One put at the i-th place: where it stood at another, the one it replaces goes there.
  private static put(mine: string[], i: number, value: string): string[] {
    const now = [...mine], j = now.indexOf(value);
    if (j >= 0 && j !== i) { now[j] = now[i]!; }
    now[i] = value;
    return now;
  }
  private static order(i: number, count: number): string {
    return i === 0 ? 'first' : i === count - 1 ? 'last' : 'next';
  }
  private static card(s: FirstSpell, i: number, mine: string[], way: Way): CreationCard {
    const at = mine.indexOf(s.id), school = way.first!.school;
    const shut = !CreationSpells.put(mine, i, s.id).some(id => school.includes(id));
    const emblem = SpellSchools.emblem(s.id);
    return { id: s.id, name: s.name, say: `${Words.upper(s.line)}.`, ...emblem ? { emblem } : {},
      ...at >= 0 && at !== i ? { aside: `learned ${CreationSpells.order(at, mine.length)}` } : {},
      ...shut ? { shut: `One must be of ${way.of || 'your way'}` } : {},
      entry: { facts: [['Level', 'First'], ...way.of && school.includes(s.id) ? [['Of', Words.upper(way.of)] as [string, string]]
        : []], rules: [`${Words.upper(s.does)}.`, ...s.rules] } };
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
