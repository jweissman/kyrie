import type { Amount, ArenaAbility, Effect } from '../lang/parse';
import { MechanicsText } from './mechanics-text';

type Laid = Extract<Effect, { kind: 'apply' }>;

// What a spell does, in a line a player would say of it (OWN-15: a school's spells had been shown by their inherited
// descriptions, one of which says 1d3 where the spell rolls 1d4, and by "You are minor warded for 10 turns"). Read from
// its effects, so that it says what the spell does: the harm first, by its dice and its kind, and to whom; then what it
// lays on them, each by a verb ("scalds it", "wards you lightly"); then anything else it does. Short, for a row beside
// the spell's name, with a duration only for what is laid alone; or whole, for the rules behind Details, with what
// each condition it lays does and what save resists it.
export class SpellLines {
  // A first-level caster of middling qualities, for what a formula comes to without its formula.
  static readonly actor = { level: 1, strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10,
    charisma: 10, bonusSpellDC: 0 };
  // What laying a condition does, as a verb with its object ({o}) or the object's possessive ({p}).
  private static readonly verbs: Record<string, string> = {
    minor_warded: 'wards {o} lightly', warded: 'wards {o}', major_warded: 'wards {o} strongly', shielded: 'shields {o}',
    mage_armored: 'armours {o} in force', blurred: 'blurs {o}', hidden: 'hides {o}', lit: 'lights {p} way',
    mirror_images: 'surrounds {o} with false images', magebane: 'punishes foes who cast', anointed: 'anoints {o}',
    blessed: 'blesses {o}', keen: 'keens {p} weapon', luminous_blade: 'makes {p} weapon shine against the dead',
    ghost_touch: 'gives {o} a rotting touch', barkskin: 'turns {p} skin to bark', cunning: 'sharpens {p} wits',
    augured: 'gives {o} an omen', insight: 'clears {p} mind', mind_blank: 'shuts {p} mind to charms and fear',
    protected: 'protects {o}', courage: 'emboldens {o}', darkproof: 'guards {o} against darkness',
    fireproof: 'guards {o} against fire', death_ward: 'guards {o} against death', inspired: 'inspires {o}',
    battlecry: 'rouses {o}', consecrated: 'hallows the ground about {o}', ion_shield: 'charges {o} with lightning',
    flight: 'lifts {o} into the air', unbarring: 'lets {o} open locks at a touch',
    slow: 'slows {o}', deafened: 'deafens {o}', hexed: 'hexes {o}', cursed: 'curses {o}', confused: 'confuses {o}',
    distracted: 'distracts {o}', charmed: 'charms {o}', stun: 'stuns {o}', asleep: 'puts {o} to sleep',
    scalded: 'scalds {o}', blinded: 'blinds {o}', drenched: 'drenches {o}', paralyzed: 'paralyses {o}',
    fear: 'frightens {o}', weakened: 'weakens {o}', sunmarked: 'brands {o}', fleeing: 'puts {o} to flight',
    despair: 'fills {o} with despair', entangled: 'entangles {o}', calm: 'calms {o}', mocked: 'mocks {o}',
    prone: 'fells {o}', poison: 'poisons {o}', disease: 'sickens {o}',
  };
  // What a condition is called when it is ended.
  private static readonly ends: Record<string, string> = { fear: 'fear', frightened: 'fear', poison: 'poison',
    diseased: 'disease', disease: 'disease', cursed: 'curses', blinded: 'blindness', distracted: 'distraction',
    weakened: 'weakness', fatigued: 'weariness', slow: 'slowness', polymorphed: 'a changed shape' };
  private static readonly numbers = ['no', 'one', 'two', 'three', 'four', 'five', 'six'];
  static of(spell: ArenaAbility, whole = false): string {
    const harms: Effect[] = spell.effects.filter(e => e.kind === 'damage' || e.kind === 'drain');
    const laid = spell.effects.filter((e): e is Laid => e.kind === 'apply');
    const rest = spell.effects.filter(e => !harms.includes(e) && e.kind !== 'apply');
    const named = new Set<string>(), clauses: string[] = [];
    if (harms.length) { clauses.push(this.harm(harms, named)); }
    for (const target of [...new Set(laid.map(e => e.target))]) {
      clauses.push(this.lays(laid.filter(e => e.target === target), named, whole || !clauses.length));
    }
    clauses.push(...rest.map(e => this.other(e, named)));
    const said = clauses.filter(Boolean).join(', and ');
    return said.charAt(0).toUpperCase() + said.slice(1);
  }
  // The rules behind the line: what each condition laid does, and the save that resists the spell, if one does.
  static rules(spell: ArenaAbility): string[] {
    const laid = [...new Set(spell.effects.flatMap(e => e.kind === 'apply' ? [e.status] : []))];
    const save = spell.effects.find(e => e.save)?.save;
    return [...laid.map(id => MechanicsText.condition(id, this.actor)).filter((c): c is string => !!c),
      ...save ? [`${this.upper(MechanicsText.save(save, this.actor))}.`] : []];
  }
  // "1d4 fire to one foe", "1d2 necrotic, psychic and cold to one foe", "drains 1d6 life from one foe"; and what more
  // falls on some ("3d4 more if undead").
  private static harm(harms: Effect[], named: Set<string>): string {
    const first = harms[0]!, to = this.who(first), plain = harms.filter(e => !e.targetTrait || e === first);
    named.add(first.target);
    if (first.kind === 'drain') { return `drains ${this.amount(first)} life from ${to}`; }
    const amounts = plain.map(e => this.amount(e)), types = plain.map(e => (e as { damageType?: string }).damageType);
    const same = amounts.every(a => a === amounts[0]);
    const what = same ? `${amounts[0]} ${this.list(types.filter(Boolean) as string[])}`
      : this.list(plain.map((_, i) => `${amounts[i]} ${types[i]}`));
    const more = harms.filter(e => e.targetTrait && e !== first).map(e => `${this.amount(e)} more if ${e.targetTrait}`);
    return [`${what} to ${to}`, ...more].join(', ');
  }
  // What is laid on one target: "hexes one foe for 3 turns", "protects and emboldens an ally", "hides you and
  // sharpens your wits"; on one already named, by its pronoun ("and scalds it").
  private static lays(laid: Laid[], named: Set<string>, timed: boolean): string {
    const target = laid[0]!.target, again = named.has(target);
    named.add(target);
    const noun = again ? this.pronoun(target) : this.who(laid[0]!), it = this.pronoun(target);
    const verbs = laid.map(e => this.verbs[e.status] ?? `lays ${MechanicsText.conditionName(e.status)} on {o}`);
    const simple = verbs.every(v => /^\S+ \{o\}$/.test(v));
    const said = simple ? `${this.list(verbs.map(v => v.replace(' {o}', '')))} ${noun}`
      : verbs.map((v, i) => v.replace('{o}', i ? it : noun).replace('{p}', this.possessive(i ? it : noun)))
        .join(' and ');
    const spans = [...new Set(laid.map(e => MechanicsText.duration(e.duration, e.clock)))];
    return timed && spans.length === 1 ? `${said} ${this.lasting(spans[0]!)}` : said;
  }
  private static other(e: Effect, named: Set<string>): string {
    const to = named.has(e.target) ? this.pronoun(e.target) : this.who(e);
    switch (e.kind) {
      case 'random': case 'cycle': return this.chance(e, to);
      case 'heal': return `heals ${to} for ${this.amount(e)}`;
      case 'remove': return this.remove(e, to);
      case 'summon': {
        const many = e.amount && !(e.amount.kind === 'literal' && e.amount.value === 1);
        return `calls ${many ? `${this.amount(e)} creatures` : 'a creature'} to fight for you`;
      }
      case 'revive': return `raises ${to}${e.traits?.includes('undead') ? ' as undead' : ''}`;
      case 'attack': return `a weapon blow at ${to}`;
      case 'kill': return `slays ${to}`;
      case 'defend': return 'guards you until your next turn';
      case 'flee': case 'travel': return 'takes you out of the fight';
      default: return MechanicsText.effect(e, this.actor).replace(/ \([^()]*\)/g, '');
    }
  }
  // One of several, by chance or in turn: "confuses, slows or distracts them, by chance".
  private static chance(e: Extract<Effect, { kind: 'random' | 'cycle' }>, to: string): string {
    const verbs = e.effects.map(x => x.kind === 'apply' ? this.verbs[x.status] : undefined);
    if (verbs.some(v => !v || !/^\S+ \{o\}$/.test(v))) {
      return MechanicsText.effect(e, this.actor).replace(/ \([^()]*\)/g, '');
    }
    const said = this.list(verbs.map(v => v!.replace(' {o}', '')), 'or');
    return `${said} ${to}, ${e.kind === 'random' ? 'by chance' : 'each in turn'}`;
  }
  private static remove(e: Extract<Effect, { kind: 'remove' }>, to: string): string {
    const ids = e.status ? [e.status] : (e.pattern ?? '').split('|').filter(Boolean);
    if (ids.includes('hidden') || ids.includes('invisible')) { return `reveals ${to.replace(/(foes?)$/, 'hidden $1')}`; }
    const names = [...new Set(ids.map(id => this.ends[id] ?? MechanicsText.conditionName(id)))];
    const said = names.length > 3 ? `${names.slice(0, 2).join(', ')} and more` : this.list(names, 'or');
    return `ends ${said || 'what holds them'} on ${to}`;
  }
  // Whom an effect falls on: "one foe", "every undead foe", "three foes at random", "an ally", "you".
  private static who(e: Effect): string {
    const kind = e.targetTrait ? `${e.targetTrait} ` : '';
    switch (e.target) {
      case 'self': return 'you';
      case 'enemy': return `one ${kind}foe`;
      case 'enemies': return `every ${kind}foe`;
      case 'random enemy': return `a ${kind}foe at random`;
      case 'random enemies': return `${e.count ? this.count(e.count) : 'some'} ${kind}foes at random`;
      case 'ally': return 'an ally';
      case 'allies': return 'every ally';
      case 'party': return 'the whole company';
      case 'dead ally': return `a fallen ${e.targetTrait ?? 'ally'}`;
      default: return 'everyone';
    }
  }
  private static pronoun(target: Effect['target']): string {
    return target === 'self' ? 'you' : target === 'enemy' || target === 'random enemy' ? 'it' : 'them';
  }
  private static possessive(noun: string): string {
    return ({ you: 'your', it: 'its', them: 'their' } as Record<string, string>)[noun] ?? `${noun}’s`;
  }
  private static count(n: Amount): string {
    const said = MechanicsText.amount(n, this.actor);
    return this.numbers[Number(said)] ?? said;
  }
  // A formula as it comes to at first level, without its range: "1d4", "1d8+10".
  private static amount(e: Effect): string {
    const amount = (e as { amount?: Amount }).amount;
    return amount ? MechanicsText.amount(amount, this.actor).replace(/ \([^()]*\)$/, '').replace(/ \+ 0\b/g, '')
      .replace(/ ([+−-]) /g, '$1') : '';
  }
  private static lasting(span: string): string {
    return span.startsWith('until') ? span : `for ${span}`;
  }
  private static list(words: string[], and = 'and'): string {
    return words.length > 1 ? `${words.slice(0, -1).join(', ')} ${and} ${words.at(-1)}` : words[0] ?? '';
  }
  private static upper(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }
}
