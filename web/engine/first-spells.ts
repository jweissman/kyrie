import { Canon } from '../../src/canon/canon';
import { Content } from '../../src/content';
import type { Trait } from '../../src/canon/schema';
import { SpellSelection } from '../../src/rules/spell-selection';
import { SpellKinds } from '../../src/presentation/spell-kinds';
import { SpellLines } from '../../src/presentation/spell-lines';
import { Expressions } from '../../src/expressions';
import type { FirstSpell } from './protocol';

// The spells a protagonist sets out knowing, shown before the school or god is chosen (OWN-15: a school had been its
// name and "First spells of abjuration"). What is shown is what is given: the page sets the picks as the protagonist's
// own choice (member.spells), which SpellSelection takes as given, so nothing is drawn unseen at Begin. Shown: every
// cantrip of the school or domain, the calling's own spells (a mage's Light), then the picks of each level. The
// picks take the school's own spells first, then of the whole tradition what the rest lack (harm first, then healing,
// then a ward), never one the calling teaches already (an evoker had "picked" Light, which it knew, and set out a
// spell short). Second- and third-level spells are known from the start and cast once there are slots for them.
export class FirstSpells {
  private static readonly wanted = ['harm', 'heal', 'ward', 'curse', 'charm', 'fear', 'sleep', 'summon', 'sight', 'light',
    'move', 'craft'];
  // The spells a calling teaches of its own, whatever its school (a mage's Light, a bard's two).
  static own(classId: string): string[] {
    return (Canon.classes[Canon.resolve('classes', classId)]?.abilities ?? []).filter(a => Canon.abilities[a]?.spell);
  }
  // The picks a specialist of the calling sets out with: legal by SpellSelection, or this throws.
  static picks(id: string, own: string[]): string[] {
    const plan = SpellSelection.plan(this.trait(id)), out: string[] = [];
    for (const l of plan.levels) {
      const school = l.restricted.filter(p => !own.includes(p)), rest = l.open.filter(p => !own.includes(p));
      for (const pool of [school.length ? school : l.restricted, rest]) {
        while (out.filter(p => l.open.includes(p)).length < l.count) {
          const next = this.rank(pool.filter(p => !out.includes(p)), out, id)[0];
          if (!next) { break; }
          out.push(next);
        }
      }
    }
    SpellSelection.validate(plan, out, id);
    return out;
  }
  // The spells shown for a specialization, in the order known: cantrips, the calling's own, then the picks by level.
  static shown(id: string, own: string[], picks: string[]): FirstSpell[] {
    const cantrips = SpellSelection.plan(this.trait(id)).cantrips;
    return [...cantrips, ...own, ...picks].map(s => this.spell(s, own.includes(s)));
  }
  private static trait(id: string): Trait {
    const t = Canon.traits[id];
    if (!t?.spellAccess) { throw new Error(`${id} opens no spells`); }
    return t;
  }
  // A spell as creation shows it: what it does in a line and in whole, read from its effects (an inherited description
  // had said 1d3 where Magic Missile rolls 1d4), what its conditions do, and its emblem.
  static spell(id: string, owned = false): FirstSpell {
    const a = Content.abilities.find(x => x.id === id), c = Canon.abilities[id];
    if (!a || !c) { throw new Error(`No spell ${id}`); }
    return { id, name: c.name, line: SpellLines.of(a), does: SpellLines.of(a, true), rules: SpellLines.rules(a),
      level: a.spell?.level ?? 0, kind: SpellKinds.emblem(a), ...owned ? { own: true } : {} };
  }
  // The options in the order a pick takes them: what the picks so far lack, what is most wanted (a spell that only
  // ends something after one that does something), then by a hash of the spell and the school, so that schools
  // sharing a tradition do not all pick the same.
  private static rank(options: string[], chosen: string[], key: string): string[] {
    const has = new Set(chosen.map(id => this.kind(id)));
    return [...options].sort((a, b) => this.score(a, has) - this.score(b, has)
      || Expressions.seed(`${a}:${key}`) - Expressions.seed(`${b}:${key}`));
  }
  private static score(id: string, has: Set<string>): number {
    const kind = this.kind(id), slight = Content.abilities.find(x => x.id === id)?.effects[0]?.kind === 'remove';
    return (has.has(kind) ? 100 : 0) + this.wanted.indexOf(kind) + (slight ? 0.5 : 0);
  }
  private static kind(id: string): string { return SpellKinds.of(Content.abilities.find(x => x.id === id)!); }
}
