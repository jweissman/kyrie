import { Deem } from 'deem';
import * as ohm from 'ohm-js';
import core from './Kyr.ohm' with { type: 'text' };
import source from './Abilities.ohm' with { type: 'text' };

export type Target = 'enemy' | 'ally' | 'self' | 'dead ally' | 'enemies' | 'allies' | 'party' | 'all' | 'random enemy';
export type Amount = { kind: 'literal'; value: number } | { kind: 'deem'; expression: string };
export type Resource = 'gold' | 'experience' | 'mana' | 'slots';
type EffectBody =
  // A weapon attack (Orsino's attack effect): an attack roll with the actor's weapon, then its damage. Spillover
  // carries lethal excess damage on to another enemy.
  | { kind: 'attack'; target: Target; spillover?: true }
  | { kind: 'damage'; amount: Amount; damageType: string; target: Target }
  | { kind: 'heal' | 'revive'; amount: Amount; target: Target }
  | { kind: 'drain'; amount: Amount; damageType?: string; target: Target }
  | { kind: 'defend' | 'flee'; target: 'self' }
  | { kind: 'apply'; status: string; duration: number; clock?: 'owner-turn' | 'world-time' | 'until-removed'; target: Target }
  | { kind: 'remove'; status: string; target: Target }
  | { kind: 'kill'; target: Target }
  | { kind: 'gain'; amount: Amount; resource: Resource; target: Target }
  | { kind: 'learn'; ability: string; target: Target }
  | { kind: 'summon'; creature: string; target: Target }
  | { kind: 'travel'; location: string; target: 'self' };
// A save names either an attribute (a Kyr attribute save) or an Orsino save category such as breath or will.
export type Save = { stat?: string; kind?: string; difficulty: Amount; success?: 'negate' | 'half' };
// onResist: what a resisted spell save does to this damage. targetTrait: the effect only touches creatures with that
// trait (Orsino's condition.trait).
export type Effect = EffectBody & { when?: string; save?: Save; onResist?: 'half' | 'negate'; targetTrait?: string };
export interface ArenaAbility {
  id: string; name: string; effects: Effect[]; cost?: number; cooldown?: number;
  description?: string;
  // A spell spends a slot and is gated by its level; a technique with a level is gated the same way.
  spell?: { tradition: 'arcane' | 'divine'; level: number; school?: string; domain?: string };
  level?: number;
  resist?: { kind: string; difficulty: Amount };
  requires?: { status?: string; interceptWeapon?: true };
}

type Ast = Effect | Effect[] | Amount;
type AstNode = ohm.Node & { ast(): Ast };

export class AbilityParser {
  private static readonly attributes = ['strength', 'dexterity', 'constitution', 'wisdom', 'intelligence', 'charisma'];
  private static readonly grammar = ohm.grammars(`${core}\n${source}`).KyrAbilities!;
  private static readonly semantics = AbilityParser.grammar.createSemantics().addOperation<Ast>('ast', {
    Program: AbilityParser.Program,
    Statement: AbilityParser.Statement,
    Conditional: AbilityParser.Conditional,
    Damage: AbilityParser.Damage,
    Healing: AbilityParser.Healing,
    Defend: AbilityParser.Defend,
    Apply: AbilityParser.Apply,
    Remove: AbilityParser.Remove,
    Drain: AbilityParser.Drain,
    Revive: AbilityParser.Revive,
    Kill: AbilityParser.Kill,
    Flee: AbilityParser.Flee,
    Gain: AbilityParser.Gain,
    Learn: AbilityParser.Learn,
    Summon: AbilityParser.Summon,
    Travel: AbilityParser.Travel,
    expression: AbilityParser.expression,
    integer: AbilityParser.integer,
  });

  static Program(statements: ohm.Node): Effect[] {
    const effects: Effect[] = [];
    for (const statement of statements.children) {
      effects.push((statement as AstNode).ast() as Effect);
    }
    return effects;
  }
  static Statement(statement: ohm.Node, save: ohm.Node, _dot: ohm.Node): Effect {
    const effect = (statement as AstNode).ast() as Effect;
    if (save.children[0]) {
      const node = save.children[0];
      const name = node.children[1]!.sourceString;
      effect.save = { ...AbilityParser.attributes.includes(name) ? { stat: name } : { kind: name },
        difficulty: (node.children[4] as AstNode).ast() as Amount };
    }
    return effect;
  }
  static Conditional(_if: ohm.Node, expression: ohm.Node, _comma: ohm.Node, action: ohm.Node): Effect {
    const effect = (action as AstNode).ast() as Effect;
    const condition = ((expression as AstNode).ast() as { expression: string }).expression;
    effect.when = effect.when ? `(${condition}) && (${effect.when})` : condition;
    return effect;
  }
  static Damage(
    _deal: ohm.Node,
    amount: ohm.Node,
    damageType: ohm.Node,
    _damage: ohm.Node,
    _to: ohm.Node,
    target: ohm.Node,
  ): Effect {
    return { kind: 'damage', amount: (amount as AstNode).ast() as Amount,
      damageType: damageType.sourceString, target: target.sourceString as Target };
  }
  static Healing(_heal: ohm.Node, amount: ohm.Node, _health: ohm.Node, _to: ohm.Node, target: ohm.Node): Effect {
    return { kind: 'heal', amount: (amount as AstNode).ast() as Amount, target: target.sourceString as Target };
  }
  static Defend(_word: ohm.Node): Effect { return { kind: 'defend', target: 'self' }; }
  static Apply(
    _apply: ohm.Node,
    status: ohm.Node,
    _to: ohm.Node,
    target: ohm.Node,
    _for: ohm.Node,
    duration: ohm.Node,
    span: ohm.Node,
  ): Effect {
    // "for 3 turns" counts the owner's turns in a fight; "for 1 hour" runs on the world clock, six watches an hour.
    const hours = span.sourceString.startsWith('hour');
    return { kind: 'apply', status: status.sourceString, target: target.sourceString as Target,
      duration: Number(duration.sourceString) * (hours ? 6 : 1), ...(hours ? { clock: 'world-time' as const } : {}) };
  }
  static Remove(_remove: ohm.Node, status: ohm.Node, _from: ohm.Node, target: ohm.Node): Effect {
    return { kind: 'remove', status: status.sourceString, target: target.sourceString as Target };
  }
  static Drain(_drain: ohm.Node, amount: ohm.Node, _health: ohm.Node, _from: ohm.Node, target: ohm.Node): Effect {
    return { kind: 'drain', amount: (amount as AstNode).ast() as Amount, target: target.sourceString as Target };
  }
  static Revive(_revive: ohm.Node, target: ohm.Node, _with: ohm.Node, amount: ohm.Node, _health: ohm.Node): Effect {
    return { kind: 'revive', amount: (amount as AstNode).ast() as Amount, target: target.sourceString as Target };
  }
  static Kill(_kill: ohm.Node, target: ohm.Node): Effect {
    return { kind: 'kill', target: target.sourceString as Target };
  }
  static Flee(_flee: ohm.Node): Effect { return { kind: 'flee', target: 'self' }; }
  static Gain(_grant: ohm.Node, amount: ohm.Node, resource: ohm.Node, _to: ohm.Node, target: ohm.Node): Effect {
    return { kind: 'gain', amount: (amount as AstNode).ast() as Amount,
      resource: resource.sourceString as Resource, target: target.sourceString as Target };
  }
  static Learn(_teach: ohm.Node, ability: ohm.Node, _to: ohm.Node, target: ohm.Node): Effect {
    return { kind: 'learn', ability: ability.sourceString, target: target.sourceString as Target };
  }
  static Summon(_summon: ohm.Node, creature: ohm.Node, _for: ohm.Node, target: ohm.Node): Effect {
    return { kind: 'summon', creature: creature.sourceString, target: target.sourceString as Target };
  }
  static Travel(_travel: ohm.Node, _to: ohm.Node, location: ohm.Node): Effect {
    return { kind: 'travel', location: location.sourceString, target: 'self' };
  }
  static expression(_open: ohm.Node, content: ohm.Node, _close: ohm.Node): Amount {
    return { kind: 'deem', expression: content.sourceString.trim() };
  }
  static integer(this: ohm.Node, _digits: ohm.Node): Amount {
    return { kind: 'literal', value: Number(this.sourceString) };
  }

  static parse(id: string, name: string, text: string): ArenaAbility {
    const match = AbilityParser.grammar.match(text, 'Program');
    if (match.failed()) { throw new Error(`Invalid ability ${id}: ${match.message}`); }
    const effects = AbilityParser.semantics(match).ast() as Effect[];
    for (const effect of effects) {
      if (effect.when && Deem.grammar.match(effect.when).failed()) { throw new Error('Invalid condition'); }
      const amounts = ['amount' in effect ? effect.amount : undefined, effect.save?.difficulty];
      for (const amount of amounts) {
        if (!amount) { continue; }
        if (amount.kind === 'literal' && !Number.isSafeInteger(amount.value)) {
          throw new Error(`Unsafe numeric literal in ${id}`);
        }
        if (amount.kind === 'deem' && Deem.grammar.match(amount.expression).failed()) {
          throw new Error(`Invalid Deem expression in ${id}: ${amount.expression}`);
        }
      }
    }
    return { id, name, effects };
  }
}

export const parseAbility = AbilityParser.parse;
