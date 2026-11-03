import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';

// `kyrie play --choices` shows what is offered here, then the pack folded to a line a thing (the Grand Tour's friction
// P1: every thing in the pack with every one of its acts, each twice).
describe('the play tool\'s choices', () => {
  it('lists what is here, then each thing carried once with its acts', () => {
    expect(PlayTool.offered([['Here: Talk to Peg', 'Talk to Peg'], ['Pack › a torch › Light', 'Pack › a torch › Light'],
      ['Pack › a torch › Give to Chert', 'Pack › a torch › Give to Chert'], ['a torch: Light', 'a torch: Light']]))
      .toEqual(['Here: Talk to Peg', 'a torch: Light · Give to Chert']);
  });
});
