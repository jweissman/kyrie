import { describe, expect, it } from 'bun:test';
import { ChoiceList } from '../src/ui/choice-list';
import type { ExitRow } from '../src/ui/screen-types';

// A way barred, with something to try on what bars it, is offered as the way, barred, saying what bars it and what
// another way there would want, and then the tries (play 8: "Into the bailey" opened on looking closely, pushing and
// listening at a portcullis, nothing saying why it was no way in, nor that the breach beside it wanted a climber).
describe('a way barred', () => {
  const blocked = 'A rusted portcullis hangs across the gate passage, a foot short of the ground. Or by a breach in '
    + 'the curtain wall: you would need climbing.';
  const exit = { id: 'exit:bailey', kind: 'exit', name: 'the bailey', destination: { id: 'bailey', name: 'the bailey' },
    transition: 'enter', passage: 'door', visited: false, blocked, acts: [{ key: 'portcullis', label: 'Look at the portcullis',
      children: [{ key: 'close', label: 'Look closely', command: 'look_closely(portcullis)' },
        { key: 'push', label: 'Push and pull at it', command: 'push(portcullis)' }] }] } as unknown as ExitRow;
  const [way, ...tries] = ChoiceList.ways([exit]).choices;
  it('is the way, barred, saying why', () => {
    expect([way!.id, way!.label, way!.disabled]).toEqual(['exit:bailey', 'Into the bailey', blocked]);
  });
  it('and then what can be tried on what bars it', () => {
    // Each a row of its own, in whole words (PB-29: only a fight, a store and creation unfold).
    expect(tries.map(c => [c.label, c.command, c.children])).toEqual([
      ['Into the bailey — look at the portcullis — Look closely', 'look_closely(portcullis)', undefined],
      ['Into the bailey — look at the portcullis — Push and pull at it', 'push(portcullis)', undefined]]);
  });
});
