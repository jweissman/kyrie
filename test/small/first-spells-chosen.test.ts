import { ItemCatalog } from '../../src/item-catalog';
import { describe, expect, it } from 'bun:test';
import { Creation } from '../../web/engine/creation';
import { CreationFlow } from '../../src/creation/creation-flow';
import { CreationDefaults } from '../../src/creation/creation-defaults';
import { FirstSpells } from '../../src/creation/first-spells';
import { Content } from '../../src/content';
import type { Setting } from '../../src/creation/protocol';

// A caster's first spells chosen in creation, all at once (the owner, 18 November: "a multiselect is really the only
// path forward … you shouldn't have to page through all the spells three at a time"; OR-93 had asked them a step
// each): after the art, one step asking for as many first-level spells as the rules give (three for an evoker), every
// one open to the way in view, its own art's first, each with its school's emblem; a press takes one or lets it go, a
// full hand shuts the rest; the way's own picks taken until others are, so that setting out at once is as it was; the
// last row learns the hand, shut until it is full and holds one of the art, its entry what the way sets out knowing;
// and the life set out with knows what was chosen.
const names = { human: { she: ['Wenna'], he: ['Odo'], they: ['Wren'] } };
const setting: Setting = { title: 'Marshfen', generated: true, pitch: { heading: '', text: '' }, names,
  party: [Creation.protagonist('human', 'spells', names)] };
const made = (calling: string, way: string) => {
  const flow = new CreationFlow(setting, Creation.catalog());
  for (const [id, v] of [['you', 'human'], ['presenting', 'she'], ['sign', 'sign_ship'], ['calling', calling],
    ['specialty', way]]) { flow.choose(id as never, v!); }
  return flow;
};
const step = (flow: CreationFlow, id: string) => flow.steps().find(x => x.id === id)!;

describe('a caster\'s first spells, chosen', () => {
  it('asks for the whole hand at once, every spell in view, the way\'s own picks taken until others are', () => {
    const flow = made('mage', 'evoker'), picks = FirstSpells.picks('evoker', FirstSpells.own('mage'));
    // Shocking Grasp at the SRD's first level since srd-proving-cases.md case 35.
    const learn = step(flow, 'learn'), school = ['burning_hands', 'firebolt', 'magic_missile', 'shocking_grasp', 'spark'];
    expect([flow.current(), learn.ask, learn.many, learn.all, learn.picked]).toEqual(['learn',
      'Which three spells did you learn first?', 3, true, picks.slice(0, 3)]);
    expect(flow.member.spells).toEqual(picks);
    // The art's own first, every one with its school's emblem; the calling's own Light is not offered again.
    expect([learn.emblems, learn.cards.slice(0, 5).map(c => c.id).sort()]).toEqual([true, school]);
    expect(learn.cards.find(c => c.id === 'sleep')!.emblem).toBe('enchanter');
    expect(learn.cards.some(c => c.id === 'conjure_light')).toBe(false);
    expect(learn.cards.find(c => c.id === 'firebolt')!.entry!.facts).toContainEqual(['Of', 'Evocation']);
    // The hand full: what is not taken is shut until one is let go; the last row learns them, its entry the instrument.
    expect(learn.cards.find(c => c.id === 'sleep')!.shut).toBe('Hand full');
    const done = learn.cards.at(-1)!;
    expect([done.id, done.name, done.shut]).toEqual(['learned', 'Learn these three', undefined]);
    expect(done.entry!.groups!.flatMap(g => g.rows.map(r => r.id))).toEqual(expect.arrayContaining(picks.slice(0, 3)));
  });

  it('takes and lets go, shuts the learning without one of the art, and goes on only when learned', () => {
    const flow = made('mage', 'evoker'), rest = flow.member.spells!.slice(3);
    const [a, b, c] = flow.member.spells!.slice(0, 3);
    for (const id of [a, b, c]) { flow.choose('learn', id!); }
    expect([step(flow, 'learn').picked, flow.current()]).toEqual([[], 'learn']);
    expect(step(flow, 'learn').cards.at(-1)!.shut).toBe('Three spells more to choose');
    for (const id of ['sleep', 'charm', 'hex']) { flow.choose('learn', id); }
    expect(step(flow, 'learn').cards.at(-1)!.shut).toBe('One must be of evocation');
    flow.choose('learn', 'learned');
    expect(flow.current()).toBe('learn');
    flow.choose('learn', 'hex');
    flow.choose('learn', 'firebolt');
    flow.choose('learn', 'learned');
    expect([flow.member.spells, flow.current()]).toEqual([['sleep', 'charm', 'firebolt', ...rest], 'before']);
    // Kept through what is chosen after.
    flow.choose('before', 'learning');
    expect(flow.member.spells).toEqual(['sleep', 'charm', 'firebolt', ...rest]);
    const way = Creation.catalog().callings.find(x => x.id === 'mage')!.specializations.find(t => t.id === 'evoker')!;
    expect(CreationDefaults.allowed(flow.member.spells, way)).toBe(true);
    // And the life set out with knows them.
    const known = new Content('spells').createCreature(ItemCatalog.canon, 'pc', { ...flow.member, raceId: 'human', classId: 'mage' })
      .base.abilities;
    expect(['charm', 'sleep', 'firebolt'].every(id => known.includes(id))).toBe(true);
    expect(known).not.toContain('burning_hands');
  });

  it('asks a cleric the prayers taught, and a warrior nothing', () => {
    const cleric = made('cleric', 'vitalist');
    expect([cleric.current(), step(cleric, 'learn').ask]).toEqual(['learn', 'Which three prayers were you taught first?']);
    expect(step(cleric, 'learn').cards.find(x => x.id === 'bless')!.emblem).toBe('vitalist');
    const warrior = new CreationFlow(setting, Creation.catalog());
    warrior.choose('calling', 'warrior');
    expect(warrior.steps().some(x => x.id === 'learn')).toBe(false);
  });
});
