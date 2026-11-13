import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Creation } from '../../web/engine/creation';
import { CreationFlow } from '../../web/engine/creation-flow';
import type { Setting } from '../../web/engine/protocol';
import { TerminalCreation } from '../../src/cli/terminal-creation';
import { EngineHost } from '../../web/engine/engine-host';
import type { Asking } from '../../src/cli/terminal-input';

// Creation leads with four, as every surface does (the owner, 14 November: TB-02): a step of more than four cards puts
// first the one chosen, then the peoples of this country, or the kinds of life that best suit the calling; the
// terminal shows those four and keeps the rest under `more`. A step of four or fewer keeps its own order.
const names = { dwarf: { she: ['Disa'], he: ['Dain'], they: ['Dvalin'] }, human: { she: ['Wenna'], he: ['Odo'],
  they: ['Wren'] } };
const setting: Setting = { title: 'Merscfaenn', generated: true, pitch: { heading: '', text: '' },
  origins: [{ id: 'debt', title: 'A debt', choice: 'You owe money' }], names,
  party: [Creation.protagonist('human', 'four', names)] };
describe('creation', () => {
  it('leads each step of many cards with four: the chosen, this country\'s peoples, the best suited', () => {
    const flow = new CreationFlow(setting, Creation.catalog());
    const step = (id: string) => flow.steps().find(s => s.id === id)!;
    expect(step('you').cards.slice(0, 2).map(c => c.id)).toEqual(['human', 'dwarf']);
    flow.choose('calling', 'warrior');
    expect(step('before').cards[0]!.id).toBe('arms');
    expect(step('presenting').cards.map(c => c.id)).toEqual(['she', 'he', 'they']);
  });
  it('is shown four at a time in the terminal, the rest under more', async () => {
    const said: string[] = [], input = { ask: async () => '', close: () => undefined } as Asking;
    await new TerminalCreation(input, l => said.push(l)).choose(new EngineHost(() => undefined), 'four');
    const calling = said.slice(said.indexOf('\nChoose your calling') + 1);
    const shape = calling.slice(0, 5).map(l => /^ {2}(\d)\./.exec(l)?.[1] ?? l.trim().replace(/\d+/, 'n'));
    expect(shape).toEqual(['1', '2', '3', '4', '(n more: more)']);
  });
  // No second creator: the terminal holds no flow of its own, and asks the engine for every step (see EngineCreation);
  // what it imports of creation it imports as types only.
  it('is the engine\'s alone: the terminal imports no flow of its own', () => {
    const source = readFileSync('src/cli/terminal-creation.ts', 'utf8');
    const imports = source.split('\n').filter(l => /^import .* from '.*web\/engine\//.test(l));
    expect(imports.filter(l => !l.startsWith('import type '))).toEqual([]);
  });
  // Born under one of Imbar's twelve signs, one a month (data/imbar/sky.json): the step leads with the one the life
  // was drawn under and the months that follow it, as the sky turns; a sign chosen is the life's.
  it('asks under which of the sky\'s twelve signs the life was born, the sky turning from the one drawn', () => {
    const flow = new CreationFlow(setting, Creation.catalog()), sign = () => flow.steps().find(s => s.id === 'sign')!;
    const months = Creation.catalog().signs.map(x => x.id), drawn = flow.member.sign!;
    expect(sign().cards).toHaveLength(12);
    const from = months.indexOf(drawn);
    expect(sign().cards.slice(0, 4).map(c => c.id)).toEqual([0, 1, 2, 3].map(i => months[(from + i) % 12]!));
    flow.choose('sign', 'sign_wolf');
    expect([flow.member.sign, sign().cards[0]!.id]).toEqual(['sign_wolf', 'sign_wolf']);
  });
});
