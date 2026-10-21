import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { Content } from '../src/content';
import { Advancement } from '../src/rules/advancement';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import type { CreatureStore } from '../src/creature-store';

describe('advancement', () => {
  it('follows Orsino\'s experience curve and values creatures by kind and level', () => {
    expect([2, 3, 4].map(l => Advancement.threshold(l))).toEqual([1000, 3000, 6200]);
    const content = new Content('worth');
    expect(Advancement.worth(content.createCreature('w', { raceId: 'wolf' }))).toBe(150);
    expect(Advancement.worth(content.createCreature('r', { raceId: 'revenant' }))).toBe(300);
    expect(Advancement.worth(content.createCreature('h', { raceId: 'human', classId: 'warrior', level: 2 }))).toBe(60);
  });
  it('a level rolls the hit die, adds Constitution, and moves a caster\'s slot table on, the same way every time', () => {
    const make = () => new Content('train').createCreature('dori', { raceId: 'dwarf', classId: 'cleric', traits: ['vitalist'],
      spells: ['cure', 'bless', 'anoint', 'prayer', 'minor_restoration', 'cure_moderate'], wisdom: 14 });
    const dori = make(), hp = dori.base.maxHp;
    dori.state.experience = 3000;
    const events = Advancement.train(dori, 'seed');
    expect(events.map(e => e.type === 'gain' && e.detail)).toEqual(['level 2', 'level 3']);
    expect(dori.base.level).toBe(3);
    expect(dori.base.maxHp).toBeGreaterThan(hp + 1);
    // A level is taken at rest: every slot is ready, and the new second-level slot holds a second-level prayer.
    expect([dori.base.maxSlots, dori.state.slots]).toEqual([[3, 1], [3, 1]]);
    expect(dori.state.prepared).toEqual([['cure', 'bless', 'anoint'], ['prayer']]);
    const again = make(); again.state.experience = 3000;
    Advancement.train(again, 'seed');
    expect(again.base.maxHp).toBe(dori.base.maxHp);
  });
  it('resolving a module is worth its declared experience, once; a night under a roof brings the level', async () => {
    const s = await PlaySession.start('data/campaigns/silkholme.campaign.json', 'advance', NodeBundleSource.shared);
    for (const c of ['go(march__causeway_path,march__causeway)', 'go(march__ridge_track,march__ridge)',
      'take_item(brood__spare_torch,march__member_party_2)', 'go(sink__sink_path,sink__lip)', 'go(sink__shaft,sink__cave)',
      'use_item(brood__spare_torch,march__member_party_2)']) {
      await s.perform(c);
    }
    const burn = await s.perform('change_thing(brood__webs_burn)');
    expect(burn.combat.filter(e => e.type === 'gain' && e.detail === 'experience').map(e => 'amount' in e && e.amount))
      .toEqual([500, 500, 500]);
    // Experience changes what members may train; a save taken at once must still be consistent.
    expect(PlaySession.resume(JSON.parse(JSON.stringify(s.checkpoint()))).campaign.state.elapsed)
      .toBe(s.campaign.state.elapsed);
    const xp = () => s.campaign.state.creatures.filter(c => c.id.includes('party')).map(c => c.state.experience);
    await s.perform('wait');
    expect(xp()).toEqual([500, 500, 500]);
  }, 120000);
});
describe('experience for a module someone else resolves', () => {
  it('is not the company\'s: a shepherd who burns out the nest while the company sleeps in town earns it nothing', async () => {
    const world = await WorldAssembler.assemble('thorn', NodeBundleSource.shared, { region: { terrain: 'mountain' } });
    const s = await PlaySession.start(world.path, 'thorn', world.source);
    for (const c of ['go(region__s1_inn_door,region__s1_taproom)', 'ask(region__s1_innkeeper,word1__h1_s1_innkeeper)',
      'take_lodging(region__s1_innkeeper_lodging,region__s1_innkeeper)', 'take_lodging(region__s1_innkeeper_lodging,region__s1_innkeeper)']) {
      await s.perform(c);
    }
    expect(s.campaign.state.modules?.find(m => m.id === 'brood')).toMatchObject({ outcome: 'success' });
    expect(s.campaign.state.creatures.filter(c => c.id.includes('party')).map(c => c.state.experience)).toEqual([0, 0, 0]);
  }, 60000);
});

describe('a level gained', () => {
  it('gives a point of any quality, and a specialist caster a spell of its tradition it can cast', () => {
    const ivo = new Content('levels').createCreature('ivo', { raceId: 'human', classId: 'mage', traits: ['evoker'] });
    ivo.state.experience = 1000;
    Advancement.train(ivo, 'seed');
    expect([ivo.base.level, ivo.state.advances]).toEqual([2, { qualities: 1, spells: 1 }]);
    // At level 2 a mage casts first-level spells: those are what it may learn, less what it knows.
    const offered = Advancement.learnable(ivo);
    expect(offered.length).toBeGreaterThan(0);
    expect(offered.every(id => Content.abilities.find(a => a.id === id)?.spell?.level === 1)).toBe(true);
    expect(offered.some(id => ivo.base.abilities.includes(id))).toBe(false);
    const before = ivo.base.intelligence;
    Advancement.improve(ivo, 'intelligence');
    Advancement.learn(ivo, offered[0]!);
    expect([ivo.base.intelligence, ivo.state.learnedAbilities, ivo.state.advances]).toEqual([before + 1, [offered[0]!],
      { qualities: 0, spells: 0 }]);
    expect(() => Advancement.improve(ivo, 'strength')).toThrow();
    // A warrior takes the point, and no spell.
    const bran = new Content('levels').createCreature('bran', { raceId: 'human', classId: 'warrior' });
    bran.state.experience = 1000;
    Advancement.train(bran, 'seed');
    expect(bran.state.advances).toEqual({ qualities: 1, spells: 0 });
  });
  it('is spent from the company: after a night at the Oar, the mage raises Intelligence and learns a spell', async () => {
    const companies = (await import('../data/campaigns/companies.json')).default;
    const members = companies.companies.find(c => c.id === 'delvers')!.members;
    const s = await PlaySession.start('data/campaigns/serewater-march.campaign.json', 'levels', NodeBundleSource.shared,
      members);
    // As if the company had come back from Censer Hill with a thousand experience each.
    const store = (s.campaign as unknown as { creatures: CreatureStore }).creatures;
    const lease = store.acquire(s.campaign.state.partyIds);
    try {
      lease.creatures.forEach(c => { c.state.experience = 1000; });
      lease.commit(lease.creatures);
    } finally { lease.release(); }
    await s.perform('go(march__oar_door,march__taproom)');
    await s.perform('take_lodging(march__maud_lodging,march__maud)');
    const ids = PlayerView.choices(s.campaign).map(c => c.choice.id);
    expect(ids).toContain('raise_quality(march__member_party_3,intelligence)');
    expect(ids).toContain('raise_quality(march__member_party_1,strength)');
    const lesson = ids.find(id => id.startsWith('learn_spell(march__member_party_3,'))!;
    expect(lesson).toBeDefined();
    expect(ids.some(id => id.startsWith('learn_spell(march__member_party_1,'))).toBe(false);
    const ivo = () => s.campaign.state.creatures.find(c => c.id === s.campaign.state.partyIds[2])!;
    const before = ivo().base.intelligence;
    await s.perform('raise_quality(march__member_party_3,intelligence)');
    await s.perform(lesson);
    expect(ivo().base.intelligence).toBe(before + 1);
    expect(ivo().state.learnedAbilities).toContain(lesson.slice(lesson.indexOf(',') + 1, -1));
    const after = PlayerView.choices(s.campaign).map(c => c.choice.id);
    expect(after.some(id => id.startsWith('raise_quality(march__member_party_3,'))).toBe(false);
    expect(after.some(id => id.startsWith('learn_spell('))).toBe(false);
  }, 60000);
});
