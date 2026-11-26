import { AbilityUse } from './ability-use';
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
  // The most one blow of the actor's weapon comes to (a kind's routine, each of its weapons in turn): its dice at
  // their highest, a critical's addition and the strength or dexterity behind it (Fighting.weaponDamage), before the
  // defences of whoever it falls on.
  static heaviest(actor: Fighter): number {
    const routine = actor.equipment?.routine?.length ? actor.equipment.routine : [undefined];
    return routine.reduce((n, weapon) => {
      const armed = weapon ? { ...actor, equipment: { ...actor.equipment, weapon } } : actor;
      const rolled = Tactics.reckoner.harm(Tactics.highest({ kind: 'deem',
        expression: Effects.combatant(armed).weapon.damage }), Effects.context(actor));
      return n + AbilityUse.heaviest(armed, rolled);
    }, 0);
  }
  // What a heal mends on the average, its dice at their mean at the actor's values (a cure of one point mends one: a
  // hurt vitalist had spent every turn on its one-point cantrip, srd-proving-cases.md case 51).
  private static mends(amount: Amount, actor: Fighter): number {
    return Tactics.reckoner.harm(Tactics.mean(amount), Effects.context(actor));
  }
  private static mean(amount: Amount): Amount {
    if (amount.kind === 'literal') { return amount; }
    const means = amount.expression.replace(/(\d*)d(\d+)/g,
      (_, n: string, d: string) => `(${Number(n || 1) * (Number(d) + 1) / 2})`);
    return { kind: 'deem', expression: `round(${means})` };
  }
  private static highest(amount: Amount): Amount {
    return amount.kind === 'literal' ? amount : { kind: 'deem', expression:
      amount.expression.replace(/(\d*)d(\d+)/g, (_, n: string, d: string) => `(${Number(n || 1) * Number(d)})`) };
  }
  static score(state: BattleState, command: Command): number {
    const actor = state.combatants.find(f => f.id === command.actor)!;
    const target = state.combatants.find(f => f.id === command.target)!;
    // A thing carried to use up is scored as what using it does, as it was carried in (see ItemCatalog.fought).
    // Words (Parley) are no blow, and score nothing.
    const ability = Content.abilities.find(a => a.id === command.ability) ?? ItemCatalog.fought(actor, command.ability);
    if (!ability) { return 0; }
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
        case 'heal': score += Math.min(target.maxHp - target.hp, Tactics.mends(effect.amount, actor), 10) * 3; break;
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
    return score + Tactics.surer(ability, actor, target) - (ability.cost ?? 0);
  }
  // How much surer a power's harm is to fell the one it is aimed at than the actor's own blow would be, in the
  // score's tens: the chance that it lands (a blow's d20 against what the SRD's to-hit needs; a power with no attack
  // roll lands, its save for half halving its harm half the time) by how much of what they have left its mean harm
  // takes. A blow is the measure, so it scores nothing over itself and nothing changes for one who only strikes; a
  // power that kills where a blow might miss outscores it by more than its slot (the World agent's ladder under
  // Porthalen: a mage of four hit points, given Siphon Life, swung her staff at two rats of one and died to them, the
  // blow and the spell scoring alike before the slot's cost, so that the spell lost by one). Only whole tenths surer
  // count, and never less than nothing: a raiser's 1d4 cantrip at a warrior of 33 had come out a tenth surer than its
  // knife by rounding, tied its slot, and was cast every turn its scald was not (test/interior-walk).
  private static surer(ability: ArenaAbility, actor: Fighter, target: Fighter): number {
    if (actor.team === target.team || target.hp <= 0) { return 0; }
    const harm = ability.effects.filter(e => e.kind === 'damage' || e.kind === 'drain');
    if (!harm.length || ability.effects.some(e => e.kind === 'attack')) { return 0; }
    const power = Math.min(1, harm.reduce((n, e) => n + Tactics.fells(ability, e, actor, target.hp), 0));
    return Math.max(0, Math.floor(10 * (power - Tactics.blow(actor, target))));
  }
  // How much of what one has left a power's harm takes on the average, its save weighed in.
  private static fells(ability: ArenaAbility, e: ArenaAbility['effects'][number], actor: Fighter, hp: number): number {
    const mean = 'amount' in e && e.amount ? Tactics.reckoner.harm(Tactics.mean(e.amount), Effects.context(actor)) : 0;
    const of = Math.min(1, mean / hp), half = Math.min(1, mean / 2 / hp), saved = !!ability.resist;
    return e.onResist === 'half' && saved ? (of + half) / 2 : e.onResist === 'negate' && saved ? of / 2 : of;
  }
  // The actor's own blow at them, as surer reads a power: the chance it lands by how much of them its mean harm takes.
  private static blow(actor: Fighter, target: Fighter): number {
    const dice = Effects.combatant(actor).weapon.damage;
    const rolled = Tactics.reckoner.harm(Tactics.mean({ kind: 'deem', expression: dice }), Effects.context(actor));
    const odds = AbilityUse.odds(actor, target, rolled);
    return odds.lands * Math.min(1, odds.harm / target.hp);
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
    // Words are the player's to try, never the tactics' (see Parley): a turn left to them is fought.
    const fought = all.filter(c => c.ability !== 'demand');
    const legal = powers.length ? powers : fought.length ? fought : all;
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
