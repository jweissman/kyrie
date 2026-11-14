import { describe, expect, it } from 'bun:test';
import { Laboratory } from '../../scripts/laboratory';
import { PlayTool } from '../../src/cli/play-tool';
import { ScreenModel } from '../../src/ui/screen-model';
import { Narrator } from '../../src/presentation/narrator';
import { Signs } from '../../src/presentation/signs';
import { TerminalSigns } from '../../src/cli/terminal-signs';
import { ChoiceList } from '../../src/ui/choice-list';

// EX-02 drawn: in a site, a way's bearing is signed by its direction and said in a plain word, the same in both
// clients: the terminal's row says "unexplored" or "back" (text only), and the page's way row takes the sign and the
// word from the same Signs.bearing, by the way's own command. In the corn-store cellar: the rat-runs unexplored, the
// way up to the corn-store back.
describe('a way\'s bearing under the corn-store', () => {
  it('is said alike by the terminal and the page, by the way\'s own command', async () => {
    const { journey: j } = await PlayTool.start(PlayTool.parse([Laboratory.file, '--as', 'human/warrior/Brann']));
    await j.play('wrench the padlock', 'old corn-store', 'corn-store cellar');
    const c = j.session.campaign, screen = ScreenModel.build(c), glance = Narrator.leaf(c, screen).glance!;
    const signs = new TerminalSigns(screen, glance);
    // The page's way rows are the place's way choices, each looked up by its command.
    const ways = ChoiceList.explore(screen).flatMap(g => g.choices).filter(ch => /^go\(/.test(ch.command ?? ''));
    const said = Object.fromEntries(ways.map(w => [w.label, Signs.bearing(glance, w.command!)?.said ?? '']));
    expect(Object.values(said).sort()).toEqual(['back', 'unexplored']);
    for (const w of ways) { expect(signs.on(w.command!).bearing ?? '').toBe(said[w.label] ?? ''); }
    expect(Signs.bearing(glance, ways.find(w => said[w.label] === 'back')!.command!)?.sign).toBe(Signs.whither.Out!);
  });
});
