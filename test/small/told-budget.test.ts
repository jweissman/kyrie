import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { ToldLines } from '../../src/presentation/told-lines';

// What a turn tells (the owner, 17 November: narration "should never cost more than 2-3 sentences in any case", and
// "we shouldn't redescribe something we've already said"; OR-69): an act's telling, three sentences at most, the rest
// held for a deliberate look with the dice; and something done where the company stands is told alone, the place it
// said on coming here held, not told again over it. A yard with a pump in it.
const yard = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Company party "You" of 1 at yard.
  Thing pump "the pump" at yard {
    State dry "A pump stands by the wall, its handle up. The yard is cobbled and swept. Hens pick at the gate.".
    State primed "The pump runs clear into the trough.".
    Change primed "Prime the pump" from dry to primed. }
  Goal false.`;

describe('what a turn tells', () => {
  it('says three sentences of an act at most, the rest on a deliberate look, and the dice never with it', () => {
    const lines = [{ text: 'One. Two.', kind: 'event' as const }, { text: 'Rolled 14.', kind: 'roll' as const },
      { text: 'Three. Four.', kind: 'event' as const }, { text: 'Five.', kind: 'telling' as const }];
    expect(ToldLines.said(lines).map(l => l.text)).toEqual(['One. Two.', 'Three.']);
    expect(ToldLines.said(lines, false, 2).map(l => l.text)).toEqual(['One. Two.']);
    expect(ToldLines.said(lines, true)).toEqual(lines);
    expect([ToldLines.more(lines), ToldLines.more(lines.slice(0, 1))]).toEqual([true, false]);
  });
  it('tells something done where the company stands alone, the place held', async () => {
    const t = await Tiny.start(yard);
    const placed = [...t.leaf.glanced!.situation, ...t.leaf.glanced!.presence];
    expect([placed.length > 0, t.leaf.glanced?.stayed]).toEqual([true, undefined]);
    await t.perform('change_thing(t__pump_primed)');
    expect([t.leaf.glanced?.situation, t.leaf.glanced?.presence, t.leaf.glanced?.stayed]).toEqual([[], [], true]);
    // What the act changed is told as what came of it, once (the pump runs clear), not as the place again.
    expect(t.leaf.exchange?.lines.map(l => l.text).join(' ')).toContain('The pump runs clear');
  });
});
