import { describe, expect, it } from 'bun:test';
import { InspectTool } from '../../src/cli/inspect-tool';
import { PlayTool } from '../../src/cli/play-tool';

// The smallest world an author can run: one .kyr file, with no manifest and no campaign beside it, played and inspected
// from the command line in about half a second (bin/kyrie play site.kyr, bin/kyrie inspect site.kyr "<choice>"; see
// SingleModule). Its ids are its own module's.
describe('a bare module, from the command line', () => {
  it('is played, and says why an act is refused, in Kyr', async () => {
    const played: string[] = [], inspected: string[] = [];
    expect(await PlayTool.main(['test/fixtures/single/yard.kyr'], l => played.push(l))).toBe(0);
    expect(played.join('\n')).toContain('at yard__yard');
    expect(await InspectTool.main(['test/fixtures/single/yard.kyr', 'buy'], l => inspected.push(l))).toBe(0);
    expect(inspected.join('\n')).toMatch(/fails: quantity\(party, gold\) >= price\(yard__halm_torch_\d\)/);
  });
});
