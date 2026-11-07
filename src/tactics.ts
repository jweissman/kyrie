import { Canon } from './canon/canon';
import { Content } from './content';
import { Effects } from './effects';
import { ItemCatalog } from './item-catalog';
import type { BattleState, Command, Fighter } from './model';
import { Quarry } from './quarry';
import { Expressions } from './expressions';
import type { Amount, ArenaAbility } from './lang/parse';
import { Positions } from './rules/positions';

// The automatic controller's choice: score each legal command, take the best. Ties are broken explicitly, never by
// catalog order: first by the position of the ability in the actor's own ability list (its weapon attack last), then by
// the target's identifier.
export class Tactics {
  private static resistance(target: Fighter, type: string): number {
    const r = Effects.modifiers(target).resistances ?? {};
    return (r.all ?? 0) + (r[type] ?? (Content.rules.physicalDamage.includes(type) ? r.physical ?? 0 : 0));
  }
  // A foe that turns all of a kind of harm is not worth striking with it; one that turns some of it still falls to it,
  // only more slowly, and a blow at it weighs more than a stance, a boast or a guard not needed (two warriors had dug
  // in, taunted and steeled themselves at three glass men half proof against their axes, and never swung at them).
  private static blunted(resistance: number): number { return resistance >= 1 ? 10 * resistance : 5 * resistance; }
  // An area catches whoever stands where it is aimed (see Positions). Each friend it catches weighs against it more
  // than a foe for it; one it could fell, at the worst its dice can do, rules it out: a cleric had let a burst of
  // radiance loose in the press at three glass men and burned the warrior beside them to death. But a burst that
  // holds three glass men still while it scorches two hale warriors is a trade a company makes.
  private static friendly(ability: ArenaAbility, actor: Fighter, ours: Fighter[]): number {
    const worst = Tactics.worst(ability, actor);
    return ours.reduce((n, f) => n - (f.hp <= worst ? 100 : 15), 0);
  }
  private static readonly reckoner = new Expressions('tactics');
  // The most an ability's harm comes to on one it falls on: its dice at their highest (3d6 is eighteen).
  static worst(ability: ArenaAbility, actor: Fighter): number {
    return ability.effects.reduce((n, e) => n + (e.kind !== 'damage' && e.kind !== 'drain' || !e.amount ? 0
      : Tactics.reckoner.harm(Tactics.highest(e.amount), Effects.context(actor))), 0);
  }
  private static highest(amount: Amount): Amount {
    return amount.kind === 'literal' ? amount : { kind: 'deem', expression:
      amount.expression.replace(/(\d*)d(\d+)/g, (_, n: string, d: string) => `(${Number(n || 1) * Number(d)})`) };
  }
  static score(state: BattleState, command: Command): number {
    const actor = state.combatants.find(f => f.id === command.actor)!;
    const target = state.combatants.find(f => f.id === command.target)!;
    // A thing carried to use up is scored as what using it does (see ItemCatalog.use).
    const ability = Content.abilities.find(a => a.id === command.ability) ?? ItemCatalog.used(command.ability)!;
    const area = Positions.area(ability);
    const caught = area ? Positions.caught(actor, command.target, area, state.combatants) : undefined;
    const ours = caught?.filter(f => f.team === actor.team) ?? [], friends = ours.length;
    let score = Tactics.friendly(ability, actor, ours), kept = false;
    for (const effect of ability.effects) {
      switch (effect.kind) {
        case 'attack': case 'damage': case 'drain': {
          const all = effect.target === 'enemies' || effect.target === 'random enemies';
          const foes = caught && Positions.spread(effect) ? caught.length - friends
            : all ? state.combatants.filter(f => f.team !== actor.team && f.hp > 0).length : 0;
          score += 10 + foes * 5;
          // The company finishes whoever is nearest falling; a foe goes for whom its kind would (see Quarry), and a
          // blow at all of them (a turret's volley) falls on that one too.
          score += actor.team === 'fighters' ? Math.max(0, 8 - target.hp)
            : all || Quarry.of(state, actor) === target.id ? 8 : 0;
          const type = effect.kind === 'attack' ? actor.equipment?.weapon?.type ?? 'bludgeoning'
            : effect.kind === 'damage' ? effect.damageType : effect.damageType ?? 'necrotic';
          score -= Tactics.blunted(Tactics.resistance(target, type));
          break;
        }
        case 'enervate': score += target.team !== actor.team ? 15 : 0; break;
        case 'heal': score += Math.min(target.maxHp - target.hp, 10) * 3; break;
        case 'revive': score += 40; break;
        case 'remove': score += target.statuses.some(s => s.id === effect.status) ? 20 : 0; break;
        case 'apply':
          // Standing in front of a frail companion something means to strike comes before a blow of one's own.
          if (Effects.status(effect.status).guard) { score += Quarry.cover(state, actor, target); break; }
          // What one lays on oneself is one turn's readiness, worth the same however many conditions it names (a
          // cleric had blessed and cloaked herself, two apiece, rather than smite the glass men).
          if (Effects.skips(effect.status)) { score += 18; }
          else if (!target.statuses.some(s => s.id === effect.status) && !(effect.target === 'self' && kept)) {
            score += 6; kept ||= effect.target === 'self';
          }
          // A foe's own power (a ghoul's touch) falls on whom its kind goes for, as its blows do.
          if (actor.team !== 'fighters' && target.team !== actor.team && Quarry.of(state, actor) === target.id) { score += 8; }
          break;
        default: break;
      }
    }
    return score - (ability.cost ?? 0);
  }
  private static rank(order: string[], command: Command): number {
    const i = order.indexOf(command.ability);
    return i < 0 ? order.length : i;
  }
  // Ties broken by the targets' ids as written, not as the host's language sorts them (a reader in Tallinn saw another
  // enemy struck: the architecture review's H6).
  static order(a: string, b: string): number { return a < b ? -1 : a > b ? 1 : 0; }
  // A creature's own power is used before a plain blow when it hurts or holds (a drain, a paralysing touch), not one
  // that only hinders (a curse, a fear), which would have the barrow-dead cursing instead of striking.
  private static own(actor: Fighter, c: Command): number {
    const power = actor.innate?.includes(c.ability) ? Content.abilities.find(a => a.id === c.ability) : undefined;
    return power?.spell && power.effects.some(e => ['damage', 'drain'].includes(e.kind)
      || (e.kind === 'apply' && Effects.skips(e.status))) ? 12 : 0;
  }
  static choose(state: BattleState, all: Command[]): Command {
    const actor = state.combatants.find(f => f.id === state.actor)!;
    // A device does what it was made to do whenever it can (a bomb's fuse, a ward's silence), as Orsino's do; it has
    // no judgement to weigh a blow against it.
    const powers = Canon.isDevice(actor.raceId) ? all.filter(c => !['melee', 'ranged', 'wait'].includes(c.ability)) : [];
    const legal = powers.length ? powers : all;
    // Running is the last of what it might do, never a blow's equal (a pike with no bite of its own beside its jaws had
    // fled the company it was holding level with, its flee written before them).
    const order = [...actor.abilities.filter(a => a !== 'flee'), 'melee', 'ranged', 'flee'];
    // A creature's own powers (a ghoul's paralysing touch, a vampire's charm) are what makes it what it is: used when
    // they are ready, before a plain blow; their rest keeps them from every turn (see AbilityUse).
    const ranked = legal.map(command => ({ command,
      score: Tactics.score(state, command) + Tactics.own(actor, command) }))
      .sort((a, b) => b.score - a.score || Tactics.rank(order, a.command) - Tactics.rank(order, b.command)
        || Tactics.order(a.command.target, b.command.target));
    if (!ranked[0]) { throw new Error('No legal tactical command'); }
    return ranked[0].command;
  }
}
