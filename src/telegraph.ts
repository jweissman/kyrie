import type { Battle } from './battle';
import type { Fighter } from './model';
import type { ItemCatalog } from './item-catalog';
import { SettingPort, type SettingTelegraphs } from './setting-port';

type ArenaAbility = Battle['repertoire'][number];
// Where a line came from, the most particular first; generic is the fallback no foe of the catalog should read.
export type Source = 'kind' | 'type' | 'ability' | 'natural' | 'held' | 'spell' | 'generic';
export interface Telegraphed { line: string; source: Source }
type Who = Pick<Fighter, 'id' | 'name' | 'raceId' | 'equipment'>;

// What a foe's declared blow looks like before it lands, from what it is and what it means to do (the setting's
// data/catalog/telegraphs.json, given through SettingPort): a wolf slinks round, an archer draws, a mage's hands
// kindle. Only the she-bear's maul had said anything of the kind (its windup, "rears up on its hind legs"), so that
// every other intent read "is going for Wenna with its bite" or "means to use sleep on Wenna" (the owner, 26
// November: improve combat at all).
export class Telegraph {
  // Westernesse's, else none, every intent said plainly.
  private static get book(): SettingTelegraphs { return SettingPort.telegraphs ?? Telegraph.plain; }
  private static readonly plain: SettingTelegraphs = { natural: {}, held: {}, abilities: {}, types: {}, kinds: {},
    gestures: {}, gathered: { default: '{Who} is poised over {whom}, about to strike.' },
    together: { natural: '{Who} close on {whom} together.', missile: '{Who} all draw on {whom}.',
      held: '{Who} close on {whom} together.' }, spells: { harm: {}, school: {}, tradition: {} }, type: Telegraph.nobody };
  // called: what the company calls each one in the fight; whom: the one it means its act for.
  static of(catalog: ItemCatalog, foe: Who, ability: ArenaAbility, at: { target: Who; called: (f: Who) => string }):
    Telegraphed {
    const { target, called } = at, found = Telegraph.find(catalog, foe, ability, target.id === foe.id);
    const line = found ? found.line : '{Who} means to use {ability}{at}.';
    return { line: Telegraph.fill(line, { foe, ability, target, called }), source: found?.source ?? 'generic' };
  }
  // Plain blows by more than one at one of the company: by the natural weapon they share, else as missiles or held.
  static together(foes: Who[], target: Who, said: { who: string; whom: string }): string {
    const weapons = new Set(foes.map(f => f.equipment?.weapon?.id ?? 'fist'));
    const natural = foes.every(f => f.equipment?.weapon?.natural), [shared] = [...weapons];
    const key = natural ? weapons.size === 1 && Telegraph.book.together[shared!] ? shared! : 'natural'
      : foes.every(f => f.equipment?.weapon?.missile) ? 'missile' : 'held';
    return Telegraph.book.together[key]!.replace('{Who}', Telegraph.upper(said.who)).replace('{whom}', said.whom);
  }
  // A blow wound up, on the turn before it lands.
  static gathered(foe: Who, ability: ArenaAbility, target: Who, called: (f: Who) => string): string {
    const line = Telegraph.book.gathered[ability.id] ?? Telegraph.book.gathered.default!;
    return Telegraph.fill(line, { foe, ability, target, called });
  }
  // How it winds a blow up, as its body does: the ability's own (a bear rears up on its hind legs) for a beast, its
  // kind of creature's otherwise (a titan raises both fists high).
  static gesture(foe: Pick<Fighter, 'raceId'>, ability: Pick<ArenaAbility, 'windup'>): string {
    const type = Telegraph.book.type(foe.raceId);
    return (type && type !== 'beast' ? Telegraph.book.gestures[type] : undefined) ?? ability.windup ?? 'gathers itself';
  }
  private static find(catalog: ItemCatalog, foe: Who, ability: ArenaAbility, self: boolean):
    { line: string; source: Source } | undefined {
    const species = Telegraph.book.type(foe.raceId);
    const blow = ['melee', 'ranged'].includes(ability.id), weapon = foe.equipment?.weapon;
    const key = blow ? weapon?.id ?? 'fist' : ability.id;
    const kind = Telegraph.book.kinds[foe.raceId]?.[key];
    const type = species ? Telegraph.book.types[species]?.[key] : undefined;
    if (kind) { return { line: kind, source: 'kind' }; }
    if (type) { return { line: type, source: 'type' }; }
    const own = Telegraph.book.abilities[ability.id];
    if (own) { return { line: typeof own === 'string' ? own : species ? own.creature : own.person, source: 'ability' }; }
    if (blow) { return Telegraph.blow(catalog, weapon); }
    return Telegraph.spell(ability, self);
  }
  private static blow(catalog: ItemCatalog, weapon: Fighter['equipment']['weapon'] | undefined):
    { line: string; source: Source } {
    if (!weapon || weapon.natural) {
      return { line: Telegraph.book.natural[weapon?.id ?? 'fist'] ?? Telegraph.book.natural.fist
        ?? '{Who} goes for {whom}.', source: 'natural' };
    }
    const kind = catalog.get(weapon.id).weapon?.kind ?? '', held = Telegraph.book.held;
    const line = held[`${kind}-${weapon.type}`] ?? held[kind] ?? held[weapon.missile ? 'missile' : 'melee']
      ?? '{Who} comes at {whom} with {a weapon}.';
    return { line, source: 'held' };
  }
  private static spell(ability: ArenaAbility, self: boolean): { line: string; source: Source } | undefined {
    const { harm, school, tradition } = Telegraph.book.spells;
    const type = ability.effects.map(e => 'damageType' in e ? e.damageType : undefined).find(Boolean);
    const line = (type && harm[type]) ?? (ability.spell?.school && school[ability.spell.school])
      ?? (ability.spell && tradition[ability.spell.tradition]);
    return line ? { line: self ? line.replace('{at}', '') : line, source: 'spell' } : undefined;
  }
  private static fill(line: string, at: { foe: Who; ability: ArenaAbility; target: Who; called: (f: Who) => string }):
    string {
    const { foe, ability, target, called } = at, who = called(foe), whom = called(target);
    const person = !Telegraph.book.type(foe.raceId), weapon = foe.equipment?.weapon?.name?.toLowerCase() ?? 'fist';
    const a = /^[aeiou]/.test(weapon) ? 'an' : 'a';
    return line.replaceAll('{Who}', Telegraph.upper(who)).replaceAll('{who}', who)
      .replaceAll('{at}', target.id === foe.id ? '' : ` at ${whom}`).replaceAll('{whom}', whom)
      .replaceAll('{its}', person ? 'their' : 'its').replaceAll('{a weapon}', `${a} ${weapon}`)
      .replaceAll('{weapon}', weapon).replaceAll('{ability}', ability.name.toLowerCase());
  }
  private static nobody(this: void): undefined { return undefined; }
  private static upper(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }
}
