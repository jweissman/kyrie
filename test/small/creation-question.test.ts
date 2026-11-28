import { describe, expect, it } from 'bun:test';
import { Creation } from '../../web/engine/creation';
import { CreationFlow } from '../../src/creation/creation-flow';
import type { Setting } from '../../src/creation/protocol';

// Creation's page is the engine's question (PA-04, the owner, 17 November): the step asked now, its options, which is
// chosen, how it may be drawn (cards, rows, one dense list, the sky) and what else it offers (another hand, a field to
// write in), the flow keeping where it stands; no client keeps a page or a cursor of its own per step.
const names = { human: { she: ['Wenna', 'Alis'], he: ['Odo', 'Hew', 'Aldo', 'Berin', 'Cade', 'Dunn', 'Edric', 'Fulk',
  'Gamel', 'Hamo', 'Ivo', 'Jory'], they: ['Wren'] } };
const setting: Setting = { title: 'Marshfen', generated: true, pitch: { heading: '', text: '' }, names,
  party: [Creation.protagonist('human', 'flow', names)] };

describe('creation as the engine asks it', () => {
  it('says how each step may be drawn, and with what beside its options', () => {
    const steps = new CreationFlow(setting, Creation.catalog()).steps();
    const of = (id: string) => steps.find(x => x.id === id)!;
    expect(steps.map(x => [x.id, x.present])).toEqual([['you', 'cards'], ['presenting', 'rows'], ['sign', 'sky'],
      ['calling', 'rows'], ['before', 'list'], ['perk', 'rows'], ['name', 'list']]);
    expect(of('presenting').cards.map(c => c.aside)).toEqual(['she, her', 'he, him', 'they, them']);
    // The cards are the ancestry's alone (OR-1801); the calling's rows keep their emblems.
    expect([of('calling').emblems, of('calling').cards.every(c => c.emblem)]).toEqual([true, true]);
    expect(of('sign').cards.every(c => c.aside && c.say && /^[A-Z]/.test(c.name))).toBe(true);
    expect(of('you').cards.every(c => c.say && !/[.!?].+[.!?]$/.test(c.say))).toBe(true);
    expect([of('name').write, of('name').roll, of('name').all]).toEqual(['Or write your own',
      'other names of your people', true]);
  });

  it('stands at a step until a card of it is chosen, and goes back and on as asked', () => {
    const flow = new CreationFlow(setting, Creation.catalog());
    expect([flow.current(), flow.beside(-1), flow.beside(1)]).toEqual(['you', undefined, 'presenting']);
    flow.choose('you', 'human');
    expect([flow.current(), flow.beside(-1)]).toEqual(['presenting', 'you']);
    // A choice behind Details, or of another step, settles it and stays.
    flow.choose('weapon', 'dagger');
    expect(flow.current()).toBe('presenting');
    flow.choose('back', '');
    expect(flow.current()).toBe('you');
    for (const id of ['onward', 'onward', 'onward', 'onward', 'onward']) { flow.choose(id as 'onward', ''); }
    // The perk is the last thing asked of who one is, before the name (OR-153).
    expect(flow.current()).toBe('perk');
    flow.choose('onward', '');
    expect(flow.current()).toBe('name');
    // A name being written stays at the name; gone on from, setting out; a name drawn goes on at once.
    flow.choose('name', 'Odri');
    expect(flow.current()).toBe('name');
    flow.choose('onward', '');
    expect(flow.current()).toBe('go');
    flow.choose('back', '');
    flow.choose('drawn', 'Wenna');
    expect([flow.current(), flow.member.name]).toEqual(['go', 'Wenna']);
  });

  it('deals another hand of names on asking, and begins again for a new way of presenting', () => {
    const flow = new CreationFlow(setting, Creation.catalog());
    flow.choose('presenting', 'he');
    const hand = () => flow.steps().find(x => x.id === 'name')!.cards.map(c => c.id), first = hand();
    expect(first.length).toBeGreaterThan(4);
    flow.choose('roll', '');
    expect(hand().some(n => first.includes(n))).toBe(false);
    flow.choose('presenting', 'he');
    expect(hand()).toEqual(first);
  });
});
