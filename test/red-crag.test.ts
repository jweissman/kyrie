import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import snapshot from '../data/orsino/registry.json';
import ledger from '../data/orsino/adaptations.json';
import { AbilityUse } from '../src/ability-use';
import { Content } from '../src/content';
import { Canon } from '../src/canon/canon';
import { Expressions } from '../src/expressions';
import { PlaySession } from '../src/session/play-session';
import { OrsinoMonsters } from '../src/registry/orsino-monsters';
import { OrsinoRegistry, type Ledger } from '../src/registry/orsino-registry';
import { OrsinoStatuses } from '../src/registry/orsino-statuses';
import type { RegistrySnapshot } from '../src/registry/orsino-extract';
import type { CombatEvent, Fighter } from '../src/model';
import type { Transcript } from '../src/session/play-session';
import { RedCragHistories } from './red-crag-histories';

const registry = new OrsinoRegistry(snapshot as unknown as RegistrySnapshot, ledger as Ledger);
const definition = (id: string) => registry.entry(id).definition as Record<string, unknown>;
const traitEffect = (id: string) => (definition(id).statuses as { effect: Record<string, unknown> }[])[0]!.effect;

class Arena {
  static fighter(id: string, kind: [string, string], team: Fighter['team'], scores: Partial<Fighter> = {}): Fighter {
    return { ...new Content(id).character(kind[1] as never, id, team, kind[0] as never), ...scores };
  }
  static breathe(targets: Fighter[], seed: string): CombatEvent[] {
    const dragon = this.fighter('calder', ['red_dragon', 'red_dragon'], 'goblins');
    const events: CombatEvent[] = [];
    AbilityUse.perform(Content.abilities.find(a => a.id === 'fire_breath')!, dragon.id, new Expressions(seed),
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

  it('carries translated Orsino traits, never a silent approximation', () => {
    const red = Canon.creature('red_dragon');
    const formidable = OrsinoStatuses.translate(traitEffect('trait:formidable'));
    expect(Canon.traits.formidable!.modifiers).toEqual({ power: formidable.status.power,
      saves: formidable.status.saves, resistances: formidable.status.resistances });
    expect(formidable.omitted).toEqual(['toHit']);
    const affinity = OrsinoStatuses.translate(traitEffect('trait:fire_affinity')).status;
    expect(Canon.traits.fire_affinity!.modifiers)
      .toEqual({ resistances: affinity.resistances, immune: affinity.immune });
    expect(OrsinoStatuses.translate(traitEffect('trait:flying')).translated).toEqual({});
    expect(Canon.traits.flying!.modifiers).toEqual({});
    expect(red.traits).toEqual(['formidable', 'flying']);
    const breath = Content.abilities.find(a => a.id === 'fire_breath')!.effects[0]!;
    const source = definition('weapon:fire_breath');
    expect(breath).toMatchObject({ kind: 'damage', damageType: source.type, target: 'enemies',
      amount: { kind: 'deem', expression: source.damage }, save: { kind: 'breath', success: 'half' } });
  });

  it('maps every save category to the attribute Orsino uses', () => {
    const long = { str: 'strength', dex: 'dexterity', con: 'constitution', int: 'intelligence', wis: 'wisdom' };
    for (const e of snapshot.entries.filter(x => x.family === 'rule.saveKind')) {
      expect(Content.rules.saveKinds[e.key as keyof typeof Content.rules.saveKinds])
        .toBe(long[(e.definition as { attribute: keyof typeof long }).attribute]);
    }
  });
});

describe('breath: one shared roll, a breath save per creature', () => {
  it('rolls d20 + Constitution modifier + level + breath bonuses, halves on success and lets resistance apply after', () => {
    const company = ['elen', 'bran', 'dori', 'tam', 'wyn', 'ash'].map(id =>
      Arena.fighter(id, ['human', 'fighter'], 'fighters', { level: 2, maxHp: 100, hp: 100 }));
    company[1]!.statuses = [{ id: 'fireproof', remaining: 3 }];
    const events = Arena.breathe(company, 'breath-1');
    const saves = events.flatMap(e => e.type === 'save' ? [e] : []);
    const damage = events.flatMap(e => e.type === 'damage' ? [e] : []);
    expect(saves).toHaveLength(6);
    expect(new Set(saves.map(s => s.success))).toEqual(new Set([true, false]));
    expect(new Set(damage.map(d => d.rolled)).size).toBe(1);
    for (const save of saves) {
      expect(save).toMatchObject({ kind: 'breath', stat: 'constitution', level: 2, difficulty: 16 });
      expect(save.rolled).toBe(save.die! + save.modifier! + save.level! + save.bonus!);
      const hit = damage.find(d => d.target === save.target)!;
      const halved = save.success ? Math.floor(hit.rolled / 2) : hit.rolled;
      expect(hit.amount).toBe(save.target === 'bran' ? Math.floor(halved * 0.5) : halved);
    }
  });

  it('lets an immune creature succeed without rolling, and fails a fourth success in one encounter', () => {
    const salamander = Arena.fighter('sal', ['human', 'fighter'], 'fighters', { maxHp: 200, hp: 200 });
    salamander.traits = ['fire_affinity'];
    expect(Arena.breathe([salamander], 'immune').find(e => e.type === 'save')).toMatchObject({ immune: true, success: true });
    const stoic = Arena.fighter('stoic', ['human', 'fighter'], 'fighters', { maxHp: 500, hp: 500, constitution: 40 });
    stoic.saved = { breath: 3 };
    expect(Arena.breathe([stoic], 'cap').find(e => e.type === 'save')).toMatchObject({ success: false, limit: true });
  });

  it('applies a category bonus only to its own category', () => {
    const dragon = Arena.fighter('calder', ['red_dragon', 'red_dragon'], 'goblins');
    const events: CombatEvent[] = [];
    const sleep = { id: 'test_will', name: 'Will test', effects: [{ kind: 'apply' as const, status: 'stunned', duration: 1,
      target: 'enemy' as const, save: { kind: 'will', difficulty: { kind: 'literal' as const, value: 30 } } }] };
    const caster = Arena.fighter('mage', ['human', 'fighter'], 'fighters');
    AbilityUse.perform(sleep, dragon.id, new Expressions('will'), { actor: caster, fighters: [caster, dragon], turn: 1,
      events, content: new Content('will'), abilities: [], retreat: false, location: null });
    expect(events.find(e => e.type === 'save')).toMatchObject({ kind: 'will', stat: 'wisdom', bonus: 2 });
    expect(Arena.breathe([Arena.fighter('x', ['human', 'fighter'], 'fighters')], 'b').find(e => e.type === 'save'))
      .toMatchObject({ bonus: 0 });
  });
});

describe('the Red Crag in play', () => {
  it('a fireproofed company survives the breath, the fire burns the bridge, and the way home changes', async () => {
    const s = await RedCragHistories.play('fire');
    const fight = s.campaign.events.find(e => e.action.startsWith('attack('))!;
    const breath = fight.combat.filter(e => e.type === 'save');
    expect(breath.every(e => e.kind === 'breath')).toBe(true);
    expect(fight.combat.filter(e => e.type === 'damage' && e.damageType === 'fire')
      .every(e => e.type === 'damage' && e.modifiers!.resistance === 0.5)).toBe(true);
    expect(fight.combat.some(e => e.type === 'action' && e.command.ability === 'bite')).toBe(true);
    expect(fight.resolution?.world).toContainEqual({ kind: 'assert',
      call: { kind: 'call', name: 'exposedTo', args: ['world__ledge', 'fire'] } });
    expect(RedCragHistories.state(s, 'roost__ropes')).toBe('roost__burnt');
    expect(s.campaign.events.map(e => e.action)).toContain('go(party,world__goat_path,world__ledge,world__shoulder)');
    expect(s.campaign.state.creatures.find(c => c.id === 'world__party_3')!.state.hp).toBe(0);
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
