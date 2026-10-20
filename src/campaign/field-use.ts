import { Advancement } from '../rules/advancement';
import type { CampaignActor } from './definition';
import { ModuleWriter } from '../lang/module-writer';
import type { World } from '../lang/world';
import { Content } from '../content';
import { CombatProjection } from '../combat-projection';
import { Effects } from '../effects';
import { Fighting } from '../rules/fighting';
import { AbilityUse } from '../ability-use';
import { Expressions } from '../expressions';
import type { CreatureStore } from '../creature-store';
import type { CombatEvent } from '../model';

export class FieldUse {
  // Experience for a won encounter: its authored value, or what its creatures are worth (Advancement.worth).
  static award(store: CreatureStore, party: string[], world: World,
    result: { opponent: string; members: string[]; events: CombatEvent[] }) {
    const authored = world.module.measures.some(m => m.name === 'encounterXp')
      ? world.number(ModuleWriter.call('encounterXp', result.opponent)) : 0;
    const amount = authored || result.members.reduce((sum, id) => sum + Advancement.worth(store.get(id)), 0);
    this.grant(store, party, amount, result.events);
  }
  // Living members whose experience has reached their next level gain it (Advancement.train).
  static train(store: CreatureStore, members: string[], seed: string): CombatEvent[] {
    const events: CombatEvent[] = [];
    const lease = store.acquire(members.filter(id => store.get(id).state.hp > 0));
    try {
      for (const c of lease.creatures) { events.push(...Advancement.train(c, seed)); }
      lease.commit(lease.creatures, { advancement: true });
    } finally { lease.release(); }
    return events;
  }
  static grant(store: CreatureStore, party: string[], amount: number, events: CombatEvent[]) {
    if (amount <= 0) { return; }
    const lease = store.acquire(party.filter(id => store.get(id).state.hp > 0));
    try {
      for (const c of lease.creatures) {
        c.state.experience += amount;
        events.push({ type: 'gain', turn: 0, actor: c.id, target: c.id, detail: 'experience', amount });
      }
      lease.commit(lease.creatures);
    } finally { lease.release(); }
  }
  static advance(store: CreatureStore, elapsed: number, events: CombatEvent[],
    scene?: { world: World; actors: CampaignActor[]; player?: string }) {
    const ids = store.snapshot.filter(c => c.state.conditions.some(s => s.clock === 'world-time')).map(c => c.id);
    if (!ids.length) { return false; }
    const lease = store.acquire(ids);
    try {
      const fighters = lease.creatures.map(c => CombatProjection.fighter(c, 'fighters'));
      const place = scene?.world.snapshot.relations.find(r => r.name === 'at' && r.args[0] === scene.player)?.args[1];
      const visible = scene?.actors.filter(a => a.id === scene.player || (place
        && scene.world.test(ModuleWriter.call('at', a.id, place)))).flatMap(a => a.members);
      for (const target of fighters) {
        const start = events.length;
        Effects.advance(target, 'world-time', { fighters, turn: elapsed, events,
          content: new Content('clock'), abilities: [], retreat: false, location: null });
        if (visible && !visible.includes(target.id)) {
          events.slice(start).forEach(e => { e.visibility = 'private'; });
        }
      }
      lease.commit(lease.creatures.map(c => CombatProjection.creature(fighters.find(f => f.id === c.id)!, c)));
    } finally { lease.release(); }
    return true;
  }
  static safe(id: string): boolean {
    const ability = Content.abilities.find(a => a.id === id);
    return !!ability && ability.effects.every(e => (['heal', 'remove'].includes(e.kind)
      || (e.kind === 'apply' && Effects.status(e.status).lifetime === 'persistent'))
      && e.target === 'ally' && !e.save);
  }
  static perform(store: CreatureStore, ids: string[], options: {
    ability: string; caster: string; target: string; seed: string; service?: 'recover' | 'reward';
  }): CombatEvent[] {
    const ability = Content.abilities.find(a => a.id === options.ability);
    if (!ability || (!options.service && !this.safe(ability.id))
      || (options.service === 'reward' && ability.effects.some(e => !['learn', 'gain'].includes(e.kind)))) {
      throw new Error('Unsupported field effect');
    }
    const lease = store.acquire([...new Set(ids)]);
    try {
      if (options.service === 'recover' && lease.creatures.every(c => c.state.hp === 0)) { return []; }
      const fighters = lease.creatures.map(c => CombatProjection.fighter(c, 'fighters'));
      const actor = fighters.find(f => f.id === options.caster)!;
      if (!actor || actor.hp === 0 || actor.statuses.some(s => Effects.skips(s.id))
        || (!options.service && !actor.abilities.includes(ability.id))
        || (ability.spell?.level ?? ability.level ?? 0) > Fighting.maxSpellLevel(actor.level)
        || (ability.spell && Effects.modifiers(actor).noSpellcasting)) { throw new Error('Caster cannot use this ability'); }
      const context = { actor, fighters, turn: 0, events: [] as CombatEvent[],
        ...(actor.abilitySources?.[ability.id] ? { source: actor.abilitySources[ability.id] } : {}),
        content: new Content(`${options.seed}:content`), abilities: Content.abilities.map(a => a.id),
        retreat: false, location: null };
      AbilityUse.perform(ability, options.target, new Expressions(options.seed), context);
      const committed = lease.creatures.map(c => CombatProjection.creature(fighters.find(f => f.id === c.id)!, c));
      lease.commit(committed);
      return context.events;
    } finally { lease.release(); }
  }
}
