import { describe, expect, it } from 'bun:test';
import { FictionLint } from '../src/cli/fiction-lint';
import type { Operator } from '../src/lang/module';

// Fiction standing in for the rules (OR-147): an act whose telling lands a blow, a wound, a defeat or a spell, with
// nothing of it in what the act does, is advice with the way to do it in Kyr; the same telling where the act begins
// a fight, or harms, says nothing.
describe('the fiction lint', () => {
  const act = (o: Partial<Operator>) => ({ id: 'pedlar_stand', success: [], failure: [], ...o }) as unknown as Operator;
  it('tells a defeat narrated with no fight, and how to make it one', () => {
    const found = FictionLint.of(act({ otherwise: 'The bigger robber puts you on your back in the road with one shove.' }));
    expect(found).toStartWith('pedlar_stand tells a blow ("…');
    expect(found).toContain('one shove');
    expect(found).toContain('Assert assails(foe, actor)');
  });
  it('tells a spell told in words, with the casting-fiction hint', () => {
    expect(FictionLint.of(act({ report: 'You cast a ward over the door, and it holds.' })))
      .toContain('a spell is cast by its caster');
  });
  it('says nothing where the act fights, or does no blow', () => {
    const fight = [{ kind: 'assert', call: { kind: 'call', name: 'assails', args: [] } }];
    expect(FictionLint.of(act({ otherwise: 'He puts you on your back in the road with one shove.', failure: fight })))
      .toBeUndefined();
    expect(FictionLint.of(act({ otherwise: 'They look at you, and at each other, and laugh.' }))).toBeUndefined();
  });
});
