import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Creation } from '../../web/engine/creation';
import { CreationFlow } from '../../src/creation/creation-flow';
import type { Setting } from '../../src/creation/protocol';
import { TerminalCreation } from '../../src/cli/terminal-creation';
import { EngineHost } from '../../web/engine/engine-host';
import type { Asking } from '../../src/cli/terminal-input';

// Creation leads with four, as every surface does (the owner, 14 November: TB-02): a step of more than four cards puts
// first the peoples of this country, or the kinds of life that best suit the calling; the terminal shows those four
// and keeps the rest under `more`. A step of four or fewer keeps its own order. Never by what is chosen: the chosen
// card had leapt to the front and the deck reshuffled under the player's hand (the owner, 14 November).
const names = { dwarf: { she: ['Disa'], he: ['Dain'], they: ['Dvalin'] }, human: { she: ['Wenna'], he: ['Odo'],
  they: ['Wren'] } };
const setting: Setting = { title: 'Marshfen', generated: true, pitch: { heading: '', text: '' },
  origins: [{ id: 'debt', title: 'A debt', choice: 'You owe money' }], names,
  party: [Creation.protagonist('human', 'four', names)] };
describe('creation', () => {
  it('leads each step of many cards with four: this country\'s peoples, the best suited', () => {
    const flow = new CreationFlow(setting, Creation.catalog());
    const step = (id: string) => flow.steps().find(s => s.id === id)!;
    expect(step('you').cards.slice(0, 2).map(c => c.id)).toEqual(['human', 'dwarf']);
    flow.choose('calling', 'warrior');
    expect(step('before').cards[0]!.id).toBe('arms');
    expect(step('presenting').cards.map(c => c.id)).toEqual(['she', 'he', 'they']);
  });
  it('keeps a step\'s order whatever is chosen in it', () => {
    const flow = new CreationFlow(setting, Creation.catalog());
    const order = (id: string) => flow.steps().find(s => s.id === id)!.cards.map(c => c.id);
    const [you, sign] = [order('you'), order('sign')];
    flow.choose('you', you.at(-1)!);
    flow.choose('sign', sign.at(-1)!);
    expect([order('you'), order('sign')]).toEqual([you, sign]);
  });
  it('is shown four at a time in the terminal, the rest under more', async () => {
    const said: string[] = [], input = { ask: async () => '', close: () => undefined } as Asking;
    const host = new EngineHost(() => undefined);
    await new TerminalCreation(input, l => said.push(l)).choose(host, 'four');
    // What it made ready while choosing finished here, not in the next spec (its costs had been counted there).
    await host.idle();
    const calling = said.slice(said.indexOf('\nChoose your calling') + 1);
    const shape = calling.slice(0, 5).map(l => /^ {2}(\d)\./.exec(l)?.[1] ?? l.trim().replace(/\d+/, 'n'));
    expect(shape).toEqual(['1', '2', '3', '4', '(n more: more)']);
  }, 60000);
  // No second creator: the terminal holds no flow of its own, and asks the engine for every step (see EngineCreation);
  // what it imports of creation it imports as types only.
  it('is the engine\'s alone: the terminal imports no flow of its own', () => {
    const source = readFileSync('src/cli/terminal-creation.ts', 'utf8');
    const imports = source.split('\n').filter(l => /^import .* from '.*web\/engine\//.test(l));
    expect(imports.filter(l => !l.startsWith('import type '))).toEqual([]);
  });
  // Born under one of Imbar's twelve signs, one a month (data/imbar/sky.json): all twelve at once, in the months' order
  // as the zodiac beside them stands (FM-02), the one the life was drawn under its sign until another is chosen, but
  // not shown as chosen (OR-1684: drawn, not suggested); a sign chosen is the life's, and shown so.
  it('asks under which of the sky\'s twelve signs the life was born, all twelve in the months\' order', () => {
    const flow = new CreationFlow(setting, Creation.catalog()), sign = () => flow.steps().find(s => s.id === 'sign')!;
    const months = Creation.catalog().signs.map(x => x.id), drawn = flow.member.sign!;
    expect(sign().cards).toHaveLength(12);
    expect([sign().cards.map(c => c.id), sign().chosen, months.includes(drawn)]).toEqual([months, undefined, true]);
    flow.choose('sign', 'sign_wolf');
    // Chosen, it is the life's sign, and the deck stays where it was.
    expect([flow.member.sign, sign().chosen, sign().cards.map(c => c.id)]).toEqual(['sign_wolf', 'sign_wolf', months]);
  });
});
