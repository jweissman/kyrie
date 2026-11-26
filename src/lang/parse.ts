import { Deem } from 'deem';
import * as ohm from 'ohm-js';
import { Grammars } from './grammars';

// it: the thing, way or person the act names; here: the place it is done in (the effect language's world targets, L1:
// doc/design/research-abilities-and-the-world-2026-11-26.md §3.3).
export type Target = 'enemy' | 'ally' | 'self' | 'dead ally' | 'enemies' | 'allies' | 'party' | 'all' | 'random enemy'
  | 'random enemies' | 'it' | 'here';
export type Amount = { kind: 'literal'; value: number } | { kind: 'deem'; expression: string };
export type Resource = 'gold' | 'experience' | 'mana' | 'slots' | 'uses';
type EffectBody =
  // A weapon attack (Orsino's attack effect): an attack roll with the actor's weapon, then its damage. Spillover
  // carries lethal excess damage on to another enemy.
  | { kind: 'attack'; target: Target; spillover?: true }
  | { kind: 'damage'; amount: Amount; damageType: string; target: Target }
  | { kind: 'heal'; amount: Amount; target: Target }
  // Orsino's resurrect: a fallen ally back with a share of its health (percent) or the amount, and any traits it
  // comes back with (animate dead's undead).
  | { kind: 'revive'; amount: Amount; target: Target; percent?: number; traits?: string[] }
  // Orsino's randomEffect, cycleEffects and cast: one of the effects, drawn from the seed or taken in turn; or
  // another ability performed at no cost.
  | { kind: 'random' | 'cycle'; effects: Effect[]; target: Target }
  | { kind: 'cast'; ability: string; target: Target; castingLevel?: number }
  | { kind: 'drain'; amount: Amount; damageType?: string; target: Target }
  // Energy drain (the old games' wight and wraith): levels taken from the one touched, held down until a restoration
  // lifts them (see LevelDrain).
  | { kind: 'enervate'; amount: Amount; target: Target }
  | { kind: 'defend' | 'flee'; target: 'self' }
  // duration: turns, or an expression its caster's values settle as it is laid (see Lasting).
  // amount: what it is laid with, thrown by its caster's values (see ConditionAmount).
  | { kind: 'apply'; status: string; duration: number | Amount; clock?: 'owner-turn' | 'world-time' | 'until-removed';
    target: Target; amount?: Amount }
  // pattern: Orsino's removeStatus, a case-insensitive pattern over condition names ("hidden|invisible", ".*").
  | { kind: 'remove'; status: string; target: Target; pattern?: string }
  | { kind: 'kill'; target: Target }
  | { kind: 'gain'; amount: Amount; resource: Resource; target: Target }
  | { kind: 'learn'; ability: string; target: Target }
  // Orsino's summon: amount creatures (one when unstated) of the named species, or drawn from those `from` names, or
  // from the summoner's ancestry's companions; made at a level (first when unstated). The summoner owns them.
  | { kind: 'summon'; creature: string; target: Target; from?: string[]; byAncestry?: Record<string, string[]>;
    amount?: Amount; level?: number }
  | { kind: 'travel'; location: string; target: 'self' }
  // A verb of the kernel's (data/rules/probing.kyr: burning, opening, lighting…) tried on what it is aimed at, lowered
  // to `tried(target, verb)`; what follows is the world's rules for the verb, never the ability's (L2, §3.3).
  | { kind: 'try'; verb: string; target: Target };
// A save names either an attribute (a Kyr attribute save) or an Orsino save category such as breath or will.
// again: what it lays is saved against again on each turn its holder loses to it (see ShakingOff). lesser: a success
// lays what it lays all the same, for so many rounds (the SRD's partial: Cause Fear's one round shaken).
export type Save = { stat?: string; kind?: string; difficulty: Amount; success?: 'negate' | 'half'; again?: true;
  lesser?: number };
// onResist: what a resisted spell save does to this damage. targetTrait: the effect only touches creatures with that
// trait (Orsino's condition.trait). count: how many distinct living enemies 'random enemies' draws (Orsino's
// randomEnemies), all of them if there are fewer. hitDice: how many Hit Dice of those it would fall on it falls on,
// the fewest first (the SRD's Sleep's four: see HitDicePool). chain: a harm that leaps from the one it is aimed at to
// as many other foes, each struck once, each taking that share of what the first took (see Chain). touch: it falls
// only on one a touch attack lands on, melee or ranged, rolled before it (the SRD's touch spells: see Touch).
// triggers: false, its harm's kind sets off none of the conditions that kind triggers (Orsino's acid burn), as the
// SRD's harm does not.
export type Effect = EffectBody & { when?: string; save?: Save; onResist?: 'half' | 'negate'; targetTrait?: string;
  count?: Amount; hitDice?: number; chain?: { count: Amount; ratio: number }; touch?: 'melee' | 'ranged';
  triggers?: false };
export interface ArenaAbility {
  id: string; name: string; effects: Effect[]; cost?: number; cooldown?: number;
  description?: string;
  // A spell spends a slot and is gated by its level; a technique with a level is gated the same way.
  // resistance: it allows spell resistance (the SRD's "Spell Resistance: Yes", not harmless: see SpellResistance).
  spell?: { tradition: 'arcane' | 'divine'; level: number; school?: string; domain?: string; resistance?: boolean };
  level?: number;
  resist?: { kind: string; difficulty: Amount };
  requires?: { status?: string; notStatus?: string; interceptWeapon?: true };
  // Wound up for a turn before it lands; a creature stunned in between loses it.
  windup?: string;
  // How often a day it can be used, until a night's rest (a dragon breathes three times a day).
  uses?: number;
  // The shape of what it lets loose where it is aimed, catching friend and foe alike (see Positions).
  area?: Area;
}
export type Area = 'burst' | 'cone' | 'line';

type Ast = Effect | Effect[] | Amount;
type AstNode = ohm.Node & { ast(): Ast };

export class AbilityParser {
  private static readonly attributes = ['strength', 'dexterity', 'constitution', 'wisdom', 'intelligence', 'charisma'];
  private static readonly grammar = Grammars.abilities;
  private static readonly semantics = AbilityParser.grammar.createSemantics().addOperation<Ast>('ast', {
    Program: AbilityParser.Program,
    Statement: AbilityParser.Statement,
    Conditional: AbilityParser.Conditional,
    Damage: AbilityParser.Damage,
    Healing: AbilityParser.Healing,
    Defend: AbilityParser.Defend,
    Apply: AbilityParser.Apply,
    Remove_one: AbilityParser.Remove,
    Remove_any: AbilityParser.RemoveAny,
    Drain: AbilityParser.Drain,
    DrainLevel: AbilityParser.DrainLevel,
    Revive: AbilityParser.Revive,
    Kill: AbilityParser.Kill,
    Flee: AbilityParser.Flee,
    Gain: AbilityParser.Gain,
    Learn: AbilityParser.Learn,
    Summon: AbilityParser.Summon,
    Travel: AbilityParser.Travel,
    Cast: AbilityParser.Cast,
    Try_on: AbilityParser.TryOn,
    Try_here: AbilityParser.TryHere,
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
  static Statement(statement: ohm.Node, save: ohm.Node, outcomes: ohm.Node, _dot: ohm.Node): Effect {
    const effect = (statement as AstNode).ast() as Effect;
    if (save.children[0]) {
      const node = save.children[0];
      effect.save = AbilityParser.saving(node.children[1]!, node.children[4]!);
    }
    for (const outcome of outcomes.children) { AbilityParser.outcome(effect, outcome); }
    return effect;
  }
  private static verdict(n: ohm.Node): 'half' | 'negate' { return n.sourceString === 'halves' ? 'half' : 'negate'; }
  private static saving(name: ohm.Node, difficulty: ohm.Node): Save {
    const id = name.sourceString;
    return { ...AbilityParser.attributes.includes(id) ? { stat: id } : { kind: id },
      difficulty: (difficulty as AstNode).ast() as Amount };
  }
  // What a save that succeeds does ("; a dexterity save against 15 halves it."), what resisting does ("; resisting
  // halves it."): the SRD's half damage on a save, Orsino's onResist (OR-1320, OR-1321); and on whom alone it falls
  // ("; only on undead or construct."), Orsino's targetTrait (OR-1322).
  private static outcome(effect: Effect, outcome: ohm.Node): void {
    const node = outcome.ctorName === 'Outcome' ? outcome.children[0]! : outcome;
    if (node.ctorName === 'Outcome_resisted') { effect.onResist = AbilityParser.verdict(node.children[2]!); return; }
    if (node.ctorName === 'Outcome_only') {
      effect.targetTrait = [node.children[3]!, ...node.children[5]!.children].map(n => n.sourceString).join('|');
      return;
    }
    if (effect.save) { throw new Error('A statement saves once: "unless" or "; a … save", not both'); }
    const saving = AbilityParser.saving(node.children[2]!, node.children[5]!);
    effect.save = { ...saving, success: AbilityParser.verdict(node.children[6]!) };
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
  // Any of the states named, each as its name reads ("Remove any of \"poison\", \"diseased\" from ally."): Orsino's
  // pattern, lifting whichever of them its holder has (OR-1323).
  static RemoveAny(_remove: ohm.Node, _any: ohm.Node, _of: ohm.Node, first: ohm.Node, _commas: ohm.Node, rest: ohm.Node,
    _from: ohm.Node, target: ohm.Node): Effect {
    const names = [first, ...rest.children].map(n => JSON.parse(n.sourceString) as string);
    return { kind: 'remove', status: '', target: target.sourceString as Target, pattern: names.join('|') };
  }
  static Drain(_drain: ohm.Node, amount: ohm.Node, _health: ohm.Node, _from: ohm.Node, target: ohm.Node): Effect {
    return { kind: 'drain', amount: (amount as AstNode).ast() as Amount, target: target.sourceString as Target };
  }
  static DrainLevel(_drain: ohm.Node, amount: ohm.Node, _levels: ohm.Node, _from: ohm.Node, target: ohm.Node): Effect {
    return { kind: 'enervate', amount: (amount as AstNode).ast() as Amount, target: target.sourceString as Target };
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
  // Another ability performed at no cost (a scroll of fireball read, a wand of magic missile pointed).
  static Cast(_cast: ohm.Node, ability: ohm.Node, _on: ohm.Node, target: ohm.Node): Effect {
    return { kind: 'cast', ability: ability.sourceString, target: target.sourceString as Target };
  }
  // "Try opening on it.", "Try lighting here.": a verb tried on a target, or on the place.
  static TryOn(_try: ohm.Node, verb: ohm.Node, _on: ohm.Node, target: ohm.Node): Effect {
    return { kind: 'try', verb: verb.sourceString, target: target.sourceString as Target };
  }
  static TryHere(_try: ohm.Node, verb: ohm.Node, _here: ohm.Node): Effect {
    return { kind: 'try', verb: verb.sourceString, target: 'here' };
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
