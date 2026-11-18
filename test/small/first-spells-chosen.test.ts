import { describe, expect, it } from 'bun:test';
import { Creation } from '../../web/engine/creation';
import { CreationFlow } from '../../web/engine/creation-flow';
import { CreationDefaults } from '../../web/engine/creation-defaults';
import { FirstSpells } from '../../web/engine/first-spells';
import { Content } from '../../src/content';
import type { Setting } from '../../web/engine/protocol';

// A caster's first spells chosen in creation (the owner, 18 November, OR-93: "explicit starting-spell selection for
// casters again, even if it's another screen"): after the art, one step for each first-level spell the rules give
// (three for an evoker), each offering every first-level spell open to the way, its own art's first, each with its
// school's emblem; the way's own pick chosen until another is, so that setting out at once is as it was; one held at
// another step changes places with it, one that would leave none of the art is shut; and the life set out with knows
// what was chosen.
const names = { human: { she: ['Wenna'], he: ['Odo'], they: ['Wren'] } };
const setting: Setting = { title: 'Marshfen', generated: true, pitch: { heading: '', text: '' }, names,
  party: [Creation.protagonist('human', 'spells', names)] };
const made = (calling: string, way: string) => {
  const flow = new CreationFlow(setting, Creation.catalog());
  for (const [id, v] of [['you', 'human'], ['sign', 'sign_ship'], ['gift', 'star_restless'], ['calling', calling],
    ['specialty', way]]) { flow.choose(id as never, v!); }
  return flow;
};
const step = (flow: CreationFlow, id: string) => flow.steps().find(x => x.id === id)!;
const first = (flow: CreationFlow) => flow.member.spells!.slice(0, 3);

describe('a caster\'s first spells, chosen', () => {
  it('asks each first-level spell in turn, the way\'s own pick chosen until another is', () => {
    const flow = made('mage', 'evoker'), picks = FirstSpells.picks('evoker', FirstSpells.own('mage'));
    expect(flow.current()).toBe('spell-1');
    expect(['spell-1', 'spell-2', 'spell-3'].map(id => step(flow, id).ask)).toEqual(['Which spell did you learn first?',
      'Which spell did you learn next?', 'Which spell did you learn last?']);
    expect(['spell-1', 'spell-2', 'spell-3'].map(id => step(flow, id).chosen)).toEqual(picks.slice(0, 3));
    expect(flow.member.spells).toEqual(picks);
    const one = step(flow, 'spell-1'), school = ['burning_hands', 'firebolt', 'magic_missile', 'spark', 'thunderclap'];
    // The art's own first, every one with its school's emblem; the calling's own Light is not offered again.
    expect([one.emblems, one.cards.slice(0, 5).map(c => c.id).sort()]).toEqual([true, school]);
    expect(one.cards.find(c => c.id === 'sleep')!.emblem).toBe('enchanter');
    expect(one.cards.some(c => c.id === 'conjure_light')).toBe(false);
    expect(one.cards.find(c => c.id === 'firebolt')!.entry!.facts).toContainEqual(['Of', 'Evocation']);
  });

  it('settles what is chosen, changes places, and shuts what would leave none of the art', () => {
    const flow = made('mage', 'evoker'), rest = flow.member.spells!.slice(3);
    flow.choose('spell-1' as never, 'sleep');
    flow.choose('spell-2' as never, 'charm');
    expect(flow.current()).toBe('spell-3');
    expect(first(flow)).toEqual(['sleep', 'charm', 'magic_missile']);
    expect(step(flow, 'spell-3').cards.find(c => c.id === 'hex')!.shut).toBe('One must be of evocation');
    flow.choose('spell-3' as never, 'hex');
    expect([first(flow), flow.current()]).toEqual([['sleep', 'charm', 'magic_missile'], 'spell-3']);
    flow.choose('back', '');
    // The one held at another step is said so, and taken here changes places with it.
    expect(step(flow, 'spell-2').cards.find(c => c.id === 'sleep')!.aside).toBe('learned first');
    flow.choose('spell-2' as never, 'sleep');
    expect(first(flow)).toEqual(['charm', 'sleep', 'magic_missile']);
    expect(flow.current()).toBe('spell-3');
    flow.choose('spell-3' as never, 'firebolt');
    expect([flow.member.spells, flow.current()]).toEqual([['charm', 'sleep', 'firebolt', ...rest], 'before']);
    // Kept through what is chosen after.
    flow.choose('before', 'learning');
    expect(flow.member.spells).toEqual(['charm', 'sleep', 'firebolt', ...rest]);
    const way = Creation.catalog().callings.find(c => c.id === 'mage')!.specializations.find(t => t.id === 'evoker')!;
    expect(CreationDefaults.allowed(flow.member.spells, way)).toBe(true);
    // And the life set out with knows them.
    const known = new Content('spells').createCreature('pc', { ...flow.member, raceId: 'human', classId: 'mage' })
      .base.abilities;
    expect(['charm', 'sleep', 'firebolt'].every(id => known.includes(id))).toBe(true);
    expect(known).not.toContain('burning_hands');
  });

  it('asks a cleric the prayers taught, and a warrior nothing', () => {
    const cleric = made('cleric', 'vitalist');
    expect([cleric.current(), step(cleric, 'spell-1').ask]).toEqual(['spell-1', 'Which prayer were you taught first?']);
    expect(step(cleric, 'spell-1').cards.find(c => c.id === 'bless')!.emblem).toBe('vitalist');
    const warrior = new CreationFlow(setting, Creation.catalog());
    warrior.choose('calling', 'warrior');
    expect(warrior.steps().some(x => /^spell-/.test(x.id))).toBe(false);
  });
});
