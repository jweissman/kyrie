import { describe, expect, it } from 'bun:test';
import { Content } from '../src/content';
import { CreatureStore } from '../src/creature-store';
import { Items } from '../src/campaign/items';
import { Checks } from '../src/rules/checks';
import { PartyCapabilities } from '../src/campaign/party-capabilities';
import { LocalKinds } from '../src/canon/local-catalog';
import { Canon } from '../src/canon/canon';
import { ItemCatalog } from '../src/item-catalog';
import type { Creature } from '../src/creature';

// Tools enable appropriate tasks and may improve performance; they don't magically grant expertise (the owner, 7
// November). A professional's tool (thieves' tools, a holy symbol, an instrument, a spellbook, a healer's kit) helps
// one trained in its skill at its checks and lends one who is not nothing; an ordinary thing (a shovel, pitons, a
// ladder) has a direct use anyone can make of it. Thieves' tools, a shovel and a ladder had been carried and read by
// nothing (the item audit's G11).
class Bench {
  // One of a calling, with what they set out with, and without any of a kind of thing.
  static member(classId: string, without: string[] = []): { store: CreatureStore; c: () => Creature } {
    const c = new Content(`tools-${classId}`).createCreature(classId, { raceId: 'human', classId, level: 1 });
    c.state.inventory = (c.state.inventory ?? []).filter(i => !without.includes(i.definition));
    const store = new CreatureStore([c]);
    return { store, c: () => store.get(classId) };
  }
  // How many of a hundred tries at a lock of fair difficulty come through.
  static locks(c: Creature): number {
    return Array.from({ length: 100 }, (_, n) => Checks.make([c], { skill: 'lockwork', difficulty: 'dc_fair',
      seed: `lock-${n}` })).filter(e => Checks.passed(e)).length;
  }
}

describe('a professional tool', () => {
  it('helps a trained thief at a lock: with thieves\' tools they open more of them than without', () => {
    const bare = Bench.member('thief', ['thieves_tools']), tooled = Bench.member('thief', ['thieves_tools']);
    Items.take(tooled.store, 'thief', { id: 'picks', definition: 'thieves_tools' });
    const [without, withTools] = [Checks.bonus(bare.c(), 'lockwork'), Checks.bonus(tooled.c(), 'lockwork')];
    expect(without.trained).toBeGreaterThan(0);
    expect([without.tool, withTools.tool, withTools.using]).toEqual([0, Checks.toolBonus, 'thieves_tools']);
    expect(Checks.total(tooled.c(), 'lockwork')).toBe(Checks.total(bare.c(), 'lockwork') + Checks.toolBonus);
    expect(Bench.locks(tooled.c())).toBeGreaterThan(Bench.locks(bare.c()));
    // And the roll says what the tools added.
    const roll = Checks.make([tooled.c()], { skill: 'lockwork', difficulty: 'dc_hard', seed: 'said' })[0]!;
    expect(roll).toMatchObject({ tool: Checks.toolBonus, using: 'thieves_tools' });
  });
  it('lends one never trained in it nothing: a warrior with thieves\' tools is no better at a lock', () => {
    const bare = Bench.member('warrior'), tooled = Bench.member('warrior');
    Items.take(tooled.store, 'warrior', { id: 'picks', definition: 'thieves_tools' });
    expect(Checks.bonus(tooled.c(), 'lockwork')).toEqual(Checks.bonus(bare.c(), 'lockwork'));
    expect(Checks.bonus(tooled.c(), 'lockwork')).toMatchObject({ trained: 0, tool: 0 });
    expect(Bench.locks(tooled.c())).toBe(Bench.locks(bare.c()));
    // Carrying them is no training: the warrior brings no lockwork to the company for them.
    expect(PartyCapabilities.has('lockwork', [tooled.c()])).toBe(false);
  });
  it('is declared for its skills in the catalog, and no tool grants a skill', () => {
    expect(['thieves_tools', 'holy_symbol', 'musical_instrument', 'spellbook', 'first_aid_kit', 'bandages']
      .map(k => [k, Canon.items[k]!.tool?.length ? 'tool' : 'none', Canon.items[k]!.grants?.skill ?? 'none']))
      .toEqual([['thieves_tools', 'tool', 'none'], ['holy_symbol', 'tool', 'none'], ['musical_instrument', 'tool', 'none'],
        ['spellbook', 'tool', 'none'], ['first_aid_kit', 'tool', 'none'], ['bandages', 'tool', 'none']]);
    // What still grants a skill outright is magic, or a module's own; no catalog tool or gear does.
    expect(Object.entries(Canon.items).filter(([, i]) => i.grants?.skill && ['tool', 'gear'].includes(i.category))
      .map(([id]) => id).filter(id => !LocalKinds.local(id))).toEqual([]);
  });
});

describe('an ordinary tool', () => {
  it('digs for anyone: a warrior with a shovel can do what needs digging, and a little better at it', () => {
    const bare = Bench.member('warrior'), dug = Bench.member('warrior');
    expect(PartyCapabilities.has('digging', [bare.c()])).toBe(false);
    Items.take(dug.store, 'warrior', { id: 'spade', definition: 'shovel' });
    expect(PartyCapabilities.has('digging', [dug.c()])).toBe(true);
    expect(PartyCapabilities.providers('digging', [dug.c()]).map(c => c.id)).toEqual(['warrior']);
    // It is no training: no proficiency, only the shovel's help.
    expect(PartyCapabilities.skilled('digging', dug.c())).toBe(false);
    expect(Checks.bonus(dug.c(), 'digging')).toMatchObject({ trained: 0, tool: Checks.toolBonus, using: 'shovel' });
  });
  it('climbs for anyone: pitons, iron spikes, a ladder and the climber\'s harness', () => {
    for (const kind of ['piton', 'iron_spikes', 'ladder', 'climbing_harness']) {
      const m = Bench.member('warrior');
      Items.take(m.store, 'warrior', { id: 'aid', definition: kind });
      if (ItemCatalog.get(kind).slot) { Items.equip(m.store, 'warrior', 'aid'); }
      expect([kind, PartyCapabilities.has('climbing', [m.c()]), PartyCapabilities.skilled('climbing', m.c())])
        .toEqual([kind, true, false]);
    }
  });
  it('is the like of a module\'s kind only for what it grants: a crown of paste like the glossary reads no script', () => {
    const crown = LocalKinds.item('test', { id: 'paste_crown', name: 'a crown of paste', base: { like: 'old_glossary' },
      grants: 'persuasion' });
    expect([crown.grants?.skill, crown.aids, crown.tool]).toEqual(['persuasion', undefined, undefined]);
    expect(LocalKinds.item('test', { id: 'second_glossary', name: 'a second glossary', base: { like: 'old_glossary' } })
      .aids).toEqual(['lore']);
  });
});
