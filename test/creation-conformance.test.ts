import { describe, expect, it } from 'bun:test';
import { EngineHost } from '../web/engine/engine-host';
import type { CreationState } from '../web/engine/engine-creation';
import type { CreationStep } from '../web/engine/creation-flow';
import type { Frame, Setting } from '../web/engine/protocol';
import { TerminalCreation } from '../src/cli/terminal-creation';
import type { Asking } from '../src/cli/terminal-input';

// The terminal is a conformance test of the one player journey (the owner, 14 November: Kyrie the source of truth for
// the structure and progression of player workflows; no second character creator). From no character at all, a life
// is made and set out with twice on one country: once as the terminal plays, typing the numbers it prints, and once as
// the page's worker is asked, by the cards' ids. Each choice goes to the engine (world, creation, set-out); neither
// client decides a step, a card's place or what a choice settles. The lives made, the starts, the places come to and
// the four each first page leads with, and what each of them is, are the same.
const seed = 'conform';
// What is chosen, by step: a card by its id; and the name written.
const chosen = (setting: Setting): Partial<Record<CreationStep['id'], string>> => ({ why: setting.origins![1]!.id,
  you: 'dwarf', calling: 'cleric', before: 'learning', presenting: 'she', name: 'Hild' });
class Conform {
  // As the terminal plays, blind: the number printed beside the card's name, read off the lines as a player reads
  // them, or `more` first where it is not among the four shown.
  static async terminal(): Promise<{ state: CreationState; frame: Frame }> {
    const host = new EngineHost(() => undefined), said: string[] = [];
    let wanted: Partial<Record<string, string>> = {};
    const input = { close: () => undefined, ask: async () => {
      const at = said.findLastIndex(l => l.startsWith('\n')), ask = said[at]!;
      if (/^\nChoose your name/.test(ask)) { return wanted.name!; }
      const step = (await host.handle({ kind: 'creation' }) as CreationState).steps.find(s => ask.includes(s.ask))!;
      const name = step.cards.find(c => c.id === wanted[step.id])?.name;
      if (!name) { return ''; }
      const line = said.slice(at).findLast(l => new RegExp(`^ {2}\\d+\\. (\\S+ )?${name} `).test(`${l} `));
      if (line) { return /^ {2}(\d+)\./.exec(line)![1]!; }
      return 'more';
    } } as Asking;
    const creation = new TerminalCreation(input, l => said.push(l)), world = host.handle({ kind: 'world', seed });
    wanted = chosen(await world as Setting);
    const { state } = await creation.choose(host, seed);
    return { state, frame: await host.handle({ kind: 'set-out' }) as Frame };
  }
  // As the page's worker is asked: each step's choice by its card's id, in the order the engine gives the steps.
  static async page(): Promise<{ state: CreationState; frame: Frame }> {
    const host = new EngineHost(() => undefined), want = chosen(await host.handle({ kind: 'world', seed }) as Setting);
    let state = await host.handle({ kind: 'creation' }) as CreationState;
    for (let i = 0; i < state.steps.length; i++) {
      const step = state.steps[i]!;
      if (want[step.id] !== undefined) {
        state = await host.handle({ kind: 'creation', step: step.id, value: want[step.id] }) as CreationState;
      }
    }
    return { state, frame: await host.handle({ kind: 'set-out' }) as Frame };
  }
  // What a first page is, as both clients are given it: where, who, what is said, the four led with and what each is.
  static seen(frame: Frame) {
    const g = frame.leaf.glance!;
    return { place: frame.screen.place.id, party: frame.screen.party.map(m => [m.name, m.calling]),
      told: [...frame.leaf.situation, ...frame.leaf.presence],
      four: g.offer?.primary.map(o => [o.command ?? o.choice, o.type, o.aspects]),
      rest: g.offer?.rest.length, aims: frame.screen.aims?.map(a => a.text) };
  }
}
describe('one player journey, from no character, in the terminal and as the page asks', () => {
  it('makes the same life, sets out the same, and is led the same four', async () => {
    const terminal = await Conform.terminal(), page = await Conform.page();
    expect(terminal.state.member).toEqual(page.state.member);
    expect(terminal.state.origin).toBe(page.state.origin);
    expect([page.state.member.raceId, page.state.member.classId, page.state.member.name]).toEqual(['dwarf', 'cleric', 'Hild']);
    expect(Conform.seen(terminal.frame)).toEqual(Conform.seen(page.frame));
    expect(Conform.seen(page.frame).four?.length).toBe(4);
  }, 300000);
});
