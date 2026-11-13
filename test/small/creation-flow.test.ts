import { describe, expect, it } from 'bun:test';
import { Creation } from '../../web/engine/creation';
import { CreationFlow } from '../../web/engine/creation-flow';
import type { Setting } from '../../web/engine/protocol';
import { TerminalCreation } from '../../src/cli/terminal-creation';
import type { Asking } from '../../src/cli/terminal-input';

// Making the protagonist is one flow in the engine (CreationFlow): its steps, their cards and what a choice settles,
// so that no client keeps its own script (the owner, 14 November). The page's rules as they stood: a people narrows
// its callings, a calling with ways asks for one, a way a people may not take is shut, a new calling clears its way,
// and how one presents draws a name again until one is written. A country of two reasons for coming, and names.
const names = { human: { she: ['Wenna', 'Alis'], he: ['Odo', 'Hew'], they: ['Wren'] },
  elf: { she: ['Ithil'], he: ['Lorin'], they: ['Aerin'] } };
const setting: Setting = { title: 'Merscfaenn', generated: true, pitch: { heading: '', text: '' },
  origins: [{ id: 'debt', title: 'A debt', choice: 'You owe money' }, { id: 'wanderer', title: 'Wandering',
    choice: 'You come with your trade', background: 'drifter' }], names,
  party: [Creation.protagonist('human', 'flow', names)] };

describe('making the protagonist', () => {
  it('is one flow: its steps, its cards, and what a choice settles', () => {
    const flow = new CreationFlow(setting, Creation.catalog()), ids = () => flow.steps().map(s => s.id);
    // The protagonist drawn is a warrior, whose ways are a step of their own.
    expect(ids()).toEqual(['why', 'you', 'calling', 'specialty', 'before', 'presenting', 'name']);
    flow.choose('you', 'elf');
    expect(flow.steps().find(s => s.id === 'calling')!.cards.map(c => c.id)).not.toContain('cleric');
    flow.choose('calling', 'mage');
    const way = flow.steps().find(s => s.id === 'specialty')!;
    expect([way.ask, ids().indexOf('specialty')]).toEqual(['Choose your school', 3]);
    const school = way.cards.find(c => !c.shut)!.id;
    flow.choose('specialty', school);
    // A new calling's way is its own (the first it offers, until another is chosen), never the last calling's.
    flow.choose('calling', 'warrior');
    const warrior = Creation.catalog().callings.find(c => c.id === 'warrior')!.specializations.map(t => t.id);
    expect([warrior.includes(flow.member.traits?.[0] ?? ''), flow.member.traits?.[0] === school]).toEqual([true, false]);
    // What you did before is asked by its kind only; the trade within it is the one that suits the calling best.
    const catalog = Creation.catalog(), before = flow.steps().find(s => s.id === 'before')!;
    expect(before.cards.every(c => catalog.kinds.some(k => k.id === c.id))).toBe(true);
    flow.choose('before', before.cards[0]!.id);
    expect(catalog.backgrounds.find(b => b.id === flow.member.backgroundId)?.kind).toBe(before.cards[0]!.id);
    flow.choose('presenting', 'he');
    expect(flow.member.name).toBe('Lorin');
    flow.choose('name', 'Tam');
    flow.choose('presenting', 'she');
    expect([flow.member.name, flow.member.pronouns, flow.member.raceId]).toEqual(['Tam', 'she', 'elf']);
  });
  it('is shown in the terminal by its cards, and what is chosen there is what the flow made', async () => {
    // Answered by what is asked: the second reason for coming, a woman, Aud; the rest as they stand.
    const said: string[] = [], asked = () => said.findLast(l => l.startsWith('\n')) ?? '';
    const answer = () => /^\nWhy/.test(asked()) ? '2' : /^\nHow do you present/.test(asked()) ? '1'
      : /^\nChoose your name/.test(asked()) ? 'Aud' : '';
    const input = { ask: async () => answer(), close: () => undefined } as Asking;
    const made = await new TerminalCreation(input, l => said.push(l)).choose('flow');
    expect(said).toContain(`\nWhy have you come to ${made.setting.title}?`);
    expect(made.origin).toBe(made.setting.origins![1]!.id);
    expect([made.member.name, made.member.pronouns]).toEqual(['Aud', 'she']);
  }, 60000);
});
