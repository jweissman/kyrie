import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';

// The studio's `kyrie play scene|character <id> --in <adventure>` (brief X): the adventure's campaign played straight
// to one of its places, or to someone and into talk with them, in a context its author named; and what can be done
// there, or asked, listed after.
class Played {
  static async run(...args: string[]): Promise<string[]> {
    const out: string[] = [];
    await PlayTool.main(args, line => out.push(line));
    return out;
  }
}

describe('kyrie play scene and character', () => {
  it('goes to someone of an adventure, and into talk with them', async () => {
    const out = await Played.run('character', 'gully', '--in', 'hessel');
    expect(out.find(l => l.startsWith('[Talk to Mrs Gully]'))).toContain('Bed or beer?');
    expect(out).toContain('-- watch 1, at hessel__two_poles');
    expect(out.some(l => l.endsWith(': Take a bed and supper'))).toBe(true);
  }, 60000);
  it('goes to a scene of an adventure, and says what contexts there are to play it in', async () => {
    expect(await Played.run('scene', 'two_poles', '--in', 'hessel')).toContain('-- watch 1, at hessel__two_poles');
    expect(await Played.run('scene', 'two_poles', '--in', 'hessel', '--context', 'after the flood')).toEqual(['! No context'
      + ' "after the flood" in data/adventures/hessel/contexts.json: none is named there']);
    expect(await Played.run('scene', 'nowhere', '--in', 'hessel')).toEqual(['! Nothing in hessel is called nowhere'
      + ' (hessel__nowhere)']);
  }, 60000);
});
