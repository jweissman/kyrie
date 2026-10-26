import { Advancement } from '../rules/advancement';
import { Canon } from '../canon/canon';
import type { CampaignActor } from './definition';
import { ModuleWriter } from '../lang/module-writer';
import type { World } from '../lang/world';
import { Content } from '../content';
import { Spellcasting } from '../rules/spellcasting';
import { CombatProjection } from '../combat-projection';
import { Effects } from '../effects';
import { Fighting } from '../rules/fighting';
import { AbilityUse } from '../ability-use';
import { Expressions } from '../expressions';
import { RandomStreams } from '../random-streams';
import type { CreatureStore } from '../creature-store';
import type { CombatEvent } from '../model';
import type { Attribute } from '../creature';

export class FieldUse {
  // Experience for a won encounter: its authored value for each who stood; or Orsino's reward, shared among those
  // still standing: what its creatures are worth (Advancement.worth), ten for the square of their number, and 25.
  static award(store: CreatureStore, party: string[], world: World,
    result: { opponent: string; members: string[]; events: CombatEvent[] }) {
    const authored = world.module.measures.some(m => m.name === 'encounterXp')
      ? world.number(ModuleWriter.call('encounterXp', result.opponent)) : 0;
    if (authored) { this.grant(store, party, authored, result.events); return; }
    const n = result.members.length, standing = party.filter(id => store.get(id).state.hp > 0).length;
    const won = result.members.reduce((sum, id) => sum + Advancement.worth(store.get(id)), 0) + 10 * n * n + 25;
    this.grant(store, party, Math.floor(won / Math.max(1, standing)), result.events);
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
  // A companion raised from the dead (Orsino's Raise Dead, at a shrine): back with its share of their health, and
  // whatever killed them gone.
  static raise(store: CreatureStore, id: string): CombatEvent[] {
    const lease = store.acquire([id]);
    try {
      const c = lease.creatures[0]!;
      if (c.state.hp > 0) { return []; }
      const revive = Content.abilities.find(a => a.id === 'raise_dead')?.effects.find(e => e.kind === 'revive');
      const percent = revive && 'percent' in revive ? revive.percent ?? 50 : 50;
      c.state.hp = Math.max(1, Math.floor(percent / 100 * c.base.maxHp)); c.state.conditions = [];
      lease.commit([c]);
      return [{ type: 'revive', turn: 0, actor: id, target: id, detail: 'returned to life', amount: c.state.hp }];
    } finally { lease.release(); }
  }
  // Orsino's system shock: at a rest, each who has fallen and not died rolls a d20 and their Constitution against 10.
  // Who makes it comes round with 1 HP; who does not has died where they fell, and only a raising brings them back.
  // It needs someone still on their feet to tend them: a company that has fallen to the last is lost. (Orsino's code
  // adds the Constitution to the difficulty; its own message, as here, adds it to the roll.)
  static shock(store: CreatureStore, members: string[], seed: string): CombatEvent[] {
    const events: CombatEvent[] = [];
    if (!members.some(id => store.get(id).state.hp > 0)) { return events; }
    const lease = store.acquire(members.filter(id => store.get(id).state.hp === 0
      && !store.get(id).state.conditions.some(s => s.id === 'slain')));
    try {
      for (const c of lease.creatures) {
        const die = new Expressions(RandomStreams.key(seed, 'shock', c.id)).number('1d20');
        const modifier = Fighting.statMod(c.base.constitution), success = die + modifier >= 10;
        events.push({ type: 'save', turn: 0, actor: c.id, target: c.id, rolled: die + modifier, difficulty: 10, success,
          die, stat: 'constitution', modifier, kind: 'system shock' });
        if (success) { c.state.hp = 1; } else { c.state.conditions.push({ id: 'slain', remaining: 1, clock: 'until-removed' }); }
        events.push(success ? { type: 'revive', turn: 0, actor: c.id, target: c.id, detail: 'comes round', amount: 1 }
          : { type: 'status', turn: 0, actor: c.id, target: c.id, detail: 'slain', clock: 'until-removed' });
      }
      lease.commit(lease.creatures);
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
  // World-time conditions run down a watch. A company's own flames (a torch, a lantern, a candle; not a conjured
  // light, which runs its course) burn only while they are wanted: where the company is is unlit, and it is not
  // asleep. A lantern is put out to sleep, and in the day, or in a lit room.
  static advance(store: CreatureStore, elapsed: number, events: CombatEvent[],
    scene?: { world: World; actors: CampaignActor[]; player?: string; asleep?: boolean }) {
    const ids = store.live.filter(c => c.state.conditions.some(s => s.clock === 'world-time')).map(c => c.id);
    if (!ids.length) { return false; }
    const lease = store.acquire(ids);
    try {
      const fighters = lease.creatures.map(c => CombatProjection.fighter(c, 'fighters'));
      const place = scene?.player ? scene.world.one('at', scene.player) : undefined;
      const visible = scene?.actors.filter(a => a.id === scene.player || (place
        && scene.world.test(ModuleWriter.call('at', a.id, place)))).flatMap(a => a.members);
      const company = scene?.actors.find(a => a.id === scene.player)?.members ?? [];
      const dark = !!place && !scene?.asleep && scene!.world.test(ModuleWriter.call('unlit', place));
      for (const target of fighters) {
        const start = events.length, own = company.includes(target.id);
        Effects.advance(target, 'world-time', { fighters, turn: elapsed, events,
          content: new Content('clock'), abilities: [], retreat: false, location: null },
        id => own && !dark && this.burns(id));
        if (visible && !visible.includes(target.id)) {
          events.slice(start).forEach(e => { e.visibility = 'private'; });
        }
      }
      lease.commit(lease.creatures.map(c => CombatProjection.creature(fighters.find(f => f.id === c.id)!, c)));
    } finally { lease.release(); }
    return true;
  }
  private static burns(id: string): boolean {
    const grants = Effects.status(id).grants ?? [];
    return grants.includes('light') && grants.includes('flame');
  }
  // What a companion does with study: prepare a spell, or spend a level's advance on a quality, a skill or a spell.
  static study(store: CreatureStore, name: string, args: string[]): CombatEvent[] {
    if (name === 'prepare') { return this.prepare(store, args as [string, string, string, string]); }
    const [member, choice] = args as [string, string], lease = store.acquire([member]);
    try {
      const c = lease.creatures[0]!;
      if (name === 'improve') { Advancement.improve(c, choice as Attribute); } else if (name === 'feat') {
        Advancement.feat(c, choice);
      } else if (name === 'school') { Advancement.school(c, choice); } else { Advancement.learn(c, choice); }
      lease.commit([c], { advancement: true });
      // A skill taken up is said by the command's own result ("Tamsin takes up Climbing."), not again as a gain.
      if (name === 'school') { return []; }
      const what = name === 'improve' ? `${choice.charAt(0).toUpperCase()}${choice.slice(1)} is now ${c.base[choice as Attribute]}`
        : name === 'feat' ? `${Canon.traits[choice]?.name ?? choice} taken up`
          : `${Content.abilities.find(a => a.id === choice)?.name ?? choice} learned`;
      return [{ type: 'gain', turn: 0, actor: member, target: member, detail: what }];
    } finally { lease.release(); }
  }
  // A caster prepares a different spell in a slot; ready at once if that slot was not yet spent.
  static prepare(store: CreatureStore, args: [string, string, string, string]): CombatEvent[] {
    const [caster, tier, outgoing, incoming] = args;
    const index = Number(tier.split('_')[1]) - 1, lease = store.acquire([caster]);
    try {
      const c = lease.creatures[0]!, name = Content.abilities.find(a => a.id === incoming)?.name ?? incoming;
      const now = Spellcasting.prepare(c.state, index, outgoing, incoming);
      lease.commit([c]);
      return [{ type: 'gain', turn: 0, actor: caster, target: caster,
        detail: now ? `${name} is ready` : `${name} will be ready after the next rest` }];
    } finally { lease.release(); }
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
