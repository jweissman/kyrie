import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import snapshot from '../data/sources/orsino/registry.json';
import ledger from '../data/sources/orsino/adaptations.json';
import { AbilityUse } from '../src/ability-use';
import { Content } from '../src/content';
import { Canon } from '../src/canon/canon';
import { Expressions } from '../src/expressions';
import { PlaySession } from '../src/session/play-session';
import { OrsinoMonsters } from '../src/registry/orsino-monsters';
import { CatalogLedger } from '../src/registry/catalog-ledger';
import { OrsinoRegistry, type Ledger } from '../src/registry/orsino-registry';
import { CombatProjection } from '../src/combat-projection';
import type { RegistrySnapshot } from '../src/registry/orsino-extract';
import type { CombatEvent, Fighter } from '../src/model';
import type { Transcript } from '../src/session/play-session';
import { RedCragHistories } from './red-crag-histories';

const registry = new OrsinoRegistry(snapshot as unknown as RegistrySnapshot, CatalogLedger.combined(ledger as Ledger));
const definition = (id: string) => registry.entry(id).definition as Record<string, unknown>;
const traitEffect = (id: string) => (definition(id).statuses as { effect: Record<string, unknown> }[])[0]!.effect;

class Arena {
  // A person (a warrior of steady disposition) or a creature of a species, which has no class.
  static fighter(id: string, kind: string, team: Fighter['team'], scores: Partial<Fighter> = {}): Fighter {
    const content = new Content(id);
    const base = Canon.isSpecies(kind) ? content.creature(kind, id, team)
      : CombatProjection.fighter(content.createCreature(id, { raceId: kind, classId: 'warrior', traits: ['brave'] }), team);
    return { ...base, ...scores };
  }
  static breathe(targets: Fighter[], seed: string): CombatEvent[] {
    const dragon = this.fighter('calder', 'red_dragon', 'goblins');
    const events: CombatEvent[] = [];
    AbilityUse.perform(Content.abilities.find(a => a.id === 'breathe_fire')!, dragon.id, new Expressions(seed),
      { actor: dragon, fighters: [dragon, ...targets], turn: 1, events, content: new Content(seed),
        abilities: Content.abilities.map(a => a.id), retreat: false, location: null });
    return events;
  }
}

describe('a red dragon composed from the Orsino corpus', () => {
  it('has exactly the scores and hit points the Orsino monster template derives', () => {
    const d = OrsinoMonsters.compose(id => registry.entry(id), { monsterClass: 'dragon', monsterType: 'Dragon',
      aspect: 'wildtype', terrain: 'mountain', rank: 'minor', level: 1, color: 'red' });
    const red = Canon.creature('red_dragon');
    expect(red.variantOf).toBe('dragon');
    expect(red.statistics!.attributes).toEqual({ strength: d.scores.str, dexterity: d.scores.dex,
      constitution: d.scores.con, intelligence: d.scores.int, wisdom: d.scores.wis, charisma: d.scores.cha });
    expect(red.statistics!.hitPoints).toBe(d.hitPoints);
    expect(d.weapon).toBe('fire_breath');
    expect(d.steps.map(s => s.source)).toEqual(['monsterClass:dragon', 'monsterClass:dragon', 'terrain:mountain',
      'aspect:wildtype', 'monsterType:Dragon', 'dragonColor:red', 'template:monster', 'monsterRank:minor']);
    expect(red.description).toBe(definition('dragonColor:red').description as string);
  });

  it('carries translated traits and explicitly adapts breath to maturity', () => {
    const red = Canon.creature('red_dragon');
    const formidable = traitEffect('trait:formidable') as Record<string, number>;
    expect(Canon.traits.formidable!.modifiers).toMatchObject({ toHit: formidable.toHit,
      bonusDamage: formidable.bonusDamage,
      saves: { will: formidable.saveVersusWill } });
    expect(Canon.traits.formidable!.unsupported).toBeUndefined();
    const affinity = traitEffect('trait:fire_affinity') as Record<string, number>;
    expect(Canon.traits.fire_affinity!.modifiers)
      .toEqual({ resistances: { fire: affinity.resistFire!, cold: affinity.resistCold! }, immune: ['breath'] });
    const flying = traitEffect('trait:flying') as Record<string, number>;
    expect(Canon.traits.flying!.modifiers).toEqual({ toHit: flying.toHit!, evasion: flying.evasion! });
    expect(red.traits).toEqual(['formidable', 'flying']);
    const breath = Content.abilities.find(a => a.id === 'breathe_fire')!.effects[0]!;
    const source = definition('weapon:fire_breath');
    expect(breath).toMatchObject({ kind: 'damage', damageType: source.type, target: 'enemies',
      amount: { kind: 'deem', expression: '2d6 + 2 * #level' }, save: { kind: 'breath', success: 'half' } });
  });

  it('maps every save category to the attribute Orsino uses', () => {
    const long = { str: 'strength', dex: 'dexterity', con: 'constitution', int: 'intelligence', wis: 'wisdom' };
    for (const e of snapshot.entries.filter(x => x.family === 'rule.saveKind')) {
      expect(Content.rules.saveKinds[e.key as keyof typeof Content.rules.saveKinds])
        .toBe(long[(e.definition as { attribute: keyof typeof long }).attribute]);
    }
  });
});

describe('breath: a breath save and a damage roll per creature', () => {
  it('rolls d20 + Constitution modifier + level + breath bonuses, halves on success and lets resistance apply after', () => {
    const company = ['elen', 'bran', 'dori', 'tam', 'wyn', 'ash'].map(id =>
      Arena.fighter(id, 'human', 'fighters', { level: 2, maxHp: 100, hp: 100 }));
    company[1]!.statuses = [{ id: 'fireproof', remaining: 3 }];
    const events = Arena.breathe(company, 'breath-1');
    // Fire that leaves a creature standing also makes it save against burning (Orsino's damage trigger).
    const saves = events.flatMap(e => e.type === 'save' && e.kind === 'breath' ? [e] : []);
    const damage = events.flatMap(e => e.type === 'damage' ? [e] : []);
    expect(saves).toHaveLength(6);
    expect(events.filter(e => e.type === 'save' && e.kind === 'fortitude')).toHaveLength(6);
    expect(new Set(saves.map(s => s.success))).toEqual(new Set([true, false]));
    // Orsino rolls an effect's amount for each target it touches.
    expect(new Set(damage.map(d => d.rolled)).size).toBeGreaterThan(1);
    for (const save of saves) {
      expect(save).toMatchObject({ kind: 'breath', stat: 'constitution', level: 2, difficulty: 16 });
      expect(save.rolled).toBe(save.die! + save.modifier! + save.level! + save.bonus!);
      const hit = damage.find(d => d.target === save.target)!;
      const halved = save.success ? Math.floor(hit.rolled / 2) : hit.rolled;
      // The dragon's Formidable trait adds its bonus damage before resistance (Commands.handleHit).
      const bonus = hit.modifiers!.bonus;
      expect(bonus).toBe(3);
      expect(hit.amount).toBe(save.target === 'bran' ? Math.floor((halved + bonus) * 0.5) : halved + bonus);
    }
  });

  it('lets an immune creature succeed without rolling, and fails a fourth success in one encounter', () => {
    const salamander = Arena.fighter('sal', 'human', 'fighters', { maxHp: 200, hp: 200 });
    salamander.traits = ['fire_affinity'];
    expect(Arena.breathe([salamander], 'immune').find(e => e.type === 'save')).toMatchObject({ immune: true, success: true });
    const stoic = Arena.fighter('stoic', 'human', 'fighters', { maxHp: 500, hp: 500, constitution: 40 });
    stoic.saved = { breath: 3 };
    expect(Arena.breathe([stoic], 'cap').find(e => e.type === 'save')).toMatchObject({ success: false, limit: true });
  });

  it('applies a category bonus only to its own category', () => {
    const dragon = Arena.fighter('calder', 'red_dragon', 'goblins');
    const events: CombatEvent[] = [];
    const sleep = { id: 'test_will', name: 'Will test', effects: [{ kind: 'apply' as const, status: 'stun', duration: 1,
      target: 'enemy' as const, save: { kind: 'will', difficulty: { kind: 'literal' as const, value: 30 } } }] };
    const caster = Arena.fighter('mage', 'human', 'fighters');
    AbilityUse.perform(sleep, dragon.id, new Expressions('will'), { actor: caster, fighters: [caster, dragon], turn: 1,
      events, content: new Content('will'), abilities: [], retreat: false, location: null });
    expect(events.find(e => e.type === 'save')).toMatchObject({ kind: 'will', stat: 'wisdom', bonus: 2 });
    expect(Arena.breathe([Arena.fighter('x', 'human', 'fighters')], 'b').find(e => e.type === 'save'))
      .toMatchObject({ bonus: 0 });
  });
});

describe('the Red Crag in play', () => {
  it('a fireproofed company cannot touch the dragon; its breath injures them, and the way home changes', async () => {
    const s = await RedCragHistories.play('fire');
    const fight = s.campaign.events.find(e => e.action.startsWith('attack('))!;
    // Orsino's dragon has armour class −3: a first-level company needs more than a d20 can roll.
    const swings = fight.combat.filter(e => e.type === 'attack' && e.target === 'roost__dragon_person');
    expect(swings.length).toBeGreaterThan(0);
    expect(swings.every(e => e.type === 'attack' && !e.success && e.need > 20)).toBe(true);
    const breath = fight.combat.filter(e => e.type === 'save' && e.kind === 'breath');
    expect(breath).toHaveLength(3);
    // Fireproofing is additive with any other resistance (Bran's toughness adds 10%).
    expect(fight.combat.filter(e => e.type === 'damage' && e.damageType === 'fire')
      .every(e => e.type === 'damage' && e.modifiers!.resistance >= 0.5)).toBe(true);
    expect(fight.combat.some(e => e.type === 'flee' && e.success)).toBe(true);
    expect(fight.resolution?.world).toContainEqual({ kind: 'assert',
      call: { kind: 'call', name: 'exposedTo', args: ['world__ledge', 'fire'] } });
    expect(RedCragHistories.state(s, 'roost__ropes')).toBe('roost__burnt');
    expect(s.campaign.events.map(e => e.action)).toContain('go(party,world__goat_path,world__ledge,world__shoulder)');
    expect(fight.resolution?.bodies.some(c => c.id.startsWith('world__party_') && c.after.hp < c.before.hp))
      .toBe(true);
  }, 60000);

  it('robbing the dragon while it hunts brings the bell home, and its wrath burns the bridge and the barn', async () => {
    const s = await RedCragHistories.play('theft');
    const seen = s.campaign.save(true).observations;
    expect(Object.keys(seen)).toEqual(expect.arrayContaining(['roost.robbed', 'roost.bell_rung', 'roost.bridge_burnt',
      'roost.barn_burnt']));
    expect(seen['roost.barn_burnt']! - seen['roost.bridge_burnt']!).toBe(18);
    expect(s.campaign.events.some(e => e.combat.length && e.action.startsWith('attack'))).toBe(false);
  }, 60000);

  it('paying the dragon keeps the peace through its next hunt; nothing burns', async () => {
    const s = await RedCragHistories.play('tribute');
    expect(Object.keys(s.campaign.save(true).observations).sort()).toEqual(['roost.bell_rung', 'roost.paid']);
    expect(RedCragHistories.state(s, 'roost__dragon')).toBe('roost__placated');
    expect(RedCragHistories.where(s, 'roost__dragon')).toBe('world__ledge');
    expect(RedCragHistories.state(s, 'roost__barn')).toBe('roost__standing');
  }, 60000);

  it('left alone, the dragon eats the flock a sheep a hunt, then comes down for the cattle and burns the barn', async () => {
    const s = await RedCragHistories.start();
    const head = () => s.campaign.world.number({ kind: 'call', name: 'roost__head', args: ['roost__flock'] });
    expect(head()).toBe(8);
    const day = s.campaign.state.elapsed;
    while (RedCragHistories.state(s, 'roost__barn') === 'roost__standing' && s.campaign.state.elapsed < day + 144 * 11) {
      await s.perform('wait_hour');
    }
    expect(head()).toBeLessThanOrEqual(0);
    expect([s.campaign.world.test({ kind: 'call', name: 'roost__stripped', args: ['world__green'] }),
      RedCragHistories.state(s, 'roost__barn')]).toEqual([true, 'roost__burnt']);
  }, 180000);
  it('paid, the dragon hunts the far fells and the flock is spared', async () => {
    const s = await RedCragHistories.play('tribute');
    const head = () => s.campaign.world.number({ kind: 'call', name: 'roost__head', args: ['roost__flock'] });
    const before = head();
    for (let i = 0; i < 24 * 3; i++) { await s.perform('wait_hour'); }
    expect(head()).toBe(before);
  }, 180000);
  it('replays the recorded histories to the same canonical state', async () => {
    for (const history of ['fire', 'tribute'] as const) {
      const recorded = JSON.parse(readFileSync(`doc/playtests/red-crag/${history}.transcript.json`, 'utf8')) as Transcript;
      const replay = await RedCragHistories.start();
      await replay.replay(recorded.steps);
      const live = await RedCragHistories.play(history);
      expect(replay.canonical()).toBe(live.canonical());
      expect(PlaySession.resume(live.checkpoint()).canonical()).toBe(live.canonical());
    }
  }, 120000);
});
