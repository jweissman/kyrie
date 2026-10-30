import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/battle';
import { Content } from '../src/content';
import { CreatureStore } from '../src/creature-store';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Module, Operator, WorldRule } from '../src/lang/module';
import { DangerSense, type Danger } from '../src/presentation/danger-sense';
import { ChoiceWording } from '../src/presentation/choice-wording';
import { MechanicsText } from '../src/presentation/mechanics-text';
import { PlaySession } from '../src/session/play-session';
import { Tactics } from '../src/tactics';
import { Canon } from '../src/canon/canon';
import { ItemCatalog } from '../src/item-catalog';
import { parseAbility } from '../src/lang/parse';
import { Outfitters } from '../src/world/outfitters';
import { WorldAssembler } from '../src/world/world-assembler';
import snares from '../data/generation/scenes/snares.json';

// The novice covenant (Mission 18's audit, W2: "A lone novice who can live"): danger stays real, but a novice is told
// of it before it falls. Every ambush can be read on the approach; the page's word for a fight is the fight the
// company would fight, arms and all; running is offered and comes off as the page says; and a try that cannot be
// made again says so before it is made.
class Covenant {
  static start(name: string, seed = 'p') {
    return PlaySession.start(`test/fixtures/probes/${name}/probe.campaign.json`, seed, NodeBundleSource.shared);
  }
  static said(event: { perceptions?: { text: string }[]; response?: string }): string {
    return [...(event.perceptions ?? []).map(p => p.text), event.response ?? ''].join(' ');
  }
  static holds(s: PlaySession, name: string, ...args: string[]) {
    return s.campaign.world.test(ModuleWriter.call(name, ...args));
  }
  // A warrior with what a warrior sets out with, and men of the road with nothing in their hands, seen as they come.
  static fight(seed: string, many = 1, trial = seed): Battle {
    const content = new Content(seed);
    const hero = content.createCreature('hero', { raceId: 'human', classId: 'warrior' });
    const foes = Array.from({ length: many }, (_, i) => content.createCreature(`foe${i}`,
      { raceId: 'human', classId: 'warrior' }));
    for (const foe of foes) { foe.state.inventory = []; }
    return Battle.encounter(new CreatureStore([hero, ...foes]), [{ creatureId: 'hero', team: 'fighters' },
      ...foes.map(f => ({ creatureId: f.id, team: 'goblins' as const }))], { seed: trial, moment: 'seen' });
  }
  // The share of such fights won, fought to the end by the game's own tactics, each from a seed of its own.
  static won(seed: string, many: number, n: number): number {
    let won = 0;
    for (let t = 0; t < n; t++) {
      const battle = this.fight(seed, many, `${seed}:${t}`);
      while (!battle.state.outcome) { battle.step(Tactics.choose(battle.state, battle.plain(battle.legalCommands()))); }
      if (battle.state.outcome === 'fighters') { won++; }
    }
    return won / n;
  }
  // The share of fights won each word stands for (DangerSense.judge).
  static readonly range: Record<Danger, [number, number]> = { deadly: [0, 0.25], grave: [0.25, 0.6],
    hard: [0.6, 1], fair: [0.9, 1], slight: [0.9, 1] };
  // Whether an item gives whoever uses it light: its use lays a condition that grants it (a torch, a candle).
  static lights(id: string): boolean {
    const use = ItemCatalog.definitions[id]?.use;
    return !!use && parseAbility(id, id, use).effects.some(e => e.kind === 'apply'
      && !!Canon.conditions[Canon.resolve('conditions', e.status)]?.grants?.includes('light'));
  }
  static operator(requires: Operator['requires'], failure: Operator['failure']): Operator {
    return { id: 'ask', name: 'Ask', description: '', requires, success: [], failure, cost: 0, time: 1 };
  }
}

describe('what lies in wait can be read on the approach', () => {
  it('a sign is told next door, once; going on in, it springs', async () => {
    const s = await Covenant.start('lurk');
    const near = await s.perform('go(p__climb,p__mouth)');
    expect(Covenant.said(near)).toMatch(/Something is lying in wait in the low gallery/);
    expect(near.combat).toEqual([]);
    expect(Covenant.holds(s, 'betrayed', 'p__spider', 'party')).toBe(true);
    const again = await s.perform('wait_hour');
    expect(Covenant.said(again)).not.toMatch(/lying in wait/);
    let opening: string | undefined;
    const sprung = await s.perform('go(p__crawl,p__gallery)', battle => {
      opening ??= battle.opening;
      return Promise.resolve(battle.chosen());
    });
    expect(sprung.prelude?.response ?? Covenant.said(sprung)).toMatch(/springs out at you/);
    expect(opening).toBe('sprung');
  }, 60000);
});

describe('the page\'s word for a fight is the fight the company would fight', () => {
  it('in the moment before a fight closes, reckoned with what each side has in hand, not with bare hands', () => {
    const battle = Covenant.fight('arms'), { ours, foes } = DangerSense.fighters(battle);
    const carried = battle.original('hero')!.state.inventory!.map(i => i.definition);
    expect(carried.length).toBeGreaterThan(0);
    expect(ours[0]!.state.inventory?.map(i => i.definition)).toEqual(carried);
    expect(foes[0]!.state.inventory ?? []).toEqual([]);
  });
  // Forty fights fought out, some two seconds alone and past bun's five under a loaded suite: seeded, so only slow.
  it('and its word agrees with how such a fight goes', () => {
    for (const [seed, foes] of [['arms', 1], ['pair', 2]] as const) {
      const said = DangerSense.of(Covenant.fight(seed, foes)).danger, [low, high] = Covenant.range[said];
      const won = Covenant.won(seed, foes, 20);
      expect([seed, said, won >= low - 0.2 && won <= high + 0.2]).toEqual([seed, said, true]);
    }
  }, 30000);
});

describe('running is offered, and comes off as the page says', () => {
  it('says the rule\'s own chances: an even chance, surer each time it fails, and sure in the moment', () => {
    expect(MechanicsText.flight()).toBe('1 in 2, then 3 in 4, then sure');
    const battle = Covenant.fight('run');
    expect(battle.flight()).toBe(1);
    const flee = battle.legalCommands().find(c => c.ability === 'flee');
    expect(flee).toBeDefined();
    battle.step(flee!);
    expect(battle.state.outcome).toBe('escaped');
  });
});

describe('an answer is on sale nearby', () => {
  // Every village and town has a chandler (test/outfitters.test.ts); what it sells answers every trap a work can
  // hold, from a pole's length away, and the dark.
  it('the chandler\'s pole answers every trap a work can hold, and a light it sells the dark', () => {
    const sold = Outfitters.kit.map(([id]) => id);
    for (const [mechanism, how] of Object.entries(snares.mechanisms)) {
      expect([mechanism, how.ways.some(w => sold.includes(w.needing))]).toEqual([mechanism, true]);
    }
    expect(sold.filter(id => Covenant.lights(id)).length).toBeGreaterThan(0);
  });
});

describe('every one that lies in wait in a generated country gives itself away', () => {
  it('has a sign for the company next door', async () => {
    const w = await WorldAssembler.assemble('s8', NodeBundleSource.shared,
      { origin: 'debt', party: [{ name: 'Wenna', raceId: 'human', classId: 'mage' }] });
    const world = (await PlaySession.start(w.path, 's8', w.source)).campaign.world;
    const lurking = world.related('temperament').filter(r => r.args[1] === 'temper_ambush'
      && world.related('onslaught', r.args[0]!).length).map(r => r.args[0]!);
    expect(lurking.length).toBeGreaterThan(0);
    expect(lurking.filter(g => !world.related('sign', g).length)).toEqual([]);
  }, 120000);
});

describe('a try that cannot be made again says so first', () => {
  const spoken = ModuleWriter.call('spokenTo', 'hearers', 'actor');
  const requires = { kind: 'and' as const, left: ModuleWriter.call('able', 'actor'),
    right: { kind: 'not' as const, value: spoken } };
  it('when failing it closes what it needs, and nothing opens it again', () => {
    const asked = Covenant.operator(requires, [{ kind: 'assert', call: spoken }]);
    const module = { actions: [asked], rules: [] as WorldRule[] } as unknown as Module;
    expect(ChoiceWording.final(asked, module)).toBe(true);
    const forgiven = { ...module, rules: [{ id: 'next_day', when: { kind: 'boolean', value: true },
      effects: [{ kind: 'retract', call: spoken }] }] } as typeof module;
    expect(ChoiceWording.final(asked, forgiven)).toBe(false);
    expect(ChoiceWording.final(Covenant.operator(requires, []), module)).toBe(false);
  });
});
