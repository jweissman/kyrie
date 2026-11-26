import type { Recovery } from '../rules/daily-uses';
import { Traits } from '../ports/traits';
import { Tended } from '../rules/tended';
import { Advancement } from '../rules/advancement';
import { LevelDrain } from '../rules/level-drain';
import { Canon } from '../canon/canon';
import type { CampaignActor } from './definition';
import { ModuleWriter } from '../lang/module-writer';
import type { World } from '../lang/world';
import { Content } from '../content';
import { EffectShadows } from '../ports/effects';
import { Spellcasting } from '../rules/spellcasting';
import { CombatProjection } from '../combat-projection';
import { Effects } from '../effects';
import { Fighting } from '../rules/fighting';
import { AbilityUse } from '../ability-use';
import { Expressions } from '../expressions';
import { RandomStreams } from '../random-streams';
import { QuietWatches } from './quiet-watches';
import type { CreatureStore } from '../creature-store';
import type { CombatEvent, Fighter } from '../model';
import type { ArenaAbility } from '../lang/parse';
import type { Attribute, Creature } from '../creature';

export class FieldUse {
  // Experience for a won encounter: its authored value for each who stood; or half of Orsino's reward (what its
  // creatures are worth, Advancement.worth, ten for each of them, and 25) to each who stood. It was the whole reward
  // shared among them, so a companion halved what one earned, and one ruin took a lone character to the fifth level
  // (the play-structure investigation's PT-02, PT-03); ten for the square of their number made four rats worth more
  // than a level (the cold review of 1 November: experience in accelerating bursts).
  static award(store: CreatureStore, party: string[], world: World,
    result: { opponent: string; members: string[]; events: CombatEvent[] }) {
    const authored = world.module.measures.some(m => m.name === 'encounterXp')
      ? world.number(ModuleWriter.call('encounterXp', result.opponent)) : 0;
    if (authored) { this.grant(store, party, authored, result.events); return; }
    const n = result.members.length;
    const won = result.members.reduce(
      (sum, id) => sum + Advancement.worth(store.catalog, store.get(id)), 0,
    ) + 10 * n + 25;
    this.grant(store, party, Math.floor(won / 2), result.events);
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
      // One already up and not dead needs no raising; one left "slain" with breath in them (raised in a fight before
      // a raising lifted death: the review's A4) is raised whole.
      const dead = c.state.conditions.some(s => s.id === Canon.rules.combat.ids.slain);
      if (c.state.hp > 0 && !dead) { return []; }
      const revive = Content.abilities.find(a => a.id === Canon.rules.combat.ids.raising)?.effects.find(e => e.kind === 'revive');
      const percent = revive && 'percent' in revive ? Math.min(revive.percent ?? 50, 100) : 50;
      c.state.hp = Math.max(c.state.hp, 1, Math.floor(percent / 100 * c.base.maxHp)); c.state.conditions = [];
      lease.commit([c]);
      return [{ type: 'revive', turn: 0, actor: id, target: id, detail: 'returned to life', amount: c.state.hp }];
    } finally { lease.release(); }
  }
  // A companion drained of levels restored at a temple: what the restoration spell does (Remove drained), done by the
  // shrine's priest, whatever the companion could cast: every level taken comes back (see LevelDrain).
  static restore(store: CreatureStore, id: string): CombatEvent[] {
    const lease = store.acquire([id]);
    try {
      const c = lease.creatures[0]!, lifted = c.state.conditions.filter(s => LevelDrain.drains(s.id));
      if (!lifted.length) { return []; }
      c.state.conditions = c.state.conditions.filter(s => !lifted.includes(s));
      lease.commit([c]);
      return lifted.map(s => ({ type: 'remove' as const, turn: 0, actor: id, target: id, detail: s.id }));
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
      && !store.get(id).state.conditions.some(s => s.id === Canon.rules.combat.ids.slain)));
    try {
      for (const c of lease.creatures) {
        const die = new Expressions(RandomStreams.key(seed, 'shock', c.id)).number('1d20');
        const modifier = Fighting.statMod(c.base.constitution);
        const success = die + modifier >= Canon.rules.combat.systemShock;
        events.push({ type: 'save', turn: 0, actor: c.id, target: c.id, rolled: die + modifier, difficulty: Canon.rules.combat.systemShock, success,
          die, stat: 'constitution', modifier, kind: 'system shock' });
        if (success) { c.state.hp = 1; } else { c.state.conditions.push({ id: Canon.rules.combat.ids.slain, remaining: 1, clock: 'until-removed' }); }
        events.push(success ? { type: 'revive', turn: 0, actor: c.id, target: c.id, detail: 'comes round', amount: 1 }
          : { type: 'status', turn: 0, actor: c.id, target: c.id, detail: Canon.rules.combat.ids.slain,
            clock: 'until-removed' });
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
  // asleep, nor sitting out the hours until light or dark (asleep, here: see WatchLoop). A lantern is put out to sleep,
  // and to wait out a night, and in the day, or in a lit room.
  static advance(store: CreatureStore, elapsed: number, events: CombatEvent[],
    scene?: { world: World; actors: CampaignActor[]; player?: string; asleep?: boolean; seed?: string }) {
    const timed = this.timed(store);
    if (!timed.length) { return false; }
    const place = scene?.player ? scene.world.one('at', scene.player) : undefined;
    const company = scene?.actors.find(a => a.id === scene.player)?.members ?? [];
    const dark = !!place && !scene?.asleep && scene!.world.test(ModuleWriter.call('unlit', place));
    const held = { company, dark };
    // A watch in which nothing would tick (every condition on the clock a flame held unlit, none run out) leaves every
    // record as it was: none is leased, run down and written back, and nothing is projected again for it (OR-721: the
    // warrior's torch, held through every daylit watch of every journey, had cost a lease and a commit of her record
    // each watch, and a Projection asked again, for no change).
    if (!QuietWatches.afresh && !timed.some(c => c.state.conditions.some(s => s.clock === 'world-time'
      && (s.remaining <= 0 || !this.held(held, c.id, s.id))))) { return false; }
    const lease = store.acquire(timed.map(c => c.id));
    try {
      const fighters = lease.creatures.map(c => CombatProjection.fighter(lease.catalog, c, 'fighters'));
      const visible = scene?.actors.filter(a => a.id === scene.player || (place
        && scene.world.test(ModuleWriter.call('at', a.id, place)))).flatMap(a => a.members);
      for (const target of fighters) {
        const start = events.length;
        // With a fight's dice and what lapses (a countdown's blast) as in a fight, outside one: a tick of dice had
        // thrown, and a death save had been skipped (the architecture review's A23).
        Effects.advance(target, 'world-time', { fighters, turn: elapsed, events, field: true,
          expressions: new Expressions(RandomStreams.key(scene?.seed ?? 'field', 'field', elapsed, target.id)),
          lapse: AbilityUse.lapse.bind(AbilityUse),
          content: new Content('clock'), abilities: [], retreat: false, location: null },
        id => this.held(held, target.id, id));
        if (visible && !visible.includes(target.id)) {
          events.slice(start).forEach(e => { e.visibility = 'private'; });
        }
      }
      lease.commit(lease.creatures.map(c => CombatProjection.creature(fighters.find(f => f.id === c.id)!, c)));
    } finally { lease.release(); }
    return true;
  }
  // Those under a condition on the world's clock, read once for each revision of the store (every watch had gone
  // through every creature of the country for them).
  private static readonly clocked = new WeakMap<CreatureStore, { version: number; creatures: readonly Creature[] }>();
  private static timed(store: CreatureStore): readonly Creature[] {
    const was = this.clocked.get(store);
    if (was?.version === store.version) { return was.creatures; }
    const creatures = store.live.filter(c => c.state.conditions.some(s => s.clock === 'world-time'));
    this.clocked.set(store, { version: store.version, creatures });
    return creatures;
  }
  // A flame of the company's own, put out where it is not wanted (not in the dark): it does not burn down.
  private static held(at: { company: readonly string[]; dark: boolean }, owner: string, id: string): boolean {
    return at.company.includes(owner) && !at.dark && this.burns(id);
  }
  private static burns(id: string): boolean {
    const grants = Effects.status(id).grants ?? [];
    return grants.includes('light') && grants.includes('flame');
  }
  // What a companion does with study: prepare a spell, or spend a level's advance on a quality, a skill or a spell.
  static study(store: CreatureStore, name: string, args: string[]): CombatEvent[] {
    if (name === 'prepare') { return this.prepare(store, args as [string, string, string, string]); }
    if (name === 'endow') { return this.endow(store, args as [string, string, string]); }
    const [member, choice] = args as [string, string], lease = store.acquire([member]);
    try {
      const c = lease.creatures[0]!;
      if (name === 'improve') { Advancement.improve(c, choice as Attribute); } else if (name === 'feat') {
        Advancement.feat(c, choice);
      } else if (name === 'school') { Advancement.school(store.catalog, c, choice); } else if (name === 'tutor') {
        if (!Advancement.tutor(store.catalog, c, choice)) { return []; }
      } else if (name === 'teach') {
        if (!Advancement.teach(c, choice)) { return []; }
      } else { Advancement.learn(c, choice); }
      lease.commit([c], { advancement: true });
      // A skill taken up is said by the command's own result ("Tamsin takes up Climbing."), not again as a gain.
      if (name === 'school' || name === 'tutor') { return []; }
      const what = name === 'improve' ? `${choice.charAt(0).toUpperCase()}${choice.slice(1)} is now ${c.base[choice as Attribute]}`
        : name === 'feat' ? `${Traits.of(choice)?.name ?? choice} taken up`
          : `${Content.abilities.find(a => a.id === choice)?.name ?? choice} learned`;
      return [{ type: 'gain', turn: 0, actor: member, target: member, detail: what }];
    } finally { lease.release(); }
  }
  // A work that reads its reader back raises a quality outside the level's development (Resolve endow).
  static endow(store: CreatureStore, [member, quality, degree]: [string, string, string]): CombatEvent[] {
    const lease = store.acquire([member]);
    try {
      const c = lease.creatures[0]!, by = Advancement.degree(degree);
      const raised = Advancement.endow(c, quality as Attribute, by);
      lease.commit([c], { advancement: true, endowed: raised });
      const name = `${quality.charAt(0).toUpperCase()}${quality.slice(1)}`;
      return [{ type: 'gain', turn: 0, actor: member, target: member,
        detail: raised ? `${name} is now ${c.base[quality as Attribute]}` : `${name} can rise no further` }];
    } finally { lease.release(); }
  }
  // A caster prepares a different spell in a slot; ready at once if that slot was not yet spent.
  static prepare(store: CreatureStore, args: [string, string, string, string]): CombatEvent[] {
    const [caster, tier, outgoing, incoming] = args;
    const index = Number(tier.split('_')[1]) - 1, lease = store.acquire([caster]);
    try {
      const c = lease.creatures[0]!, [name, was] = [incoming, outgoing]
        .map(id => Content.abilities.find(a => a.id === id)?.name ?? id);
      const now = Spellcasting.prepare(c.state, index, outgoing, incoming);
      lease.commit([c]);
      // Why not at once, where the same act had made a spell ready at once before (cold play 5, CL-38).
      return [{ type: 'gain', turn: 0, actor: caster, target: caster, detail: now ? `${name} is ready`
        : `${name} will be ready after the next rest: ${was} had been cast from that slot` }];
    } finally { lease.release(); }
  }
  // A healing, a cleansing, a lasting ward; or a raising of the dead as themselves (Raise Dead, Resurrection: not one
  // that raises them as something else, animate_dead's undead).
  static safe(id: string): boolean {
    const ability = Content.abilities.find(a => a.id === id);
    return !!ability && ability.effects.every(e => ((['heal', 'remove'].includes(e.kind)
      || (e.kind === 'apply' && Effects.status(e.status).lifetime === 'persistent')) && e.target === 'ally' && !e.save)
      || (e.kind === 'revive' && e.target === 'dead ally' && !e.traits?.length));
  }
  // A spell that takes those it is cast at out of what they were doing (asleep, held), and nothing else: castable at a
  // band outside a fight (CF-03), where a blow-by-blow effect would end with the moment (see Items.use).
  static hostile(id: string): boolean {
    const ability = Content.abilities.find(a => a.id === id);
    return !!ability?.spell && !!ability.effects.length && ability.effects.every(e => e.kind === 'apply'
      && /enem/.test(e.target) && !!Content.statuses[e.status] && Effects.skips(e.status));
  }
  // A hostile spell cast at a band outside a fight (the casting-fiction invariant, CF-03): by a named caster who knows
  // it and can cast it now, for the slot it costs in a fight, each of the band saving as in a fight; what it lays on
  // them lasts as many watches of the world's clock as it would have lasted turns, and wears off as time passes, so a
  // band put to sleep lies asleep (not able) until it wakes. What it leaves able is the author's to rouse (assails).
  static cast(store: CreatureStore, options: { ability: string; caster: string; foes: string[]; seed: string }):
    CombatEvent[] {
    const ability = Content.abilities.find(a => a.id === options.ability);
    if (!ability || !this.hostile(ability.id)) { throw new Error('Unsupported field effect'); }
    const foes = options.foes.filter(id => store.get(id).state.hp > 0);
    const lease = store.acquire([options.caster, ...foes]);
    try {
      const fighters = lease.creatures
        .map(c => CombatProjection.fighter(lease.catalog, c, c.id === options.caster ? 'fighters' : 'goblins'));
      const actor = this.caster(fighters, options.caster, ability);
      const context = { actor, fighters, turn: 0, events: [] as CombatEvent[], field: true,
        content: new Content(`${options.seed}:content`), abilities: Content.abilities.map(a => a.id),
        retreat: false, location: null };
      AbilityUse.perform(ability, foes[0]!, new Expressions(options.seed), context);
      const committed = lease.creatures.map(c => CombatProjection.creature(fighters.find(f => f.id === c.id)!, c));
      for (const c of committed.filter(x => x.id !== options.caster)) {
        c.state.conditions = c.state.conditions.filter(s => Effects.lasting(s) || Effects.skips(s.id))
          .map(s => Effects.lasting(s) ? s : { ...s, clock: 'world-time' as const });
      }
      lease.commit(committed);
      return context.events;
    } finally { lease.release(); }
  }
  // A spell whose harm lets an element loose where it lands (Fire Bolt's fire: the rules domain's world shadow), which
  // may be cast at a thing between fights where the world says what the element does to it (looses, loose_at).
  static looses(id: string): boolean {
    const ability = Content.abilities.find(a => a.id === id);
    return !!ability?.spell && ability.effects.some(e => (e.kind === 'damage' && !!EffectShadows.element(e.damageType))
      || (e.kind === 'try' && e.target === 'it'));
  }
  // A spell let loose at a thing between fights (OR-1100): by a named caster who knows it and can cast it now, for the
  // slot it costs in a fight, touching no one; what it lets loose is the world's (Exposure, after the command).
  static loose(store: CreatureStore, options: { ability: string; caster: string; seed: string }): CombatEvent[] {
    const found = Content.abilities.find(a => a.id === options.ability);
    if (!found || !this.looses(found.id)) { throw new Error('Unsupported field effect'); }
    const lease = store.acquire([options.caster]);
    try {
      const fighters = lease.creatures.map(c => CombatProjection.fighter(c, 'fighters'));
      const actor = this.caster(fighters, options.caster, found);
      const context = { actor, fighters, turn: 0, events: [] as CombatEvent[], field: true,
        content: new Content(`${options.seed}:content`), abilities: Content.abilities.map(a => a.id),
        retreat: false, location: null };
      AbilityUse.perform({ ...found, effects: [] }, options.caster, new Expressions(options.seed), context);
      lease.commit(lease.creatures.map(c => CombatProjection.creature(fighters.find(f => f.id === c.id)!, c)));
      return context.events;
    } finally { lease.release(); }
  }
  // A spell that carries its caster's company and does nothing else (Plane Shift: "Travel to plane"): the company's
  // to cast outside a fight, to the place its act names (GT-02).
  static carries(id: string): boolean {
    const ability = Content.abilities.find(a => a.id === id);
    return !!ability?.spell && !!ability.effects.length && ability.effects.every(e => e.kind === 'travel');
  }
  // Cast for the slot it costs in a fight; its travel event says where the company went (see Campaign.carry).
  static shift(store: CreatureStore, options: { ability: string; caster: string; destination: string; seed: string }):
    CombatEvent[] {
    const found = Content.abilities.find(a => a.id === options.ability);
    if (!found || !this.carries(found.id)) { throw new Error('Unsupported field effect'); }
    // "Travel to plane" goes to whichever the act names.
    const ability = { ...found, effects: found.effects.map(e => e.kind === 'travel'
      ? { ...e, location: options.destination } : e) };
    const lease = store.acquire([options.caster]);
    try {
      const fighters = lease.creatures.map(c => CombatProjection.fighter(lease.catalog, c, 'fighters'));
      const actor = this.caster(fighters, options.caster, ability);
      const context = { actor, fighters, turn: 0, events: [] as CombatEvent[], field: true,
        content: new Content(`${options.seed}:content`), abilities: Content.abilities.map(a => a.id),
        retreat: false, location: null };
      AbilityUse.perform(ability, options.caster, new Expressions(options.seed), context);
      lease.commit(lease.creatures.map(c => CombatProjection.creature(fighters.find(f => f.id === c.id)!, c)));
      return context.events;
    } finally { lease.release(); }
  }
  // One who can use the ability now: up, acting, knowing it (unless a service does it for them), within the level
  // they can cast at, and not kept from casting.
  private static caster(fighters: Fighter[], id: string, ability: ArenaAbility, service?: string): Fighter {
    const actor = fighters.find(f => f.id === id);
    if (!actor || actor.hp === 0 || actor.statuses.some(s => Effects.skips(s.id))
      || (!service && !actor.abilities.includes(ability.id))
      || (ability.spell?.level ?? ability.level ?? 0) > Fighting.maxSpellLevel(actor.level)
      || (ability.spell && Effects.modifiers(actor).noSpellcasting)) { throw new Error('Caster cannot use this ability'); }
    return actor;
  }
  static perform(store: CreatureStore, ids: string[], options: {
    ability: string; caster: string; target: string; seed: string; service?: 'recover' | 'reward';
    recovery?: Recovery;
  }): CombatEvent[] {
    const ability = Content.abilities.find(a => a.id === options.ability);
    if (!ability || (!options.service && !this.safe(ability.id))
      || (options.service === 'reward' && ability.effects.some(e => !['learn', 'gain'].includes(e.kind)))) {
      throw new Error('Unsupported field effect');
    }
    const lease = store.acquire([...new Set(ids)]);
    try {
      if (options.service === 'recover' && lease.creatures.every(c => c.state.hp === 0)) { return []; }
      const fighters = lease.creatures.map(c => CombatProjection.fighter(lease.catalog, c, 'fighters'));
      const actor = this.caster(fighters, options.caster, ability, options.service);
      const context = { actor, fighters, turn: 0, events: [] as CombatEvent[],
        ...(actor.abilitySources?.[ability.id] ? { source: actor.abilitySources[ability.id] } : {}),
        content: new Content(`${options.seed}:content`), abilities: Content.abilities.map(a => a.id),
        retreat: false, location: null, ...options.recovery ? { recovery: options.recovery } : {} };
      AbilityUse.perform(ability, options.target, new Expressions(options.seed), context);
      const committed = lease.creatures.map(c => CombatProjection.creature(fighters.find(f => f.id === c.id)!, c));
      // Mended in the field by a healing cantrip, they are tended until the company rests (see Tended).
      if (!options.service && Tended.cantripHeal(ability)) {
        for (const c of committed.filter(x => x.id === options.target)) { Tended.mark(c); }
      }
      lease.commit(committed);
      return context.events;
    } finally { lease.release(); }
  }
}
