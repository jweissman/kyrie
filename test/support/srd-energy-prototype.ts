import source from '../../data/sources/srd35/spells.json';
import { AbilityUse } from '../../src/ability-use';
import { Effects, type EffectContext } from '../../src/effects';
import { Targeting } from '../../src/targeting';
import { Spellcasting } from '../../src/rules/spellcasting';
import { Amounts } from '../../src/rules/amounts';
import type { ArenaAbility, Effect } from '../../src/lang/index';
import type { Fighter } from '../../src/model';

export interface EnergyRecipe {
  id: string; name: string; level: number; school: string; positive: boolean; mass: boolean; amount: string;
}
export interface Point { x: number; y: number }

// A spec-only adapter: explicit recipient choice and living/undead dispatch precede ordinary effect resolution.
export class SrdEnergyPrototype {
  static rays(): ArenaAbility[] {
    const spells: Record<string, { name: string; school: string; levels: Record<string, number>; sr: string;
      attack: string; duration: string; save: string; damage?: { dice: string; type: string } }> = source.spells;
    return ['acid-splash', 'ray-of-frost'].map(id => {
      const s = spells[id];
      if (!s?.damage || s.levels['Sor/Wiz'] !== 0 || s.attack !== 'ranged touch'
        || s.duration !== 'Instantaneous' || s.save !== 'None' || !['Yes', 'No'].includes(s.sr)) {
        throw new Error(`Unsupported cantrip ray ${id}`);
      }
      return { id: `prototype:${id}`, name: s.name,
        spell: { tradition: 'arcane', level: 0, school: s.school, resistance: s.sr === 'Yes' },
        effects: [{ kind: 'damage', target: 'enemy', amount: Amounts.of(s.damage.dice),
          damageType: s.damage.type, touch: 'ranged', triggers: false }] };
    });
  }
  static recipes(): EnergyRecipe[] {
    const spells: Record<string, { name: string; levels: Record<string, number>; school: string }> = source.spells;
    return ['cure', 'inflict'].flatMap(family => ['minor', 'light', 'moderate', 'serious', 'critical']
      .flatMap((strength, n) => (n === 0 ? [false] : [false, true]).map(mass => {
        const id = `${family}-${strength}-wounds${mass ? '-mass' : ''}`, s = spells[id];
        if (!s || s.levels.Clr === undefined) { throw new Error(`Missing cleric source spell ${id}`); }
        return { id, name: s.name, level: s.levels.Clr, school: s.school, positive: family === 'cure', mass,
          amount: n === 0 ? '1' : `${n}d8 + min(#castingLevel, ${mass ? 20 + 5 * n : 5 * n})` };
      })));
  }
  static ability(recipe: EnergyRecipe): ArenaAbility {
    return { id: `prototype:${recipe.id}`, name: recipe.name, effects: [],
      spell: { tradition: 'divine', level: recipe.level, school: recipe.school, resistance: true } };
  }
  static effect(recipe: EnergyRecipe, actor: Fighter, target: Fighter): Effect {
    const healing = recipe.positive !== Targeting.bears(target, 'undead'), amount = Amounts.of(recipe.amount);
    if (healing) { return { kind: 'heal', target: 'all', amount }; }
    return { kind: 'damage', target: 'all', amount, damageType: recipe.positive ? 'radiant' : 'necrotic',
      triggers: false, ...recipe.mass ? {} : { touch: 'melee' as const },
      save: { kind: 'will', difficulty: Amounts.of(String(10 + recipe.level + Math.floor((actor.wisdom - 10) / 2))),
        success: 'half' } };
  }
  static selected(recipe: EnergyRecipe, context: EffectContext, ids: string[],
    points: Record<string, Point>): Fighter[] {
    const actor = context.actor;
    if (!actor) { throw new Error('Energy spell requires a caster'); }
    const level = Effects.context(actor).castingLevel;
    if (!Number.isSafeInteger(level) || level! < 1) { throw new Error('Energy spell requires a positive caster level'); }
    if (!ids.length || new Set(ids).size !== ids.length || ids.length > (recipe.mass ? level! : 1)) {
      throw new Error('Invalid energy spell recipient count');
    }
    const targets = ids.map(id => {
      const target = context.fighters.find(f => f.id === id);
      if (!target || target.hp <= 0) { throw new Error(`Invalid energy spell recipient ${id}`); }
      return target;
    });
    const distance = (a: string, b: string): number => {
      const p = points[a], q = points[b];
      if (!p || !q || ![p.x, p.y, q.x, q.y].every(Number.isFinite)) { throw new Error('Missing recipient position'); }
      return Math.hypot(p.x - q.x, p.y - q.y);
    };
    const range = recipe.mass ? 25 + 5 * Math.floor(level! / 2) : 5;
    if (targets.some(t => distance(actor.id, t.id) > range)
      || recipe.mass && targets.some(t => targets.some(u => distance(t.id, u.id) > 30))) {
      throw new Error('Energy spell recipients out of range');
    }
    return targets;
  }
  static cast(recipe: EnergyRecipe, context: EffectContext, ids: string[], points: Record<string, Point>) {
    const targets = this.selected(recipe, context, ids, points), actor = context.actor!;
    const expressions = context.expressions;
    if (!expressions) { throw new Error('Energy spell requires seeded expressions'); }
    const ability = this.ability(recipe), effects = targets.map(t => this.effect(recipe, actor, t));
    effects.forEach(e => Effects.validate(e, context.abilities));
    if (!Spellcasting.affordable(actor, ability)) { throw new Error(`No ready slot for ${recipe.id}`); }
    Spellcasting.spend(actor, ability);
    context.events.push({ type: 'action', turn: context.turn,
      command: { actor: actor.id, ability: ability.id, target: ids.join(',') } });
    const cast = { ...context, spell: true, resisting: new Map<string, boolean>() };
    return targets.map((target, i) => {
      // Harmless healing of a willing recipient does not use the hostile touch/save/resistance route.
      const landed = effects[i]!.kind === 'heal' ? { ...cast, resisting: undefined } : cast;
      return AbilityUse.effectOn(effects[i]!, target, { expressions, context: landed, ability: ability.id });
    });
  }
}
