import { describe, expect, it } from 'bun:test';
import { EngineHost } from '../web/engine/engine-host';
import { TerminalCreation } from '../src/cli/terminal-creation';
import type { Frame } from '../src/creation/protocol';
import type { Asking } from '../src/cli/terminal-input';

// OR-120 in the terminal: one at the keys is asked first how the game begins, as the page asks it (the engine's
// question and its two rows, numbered), and Set out now, typed by the number printed beside its name, sets out at once
// rolled, the country drawn while the question was read.
describe('the terminal\'s first question', () => {
  it('is the page\'s: Build a character or Set out now, and Set out now sets out rolled', async () => {
    const host = new EngineHost(() => undefined), said: string[] = [];
    const input = { close: () => undefined, ask: async () => {
      const line = said.find(l => / Set out now /.test(`${l} `));
      return line ? /^ {2}(\d+)\./.exec(line)![1]! : '';
    } } as Asking;
    const { rolled } = await new TerminalCreation(input, l => said.push(l)).begin(host, 'bakoru');
    expect(said.filter(l => l.startsWith('\n')).map(l => l.trim())).toEqual(['How will you begin?']);
    expect(said.filter(l => /^ {2}\d\./.test(l)).map(l => l.replace(/ —.*/, '').trim()))
      .toEqual(['1. Build a character', '2. Set out now']);
    expect(rolled).toBe(true);
    const frame = await host.handle({ kind: 'set-out', rolled }) as Frame;
    expect(frame.transcript.seed).toBe('bakoru');
    expect(frame.transcript.drawn?.party?.[0]?.traits?.length).toBeGreaterThan(0);
  }, 90000);
});
