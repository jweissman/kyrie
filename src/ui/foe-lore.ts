import { Counted } from '../counted';
import { KindDefenses, type KindTold } from '../kind-defenses';
import { Checks } from '../rules/checks';
import type { ItemCatalog } from '../item-catalog';
import type { Creature } from '../creature';
import type { Fighter } from '../model';

interface Kind { name: string; kind?: string; type?: string }

// What a skill tells of the foe in a fight's first frame, besides how it would go (OR-1432; the economy review of 27
// November: "a dangerous fight should say what a skill or a look tells"). Of each kind of creature faced, the one of
// the company who knows most of such things recalls what its kind is proof against and the worse for, where that is
// anything (KindDefenses.told): the dead by the rites that lay them, beasts by woodcraft, anything else by lore. No die
// is thrown: it is what they know already, their check's total and ten against how hard the kind is to know (ten for
// a beast, thirteen for anything stranger), more for one of a later level. A people (a band of robbers) is known by
// its faces, not by lore; a kind with nothing to say of it is not spoken of (empty words are an obstacle).
export class FoeLore {
  // The skill each kind is known by, by its type; anything else by lore. A setting without the skill knows it by lore.
  private static readonly by: Record<string, string> = { undead: 'rites', beast: 'woodcraft', plant: 'woodcraft' };
  // What the company recalls of the kinds it faces, a line for each kind it knows something of.
  static told(catalog: ItemCatalog, ours: readonly Creature[], foes: readonly Fighter[]): string[] {
    const kinds = [...new Map(foes.filter(f => !f.summoner && catalog.isBody(f.raceId)).map(f => [f.raceId, f]))
      .values()];
    return kinds.flatMap(f => {
      const told = KindDefenses.told(f), base = catalog.creature(f.raceId) as Kind;
      const kind = told.type ? { ...base, kind: 'monster', type: told.type } : base, skill = this.skill(kind);
      const known = skill ? this.knower(catalog, ours, skill, this.difficulty(kind, f)) : undefined;
      const clauses = known ? this.clauses(told) : [];
      if (!known || !clauses.length) { return []; }
      const whose = ours.length === 1 ? 'Your' : `${known.name.split(', ')[0]}'s`;
      return [`${whose} ${Checks.named(skill!)!.toLowerCase()}: ${Counted.plural(kind.name.toLowerCase())} `
        + `${this.list(clauses, 'and')}.`];
    });
  }
  private static skill(kind: Kind): string | undefined {
    const id = this.by[kind.kind === 'animal' ? 'beast' : kind.type ?? ''] ?? 'lore';
    return Checks.named(id) ? id : Checks.named('lore') ? 'lore' : undefined;
  }
  static difficulty(kind: Kind, f: Fighter): number {
    const plain = kind.kind === 'animal' || kind.type === 'beast';
    return (plain ? 10 : 13) + Math.floor((Math.max(1, f.level) - 1) / 2);
  }
  // The one of the company standing who knows most of it, where what they know is enough.
  private static knower(catalog: ItemCatalog, ours: readonly Creature[], skill: string, difficulty: number):
    Creature | undefined {
    const best = Checks.maker(catalog, [...ours], skill);
    return best && 10 + Checks.total(catalog, best, skill) >= difficulty ? best : undefined;
  }
  // What its kind is proof against and the worse for, in words: immune, harm halved, some of every blow turned, harm
  // doubled or more, and mending that only some harm stops.
  static clauses(t: KindTold): string[] {
    const turned = t.turned && `shrug off ${typeof t.turned.amount === 'number' ? Counted.words[t.turned.amount]
      ?? t.turned.amount : 'some'} of every blow${t.turned.unless.length ? ` but ${this.list(t.turned.unless)}` : ''}`;
    return [
      ...t.immune.length ? [`take no harm from ${this.list(t.immune.map(k => k === 'physical' ? 'blows' : k))}`] : [],
      ...t.blows ? ['shrug off half of every blow'] : [], ...turned ? [turned] : [],
      ...t.halved.length ? [`take half of ${this.list(t.halved)}`] : [],
      ...t.worse.length ? [`are the worse for ${this.list(t.worse)}`] : [],
      ...t.mends ? [`mend as they fight${t.mends.stoppedBy.length ? `, unless ${this.list(t.mends.stoppedBy)} has `
        + 'hurt them' : ''}`] : [],
    ];
  }
  private static list(words: readonly string[], or = 'or'): string {
    return words.length < 2 ? words.join('') : `${words.slice(0, -1).join(', ')} ${or} ${words.at(-1)}`;
  }
}
