import { describe, expect, it } from 'bun:test';
import { OwnWords } from '../src/presentation/own-words';
import type { Module, Operator } from '../src/lang/module';

// Someone who tells of a thing in their own words is not also asked about it in the shared ones (the owner, 3
// November: "Ask Cyril about Wapshott's Circus" beside Cyril's own "Ask Cyril about the circus").
describe('a question in someone\'s own words', () => {
  const knows = (fact: string) => ({ kind: 'assert' as const, call: { kind: 'call' as const, name: 'knows', args: ['actor', fact] } });
  const own = { id: 'keeper_circus', speaker: 'cyril', success: [knows('heard_circus')] } as unknown as Operator;
  const ask = (informant: string) => ({ id: `ask_${informant}`, schema: 'ask',
    bindings: { informant, statement: 'heard_circus' }, success: [] }) as unknown as Operator;
  it('leaves out the shared question to the one who has their own, and asks anyone else', () => {
    const module = { actions: [own] } as unknown as Module;
    expect(OwnWords.unasked(module, [own, ask('cyril'), ask('arlen')]).map(a => a.id))
      .toEqual(['keeper_circus', 'ask_arlen']);
  });
  // Nor about the going-on their own topic is of, though it teaches something else (a1: Mik asked "about the players
  // stuck at Lowmouth" beside his own "about the players"); a question of the country's own is still asked.
  it('leaves out a shared question of the going-on their own topic is of', () => {
    const mik = { id: 'players__trader_players', speaker: 'mik', success: [] } as unknown as Operator;
    const of = (statement: string) => ({ id: `ask_${statement}`, schema: 'ask', bindings: { informant: 'mik', statement },
      success: [] }) as unknown as Operator;
    const module = { actions: [mik] } as unknown as Module;
    expect(OwnWords.unasked(module, [mik, of('players__on_green'), of('region__word'), of('circus__bill')]).map(a => a.id))
      .toEqual(['players__trader_players', 'ask_region__word', 'ask_circus__bill']);
  });
});
